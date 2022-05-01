<template>
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
  <fd-sort-column-dialog ref="sortColumnDialog" append-to-body @submit="setTableColumns" />
</template>

<script setup lang="ts">
import useTableSetting from '@/components/table/hooks/use-table-setting'
import { PropType } from 'vue'
import { TableSettingProp } from '@/components/table/types'
import FdSortColumnDialog from '@/components/table/components/sort-column-dialog.vue'

defineOptions({
  name: 'FdTableOptionSubmenu'
})

const props = defineProps({
  tableOption: {
    type: Object as PropType<TableSettingProp>,
    required: true
  }
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
</script>
