<template>
  <el-button class="fd-icon-button" v-waves circle size="mini">
    <fd-icon v-if="hasIcon" :icon="icon"></fd-icon>
    <slot />
  </el-button>
</template>

<script lang="ts">
export default {
  name: 'FdIconButton'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    default: ''
  }
})

const hasIcon = computed(() => {
  return !!props.icon
})
</script>
