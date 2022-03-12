<template>
  <div class="fd-main">
    <router-view v-slot="{ Component, route }">
      <keep-alive :include="cachedViews">
        <component :is="Component" :key="route.path" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FdMain'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { AllState } from '@/store'

const store = useStore<AllState>()
const storeState = store.state as AllState

const cachedViews = computed(() => {
  return storeState.app.enableTags ? storeState.view.cachedViews : []
})
</script>

<style lang="scss">
@use '/src/assets/style/variable' as *;

.fd-main {
  position: relative;
  overflow: hidden;
}
</style>
