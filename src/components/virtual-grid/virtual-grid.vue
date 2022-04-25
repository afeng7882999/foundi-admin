<template>
  <div ref="wrapperRef" class="fd-virtual-grid" :class="wrapperClass" :style="wrapperStyle">
    <template v-if="pageMode">
      <div v-show="length > 0" ref="viewRef" class="fd-virtual-grid__view" :style="viewStyle">
        <div ref="innerRef" class="fd-virtual-grid__inner" :style="innerStyle" :class="innerClass">
          <template v-for="(item, idx) in buffer" :key="idx">
            <slot v-if="item.value === undefined" name="placeholder" :index="item.index" :style="item.style" />
            <slot v-else name="default" :item="item.value" :index="item.index" :style="item.style" />
          </template>
        </div>
      </div>
    </template>
    <template v-else>
      <el-scrollbar ref="scrollbarRef">
        <div v-show="length > 0" ref="viewRef" class="fd-virtual-grid__view" :style="viewStyle">
          <div ref="innerRef" class="fd-virtual-grid__inner" :style="innerStyle" :class="innerClass">
            <template v-for="(item, idx) in buffer" :key="idx">
              <slot v-if="item.value === undefined" name="placeholder" :index="item.index" :style="item.style" />
              <slot v-else name="default" :item="item.value" :index="item.index" :style="item.style" />
            </template>
          </div>
        </div>
      </el-scrollbar>
    </template>
  </div>
</template>

<script setup lang="ts">
import { GRID_PROPS } from './types'
import { computed, onMounted, ref, watch } from 'vue'
import useGrid from './use-grid'
import { Indexable } from '@/common/types'
import { ElScrollbar } from 'element-plus'

defineOptions({
  name: 'FdVirtualGrid'
})

const props = defineProps({
  ...GRID_PROPS
})

const wrapperRef = ref<HTMLElement>()
const viewRef = ref<HTMLElement>()
const innerRef = ref<HTMLElement>()
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()

const { buffer, contentHeight, contentTranslate, pageMode, scrollToIdx } = useGrid(props, wrapperRef, viewRef, innerRef)

const wrapperClass = computed(() => {
  const clazz = []
  if (pageMode.value) {
    clazz.push('is-page')
  }
  return clazz.join(' ')
})

const wrapperStyle = computed(() => {
  const style = {} as Indexable
  if (props.wrapperWidth) {
    style.width = `${props.wrapperWidth}px`
  } else {
    style.width = '100%'
  }
  if (props.wrapperHeight) {
    style.height = `${props.wrapperHeight}px`
  }
  return style
})

const viewStyle = computed(() => {
  return {
    height: `${contentHeight.value}px`
  }
})

const innerStyle = computed(() => {
  return {
    width: '100%',
    transform: `translate3d(0px, ${contentTranslate.value}px, 0px)`
  }
})

watch(
  [() => props.wrapperWidth, () => props.wrapperHeight],
  () => {
    scrollbarRef.value?.update()
  },
  { immediate: true }
)

onMounted(() => {
  scrollToIdx(0)
})
</script>

<style lang="scss">
.fd-virtual-grid {
  overflow: hidden;

  &.is-page {
  }
}
</style>
