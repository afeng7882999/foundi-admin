<template>
  <div ref="wrapperRef" class="fd-virtual-grid" :class="wrapperClass">
    <div v-show="!initialized" v-loading="true" class="fd-virtual-grid__loading"></div>
    <template v-if="windowMode">
      <div v-show="length > 0" ref="viewRef" class="fd-virtual-grid__view" :style="viewStyle">
        <div ref="innerRef" class="fd-virtual-grid__inner" :style="innerStyle">
          <template v-for="(item, idx) in buffer" :key="idx">
            <slot v-if="item.value === undefined" name="placeholder" :index="item.index" :itemHeight="itemHeightCal" />
            <slot v-else name="default" :item="item.value" :index="item.index" />
          </template>
        </div>
      </div>
    </template>
    <template v-else>
      <el-scrollbar ref="scrollbarRef" :style="scrollbarStyle">
        <div v-show="length > 0" ref="viewRef" class="fd-virtual-grid__view" :style="viewStyle">
          <div ref="innerRef" class="fd-virtual-grid__inner" :style="innerStyle">
            <template v-for="(item, idx) in buffer" :key="idx">
              <slot v-if="item.value === undefined" name="placeholder" :index="item.index" :itemHeight="itemHeightCal" />
              <slot v-else name="default" :item="item.value" :index="item.index" />
            </template>
          </div>
        </div>
      </el-scrollbar>
    </template>
  </div>
</template>

<script setup lang="ts">
import { OFFSET_CHANGED_EVENT, GRID_DEFAULT_PROPS } from './types'
import { computed, ref, watch } from 'vue'
import useGrid from './use-grid'
import { Indexable } from '@/common/types'
import { ElScrollbar } from 'element-plus'
import useLayoutSize from '@/hooks/use-layout-size'

defineOptions({
  name: 'FdVirtualGrid'
})

const props = defineProps({
  ...GRID_DEFAULT_PROPS
})

const wrapperRef = ref<HTMLElement>()
const viewRef = ref<HTMLElement>()
const innerRef = ref<HTMLElement>()
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()

const emit = defineEmits([OFFSET_CHANGED_EVENT])

const {
  initialized,
  wrapperRect,
  itemHeight: itemHeightCal,
  buffer,
  viewHeight,
  innerTranslate,
  scrollToIdx,
  scrollToPage,
  refresh,
  refreshBuffer
} = useGrid(props, emit, wrapperRef, viewRef, innerRef)

const { isMobile } = useLayoutSize(props.mobileCompact)

const wrapperClass = computed(() => {
  const clazz = []
  if (props.windowMode) {
    clazz.push('is-window')
  }
  return clazz.join(' ')
})

const scrollbarStyle = computed(() => {
  const style = {} as Indexable
  style.width = wrapperRect.value.width ? `${wrapperRect.value.width}px` : null
  style.height = wrapperRect.value.height ? `${wrapperRect.value.height}px` : null
  return style
})

const viewStyle = computed(() => {
  return {
    height: `${viewHeight.value + props.gridGap}px`,
    paddingBottom: `${props.gridGap}px`
  }
})

const innerStyle = computed(() => {
  const style = {
    width: '100%',
    transform: `translate3d(0px, ${innerTranslate.value}px, 0px)`
  } as Indexable

  if (isMobile.value) {
    style.gridTemplateColumns = '1fr'
    return style
  }

  style.gap = `${props.gridGap}px`
  if (props.itemWidth) {
    style.gridTemplateColumns = `repeat(auto-fit, ${props.itemWidth}px)`
  } else if (props.itemMinWidth) {
    style.gridTemplateColumns = `repeat(auto-fit, minmax(${props.itemMinWidth}px, 1fr))`
  }

  return style
})

watch(
  [() => wrapperRect.value.width, () => wrapperRect.value.height],
  () => {
    scrollbarRef.value?.update()
  },
  { immediate: true }
)

defineExpose({
  scrollToIdx,
  scrollToPage,
  refresh,
  refreshBuffer
})
</script>
