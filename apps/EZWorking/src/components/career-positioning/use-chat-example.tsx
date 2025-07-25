/**
 * Example usage of the enhanced useChat hook with chat history integration
 */

'use client'

import React from 'react'
import { Box, Button, VStack, Text, HStack } from '@chakra-ui/react'
import { useChat } from './use-chat'

export function UseChatExample() {
  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    currentSessionId,
    createNewSession,
    switchToSession
  } = useChat({
    userId: 'example-user',
    enableHistory: true
  })

  const handleSendMessage = () => {
    sendMessage('Hello, I need career advice!')
  }

  const handleCreateNewSession = () => {
    const newSessionId = createNewSession()
    console.log('Created new session:', newSessionId)
  }

  return (
    <Box p={6} maxW="600px" mx="auto">
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold">
          Enhanced useChat Hook Example
        </Text>
        
        <Text fontSize="sm" color="gray.600">
          Current Session ID: {currentSessionId || 'None'}
        </Text>
        
        <HStack spacing={2}>
          <Button onClick={handleSendMessage} isLoading={isLoading}>
            Send Test Message
          </Button>
          <Button onClick={handleCreateNewSession} variant="outline">
            New Session
          </Button>
          <Button onClick={clearMessages} variant="outline" colorScheme="red">
            Clear Messages
          </Button>
        </HStack>
        
        <Box>
          <Text fontWeight="semibold" mb={2}>
            Messages ({messages.length}):
          </Text>
          <VStack spacing={2} align="stretch">
            {messages.map((message) => (
              <Box
                key={message.id}
                p={3}
                bg={message.type === 'user' ? 'blue.50' : 'gray.50'}
                borderRadius="md"
                borderLeft="4px solid"
                borderLeftColor={message.type === 'user' ? 'blue.500' : 'gray.500'}
              >
                <Text fontSize="xs" color="gray.500" mb={1}>
                  {message.type.toUpperCase()} - {message.timestamp.toLocaleTimeString()}
                </Text>
                <Text fontSize="sm">{message.content}</Text>
              </Box>
            ))}
            {messages.length === 0 && (
              <Text fontSize="sm" color="gray.500" textAlign="center">
                No messages yet. Send a message to get started!
              </Text>
            )}
          </VStack>
        </Box>
        
        <Box p={4} bg="blue.50" borderRadius="md">
          <Text fontSize="sm" fontWeight="semibold" mb={2}>
            Features Demonstrated:
          </Text>
          <VStack spacing={1} align="start" fontSize="xs">
            <Text>✅ Chat history integration with automatic session management</Text>
            <Text>✅ Message persistence across page refreshes</Text>
            <Text>✅ Backward compatibility with localStorage</Text>
            <Text>✅ Session creation and switching</Text>
            <Text>✅ Error handling with graceful fallbacks</Text>
            <Text>✅ Loading states and responsive UI</Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}