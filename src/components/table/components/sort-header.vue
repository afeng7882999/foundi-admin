<template>
  <el-tooltip :show-after="tipShowAfter" :content="tip" placement="top">
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
import { computed, ref } from 'vue'

const props = defineProps({
  column: Object,
  default: null,
  tipShowAfter: {
    type: Number,
    default: 500
  }
})

const sortOrder = ref('')

const tip = ref('点击切换降序')

const headerClass = computed(() => {
  return {
    ascending: sortOrder.value === 'asc',
    descending: sortOrder.value === 'desc'
  }
})

const onHeaderClick = () => {
  if (sortOrder.value === 'desc') {
    sortOrder.value = 'asc'
  } else if (sortOrder.value === 'asc') {
    sortOrder.value = ''
  } else {
    sortOrder.value = 'desc'
  }
  sortedEmit()
  setTimeout(setTip, props.tipShowAfter)
}

const onAscClick = () => {
  if (sortOrder.value === 'asc') {
    sortOrder.value = ''
  } else {
    sortOrder.value = 'asc'
  }
  sortedEmit()
  setTimeout(setTip, props.tipShowAfter)
}

const onDescClick = () => {
  if (sortOrder.value === 'desc') {
    sortOrder.value = ''
  } else {
    sortOrder.value = 'desc'
  }
  sortedEmit()
  setTimeout(setTip, props.tipShowAfter)
}

const emit = defineEmits(['sort-changed'])

const sortedEmit = () => {
  if (props.column) {
    emit('sort-changed', { prop: props.column.property, order: sortOrder.value })
  }
}

const setTip = () => {
  if (sortOrder.value === 'desc') {
    tip.value = '点击切换升序'
  } else if (sortOrder.value === 'asc') {
    tip.value = '点击取消排序'
  } else {
    tip.value = '点击切换降序'
  }
}

const onAscOver = () => {
  if (sortOrder.value === 'asc') {
    tip.value = '点击取消排序'
  } else {
    tip.value = '点击切换升序'
  }
}

const onDescOver = () => {
  if (sortOrder.value === 'desc') {
    tip.value = '点击取消排序'
  } else {
    tip.value = '点击切换降序'
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
