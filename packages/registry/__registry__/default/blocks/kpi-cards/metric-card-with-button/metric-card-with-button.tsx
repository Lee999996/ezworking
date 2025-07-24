import * as React from 'react'

import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  HStack,
  Icon,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react'
import { IconBadge } from '@saas-ui/react'
import {
  LuChevronDown,
  LuChevronRight,
  LuChevronUp,
  LuMousePointer,
  LuUsers,
  LuWallet,
} from 'react-icons/lu'

const getIcon = (metric: string) => {
  switch (metric) {
    case 'active-users':
      return <LuUsers />
    case 'sales':
      return <LuWallet />
    case 'avg-click-rate':
      return <LuMousePointer />
    default:
      return null
  }
}

export interface MetricCardProps {
  id: string
  label: string
  value: string
  difference: string
  isPositive: boolean
}

export const MetricCard: React.FC<MetricCardProps> = (props) => {
  const { id, label, value, difference, isPositive } = props
  return (
    <Card flex="1">
      <CardBody position="relative">
        <Stat>
          <StatLabel color="muted">{label}</StatLabel>
          <StatNumber>{value}</StatNumber>
          <StatHelpText color="muted">
            {isPositive ? (
              <Flex alignItems="center" gap="1">
                <Icon as={LuChevronUp} color="green.500" />{' '}
                <Box as="span" color="green.500" fontWeight="medium">
                  {difference}
                </Box>
                more than last week
              </Flex>
            ) : (
              <Flex alignItems="center" gap="1">
                <Icon as={LuChevronDown} color="red.500" />{' '}
                <Box as="span" color="red.500" fontWeight="medium">
                  {difference}
                </Box>
                less than last week
              </Flex>
            )}
          </StatHelpText>
          <IconBadge
            position="absolute"
            top="0"
            right="0"
            size="lg"
            variant="solid"
            bg="gray.200"
            color="inherit"
            _dark={{
              bg: 'whiteAlpha.300',
            }}
          >
            {getIcon(id)}
          </IconBadge>
        </Stat>
      </CardBody>
      <Button
        rightIcon={<LuChevronRight />}
        borderTopRadius="0"
        justifyContent="space-between"
        fontWeight="medium"
        h="10"
        px="4"
        bg="gray.50"
        _hover={{ bg: 'gray.100' }}
        _dark={{
          bg: 'whiteAlpha.50',
          _hover: {
            bg: 'whiteAlpha.100',
          },
        }}
      >
        View reports
      </Button>
    </Card>
  )
}
