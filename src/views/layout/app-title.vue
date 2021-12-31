<template>
  <div class="app-title">
    <div class="left-menu">
      <el-tooltip :content="toggleBtnActive ? '展开菜单' : '收缩菜单'" :show-after="500" effect="dark" placement="bottom">
        <fd-icon-button class="right-menu-item toggle-button" @click="toggleSideBar">
          <fd-icon :class="{ active: toggleBtnActive }" class="icon" icon="hamburger-button"></fd-icon>
        </fd-icon-button>
      </el-tooltip>
      <fd-breadcrumb v-show="showBreadcrumb"></fd-breadcrumb>
    </div>
    <div class="right-menu">
      <system-message-button :check-message-interval="100000"></system-message-button>
      <el-tooltip :show-after="500" content="全屏" effect="dark" placement="bottom">
        <fd-icon-button class="right-menu-item">
          <fd-full-screen></fd-full-screen>
        </fd-icon-button>
      </el-tooltip>
      <el-tooltip :show-after="500" content="设置" effect="dark" placement="bottom">
        <fd-icon-button class="right-menu-item" icon="setting-two" @click="toggleSetting"></fd-icon-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import FdBreadcrumb from '@/components/breadcrumb/index.vue'
import FdFullScreen from '@/components/fullscreen/index.vue'
import SystemMessageButton from '@/views/modules/message/message-button.vue'
import { AllState } from '@/store'
import { useStore } from 'vuex'
import { SidebarMode } from '@/store/modules/app'

export default defineComponent({
  name: 'AppTitle',
  components: {
    FdFullScreen,
    FdBreadcrumb,
    SystemMessageButton
  },
  emits: ['appSettingShow'],
  setup(props, { emit }) {
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

    const toggleSideBar = () => {
      const modeVal = mode.value
      if (modeVal.offScreen) {
        store.dispatch('app/setSidebarMode', { opened: !modeVal.opened })
      } else {
        store.dispatch('app/setSidebarMode', { minimized: !modeVal.minimized })
      }
    }

    const toggleSetting = () => {
      emit('appSettingShow')
    }

    return {
      showBreadcrumb,
      toggleBtnActive,
      toggleSideBar,
      toggleSetting
    }
  }
})
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@use 'src/assets/style/variable.scss' as *;

.app-title {
  height: $app-title-height;
  background: var(--fd-app-title-back-color);
  border-bottom: 1px solid var(--el-border-color-base);
  border-radius: 0 !important;
  display: flex;
  justify-content: space-between;
  overflow: hidden;

  .left-menu {
    display: inline-block;
    height: $app-title-height;
    margin-left: 15px;
    line-height: $app-title-height;

    .toggle-button {
      .icon {
        color: var(--el-color-primary);
        transform: rotate(0deg);
        transition: transform $sidebar-transition-time;

        &.active {
          transform: rotate(90deg);
        }
      }
    }
  }

  .right-menu {
    display: inline-block;
    height: $app-title-height;
    margin-right: 15px;
    line-height: $app-title-height;
    color: var(--el-color-primary);

    .right-menu-item {
      margin: 0 5px 0 0;
    }
  }
}
</style>
