<template>
  <iframe id="external-iframe" :src="externalUrl" :style="iframeStyle" class="fd-external-iframe"></iframe>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import usePage from '@/crud/hooks/use-page'

defineOptions({
  name: 'FdExternal'
})

const props = defineProps({
  theUrl: String
})

const { getDocWidth, getDocHeight } = usePage({ footerVisible: false })

const iframeStyle = computed(() => {
  return {
    width: getDocWidth(0, 'px'),
    height: getDocHeight(4, 'px')
  }
})

const externalUrl = computed(() => {
  return props.theUrl
})
</script>

<style lang="scss">
.fd-external-iframe {
  border: none;
}
</style>
