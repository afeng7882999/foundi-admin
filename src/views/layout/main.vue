<template>
  <div class="fd-main">
    <router-view v-slot="{ Component, route }">
      <keep-alive :include="cachedViews">
        <component :is="Component" :key="route.path" />
      </keep-alive>
    </router-view>
    <div class="fd-footer">
      <fd-svg-image class="fd-footer__icon" img="foundi"></fd-svg-image>
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
import FdSvgImage from '@/components/svg-image/svg-image.vue'

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
  display: flex;
  align-items: center;
  justify-content: center;
  height: $app-footer-height;
  padding: 16px 0 16px;
  color: var(--el-text-color-placeholder);
  user-select: none;

  &__icon {
    height: 16px;
    width: 16px;
    color: var(--el-text-color-placeholder);
    margin-right: 4px;
  }

  &__text {
    display: flex;
    justify-content: center;
    color: var(--el-text-color-placeholder);
    font-size: var(--el-font-size-extra-small);
  }
}
</style>
