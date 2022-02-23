import { Ref } from '@vue/reactivity'

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
export interface TableSettingProp {
  treeTable?: boolean
  expandAll: () => Ref<boolean | null>
  rowDensity: () => Ref<RowDensity | null>
  columns: () => Ref<TableColumn[] | null>
  stripe: () => Ref<boolean | null>
  border: () => Ref<boolean | null>
}
