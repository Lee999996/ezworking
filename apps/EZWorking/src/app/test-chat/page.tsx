'use client'

import React from 'react'
import { Box, VStack, Text, Button } from '@chakra-ui/react'
import Link from 'next/link'

export default function TestChatPage() {
  return (
    <Box h="100vh" w="100%" bg="white" display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={6}>
        <Text fontSize="2xl" fontWeight="bold" color="blue.600">
          测试新建对话功能
        </Text>
        
        <VStack spacing={4}>
          <Text fontSize="lg" color="gray.700">
            点击下面的按钮测试新建对话功能：
          </Text>
          
          <Link href="/chat" passHref>
            <Button
              as="a"
              colorScheme="blue"
              size="lg"
              width="200px"
            >
              新建对话
            </Button>
          </Link>
          
          <Link href="/career-positioning" passHref>
            <Button
              as="a"
              colorScheme="green"
              variant="outline"
              size="lg"
              width="200px"
            >
              职业定位分析
            </Button>
          </Link>
        </VStack>
        
        <Text fontSize="sm" color="gray.500" textAlign="center" maxW="400px">
          新建对话页面将显示AI职业顾问的欢迎消息，用户可以开始自由对话。
          职业定位分析页面则会显示欢迎界面，引导用户进行结构化的职业分析。
        </Text>
      </VStack>
    </Box>
  )
}