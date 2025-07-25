'use client'

/**
 * Global Error Context and Provider
 * 
 * Implements requirements:
 * - 4.5: 网络错误、数据库错误的统一处理
 * - 5.5: 用户友好的错误提示信息
 * - 6.4: 错误恢复和重试机制
 */

import React, { createContext, useContext, useCallback, useState, useRef } from 'react'
import { ChatError, ChatErrorType } from '@/types/chat'
import { 
  createChatError, 
  logError, 
  createErrorContext,
  retryWithBackoff,
  recoverFromNetworkError,
  recoverFromDatabaseError
} from '@/utils/error-handling'

// ============================================================================
// Types
// ============================================================================

interface ErrorContextValue {
  // Current errors
  errors: ChatError[]
  
  // Error management
  addError: (error: any, context?: any, customMessage?: string) => ChatError
  removeError: (errorId: string) => void
  clearErrors: () => void
  
  // Error recovery
  retryOperation: <T>(
    operation: () => Promise<T>,
    context?: any,
    onRetry?: (attempt: number, error: any) => void
  ) => Promise<T>
  
  // Network status
  isOnline: boolean
  checkConnectivity: () => Promise<boolean>
  
  // Global error handlers
  handleNetworkError: (error: any, context?: any) => ChatError
  handleDatabaseError: (error: any, context?: any) => ChatError
  handleAuthError: (error: any, context?: any) => ChatError
  handleAIError: (error: any, context?: any) => ChatError
}

// ============================================================================
// Context
// ============================================================================

const ErrorContext = createContext<ErrorContextValue | null>(null)

export function useErrorHandler() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useErrorHandler must be used within an ErrorProvider')
  }
  return context
}

// ============================================================================
// Provider Component
// ============================================================================

interface ErrorProviderProps {
  children: React.ReactNode
  maxErrors?: number
}

export function ErrorProvider({ 
  children, 
  maxErrors = 10 
}: ErrorProviderProps) {
  const [errors, setErrors] = useState<ChatError[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const errorIdCounter = useRef(0)

  // ============================================================================
  // Error Management
  // ============================================================================

  /**
   * Add error to global error state
   */
  const addError = useCallback((
    error: any, 
    context?: any, 
    customMessage?: string
  ): ChatError => {
    const chatError = createChatError(error, customMessage)
    const errorWithId = {
      ...chatError,
      id: `error_${++errorIdCounter.current}_${Date.now()}`
    } as ChatError & { id: string }

    // Log error for monitoring
    logError(chatError, context)

    // Add to error state (keep only recent errors)
    setErrors(prev => {
      const newErrors = [errorWithId, ...prev].slice(0, maxErrors)
      return newErrors
    })

    return chatError
  }, [maxErrors])

  /**
   * Remove specific error
   */
  const removeError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(error => (error as any).id !== errorId))
  }, [])

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  // ============================================================================
  // Error Recovery
  // ============================================================================

  /**
   * Retry operation with error handling
   */
  const retryOperation = useCallback(async function<T>(
    operation: () => Promise<T>,
    context?: any,
    onRetry?: (attempt: number, error: any) => void
  ): Promise<T> {
    try {
      return await retryWithBackoff(
        operation,
        {
          maxRetries: 3,
          retryDelay: 1000,
          backoffMultiplier: 2,
          maxRetryDelay: 10000
        },
        (attempt, error) => {
          // Log retry attempt
          console.log(`Retry attempt ${attempt} for operation:`, context)
          
          // Call custom retry handler
          if (onRetry) {
            onRetry(attempt, error)
          }
        }
      )
    } catch (error) {
      // Add error to global state if retry fails
      addError(error, context)
      throw error
    }
  }, [addError])

  /**
   * Check network connectivity
   */
  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      const isConnected = await recoverFromNetworkError()
      setIsOnline(isConnected)
      return isConnected
    } catch {
      setIsOnline(false)
      return false
    }
  }, [])

  // ============================================================================
  // Specialized Error Handlers
  // ============================================================================

  /**
   * Handle network errors with recovery
   */
  const handleNetworkError = useCallback((error: any, context?: any): ChatError => {
    const chatError = createChatError(error, undefined, ChatErrorType.NETWORK_ERROR)
    
    // Update online status
    setIsOnline(false)
    
    // Try to recover connectivity in background
    checkConnectivity()
    
    // Add to error state
    return addError(error, {
      ...context,
      operation: 'network_operation',
      recovery: 'connectivity_check_initiated'
    }, '网络连接失败，正在尝试重新连接...')
  }, [addError, checkConnectivity])

  /**
   * Handle database errors with recovery
   */
  const handleDatabaseError = useCallback((error: any, context?: any): ChatError => {
    const chatError = createChatError(error, undefined, ChatErrorType.DATABASE_ERROR)
    
    // Try database recovery in background
    recoverFromDatabaseError().then(recovered => {
      if (recovered) {
        console.log('Database connectivity recovered')
      }
    })
    
    return addError(error, {
      ...context,
      operation: 'database_operation',
      recovery: 'database_check_initiated'
    }, '数据库操作失败，请稍后重试')
  }, [addError])

  /**
   * Handle authentication errors
   */
  const handleAuthError = useCallback((error: any, context?: any): ChatError => {
    return addError(error, {
      ...context,
      operation: 'auth_operation'
    }, '认证失败，请重新登录')
  }, [addError])

  /**
   * Handle AI service errors
   */
  const handleAIError = useCallback((error: any, context?: any): ChatError => {
    return addError(error, {
      ...context,
      operation: 'ai_operation'
    }, 'AI服务暂时不可用，请稍后重试')
  }, [addError])

  // ============================================================================
  // Network Status Monitoring
  // ============================================================================

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setIsOnline(true)
      console.log('Network connectivity restored')
    }

    const handleOffline = () => {
      setIsOnline(false)
      addError(
        new Error('Network connection lost'),
        createErrorContext('network_status_change'),
        '网络连接已断开'
      )
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial connectivity check
    checkConnectivity()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [addError, checkConnectivity])

  // ============================================================================
  // Context Value
  // ============================================================================

  const contextValue: ErrorContextValue = {
    // Current errors
    errors,
    
    // Error management
    addError,
    removeError,
    clearErrors,
    
    // Error recovery
    retryOperation,
    
    // Network status
    isOnline,
    checkConnectivity,
    
    // Global error handlers
    handleNetworkError,
    handleDatabaseError,
    handleAuthError,
    handleAIError
  }

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  )
}

// ============================================================================
// Hook for Specific Error Types
// ============================================================================

/**
 * Hook for handling specific types of errors
 */
export function useSpecificErrorHandler() {
  const { 
    handleNetworkError, 
    handleDatabaseError, 
    handleAuthError, 
    handleAIError,
    retryOperation
  } = useErrorHandler()

  return {
    // Specific handlers
    handleNetworkError,
    handleDatabaseError,
    handleAuthError,
    handleAIError,
    
    // Convenience methods
    withErrorHandling: function<T>(
      operation: () => Promise<T>,
      errorType: 'network' | 'database' | 'auth' | 'ai',
      context?: any
    ) {
      return retryOperation(async () => {
        try {
          return await operation()
        } catch (error) {
          switch (errorType) {
            case 'network':
              handleNetworkError(error, context)
              break
            case 'database':
              handleDatabaseError(error, context)
              break
            case 'auth':
              handleAuthError(error, context)
              break
            case 'ai':
              handleAIError(error, context)
              break
          }
          throw error
        }
      }, context)
    }
  }
}