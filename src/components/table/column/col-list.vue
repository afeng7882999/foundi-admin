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
          <fd-fmt-list :data="scope.row[attrs.prop]" :tag="tag" :list="list" :fields="fields" :mapping="mapping"></fd-fmt-list>
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
import { COL_DEFAULT_PROPS, FormatMapping } from '../types'
import useColumn from '../hooks/use-column'
import { Indexable } from '@/common/types'
import { DEFAULT_TREE_FIELDS, TreeFields } from '@/utils/data-tree'

defineOptions({
  name: 'FdColList',
  inheritAttrs: false
})

const props = defineProps({
  ...COL_DEFAULT_PROPS,
  tag: {
    type: Boolean,
    default: false
  },
  list: {
    type: Array as PropType<Indexable[]>,
    default: () => []
  },
  fields: {
    type: Object as PropType<TreeFields>,
    default: () => DEFAULT_TREE_FIELDS
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
