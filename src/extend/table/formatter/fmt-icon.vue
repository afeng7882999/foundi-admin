<template>
  <fd-icon :icon="iconName" class="tb-icon" :style="iconStyle"></fd-icon>
</template>

<script lang="ts">
export default {
  name: 'FdFmtIcon'
}
</script>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import { FormatMapping, FormatMappingItem } from '@/extend/table/types'
import { isString } from 'lodash-es'

const props = defineProps({
  data: String,
  mapping: Array as PropType<string[] | FormatMapping>
})

const formatMap = computed(() => {
  if (!props.mapping) {
    return []
  }
  if (isString(props.mapping[0])) {
    return props.mapping.map((m) => {
      const pair = (m as string).split(',')
      return { key: pair[0], val: pair[1], color: pair[2] } as FormatMappingItem
    })
  }
  return props.mapping as FormatMapping
})

const iconName = computed(() => {
  const m = formatMap.value.find((f) => f.key === props.data)
  return m && m.val ? m.val : props.data
})

const iconStyle = computed(() => {
  const m = formatMap.value.find((f) => f.key === props.data)
  if (m?.color && ['primary', 'success', 'danger', 'warning', 'info'].includes(m.color)) {
    return {
      color: `var(--el-color-${m.color})`
    }
  }
  return m && m.color ? { color: m.color } : {}
})
</script>
