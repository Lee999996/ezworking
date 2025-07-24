'use client'

import { CustomThemeTypings, useTheme } from '@chakra-ui/react'

export const useDefaultProps = <ThemeKey = keyof CustomThemeTypings>(
  componentName: ThemeKey,
) => {
  const theme = useTheme()
  return theme.components[componentName]?.defaultProps || {}
}
