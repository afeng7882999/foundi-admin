<template>
  <fd-page v-bind="pageMainAttrs" name="system-loginLog">
    <template #query>
      <fd-item-datetime label="访问时间" prop="operTime" />
      <fd-item-dict label="登录方式" prop="authcTypeDict" :dict="s.dicts.sysAuthcType" />
      <fd-item label="用户账号" prop="userName" />
      <fd-item label="IP地址" prop="ip" />
      <fd-item-dict label="状态" prop="statusDict" :dict="s.dicts.sysLoginLogStatus" />
      <fd-item-sort label="排序" prop="sort" :fields="loginLogSortFields"></fd-item-sort>
    </template>
    <template #act>
      <fd-page-act del="system:loginLog:delete" export="system:loginLog:export" v-bind="pageActAttrs">
        <template #query>
          <fd-item-datetime prop="operTime" />
          <fd-item-dict prop="statusDict" :dict="s.dicts.sysLoginLogStatus" placeholder="请选择状态" />
        </template>
      </fd-page-act>
    </template>
    <template #table>
      <el-table ref="table" v-loading="s.loading" v-bind="tableAttrs">
        <fd-col-selection />
        <fd-col-datetime label="访问时间" prop="operTime" />
        <fd-col-dict label="类型" prop="typeDict" :dict="s.dicts.sysLoginLogType" width="60" />
        <fd-col-dict label="登录方式" prop="authcTypeDict" :dict="s.dicts.sysAuthcType" width="100" />
        <fd-col :sort="s.query.sort" label="用户账号" prop="userName" width="150" @sort-changed="m.sortChanged" />
        <fd-col :sort="s.query.sort" label="IP地址" prop="ip" width="130" @sort-changed="m.sortChanged" />
        <fd-col label="地点" prop="location" width="150" />
        <fd-col label="浏览器" prop="browser" width="150" />
        <fd-col label="操作系统" prop="os" width="150" />
        <fd-col-dict label="状态" prop="statusDict" :dict="s.dicts.sysLoginLogStatus" width="60" />
        <fd-col label="提示消息" prop="message" width="100" />
        <fd-col-act
          detail="system:loginLog:list"
          del="system:loginLog:delete"
          header-align="center"
          width="90"
          @detail="showDetail"
          @del="m.del"
        />
      </el-table>
      <el-pagination v-bind="paginationAttrs"></el-pagination>
    </template>
  </fd-page>
  <detail v-if="s.detailShow" ref="detailDialog" v-bind="detailAttrs"></detail>
</template>

<script lang="ts">
export default {
  name: 'SystemLoginLog'
}
</script>

<script setup lang="ts">
import useList from '@/extend/crud/use-list'
import {
  loginLogFields,
  loginLogDicts,
  loginLogQuery,
  loginLogSortFields,
  loginLogList,
  loginLogDel,
  loginLogExport,
  LoginLog
} from '@/api/system/login-log'
import Detail from './detail.vue'

const stateOption = {
  idField: loginLogFields.idField,
  listApi: loginLogList,
  delApi: loginLogDel,
  exportApi: loginLogExport,
  dicts: loginLogDicts,
  query: loginLogQuery,
  tableRowSelectable: true
}

const { mixRefs, mixAttrs, mixState: s, mixMethods: m } = useList<LoginLog>(stateOption)
const { table, detailDialog } = mixRefs
const { pageMainAttrs, tableAttrs, paginationAttrs, detailAttrs, pageActAttrs } = mixAttrs

const showDetail = (row: LoginLog, idx: number) => {
  m.showDetail(idx)
}
</script>
