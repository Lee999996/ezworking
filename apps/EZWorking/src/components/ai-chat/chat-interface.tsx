'use client'

import React, { useEffect, useRef } from 'react'
import {
  Box,
  VStack,
} from '@chakra-ui/react'
import { MessageBubble } from './message-bubble'
import { ChatInput } from './chat-input'
import { ErrorNotification, NetworkStatus } from '../error/error-notification'
import { 
  TypingIndicator, 
  MessageSkeleton, 
  LoadingOverlay
} from '../loading/loading-animations'
import { useErrorHandler } from '@/contexts/error-context'
import { useChatLoadingState } from '@/hooks/useLoadingState'
import type { ChatMessage, ChatError } from '@/types/chat'

interface AIChatInterfaceProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  onRetryMessage?: (messageId: string) => void
  isLoading?: boolean
  userId?: string
  error?: ChatError | null
  onClearError?: () => void
  isLoadingMessages?: boolean
  isGeneratingResponse?: boolean
}

/**
 * AI Chat Interface Component
 * 
 * Requirements implemented:
 * - 3.1: 优化消息列表显示和自动滚动
 * - 3.2: 实现消息状态指示器(发送中、已发送、失败)
 * - 3.3: 添加重试按钮和错误处理UI
 * - 5.3: 消息状态指示器显示
 */
export function AIChatInterface({
  messages,
  onSendMessage,
  onRetryMessage,
  isLoading = false,
  error,
  onClearError,
  isLoadingMessages = false,
  isGeneratingResponse = false,
}: AIChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const { isOnline, checkConnectivity } = useErrorHandler()
  const { isSendingMessage } = useChatLoadingState()

  /**
   * Auto-scroll to bottom when new messages arrive (scroll-based, no pagination)
   * Requirement 3.1: 优化消息列表显示和自动滚动
   */
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current && messagesContainerRef.current) {
        // Check if user is near the bottom before auto-scrolling
        const container = messagesContainerRef.current
        const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100
        
        // Only auto-scroll if user is near the bottom (to avoid interrupting reading)
        if (isNearBottom || messages.length <= 1) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end'
          })
        }
      }
    }

    // Small delay to ensure DOM is updated
    const timer = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timer)
  }, [messages])

  /**
   * Handle message sending
   * Requirement 3.1: 消息发送功能
   */
  const handleSendMessage = (message: string) => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
    }
  }

  /**
   * Handle message retry
   * Requirement 3.3: 添加重试按钮和错误处理UI
   */
  const handleRetryMessage = (messageId: string) => {
    if (onRetryMessage) {
      onRetryMessage(messageId)
    }
  }

  return (
    <Box 
      position="relative" 
      h="100%" 
      w="100%" 
      bg="white"
      display="flex"
      flexDirection="column"
    >
      {/* Loading Overlay for initial message loading */}
      <LoadingOverlay 
        isVisible={isLoadingMessages && messages.length === 0}
        text="加载消息中..."
      />

      {/* Messages Area - scrollable with smooth scrolling for all messages */}
      <Box 
        ref={messagesContainerRef}
        flex="1"
        overflowY="auto" 
        p={4}
        pb="120px" // Leave space for floating input at bottom
        css={{
          // Smooth scrolling behavior
          scrollBehavior: 'smooth',
          // Custom scrollbar styling
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a8a8a8',
          },
        }}
      >
        <VStack spacing={4} align="stretch">
          {/* Network Status Indicator */}
          <NetworkStatus 
            isOnline={isOnline} 
            onRetryConnection={checkConnectivity}
          />

          {/* Error Notification */}
          {error && (
            <ErrorNotification
              error={error}
              onRetry={error.retryable ? () => {
                // Retry the last failed operation
                if (onRetryMessage && messages.length > 0) {
                  const lastMessage = messages[messages.length - 1]
                  if (lastMessage.status === 'failed') {
                    onRetryMessage(lastMessage.id)
                  }
                }
                onClearError?.()
              } : undefined}
              onDismiss={onClearError}
              showDetails={false}
            />
          )}

          {/* Show skeleton loading for initial messages */}
          {isLoadingMessages && messages.length === 0 ? (
            <>
              <MessageSkeleton isUser={false} />
              <MessageSkeleton isUser={true} />
              <MessageSkeleton isUser={false} />
            </>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onRetry={handleRetryMessage}
                showTimestamp={true}
                showStatus={true}
              />
            ))
          )}

          {/* AI Typing Indicator */}
          {(isGeneratingResponse || isLoading) && (
            <Box alignSelf="flex-start" maxW="70%">
              <Box
                bg="gray.50"
                borderRadius="lg"
                p={3}
                position="relative"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: '10px',
                  left: '-8px',
                  width: 0,
                  height: 0,
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  borderRight: '8px solid',
                  borderRightColor: 'gray.50'
                }}
              >
                <TypingIndicator size="md" />
              </Box>
            </Box>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      {/* Fixed Input Area at bottom */}
      <Box
        position="absolute"
        bottom="1.5rem"
        left="1.5rem"
        right="1.5rem"
        zIndex={10}
      >
        <ChatInput
          onSubmit={handleSendMessage}
          disabled={isLoading || isSendingMessage || isGeneratingResponse}
          placeholder={
            isSendingMessage 
              ? "发送中..." 
              : isGeneratingResponse 
                ? "AI思考中..." 
                : "输入消息..."
          }
          maxLength={10000}
          isLoading={isSendingMessage}
        />
      </Box>
    </Box>
  )
}