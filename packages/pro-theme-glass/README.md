# @saas-ui-pro/theme-glass

A Linear inspired theme for Chakra UI.

## Installation

```sh
$ yarn add @saas-ui-pro/theme-glass

#or

$ npm i @saas-ui-pro/theme-glass  --save
```

## Usage

### Usage with Chakra UI

```ts
import { extendTheme } from '@chakra-ui/react'
import { theme as baseTheme } from '@saas-ui-pro/theme-glass'

const theme = extendTheme(
  {
    // your overrides
  },
  baseTheme,
)
```

### Usage with Saas UI

```ts
import { extendTheme } from '@chakra-ui/react'
import { theme as glassTheme } from '@saas-ui-pro/theme-glass'
import { theme as baseTheme } from '@saas-ui/react'

const theme = extendTheme(
  {
    // your overrides
  },
  glassTheme,
  baseTheme,
)
```

## Docs

https://saas-ui.dev/docs/pro/theming/configuration

## License

Free for personal use. For commercial use, see [Saas UI Pro License](https://saas-ui.dev/license).

Source code is available for Saas UI Pro customers.
