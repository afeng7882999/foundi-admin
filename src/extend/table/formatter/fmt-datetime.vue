<template>
  {{ formatted }}
</template>

<script lang="ts">
export default {
  name: 'FdFmtDatetime'
}
</script>

<script setup lang="ts">
import { formatTimestamp } from '@/utils/time'
import { computed } from 'vue'

const props = defineProps({
  data: String
})

const formatted = computed(() => {
  return props.data ? formatTimestamp(props.data) : ''
})
</script>
