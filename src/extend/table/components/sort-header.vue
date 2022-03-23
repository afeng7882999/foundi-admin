<template>
  <el-tooltip :show-after="tipShowAfter" :content="state.tip" placement="top">
    <div class="fd-table-sort-header" :class="headerClass" @click="onHeaderClick">
      <span class="fd-table-sort-header__label">{{ column.label }}</span>
      <span class="caret-wrapper">
        <i class="sort-caret ascending" @click.stop="onAscClick" @mousemove="onAscOver" @mouseleave="setTip"></i>
        <i class="sort-caret descending" @click.stop="onDescClick" @mouseover="onDescOver" @mouseleave="setTip"></i>
      </span>
    </div>
  </el-tooltip>
</template>

<script lang="ts">
export default {
  name: 'FdTableSortHeader'
}
</script>

<script setup lang="ts">
import { computed, PropType, reactive, watch } from 'vue'
import { SortField } from '@/api'

const props = defineProps({
  value: {
    type: Array as PropType<SortField[]>,
    default: () => []
  },
  column: {
    type: Object,
    required: true
  },
  default: null,
  tipShowAfter: {
    type: Number,
    default: 500
  }
})

const state = reactive({
  sortOrder: 'none' as 'asc' | 'desc' | 'none',
  tip: '点击切换降序'
})

const headerClass = computed(() => {
  return {
    ascending: state.sortOrder === 'asc',
    descending: state.sortOrder === 'desc'
  }
})

const onHeaderClick = () => {
  if (state.sortOrder === 'desc') {
    sortedEmit('asc')
  } else if (state.sortOrder === 'asc') {
    sortedEmit('none')
  } else {
    sortedEmit('desc')
  }
  setTimeout(setTip, props.tipShowAfter)
}

const onAscClick = () => {
  if (state.sortOrder === 'asc') {
    sortedEmit('none')
  } else {
    sortedEmit('asc')
  }
  setTimeout(setTip, props.tipShowAfter)
}

const onDescClick = () => {
  if (state.sortOrder === 'desc') {
    sortedEmit('none')
  } else {
    sortedEmit('desc')
  }
  setTimeout(setTip, props.tipShowAfter)
}

const emit = defineEmits(['sort-changed'])

const sortedEmit = (order: 'asc' | 'desc' | 'none') => {
  emit('sort-changed', { prop: props.column.property, order })
}

watch(
  () => props.value,
  (val) => {
    if (val?.length) {
      const field = props.value.find((f) => f.prop === props.column.property)
      if (field && field.order) {
        state.sortOrder = field.order
        setTip()
      } else {
        state.sortOrder = 'none'
      }
    } else {
      state.sortOrder = 'none'
    }
  },
  { immediate: true, deep: true }
)

const setTip = () => {
  if (state.sortOrder === 'desc') {
    state.tip = '点击切换升序'
  } else if (state.sortOrder === 'asc') {
    state.tip = '点击取消排序'
  } else {
    state.tip = '点击切换降序'
  }
}

const onAscOver = () => {
  if (state.sortOrder === 'asc') {
    state.tip = '点击取消排序'
  } else {
    state.tip = '点击切换升序'
  }
}

const onDescOver = () => {
  if (state.sortOrder === 'desc') {
    state.tip = '点击取消排序'
  } else {
    state.tip = '点击切换降序'
  }
}
</script>

<style lang="scss">
.fd-table-sort-header {
  display: flex;
  flex: 1;
  height: 100%;
  padding: 10px;
  align-items: center;
  cursor: pointer;

  &:hover {
    background-color: var(--el-bg-color);
  }
}
</style>
