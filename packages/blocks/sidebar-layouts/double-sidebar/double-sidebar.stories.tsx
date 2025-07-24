import * as React from 'react'

import { Page, PageBody, PageHeader } from '@saas-ui-pro/react'
import type { Meta } from '@storybook/react'

import { DoubleSidebar } from './double-sidebar'

export default {
  title: 'Blocks/SidebarLayouts/DoubleSidebar',
} as Meta

export const Default = () => (
  <DoubleSidebar>
    <Page>
      <PageHeader title="Overview" />
      <PageBody></PageBody>
    </Page>
  </DoubleSidebar>
)
