<template>
  <div :class="{ minimized: minimized }" class="app-logo">
    <a class="logo-url">
      <svg aria-hidden="true" class="logo-img-mini">
        <use :xlink:href="miniLogoName"></use>
      </svg>
      <svg aria-hidden="true" class="logo-img">
        <use :xlink:href="logoName"></use>
      </svg>
    </a>
  </div>
</template>

<script lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { AllState } from '@/store'

export default {
  name: 'AppLogo',
  props: {
    minimized: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const storeState = useStore<AllState>().state as AllState

    const logoName = computed(() => {
      return `#svg-${storeState.app.icon}`
    })

    const miniLogoName = () => {
      return `#svg-${storeState.app.icon}-mini`
    }

    return {
      logoName,
      miniLogoName
    }
  }
}
</script>

<style lang="scss">
@use 'src/assets/style/mixin.scss' as *;
@use 'src/assets/style/variable.scss' as *;

@mixin minimized() {
  .logo-url {
    .logo-img {
      opacity: 1;
      visibility: visible;
      transition: all $sidebar-transition-time;
    }

    .logo-img-mini {
      width: 38px;
      opacity: 0;
      visibility: hidden;
      transition: all $sidebar-transition-time;
    }
  }
  &.minimized {
    .logo-url {
      .logo-img {
        left: 8px;
        opacity: 0;
        visibility: hidden;
      }

      .logo-img-mini {
        left: 8px;
        opacity: 1;
        visibility: visible;
      }
    }
  }
}

.app-logo {
  display: block;
  position: relative;
  height: $app-title-height;
  overflow: hidden;
  white-space: nowrap;

  .logo-url {
    .logo-img,
    .logo-img-mini {
      display: block;
      position: absolute;
      top: 12px;
      left: 43px;
      height: 24px;
      width: 120px;
    }
  }

  @include minimized();
}
</style>
