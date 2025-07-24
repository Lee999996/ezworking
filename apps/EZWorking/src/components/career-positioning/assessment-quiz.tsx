'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Progress,
  Alert,
  AlertIcon,
  Badge,
  Divider,
  useToast,
} from '@chakra-ui/react'
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi'

import { AssessmentService } from '../../services/assessment'
import type {
  AssessmentTemplate,
  AssessmentQuestion,
  AssessmentSession,
} from '../../types/assessment'
import { ChatMessageCard } from './step-container'

interface AssessmentQuizProps {
  templateId?: string
  userId?: string
  onComplete?: (sessionId: string, results: any) => void
  onCancel?: () => void
}

export function AssessmentQuiz({
  templateId,
  userId,
  onComplete,
  onCancel,
}: AssessmentQuizProps) {
  const [template, setTemplate] = useState<AssessmentTemplate | null>(null)
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [session, setSession] = useState<AssessmentSession | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  const toast = useToast()

  // Initialize assessment
  useEffect(() => {
    if (!templateId || !userId) {
      setIsLoading(false)
      setError('缺少必要参数')
      return
    }

    const initializeAssessment = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get template and questions
        const [templates, questions] = await Promise.all([
          AssessmentService.getTemplates(),
          templateId ? AssessmentService.getQuestions(templateId) : Promise.resolve([]),
        ])

        const template = templates.find(t => t.id === templateId)
        if (!template) {
          throw new Error('找不到指定的评估模板')
        }

        // Start new session
        const session = await AssessmentService.startSession(userId!, templateId!)

        setTemplate(template)
        setQuestions(questions)
        setSession(session)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize assessment:', error)
        setIsLoading(false)
        setError(error instanceof Error ? error.message : '初始化评估失败')
      }
    }

    initializeAssessment()
  }, [templateId, userId])

  const handleAnswerChange = useCallback((questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }))
  }, [])

  const handleNext = async () => {
    const currentQuestion = questions[currentQuestionIndex]
    const currentAnswer = answers[currentQuestion.id]

    // Validate required questions
    if (currentQuestion.required && (currentAnswer === undefined || currentAnswer === null || currentAnswer === '')) {
      toast({
        title: '请回答当前问题',
        description: '这是一个必答题，请选择您的答案后继续',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      // Submit answer to database
      if (session && currentAnswer !== undefined) {
        await AssessmentService.submitAnswer(
          session.id,
          currentQuestion.id,
          currentAnswer
        )
      }

      // Move to next question or complete
      if (currentQuestionIndex < questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1
        setCurrentQuestionIndex(nextIndex)

        // Update session progress
        if (session) {
          await AssessmentService.updateSessionProgress(session.id, nextIndex + 1)
        }
      } else {
        // Complete assessment
        await completeAssessment()
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
      toast({
        title: '提交答案失败',
        description: '请稍后重试',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const completeAssessment = async () => {
    if (!session) return

    try {
      setIsLoading(true)

      // Complete session in database
      await AssessmentService.completeSession(session.id)

      setIsCompleted(true)
      setIsLoading(false)

      // Notify parent component
      if (onComplete) {
        onComplete(session.id, answers)
      }

      toast({
        title: '评估完成！',
        description: '正在为您生成分析结果...',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Failed to complete assessment:', error)
      setIsLoading(false)
      toast({
        title: '完成评估失败',
        description: '请稍后重试',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  if (isLoading) {
    return (
      <ChatMessageCard variant="interactive">
        <VStack spacing={4}>
          <Text>正在加载评估...</Text>
          <Progress size="sm" isIndeterminate colorScheme="blue" w="100%" />
        </VStack>
      </ChatMessageCard>
    )
  }

  if (error) {
    return (
      <ChatMessageCard variant="interactive">
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
        {onCancel && (
          <Button mt={4} onClick={onCancel} size="sm">
            返回
          </Button>
        )}
      </ChatMessageCard>
    )
  }

  if (isCompleted) {
    return (
      <ChatMessageCard variant="result">
        <VStack spacing={4} align="center">
          <Box color="green.500" fontSize="3xl">
            <FiCheck />
          </Box>
          <Text fontSize="lg" fontWeight="semibold" textAlign="center">
            评估已完成！
          </Text>
          <Text color="gray.600" textAlign="center">
            感谢您完成职业评估，我们正在为您分析结果...
          </Text>
        </VStack>
      </ChatMessageCard>
    )
  }

  if (!template || questions.length === 0) {
    return (
      <ChatMessageCard variant="interactive">
        <Alert status="warning">
          <AlertIcon />
          评估数据不完整，请稍后重试
        </Alert>
      </ChatMessageCard>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const currentAnswer = answers[currentQuestion.id]

  return (
    <ChatMessageCard
      title={template.name}
      description={template.description}
      variant="interactive"
    >
      <VStack spacing={6} align="stretch">
        {/* Progress indicator */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" color="gray.600">
              问题 {currentQuestionIndex + 1} / {questions.length}
            </Text>
            <Badge colorScheme="blue" variant="subtle">
              {Math.round(progress)}% 完成
            </Badge>
          </HStack>
          <Progress value={progress} colorScheme="blue" size="sm" borderRadius="full" />
        </Box>

        <Divider />

        {/* Current question */}
        <Box>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontSize="lg" fontWeight="medium" mb={2}>
                {currentQuestion.title}
                {currentQuestion.required && (
                  <Text as="span" color="red.500" ml={1}>
                    *
                  </Text>
                )}
              </Text>
              {currentQuestion.description && (
                <Text fontSize="sm" color="gray.600">
                  {currentQuestion.description}
                </Text>
              )}
            </Box>

            {/* Question input based on type */}
            <QuestionInput
              question={currentQuestion}
              value={currentAnswer}
              onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            />
          </VStack>
        </Box>

        {/* Navigation buttons */}
        <HStack justify="space-between">
          <Button
            leftIcon={<FiArrowLeft />}
            variant="outline"
            onClick={handlePrevious}
            isDisabled={currentQuestionIndex === 0}
            size="sm"
          >
            上一题
          </Button>

          <Button
            rightIcon={currentQuestionIndex === questions.length - 1 ? <FiCheck /> : <FiArrowRight />}
            colorScheme="blue"
            onClick={handleNext}
            isLoading={isLoading}
            size="sm"
          >
            {currentQuestionIndex === questions.length - 1 ? '完成评估' : '下一题'}
          </Button>
        </HStack>
      </VStack>
    </ChatMessageCard>
  )
}

interface QuestionInputProps {
  question: AssessmentQuestion
  value: any
  onChange: (value: any) => void
}

function QuestionInput({ question, value, onChange }: QuestionInputProps) {
  const renderInput = () => {
    switch (question.type) {
      case 'single_choice':
        return (
          <RadioGroup value={value || ''} onChange={onChange}>
            <VStack align="stretch" spacing={2}>
              {question.options?.choices?.map((choice: any, index: number) => (
                <Radio key={index} value={choice.value || choice}>
                  {choice.label || choice}
                </Radio>
              ))}
            </VStack>
          </RadioGroup>
        )

      case 'multiple_choice':
        return (
          <CheckboxGroup value={value || []} onChange={onChange}>
            <VStack align="stretch" spacing={2}>
              {question.options?.choices?.map((choice: any, index: number) => (
                <Checkbox key={index} value={choice.value || choice}>
                  {choice.label || choice}
                </Checkbox>
              ))}
            </VStack>
          </CheckboxGroup>
        )

      case 'rating_scale': {
        const min = question.options?.min || 1
        const max = question.options?.max || 5
        const step = question.options?.step || 1
        
        return (
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.600">
                {question.options?.minLabel || min}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {question.options?.maxLabel || max}
              </Text>
            </HStack>
            <Slider
              value={value || min}
              onChange={onChange}
              min={min}
              max={max}
              step={step}
              colorScheme="blue"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb boxSize={6}>
                <Box color="blue.500" fontSize="sm" fontWeight="bold">
                  {value || min}
                </Box>
              </SliderThumb>
            </Slider>
          </Box>
        )
      }

      default:
        return (
          <Alert status="warning">
            <AlertIcon />
            不支持的问题类型: {question.type}
          </Alert>
        )
    }
  }

  return <Box>{renderInput()}</Box>
}