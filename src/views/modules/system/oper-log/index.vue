<template>
  <div ref="pageRoot" :style="docMinHeight" class="page-operLog fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <el-form ref="queryForm" :inline="true" :model="state.query" @keyup.enter="queryList()">
        <transition name="expand" @enter="expandEnter" @after-enter="expandAfterEnter" @before-leave="expandBeforeLeave">
          <div v-show="state.queryFormShow" class="fd-page__query">
            <el-form-item label="模块" prop="title">
              <el-input v-model="state.query.title" clearable placeholder="请输入模块标题" style="width: 150px" />
            </el-form-item>
            <el-form-item label="方法" prop="method">
              <el-input v-model="state.query.method" clearable placeholder="请输入方法名称" style="width: 150px" />
            </el-form-item>
            <el-form-item label="账号" prop="operUserName">
              <el-input v-model="state.query.operUserName" clearable placeholder="请输入账号" style="width: 150px" />
            </el-form-item>
            <el-form-item label="IP" prop="operIp">
              <el-input v-model="state.query.operIp" clearable placeholder="请输入IP" style="width: 150px" />
            </el-form-item>
            <el-form-item label="时间" prop="operTime" style="height: 36px">
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
            <el-form-item>
              <el-button plain type="primary" @click="queryList()">
                <fd-icon class="is-in-btn" icon="search"></fd-icon>
                查询
              </el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-form-item>
          </div>
        </transition>
      </el-form>
      <div class="fd-page-act">
        <el-button
          v-show="hasAuth('system:operLog:delete')"
          v-waves
          :disabled="state.selectedNodes.length <= 0"
          plain
          type="danger"
          @click="del()"
        >
          <fd-icon class="is-in-btn" icon="delete"></fd-icon>
          删除
        </el-button>
        <el-divider class="action-divider" direction="vertical"></el-divider>
        <el-button v-show="hasAuth('system:operLog:export')" v-waves @click="exportData()">导出数据</el-button>
        <div class="fd-page-act__right">
          <el-form v-show="!state.queryFormShow" ref="queryFormQuick" :inline="true" :model="state.query" @keyup.enter="queryList()">
            <el-form-item label="时间" prop="operTime" style="height: 36px">
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
            <el-form-item>
              <el-button plain type="primary" @click="queryList()">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
          <el-divider class="action-divider" direction="vertical"></el-divider>
          <el-tooltip :content="state.queryFormShow ? '隐藏查询表单' : '显示查询表单'" :show-after="500" effect="dark" placement="top">
            <el-badge :hidden="state.queryFormShow || !state.queryLen" :value="state.queryLen" class="action-badge">
              <fd-icon-button class="action-icon-btn" icon="search-more" @click="toggleQueryForm()"></fd-icon-button>
            </el-badge>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div ref="tableWrapper" class="fd-page__table is-bordered">
      <el-table ref="table" v-loading="state.loading" v-bind="tableAttrs">
        <el-table-column align="left" header-align="left" type="selection" width="40"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="时间" prop="operTime" width="200">
          <template #default="scope">
            {{ formatTimestamp(scope.row.operTime) }}
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="请求URL" prop="operUrl" width="400">
          <template #header="scope">
            <fd-table-sort-header :column="scope.column" @sort-changed="sortChanged"></fd-table-sort-header>
          </template>
        </el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="模块"
          prop="title"
          width="150"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="方法"
          prop="method"
          width="400"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="请求方式"
          prop="requestMethod"
        ></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="操作状态" prop="statusDict">
          <template #default="scope">
            <span>{{ dictVal(state.dicts.sysOperLogStatus, scope.row.statusDict) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="ID"
          prop="operUserId"
          width="150"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="账号"
          prop="operUserName"
          width="150"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="角色"
          prop="operUserRoles"
          width="150"
        ></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="用户组" prop="groupName"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="IP" prop="operIp"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="地点" prop="operLocation"></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="请求参数"
          prop="operParam"
          width="400"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="返回参数"
          prop="jsonResult"
          width="400"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="center"
          header-align="center"
          label="错误消息"
          prop="errorMsg"
          width="400"
        ></el-table-column>
        <el-table-column align="center" fixed="right" header-align="center" label="操作" width="100">
          <template #default="scope">
            <el-tooltip :show-after="500" content="详细" placement="top">
              <el-button
                v-show="hasAuth('system:operLog:list')"
                class="tb-act-btn tb-act-btn-detail"
                plain
                size="small"
                type="primary"
                @click="showDetail(scope.$index)"
              >
                <fd-icon icon="view-grid-detail"></fd-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip :show-after="500" content="删除" placement="top">
              <el-button
                v-show="hasAuth('system:operLog:delete')"
                class="tb-act-btn"
                plain
                size="small"
                type="danger"
                @click="del(scope.row)"
              >
                <fd-icon icon="close"></fd-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-bind="paginationAttrs"></el-pagination>
    </div>
    <el-backtop></el-backtop>
    <detail v-if="state.detailShow" ref="detailDialog" v-bind="detailAttrs"></detail>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SystemOperLog'
}
</script>

<script setup lang="ts">
import useList, { ListStateOption } from '@/components/crud/use-list'
import { OperLog, operLogDel, operLogDicts, operLogExport, operLogFields, operLogList, operLogQuery } from '@/api/system/oper-log'
import useExpandTransition from '@/hooks/use-expand-transition'
import Detail from './detail.vue'
import { formatTimestamp } from '@/utils/time'
import usePage from '@/components/page/use-page'

const stateOption: ListStateOption<OperLog> = {
  idField: operLogFields.idField,
  listApi: operLogList,
  delApi: operLogDel,
  exportApi: operLogExport,
  dicts: operLogDicts,
  query: operLogQuery,
  currentId: '',
  tableRowSelectable: true
}

const { mixRefs, mixState: state, mixMethods, mixAttrs } = useList<OperLog>(stateOption)
const { queryForm, table, detailDialog } = mixRefs
const { queryList, resetQuery, del, exportData, toggleQueryForm, dictVal, showDetail } = mixMethods
const { tableAttrs, paginationAttrs, detailAttrs } = mixAttrs

const { docMinHeight, showPageHeader, hasAuth } = usePage()

const { expandEnter, expandAfterEnter, expandBeforeLeave } = useExpandTransition()
</script>
