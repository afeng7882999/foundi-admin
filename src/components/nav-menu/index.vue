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
import { filterTree, getTreeNode, ITreeNodeDefault } from '@/utils/data-tree'
import FdNavMenuItem from './nav-menu-item.vue'
import { nextFrame } from '@/utils/next-frame'
import { computed, PropType, provide, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import FdNavMenuGroup from './nav-menu-group.vue'
import { IRootMenuProvided } from './types'

const props = defineProps({
  menu: {
    type: Array as PropType<ITreeNodeDefault[]>,
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
  menuItems: [] as ITreeNodeDefault[],
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

const getVisibleMenu = (items: ITreeNodeDefault[]) => {
  return items.filter((item) => !!item.visible)
}

const emit = defineEmits(['select'])

const handleActive = (item: ITreeNodeDefault) => {
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

const handleExpand = (item: ITreeNodeDefault) => {
  if (state.expandedIds.indexOf(item.id) !== -1) return
  const expandedIds = state.expandedIds
  state.expandedIds = expandedIds.filter((id) => {
    return item.parentPath.indexOf(',' + id + ',') !== -1
  })
  state.expandedIds.push(item.id)
}

const handleCollapse = (item: ITreeNodeDefault) => {
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

provide<IRootMenuProvided>('rootMenu', {
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

<style lang="scss">
@use 'src/assets/style/variable' as *;
@use 'src/assets/style/mixin' as *;

@mixin minimize() {
  .fd-nav-menu__menu {
    > .fd-nav-menu-item {
      > .fd-nav-menu-item__inner {
        transition: padding $sidebar-transition-time, margin $sidebar-transition-time, border-radius $sidebar-transition-time;

        .fd-nav-menu-item__icon {
          transition: opacity $sidebar-transition-time, width $sidebar-transition-time;
        }

        .fd-nav-menu-item__label {
          opacity: 1;
          transition: transform $sidebar-transition-time, opacity $sidebar-transition-time;
        }

        .fd-nav-menu-item__action-icon {
          opacity: 1;
          transition: opacity $sidebar-transition-time;
        }
      }
    }

    &.is-group {
      > .fd-nav-menu-item {
        > .fd-nav-menu-item__inner {
          .fd-nav-menu-item__label {
            opacity: 1;
          }

          .fd-nav-menu-item__abbr {
            opacity: 0;
          }

          &.is-group-title {
            &:before {
              transition: opacity $sidebar-transition-time, width $sidebar-transition-time;
              width: 0;
              opacity: 0;
            }
          }
        }
      }
    }
  }

  &.is-minimized {
    .fd-nav-menu__menu {
      > .fd-nav-menu-item {
        > .fd-nav-menu-item__inner {
          padding-left: 15px !important;
          margin-left: 0;
          margin-right: 0;
          border-radius: 0;

          .fd-nav-menu-item__label {
            transform: translateX(-20px);
            opacity: 0;
          }

          .fd-nav-menu-item__action-icon {
            opacity: 0;
          }
        }
      }

      &.is-group {
        > .fd-nav-menu-item {
          > .fd-nav-menu-item__inner {
            .fd-nav-menu-item__label {
              transform: translateX(0);
              opacity: 0;
            }

            .fd-nav-menu-item__abbr {
              opacity: 1;
            }

            &.is-group-title {
              &:before {
                width: 22px;
                opacity: 1;
              }
            }
          }
        }
      }
    }
  }
}

@mixin group() {
  .fd-nav-menu__menu {
    &.is-group {
      > .fd-nav-menu-item {
        padding-bottom: 0;

        > .fd-nav-menu-item__inner {
          margin: 10px;

          .fd-nav-menu-item__icon {
            font-size: $icon-size-base;
            letter-spacing: normal;
          }

          &.is-group-title {
            color: var(--fd-sidebar-text-placeholder-color);
            cursor: default;

            .fd-nav-menu-item__icon {
              font-size: $icon-size-base;
              letter-spacing: normal;
            }

            .fd-nav-menu-item__label {
              padding-left: 0;
              font-size: var(--el-font-size-small);
            }

            &:before {
              display: block;
              content: '';
              width: 20px;
              flex-shrink: 0;
              border-bottom: 1px solid var(--fd-sidebar-text-placeholder-color);
            }

            &:hover {
              background: none;
            }
          }
        }

        &.is-active {
          .fd-nav-menu-item__inner {
            color: var(--fd-sidebar-active-text-color);
            background-color: var(--fd-sidebar-active-color);

            &:hover {
              background-color: var(--fd-sidebar-active-hover-color);
            }
          }
        }
      }
    }
  }
}

.fd-nav-menu {
  &__menu {
    margin: 0;
    padding: 0;
    list-style-type: none;

    &.is-level-1 {
      padding: 5px 0 10px 0;
      margin-top: 5px;
      background-color: rgba($color-black, 0.3);
    }
  }

  @include group();
  @include minimize();
}

.fd-nav-menu-item {
  &__inner {
    display: flex;
    align-items: center;
    height: 40px;
    position: relative;
    width: auto;
    padding: 8px 15px;
    margin: 5px 10px 0 10px;
    border-radius: var(--el-border-radius-base);
    text-decoration: none;
    white-space: nowrap;
    font-size: var(--el-font-size-base);
    color: var(--fd-sidebar-text-color);
    cursor: pointer;

    &:hover {
      background: var(--fd-sidebar-hover-color);
    }
  }

  &__icon {
    flex-shrink: 0;
    font-size: $icon-size-base;
  }

  &__abbr {
    text-align: center;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  &__label {
    padding-left: 15px;
    font-size: $font-size-base;
    white-space: nowrap;
    transition: opacity $sidebar-transition-time, transform $sidebar-transition-time;
  }

  &__action-icon {
    position: absolute;
    top: 11px;
    right: 15px;
    font-size: $icon-size-middle;
  }

  > .fd-nav-menu__menu {
    @include expandTransition(var(--el-transition-duration));
  }

  &.is-expanded {
    > .fd-nav-menu-item__inner {
      .fd-nav-menu-item__action-icon {
        transform: rotate(90deg);
      }
    }
  }

  &.is-active {
    > .fd-nav-menu-item__inner {
      color: var(--fd-sidebar-active-text-color);
      background-color: var(--fd-sidebar-active-color);

      &:hover {
        background-color: var(--fd-sidebar-active-hover-color);
      }
    }
  }
}
</style>
