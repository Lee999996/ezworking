'use client'

import * as React from 'react'

import {
  UseMenuItemProps,
  mergeRefs,
  useMenuContext,
  useMenuDescendant,
} from '@chakra-ui/react'
import { useClickable } from '@chakra-ui/react/clickable'
import { dataAttr, getOwnerDocument } from '@chakra-ui/utils'

function isActiveElement(element: HTMLElement) {
  const doc = getOwnerDocument(element)
  return doc.activeElement === (element as HTMLElement)
}

function isHTMLElement(el: any): el is HTMLElement {
  if (!isElement(el)) return false
  const win = el.ownerDocument.defaultView ?? window
  return el instanceof win.HTMLElement
}

function isElement(el: any): el is Element {
  return (
    el != null &&
    typeof el == 'object' &&
    'nodeType' in el &&
    el.nodeType === Node.ELEMENT_NODE
  )
}

function isTargetMenuItem(target: EventTarget | null) {
  // this will catch `menuitem`, `menuitemradio`, `menuitemcheckbox`
  return (
    isHTMLElement(target) &&
    !!target.getAttribute('role')?.startsWith('menuitem')
  )
}

export interface UseMenuFilterItemProps extends UseMenuItemProps {}

export function useMenuFilterItem(
  props: UseMenuFilterItemProps = {},
  externalRef: React.Ref<any> = null,
) {
  const {
    onMouseEnter: onMouseEnterProp,
    onMouseMove: onMouseMoveProp,
    onMouseLeave: onMouseLeaveProp,
    onClick: onClickProp,
    isDisabled,
    isFocusable,
    closeOnSelect,
    ...htmlProps
  } = props

  const menu = useMenuContext()

  const {
    setFocusedIndex,
    focusedIndex,
    closeOnSelect: menuCloseOnSelect,
    onClose,
    menuId,
  } = menu

  const ref = React.useRef<HTMLDivElement>(null)
  const id = `${menuId}-menuitem-${React.useId()}`

  /**
   * Register the menuitem's node into the domContext
   */
  const { index, register } = useMenuDescendant({
    disabled: isDisabled && !isFocusable,
  })

  const onMouseEnter = React.useCallback(
    (event: React.MouseEvent) => {
      onMouseEnterProp?.(event)
      if (isDisabled) return
      setFocusedIndex(index)
    },
    [setFocusedIndex, index, isDisabled, onMouseEnterProp],
  )

  const onMouseMove = React.useCallback(
    (event: React.MouseEvent) => {
      onMouseMoveProp?.(event)
      if (ref.current && !isActiveElement(ref.current)) {
        onMouseEnter(event)
      }
    },
    [onMouseEnter, onMouseMoveProp],
  )

  const onMouseLeave = React.useCallback(
    (event: React.MouseEvent) => {
      onMouseLeaveProp?.(event)
      if (isDisabled) return
      setFocusedIndex(-1)
    },
    [setFocusedIndex, isDisabled, onMouseLeaveProp],
  )

  const onClick = React.useCallback(
    (event: React.MouseEvent) => {
      onClickProp?.(event)
      if (!isTargetMenuItem(event.currentTarget)) return
      /**
       * Close menu and parent menus, allowing the MenuItem
       * to override its parent menu's `closeOnSelect` prop.
       */
      if (closeOnSelect ?? menuCloseOnSelect) {
        onClose()
      }
    },
    [onClose, onClickProp, menuCloseOnSelect, closeOnSelect],
  )

  const isFocused = index === focusedIndex

  const clickableProps = useClickable({
    onClick,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    ref: mergeRefs(register, ref, externalRef),
    isDisabled,
    isFocusable,
  })

  return {
    ...htmlProps,
    ...clickableProps,
    id,
    role: 'menuitem',
    tabIndex: isFocused ? 0 : -1,
    'data-focus': dataAttr(isFocused),
  }
}
