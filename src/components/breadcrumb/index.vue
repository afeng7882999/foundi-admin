<template>
  <el-breadcrumb class="fd-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in state.breadcrumbs" :key="item.url">
        <span v-if="item.redirect === 'noredirect' || index === state.breadcrumbs.length - 1" class="fd-breadcrumb__no-redirect">
          {{ item.name }}
        </span>
        <a v-else class="fd-breadcrumb__with-redirect" @click.prevent="handleLink(item)">{{ item.name }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script lang="ts">
export default {
  name: 'FdBreadcrumb'
}
</script>

<script setup lang="ts">
import { reactive, onBeforeMount } from 'vue'
import { onBeforeRouteUpdate, RouteLocationNormalized, useRoute, useRouter } from 'vue-router'
import { getTreeNode, getTreeNodes, TreeNodeDefault } from '@/utils/data-tree'
import { useStore } from 'vuex'
import { AllState } from '@/store'

const state = reactive({
  breadcrumbs: [] as TreeNodeDefault[]
})

const route = useRoute()
const router = useRouter()
const store = useStore<AllState>()
const storeState = store.state as AllState

onBeforeRouteUpdate((to) => {
  // redirect，不更新breadcrumbs
  if (to.path.startsWith('/redirect/')) {
    return
  }
  getBreadcrumb(to)
})

onBeforeMount(() => {
  getBreadcrumb(route)
})

// 根据菜单数据获取breadcrumbs
const getBreadcrumb = (r: RouteLocationNormalized) => {
  if (storeState.user.menu === undefined) {
    return []
  }
  const current = getTreeNode(storeState.user.menu, (item) => item.url === r.path)
  if (!current) {
    return []
  }
  if (current.name === '管理主页') {
    state.breadcrumbs = [current]
    return []
  }

  let ids = current.parentPath.split(',')
  ids = ids.slice(1, ids.length - 1)
  let nodePath = getTreeNodes(storeState.user.menu, (item) => ids.indexOf(item.id.toString()) !== -1)
  nodePath = nodePath.sort((a, b) => a.level - b.level)
  const main = getTreeNode(storeState.user.menu, (item) => item.name === '管理主页')
  if (main) {
    state.breadcrumbs = [main].concat(nodePath, current)
  }
}

// 导航到菜单项
const handleLink = (item: TreeNodeDefault) => {
  const { redirect, url } = item
  if (redirect) {
    router.push(redirect)
    return
  }
  router.push(url)
}
</script>

<style rel="stylesheet/scss" lang="scss">
@use 'src/assets/style/variable.scss' as *;

.fd-breadcrumb {
  display: inline-block;
  margin-left: 20px;
  font-size: $app-title-font-size;
  cursor: text;

  &__no-redirect,
  &__with-redirect {
    padding: 8px 5px;
  }

  &__with-redirect {
    color: var(--el-color-primary);
    font-weight: normal;
    border-radius: var(--el-border-radius-base);
    cursor: pointer;

    &:hover {
      background: var(--el-color-primary-light-9);
    }
  }
}

.fd-breadcrumb.el-breadcrumb {
  .el-breadcrumb__inner a {
    font-weight: normal;
  }
}
</style>
