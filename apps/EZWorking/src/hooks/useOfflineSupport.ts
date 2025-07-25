/**
 * Offline Support Hook
 * 
 * Implements requirements:
 * - 4.5: 消息本地缓存机制
 * - 6.4: 网络状态检测和离线提示
 * - 6.5: 支持网络恢复后的数据同步
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import { networkManager, type NetworkStatus, type SyncResult } from '@/services/sync/network-manager'
import { offlineStorage, type StorageStats, sessionToSummary } from '@/utils/offline-storage'
import { chatServices } from '@/services/chat'
import type { ChatSession, ChatHistoryMessage, ChatSessionSummary } from '@/types/chat'

// ============================================================================
// Types
// ============================================================================

export interface OfflineSupportState {
  // Network status
  isOnline: boolean
  networkStatus: NetworkStatus
  
  // Sync status
  isSyncing: boolean
  lastSyncTime: Date | null
  pendingOperationsCount: number
  
  // Storage stats
  storageStats: StorageStats
  
  // Error state
  syncError: string | null
}

export interface OfflineSupportActions {
  // Sync operations
  syncNow: () => Promise<SyncResult>
  clearSyncError: () => void
  
  // Cache operations
  getCachedSessions: () => ChatSessionSummary[]
  getCachedMessages: (sessionId: string) => ChatHistoryMessage[]
  saveToCacheOnly: (sessionId: string, message: ChatHistoryMessage) => boolean
  
  // Storage management
  clearOfflineData: () => Promise<boolean>
  getStorageStats: () => StorageStats
}

export interface UseOfflineSupportReturn extends OfflineSupportState, OfflineSupportActions {}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useOfflineSupport(): UseOfflineSupportReturn {
  const { userId, isAuthenticated } = useAuth()
  const [state, setState] = useState<OfflineSupportState>({
    isOnline: true,
    networkStatus: networkManager.getNetworkStatus(),
    isSyncing: false,
    lastSyncTime: null,
    pendingOperationsCount: 0,
    storageStats: {
      sessionsCount: 0,
      messagesCount: 0,
      pendingOperationsCount: 0,
      storageUsed: 0,
      lastSyncTime: null
    },
    syncError: null
  })

  const syncTimeoutRef = useRef<NodeJS.Timeout>()
  const isMounted = useRef(true)

  // ============================================================================
  // Network Status Monitoring
  // ============================================================================

  useEffect(() => {
    const unsubscribe = networkManager.addListener((networkStatus) => {
      if (!isMounted.current) return

      setState(prev => ({
        ...prev,
        isOnline: networkStatus.isOnline,
        networkStatus
      }))

      // Auto-sync when coming back online
      if (networkStatus.isOnline && isAuthenticated && userId) {
        scheduleSync(2000) // Delay to ensure connection is stable
      }
    })

    return unsubscribe
  }, [isAuthenticated, userId])

  // ============================================================================
  // Storage Stats Monitoring
  // ============================================================================

  const updateStorageStats = useCallback(() => {
    if (!userId) return

    const stats = offlineStorage.getStorageStats(userId)
    const syncMetadata = offlineStorage.getSyncMetadata(userId)
    
    setState(prev => ({
      ...prev,
      storageStats: {
        ...stats,
        lastSyncTime: syncMetadata?.lastSyncTime || null
      },
      lastSyncTime: syncMetadata?.lastSyncTime || null,
      pendingOperationsCount: stats.pendingOperationsCount
    }))
  }, [userId])

  useEffect(() => {
    updateStorageStats()
    
    // Update stats periodically
    const interval = setInterval(updateStorageStats, 10000) // Every 10 seconds
    
    return () => clearInterval(interval)
  }, [updateStorageStats])

  // ============================================================================
  // Sync Operations
  // ============================================================================

  const scheduleSync = useCallback((delay: number = 0) => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }

    syncTimeoutRef.current = setTimeout(() => {
      if (isMounted.current && state.isOnline && !state.isSyncing) {
        syncNow()
      }
    }, delay)
  }, [state.isOnline, state.isSyncing])

  const syncNow = useCallback(async (): Promise<SyncResult> => {
    if (!userId || !isAuthenticated || state.isSyncing) {
      return {
        success: false,
        syncedOperations: 0,
        failedOperations: 0,
        errors: ['Not authenticated or sync in progress']
      }
    }

    setState(prev => ({ ...prev, isSyncing: true, syncError: null }))

    try {
      const result = await networkManager.forceSyncNow()
      
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          isSyncing: false,
          syncError: result.success ? null : result.errors.join(', ')
        }))

        // Update storage stats after sync
        updateStorageStats()

        // Update sync metadata
        if (result.success) {
          offlineStorage.setSyncMetadata(userId, {
            lastSyncTime: new Date(),
            userId,
            version: 1
          })
        }
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed'
      
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          isSyncing: false,
          syncError: errorMessage
        }))
      }

      return {
        success: false,
        syncedOperations: 0,
        failedOperations: 0,
        errors: [errorMessage]
      }
    }
  }, [userId, isAuthenticated, state.isSyncing, updateStorageStats])

  const clearSyncError = useCallback(() => {
    setState(prev => ({ ...prev, syncError: null }))
  }, [])

  // ============================================================================
  // Cache Operations
  // ============================================================================

  const getCachedSessions = useCallback((): ChatSessionSummary[] => {
    if (!userId) return []
    
    const sessions = offlineStorage.getSessions(userId)
    return sessions.map(sessionToSummary)
  }, [userId])

  const getCachedMessages = useCallback((sessionId: string): ChatHistoryMessage[] => {
    return offlineStorage.getSessionMessages(sessionId)
  }, [])

  const saveToCacheOnly = useCallback((sessionId: string, message: ChatHistoryMessage): boolean => {
    if (!userId) return false
    
    const success = offlineStorage.addMessage(sessionId, message)
    
    if (success) {
      updateStorageStats()
    }
    
    return success
  }, [userId, updateStorageStats])

  // ============================================================================
  // Storage Management
  // ============================================================================

  const clearOfflineData = useCallback(async (): Promise<boolean> => {
    if (!userId) return false

    try {
      const success = offlineStorage.clearAllData(userId)
      
      if (success) {
        updateStorageStats()
      }
      
      return success
    } catch (error) {
      console.error('Failed to clear offline data:', error)
      return false
    }
  }, [userId, updateStorageStats])

  const getStorageStats = useCallback((): StorageStats => {
    return userId ? offlineStorage.getStorageStats(userId) : {
      sessionsCount: 0,
      messagesCount: 0,
      pendingOperationsCount: 0,
      storageUsed: 0,
      lastSyncTime: null
    }
  }, [userId])

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    return () => {
      isMounted.current = false
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [])

  // ============================================================================
  // Auto-sync on Auth Changes
  // ============================================================================

  useEffect(() => {
    if (isAuthenticated && userId && state.isOnline) {
      // Sync when user logs in
      scheduleSync(1000)
    } else if (!isAuthenticated) {
      // Clear sync error when user logs out
      setState(prev => ({ ...prev, syncError: null }))
    }
  }, [isAuthenticated, userId, state.isOnline, scheduleSync])

  return {
    // State
    ...state,
    
    // Actions
    syncNow,
    clearSyncError,
    getCachedSessions,
    getCachedMessages,
    saveToCacheOnly,
    clearOfflineData,
    getStorageStats
  }
}

// ============================================================================
// Specialized Hooks
// ============================================================================

/**
 * Hook for offline-aware chat operations
 */
