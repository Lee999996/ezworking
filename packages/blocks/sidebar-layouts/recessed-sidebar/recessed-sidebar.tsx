import * as React from 'react'

import {
  Avatar,
  Badge,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react'
import { SaasUIIcon } from '@saas-ui/assets'
import {
  AppShell,
  NavGroup,
  NavItem,
  Sidebar,
  SidebarSection,
} from '@saas-ui/react'
import {
  ChevronsUpDownIcon,
  LightbulbIcon,
  ListChecksIcon,
  UsersIcon,
} from 'lucide-react'

const tags = [
  {
    id: 'lead',
    name: 'Lead',
    count: 83,
    color: 'purple.500',
  },
  {
    id: 'customer',
    name: 'Customer',
    count: 210,
    color: 'green.500',
  },
  {
    id: 'partner',
    name: 'Partner',
    count: 12,
    color: 'blue.500',
  },
  {
    id: 'prospect',
    name: 'Prospect',
    count: 0,
  },
]

export interface RecessedSidebarProps {
  children: React.ReactNode
}

export const RecessedSidebar: React.FC<RecessedSidebarProps> = (props) => {
  return (
    <AppShell
      variant="static"
      height="600px"
      bg="gray.50"
      _dark={{ bg: 'gray.900' }}
      sidebar={
        <Sidebar bg="gray.50" _dark={{ bg: 'gray.900' }} borderRightWidth="0">
          <SidebarSection pt="3">
            <Menu>
              <MenuButton
                as={Button}
                leftIcon={
                  <Avatar
                    icon={<SaasUIIcon width="14px" color="currentColor" />}
                    bg="neutral"
                    color="neutral-fg"
                    size="sm"
                  />
                }
                rightIcon={<ChevronsUpDownIcon size="1em" />}
                variant="ghost"
                textAlign="left"
                w="full"
                h="10"
                px="2"
              >
                Acme Corp
              </MenuButton>
              <MenuList>
                <MenuItem>Acme Corp</MenuItem>
                <MenuDivider />
                <MenuItem>Create workspace</MenuItem>
              </MenuList>
            </Menu>
          </SidebarSection>
          <SidebarSection flex="1" overflowY="auto" pb="8">
            <NavGroup isCollapsible={false}>
              <NavItem
                href="#"
                icon={<UsersIcon />}
                isActive
                variant="left-accent"
              >
                Contacts
              </NavItem>
              <NavItem href="#" icon={<ListChecksIcon />} variant="left-accent">
                Tasks
              </NavItem>
              <NavItem href="#" icon={<LightbulbIcon />} variant="left-accent">
                Insights
              </NavItem>
            </NavGroup>

            <NavGroup title="Tags" isCollapsible>
              {tags.map((tag) => (
                <NavItem
                  key={tag.id}
                  my="0"
                  variant="left-accent"
                  icon={
                    <Badge
                      bg={tag.color || 'gray.500'}
                      boxSize="2"
                      borderRadius="full"
                    />
                  }
                >
                  <Text>{tag.name}</Text>
                  <Badge
                    opacity="0.6"
                    borderRadius="full"
                    bg="none"
                    ms="auto"
                    fontWeight="medium"
                  >
                    {tag.count}
                  </Badge>
                </NavItem>
              ))}
            </NavGroup>
            <IconButton
              aria-label="Help &amp; Support"
              isRound
              position="absolute"
              bottom="2"
              variant="outline"
              size="xs"
              bg="app-background"
              zIndex="overlay"
            >
              <span>?</span>
            </IconButton>
          </SidebarSection>
        </Sidebar>
      }
    >
      {props.children}
    </AppShell>
  )
}
