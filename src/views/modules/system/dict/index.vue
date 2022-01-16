<template>
  <div ref="moduleRoot" :style="pageMinHeight" class="page-system-dict fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <fd-split-pane :default-pos="450" shrink="left">
      <template #left>
        <div class="fd-page__form">
          <el-form ref="queryForm" :inline="true" :model="state.query" size="medium" @keyup.enter="queryList()">
            <transition
              name="expand"
              @enter="expandEnter"
              @after-enter="expandAfterEnter"
              @before-leave="expandBeforeLeave"
            >
              <div v-show="state.queryFormShow" class="fd-page__query">
                <el-form-item label="字典名" prop="name">
                  <el-input v-model="state.query.name" clearable placeholder="请输入字典名" />
                </el-form-item>
                <el-form-item label="字典中文名" prop="nameCn">
                  <el-input v-model="state.query.nameCn" clearable placeholder="请输入字典中文名" />
                </el-form-item>
                <el-form-item>
                  <el-button plain type="primary" @click="queryList">
                    <fd-icon class="is-in-btn" icon="search" plain></fd-icon>
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
            <el-button
              v-show="hasAuth('system:dict:delete')"
              v-waves
              :disabled="state.selectedNodes.length <= 0"
              plain
              size="medium"
              type="danger"
              @click="del()"
            >
              <fd-icon class="is-in-btn" icon="delete"></fd-icon>
              批量删除
            </el-button>
            <div class="action-right">
              <el-button v-show="hasAuth('system:dict:add')" v-waves plain type="primary" @click="showEdit()">
                新增
              </el-button>
              <el-button v-show="hasAuth('system:dict:export')" v-waves @click="exportData()">导出数据</el-button>
              <el-divider class="action-divider" direction="vertical"></el-divider>
              <el-tooltip
                :content="state.queryFormShow ? '隐藏查询表单' : '显示查询表单'"
                :show-after="500"
                effect="dark"
                placement="top"
              >
                <fd-icon-button
                  :class="state.queryFormShow ? 'expanded' : ''"
                  class="action-toggle-btn"
                  icon="double-down"
                  @click="toggleQueryForm()"
                ></fd-icon-button>
              </el-tooltip>
            </div>
          </div>
        </div>
        <div class="fd-page__table is-bordered">
          <el-table
            v-loading="state.loading"
            :data="state.data"
            highlight-current-row
            row-key="id"
            @selection-change="onSelectionChange"
            @row-click="onTableRowClick"
          >
            <el-table-column align="left" header-align="left" type="selection" width="40"></el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
              label="字典名"
              prop="name"
            ></el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
              label="字典中文名"
              prop="nameCn"
            ></el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
              label="备注信息"
              prop="remarks"
            ></el-table-column>
            <el-table-column align="center" fixed="right" header-align="center" label="操作" width="200">
              <template #default="scope">
                <el-tooltip :content="`编辑字典&quot;${scope.row.name}&quot;的条目`" :show-after="500" placement="top">
                  <el-button
                    v-show="hasAuth('system:dict:edit')"
                    class="fd-tb-act"
                    plain
                    size="mini"
                    type="success"
                    @click="handleEdit(scope.row)"
                  >
                    <fd-icon icon="list-two"></fd-icon>
                    <span class="fd-tb-act__caption">编辑条目</span>
                  </el-button>
                </el-tooltip>
                <el-tooltip :show-after="500" content="编辑" placement="top">
                  <el-button
                    v-show="hasAuth('system:dict:edit')"
                    class="fd-tb-act"
                    plain
                    size="mini"
                    type="success"
                    @click="showEdit(scope.row.id)"
                  >
                    <fd-icon icon="write"></fd-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip :show-after="500" content="删除" placement="top">
                  <el-button
                    v-show="hasAuth('system:dict:delete')"
                    class="fd-tb-act"
                    plain
                    size="mini"
                    type="danger"
                    @click="del(scope.row, scope.row.name)"
                  >
                    <fd-icon icon="close"></fd-icon>
                  </el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            :background="true"
            :current-page="state.current"
            :page-count="state.total"
            :page-size="state.size"
            :page-sizes="[10, 20, 50, 100, 200]"
            :total="state.count"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="pageChange"
            @size-change="sizeChange"
          ></el-pagination>
        </div>
      </template>
      <template #right>
        <detail ref="detailDialog"></detail>
      </template>
    </fd-split-pane>
    <el-backtop></el-backtop>
    <edit v-if="state.editShow" ref="editDialog" @refresh-data-list="getList"></edit>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SystemDict'
}
</script>

<script setup lang="ts">
import useList from '@/components/crud/use-list'
import { dictDel, dictExport, dictFields, dictList, dictQuery, IDict } from '@/api/system/dict'
import Edit from './edit.vue'
import Detail from './detail.vue'
import useExpandTransition from '@/components/transition/use-expand-transition'
import { AnyObject } from '@/utils'
import { useRouter } from 'vue-router'
import FdSplitPane from '@/components/split-pane/index.vue'

const stateOption = {
  idField: dictFields.idField,
  listApi: dictList,
  delApi: dictDel,
  exportApi: dictExport,
  query: dictQuery,
  currentId: ''
}

const router = useRouter()

const { mixRefs, mixState: state, mixComputed, mixMethods } = useList(stateOption)
const { queryForm, editDialog, detailDialog } = mixRefs
const { pageMinHeight, showPageHeader } = mixComputed
const {
  getList,
  pageChange,
  sizeChange,
  queryList,
  resetQuery,
  del,
  hasAuth,
  exportData,
  showEdit,
  onSelectionChange,
  toggleQueryForm
} = mixMethods

const { expandEnter, expandAfterEnter, expandBeforeLeave } = useExpandTransition()

// edit items of current dict
const handleEdit = async (row: AnyObject) => {
  if (row) {
    const id = row.id
    const name = row.name
    // path: system/dict-item/:id
    await mixMethods.setViewTitle(`/system/dictItem/${id}`, `字典 ${name} 条目修改`)
    await router.push({ name: 'SystemDictItem', params: { id: id } })
  }
}

const onTableRowClick = (row: IDict) => {
  setCurrentData(row)
}

mixMethods.onAfterGetList(async () => {
  if (state.currentId) {
    const current = state.data.find((d) => d.id === state.currentId) as IDict
    await setCurrentData(current)
  }
})

const setCurrentData = async (dict: IDict) => {
  if (!dict) {
    state.currentId = ''
    ;(mixRefs.detailDialog.value as any).close()
    return
  }
  state.currentId = dict.id
  ;(mixRefs.detailDialog.value as any).open([dict], 0)
}
</script>
