<template>
  <div class="fd-page-header">
    <div v-show="showBack" class="fd-page-header__back">
      <fd-icon-button icon="left" @click="goBack"></fd-icon-button>
    </div>
    <el-divider v-show="showBack" class="fd-page-header__divider" direction="vertical"></el-divider>
    <div class="fd-page-header__title">
      <fd-icon :icon="currentIcon"></fd-icon>
      <span>{{ currentTitle }}</span>
    </div>
    <el-divider v-if="currentDesc" class="fd-page-header__divider" direction="vertical"></el-divider>
    <div class="fd-page-header__desc">
      <span>{{ currentDesc }}</span>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FdPageHeader'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import usePage from '@/components/crud/use-page'

const props = defineProps({
  icon: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: false
  },
  desc: {
    type: String,
    default: ''
  }
})

const { pageState: state, goBack } = usePage()

const currentTitle = computed(() => {
  return props.title ? props.title : state.title
})

const currentIcon = computed(() => {
  return props.icon ? props.icon : state.icon
})

const currentDesc = computed(() => {
  return props.desc ? props.desc : state.desc
})
</script>

<style lang="scss" scoped>
@use 'src/assets/style/variable' as *;

.fd-page-header {
  display: flex;
  margin-bottom: 26px;
  line-height: 24px;

  &__back {
    display: flex;
    align-items: center;
    font-size: var(--el-font-size-base);
    cursor: pointer;

    .fd-icon {
      font-size: var(--el-font-size-base);
      margin-right: 5px;
    }
  }

  &__title {
    display: flex;
    align-items: center;
    font-size: var(--el-font-size-large);
    color: var(--el-text-color-primary);
    margin-right: 5px;
    position: relative;

    .fd-icon {
      font-size: $icon-size-large;
      margin-right: 10px;
      align-self: center;
    }

    span {
      margin: 0;
      text-align: center;
      color: var(--el-text-color-primary);
    }
  }

  &__divider {
    height: 24px;
    margin: 0 10px;
  }

  &__desc {
    margin-left: 5px;
    color: var(--el-text-color-secondary);
    font-size: var(--el-font-size-small);
    font-weight: 500;
  }
}
</style>
