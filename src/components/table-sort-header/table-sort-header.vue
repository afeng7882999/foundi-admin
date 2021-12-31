<template>
  <div class="fd-table-sort-header" :class="headerClass" @click="onHeaderClick">
    {{ column.label }}
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
  default: null
})

const sortOrder = ref('')

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
}

const onAscClick = () => {
  if (sortOrder.value === 'asc') {
    sortOrder.value = ''
  } else {
    sortOrder.value = 'asc'
  }
  sortedEmit()
}

const onDescClick = () => {
  if (sortOrder.value === 'desc') {
    sortOrder.value = ''
  } else {
    sortOrder.value = 'desc'
  }
  sortedEmit()
}

const emit = defineEmits(['sort-changed'])

const sortedEmit = () => {
  if (props.column) {
    emit('sort-changed', { prop: props.column.property, order: sortOrder.value })
  }
}
</script>

<style lang="scss">
.fd-table-sort-header {
  cursor: pointer;
}
</style>
