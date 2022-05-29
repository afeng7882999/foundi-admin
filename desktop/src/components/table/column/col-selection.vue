<template>
  <template v-if="visible">
    <el-table-column v-bind="$attrs" :align="align" :header-align="headerAlign" type="selection" width="40"></el-table-column>
  </template>
</template>

<script setup lang="ts">
import { COL_DEFAULT_PROPS } from '../types'
import useColumn from '../hooks/use-column'

defineOptions({
  name: 'FdColSelection',
  inheritAttrs: false
})

const props = defineProps({ ...COL_DEFAULT_PROPS })

const { visible } = useColumn(props)
</script>
