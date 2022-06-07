<template>
  <div :class="classObj" class="fd-sidebar" @mouseenter="setExpand(true)" @mouseleave="setExpand(false)">
    <fd-logo v-if="showLogo" />
    <component :is="foundiGlobal.scrollbar" class="fd-sidebar__scrollbar">
      <fd-nav-menu
        ref="navMenu"
        :default-path="$route.path"
        :level-padding="state.levelPadding"
        :menu="menu"
        :minimized="minimized"
        :grouped="state.useGroup"
        @select="offScreenClose"
      />
    </component>
    <div class="fd-sidebar__bg" />
  </div>
  <teleport to="body">
    <div class="fd-sidebar__mask" :class="maskClassCo" @click="offScreenClose" />
  </teleport>
</template>

<script lang="ts">
export default {
  name: 'FdSidebar'
}
</script>

<script setup lang="ts">
import FdNavMenu from '@b/components/nav-menu/nav-menu.vue'
import { computed, PropType, reactive, watch } from 'vue'
import { SidebarMode } from '@b/store/modules/app'
import { TreeNodeDefault } from '@b/utils/data-tree'
import foundiGlobal from '@b/common/global'
import FdLogo from '@b/views/layout/logo.vue'

const DEFAULT_LEVEL_PADDING = 10

const props = defineProps({
  menu: {
    type: Array as PropType<TreeNodeDefault[]>,
    default: () => []
  },
  mode: {
    type: Object as PropType<SidebarMode>,
    default: () => undefined
  }
})

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
  const clazz = [] as string[]
  if (minimized.value) {
    clazz.push('is-minimized')
  }
  if (state.offScreen) {
    clazz.push('is-off-screen')
  }
  if (props.mode && props.mode.opened) {
    clazz.push('is-opened')
  }
  if (showLogo.value) {
    clazz.push('is-show-logo')
  }
  return clazz
})

const maskClassCo = computed(() => {
  return props.mode?.opened ? 'is-visible' : ''
})

const showLogo = computed(() => {
  return props.mode?.offScreen
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
  &.is-minimized {
    width: $sidebar-min-width;
  }
}

@mixin offScreen() {
  &.is-off-screen {
    left: -$sidebar-normal-width;
    box-shadow: none;
    transition: transform $sidebar-transition-time;

    &.is-opened {
      transform: translateX($sidebar-normal-width);
      box-shadow: $box-shadow-dark;
    }
  }
}

@mixin showLogo() {
  &.is-show-logo {
    .fd-logo {
      width: 100%;
    }
    .fd-sidebar__scrollbar {
      height: calc(100% - #{$app-logo-height} - 16px);
    }
  }
}

.fd-sidebar {
  width: $sidebar-normal-width;
  height: 100%;
  color: var(--fd-sidebar-text-color);
  text-align: left;
  border-right: 1px solid var(--el-border-color);
  background-image: var(--fd-sidebar-bg-img);
  background-size: cover;
  background-color: var(--fd-sidebar-bg-color);
  z-index: $index-popper-top;
  transition: width $sidebar-transition-time, background-image $sidebar-transition-time, background-color $sidebar-transition-time,
    transform $sidebar-transition-time;

  .fd-sidebar__scrollbar:not(.el-scrollbar) {
    height: 100%;
    overflow-y: scroll;
  }

  .fd-nav-menu {
    margin-bottom: 8px;
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

  @include minimized();
  @include offScreen();
  @include showLogo();
}

.fd-sidebar__mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: $bg-transition;
  background: $modal-background-color;
  opacity: 0;
  z-index: -1;

  &.is-visible {
    opacity: 0.5;
    z-index: $index-popper-top - 1;
  }
}
</style>
