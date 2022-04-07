<template>
  <template v-if="visible">
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
          <fd-fmt-dict :dict="dict" :data="scope.row[attrs.prop]" :tag="tag" :mapping="mapping"></fd-fmt-dict>
        </span>
      </template>
      <template v-if="sortable" #header="scope">
        <fd-table-sort-header :value="sort" :column="scope.column" @sort-changed="onSortChanged"></fd-table-sort-header>
      </template>
    </el-table-column>
  </template>
</template>

<script setup lang="ts">
import { computed, PropType, useAttrs } from 'vue'
import { DictItem } from '@/api/system/dict-item'
import { COL_DEFAULT_PROPS, FormatMapping } from '../types'
import useColumn from '../hooks/use-column'

defineOptions({
  name: 'FdColDict',
  inheritAttrs: false
})

const props = defineProps({
  ...COL_DEFAULT_PROPS,
  dict: {
    type: Array as PropType<DictItem[]>,
    default: () => [] as DictItem[]
  },
  tag: {
    type: Boolean,
    default: false
  },
  mapping: Array as PropType<string[] | FormatMapping>
})

const attrs = useAttrs()

const { visible, sortable } = useColumn(props)

const minWidthCo = computed(() => {
  if (props.minWidth) {
    return props.minWidth
  }
  return '150'
})
</script>
