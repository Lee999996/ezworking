'use client'

import React, { useState, useRef, useCallback } from 'react'
import {
  Box,
  HStack,
  IconButton,
  Textarea,
  Text,
  VStack,
  useColorModeValue,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { FiSend, FiPaperclip } from 'react-icons/fi'

interface ChatInputProps {
  onSubmit: (message: string) => void
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  isLoading?: boolean
}

/**
 * Chat Input Component
 * 
 * Requirements implemented:
 * - 3.1: 创建消息输入框和发送按钮
 * - 3.2: 添加输入验证和字符限制
 * - 3.2: 实现Enter键发送和Shift+Enter换行
 */
export function ChatInput({
  onSubmit,
  disabled = false,
  placeholder = '输入消息...',
  maxLength = 10000,
  isLoading = false,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const toast = useToast()

  const bg = useColorModeValue('gray.50', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const focusBorderColor = useColorModeValue('blue.500', 'blue.300')

  /**
   * Handle input value changes with validation
   * Requirement 3.2: 添加输入验证和字符限制
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    
    // Character limit validation
    if (value.length > maxLength) {
      toast({
        title: '消息过长',
        description: `消息长度不能超过 ${maxLength} 个字符`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setInputValue(value)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [maxLength, toast])

  /**
   * Handle message submission
   * Requirement 3.1: 消息发送功能
   */
  const handleSubmit = useCallback(() => {
    const trimmedValue = inputValue.trim()
    
    if (!trimmedValue || disabled) {
      return
    }

    // Input validation
    if (trimmedValue.length === 0) {
      toast({
        title: '消息不能为空',
        description: '请输入有效的消息内容',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (trimmedValue.length > maxLength) {
      toast({
        title: '消息过长',
        description: `消息长度不能超过 ${maxLength} 个字符`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // Submit message
    onSubmit(trimmedValue)
    
    // Clear input and reset height
    setInputValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.focus()
    }
  }, [inputValue, disabled, maxLength, onSubmit, toast])

  /**
   * Handle key down events
   * Requirement 3.2: 实现Enter键发送和Shift+Enter换行
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Enter key
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter: Allow new line (default behavior)
        return
      } else {
        // Enter: Send message
        e.preventDefault()
        if (!isComposing) {
          handleSubmit()
        }
      }
    }
  }, [handleSubmit, isComposing])

  /**
   * Handle composition events for IME input
   */
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true)
  }, [])

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false)
  }, [])

  /**
   * Handle file attachment (placeholder for future implementation)
   */
  const handleAttachFile = useCallback(() => {
    toast({
      title: '功能开发中',
      description: '文件上传功能即将推出',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }, [toast])

  /**
   * Get character count color based on usage
   */
  const getCharCountColor = () => {
    const ratio = inputValue.length / maxLength
    if (ratio >= 0.9) return 'red.500'
    if (ratio >= 0.7) return 'orange.500'
    return 'gray.500'
  }

  return (
    <Box
      bg={bg}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      _focusWithin={{
        borderColor: focusBorderColor,
        boxShadow: `0 0 0 1px ${focusBorderColor}`,
      }}
      py={3}
      px={4}
      boxShadow="sm"
      transition="all 0.2s"
    >
      <VStack spacing={2} align="stretch">
        {/* Input Row */}
        <HStack spacing={2} align="flex-end">
          {/* Text Input */}
          <Box flex="1">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder={placeholder}
              disabled={disabled}
              resize="none"
              minH="40px"
              maxH="120px"
              bg="transparent"
              border="none"
              _focus={{
                boxShadow: 'none',
              }}
              _placeholder={{
                color: 'gray.500',
              }}
              fontSize="md"
              lineHeight="1.5"
              py={2}
              px={0}
            />
          </Box>

          {/* Action Buttons */}
          <HStack spacing={1}>
            {/* File Attachment Button */}
            <IconButton
              aria-label="上传附件"
              icon={<FiPaperclip />}
              size="sm"
              variant="ghost"
              colorScheme="gray"
              onClick={handleAttachFile}
              disabled={disabled}
              _hover={{
                bg: 'gray.100',
              }}
            />

            {/* Send Button */}
            <IconButton
              aria-label="发送消息"
              icon={isLoading ? <Spinner size="sm" /> : <FiSend />}
              colorScheme="blue"
              size="sm"
              onClick={handleSubmit}
              isDisabled={!inputValue.trim() || disabled || isLoading}
              isLoading={isLoading}
              _hover={!isLoading ? {
                transform: 'translateY(-1px)',
              } : {}}
              transition="all 0.2s"
            />
          </HStack>
        </HStack>

        {/* Character Count and Hints */}
        {(inputValue.length > maxLength * 0.5 || inputValue.includes('\n')) && (
          <HStack justify="space-between" fontSize="xs">
            {/* Character Count */}
            <Text color={getCharCountColor()}>
              {inputValue.length}/{maxLength}
            </Text>

            {/* Input Hints */}
            <Text color="gray.500">
              Enter 发送 • Shift+Enter 换行
            </Text>
          </HStack>
        )}
      </VStack>
    </Box>
  )
}