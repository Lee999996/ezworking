import { useState, useCallback, useEffect, useRef } from 'react'
import { ChatMessage, ComponentType } from './chat-interface'
import { useChatHistory } from '@/hooks/useChatHistory'
import type { ChatHistoryMessage } from '@/types/chat'

interface UseChatOptions {
  userId?: string
  initialMessages?: ChatMessage[]
  enableHistory?: boolean
}

interface UseChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  sendMessage: (content: string) => Promise<void>
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  addComponentMessage: (content: string, componentType: ComponentType, componentData?: any) => void
  retryMessage: (messageId: string) => Promise<void>
  clearMessages: () => void
  // Chat history integration
  currentSessionId: string | null
  createNewSession: () => Promise<string>
  switchToSession: (sessionId: string) => void
  // Session state management
  isSessionSwitching: boolean
  sessionError: string | null
}

export function useChat({ userId, initialMessages = [], enableHistory = true }: UseChatOptions = {}): UseChatReturn {
  // Chat history integration
  const {
    sessions,
    currentSessionId: historySessionId,
    createSession: createHistorySession,
    switchSession: switchHistorySession,
    addMessage: addHistoryMessage,
    getCachedSession,
    isLoading: historyLoading,
    error: historyError
  } = useChatHistory()

  // State management with improved session handling
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [isSessionSwitching, setIsSessionSwitching] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  
  // Refs to prevent race conditions and track state
  const lastLoadedSessionId = useRef<string | null>(null)
  const isInitialized = useRef(false)
  const isMounted = useRef(true)

  // Helper function to convert ChatHistoryMessage to ChatMessage
  const convertHistoryMessagesToChatMessages = useCallback((historyMessages: ChatHistoryMessage[]): ChatMessage[] => {
    return historyMessages.map((msg, index) => ({
      id: `msg_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 9)}`,
      type: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
      timestamp: msg.timestamp,
      userId
    }))
  }, [userId])

  // Helper function to convert ChatMessage to ChatHistoryMessage
  const convertChatMessageToHistoryMessage = useCallback((chatMessage: ChatMessage): Omit<ChatHistoryMessage, 'timestamp'> => {
    return {
      role: chatMessage.type === 'user' ? 'user' : 'ai',
      content: chatMessage.content
    }
  }, [])

  /**
   * Load messages for a specific session with proper state management
   * Requirements: 2.1, 2.2, 2.3 - Session switching and message loading
   */
  const loadMessagesForSession = useCallback(async (sessionId: string | null) => {
    if (!isMounted.current) return

    try {
      setSessionError(null)
      
      if (!enableHistory) {
        // If history is disabled, load from localStorage
        if (typeof window !== 'undefined' && userId) {
          try {
            const savedMessages = localStorage.getItem(`chat_messages_${userId}`)
            if (savedMessages) {
              const parsed = JSON.parse(savedMessages)
              const convertedMessages = parsed.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }))
              setMessages(convertedMessages)
              return
            }
          } catch (error) {
            console.error('Failed to load chat messages from localStorage:', error)
          }
        }
        setMessages(initialMessages)
        return
      }

      if (!sessionId) {
        // No session - clear messages
        console.log('No current session, clearing messages')
        setMessages([])
        lastLoadedSessionId.current = null
        return
      }

      // Skip if we already loaded this session
      if (sessionId === lastLoadedSessionId.current) {
        console.log(`Messages already loaded for session ${sessionId}`)
        return
      }

      console.log(`Loading messages for session: ${sessionId}`)
      
      // Get session from cache
      const cachedSession = getCachedSession(sessionId)
      if (cachedSession) {
        const convertedMessages = convertHistoryMessagesToChatMessages(cachedSession.messages)
        console.log(`Loaded ${convertedMessages.length} messages for session ${sessionId}`)
        setMessages(convertedMessages)
        lastLoadedSessionId.current = sessionId
      } else {
        console.warn(`Session ${sessionId} not found in cache, clearing messages`)
        setMessages([])
        lastLoadedSessionId.current = null
      }
    } catch (error) {
      console.error('Error loading messages for session:', error)
      setSessionError('加载会话消息失败')
      setMessages([])
      lastLoadedSessionId.current = null
    }
  }, [enableHistory, userId, sessions, convertHistoryMessagesToChatMessages, initialMessages])

  /**
   * Update messages when current session changes with improved state management
   * Requirements: 2.1, 2.2, 2.3 - Session switching and state consistency
   */
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true
    }
    
    loadMessagesForSession(historySessionId)
  }, [historySessionId, loadMessagesForSession])

  /**
   * Cleanup effect
   */
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  /**
   * Add message with auto-save functionality and status tracking
   * Requirements: 1.2, 4.1, 4.6, 4.9 - Auto-save user messages with status indicators
   */
  const addMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (!isMounted.current) return

    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date(),
      // Set initial status for user messages
      status: message.type === 'user' ? 'sending' : undefined,
      retryCount: 0,
    }

    try {
      // Update local state immediately for responsive UI
      setMessages(prev => [...prev, newMessage])

      // Save to chat history if enabled
      if (enableHistory) {
        // Ensure we have a current session
        if (!historySessionId) {
          console.warn('No current session, creating new session for message')
          try {
            await createHistorySession()
            // Wait for session to be properly created
            await new Promise(resolve => setTimeout(resolve, 200))
          } catch (sessionError) {
            console.error('Failed to create session for message:', sessionError)
            setSessionError('创建会话失败')
            
            // Update message status to failed
            if (message.type === 'user') {
              setMessages(prev => prev.map(msg => 
                msg.id === newMessage.id 
                  ? { ...msg, status: 'failed' as const }
                  : msg
              ))
            }
            return
          }
        }
        
        const historyMessage = convertChatMessageToHistoryMessage(newMessage)
        
        try {
          // Attempt to save message to database
          await addHistoryMessage(historyMessage)
          
          // Update message status to sent on successful save
          if (message.type === 'user') {
            setMessages(prev => prev.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, status: 'sent' as const }
                : msg
            ))
          }
          
          console.log(`Message successfully saved to session ${historySessionId}`)
        } catch (saveError) {
          console.error('Failed to save message to database:', saveError)
          
          // Update message status to failed
          if (message.type === 'user') {
            setMessages(prev => prev.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, status: 'failed' as const }
                : msg
            ))
          }
          
          // Don't throw error here - message is still in UI for retry
          console.warn('Message saved locally but failed to sync to database')
        }
      } else {
        // Fallback to localStorage when history is disabled
        if (typeof window !== 'undefined' && userId) {
          try {
            setMessages(current => {
              localStorage.setItem(`chat_messages_${userId}`, JSON.stringify(current))
              return current
            })
            
            // Update status to sent for localStorage save
            if (message.type === 'user') {
              setMessages(prev => prev.map(msg => 
                msg.id === newMessage.id 
                  ? { ...msg, status: 'sent' as const }
                  : msg
              ))
            }
          } catch (error) {
            console.error('Failed to save chat messages to localStorage:', error)
            
            // Update message status to failed
            if (message.type === 'user') {
              setMessages(prev => prev.map(msg => 
                msg.id === newMessage.id 
                  ? { ...msg, status: 'failed' as const }
                  : msg
              ))
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to add message:', error)
      setSessionError('添加消息失败')
      
      // Update message status to failed instead of removing
      if (message.type === 'user') {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'failed' as const }
            : msg
        ))
      } else {
        // For non-user messages, still remove on failure
        setMessages(prev => prev.filter(msg => msg.id !== newMessage.id))
      }
    }
  }, [userId, enableHistory, addHistoryMessage, convertChatMessageToHistoryMessage, historySessionId, createHistorySession])

  const addComponentMessage = useCallback(async (
    content: string, 
    componentType: ComponentType, 
    componentData?: any
  ) => {
    await addMessage({
      type: 'component',
      content,
      componentType,
      componentData,
      userId,
    })
  }, [addMessage, userId])

  /**
   * Retry failed message with exponential backoff
   * Requirements: 4.6, 4.9 - Retry mechanism for failed message saves
   */
  const retryMessage = useCallback(async (messageId: string) => {
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
      // Update message status to sending with retry count
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'sending' as const, retryCount }
          : msg
      ))

      // Ensure we have a current session
      if (enableHistory && !historySessionId) {
        console.log('Creating new session for message retry')
        try {
          await createHistorySession()
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (sessionError) {
          console.error('Failed to create session for retry:', sessionError)
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status: 'failed' as const }
              : msg
          ))
          return
        }
      }

      // Exponential backoff delay
      const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000)
      await new Promise(resolve => setTimeout(resolve, delay))

      // Retry saving the message
      const historyMessage = convertChatMessageToHistoryMessage(message)
      await addHistoryMessage(historyMessage)

      // Update message status to sent on successful retry
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'sent' as const }
          : msg
      ))

      console.log(`Message retry successful for ${messageId} (attempt ${retryCount})`)
    } catch (error) {
      console.error(`Message retry failed for ${messageId} (attempt ${retryCount}):`, error)
      
      // Update message status back to failed
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'failed' as const }
          : msg
      ))
    }
  }, [messages, enableHistory, historySessionId, createHistorySession, convertChatMessageToHistoryMessage, addHistoryMessage])

  /**
   * Send message with auto-save for AI replies and session timestamp updates
   * Requirements: 1.3, 4.2, 4.5, 4.7 - Auto-save AI replies with session updates
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !isMounted.current) return

    try {
      setSessionError(null)

      // Ensure we have a current session before sending messages
      if (enableHistory && !historySessionId) {
        console.log('Creating new session for message sending')
        try {
          await createHistorySession()
          // Wait for session to be properly created and state updated
          await new Promise(resolve => setTimeout(resolve, 300))
        } catch (sessionError) {
          console.error('Failed to create session for sending message:', sessionError)
          setSessionError('创建会话失败，无法发送消息')
          return
        }
      }

      // Add user message immediately with auto-save
      await addMessage({
        type: 'user',
        content: content.trim(),
        userId,
      })

      setIsLoading(true)

      try {
        // Simulate AI response for now - will be replaced with actual API call in task 2.3
        await new Promise(resolve => setTimeout(resolve, 1500)) // Fixed delay to avoid hydration issues
        
        // Mock AI response based on content
        const response = generateMockResponse(content)
        
        // Add AI response with auto-save and session timestamp update
        if (response.componentType) {
          await addComponentMessage(response.content, response.componentType, response.componentData)
        } else {
          await addMessage({
            type: 'assistant',
            content: response.content,
            userId,
          })
        }

        // Trigger session refresh to update sidebar with latest timestamp
        // This ensures the session appears at the top of the sidebar after AI reply
        if (enableHistory && historySessionId) {
          try {
            // Small delay to ensure message is saved first
            setTimeout(() => {
              // Trigger a refresh of sessions to update the sidebar
              // The session timestamp will be automatically updated by the addMessage function
              console.log('AI reply completed, session timestamp should be updated')
            }, 100)
          } catch (refreshError) {
            console.warn('Failed to refresh session list after AI reply:', refreshError)
            // Don't throw error as this is not critical
          }
        }

      } catch (error) {
        console.error('Error generating AI response:', error)
        
        // Even error messages should be auto-saved
        await addMessage({
          type: 'assistant',
          content: '抱歉，发生了错误。请稍后再试。',
          userId,
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setSessionError('发送消息失败')
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [addMessage, addComponentMessage, userId, enableHistory, historySessionId, createHistorySession])

  /**
   * Clear messages with proper state management
   */
  const clearMessages = useCallback(() => {
    if (!isMounted.current) return

    console.log('Clearing messages')
    setMessages([])
    lastLoadedSessionId.current = null
    setSessionError(null)
    
    // Clear from localStorage for backward compatibility
    if (typeof window !== 'undefined' && userId) {
      try {
        localStorage.removeItem(`chat_messages_${userId}`)
      } catch (error) {
        console.error('Failed to clear chat messages from localStorage:', error)
      }
    }
  }, [userId])

  /**
   * Create new session with improved state management
   * Requirements: 2.1, 2.2, 2.3 - Session creation and state consistency
   */
  const createNewSession = useCallback(async (): Promise<string> => {
    if (!isMounted.current) throw new Error('Component unmounted')

    try {
      setIsSessionSwitching(true)
      setSessionError(null)
      
      // Clear current messages first
      setMessages([])
      lastLoadedSessionId.current = null
      
      if (enableHistory) {
        console.log('Creating new session with history enabled')
        const newSessionId = await createHistorySession()
        console.log(`Created new session: ${newSessionId}`)
        return newSessionId
      } else {
        // Fallback: clear messages and return a mock session ID
        clearMessages()
        const mockSessionId = `session_${Date.now()}`
        console.log(`Created mock session: ${mockSessionId}`)
        return mockSessionId
      }
    } catch (error) {
      console.error('Failed to create new session:', error)
      setSessionError('创建新会话失败')
      throw error
    } finally {
      if (isMounted.current) {
        setIsSessionSwitching(false)
      }
    }
  }, [enableHistory, createHistorySession, clearMessages])

  /**
   * Switch to session with improved state management and error handling
   * Requirements: 2.1, 2.2, 2.3 - Session switching and state consistency
   */
  const switchToSession = useCallback(async (sessionId: string) => {
    if (!isMounted.current || !enableHistory) return

    try {
      setIsSessionSwitching(true)
      setSessionError(null)
      
      console.log(`useChat: Switching to session ${sessionId}`)
      
      // Clear current messages immediately for responsive UI
      setMessages([])
      lastLoadedSessionId.current = null
      
      // Switch session in history hook
      switchHistorySession(sessionId)
      
      // Messages will be loaded via the useEffect when historySessionId changes
      console.log(`useChat: Session switch initiated for ${sessionId}`)
    } catch (error) {
      console.error('Error switching session:', error)
      setSessionError('切换会话失败')
    } finally {
      if (isMounted.current) {
        setIsSessionSwitching(false)
      }
    }
  }, [enableHistory, switchHistorySession])

  return {
    messages,
    isLoading: isLoading || historyLoading,
    sendMessage,
    addMessage,
    addComponentMessage,
    retryMessage,
    clearMessages,
    // Chat history integration
    currentSessionId: historySessionId,
    createNewSession,
    switchToSession,
    // Session state management
    isSessionSwitching,
    sessionError,
  }
}

