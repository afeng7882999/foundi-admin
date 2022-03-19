<template>
  <div class="fd-page__form">
    <fd-page-act :table-option="tableSettingOpt" />
  </div>
  <div ref="menuTbWrapper" class="fd-page__table is-bordered">
    <el-table ref="menuTb" v-bind="tableAttrs" :data="state.menus" row-key="id">
      <fd-col-selection typ="selection"></fd-col-selection>
      <fd-col label="菜单名称" prop="name" width="200"></fd-col>
      <fd-col-icon label="菜单图标" prop="icon" width="80"></fd-col-icon>
      <fd-col-dict label="类型" prop="typeDict" :dict="state.sysMenuType" width="60"></fd-col-dict>
      <fd-col label="菜单缩写" prop="abbr" width="80"></fd-col>
      <fd-col-custom label="是否显示" prop="visible" width="80">
        <template #default="scope">
          <fd-icon v-show="scope.row.visible" class="tb-icon is-success" icon="check"></fd-icon>
        </template>
      </fd-col-custom>
      <fd-col label="菜单URL" prop="url"></fd-col>
      <fd-col-act :edit="true" :del="true" header-align="center" align="center" width="90"></fd-col-act>
    </el-table>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TreeTableDemo'
}
</script>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { menuData, sysMenuType } from './data'
import useTable from '@/extend/table/hooks/use-table'
import { Ref } from '@vue/reactivity'
import { ElTable } from 'element-plus'

const state = reactive({
  menus: menuData,
  sysMenuType: sysMenuType
})

const menuTb = ref() as Ref<InstanceType<typeof ElTable>>

const { tableAttrs, rowDensity, columns, expandAll, stripe, border } = useTable(menuTb, {
  alias: '_2',
  treeTable: true,
  data: () => state.menus,
  rowFocusable: false
})

const tableSettingOpt = {
  treeTable: true,
  expandAll: () => expandAll,
  rowDensity: () => rowDensity,
  columns: () => columns,
  stripe: () => stripe,
  border: () => border
}
</script>
