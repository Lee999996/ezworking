'use client'

/**
 * Error Notification Components
 * 
 * Implements requirements:
 * - 5.5: 用户友好的错误提示信息
 * - 6.4: 错误恢复和重试机制
 */

import React from 'react'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Button,
  HStack,
  VStack,
  CloseButton,
  useToast,
  Collapse,
  Text,
  Badge
} from '@chakra-ui/react'
import { ChatError, ChatErrorType } from '@/types/chat'
import { isRetryableError, getErrorBoundaryAction } from '@/utils/error-handling'

// ============================================================================
// Error Notification Component
// ============================================================================

interface ErrorNotificationProps {
  error: ChatError & { id?: string }
  onRetry?: () => void
  onDismiss?: () => void
  showDetails?: boolean
  compact?: boolean
}

export function ErrorNotification({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  compact = false
}: ErrorNotificationProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  
  const getAlertStatus = (errorType: ChatErrorType) => {
    switch (errorType) {
      case ChatErrorType.UNAUTHORIZED:
      case ChatErrorType.FORBIDDEN:
        return 'warning'
      case ChatErrorType.NETWORK_ERROR:
      case ChatErrorType.REQUEST_TIMEOUT:
        return 'info'
      case ChatErrorType.SERVER_ERROR:
      case ChatErrorType.DATABASE_ERROR:
      case ChatErrorType.AI_RESPONSE_FAILED:
        return 'error'
      default:
        return 'warning'
    }
  }

  const getErrorIcon = (errorType: ChatErrorType) => {
    switch (errorType) {
      case ChatErrorType.NETWORK_ERROR:
        return '🌐'
      case ChatErrorType.DATABASE_ERROR:
        return '💾'
      case ChatErrorType.AI_RESPONSE_FAILED:
        return '🤖'
      case ChatErrorType.UNAUTHORIZED:
        return '🔒'
      case ChatErrorType.SESSION_NOT_FOUND:
        return '📝'
      default:
        return '⚠️'
    }
  }

  const canRetry = isRetryableError(error.type) && onRetry

  if (compact) {
    return (
      <Alert status={getAlertStatus(error.type)} size="sm" borderRadius="md">
        <AlertIcon />
        <Box flex="1">
          <Text fontSize="sm">{error.message}</Text>
        </Box>
        {canRetry && (
          <Button size="xs" variant="outline" onClick={onRetry} ml={2}>
            重试
          </Button>
        )}
        {onDismiss && (
          <CloseButton size="sm" onClick={onDismiss} ml={2} />
        )}
      </Alert>
    )
  }

  return (
    <Alert
      status={getAlertStatus(error.type)}
      variant="subtle"
      flexDirection="column"
      alignItems="flex-start"
      borderRadius="md"
      p={4}
    >
      <HStack w="100%" justify="space-between" align="flex-start">
        <HStack align="flex-start" flex="1">
          <AlertIcon />
          <VStack align="flex-start" spacing={1} flex="1">
            <HStack>
              <AlertTitle fontSize="md">
                {getErrorIcon(error.type)} 操作失败
              </AlertTitle>
              <Badge colorScheme={getAlertStatus(error.type)} size="sm">
                {error.type}
              </Badge>
            </HStack>
            <AlertDescription fontSize="sm" color="gray.600">
              {error.message}
            </AlertDescription>
            {error.retryable && (
              <Text fontSize="xs" color="gray.500">
                此错误可以重试
              </Text>
            )}
          </VStack>
        </HStack>
        
        <HStack>
          {showDetails && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '隐藏详情' : '显示详情'}
            </Button>
          )}
          {canRetry && (
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={onRetry}
            >
              重试
            </Button>
          )}
          {onDismiss && (
            <CloseButton onClick={onDismiss} />
          )}
        </HStack>
      </HStack>

      {/* Error Details */}
      <Collapse in={isExpanded} animateOpacity>
        <Box mt={3} p={3} bg="gray.50" borderRadius="md" w="100%">
          <VStack align="flex-start" spacing={2}>
            <Text fontSize="xs" fontWeight="bold">错误详情:</Text>
            <Text fontSize="xs" fontFamily="mono" color="gray.600">
              类型: {error.type}
            </Text>
            <Text fontSize="xs" fontFamily="mono" color="gray.600">
              时间: {error.timestamp.toLocaleString()}
            </Text>
            {error.details && (
              <Text fontSize="xs" fontFamily="mono" color="gray.600">
                详情: {JSON.stringify(error.details, null, 2)}
              </Text>
            )}
          </VStack>
        </Box>
      </Collapse>
    </Alert>
  )
}

