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
    <fd-icon v-if="icon || actAs !== 'default'" class="fd-contextmenu__item-icon" :icon="iconName"></fd-icon>
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
import { computed, inject, PropType, reactive, ref } from 'vue'
import { AnyFunction } from '@b/common/types'

const props = defineProps({
  icon: String,
  label: String,
  divider: Boolean,
  disabled: Boolean,
  actAs: {
    type: String as PropType<'checkbox' | 'radioGroup' | 'default'>,
    default: 'default',
    validator: (val: string) => ['checkbox', 'radioGroup', 'default'].includes(val)
  },
  checkValue: {
    type: Boolean,
    default: false
  },
  radioValue: {
    type: String,
    default: ''
  },
  radioLabel: {
    type: String,
    default: ''
  },
  autoHide: {
    type: Boolean,
    default: true
  },
  color: {
    type: String as PropType<'primary' | 'success' | 'warning' | 'danger' | 'info'>,
    validator: (val: string) => ['primary', 'success', 'warning', 'danger', 'info'].includes(val)
  }
})

const item = ref()

const state = reactive({
  hover: false
})

const classname = computed(() => {
  return {
    'is-hover': state.hover,
    'is-disabled': props.disabled,
    'is-primary': props.color && props.color === 'primary',
    'is-success': props.color && props.color === 'success',
    'is-warning': props.color && props.color === 'warning',
    'is-danger': props.color && props.color === 'danger',
    'is-info': props.color && props.color === 'info'
  }
})

const iconName = computed(() => {
  if (props.actAs === 'checkbox') {
    return props.checkValue ? 'check-small' : 'blank'
  }
  if (props.actAs === 'radioGroup') {
    return props.radioValue === props.radioLabel ? 'check-small' : 'blank'
  }
  return props.icon
})

// parent hide
const contextmenuHide = inject('contextmenuHide') as AnyFunction

const emit = defineEmits(['mouseenter', 'mouseleave', 'click', 'update:checkValue', 'update:radioValue'])

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
  if (props.actAs === 'checkbox') {
    emit('update:checkValue', !props.checkValue)
  } else if (props.actAs === 'radioGroup') {
    emit('update:radioValue', props.radioLabel)
  }
  if (props.autoHide) {
    contextmenuHide()
  }
}
</script>
