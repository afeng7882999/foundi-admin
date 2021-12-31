<template>
  <fd-icon class="fullscreen-button" :icon="ifFullScreen ? 'off-screen-one' : 'full-screen-one'" @click="onClick"></fd-icon>
</template>

<script lang="ts">
export default {
  name: 'FdFullScreenButton'
}
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import screenFull, { Screenfull } from 'screenfull'
import { ElMessage } from 'element-plus'

const ifFullScreen = ref(false)

onMounted(() => {
  if (screenFull.isEnabled) {
    screenFull.on('change', change)
  }
})

onBeforeUnmount(() => {
  if (screenFull.isEnabled) {
    screenFull.off('change', change)
  }
})

const onClick = () => {
  if (!screenFull.isEnabled) {
    ElMessage({
      message: '当前浏览器不支持此功能',
      type: 'warning'
    })
    return false
  }
  screenFull.toggle()
}

const change = () => {
  ifFullScreen.value = (screenFull as Screenfull).isFullscreen
}
</script>
