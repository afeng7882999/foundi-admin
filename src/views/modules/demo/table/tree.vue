<template>
  <div class="fd-page__form">
    <el-form>
      <div class="fd-page__action">
        <div class="action-right">
          <fd-table-setting :option="tableSettingOpt"></fd-table-setting>
        </div>
      </div>
    </el-form>
  </div>
  <div ref="menuTbWrapper" class="fd-page__table is-bordered">
    <el-table ref="menuTb" v-bind="tableAttrs" :data="state.menus" row-key="id">
      <fd-selection-col typ="selection"></fd-selection-col>
      <fd-col label="菜单名称" prop="name" width="200"></fd-col>
      <fd-icon-col label="菜单图标" prop="icon" width="80"></fd-icon-col>
      <fd-dict-col label="类型" prop="typeDict" :dict="state.sysMenuType" width="60"></fd-dict-col>
      <fd-col label="菜单缩写" prop="abbr" width="80"></fd-col>
      <fd-custom-col label="是否显示" prop="visible" width="80">
        <template #default="scope">
          <fd-icon v-show="scope.row.visible" class="tb-icon is-success" icon="check"></fd-icon>
        </template>
      </fd-custom-col>
      <fd-col label="菜单URL" prop="url"></fd-col>
      <fd-act-col :edit="true" :del="true" header-align="center" align="center" width="90"></fd-act-col>
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
import useTable from '@/components/table/hooks/use-table'
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
