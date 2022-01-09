<template>
  <div class="fd-page-header">
    <div v-show="showBack" class="fd-page-header__back">
      <fd-icon-button icon="left" @click="onGoBackClick"></fd-icon-button>
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
import { getTreeNode } from '@/utils/data-tree'
import { computed, onMounted, reactive } from 'vue'
import {onBeforeRouteUpdate, useRoute, useRouter} from 'vue-router'
import { useStore } from 'vuex'
import { AllState } from '@/store'

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

const state = reactive({
  theTitle: '',
  theIcon: '',
  theDesc: ''
})

const route = useRoute()
const router = useRouter()
const store = useStore<AllState>()
const storeState = store.state as AllState

const currentTitle = computed(() => {
  return props.title ? props.title : state.theTitle
})

const currentIcon = computed(() => {
  return props.icon ? props.icon : state.theIcon
})

const currentDesc = computed(() => {
  return props.desc ? props.desc : state.theDesc
})

onBeforeRouteUpdate(() => {
  getPageHeader()
})

onMounted(() => {
  getPageHeader()
})

const onGoBackClick = () => {
  router.back()
}

const getPageHeader = () => {
  const current = storeState.view.visitedViews.find((v) => v.path === route.path)
  if (current) {
    state.theIcon = current?.meta.icon as string
    state.theDesc = current?.meta.remark as string
    state.theTitle = (current as any).title
  } else if (storeState.user.menu) {
    const menu = getTreeNode(storeState.user.menu, (m) => m.url === route.path)
    if (menu) {
      state.theIcon = menu.icon
      state.theTitle = menu.name
      state.theDesc = menu.remark
    }
  }
}
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
