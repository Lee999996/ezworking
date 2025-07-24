import * as React from 'react'

import {
  ButtonProps,
  PopoverProps,
  mergeRefs,
  useDisclosure,
} from '@chakra-ui/react'
import { PropGetter, createContext } from '@chakra-ui/utils'

export interface TourDialogOptions extends PopoverProps {
  onSubmit?(): Promise<any>
  primaryAction?: ButtonProps | null
  secondaryAction?: ButtonProps | null
}

export type TourDialogContext = ReturnType<typeof useTourDialog>

export const [TourDialogContextProvider, useTourDialogContext] =
  createContext<TourDialogContext>()

export const useTourDialog = (props: TourDialogOptions) => {
  const {
    initialFocusRef,
    onSubmit,
    isOpen: isOpenProp,
    onClose: onCloseProp,
    defaultIsOpen,
    primaryAction,
    secondaryAction,
  } = props

  const { isOpen, onOpen, onClose, onToggle } = useDisclosure({
    defaultIsOpen,
    isOpen: isOpenProp,
    onClose: onCloseProp,
  })

  const primaryActionRef = React.useRef(null)

  const getPrimaryActionProps: PropGetter<ButtonProps> = React.useCallback(
    (props, ref) => {
      return {
        label: 'OK',
        ...primaryAction,
        ...props,
        ref: mergeRefs(primaryActionRef, ref),
      }
    },
    [onSubmit, onClose, primaryActionRef],
  )

  const getSecondaryActionProps: PropGetter<ButtonProps> = React.useCallback(
    (props) => {
      return {
        label: 'Dismiss',
        ...secondaryAction,
        ...props,
      }
    },
    [onClose],
  )

  return {
    initialFocusRef: initialFocusRef || primaryActionRef,
    isOpen,
    onOpen,
    onClose,
    onToggle,
    getPrimaryActionProps,
    getSecondaryActionProps,
  }
}
