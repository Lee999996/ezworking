'use client'

import { Badge, Box, HStack, Progress, Text, VStack } from '@chakra-ui/react'

interface CareerPositioningProgressProps {
  currentPhase: string
  completedPhases: string[]
  totalPhases: number
}

export function CareerPositioningProgress({
  currentPhase,
  completedPhases,
  totalPhases,
}: CareerPositioningProgressProps) {
  const progressPercentage = (completedPhases.length / totalPhases) * 100

  return (
    <Box
      p={4}
      bg="blue.50"
      _dark={{ bg: 'blue.900', borderColor: 'blue.700' }}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="blue.200"
    >
      <VStack spacing={3} align="stretch">
        <HStack justify="space-between">
          <Text
            fontSize="sm"
            fontWeight="medium"
            color="blue.700"
            _dark={{ color: 'blue.300' }}
          >
            职业定位分析进度
          </Text>
          <Badge colorScheme="blue" variant="subtle">
            {currentPhase}
          </Badge>
        </HStack>

        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
              已完成 {completedPhases.length} / {totalPhases} 个阶段
            </Text>
            <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
              {Math.round(progressPercentage)}%
            </Text>
          </HStack>
          <Progress
            value={progressPercentage}
            colorScheme="blue"
            size="sm"
            borderRadius="full"
          />
        </Box>
      </VStack>
    </Box>
  )
}
