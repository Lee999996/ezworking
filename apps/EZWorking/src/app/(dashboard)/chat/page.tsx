'use client'

import React, { useState, useEffect } from 'react'
import { Box, Spinner, VStack, Text } from '@chakra-ui/react'
import { ChatInterface } from '@/components/career-positioning/chat-interface'
import { useChat } from '@/components/career-positioning/use-chat'
import { useAuth } from '@/hooks/useAuth'

export default function ChatPage() {
  const { user, loading: authLoading, userId } = useAuth()
  const { messages, isLoading, sendMessage, addMessage, clearMessages } = useChat({ userId })

  // Initialize with AI greeting message when component mounts
  useEffect(() => {
    if (userId) {
      // Clear previous messages for a fresh conversation
      clearMessages()
      
      // Add initial AI greeting message
      setTimeout(() => {
        addMessage({
          type: 'assistant',
          content: '您好！我是您的AI职业顾问。我可以帮助您进行职业定位分析、技能评估、求职建议等。请告诉我您需要什么帮助？',
        })
      }, 500)
    }
  }, [userId, addMessage, clearMessages])

  const handleSendMessage = async (message: string) => {
    await sendMessage(message)
  }

  if (authLoading) {
    return (
      <Box h="100vh" w="100%" bg="white" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.600">正在加载...</Text>
        </VStack>
      </Box>
    )
  }

  if (!user) {
    return (
      <Box h="100vh" w="100%" bg="white" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Text fontSize="lg" color="gray.600">请先登录以使用对话功能</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box h="100vh" w="100%" bg="white" display="flex" flexDirection="column">
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        userId={userId}
      />
    </Box>
  )
}