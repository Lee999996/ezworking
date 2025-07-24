import * as React from 'react'

import { Button, useDisclosure } from '@chakra-ui/react'
import { type SubmitHandler, useSnackbar } from '@saas-ui/react'
import type { Meta } from '@storybook/react'

import { type FeedbackInput, FeedbackModal } from './feedback-modal'

export default {
  title: 'Blocks/Modals/FeedbackModal',
  decorators: [(Story) => <Story />],
} as Meta

export const Default = () => {
  const snackbar = useSnackbar()
  const disclosure = useDisclosure({
    defaultIsOpen: true,
  })

  const onSubmit: SubmitHandler<FeedbackInput> = (data) => {
    console.log(data)

    disclosure.onClose()
    snackbar.success('Thank you, your feedback has been submitted.')
  }

  return (
    <>
      <Button variant="primary" onClick={disclosure.onOpen}>
        Submit feedback
      </Button>
      <FeedbackModal
        onSubmit={onSubmit}
        {...disclosure}
        // These props are only required for demo purposes
        blockScrollOnMount={false}
        trapFocus={false}
      />
    </>
  )
}
