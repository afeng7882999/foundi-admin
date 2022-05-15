<template>
  <ul v-show="state.visible" :id="state.elId" ref="contextmenu" class="fd-contextmenu" :style="state.style">
    <slot></slot>
  </ul>
</template>

<script setup lang="ts">
import { generateId } from '@/utils/lang'
import { ref, nextTick, onBeforeUnmount, onMounted, provide, reactive, watch } from 'vue'
import bus from './bus'

defineOptions({
  name: 'FdContextmenu'
})

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const contextmenu = ref()

const state = reactive({
  visible: false,
  elId: 'fd-contextmenu-' + generateId(),
  style: {
    top: '0px',
    left: '0px'
  }
})

const emit = defineEmits(['show', 'hide', 'contextmenu'])

watch(
  () => state.visible,
  (val) => {
    if (val) {
      emit('show', contextmenu)
      document.body.addEventListener('click', onBodyClick)
    } else {
      emit('hide', contextmenu)
      document.body.removeEventListener('click', onBodyClick)
    }
  },
  {
    flush: 'post'
  }
)

onMounted(() => {
  bus.on(({ event, id }) => {
    if (state.elId === id) {
      _show(event.clientY, event.clientX)
    } else {
      hide()
    }
  })
})

onBeforeUnmount(() => {
  document.body.removeEventListener('click', onBodyClick)
})

const show = (e: MouseEvent) => {
  console.log(e)
  if (!props.disabled) {
    bus.emit({ event: e, id: state.elId })
  }
}

const calcContextMenuPos = (x: number, y: number) => {
  const pos = {
    top: y,
    left: x
  }
  const el = contextmenu.value as HTMLElement
  const w = el.clientWidth
  const h = el.clientHeight
  if (h + y >= window.innerHeight) {
    pos.top -= h
  }
  if (w + x >= window.innerWidth) {
    pos.left -= w
  }
  return pos
}

const onBodyClick = (event: MouseEvent) => {
  const isInter = event.composedPath().some((item) => {
    const elementId = (item as HTMLElement).id
    return !!elementId && (elementId === state.elId || elementId === state.elId)
  })
  if (!isInter) {
    hide()
  }
}

const _show = (top: number, left: number) => {
  state.visible = true
  if (top && left) {
    nextTick(() => {
      const calcPos = calcContextMenuPos(left, top)
      state.style = {
        top: `${calcPos.top}px`,
        left: `${calcPos.left}px`
      }
    })
  }
  emit('contextmenu', contextmenu)
}

const hide = () => {
  state.visible = false
}

provide('contextmenuHide', hide)

defineExpose({
  show,
  hide
})
</script>
