<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName"></use>
  </svg>
</template>

<script lang="ts">
export default {
  name: 'FdIcon'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const LOADING_ICON = 'loading-four'

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
    return `#svg-icons-${LOADING_ICON}`
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
