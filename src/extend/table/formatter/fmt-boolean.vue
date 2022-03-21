<template>
  <template v-if="visibleCo">
    <template v-if="type === 'tag'">
      <el-tag v-if="props.data" size="small" type="success">{{ labelCo }}</el-tag>
      <el-tag v-else size="small" type="danger">{{ labelCo }}</el-tag>
    </template>
    <template v-else-if="type === 'tick'">
      <fd-icon v-if="props.data" class="is-success" icon="check"></fd-icon>
      <fd-icon v-else class="is-danger" icon="close"></fd-icon>
    </template>
    <template v-else>
      <span v-if="props.data" style="color: var(--el-color-success)">{{ labelCo }}</span>
      <span v-else style="color: var(--el-color-danger)">{{ labelCo }}</span>
    </template>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdFmtBoolean'
}
</script>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import { isString } from 'lodash-es'

const props = defineProps({
  data: Boolean as PropType<boolean | undefined | null>,
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

const visibleCo = computed(() => {
  return props.data === true || props.data === false
})

const labelsCo = computed(() => {
  if (isString(props.labels)) {
    const pair = props.labels.split(',').map((l) => l.trim())
    return pair.length >= 2 ? [pair[0], pair[1]] : ['是', '否']
  }
  return props.labels
})

const labelCo = computed(() => {
  return props.data ? labelsCo.value[0] : labelsCo.value[1]
})
</script>
