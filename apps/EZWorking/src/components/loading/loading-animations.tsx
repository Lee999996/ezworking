'use client'

/**
 * Loading Animation Components
 * 
 * Implements requirements:
 * - 5.4: 会话加载、消息发送的加载动画
 * - 5.5: 骨架屏和占位符提升用户体验
 * - 6.1, 6.2: 优化长时间操作的用户反馈
 */

import React from 'react'
import {
  Box,
  HStack,
  VStack,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  Spinner,
  Text,
  Circle
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'

// ============================================================================
// Keyframe Animations
// ============================================================================

const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`

const wave = keyframes`
  0%, 60%, 100% { transform: initial; }
  30% { transform: translateY(-15px); }
`

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`

// ============================================================================
// Typing Indicator
// ============================================================================

interface TypingIndicatorProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export function TypingIndicator({ size = 'md', color = 'gray.400' }: TypingIndicatorProps) {
  const dotSize = size === 'sm' ? '6px' : size === 'md' ? '8px' : '10px'
  const containerHeight = size === 'sm' ? '20px' : size === 'md' ? '24px' : '28px'

  return (
    <HStack spacing={1} h={containerHeight} align="center">
      <Text fontSize="sm" color="gray.500" mr={2}>
        AI正在输入
      </Text>
      {[0, 1, 2].map((index) => (
        <Circle
          key={index}
          size={dotSize}
          bg={color}
          animation={`${bounce} 1.4s infinite ease-in-out both`}
          style={{
            animationDelay: `${index * 0.16}s`
          }}
        />
      ))}
    </HStack>
  )
}

// ============================================================================
// Message Loading Skeleton
// ============================================================================

interface MessageSkeletonProps {
  isUser?: boolean
  showAvatar?: boolean
}

export function MessageSkeleton({ isUser = false, showAvatar = true }: MessageSkeletonProps) {
  return (
    <HStack
      spacing={3}
      align="flex-start"
      justify={isUser ? 'flex-end' : 'flex-start'}
      w="100%"
    >
      {!isUser && showAvatar && (
        <SkeletonCircle size="8" />
      )}
      
      <VStack
        align={isUser ? 'flex-end' : 'flex-start'}
        spacing={2}
        maxW="70%"
        flex="1"
      >
        <Box
          bg={isUser ? 'blue.50' : 'gray.50'}
          borderRadius="lg"
          p={3}
          w="100%"
          position="relative"
          _before={!isUser ? {
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
          } : undefined}
          _after={isUser ? {
            content: '""',
            position: 'absolute',
            top: '10px',
            right: '-8px',
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderLeft: '8px solid',
            borderLeftColor: 'blue.50'
          } : undefined}
        >
          <SkeletonText noOfLines={2} spacing="2" skeletonHeight="2" />
        </Box>
        
        <Skeleton height="12px" width="60px" />
      </VStack>
      
      {isUser && showAvatar && (
        <SkeletonCircle size="8" />
      )}
    </HStack>
  )
}

// ============================================================================
// Session List Skeleton
// ============================================================================

interface SessionListSkeletonProps {
  count?: number
}

export function SessionListSkeleton({ count = 5 }: SessionListSkeletonProps) {
  return (
    <VStack spacing={2} align="stretch">
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          p={3}
          borderRadius="md"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
        >
          <VStack align="flex-start" spacing={2}>
            <Skeleton height="16px" width="80%" />
            <SkeletonText noOfLines={1} spacing="2" skeletonHeight="2" width="60%" />
            <HStack justify="space-between" w="100%">
              <Skeleton height="12px" width="40px" />
              <Skeleton height="12px" width="60px" />
            </HStack>
          </VStack>
        </Box>
      ))}
    </VStack>
  )
}

// ============================================================================
// Shimmer Loading Effect
// ============================================================================

interface ShimmerProps {
  width?: string | number
  height?: string | number
  borderRadius?: string
}

