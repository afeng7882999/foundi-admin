<template>
  <template v-if="visible">
    <el-table-column
      v-bind="$attrs"
      :show-overflow-tooltip="showOverflowTooltip"
      :align="align"
      :header-align="headerAlign"
      :width="width"
      :min-width="minWidth"
      :label-class-name="sortable ? 'is-custom' : ''"
    >
      <template #default="scope">
        <slot :row="scope.row" :idx="scope.$index"></slot>
      </template>
      <template v-if="sortable" #header="scope">
        <fd-table-sort-header :value="sort" :column="scope.column" @sort-changed="onSortChanged"></fd-table-sort-header>
      </template>
    </el-table-column>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdColCustom',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { COL_DEFAULT_PROPS } from '@/extend/table/types'
import useColumn from '@/extend/table/hooks/use-column'

const props = defineProps({ ...COL_DEFAULT_PROPS })

const { visible, sortable } = useColumn(props)
</script>
