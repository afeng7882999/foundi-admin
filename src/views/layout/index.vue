<template>
  <div :class="classObj" class="fd-layout">
    <fd-sidebar
      :app-config="appConfig"
      :menu="menu"
      :mode="mode"
      :user-profile="userProfile"
      @off-screen-click="closeOffScreenSidebar"
    />
    <div class="fd-layout__main">
      <div class="fd-layout__header">
        <fd-title @app-setting-show="showAppSetting"></fd-title>
        <fd-tags v-show="enableTags"></fd-tags>
      </div>
      <fd-main></fd-main>
    </div>
    <fd-setting ref="appSetting"></fd-setting>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FdLayout'
}
</script>

<script setup lang="ts">
import FdSidebar from './sidebar/index.vue'
import FdSetting from './setting.vue'
import FdMain from './main.vue'
import FdTitle from './title.vue'
import FdTags from './tags.vue'
import { DEFAULT_AVATAR } from '@/store/modules/user'
import { setDocumentTheme } from 'element-plus-dynamic-theme/theme'
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import { AllState } from '@/store'
import { useStore } from 'vuex'
import useLayoutResize from './use-resize'
import { DeviceType, SidebarMode } from '@/store/modules/app'

const store = useStore<AllState>()
const storeState = store.state as AllState

const { device, addResizeListener, resizeLayout } = useLayoutResize()

const appSetting = ref()

const mode = computed(() => {
  return storeState.app.sidebarMode as SidebarMode
})

const menu = computed(() => {
  return storeState.user.menu
})

const appConfig = computed(() => {
  return {
    title: storeState.app.title,
    icon: storeState.app.icon
  }
})

const userProfile = computed(() => {
  return {
    username: storeState.user.user.username,
    avatar: storeState.user.user.avatar ? storeState.user.user.avatar : DEFAULT_AVATAR,
    roles: storeState.user.roles
  }
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
    'is-mobile': device.value === DeviceType.Mobile,
    'is-enable-tags': enableTags.value,
    'is-fixed-header': fixedHeader.value
  }
})

onBeforeMount(() => {
  const theme = storeState.app.theme
  if (theme) {
    setDocumentTheme(theme)
  }
})

onMounted(() => {
  addResizeListener()
  resizeLayout()
})

const closeOffScreenSidebar = async () => {
  if (mode.value.opened) {
    await store.dispatch('app/setSidebarMode', { opened: false })
  }
}

const showAppSetting = () => {
  ;(appSetting.value as any).show()
}
</script>

<style lang="scss" rel="stylesheet/scss">
@use 'src/assets/style/mixin' as *;
@use 'src/assets/style/variable' as *;

.fd-layout {
  background: var(--el-body-bg-color);
  @include clearFix;
  position: relative;
  height: 100%;
  width: 100%;

  &__main {
    position: relative;
    margin-left: $sidebar-normal-width;
    min-height: 100%;
    background: var(--el-body-bg-color);
  }

  &__header {
    padding-bottom: 8px;
  }

  &.is-sidebar-minimized {
    .fd-layout__main {
      margin-left: $sidebar-min-width;
    }
  }

  &.is-mobile {
    .fd-layout__main {
      margin-left: 0;
    }
  }

  &.is-fixed-header {
    .fd-layout__main {
      padding-top: $app-title-height + 8;
    }

    .fd-layout__header {
      position: fixed;
      top: 0;
      right: 0;
      width: calc(100% - #{$sidebar-normal-width});
      z-index: 9;
      background-color: var(--el-body-bg-color);
    }
  }

  &.is-sidebar-minimized.is-fixed-header {
    .fd-layout__header {
      width: calc(100% - #{$sidebar-min-width});
    }
  }

  &.is-mobile.is-fixed-header {
    .fd-layout__header {
      width: 100%;
    }
  }

  &.is-fixed-header.is-enable-tags {
    .fd-layout__main {
      padding-top: $app-title-height + $app-tags-height + 8;
    }
  }
}
</style>
