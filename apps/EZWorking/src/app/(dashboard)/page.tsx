'use client'

import {
  Box,
  VStack,
  Text,
  IconButton,
  SimpleGrid,
  Container,
  Textarea,
  HStack,
} from '@chakra-ui/react'
import { FiArrowUp, FiPaperclip } from 'react-icons/fi'

const SuggestionCard = ({ children }: { children: React.ReactNode }) => (
  <Box
    as="button"
    p={4}
    bg="gray.200"
    _dark={{ bg: 'gray.700' }}
    borderRadius="lg"
    textAlign="left"
    width="full"
    _hover={{ bg: 'gray.300', _dark: { bg: 'gray.600' } }}
    borderWidth="1px"
    borderColor="transparent"
  >
    <Text fontSize="md" color="gray.600" _dark={{ color: 'gray.300' }}>
      {children}
    </Text>
  </Box>
)

export default function HomePage() {
  return (
    <Container maxW="container.md" height="full">
      <VStack justify="center" align="center" height="full">
        <VStack spacing={6} width="full" maxW="container.md">
          <VStack spacing={4} textAlign="center">
            <Text
              fontSize={{ base: '4xl', md: '6xl' }}
              fontWeight="bold"
              bgGradient="linear(to-r, blue.400, teal.400)"
              bgClip="text"
            >
              您好！
            </Text>
            <Text fontSize={{ base: 'lg', md: 'xl' }} color="muted">
              今天我能如何帮助您规划职业生涯？
            </Text>
          </VStack>

          <Box
            width="full"
            position="relative"
            bg="white"
            _dark={{ bg: 'gray.800' }}
            borderRadius="xl"
            boxShadow="md"
          >
            <Textarea
              placeholder="开始一个有创意的想法或任务..."
              variant="unstyled"
              resize="none"
              p={6}
              minH="120px"
              fontSize="lg"
              pr="9rem"
            />
            <HStack position="absolute" bottom="1rem" right="1rem" spacing={2}>
              <IconButton
                aria-label="上传附件"
                icon={<FiPaperclip />}
                variant="ghost"
                size="sm"
              />
              <IconButton
                aria-label="发送消息"
                icon={<FiArrowUp />}
                isRound
                colorScheme="blue"
                size="md"
              />
            </HStack>
          </Box>

          <VStack spacing={4} width="full" align="stretch">
            <Text fontSize="sm" color="muted" textAlign="center">
              或尝试以下建议
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <SuggestionCard>我适合什么样的角色？</SuggestionCard>
              <SuggestionCard>为我推荐一些合适的职位</SuggestionCard>
              <SuggestionCard>我应该如何为此角色做准备？</SuggestionCard>
              <SuggestionCard>我上次的面试有什么可以改进的地方？</SuggestionCard>
            </SimpleGrid>
          </VStack>
        </VStack>
      </VStack>
    </Container>
  )
} 