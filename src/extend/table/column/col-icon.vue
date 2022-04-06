<template>
  <template v-if="visible">
    <el-table-column v-bind="$attrs" :align="align" :header-align="headerAlign" :width="width" :min-width="minWidthCo">
      <template #default="scope">
        <fd-fmt-icon :icon="scope.row[attrs.prop]" :mapping="mapping"></fd-fmt-icon>
      </template>
    </el-table-column>
  </template>
</template>

<script setup lang="ts">
import { computed, PropType, useAttrs } from 'vue'
import { COL_DEFAULT_PROPS, FormatMapping } from '@/extend/table/types'
import useColumn from '@/extend/table/hooks/use-column'

defineOptions({
  name: 'FdColIcon',
  inheritAttrs: false
})

const props = defineProps({
  ...COL_DEFAULT_PROPS,
  mapping: Array as PropType<string[] | FormatMapping>
})

const attrs = useAttrs()

const { visible } = useColumn(props)

const minWidthCo = computed(() => {
  if (props.minWidth) {
    return props.minWidth
  }
  return '80'
})
</script>
