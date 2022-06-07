<template>
  <div :class="classObj" class="fd-layout">
    <div class="fd-layout__header">
      <fd-title :logo="!isMobileOrPadSize" />
    </div>
    <div class="fd-layout__tags">
      <fd-router-tags v-show="enableTags" />
    </div>
    <div class="fd-layout__sidebar">
      <fd-sidebar :menu="menu" :mode="mode" @off-screen-click="closeOffScreenSidebar" />
    </div>
    <div class="fd-layout__main">
      <fd-doc />
    </div>
  </div>
</template>

<script setup lang="ts">
import FdSidebar from '@b/views/layout/sidebar.vue'
import FdDoc from './doc.vue'
import FdTitle from './title.vue'
import FdRouterTags from '@/components/router-tags/index.vue'
import { computed, onBeforeMount, onMounted, watch } from 'vue'
import { AllState, useStore } from '@/store'
import { SidebarMode } from '@b/store/modules/app'
import { setDocumentTheme } from '@/components/theme/theme'
import useLayoutSize from '@b/hooks/use-layout-size'

defineOptions({
  name: 'FdLayout'
})

const store = useStore()
console.log('index', store)
const storeState = store.state as AllState

const { addResizeObserver, doLayoutResize, isMobileOrPadSize } = useLayoutSize()

const mode = computed(() => {
  return storeState.app.sidebarMode as SidebarMode
})

const menu = computed(() => {
  return storeState.user.menu
})

const enableTags = computed(() => {
  return storeState.app.enableTags
})

const fixedHeader = computed(() => {
  return storeState.app.fixedHeader
})

const classObj = computed(() => {
  return {
    'is-sidebar-minimized': mode.value.minimized,
    'is-sidebar-opened': mode.value.opened,
    'is-pad': isMobileOrPadSize.value,
    'is-enable-tags': enableTags.value,
    'is-fixed-header': fixedHeader.value
  }
})
watch(
  () => isMobileOrPadSize.value,
  async (val) => {
    if (val) {
      await store.dispatch('app/setSidebarMode', { offScreen: true, opened: false })
    } else {
      await store.dispatch('app/setSidebarMode', { offScreen: false, opened: false })
    }
  },
  { immediate: true }
)

onBeforeMount(() => {
  const theme = storeState.theme.theme
  if (theme) {
    setDocumentTheme(theme)
  }
})

onMounted(() => {
  addResizeObserver()
  doLayoutResize()
})

const closeOffScreenSidebar = async () => {
  if (mode.value.opened) {
    await store.dispatch('app/setSidebarMode', { opened: false })
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
@use '../base/src/assets/style/mixin' as *;
@use '../base/src/assets/style/variable' as *;

.fd-layout {
  @include clearFix();
  position: relative;
  height: 100%;
  width: 100%;
  background: var(--el-bg-color-page);

  &__header {
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
    box-sizing: border-box;
    border-bottom: 1px solid var(--el-border-color);
    border-radius: 0 !important;
    background: var(--fd-app-title-bg-color);
    z-index: $index-title;

    .fd-title {
      height: 47px;
    }
  }

  &__tags {
    position: fixed;
    width: 100%;
    height: 0;
    top: $app-title-height;
    left: 50%;
    transform: translateX(-50%);
    z-index: $index-title;

    .fd-router-tags {
      width: 100%;
      padding-left: $sidebar-normal-width;
    }
  }
  &__sidebar {
    position: fixed;
    width: 100%;
    height: 0;
    top: $app-title-height;
    left: 50%;
    transform: translateX(-50%);
    z-index: $index-sidebar;

    .fd-sidebar {
      position: absolute;
      top: 0;
      left: 0;
      padding: 16px 0 0 0;
      height: calc(100vh - #{$app-title-height});
      overflow: hidden;
      z-index: $index-sidebar;
    }
  }

  &__main {
    position: relative;
    width: 100%;
    padding-top: $app-title-height;
    padding-left: $sidebar-normal-width;
  }

  &.is-box {
    .fd-layout__header .fd-title {
      max-width: $layout-box-width;
      margin: 0 auto;
    }
    .fd-layout__sidebar {
      max-width: $layout-box-width;
    }
    .fd-layout__tags {
      max-width: $layout-box-width;
    }
    .fd-layout__main {
      max-width: $layout-box-width;
      margin: 0 auto;
    }
    .fd-page {
      padding-right: 0;
    }
  }

  &.is-enable-tags {
    .fd-layout__main {
      padding-top: $app-title-height + $app-tags-height;
    }
  }

  &.is-sidebar-minimized {
    .fd-router-tags {
      padding-left: $sidebar-min-width;
    }
    .fd-layout__main {
      padding-left: $sidebar-min-width;
    }
  }

  &.is-pad {
    .fd-layout__sidebar {
      top: 0;
      z-index: $index-popper-top;
    }
    .fd-sidebar {
      left: -$sidebar-normal-width;
      height: 100vh;
      padding-top: 0;
    }
    .fd-router-tags {
      padding-left: 0;
    }
    .fd-layout__main {
      padding-left: 0;
    }
  }

  &.is-pad.is-sidebar-opened {
    overflow: hidden;
  }
}
</style>
