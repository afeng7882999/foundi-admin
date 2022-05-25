<template>
  <div ref="wrapperRef" class="fd-virtual-grid" :class="wrapperClassCo">
    <template v-if="windowMode">
      <div ref="viewRef" class="fd-virtual-grid__view" :style="viewStyleCo">
        <div v-if="buffer.length === 0" class="fd-virtual-grid__empty">
          <slot name="empty">{{ emptyText }}</slot>
        </div>
        <div ref="innerRef" class="fd-virtual-grid__inner" :style="innerStyleCo">
          <template v-for="(item, idx) in buffer" :key="idx">
            <slot :item="item.value" :index="item.index" :item-height="itemHeightCal" />
          </template>
        </div>
      </div>
    </template>
    <template v-else>
      <el-scrollbar ref="scrollbarRef" :style="scrollbarStyleCo">
        <div ref="viewRef" class="fd-virtual-grid__view" :style="viewStyleCo">
          <div v-if="buffer.length === 0" class="fd-virtual-grid__empty">
            <slot name="empty">{{ emptyText }}</slot>
          </div>
          <div ref="innerRef" class="fd-virtual-grid__inner" :style="innerStyleCo">
            <template v-for="(item, idx) in buffer" :key="idx">
              <slot :item="item.value" :index="item.index" :item-height="itemHeightCal" />
            </template>
          </div>
        </div>
      </el-scrollbar>
    </template>
    <div v-show="state.loadingVisible" v-loading="true" :style="state.loadingStyle" class="fd-virtual-grid__loading"></div>
  </div>
</template>

<script setup lang="ts">
import { OFFSET_CHANGED_EVENT, GRID_DEFAULT_PROPS, BUFFER_REFRESHED_EVENT } from './types'
import { computed, reactive, ref, watch } from 'vue'
import useGrid from './use-grid'
import { Indexable } from '@/common/types'
import { ElScrollbar } from 'element-plus'

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

const emit = defineEmits([OFFSET_CHANGED_EVENT, BUFFER_REFRESHED_EVENT])

const {
  wrapperRect,
  itemHeight: itemHeightCal,
  buffer,
  viewHeight,
  innerTranslate,
  lessThanRowSize,
  loading,
  scrollToIdx,
  scrollToPage,
  refresh,
  refreshBuffer
} = useGrid(props, emit, wrapperRef, viewRef, innerRef)

const state = reactive({
  loadingStyle: {} as Indexable,
  loadingVisible: false
})

const wrapperClassCo = computed(() => {
  const clazz = []
  if (props.windowMode) {
    clazz.push('is-window')
  }
  if (props.isMobile) {
    clazz.push('is-mobile')
  }
  return clazz.join(' ')
})

const scrollbarStyleCo = computed(() => {
  const style = {} as Indexable
  style.width = wrapperRect.value.width ? `${wrapperRect.value.width}px` : null
  style.height = wrapperRect.value.height ? `${wrapperRect.value.height}px` : null
  return style
})

const viewStyleCo = computed(() => {
  return {
    height: `${viewHeight.value + props.gridGap}px`,
    paddingBottom: `${props.gridGap}px`
  }
})

const innerStyleCo = computed(() => {
  const style = {
    width: '100%',
    transform: `translate3d(0px, ${innerTranslate.value}px, 0px)`
  } as Indexable

  if (props.isMobile) {
    style.gridTemplateColumns = '1fr'
    return style
  }

  style.gap = `${props.gridGap}px`
  if (props.itemWidth) {
    style.gridTemplateColumns = `repeat(auto-fit, ${props.itemWidth}px)`
  } else if (props.itemMinWidth) {
    style.gridTemplateColumns = lessThanRowSize.value
      ? `repeat(auto-fit, ${props.itemMinWidth}px)`
      : `repeat(auto-fit, minmax(${props.itemMinWidth}px, 1fr))`
  }

  return style
})

watch(
  () => loading.value,
  (val) => {
    if (val && props.windowMode) {
      const top = Math.max(wrapperRef.value?.getBoundingClientRect().top as number, 0)
      state.loadingStyle.top = `${top}px`
      state.loadingStyle.left = 0
      state.loadingStyle.width = `${window.innerWidth}px`
      state.loadingStyle.height = `${window.innerHeight - top}px`
    }
    state.loadingVisible = val
  },
  { immediate: true }
)

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
