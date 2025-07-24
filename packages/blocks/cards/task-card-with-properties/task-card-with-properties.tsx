import * as React from 'react'

import {
  Badge,
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  HStack,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tag,
  Text,
} from '@chakra-ui/react'
import {
  PersonaAvatar,
  Property,
  PropertyLabel,
  PropertyList,
  PropertyValue,
} from '@saas-ui/react'
import {
  LuCalendar,
  LuCircleDashed,
  LuCircleDot,
  LuCircleHelp,
  LuEllipsisVertical,
  LuListChecks,
  LuMilestone,
  LuSignalHigh,
  LuSignalLow,
  LuSignalMedium,
  LuSignalZero,
} from 'react-icons/lu'

export interface Task {
  status: TaskState
  priority: Priority
  dueDate: string
  milestone: string
  subtasks: string
  tags: Array<string>
  user: {
    name: string
    avatar: string
    presence: string
  }
}

export function TaskCardWithProperties(props: { task: Task }) {
  const { task } = props

  return (
    <Card size="sm">
      <CardHeader
        display="flex"
        alignItems="center"
        gap="2"
        position="relative"
      >
        <PersonaAvatar
          size="2xs"
          name={task.user.name}
          src={task.user.avatar}
          presence={task.user.presence}
        />
        <Text fontSize="sm" fontWeight="medium">
          {task.user.name}
        </Text>
        <Menu>
          <MenuButton
            as={IconButton}
            position="absolute"
            top="2"
            right="2"
            aria-label="Options"
            variant="ghost"
            icon={<LuEllipsisVertical />}
          />
          <MenuList>
            <MenuItem>Edit</MenuItem>
            <MenuItem>Delete</MenuItem>
          </MenuList>
        </Menu>
      </CardHeader>
      <CardBody pt="1">
        <HStack mb="1" alignItems="center">
          <TaskStatus status={task.status} />

          <Heading size="xs" fontWeight="medium" noOfLines={1}>
            Define design tokens
          </Heading>
        </HStack>

        <Text color="muted" mb="2" noOfLines={1}>
          Design consistent variables for visual properties like colors,
          typography, and spacing.
        </Text>

        <PropertyList display="grid" gridTemplateColumns="1fr 1fr">
          <TaskProperty id="dueDate" value={task.dueDate} />
          <TaskProperty id="milestone" value={task.milestone} />
          <TaskProperty id="priority" value={task.priority} />
          <TaskProperty id="subtasks" value={task.subtasks} />
        </PropertyList>
      </CardBody>
      <CardFooter borderTopWidth="1px">
        <TaskTags tags={task.tags} />
      </CardFooter>
    </Card>
  )
}

function TaskStatus(props: { status: Task['status'] }) {
  const status = states[props.status]

  return (
    <Box color={status.color} rounded="full" aria-label={status.label}>
      {status.icon}
    </Box>
  )
}

function TaskProperty(props: { id: TaskPropertyId; value: string | number }) {
  const property = properties[props.id]

  if (!property) {
    return null
  }

  return (
    <Property key={props.id} color="muted">
      <PropertyLabel display="flex" width="3" aria-label={property.label}>
        {runIfFn(property.icon, props.value)}
      </PropertyLabel>
      <PropertyValue>
        {'value' in property
          ? runIfFn(property.value, props.value)
          : props.value}
      </PropertyValue>
    </Property>
  )
}

function runIfFn<T extends React.ReactNode>(
  prop: T | ((...args: any[]) => T),
  ...args: any[]
) {
  return typeof prop === 'function' ? prop(...args) : prop
}

function TaskTags(props: { tags: Array<string> }) {
  const visibleTags = props.tags.slice(0, 3)
  const hiddenTags = props.tags.slice(3).length

  return (
    <>
      {visibleTags?.map((id, i) => {
        const tag = tags.find((t) => t.id === id)

        if (!tag) {
          return null
        }

        return (
          <Tag
            key={i}
            variant="outline"
            mr="1"
            boxShadow="none"
            border="1px solid"
            borderColor="blackAlpha.300"
            color="gray.600"
            _dark={{
              borderColor: 'whiteAlpha.300',
              color: 'gray.300',
            }}
          >
            <Badge
              variant="solid"
              boxShadow="none"
              colorScheme={tag.color}
              boxSize="2"
              rounded="full"
              me="1"
            />
            {tag.label}
          </Tag>
        )
      })}
      {hiddenTags > 0 && (
        <Tag
          variant="outline"
          mr="1"
          boxShadow="none"
          border="1px dashed"
          borderColor="blackAlpha.300"
          color="muted"
          _dark={{
            borderColor: 'whiteAlpha.200',
          }}
        >
          +{hiddenTags}
        </Tag>
      )}
    </>
  )
}

const states = {
  backlog: {
    label: 'Backlog',
    color: 'gray',
    icon: <LuCircleDashed />,
  },
  'in-progress': {
    label: 'In progress',
    color: 'green',
    icon: <LuCircleDot />,
  },
  completed: {
    label: 'Completed',
    color: 'blue',
    icon: <LuCircleHelp />,
  },
}

type TaskState = keyof typeof states

const properties = {
  dueDate: {
    icon: <LuCalendar />,
    label: 'Due date',
  },
  milestone: {
    icon: <LuMilestone />,
    label: 'Milestone',
  },
  priority: {
    icon: (priority: Task['priority']) => priorities[priority]?.icon,
    label: 'Priority',
    value: (priority: Task['priority']) => priorities[priority]?.label,
  },
  subtasks: {
    icon: <LuListChecks />,
    label: 'Subtasks',
  },
}

type TaskPropertyId = keyof typeof properties

const priorities = {
  0: {
    label: 'None',
    icon: <LuSignalZero />,
  },
  1: {
    label: 'Low',
    icon: <LuSignalLow />,
  },
  2: {
    label: 'Medium',
    icon: <LuSignalMedium />,
  },
  3: {
    label: 'High',
    icon: <LuSignalHigh />,
  },
}

const tags = [
  {
    id: 'css',
    label: 'CSS',
    color: 'blue',
  },
  {
    id: 'ui',
    label: 'UI',
    color: 'green',
  },
  {
    id: 'javascript',
    label: 'Javascript',
    color: 'yellow',
  },
  {
    id: 'react',
    label: 'React',
    color: 'blue',
  },
]

type Priority = keyof typeof priorities
