<template>
  <template v-if="visible">
    <el-table-column
      v-bind="$attrs"
      :show-overflow-tooltip="showOverflowTooltip"
      :align="align"
      :header-align="headerAlign"
      :width="width"
      :min-width="minWidthCo"
      :label-class-name="sortable ? 'is-custom' : ''"
    >
      <template v-if="sortable" #header="scope">
        <fd-table-sort-header :value="sort" :column="scope.column" @sort-changed="onSortChanged"></fd-table-sort-header>
      </template>
    </el-table-column>
  </template>
</template>

<script setup lang="ts">
import { COL_DEFAULT_PROPS } from '../types'
import useColumn from '../hooks/use-column'
import { computed } from 'vue'

defineOptions({
  name: 'FdCol',
  inheritAttrs: false
})

const props = defineProps({ ...COL_DEFAULT_PROPS })

const minWidthCo = computed(() => {
  if (props.minWidth) {
    return props.minWidth
  }
  return '150'
})

const { visible, sortable } = useColumn(props)
</script>
