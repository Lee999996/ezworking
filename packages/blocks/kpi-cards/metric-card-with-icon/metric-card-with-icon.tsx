import * as React from 'react'

import {
  Box,
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
  LuChevronUp,
  LuMousePointerClick,
  LuUsers,
  LuWallet,
} from 'react-icons/lu'

const getIcon = (metric: string) => {
  switch (metric) {
    case 'active-users':
      return <LuUsers />
    case 'revenue':
      return <LuWallet />
    case 'avg-click-rate':
      return <LuMousePointerClick />
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
        <HStack spacing="3">
          <IconBadge size="xl">{getIcon(id)}</IconBadge>
          <Stat>
            <StatLabel color="muted">{label}</StatLabel>
            <StatNumber display="inline-block" me="2">
              {value}
            </StatNumber>
            <StatHelpText color="muted" display="inline-block">
              {isPositive ? (
                <Flex alignItems="center">
                  <Icon as={LuChevronUp} color="green.500" />{' '}
                  <Box as="span" color="green.500" fontWeight="medium">
                    {difference}
                  </Box>
                </Flex>
              ) : (
                <Flex alignItems="center">
                  <Icon as={LuChevronDown} color="red.500" />{' '}
                  <Box as="span" color="red.500" fontWeight="medium">
                    {difference}
                  </Box>
                </Flex>
              )}
            </StatHelpText>
          </Stat>
        </HStack>
      </CardBody>
    </Card>
  )
}
