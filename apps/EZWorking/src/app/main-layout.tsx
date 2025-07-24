'use client'

import { UserMenu } from '@/components/user-menu/user-menu'
import { Box, Button, HStack, Spacer, Text } from '@chakra-ui/react'
import { useAuth } from '@saas-ui/auth'
import {
  AppShell,
  NavGroup,
  NavItem,
  Sidebar,
  SidebarSection,
} from '@saas-ui/react'
import Link from 'next/link'
import { FiPlus, FiTarget } from 'react-icons/fi'

const ChatHistoryItem = ({
  children,
  isActive,
}: {
  children: React.ReactNode
  isActive?: boolean
}) => (
  <NavItem
    href="#"
    height="12"
    display="flex"
    alignItems="center"
    fontSize="lg"
    isActive={isActive}
    style={{
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      width: '100%',
    }}
  >
    {children}
  </NavItem>
)

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()

  return (
    <AppShell
      height="100vh"
      variant="static"
      overflow="hidden"
      sidebar={
        <Sidebar
          bg="gray.50"
          _dark={{ bg: 'gray.800' }}
          width="280px"
          borderRightWidth="1px"
        >
          <SidebarSection p="4">
            <Link href="/chat" passHref>
              <Button
                as="a"
                variant="solid"
                colorScheme="blue"
                leftIcon={<FiPlus />}
                width="full"
                mb={4}
                h="12"
                fontSize="lg"
              >
                新建对话
              </Button>
            </Link>
            <NavGroup>
              <Link href="/career-positioning" passHref>
                <NavItem
                  as="a"
                  height="12"
                  display="flex"
                  alignItems="center"
                  fontSize="lg"
                  mb={2}
                >
                  <HStack spacing={2}>
                    <FiTarget />
                    <Text>职业定位分析</Text>
                  </HStack>
                </NavItem>
              </Link>
              <ChatHistoryItem>初步求职策略</ChatHistoryItem>
              <ChatHistoryItem>简历修改建议...</ChatHistoryItem>
              <ChatHistoryItem>产品经理求职信...</ChatHistoryItem>
            </NavGroup>
          </SidebarSection>
          <Spacer />
          <SidebarSection>
            {/* We will add settings and help links later */}
          </SidebarSection>
        </Sidebar>
      }
    >
      <Box
        position="relative"
        height="full"
        width="full"
        bg="white"
        _dark={{ bg: 'gray.900' }}
      >
        <Box position="absolute" top="1.5rem" right="1.5rem" zIndex="overlay">
          {isAuthenticated ? (
            <HStack spacing={3}>
              <HStack
                bg="white"
                _dark={{ bg: 'gray.700' }}
                borderRadius="xl"
                py={2}
                px={4}
                boxShadow="sm"
                spacing={1.5}
                alignItems="center"
              >
                <Text
                  as="span"
                  color="blue.500"
                  fontWeight="semibold"
                  lineHeight={1}
                  fontSize="md"
                >
                  ★
                </Text>
                <Text fontSize="lg" fontWeight="medium" lineHeight={1}>
                  1232
                </Text>
              </HStack>
              <UserMenu />
            </HStack>
          ) : (
            <Link href="/login" passHref>
              <Button
                as="a"
                variant="solid"
                colorScheme="primary"
                boxShadow="md"
              >
                请登录
              </Button>
            </Link>
          )}
        </Box>
        <Box height="full" width="full" overflowY="auto">
          {children}
        </Box>
      </Box>
    </AppShell>
  )
}
