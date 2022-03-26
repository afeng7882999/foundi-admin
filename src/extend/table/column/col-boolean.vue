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
        <fd-fmt-boolean :data="scope.row[attrs.prop]" :type="type" :labels="labels"></fd-fmt-boolean>
      </template>
      <template v-if="sortable" #header="scope">
        <fd-table-sort-header :value="sort" :column="scope.column" @sort-changed="onSortChanged"></fd-table-sort-header>
      </template>
    </el-table-column>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdColBoolean',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { computed, PropType, useAttrs } from 'vue'
import { COL_DEFAULT_PROPS } from '@/extend/table/types'
import useColumn from '@/extend/table/hooks/use-column'

const props = defineProps({
  ...COL_DEFAULT_PROPS,
  type: {
    type: String as PropType<'tag' | 'tick' | 'plain'>,
    default: 'tag',
    validator: (val: string) => ['tag', 'tick', 'plain'].includes(val)
  },
  labels: {
    type: [String, Array] as PropType<string | string[]>,
    default: () => ['是', '否']
  }
})

const attrs = useAttrs()

const { visible, sortable } = useColumn(props)

const widthCo = computed(() => {
  if (props.width) {
    return props.width
  }
  return '80'
})
</script>
