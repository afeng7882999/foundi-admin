<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="imgName"></use>
  </svg>
</template>

<script lang="ts">
export default {
  name: 'FdSvgImage'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  img: {
    type: String,
    required: true
  },
  imgClass: {
    type: String,
    default: ''
  }
})

const imgName = computed(() => {
  return `#svg-graphics-${props.img}`
})

const svgClass = computed(() => {
  if (props.imgClass) {
    return 'fd-svg-image ' + props.imgClass
  } else {
    return 'fd-svg-image'
  }
})
</script>
