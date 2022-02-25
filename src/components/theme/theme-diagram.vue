<template>
  <div class="fd-theme-diagram" :style="diagramStyle">
    <div class="fd-theme-diagram__colors">
      <div class="fd-theme-diagram__color" :style="colorStyle('--el-color-primary')"></div>
    </div>
    <div class="fd-theme-diagram__colors">
      <div class="fd-theme-diagram__color" :style="colorStyle('--fd-sidebar-back-color')"></div>
      <div class="fd-theme-diagram__color" :style="colorStyle('--fd-sidebar-active-color')"></div>
    </div>
    <div class="fd-theme-diagram__colors">
      <div class="fd-theme-diagram__color" :style="colorStyle('--el-color-success')"></div>
      <div class="fd-theme-diagram__color" :style="colorStyle('--el-color-warning')"></div>
      <div class="fd-theme-diagram__color" :style="colorStyle('--el-color-danger')"></div>
      <div class="fd-theme-diagram__color" :style="colorStyle('--el-color-error')"></div>
      <div class="fd-theme-diagram__color" :style="colorStyle('--el-color-info')"></div>
    </div>
    <div class="fd-theme-diagram__title" :style="titleStyle">
      <span>{{ themeTitle }}</span>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FdThemeDiagram'
}
</script>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import { Theme } from 'element-plus-dynamic-theme/theme'
import { CUSTOM_THEME } from './theme'

const props = defineProps({
  theme: {
    type: Object as PropType<Theme>,
    default: () => CUSTOM_THEME
  }
})

const diagramStyle = computed(() => {
  return {
    backgroundColor: props.theme['--el-color-white']
  }
})

const themeTitle = computed(() => {
  return props.theme?.name
})

const titleStyle = computed(() => {
  return {
    color: props.theme['--el-text-color-regular']
  }
})

const colorStyle = (colorName: string) => {
  return {
    backgroundColor: props.theme[colorName] ? props.theme[colorName] : CUSTOM_THEME[colorName],
    borderColor: props.theme['--el-border-color-base'] ? props.theme['--el-border-color-base'] : CUSTOM_THEME['--el-border-color-base'],
    borderRadius: props.theme['--el-border-radius-base'] ? props.theme['--el-border-radius-base'] : CUSTOM_THEME['--el-border-radius-base']
  }
}
</script>

<style lang="scss">
@use 'src/assets/style/variable.scss' as *;

.fd-theme-diagram {
  display: flex;
  height: 40px;
  flex-flow: row;
  align-items: center;
  padding: 0 10px;
  background-color: $color-white;

  &__colors {
    display: flex;
    margin-right: 5px;
  }

  &__color {
    height: 20px;
    width: 20px;
    border: 2px solid $border-color-base;
    border-radius: $border-radius-base;

    &:not(:nth-child(1)) {
      margin-left: -5px;
    }
  }

  &__title {
    display: flex;
    color: $color-text-regular;
    margin-left: auto;
  }
}
</style>
