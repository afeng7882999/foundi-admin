<template>
  <div ref="moduleRoot" :style="docMinHeight" class="page-system-config fd-page">
    <!--  系统配置管理 -->
    <fd-page-header v-show="showPageHeader"></fd-page-header>
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
              <el-select
                v-model="state.query.configTypeDict"
                multiple
                clearable
                placeholder="请选择配置分类"
                style="width: 200px"
              >
                <el-option
                  v-for="item in state.dicts.sysConfigType"
                  :key="item.itemKey"
                  :label="item.itemValue"
                  :value="item.itemKey"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="键" prop="configKey">
              <el-input v-model="state.query.configKey" clearable placeholder="请输入键" style="width: 200px" />
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
          v-show="hasAuth('system:config:delete')"
          v-waves
          :disabled="state.selectedNodes.length <= 0"
          plain
          size="medium"
          type="danger"
          @click="del()"
        >
          <fd-icon class="is-in-btn" icon="delete"></fd-icon>
          删除
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
            <fd-icon class="is-in-btn" icon="plus"></fd-icon>
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
            <el-badge :hidden="state.queryFormShow || !state.queryLen" :value="state.queryLen" class="action-badge">
              <fd-icon-button class="action-query-toggle" icon="search" @click="toggleQueryForm()"></fd-icon-button>
            </el-badge>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div ref="pageTable" class="fd-page__table is-bordered">
      <el-table
        ref="table"
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
          width="200"
        >
          <template #default="scope">
            <span>{{ formatTimestamp(scope.row.createAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" header-align="center" label="操作" width="130">
          <template #default="scope">
            <el-tooltip :show-after="500" content="详细" placement="top">
              <el-button
                v-show="hasAuth('system:config:list')"
                class="fd-tb-act fd-tb-act-detail"
                plain
                size="mini"
                type="primary"
                @click="showDetail(scope.$index)"
              >
                <fd-icon icon="view-grid-detail"></fd-icon>
              </el-button>
            </el-tooltip>
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
                @click="del(scope.row, scope.row.configKey)"
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
    <el-backtop></el-backtop>
    <detail
      v-if="state.detailShow"
      ref="detailDialog"
      @open-edit-dialog="showEdit(state.currentId)"
      @navigate="onDetailNavigate"
    ></detail>
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
import { nextTick, ref } from 'vue'
import useRow from '@/components/table/use-row'
import { formatTimestamp } from '@/utils/time'
import usePage from '@/components/crud/use-page'

const stateOption = {
  idField: configFields.idField,
  listApi: configList,
  delApi: configDel,
  exportApi: configExport,
  dicts: configDicts,
  query: configQuery,
  currentId: ''
}

const pageTable = ref()

const { mixRefs, mixState: state, mixMethods } = useList(stateOption)
const { queryForm, table, editDialog, detailDialog } = mixRefs
const {
  getList,
  pageChange,
  sizeChange,
  queryList,
  resetQuery,
  del,
  dictVal,
  exportData,
  showEdit,
  showDetail,
  onSelectionChange,
  toggleQueryForm,
  onAfterGetList
} = mixMethods

const { docMinHeight, showPageHeader, hasAuth } = usePage()

const { expandEnter, expandAfterEnter, expandBeforeLeave } = useExpandTransition()

const { highlightCurrent } = useRow(table, pageTable)

const onTableRowClick = (row: IConfig) => {
  setCurrentData(row?.id)
}

onAfterGetList(async () => {
  if (state.currentId) {
    setCurrentData(state.currentId)
  }
})

const onDetailNavigate = (id: string) => {
  const current = state.data.find((d) => d.id === id) as IConfig
  ;(table.value as any).setCurrentRow(current)
  setCurrentData(id)
}

const setCurrentData = (id: string) => {
  if (!id) {
    state.currentId = ''
  } else {
    state.currentId = id
  }
  nextTick(() => {
    highlightCurrent()
  })
}
</script>
