import * as React from 'react'

import { useDisclosure } from '@chakra-ui/react'
import { Meta } from '@storybook/react'

import {
  AddContactDrawer,
  type AddContactFormValues,
} from './add-contact-drawer'

export default {
  title: 'Blocks/Drawers/AddContact',
} as Meta

export const Default = () => {
  const disclosure = useDisclosure({
    defaultIsOpen: true,
  })

  const onSubmit = (data: AddContactFormValues) => {
    console.log(data)
  }

  return (
    <AddContactDrawer
      {...disclosure}
      blockScrollOnMount={false}
      onSubmit={onSubmit}
    />
  )
}
