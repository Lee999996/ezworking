/**
 * Offline Storage Utilities
 *
 * Implements requirements:
 * - 4.5: 消息本地缓存机制
 * - 6.4: 网络状态检测和离线提示
 * - 6.5: 支持网络恢复后的数据同步
 */
import {
  ChatHistoryMessage,
  ChatSession,
  ChatSessionSummary,
} from '@/types/chat'

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  SESSIONS: 'chat_sessions',
  MESSAGES: 'chat_messages',
  PENDING_OPERATIONS: 'pending_operations',
  SYNC_METADATA: 'sync_metadata',
  USER_PREFERENCES: 'user_preferences',
  OFFLINE_QUEUE: 'offline_queue',
} as const

// ============================================================================
// Types
// ============================================================================

export interface PendingOperation {
  id: string
  type: 'create_session' | 'save_message' | 'delete_session' | 'update_session'
  data: any
  timestamp: Date
  retryCount: number
  userId: string
}

export interface SyncMetadata {
  lastSyncTime: Date
  userId: string
  version: number
}

export interface OfflineQueueItem {
  id: string
  operation: PendingOperation
  priority: number
  createdAt: Date
}

export interface StorageStats {
  sessionsCount: number
  messagesCount: number
  pendingOperationsCount: number
  storageUsed: number
  lastSyncTime: Date | null
}

// ============================================================================
// Storage Manager Class
// ============================================================================

class OfflineStorageManager {
  private isSupported: boolean
  private maxStorageSize: number = 50 * 1024 * 1024 // 50MB
  private maxRetries: number = 3

  constructor() {
    this.isSupported = this.checkStorageSupport()
  }

