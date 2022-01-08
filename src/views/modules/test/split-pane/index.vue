<template>
  <div v-if="hasAuth('test:splitPane:list')" :style="pageMinHeight" class="page-test-split-pane fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <fd-split-pane :default-pos="400" shrink="right">
      <template #left>
        <div class="fd-page__form is-left">
          <div class="fd-page__sub-title"><span class="title-text">form1</span></div>
        </div>
      </template>
      <template #right>
        <fd-split-pane :default-pos="400" split="horizontal" shrink="right">
          <template #left>
            <div class="fd-page__form is-right-top">
              <div class="fd-page__sub-title"><span class="title-text">form2</span></div>
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
</template>

<script lang="ts">
export default {
  name: 'TestSplitPane'
}
</script>

<script setup lang="ts">
import usePage from '@/components/crud/use-page'
import FdSplitPane from '@/components/split-pane/index.vue'

const { pageMinHeight, showPageHeader, hasAuth } = usePage()
</script>

<style lang="scss">
.page-test-split-pane {
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
