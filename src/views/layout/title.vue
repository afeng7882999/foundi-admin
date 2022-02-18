<template>
  <div class="fd-title">
    <div class="fd-title__left">
      <el-tooltip
        :content="toggleBtnActive ? '展开菜单' : '收缩菜单'"
        :show-after="500"
        effect="dark"
        placement="bottom"
      >
        <fd-icon-button class="fd-title__toggle-button" @click="toggleSideBar">
          <fd-icon :class="{ active: toggleBtnActive }" class="icon" icon="hamburger-button"></fd-icon>
        </fd-icon-button>
      </el-tooltip>
      <fd-breadcrumb v-show="showBreadcrumb"></fd-breadcrumb>
    </div>
    <div class="fd-title__right">
      <system-message-button :check-message-interval="100000"></system-message-button>
      <el-tooltip :show-after="500" content="全屏" effect="dark" placement="bottom">
        <fd-icon-button class="fd-title__item">
          <fd-full-screen></fd-full-screen>
        </fd-icon-button>
      </el-tooltip>
      <el-tooltip :show-after="500" content="设置" effect="dark" placement="bottom">
        <fd-icon-button class="fd-title__item" icon="setting-two" @click="toggleSetting"></fd-icon-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FdTitle'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import FdBreadcrumb from '@/components/breadcrumb/index.vue'
import FdFullScreen from '@/components/fullscreen/index.vue'
import SystemMessageButton from '@/views/modules/message/message-button.vue'
import { AllState } from '@/store'
import { useStore } from 'vuex'
import { SidebarMode } from '@/store/modules/app'

const emit = defineEmits(['appSettingShow'])

const store = useStore<AllState>()
const storeState = store.state as AllState

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

const toggleSideBar = async () => {
  const modeVal = mode.value
  if (modeVal.offScreen) {
    await store.dispatch('app/setSidebarMode', { opened: !modeVal.opened })
  } else {
    await store.dispatch('app/setSidebarMode', { minimized: !modeVal.minimized })
  }
}

const toggleSetting = () => {
  emit('appSettingShow')
}
</script>

<style lang="scss">
@use 'src/assets/style/variable.scss' as *;

.fd-title {
  height: $app-title-height;
  background: var(--fd-app-title-bg-color);
  border-bottom: 1px solid var(--el-border-color-base);
  border-radius: 0 !important;
  display: flex;
  justify-content: space-between;
  overflow: hidden;

  &__left {
    display: flex;
    align-items: center;
    margin-left: 16px;
  }

  &__toggle-button {
    .icon {
      color: var(--el-color-primary);
      transform: rotate(0deg);
      transition: transform $sidebar-transition-time;

      &.active {
        transform: rotate(90deg);
      }
    }
  }

  &__right {
    display: flex;
    align-items: center;
    margin-right: 16px;
    color: var(--el-color-primary);
  }
}
</style>
