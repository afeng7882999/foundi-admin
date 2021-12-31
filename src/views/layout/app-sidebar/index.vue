<template>
  <div :class="classObj" class="app-sidebar">
    <div ref="sidebar" class="sidebar" @mouseenter="setExpand(true)" @mouseleave="setExpand(false)">
      <app-logo v-show="showLogo" :minimized="minimized"></app-logo>
      <el-scrollbar class="sidebar-scrollbar">
        <fd-user-profile v-show="showUser" :minimized="minimized" @click="userProfileClick"></fd-user-profile>
        <fd-nav-menu ref="navMenu" :default-path="$route.path" :level-padding="levelPadding" :menu="menu" :minimized="minimized" :grouped="useGroup" @select="offScreenClose"></fd-nav-menu>
      </el-scrollbar>
      <div class="sidebar-bg"></div>
    </div>
    <div class="sidebar-mask" @click="offScreenClose"></div>
  </div>
</template>

<script lang="ts">
import FdUserProfile from './user-profile.vue'
import AppLogo from './logo.vue'
import FdNavMenu from '@/components/nav-menu/index.vue'
import { computed, defineComponent, PropType, reactive, ref, toRefs, watch } from 'vue'
import { AppState, SidebarMode } from '@/store/modules/app'
import { UserState } from '@/store/modules/user'
import { ITreeNodeDefault } from '@/utils/data-tree'

const DEFAULT_LEVEL_PADDING = 10

export default defineComponent({
  name: 'AppSidebar',
  components: {
    FdUserProfile,
    AppLogo,
    FdNavMenu
  },
  props: {
    menu: {
      type: Array as PropType<ITreeNodeDefault[]>,
      default: () => []
    },
    mode: {
      type: Object as PropType<SidebarMode>,
      default: () => undefined
    },
    appConfig: {
      type: Object as PropType<AppState>,
      default: () => undefined
    },
    userProfile: {
      type: Object as PropType<UserState>,
      default: () => undefined
    }
  },
  emits: ['off-screen-click'],
  setup(props, { emit }) {
    const navMenu = ref()
    const state = reactive({
      minimizeExpand: false,
      minimizeDisable: false,
      offScreen: false,
      levelPadding: 0,
      useGroup: true,
      showLogo: true,
      showUser: true
    })

    const minimized = computed(() => {
      return props.mode && props.mode.minimized && !state.minimizeExpand && !state.minimizeDisable
    })

    const classObj = computed(() => {
      return [minimized.value ? 'minimized' : '', state.offScreen ? 'off-screen' : '', props.mode && props.mode.opened ? 'opened' : '', state.showLogo ? 'show-logo' : '']
    })

    watch(
      () => props.mode,
      (val: SidebarMode | undefined) => {
        if (!val) {
          return
        }
        if (val.offScreen !== state.offScreen) {
          if (val.offScreen) {
            state.offScreen = true
            state.minimizeDisable = true
          } else if (!val.minimized) {
            state.minimizeDisable = false
            state.offScreen = false
          } else {
            state.minimizeDisable = false
            state.offScreen = false
          }
        }
        if (val.useGroup) {
          state.levelPadding = 0
          state.useGroup = true
        } else {
          state.levelPadding = DEFAULT_LEVEL_PADDING
          state.useGroup = false
        }
        if (val.showLogo !== undefined) {
          state.showLogo = val.showLogo
        }
        if (val.showUser !== undefined) {
          state.showUser = val.showUser
        }
      },
      { immediate: true, deep: true }
    )

    const userProfileClick = () => {
      navMenu.value.unActiveAll()
      offScreenClose()
    }

    const offScreenClose = () => {
      emit('off-screen-click')
    }

    const setExpand = (ifExpand: boolean) => {
      state.minimizeExpand = ifExpand
    }

    return {
      ...toRefs(state),
      navMenu,
      minimized,
      classObj,
      userProfileClick,
      offScreenClose,
      setExpand
    }
  }
})
</script>

<style lang="scss" scoped>
@use 'src/assets/style/color' as *;
@use 'src/assets/style/variable' as *;
@use 'src/assets/style/mixin' as *;

@mixin minimized() {
  .sidebar {
  }
  &.minimized {
    .sidebar {
      width: $sidebar-min-width;
    }
  }
}

@mixin offScreen() {
  &.off-screen {
    .sidebar {
      left: -$sidebar-normal-width;
      box-shadow: none;
      transition: transform $default-transition-time;
    }

    &.opened {
      .sidebar {
        box-shadow: $box-shadow-dark;
        transform: translate3d($sidebar-normal-width, 0, 0);
      }

      .sidebar-mask {
        width: 100%;
        height: 100%;
        opacity: 0.5;
        z-index: $index-top-bg;
      }
    }
  }
}

@mixin showLogo() {
  &.show-logo {
    .sidebar {
      .sidebar-scrollbar {
        height: calc(100% - 50px);
      }
    }
  }
}

.app-sidebar {
  .sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: $sidebar-z-index;
    width: $sidebar-normal-width;
    height: 100%;
    max-height: 100%;
    color: var(--fd-sidebar-text-color);
    text-align: left;
    background-image: var(--fd-sidebar-background-img);
    background-size: cover;
    background-color: var(--fd-sidebar-background-color);
    // box-shadow: $real-shadow-base;
    transition: width $sidebar-transition-time, background-image $sidebar-transition-time, background-color $sidebar-transition-time, transform $sidebar-transition-time;

    .sidebar-scrollbar {
      height: 100%;
      overflow-x: hidden !important;
      ::v-deep(.el-scrollbar__wrap) {
        overflow-x: hidden !important;
      }
      ::v-deep(.el-scrollbar__bar.is-horizontal) {
        display: none !important;
      }
    }

    .fd-nav-menu {
      margin-top: 10px;
      margin-bottom: 10px;
    }
  }

  .sidebar-bg {
    display: block;
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: var(--fd-sidebar-back-color);
    z-index: -1;
  }

  .sidebar-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    transition: $bg-transition;
    background: $modal-background-color;
    opacity: 0;
    z-index: -1;
  }

  @include minimized();
  @include offScreen();
  @include showLogo();
}
</style>
