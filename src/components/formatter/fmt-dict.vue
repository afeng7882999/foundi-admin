<template>
  <template v-if="tag">
    <el-tag v-for="item in formatted" :key="item" :class="$attrs.class" size="small" v-bind="getColorAttr(item)">{{ item }}</el-tag>
  </template>
  <template v-else>
    <div :class="$attrs.class">
      <slot :values="formatted">{{ formattedStr }}</slot>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import { DictItem } from '@/api/system/dict-item'
import useDict from '@/crud/hooks/use-dict'
import { FormatMapping, FormatMappingItem } from './types'
import { isArray, isString } from 'lodash-es'

defineOptions({
  name: 'FdFmtDict'
})

const props = defineProps({
  data: [String, Array] as PropType<string | string[]>,
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

const { dictVal } = useDict()

const formatted = computed(() => {
  if (!props.data) {
    return []
  }
  if (isArray(props.data)) {
    return props.data.map((d) => dictVal(props.dict, d))
  }
  return props.data
    ?.split(',')
    .map((d) => d.trim())
    .filter((d) => !!d)
    .map((d) => dictVal(props.dict, d))
})

const formattedStr = computed(() => {
  return formatted.value.reduce((a, b) => a + ', ' + b)
})

const formatMap = computed(() => {
  if (!props.mapping) {
    return []
  }
  if (isString(props.mapping[0])) {
    return props.mapping.map((m) => {
      const pair = (m as string).split(',')
      return { key: pair[0], color: pair[1] } as FormatMappingItem
    })
  }
  return props.mapping as FormatMapping
})

const getColorAttr = (key: string) => {
  const m = formatMap.value.find((f) => f.key === key)
  if (m?.color && ['success', 'danger', 'warning', 'info'].includes(m.color)) {
    return {
      type: m.color
    }
  }
  if (m?.color) {
    return {
      color: m.color
    }
  }
  return null
}
</script>
