import * as React from 'react'

import { Box, Tab, TabList, Tabs } from '@chakra-ui/react'
import { Page, PageHeader, Toolbar, ToolbarButton } from '@saas-ui-pro/react'
import { SidebarToggleButton } from '@saas-ui/react'
import { Meta } from '@storybook/react'
import { FiPlus, FiSearch } from 'react-icons/fi'

import { RecessedSidebar } from './recessed-sidebar'

export default {
  title: 'Blocks/SidebarLayouts/RecessedSidebar',
  decorators: [(Story) => <Story />],
} as Meta

export const Default = () => (
  <RecessedSidebar>
    <Page
      variant="plain"
      mt="4"
      boxShadow="0 0 6px 0 rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      borderTopLeftRadius="md"
      bg="white"
      zIndex={{ base: undefined, lg: 'base' }}
      _dark={{
        bg: 'black',
      }}
    >
      <PageHeader
        title="Contacts"
        nav={
          <Box w={{ base: '9', lg: '0' }}>
            <SidebarToggleButton top="7" left="3" />
          </Box>
        }
        toolbar={
          <Toolbar>
            <ToolbarButton
              label="Search"
              icon={<FiSearch size="1.2em" />}
              rounded="full"
            />
            <ToolbarButton
              label="Add person"
              icon={<FiPlus size="1.2em" />}
              variant="primary"
              rounded="full"
            />
          </Toolbar>
        }
        footer={
          <Tabs mx="-4" colorScheme="primary">
            <TabList px="4" borderBottomWidth="1px">
              <Tab>All</Tab>
              <Tab>Leads</Tab>
              <Tab>Customers</Tab>
            </TabList>
          </Tabs>
        }
      />
    </Page>
  </RecessedSidebar>
)
