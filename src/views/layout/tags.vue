<template>
  <div class="fd-tags">
    <div class="fd-tags__ops is-left">
      <el-tooltip :show-after="500" content="左翻页" effect="dark" placement="bottom">
        <fd-icon-button icon="left-one" @click="pageLeft"></fd-icon-button>
      </el-tooltip>
    </div>
    <fd-scroll-panel ref="scrollPanel" scroll-item-class-name="fd-tags-list__item">
      <div class="fd-tags-list">
        <router-link
          v-for="tag in visitedViews"
          :key="tag.fullPath"
          :class="isActive(tag) ? 'is-active' : ''"
          :to="{ path: tag.path, name: tag.name, query: tag.query, params: tag.params, fullPath: tag.fullPath }"
          class="fd-tags-list__item"
          @contextmenu.prevent.stop="openMenu(tag, $event)"
        >
          <span class="fd-tags-list__title">{{ tag.title }}</span>
          <span v-if="!isAffix(tag)" class="fd-tags-list__close" @click.prevent="closeSelectedTag(tag)">
            <fd-icon class="close-icon" icon="close-small"></fd-icon>
          </span>
          <span v-else class="fd-tags-list__affix"></span>
        </router-link>
      </div>
    </fd-scroll-panel>
    <div class="fd-tags__ops">
      <el-tooltip :show-after="500" content="右翻页" effect="dark" placement="bottom">
        <fd-icon-button icon="right-one" @click="pageRight"></fd-icon-button>
      </el-tooltip>
      <el-tooltip :show-after="500" content="刷新当前页面" effect="dark" placement="bottom">
        <fd-icon-button icon="refresh" @click="refreshCurrentTag"></fd-icon-button>
      </el-tooltip>
    </div>
    <fd-contextmenu ref="contextMenu" class="fd-tags__context-menu">
      <fd-contextmenu-item icon="refresh" label="刷新" @click="refreshSelectedTag(state.selectedTag)"></fd-contextmenu-item>
      <fd-contextmenu-item
        v-if="state.closable"
        icon="close"
        label="关闭"
        @click="closeSelectedTag(state.selectedTag)"
      ></fd-contextmenu-item>
      <fd-contextmenu-item label="关闭其他" icon="close-other" @click="closeOthersTags"></fd-contextmenu-item>
      <fd-contextmenu-item label="关闭所有" icon="close-all" @click="closeAllTags(state.selectedTag)"></fd-contextmenu-item>
    </fd-contextmenu>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FdTags'
}
</script>

<script setup lang="ts">
import FdScrollPanel from '@/components/scroll-panel/index.vue'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { AllState } from '@/store'
import { useStore } from 'vuex'
import { _RouteLocationBase, onBeforeRouteUpdate, RouteMeta, RouteRecordRaw, useRoute, useRouter } from 'vue-router'
import { AnyObject } from '@/utils'
import { DEFAULT_ROUTE } from './types'

const scrollPanel = ref()
const contextMenu = ref()

const state = reactive({
  selectedTag: {} as _RouteLocationBase,
  closable: true,
  affixTags: [] as AnyObject[]
})

const store = useStore<AllState>()
const storeState = store.state as AllState
const router = useRouter()
const route = useRoute()

const visitedViews = computed(() => {
  return storeState.view.visitedViews
})

const routes = computed(() => {
  return storeState.router.routes
})

onBeforeRouteUpdate((to) => {
  addTags(to)
  moveToCurrentTag(to)
})

onMounted(() => {
  store.dispatch('view/addView', DEFAULT_ROUTE)
  nextTick(() => {
    addAffixTags()
    addTags(route)
  })
})

const isActive = (tag: _RouteLocationBase) => {
  return tag.path === route.path
}

const isAffix = (tag: _RouteLocationBase) => {
  return tag.meta && tag.meta.affix
}

const filterAffixTags = (routes: RouteRecordRaw[], basePath = '/') => {
  let tags = [] as AnyObject[]
  routes.forEach((route) => {
    if (route.meta && route.meta.affix) {
      const tagPath = basePath + route.path
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta } as RouteMeta
      })
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path)
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags]
      }
    }
  })
  return tags
}

const addAffixTags = () => {
  const affixTags = (state.affixTags = filterAffixTags(routes.value))
  for (const tag of affixTags) {
    // Must have tag name
    if (tag.name) {
      store.dispatch('view/addVisitedView', tag)
    }
  }
}

const addTags = (r: _RouteLocationBase) => {
  const { name } = r
  if (name) {
    store.dispatch('view/addView', r)
  }
  return false
}

const pageLeft = () => {
  ;(scrollPanel.value as any).pageLeft()
}

const pageRight = () => {
  ;(scrollPanel.value as any).pageRight()
}

const moveToCurrentTag = (r: _RouteLocationBase) => {
  nextTick(() => {
    const views = visitedViews.value
    for (let i = 0; i < views.length; i++) {
      if (views[i].path === r.path) {
        ;(scrollPanel.value as any).moveToIdx(i)
        // when query is different, update
        if (views[i].fullPath !== r.fullPath) {
          store.dispatch('view/updateVisitedView', r)
        }
        break
      }
    }
  })
}

const refreshSelectedTag = (view: _RouteLocationBase) => {
  store.dispatch('view/delCachedView', view).then(() => {
    const { fullPath } = view
    console.log(fullPath)
    nextTick(() => {
      router.replace({
        path: '/redirect' + fullPath
      })
    })
  })
}

