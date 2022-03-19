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
        <span>
          <fd-fmt-dict :dict="dict" :data="scope.row[attrs.prop]"></fd-fmt-dict>
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
  name: 'FdColDict',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { computed, PropType, useAttrs } from 'vue'
import { DictItem } from '@/api/system/dict-item'
import { COL_DEFAULT_PROPS } from '@/extend/table/types'
import useColumn from '@/extend/table/hooks/use-column'

const props = defineProps({
  ...COL_DEFAULT_PROPS,
  dict: {
    type: Array as PropType<DictItem[]>,
    default: () => [] as DictItem[]
  }
})

const attrs = useAttrs()

const { visible, sortable } = useColumn(props)

const widthCo = computed(() => {
  if (props.width) {
    return props.width
  }
  return '150'
})
</script>
