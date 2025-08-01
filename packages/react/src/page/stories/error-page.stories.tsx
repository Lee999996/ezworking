import * as React from 'react'

import { Button } from '@chakra-ui/react'
import { AppShell } from '@saas-ui/react'
import { Meta, Story } from '@storybook/react'
import { FiAlertCircle } from 'react-icons/fi'

import { ErrorPage, ErrorPageProps } from '..'

export default {
  title: 'Components/Layout/ErrorPage',
  decorators: [
    (Story: any) => (
      <AppShell borderWidth="1px" variant="default" height="calc(100vh - 40px)">
        <Story />
      </AppShell>
    ),
  ],
} as Meta

const Template: Story<ErrorPageProps> = (args) => <ErrorPage {...args} />

export const Basic = Template.bind({})
Basic.args = {
  icon: FiAlertCircle,
  title: 'Oops, something went wrong.',
  description: 'We have been notified about the problem',
}

export const WithActions = Template.bind({})
WithActions.args = {
  icon: FiAlertCircle,
  title: 'Oops, something went wrong.',
  description: 'We have been notified about the problem',
  actions: (
    <>
      <Button>Home</Button>
      <Button variant="ghost">Refresh page</Button>
    </>
  ),
}

export const WithColor = Template.bind({})
WithColor.args = {
  icon: FiAlertCircle,
  title: 'Oops, something went wrong.',
  colorScheme: 'red',
  description: 'We have been notified about the problem',
  actions: (
    <>
      <Button colorScheme="red" variant="subtle">
        Home
      </Button>
      <Button variant="ghost">Refresh page</Button>
    </>
  ),
}
