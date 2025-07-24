'use client'

import * as React from 'react'

import {
  Menu,
  MenuList,
  MenuProps,
  mergeRefs,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useRect } from '@radix-ui/react-use-rect'
import { MenuDialogList, MenuDialogListProps } from '@saas-ui/react'
import type { Measurable } from '@zag-js/dom-utils'

import {
  ResponseMenuContext,
  useResponsiveMenuContext,
} from './responsive-menu-context'

export interface ResponsiveMenuProps extends MenuProps {
  /**
   * The breakpoints to use for the responsive menu.
   * @default { base: true, md: false }
   */
  breakpoints?: Record<string, boolean | string> | (string | boolean)[]
}

export const ResponsiveMenu: React.FC<ResponsiveMenuProps> = (props) => {
  const { breakpoints = { base: true, md: false }, ...rest } = props
  const isMobile = useBreakpointValue(breakpoints)

  return (
    <ResponseMenuContext value={{ breakpoints }}>
      <Menu variant={isMobile ? 'dialog' : 'menu'} {...rest} />
    </ResponseMenuContext>
  )
}

export const ResponsiveMenuList = React.forwardRef<
  HTMLDivElement,
  MenuDialogListProps
>((props, ref) => {
  const {
    children,
    title,
    closeOnOverlayClick,
    onOverlayClick,
    onEsc,
    useInert,
    hideCloseButton,
    initialFocusRef,
    ...rest
  } = props

  const [list, setList] = React.useState<Measurable | null>(null)

  const context = useResponsiveMenuContext()

  const isMobile = useBreakpointValue(context.breakpoints)

  const rect = useRect(list)

  const availableHeight = `calc(100dvh - ${rect?.top}px - 0.5rem)`

  const style = {
    '--available-height': availableHeight,
    ...rest.style,
  }

  if (isMobile) {
    const dialogProps = {
      title,
      closeOnOverlayClick,
      onOverlayClick,
      onEsc,
      useInert,
      hideCloseButton,
      initialFocusRef,
    }
    return (
      <MenuDialogList
        ref={mergeRefs((el) => setList(el), ref)}
        maxHeight="var(--available-height)"
        {...dialogProps}
        {...rest}
        style={style}
      >
        {children}
      </MenuDialogList>
    )
  }

  return (
    <MenuList
      ref={mergeRefs((el) => setList(el), ref)}
      maxHeight="var(--available-height)"
      {...rest}
      style={style}
    >
      {children}
    </MenuList>
  )
})
