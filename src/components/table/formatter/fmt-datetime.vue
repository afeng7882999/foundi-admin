<template>
  {{ formatted }}
</template>

<script setup lang="ts">
import { formatTimestamp } from '@/utils/time'
import { computed } from 'vue'

defineOptions({
  name: 'FdFmtDatetime'
})

const props = defineProps({
  data: String
})

const formatted = computed(() => {
  return props.data ? formatTimestamp(props.data) : ''
})
</script>
