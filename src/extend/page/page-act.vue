<template>
  <template v-if="visibleCo">
    <div class="fd-page-act" :class="objClass">
      <div class="fd-page-act__left">
        <template v-if="query">
          <el-tooltip :content="queryVisible ? '隐藏查询表单' : '显示查询表单'" :show-after="500" effect="dark" placement="top">
            <el-badge :hidden="queryVisible || !queryLenCo" :value="queryLenCo" type="primary" class="fd-page-act__badge">
              <fd-icon-button
                :class="queryVisible ? 'expanded' : ''"
                class="fd-page-act__icon-btn"
                icon="search-more"
                @click="toggleQueryVisible"
              />
            </el-badge>
          </el-tooltip>
          <el-divider class="fd-page-act__divider" direction="vertical" style="margin-left: 16px" />
        </template>
        <div v-if="!isMobile" class="query-compact">
          <el-form :model="queryData" inline compact :submit-fn="queryFn">
            <slot name="query" />
          </el-form>
        </div>
      </div>
      <div class="fd-page-act__right">
        <template v-if="!isMobile">
          <el-button v-if="delVisible" v-waves plain type="danger" @click="emit('del')">
            <fd-icon class="is-in-btn" icon="delete" />
            删除
          </el-button>
          <slot name="buttons" />
          <el-button v-if="createVisible" v-waves plain type="primary" @click="emit('create')">
            <fd-icon class="is-in-btn" icon="plus" />
            新增
          </el-button>
          <el-divider v-if="more" class="fd-page-act__divider" direction="vertical" />
        </template>
        <el-tooltip content="更多" :show-after="500" effect="dark" placement="top">
          <fd-icon-button class="fd-page-act__icon-btn" icon="more" @click.stop="openMoreMenu" />
        </el-tooltip>
        <fd-contextmenu ref="contextMenu">
          <template v-if="isMobile">
            <fd-contextmenu-item v-if="delVisible" color="danger" icon="delete" label="删除" @click="emit('del')" />
            <slot name="menu" />
            <fd-contextmenu-item v-if="createVisible" color="primary" icon="plus" label="新增" @click="emit('create')" />
          </template>
          <fd-contextmenu-submenu v-if="exportVisible" icon="download" label="导出表数据">
            <fd-contextmenu-item label="导出当前页" @click="emit('export')" />
            <fd-contextmenu-item label="导出全部页" @click="emit('exportAll')" />
          </fd-contextmenu-submenu>
          <fd-contextmenu-item v-if="exportVisible" divider />
          <fd-contextmenu-submenu icon="table-row" label="表格设置">
            <fd-contextmenu-item
              v-if="tableOption.treeTable"
              icon="row-height"
              :label="expandAll ? '收缩所有行' : '展开所有行'"
              @click="toggleExpandAll"
            />
            <fd-contextmenu-item
              v-if="!tableOption.treeTable"
              icon="table-stripe"
              :label="stripe ? '隐藏斑马纹' : '显示斑马纹'"
              @click="toggleStripe"
            />
            <fd-contextmenu-item icon="table" :label="border ? '隐藏边框' : '显示边框'" @click="toggleBorder" />
            <fd-contextmenu-submenu icon="table-row" label="表格行密度">
              <fd-contextmenu-item :radio-value="rowDensity" act-as="radioGroup" radio-label="high" @click="setRowDensity('high')">
                高
              </fd-contextmenu-item>
              <fd-contextmenu-item :radio-value="rowDensity" act-as="radioGroup" radio-label="low" @click="setRowDensity('low')">
                低
              </fd-contextmenu-item>
              <fd-contextmenu-item :radio-value="rowDensity" act-as="radioGroup" radio-label="default" @click="setRowDensity('default')">
                默认
              </fd-contextmenu-item>
            </fd-contextmenu-submenu>
            <fd-contextmenu-item icon="table-col" label="表格列设置" @click="showSortColumnDialog" />
          </fd-contextmenu-submenu>
        </fd-contextmenu>
        <fd-sort-column-dialog ref="sortColumnDialog" @submit="setTableColumns" />
      </div>
    </div>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdPageAct'
}
</script>

<script setup lang="ts">
import { computed, PropType, ref } from 'vue'
import usePage from '@/extend/page/use-page'
import { isBoolean } from 'lodash-es'
import { TableSettingProp } from '@/extend/table/types'
import useTableSetting from '@/extend/table/hooks/use-table-setting'
import FdSortColumnDialog from '@/extend/table/components/sort-column-dialog.vue'
import FdContextmenuItem from '@/components/contextmenu/item.vue'
import FdContextmenuSubmenu from '@/components/contextmenu/submenu.vue'
import { ApiQuery } from '@/api'
import useBreakpoint from '@/hooks/use-breakpoint'

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
  more: {
    type: Boolean,
    default: true
  },
  tableOption: {
    type: Object as PropType<TableSettingProp>,
    required: true
  },
  mobileCompact: {
    type: Boolean,
    default: true
  }
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
const exportVisible = computed(() => {
  return booleanOrAuth(props.export)
})

const emit = defineEmits(['del', 'create', 'export', 'exportAll', 'update:queryVisible'])

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

const {
  sortColumnDialog,
  expandAll,
  rowDensity,
  stripe,
  border,
  setRowDensity,
  toggleExpandAll,
  toggleStripe,
  toggleBorder,
  showSortColumnDialog,
  setTableColumns
} = useTableSetting(props.tableOption)

const { isMobile } = useBreakpoint(props.mobileCompact)
const objClass = computed(() => {
  const clazz = []
  if (isMobile.value) {
    clazz.push('is-mobile')
  }
  return clazz.join(' ')
})
</script>
