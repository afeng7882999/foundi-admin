<template>
  <a ref="aRef" :style="aStyle" href="#">
    <img :src="src" alt="" />
    <span class="file-card__label">{{ filename }}</span>
  </a>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useResizeObserver } from '@vueuse/core'

defineOptions({
  name: 'DemoImgCard'
})

const props = defineProps({
  src: String,
  filename: String
})

const aRef = ref<HTMLElement>()
const aWidth = ref<number>(300)

const aStyle = computed(() => {
  const aHeight = Math.floor(aWidth.value / (300 / 240))
  return {
    height: `${aHeight}px`
  }
})

useResizeObserver(aRef, (entries) => {
  aWidth.value = entries[0].contentRect.width
})
</script>

<style lang="scss" scoped>
a {
  display: block;
  width: 100%;
  height: 240px;
  padding: 16px 16px 48px 16px;
  overflow: hidden;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 2px 2px 5px rgba(#000, 0.2);
}
</style>
