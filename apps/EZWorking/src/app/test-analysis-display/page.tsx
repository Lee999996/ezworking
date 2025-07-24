'use client'

import React from 'react'
import { Box, Container, VStack, Text, Button, useToast } from '@chakra-ui/react'
import { AnalysisDisplayComponent } from '../../components/career-positioning/analysis-display'
import { mockAnalysisData } from '../../utils/mock-analysis-data'

export default function TestAnalysisDisplayPage() {
  const toast = useToast()

  const handleInteraction = (interaction: any) => {
    console.log('Analysis interaction:', interaction)
    toast({
      title: '交互记录',
      description: `${interaction.type}: ${interaction.section}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  const handleContinue = () => {
    console.log('Continue to recommendations')
    toast({
      title: '继续操作',
      description: '准备查看职位推荐',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            职业分析展示组件测试
          </Text>
          <Text color="gray.600">
            这是任务 4.4 的实现 - 创建分析展示组件
          </Text>
        </Box>

        <AnalysisDisplayComponent
          analysisData={mockAnalysisData}
          onInteraction={handleInteraction}
          onContinue={handleContinue}
        />

        <Box textAlign="center" pt={4}>
          <Text fontSize="sm" color="gray.500">
            组件功能包括：交互式标签页、可展开的详细信息、进度条和图表、以及个性化建议
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}