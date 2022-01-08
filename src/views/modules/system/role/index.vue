<template>
  <div ref="moduleRoot" :style="pageMinHeight" class="page-role fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <fd-split-pane :default-pos="550" shrink="left">
      <template #left>
        <div class="fd-page__form">
          <el-form ref="queryForm" :inline="true" :model="query" size="medium" @keyup.enter="queryList()">
            <transition name="expand" @enter="expandEnter" @after-enter="expandAfterEnter" @before-leave="expandBeforeLeave">
              <div v-show="queryFormShow" class="fd-page__query">
                <el-form-item label="角色名称" prop="name">
                  <el-input v-model="query.name" clearable placeholder="请输入角色名称" />
                </el-form-item>
                <el-form-item label="角色标识" prop="label">
                  <el-input v-model="query.label" clearable placeholder="请输入角色标识" />
                </el-form-item>
                <el-form-item>
                  <el-button plain type="primary" @click="queryList">
                    <fd-icon class="is-in-btn" icon="search"></fd-icon>
                    查询
                  </el-button>
                  <el-button @click="resetQuery">
                    <fd-icon class="is-in-btn" icon="refresh"></fd-icon>
                    清空
                  </el-button>
                </el-form-item>
              </div>
            </transition>
          </el-form>
          <div class="fd-page__action">
            <el-button v-show="hasAuth('system:role:delete')" v-waves :disabled="selectedNodes.length <= 0" plain size="medium" type="danger" @click="del()">
              <fd-icon class="is-in-btn" icon="delete"></fd-icon>
              批量删除
            </el-button>
            <div class="action-right">
              <el-button v-show="hasAuth('system:role:add')" v-waves plain size="medium" type="primary" @click="showEdit()">新增</el-button>
              <el-button v-show="hasAuth('system:role:export')" v-waves size="medium" @click="exportData()">导出数据</el-button>
              <el-divider class="action-divider" direction="vertical"></el-divider>
              <el-tooltip :content="queryFormShow ? '隐藏查询表单' : '显示查询表单'" :show-after="500" effect="dark" placement="top">
                <fd-icon-button :class="queryFormShow ? 'expanded' : ''" class="action-toggle-btn" icon="double-down" @click="toggleQueryForm()"></fd-icon-button>
              </el-tooltip>
            </div>
          </div>
        </div>
        <div class="fd-page__table border">
          <el-table v-loading="loading" :data="data" highlight-current-row row-key="id" @selection-change="onSelectionChange" @row-click="onTableRowClick">
            <el-table-column align="center" header-align="center" type="selection" width="40"></el-table-column>
            <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="角色名称" prop="name"></el-table-column>
            <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="角色标识" prop="label"></el-table-column>
            <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="数据范围" prop="dataScopeDict">
              <template #default="scope">
                <span>{{ dictVal(dicts.sysRoleDataScope, scope.row.dataScopeDict) }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" fixed="right" header-align="center" label="操作" width="100">
              <template #default="scope">
                <el-tooltip :show-after="500" content="编辑" placement="top">
                  <el-button v-show="hasAuth('system:role:edit')" class="fd-tb-act fd-tb-act-edit" plain size="mini" type="success" @click="showEdit(scope.row.id)">
                    <fd-icon icon="write"></fd-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip :show-after="500" content="删除" placement="top">
                  <el-button v-show="hasAuth('system:role:delete')" class="fd-tb-act fd-tb-act-delete" plain size="mini" type="danger" @click="del(scope.row, scope.row.k)">
                    <fd-icon icon="close"></fd-icon>
                  </el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination :background="true" :current-page="current" :page-count="total" :page-size="size" :page-sizes="[10, 20, 50, 100, 200]" :total="count" layout="total, sizes, prev, pager, next, jumper" @current-change="pageChange" @size-change="sizeChange"></el-pagination>
        </div>
      </template>
      <template #right>
        <detail ref="detailDialog"></detail>
      </template>
    </fd-split-pane>
    <el-backtop></el-backtop>
  </div>
  <edit v-if="editShow" ref="editDialog" @refresh-data-list="getList"></edit>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import useList from '@/components/crud/use-list'
import { IRole, roleDel, roleDicts, roleExport, roleFields, roleList, roleQuery } from '@/api/system/role'
import Edit from './edit.vue'
import Detail from './detail.vue'
import useExpandTransition from '@/components/transition/use-expand-transition'
import FdSplitPane from '@/components/split-pane/index.vue'
import { groupList, IGroup } from '@/api/system/group'
import { IMenu, menuList } from '@/api/system/menu'

export default defineComponent({
  name: 'SystemRole',
  components: { FdSplitPane, Edit, Detail },
  setup() {
    const stateOption = {
      idField: roleFields.idField,
      listApi: roleList,
      delApi: roleDel,
      exportApi: roleExport,
      dicts: roleDicts,
      query: roleQuery,

      groupList: [] as IGroup[],
      menuList: [] as IMenu[],
      currentId: ''
    }

    const { mixRefs, mixState, mixComputed, mixMethods } = useList(stateOption)

    mixMethods.onBeforeGetList(async () => {
      const { data: menus } = await menuList()
      const { data: groups } = await groupList()
      mixState.menuList = menus
      mixState.groupList = groups
      return true
    })

    const onTableRowClick = (row: IRole) => {
      setCurrentData(row)
    }

    mixMethods.onAfterGetList(async () => {
      if (mixState.currentId) {
        const current = mixState.data.find((d) => d.id === mixState.currentId) as IRole
        setCurrentData(current)
      }
    })

    const setCurrentData = (role: IRole) => {
      if (!role) {
        mixState.currentId = ''
        ;(mixRefs.detailDialog.value as any).close()
        return
      }
      mixState.currentId = role.id
      ;(mixRefs.detailDialog.value as any).open([role], 0, {
        dicts: mixState.dicts,
        menuList: mixState.menuList,
        groupList: mixState.groupList
      })
    }

    return {
      ...mixRefs,
      ...toRefs(mixState),
      ...mixComputed,
      ...mixMethods,
      ...useExpandTransition(),
      onTableRowClick
    }
  }
})
</script>
