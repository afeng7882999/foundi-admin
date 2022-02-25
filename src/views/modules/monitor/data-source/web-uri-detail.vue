<template>
  <el-dialog v-model="state.visible" custom-class="dialog-web-uri-detail" title="Web URI" width="90%">
    <div class="dialog-web-uri-detail__sub-title">Web URI View:</div>
    <ul class="db-stat-lst is-wide">
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">URI</span>
        <span class="db-stat-lst__value">{{ state.webUriData.URI }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">请求次数</span>
        <span class="db-stat-lst__value">{{ state.webUriData.RequestCount }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">请求时间（和）</span>
        <span class="db-stat-lst__value">{{ state.webUriData.RequestTimeMillisTotal }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">最后访问时间</span>
        <span class="db-stat-lst__value">{{ state.webUriData.LastAccessTime }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">执行中</span>
        <span class="db-stat-lst__value">{{ state.webUriData.RunningCount }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">最大并发</span>
        <span class="db-stat-lst__value">{{ state.webUriData.ConcurrentMax }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">Jdbc执行数</span>
        <span class="db-stat-lst__value">{{ state.webUriData.JdbcExecuteCount }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">Jdbc出错数</span>
        <span class="db-stat-lst__value">{{ state.webUriData.JdbcExecErrorCount }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">jdbc执行峰值</span>
        <span class="db-stat-lst__value">{{ state.webUriData.JdbcExecutePeak }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">Jdbc时间</span>
        <span class="db-stat-lst__value">{{ state.webUriData.JdbcExecTimeMillis }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">事务提交数</span>
        <span class="db-stat-lst__value">{{ state.webUriData.JdbcCommitCount }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">事务回滚数</span>
        <span class="db-stat-lst__value">{{ state.webUriData.JdbcRollbackCount }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">读取行数</span>
        <span class="db-stat-lst__value">{{ state.webUriData.JdbcFetchRowCount }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">jdbc查询取回行数峰值</span>
        <span class="db-stat-lst__value">{{ state.webUriData.JdbcFetchRowPeak }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">更新行数</span>
        <span class="db-stat-lst__value">{{ state.webUriData.JdbcUpdateCount }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">jdbc更新峰值</span>
        <span class="db-stat-lst__value">{{ state.webUriData.JdbcUpdatePeak }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">连接池获取连接次数</span>
        <span class="db-stat-lst__value">{{ state.webUriData.JdbcPoolConnectionOpenCount }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">连接池关闭连接次数</span>
        <span class="db-stat-lst__value">{{ state.webUriData.JdbcPoolConnectionCloseCount }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">ResultSet打开次数</span>
        <span class="db-stat-lst__value">{{ state.webUriData.JdbcResultSetOpenCount }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">ResultSet关闭次数</span>
        <span class="db-stat-lst__value">{{ state.webUriData.JdbcResultSetCloseCount }}</span>
      </li>
    </ul>
    <div class="dialog-web-uri-detail__sub-title">Profiles:</div>
    <el-table
      :data="state.webUriData.Profiles"
      size="small"
      border
      style="width: 100%"
      stripe
      :default-sort="{ prop: 'Name', order: 'ascending' }"
    >
      <el-table-column label="Name" prop="Name" min-width="350" sortable></el-table-column>
      <el-table-column label="ParentName" prop="Parent" min-width="350" sortable></el-table-column>
      <el-table-column label="Type" prop="Type" width="80" sortable></el-table-column>
      <el-table-column label="ExecuteCount" prop="ExecuteCount" width="80" sortable></el-table-column>
      <el-table-column label="ExecuteTimeMillis" prop="ExecuteTimeMillis" width="80" sortable></el-table-column>
    </el-table>
    <template #footer>
      <el-button type="primary" @click="state.visible = false">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: 'WebUriDetailDialog'
}
</script>

<script setup lang="ts">
import { reactive } from 'vue'
import request from '@/app/request'

const state = reactive({
  visible: false,
  webUriData: {} as any
})

const getUrl = (id: string) => `/api/druid/weburi-${id}.json`

const init = async (id: string) => {
  await getData(id)
}

const getData = async (id: string) => {
  try {
    const { data } = await request({
      url: getUrl(id),
      method: 'get'
    })
    state.webUriData = data.Content
    state.visible = true
  } catch (e) {
    console.log(e)
  }
}

defineExpose({
  init
})
</script>

<style lang="scss">
.dialog-web-uri-detail__sub-title {
  padding: 20px 0 10px 0;
  font-size: var(--el-font-size-large);
}
</style>
