'use client'

/**
 * Error Boundary Component
 * 
 * Implements requirements:
 * - 5.5: 用户友好的错误提示信息
 * - 6.4: 错误恢复和重试机制
 */

import React from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Collapse,
  HStack
} from '@chakra-ui/react'
import { ChatError } from '@/types/chat'
import { createChatError, getErrorBoundaryAction } from '@/utils/error-handling'

// ============================================================================
// Error Boundary State
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  chatError: ChatError | null
}

// ============================================================================
// Error Boundary Props
// ============================================================================

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

interface ErrorFallbackProps {
  error: Error
  errorInfo: React.ErrorInfo
  chatError: ChatError
  resetError: () => void
  retry: () => void
}

// ============================================================================
// Default Error Fallback Component
// ============================================================================

function DefaultErrorFallback({
  error,
  errorInfo,
  chatError,
  resetError,
  retry
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false)
  const { action, message } = getErrorBoundaryAction(chatError)

  const handleAction = () => {
    switch (action) {
      case 'retry':
        retry()
        break
      case 'redirect':
        window.location.href = '/login'
        break
      case 'reload':
        window.location.reload()
        break
      default:
        resetError()
        break
    }
  }

  return (
    <Box
      minH="400px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={8}
    >
      <VStack spacing={6} maxW="600px" textAlign="center">
        {/* Error Icon */}
        <Box fontSize="4xl">😵</Box>

        {/* Error Title */}
        <Heading size="lg" color="red.500">
          出现了一些问题
        </Heading>

        {/* Error Message */}
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>错误信息</AlertTitle>
            <AlertDescription>{chatError.message}</AlertDescription>
          </Box>
        </Alert>

        {/* Action Buttons */}
        <HStack spacing={4}>
          <Button
            colorScheme="blue"
            onClick={handleAction}
            size="lg"
          >
            {message}
          </Button>
          
          {action !== 'retry' && (
            <Button
              variant="outline"
              onClick={retry}
              size="lg"
            >
              重试
            </Button>
          )}
        </HStack>

        {/* Error Details Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '隐藏' : '显示'}技术详情
        </Button>

        {/* Error Details */}
        <Collapse in={showDetails} animateOpacity>
          <VStack spacing={4} align="stretch" w="100%">
            <Box p={4} bg="gray.50" borderRadius="md" textAlign="left">
              <Text fontSize="sm" fontWeight="bold" mb={2}>
                错误类型: {chatError.type}
              </Text>
              <Text fontSize="sm" mb={2}>
                时间: {chatError.timestamp.toLocaleString()}
              </Text>
              <Text fontSize="sm" fontWeight="bold" mb={2}>
                错误消息:
              </Text>
              <Code fontSize="xs" p={2} display="block" whiteSpace="pre-wrap">
                {error.message}
              </Code>
            </Box>

            {process.env.NODE_ENV === 'development' && (
              <Box p={4} bg="red.50" borderRadius="md" textAlign="left">
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  堆栈跟踪 (开发模式):
                </Text>
                <Code fontSize="xs" p={2} display="block" whiteSpace="pre-wrap">
                  {error.stack}
                </Code>
                {errorInfo.componentStack && (
                  <>
                    <Text fontSize="sm" fontWeight="bold" mt={4} mb={2}>
                      组件堆栈:
                    </Text>
                    <Code fontSize="xs" p={2} display="block" whiteSpace="pre-wrap">
                      {errorInfo.componentStack}
                    </Code>
                  </>
                )}
              </Box>
            )}
          </VStack>
        </Collapse>

        {/* Help Text */}
        <Text fontSize="sm" color="gray.600">
          如果问题持续存在，请联系技术支持或刷新页面重试
        </Text>
      </VStack>
    </Box>
  )
}

// ============================================================================
// Error Boundary Class Component
// ============================================================================

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      chatError: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Create ChatError from React error
    const chatError = createChatError(error, '应用程序发生错误')
    
    return {
      hasError: true,
      error,
      chatError
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Update state with error info
    this.setState({
      errorInfo
    })

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }

    // In production, you would send this to your error monitoring service
    // Example: sendErrorToMonitoring(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props
    const { hasError } = this.state

    // Reset error state when resetKeys change
    if (
      hasError &&
      resetOnPropsChange &&
      resetKeys &&
      prevProps.resetKeys &&
      resetKeys.some((key, idx) => key !== prevProps.resetKeys![idx])
    ) {
      this.resetError()
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      chatError: null
    })
  }

  retry = () => {
    // Reset error state and try again
    this.resetError()
    
    // Force re-render after a short delay
    this.resetTimeoutId = window.setTimeout(() => {
      this.forceUpdate()
    }, 100)
  }

  render() {
    const { hasError, error, errorInfo, chatError } = this.state
    const { children, fallback: Fallback = DefaultErrorFallback } = this.props

    if (hasError && error && errorInfo && chatError) {
      return (
        <Fallback
          error={error}
          errorInfo={errorInfo}
          chatError={chatError}
          resetError={this.resetError}
          retry={this.retry}
        />
      )
    }

    return children
  }
}

// ============================================================================
// Hook for Error Boundary
// ============================================================================

export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  // Throw error to trigger error boundary
  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return {
    captureError,
    resetError
  }
}

// ============================================================================
// HOC for Error Boundary
// ============================================================================

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

// ============================================================================
// Chat-specific Error Boundary
// ============================================================================

interface ChatErrorBoundaryProps {
  children: React.ReactNode
  onError?: (error: ChatError) => void
  resetOnSessionChange?: boolean
  sessionId?: string
}

export function ChatErrorBoundary({
  children,
  onError,
  resetOnSessionChange = true,
  sessionId
}: ChatErrorBoundaryProps) {
  const handleError = React.useCallback((error: Error, _errorInfo: React.ErrorInfo) => {
    const chatError = createChatError(error, '聊天功能发生错误')
    
    if (onError) {
      onError(chatError)
    }
  }, [onError])

  return (
    <ErrorBoundary
      onError={handleError}
      resetOnPropsChange={resetOnSessionChange}
      resetKeys={sessionId ? [sessionId] : undefined}
    >
      {children}
    </ErrorBoundary>
  )
}