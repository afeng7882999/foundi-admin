<template>
  <section class="app-main">
    <router-view v-slot="{ Component, route }">
      <keep-alive :include="cachedViews">
        <component :is="Component" :key="route.path" />
      </keep-alive>
    </router-view>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { AllState } from '@/store'

export default defineComponent({
  name: 'AppMain',
  setup() {
    const store = useStore<AllState>()
    const storeState = store.state as AllState

    const cachedViews = computed(() => {
      return storeState.app.enableTags ? storeState.view.cachedViews : []
    })

    return {
      cachedViews
    }
  }
})
</script>

<style lang="scss">
// app-main
.app-main {
  padding: 10px 20px 20px 20px;
  position: relative;
  overflow: hidden;
}
</style>
