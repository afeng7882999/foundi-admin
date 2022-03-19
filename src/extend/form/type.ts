import { PropType } from 'vue'

const FORM_ITEM_INLINE_PROPS = {
  width: String as PropType<'auto' | string>,
  trigger: {
    type: [Boolean, String],
    default: 'submit'
  }
}

export const FORM_ITEM_DEFAULT_PROPS = {
  prop: {
    type: String,
    required: true
  },
  label: String,
  noLabel: {
    type: Boolean,
    default: false
  },
  placeholder: String,
  visible: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  // 仅在 inline form 使用
  ...FORM_ITEM_INLINE_PROPS
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

export type SortFieldResult = Partial<{
  prop: string
  comment: string
  order: 'asc' | 'desc'
}>
