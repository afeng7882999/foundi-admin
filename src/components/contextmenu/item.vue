<template>
  <li v-if="divider" class="fd-contextmenu__divider"></li>
  <li
    v-else
    ref="item"
    class="fd-contextmenu__item"
    :class="classname"
    @click="onClick"
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
  >
    <fd-icon v-if="icon" class="fd-contextmenu__item-icon" :icon="icon"></fd-icon>
    <span v-if="label" class="fd-contextmenu__item-text">{{ label }}</span>
    <slot />
  </li>
</template>

<script lang="ts">
export default {
  name: 'FdContextmenuItem'
}
</script>

<script setup lang="ts">
import { computed, inject, reactive, ref } from 'vue'
import { AnyFunction } from '@/utils'

const props = defineProps({
  icon: String,
  label: String,
  divider: Boolean,
  disabled: Boolean,
  autoHide: {
    type: Boolean,
    default: true
  }
})

const item = ref()

const state = reactive({
  hover: false
})

const classname = computed(() => {
  return {
    'is-hover': state.hover,
    'is-disabled': props.disabled
  }
})

// parent hide
const contextmenuHide = inject('contextmenuHide') as AnyFunction

const emit = defineEmits(['mouseenter', 'mouseleave', 'click'])

// mouse enter
const onMouseenter = (event: MouseEvent) => {
  if (props.disabled) return
  state.hover = true
  emit('mouseenter', item.value, event)
}

// mouse leave
const onMouseleave = (event: MouseEvent) => {
  if (props.disabled) return
  state.hover = false
  emit('mouseleave', item.value, event)
}

// mouse click
const onClick = (event: MouseEvent) => {
  if (props.disabled) return
  emit('click', item.value, event)
  if (props.autoHide) {
    contextmenuHide()
  }
}
</script>
