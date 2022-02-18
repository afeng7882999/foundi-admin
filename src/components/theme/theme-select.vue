<template>
  <el-popover :visible="state.visible" popper-class="fd-theme-select__popper" placement="bottom" :show-arrow="true" :hide-after="0">
    <template #reference>
      <div class="fd-theme-select">
        <fd-theme-diagram
          v-click-outside="onClickOutside"
          :theme="state.themes[modelValue]"
          @click="state.visible = !state.visible"
        ></fd-theme-diagram>
      </div>
    </template>
    <div v-for="(theme, idx) in state.themes" :key="idx" class="fd-theme-select__list" @click="selectTheme(idx)">
      <fd-theme-diagram :theme="theme"></fd-theme-diagram>
    </div>
  </el-popover>
</template>

<script lang="ts">
export default {
  name: 'FdThemeSelect'
}
</script>

<script setup lang="ts">
import { reactive } from 'vue'
import { ClickOutside as vClickOutside } from 'element-plus'
import FdThemeDiagram from './theme-diagram.vue'
import { CUSTOM_THEME, DEFAULT_THEMES } from './theme'

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
  emit('update:modelValue', idx)
}

const onClickOutside = () => {
  state.visible = false
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

.fd-theme-select__popper.el-popover {
  min-width: 220px;
  padding: 10px 0;

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
