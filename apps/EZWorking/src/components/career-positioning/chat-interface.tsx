'use client'

import React, { useEffect, useRef, useState } from 'react'

import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  IconButton,
  Input,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { FiMessageCircle, FiSend, FiUser, FiPaperclip, FiX, FiCheck, FiClock, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'

import { ProfileFormComponent } from './profile-form'
import { AnalysisDisplayComponent } from './analysis-display'
import { AssessmentQuiz } from './assessment-quiz'
import { JobRecommendationsComponent } from './job-recommendations'
import { CareerDirectionsComponent } from './career-directions'

// Types for chat messages
export interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'component'
  content: string
  componentType?: ComponentType
  componentData?: any
  timestamp: Date
  userId?: string
  // Message status for auto-save functionality
  status?: 'sending' | 'sent' | 'failed'
  retryCount?: number
}

export type ComponentType =
  | 'profile-form'
  | 'assessment-quiz'
  | 'analysis-display'
  | 'job-recommendations'
  | 'career-directions'
  | 'loading-indicator'

interface ChatInterfaceProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  onRetryMessage?: (messageId: string) => void
  isLoading?: boolean
  userId?: string
}

export function ChatInterface({
  messages,
  onSendMessage,
  onRetryMessage,
  isLoading = false,
  userId,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const messageBg = useColorModeValue('gray.50', 'gray.800')
  const userMessageBg = useColorModeValue('blue.500', 'blue.600')

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if ((inputValue.trim() || attachedFiles.length > 0) && !isLoading) {
      // TODO: Handle file attachments in the message
      onSendMessage(inputValue.trim())
      setInputValue('')
      setAttachedFiles([])
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const maxFileSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]

    const validFiles = files.filter(file => {
      if (file.size > maxFileSize) {
        toast({
          title: '文件过大',
          description: `${file.name} 超过10MB限制`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return false
      }
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: '文件类型不支持',
          description: `${file.name} 文件类型不支持`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return false
      }
      return true
    })

    if (attachedFiles.length + validFiles.length > 5) {
      toast({
        title: '文件数量限制',
        description: '最多只能上传5个文件',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setAttachedFiles(prev => [...prev, ...validFiles])
    // Clear the input
    if (event.target) {
      event.target.value = ''
    }
  }

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Box position="relative" h="100%" w="100%" bg="white">
      {/* Messages Area - scrollable */}
      <Box 
        h="100%" 
        overflowY="auto" 
        p={4}
        pb="100px" // Leave space for floating input at bottom
      >
        <VStack spacing={4} align="stretch">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isUser={message.type === 'user'}
              messageBg={messageBg}
              userMessageBg={userMessageBg}
              userId={userId}
              onRetryMessage={onRetryMessage}
            />
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <HStack spacing={3} justify="flex-start">
              <Avatar size="sm" icon={<FiMessageCircle />} bg="blue.500" />
              <Card bg={messageBg} maxW="70%">
                <CardBody py={3} px={4}>
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
                </CardBody>
              </Card>
            </HStack>
          )}

          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      {/* Fixed Input Area at bottom - styled like main-layout */}
      <Box
        position="absolute"
        bottom="1.5rem"
        left="1.5rem"
        right="1.5rem"
        bg="gray.50"
        _dark={{ bg: 'gray.700' }}
        borderRadius="xl"
        py={3}
        px={4}
        boxShadow="sm"
      >
        <VStack spacing={2} align="stretch">
          {/* Attached Files Display */}
          {attachedFiles.length > 0 && (
            <Box>
              <HStack spacing={2} flexWrap="wrap">
                {attachedFiles.map((file, index) => (
                  <HStack
                    key={index}
                    bg="blue.50"
                    borderRadius="md"
                    px={2}
                    py={1}
                    spacing={2}
                  >
                    <Text fontSize="xs" color="blue.700" maxW="100px" isTruncated>
                      {file.name}
                    </Text>
                    <IconButton
                      aria-label="移除文件"
                      icon={<FiX />}
                      size="xs"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() => handleRemoveFile(index)}
                    />
                  </HStack>
                ))}
              </HStack>
            </Box>
          )}

          {/* Input Row */}
          <HStack spacing={2}>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
              bg="transparent"
              border="none"
              _focus={{
                boxShadow: 'none',
              }}
              _placeholder={{
                color: 'gray.500',
              }}
              disabled={isLoading}
              fontSize="md"
            />
            <IconButton
              aria-label="上传附件"
              icon={<FiPaperclip />}
              size="sm"
              variant="ghost"
              colorScheme="gray"
              onClick={handleAttachClick}
              disabled={isLoading}
            />
            <IconButton
              aria-label="发送消息"
              icon={<FiSend />}
              colorScheme="blue"
              size="sm"
              onClick={handleSendMessage}
              isDisabled={(!inputValue.trim() && attachedFiles.length === 0) || isLoading}
            />
          </HStack>

          {/* Hidden File Input */}
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            display="none"
          />
        </VStack>
      </Box>
    </Box>
  )
}

