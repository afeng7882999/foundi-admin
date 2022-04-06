<template>
  <template v-if="visible">
    <!-- datetime -->
    <el-table-column
      v-bind="$attrs"
      :align="align"
      :header-align="headerAlign"
      :width="width"
      :min-width="minWidthCo"
      :label-class-name="sortable ? 'is-custom' : ''"
    >
      <template #default="scope">
        <span>
          <fd-fmt-datetime :data="scope.row[attrs.prop]"></fd-fmt-datetime>
        </span>
      </template>
      <template v-if="sortable" #header="scope">
        <fd-table-sort-header :value="sort" :column="scope.column" @sort-changed="onSortChanged"></fd-table-sort-header>
      </template>
    </el-table-column>
  </template>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { COL_DEFAULT_PROPS } from '@/extend/table/types'
import useColumn from '@/extend/table/hooks/use-column'

defineOptions({
  name: 'FdColDatetime',
  inheritAttrs: false
})

const props = defineProps({ ...COL_DEFAULT_PROPS })

const attrs = useAttrs()

const { visible, sortable } = useColumn(props)

const minWidthCo = computed(() => {
  if (props.minWidth) {
    return props.minWidth
  }
  return '220'
})
</script>
