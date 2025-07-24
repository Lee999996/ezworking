'use client'

import { Container, Stack, Text } from '@chakra-ui/react'
import { LoginView, useAuth } from '@saas-ui/auth'
import { LoadingOverlay, LoadingSpinner } from '@saas-ui/react'

export const LoginPage = () => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return (
      <LoadingOverlay variant="fullscreen">
        <LoadingSpinner />
      </LoadingOverlay>
    )
  }

  return (
    <Stack flex="1" direction="row" minH="100vh">
      <Stack
        flex="1"
        alignItems="center"
        justify="center"
        direction="column"
        spacing="8"
      >
        <Container>
          <LoginView
            title="登录"
            type="password"
            fields={{
              email: {
                label: '邮箱',
                placeholder: '请输入您的邮箱地址',
              },
              password: {
                label: '密码',
                placeholder: '请输入您的密码',
              },
              submit: {
                children: '登录',
              },
            }}
          />
        </Container>

        <Text color="muted">
          还没有账户？{' '}
          <a href="/signup">
            注册
          </a>
          。
        </Text>
      </Stack>
    </Stack>
  )
} 