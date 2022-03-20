import { Ref } from '@vue/reactivity'
import { SortFieldResult } from '@/extend/form/type'
import {ExtractPropTypes, PropType} from 'vue'

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
  oldFixed?: boolean | string
}
export interface TableSettingProp {
  treeTable?: boolean
  expandAll: () => Ref<boolean | null>
  rowDensity: () => Ref<RowDensity | null>
  columns: () => Ref<TableColumn[] | null>
  stripe: () => Ref<boolean | null>
  border: () => Ref<boolean | null>
}

export interface FormatMappingItem {
  key: string
  val?: string
  color?: string
}

export type FormatMapping = FormatMappingItem[]

export const FORMATTER_DEFAULT_PROPS = {
  data: [String, Number, Array] as PropType<string | number | string[] | number[]>,
  mapping: [String, Array] as PropType<string[] | FormatMapping>
}

export const COL_DEFAULT_PROPS = {
  showOverflowTooltip: {
    type: Boolean,
    default: true
  },
  align: {
    type: String,
    default: 'left'
  },
  headerAlign: {
    type: String,
    default: 'left'
  },
  width: {
    type: String,
    default: ''
  },
  auth: String,
  sort: {
    type: Array as PropType<SortFieldResult[]>,
    default: () => []
  },
  onSortChanged: Function
}
