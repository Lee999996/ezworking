'use client'

import React from 'react'
import { Box, Container, VStack, Text, useToast } from '@chakra-ui/react'
import { ProfileFormComponent } from './profile-form'

export function ProfileFormTest() {
  const toast = useToast()

  const handleSubmit = (data: any) => {
    console.log('Profile form test - data submitted:', data)
    
    // Validate that all required data is present
    const isValid = 
      data.basicInfo.name &&
      data.basicInfo.age > 0 &&
      data.basicInfo.gender &&
      data.basicInfo.currentLocation &&
      data.education.level &&
      data.education.school &&
      data.education.major &&
      data.skills.professionalSkills.length > 0

    toast({
      title: isValid ? '表单验证成功' : '表单验证失败',
      description: isValid ? 
        '所有必填字段都已正确填写' : 
        '请检查必填字段是否完整',
      status: isValid ? 'success' : 'error',
      duration: 3000,
      isClosable: true,
    })

    if (isValid) {
      // Show summary of collected data
      const summary = `
姓名: ${data.basicInfo.name}
年龄: ${data.basicInfo.age}
性别: ${data.basicInfo.gender}
所在地: ${data.basicInfo.currentLocation}
学历: ${data.education.level}
学校: ${data.education.school}
专业: ${data.education.major}
工作年限: ${data.experience.totalYears}年
技能数量: ${data.skills.professionalSkills.length}项
      `
      
      toast({
        title: '收集到的信息摘要',
        description: summary,
        status: 'info',
        duration: 10000,
        isClosable: true,
      })
    }
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="blue.600">
            个人信息收集表单测试
          </Text>
          <Text color="gray.600" mt={2}>
            测试表单功能，无需数据库连接
          </Text>
        </Box>

        <ProfileFormComponent 
          onSubmit={handleSubmit}
          // No userId provided to test offline functionality
        />
      </VStack>
    </Container>
  )
}