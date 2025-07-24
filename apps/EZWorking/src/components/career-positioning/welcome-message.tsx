'use client'

import React from 'react'
import {
  Box,
  VStack,
  Text,
  Button,
  HStack,
  Icon,
  Card,
  CardBody,
  Badge,
} from '@chakra-ui/react'
import { FiUser, FiTarget, FiTrendingUp, FiCheckCircle } from 'react-icons/fi'

interface WelcomeMessageProps {
  onStartCareerPositioning: () => void
}

export function WelcomeMessage({ onStartCareerPositioning }: WelcomeMessageProps) {
  return (
    <Box maxW="600px" mx="auto" p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <VStack spacing={3} textAlign="center">
          <Text
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="bold"
            bgGradient="linear(to-r, blue.400, teal.400)"
            bgClip="text"
          >
            AI职业定位助手
          </Text>
          <Text fontSize="lg" color="gray.600" maxW="500px">
            通过AI驱动的对话式职业分析，帮助您明确职业定位，找到最适合的工作方向
          </Text>
        </VStack>

        {/* Features */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="md" fontWeight="semibold" color="gray.700">
                我可以帮助您：
              </Text>
              
              <VStack spacing={3} align="stretch">
                <HStack spacing={3}>
                  <Icon as={FiUser} color="blue.500" boxSize={5} />
                  <Box>
                    <Text fontWeight="medium">个人背景分析</Text>
                    <Text fontSize="sm" color="gray.600">
                      收集并分析您的教育背景、工作经验和技能特长
                    </Text>
                  </Box>
                </HStack>
                
                <HStack spacing={3}>
                  <Icon as={FiTarget} color="green.500" boxSize={5} />
                  <Box>
                    <Text fontWeight="medium">职业倾向测评</Text>
                    <Text fontSize="sm" color="gray.600">
                      通过科学的测评了解您的个性特点和职业偏好
                    </Text>
                  </Box>
                </HStack>
                
                <HStack spacing={3}>
                  <Icon as={FiTrendingUp} color="purple.500" boxSize={5} />
                  <Box>
                    <Text fontWeight="medium">智能职位推荐</Text>
                    <Text fontSize="sm" color="gray.600">
                      基于分析结果推荐最适合您的职位和发展方向
                    </Text>
                  </Box>
                </HStack>
                
                <HStack spacing={3}>
                  <Icon as={FiCheckCircle} color="teal.500" boxSize={5} />
                  <Box>
                    <Text fontWeight="medium">职业规划建议</Text>
                    <Text fontSize="sm" color="gray.600">
                      提供具体的职业发展路径和行动建议
                    </Text>
                  </Box>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Process Overview */}
        <Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" align="center">
                <Text fontSize="md" fontWeight="semibold" color="blue.700">
                  分析流程
                </Text>
                <Badge colorScheme="blue" variant="subtle">
                  约15-20分钟
                </Badge>
              </HStack>
              
              <HStack spacing={4} justify="space-between" wrap="wrap">
                <VStack spacing={1} flex="1" minW="120px">
                  <Box
                    w={8}
                    h={8}
                    bg="blue.500"
                    color="white"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="sm"
                    fontWeight="bold"
                  >
                    1
                  </Box>
                  <Text fontSize="xs" textAlign="center" color="blue.700">
                    个人信息
                  </Text>
                </VStack>
                
                <VStack spacing={1} flex="1" minW="120px">
                  <Box
                    w={8}
                    h={8}
                    bg="blue.500"
                    color="white"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="sm"
                    fontWeight="bold"
                  >
                    2
                  </Box>
                  <Text fontSize="xs" textAlign="center" color="blue.700">
                    能力测评
                  </Text>
                </VStack>
                
                <VStack spacing={1} flex="1" minW="120px">
                  <Box
                    w={8}
                    h={8}
                    bg="blue.500"
                    color="white"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="sm"
                    fontWeight="bold"
                  >
                    3
                  </Box>
                  <Text fontSize="xs" textAlign="center" color="blue.700">
                    分析报告
                  </Text>
                </VStack>
                
                <VStack spacing={1} flex="1" minW="120px">
                  <Box
                    w={8}
                    h={8}
                    bg="blue.500"
                    color="white"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="sm"
                    fontWeight="bold"
                  >
                    4
                  </Box>
                  <Text fontSize="xs" textAlign="center" color="blue.700">
                    职位推荐
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <VStack spacing={3}>
          <Button
            colorScheme="blue"
            size="lg"
            w="full"
            onClick={onStartCareerPositioning}
          >
            开始职业定位分析
          </Button>
          
          <Text fontSize="sm" color="gray.500" textAlign="center">
            您也可以直接与我对话，询问任何职业相关的问题
          </Text>
        </VStack>
      </VStack>
    </Box>
  )
}