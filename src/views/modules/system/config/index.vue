<template>
  <div ref="moduleRoot" :style="pageMinHeight" class="page-system-config fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <fd-split-pane :default-pos="400" shrink="left">
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
                <el-form-item label="配置分类" prop="configTypeDict">
                  <el-select v-model="state.query.configTypeDict" multiple clearable placeholder="请选择配置分类">
                    <el-option
                      v-for="item in state.dicts.sysConfigType"
                      :key="item.itemKey"
                      :label="item.itemValue"
                      :value="item.itemKey"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="键" prop="configKey">
                  <el-input v-model="state.query.configKey" clearable placeholder="请输入键" />
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
            <el-button
              v-show="hasAuth('system:config:delete')"
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
              <el-button
                v-show="hasAuth('system:config:add')"
                v-waves
                type="primary"
                plain
                size="medium"
                @click="showEdit()"
              >
                新增
              </el-button>
              <el-button v-show="hasAuth('system:config:export')" v-waves size="medium" @click="exportData()">
                导出数据
              </el-button>
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
            <el-table-column align="center" header-align="center" type="selection" width="40"></el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
              label="启用"
              prop="enabled"
              width="60"
            >
              <template #default="scope">
                <el-tag v-if="scope.row.enabled" size="mini" type="success">启用</el-tag>
                <el-tag v-else size="mini" type="danger">禁用</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
              label="配置分类"
              prop="configTypeDict"
              width="150"
            >
              <template #default="scope">
                <span>{{ dictVal(state.dicts.sysConfigType, scope.row.configTypeDict) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
              label="键"
              prop="configKey"
              width="150"
            ></el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
              label="值"
              prop="configValue"
              width="600"
            ></el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
              label="备注"
              prop="remark"
            ></el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
              label="创建时间"
              prop="createAt"
              width="160"
            ></el-table-column>
            <el-table-column align="center" fixed="right" header-align="center" label="操作" width="100">
              <template #default="scope">
                <el-tooltip :show-after="500" content="编辑" placement="top">
                  <el-button
                    v-show="hasAuth('system:config:edit')"
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
                    v-show="hasAuth('system:config:delete')"
                    class="fd-tb-act"
                    plain
                    size="mini"
                    type="danger"
                    @click="del(scope.row, scope.row.k)"
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
  name: 'SystemConfig'
}
</script>

<script setup lang="ts">
import useList from '@/components/crud/use-list'
import {
  configDel,
  configDicts,
  configExport,
  configFields,
  configList,
  configQuery,
  IConfig
} from '@/api/system/config'
import Edit from './edit.vue'
import Detail from './detail.vue'
import useExpandTransition from '@/components/transition/use-expand-transition'
import FdSplitPane from '@/components/split-pane/index.vue'

const stateOption = {
  idField: configFields.idField,
  listApi: configList,
  delApi: configDel,
  exportApi: configExport,
  dicts: configDicts,
  query: configQuery,
  currentId: ''
}

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
  dictVal,
  hasAuth,
  exportData,
  showEdit,
  onSelectionChange,
  toggleQueryForm
} = mixMethods

const { expandEnter, expandAfterEnter, expandBeforeLeave } = useExpandTransition()

const onTableRowClick = (row: IConfig) => {
  setCurrentData(row)
}

mixMethods.onAfterGetList(async () => {
  if (state.currentId) {
    const current = state.data.find((d) => d.id === state.currentId) as IConfig
    await setCurrentData(current)
  }
})

const setCurrentData = async (current: IConfig) => {
  if (!current) {
    state.currentId = ''
    ;(mixRefs.detailDialog.value as any).close()
    return
  }
  state.currentId = current.id
  ;(mixRefs.detailDialog.value as any).open([current], 0, { dicts: state.dicts })
}
</script>
