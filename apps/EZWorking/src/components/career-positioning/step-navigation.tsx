'use client'

import {
  HStack,
  Button,
} from '@chakra-ui/react'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  isNextDisabled?: boolean
  isPreviousDisabled?: boolean
  nextLabel?: string
  previousLabel?: string
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  isNextDisabled = false,
  isPreviousDisabled = false,
  nextLabel,
  previousLabel = '上一步',
}: StepNavigationProps) {
  const isLastStep = currentStep === totalSteps - 1
  const isFirstStep = currentStep === 0
  
  const defaultNextLabel = isLastStep ? '完成' : '下一步'

  return (
    <HStack justify="space-between" pt={4} w="full">
      <Button
        leftIcon={<FiArrowLeft />}
        variant="outline"
        onClick={onPrevious}
        isDisabled={isFirstStep || isPreviousDisabled}
      >
        {previousLabel}
      </Button>
      
      <Button
        rightIcon={<FiArrowRight />}
        colorScheme="blue"
        onClick={onNext}
        isDisabled={isNextDisabled}
      >
        {nextLabel || defaultNextLabel}
      </Button>
    </HStack>
  )
}