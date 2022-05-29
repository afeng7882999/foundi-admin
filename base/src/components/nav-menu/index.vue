<template>
  <div class="fd-nav-menu" :class="classObj">
    <fd-nav-menu-group v-if="grouped"></fd-nav-menu-group>
    <ul v-else class="fd-nav-menu__menu">
      <fd-nav-menu-item v-for="item in getVisibleMenu(state.menuItems)" :key="item.id" :menu-item="item"></fd-nav-menu-item>
    </ul>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FdNavMenu'
}
</script>

<script setup lang="ts">
import { filterTree, getTreeNode, TreeNodeDefault } from '@b/utils/data-tree'
import FdNavMenuItem from './nav-menu-item.vue'
import { nextFrame } from '@b/utils/next-frame'
import { computed, PropType, provide, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import FdNavMenuGroup from './nav-menu-group.vue'
import { RootMenuProvided } from './types'

const props = defineProps({
  menu: {
    type: Array as PropType<TreeNodeDefault[]>,
    default: () => []
  },
  defaultPath: {
    type: String,
    default: ''
  },
  minimized: {
    type: Boolean,
    default: false
  },
  grouped: {
    type: Boolean,
    default: false
  },
  levelPadding: {
    type: Number,
    default: 15
  }
})

const state = reactive({
  menuItems: [] as TreeNodeDefault[],
  activeId: '-1',
  descActiveIds: [] as string[],
  expandedIds: [] as string[]
})

const router = useRouter()

const classObj = computed(() => {
  return [props.minimized ? 'is-minimized' : '']
})

watch(
  () => props.defaultPath,
  (path) => {
    const item = getTreeNode(state.menuItems, (item) => item.url === path)
    if (item) {
      state.activeId = item.id
      const arr = item.parentPath.split(',')
      const parents = arr.slice(1, arr.length - 1)
      nextFrame(() => {
        state.descActiveIds = parents
        state.expandedIds = parents
      })
    }
  }
)

watch(
  () => props.menu,
  (val) => {
    state.menuItems = filterTree(val, (item) => item.visible)
  },
  { immediate: true }
)

const getVisibleMenu = (items: TreeNodeDefault[]) => {
  return items.filter((item) => !!item.visible)
}

const emit = defineEmits(['select'])

const handleActive = (item: TreeNodeDefault) => {
  const oldActiveId = state.activeId
  const oldDescActiveIds = state.descActiveIds
  state.activeId = item.id
  const arr = item.parentPath.split(',')
  state.descActiveIds = arr.slice(1, arr.length - 1)
  emit('select', item)
  router.push(item.url).catch(() => {
    // error
    state.activeId = oldActiveId
    state.descActiveIds = oldDescActiveIds
  })
}

const handleExpand = (item: TreeNodeDefault) => {
  if (state.expandedIds.indexOf(item.id) !== -1) return
  const expandedIds = state.expandedIds
  state.expandedIds = expandedIds.filter((id) => {
    return item.parentPath.indexOf(',' + id + ',') !== -1
  })
  state.expandedIds.push(item.id)
}

const handleCollapse = (item: TreeNodeDefault) => {
  if (state.expandedIds.indexOf(item.id) === -1) return
  const expandedIds = state.expandedIds
  state.expandedIds = expandedIds.filter((id) => {
    return item.parentPath.indexOf(',' + id + ',') !== -1
  })
}

const unActiveAll = () => {
  state.activeId = '-1'
  state.descActiveIds = []
}

const collapseAll = () => {
  state.expandedIds = []
}

provide<RootMenuProvided>('rootMenu', {
  levelPadding: computed(() => {
    return props.levelPadding
  }),
  rootState: state,
  handleActive,
  handleExpand,
  handleCollapse
})

defineExpose({
  unActiveAll,
  collapseAll
})
</script>
