import { forwardRef } from '@chakra-ui/react'
import { createField } from '@saas-ui/forms'

import { RadioCards } from './radio-cards'

export const RadioCardsField = createField(
  forwardRef((props, ref) => {
    return <RadioCards {...props} ref={ref} />
  }),
  {
    isControlled: true,
  },
)
