import * as React from 'react'

import { Box } from '@chakra-ui/react'
import {
  DndContext,
  DndContextProps,
  DragEndEvent,
  DragOverlay,
  UniqueIdentifier,
  closestCenter,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { NavGroup, NavGroupProps, NavItem, NavItemProps } from '@saas-ui/react'
import { LuGripVertical } from 'react-icons/lu'

export interface SortableNavGroupProps
  extends Omit<NavGroupProps, 'onDragStart' | 'onDragEnd' | 'onDragOver'>,
    DndContextProps {
  items: any[]
  onSorted?: (fn: (items: any[]) => any[]) => void
}

export const SortableNavGroup: React.FC<SortableNavGroupProps> = (props) => {
  const {
    children,
    onDragStart,
    onDragOver,
    onDragEnd,
    onSorted,
    items,
    ...rest
  } = props

  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null)
  const getIndex = (id: UniqueIdentifier) =>
    items.findIndex((item) => item.id === id)
  const activeIndex = activeId ? getIndex(activeId) : -1
  const activeItem = (
    React.Children.toArray(children) as React.ReactElement[]
  ).find(
    (child) => child.type === SortableNavItem && child.props.id === activeId,
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event

    if (over) {
      const overIndex = getIndex(over.id)
      if (activeIndex !== overIndex) {
        onSorted?.((items) => arrayMove(items, activeIndex, overIndex))
      }
    }

    setActiveId(null)
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={(event) => {
        if (!event.active) {
          return
        }
        setActiveId(event.active.id)
        onDragStart?.(event)
      }}
      onDragOver={onDragOver}
      onDragEnd={(event) => {
        handleDragEnd(event)
        onDragEnd?.(event)
      }}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={items}>
        <NavGroup {...rest}>{children}</NavGroup>
      </SortableContext>
      <DragOverlay
        dropAnimation={{
          duration: 50,
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.2',
              },
            },
          }),
        }}
      >
        {activeItem ? (
          <NavItem
            {...activeItem.props}
            my="0"
            _hover={{ bg: 'transparent' }}
            opacity="0.8"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export interface SortableNavItemProps extends NavItemProps {
  id: string
  handle?: React.ReactNode
}

export const SortableNavItem: React.FC<SortableNavItemProps> = (props) => {
  const { id, children, handle, ...rest } = props

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    transition: { duration: 150, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' },
  })

  const itemProps = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : undefined,
    ...attributes,
    ...listeners,
  }

  return (
    <NavItem
      ref={setNodeRef}
      {...rest}
      {...itemProps}
      data-dragging={isDragging || !!transform}
      data-sortable
      sx={{
        position: 'relative',
        a: {
          userSelect: 'none',
          WebkitUserDrag: 'none',
        },
      }}
    >
      {handle ?? (
        <Box
          display="none"
          pos="absolute"
          left="-10px"
          color="muted"
          opacity="0.6"
          cursor="grab"
          data-drag-handle
          sx={{
            '[data-sortable]:hover &': { display: 'block' },
            '[data-dragging] &': { display: 'none' },
          }}
        >
          <LuGripVertical size="12" />
        </Box>
      )}
      {children}
    </NavItem>
  )
}
