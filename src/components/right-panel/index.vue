<template>
  <el-drawer :custom-class="objClass" v-model="state.visible" :with-header="false" :modal="true" size="320px">
    <div class="fd-right-panel__content">
      <div class="fd-right-panel__title">
        <span class="title-text">{{ title }}</span>
        <fd-icon-button class="title-button" icon="close-small" @click="onHideButtonClick"></fd-icon-button>
      </div>
      <slot />
    </div>
  </el-drawer>
</template>

<script lang="ts">
export default {
  name: 'FdRightPanel'
}
</script>

<script setup lang="ts">
import { computed, reactive } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  customClass: {
    type: String,
    default: ''
  }
})

const state = reactive({
  visible: false
})

const objClass = computed(() => {
  if (props.customClass) {
    return `fd-right-panel ${props.customClass}`
  }
  return 'fd-right-panel'
})

const show = () => {
  state.visible = true
}

const onHideButtonClick = () => {
  state.visible = false
}

defineExpose({
  show
})
</script>

<style lang="scss">
@use 'src/assets/style/variable' as *;

.fd-right-panel {
  .el-drawer__body {
    height: 100%;
    padding: 0;

    .fd-right-panel__content {
      height: 100%;
      color: var(--el-text-color-regular);

      .fd-right-panel__title {
        padding: 15px;
        display: flex;
        align-items: center;
        height: 50px;
        border-bottom: 1px solid var(--el-border-color-base);

        .title-text {
          flex: 1;
          text-align: center;
          font-size: $font-size-large;
        }

        .title-button {
          position: absolute !important;
          top: 10px;
          right: 15px;
        }
      }

      .drawer-container {
        height: calc(100% - 50px);
      }
    }
  }
}
</style>
