<template>
  <div :class="classObj" class="app-layout">
    <fd-sidebar :app-config="appConfig" :menu="menu" :mode="mode" :user-profile="userProfile" @off-screen-click="closeOffScreenSidebar" />
    <div class="main-container">
      <div class="fixable-header">
        <app-title @appSettingShow="showAppSetting"></app-title>
        <app-tags v-show="enableTags"></app-tags>
      </div>
      <app-main></app-main>
    </div>
    <app-setting ref="appSetting"></app-setting>
  </div>
</template>

<script lang="ts">
import FdSidebar from './sidebar/index.vue'
import AppSetting from './app-setting.vue'
import AppMain from '@/views/layout/app-main.vue'
import AppTitle from '@/views/layout/app-title.vue'
import AppTags from '@/views/layout/app-tags.vue'
import { DEFAULT_AVATAR } from '@/store/modules/user'
import { setDocumentTheme } from 'element-plus-dynamic-theme/theme'
import { computed, defineComponent, onBeforeMount, onMounted, ref } from 'vue'
import { AllState } from '@/store'
import { useStore } from 'vuex'
import useLayoutResize from './use/use-resize'
import { DeviceType, SidebarMode } from '@/store/modules/app'

export default defineComponent({
  name: 'AppLayout',
  components: {
    FdSidebar,
    AppSetting,
    AppMain,
    AppTitle,
    AppTags
  },
  setup() {
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
        'sidebar-minimized': mode.value.minimized,
        'sidebar-opened': mode.value.opened,
        mobile: device.value === DeviceType.Mobile,
        'enable-tags': enableTags.value,
        'fixed-header': fixedHeader.value
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

    const closeOffScreenSidebar = () => {
      if (mode.value.opened) {
        store.dispatch('app/setSidebarMode', { opened: false })
      }
    }

    const showAppSetting = () => {
      ;(appSetting.value as any).show()
    }

    return {
      appSetting,
      mode,
      menu,
      appConfig,
      userProfile,
      enableTags,
      classObj,
      closeOffScreenSidebar,
      showAppSetting
    }
  }
})
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@use 'src/assets/style/mixin' as *;
@use 'src/assets/style/variable' as *;

.app-layout {
  background: var(--fd-body-background-color);
  @include clearFix;
  position: relative;
  height: 100%;
  width: 100%;

  .main-container {
    position: relative;
    margin-left: $sidebar-normal-width;
    min-height: 100%;
    background: var(--fd-body-background-color);

    .fixable-header {
      padding-bottom: 10px;
    }
  }

  &.sidebar-minimized {
    .main-container {
      margin-left: $sidebar-min-width;
    }
  }

  &.mobile {
    .main-container {
      margin-left: 0;
    }
  }

  &.fixed-header {
    .main-container {
      padding-top: $app-title-height + 10;

      .fixable-header {
        position: fixed;
        top: 0;
        right: 0;
        width: calc(100% - #{$sidebar-normal-width});
        z-index: 9;
        background-color: var(--fd-body-background-color);
      }
    }
  }

  &.sidebar-minimized.fixed-header {
    .main-container .fixable-header {
      width: calc(100% - #{$sidebar-min-width});
    }
  }

  &.mobile.fixed-header {
    .main-container .fixable-header {
      width: 100%;
    }
  }

  &.fixed-header.enable-tags {
    .main-container {
      padding-top: $app-title-height + $app-tags-height + 10;
    }
  }
}
</style>
