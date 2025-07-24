'use client'

import React, { useState } from 'react'
import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  useToast,
  Box,
} from '@chakra-ui/react'

import { JobRecommendationsComponent } from '../../components/career-positioning/job-recommendations'
import { mockJobRecommendations, refineRecommendations } from '../../utils/mock-job-recommendations'

export default function TestJobRecommendationsPage() {
  const [recommendationsData, setRecommendationsData] = useState(mockJobRecommendations)
  const [userFeedback, setUserFeedback] = useState<Record<string, 'interested' | 'not-interested' | 'maybe'>>({})
  const toast = useToast()

  const handleFeedback = (jobId: string, feedback: 'interested' | 'not-interested' | 'maybe') => {
    const newFeedback = { ...userFeedback, [jobId]: feedback }
    setUserFeedback(newFeedback)
    
    // Update the job in recommendations data
    const updatedRecommendations = recommendationsData.recommendations.map(job => 
      job.id === jobId ? { ...job, userFeedback: feedback } : job
    )
    
    setRecommendationsData(prev => ({
      ...prev,
      recommendations: updatedRecommendations
    }))

    toast({
      title: '反馈已记录',
      description: `您对"${recommendationsData.recommendations.find(j => j.id === jobId)?.title}"的反馈已保存`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }

  const handleRefineRecommendations = () => {
    const refinedJobs = refineRecommendations(recommendationsData.recommendations, userFeedback)
    
    setRecommendationsData(prev => ({
      ...prev,
      recommendations: refinedJobs,
      refinementSuggestions: [
        '已根据您的反馈调整推荐算法',
        '优先显示您感兴趣的职位类型',
        '过滤掉不匹配的职位特征',
        '为您推荐更多相似的机会'
      ]
    }))

    toast({
      title: '推荐已优化',
      description: '根据您的反馈，我们已为您调整了职位推荐',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }

  const handleContinue = () => {
    toast({
      title: '继续职业规划',
      description: '接下来我们将为您制定详细的职业发展计划',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const resetDemo = () => {
    setRecommendationsData(mockJobRecommendations)
    setUserFeedback({})
    toast({
      title: '演示已重置',
      description: '所有反馈已清除，推荐列表已恢复初始状态',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" mb={4}>
            职位推荐组件测试
          </Heading>
          <Text color="gray.600" mb={4}>
            这是职位推荐组件的测试页面。您可以对职位进行反馈，体验推荐优化功能。
          </Text>
          <Button size="sm" variant="outline" onClick={resetDemo}>
            重置演示
          </Button>
        </Box>

        <JobRecommendationsComponent
          recommendationsData={recommendationsData}
          onFeedback={handleFeedback}
          onRefineRecommendations={handleRefineRecommendations}
          onContinue={handleContinue}
        />

        <Box p={4} bg="gray.50" borderRadius="md">
          <Text fontSize="sm" color="gray.600">
            <strong>测试说明：</strong>
            <br />
            1. 点击职位卡片上的反馈按钮（👍 👎 😐）来表达您的兴趣
            <br />
            2. 点击&quot;查看详情&quot;展开职位的完整信息
            <br />
            3. 提供反馈后，可以点击&quot;根据反馈优化推荐&quot;来体验推荐算法
            <br />
            4. 当有足够反馈时，&quot;制定职业规划&quot;按钮将出现
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}