import * as React from 'react'

import { Badge, Text } from '@chakra-ui/react'
import { Page, PageBody, PageHeader } from '@saas-ui-pro/react'
import { SaasUILogo } from '@saas-ui/assets'
import {
  AppShell,
  NavGroup,
  NavItem,
  Sidebar,
  SidebarSection,
} from '@saas-ui/react'
import type { Meta } from '@storybook/react'
import { LuHouse, LuSettings, LuUsers } from 'react-icons/lu'

import { SortableNavGroup, SortableNavItem } from './sortable-nav-group'

export default {
  title: 'Blocks/SidebarLayouts/SortableNavGroupItems',
} as Meta

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

export const Default = () => {
  const [sortedTags, setTags] = React.useState(tags)
  return (
    <AppShell
      variant="static"
      height="600px"
      bg="app-background"
      sidebar={
        <Sidebar>
          <SidebarSection>
            <SaasUILogo width="100px" />
          </SidebarSection>
          <SidebarSection flex="1" overflowY="auto">
            <NavGroup>
              <NavItem href="#" icon={<LuHouse size="1.2em" />}>
                Home
              </NavItem>
              <NavItem href="#" icon={<LuUsers size="1.2em" />} isActive>
                Contacts
              </NavItem>
              <NavItem href="#" icon={<LuSettings size="1.2em" />}>
                Settings
              </NavItem>
            </NavGroup>
            <SortableNavGroup
              title="Tags"
              isCollapsible
              items={sortedTags}
              onSorted={setTags}
            >
              {sortedTags.map((tag) => (
                <SortableNavItem
                  key={tag.id}
                  id={tag.id}
                  href="#"
                  my="0"
                  icon={
                    <Badge
                      bg={tag.color || 'gray.500'}
                      boxSize="2"
                      borderRadius="full"
                      variant="solid"
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
                </SortableNavItem>
              ))}
            </SortableNavGroup>
          </SidebarSection>
        </Sidebar>
      }
    >
      <Page>
        <PageHeader title=""></PageHeader>
        <PageBody></PageBody>
      </Page>
    </AppShell>
  )
}