// Mock response generator - will be replaced with actual AI integration in task 2.3
function generateMockResponse(userMessage: string): {
  content: string
  componentType?: ComponentType
  componentData?: any
} {
  const message = userMessage.toLowerCase()

  // Career positioning intent detection
  if (message.includes('职业') || message.includes('工作') || message.includes('求职') || 
      message.includes('career') || message.includes('job')) {
    
    if (message.includes('定位') || message.includes('分析') || message.includes('positioning')) {
      return {
        content: '我来帮您进行职业定位分析！首先，请填写一下您的基本信息，这将帮助我更好地了解您的背景。',
        componentType: 'profile-form',
        componentData: {
          sections: ['basic', 'education', 'experience', 'skills']
        }
      }
    }
    
    if (message.includes('测评') || message.includes('评估') || message.includes('assessment')) {
      return {
        content: '让我们通过一个简短的测评来了解您的职业倾向和个性特点。',
        componentType: 'assessment-quiz',
        componentData: {
          templateId: 'career-interest-template',
          questionCount: 15,
          estimatedTime: 10
        }
      }
    }
    
    if (message.includes('推荐') || message.includes('建议') || message.includes('recommendation')) {
      // Import mock data dynamically to avoid build issues
      return {
        content: '基于您的背景和偏好，我为您推荐以下职位：',
        componentType: 'job-recommendations',
        componentData: {
          recommendationsData: null // Will be loaded dynamically
        }
      }
    }
    
    if (message.includes('方向') || message.includes('规划') || message.includes('发展') || message.includes('direction')) {
      return {
        content: '根据您的职业分析和职位偏好，我为您制定了以下职业发展方向：',
        componentType: 'career-directions',
        componentData: {
          directionsData: null // Will be loaded dynamically
        }
      }
    }
  }

  // General conversational responses
  const responses = [
    '您好！我是您的AI职业顾问。我可以帮助您进行职业定位分析、技能评估、求职建议等。请告诉我您需要什么帮助？',
    '我理解您的问题。让我为您提供一些建议...',
    '这是一个很好的问题。基于我的分析...',
    '我来帮您分析一下这个情况。',
  ]

  // Use a deterministic approach to avoid hydration issues
  const responseIndex = userMessage.length % responses.length
  return {
    content: responses[responseIndex]
  }
}