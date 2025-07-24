'use client'

import {
  Container,
  Stack,
  Heading,
  Text,
  useColorModeValue,
  Flex,
  List,
  ListItem,
  ListIcon,
  Box,
} from '@chakra-ui/react'
import {
  Form,
  FormLayout,
  Field,
  SubmitButton,
} from '@saas-ui/forms'
import { useAuth } from '@saas-ui/auth'
import { FiCheckCircle } from 'react-icons/fi'
import React from 'react'

const Feature = ({ children }: { children: React.ReactNode }) => (
  <ListItem>
    <ListIcon as={FiCheckCircle} color="green.500" />
    {children}
  </ListItem>
)

export default function SignupPage() {
  const { signUp } = useAuth()
  const [submitted, setSubmitted] = React.useState(false)

  const handleSubmit = async (data: any) => {
    try {
      await signUp(data)
      setSubmitted(true)
    } catch (e) {
      // ignore, saas-ui form will show errors
    }
  }

  return (
    <Stack flex="1" direction={{ base: 'column', lg: 'row' }} spacing="0" minH="100vh">
      <Flex
        p={8}
        flex="1"
        alignItems="center"
        justify="center"
        direction="column"
      >
        <Container maxW="md">
          <Heading as="h1" size="xl" mb="8" textAlign="center">
            创建账户
          </Heading>
          {submitted ? (
            <Stack spacing={6} align="center">
              <Heading size="md">注册成功！</Heading>
              <Text>请前往您的邮箱点击确认链接以激活账户。</Text>
              <Box as="a" href="/login" color="primary.500" fontWeight="bold">
                返回登录
              </Box>
            </Stack>
          ) : (
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <Field
                  name="name"
                  label="用户名称"
                  placeholder="请输入您的用户名称"
                  rules={{
                    required: '用户名称不能为空',
                    minLength: { value: 3, message: '不少于3个字符' },
                    maxLength: { value: 16, message: '不超过16个字符' },
                  }}
                />
                <Field
                  name="email"
                  label="邮箱"
                  type="email"
                  placeholder="请输入您的邮箱地址"
                  rules={{ required: '邮箱不能为空' }}
                />
                <Field
                  name="password"
                  label="密码"
                  type="password"
                  placeholder="请输入您的密码"
                  rules={{ required: '密码不能为空', minLength: { value: 8, message: '不少于8个字符' } }}
                />
                <Field
                  name="confirm-password"
                  label="确认密码"
                  type="password"
                  placeholder="请再次输入您的密码"
                  rules={{
                    validate: (value, values: any) =>
                      value === values.password || '两次输入的密码不一致',
                  }}
                />
                <SubmitButton width="full" size="lg">注册</SubmitButton>
              </FormLayout>
            </Form>
          )}

          <Text color="muted" fontSize="sm" mt="8" align="center">
            已经有账户了？{' '}
            <Box as="a" href="/login" color="primary.500">
              登录
            </Box>
            。
          </Text>
        </Container>
      </Flex>
    </Stack>
  )
} 