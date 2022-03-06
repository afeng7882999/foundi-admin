<template>
  <div :style="docMinHeight" class="page-system-loginLog fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <fd-split-pane v-model:shrink-all.not="state.queryFormShow" :default-pos="280" shrink="right" :shrink-to-hide="true">
      <template #left>
        <fd-page-query :query-data="state.query" :query-fn="queryList" :reset-fn="resetQuery">
          <fd-item-datetime label="访问时间" prop="operTime" />
          <fd-item-dict label="登录方式" prop="authcTypeDict" :dict="state.dicts.sysAuthcType" />
          <fd-item label="用户账号" prop="userName" />
          <fd-item label="IP地址" prop="ip" />
          <fd-item-dict label="状态" prop="statusDict" :dict="state.dicts.sysLoginLogStatus" />
        </fd-page-query>
      </template>
      <template #right>
        <div class="fd-page__form">
          <fd-page-act
            v-model:queryVisible="state.queryFormShow"
            del="system:loginLog:delete"
            export="system:loginLog:export"
            :query-data="state.query"
            :query-fn="queryList"
            v-bind="pageActAttrs"
            @del="del()"
            @export="exportData"
            @export-all="exportData('all')"
          >
            <template #query>
              <fd-item-datetime prop="operTime" />
              <fd-item-dict prop="statusDict" :dict="state.dicts.sysLoginLogStatus" placeholder="请选择状态" />
            </template>
          </fd-page-act>
        </div>
        <div ref="tableWrapper" class="fd-page__table is-bordered">
          <el-table ref="table" v-loading="state.loading" v-bind="tableAttrs">
            <fd-col-selection />
            <fd-col-datetime label="访问时间" prop="operTime" />
            <fd-col-dict label="类型" prop="typeDict" :dict="state.dicts.sysLoginLogType" width="60" />
            <fd-col-dict label="登录方式" prop="authcTypeDict" :dict="state.dicts.sysAuthcType" width="100" />
            <fd-col label="用户账号" prop="userName" sortable width="150" @sort-changed="sortChanged" />
            <fd-col label="IP地址" prop="ip" width="130" sortable @sort-changed="sortChanged" />
            <fd-col label="地点" prop="location" width="150" />
            <fd-col label="浏览器" prop="browser" width="150" />
            <fd-col label="操作系统" prop="os" width="150" />
            <fd-col-dict label="状态" prop="statusDict" :dict="state.dicts.sysLoginLogStatus" width="60" />
            <fd-col label="提示消息" prop="message" width="100" />
            <fd-col-act
              detail="system:loginLog:list"
              del="system:loginLog:delete"
              header-align="center"
              width="90"
              @detail="showDetail"
              @del="del"
            />
          </el-table>
          <el-pagination v-bind="paginationAttrs"></el-pagination>
        </div>
      </template>
    </fd-split-pane>
    <el-backtop></el-backtop>
    <detail v-if="state.detailShow" ref="detailDialog" v-bind="detailAttrs"></detail>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SystemLoginLog'
}
</script>

<script setup lang="ts">
import useList from '@/components/crud/use-list'
import { loginLogFields, loginLogDicts, loginLogQuery, loginLogList, loginLogDel, loginLogExport, LoginLog } from '@/api/system/login-log'
import Detail from './detail.vue'
import useExpandTransition from '@/hooks/use-expand-transition'
import usePage from '@/components/page/use-page'
import { TableColumn } from '@/components/table/types'
import FdSplitPane from '@/components/split-pane/index.vue'
import FdPageQuery from '@/components/page/page-query.vue'

const stateOption = {
  idField: loginLogFields.idField,
  listApi: loginLogList,
  delApi: loginLogDel,
  exportApi: loginLogExport,
  dicts: loginLogDicts,
  query: loginLogQuery,

  tableColumns: [] as TableColumn[]
}

const { mixRefs, mixState: state, mixMethods, mixAttrs } = useList<LoginLog>(stateOption)
const { queryForm, table, detailDialog } = mixRefs
const { queryList, resetQuery, toggleQueryForm, showDetail: _showDetail, sortChanged, del, exportData } = mixMethods
const { tableAttrs, paginationAttrs, detailAttrs, pageActAttrs } = mixAttrs

const { docMinHeight, showPageHeader, hasAuth } = usePage()

const { expandEnter, expandAfterEnter, expandBeforeLeave } = useExpandTransition()

const showDetail = (row: LoginLog, idx: number) => {
  _showDetail(idx)
}
</script>
