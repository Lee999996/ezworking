'use client'

import React from 'react'
import {
  Avatar,
  Box,
  Card,
  CardBody,
  HStack,
  IconButton,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { 
  FiMessageCircle, 
  FiUser, 
  FiCheck, 
  FiClock, 
  FiAlertCircle, 
  FiRefreshCw 
} from 'react-icons/fi'
import type { ChatMessage } from '@/types/chat'

interface MessageBubbleProps {
  message: ChatMessage
  onRetry?: (messageId: string) => void
  showTimestamp?: boolean
  showStatus?: boolean
}

/**
 * Message Bubble Component
 * 
 * Requirements implemented:
 * - 3.1: 实现用户消息和AI消息的差异化显示
 * - 3.2: 添加消息时间戳和状态显示
 * - 3.3: 支持消息重试和错误状态展示
 * - 5.3: 消息状态指示器显示
 */
export function MessageBubble({
  message,
  onRetry,
  showTimestamp = true,
  showStatus = true,
}: MessageBubbleProps) {
  const messageBg = useColorModeValue('gray.50', 'gray.800')
  const userMessageBg = useColorModeValue('blue.500', 'blue.600')
  const isUser = message.type === 'user'

  /**
   * Get status icon based on message status
   * Requirement 3.2: 消息状态指示器
   */
  const getStatusIcon = () => {
    if (!isUser || !message.status || !showStatus) return null
    
    switch (message.status) {
      case 'sending':
        return <FiClock size={12} color="rgba(255,255,255,0.7)" />
      case 'sent':
        return <FiCheck size={12} color="rgba(255,255,255,0.7)" />
      case 'failed':
        return <FiAlertCircle size={12} color="rgba(255,255,255,0.9)" />
      default:
        return null
    }
  }

  /**
   * Get status text based on message status
   * Requirement 3.2: 消息状态显示
   */
  const getStatusText = () => {
    if (!isUser || !message.status || !showStatus) return null
    
    switch (message.status) {
      case 'sending':
        return '发送中...'
      case 'sent':
        return '已发送'
      case 'failed':
        return `发送失败${message.retryCount ? ` (重试 ${message.retryCount}/3)` : ''}`
      default:
        return null
    }
  }

  /**
   * Format timestamp for display
   * Requirement 3.2: 添加消息时间戳显示
   */
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    
    return timestamp.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Handle retry button click
   * Requirement 3.3: 支持消息重试
   */
  const handleRetry = () => {
    if (onRetry && message.status === 'failed') {
      onRetry(message.id)
    }
  }

  /**
   * Render loading animation for AI messages
   */
  const renderLoadingContent = () => (
    <HStack spacing={1}>
      <Box
        w={2}
        h={2}
        bg="gray.400"
        borderRadius="full"
        animation="pulse 1.5s ease-in-out infinite"
      />
      <Box
        w={2}
        h={2}
        bg="gray.400"
        borderRadius="full"
        animation="pulse 1.5s ease-in-out infinite 0.2s"
      />
      <Box
        w={2}
        h={2}
        bg="gray.400"
        borderRadius="full"
        animation="pulse 1.5s ease-in-out infinite 0.4s"
      />
    </HStack>
  )

  return (
    <HStack
      spacing={3}
      justify={isUser ? 'flex-end' : 'flex-start'}
      align="flex-start"
      w="100%"
    >
      {/* AI Avatar - left side */}
      {!isUser && (
        <Avatar 
          size="sm" 
          icon={<FiMessageCircle />} 
          bg="blue.500"
          color="white"
        />
      )}

      <VStack 
        spacing={1} 
        align={isUser ? 'flex-end' : 'flex-start'}
        maxW="70%"
      >
        {/* Message Card */}
        <Card
          bg={isUser ? userMessageBg : messageBg}
          color={isUser ? 'white' : 'inherit'}
          borderRadius="lg"
          opacity={message.status === 'failed' ? 0.8 : 1}
          boxShadow="sm"
          _hover={{
            boxShadow: 'md',
          }}
          transition="all 0.2s"
        >
          <CardBody py={3} px={4}>
            {/* Message Content */}
            {message.content ? (
              <Text fontSize="sm" whiteSpace="pre-wrap" lineHeight="1.5">
                {message.content}
              </Text>
            ) : (
              // Show loading animation for empty AI messages
              !isUser && renderLoadingContent()
            )}
          </CardBody>
        </Card>

        {/* Message Metadata */}
        <HStack spacing={2} fontSize="xs" color="gray.500">
          {/* Timestamp */}
          {showTimestamp && (
            <Text>
              {formatTimestamp(message.timestamp)}
            </Text>
          )}

          {/* Status indicator for user messages */}
          {isUser && message.status && showStatus && (
            <>
              <Text>•</Text>
              <HStack spacing={1}>
                {getStatusIcon()}
                <Text>{getStatusText()}</Text>
                {/* Retry button for failed messages */}
                {message.status === 'failed' && onRetry && (
                  <IconButton
                    aria-label="重试发送"
                    icon={<FiRefreshCw size={10} />}
                    size="xs"
                    variant="ghost"
                    colorScheme="gray"
                    onClick={handleRetry}
                    ml={1}
                    _hover={{
                      bg: 'gray.100',
                    }}
                  />
                )}
              </HStack>
            </>
          )}
        </HStack>
      </VStack>

      {/* User Avatar - right side */}
      {isUser && (
        <Avatar 
          size="sm" 
          icon={<FiUser />} 
          bg="gray.500"
          color="white"
        />
      )}
    </HStack>
  )
}