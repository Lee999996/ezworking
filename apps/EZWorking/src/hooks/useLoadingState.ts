/**
 * Loading State Management Hook
 * 
 * Implements requirements:
 * - 5.4: 会话加载、消息发送的加载动画
 * - 6.1, 6.2: 优化长时间操作的用户反馈
 */

import { useState, useCallback, useRef, useEffect } from 'react'

// ============================================================================
// Types
// ============================================================================

export interface LoadingState {
  isLoading: boolean
  loadingText?: string
  progress?: number
  error?: string | null
}

export interface LoadingStateManager {
  // Current state
  loadingStates: Record<string, LoadingState>
  
  // State management
  setLoading: (key: string, loading: boolean, text?: string) => void
  setProgress: (key: string, progress: number) => void
  setError: (key: string, error: string | null) => void
  clearLoading: (key: string) => void
  clearAllLoading: () => void
  
  // Convenience methods
  isAnyLoading: boolean
  getLoadingState: (key: string) => LoadingState
  
  // Async operation wrapper
  withLoading: <T>(
    key: string,
    operation: () => Promise<T>,
    options?: LoadingOptions
  ) => Promise<T>
}

export interface LoadingOptions {
  loadingText?: string
  successText?: string
  errorText?: string
  showProgress?: boolean
  timeout?: number
  onProgress?: (progress: number) => void
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useLoadingState(): LoadingStateManager {
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({})
  const timeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeouts.current.forEach(timeout => clearTimeout(timeout))
      timeouts.current.clear()
    }
  }, [])

  /**
   * Set loading state for a specific key
   */
  const setLoading = useCallback((key: string, loading: boolean, text?: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: loading,
        loadingText: text || prev[key]?.loadingText,
        error: loading ? null : prev[key]?.error // Clear error when starting loading
      }
    }))

    // Clear any existing timeout for this key
    const existingTimeout = timeouts.current.get(key)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
      timeouts.current.delete(key)
    }
  }, [])

  /**
   * Set progress for a specific key
   */
  const setProgress = useCallback((key: string, progress: number) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        progress: Math.max(0, Math.min(100, progress))
      }
    }))
  }, [])

  /**
   * Set error state for a specific key
   */
  const setError = useCallback((key: string, error: string | null) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        error,
        isLoading: false // Stop loading when error occurs
      }
    }))
  }, [])

  /**
   * Clear loading state for a specific key
   */
  const clearLoading = useCallback((key: string) => {
    setLoadingStates(prev => {
      const newState = { ...prev }
      delete newState[key]
      return newState
    })

    // Clear timeout for this key
    const timeout = timeouts.current.get(key)
    if (timeout) {
      clearTimeout(timeout)
      timeouts.current.delete(key)
    }
  }, [])

  /**
   * Clear all loading states
   */
  const clearAllLoading = useCallback(() => {
    setLoadingStates({})
    
    // Clear all timeouts
    timeouts.current.forEach(timeout => clearTimeout(timeout))
    timeouts.current.clear()
  }, [])

  /**
   * Get loading state for a specific key
   */
  const getLoadingState = useCallback((key: string): LoadingState => {
    return loadingStates[key] || {
      isLoading: false,
      loadingText: undefined,
      progress: undefined,
      error: null
    }
  }, [loadingStates])

  /**
   * Check if any operation is loading
   */
  const isAnyLoading = Object.values(loadingStates).some(state => state.isLoading)

  /**
   * Wrap async operation with loading state management
   */
  const withLoading = useCallback(async <T>(
    key: string,
    operation: () => Promise<T>,
    options: LoadingOptions = {}
  ): Promise<T> => {
    const {
      loadingText = '处理中...',
      successText,
      errorText,
      showProgress = false,
      timeout,
      onProgress
    } = options

    try {
      // Start loading
      setLoading(key, true, loadingText)

      // Set up timeout if specified
      if (timeout) {
        const timeoutId = setTimeout(() => {
          setError(key, '操作超时，请重试')
        }, timeout)
        timeouts.current.set(key, timeoutId)
      }

      // Set up progress tracking if enabled
      if (showProgress && onProgress) {
        const progressInterval = setInterval(() => {
          const currentState = getLoadingState(key)
          if (currentState.isLoading && currentState.progress !== undefined) {
            onProgress(currentState.progress)
          }
        }, 100)

        // Clear interval when done
        setTimeout(() => clearInterval(progressInterval), timeout || 30000)
      }

      // Execute operation
      const result = await operation()

      // Success
      if (successText) {
        setLoadingStates(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            isLoading: false,
            loadingText: successText,
            progress: 100
          }
        }))

        // Auto-clear success message after 2 seconds
        setTimeout(() => clearLoading(key), 2000)
      } else {
        clearLoading(key)
      }

      return result

    } catch (error) {
      // Error handling
      const errorMessage = errorText || 
        (error instanceof Error ? error.message : '操作失败')
      
      setError(key, errorMessage)

      // Auto-clear error after 5 seconds
      setTimeout(() => clearLoading(key), 5000)

      throw error
    }
  }, [setLoading, setError, clearLoading, getLoadingState])

  return {
    // Current state
    loadingStates,
    
    // State management
    setLoading,
    setProgress,
    setError,
    clearLoading,
    clearAllLoading,
    
    // Convenience methods
    isAnyLoading,
    getLoadingState,
    
    // Async operation wrapper
    withLoading
  }
}

