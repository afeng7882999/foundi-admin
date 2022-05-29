import { PropType } from 'vue'
import { ApiObj } from '@b/api'

export const DETAIL_CARD_PROPS = {
  placeholder: {
    type: Boolean,
    default: true
  },
  index: Number,
  item: Object as PropType<ApiObj>,
  idField: {
    type: String,
    default: 'id'
  },
  focusedIndex: Number,
  selectMode: {
    type: Boolean,
    default: false
  },
  selectedItems: {
    type: Array as PropType<ApiObj[]>,
    default: () => []
  },
  detail: {
    type: [String, Boolean] as PropType<string | boolean>,
    default: false
  },
  edit: {
    type: [String, Boolean] as PropType<string | boolean>,
    default: false
  },
  del: {
    type: [String, Boolean] as PropType<string | boolean>,
    default: false
  },
  placeholderHeight: {
    type: Number,
    default: 100
  },
  placeholderRows: {
    type: Number,
    default: 3
  },
  isMobile: Boolean,
  mobileCompact: {
    type: Boolean,
    default: true
  }
}
