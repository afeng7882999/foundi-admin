<template>
  <template v-if="visible">
    <el-table-column v-bind="$attrs" :align="align" :header-align="headerAlign" :width="widthCo">
      <template #default="scope">
        <fd-fmt-icon :icon="scope.row[attrs.prop]"></fd-fmt-icon>
      </template>
    </el-table-column>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdColIcon',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { COL_DEFAULT_PROPS } from '@/extend/table/types'
import useColumn from '@/extend/table/hooks/use-column'

const props = defineProps({
  ...COL_DEFAULT_PROPS
})

const attrs = useAttrs()

const { visible } = useColumn(props)

const widthCo = computed(() => {
  if (props.width) {
    return props.width
  }
  return '80'
})
</script>
