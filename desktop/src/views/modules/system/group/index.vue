<template>
  <div ref="moduleRoot" :style="docMinHeight" class="page-system-group fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <div class="fd-page-toolbar">
        <el-button
          v-show="auth('system:group:delete')"
          v-waves
          :disabled="state.selectedNodes.length <= 0"
          plain
          type="danger"
          @click="del()"
        >
          <fd-icon class="is-in-btn" icon="delete"></fd-icon>
          删除
        </el-button>
        <div class="fd-page-toolbar__right">
          <el-button v-show="auth('system:group:add')" v-waves plain type="primary" @click="showEdit()">新增</el-button>
          <el-button v-show="auth('system:group:export')" v-waves plain @click="exportData()">导出数据</el-button>
        </div>
      </div>
    </div>
    <div ref="tableWrapper" class="fd-page__table is-bordered">
      <el-table ref="table" v-loading="state.loading" v-bind="tableAttrs">
        <el-table-column align="left" header-align="left" type="selection" width="40"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="用户组名称" prop="name"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="上级用户组" prop="parentId">
          <template #default="scope">
            {{ getParentName(scope.row.parentId) }}
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="排序" prop="sort"></el-table-column>
        <el-table-column align="left" fixed="right" header-align="left" label="操作" width="100">
          <template #default="scope">
            <el-tooltip content="编辑" placement="top" :show-after="500">
              <el-button
                v-show="auth('system:group:edit')"
                class="tb-act-btn"
                plain
                size="small"
                type="success"
                @click="showEdit(scope.row.id)"
              >
                <fd-icon icon="write"></fd-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top" :show-after="500">
              <el-button
                v-show="auth('system:group:delete')"
                class="tb-act-btn"
                plain
                size="small"
                type="danger"
                @click="del(scope.row, scope.row.k)"
              >
                <fd-icon icon="close"></fd-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-backtop></el-backtop>
    <edit v-if="state.editShow" ref="editDialog" @refresh-data-list="getList"></edit>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SystemGroup'
}
</script>

<script setup lang="ts">
import { groupFields, groupTreeFields, groupList, groupDel, groupExport, Group } from '@b/api/system/group'
import Edit from './edit.vue'
import usePage from '@/crud/hooks/use-page'
import useList from '@/crud/hooks/use-list'

const stateOption = {
  treeTable: true,
  idField: groupFields.idField,
  treeFields: groupTreeFields,
  listApi: groupList,
  delApi: groupDel,
  exportApi: groupExport,
  defaultExpandAll: true
}

const { listRefs, listState: state, listMethods, listAttrs } = useList<Group>(stateOption)
const { table, editDialog } = listRefs
const { showEdit, getList, del, getParentName, exportData } = listMethods
const { tableAttrs } = listAttrs

const { docMinHeight, showPageHeader, auth } = usePage()
</script>
