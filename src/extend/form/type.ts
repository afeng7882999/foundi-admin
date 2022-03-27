import { PropType } from 'vue'

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
  width: String as PropType<'auto' | string>,
  trigger: {
    type: [Boolean, String],
    default: 'submit'
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
