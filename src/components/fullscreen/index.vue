<template>
  <fd-icon class="fd-fullscreen-button" :icon="isFullscreen ? 'off-screen-one' : 'full-screen-one'" @click="toggle"></fd-icon>
</template>

<script setup lang="ts">
import { useFullscreen } from '@vueuse/core'

defineOptions({
  name: 'FdFullScreenButton'
})

const { isSupported, isFullscreen, toggle } = useFullscreen()
</script>
