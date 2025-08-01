import * as React from 'react'

import {
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react'
import { PersonaAvatar } from '@saas-ui/react'

export const UserMenu = () => {
  const user = {
    name: 'Renata Alink',
    email: 'renata@alink.com',
    avatar: 'https://saas-ui.dev/showcase-avatar.jpg',
    presence: 'online',
  }

  return (
    <Menu defaultIsOpen>
      <MenuButton as={Button}>{user.name}</MenuButton>
      <MenuList>
        <MenuGroup
          title="Signed in as"
          fontWeight="medium"
          color="muted"
          mt="0"
        >
          <MenuItem
            icon={
              <PersonaAvatar
                size="sm"
                name={user.name}
                src={user.avatar}
                presence={user.presence}
              />
            }
          >
            <Stack spacing="0">
              <Text>{user.name}</Text>
              <Text fontSize="sm" color="muted">
                {user.email}
              </Text>
            </Stack>
          </MenuItem>
        </MenuGroup>
        <MenuDivider />
        <MenuGroup>
          <MenuItem>Profile</MenuItem>
          <MenuItem>Settings</MenuItem>
        </MenuGroup>
        <MenuDivider />
        <MenuGroup>
          <MenuItem>Changelog</MenuItem>
          <MenuItem>Help</MenuItem>
          <MenuItem>Feedback</MenuItem>
        </MenuGroup>
        <MenuDivider />
        <MenuGroup>
          <MenuItem>Sign out</MenuItem>
        </MenuGroup>
      </MenuList>
    </Menu>
  )
}
