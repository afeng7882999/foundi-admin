<template>
  <fd-icon :icon="data" class="tb-icon"></fd-icon>
</template>

<script lang="ts">
export default {
  name: 'FdFmtIcon'
}
</script>

<script setup lang="ts">
const props = defineProps({
  data: String
})
</script>
