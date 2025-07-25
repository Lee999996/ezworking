/**
 * Global Error Handling Utilities
 * 
 * Implements requirements:
 * - 4.5: 网络错误、数据库错误的统一处理
 * - 5.5: 用户友好的错误提示信息
 * - 6.4: 错误恢复和重试机制
 */

import { ChatError, ChatErrorType, RetryConfig } from '@/types/chat'

// ============================================================================
// Error Classification and Mapping
// ============================================================================

/**
 * Map common error patterns to ChatErrorType
 */
export function classifyError(error: any): ChatErrorType {
  if (!error) return ChatErrorType.UNKNOWN_ERROR

  const errorMessage = error.message?.toLowerCase() || ''
  const errorCode = error.code || error.status

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection') ||
    errorCode === 'NETWORK_ERROR'
  ) {
    return ChatErrorType.NETWORK_ERROR
  }

  // Timeout errors
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('aborted') ||
    errorCode === 'TIMEOUT'
  ) {
    return ChatErrorType.REQUEST_TIMEOUT
  }

  // Authentication errors
  if (
    errorCode === 401 ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('authentication')
  ) {
    return ChatErrorType.UNAUTHORIZED
  }

  // Permission errors
  if (
    errorCode === 403 ||
    errorMessage.includes('forbidden') ||
    errorMessage.includes('permission')
  ) {
    return ChatErrorType.FORBIDDEN
  }

  // Session errors
  if (
    errorCode === 404 ||
    errorMessage.includes('session not found') ||
    errorMessage.includes('invalid session')
  ) {
    return ChatErrorType.SESSION_NOT_FOUND
  }

  // Database errors
  if (
    errorMessage.includes('database') ||
    errorMessage.includes('supabase') ||
    errorMessage.includes('sql') ||
    errorCode === 'DATABASE_ERROR'
  ) {
    return ChatErrorType.DATABASE_ERROR
  }

  // Server errors
  if (
    errorCode >= 500 ||
    errorMessage.includes('server error') ||
    errorMessage.includes('internal error')
  ) {
    return ChatErrorType.SERVER_ERROR
  }

  // AI service errors
  if (
    errorMessage.includes('ai') ||
    errorMessage.includes('response generation') ||
    errorMessage.includes('model')
  ) {
    return ChatErrorType.AI_RESPONSE_FAILED
  }

  // Validation errors
  if (
    errorCode === 400 ||
    errorMessage.includes('validation') ||
    errorMessage.includes('invalid input')
  ) {
    return ChatErrorType.VALIDATION_FAILED
  }

  return ChatErrorType.UNKNOWN_ERROR
}

/**
 * Create standardized ChatError from any error
 */
export function createChatError(
  error: any,
  customMessage?: string,
  customType?: ChatErrorType
): ChatError {
  const errorType = customType || classifyError(error)
  const baseMessage = getErrorMessage(errorType)
  const finalMessage = customMessage || baseMessage

  return {
    type: errorType,
    message: finalMessage,
    details: error,
    timestamp: new Date(),
    retryable: isRetryableError(errorType)
  }
}

/**
 * Get user-friendly error messages
 */
export function getErrorMessage(errorType: ChatErrorType): string {
  const errorMessages: Record<ChatErrorType, string> = {
    // Authentication Errors
    [ChatErrorType.UNAUTHORIZED]: '请先登录后再使用聊天功能',
    [ChatErrorType.FORBIDDEN]: '您没有权限执行此操作',
    
    // Session Errors
    [ChatErrorType.SESSION_NOT_FOUND]: '会话不存在或已被删除',
    [ChatErrorType.SESSION_ACCESS_DENIED]: '您没有权限访问此会话',
    [ChatErrorType.INVALID_SESSION_ID]: '会话ID格式无效',
    
    // Message Errors
    [ChatErrorType.MESSAGE_TOO_LONG]: '消息内容过长，请缩短后重试',
    [ChatErrorType.MESSAGE_EMPTY]: '消息内容不能为空',
    [ChatErrorType.MESSAGE_SAVE_FAILED]: '消息保存失败，请重试',
    
    // Network Errors
    [ChatErrorType.NETWORK_ERROR]: '网络连接失败，请检查网络后重试',
    [ChatErrorType.REQUEST_TIMEOUT]: '请求超时，请重试',
    [ChatErrorType.SERVER_ERROR]: '服务器暂时不可用，请稍后重试',
    
    // Database Errors
    [ChatErrorType.DATABASE_ERROR]: '数据库操作失败，请重试',
    [ChatErrorType.CONNECTION_FAILED]: '连接失败，请检查网络',
    
    // AI Service Errors
    [ChatErrorType.AI_SERVICE_UNAVAILABLE]: 'AI服务暂时不可用，请稍后重试',
    [ChatErrorType.AI_RESPONSE_FAILED]: 'AI回复生成失败，请重试',
    
    // Validation Errors
    [ChatErrorType.INVALID_INPUT]: '输入内容格式不正确',
    [ChatErrorType.VALIDATION_FAILED]: '数据验证失败，请检查输入',
    
    // General Errors
    [ChatErrorType.UNKNOWN_ERROR]: '发生未知错误，请重试'
  }

  return errorMessages[errorType] || errorMessages[ChatErrorType.UNKNOWN_ERROR]
}

