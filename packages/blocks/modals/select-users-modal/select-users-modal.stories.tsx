import React from 'react'

import { Button, useDisclosure } from '@chakra-ui/react'
import { useSnackbar } from '@saas-ui/react'
import type { Meta } from '@storybook/react'

import { SelectListModal } from './select-users-modal'
import { UserPersona } from './user-persona'

export default {
  title: 'Blocks/Modals/SelectUsersModal',
} as Meta

export const Default = () => {
  const snackbar = useSnackbar()
  const { isOpen, onOpen, onClose } = useDisclosure({
    defaultIsOpen: true,
  })

  const users = [
    {
      id: 1,
      name: 'Horace Torp',
      email: 'Esta.Gibson@gmail.com',
      presence: 'busy',
    },
    {
      id: 2,
      name: 'Louis Bosco',
      email: 'Trenton1@yahoo.com',
      presence: 'online',
    },
    {
      id: 3,
      name: 'Cory Bauch',
      email: 'Beau_Corwin27@hotmail.com',
      presence: 'offline',
    },
    {
      id: 4,
      name: 'Dr. Tyrone Parker',
      email: 'Johann_Schaden47@gmail.com',
      presence: 'busy',
    },
    {
      id: 5,
      name: 'Ora Ryan',
      email: 'Bernadine91@hotmail.com',
      presence: 'online',
    },
    {
      id: 6,
      name: 'Martin Koss IV',
      email: 'Hardy_Swanaiwski@yahoo.com',
      presence: 'busy',
    },
    {
      id: 7,
      name: 'Christian Dach',
      email: 'Emily.Adams@yahoo.com',
      presence: 'away',
    },
    {
      id: 8,
      name: 'Angel Pfeffer',
      email: 'Horacio_McLaughlin@yahoo.com',
      presence: 'dnd',
    },
    {
      id: 9,
      name: 'Kathryn DuBuque',
      email: 'Manuel22@yahoo.com',
      presence: 'offline',
    },
  ]

  return (
    <>
      <Button onClick={onOpen} variant="primary" colorScheme="purple">
        Open Modal
      </Button>
      <SelectListModal
        items={users}
        renderItem={(user) => (
          <UserPersona
            key={user.id}
            name={user.name}
            email={user.email.toLowerCase()}
            presence={user.presence}
          />
        )}
        filterFn={(item, query) => {
          const q = query.toLowerCase()
          return (
            item.name.toLowerCase().includes(q) ||
            item.email.toLowerCase().includes(q)
          )
        }}
        isOpen={isOpen}
        onClose={onClose}
        title="Select users"
        description="Add or remove users from the project"
        onSubmit={(items) => {
          snackbar.info(`You selected ${items.length} users.`)
          onClose()
        }}
        // These properties are only required for demo purposes
        blockScrollOnMount={false}
        trapFocus={false}
      />
    </>
  )
}
