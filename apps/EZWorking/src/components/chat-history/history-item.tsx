'use client'

import React from 'react'
import {
  Box,
  Text,
  HStack,
  IconButton,
  Spinner,
  useColorModeValue,
  Tooltip
} from '@chakra-ui/react'
import { FiTrash2, FiMessageCircle } from 'react-icons/fi'
import type { ChatSessionSummary } from '@/types/chat'

interface HistoryItemProps {
  session: ChatSessionSummary
  isActive: boolean
  isSwitching?: boolean
  onClick: () => void
  onDelete: () => void
}

/**
 * History Item Component for Chat Sessions
 * Implements requirements: 5.1, 5.2 - 会话项显示和交互
 * 
 * Auth Integration (Task 3.3):
 * - 显示会话信息和状态
 * - 支持会话切换和删除操作
 * - 提供加载状态指示
 */
export function HistoryItem({
  session,
  isActive,
  isSwitching = false,
  onClick,
  onDelete
}: HistoryItemProps) {
  const bgColor = useColorModeValue(
    isActive ? 'blue.50' : 'transparent',
    isActive ? 'blue.900' : 'transparent'
  )
  
  const borderColor = useColorModeValue(
    isActive ? 'blue.200' : 'transparent',
    isActive ? 'blue.600' : 'transparent'
  )
  
  const textColor = useColorModeValue(
    isActive ? 'blue.700' : 'gray.700',
    isActive ? 'blue.200' : 'gray.200'
  )
  
  const subtextColor = useColorModeValue('gray.500', 'gray.400')

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete()
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('zh-CN', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else {
      return date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  return (
    <Box
      as="button"
      width="full"
      p={3}
      mb={1}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        bg: useColorModeValue('gray.50', 'gray.700'),
        borderColor: useColorModeValue('gray.200', 'gray.600')
      }}
      onClick={onClick}
      position="relative"
      textAlign="left"
    >
      <HStack spacing={2} align="start">
        {/* Session Icon */}
        <Box mt={0.5} flexShrink={0}>
          {isSwitching ? (
            <Spinner size="xs" color="blue.500" />
          ) : (
            <FiMessageCircle 
              size={14} 
              color={isActive ? 'var(--chakra-colors-blue-500)' : 'var(--chakra-colors-gray-400)'} 
            />
          )}
        </Box>

        {/* Session Content */}
        <Box flex={1} minW={0}>
          {/* Session Title */}
          <Text
            fontSize="sm"
            fontWeight={isActive ? "semibold" : "medium"}
            color={textColor}
            noOfLines={1}
            mb={1}
          >
            {session.title}
          </Text>

          {/* Last Message Preview */}
          {session.lastMessage && (
            <Text
              fontSize="xs"
              color={subtextColor}
              noOfLines={2}
              mb={1}
            >
              {session.lastMessage}
            </Text>
          )}

          {/* Session Metadata */}
          <HStack spacing={2} fontSize="xs" color={subtextColor}>
            <Text>{formatDate(new Date(session.updated_at))}</Text>
            {session.messageCount > 0 && (
              <>
                <Text>•</Text>
                <Text>{session.messageCount} 条消息</Text>
              </>
            )}
          </HStack>
        </Box>

        {/* Delete Button */}
        <Box flexShrink={0}>
          <Tooltip label="删除对话" placement="top">
            <IconButton
              aria-label="删除对话"
              icon={<FiTrash2 />}
              size="xs"
              variant="ghost"
              colorScheme="red"
              opacity={0.6}
              _hover={{ opacity: 1 }}
              onClick={handleDeleteClick}
            />
          </Tooltip>
        </Box>
      </HStack>

      {/* Active Indicator */}
      {isActive && (
        <Box
          position="absolute"
          left={0}
          top={0}
          bottom={0}
          width="3px"
          bg="blue.500"
          borderRadius="0 2px 2px 0"
        />
      )}
    </Box>
  )
}