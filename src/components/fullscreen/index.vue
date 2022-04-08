<template>
  <fd-button type="icon" :icon="isFullscreen ? 'off-screen-one' : 'full-screen-one'" @click="toggle"></fd-button>
</template>

<script setup lang="ts">
import { useFullscreen } from '@vueuse/core'

defineOptions({
  name: 'FdFullScreenButton'
})

const { isFullscreen, toggle: _toggle } = useFullscreen()

const toggle = () => {
  _toggle()
}
</script>
