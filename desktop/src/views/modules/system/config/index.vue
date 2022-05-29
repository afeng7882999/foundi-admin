<template>
  <fd-page v-bind="pageMainAttrs" name="system-config" :pagination="paginationAttrs">
    <template #act>
      <fd-page-toolbar
        create="system:config:add"
        del="system:config:delete"
        export="system:config:export"
        :query="false"
        v-bind="pageToolbarAttrs"
      >
        <template #query>
          <fd-item-dict label="配置分类" prop="configTypeDict" :dict="s.dicts.sysConfigType" no-label width="200" />
          <fd-item label="键" prop="configKey" no-label width="200" />
        </template>
      </fd-page-toolbar>
    </template>
    <template #table>
      <el-table ref="table" v-loading="s.loading" v-bind="tableAttrs">
        <fd-col-selection />
        <fd-col-boolean label="启用" prop="enabled" labels="启用,禁用" />
        <fd-col-dict label="配置分类" prop="configTypeDict" :dict="s.dicts.sysConfigType" />
        <fd-col label="键" prop="configKey" min-width="200" />
        <fd-col label="值" prop="configValue" min-width="600" />
        <fd-col-datetime label="创建时间" prop="createAt" />
        <fd-col-act
          detail="system:config:list"
          edit="system:config:edit"
          del="system:config:delete"
          header-align="center"
          @detail="m.showDetail"
          @edit="m.showEdit"
          @del="m.del"
        />
      </el-table>
    </template>
  </fd-page>
  <detail v-if="s.detailShow" ref="detailDialog" v-bind="detailAttrs" @open-edit-dialog="m.showEdit(s.currentId)"></detail>
  <edit v-if="s.editShow" ref="editDialog" @refresh-data-list="m.getList"></edit>
</template>

<script lang="ts">
export default {
  name: 'SystemConfig'
}
</script>

<script setup lang="ts">
import useList from '@/crud/hooks/use-list'
import { configDel, configDicts, configExport, configFields, configList, configQuery, Config } from '@b/api/system/config'
import Edit from './edit.vue'
import Detail from './detail.vue'

const stateOption = {
  idField: configFields.idField,
  listApi: configList,
  delApi: configDel,
  exportApi: configExport,
  dicts: configDicts,
  query: configQuery,
  tableRowSelectable: true
}

const { listRefs, listState: s, listMethods: m, listAttrs } = useList<Config>(stateOption)
const { table, editDialog, detailDialog } = listRefs
const { pageMainAttrs, pageToolbarAttrs, tableAttrs, paginationAttrs, detailAttrs } = listAttrs
</script>
