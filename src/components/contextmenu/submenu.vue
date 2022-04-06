<template>
  <li
    ref="submenu"
    class="fd-contextmenu__item fd-contextmenu__submenu"
    :class="classname"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <fd-icon v-if="icon" class="fd-contextmenu__item-icon" :icon="icon"></fd-icon>
    <span class="fd-contextmenu__item-text">{{ label }}</span>
    <fd-icon class="fd-contextmenu__item-icon" icon="right"></fd-icon>
    <ul v-show="state.hover" ref="submenu" :class="submenuClass">
      <slot />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'

defineOptions({
  name: 'FdContextmenuSubmenu'
})

const props = defineProps({
  icon: String,
  label: {
    type: String,
    default: ''
  },
  disabled: Boolean
})

const submenu = ref()

const state = reactive({
  hover: false,
  submenuPlacement: [] as string[]
})

const classname = computed(() => {
  return {
    'is-hover': state.hover,
    'is-disabled': props.disabled
  }
})

const submenuClass = computed(() => {
  return ['fd-contextmenu', ...state.submenuPlacement]
})

const emit = defineEmits(['mouseenter', 'mouseleave'])

const onMouseEnter = (event: MouseEvent) => {
  const el = submenu.value as HTMLElement
  if (props.disabled) return
  const { target } = event
  const targetDimension = (target as HTMLElement).getBoundingClientRect()
  state.hover = true
  emit('mouseenter', el, event)
  nextTick(() => {
    const submenuWidth = el.clientWidth
    const submenuHeight = el.clientHeight
    const submenuPlacement = []
    if (targetDimension.right + submenuWidth >= window.innerWidth) {
      submenuPlacement.push('left')
    } else {
      submenuPlacement.push('right')
    }
    if (targetDimension.bottom + submenuHeight >= window.innerHeight) {
      submenuPlacement.push('bottom')
    } else {
      submenuPlacement.push('top')
    }
    state.submenuPlacement = submenuPlacement
  })
}

const onMouseLeave = (event: MouseEvent) => {
  if (props.disabled) return
  state.hover = false
  emit('mouseleave', submenu.value, event)
}
</script>
