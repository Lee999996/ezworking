import { ResponsiveValue } from '@chakra-ui/styled-system'
import { createContext } from '@chakra-ui/utils'

export interface RadioCardsContext {
  setValue: (value: string) => void
  value: string
  isDisabled?: boolean
  variant?: ResponsiveValue<string>
  size?: ResponsiveValue<string>
  colorScheme?: string
  containerRef: React.RefObject<HTMLDivElement>
}

export const [RadioCardsProvider, useRadioCardsContext] =
  createContext<RadioCardsContext>({
    errorMessage:
      'useRadioCardsContext: `context` is undefined. Seems you forgot to wrap component within <RadioCards />',
    strict: true,
  })
