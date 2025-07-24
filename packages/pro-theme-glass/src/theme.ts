import { extendTheme } from '@chakra-ui/react'
import { theme as proTheme } from '@saas-ui-pro/react'
import { theme as glassTheme } from '@saas-ui/theme-glass'

import { components } from './components'
import semanticTokens from './foundations/semantic-tokens'

export const theme = extendTheme(
  extendTheme(
    {
      components,
      semanticTokens,
    },
    glassTheme,
  ),
  proTheme,
)
