<template>
  <div class="fd-table-sort-header" :class="headerClass" @click="onHeaderClick">
    <el-tooltip :show-after="tipShowAfter" :content="tip" placement="top">
      <span class="fd-table-sort-header__label">{{ column.label }}</span>
    </el-tooltip>
    <span class="caret-wrapper">
      <i class="sort-caret ascending" @click.stop="onAscClick"></i>
      <i class="sort-caret descending" @click.stop="onDescClick"></i>
    </span>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FdTableSortHeader'
}
</script>

<script setup lang="ts">
import { computed, PropType, ref } from 'vue'
import { AnyObject } from '@/utils'

const props = defineProps({
  column: Object as PropType<AnyObject>,
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
  setTip()
}

const onAscClick = () => {
  if (sortOrder.value === 'asc') {
    sortOrder.value = ''
  } else {
    sortOrder.value = 'asc'
  }
  sortedEmit()
  setTip()
}

const onDescClick = () => {
  if (sortOrder.value === 'desc') {
    sortOrder.value = ''
  } else {
    sortOrder.value = 'desc'
  }
  sortedEmit()
  setTip()
}

const emit = defineEmits(['sort-changed'])

const sortedEmit = () => {
  if (props.column) {
    emit('sort-changed', { prop: props.column.property, order: sortOrder.value })
  }
}

const setTip = () => {
  setTimeout(() => {
    if (sortOrder.value === 'desc') {
      tip.value = '点击切换升序'
    } else if (sortOrder.value === 'asc') {
      tip.value = '点击取消排序'
    } else {
      tip.value = '点击切换降序'
    }
  }, props.tipShowAfter)
}
</script>

<style lang="scss">
.fd-table-sort-header {
  display: flex;
  height: 30px;
  align-items: center;
  cursor: pointer;

  &:hover {
    .fd-table-sort-header__label {
      color: var(--el-color-primary);
    }
  }
}
</style>
