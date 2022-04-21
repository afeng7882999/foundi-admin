<template>
  <div v-show="length > 0" ref="rootRef" :style="rootStyle">
    <div ref="wrapperRef" :style="wrapperStyle" :class="wrapperClass">
      <template v-for="(item, idx) in buffer" :key="idx">
        <slot v-if="item.value === undefined" name="placeholder" :index="item.index" :style="item.style" />
        <slot v-else name="default" :item="item.value" :index="item.index" :style="item.style" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GRID_PROPS } from './types'
import { computed, onMounted, ref } from 'vue'
import { VueInstance } from '@vueuse/core'
import useGrid from './use-grid'

defineOptions({
  name: 'FdVirtualGrid'
})

const props = defineProps({
  ...GRID_PROPS
})

const rootRef = ref<HTMLElement | SVGElement | VueInstance>()
const wrapperRef = ref<HTMLElement | SVGElement | VueInstance>()

const { buffer, contentHeight, contentTranslate, scrollToIdx } = useGrid(props, rootRef, wrapperRef)

const rootStyle = computed(() => {
  return {
    height: `${contentHeight.value}px`
  }
})

const wrapperStyle = computed(() => {
  return {
    width: '100%',
    transform: `translate3d(0px, ${contentTranslate.value}px, 0px)`
  }
})

onMounted(() => {
  scrollToIdx(0)
})
</script>
