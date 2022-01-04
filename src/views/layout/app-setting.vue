<template>
  <fd-right-panel ref="rightPanel" custom-class="app-setting" title="定制FOUNDI">
    <el-scrollbar class="scroll-container">
      <div class="setting-items">
        <div class="drawer-item-inline">
          <span class="setting-title">主题</span>
          <span class="setting-help"></span>
          <fd-theme-select v-model="themeIdx" class="theme-select"></fd-theme-select>
        </div>
        <el-divider></el-divider>
        <div class="drawer-item-inline">
          <span class="setting-title">开启多页面</span>
          <span class="setting-help">
            <el-tooltip content="开启多页面标签，需要手动刷新页面" effect="dark" placement="bottom">
              <fd-icon icon="warning"></fd-icon>
            </el-tooltip>
          </span>
          <el-switch v-model="enableTags" class="drawer-switch" />
        </div>
        <div class="drawer-item-inline">
          <span class="setting-title">显示页面路径</span>
          <span class="setting-help"></span>
          <el-switch v-model="showBreadcrumb" class="drawer-switch" />
        </div>
        <div class="drawer-item-inline">
          <span class="setting-title">固定标题栏</span>
          <span class="setting-help"></span>
          <el-switch v-model="fixedHeader" class="drawer-switch" />
        </div>
        <el-divider></el-divider>
        <div class="drawer-item-inline">
          <span class="setting-title">菜单栏平铺</span>
          <span class="setting-help"></span>
          <el-switch v-model="sidebarGrouped" class="drawer-switch" />
        </div>
        <div class="drawer-item-inline">
          <span class="setting-title">菜单栏Logo</span>
          <span class="setting-help"></span>
          <el-switch v-model="sidebarShowLogo" class="drawer-switch" />
        </div>
        <div class="drawer-item-inline">
          <span class="setting-title">菜单栏用户信息</span>
          <span class="setting-help"></span>
          <el-switch v-model="sidebarShowUser" class="drawer-switch" />
        </div>
      </div>
    </el-scrollbar>
  </fd-right-panel>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, toRefs, watch } from 'vue'
import FdRightPanel from '@/components/right-panel/index.vue'
import FdThemeSelect from '@/components/theme-select/index.vue'
import { DEFAULT_THEMES, themeProcess } from 'element-plus-dynamic-theme/theme'
import useLayoutResize from './use-resize'
import { useStore } from 'vuex'
import { AllState } from '@/store'

export default defineComponent({
  name: 'AppSetting',
  components: {
    FdRightPanel,
    FdThemeSelect
  },
  setup() {
    const state = reactive({
      themes: DEFAULT_THEMES,
      themeIdx: 0,
      enableTags: true,
      showBreadcrumb: true,
      fixedHeader: false,
      sidebarGrouped: true,
      sidebarShowLogo: true,
      sidebarShowUser: true,
      dialogShow: false
    })

    const store = useStore<AllState>()
    const storeState = store.state as AllState

    const theme = computed(() => {
      return storeState.app.theme
    })

    watch(
      () => state.themeIdx,
      (val) => {
        store.dispatch('app/setTheme', themeProcess(DEFAULT_THEMES[val]))
      }
    )

    const { resizeLayout } = useLayoutResize()

    watch(
      () => state.enableTags,
      (val) => {
        store.dispatch('app/setEnableTags', val)
        resizeLayout()
      }
    )

    watch(
      () => state.showBreadcrumb,
      (val) => {
        store.dispatch('app/setShowBreadcrumb', val)
      }
    )

    watch(
      () => state.fixedHeader,
      (val) => {
        store.dispatch('app/setFixedHeader', val)
      }
    )

    watch(
      () => state.sidebarGrouped,
      (val) => {
        store.dispatch('app/setSidebarMode', { useGroup: val })
      }
    )

    watch(
      () => state.sidebarShowLogo,
      (val) => {
        store.dispatch('app/setSidebarMode', { showLogo: val })
      }
    )

    watch(
      () => state.sidebarShowUser,
      (val) => {
        store.dispatch('app/setSidebarMode', { showUser: val })
      }
    )

    onMounted(() => {
      state.enableTags = storeState.app.enableTags
      state.showBreadcrumb = storeState.app.showBreadcrumb
      state.fixedHeader = storeState.app.fixedHeader
    })

    const rightPanel = ref()
    const themeCustom = ref()

    const show = () => {
      ;(rightPanel.value as any).show()
    }

    return {
      rightPanel,
      themeCustom,
      ...toRefs(state),
      theme,
      show
    }
  }
})
</script>

<style lang="scss">
.app-setting {
  .el-select-dropdown__item {
    height: auto;
  }
}
</style>

<style lang="scss" scoped>
@use 'src/assets/style/variable' as *;

.scroll-container {
  height: calc(100% - 50px);

  ::v-deep(.el-scrollbar__wrap) {
    overflow-x: hidden !important;
  }
}

.setting-items {
  width: 320px;
  padding: 24px 20px 0 15px;
}

.drawer-item-inline {
  display: flex;
  align-items: center;
  margin-bottom: 24px;

  .setting-title {
    margin-left: 10px;
    font-size: $font-size-base;
  }

  .setting-help {
    flex: 1;
    margin-left: 5px;
    font-size: $icon-size-middle;
    color: var(--el-text-color-placeholder);
  }

  .fd-theme-select {
    width: 200px;
  }
}
</style>
