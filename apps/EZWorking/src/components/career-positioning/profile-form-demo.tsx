'use client'

import React from 'react'
import { Box, Container, VStack, Text, useToast } from '@chakra-ui/react'
import { ProfileFormComponent } from './profile-form'

export function ProfileFormDemo() {
  const toast = useToast()

  const handleSubmit = (data: any) => {
    console.log('Profile form submitted:', data)
    toast({
      title: '表单提交成功',
      description: '个人信息已成功收集',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="blue.600">
            个人信息收集表单演示
          </Text>
          <Text color="gray.600" mt={2}>
            这是一个完整的个人信息收集表单，包含实时验证和数据库保存功能
          </Text>
        </Box>

        <ProfileFormComponent 
          onSubmit={handleSubmit}
          userId="demo-user-id"
        />
      </VStack>
    </Container>
  )
}