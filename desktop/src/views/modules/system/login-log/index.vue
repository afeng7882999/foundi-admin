<template>
  <fd-page v-bind="pageMainAttrs" name="system-loginLog" :pagination="paginationAttrs">
    <template #query>
      <fd-item-date-range label="访问时间" prop="operTime" />
      <fd-item-dict label="登录方式" prop="authcTypeDict" :dict="s.dicts.sysAuthcType" />
      <fd-item label="用户账号" prop="userName" />
      <fd-item label="IP地址" prop="ip" />
      <fd-item-dict label="状态" prop="statusDict" :dict="s.dicts.sysLoginLogStatus" />
      <fd-item-sort label="排序" prop="sort" :fields="loginLogSortFields"></fd-item-sort>
    </template>
    <template #act>
      <fd-page-toolbar
        del="system:loginLog:delete"
        export="system:loginLog:export"
        v-bind="pageToolbarAttrs"
        :pagination="gridPaginationAttrs"
      >
        <template #query>
          <fd-item-date-range prop="operTime" />
          <fd-item-dict prop="statusDict" :dict="s.dicts.sysLoginLogStatus" placeholder="请选择状态" />
        </template>
      </fd-page-toolbar>
    </template>
    <template #table>
      <el-table ref="table" v-loading="s.loading" v-bind="tableAttrs">
        <fd-col-selection />
        <fd-col-datetime label="访问时间" prop="operTime" />
        <fd-col :sort="s.query.sort" label="用户账号" prop="userName" width="150" @sort-changed="m.sortChanged" />
        <fd-col-dict label="类型" prop="typeDict" :dict="s.dicts.sysLoginLogType" width="60" />
        <fd-col-dict label="登录方式" prop="authcTypeDict" :dict="s.dicts.sysAuthcType" width="100" />
        <fd-col :sort="s.query.sort" label="IP地址" prop="ip" width="130" @sort-changed="m.sortChanged" />
        <fd-col label="地点" prop="location" width="150" />
        <fd-col label="浏览器" prop="browser" width="150" />
        <fd-col label="操作系统" prop="os" width="150" />
        <fd-col-dict label="状态" prop="statusDict" :dict="s.dicts.sysLoginLogStatus" width="60" />
        <fd-col label="提示消息" prop="message" width="100" />
        <fd-col-act detail="system:loginLog:list" del="system:loginLog:delete" width="100" @detail="m.showDetail" @del="m.del" />
      </el-table>
    </template>
    <template #grid>
      <fd-virtual-grid ref="grid" v-bind="gridAttrs" :item-min-width="310">
        <template #default="{ index, item, itemHeight }">
          <card
            v-bind="cardAttrs"
            :index="index"
            :item="item"
            :placeholder-height="itemHeight"
            detail="system:loginLog:list"
            del="system:loginLog:delete"
          />
        </template>
      </fd-virtual-grid>
    </template>
  </fd-page>
  <detail v-if="s.detailShow" ref="detailDialog" v-bind="detailAttrs"></detail>
</template>

<script setup lang="ts">
import useList from '@/crud/hooks/use-list'
import {
  loginLogFields,
  loginLogDicts,
  loginLogQuery,
  loginLogSortFields,
  loginLogList,
  loginLogDel,
  loginLogExport,
  LoginLog
} from '@b/api/system/login-log'
import Card from './card.vue'
import Detail from './detail.vue'

defineOptions({
  name: 'SystemLoginLog'
})

const stateOption = {
  idField: loginLogFields.idField,
  listApi: loginLogList,
  delApi: loginLogDel,
  exportApi: loginLogExport,
  dicts: loginLogDicts,
  query: loginLogQuery,
  tableRowSelectable: true
}

const { listRefs, listAttrs, listState: s, listMethods: m } = useList<LoginLog>(stateOption)
const { table, grid, detailDialog } = listRefs
const { pageMainAttrs, tableAttrs, paginationAttrs, gridPaginationAttrs, detailAttrs, pageToolbarAttrs, gridAttrs, cardAttrs } = listAttrs
</script>
