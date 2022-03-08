<template>
  <template v-if="visible">
    <el-table-column
      v-bind="$attrs"
      :align="align"
      :header-align="headerAlign"
      :width="widthCo"
      :label-class-name="sortable ? 'is-custom' : ''"
    >
      <template #default="scope">
        <span>{{ dictVal(dict, scope.row[attrs.prop]) }}</span>
      </template>
      <template v-if="sortable" #header="scope">
        <fd-table-sort-header :value="sort" :column="scope.column" @sort-changed="onSortChanged"></fd-table-sort-header>
      </template>
    </el-table-column>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdColDict',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { DictItem } from '@/api/system/dict-item'
import useDict from '@/components/crud/use-dict'
import { COL_DEFAULT_PROPS } from '@/components/table/types'
import useColumn from '@/components/table/hooks/use-column'

const props = defineProps({
  ...COL_DEFAULT_PROPS,
  dict: {
    type: Array,
    default: () => [] as DictItem[]
  }
})

const attrs = useAttrs()

const { dictVal } = useDict()

const { visible, sortable } = useColumn(props)

const widthCo = computed(() => {
  if (props.width) {
    return props.width
  }
  return '150'
})
</script>
