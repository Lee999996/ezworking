import * as React from 'react'

import { Page, PageHeader } from '@saas-ui-pro/react'
import type { Meta } from '@storybook/react'

import { SidebarWithNavbar } from './sidebar-with-navbar'

export default {
  title: 'Blocks/SidebarLayouts/SidebarWithNavbar',
} as Meta

export const Default = () => (
  <SidebarWithNavbar>
    <Page>
      <PageHeader title="Overview"></PageHeader>
    </Page>
  </SidebarWithNavbar>
)
