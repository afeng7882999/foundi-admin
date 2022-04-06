<template>
  <div :class="{ 'is-minimized': minimized }" class="fd-logo">
    <a class="fd-logo__link">
      <fd-svg-image class="fd-logo__icon" img="foundi"></fd-svg-image>
      <span class="fd-logo__title">方得 FOUNDi</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import FdSvgImage from '@/components/svg-image/svg-image.vue'

defineOptions({
  name: 'FdLogo'
})

const props = defineProps({
  minimized: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss">
@use 'src/assets/style/mixin.scss' as *;
@use 'src/assets/style/variable.scss' as *;

@mixin minimized() {
  .fd-logo__link {
    transition: all $sidebar-transition-time;
  }
  .fd-logo__title {
    opacity: 1;
    visibility: visible;
    transition: all $sidebar-transition-time;
  }
  &.is-minimized {
    .fd-logo__link {
      transform: translateX(56px);
    }
    .fd-logo__title {
      left: 8px;
      opacity: 0;
      visibility: hidden;
    }
  }
}

.fd-logo {
  display: block;
  position: relative;
  height: $app-title-height;
  overflow: hidden;
  white-space: nowrap;
  margin: 8px 0;

  &__link {
    width: 100%;
    height: $app-title-height;
    display: flex;
    align-items: stretch;
    align-content: center;
    padding: 10px 0;
    justify-content: center;
    user-select: none;
  }

  &__icon {
    width: 28px;
    color: var(--fd-sidebar-active-color); // $color-logo;
    flex-shrink: 0;
  }

  &__title {
    padding: 0 8px;
    display: flex;
    align-items: center;
    font-size: var(--el-font-size-medium);
    font-weight: var(--el-font-weight-primary);
    color: var(--fd-sidebar-active-color);
  }

  @include minimized();
}
</style>
