<template>
  <el-tooltip :content="tip" :disabled="!tip" :show-after="500" effect="dark" placement="top">
    <el-button v-if="label" v-waves plain @click.stop="openMenu">
      {{ label }}
      <fd-icon class="is-in-btn is-right" icon="more"></fd-icon>
    </el-button>
    <fd-icon-button v-else class="action-icon-btn" icon="more" @click.stop="openMenu"></fd-icon-button>
  </el-tooltip>
  <fd-contextmenu ref="contextMenu">
    <fd-contextmenu-item
      v-if="option.treeTable"
      icon="row-height"
      :label="expandAll ? '收缩所有行' : '展开所有行'"
      @click="toggleExpandAll"
    ></fd-contextmenu-item>
    <fd-contextmenu-item
      v-if="!option.treeTable"
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
</template>

<script lang="ts">
export default {
  name: 'FdTableSetting'
}
</script>

<script setup lang="ts">
import { PropType, ref } from 'vue'
import { TableColumn, TableSettingProp } from '@/components/table/types'
import FdSortColumnDialog from './sort-column-dialog.vue'

const props = defineProps({
  option: {
    type: Object as PropType<TableSettingProp>,
    required: true
  },
  tip: {
    type: String,
    default: '设置表格'
  },
  label: {
    type: String,
    default: ''
  }
})

const sortColumnDialog = ref()
const contextMenu = ref()

const expandAll = props.option.expandAll()
const rowDensity = props.option.rowDensity()
const columns = props.option.columns()
const stripe = props.option.stripe()
const border = props.option.border()

const openMenu = (e: Event) => {
  contextMenu.value.show(e)
}

const toggleExpandAll = () => {
  expandAll.value = !expandAll.value
}

const toggleStripe = () => {
  stripe.value = !stripe.value
}

const toggleBorder = () => {
  border.value = !border.value
}

const showSortColumnDialog = () => {
  ;(sortColumnDialog.value as any).open(columns?.value)
}

const setTableColumns = (cols: TableColumn[]) => {
  columns.value = cols
}
</script>
