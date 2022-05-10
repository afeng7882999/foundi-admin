<template>
  <template v-if="visibleCo">
    <div class="fd-page-toolbar" :class="objClass">
      <template v-if="!isMobile">
        <div class="fd-page-toolbar__left">
          <template v-if="query">
            <el-tooltip :content="queryVisible ? '隐藏查询表单' : '显示查询表单'" :show-after="500" effect="dark" placement="top">
              <el-badge :hidden="queryVisible || !queryLenCo" :value="queryLenCo" type="primary" class="fd-page-toolbar__badge">
                <fd-button
                  type="icon"
                  :class="queryVisible ? 'expanded' : ''"
                  class="fd-page-toolbar__icon-btn"
                  icon="search-more"
                  @click="toggleQueryVisible"
                />
              </el-badge>
            </el-tooltip>
          </template>
          <div class="query-compact">
            <el-form :model="queryData" inline compact @submit="queryFn">
              <slot name="query" />
            </el-form>
          </div>
        </div>
        <div v-if="gridView" class="fd-page-toolbar__center">
          <el-divider class="fd-page-toolbar__divider" direction="vertical" />
          <div class="fd-page-toolbar__pagination">
            <span class="pagination-current">第{{ gridPage.index + 1 }}条 / 共{{ gridPage.total }}条</span>
            <el-pagination v-bind="pagination" />
          </div>
          <el-divider class="fd-page-toolbar__divider" direction="vertical" />
        </div>
        <div class="fd-page-toolbar__right">
          <fd-button v-if="gridView" label="选择" icon="check-correct" plain @click="emit('toggleSelectMode')" />
          <fd-button v-if="delVisible" label="删除" icon="delete" plain color="danger" @click="emit('del')" />
          <fd-button v-if="createVisible" label="新增" icon="plus" plain color="primary" @click="emit('create')" />
          <slot name="buttons" />
          <el-divider v-if="more" class="fd-page-toolbar__divider" direction="vertical" />
          <el-tooltip content="更多" :show-after="500" effect="dark" placement="top">
            <fd-button type="icon" class="fd-page-toolbar__icon-btn" icon="more" @click.stop="openMoreMenu" />
          </el-tooltip>
        </div>
      </template>
      <template v-else>
        <div class="fd-page-toolbar__center">
          <template v-if="query">
            <el-badge :hidden="queryVisible || !queryLenCo" :value="queryLenCo" type="primary" class="fd-page-toolbar__badge">
              <fd-button
                type="toolbar"
                :class="queryVisible ? 'expanded' : ''"
                label="查询"
                icon="search-more"
                @click="toggleQueryVisible"
              />
            </el-badge>
          </template>
          <fd-button v-if="delVisible" type="toolbar" label="删除" icon="delete" @click="emit('del')" />
          <fd-button v-if="createVisible" type="toolbar" label="新增" icon="plus" @click="emit('create')" />
          <fd-button v-if="editVisible" type="toolbar" label="编辑" icon="write" @click="emit('edit')" />
          <div v-show="false">
            <slot name="buttons" />
          </div>
          <fd-button
            v-for="item in state.showedButtons"
            :key="item.label"
            type="toolbar"
            :label="item.label"
            :icon="item.icon"
            @click="item.onClick"
          />
          <fd-button type="toolbar" label="更多" icon="more" @click.stop="openMoreMenu" />
        </div>
      </template>
    </div>
    <fd-contextmenu ref="contextMenu">
      <fd-contextmenu-item
        v-for="item in state.compactButtons"
        :key="item.label"
        :icon="item.icon"
        :label="item.label"
        @click="item.onClick"
      />
      <slot name="menu" />
      <fd-contextmenu-item v-if="menuDividerVisible" divider />
      <fd-contextmenu-submenu v-if="exportVisible" icon="download" label="导出表数据">
        <fd-contextmenu-item label="导出当前页" @click="emit('export')" />
        <fd-contextmenu-item label="导出全部页" @click="emit('exportAll')" />
      </fd-contextmenu-submenu>
      <template v-if="gridViewEnable">
        <fd-contextmenu-item v-if="exportVisible" divider />
        <fd-contextmenu-item
          :icon="gridView ? 'table-row' : 'view-grid-detail'"
          :label="gridView ? '切换表格视图' : '切换卡片视图'"
          @click="emit('toggleGridView')"
        />
      </template>
      <template v-if="tableSettingOption && !gridView">
        <fd-contextmenu-item v-if="gridViewEnable" divider />
        <fd-table-option-submenu :table-setting-option="tableSettingOption" />
      </template>
    </fd-contextmenu>
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, reactive, ref, useSlots, VNode } from 'vue'
import usePage from '../hooks/use-page'
import { isBoolean } from 'lodash-es'
import { TableSettingProp } from '@/components/table/types'
import FdContextmenuItem from '@/components/contextmenu/item.vue'
import FdContextmenuSubmenu from '@/components/contextmenu/submenu.vue'
import { ApiQuery } from '@/api'
import useLayoutSize from '@/hooks/use-layout-size'
import { CompactButton, GridPage } from '@/crud/page/types'
import { Indexable } from '@/common/types'
import FdTableOptionSubmenu from './table-option-submenu.vue'

