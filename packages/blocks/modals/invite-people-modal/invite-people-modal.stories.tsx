import * as React from 'react'

import { Button, useDisclosure } from '@chakra-ui/react'
import type { Meta } from '@storybook/react'

import { InvitePeopleModal } from './invite-people-modal'

export default {
  title: 'Blocks/Modals/InvitePeopleModal',
} as Meta

export const Default = () => {
  const disclosure = useDisclosure({
    defaultIsOpen: true,
  })

  return (
    <>
      <Button onClick={disclosure.onOpen}>Invite people</Button>
      <InvitePeopleModal
        {...disclosure}
        onSubmit={async (data) => {
          console.log(data)
        }}
      />
    </>
  )
}
