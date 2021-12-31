<template>
  <li class="fd-nav-menu-item" :class="{ 'is-active': isActive, 'is-expanded': isExpanded, 'is-desc-active': isDescActive }">
    <a class="fd-nav-menu-item__inner" :style="menuLinkStyle" :href="menuItem.url" rel="noopener" target="_blank" v-waves @mouseenter="mouseHover = true" @mouseleave="mouseHover = false" @click.prevent="onMenuLinkClick">
      <div class="fd-nav-menu-item__flag"></div>
      <fd-icon v-if="hasIcon" class="fd-nav-menu-item__icon" :icon="menuItem.icon"></fd-icon>
      <span v-else-if="hasAbbr" class="fd-nav-menu-item__abbr">{{ menuItem.abbr }}</span>
      <span class="fd-nav-menu-item__label">{{ menuItem.name }}</span>
      <fd-icon v-if="showChildren" class="fd-nav-menu-item__action-icon" icon="right"></fd-icon>
    </a>
    <template v-if="showChildren">
      <transition name="expand" @after-enter="expandAfterEnter" @before-leave="expandBeforeLeave" @enter="expandEnter">
        <ul v-show="isExpanded" class="fd-nav-menu__menu" :class="{ 'is-level-1': level === 0 }">
          <fd-nav-menu-item v-for="child in notHiddenItems" :key="child.id" :level="level + 1" :menu-item="child"></fd-nav-menu-item>
        </ul>
      </transition>
    </template>
  </li>
</template>

<script lang="ts">
export default {
  name: 'FdNavMenuItem'
}
</script>

<script setup lang="ts">
import useExpandTransition from '@/components/transition/use-expand-transition'
import { computed, inject, PropType, ref } from 'vue'
import { ITreeNodeDefault } from '@/utils/data-tree'
import { IRootMenuProvided } from '@/components/nav-menu/types'

const MENU_TYPE = '0'

const props = defineProps({
  menuItem: {
    type: Object as PropType<ITreeNodeDefault>,
    default: {} as ITreeNodeDefault
  },
  level: {
    type: Number,
    default: 0
  }
})

const rootMenu = inject('rootMenu') as IRootMenuProvided

const mouseHover = ref(false)

const isExternal = computed(() => {
  return props.menuItem.external === true
})

const hasIcon = computed(() => {
  return !!props.menuItem.icon
})

const hasAbbr = computed(() => {
  return !!props.menuItem.abbr
})

const showChildren = computed(() => {
  return props.menuItem.typeDict === MENU_TYPE && props.menuItem.children && props.menuItem.children.length > 0
})

const menuLinkStyle = computed(() => {
  return {
    'padding-left': `${15 + props.level * rootMenu.levelPadding.value}px`
  }
})

const isActive = computed(() => {
  return rootMenu.rootState.activeId === props.menuItem.id
})

const isExpanded = computed(() => {
  return rootMenu.rootState.expandedIds.indexOf(props.menuItem.id) !== -1
})

const isDescActive = computed(() => {
  return rootMenu.rootState.descActiveIds.indexOf(props.menuItem.id) !== -1
})

const notHiddenItems = computed(() => {
  if (props.menuItem.children) {
    return props.menuItem.children.filter((item) => item.hidden !== true)
  }
  return []
})

const onMenuLinkClick = () => {
  if (isExternal.value) {
    return
  }
  if (props.menuItem.typeDict === MENU_TYPE) {
    if (isExpanded.value) {
      rootMenu?.handleCollapse(props.menuItem)
    } else {
      rootMenu?.handleExpand(props.menuItem)
    }
  } else {
    rootMenu?.handleActive(props.menuItem)
  }
}

const { expandEnter, expandAfterEnter, expandBeforeLeave } = useExpandTransition()
</script>
