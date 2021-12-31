<template>
  <iframe id="external-iframe" :src="externalUrl" :style="iframeStyle" class="external-iframe"></iframe>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, toRefs } from 'vue'
import { useStore } from 'vuex'
import { AllState } from '@/store'

export default defineComponent({
  name: 'ExternalPage',
  setup() {
    const state = reactive({
      theUrl: ''
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
      return state.theUrl
    })

    return {
      ...toRefs(state),
      iframeStyle,
      externalUrl
    }
  }
})
</script>
