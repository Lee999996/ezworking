import { useState, useEffect, useCallback, useRef } from 'react'
import { chatServices } from '@/services/chat'
import { useAuth } from './useAuth'
import { useOfflineSupport, useOfflineChat } from './useOfflineSupport'
import type { 
  ChatSession, 
  ChatSessionSummary, 
  ChatHistoryMessage, 
  ChatError, 
  UseChatHistoryReturn 
} from '@/types/chat'
import { ChatErrorType } from '@/types/chat'

interface UseChatHistoryOptions {
  autoLoad?: boolean
  pageSize?: number
}

/**
 * Custom hook for managing chat session history
 * Implements requirements: 2.1, 2.2, 2.4, 2.6
 * - 会话列表加载、创建、删除、切换功能
 * - 添加加载状态、错误状态管理
 * - 实现会话数据缓存和同步机制
 * 
 * Auth Integration (Task 3.3):
 * - 自动获取当前用户ID
 * - 处理用户状态变化
 * - 在用户未登录时提供适当的错误处理
 */
export function useChatHistory({
  autoLoad = true,
  pageSize = 20
}: UseChatHistoryOptions = {}): UseChatHistoryReturn {
  // Auth integration - automatically get current user
  const { userId, isAuthenticated, loading: authLoading, redirectToLogin } = useAuth()
  // Offline support
  const { 
    isOnline, 
    getCachedSessions 
  } = useOfflineSupport()
  const { createSessionOffline } = useOfflineChat()
  // State management
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ChatError | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)

  // Cache and sync management
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [cachedSessions, setCachedSessions] = useState<Map<string, ChatSession>>(new Map())
  const isMounted = useRef(true)
  const syncInProgress = useRef(false)

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  /**
   * Create error object with proper typing
   */
  const createError = useCallback((type: ChatErrorType, message: string, details?: any): ChatError => ({
    type,
    message,
    details,
    timestamp: new Date(),
    retryable: [
      ChatErrorType.NETWORK_ERROR,
      ChatErrorType.REQUEST_TIMEOUT,
      ChatErrorType.SERVER_ERROR,
      ChatErrorType.DATABASE_ERROR
    ].includes(type)
  }), [])

  /**
   * Convert ChatSession to ChatSessionSummary for list display
   */
  const convertToSummary = useCallback((session: ChatSession): ChatSessionSummary => {
    const lastMessage = session.messages.length > 0 
      ? session.messages[session.messages.length - 1].content.substring(0, 100)
      : undefined

    return {
      id: session.id,
      title: session.title,
      created_at: session.created_at,
      updated_at: session.updated_at,
      messageCount: session.messages.length,
      lastMessage
    }
  }, [])

  /**
   * Load sessions from cache first, then sync with server
   * Requirement 2.1: 会话列表加载功能
   */
  const loadSessions = useCallback(async (page = 0, append = false) => {
    if (!userId || !isMounted.current) return

    try {
      setIsLoading(true)
      setError(null)

      // Load from cache first for immediate UI response
      if (page === 0 && !append) {
        // Try history cache first
        const cachedSessionsList = Array.from(cachedSessions.values())
          .map(convertToSummary)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        
        // Also get offline cached sessions
        const offlineCachedSessions = getCachedSessions()
        
        // Merge and deduplicate
        const allCachedSessions = [...cachedSessionsList]
        offlineCachedSessions.forEach(offlineSession => {
          if (!allCachedSessions.find(s => s.id === offlineSession.id)) {
            allCachedSessions.push(offlineSession)
          }
        })
        
        if (allCachedSessions.length > 0) {
          setSessions(allCachedSessions.sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          ))
        }
      }

      // Fetch from server if online
      let fetchedSessions: ChatSession[] = []
      if (isOnline) {
        try {
          fetchedSessions = await chatServices.session.getUserSessions(
            userId, 
            pageSize, 
            page * pageSize
          )
        } catch (serverError) {
          // If server fails but we have cached data, continue with cached data
          if (page === 0 && sessions.length > 0) {
            console.warn('Server fetch failed, using cached sessions:', serverError)
            return
          }
          throw serverError
        }
      } else {
        // When offline, only use cached data
        if (page === 0) {
          const offlineSessions = getCachedSessions()
          setSessions(offlineSessions)
          setHasMore(false)
          return
        } else {
          // No more pages when offline
          setHasMore(false)
          return
        }
      }

      if (!isMounted.current) return

      // Update cache
      const newCachedSessions = new Map(cachedSessions)
      fetchedSessions.forEach(session => {
        newCachedSessions.set(session.id, session)
      })
      setCachedSessions(newCachedSessions)

      // Convert to summaries
      const sessionSummaries = fetchedSessions.map(convertToSummary)

      if (append) {
        setSessions(prev => [...prev, ...sessionSummaries])
      } else {
        setSessions(sessionSummaries)
      }

      // Update pagination state
      setHasMore(fetchedSessions.length === pageSize)
      setCurrentPage(page)
      setLastSyncTime(new Date())

    } catch (err) {
      console.error('Failed to load sessions:', err)
      
      if (!isMounted.current) return

      const chatError = createError(
        ChatErrorType.DATABASE_ERROR,
        '加载会话列表失败',
        err
      )
      setError(chatError)

      // If this is the first load and we have cached data, don't clear it
      if (page === 0 && !append && cachedSessions.size === 0) {
        setSessions([])
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [isAuthenticated, userId, pageSize, cachedSessions, convertToSummary, createError])

  /**
   * Load more sessions for pagination
   * Requirement 2.1: 分页加载会话列表
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return
    await loadSessions(currentPage + 1, true)
  }, [hasMore, isLoading, currentPage, loadSessions])

  /**
   * Refresh sessions list
   * Requirement 2.6: 会话数据同步机制
   */
  const refreshSessions = useCallback(async () => {
    setCurrentPage(0)
    setHasMore(true)
    await loadSessions(0, false)
  }, [loadSessions])

  /**
   * Create new session
   * Requirement 2.2: 会话创建功能
   * Auth Integration: 确保用户已登录
   */
  const createSession = useCallback(async (title?: string): Promise<string> => {
    if (!isAuthenticated || !userId || !isMounted.current) {
      redirectToLogin()
      throw createError(ChatErrorType.UNAUTHORIZED, '用户未登录')
    }

    try {
      setError(null)

      const sessionTitle = title || `新对话 ${new Date().toLocaleString()}`
      
      let newSessionId: string
      let newSession: ChatSession
      
      if (isOnline) {
        // Try to create on server first
        try {
          newSession = await chatServices.session.createSession(userId, sessionTitle)
          newSessionId = newSession.id
        } catch (serverError) {
          // If server fails, create offline
          console.warn('Server session creation failed, creating offline:', serverError)
          const offlineSessionId = await createSessionOffline(sessionTitle)
          if (!offlineSessionId) {
            throw serverError
          }
          newSessionId = offlineSessionId
          
          // Create a temporary session object for UI
          newSession = {
            id: offlineSessionId,
            user_id: userId,
            title: sessionTitle,
            messages: [],
            created_at: new Date(),
            updated_at: new Date()
          }
        }
      } else {
        // Create offline when offline
        const offlineSessionId = await createSessionOffline(sessionTitle)
        if (!offlineSessionId) {
          throw createError(ChatErrorType.DATABASE_ERROR, '离线创建会话失败')
        }
        newSessionId = offlineSessionId
        
        // Create a temporary session object for UI
        newSession = {
          id: offlineSessionId,
          user_id: userId,
          title: sessionTitle,
          messages: [],
          created_at: new Date(),
          updated_at: new Date()
        }
      }

      if (!isMounted.current) return newSessionId

      // Update cache
      const newCachedSessions = new Map(cachedSessions)
      newCachedSessions.set(newSession.id, newSession)
      setCachedSessions(newCachedSessions)

      // Add to sessions list at the top
      const newSummary = convertToSummary(newSession)
      setSessions(prev => [newSummary, ...prev])

      // Set as current session
      setCurrentSessionId(newSession.id)

      return newSessionId
    } catch (err) {
      console.error('Failed to create session:', err)
      
      const chatError = createError(
        ChatErrorType.DATABASE_ERROR,
        '创建会话失败',
        err
      )
      setError(chatError)
      throw chatError
    }
  }, [isAuthenticated, userId, cachedSessions, convertToSummary, createError, redirectToLogin])

  /**
   * Switch to a specific session
   * Requirement 2.2: 会话切换功能
   * Auth Integration: 确保用户已登录
   */
  const switchSession = useCallback(async (sessionId: string): Promise<void> => {
    if (!isAuthenticated || !userId || !isMounted.current) {
      redirectToLogin()
      return
    }

    try {
      setError(null)

      // Check if session exists in cache
      let session = cachedSessions.get(sessionId)
      
      if (!session) {
        // Load session from server
        session = await chatServices.session.getSession(sessionId, userId)
        
        if (!session) {
          throw createError(
            ChatErrorType.SESSION_NOT_FOUND,
            '会话不存在或无访问权限'
          )
        }

        // Update cache
        const newCachedSessions = new Map(cachedSessions)
        newCachedSessions.set(sessionId, session)
        setCachedSessions(newCachedSessions)
      }

      if (!isMounted.current) return

      setCurrentSessionId(sessionId)

      // Update session in the list to move it to top (most recent)
      setSessions(prev => {
        const updated = prev.filter(s => s.id !== sessionId)
        const currentSummary = convertToSummary(session!)
        return [currentSummary, ...updated]
      })

    } catch (err) {
      console.error('Failed to switch session:', err)
      
      if (!isMounted.current) return

      const chatError = createError(ChatErrorType.DATABASE_ERROR, '切换会话失败', err)
      
      setError(chatError)
    }
  }, [isAuthenticated, userId, cachedSessions, convertToSummary, createError, redirectToLogin])

  /**
   * Delete a session
   * Requirement 2.2: 会话删除功能
   * Auth Integration: 确保用户已登录
   */
  const deleteSession = useCallback(async (sessionId: string): Promise<void> => {
    if (!isAuthenticated || !userId || !isMounted.current) {
      redirectToLogin()
      return
    }

    try {
      setError(null)

      await chatServices.session.deleteSession(sessionId, userId)

      if (!isMounted.current) return

      // Remove from cache
      const newCachedSessions = new Map(cachedSessions)
      newCachedSessions.delete(sessionId)
      setCachedSessions(newCachedSessions)

      // Remove from sessions list
      setSessions(prev => prev.filter(s => s.id !== sessionId))

      // If this was the current session, clear it
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null)
      }

    } catch (err) {
      console.error('Failed to delete session:', err)
      
      if (!isMounted.current) return

      const chatError = createError(
        ChatErrorType.DATABASE_ERROR,
        '删除会话失败',
        err
      )
      setError(chatError)
    }
  }, [isAuthenticated, userId, cachedSessions, currentSessionId, createError, redirectToLogin])

  /**
   * Add message to current session and update cache
   * Requirement 2.6: 会话数据缓存和同步机制
   * Auth Integration: 确保用户已登录
   */
  const addMessage = useCallback(async (message: Omit<ChatHistoryMessage, 'timestamp'>): Promise<void> => {
    if (!isAuthenticated || !currentSessionId || !userId || !isMounted.current) return

    try {
      const fullMessage: ChatHistoryMessage = {
        ...message,
        timestamp: new Date()
      }

      // Save to server
      await chatServices.message.saveMessage(currentSessionId, fullMessage)

      if (!isMounted.current) return

      // Update cache
      const cachedSession = cachedSessions.get(currentSessionId)
      if (cachedSession) {
        const updatedSession: ChatSession = {
          ...cachedSession,
          messages: [...cachedSession.messages, fullMessage],
          updated_at: new Date()
        }

        const newCachedSessions = new Map(cachedSessions)
        newCachedSessions.set(currentSessionId, updatedSession)
        setCachedSessions(newCachedSessions)

        // Update sessions list to reflect new message count and timestamp
        setSessions(prev => {
          const updated = prev.filter(s => s.id !== currentSessionId)
          const updatedSummary = convertToSummary(updatedSession)
          return [updatedSummary, ...updated]
        })
      }

    } catch (err) {
      console.error('Failed to add message:', err)
      throw err
    }
  }, [isAuthenticated, currentSessionId, userId, cachedSessions, convertToSummary])

  /**
   * Get cached session data
   * Requirement 2.6: 会话数据缓存机制
   */
  const getCachedSession = useCallback((sessionId: string): ChatSession | null => {
    return cachedSessions.get(sessionId) || null
  }, [cachedSessions])

  /**
   * Sync cache with server data
   * Requirement 2.6: 会话数据同步机制
   * Auth Integration: 确保用户已登录
   */
  const syncCache = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !userId || syncInProgress.current || !isMounted.current) return

    try {
      syncInProgress.current = true

      // Get all sessions from server
      const serverSessions = await chatServices.session.getUserSessions(userId)
      
      if (!isMounted.current) return

      // Update cache with server data
      const newCachedSessions = new Map<string, ChatSession>()
      serverSessions.forEach(session => {
        newCachedSessions.set(session.id, session)
      })
      setCachedSessions(newCachedSessions)

      // Update sessions list
      const sessionSummaries = serverSessions.map(convertToSummary)
      setSessions(sessionSummaries)

      setLastSyncTime(new Date())

    } catch (err) {
      console.error('Failed to sync cache:', err)
    } finally {
      syncInProgress.current = false
    }
  }, [isAuthenticated, userId, convertToSummary])

  /**
   * Auto-load sessions on mount and user change
   * Auth Integration: 只在用户已认证时加载
   */
  useEffect(() => {
    if (autoLoad && isAuthenticated && userId && !authLoading && isMounted.current) {
      loadSessions(0, false)
    }
  }, [autoLoad, isAuthenticated, userId, authLoading, loadSessions])

  /**
   * Handle auth state changes - clear data when user logs out
   * Requirement 1.3: 用户状态变化的响应处理
   */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // User logged out, clear all session data
      setSessions([])
      setCurrentSessionId(null)
      setCachedSessions(new Map())
      setError(null)
      setLastSyncTime(null)
      setCurrentPage(0)
      setHasMore(true)
    }
  }, [authLoading, isAuthenticated])

  /**
   * Periodic cache sync (every 5 minutes)
   * Auth Integration: 只在用户已认证时同步
   */
  useEffect(() => {
    if (!isAuthenticated || !userId) return

    const syncInterval = setInterval(() => {
      if (isMounted.current && isAuthenticated) {
        syncCache()
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(syncInterval)
  }, [isAuthenticated, userId, syncCache])

  return {
    // State
    sessions,
    currentSessionId,
    isLoading,
    error,
    hasMore,

    // Actions
    createSession,
    switchSession,
    deleteSession,
    refreshSessions,
    loadMore,

    // Cache management
    addMessage,
    getCachedSession,
    syncCache,

    // Metadata
    lastSyncTime,
    currentPage,

    // Auth integration
    isAuthenticated,
    authLoading
  }
}