<template>
  <div class="fd-router-tags">
    <div class="fd-router-tags__ops is-left">
      <el-tooltip :show-after="500" content="左翻页" effect="dark" placement="bottom">
        <fd-button type="icon" icon="left-one" @click="pageLeft"></fd-button>
      </el-tooltip>
    </div>
    <fd-scroll-panel ref="scrollPanel" scroll-item-class-name="fd-router-tags__item">
      <div class="fd-router-tags__list">
        <router-link
          v-for="tag in visitedViews"
          :key="tag.fullPath"
          :class="isActive(tag) ? 'is-active' : ''"
          :to="{ path: tag.path, name: tag.name, query: tag.query, params: tag.params, fullPath: tag.fullPath }"
          class="fd-router-tags__item"
          @contextmenu.prevent.stop="openMenu(tag, $event)"
        >
          <span class="item-title">{{ tag.title }}</span>
          <span v-if="!isAffix(tag)" class="item-close" @click.prevent="closeSelectedTag(tag)">
            <fd-icon class="item-close__icon" icon="close-small"></fd-icon>
          </span>
          <span v-else class="item-affix"></span>
        </router-link>
      </div>
    </fd-scroll-panel>
    <div class="fd-router-tags__ops">
      <el-tooltip :show-after="500" content="右翻页" effect="dark" placement="bottom">
        <fd-button type="icon" icon="right-one" @click="pageRight"></fd-button>
      </el-tooltip>
      <el-tooltip :show-after="500" content="刷新当前页面" effect="dark" placement="bottom">
        <fd-button type="icon" icon="refresh" @click="refreshCurrentTag"></fd-button>
      </el-tooltip>
    </div>
    <fd-contextmenu ref="contextMenu" class="fd-router-tags__menu">
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

<script setup lang="ts">
import FdScrollPanel from '@/components/scroll-panel/index.vue'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { AllState } from '@/store'
import { useStore } from 'vuex'
import { _RouteLocationBase, onBeforeRouteUpdate, RouteMeta, RouteRecordRaw, useRoute, useRouter } from 'vue-router'
import { DEFAULT_ROUTE } from '@/components/router-tags/types'
import { Indexable } from '@/common/types'

defineOptions({
  name: 'FdRouterTags'
})

const scrollPanel = ref()
const contextMenu = ref()

const state = reactive({
  selectedTag: {} as _RouteLocationBase,
  closable: true,
  affixTags: [] as Indexable[]
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
  let tags = [] as Indexable[]
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
