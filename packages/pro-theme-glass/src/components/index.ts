import { badgeTheme } from './badge'
import { buttonTheme } from './button'
import { cardTheme } from './card'
import Form from './form'
import { menuTheme } from './menu'
import { navGroupTheme } from './nav-group'
import { navItemTheme } from './nav-item'
import { selectTheme } from './select'
import { structuredListTheme } from './structured-list'
import { tabsTheme } from './tabs'
import { tagTheme } from './tag'
import { toolbarTheme } from './toolbar'
import { tooltipTheme } from './tooltip'

export const components = {
  Badge: badgeTheme,
  Button: buttonTheme,
  Card: cardTheme,
  Menu: menuTheme,
  Tabs: tabsTheme,
  Tag: tagTheme,
  Tooltip: tooltipTheme,
  SuiToolbar: toolbarTheme,
  SuiNavItem: navItemTheme,
  SuiNavGroup: navGroupTheme,
  SuiStructuredList: structuredListTheme,
  SuiSelect: selectTheme,
  ...Form,
}
