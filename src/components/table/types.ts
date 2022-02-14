import { WritableComputedRef } from '@vue/reactivity'

export type ColType = 'default' | 'custom' | 'datetime' | 'dict' | 'list' | 'act' | 'selection' | 'icon'
export type RowDensity = 'high' | 'default' | 'low'
export const TABLE_ID_PREFIX = 'table_'
export interface TableColumn {
  id: number
  visible: boolean
  property?: string
  label?: string
  type?: string
  fixed?: boolean | string
}
export interface TableSettingOption {
  treeTable?: boolean
  expandAll: () => WritableComputedRef<boolean | null>
  rowDensity: () => WritableComputedRef<RowDensity | null>
  columns: () => WritableComputedRef<TableColumn[] | null>
  stripe: () => WritableComputedRef<boolean | null>
  border: () => WritableComputedRef<boolean | null>
}
