<template>
  <template v-if="visible">
    <el-table-column v-bind="$attrs" :align="align" :header-align="headerAlign" type="selection" width="40"></el-table-column>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdColSelection',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { COL_DEFAULT_PROPS } from '@/extend/table/types'
import useColumn from '@/extend/table/hooks/use-column'

const props = defineProps({ ...COL_DEFAULT_PROPS })

const { visible } = useColumn(props)
</script>
