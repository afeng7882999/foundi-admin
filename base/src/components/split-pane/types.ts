import { PropType } from 'vue'

export const SPLIT_PANE_PROPS_DEFAULT = {
  // min width of left or min height of top
  leftMin: {
    type: Number,
    default: 0
  },
  // min width of right or min height of bottom
  rightMin: {
    type: Number,
    default: 0
  },
  // default position from the left(top) when shrink is 'left', right(bottom) otherwise
  defaultPos: {
    type: Number,
    default: 100
  },
  // which side will shrink when the wrapper is resized
  shrink: {
    type: String as PropType<'left' | 'right'>,
    default: 'right',
    validator: (val: string) => ['left', 'right'].includes(val)
  },
  // toggle shrinking to zero
  shrinkAll: {
    type: Boolean,
    default: false
  },
  // 'not' modifier of shrinkAll
  shrinkAllModifiers: {
    type: Object,
    default: () => ({
      not: false
    })
  },
  // hide the resize when shrink to zero
  shrinkToHide: {
    type: Boolean,
    default: false
  },
  // the pane is vertical or horizontal, vertical by default
  split: {
    type: String as PropType<'vertical' | 'horizontal'>,
    default: 'vertical',
    validator: (val: string) => ['vertical', 'horizontal'].includes(val)
  },
  // shrink animation
  animation: {
    type: Boolean,
    default: false
  }
}
