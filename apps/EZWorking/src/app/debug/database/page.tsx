/**
 * Database Debug Page
 * 数据库调试页面 - 用于诊断数据库连接和表状态
 */

'use client'

import React from 'react'
import { Container, Box, Text, Button, VStack } from '@chakra-ui/react'
import { DatabaseStatus } from '@/components/debug/database-status'
import { useRouter } from 'next/navigation'

export default function DatabaseDebugPage() {
  const router = useRouter()

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            数据库调试工具
          </Text>
          <Text color="gray.600" mb={4}>
            用于诊断和测试数据库连接状态
          </Text>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push('/chat')}
          >
            返回聊天页面
          </Button>
        </Box>

        <DatabaseStatus />
      </VStack>
    </Container>
  )
}