import * as React from 'react'

import { Box, Tab, TabList, Tabs } from '@chakra-ui/react'
import { Page, PageHeader, Toolbar, ToolbarButton } from '@saas-ui-pro/react'
import { SidebarToggleButton } from '@saas-ui/react'
import type { Meta } from '@storybook/react'
import { RiAddLine, RiSearch2Line } from 'react-icons/ri'

import { RecessedSidebarContrast } from './recessed-sidebar-contrast'

export default {
  title: 'Blocks/SidebarLayouts/RecessedSidebarContrast',
  decorators: [(Story) => <Story />],
} as Meta

export const Default = () => (
  <RecessedSidebarContrast>
    <Page
      variant="plain"
      mt="4"
      boxShadow="0 0 6px 0 rgba(0, 0, 0, 0.1),0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      borderTopLeftRadius="md"
      bg="app-background"
      zIndex={{ base: undefined, lg: 'base' }}
    >
      <PageHeader
        title="My tasks"
        nav={
          <Box w={{ base: '9', lg: '0' }}>
            <SidebarToggleButton
              top="7"
              left="3"
              sx={{
                '&[data-state=open]': {
                  color: 'white',
                  _hover: {
                    bg: 'whiteAlpha.200',
                  },
                },
              }}
            />
          </Box>
        }
        toolbar={
          <Toolbar>
            <ToolbarButton
              label="Search"
              icon={<RiSearch2Line size="1.2em" />}
              rounded="full"
            />
            <ToolbarButton
              label="Add person"
              icon={<RiAddLine size="1.2em" />}
              variant="solid"
              colorScheme="neutral"
              rounded="full"
            />
          </Toolbar>
        }
        footer={
          <Tabs variant="segments-solid" size="xs">
            <TabList>
              <Tab>Assigned</Tab>
              <Tab>Created</Tab>
              <Tab>Subscribed</Tab>
            </TabList>
          </Tabs>
        }
      />
    </Page>
  </RecessedSidebarContrast>
)
