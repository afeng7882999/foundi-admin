<template>
  <template v-if="tag">
    <el-tag v-for="item in formatted" :key="item" size="small" type="primary" v-bind="getColorAttr(item)">{{ item }}</el-tag>
  </template>
  <template v-else>
    {{ formattedStr }}
  </template>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import { FormatMapping, FormatMappingItem } from '@/extend/table/types'
import { isArray, isString } from 'lodash-es'
import { DEFAULT_TREE_FIELDS, getTreeNode, isTreeData, TreeFields } from '@/utils/data-tree'
import { Indexable } from '@/common/types'

defineOptions({
  name: 'FdFmtList'
})

const props = defineProps({
  data: [String, Array] as PropType<string | string[]>,
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

const formatted = computed(() => {
  if (!props.data) {
    return []
  }
  const arr = isArray(props.data)
    ? props.data
    : props.data
        ?.split(',')
        .map((d) => d.trim())
        .filter((d) => !!d)
  if (!props.list) {
    return arr
  }
  const idField = props.fields?.idField ?? (DEFAULT_TREE_FIELDS.idField as string)
  const labelField = props.fields?.labelField ?? (DEFAULT_TREE_FIELDS.labelField as string)
  const mapped = isTreeData(props.list)
    ? arr.map((a) => getTreeNode(props.list, (l) => l[idField] === a))
    : arr.map((a) => props.list.find((l) => l[idField] === a))
  return mapped.map((m, i) => (m ? m[labelField] : arr[i]))
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
  if (m?.color && ['primary', 'success', 'danger', 'warning', 'info'].includes(m.color)) {
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
