import React from 'react'

import { ThemingProps } from '@chakra-ui/react'
import { Table as TableInstance, TableState } from '@tanstack/react-table'

import {
  DataGridTranslations,
  defaultTranslations,
} from './data-grid-translations'
import type { DataGridSlotProps } from './data-grid.types'

export interface DataGridContextValue<Data extends object>
  extends ThemingProps<'SuiDataGrid'> {
  instance: TableInstance<Data>
  slotProps?: DataGridSlotProps<Data>
  icons?: DataGridIcons
  translations: DataGridTranslations
  state: TableState
}

export const DataGridContext =
  React.createContext<DataGridContextValue<any> | null>(null)

export interface DataGridProviderProps<Data extends object>
  extends ThemingProps<'SuiDataGrid'> {
  instance: TableInstance<Data>
  slotProps?: DataGridSlotProps<Data>
  icons?: DataGridIcons
  translations?: Partial<DataGridTranslations>
  children: React.ReactNode
}

export const DataGridProvider = <Data extends object>(
  props: DataGridProviderProps<Data>,
) => {
  const {
    instance,
    children,
    colorScheme,
    variant,
    size,
    icons,
    translations,
  } = props

  const state = instance.getState()

  const context: DataGridContextValue<Data> = React.useMemo(
    () => ({
      state,
      instance,
      colorScheme,
      variant,
      size,
      icons,
      translations: {
        ...defaultTranslations,
        ...translations,
      },
    }),
    [instance, state, colorScheme, variant, size, icons, translations],
  )

  return (
    <DataGridContext.Provider value={context}>
      {children}
    </DataGridContext.Provider>
  )
}

export interface DataGridIcons {
  sort?: React.ReactElement
  sortAscending?: React.ReactElement
  sortDescending?: React.ReactElement
  rowExpanded?: React.ReactElement
  rowCollapsed?: React.ReactElement
  nextPage?: React.ReactElement
  previousPage?: React.ReactElement
}

export const useDataGridContext = <Data extends object>() => {
  return React.useContext(DataGridContext) as DataGridContextValue<Data>
}

export const useDataGridIcons = () => {
  const { icons } = useDataGridContext()

  return icons
}

export const useDataGridTranslations = () => {
  const { translations } = useDataGridContext()

  return translations
}
