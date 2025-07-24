'use client'

import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Box,
  Text,
} from '@chakra-ui/react'
import { useAuth } from '@saas-ui/auth'
import { PersonaAvatar } from '@saas-ui/react'

// Helper function to get the correct initials
const getInitials = (name?: string | null): string => {
  if (!name) return ''

  // Check if the name contains Chinese characters
  if (/[\u4e00-\u9fa5]/.test(name)) {
    return name.charAt(0)
  }

  // Fallback for English names or other scripts
  const words = name.split(' ')
  if (words.length > 1) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export const UserMenu = () => {
  const { user, logOut } = useAuth()

  const displayName = user?.user_metadata?.name || user?.email
  const avatarName = getInitials(user?.user_metadata?.name)

  return (
    <Menu>
      <MenuButton>
        <PersonaAvatar name={avatarName} boxSize="40px" />
      </MenuButton>
      <MenuList>
        <MenuGroup>
          <Box px={3} py={2}>
            <Text fontWeight="medium" ml={4}>{displayName}</Text>
            <Text fontSize="sm" color="gray.500" ml={4}>{user?.email}</Text>
          </Box>
        </MenuGroup>
        <MenuDivider />
        <MenuItem onClick={() => logOut()} justifyContent="center" textAlign="center">
          退出登录
        </MenuItem>
      </MenuList>
    </Menu>
  )
} 