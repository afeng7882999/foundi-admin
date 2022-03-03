<template>
  <div ref="moduleRoot" :style="docMinHeight" class="page-system-role fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <fd-split-pane :default-pos="500" shrink="left">
      <template #left>
        <div class="fd-page__form">
          <el-form ref="queryForm" :inline="true" :model="state.query" @keyup.enter="queryList()">
            <transition name="expand" @enter="expandEnter" @after-enter="expandAfterEnter" @before-leave="expandBeforeLeave">
              <div v-show="state.queryFormShow" class="fd-page__query">
                <el-form-item label="角色名称" prop="name">
                  <el-input v-model="state.query.name" clearable placeholder="请输入角色名称" />
                </el-form-item>
                <el-form-item label="角色标识" prop="label">
                  <el-input v-model="state.query.label" clearable placeholder="请输入角色标识" />
                </el-form-item>
                <el-form-item>
                  <el-button plain type="primary" @click="queryList">
                    <fd-icon class="is-in-btn" icon="search"></fd-icon>
                    查询
                  </el-button>
                  <el-button @click="resetQuery">重置</el-button>
                </el-form-item>
              </div>
            </transition>
          </el-form>
          <div class="fd-page__action">
            <el-button
              v-show="hasAuth('system:role:delete')"
              v-waves
              :disabled="state.selectedNodes.length <= 0"
              plain
              type="danger"
              @click="del()"
            >
              <fd-icon class="is-in-btn" icon="delete"></fd-icon>
              删除
            </el-button>
            <div class="action-right">
              <el-button v-show="hasAuth('system:role:add')" v-waves plain type="primary" @click="showEdit()">新增</el-button>
              <el-button v-show="hasAuth('system:role:export')" v-waves @click="exportData()">导出数据</el-button>
              <el-divider class="action-divider" direction="vertical"></el-divider>
              <el-tooltip :content="state.queryFormShow ? '隐藏查询表单' : '显示查询表单'" :show-after="500" effect="dark" placement="top">
                <el-badge :hidden="state.queryFormShow || !state.queryLen" :value="state.queryLen" class="action-badge">
                  <fd-icon-button class="action-query-toggle" icon="search" @click="toggleQueryForm()"></fd-icon-button>
                </el-badge>
              </el-tooltip>
            </div>
          </div>
        </div>
        <div class="fd-page__table is-bordered">
          <el-table v-loading="state.loading" v-bind="tableAttrs" @row-click="onTableRowClick">
            <el-table-column align="center" header-align="center" type="selection" width="40"></el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              align="center"
              header-align="center"
              label="角色名称"
              prop="name"
            ></el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              align="center"
              header-align="center"
              label="角色标识"
              prop="label"
            ></el-table-column>
            <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="数据范围" prop="dataScopeDict">
              <template #default="scope">
                <span>{{ dictVal(state.dicts.sysRoleDataScope, scope.row.dataScopeDict) }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" fixed="right" header-align="center" label="操作" width="100">
              <template #default="scope">
                <el-tooltip :show-after="500" content="编辑" placement="top">
                  <el-button
                    v-show="hasAuth('system:role:edit')"
                    class="tb-act-btn"
                    plain
                    size="small"
                    type="success"
                    @click="showEdit(scope.row.id)"
                  >
                    <fd-icon icon="write"></fd-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip :show-after="500" content="删除" placement="top">
                  <el-button
                    v-show="hasAuth('system:role:delete')"
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
          <el-pagination v-bind="paginationAttrs"></el-pagination>
        </div>
      </template>
      <template #right>
        <detail ref="detailDialog"></detail>
      </template>
    </fd-split-pane>
    <el-backtop></el-backtop>
  </div>
  <edit v-if="state.editShow" ref="editDialog" @refresh-data-list="getList"></edit>
</template>

<script lang="ts">
export default {
  name: 'SystemRole'
}
</script>

<script setup lang="ts">
import useList from '@/components/crud/use-list'
import { Role, roleDel, roleDicts, roleExport, roleFields, roleList, roleQuery } from '@/api/system/role'
import Edit from './edit.vue'
import Detail from './detail.vue'
import useExpandTransition from '@/hooks/use-expand-transition'
import FdSplitPane from '@/components/split-pane/index.vue'
import { groupList, Group } from '@/api/system/group'
import { Menu, menuList } from '@/api/system/menu'
import usePage from '@/components/page/use-page'

const stateOption = {
  idField: roleFields.idField,
  listApi: roleList,
  delApi: roleDel,
  exportApi: roleExport,
  dicts: roleDicts,
  query: roleQuery,
  groupList: [] as Group[],
  menuList: [] as Menu[],
  currentId: '',
  tableRowSelectable: true
}

const { mixRefs, mixState: state, mixMethods, mixAttrs } = useList<Role>(stateOption)
const { queryForm, editDialog, detailDialog } = mixRefs
const { getList, queryList, resetQuery, del, dictVal, exportData, showEdit, toggleQueryForm, onBeforeGetList, onAfterGetList } = mixMethods
const { tableAttrs, paginationAttrs, detailAttrs } = mixAttrs

const { docMinHeight, showPageHeader, hasAuth } = usePage()

const { expandEnter, expandAfterEnter, expandBeforeLeave } = useExpandTransition()

onBeforeGetList(async () => {
  const { data: menus } = await menuList()
  const { data: groups } = await groupList()
  state.menuList = menus
  state.groupList = groups
  return true
})

const onTableRowClick = (row: Role) => {
  setCurrentData(row)
}

onAfterGetList(async () => {
  if (state.currentId) {
    const current = state.data.find((d) => d.id === state.currentId) as Role
    setCurrentData(current)
  }
})

const setCurrentData = (role: Role) => {
  if (!role) {
    state.currentId = ''
    ;(mixRefs.detailDialog.value as any).close()
    return
  }
  state.currentId = role.id
  ;(mixRefs.detailDialog.value as any).open([role], 0, {
    dicts: state.dicts,
    menuList: state.menuList,
    groupList: state.groupList
  })
}
</script>