// ============================================================================
// Error Toast Hook
// ============================================================================

export function useErrorToast() {
  const toast = useToast()

  const showErrorToast = React.useCallback((
    error: ChatError,
    onRetry?: () => void
  ) => {
    const canRetry = isRetryableError(error.type) && onRetry

    toast({
      title: '操作失败',
      description: error.message,
      status: 'error',
      duration: canRetry ? 8000 : 5000,
      isClosable: true,
      position: 'top-right',
      render: ({ onClose }) => (
        <ErrorNotification
          error={error}
          onRetry={canRetry ? () => {
            onRetry()
            onClose()
          } : undefined}
          onDismiss={onClose}
          compact
        />
      )
    })
  }, [toast])

  const showSuccessToast = React.useCallback((message: string) => {
    toast({
      title: '操作成功',
      description: message,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right'
    })
  }, [toast])

  const showWarningToast = React.useCallback((message: string) => {
    toast({
      title: '注意',
      description: message,
      status: 'warning',
      duration: 5000,
      isClosable: true,
      position: 'top-right'
    })
  }, [toast])

  return {
    showErrorToast,
    showSuccessToast,
    showWarningToast
  }
}

// ============================================================================
// Error List Component
// ============================================================================

interface ErrorListProps {
  errors: (ChatError & { id?: string })[]
  onRetry?: (errorId: string) => void
  onDismiss?: (errorId: string) => void
  onClearAll?: () => void
  maxVisible?: number
}

export function ErrorList({
  errors,
  onRetry,
  onDismiss,
  onClearAll,
  maxVisible = 5
}: ErrorListProps) {
  const visibleErrors = errors.slice(0, maxVisible)
  const hiddenCount = errors.length - maxVisible

  if (errors.length === 0) {
    return null
  }

  return (
    <VStack spacing={3} align="stretch">
      {/* Clear All Button */}
      {errors.length > 1 && onClearAll && (
        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.600">
            {errors.length} 个错误
          </Text>
          <Button size="sm" variant="ghost" onClick={onClearAll}>
            清除所有
          </Button>
        </HStack>
      )}

      {/* Error Items */}
      {visibleErrors.map((error) => (
        <ErrorNotification
          key={error.id || error.timestamp.getTime()}
          error={error}
          onRetry={onRetry ? () => onRetry(error.id || '') : undefined}
          onDismiss={onDismiss ? () => onDismiss(error.id || '') : undefined}
          showDetails
        />
      ))}

      {/* Hidden Errors Indicator */}
      {hiddenCount > 0 && (
        <Alert status="info" size="sm">
          <AlertIcon />
          <Text fontSize="sm">
            还有 {hiddenCount} 个错误未显示
          </Text>
        </Alert>
      )}
    </VStack>
  )
}

// ============================================================================
// Network Status Indicator
// ============================================================================

interface NetworkStatusProps {
  isOnline: boolean
  onRetryConnection?: () => void
}

export function NetworkStatus({ isOnline, onRetryConnection }: NetworkStatusProps) {
  if (isOnline) {
    return null
  }

  return (
    <Alert status="warning" size="sm">
      <AlertIcon />
      <Box flex="1">
        <Text fontSize="sm">网络连接已断开</Text>
      </Box>
      {onRetryConnection && (
        <Button size="xs" variant="outline" onClick={onRetryConnection}>
          重新连接
        </Button>
      )}
    </Alert>
  )
}