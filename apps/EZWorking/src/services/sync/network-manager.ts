/**
 * Network Status Manager and Sync Service
 * 
 * Implements requirements:
 * - 6.4: 网络状态检测和离线提示
 * - 6.5: 支持网络恢复后的数据同步
 */

import { offlineStorage, type PendingOperation } from '@/utils/offline-storage'
import { chatServices } from '@/services/chat'
import { createErrorContext, logError } from '@/utils/error-handling'
import { ChatErrorType } from '@/types/chat'

// ============================================================================
// Types
// ============================================================================

export interface NetworkStatus {
  isOnline: boolean
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown'
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown'
  downlink: number
  rtt: number
  saveData: boolean
}

export interface SyncResult {
  success: boolean
  syncedOperations: number
  failedOperations: number
  errors: string[]
}

export interface SyncOptions {
  force?: boolean
  maxRetries?: number
  batchSize?: number
  timeout?: number
}

// ============================================================================
// Network Manager Class
// ============================================================================

class NetworkManager {
  private isOnline: boolean = navigator.onLine
  private listeners: Set<(status: NetworkStatus) => void> = new Set()
  private syncInProgress: boolean = false
  private syncQueue: Set<string> = new Set()
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    this.setupEventListeners()
  }

  /**
   * Setup network event listeners
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return

    // Basic online/offline events
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))

    // Network Information API (if supported)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', this.handleConnectionChange.bind(this))
    }

    // Visibility change (for sync when app becomes visible)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    console.log('Network: Online')
    this.isOnline = true
    this.notifyListeners()
    
    // Start sync when coming back online
    this.scheduleSync()
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    console.log('Network: Offline')
    this.isOnline = false
    this.notifyListeners()
    
    // Clear any pending sync operations
    this.clearRetryTimeouts()
  }

  /**
   * Handle connection change
   */
  private handleConnectionChange(): void {
    console.log('Network: Connection changed')
    this.notifyListeners()
  }

  /**
   * Handle visibility change
   */
  private handleVisibilityChange(): void {
    if (!document.hidden && this.isOnline) {
      // App became visible and we're online, sync data
      this.scheduleSync(1000) // Delay to avoid immediate sync
    }
  }

  /**
   * Get current network status
   */
  getNetworkStatus(): NetworkStatus {
    const connection = (navigator as any).connection

    return {
      isOnline: this.isOnline,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false
    }
  }

  /**
   * Add network status listener
   */
  addListener(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    const status = this.getNetworkStatus()
    this.listeners.forEach(listener => {
      try {
        listener(status)
      } catch (error) {
        console.error('Network listener error:', error)
      }
    })
  }

  /**
   * Check if network connection is good enough for sync
   */
  isConnectionGoodForSync(): boolean {
    const status = this.getNetworkStatus()
    
    if (!status.isOnline) return false
    
    // Don't sync on slow connections if save data is enabled
    if (status.saveData && ['slow-2g', '2g'].includes(status.effectiveType)) {
      return false
    }
    
    return true
  }

  /**
   * Schedule sync operation
   */
  scheduleSync(delay: number = 0): void {
    if (!this.isOnline || this.syncInProgress) return

    setTimeout(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.performSync()
      }
    }, delay)
  }

  /**
   * Perform sync operation
   */
  async performSync(options: SyncOptions = {}): Promise<SyncResult> {
    if (this.syncInProgress || !this.isOnline) {
      return {
        success: false,
        syncedOperations: 0,
        failedOperations: 0,
        errors: ['Sync already in progress or offline']
      }
    }

    const {
      force = false,
      maxRetries = 3,
      batchSize = 10,
      timeout = 30000
    } = options

    this.syncInProgress = true
    const errors: string[] = []
    let syncedOperations = 0
    let failedOperations = 0

    // Get pending operations
    const pendingOps = offlineStorage.getPendingOperations()

    try {
      console.log('Starting sync operation...')
      
      if (pendingOps.length === 0) {
        console.log('No pending operations to sync')
        return {
          success: true,
          syncedOperations: 0,
          failedOperations: 0,
          errors: []
        }
      }

      console.log(`Syncing ${pendingOps.length} pending operations`)

      // Process operations in batches
      for (let i = 0; i < pendingOps.length; i += batchSize) {
        const batch = pendingOps.slice(i, i + batchSize)
        
        for (const operation of batch) {
          try {
            // Skip if already being processed
            if (this.syncQueue.has(operation.id)) continue
            
            this.syncQueue.add(operation.id)
            
            await this.syncOperation(operation, timeout)
            
            // Remove successful operation
            offlineStorage.removePendingOperation(operation.id)
            syncedOperations++
            
            console.log(`Synced operation: ${operation.type}`)
            
          } catch (error) {
            console.error(`Failed to sync operation ${operation.id}:`, error)
            
            // Increment retry count
            const updated = offlineStorage.incrementRetryCount(operation.id)
            
            if (updated) {
              // Schedule retry
              this.scheduleRetry(operation.id, operation.retryCount + 1)
            } else {
              // Max retries exceeded, operation was removed
              failedOperations++
              errors.push(`Operation ${operation.type} failed after ${maxRetries} retries`)
            }
          } finally {
            this.syncQueue.delete(operation.id)
          }
        }

        // Small delay between batches to avoid overwhelming the server
        if (i + batchSize < pendingOps.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      console.log(`Sync completed: ${syncedOperations} synced, ${failedOperations} failed`)

      return {
        success: failedOperations === 0,
        syncedOperations,
        failedOperations,
        errors
      }

    } catch (error) {
      console.error('Sync operation failed:', error)
      errors.push(error instanceof Error ? error.message : 'Unknown sync error')
      
      return {
        success: false,
        syncedOperations,
        failedOperations: pendingOps.length - syncedOperations,
        errors
      }
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Sync individual operation
   */
  private async syncOperation(operation: PendingOperation, timeout: number): Promise<void> {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Sync operation timeout')), timeout)
    })

    const syncPromise = this.executeSyncOperation(operation)

    await Promise.race([syncPromise, timeoutPromise])
  }

  /**
   * Execute specific sync operation
   */
  private async executeSyncOperation(operation: PendingOperation): Promise<void> {
    const context = createErrorContext('syncOperation', {
      operationType: operation.type,
      operationId: operation.id,
      retryCount: operation.retryCount
    }, operation.userId)

    switch (operation.type) {
      case 'create_session':
        await chatServices.session.createSession(
          operation.data.userId,
          operation.data.title
        )
        break

      case 'save_message':
        await chatServices.message.saveMessage(
          operation.data.sessionId,
          operation.data.message
        )
        break

      case 'delete_session':
        await chatServices.session.deleteSession(
          operation.data.sessionId,
          operation.data.userId
        )
        break

      case 'update_session':
        await chatServices.session.updateSession(
          operation.data.sessionId,
          operation.data.updates
        )
        break

      default:
        throw new Error(`Unknown operation type: ${operation.type}`)
    }
  }

  /**
   * Schedule retry for failed operation
   */
  private scheduleRetry(operationId: string, retryCount: number): void {
    // Clear existing timeout
    const existingTimeout = this.retryTimeouts.get(operationId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Calculate exponential backoff delay
    const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 30000) // Max 30 seconds

    const timeout = setTimeout(() => {
      this.retryTimeouts.delete(operationId)
      
      if (this.isOnline) {
        console.log(`Retrying operation ${operationId} (attempt ${retryCount})`)
        this.scheduleSync()
      }
    }, delay)

    this.retryTimeouts.set(operationId, timeout)
  }

  /**
   * Clear all retry timeouts
   */
  private clearRetryTimeouts(): void {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout))
    this.retryTimeouts.clear()
  }

  /**
   * Force sync now
   */
  async forceSyncNow(): Promise<SyncResult> {
    return this.performSync({ force: true })
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    isOnline: boolean
    syncInProgress: boolean
    pendingOperationsCount: number
    queuedOperationsCount: number
  } {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      pendingOperationsCount: offlineStorage.getPendingOperations().length,
      queuedOperationsCount: this.syncQueue.size
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (typeof window === 'undefined') return

    window.removeEventListener('online', this.handleOnline.bind(this))
    window.removeEventListener('offline', this.handleOffline.bind(this))
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this))

    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.removeEventListener('change', this.handleConnectionChange.bind(this))
    }

    this.clearRetryTimeouts()
    this.listeners.clear()
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const networkManager = new NetworkManager()

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  return networkManager.getNetworkStatus().isOnline
}

/**
 * Wait for network to come online
 */
export function waitForOnline(timeout: number = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isOnline()) {
      resolve()
      return
    }

    const timeoutId = setTimeout(() => {
      unsubscribe()
      reject(new Error('Timeout waiting for network'))
    }, timeout)

    const unsubscribe = networkManager.addListener((status) => {
      if (status.isOnline) {
        clearTimeout(timeoutId)
        unsubscribe()
        resolve()
      }
    })
  })
}

/**
 * Execute operation with offline support
 */
export async function withOfflineSupport<T>(
  operation: () => Promise<T>,
  fallback: () => T,
  pendingOperation?: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>
): Promise<T> {
  try {
    if (isOnline()) {
      return await operation()
    } else {
      // Add to pending operations if provided
      if (pendingOperation) {
        offlineStorage.addPendingOperation(pendingOperation)
      }
      
      return fallback()
    }
  } catch (error) {
    // If operation fails and we have a pending operation, queue it
    if (pendingOperation) {
      offlineStorage.addPendingOperation(pendingOperation)
    }
    
    // Return fallback result
    return fallback()
  }
}