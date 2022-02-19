<template>
  <div class="fd-main">
    <router-view v-slot="{ Component, route }">
      <keep-alive :include="cachedViews">
        <component :is="Component" :key="route.path" />
      </keep-alive>
    </router-view>
    <div class="fd-footer">
      <span class="fd-footer__text">{{ settings.footer }}</span>
    </div>
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
import settings from '@/app/settings'

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

.fd-footer {
  height: $app-footer-height;
  padding: 16px 0 16px;
  &__text {
    width: 100%;
    display: flex;
    justify-content: center;
    color: var(--el-text-color-placeholder);
    font-size: var(--el-font-size-extra-small);
  }
}
</style>
