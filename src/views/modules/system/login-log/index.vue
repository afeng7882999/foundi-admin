<template>
  <div ref="moduleRoot" :style="docMinHeight" class="page-system-loginLog fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <el-form ref="queryForm" :inline="true" :model="state.query" size="medium" @keyup.enter="queryList()">
        <transition name="expand" @enter="expandEnter" @after-enter="expandAfterEnter" @before-leave="expandBeforeLeave">
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
              <el-select v-model="state.query.authcTypeDict" clearable placeholder="请选择登录方式" style="width: 150px">
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
          <el-button v-show="hasAuth('system:loginLog:export')" v-waves plain size="medium" @click="exportData()">导出数据</el-button>
          <el-divider direction="vertical" class="action-divider"></el-divider>
          <el-tooltip :content="state.queryFormShow ? '隐藏查询表单' : '显示查询表单'" :show-after="500" effect="dark" placement="top">
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
        <fd-col typ="selection"></fd-col>
        <fd-col typ="datetime" label="访问时间" prop="operTime"></fd-col>
        <fd-col typ="dict" label="类型" prop="typeDict" align="left" :dict="state.dicts.sysLoginLogType" width="50"></fd-col>
        <fd-col typ="dict" label="登录方式" prop="authcTypeDict" :dict="state.dicts.sysAuthcType" width="100"></fd-col>
        <fd-col label="用户账号" prop="userName" sortable width="150" @sort-changed="sortChanged"></fd-col>
        <fd-col label="IP地址" prop="ip" width="130" sortable @sort-changed="sortChanged"></fd-col>
        <fd-col label="地点" prop="location" width="150"></fd-col>
        <fd-col label="浏览器" prop="browser" width="150"></fd-col>
        <fd-col label="操作系统" prop="os" width="150"></fd-col>
        <fd-col typ="dict" label="状态" prop="statusDict" :dict="state.dicts.sysLoginLogStatus" width="50"></fd-col>
        <fd-col label="提示消息" prop="message"></fd-col>
        <fd-col typ="act" detail="system:loginLog:list" del="system:loginLog:delete" width="100" @detail="showDetail" @del="del"></fd-col>
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
import { loginLogFields, loginLogDicts, loginLogQuery, loginLogList, loginLogDel, loginLogExport, ILoginLog } from '@/api/system/login-log'
import Detail from './detail.vue'
import useExpandTransition from '@/components/transition/use-expand-transition'
import useRowFocus from '@/components/table/use-row-focus'
import { nextTick, ref } from 'vue'
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
  showDetail: _showDetail,
  sortChanged,
  pageChange,
  sizeChange,
  del: _del,
  onSelectionChange,
  exportData,
  onAfterGetList
} = mixMethods

const { docMinHeight, showPageHeader, hasAuth } = usePage()

const { expandEnter, expandAfterEnter, expandBeforeLeave } = useExpandTransition()

const { highlightCurrent } = useRowFocus(table, pageTable)

const showDetail = (row: ILoginLog, idx: number) => {
  _showDetail(idx)
}

const del = (row: ILoginLog, idx: number) => {
  _del(row, row.id)
}

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
