<template>
  <el-dialog v-model="state.visible" custom-class="dialog-full-sql" title="FULL SQL" width="90%">
    <div class="dialog-full-sql__sub-title">Format View:</div>
    <el-input v-model="state.fullSqlData.formattedSql" class="dialog-full-sql__textarea" type="textarea" autosize></el-input>
    <div class="dialog-full-sql__sub-title">ParseView:</div>
    <ul class="db-stat-lst is-wide">
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">Tables</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.parsedTable }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">Fields</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.parsedFields }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">Conditions</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.parsedConditions }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">Relationships</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.parsedRelationships }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">OrderByColumns</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.parsedOrderbycolumns }}</span>
      </li>
    </ul>
    <div class="dialog-full-sql__sub-title">LastSlowView:</div>
    <ul class="db-stat-lst is-wide">
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">MaxTimespan</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.MaxTimespan }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">MaxTimespanOccurTime</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.MaxTimespanOccurTime }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">LastSlowParameters</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.LastSlowParameters }}</span>
      </li>
    </ul>
    <div class="dialog-full-sql__sub-title">LastErrorView:</div>
    <ul class="db-stat-lst is-wide">
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">LastErrorMessage</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.LastErrorMessage }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">LastErrorClass</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.LastErrorClass }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">LastErrorTime</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.LastErrorTime }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">LastErrorStackTrace</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.LastErrorStackTrace }}</span>
      </li>
    </ul>
    <div class="dialog-full-sql__sub-title">OtherView:</div>
    <ul class="db-stat-lst is-wide">
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">BatchSizeMax</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.BatchSizeMax }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">BatchSizeTotal</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.BatchSizeTotal }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">BlobOpenCount</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.BlobOpenCount }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">ClobOpenCount</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.ClobOpenCount }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">ReaderOpenCount</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.ReaderOpenCount }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">InputStreamOpenCount</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.InputStreamOpenCount }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">ReadStringLength</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.ReadStringLength }}</span>
      </li>
      <li class="db-stat-lst__item">
        <span class="db-stat-lst__title">ReadBytesLength</span>
        <span class="db-stat-lst__value">{{ state.fullSqlData.ReadBytesLength }}</span>
      </li>
    </ul>
    <template #footer>
      <el-button type="primary" @click="state.visible = false">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: 'FullSqlDialog'
}
</script>

<script setup lang="ts">
import { reactive } from 'vue'
import request from '@b/app/request'

const state = reactive({
  visible: false,
  fullSqlData: {} as any
})

const getUrl = (id: number) => `/api/druid/sql-${id}.json`

const init = async (id: number) => {
  await getData(id)
}

const getData = async (id: number) => {
  try {
    const { data } = await request({
      url: getUrl(id),
      method: 'get'
    })
    state.fullSqlData = data.Content
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
.dialog-full-sql {
  &__submenu-title {
    padding: 20px 0 10px 0;
    font-size: var(--el-font-size-large);
  }

  &__textarea {
    font-size: var(--el-font-size-small);
  }
}
</style>
