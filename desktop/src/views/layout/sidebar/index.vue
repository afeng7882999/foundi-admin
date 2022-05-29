<template>
  <div ref="sidebarWrapper" :class="classObj" class="fd-sidebar">
    <div ref="sidebar" class="fd-sidebar__inner" @mouseenter="setExpand(true)" @mouseleave="setExpand(false)">
      <app-logo v-show="state.showLogo" :minimized="minimized"></app-logo>
      <el-scrollbar class="fd-sidebar__scrollbar">
        <fd-user-profile v-show="state.showUser" :minimized="minimized"></fd-user-profile>
        <fd-nav-menu
          ref="navMenu"
          :default-path="$route.path"
          :level-padding="state.levelPadding"
          :menu="menu"
          :minimized="minimized"
          :grouped="state.useGroup"
          @select="offScreenClose"
        ></fd-nav-menu>
      </el-scrollbar>
      <div class="fd-sidebar__bg"></div>
    </div>
    <div class="fd-sidebar__mask" @click="offScreenClose"></div>
  </div>
</template>

<script setup lang="ts">
import FdUserProfile from './user-profile.vue'
import AppLogo from './logo.vue'
import FdNavMenu from '@b/components/nav-menu/index.vue'
import { computed, PropType, reactive, ref, watch } from 'vue'
import { AppState, SidebarMode } from '@b/store/modules/app'
import { UserState } from '@b/store/modules/user'
import { TreeNodeDefault } from '@b/utils/data-tree'
import { useStore } from '@/store'
import { setSidebarTheme } from '@/components/theme/theme'

defineOptions({
  name: 'FdSidebar'
})

const DEFAULT_LEVEL_PADDING = 10

const props = defineProps({
  menu: {
    type: Array as PropType<TreeNodeDefault[]>,
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
})

const sidebarWrapper = ref<HTMLElement>()
const navMenu = ref()

const emit = defineEmits(['off-screen-click'])

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
  return [
    minimized.value ? 'minimized' : '',
    state.offScreen ? 'off-screen' : '',
    props.mode && props.mode.opened ? 'opened' : '',
    state.showLogo ? 'show-logo' : ''
  ]
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

const store = useStore()
const storeState = store.state

watch(
  () => storeState.theme.theme,
  () => {
    if (sidebarWrapper.value && storeState.theme.theme) {
      setSidebarTheme(sidebarWrapper.value, storeState.theme.theme)
    }
  },
  { immediate: true }
)

const offScreenClose = () => {
  emit('off-screen-click')
}

const setExpand = (ifExpand: boolean) => {
  state.minimizeExpand = ifExpand
}
</script>

<style lang="scss">
@use '../base/src/assets/style/color' as *;
@use '../base/src/assets/style/variable' as *;
@use '../base/src/assets/style/mixin' as *;

@mixin minimized() {
  &.minimized {
    .fd-sidebar__inner {
      width: $sidebar-min-width;
    }
  }
}

@mixin offScreen() {
  &.off-screen {
    .fd-sidebar__inner {
      left: -$sidebar-normal-width;
      box-shadow: none;
      transition: transform $sidebar-transition-time;
    }

    &.opened {
      .fd-sidebar__inner {
        box-shadow: $box-shadow-dark;
        transform: translateX($sidebar-normal-width);
      }

      .fd-sidebar__mask {
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
    .fd-sidebar__inner {
      .fd-sidebar__scrollbar {
        height: calc(100% - 64px);
      }
    }
  }
}

.fd-sidebar {
  &__inner {
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
    background-image: var(--fd-sidebar-bg-img);
    background-size: cover;
    background-color: var(--fd-sidebar-bg-color);
    // box-shadow: $real-shadow-base;
    transition: width $sidebar-transition-time, background-image $sidebar-transition-time, background-color $sidebar-transition-time,
      transform $sidebar-transition-time;

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
      margin-top: 8px;
      margin-bottom: 8px;
    }
  }

  &__bg {
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

  &__mask {
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
