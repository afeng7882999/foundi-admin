<template>
  <fd-code-editor :model-value="formatted" language="application/json" readonly />
</template>

<script lang="ts">
export default {
  name: 'FdFmtJson'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { formatJson } from '@/utils/lang'
import FdCodeEditor from '@/components/code-editor/index.vue'

const props = defineProps({
  data: String
})

const formatted = computed(() => {
  return props.data ? formatJson(props.data) : ''
})
</script>
