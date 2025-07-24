import * as React from 'react'

import { Skeleton, SkeletonText, Stack } from '@chakra-ui/react'
import { Page, PageBody } from '@saas-ui-pro/react'
import type { Meta } from '@storybook/react'

import { NavbarTabs } from './navbar-tabs'

export default {
  title: 'Blocks/StackedLayouts/NavbarTabs',
} as Meta

export const Default = () => (
  <NavbarTabs>
    <Page>
      <PageBody overflow="visible">
        <Stack spacing="4" mb="14" pt="10">
          <Skeleton width="100px" height="24px" speed={0} />
          <SkeletonText speed={0} />
        </Stack>
        <Stack direction="row" spacing="8" mb="14">
          <Stack spacing="4" flex="1">
            <Skeleton width="100px" height="20px" speed={0} />
            <SkeletonText speed={0} />
          </Stack>
          <Stack spacing="4" flex="1">
            <Skeleton width="100px" height="20px" speed={0} />
            <SkeletonText speed={0} />
          </Stack>
        </Stack>
        <Stack direction="row" spacing="8" mb="14">
          <Stack spacing="4" flex="1">
            <Skeleton width="100px" height="20px" speed={0} />
            <SkeletonText speed={0} />
          </Stack>
          <Stack spacing="4" flex="1">
            <Skeleton width="100px" height="20px" speed={0} />
            <SkeletonText speed={0} />
          </Stack>
        </Stack>
        <Stack direction="row" spacing="8">
          <Stack spacing="4" flex="1">
            <Skeleton width="100px" height="20px" speed={0} />
            <SkeletonText speed={0} />
          </Stack>
          <Stack spacing="4" flex="1">
            <Skeleton width="100px" height="20px" speed={0} />
            <SkeletonText speed={0} />
          </Stack>
        </Stack>
      </PageBody>
    </Page>
  </NavbarTabs>
)
