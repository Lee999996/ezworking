'use client'

import React from 'react'
import { Box, Container, VStack } from '@chakra-ui/react'
import { CareerDirectionsComponent } from '../../components/career-positioning/career-directions'
import { mockCareerDirections } from '../../utils/mock-career-directions'
import type { Resource } from '../../utils/mock-career-directions'

export default function TestCareerDirectionsPage() {
  const handlePathSelect = (pathId: string) => {
    console.log('Selected path:', pathId)
  }

  const handleActionComplete = (actionId: string) => {
    console.log('Completed action:', actionId)
  }

  const handleResourceClick = (resource: Resource) => {
    console.log('Clicked resource:', resource)
    if (resource.url) {
      window.open(resource.url, '_blank')
    }
  }

  const handleSaveDirections = () => {
    console.log('Saving career directions...')
    alert('职业规划已保存！')
  }

  const handleContinueChat = () => {
    console.log('Continue chatting...')
    alert('继续与AI助手对话')
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <CareerDirectionsComponent
            directionsData={mockCareerDirections}
            onPathSelect={handlePathSelect}
            onActionComplete={handleActionComplete}
            onResourceClick={handleResourceClick}
            onSaveDirections={handleSaveDirections}
            onContinueChat={handleContinueChat}
          />
        </Box>
      </VStack>
    </Container>
  )
}