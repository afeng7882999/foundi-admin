import { PropType } from 'vue'

export const FORM_ITEM_DEFAULT_PROPS = {
  prop: String,
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
  width: String as PropType<'auto' | string>,
  trigger: {
    type: [Boolean, String],
    default: 'onSubmit'
  },
  tip: {
    type: String,
    default: ''
  },
  tipDelay: {
    type: Number,
    default: 500
  },
  tipIcon: {
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
