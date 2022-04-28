<template>
  <div v-if="auth('demo:splitPane:list')" :style="docMinHeight" class="page-demo-split-pane fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <div class="fd-page-toolbar">
        <el-button @click="onLeftShrinkClick">{{ state.leftShrinkAll ? '展开左侧' : '收缩左侧' }}</el-button>
        <el-checkbox v-model="state.leftShrinkToHide" style="margin-left: 16px">收缩时隐藏手柄</el-checkbox>
      </div>
    </div>
    <fd-split-pane
      v-model:shrink-all="state.leftShrinkAll"
      animation
      :default-pos="400"
      shrink="right"
      :shrink-to-hide="state.leftShrinkToHide"
    >
      <template #left>
        <div class="fd-page__form is-left">
          <div class="fd-page__sub-title"><span class="title-text">form1 (animation)</span></div>
        </div>
      </template>
      <template #right>
        <fd-split-pane :default-pos="400" split="horizontal" shrink="right">
          <template #left>
            <div class="fd-page__form is-right-top">
              <div class="fd-page__sub-title"><span class="title-text">form2 (no animation)</span></div>
            </div>
          </template>
          <template #right>
            <div class="fd-page__form is-right-bottom">
              <div class="fd-page__sub-title"><span class="title-text">form3</span></div>
            </div>
          </template>
        </fd-split-pane>
      </template>
    </fd-split-pane>
  </div>
  <fd-page-footer></fd-page-footer>
</template>

<script setup lang="ts">
import usePage from '@/extend/page/use-page'
import FdSplitPane from '@/components/split-pane/index.vue'
import { reactive } from 'vue'
import FdPageFooter from '@/extend/page/page-footer.vue'

defineOptions({
  name: 'DemoSplitPane'
})

const state = reactive({
  leftShrinkAll: false,
  leftShrinkToHide: false
})

const onLeftShrinkClick = () => {
  state.leftShrinkAll = !state.leftShrinkAll
}

const { docMinHeight, showPageHeader, auth } = usePage({ footerVisible: true })
</script>

<style lang="scss">
.page-demo-split-pane {
  display: flex;
  flex-direction: column;

  > .fd-split-pane {
    flex: 1;
    height: 100%;
  }

  .fd-page__form {
    height: 100%;

    &.is-left {
      background-color: var(--el-color-success);
    }
    &.is-right-top {
      background-color: var(--el-color-info);
    }
    &.is-right-bottom {
      background-color: var(--el-color-warning);
    }
  }
}
</style>
