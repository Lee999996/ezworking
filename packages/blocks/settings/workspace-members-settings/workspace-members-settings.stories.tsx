import React from 'react'

import type { Meta } from '@storybook/react'

import {
  type Member,
  WorkspaceMembersSettings,
} from './workspace-members-settings'

export default {
  title: 'Blocks/Settings/Workspace Members Settings',
  decorators: [(Story) => <Story />],
} as Meta

const members: Array<Member> = [
  {
    name: 'Renata Alink',
    email: 'hello@saas-ui.dev',
    presence: 'online',
    status: 'owner',
    avatar: '/showcase-avatar.jpg',
  },
  {
    name: 'Selini Shanta',
    email: 'selini@saas-ui.dev',
    presence: 'offline',
    status: 'invited',
    avatar: '/showcase-avatar2.jpg',
  },
]

export const Default = () => <WorkspaceMembersSettings members={members} />
