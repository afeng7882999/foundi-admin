<template>
  <ul v-show="state.visible" :id="state.elId" ref="contextmenu" class="fd-contextmenu" :style="state.style">
    <slot></slot>
  </ul>
</template>

<script lang="ts">
export default {
  name: 'FdContextmenu'
}
</script>

<script setup lang="ts">
import { generateId } from '@/utils/lang'
import { ref, nextTick, onBeforeUnmount, onMounted, provide, reactive, watch } from 'vue'
import bus, { ContextmenuShowEvent } from './bus'

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
  bus.on(ContextmenuShowEvent, ({ event, id }) => {
    if (state.elId === id) {
      _show(event.pageY, event.pageX)
    } else {
      hide()
    }
  })
})

onBeforeUnmount(() => {
  document.body.removeEventListener('click', onBodyClick)
})

const show = (e: MouseEvent) => {
  if (!props.disabled) {
    bus.emit(ContextmenuShowEvent, { event: e, id: state.elId })
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

<style lang="scss">
@use 'src/assets/style/variable' as *;
@use 'src/assets/style/mixin' as *;

.fd-contextmenu {
  position: fixed;
  margin: 0;
  padding: 8px 0;
  font-size: var(--el-font-size-base);
  color: var(--el-text-color-primary);
  white-space: nowrap;
  list-style: none;
  border: 1px solid var(--el-border-color-base);
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-fill-base);
  box-shadow: var(--el-box-shadow-base);
  z-index: 100;

  &__item {
    display: flex;
    align-items: center;
    height: 38px;
    padding: 8px 4px 8px 15px;
    min-width: 150px;
    cursor: pointer;

    &.is-hover {
      background-color: var(--el-bg-color);
    }

    &.is-disabled {
      color: var(--el-text-color-placeholder);
      cursor: not-allowed;
    }
  }

  &__item-icon {
    margin-right: 8px;
    font-size: $icon-size-middle;
  }

  &__item-text {
    flex: 1;
  }

  &__divider {
    height: 0;
    margin: 10px 0;
    border-bottom: 1px solid var(--el-border-color-base);
  }

  &__submenu {
    position: relative;

    & > .fd-contextmenu {
      position: absolute;

      &.left {
        left: 0;
        transform: translateX(-100%);
      }

      &.right {
        right: 0;
        transform: translateX(100%);
      }

      &.top {
        top: -11px;
      }

      &.bottom {
        bottom: -11px;
      }
    }
  }

  @include theme($round-mode) {
    border-radius: 10px;
  }
}
</style>
