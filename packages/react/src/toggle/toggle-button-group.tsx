'use client'

import * as React from 'react'

import {
  Box,
  Button,
  ButtonGroup,
  ButtonGroupProps,
  ButtonProps,
  UseCheckboxProps,
  forwardRef,
  useCheckbox,
} from '@chakra-ui/react'
import { createField } from '@saas-ui/forms'

import { Type, Value, useToggleGroup } from './use-toggle-group'

export interface ToggleButtonGroupProps<
  TValue extends Value = Value,
  TType extends Type = 'checkbox',
> extends Omit<ButtonGroupProps, 'defaultValue' | 'onChange'> {
  type?: TType
  value?: TType extends 'checkbox' ? TValue[] : TValue
  defaultValue?: TType extends 'checkbox' ? TValue[] : TValue
  onChange?: (value: TType extends 'checkbox' ? TValue[] : TValue) => void
}

export const ToggleButtonGroup = forwardRef(
  <TValue extends Value, TType extends Type = Type>(
    props: ToggleButtonGroupProps<TValue, TType>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const {
      children,
      type = 'checkbox',
      defaultValue,
      value,
      onChange,
      isAttached = true,
      ...rest
    } = props

    const { getToggleProps } = useToggleGroup({
      type,
      defaultValue,
      value,
      onChange: (value: any) => onChange?.(value),
    })

    const buttons = React.useMemo(
      () =>
        React.Children.toArray(children)
          .filter<React.ReactElement<ToggleButtonProps>>(React.isValidElement)
          .map((button, index, array) => {
            const isFirstItem = index === 0
            const isLastItem = array.length === index + 1

            const styleProps = isAttached
              ? Object.assign({
                  ...(isFirstItem && !isLastItem
                    ? { borderRightRadius: 0 }
                    : {}),
                  ...(!isFirstItem && isLastItem
                    ? { borderLeftRadius: 0 }
                    : {}),
                  ...(!isFirstItem && !isLastItem ? { borderRadius: 0 } : {}),
                  ...(!isLastItem ? { mr: '-px' } : {}),
                })
              : {}

            return React.cloneElement(button, {
              ...styleProps,
              type,
              toggleProps: getToggleProps({
                value: button.props.value,
                disabled: props.isDisabled || button.props.isDisabled,
              }),
            })
          }),
      [children, getToggleProps, props.isDisabled],
    )
    return (
      <ButtonGroup
        isAttached={isAttached}
        variant="outline"
        ref={ref}
        {...rest}
      >
        {buttons}
      </ButtonGroup>
    )
  },
) as <TValue extends Value = Value, TType extends Type = Type>(
  props: ToggleButtonGroupProps<TValue, TType> & {
    ref?: React.ForwardedRef<HTMLDivElement>
  },
) => React.ReactElement

interface ToggleProps extends UseCheckboxProps {}

export interface ToggleButtonProps extends Omit<ButtonProps, 'type'> {
  value: string
  type?: Type
  toggleProps?: ToggleProps
}

export const ToggleButton = (props: ToggleButtonProps) => {
  const { toggleProps, type = 'checkbox', ...rest } = props

  const { getInputProps, getCheckboxProps, getLabelProps } =
    useCheckbox(toggleProps)
  const id = React.useId()

  const inputProps = getInputProps()
  const buttonProps = getCheckboxProps()
  const labelProps = getLabelProps()

  return (
    <Box as="label" cursor="pointer" {...labelProps}>
      <input {...inputProps} type={type} aria-labelledby={id} />
      <Button id={id} as="div" display="flex" {...buttonProps} {...rest} />
    </Box>
  )
}

export const CheckboxButtonGroupField = createField(
  forwardRef((props, ref) => {
    return <ToggleButtonGroup type="checkbox" {...props} ref={ref} />
  }),
  {
    isControlled: true,
  },
)

export const RadioButtonGroupField = createField(
  forwardRef((props, ref) => {
    return <ToggleButtonGroup type="radio" {...props} ref={ref} />
  }),
  {
    isControlled: true,
  },
)
