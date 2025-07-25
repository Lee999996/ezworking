'use client'

import { useState } from 'react'
import { UserMenu } from '@/components/user-menu/user-menu'
import { 
  Box, 
  Button, 
  HStack, 
  Spacer, 
  Text, 
  Spinner, 
  VStack, 
  Alert, 
  AlertIcon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from '@chakra-ui/react'
import { useAuth } from '@saas-ui/auth'
import {
  AppShell,
  NavGroup,
  NavItem,
  Sidebar,
  SidebarSection,
} from '@saas-ui/react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { FiPlus, FiTarget, FiRefreshCw } from 'react-icons/fi'
import { HistoryItem } from '@/components/chat-history/history-item'
import { useChatHistory } from '@/hooks/useChatHistory'
import { useRef } from 'react'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  // State for tracking session switching and loading
  const [switchingSessionId, setSwitchingSessionId] = useState<string | null>(null)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  
  // Delete confirmation dialog state
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; title: string } | null>(null)
  const [isDeletingSession, setIsDeletingSession] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)
  
  // Chat history hook integration with loading states and error handling
  const {
    sessions,
    currentSessionId,
    createSession: createNewSession,
    switchSession,
    deleteSession,
    isLoading: historyLoading,
    error: historyError,
    refreshSessions: retryHistory,
  } = useChatHistory()

  // Handle confirmed session deletion
  const handleConfirmDelete = async () => {
    if (!sessionToDelete || isDeletingSession) return

    try {
      setIsDeletingSession(true)
      console.log(`Sidebar: Deleting session ${sessionToDelete.id}`)
      await deleteSession(sessionToDelete.id)
      
      // If we deleted the current session, navigate to new chat
      if (sessionToDelete.id === currentSessionId) {
        console.log('Deleted current session, creating new one')
        try {
          const newSessionId = await createNewSession()
          router.push(`/chat?session=${newSessionId}`)
        } catch (error) {
          console.error('Failed to create new session after deletion:', error)
          router.push('/chat')
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
      // In a real app, you might want to show an error toast here
    } finally {
      setIsDeletingSession(false)
      setSessionToDelete(null)
      onDeleteClose()
    }
  }

  return (
    <AppShell
      height="100vh"
      variant="static"
      overflow="hidden"
      sidebar={
        <Sidebar
          bg="gray.50"
          _dark={{ bg: 'gray.800' }}
          width="280px"
          borderRightWidth="1px"
        >
          <SidebarSection p="4">
            {/* 新建对话按钮 - 保持在最上方 */}
            <Button
              variant="solid"
              colorScheme="blue"
              leftIcon={isCreatingSession ? <Spinner size="sm" /> : <FiPlus />}
              width="full"
              mb={4}
              h="12"
              fontSize="lg"
              isLoading={isCreatingSession}
              loadingText="创建中..."
              onClick={async () => {
                if (isCreatingSession) return
                
                try {
                  setIsCreatingSession(true)
                  // Create new session and navigate to it using Next.js router
                  const newSessionId = await createNewSession()
                  console.log(`Created new session ${newSessionId}, navigating...`)
                  router.push(`/chat?session=${newSessionId}`)
                } catch (error) {
                  console.error('Failed to create new session:', error)
                  // Fallback to basic chat page
                  router.push('/chat')
                } finally {
                  // Clear loading state after a short delay to prevent flashing
                  setTimeout(() => setIsCreatingSession(false), 1000)
                }
              }}
            >
              新建对话
            </Button>
            
            <NavGroup>
              {/* 职业定位分析链接 */}
              <Link href="/career-positioning" passHref>
                <NavItem
                  as="a"
                  height="12"
                  display="flex"
                  alignItems="center"
                  fontSize="lg"
                  mb={2}
                >
                  <HStack spacing={2}>
                    <FiTarget />
                    <Text>职业定位分析</Text>
                  </HStack>
                </NavItem>
              </Link>
              
              {/* 动态聊天历史记录 - 直接在侧边栏中显示，支持加载状态和错误处理 */}
              {historyLoading ? (
                <VStack spacing={3} py={4} align="center">
                  <Spinner size="sm" color="blue.500" />
                  <Text fontSize="xs" color="gray.500">
                    正在加载历史记录...
                  </Text>
                </VStack>
              ) : historyError ? (
                <Alert status="error" size="sm" borderRadius="md" mb={2}>
                  <AlertIcon boxSize="12px" />
                  <VStack spacing={1} align="start" flex={1}>
                    <Text fontSize="xs" fontWeight="medium">
                      加载失败
                    </Text>
                    <Text fontSize="xs" color="gray.600" noOfLines={2}>
                      {historyError.message || '无法加载会话历史'}
                    </Text>
                    <HStack spacing={2} mt={1}>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="red"
                        leftIcon={<FiRefreshCw />}
                        onClick={retryHistory}
                        isLoading={historyLoading}
                        loadingText="重试中"
                      >
                        重试
                      </Button>
                      {historyError.retryable && (
                        <Text fontSize="xs" color="gray.500">
                          可重试
                        </Text>
                      )}
                    </HStack>
                  </VStack>
                </Alert>
              ) : sessions.length === 0 ? (
                <VStack spacing={2} py={4} align="center">
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    暂无对话历史
                  </Text>
                  <Text fontSize="xs" color="gray.400" textAlign="center">
                    点击上方按钮开始新对话
                  </Text>
                  {!historyLoading && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="blue"
                      leftIcon={<FiRefreshCw />}
                      onClick={retryHistory}
                      mt={2}
                    >
                      刷新
                    </Button>
                  )}
                </VStack>
              ) : (
                sessions.map((session) => (
                  <Box key={session.id} width="full">
                    <HistoryItem
                      session={session}
                      isActive={session.id === currentSessionId}
                      isSwitching={switchingSessionId === session.id}
                      onClick={async () => {
                        console.log(`Sidebar: Switching to session ${session.id}`)
                        
                        // Prevent switching to the same session or if already switching
                        if (session.id === currentSessionId || switchingSessionId === session.id) {
                          console.log('Already on this session or switching in progress, no action needed')
                          return
                        }
                        
                        try {
                          // Set switching state with immediate UI feedback
                          setSwitchingSessionId(session.id)
                          
                          // Always navigate to ensure URL is updated and messages are loaded
                          // This will trigger the chat page's session loading logic
                          router.push(`/chat?session=${session.id}`)
                          
                          // Also switch session in the hook for immediate state consistency
                          // This ensures the sidebar shows the correct active state immediately
                          await switchSession(session.id)
                          
                          // Clear switching state after navigation completes
                          setTimeout(() => {
                            setSwitchingSessionId(null)
                          }, 1500)
                        } catch (error) {
                          console.error('Failed to switch session:', error)
                          setSwitchingSessionId(null)
                          
                          // Show error feedback to user
                          // In a real app, you might want to show a toast notification here
                        }
                      }}
                      onDelete={() => {
                        // Show confirmation dialog
                        setSessionToDelete({ id: session.id, title: session.title })
                        onDeleteOpen()
                      }}
                    />
                  </Box>
                ))
              )}
            </NavGroup>
          </SidebarSection>
          <Spacer />
          <SidebarSection>
            {/* We will add settings and help links later */}
          </SidebarSection>
        </Sidebar>
      }
    >
      <Box
        position="relative"
        height="full"
        width="full"
        bg="white"
        _dark={{ bg: 'gray.900' }}
      >
        <Box position="absolute" top="1.5rem" right="1.5rem" zIndex="overlay">
          {isAuthenticated ? (
            <HStack spacing={3}>
              <HStack
                bg="white"
                _dark={{ bg: 'gray.700' }}
                borderRadius="xl"
                py={2}
                px={4}
                boxShadow="sm"
                spacing={1.5}
                alignItems="center"
              >
                <Text
                  as="span"
                  color="blue.500"
                  fontWeight="semibold"
                  lineHeight={1}
                  fontSize="md"
                >
                  ★
                </Text>
                <Text fontSize="lg" fontWeight="medium" lineHeight={1}>
                  1232
                </Text>
              </HStack>
              <UserMenu />
            </HStack>
          ) : (
            <Link href="/login" passHref>
              <Button
                as="a"
                variant="solid"
                colorScheme="primary"
                boxShadow="md"
              >
                请登录
              </Button>
            </Link>
          )}
        </Box>
        <Box height="full" width="full" overflowY="auto">
          {children}
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              删除对话
            </AlertDialogHeader>

            <AlertDialogBody>
              确定要删除对话 &quot;{sessionToDelete?.title}&quot; 吗？此操作无法撤销。
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button 
                ref={cancelRef} 
                onClick={onDeleteClose}
                isDisabled={isDeletingSession}
              >
                取消
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleConfirmDelete} 
                ml={3}
                isLoading={isDeletingSession}
                loadingText="删除中..."
              >
                删除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </AppShell>
  )
}
