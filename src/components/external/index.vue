<template>
  <iframe id="external-iframe" :src="externalUrl" :style="iframeStyle" class="fd-external-iframe"></iframe>
</template>

<script lang="ts">
export default {
  name: 'External'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { AllState } from '@/store'

const props = defineProps({
  theUrl: String
})

const store = useStore<AllState>()
const storeState = store.state as AllState

const iframeStyle = computed(() => {
  return {
    width: storeState.app.docWidth + 'px',
    height: storeState.app.docHeight - 4 + 'px'
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