  /**
   * Check if localStorage is supported
   */
  private checkStorageSupport(): boolean {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get storage usage in bytes
   */
  private getStorageUsage(): number {
    if (!this.isSupported) return 0

    let total = 0
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += localStorage[key].length + key.length
      }
    }
    return total
  }

  /**
   * Check if storage has enough space
   */
  private hasStorageSpace(additionalSize: number = 0): boolean {
    return this.getStorageUsage() + additionalSize < this.maxStorageSize
  }

  /**
   * Clean up old data to make space
   */
  private async cleanupStorage(): Promise<void> {
    if (!this.isSupported) return

    try {
      // Remove old pending operations (older than 7 days)
      const pendingOps = this.getPendingOperations()
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const filteredOps = pendingOps.filter(
        (op) => new Date(op.timestamp) > sevenDaysAgo,
      )
      this.setPendingOperations(filteredOps)

      // Remove old messages from inactive sessions
      const sessions = this.getSessions()
      const activeSessions = sessions
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        )
        .slice(0, 20) // Keep only 20 most recent sessions

      for (const session of sessions) {
        if (!activeSessions.find((s) => s.id === session.id)) {
          this.removeSessionMessages(session.id)
        }
      }

      console.log('Storage cleanup completed')
    } catch (error) {
      console.error('Storage cleanup failed:', error)
    }
  }

  // ============================================================================
  // Session Storage
  // ============================================================================

  /**
   * Get all cached sessions
   */
  getSessions(userId?: string): ChatSession[] {
    if (!this.isSupported) return []

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS)
      if (!stored) return []

      const sessions: ChatSession[] = JSON.parse(stored)
      return userId
        ? sessions.filter((session) => session.user_id === userId)
        : sessions
    } catch (error) {
      console.error('Failed to get sessions from storage:', error)
      return []
    }
  }

  /**
   * Save sessions to storage
   */
  setSessions(sessions: ChatSession[]): boolean {
    if (!this.isSupported) return false

    try {
      const data = JSON.stringify(sessions)

      if (!this.hasStorageSpace(data.length)) {
        this.cleanupStorage()
      }

      localStorage.setItem(STORAGE_KEYS.SESSIONS, data)
      return true
    } catch (error) {
      console.error('Failed to save sessions to storage:', error)
      return false
    }
  }

  /**
   * Add or update a session
   */
  upsertSession(session: ChatSession): boolean {
    const sessions = this.getSessions()
    const existingIndex = sessions.findIndex((s) => s.id === session.id)

    if (existingIndex >= 0) {
      sessions[existingIndex] = session
    } else {
      sessions.push(session)
    }

    return this.setSessions(sessions)
  }

  /**
   * Remove a session
   */
  removeSession(sessionId: string): boolean {
    const sessions = this.getSessions()
    const filteredSessions = sessions.filter((s) => s.id !== sessionId)

    // Also remove associated messages
    this.removeSessionMessages(sessionId)

    return this.setSessions(filteredSessions)
  }

  // ============================================================================
  // Message Storage
  // ============================================================================

  /**
   * Get messages for a session
   */
  getSessionMessages(sessionId: string): ChatHistoryMessage[] {
    if (!this.isSupported) return []

    try {
      const stored = localStorage.getItem(
        `${STORAGE_KEYS.MESSAGES}_${sessionId}`,
      )
      if (!stored) return []

      const messages = JSON.parse(stored)
      return messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
    } catch (error) {
      console.error('Failed to get messages from storage:', error)
      return []
    }
  }

  /**
   * Save messages for a session
   */
  setSessionMessages(
    sessionId: string,
    messages: ChatHistoryMessage[],
  ): boolean {
    if (!this.isSupported) return false

    try {
      const data = JSON.stringify(messages)

      if (!this.hasStorageSpace(data.length)) {
        this.cleanupStorage()
      }

      localStorage.setItem(`${STORAGE_KEYS.MESSAGES}_${sessionId}`, data)
      return true
    } catch (error) {
      console.error('Failed to save messages to storage:', error)
      return false
    }
  }

  /**
   * Add a message to a session
   */
  addMessage(sessionId: string, message: ChatHistoryMessage): boolean {
    const messages = this.getSessionMessages(sessionId)
    messages.push(message)
    return this.setSessionMessages(sessionId, messages)
  }

  /**
   * Remove all messages for a session
   */
  removeSessionMessages(sessionId: string): boolean {
    if (!this.isSupported) return false

    try {
      localStorage.removeItem(`${STORAGE_KEYS.MESSAGES}_${sessionId}`)
      return true
    } catch (error) {
      console.error('Failed to remove session messages:', error)
      return false
    }
  }

  // ============================================================================
  // Pending Operations Queue
  // ============================================================================

  /**
   * Get pending operations
   */
  getPendingOperations(userId?: string): PendingOperation[] {
    if (!this.isSupported) return []

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PENDING_OPERATIONS)
      if (!stored) return []

      const operations: PendingOperation[] = JSON.parse(stored)
      return operations
        .map((op) => ({
          ...op,
          timestamp: new Date(op.timestamp),
        }))
        .filter((op) => !userId || op.userId === userId)
    } catch (error) {
      console.error('Failed to get pending operations:', error)
      return []
    }
  }

  /**
   * Save pending operations
   */
  setPendingOperations(operations: PendingOperation[]): boolean {
    if (!this.isSupported) return false

    try {
      const data = JSON.stringify(operations)
      localStorage.setItem(STORAGE_KEYS.PENDING_OPERATIONS, data)
      return true
    } catch (error) {
      console.error('Failed to save pending operations:', error)
      return false
    }
  }

  /**
   * Add a pending operation
   */
  addPendingOperation(
    operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>,
  ): string {
    const pendingOp: PendingOperation = {
      ...operation,
      id: `pending_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      timestamp: new Date(),
      retryCount: 0,
    }

    const operations = this.getPendingOperations()
    operations.push(pendingOp)
    this.setPendingOperations(operations)

    return pendingOp.id
  }

  /**
   * Remove a pending operation
   */
  removePendingOperation(operationId: string): boolean {
    const operations = this.getPendingOperations()
    const filteredOps = operations.filter((op) => op.id !== operationId)
    return this.setPendingOperations(filteredOps)
  }

  /**
   * Update retry count for a pending operation
   */
  incrementRetryCount(operationId: string): boolean {
    const operations = this.getPendingOperations()
    const operation = operations.find((op) => op.id === operationId)

    if (operation) {
      operation.retryCount++

      // Remove operation if max retries exceeded
      if (operation.retryCount > this.maxRetries) {
        return this.removePendingOperation(operationId)
      }

      return this.setPendingOperations(operations)
    }

    return false
  }

  // ============================================================================
  // Sync Metadata
  // ============================================================================

  /**
   * Get sync metadata
   */
  getSyncMetadata(userId: string): SyncMetadata | null {
    if (!this.isSupported) return null

    try {
      const stored = localStorage.getItem(
        `${STORAGE_KEYS.SYNC_METADATA}_${userId}`,
      )
      if (!stored) return null

      const metadata = JSON.parse(stored)
      return {
        ...metadata,
        lastSyncTime: new Date(metadata.lastSyncTime),
      }
    } catch (error) {
      console.error('Failed to get sync metadata:', error)
      return null
    }
  }

  /**
   * Save sync metadata
   */
  setSyncMetadata(userId: string, metadata: SyncMetadata): boolean {
    if (!this.isSupported) return false

    try {
      const data = JSON.stringify(metadata)
      localStorage.setItem(`${STORAGE_KEYS.SYNC_METADATA}_${userId}`, data)
      return true
    } catch (error) {
      console.error('Failed to save sync metadata:', error)
      return false
    }
  }

  // ============================================================================
  // Storage Statistics
  // ============================================================================

  /**
   * Get storage statistics
   */
  getStorageStats(userId?: string): StorageStats {
    const sessions = this.getSessions(userId)
    const pendingOps = this.getPendingOperations(userId)
    const syncMetadata = userId ? this.getSyncMetadata(userId) : null

    let messagesCount = 0
    sessions.forEach((session) => {
      messagesCount += this.getSessionMessages(session.id).length
    })

    return {
      sessionsCount: sessions.length,
      messagesCount,
      pendingOperationsCount: pendingOps.length,
      storageUsed: this.getStorageUsage(),
      lastSyncTime: syncMetadata?.lastSyncTime || null,
    }
  }

  /**
   * Clear all storage data
   */
  clearAllData(userId?: string): boolean {
    if (!this.isSupported) return false

    try {
      if (userId) {
        // Clear user-specific data
        const sessions = this.getSessions()
        const otherUserSessions = sessions.filter((s) => s.user_id !== userId)
        this.setSessions(otherUserSessions)

        // Remove user's messages
        sessions
          .filter((s) => s.user_id === userId)
          .forEach((s) => this.removeSessionMessages(s.id))

        // Remove user's pending operations
        const pendingOps = this.getPendingOperations()
        const otherUserOps = pendingOps.filter((op) => op.userId !== userId)
        this.setPendingOperations(otherUserOps)

        // Remove user's sync metadata
        localStorage.removeItem(`${STORAGE_KEYS.SYNC_METADATA}_${userId}`)
      } else {
        // Clear all data
        Object.values(STORAGE_KEYS).forEach((key) => {
          localStorage.removeItem(key)
        })

        // Clear all message storage
        for (const key in localStorage) {
          if (
            key.startsWith(STORAGE_KEYS.MESSAGES) ||
            key.startsWith(STORAGE_KEYS.SYNC_METADATA)
          ) {
            localStorage.removeItem(key)
          }
        }
      }

      return true
    } catch (error) {
      console.error('Failed to clear storage data:', error)
      return false
    }
  }

  /**
   * Check if storage is supported
   */
  isStorageSupported(): boolean {
    return this.isSupported
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const offlineStorage = new OfflineStorageManager()

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert ChatSession to ChatSessionSummary
 */
export function sessionToSummary(session: ChatSession): ChatSessionSummary {
  const lastMessage =
    session.messages.length > 0
      ? session.messages[session.messages.length - 1].content.substring(0, 100)
      : undefined

  return {
    id: session.id,
    title: session.title,
    created_at: session.created_at,
    updated_at: session.updated_at,
    messageCount: session.messages.length,
    lastMessage,
  }
}

/**
 * Merge server data with local data
 */
export function mergeSessionData(
  serverSessions: ChatSession[],
  localSessions: ChatSession[],
): ChatSession[] {
  const merged = new Map<string, ChatSession>()

  // Add server sessions (they have priority)
  serverSessions.forEach((session) => {
    merged.set(session.id, session)
  })

  // Add local sessions that don't exist on server
  localSessions.forEach((session) => {
    if (!merged.has(session.id)) {
      merged.set(session.id, session)
    }
  })

  return Array.from(merged.values()).sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  )
}
