<template>
  <el-button class="fd-icon-btn" v-waves circle>
    <fd-icon v-if="hasIcon" :icon="icon"></fd-icon>
    <slot />
  </el-button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'FdIconButton'
})

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
