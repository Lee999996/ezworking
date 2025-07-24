import { anatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system'

const parts = anatomy('toolbar').parts()

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(parts.keys)

export const toolbarTheme = defineMultiStyleConfig({
  defaultProps: {
    variant: 'secondary',
    size: 'md',
  },
  baseStyle: definePartsStyle({
    container: {
      alignItems: 'center',
    },
  }),
})
