'use client'

import * as React from 'react'

import {
  HTMLChakraProps,
  Input,
  InputGroup,
  InputGroupProps,
  InputProps,
  InputRightElement,
  MenuCommand,
  MenuIcon,
  MenuItemProps,
  SystemStyleObject,
  chakra,
  forwardRef,
  mergeRefs,
  useMenuContext,
  useMenuDescendantsContext,
  useMultiStyleConfig,
} from '@chakra-ui/react'
import { cx } from '@chakra-ui/utils'

import { useMenuFilterItem } from './use-menu-filter-item'

const navigationKeys = ['ArrowUp', 'ArrowDown', 'Escape']

export interface MenuInputProps extends Omit<InputProps, 'type'> {
  command?: string
  groupProps?: InputGroupProps
}

export const MenuInput = forwardRef<MenuInputProps, 'div'>(
  (props, forwardRef) => {
    const { placeholder, command, groupProps, ...rest } = props

    const { focusedIndex } = useMenuContext()

    const { role, ref, contentEditable, ...inputProps } =
      useMenuFilterItem(rest)
    const descendants = useMenuDescendantsContext()

    return (
      <InputGroup
        role={role}
        className={cx('sui-menu-list__input')}
        borderBottomWidth="1px"
        borderBottomColor="chakra-border-color"
        position="sticky"
        top="0"
        zIndex="1"
        {...groupProps}
      >
        <Input
          type="text"
          position="sticky"
          placeholder={placeholder}
          borderBottomRadius="0"
          borderWidth="0"
          bg="var(--menu-bg)"
          _dark={{
            bg: 'var(--menu-bg)',
          }}
          _hover={{
            outline: 'none',
            boxShadow: 'none',
          }}
          _focus={{
            outline: 'none',
            boxShadow: 'none',
          }}
          _focusVisible={{
            outline: 'none',
            boxShadow: 'none',
          }}
          ref={mergeRefs(forwardRef, ref)}
          {...inputProps}
          onKeyDown={(event) => {
            const eventKey = event.key
            const keyMap: Record<string, (event: React.KeyboardEvent) => void> =
              {
                Enter: () => {
                  const item = descendants.item(focusedIndex)
                  item?.node?.click()
                },
              }

            const action = keyMap[eventKey]

            if (action) {
              event.preventDefault()
              event.stopPropagation()

              action(event)
            }

            if (!navigationKeys.includes(event.key)) {
              event.stopPropagation()
            }
          }}
        />
        {command && (
          <InputRightElement>
            <MenuCommand>{command}</MenuCommand>
          </InputRightElement>
        )}
      </InputGroup>
    )
  },
)

export interface StyledMenuItemProps extends HTMLChakraProps<'button'> {}

const StyledMenuItem = forwardRef<StyledMenuItemProps, 'button'>(
  (props, ref) => {
    const { type, ...rest } = props

    // @todo find a better way to do this, since useStyles is not supported anymore.
    const styles = useMultiStyleConfig('Menu')

    /**
     * Given another component, use its type if present
     * Else, use no type to avoid invalid html, e.g. <a type="button" />
     * Else, fall back to "button"
     */
    const btnType = rest.as ? (type ?? undefined) : 'button'

    const buttonStyles: SystemStyleObject = {
      textDecoration: 'none',
      color: 'inherit',
      userSelect: 'none',
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      textAlign: 'start',
      flex: '0 0 auto',
      outline: 0,
      ...styles.item,
    }

    return (
      <chakra.button ref={ref} type={btnType} {...rest} __css={buttonStyles} />
    )
  },
)

export const MenuFilterItem = forwardRef<MenuItemProps, 'button'>(
  (props, ref) => {
    const {
      icon,
      iconSpacing = '0.75rem',
      command,
      commandSpacing = '0.75rem',
      children,
      ...rest
    } = props

    const menuitemProps = useMenuFilterItem(
      rest,
      ref,
    ) as React.HTMLAttributes<HTMLElement>

    const shouldWrap = icon || command

    const _children = shouldWrap ? (
      <span style={{ pointerEvents: 'none', flex: 1 }}>{children}</span>
    ) : (
      children
    )

    return (
      <StyledMenuItem
        {...menuitemProps}
        className={cx('chakra-menu__menuitem', menuitemProps.className)}
      >
        {icon && (
          <MenuIcon fontSize="0.8em" marginEnd={iconSpacing}>
            {icon}
          </MenuIcon>
        )}
        {_children}
        {command && (
          <MenuCommand marginStart={commandSpacing}>{command}</MenuCommand>
        )}
      </StyledMenuItem>
    )
  },
)

MenuFilterItem.displayName = 'MenuFilterItem'
