'use client'

import React, { useState, useEffect } from 'react'
import { Box, Container, Spinner, VStack, Text } from '@chakra-ui/react'
import { ChatInterface } from '@/components/career-positioning/chat-interface'
import { WelcomeMessage } from '@/components/career-positioning/welcome-message'
import { useChat } from '@/components/career-positioning/use-chat'
import { useAuth } from '@/hooks/useAuth'

export default function CareerPositioningPage() {
  const [showWelcome, setShowWelcome] = useState(true)
  const { user, loading: authLoading, userId } = useAuth()
  const { messages, isLoading, sendMessage, addComponentMessage, addMessage, currentSessionId } = useChat({ userId })

  // Reset welcome state when session changes or when there are messages
  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false)
    } else {
      setShowWelcome(true)
    }
  }, [messages.length, currentSessionId])

  // Initialize with welcome message when chat starts
  useEffect(() => {
    if (!showWelcome && messages.length === 0) {
      // Add initial AI greeting message
      setTimeout(() => {
        addMessage({
          type: 'assistant',
          content: '您好！我是您的AI职业顾问。我可以帮助您进行职业定位分析、技能评估、求职建议等。请告诉我您需要什么帮助？',
        })
      }, 500)
    }
  }, [showWelcome, messages.length, addMessage])

  const handleStartCareerPositioning = () => {
    setShowWelcome(false)
    // Add initial career positioning message
    setTimeout(() => {
      addComponentMessage(
        '很好！让我们开始职业定位分析。首先，我需要了解您的基本信息，这将帮助我为您提供更准确的分析和建议。',
        'profile-form',
        {
          sections: ['basic', 'education', 'experience', 'skills']
        }
      )
    }, 1000)
  }

  const handleSendMessage = async (message: string) => {
    await sendMessage(message)
  }

  if (authLoading) {
    return (
      <Container maxW="container.xl" h="100vh" p={0}>
        <Box h="100%" display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={4}>
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.600">正在加载...</Text>
          </VStack>
        </Box>
      </Container>
    )
  }

  if (!user) {
    return (
      <Container maxW="container.xl" h="100vh" p={0}>
        <Box h="100%" display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={4}>
            <Text fontSize="lg" color="gray.600">请先登录以使用职业定位功能</Text>
          </VStack>
        </Box>
      </Container>
    )
  }

  return (
    <Box h="100vh" w="100%" bg="white" display="flex" flexDirection="column">
      {showWelcome ? (
        <Box 
          flex="1" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          py={8}
          bg="white"
        >
          <WelcomeMessage onStartCareerPositioning={handleStartCareerPositioning} />
        </Box>
      ) : (
        <Box flex="1" display="flex" flexDirection="column" minH={0} bg="white">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            userId={userId}
          />
        </Box>
      )}
    </Box>
  )
}