<template>
  <el-popover
    popper-class="fd-theme-select__popper"
    v-model:visible="state.visible"
    placement="bottom"
    width="200"
    trigger="click"
  >
    <div
      class="fd-theme-select__list"
      v-for="(theme, idx) in state.themes"
      :key="idx"
      @click="selectTheme(idx)"
    >
      <fd-theme-diagram :theme="theme"></fd-theme-diagram>
    </div>
    <template #reference>
      <div class="fd-theme-select">
        <fd-theme-diagram :theme="state.themes[modelValue]"></fd-theme-diagram>
      </div>
    </template>
  </el-popover>
</template>

<script lang="ts">
export default {
  name: 'FdThemeSelect'
}
</script>

<script setup lang="ts">
import { defineComponent, reactive, toRefs } from 'vue'
import FdThemeDiagram from './theme-diagram.vue'
import { DEFAULT_THEMES } from 'element-plus-dynamic-theme/theme'
import { CUSTOM_THEME } from './theme'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue'])

const state = reactive({
  themes: DEFAULT_THEMES,
  customTheme: CUSTOM_THEME,
  visible: false
})

const selectTheme = (idx: number) => {
  state.visible = false
  emit('update:modelValue', idx)
}
</script>

<style lang="scss">
@use 'src/assets/style/variable' as *;

.fd-theme-select {
  display: flex;
  align-items: center;
  width: 220px;
  border: var(--el-border-width-base) solid var(--el-border-color-base);
  border-radius: var(--el-border-radius-base);
  box-sizing: border-box;
  cursor: pointer;
  overflow: hidden;

  .fd-theme-select__list {
    padding: 0;
  }

  .fd-theme-diagram {
    width: 100%;
    padding: 5px 15px;
  }

  &:hover {
    border-color: var(--el-text-color-placeholder);
  }
}

.fd-theme-select__popper.el-popover.el-popover {
  min-width: 220px;
  padding: 10px 0;
  overflow: hidden;

  &[x-placement^='bottom'] {
    margin-top: 5px;

    .popper__arrow {
      display: none !important;
    }
  }

  .fd-theme-select__list {
    display: flex;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
    cursor: pointer;

    .fd-theme-diagram {
      width: 100%;
      padding: 5px 15px;
    }

    &:hover {
      .fd-theme-diagram {
        background-color: #f5f7fa;
      }
    }
  }
}
</style>
