<template>
  <fd-page-act :table-option="tableSettingOpt" :export="true" :query="false">
    <template #buttons>
      <el-button v-waves plain class="hidden-sm-and-down" @click.stop="onPrev">上一项</el-button>
      <el-button v-waves plain class="hidden-sm-and-down" @click.stop="onNext">下一项</el-button>
    </template>
    <template #menu>
      <fd-contextmenu-item label="上一项" class="hidden-md-and-up" @click="onPrev"></fd-contextmenu-item>
      <fd-contextmenu-item label="下一项" class="hidden-md-and-up" @click="onNext"></fd-contextmenu-item>
      <fd-contextmenu-item class="hidden-md-and-up" divider></fd-contextmenu-item>
    </template>
  </fd-page-act>
  <div ref="operLogTbWrapper" class="fd-page__table is-bordered">
    <el-table ref="operLogTb" v-bind="tableAttrs" :data="state.operLogs" @row-click="onRowClick">
      <fd-col-selection></fd-col-selection>
      <fd-col-datetime label="操作时间" prop="operTime" sortable></fd-col-datetime>
      <fd-col label="请求URL" prop="operUrl" sortable width="500"></fd-col>
      <fd-col label="请求方式" prop="requestMethod" width="90"></fd-col>
      <fd-col-dict label="操作状态" prop="statusDict" :dict="state.sysOperLogStatus" width="80"></fd-col-dict>
      <fd-col label="账号" prop="operUserName" width="150"></fd-col>
      <fd-col label="IP" prop="operIp" width="150"></fd-col>
      <fd-col label="地点" prop="operLocation"></fd-col>
      <fd-col-act :detail="true" :del="true" :edit="true" header-align="center" align="center" width="200">
        <template #prefix>
          <el-tooltip :show-after="500" content="生成并预览代码" placement="top">
            <el-button class="tb-act-btn" plain size="small" type="warning">
              <fd-icon icon="preview-open"></fd-icon>
              预览
            </el-button>
          </el-tooltip>
        </template>
      </fd-col-act>
    </el-table>
  </div>
  <el-backtop></el-backtop>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import { operLogData, sysOperLogStatus } from './data'
import useTable from '@/components/table/hooks/use-table'
import { Indexable } from '@/common/types'
import { Ref } from '@vue/reactivity'
import { ElTable } from 'element-plus'

defineOptions({
  name: 'BaseTableDemo'
})

const state = reactive({
  operLogs: operLogData,
  sysOperLogStatus: sysOperLogStatus,
  currentIdx: null as number | null
})

const operLogTb = ref() as Ref<InstanceType<typeof ElTable>>

const { tableAttrs, rowDensity, columns, expandAll, stripe, border, focusCurrentRow } = useTable(operLogTb, {
  alias: '_1',
  data: () => state.operLogs,
  rowFocusable: true
})

const onRowClick = (row: Indexable) => {
  state.currentIdx = state.operLogs.findIndex((o) => o.id === row.id)
  setCurrentData()
}

const tableSettingOpt = {
  expandAll: () => expandAll,
  rowDensity: () => rowDensity,
  columns: () => columns,
  stripe: () => stripe,
  border: () => border
}

const setCurrentData = (idx?: number) => {
  if (idx !== undefined) {
    operLogTb.value.setCurrentRow(state.operLogs[idx])
  }
  nextTick(() => {
    focusCurrentRow()
  })
}

const onPrev = () => {
  if (state.currentIdx === null) {
    state.currentIdx = state.operLogs.length - 1
    setCurrentData(state.operLogs.length - 1)
    return
  }
  if (state.currentIdx <= 0) {
    setCurrentData(0)
    return
  }
  state.currentIdx--
  setCurrentData(state.currentIdx)
}

const onNext = () => {
  const lastIdx = state.operLogs.length - 1
  if (state.currentIdx === null) {
    state.currentIdx = 0
    setCurrentData(0)
    return
  }
  if (state.currentIdx >= lastIdx) {
    setCurrentData(lastIdx)
    return
  }
  state.currentIdx++
  setCurrentData(state.currentIdx)
}
</script>
