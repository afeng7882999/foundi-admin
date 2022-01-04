<template>
  <div :class="{ 'is-minimized': minimized }" class="fd-logo">
    <a class="fd-logo__link">
      <svg aria-hidden="true" class="fd-logo__mini">
        <use :xlink:href="miniLogoName"></use>
      </svg>
      <svg aria-hidden="true" class="fd-logo__normal">
        <use :xlink:href="logoName"></use>
      </svg>
    </a>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FdLogo'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { AllState } from '@/store'

const props = defineProps({
  minimized: {
    type: Boolean,
    default: false
  }
})

const storeState = useStore<AllState>().state as AllState

const logoName = computed(() => {
  return `#svg-graphics-${storeState.app.icon}`
})

const miniLogoName = computed(() => {
  return `#svg-graphics-${storeState.app.icon}-mini`
})
</script>

<style lang="scss">
@use 'src/assets/style/mixin.scss' as *;
@use 'src/assets/style/variable.scss' as *;

@mixin minimized() {
  .fd-logo__normal {
    opacity: 1;
    visibility: visible;
    transition: all $sidebar-transition-time;
  }

  .fd-logo__mini {
    width: 38px;
    opacity: 0;
    visibility: hidden;
    transition: all $sidebar-transition-time;
  }
  &.is-minimized {
    .fd-logo__normal {
      left: 8px;
      opacity: 0;
      visibility: hidden;
    }

    .fd-logo__mini {
      left: 8px;
      opacity: 1;
      visibility: visible;
    }
  }
}

.fd-logo {
  display: block;
  position: relative;
  height: $app-title-height;
  overflow: hidden;
  white-space: nowrap;

  &__normal,
  &__mini {
    display: block;
    position: absolute;
    top: 12px;
    left: 43px;
    height: 24px;
    width: 120px;
  }

  @include minimized();
}
</style>
