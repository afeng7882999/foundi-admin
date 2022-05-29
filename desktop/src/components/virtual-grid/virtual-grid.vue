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
    <div v-show="loadingVisible" v-loading="true" :style="loadingStyle" class="fd-virtual-grid__loading"></div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FdVirtualGrid'
}
</script>

<script setup lang="ts">
import { OFFSET_CHANGED_EVENT, GRID_DEFAULT_PROPS, BUFFER_REFRESHED_EVENT } from '@b/components/virtual-grid/types'
import { computed, ref, watch } from 'vue'
import { Indexable } from '@b/common/types'
import useVirtualGrid from '@b/components/virtual-grid/use-virtual-grid'
import { ElScrollbar } from 'element-plus'

const props = defineProps({
  ...GRID_DEFAULT_PROPS
})

const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()

const emit = defineEmits([OFFSET_CHANGED_EVENT, BUFFER_REFRESHED_EVENT])

const {
  wrapperRef,
  viewRef,
  innerRef,
  wrapperRect,
  itemHeightCal,
  buffer,
  loadingStyle,
  loadingVisible,
  scrollToIdx,
  scrollToPage,
  refresh,
  refreshBuffer,
  wrapperClassCo,
  viewStyleCo,
  innerStyleCo
} = useVirtualGrid(props, emit)

const scrollbarStyleCo = computed(() => {
  const style = {} as Indexable
  style.width = '100%'
  style.height = wrapperRect.value.height ? `${wrapperRect.value.height}px` : null
  return style
})

watch(
  [() => wrapperRect.value.width, () => wrapperRect.value.height],
  () => {
    scrollbarRef.value?.update?.()
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
