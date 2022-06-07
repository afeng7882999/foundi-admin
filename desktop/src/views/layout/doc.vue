<template>
  <div class="fd-doc">
    <router-view v-slot="{ Component, route }">
      <keep-alive :include="cachedViews">
        <component :is="Component" :key="route.path" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'

defineOptions({
  name: 'FdDoc'
})

const store = useStore()
const storeState = store.state

const cachedViews = computed(() => {
  return storeState.app.enableTags ? storeState.view.cachedViews : []
})
</script>

<style lang="scss">
@use '../base/src/assets/style/variable' as *;

.fd-doc {
  position: relative;
  overflow: hidden;
}
</style>
