'use client'

import {
  Box,
  VStack,
  Text,
  Card,
  CardBody,
} from '@chakra-ui/react'

interface ChatMessageCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  variant?: 'default' | 'interactive' | 'result'
}

export function ChatMessageCard({
  title,
  description,
  children,
  variant = 'default',
}: ChatMessageCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'interactive':
        return {
          borderColor: 'blue.200',
          bg: 'blue.50',
          _dark: { borderColor: 'blue.700', bg: 'blue.900' },
        }
      case 'result':
        return {
          borderColor: 'green.200',
          bg: 'green.50',
          _dark: { borderColor: 'green.700', bg: 'green.900' },
        }
      default:
        return {
          borderColor: 'gray.200',
          bg: 'white',
          _dark: { borderColor: 'gray.700', bg: 'gray.800' },
        }
    }
  }

  return (
    <Card
      borderWidth="1px"
      boxShadow="sm"
      {...getVariantStyles()}
    >
      <CardBody>
        <VStack spacing={4} align="stretch">
          {(title || description) && (
            <Box>
              {title && (
                <Text fontSize="lg" fontWeight="semibold" mb={2}>
                  {title}
                </Text>
              )}
              {description && (
                <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                  {description}
                </Text>
              )}
            </Box>
          )}
          
          <Box>
            {children}
          </Box>
        </VStack>
      </CardBody>
    </Card>
  )
}