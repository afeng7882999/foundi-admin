<template>
  <div v-show="length > 0" ref="rootRef" :style="{ height: `${contentHeight}px`, placeContent: 'start' }">
    <div
      ref="probeRef"
      :style="{ opacity: 0, visibility: 'hidden', gridArea: '1/1', pointerEvents: 'none', zIndex: -1, placeSelf: 'stretch' }"
    >
      <slot name="probe" />
    </div>
    <template v-for="(internalItem, index) in buffer" :key="index">
      <slot v-if="internalItem.value === undefined" name="placeholder" :index="internalItem.index" :style="internalItem.style" />
      <slot v-else name="default" :item="internalItem.value" :index="internalItem.index" :style="internalItem.style" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VueInstance } from '@vueuse/core'
import { GRID_PROPS } from '@/components/virtual-grid/types'
import useGrid from '@/components/virtual-grid/use-grid'

defineOptions({
  name: 'FdVirtualGrid'
})

const props = defineProps({
  ...GRID_PROPS
})

// template refs
const rootRef = ref<HTMLElement | SVGElement | VueInstance>()
const probeRef = ref<HTMLElement | SVGElement | VueInstance>()

const { buffer, contentHeight, scrollToIdx } = useGrid(props, rootRef, probeRef)

onMounted(() => {
  scrollToIdx(0)
})
</script>
