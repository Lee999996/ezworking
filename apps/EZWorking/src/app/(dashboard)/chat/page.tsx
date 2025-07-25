/**
 * General Chat Page
 * 通用聊天页面 - 用于新建对话和通用AI助手功能
 * 支持URL参数进行会话切换: /chat?session=session_id
 * 
 * Requirements: 2.1, 2.4, 2.5, 2.8 - URL parameter handling and session search
 * Requirements: 2.2, 2.3, 2.6, 2.7 - URL synchronization and routing management
 */

'use client'

import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { Box, Container, Spinner, VStack, Text } from '@chakra-ui/react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { AIChatInterface } from '@/components/ai-chat'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/hooks/useAuth'
import { useChatHistory } from '@/hooks/useChatHistory'

function ChatPageContent() {
  const { user, loading: authLoading, userId, isAuthenticated, redirectToLogin } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const sessionParam = searchParams.get('session')
  
  const { 
    sessions, 
    currentSessionId, 
    switchSession, 
    createSession: createNewSession, 
    isLoading: historyLoading,
    authLoading: historyAuthLoading
  } = useChatHistory()
  
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    retryMessage
  } = useChat({ 
    enableHistory: true 
  })

  // State to track session loading and prevent race conditions
  const [isLoadingSession, setIsLoadingSession] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Refs to prevent duplicate operations and track state
  const lastProcessedSessionParam = useRef<string | null>(null)
  const isProcessingSession = useRef(false)
  const initializationAttempted = useRef(false)

  /**
   * Validate UUID format with enhanced validation
   * Requirements: 2.5, 2.6 - URL parameter validation and error handling
   */
  const isValidUUID = useCallback((uuid: string): boolean => {
    if (!uuid || typeof uuid !== 'string') return false
    
    // Check basic format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(uuid)) return false
    
    // Additional validation - ensure it's not all zeros or other invalid patterns
    const allZeros = /^0{8}-0{4}-0{4}-0{4}-0{12}$/
    if (allZeros.test(uuid)) return false
    
    return true
  }, [])

  /**
   * Update URL to match current session state with enhanced synchronization
   * Requirements: 2.2, 2.3, 2.6 - URL synchronization and bidirectional state management
   */
  const updateURLToMatchSession = useCallback((sessionId: string | null, options: { replace?: boolean; updateHistory?: boolean } = {}) => {
    if (pathname !== '/chat') return // Only update URL on chat page
    
    const { replace = true, updateHistory = false } = options
    const currentURL = new URL(window.location.href)
    const currentSessionParam = currentURL.searchParams.get('session')
    
    if (sessionId && currentSessionParam !== sessionId) {
      console.log(`Updating URL to match session: ${sessionId}`)
      const newURL = `/chat?session=${sessionId}`
      
      if (updateHistory) {
        // Use push for browser history support (back/forward buttons)
        router.push(newURL, { scroll: false })
      } else if (replace) {
        // Use replace to avoid cluttering browser history
        router.replace(newURL, { scroll: false })
      }
    } else if (!sessionId && currentSessionParam) {
      console.log('Clearing session parameter from URL')
      const newURL = '/chat'
      
      if (updateHistory) {
        router.push(newURL, { scroll: false })
      } else if (replace) {
        router.replace(newURL, { scroll: false })
      }
    }
  }, [router, pathname])

  /**
   * Handle invalid session ID with proper error handling and recovery
   * Requirements: 2.6 - Invalid session error handling and redirect
   */
  const handleInvalidSession = useCallback(async (sessionId: string, reason: string) => {
    console.warn(`Invalid session ${sessionId}: ${reason}`)
    
    // Set user-friendly error message based on reason
    let userMessage = '会话无效'
    if (reason.includes('格式无效')) {
      userMessage = '会话链接格式错误'
    } else if (reason.includes('不存在')) {
      userMessage = '会话不存在或已被删除'
    } else if (reason.includes('权限')) {
      userMessage = '无权限访问此会话'
    } else if (reason.includes('加载失败')) {
      userMessage = '会话加载失败'
    }
    
    setSessionError(`${userMessage}，正在创建新会话...`)
    
    // Clear processing flag
    isProcessingSession.current = false
    lastProcessedSessionParam.current = null
    
    // Create new session after a short delay to show error message
    setTimeout(async () => {
      try {
        setSessionError(null)
        console.log('Creating new session after invalid session')
        const newSessionId = await createNewSession()
        console.log(`Redirecting to new session: ${newSessionId}`)
        router.replace(`/chat?session=${newSessionId}`, { scroll: false })
      } catch (error) {
        console.error('Failed to create new session after invalid session:', error)
        setSessionError('创建新会话失败，请刷新页面重试')
        // Fallback: redirect to chat page without session parameter
        setTimeout(() => {
          router.replace('/chat', { scroll: false })
        }, 3000)
      }
    }, 2000)
  }, [router, createNewSession])

  /**
   * Load and switch to a specific session with enhanced error handling
   * Requirements: 2.1, 2.5, 2.6 - Session loading, URL handling, and error recovery
   * Auth Integration: 确保用户已登录
   */
  const loadAndSwitchToSession = useCallback(async (sessionId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login')
      redirectToLogin()
      return false
    }

    if (isProcessingSession.current) {
      console.log('Session processing already in progress, skipping')
      return false
    }

    // Enhanced UUID validation
    if (!isValidUUID(sessionId)) {
      console.warn(`Invalid session ID format: ${sessionId}`)
      await handleInvalidSession(sessionId, '会话ID格式无效')
      return false
    }

    if (sessionId === currentSessionId) {
      console.log(`Already on requested session: ${sessionId}`)
      lastProcessedSessionParam.current = sessionId
      return true
    }

    isProcessingSession.current = true
    setIsLoadingSession(true)
    setSessionError(null)

    try {
      // Check if session exists locally first for faster loading
      const localSession = sessions.find((s: any) => s.id === sessionId)
      
      if (localSession) {
        console.log(`Switching to existing local session: ${sessionId}`)
        await switchSession(sessionId)
        lastProcessedSessionParam.current = sessionId
        return true
      } else {
        // Try to switch to session (this will load from database if needed)
        console.log(`Loading session from database: ${sessionId}`)
        await switchSession(sessionId)
        
        // Verify the session was actually loaded
        if (currentSessionId !== sessionId) {
          // Session might not exist or user doesn't have access
          throw new Error('Session not found or access denied')
        }
        
        lastProcessedSessionParam.current = sessionId
        return true
      }
    } catch (error: any) {
      console.error('Error loading session:', error)
      
      // Determine error type for better user messaging
      let errorReason = '加载会话失败'
      if (error?.message?.includes('not found')) {
        errorReason = '会话不存在'
      } else if (error?.message?.includes('access denied') || error?.message?.includes('permission')) {
        errorReason = '无权限访问此会话'
      } else if (error?.message?.includes('network') || error?.message?.includes('timeout')) {
        errorReason = '网络连接失败'
      }
      
      await handleInvalidSession(sessionId, errorReason)
      return false
    } finally {
      setIsLoadingSession(false)
      isProcessingSession.current = false
    }
  }, [isAuthenticated, redirectToLogin, isValidUUID, currentSessionId, sessions, switchSession, handleInvalidSession])

  /**
   * Initialize page state based on URL parameters with enhanced recovery
   * Requirements: 2.1, 2.5, 2.6 - URL parameter handling, session loading, and state recovery
   * Auth Integration: 确保用户已登录
   */
  const initializePageState = useCallback(async () => {
    if (authLoading || !isAuthenticated || !user || historyLoading || historyAuthLoading || initializationAttempted.current) {
      return
    }

    initializationAttempted.current = true
    console.log('Initializing page state...', { sessionParam, currentSessionId })

    try {
      if (sessionParam) {
        // URL has session parameter - validate and load it
        console.log(`Initializing with session parameter: ${sessionParam}`)
        
        // Pre-validate session parameter format
        if (!isValidUUID(sessionParam)) {
          console.warn(`Invalid session parameter format: ${sessionParam}`)
          await handleInvalidSession(sessionParam, '会话ID格式无效')
          return
        }
        
        const success = await loadAndSwitchToSession(sessionParam)
        if (!success) {
          console.log('Failed to load session from URL parameter')
          return // Error handling is done in loadAndSwitchToSession
        }
        
        console.log(`Successfully initialized with session: ${sessionParam}`)
      } else {
        // No session parameter - check if we have a current session
        if (currentSessionId) {
          // Update URL to reflect current session (requirement 2.1)
          console.log(`No URL session param, updating URL to current session: ${currentSessionId}`)
          updateURLToMatchSession(currentSessionId, { replace: true })
        } else {
          // No current session - create new one (requirement 2.1)
          console.log('No session parameter and no current session, creating new session')
          try {
            const newSessionId = await createNewSession()
            console.log(`Created new session: ${newSessionId}`)
            router.replace(`/chat?session=${newSessionId}`, { scroll: false })
          } catch (error) {
            console.error('Failed to create new session during initialization:', error)
            setSessionError('创建新会话失败，请刷新页面重试')
          }
        }
      }
    } catch (error) {
      console.error('Error during page initialization:', error)
      setSessionError('初始化页面时发生错误，请刷新页面重试')
    } finally {
      setIsInitialized(true)
    }
  }, [
    authLoading, 
    isAuthenticated,
    user, 
    historyLoading,
    historyAuthLoading,
    sessionParam, 
    currentSessionId, 
    isValidUUID,
    loadAndSwitchToSession, 
    updateURLToMatchSession, 
    createNewSession, 
    router,
    handleInvalidSession
  ])

  /**
   * Handle URL parameter changes during navigation with browser history support
   * Requirements: 2.2, 2.3, 2.6 - URL synchronization, browser navigation, and bidirectional sync
   * Auth Integration: 确保用户已登录
   */
  const handleURLParameterChange = useCallback(async () => {
    if (!isInitialized || authLoading || !isAuthenticated || !user || historyLoading || historyAuthLoading) {
      return
    }

    // Skip if we already processed this session parameter
    if (sessionParam === lastProcessedSessionParam.current) {
      return
    }

    console.log(`URL parameter changed to: ${sessionParam} (from browser navigation)`)

    if (sessionParam) {
      // Validate session parameter before processing
      if (!isValidUUID(sessionParam)) {
        console.warn(`Invalid session parameter from URL: ${sessionParam}`)
        await handleInvalidSession(sessionParam, '会话ID格式无效')
        return
      }

      // Load the new session (supports browser back/forward)
      const success = await loadAndSwitchToSession(sessionParam)
      if (!success) {
        console.log('Failed to load session from URL change')
        return
      }
    } else {
      // No session parameter - ensure we have a current session
      if (!currentSessionId) {
        console.log('No session parameter and no current session, creating new session')
        try {
          const newSessionId = await createNewSession()
          router.replace(`/chat?session=${newSessionId}`, { scroll: false })
        } catch (error) {
          console.error('Failed to create session during URL parameter change:', error)
          setSessionError('创建新会话失败')
        }
      } else {
        // Update URL to reflect current session (bidirectional sync)
        console.log(`Updating URL to match current session: ${currentSessionId}`)
        updateURLToMatchSession(currentSessionId, { replace: true })
      }
    }
  }, [
    isInitialized,
    authLoading,
    isAuthenticated,
    user,
    historyLoading,
    historyAuthLoading,
    sessionParam,
    currentSessionId,
    isValidUUID,
    loadAndSwitchToSession,
    createNewSession,
    router,
    updateURLToMatchSession,
    handleInvalidSession
  ])

  // Initialize page state on mount
  useEffect(() => {
    initializePageState()
  }, [initializePageState])

  // Handle URL parameter changes
  useEffect(() => {
    handleURLParameterChange()
  }, [handleURLParameterChange])

  // Sync URL when current session changes (from sidebar navigation)
  // Requirements: 2.2, 2.3 - Bidirectional URL synchronization
  useEffect(() => {
    if (isInitialized && currentSessionId && sessionParam !== currentSessionId) {
      console.log(`Current session changed to ${currentSessionId}, updating URL with history`)
      // Use updateHistory: true for sidebar navigation to support browser back/forward
      updateURLToMatchSession(currentSessionId, { replace: false, updateHistory: true })
    }
  }, [currentSessionId, sessionParam, isInitialized, updateURLToMatchSession])

  // Handle browser back/forward button navigation
  // Requirements: 2.2, 2.3 - Browser navigation support
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      console.log('Browser navigation detected (back/forward button)', event.state)
      
      // The URL has already changed, so we need to read the new session parameter
      const url = new URL(window.location.href)
      const newSessionParam = url.searchParams.get('session')
      
      console.log(`Browser navigation to session: ${newSessionParam}`)
      
      // The handleURLParameterChange effect will handle the actual session switching
      // We just need to ensure the component re-renders with the new URL parameter
    }

    // Add event listener for browser navigation
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // Initialize with welcome message when new chat starts
  useEffect(() => {
    if (messages.length === 0 && currentSessionId && isInitialized && !isLoadingSession) {
      // Welcome message will be handled by the AI response service
      // when the user sends their first message
    }
  }, [messages.length, currentSessionId, isInitialized, isLoadingSession])

  const handleSendMessage = async (message: string) => {
    await sendMessage(message)
  }

  if (authLoading || historyLoading || historyAuthLoading || isLoadingSession) {
    return (
      <Container maxW="container.xl" h="100vh" p={0}>
        <Box h="100%" display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={6}>
            <Box position="relative">
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                w="8"
                h="8"
                bg="blue.500"
                borderRadius="full"
                opacity="0.2"
                animation="pulse 2s infinite"
              />
            </Box>
            
            <VStack spacing={2} textAlign="center">
              <Text fontSize="lg" fontWeight="medium" color="gray.700">
                {authLoading ? '正在验证身份' : 
                 historyLoading || historyAuthLoading ? '正在加载历史记录' : 
                 isLoadingSession ? '正在加载会话' : '正在加载'}
              </Text>
              
              <Text fontSize="sm" color="gray.500">
                {authLoading ? '验证您的登录状态...' : 
                 historyLoading || historyAuthLoading ? '从数据库获取您的对话历史...' : 
                 isLoadingSession ? '准备会话内容...' : '请稍候...'}
              </Text>
            </VStack>
            
            <Box w="200px" h="1" bg="gray.200" borderRadius="full" overflow="hidden">
              <Box
                h="full"
                bg="blue.500"
                borderRadius="full"
                animation="loading-progress 2s ease-in-out infinite"
                sx={{
                  '@keyframes loading-progress': {
                    '0%': { width: '0%', marginLeft: '0%' },
                    '50%': { width: '75%', marginLeft: '0%' },
                    '100%': { width: '0%', marginLeft: '100%' }
                  }
                }}
              />
            </Box>
          </VStack>
        </Box>
      </Container>
    )
  }

  if (!user) {
    return (
      <Container maxW="container.xl" h="100vh" p={0}>
        <Box h="100%" display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={4}>
            <Text fontSize="lg" color="gray.600">请先登录以使用聊天功能</Text>
          </VStack>
        </Box>
      </Container>
    )
  }

  if (sessionError) {
    const errorMessage = sessionError
    return (
      <Container maxW="container.xl" h="100vh" p={0}>
        <Box h="100%" display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={6} maxW="600px" w="full" p={6}>
            <VStack spacing={4}>
              <Spinner size="md" color="red.500" />
              <Text fontSize="lg" color="red.600" textAlign="center">{errorMessage}</Text>
              <Text fontSize="sm" color="gray.500" textAlign="center">正在重定向到新会话...</Text>
            </VStack>
            
            {/* 显示数据库诊断信息 */}
            {errorMessage.includes('创建') && (
              <Box w="full">
                <Text fontSize="md" fontWeight="semibold" mb={4} textAlign="center">
                  数据库连接诊断
                </Text>
                <Box
                  bg="gray.50"
                  p={4}
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <VStack spacing={3} align="stretch">
                    <Text fontSize="sm" color="gray.700">
                      可能的原因：
                    </Text>
                    <VStack align="stretch" spacing={2} pl={4}>
                      <Text fontSize="sm" color="gray.600">
                        • 数据库表未创建或配置错误
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        • Supabase 环境变量未正确配置
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        • 网络连接问题
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        • 用户认证状态异常
                      </Text>
                    </VStack>
                    <Text fontSize="sm" color="gray.700" mt={2}>
                      建议解决方案：
                    </Text>
                    <VStack align="stretch" spacing={2} pl={4}>
                      <Text fontSize="sm" color="gray.600">
                        1. 检查 .env.local 文件中的 Supabase 配置
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        2. 确认数据库表已正确创建
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        3. 尝试重新登录
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        4. 检查网络连接
                      </Text>
                    </VStack>
                  </VStack>
                </Box>
              </Box>
            )}
          </VStack>
        </Box>
      </Container>
    )
  }

  return (
    <Box h="100vh" w="100%" bg="white" display="flex" flexDirection="column">
      {/* 
        Chat Interface with URL-based session switching support
        URL format: /chat?session={sessionId}
        - Validates UUID format
        - Loads session from database if not found locally
        - Handles invalid session IDs with proper error messages
        - Automatically creates new session if no session parameter provided
      */}
      <AIChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        onRetryMessage={retryMessage}
        isLoading={isLoading}
        userId={userId}
      />
    </Box>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <Container maxW="container.xl" h="100vh" p={0}>
        <Box h="100%" display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={6}>
            <Box position="relative">
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                w="8"
                h="8"
                bg="blue.500"
                borderRadius="full"
                opacity="0.2"
                animation="pulse 2s infinite"
              />
            </Box>
            
            <VStack spacing={2} textAlign="center">
              <Text fontSize="lg" fontWeight="medium" color="gray.700">
                正在加载聊天页面
              </Text>
              
              <Text fontSize="sm" color="gray.500">
                请稍候...
              </Text>
            </VStack>
          </VStack>
        </Box>
      </Container>
    }>
      <ChatPageContent />
    </Suspense>
  )
}