interface MessageBubbleProps {
  message: ChatMessage
  isUser: boolean
  messageBg: string
  userMessageBg: string
  userId?: string
  onRetryMessage?: (messageId: string) => void
}

function MessageBubble({
  message,
  isUser,
  messageBg,
  userMessageBg,
  userId,
  onRetryMessage,
}: MessageBubbleProps) {
  const getStatusIcon = () => {
    if (!isUser || !message.status) return null
    
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

  const getStatusText = () => {
    if (!isUser || !message.status) return null
    
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

  return (
    <HStack
      spacing={3}
      justify={isUser ? 'flex-end' : 'flex-start'}
      align="flex-start"
    >
      {!isUser && <Avatar size="sm" icon={<FiMessageCircle />} bg="blue.500" />}

      <VStack spacing={1} align={isUser ? 'flex-end' : 'flex-start'}>
        <Card
          bg={isUser ? userMessageBg : messageBg}
          color={isUser ? 'white' : 'inherit'}
          maxW="70%"
          borderRadius="lg"
          opacity={message.status === 'failed' ? 0.8 : 1}
        >
          <CardBody py={3} px={4}>
            <Text fontSize="sm" whiteSpace="pre-wrap">
              {message.content}
            </Text>

            {/* Component rendering area */}
            {message.componentType && (
              <ComponentRenderer
                message={message}
                userId={userId}
                onComponentSubmit={(componentId, data) => {
                  console.log('Component submitted:', componentId, data)
                  // This will be handled properly in task 3.1
                }}
              />
            )}
          </CardBody>
        </Card>

        {/* Status indicator for user messages */}
        {isUser && message.status && (
          <HStack spacing={1} fontSize="xs" color="gray.500">
            {getStatusIcon()}
            <Text>{getStatusText()}</Text>
            {message.status === 'failed' && onRetryMessage && (
              <IconButton
                aria-label="重试发送"
                icon={<FiRefreshCw size={10} />}
                size="xs"
                variant="ghost"
                colorScheme="gray"
                onClick={() => onRetryMessage(message.id)}
                ml={1}
              />
            )}
          </HStack>
        )}
      </VStack>

      {isUser && <Avatar size="sm" icon={<FiUser />} bg="gray.500" />}
    </HStack>
  )
}

interface ComponentRendererProps {
  message: ChatMessage
  onComponentSubmit: (componentId: string, data: any) => void
  userId?: string
}

function ComponentRenderer({
  message,
  onComponentSubmit,
  userId,
}: ComponentRendererProps) {
  const renderComponent = () => {
    switch (message.componentType) {
      case 'profile-form':
        return (
          <ProfileFormComponent
            onSubmit={(data) => onComponentSubmit(message.id, data)}
            userId={userId}
          />
        )
      case 'assessment-quiz':
        return (
          <AssessmentQuiz
            templateId={message.componentData?.templateId}
            userId={userId}
            onComplete={(sessionId, results) => {
              onComponentSubmit(message.id, { sessionId, results })
            }}
            onCancel={() => {
              // Handle cancel if needed
            }}
          />
        )
      case 'analysis-display':
        return (
          <AnalysisDisplayComponent
            analysisData={message.componentData?.analysisData}
            onInteraction={(interaction) => {
              onComponentSubmit(message.id, { interaction })
            }}
            onContinue={() => {
              onComponentSubmit(message.id, { action: 'continue_to_recommendations' })
            }}
          />
        )
      case 'job-recommendations':
        return (
          <JobRecommendationsComponentWrapper
            message={message}
            onComponentSubmit={onComponentSubmit}
          />
        )
      case 'career-directions':
        return (
          <CareerDirectionsComponentWrapper
            message={message}
            onComponentSubmit={onComponentSubmit}
          />
        )
      case 'loading-indicator':
        return null // Loading is handled in the main chat interface
      default:
        return (
          <Box
            mt={4}
            p={4}
            bg="gray.50"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Text fontSize="sm" color="gray.500" textAlign="center">
              未知组件类型: {message.componentType}
            </Text>
          </Box>
        )
    }
  }

  return <Box>{renderComponent()}</Box>
}
// Wrapper components for dynamic data loading
function JobRecommendationsComponentWrapper({
  message,
  onComponentSubmit,
}: {
  message: ChatMessage
  onComponentSubmit: (componentId: string, data: any) => void
}) {
  const [recommendationsData, setRecommendationsData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        // Dynamically import mock data
        const { mockJobRecommendations } = await import('../../utils/mock-job-recommendations')
        setRecommendationsData(mockJobRecommendations)
      } catch (err) {
        setError('加载职位推荐数据失败')
        console.error('Failed to load job recommendations:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (!message.componentData?.recommendationsData) {
      loadData()
    } else {
      setRecommendationsData(message.componentData.recommendationsData)
      setIsLoading(false)
    }
  }, [message.componentData])

  if (isLoading) {
    return (
      <Box mt={4} p={4} textAlign="center">
        <VStack spacing={2}>
          <Box
            w={8}
            h={8}
            border="2px solid"
            borderColor="blue.200"
            borderTopColor="blue.500"
            borderRadius="full"
            animation="spin 1s linear infinite"
          />
          <Text fontSize="sm" color="gray.600">
            正在加载职位推荐...
          </Text>
        </VStack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box mt={4} p={4} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200">
        <VStack spacing={2}>
          <Text fontSize="sm" color="red.700">
            {error}
          </Text>
          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={() => {
              setError(null)
              setIsLoading(true)
            }}
          >
            重试
          </Button>
        </VStack>
      </Box>
    )
  }

  if (!recommendationsData) {
    return (
      <Box mt={4} p={4} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
        <Text fontSize="sm" color="gray.600" textAlign="center">
          暂无职位推荐数据
        </Text>
      </Box>
    )
  }

  return (
    <JobRecommendationsComponent
      recommendationsData={recommendationsData}
      onFeedback={(jobId, feedback) => {
        onComponentSubmit(message.id, { action: 'job_feedback', jobId, feedback })
      }}
      onRefineRecommendations={() => {
        onComponentSubmit(message.id, { action: 'refine_recommendations' })
      }}
      onContinue={() => {
        onComponentSubmit(message.id, { action: 'continue_to_directions' })
      }}
    />
  )
}

function CareerDirectionsComponentWrapper({
  message,
  onComponentSubmit,
}: {
  message: ChatMessage
  onComponentSubmit: (componentId: string, data: any) => void
}) {
  const [directionsData, setDirectionsData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        // Dynamically import mock data
        const { mockCareerDirections } = await import('../../utils/mock-career-directions')
        setDirectionsData(mockCareerDirections)
      } catch (err) {
        setError('加载职业方向数据失败')
        console.error('Failed to load career directions:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (!message.componentData?.directionsData) {
      loadData()
    } else {
      setDirectionsData(message.componentData.directionsData)
      setIsLoading(false)
    }
  }, [message.componentData])

  if (isLoading) {
    return (
      <Box mt={4} p={4} textAlign="center">
        <VStack spacing={2}>
          <Box
            w={8}
            h={8}
            border="2px solid"
            borderColor="blue.200"
            borderTopColor="blue.500"
            borderRadius="full"
            animation="spin 1s linear infinite"
          />
          <Text fontSize="sm" color="gray.600">
            正在生成职业发展方向...
          </Text>
        </VStack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box mt={4} p={4} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200">
        <VStack spacing={2}>
          <Text fontSize="sm" color="red.700">
            {error}
          </Text>
          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={() => {
              setError(null)
              setIsLoading(true)
            }}
          >
            重试
          </Button>
        </VStack>
      </Box>
    )
  }

  if (!directionsData) {
    return (
      <Box mt={4} p={4} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
        <Text fontSize="sm" color="gray.600" textAlign="center">
          暂无职业发展方向数据
        </Text>
      </Box>
    )
  }

  return (
    <CareerDirectionsComponent
      directionsData={directionsData}
      onPathSelect={(pathId) => {
        onComponentSubmit(message.id, { action: 'path_select', pathId })
      }}
      onActionComplete={(actionId) => {
        onComponentSubmit(message.id, { action: 'action_complete', actionId })
      }}
      onResourceClick={(resource) => {
        onComponentSubmit(message.id, { action: 'resource_click', resource })
      }}
      onSaveDirections={() => {
        onComponentSubmit(message.id, { action: 'save_directions' })
      }}
      onContinueChat={() => {
        onComponentSubmit(message.id, { action: 'continue_chat' })
      }}
    />
  )
}