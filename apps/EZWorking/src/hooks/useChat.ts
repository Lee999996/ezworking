import { useState, useCallback, useEffect, useRef } from 'react'
import { useChatHistory } from './useChatHistory'
import { useAuth } from './useAuth'
import { useOfflineChat } from './useOfflineSupport'
import { chatServices } from '@/services/chat'
import { useErrorHandler } from '@/contexts/error-context'
import { createErrorContext } from '@/utils/error-handling'
import type { 
  ChatMessage, 
  ChatHistoryMessage, 
  ChatError, 
  UseChatReturn 
} from '@/types/chat'
import { ChatErrorType } from '@/types/chat'

interface UseChatOptions {
  sessionId?: string
  autoCreateSession?: boolean
  enableAutoSave?: boolean
  enableHistory?: boolean
}

/**
 * Custom hook for managing chat messages and interactions
 * Implements requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 * - 实现消息发送、接收、重试功能
 * - 添加消息状态管理(sending, sent, failed)
 * - 集成AI响应服务和消息自动保存
 * 
 * Auth Integration (Task 3.3):
 * - 自动获取当前用户ID
 * - 处理用户状态变化
 * - 在用户未登录时提供适当的错误处理
 */
export function useChat({
  sessionId,
  autoCreateSession = true,
  enableAutoSave = true,
  enableHistory = true
}: UseChatOptions = {}): UseChatReturn {
  // Auth integration - automatically get current user
  const { userId, isAuthenticated, loading: authLoading, redirectToLogin } = useAuth()
  // Chat history integration - only if enabled
  const {
    currentSessionId,
    createSession,
    addMessage: addHistoryMessage,
    getCachedSession,
    error: historyError
  } = useChatHistory({ autoLoad: enableHistory })
  // Global error handling
  const { 
    handleNetworkError, 
    handleDatabaseError, 
    handleAuthError, 
    handleAIError,
    retryOperation 
  } = useErrorHandler()
  // Offline support
  const { 
    isOnline, 
    sendMessageOffline, 
    getCachedMessages
  } = useOfflineChat()

  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<ChatError | null>(null)
  const [inputValue, setInputValue] = useState('')

  // Refs for cleanup and state tracking
  const isMounted = useRef(true)
  const currentSessionRef = useRef<string | null>(null)
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false
      // Clear all retry timeouts
      retryTimeouts.current.forEach(timeout => clearTimeout(timeout))
      retryTimeouts.current.clear()
    }
  }, [])

  /**
   * Handle different types of errors with global error handling
   */
  const handleError = useCallback((error: any, operation: string, context?: any): ChatError => {
    const errorContext = createErrorContext(operation, context, userId)
    
    // Classify and handle different error types
    if (error.type === ChatErrorType.NETWORK_ERROR || error.message?.includes('network')) {
      return handleNetworkError(error, errorContext)
    } else if (error.type === ChatErrorType.DATABASE_ERROR || error.message?.includes('database')) {
      return handleDatabaseError(error, errorContext)
    } else if (error.type === ChatErrorType.UNAUTHORIZED || error.message?.includes('unauthorized')) {
      return handleAuthError(error, errorContext)
    } else if (error.type === ChatErrorType.AI_RESPONSE_FAILED || error.message?.includes('AI')) {
      return handleAIError(error, errorContext)
    } else {
      // Default error handling
      return handleDatabaseError(error, errorContext)
    }
  }, [userId, handleNetworkError, handleDatabaseError, handleAuthError, handleAIError])

  /**
   * Convert ChatHistoryMessage to ChatMessage for UI display
   */
  const convertHistoryToChat = useCallback((historyMessage: ChatHistoryMessage, index: number): ChatMessage => ({
    id: `msg_${historyMessage.timestamp.getTime()}_${index}`,
    type: historyMessage.role === 'user' ? 'user' : 'assistant',
    content: historyMessage.content,
    timestamp: historyMessage.timestamp,
    userId,
    status: 'sent'
  }), [userId])

  /**
   * Convert ChatMessage to ChatHistoryMessage for storage
   */
  const convertChatToHistory = useCallback((chatMessage: ChatMessage): Omit<ChatHistoryMessage, 'timestamp'> => ({
    role: chatMessage.type === 'user' ? 'user' : 'ai',
    content: chatMessage.content
  }), [])

  /**
   * Load messages for current session
   * Requirement 3.1: 消息接收功能
   * Auth Integration: 确保用户已登录
   */
  const loadMessages = useCallback(async (targetSessionId: string | null) => {
    if (!targetSessionId || !isAuthenticated || !userId || !isMounted.current) {
      setMessages([])
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Try to get from cache first (both history cache and offline cache)
      const cachedSession = getCachedSession(targetSessionId)
      if (cachedSession) {
        const chatMessages = cachedSession.messages.map(convertHistoryToChat)
        setMessages(chatMessages)
        currentSessionRef.current = targetSessionId
        return
      }

      // Try offline cache if no history cache
      const offlineCachedMessages = getCachedMessages(targetSessionId)
      if (offlineCachedMessages.length > 0) {
        const chatMessages = offlineCachedMessages.map(convertHistoryToChat)
        setMessages(chatMessages)
        currentSessionRef.current = targetSessionId
        
        // If online, still try to load from server in background
        if (isOnline) {
          try {
            const serverMessages = await chatServices.message.getMessages(targetSessionId)
            if (isMounted.current && serverMessages.length > offlineCachedMessages.length) {
              const serverChatMessages = serverMessages.map(convertHistoryToChat)
              setMessages(serverChatMessages)
            }
          } catch (err) {
            // Ignore server errors when we have cached data
            console.warn('Failed to load server messages, using cached data:', err)
          }
        }
        return
      }

      // Load all messages from server if not in cache (scroll-based, no pagination)
      const sessionMessages = await chatServices.message.getMessages(targetSessionId)
      
      if (!isMounted.current) return

      const chatMessages = sessionMessages.map(convertHistoryToChat)
      setMessages(chatMessages)
      currentSessionRef.current = targetSessionId

    } catch (err) {
      console.error('Failed to load messages:', err)
      
      if (!isMounted.current) return

      const chatError = handleError(err, 'loadMessages', { targetSessionId })
      setError(chatError)
      setMessages([])
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [isAuthenticated, userId, getCachedSession, convertHistoryToChat, handleError])

  /**
   * Update messages when session changes
   */
  useEffect(() => {
    const targetSessionId = sessionId || currentSessionId
    if (targetSessionId !== currentSessionRef.current) {
      loadMessages(targetSessionId)
    }
  }, [sessionId, currentSessionId, loadMessages])

  /**
   * Ensure we have a session for sending messages
   * Requirement 3.1: 自动创建会话
   * Auth Integration: 确保用户已登录
   */
  const ensureSession = useCallback(async (): Promise<string> => {
    if (!isAuthenticated || !userId) {
      redirectToLogin()
      const authError = new Error('用户未登录')
      throw handleError(authError, 'ensureSession', { isAuthenticated, userId })
    }

    const targetSessionId = sessionId || currentSessionId

    if (targetSessionId) {
      return targetSessionId
    }

    if (!autoCreateSession) {
      const sessionError = new Error('没有可用的会话')
      throw handleError(sessionError, 'ensureSession', { autoCreateSession })
    }

    try {
      const newSessionId = await createSession()
      return newSessionId
    } catch (err) {
      console.error('Failed to create session:', err)
      throw handleError(err, 'ensureSession', { operation: 'createSession' })
    }
  }, [isAuthenticated, userId, sessionId, currentSessionId, autoCreateSession, createSession, handleError, redirectToLogin])

  /**
   * Add message to local state with status tracking
   * Requirement 3.2: 消息状态管理(sending, sent, failed)
   */
  const addLocalMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date(),
      status: message.type === 'user' ? 'sending' : undefined,
      retryCount: 0
    }

    setMessages(prev => [...prev, newMessage])
    return newMessage
  }, [])

  /**
   * Update message status
   * Requirement 3.2: 消息状态管理
   */
  const updateMessageStatus = useCallback((messageId: string, status: 'sending' | 'sent' | 'failed', retryCount?: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, status, retryCount: retryCount ?? msg.retryCount }
        : msg
    ))
  }, [])

  /**
   * Save message with offline support
   * Requirement 3.5: 消息自动保存
   * Requirement 4.5: 消息本地缓存机制
   */
  const saveMessage = useCallback(async (message: ChatMessage, targetSessionId: string): Promise<void> => {
    if (!enableAutoSave) return

    try {
      const historyMessage = convertChatToHistory(message)
      
      if (isOnline) {
        // Try to save to server first
        try {
          await addHistoryMessage(historyMessage)
          
          // Update message status to sent
          if (message.type === 'user') {
            updateMessageStatus(message.id, 'sent')
          }
        } catch (serverError) {
          // If server fails, save to offline cache
          console.warn('Server save failed, saving to offline cache:', serverError)
          
          const offlineSaved = await sendMessageOffline(targetSessionId, {
            ...historyMessage,
            timestamp: new Date()
          })
          
          if (offlineSaved) {
            updateMessageStatus(message.id, 'sent')
          } else {
            updateMessageStatus(message.id, 'failed')
            throw serverError
          }
        }
      } else {
        // Save to offline cache when offline
        const offlineSaved = await sendMessageOffline(targetSessionId, {
          ...historyMessage,
          timestamp: new Date()
        })
        
        if (offlineSaved) {
          updateMessageStatus(message.id, 'sent')
        } else {
          updateMessageStatus(message.id, 'failed')
          throw new Error('Failed to save message offline')
        }
      }
    } catch (err) {
      console.error('Failed to save message:', err)
      
      // Update message status to failed
      if (message.type === 'user') {
        updateMessageStatus(message.id, 'failed')
      }
      
      throw err
    }
  }, [enableAutoSave, convertChatToHistory, addHistoryMessage, updateMessageStatus, isOnline, sendMessageOffline])

  /**
   * Generate AI response with retry logic
   * Requirement 3.3: 集成AI响应服务
   */
  const generateAIResponse = useCallback(async (userContent: string, context: ChatHistoryMessage[] = []): Promise<string> => {
    return await retryOperation(
      async () => {
        const response = await chatServices.aiResponse.generateResponse(userContent, context)
        return response
      },
      createErrorContext('generateAIResponse', { 
        contentLength: userContent.length, 
        contextLength: context.length 
      }, userId),
      (attempt, error) => {
        console.log(`AI response retry attempt ${attempt}:`, error.message)
      }
    )
  }, [retryOperation, userId])

  /**
   * Send message with full workflow
   * Requirement 3.1: 消息发送功能
   * Requirement 3.3: 集成AI响应服务
   * Requirement 3.5: 消息自动保存
   * Auth Integration: 确保用户已登录
   */
  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!content.trim() || !isAuthenticated || !userId || !isMounted.current) {
      if (!isAuthenticated) {
        redirectToLogin()
      }
      return
    }

    try {
      setIsSending(true)
      setError(null)

      // Ensure we have a session
      const targetSessionId = await ensureSession()

      // Add user message to UI immediately
      const userMessage = addLocalMessage({
        type: 'user',
        content: content.trim(),
        userId
      })

      // Save user message to database
      try {
        await saveMessage(userMessage, targetSessionId)
      } catch (saveErr) {
        console.warn('Failed to save user message, will retry later:', saveErr)
        // Don't block the flow, message is marked as failed and can be retried
      }

      // Generate AI response
      try {
        // Get conversation context for AI
        const cachedSession = getCachedSession(targetSessionId)
        const context = cachedSession?.messages || []
        
        const aiResponse = await generateAIResponse(content.trim(), context)

        if (!isMounted.current) return

        // Add AI response to UI
        const aiMessage = addLocalMessage({
          type: 'assistant',
          content: aiResponse,
          userId
        })

        // Save AI response to database
        try {
          await saveMessage(aiMessage, targetSessionId)
        } catch (saveErr) {
          console.warn('Failed to save AI response:', saveErr)
          // AI response save failure is less critical, but log it
        }

      } catch (aiErr) {
        console.error('AI response failed:', aiErr)
        
        if (!isMounted.current) return

        // Add error message to UI
        addLocalMessage({
          type: 'assistant',
          content: '抱歉，AI响应生成失败，请稍后重试。',
          userId
        })

        const chatError = handleError(aiErr, 'sendMessage', { operation: 'generateAIResponse' })
        setError(chatError)
      }

      // Clear input
      setInputValue('')

    } catch (err) {
      console.error('Failed to send message:', err)
      
      if (!isMounted.current) return

      const chatError = handleError(err, 'sendMessage', { content: content.trim() })
      setError(chatError)
    } finally {
      if (isMounted.current) {
        setIsSending(false)
      }
    }
  }, [isAuthenticated, userId, ensureSession, addLocalMessage, saveMessage, generateAIResponse, getCachedSession, handleError, redirectToLogin])

  /**
   * Retry failed message with exponential backoff
   * Requirement 3.1: 消息重试功能
   */
  const retryMessage = useCallback(async (messageId: string): Promise<void> => {
    if (!isMounted.current) return

    const message = messages.find(msg => msg.id === messageId)
    if (!message || message.status !== 'failed') {
      console.warn('Cannot retry message: message not found or not in failed state')
      return
    }

    const retryCount = (message.retryCount || 0) + 1
    const maxRetries = 3

    if (retryCount > maxRetries) {
      console.warn('Maximum retry attempts reached for message:', messageId)
      return
    }

    try {
      // Clear any existing retry timeout
      const existingTimeout = retryTimeouts.current.get(messageId)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
        retryTimeouts.current.delete(messageId)
      }

      // Update message status to sending with retry count
      updateMessageStatus(messageId, 'sending', retryCount)

      // Ensure we have a session
      const targetSessionId = await ensureSession()

      // Exponential backoff delay
      const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000)
      
      const retryTimeout = setTimeout(async () => {
        try {
          retryTimeouts.current.delete(messageId)
          
          if (!isMounted.current) return

          // Retry saving the message
          await saveMessage(message, targetSessionId)

          if (!isMounted.current) return

          console.log(`Message retry successful for ${messageId} (attempt ${retryCount})`)
        } catch (retryErr) {
          console.error(`Message retry failed for ${messageId} (attempt ${retryCount}):`, retryErr)
          
          if (!isMounted.current) return

          // Update message status back to failed
          updateMessageStatus(messageId, 'failed', retryCount)
        }
      }, delay)

      retryTimeouts.current.set(messageId, retryTimeout)

    } catch (err) {
      console.error('Failed to setup message retry:', err)
      
      if (!isMounted.current) return

      updateMessageStatus(messageId, 'failed', retryCount)
    }
  }, [messages, ensureSession, updateMessageStatus, saveMessage])

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    if (!isMounted.current) return

    setMessages([])
    setError(null)
    currentSessionRef.current = null
    
    // Clear all retry timeouts
    retryTimeouts.current.forEach(timeout => clearTimeout(timeout))
    retryTimeouts.current.clear()
  }, [])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Handle input value changes
   */
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value)
  }, [])

  /**
   * Handle auth state changes - clear messages when user logs out
   * Requirement 1.3: 用户状态变化的响应处理
   */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // User logged out, clear all chat data
      clearMessages()
      setInputValue('')
      setError(null)
    }
  }, [authLoading, isAuthenticated, clearMessages])

  // Combine errors from history and chat
  const combinedError = error || historyError

  return {
    // State
    messages,
    isLoading,
    isSending,
    error: combinedError,

    // Actions
    sendMessage,
    retryMessage,
    clearMessages,
    clearError,

    // Input handling
    inputValue,
    setInputValue: handleInputChange
  }
}