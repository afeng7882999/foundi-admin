import { WritableComputedRef } from '@vue/reactivity'

export type ColType = 'default' | 'custom' | 'datetime' | 'dict' | 'list' | 'act' | 'selection'
export type RowDensity = 'high' | 'default' | 'low'
export const TABLE_ID_PREFIX = 'table_'
export interface TableColumn {
  id: number
  visible: boolean
  property?: string
  label?: string
  type?: string
}
export interface TableSettingOption {
  treeTable?: boolean
  expandAll: () => WritableComputedRef<boolean | null>
  rowDensity: () => WritableComputedRef<RowDensity | null>
  columns: () => WritableComputedRef<TableColumn[] | null>
}
