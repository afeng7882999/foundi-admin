<template>
  <div ref="moduleRoot" :style="docMinHeight" class="page-system-loginLog fd-page">
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
            <el-form-item label="访问时间" prop="operTime">
              <el-date-picker
                v-model="state.query.operTime"
                :default-time="[new Date('0 0:0:0'), new Date('0 23:59:59')]"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="x"
                range-separator="-"
                start-placeholder="开始日期"
                type="daterange"
                style="width: 280px"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="登录方式" prop="authcTypeDict">
              <el-select
                v-model="state.query.authcTypeDict"
                clearable
                placeholder="请选择登录方式"
                style="width: 150px"
              >
                <el-option
                  v-for="item in state.dicts.sysAuthcType"
                  :key="item.itemKey"
                  :label="item.itemValue"
                  :value="item.itemKey"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="用户账号" prop="userName">
              <el-input v-model="state.query.userName" clearable placeholder="请输入用户账号" style="width: 150px" />
            </el-form-item>
            <el-form-item label="IP地址" prop="ip">
              <el-input v-model="state.query.ip" clearable placeholder="请输入IP地址" style="width: 150px" />
            </el-form-item>
            <el-form-item label="状态" prop="statusDict">
              <el-select v-model="state.query.statusDict" clearable placeholder="请选择状态" style="width: 150px">
                <el-option
                  v-for="item in state.dicts.sysLoginLogStatus"
                  :key="item.itemKey"
                  :label="item.itemValue"
                  :value="item.itemKey"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button plain type="primary" @click="queryList">
                <fd-icon icon="search" class="is-in-btn"></fd-icon>
                查询
              </el-button>
              <el-button @click="resetQuery">
                <fd-icon icon="refresh" class="is-in-btn"></fd-icon>
                清空
              </el-button>
            </el-form-item>
          </div>
        </transition>
      </el-form>
      <div class="fd-page__action">
        <el-button
          v-show="hasAuth('system:loginLog:delete')"
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
          <el-button v-show="hasAuth('system:loginLog:export')" v-waves plain size="medium" @click="exportData()">
            导出数据
          </el-button>
          <el-divider direction="vertical" class="action-divider"></el-divider>
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
        highlight-current-row
        :data="state.data"
        row-key="id"
        @selection-change="onSelectionChange"
        @row-click="onTableRowClick"
      >
        <el-table-column align="left" header-align="left" type="selection" width="40"></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="访问时间"
          prop="operTime"
          width="200"
        >
          <template #default="scope">
            <span>{{ formatTimestamp(scope.row.operTime) }}</span>
          </template>
        </el-table-column>
        <table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="类型"
          prop="typeDict"
          :dicts="state.dicts.sysLoginLogType"
          width="100"
        ></table-column>
        <table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="登录方式"
          prop="authcTypeDict"
          :dicts="state.dicts.sysAuthcType"
        ></table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="用户账号"
          prop="userName"
          width="200"
        >
          <template #header="scope">
            <fd-table-sort-header :column="scope.column" @sort-changed="sortChanged"></fd-table-sort-header>
          </template>
        </el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="IP地址"
          prop="ip"
          width="200"
        >
          <template #header="scope">
            <fd-table-sort-header :column="scope.column" @sort-changed="sortChanged"></fd-table-sort-header>
          </template>
        </el-table-column>
        <table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="地点"
          prop="location"
        ></table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="浏览器"
          prop="browser"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="操作系统"
          prop="os"
        ></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="状态" prop="statusDict">
          <template #default="scope">
            <span>{{ dictVal(state.dicts.sysLoginLogStatus, scope.row.statusDict) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="提示消息"
          prop="message"
        ></el-table-column>
        <el-table-column align="left" fixed="right" header-align="left" label="操作" width="100">
          <template #default="scope">
            <el-tooltip content="详细" placement="top" :show-after="500">
              <el-button
                v-show="hasAuth('system:loginLog:delete')"
                class="fd-tb-act"
                plain
                size="mini"
                type="primary"
                @click="showDetail(scope.$index)"
              >
                <fd-icon icon="view-grid-detail"></fd-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top" :show-after="500">
              <el-button
                v-show="hasAuth('system:loginLog:delete')"
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
    <el-backtop></el-backtop>
    <detail v-if="state.detailShow" ref="detailDialog" @navigate="onDetailNavigate"></detail>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SystemLoginLog'
}
</script>

<script setup lang="ts">
import useList from '@/components/crud/use-list'
import {
  loginLogFields,
  loginLogDicts,
  loginLogQuery,
  loginLogList,
  loginLogDel,
  loginLogExport,
  ILoginLog
} from '@/api/system/login-log'
import Detail from './detail.vue'
import useExpandTransition from '@/components/transition/use-expand-transition'
import TableColumn from '@/components/table-column/table-column.vue'
import useRowFocus from '@/components/table/use-row-focus'
import { nextTick, ref } from 'vue'
import { formatTimestamp } from '@/utils/time'
import usePage from '@/components/crud/use-page'

const pageTable = ref()

const stateOption = {
  idField: loginLogFields.idField,
  listApi: loginLogList,
  delApi: loginLogDel,
  exportApi: loginLogExport,
  dicts: loginLogDicts,
  query: loginLogQuery,
  currentId: ''
}

const { mixRefs, mixState: state, mixMethods } = useList(stateOption)
const { queryForm, table, detailDialog } = mixRefs
const {
  queryList,
  resetQuery,
  toggleQueryForm,
  dictVal,
  showDetail,
  sortChanged,
  pageChange,
  sizeChange,
  del,
  onSelectionChange,
  exportData,
  onAfterGetList
} = mixMethods

const { docMinHeight, showPageHeader, hasAuth } = usePage()

const { expandEnter, expandAfterEnter, expandBeforeLeave } = useExpandTransition()

const { highlightCurrent } = useRowFocus(table, pageTable)

const onTableRowClick = (row: ILoginLog) => {
  setCurrentData(row?.id)
}

onAfterGetList(async () => {
  if (state.currentId) {
    setCurrentData(state.currentId)
  }
})

const onDetailNavigate = (id: string) => {
  const current = state.data.find((d) => d.id === id) as ILoginLog
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
