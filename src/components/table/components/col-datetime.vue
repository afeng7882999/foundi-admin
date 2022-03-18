<template>
  <template v-if="visible">
    <!-- datetime -->
    <el-table-column
      v-bind="$attrs"
      :align="align"
      :header-align="headerAlign"
      :width="widthCo"
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

<script lang="ts">
export default {
  name: 'FdColDatetime',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { COL_DEFAULT_PROPS } from '@/components/table/types'
import useColumn from '@/components/table/hooks/use-column'

const props = defineProps({ ...COL_DEFAULT_PROPS })

const attrs = useAttrs()

const { visible, sortable } = useColumn(props)

const widthCo = computed(() => {
  if (props.width) {
    return props.width
  }
  return '200'
})
</script>
