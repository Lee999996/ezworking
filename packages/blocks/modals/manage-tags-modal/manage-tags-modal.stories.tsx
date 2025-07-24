import React, { useState } from 'react'

import { Button, useDisclosure } from '@chakra-ui/react'
import type { Meta } from '@storybook/react'

import { ManageTagsModal, type Tag } from './manage-tags-modal'

export default {
  title: 'Blocks/Modals/ManageTagsModal',
} as Meta

export const Default = () => {
  const disclosure = useDisclosure({
    defaultIsOpen: true,
  })

  const [items, setItems] = useState<Tag[]>([
    {
      id: '1',
      name: 'Feature',
      count: 15,
      color: 'green',
    },
    {
      id: '2',
      name: 'Javascript',
      count: 4,
      color: 'blue',
    },
    {
      id: '3',
      name: 'Bug',
      count: 12,
      color: 'yellow',
    },
    {
      id: '4',
      name: 'Beta',
      count: 14,
      color: 'red',
    },
    {
      id: '5',
      name: 'Backend',
      count: 5,
      color: 'green',
    },
    {
      id: '6',
      name: 'Design',
      count: 2,
      color: 'purple',
    },
    {
      id: '7',
      name: 'UI',
      count: 6,
      color: 'red',
    },
    {
      id: '8',
      name: 'Discussion',
      count: 54,
      color: 'gray',
    },
  ])

  return (
    <>
      <Button onClick={disclosure.onOpen} variant="primary">
        Manage tags
      </Button>

      <ManageTagsModal
        {...disclosure}
        items={items}
        onSave={async (item) => {
          setItems((items) => {
            const index = items.findIndex((i) => i.id === item.id)
            items[index] = item
            return [...items].sort((a, b) => a.name.localeCompare(b.name))
          })
        }}
        onCreate={async (item) => {
          const tag = {
            id: `${items.length + 1}`,
            name: item.name,
            count: 0,
            color: item.color,
          }
          setItems((items) =>
            [...items, tag].sort((a, b) => a.name.localeCompare(b.name)),
          )
        }}
        onDelete={async (id) => {
          setItems((items) => {
            const index = items.findIndex((i) => i.id === id)
            items.splice(index, 1)
            return [...items]
          })
        }}
        // These properties are only required for demo purposes
        blockScrollOnMount={false}
        trapFocus={false}
      />
    </>
  )
}
