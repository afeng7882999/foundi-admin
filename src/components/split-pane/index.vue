<template>
  <div
    ref="wrapper"
    class="fd-split-pane"
    :class="wrapperClass"
    :style="{ cursor, userSelect }"
    @mouseup="onMouseUp"
    @mousemove="onMouseMove"
  >
    <div class="fd-split-pane__pane is-left" :style="leftStyle">
      <slot name="left"></slot>
    </div>
    <div class="fd-split-pane__resizer" @mousedown="onMouseDown"></div>
    <div v-show="state.active" class="fd-split-pane__resizer-ghost" :style="{ [resizeType]: state.pos + 'px' }"></div>
    <div class="fd-split-pane__pane is-right" :style="rightStyle">
      <slot name="right"></slot>
    </div>
    <div v-if="state.active" class="fd-split-pane__mask"></div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FdSplitPane'
}
</script>

<script setup lang="ts">
import { computed, PropType, reactive, ref } from 'vue'

const props = defineProps({
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
  // the pane is vertical or horizontal, vertical by default
  split: {
    type: String as PropType<'vertical' | 'horizontal'>,
    default: 'vertical',
    validator: (val: string) => ['vertical', 'horizontal'].includes(val)
  }
})

const emit = defineEmits(['resize'])

const wrapper = ref()

const state = reactive({
  active: false,
  hasMoved: false,
  pos: props.defaultPos,
  finalPos: props.defaultPos,
  reservedPos: props.defaultPos,
  mouseDownTime: 0
})

const type = computed(() => {
  return props.split === 'vertical' ? 'width' : 'height'
})

const resizeType = computed(() => {
  return props.split === 'vertical'
    ? props.shrink === 'right'
      ? 'left'
      : 'right'
    : props.shrink === 'right'
      ? 'top'
      : 'bottom'
})

const userSelect = computed(() => {
  return state.active ? 'none' : ''
})

const cursor = computed(() => {
  return state.active ? (props.split === 'vertical' ? 'col-resize' : 'row-resize') : ''
})

const wrapperClass = computed(() => {
  return [`is-${props.split}`, `is-shrink-${props.shrink}`]
})

const leftStyle = computed(() => {
  if (props.shrink === 'left') {
    return {}
  }
  return { [type.value]: state.finalPos + 'px', display: state.finalPos ? 'block' : 'none' }
})

const rightStyle = computed(() => {
  if (props.shrink === 'right') {
    return {}
  }
  return { [type.value]: state.finalPos + 'px', display: state.finalPos ? 'block' : 'none' }
})

const onMouseDown = () => {
  state.mouseDownTime = new Date().getTime()
  state.active = true
  state.hasMoved = false
}

const onMouseUp = () => {
  if (new Date().getTime() - state.mouseDownTime < 200) {
    // click
    if (state.finalPos === 0) {
      state.pos = state.reservedPos
    } else {
      state.reservedPos = state.finalPos
      state.pos = 0
    }
  }
  state.active = false
  state.finalPos = state.pos
}

const onMouseMove = (e: MouseEvent) => {
  if (e.buttons === 0) {
    state.active = false
  }
  if (state.active) {
    let pageOffset = 0
    let target = e.currentTarget as HTMLElement
    if (props.split === 'vertical') {
      while (target) {
        pageOffset += target.offsetLeft
        target = target.offsetParent as HTMLElement
      }
    } else {
      while (target) {
        pageOffset += target.offsetTop
        target = target.offsetParent as HTMLElement
      }
    }
    const pagePos = props.split === 'vertical' ? e.pageX : e.pageY
    const targetWidth =
      props.split === 'vertical'
        ? (e.currentTarget as HTMLElement).offsetWidth
        : (e.currentTarget as HTMLElement).offsetHeight
    const toLeft = pagePos - pageOffset

    if (toLeft > props.leftMin && toLeft < targetWidth - props.rightMin) {
      state.pos = props.shrink === 'right' ? toLeft : targetWidth - toLeft
    }

    emit('resize', state.pos)
    state.hasMoved = true
  }
}
</script>

<style lang="scss">
@use 'src/assets/style/variable.scss' as *;

.fd-split-pane {
  display: flex;
  align-items: stretch;
  height: 100%;
  position: relative;

  &__resizer {
    align-self: stretch;
    flex-shrink: 0;
    background-repeat: no-repeat;
    background-position: 50%;

    &:hover {
      background-color: var(--el-color-gray-2);
    }
  }

  &__resizer-ghost {
    position: absolute;
    background-color: var(--el-color-gray-2);
    z-index: $index-popper;
  }

  &__pane {
    overflow: hidden;
  }

  &__mask {
    z-index: $index-popper;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  &.is-vertical {
    flex-direction: row;

    .fd-split-pane__resizer {
      width: 10px;
      height: auto;
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAAeCAYAAAAGos/EAAAAJklEQVQYlWM8c+bMfwYGBgYmEAECjP//gwUQIixnz54dAWoYGBgAwRIwW7Zq4jkAAAAASUVORK5CYII=');
      cursor: col-resize;
    }

    .fd-split-pane__resizer-ghost {
      width: 10px;
      height: 100%;
    }
  }

  &.is-horizontal {
    flex-direction: column;

    .fd-split-pane__resizer {
      width: auto;
      height: 10px;
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAACCAYAAABPJGxCAAAAJElEQVQImWM8c+bMfwYGBgZjY2NGEH327Fm68JlABN0BAwMDAIKiH2fCZyKfAAAAAElFTkSuQmCC');
      cursor: row-resize;
    }

    .fd-split-pane__resizer-ghost {
      width: 100%;
      height: 10px;
    }
  }

  &.is-shrink-left {
    > .fd-split-pane__pane.is-left {
      flex: 1;
    }
  }

  &.is-shrink-right {
    > .fd-split-pane__pane.is-right {
      flex: 1;
    }
  }
}
</style>
