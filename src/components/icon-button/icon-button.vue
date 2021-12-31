<template>
  <el-button class="fd-icon-button" v-waves circle size="mini">
    <fd-icon v-if="hasIcon" :icon="icon"></fd-icon>
    <slot />
  </el-button>
</template>

<script lang="ts">
export default {
  name: 'FdIconButton'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    default: ''
  }
})

const hasIcon = computed(() => {
  return !!props.icon
})
</script>

<style lang="scss">
@use 'src/assets/style/variable.scss' as *;
@use 'src/assets/style/mixin.scss' as *;

.fd-icon-button {
  font-size: $icon-size-middle;
  border-radius: var(--el-border-radius-base) !important;
  border: none;
  padding: 6px !important;
  color: inherit;
  background: none;

  &:hover {
    color: inherit;
    background-color: var(--el-color-primary-light-9);
  }

  &:focus {
    color: inherit;
    background: none;

    &:hover {
      color: inherit;
      background-color: var(--el-color-primary-light-9);
    }
  }

  @include theme-d() {
    &:hover {
      background-color: var(--el-color-primary-light-5);
    }
    &:focus {
      &:hover {
        background-color: var(--el-color-primary-light-5);
      }
    }
  }
}
</style>