export function useOfflineChat() {
  const offlineSupport = useOfflineSupport()
  const { userId } = useAuth()

  const sendMessageOffline = useCallback(async (
    sessionId: string,
    message: ChatHistoryMessage
  ): Promise<boolean> => {
    if (!userId) return false

    // Save to cache immediately
    const cached = offlineSupport.saveToCacheOnly(sessionId, message)
    
    if (offlineSupport.isOnline) {
      try {
        // Try to send to server
        await chatServices.message.saveMessage(sessionId, message)
        return true
      } catch (error) {
        // Add to pending operations for later sync
        offlineStorage.addPendingOperation({
          type: 'save_message',
          data: { sessionId, message },
          userId
        })
        return cached
      }
    } else {
      // Add to pending operations
      offlineStorage.addPendingOperation({
        type: 'save_message',
        data: { sessionId, message },
        userId
      })
      return cached
    }
  }, [userId, offlineSupport])

  const createSessionOffline = useCallback(async (
    title: string
  ): Promise<string | null> => {
    if (!userId) {
      console.error('createSessionOffline: No userId provided');
      return null;
    }

    console.log('Creating session offline:', { userId, title, isOnline: offlineSupport.isOnline });

    const sessionId = `offline_${Date.now()}_${Math.random().toString(36).substring(2)}`
    
    const session: ChatSession = {
      id: sessionId,
      user_id: userId,
      title,
      messages: [],
      created_at: new Date(),
      updated_at: new Date()
    }

    try {
      // Save to cache immediately
      const cached = offlineStorage.upsertSession(session)
      console.log('Session cached:', { sessionId, cached });
      
      if (offlineSupport.isOnline) {
        try {
          // Try to create on server
          console.log('Attempting to create session on server...');
          const serverSession = await chatServices.session.createSession(userId, title)
          console.log('Server session created:', serverSession);
          
          // Update cache with server session
          offlineStorage.upsertSession(serverSession)
          
          return serverSession.id
        } catch (error) {
          console.warn('Server session creation failed, using offline session:', error);
          
          // Add to pending operations for later sync
          offlineStorage.addPendingOperation({
            type: 'create_session',
            data: { userId, title },
            userId
          })
          return cached ? sessionId : null
        }
      } else {
        console.log('Offline mode: creating session locally');
        
        // Add to pending operations
        offlineStorage.addPendingOperation({
          type: 'create_session',
          data: { userId, title },
          userId
        })
        return cached ? sessionId : null
      }
    } catch (error) {
      console.error('Failed to create session offline:', error);
      return null;
    }
  }, [userId, offlineSupport])

  return {
    ...offlineSupport,
    sendMessageOffline,
    createSessionOffline
  }
}

/**
 * Hook for network status only
 */
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(
    networkManager.getNetworkStatus()
  )

  useEffect(() => {
    const unsubscribe = networkManager.addListener(setNetworkStatus)
    return unsubscribe
  }, [])

  return networkStatus
}