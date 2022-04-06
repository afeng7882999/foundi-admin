<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName"></use>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const LOADING_ICON = '#svg-graphics-spinner'

defineOptions({
  name: 'FdIcon'
})

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  iconClass: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const iconName = computed(() => {
  if (props.loading) {
    return LOADING_ICON
  }
  return `#svg-icons-${props.icon}`
})

const svgClass = computed(() => {
  const clazz = ['fd-icon']
  if (props.iconClass) {
    clazz.push(props.iconClass)
  }
  if (props.loading) {
    clazz.push('is-loading')
  }
  return clazz
})
</script>
