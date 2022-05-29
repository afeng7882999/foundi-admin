<template>
  <el-button class="fd-button" :class="classObj" v-bind="$attrs" :type="typeCo" :plain="plain">
    <fd-icon v-if="icon && iconPos === 'left'" class="fd-button__icon is-in-btn" :icon="icon" :loading="loading" />
    <span v-if="labelVisible" class="fd-button__label">{{ label }}</span>
    <fd-icon v-if="icon && iconPos === 'right'" class="fd-button__icon is-in-btn is-right" :icon="icon" :loading="loading" />
  </el-button>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import { buttonColors, buttonColorsType, buttonTypes, buttonTypesType } from './types'

defineOptions({
  name: 'FdButton',
  inheritAttrs: false
})

const props = defineProps({
  type: {
    type: String as PropType<buttonTypesType>,
    default: 'default',
    validator: (val: string) => buttonTypes.includes(val)
  },
  label: String,
  noLabel: Boolean,
  icon: {
    type: String,
    default: ''
  },
  iconPos: {
    type: String as PropType<'left' | 'right'>,
    default: 'left'
  },
  plain: Boolean,
  color: {
    type: String as PropType<buttonColorsType>,
    default: 'default',
    validator: (val: string) => buttonColors.includes(val)
  },
  loading: Boolean
})

const classObj = computed(() => {
  const clazz = []
  if (props.type === 'icon') {
    clazz.push('is-icon')
  }
  if (props.type === 'toolbar') {
    clazz.push('is-toolbar')
  }
  if (!labelVisible.value) {
    clazz.push('is-no-label')
  }
  return clazz
})

const typeCo = computed(() => {
  if (props.type === 'text') {
    return 'text'
  }
  if (buttonColors.includes(props.color)) {
    return props.color
  }
  return 'default'
})

const labelVisible = computed(() => {
  if (props.type === 'icon') {
    return false
  }
  return props.label && !props.noLabel
})
</script>
