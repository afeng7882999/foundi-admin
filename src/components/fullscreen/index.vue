<template>
  <fd-icon class="fd-fullscreen-button" :icon="isFullscreen ? 'off-screen-one' : 'full-screen-one'" @click="toggle"></fd-icon>
</template>

<script lang="ts">
export default {
  name: 'FdFullScreenButton'
}
</script>

<script setup lang="ts">
import { useFullscreen } from '@vueuse/core'

const { isSupported, isFullscreen, toggle } = useFullscreen()
</script>
