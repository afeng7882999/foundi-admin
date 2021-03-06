<template>
  <div class="fd-title">
    <div class="fd-title__left">
      <el-tooltip :content="toggleBtnActive ? '展开菜单' : '收缩菜单'" :show-after="500" effect="dark" placement="bottom">
        <fd-button
            type="icon"
            icon="hamburger-button"
            class="fd-title__toggle-button"
            :class="{ active: toggleBtnActive }"
            @click="toggleSideBar"
        />
      </el-tooltip>
      <fd-logo v-if="logo" />
      <fd-breadcrumb v-show="showBreadcrumb"></fd-breadcrumb>
    </div>
    <div class="fd-title__right">
      <system-message-button :check-message-interval="100000" />
      <el-divider direction="vertical" />
      <user-profile-button />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FdBreadcrumb from '@/components/breadcrumb/index.vue'
import SystemMessageButton from '@/views/modules/message/message-button.vue'
import { useStore } from '@/store'
import { SidebarMode } from '@b/store/modules/app'
import useLayoutSize from '@b/hooks/use-layout-size'
import UserProfileButton from '@b/views/modules/user-profile/user-profile-button.vue'
import FdLogo from '@b/views/layout/logo.vue'

defineOptions({
  name: 'FdTitle'
})

const props = defineProps({
  logo: {
    type: Boolean,
    default: true
  }
})

const store = useStore()
const storeState = store.state

const mode = computed(() => {
  return storeState.app.sidebarMode as SidebarMode
})

const showBreadcrumb = computed(() => {
  return storeState.app.showBreadcrumb
})

const toggleBtnActive = computed(() => {
  const modeVal = mode.value
  return (!modeVal.offScreen && modeVal.minimized) || (modeVal.offScreen && !modeVal.opened)
})

const { doLayoutResize } = useLayoutSize()

const toggleSideBar = async () => {
  const modeVal = mode.value
  if (modeVal.offScreen) {
    await store.dispatch('app/setSidebarMode', { opened: !modeVal.opened })
  } else {
    await store.dispatch('app/setSidebarMode', { minimized: !modeVal.minimized })
  }
  await doLayoutResize()
}
</script>

<style lang="scss">
@use '../base/src/assets/style/variable.scss' as *;

.fd-title {
  height: $app-title-height;
  padding-right: 16px;
  background: var(--fd-app-title-bg-color);
  display: flex;
  justify-content: space-between;
  overflow: hidden;

  &__left {
    display: flex;
    align-items: center;
    margin-left: 12px;
  }

  &__toggle-button {
    color: var(--el-color-primary);
    transform: rotate(0deg);
    transition: transform $sidebar-transition-time;

    &.active {
      transform: rotate(90deg);
    }
  }

  &__right {
    display: flex;
    align-items: center;
    margin-right: 16px;
    color: var(--el-color-primary);
    .el-divider {
      margin: 0 16px;
    }
  }
}
</style>
