import { HStack, StackProps, Text } from '@chakra-ui/react'

import { StatusBadge } from '#components/status-badge'

const contactStatus: Record<string, { label: string; color: string }> = {
  active: {
    label: 'Active',
    color: 'green',
  },
  inactive: {
    label: 'Inactive',
    color: 'orange',
  },
  new: {
    label: 'New',
    color: 'blue',
  },
}

export interface ContactStatusProps extends StackProps {
  status: keyof typeof contactStatus
  hideLabel?: boolean
}

export const ContactStatus: React.FC<ContactStatusProps> = (props) => {
  const { status, hideLabel, ...rest } = props
  const { color, label } = contactStatus[status] || contactStatus.new
  return (
    <HStack display="inline-flex" {...rest}>
      <StatusBadge colorScheme={color} />
      {!hideLabel && <Text>{label}</Text>}
    </HStack>
  )
}
