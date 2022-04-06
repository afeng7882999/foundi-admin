<template>
  <ul class="fd-nav-menu__menu is-group">
    <template v-for="group in getVisibleMenu(rootState.menuItems)" :key="group.id">
      <li v-if="group.typeDict === '1'" class="fd-nav-menu-item" :class="{ 'is-active': rootState.activeId === group.id }">
        <a class="fd-nav-menu-item__inner" rel="noopener" @click="handleActive(group)">
          <fd-icon v-if="group.icon" class="fd-nav-menu-item__icon" :icon="group.icon"></fd-icon>
          <span class="fd-nav-menu-item__label">{{ group.name }}</span>
        </a>
      </li>
      <li v-else class="fd-nav-menu-item">
        <a class="fd-nav-menu-item__inner is-group-title" rel="noopener">
          <span class="fd-nav-menu-item__label">{{ group.name }}</span>
        </a>
        <ul v-if="group.children && group.children.length > 0" class="fd-nav-menu__menu">
          <fd-nav-menu-item v-for="item in getVisibleMenu(group.children)" :key="item.id" :menu-item="item" :level="1"></fd-nav-menu-item>
        </ul>
      </li>
    </template>
  </ul>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { TreeNodeDefault } from '@/utils/data-tree'
import FdNavMenuItem from './nav-menu-item.vue'
import { RootMenuProvided } from '@/components/nav-menu/types'

defineOptions({
  name: 'FdNavMenuGroup'
})

const rootMenu = inject('rootMenu') as RootMenuProvided
const { handleActive, rootState } = rootMenu

const getVisibleMenu = (items: TreeNodeDefault[]) => {
  return items.filter((item) => !!item.visible)
}
</script>
