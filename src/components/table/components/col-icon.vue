<template>
  <template v-if="visible">
    <el-table-column v-bind="$attrs" :align="align" :header-align="headerAlign" :width="widthCo">
      <template #default="scope">
        <fd-icon :icon="scope.row[attrs.prop]" class="tb-icon"></fd-icon>
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
import { COL_DEFAULT_PROPS } from '@/components/table/types'
import useColumn from '@/components/table/hooks/use-column'

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