/**
 * Check if error type is retryable
 */
export function isRetryableError(errorType: ChatErrorType): boolean {
  const retryableErrors = [
    ChatErrorType.NETWORK_ERROR,
    ChatErrorType.REQUEST_TIMEOUT,
    ChatErrorType.SERVER_ERROR,
    ChatErrorType.DATABASE_ERROR,
    ChatErrorType.CONNECTION_FAILED,
    ChatErrorType.AI_SERVICE_UNAVAILABLE,
    ChatErrorType.AI_RESPONSE_FAILED,
    ChatErrorType.MESSAGE_SAVE_FAILED
  ]

  return retryableErrors.includes(errorType)
}

// ============================================================================
// Retry Logic
// ============================================================================

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  backoffMultiplier: 2,
  maxRetryDelay: 10000 // 10 seconds
}

/**
 * Calculate retry delay with exponential backoff
 */
export function calculateRetryDelay(
  attempt: number,
  config: Partial<RetryConfig> = {}
): number {
  const { retryDelay, backoffMultiplier, maxRetryDelay } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config
  }

  const delay = retryDelay * Math.pow(backoffMultiplier, attempt - 1)
  return Math.min(delay, maxRetryDelay)
}

/**
 * Generic retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  onRetry?: (attempt: number, error: any) => void
): Promise<T> {
  const { maxRetries } = { ...DEFAULT_RETRY_CONFIG, ...config }
  
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Don't retry if it's not a retryable error
      const errorType = classifyError(error)
      if (!isRetryableError(errorType)) {
        throw error
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break
      }
      
      // Calculate delay and wait
      const delay = calculateRetryDelay(attempt, config)
      
      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, error)
      }
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

// ============================================================================
// Error Recovery Strategies
// ============================================================================

/**
 * Network error recovery
 */
export async function recoverFromNetworkError(): Promise<boolean> {
  try {
    // Simple connectivity check
    const response = await fetch('/api/health', {
      method: 'HEAD',
      cache: 'no-cache'
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Session error recovery
 */
export async function recoverFromSessionError(
  sessionId: string,
  userId: string,
  createNewSession: () => Promise<string>
): Promise<string> {
  try {
    // Try to verify session exists
    const response = await fetch(`/api/sessions/${sessionId}`, {
      method: 'HEAD'
    })
    
    if (response.ok) {
      return sessionId // Session exists, use it
    }
  } catch {
    // Session doesn't exist or network error
  }
  
  // Create new session as fallback
  return await createNewSession()
}

/**
 * Database error recovery
 */
export async function recoverFromDatabaseError(): Promise<boolean> {
  try {
    // Check database connectivity
    const response = await fetch('/api/db/health', {
      method: 'HEAD',
      cache: 'no-cache'
    })
    return response.ok
  } catch {
    return false
  }
}

// ============================================================================
// Error Logging and Monitoring
// ============================================================================

/**
 * Log error for monitoring and debugging
 */
export function logError(error: ChatError, context?: any): void {
  const logData = {
    type: error.type,
    message: error.message,
    timestamp: error.timestamp,
    retryable: error.retryable,
    context,
    details: error.details,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined
  }

  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.error('Chat Error:', logData)
  }

  // In production, you would send this to your monitoring service
  // Example: sendToMonitoring(logData)
}

/**
 * Create error context for better debugging
 */
export function createErrorContext(
  operation: string,
  params?: any,
  userId?: string
): any {
  return {
    operation,
    params,
    userId,
    timestamp: new Date().toISOString(),
    sessionId: typeof window !== 'undefined' ? window.sessionStorage.getItem('currentSessionId') : undefined
  }
}

// ============================================================================
// Error Boundary Helpers
// ============================================================================

/**
 * Check if error should trigger error boundary
 */
export function shouldTriggerErrorBoundary(error: ChatError): boolean {
  const criticalErrors = [
    ChatErrorType.UNAUTHORIZED,
    ChatErrorType.FORBIDDEN,
    ChatErrorType.UNKNOWN_ERROR
  ]
  
  return criticalErrors.includes(error.type)
}

/**
 * Get recovery action for error boundary
 */
export function getErrorBoundaryAction(error: ChatError): {
  action: 'retry' | 'redirect' | 'reload' | 'none'
  message: string
} {
  switch (error.type) {
    case ChatErrorType.UNAUTHORIZED:
      return {
        action: 'redirect',
        message: '请重新登录'
      }
    
    case ChatErrorType.NETWORK_ERROR:
    case ChatErrorType.SERVER_ERROR:
      return {
        action: 'retry',
        message: '重试'
      }
    
    case ChatErrorType.UNKNOWN_ERROR:
      return {
        action: 'reload',
        message: '刷新页面'
      }
    
    default:
      return {
        action: 'none',
        message: '确定'
      }
  }
}