defineOptions({
  name: 'FdPageToolbar'
})

const props = defineProps({
  visible: {
    type: Boolean,
    default: true
  },
  del: {
    type: [String, Boolean] as PropType<string | boolean>,
    default: false
  },
  create: {
    type: [String, Boolean] as PropType<string | boolean>,
    default: false
  },
  edit: {
    type: [String, Boolean] as PropType<string | boolean>,
    default: false
  },
  export: {
    type: [String, Boolean] as PropType<string | boolean>,
    default: false
  },
  query: {
    type: Boolean,
    default: true
  },
  queryData: Object as PropType<ApiQuery>,
  queryFn: Function,
  queryVisible: {
    type: Boolean,
    default: false
  },
  pagination: Object,
  more: {
    type: Boolean,
    default: true
  },
  tableSettingOption: {
    type: Object as PropType<TableSettingProp>
  },
  gridView: Boolean,
  gridViewEnable: {
    type: Boolean,
    default: true
  },
  gridPage: Object as PropType<GridPage>,
  mobileCompact: {
    type: Boolean,
    default: true
  }
})

const state = reactive({
  showedButtons: [] as CompactButton[],
  compactButtons: [] as CompactButton[]
})

const visibleCo = computed(() => {
  return props.visible
})

const { auth } = usePage()
const booleanOrAuth = (val: boolean | string) => {
  if (isBoolean(val)) {
    return val
  }
  if (val) {
    return auth(val)
  }
  return true
}
const delVisible = computed(() => {
  return booleanOrAuth(props.del)
})
const createVisible = computed(() => {
  return booleanOrAuth(props.create)
})
const editVisible = computed(() => {
  return booleanOrAuth(props.edit)
})
const exportVisible = computed(() => {
  return booleanOrAuth(props.export)
})

const menuDividerVisible = computed(() => {
  return !!(useSlots().menu || state.compactButtons.length != 0)
})

const emit = defineEmits(['del', 'create', 'export', 'exportAll', 'update:queryVisible', 'toggleGridView', 'toggleSelectMode'])

const toggleQueryVisible = () => {
  emit('update:queryVisible', !props.queryVisible)
}

const contextMenu = ref()
const openMoreMenu = (e: Event) => {
  contextMenu.value.show(e)
}

const queryLenCo = computed(() => {
  let len = 0
  for (const key in props.queryData) {
    if (key === 'sort') {
      continue
    }
    const val = props.queryData[key]
    if (!val) {
      continue
    }
    if (Array.isArray(val) && val.length === 0) {
      continue
    }
    len++
  }
  return len
})

const { isMobile } = useLayoutSize(props.mobileCompact)
const objClass = computed(() => {
  const clazz = []
  if (isMobile.value) {
    clazz.push('is-mobile')
  }
  return clazz.join(' ')
})

const compactButtons = () => {
  let empty = 4
  delVisible.value && empty--
  editVisible.value && empty--
  createVisible.value && empty--

  const buttons = (useSlots()?.buttons?.() as VNode[]) ?? []

  for (const btn of buttons) {
    if ((btn.type as Indexable)?.name === 'FdButton') {
      const addBtn = {
        label: btn.props?.label,
        icon: btn.props?.icon,
        disabled: btn.props?.disabled,
        onClick: btn.props?.onClick
      }
      if (state.showedButtons.length < empty) {
        state.showedButtons.push(addBtn)
      } else {
        state.compactButtons.push(addBtn)
      }
    }
  }
}

onMounted(() => {
  if (isMobile.value) {
    compactButtons()
  }
})
</script>
