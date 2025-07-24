import * as React from 'react'

import {
  Box,
  Card,
  CardBody,
  Flex,
  Icon,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react'
import { LuChevronDown, LuChevronUp } from 'react-icons/lu'

export interface MetricCardProps {
  label: string
  value: string
  difference: string
  isPositive: boolean
}

export const MetricCard: React.FC<MetricCardProps> = (props) => {
  const { label, value, difference, isPositive } = props
  return (
    <Card flex="1">
      <CardBody position="relative">
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
      </CardBody>
    </Card>
  )
}
