<template>
  <div ref="moduleRoot" :style="docMinHeight" class="page-system-dict fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <fd-split-pane :default-pos="450" shrink="left">
      <template #left>
        <div class="fd-page__form">
          <el-form ref="queryForm" :inline="true" :model="state.query" @keyup.enter="queryList()">
            <transition name="expand" @enter="expandEnter" @after-enter="expandAfterEnter" @before-leave="expandBeforeLeave">
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
                  <el-button @click="resetQuery">重置</el-button>
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
              type="danger"
              @click="del()"
            >
              <fd-icon class="is-in-btn" icon="delete"></fd-icon>
              删除
            </el-button>
            <div class="action-right">
              <el-button v-show="hasAuth('system:dict:add')" v-waves plain type="primary" @click="showEdit()">新增</el-button>
              <el-button v-show="hasAuth('system:dict:export')" v-waves @click="exportData()">导出数据</el-button>
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
            <el-table-column align="left" header-align="left" type="selection" width="40"></el-table-column>
            <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="字典名" prop="name"></el-table-column>
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
                    class="tb-act-btn"
                    plain
                    size="small"
                    type="success"
                    @click="handleEdit(scope.row)"
                  >
                    <fd-icon icon="list-two"></fd-icon>
                    <span class="tb-act-btn__caption">编辑条目</span>
                  </el-button>
                </el-tooltip>
                <el-tooltip :show-after="500" content="编辑" placement="top">
                  <el-button
                    v-show="hasAuth('system:dict:edit')"
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
                    v-show="hasAuth('system:dict:delete')"
                    class="tb-act-btn"
                    plain
                    size="small"
                    type="danger"
                    @click="del(scope.row, scope.row.name)"
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
import { dictDel, dictExport, dictFields, dictList, dictQuery, Dict } from '@/api/system/dict'
import Edit from './edit.vue'
import Detail from './detail.vue'
import useExpandTransition from '@/hooks/use-expand-transition'
import { useRouter } from 'vue-router'
import FdSplitPane from '@/components/split-pane/index.vue'
import usePage from '@/components/crud/use-page'

const stateOption = {
  idField: dictFields.idField,
  listApi: dictList,
  delApi: dictDel,
  exportApi: dictExport,
  query: dictQuery,
  currentId: '',
  tableRowSelectable: true
}

const router = useRouter()

const { mixRefs, mixState: state, mixMethods, mixAttrs } = useList<Dict>(stateOption)
const { queryForm, editDialog, detailDialog } = mixRefs
const { getList, queryList, resetQuery, del, exportData, showEdit, toggleQueryForm } = mixMethods
const { paginationAttrs, tableAttrs, detailAttrs } = mixAttrs

const { docMinHeight, showPageHeader, hasAuth, setViewTitle } = usePage()

const { expandEnter, expandAfterEnter, expandBeforeLeave } = useExpandTransition()

// edit items of current dict
const handleEdit = async (row: Dict) => {
  if (row) {
    const id = row.id
    const name = row.name
    // path: system/dict-item/:id
    await setViewTitle(`/system/dictItem/${id}`, `字典 ${name} 条目修改`)
    await router.push({ name: 'SystemDictItem', params: { id: id } })
  }
}

const onTableRowClick = (row: Dict) => {
  setCurrentData(row)
}

mixMethods.onAfterGetList(async () => {
  if (state.currentId) {
    const current = state.data.find((d) => d.id === state.currentId) as Dict
    await setCurrentData(current)
  }
})

const setCurrentData = async (dict: Dict) => {
  if (!dict) {
    state.currentId = ''
    ;(detailDialog.value as any).close()
    return
  }
  state.currentId = dict.id
  ;(detailDialog.value as any).open([dict], 0)
}
</script>
