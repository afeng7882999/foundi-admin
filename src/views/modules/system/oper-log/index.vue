<template>
  <div ref="pageRoot" :style="pageMinHeight" class="page-operLog fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <el-form ref="queryForm" :inline="true" :model="query" size="medium" @keyup.enter="queryList()">
        <transition name="expand" @enter="expandEnter" @after-enter="expandAfterEnter" @before-leave="expandBeforeLeave">
          <div v-show="queryFormShow" class="fd-page__query">
            <el-form-item label="模块标题" prop="title">
              <el-input v-model="query.title" clearable placeholder="请输入模块标题" />
            </el-form-item>
            <el-form-item label="方法名称" prop="method">
              <el-input v-model="query.method" clearable placeholder="请输入方法名称" />
            </el-form-item>
            <el-form-item label="操作人员账号名" prop="operUserName">
              <el-input v-model="query.operUserName" clearable placeholder="请输入操作人员账号名" />
            </el-form-item>
            <el-form-item label="主机地址" prop="operIp">
              <el-input v-model="query.operIp" clearable placeholder="请输入主机地址" />
            </el-form-item>
            <el-form-item label="操作时间" prop="operTime">
              <el-date-picker v-model="query.operTime" :default-time="[new Date('0 0:0:0'), new Date('0 23:59:59')]" end-placeholder="结束日期" format="YYYY-MM-DD" range-separator="-" start-placeholder="开始日期" type="daterange"></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button plain type="primary" @click="queryList()">
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
        <el-button v-show="hasAuth('system:operLog:delete')" v-waves :disabled="selectedNodes.length <= 0" plain size="medium" type="danger" @click="del()">
          <fd-icon class="is-in-btn" icon="delete"></fd-icon>
          批量删除
        </el-button>
        <div class="action-right">
          <el-button v-show="hasAuth('system:operLog:export')" v-waves size="medium" @click="exportData()">导出数据</el-button>
          <el-divider class="action-divider" direction="vertical"></el-divider>
          <el-tooltip :content="queryFormShow ? '隐藏查询表单' : '显示查询表单'" :show-after="500" effect="dark" placement="top">
            <fd-icon-button :class="queryFormShow ? 'expanded' : ''" class="action-toggle-btn" icon="double-down" @click="toggleQueryForm()"></fd-icon-button>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div class="fd-page__table is-bordered">
      <el-table v-loading="loading" :data="data" row-key="id" @selection-change="onSelectionChange">
        <el-table-column align="left" header-align="left" type="selection" width="40"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="操作时间" prop="operTime" width="200"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="请求URL" prop="operUrl" width="400">
          <template #header="scope">
            <fd-table-sort-header :column="scope.column" @sort-changed="sortChanged"></fd-table-sort-header>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="模块标题" prop="title" width="150"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="方法名称" prop="method" width="400"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="请求方式" prop="requestMethod"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="操作状态" prop="statusDict">
          <template #default="scope">
            <span>{{ dictVal(dicts.sysOperLogStatus, scope.row.statusDict) }}</span>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="ID" prop="operUserId" width="150"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="账号名" prop="operUserName" width="150"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="角色" prop="operUserRoles" width="150"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="用户组" prop="groupName"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="主机地址" prop="operIp"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="操作地点" prop="operLocation"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="请求参数" prop="operParam" width="400"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="返回参数" prop="jsonResult" width="400"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="错误消息" prop="errorMsg" width="400"></el-table-column>
        <el-table-column align="center" fixed="right" header-align="center" label="操作" width="100">
          <template #default="scope">
            <el-tooltip :show-after="500" content="详细" placement="top">
              <el-button v-show="hasAuth('system:operLog:delete')" class="fd-tb-act fd-tb-act-detail" plain size="mini" type="primary" @click="showDetail(scope.$index)">
                <fd-icon icon="view-grid-detail"></fd-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip :show-after="500" content="删除" placement="top">
              <el-button v-show="hasAuth('system:operLog:delete')" class="fd-tb-act" plain size="mini" type="danger" @click="del(scope.row)">
                <fd-icon icon="close"></fd-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination :background="true" :current-page="current" :page-count="total" :page-size="size" :page-sizes="[10, 20, 50, 100]" :total="count" layout="total, sizes, prev, pager, next, jumper" @current-change="pageChange" @size-change="sizeChange"></el-pagination>
    </div>
    <el-backtop></el-backtop>
    <detail v-if="detailShow" ref="detailDialog"></detail>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SystemOperLog'
}
</script>

<script setup lang="ts">
import useList from '@/components/crud/use-list'
import { operLogDel, operLogDicts, operLogExport, operLogFields, operLogList, operLogQuery } from '@/api/system/oper-log.ts'
import useExpandTransition from '@/components/transition/use-expand-transition'
import Detail from './detail.vue'
import { toRefs } from 'vue'

const stateOption = {
  idField: operLogFields.idField,
  listApi: operLogList,
  delApi: operLogDel,
  exportApi: operLogExport,
  dicts: operLogDicts,
  query: operLogQuery
}

const { mixRefs, mixState, mixComputed, mixMethods } = useList(stateOption)

const { queryForm, detailDialog } = mixRefs

const { data, query, dicts, queryFormShow, selectedNodes, loading, current, total, size, count, detailShow } = toRefs(mixState)

const { pageMinHeight, showPageHeader } = mixComputed

const { queryList, resetQuery, hasAuth, del, exportData, toggleQueryForm, sortChanged, dictVal, showDetail, pageChange, sizeChange, onSelectionChange } = mixMethods

const { expandEnter, expandAfterEnter, expandBeforeLeave } = useExpandTransition()
</script>
