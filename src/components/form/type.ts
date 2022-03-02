import { ApiQuery } from '@/api'
import { PropType } from 'vue'

export type QueryDataFun = () => ApiQuery

export const FORM_ITEM_DEFAULT_PROPS = {
  prop: {
    type: String,
    required: true
  },
  label: String,
  placeholder: String,
  width: String as PropType<'auto' | string>,
  visible: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
}

export interface ItemDataFields {
  id: string
  label: string
  parent: string
  children: string
}

export const DEFAULT_ITEM_DATA_FIELDS: ItemDataFields = {
  id: 'id',
  label: 'name',
  parent: 'parentId',
  children: 'children'
}
