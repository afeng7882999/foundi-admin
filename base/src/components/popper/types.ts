import { PropType } from 'vue'

export const POPPER_SHOW_EVENT = 'show'
export const POPPER_HIDE_EVENT = 'hide'
export const POPPER_SHOWED_EVENT = 'showed'

export interface FdPopperType {
  show: (e: PointerEvent) => void
  hide: () => void
}

export const POPPER_PROPS_DEFAULT = {
  target: {
    type: Boolean,
    default: false
  },
  targetOffset: {
    type: Number,
    default: 8
  },
  trigger: {
    type: String as PropType<'click' | 'enter'>,
    default: 'click',
    validator: (val: string) => ['click', 'enter'].includes(val)
  },
  showDelay: {
    type: Number,
    default: 0
  },
  hideDelay: {
    type: Number,
    default: 300
  },
  disabled: {
    type: Boolean,
    default: false
  }
}
