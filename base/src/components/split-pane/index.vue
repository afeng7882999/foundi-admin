<template>
  <div class="fd-split-pane" :class="wrapperClass" :style="{ cursor, userSelect }" @mouseup="onMouseUp" @mousemove="onMouseMove">
    <div class="fd-split-pane__pane is-left" :style="leftStyle">
      <slot name="left"></slot>
    </div>
    <div v-show="resizerVisible" class="fd-split-pane__resizer" @mousedown="onMouseDown"></div>
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
import { computed, reactive, watch } from 'vue'
import { SPLIT_PANE_PROPS_DEFAULT } from '@b/components/split-pane/types'

const props = defineProps({
  ...SPLIT_PANE_PROPS_DEFAULT
})

const emit = defineEmits(['resize', 'update:shrinkAll'])

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
  return props.split === 'vertical' ? (props.shrink === 'right' ? 'left' : 'right') : props.shrink === 'right' ? 'top' : 'bottom'
})

const userSelect = computed(() => {
  return state.active ? 'none' : ''
})

const cursor = computed(() => {
  return state.active ? (props.split === 'vertical' ? 'col-resize' : 'row-resize') : ''
})

const wrapperClass = computed(() => {
  const clazz = [`is-${props.split}`, `is-shrink-${props.shrink}`]
  if (props.animation) {
    clazz.push('is-animation')
  }
  return clazz
})

const leftStyle = computed(() => {
  if (props.shrink === 'left') {
    return {}
  }
  return { [type.value]: state.finalPos + 'px' }
})

const rightStyle = computed(() => {
  if (props.shrink === 'right') {
    return {}
  }
  return { [type.value]: state.finalPos + 'px' }
})

const resizerVisible = computed(() => {
  if (props.shrinkToHide) {
    return state.finalPos !== 0
  }
  return true
})

watch(
  () => props.shrinkAll,
  (val) => {
    if (props.shrinkAllModifiers.not) {
      val = !val
    }
    if (val && state.finalPos !== 0) {
      state.reservedPos = state.finalPos
      state.pos = 0
      state.finalPos = state.pos
    } else if (!val && state.finalPos === 0) {
      state.pos = state.reservedPos
      state.finalPos = state.pos
    }
  },
  { immediate: true }
)

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

  const shrunk = props.shrinkAllModifiers.not ? state.finalPos !== 0 : state.finalPos === 0
  emit('update:shrinkAll', shrunk)
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
      props.split === 'vertical' ? (e.currentTarget as HTMLElement).offsetWidth : (e.currentTarget as HTMLElement).offsetHeight
    const toLeft = pagePos - pageOffset

    if (toLeft > props.leftMin && toLeft < targetWidth - props.rightMin) {
      state.pos = props.shrink === 'right' ? toLeft : targetWidth - toLeft
    }

    emit('resize', state.pos)
    state.hasMoved = true
  }
}
</script>