export function Shimmer({ width = '100%', height = '20px', borderRadius = 'md' }: ShimmerProps) {
  return (
    <Box
      width={width}
      height={height}
      borderRadius={borderRadius}
      background="linear-gradient(90deg, #f0f0f0 0px, #e0e0e0 40px, #f0f0f0 80px)"
      backgroundSize="200px"
      animation={`${shimmer} 2s infinite linear`}
    />
  )
}

// ============================================================================
// Pulsing Dot Loader
// ============================================================================

interface PulsingDotsProps {
  count?: number
  size?: string
  color?: string
  spacing?: number
}

export function PulsingDots({ 
  count = 3, 
  size = '8px', 
  color = 'blue.400',
  spacing = 2 
}: PulsingDotsProps) {
  return (
    <HStack spacing={spacing}>
      {Array.from({ length: count }).map((_, index) => (
        <Circle
          key={index}
          size={size}
          bg={color}
          animation={`${pulse} 1.5s infinite`}
          style={{
            animationDelay: `${index * 0.3}s`
          }}
        />
      ))}
    </HStack>
  )
}

// ============================================================================
// Wave Loading Animation
// ============================================================================

interface WaveLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export function WaveLoader({ size = 'md', color = 'blue.400' }: WaveLoaderProps) {
  const barWidth = size === 'sm' ? '3px' : size === 'md' ? '4px' : '5px'
  const barHeight = size === 'sm' ? '20px' : size === 'md' ? '30px' : '40px'

  return (
    <HStack spacing={1} align="center" h={barHeight}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Box
          key={index}
          width={barWidth}
          height={barHeight}
          bg={color}
          borderRadius="sm"
          animation={`${wave} 1.2s infinite ease-in-out`}
          style={{
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
    </HStack>
  )
}

// ============================================================================
// Spinner with Text
// ============================================================================

interface SpinnerWithTextProps {
  text?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  textColor?: string
}

export function SpinnerWithText({ 
  text = '加载中...', 
  size = 'md',
  color = 'blue.500',
  textColor = 'gray.600'
}: SpinnerWithTextProps) {
  return (
    <VStack spacing={3}>
      <Spinner
        thickness="3px"
        speed="0.8s"
        emptyColor="gray.200"
        color={color}
        size={size}
      />
      <Text fontSize="sm" color={textColor}>
        {text}
      </Text>
    </VStack>
  )
}

// ============================================================================
// Progress Indicator
// ============================================================================

interface ProgressIndicatorProps {
  steps: string[]
  currentStep: number
  isLoading?: boolean
}

export function ProgressIndicator({ 
  steps, 
  currentStep, 
  isLoading = false 
}: ProgressIndicatorProps) {
  return (
    <VStack spacing={3} align="stretch">
      {steps.map((step, index) => (
        <HStack key={index} spacing={3}>
          <Circle
            size="24px"
            bg={
              index < currentStep 
                ? 'green.500' 
                : index === currentStep 
                  ? 'blue.500' 
                  : 'gray.300'
            }
            color="white"
            fontSize="xs"
            fontWeight="bold"
          >
            {index < currentStep ? '✓' : index + 1}
          </Circle>
          
          <Text
            fontSize="sm"
            color={
              index <= currentStep ? 'gray.800' : 'gray.500'
            }
            fontWeight={index === currentStep ? 'semibold' : 'normal'}
          >
            {step}
          </Text>
          
          {index === currentStep && isLoading && (
            <Spinner size="sm" color="blue.500" />
          )}
        </HStack>
      ))}
    </VStack>
  )
}

// ============================================================================
// Loading Overlay
// ============================================================================

interface LoadingOverlayProps {
  isVisible: boolean
  text?: string
  children?: React.ReactNode
}

export function LoadingOverlay({ 
  isVisible, 
  text = '处理中...', 
  children 
}: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(255, 255, 255, 0.9)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
      backdropFilter="blur(2px)"
    >
      {children || <SpinnerWithText text={text} />}
    </Box>
  )
}