// ============================================================================
// Specialized Loading Hooks
// ============================================================================

/**
 * Hook for chat-specific loading states
 */
export function useChatLoadingState() {
  const loadingManager = useLoadingState()

  const chatOperations = {
    sendMessage: (operation: () => Promise<any>) =>
      loadingManager.withLoading('sendMessage', operation, {
        loadingText: '发送消息中...',
        errorText: '消息发送失败'
      }),

    loadMessages: (operation: () => Promise<any>) =>
      loadingManager.withLoading('loadMessages', operation, {
        loadingText: '加载消息中...',
        errorText: '消息加载失败'
      }),

    generateResponse: (operation: () => Promise<any>) =>
      loadingManager.withLoading('generateResponse', operation, {
        loadingText: 'AI思考中...',
        errorText: 'AI回复生成失败',
        timeout: 30000 // 30 second timeout for AI responses
      }),

    createSession: (operation: () => Promise<any>) =>
      loadingManager.withLoading('createSession', operation, {
        loadingText: '创建会话中...',
        successText: '会话创建成功',
        errorText: '会话创建失败'
      }),

    loadSessions: (operation: () => Promise<any>) =>
      loadingManager.withLoading('loadSessions', operation, {
        loadingText: '加载会话列表...',
        errorText: '会话列表加载失败'
      }),

    deleteSession: (operation: () => Promise<any>) =>
      loadingManager.withLoading('deleteSession', operation, {
        loadingText: '删除会话中...',
        successText: '会话删除成功',
        errorText: '会话删除失败'
      })
  }

  return {
    ...loadingManager,
    chatOperations,
    
    // Chat-specific state getters
    isSendingMessage: loadingManager.getLoadingState('sendMessage').isLoading,
    isLoadingMessages: loadingManager.getLoadingState('loadMessages').isLoading,
    isGeneratingResponse: loadingManager.getLoadingState('generateResponse').isLoading,
    isCreatingSession: loadingManager.getLoadingState('createSession').isLoading,
    isLoadingSessions: loadingManager.getLoadingState('loadSessions').isLoading,
    isDeletingSession: loadingManager.getLoadingState('deleteSession').isLoading
  }
}

/**
 * Hook for managing multiple loading states with priorities
 */
export function usePriorityLoadingState() {
  const loadingManager = useLoadingState()
  
  const priorities = useRef<Map<string, number>>(new Map())

  const setLoadingWithPriority = useCallback((
    key: string, 
    loading: boolean, 
    text?: string, 
    priority: number = 0
  ) => {
    priorities.current.set(key, priority)
    loadingManager.setLoading(key, loading, text)
  }, [loadingManager])

  const getHighestPriorityLoading = useCallback((): LoadingState | null => {
    const loadingEntries = Object.entries(loadingManager.loadingStates)
      .filter(([_, state]) => state.isLoading)
      .map(([key, state]) => ({
        key,
        state,
        priority: priorities.current.get(key) || 0
      }))
      .sort((a, b) => b.priority - a.priority)

    return loadingEntries.length > 0 ? loadingEntries[0].state : null
  }, [loadingManager.loadingStates])

  return {
    ...loadingManager,
    setLoadingWithPriority,
    getHighestPriorityLoading,
    highestPriorityLoading: getHighestPriorityLoading()
  }
}