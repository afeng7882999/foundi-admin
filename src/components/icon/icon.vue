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

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  iconClass: {
    type: String,
    default: ''
  }
})

const iconName = computed(() => {
  return `#svg-icons-${props.icon}`
})

const svgClass = computed(() => {
  if (props.iconClass) {
    return 'fd-icon ' + props.iconClass
  } else {
    return 'fd-icon'
  }
})
</script>
