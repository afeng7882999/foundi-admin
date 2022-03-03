<template>
  <template v-if="visibleCo">
    <div class="fd-page__action">
      <el-tooltip v-if="query" :content="queryVisible ? '隐藏查询表单' : '显示查询表单'" :show-after="500" effect="dark" placement="top">
        <fd-icon-button
          :class="queryVisible ? 'expanded' : ''"
          class="action-query-toggle"
          icon="search-more"
          @click="emit('update:queryVisible')"
        ></fd-icon-button>
      </el-tooltip>
      <slot v-if="query" name="query" />
      <div class="action-right">
        <el-button v-show="delVisible" v-waves plain type="danger" @click="emit('del')">
          <fd-icon class="is-in-btn" icon="delete"></fd-icon>
          删除
        </el-button>
        <el-divider v-if="delVisible" class="action-divider" direction="vertical"></el-divider>
        <slot name="buttons" />
        <el-button v-show="createVisible" v-waves plain type="primary" @click="emit('create')">
          <fd-icon class="is-in-btn" icon="plus"></fd-icon>
          新增
        </el-button>
        <el-divider v-if="props.more" class="action-divider" direction="vertical"></el-divider>
        <el-tooltip content="更多" :show-after="500" effect="dark" placement="top">
          <fd-icon-button class="action-icon-btn" icon="more" @click.stop="openMoreMenu"></fd-icon-button>
        </el-tooltip>
        <fd-contextmenu ref="contextMenu">
          <slot name="menu" />
          <fd-contextmenu-submenu v-if="exportVisible" icon="download" label="导出表数据">
            <fd-contextmenu-item label="导出当前页" @click="emit('export')"></fd-contextmenu-item>
            <fd-contextmenu-item label="导出全部页" @click="emit('exportAll')"></fd-contextmenu-item>
          </fd-contextmenu-submenu>
          <fd-contextmenu-item v-if="exportVisible" divider></fd-contextmenu-item>
          <fd-contextmenu-item
            v-if="tableOption.treeTable"
            icon="row-height"
            :label="expandAll ? '收缩所有行' : '展开所有行'"
            @click="toggleExpandAll"
          ></fd-contextmenu-item>
          <fd-contextmenu-item
            v-if="!tableOption.treeTable"
            icon="table-stripe"
            :label="stripe ? '隐藏斑马纹' : '显示斑马纹'"
            @click="toggleStripe"
          ></fd-contextmenu-item>
          <fd-contextmenu-item icon="table" :label="border ? '隐藏边框' : '显示边框'" @click="toggleBorder"></fd-contextmenu-item>
          <fd-contextmenu-submenu icon="table-row" label="表格行密度">
            <fd-contextmenu-item v-model:radio-value="rowDensity" act-as="radioGroup" radio-label="high">高</fd-contextmenu-item>
            <fd-contextmenu-item v-model:radio-value="rowDensity" act-as="radioGroup" radio-label="low">低</fd-contextmenu-item>
            <fd-contextmenu-item v-model:radio-value="rowDensity" act-as="radioGroup" radio-label="default">默认</fd-contextmenu-item>
          </fd-contextmenu-submenu>
          <fd-contextmenu-item icon="table-col" label="表格列设置" @click="showSortColumnDialog"></fd-contextmenu-item>
        </fd-contextmenu>
        <fd-sort-column-dialog ref="sortColumnDialog" @submit="setTableColumns"></fd-sort-column-dialog>
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
import usePage from '@/components/page/use-page'
import { isBoolean } from '@vueuse/core'
import { TableSettingProp } from '@/components/table/types'
import useTableSetting from '@/components/page/use-table-setting'
import FdSortColumnDialog from '@/components/table/components/sort-column-dialog.vue'
import FdContextmenuItem from '@/components/contextmenu/item.vue'

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
  more: {
    type: Boolean,
    default: true
  },
  queryVisible: {
    type: Boolean,
    default: false
  },
  tableOption: {
    type: Object as PropType<TableSettingProp>,
    required: true
  }
})

const visibleCo = computed(() => {
  return props.visible
})

const { hasAuth } = usePage()
const booleanOrAuth = (val: boolean | string) => {
  if (isBoolean(val)) {
    return val
  }
  if (val) {
    return hasAuth(val)
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

const contextMenu = ref()
const openMoreMenu = (e: Event) => {
  contextMenu.value.show(e)
}

const {
  sortColumnDialog,
  expandAll,
  rowDensity,
  stripe,
  border,
  toggleExpandAll,
  toggleStripe,
  toggleBorder,
  showSortColumnDialog,
  setTableColumns
} = useTableSetting(props)
</script>
