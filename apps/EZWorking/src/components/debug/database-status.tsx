/**
 * Database Status Debug Component
 * 用于调试数据库连接和表状态
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Divider,
  Badge,
  Spinner,
  useToast
} from '@chakra-ui/react'
import { testDatabaseConnection, testCreateSession } from '@/utils/db-test'
import { useAuth } from '@/hooks/useAuth'

interface DatabaseStatusProps {
  onClose?: () => void
}

export function DatabaseStatus({ onClose }: DatabaseStatusProps) {
  const { user, userId } = useAuth()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<any>(null)
  const [sessionTestStatus, setSessionTestStatus] = useState<any>(null)

  const runConnectionTest = async () => {
    setIsLoading(true)
    try {
      const result = await testDatabaseConnection()
      setConnectionStatus(result)
      
      if (result.success) {
        toast({
          title: '数据库连接成功',
          status: 'success',
          duration: 3000
        })
      } else {
        toast({
          title: '数据库连接失败',
          description: result.error,
          status: 'error',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Connection test error:', error)
      setConnectionStatus({
        success: false,
        error: `测试异常: ${error instanceof Error ? error.message : '未知错误'}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const runSessionTest = async () => {
    if (!userId) {
      toast({
        title: '用户未登录',
        description: '请先登录后再测试会话创建',
        status: 'warning',
        duration: 3000
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await testCreateSession(userId, `测试会话 ${new Date().toLocaleTimeString()}`)
      setSessionTestStatus(result)
      
      if (result.success) {
        toast({
          title: '会话创建测试成功',
          description: `会话ID: ${result.sessionId}`,
          status: 'success',
          duration: 3000
        })
      } else {
        toast({
          title: '会话创建测试失败',
          description: result.error,
          status: 'error',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Session test error:', error)
      setSessionTestStatus({
        success: false,
        error: `测试异常: ${error instanceof Error ? error.message : '未知错误'}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // 自动运行连接测试
    runConnectionTest()
  }, [])

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="md" maxW="600px" mx="auto">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="xl" fontWeight="bold">数据库状态诊断</Text>
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose}>
              关闭
            </Button>
          )}
        </HStack>

        <Divider />

        {/* 用户状态 */}
        <Box>
          <Text fontSize="md" fontWeight="semibold" mb={2}>用户认证状态</Text>
          <HStack spacing={3}>
            <Badge colorScheme={user ? 'green' : 'red'}>
              {user ? '已登录' : '未登录'}
            </Badge>
            {user && (
              <Text fontSize="sm" color="gray.600">
                用户ID: <Code fontSize="xs">{userId}</Code>
              </Text>
            )}
          </HStack>
        </Box>

        <Divider />

        {/* 数据库连接测试 */}
        <Box>
          <HStack justify="space-between" mb={3}>
            <Text fontSize="md" fontWeight="semibold">数据库连接测试</Text>
            <Button
              size="sm"
              onClick={runConnectionTest}
              isLoading={isLoading}
              loadingText="测试中..."
            >
              重新测试
            </Button>
          </HStack>

          {connectionStatus && (
            <Alert status={connectionStatus.success ? 'success' : 'error'}>
              <AlertIcon />
              <Box>
                <AlertTitle>
                  {connectionStatus.success ? '连接成功' : '连接失败'}
                </AlertTitle>
                {connectionStatus.error && (
                  <AlertDescription>
                    {connectionStatus.error}
                  </AlertDescription>
                )}
                {connectionStatus.details && (
                  <Box mt={2}>
                    <Code fontSize="xs" p={2} bg="gray.50" borderRadius="md" display="block">
                      {JSON.stringify(connectionStatus.details, null, 2)}
                    </Code>
                  </Box>
                )}
              </Box>
            </Alert>
          )}
        </Box>

        <Divider />

        {/* 会话创建测试 */}
        <Box>
          <HStack justify="space-between" mb={3}>
            <Text fontSize="md" fontWeight="semibold">会话创建测试</Text>
            <Button
              size="sm"
              onClick={runSessionTest}
              isLoading={isLoading}
              loadingText="测试中..."
              isDisabled={!user}
            >
              测试创建会话
            </Button>
          </HStack>

          {!user && (
            <Alert status="warning">
              <AlertIcon />
              <AlertDescription>
                请先登录后再测试会话创建功能
              </AlertDescription>
            </Alert>
          )}

          {sessionTestStatus && (
            <Alert status={sessionTestStatus.success ? 'success' : 'error'}>
              <AlertIcon />
              <Box>
                <AlertTitle>
                  {sessionTestStatus.success ? '创建成功' : '创建失败'}
                </AlertTitle>
                {sessionTestStatus.error && (
                  <AlertDescription>
                    {sessionTestStatus.error}
                  </AlertDescription>
                )}
                {sessionTestStatus.details && (
                  <Box mt={2}>
                    <Code fontSize="xs" p={2} bg="gray.50" borderRadius="md" display="block">
                      {JSON.stringify(sessionTestStatus.details, null, 2)}
                    </Code>
                  </Box>
                )}
              </Box>
            </Alert>
          )}
        </Box>

        <Divider />

        {/* 环境信息 */}
        <Box>
          <Text fontSize="md" fontWeight="semibold" mb={2}>环境信息</Text>
          <VStack align="stretch" spacing={2}>
            <HStack>
              <Text fontSize="sm" color="gray.600">Supabase URL:</Text>
              <Code fontSize="xs">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置'}
              </Code>
            </HStack>
            <HStack>
              <Text fontSize="sm" color="gray.600">Supabase Key:</Text>
              <Code fontSize="xs">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已配置' : '未配置'}
              </Code>
            </HStack>
            <HStack>
              <Text fontSize="sm" color="gray.600">环境:</Text>
              <Code fontSize="xs">
                {process.env.NODE_ENV || 'development'}
              </Code>
            </HStack>
          </VStack>
        </Box>

        {isLoading && (
          <HStack justify="center" py={4}>
            <Spinner size="sm" />
            <Text fontSize="sm" color="gray.600">正在测试...</Text>
          </HStack>
        )}
      </VStack>
    </Box>
  )
}