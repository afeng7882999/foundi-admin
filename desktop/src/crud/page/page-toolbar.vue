<template>
  <template v-if="visibleCo">
    <div class="fd-page-toolbar">
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
        <el-badge v-if="gridView" :hidden="!selectMode" :value="selectNumber" type="primary" class="fd-page-toolbar__badge">
          <fd-button
            :label="selectMode ? '取消选择' : '选择模式'"
            :icon="selectMode ? 'square' : 'check-correct'"
            @click="emit('toggleSelectMode')"
          />
        </el-badge>
        <fd-button v-if="delVisible" label="删除" icon="delete" plain color="danger" @click="emit('del')" />
        <fd-button v-if="createVisible" label="新增" icon="plus" plain color="primary" @click="emit('create')" />
        <slot name="buttons" />
        <el-divider v-if="more" class="fd-page-toolbar__divider" direction="vertical" />
        <el-tooltip content="更多" :show-after="500" effect="dark" placement="top">
          <fd-button type="icon" class="fd-page-toolbar__icon-btn" icon="more" @click.stop="openMoreMenu" />
        </el-tooltip>
      </div>
    </div>
    <fd-contextmenu ref="contextMenu" target>
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
import { computed, PropType, reactive, ref, useSlots } from 'vue'
import usePage from '@/crud/hooks/use-page'
import { isBoolean } from 'lodash-es'
import { TableSettingProp } from '@/components/table/types'
import FdContextmenuItem from '@b/components/contextmenu/item.vue'
import FdContextmenuSubmenu from '@b/components/contextmenu/submenu.vue'
import { ApiQuery } from '@b/api'
import { CompactButton, GridPage } from '@/crud/page/types'
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
  selectMode: Boolean,
  selectNumber: Number
})

const state = reactive({
  showedButtons: [] as CompactButton[],
  compactButtons: [] as CompactButton[],
  mobilePaginationVisible: false
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
</script>
