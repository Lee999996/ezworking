import {
  Card,
  CardHeader,
  Divider,
  FormLabel,
  Heading,
  Switch,
  Text,
} from '@chakra-ui/react'
import {
  StructuredList,
  StructuredListCell,
  StructuredListHeader,
  StructuredListItem,
} from '@saas-ui/react'

interface NotificationItemProps {
  title: string
  name: string
  description?: string
  isChecked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
}

const NotificationItem: React.FC<NotificationItemProps> = (props) => {
  const { title, name, description, defaultChecked, isChecked, onChange } =
    props
  return (
    <StructuredListItem>
      <StructuredListCell flex="1">
        <FormLabel
          htmlFor={name}
          size="sm"
          fontWeight="normal"
          m="0"
          userSelect="none"
        >
          {title}
        </FormLabel>
        {description ? (
          <Text color="muted" size="sm">
            {description}
          </Text>
        ) : null}
      </StructuredListCell>
      <StructuredListCell>
        <Switch
          id={name}
          defaultChecked={defaultChecked}
          isChecked={isChecked}
          onChange={(e) => onChange?.(!!e.target.value)}
        />
      </StructuredListCell>
    </StructuredListItem>
  )
}

export function NotificationSettings() {
  return (
    <Card minW="400px">
      <CardHeader>
        <Heading size="sm" fontWeight="semibold">
          Notifications
        </Heading>
      </CardHeader>
      <StructuredList>
        <StructuredListHeader fontWeight="regular" fontSize="sm" px="4">
          Contacts
        </StructuredListHeader>
        <NotificationItem
          name="lead-added"
          title="A new lead is added."
          defaultChecked
        />
        <NotificationItem
          name="account-upgraded"
          title="An account has upgraded."
        />
      </StructuredList>
      <Divider />
      <StructuredList>
        <StructuredListHeader fontWeight="regular" fontSize="sm" px="4">
          Inbox
        </StructuredListHeader>
        <NotificationItem
          name="assigned"
          title="A message is assigned to me."
        />
        <NotificationItem
          name="mentioned"
          title="Somebody mentions me."
          defaultChecked
        />
      </StructuredList>
    </Card>
  )
}
