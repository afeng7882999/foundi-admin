<template>
  <div ref="moduleSetting" :style="docMinHeight" class="fd-setting fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-setting__inner">
      <div class="fd-setting__item">
        <span class="title">主题</span>
        <span class="help"></span>
        <fd-theme-select v-model="state.themeIdx" class="fd-setting__theme-select"></fd-theme-select>
      </div>
      <el-divider></el-divider>
      <div class="fd-setting__item">
        <span class="title">开启多页面</span>
        <span class="help">
          <el-tooltip content="开启多页面标签，需要手动刷新页面" effect="dark" placement="bottom">
            <fd-icon icon="warning"></fd-icon>
          </el-tooltip>
        </span>
        <el-switch v-model="state.enableTags" class="fd-setting__switch" />
      </div>
      <div class="fd-setting__item">
        <span class="title">显示页面路径</span>
        <span class="help"></span>
        <el-switch v-model="state.showBreadcrumb" class="fd-setting__switch" />
      </div>
      <div class="fd-setting__item">
        <span class="title">固定标题栏</span>
        <span class="help"></span>
        <el-switch v-model="state.fixedHeader" class="fd-setting__switch" />
      </div>
      <el-divider></el-divider>
      <div class="fd-setting__item">
        <span class="title">菜单栏平铺</span>
        <span class="help"></span>
        <el-switch v-model="state.sidebarGrouped" class="fd-setting__switch" />
      </div>
      <div class="fd-setting__item">
        <span class="title">菜单栏Logo</span>
        <span class="help"></span>
        <el-switch v-model="state.sidebarShowLogo" class="fd-setting__switch" />
      </div>
      <div class="fd-setting__item">
        <span class="title">菜单栏用户信息</span>
        <span class="help"></span>
        <el-switch v-model="state.sidebarShowUser" class="fd-setting__switch" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue'
import FdThemeSelect from '@/components/theme/theme-select.vue'
import { DEFAULT_THEMES, themeProcess } from '@/components/theme/theme'
import useLayoutSize from '@b/hooks/use-layout-size'
import { useStore } from '@/store'
import usePage from '@/crud/hooks/use-page'

defineOptions({
  name: 'FdSetting'
})

const state = reactive({
  themes: DEFAULT_THEMES,
  themeIdx: 0,
  enableTags: true,
  showBreadcrumb: true,
  fixedHeader: false,
  sidebarGrouped: true,
  sidebarShowLogo: true,
  sidebarShowUser: true
})

const store = useStore()
const storeState = store.state

const { doLayoutResize } = useLayoutSize()

const { docMinHeight, showPageHeader } = usePage()

watch(
  () => state.themeIdx,
  (val) => {
    store.dispatch('theme/setTheme', themeProcess(DEFAULT_THEMES[val]))
  }
)

watch(
  () => state.enableTags,
  (val) => {
    store.dispatch('app/setEnableTags', val)
    doLayoutResize()
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
  state.sidebarGrouped = !!storeState.app.sidebarMode?.useGroup
  state.sidebarShowLogo = !!storeState.app.sidebarMode?.showLogo
  state.sidebarShowUser = !!storeState.app.sidebarMode?.showUser
})
</script>

<style lang="scss">
@use '../base/src/assets/style/variable' as *;

.fd-setting {
  &__inner {
  }

  &__item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .title {
      margin-left: 8px;
      font-size: $font-size-base;
    }

    .help {
      flex: 1;
      margin-left: 4px;
      font-size: $icon-size-middle;
      color: var(--el-text-color-placeholder);
    }
  }

  &__theme-select {
    width: 200px;
  }

  &__scrollbar {
    height: calc(100% - 48px);

    .el-scrollbar__wrap {
      overflow-x: hidden !important;
    }
  }

  .fd-drawer__icon {
    display: none;
  }

  .fd-drawer__title {
    justify-content: center;
    .title-icon {
      display: none;
    }
  }

  .el-select-dropdown__item {
    height: auto;
  }
}
</style>
