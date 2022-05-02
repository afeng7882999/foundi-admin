<template>
  <div ref="wrapperRef" class="fd-virtual-grid" :class="wrapperClass">
    <template v-if="pageMode">
      <div v-show="length > 0" ref="viewRef" class="fd-virtual-grid__view" :style="viewStyle">
        <div ref="innerRef" class="fd-virtual-grid__inner" :style="innerStyle">
          <template v-for="(item, idx) in buffer" :key="idx">
            <slot v-if="item.value === undefined" name="placeholder" :index="item.index" />
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
              <div v-if="item.value === undefined" class="fd-virtual-grid__placeholder" :style="`height: ${itemHeight}px`">
                <slot name="placeholder" :index="item.index" />
              </div>
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
import { computed, onMounted, ref, watch } from 'vue'
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

const emit = defineEmits([OFFSET_CHANGED_EVENT])

const { wrapperRect, itemHeight, buffer, viewHeight, innerTranslate, scrollToIdx } = useGrid(props, emit, wrapperRef, viewRef, innerRef)

const wrapperClass = computed(() => {
  const clazz = []
  if (props.pageMode) {
    clazz.push('is-page')
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
    height: `${viewHeight.value}px`
  }
})

const innerStyle = computed(() => {
  const style = {
    width: '100%',
    transform: `translate3d(0px, ${innerTranslate.value}px, 0px)`,
    gap: `${props.gridGap}px`
  } as Indexable
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

onMounted(() => {
  scrollToIdx(0)
})

defineExpose({
  scrollToIdx
})
</script>
