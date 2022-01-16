<template>
  <div ref="moduleRoot" :style="pageMinHeight" class="page-group fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <div class="fd-page__action">
        <el-button v-show="hasAuth('system:group:delete')" v-waves :disabled="selectedNodes.length <= 0" plain size="medium" type="danger" @click="del()">
          <fd-icon class="is-in-btn" icon="delete"></fd-icon>
          批量删除
        </el-button>
        <div class="action-right">
          <el-button v-show="hasAuth('system:group:add')" v-waves plain size="medium" type="primary" @click="showEdit()">新增</el-button>
          <el-button v-show="hasAuth('system:group:export')" v-waves size="medium" @click="exportData()">导出数据</el-button>
        </div>
      </div>
    </div>
    <div class="fd-page__table is-bordered">
      <el-table ref="table" v-loading="loading" :data="data" :default-expand-all="true" :indent="15" row-key="id" style="width: 100%" @select="selectHandle" @select-all="selectAllHandle">
        <el-table-column align="center" header-align="center" type="selection" width="40"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="用户组名称" prop="name"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="上级用户组" prop="parentId">
          <template #default="scope">
            {{ getParentName(scope.row.parentId) }}
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="排序" prop="sort"></el-table-column>
        <el-table-column align="center" fixed="right" header-align="center" label="操作" width="100">
          <template #default="scope">
            <el-tooltip :show-after="500" content="编辑" placement="top">
              <el-button v-show="hasAuth('system:group:edit')" class="fd-tb-act" plain size="mini" type="success" @click="showEdit(scope.row.id)">
                <fd-icon icon="write"></fd-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip :show-after="500" content="删除" placement="top">
              <el-button v-show="hasAuth('system:group:delete')" class="fd-tb-act" plain size="mini" type="danger" @click="del(scope.row, scope.row.k)">
                <fd-icon icon="close"></fd-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-backtop></el-backtop>
    <edit v-if="editShow" ref="editDialog" @refresh-data-list="getList"></edit>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import useTree from '@/components/crud/use-tree'
import { groupDel, groupExport, groupFields, groupList, groupTreeFields, IGroup } from '@/api/system/group'
import Edit from './edit.vue'
import useExpandTransition from '@/components/transition/use-expand-transition'
import { getTreeNode } from '@/utils/data-tree'

export default defineComponent({
  name: 'SystemGroup',
  components: { Edit },
  setup() {
    const stateOption = {
      idField: groupFields.idField,
      treeFields: groupTreeFields,
      listApi: groupList,
      delApi: groupDel,
      exportApi: groupExport
    }

    const { mixRefs, mixState, mixComputed, mixMethods } = useTree(stateOption)

    const getParentName = (parentId: string) => {
      const parent = getTreeNode(mixState.data, (n) => n.id === parentId)
      return parent ? (parent as IGroup).name : '无'
    }

    return {
      ...mixRefs,
      ...toRefs(mixState),
      ...mixComputed,
      ...mixMethods,
      ...useExpandTransition(),
      getParentName
    }
  }
})
</script>