const refreshCurrentTag = () => {
  const { fullPath } = route
  store.dispatch('view/delCachedView', route).then(() => {
    nextTick(() => {
      router.replace({
        path: '/redirect' + fullPath
      })
    })
  })
}

const closeSelectedTag = (view: _RouteLocationBase) => {
  if (view.meta.affix) {
    return
  }
  store.dispatch('view/delView', view).then(({ visitedViews }) => {
    if (isActive(view)) {
      toLastView(visitedViews, view)
    }
  })
}

const closeOthersTags = () => {
  if (state.selectedTag.fullPath !== route.fullPath) {
    router.push(state.selectedTag.fullPath)
  }
  store.dispatch('view/delOthersViews', state.selectedTag).then(() => {
    moveToCurrentTag(route)
  })
}

const closeAllTags = (view: _RouteLocationBase) => {
  store.dispatch('view/delAllViews').then(({ visitedViews }) => {
    if (state.affixTags.some((tag) => tag.path === route.path)) {
      return
    }
    toLastView(visitedViews, view)
  })
}

const toLastView = (visitedViews: _RouteLocationBase[], view: _RouteLocationBase) => {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView.fullPath)
  } else {
    // now the default is to redirect to the home page if there is no tags-view,
    // you can adjust it according to your needs.
    if (view.name === 'Dashboard') {
      // to reload home page
      router.replace({ path: '/redirect' + view.fullPath })
    } else {
      router.push('/')
    }
  }
}

const openMenu = (tag: _RouteLocationBase, e: MouseEvent) => {
  contextMenu.value.show(e)
  state.selectedTag = tag
  state.closable = !(tag.meta && tag.meta.affix)
}
</script>

<style lang="scss">
@use 'src/assets/style/variable.scss' as *;
@use 'src/assets/style/mixin.scss' as *;

$tags-inner-height: $app-tags-height - 10;

.fd-tags {
  display: flex;
  padding-top: 10px;
  background-color: var(--fd-app-tags-back-color);
  width: 100%;
  height: $app-tags-height;

  &__ops {
    display: flex;
    align-items: center;
    margin-right: 15px;
    color: var(--el-text-color-placeholder);

    .el-button {
      margin: 0;
    }

    &.is-left {
      margin: 0 0 0 15px;
    }
  }

  &__context-menu {
    font-size: $font-size-small;
  }
}

.fd-tags {
  .fd-scroll-panel {
    .el-scrollbar__bar {
      bottom: -6px;
    }

    .el-scrollbar__wrap {
      height: 57px;
    }

    .scrollbar-track-x {
      bottom: 0;
      height: 0;

      .scrollbar-thumb-x {
        height: 0;
        border-radius: 0;
      }
    }
  }
}

.fd-tags-list {
  width: 100%;
  display: flex;

  &__item {
    display: inline-block;
    position: relative;
    height: $tags-inner-height;
    color: var(--el-text-color-primary);
    font-size: $app-tags-font-size;
    border-radius: $app-tags-radius $app-tags-radius 0 0;

    &.is-active {
      background-color: var(--fd-body-background-color);
      color: var(--el-text-color-primary);
      border-color: var(--fd-body-background-color);

      &:hover {
        background-color: var(--fd-body-background-color);
      }
    }

    &:hover {
      color: var(--el-text-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    &:first-child {
      margin-left: 10px;
    }
  }

  &__title {
    position: relative;
    display: inline-block;
    height: $tags-inner-height;
    line-height: $tags-inner-height;
    padding: 0 10px 0 40px;
    cursor: pointer;
  }

  &__close {
    position: relative;
    display: inline-block;
    height: $tags-inner-height;
    line-height: $tags-inner-height;
    padding: 0 10px 0 10px;
    vertical-align: bottom;
    cursor: pointer;

    .close-icon {
      border-radius: 50%;
      color: var(--el-text-color-secondary);
    }

    &:hover {
      .close-icon {
        padding: 2px;
        color: var(--fd-body-background-color);
        background-color: var(--el-text-color-placeholder);
      }
    }
  }

  &__affix {
    display: inline-block;
    height: $tags-inner-height;
    vertical-align: bottom;
    width: 33px;
  }

  &:after {
    content: ' ';
    flex-shrink: 0;
    height: $tags-inner-height;
    width: 18px;
  }
}

.fd-tags-list__item {
  &:before,
  &:after {
    position: absolute;
    display: none;
    bottom: 0;
    content: '';
    width: 20px;
    height: 20px;
    border-radius: 100%;
    box-shadow: 0 0 0 40px var(--fd-body-background-color);
  }

  &:before {
    left: -20px;
    clip-path: inset(50% -10px 0 50%);
  }

  &:after {
    clip-path: inset(50% 50% 0 -10px);
  }

  &.is-active {
    z-index: 1;
    &:before,
    &:after {
      display: inline-block;
    }
    &:hover {
      &:before,
      &:after {
        box-shadow: 0 0 0 40px var(--fd-body-background-color);
      }
    }
  }

  &:hover {
    &:before,
    &:after {
      display: inline-block;
      box-shadow: 0 0 0 40px var(--el-color-primary-light-9);
    }
  }

  @include theme($sharp-mode) {
    border-radius: 0;

    &.is-active::before,
    &.is-active::after,
    &:hover::before,
    &:hover::after {
      display: none;
    }
  }
}
</style>
