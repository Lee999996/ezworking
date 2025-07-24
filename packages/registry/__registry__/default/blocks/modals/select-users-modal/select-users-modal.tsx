import React, { useMemo, useState } from 'react'

import {
  Button,
  Checkbox,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  SearchInput,
  StructuredList,
  StructuredListCell,
  StructuredListItem,
} from '@saas-ui/react'

export interface SelectListModalItem {
  id: string | number
  label?: string
}

export interface SelectListModalProps<
  Item extends SelectListModalItem = SelectListModalItem,
> extends Omit<ModalProps, 'children'> {
  title?: string
  description?: string
  searchPlaceholder?: string
  items: Item[]
  renderItem?: (item: Item) => React.ReactNode
  filterFn?: (item: Item, searchTerm: string) => boolean
  onSubmit?: (ids: Item['id'][]) => void
}

export const SelectListModal = <
  Item extends SelectListModalItem = SelectListModalItem,
>(
  props: SelectListModalProps<Item>,
) => {
  const { onClose, items, filterFn, ...rest } = props
  const [selected, setSelected] = useState<(string | number)[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleSelect = (id: string | number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    )
  }

  const filteredItems = useMemo(() => {
    if (!searchTerm) {
      return items
    }

    return items.filter((item) => {
      if (filterFn) {
        return filterFn(item, searchTerm)
      }
      return item.label?.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [items, searchTerm])

  const renderItem = React.useCallback(
    (item: Item) => {
      if (props.renderItem) {
        return props.renderItem(item)
      }
      return <Text>{item.label}</Text>
    },
    [props.renderItem],
  )

  const noResults = searchTerm && filteredItems.length === 0 && (
    <StructuredListItem>
      <StructuredListCell py="2" px="4" textAlign="center">
        No results for "{searchTerm}"
      </StructuredListCell>
    </StructuredListItem>
  )

  return (
    <Modal onClose={onClose} initialFocusRef={inputRef} {...rest}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader borderBottomWidth="1px">
          <Stack align="left" justify="space-between" dir="column" spacing="1">
            <ModalCloseButton />
            <Heading fontSize="lg" fontWeight="medium">
              {props.title}
            </Heading>
            <Text fontSize="sm" fontWeight="normal" color="muted" mb={2}>
              {props.description}
            </Text>
            <SearchInput
              ref={inputRef}
              size="sm"
              placeholder={props.searchPlaceholder || 'Search...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onReset={() => setSearchTerm('')}
              onKeyDown={(e) => {
                // prevent modal from closing
                if (e.key === 'Escape') {
                  e.preventDefault()
                  e.stopPropagation()
                }
              }}
            />
          </Stack>
        </ModalHeader>

        <ModalBody p="0">
          <StructuredList overflowY="auto" maxHeight="$80vh" py="0">
            {noResults}
            {filteredItems.map((item) => (
              <StructuredListItem
                key={item.id}
                onClick={() => handleSelect(item.id)}
                data-selected={selected.includes(item.id) ? '' : undefined}
                _selected={{
                  backgroundColor: 'blackAlpha.100',
                  _dark: {
                    backgroundColor: 'whiteAlpha.100',
                  },
                }}
                onKeyUp={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSelect(item.id)
                  }
                }}
              >
                <StructuredListCell ps="4">
                  {renderItem(item)}
                </StructuredListCell>
                <StructuredListCell pe="4">
                  <Checkbox
                    key={item.id}
                    isChecked={selected.includes(item.id)}
                    onChange={() => handleSelect(item.id)}
                  />
                </StructuredListCell>
              </StructuredListItem>
            ))}
          </StructuredList>
        </ModalBody>
        <ModalFooter borderTopWidth="1px">
          <Button variant="secondary" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => props.onSubmit?.(selected)}>
            Add users
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
