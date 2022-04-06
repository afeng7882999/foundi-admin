<template>
  <fd-code-editor :model-value="formatted" language="application/json" readonly />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatJson } from '@/utils/lang'
import FdCodeEditor from '@/components/code-editor/index.vue'

defineOptions({
  name: 'FdFmtJson'
})

const props = defineProps({
  data: String
})

const formatted = computed(() => {
  return props.data ? formatJson(props.data) : ''
})
</script>
