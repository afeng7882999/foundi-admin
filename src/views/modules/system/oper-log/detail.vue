<template>
  <fd-right-panel
    v-model="state.visible"
    :close-on-click-modal="false"
    :modal="false"
    :title="`系统操作日志详细 (${state.idx + 1} / ${state.data.length})`"
    size="600px"
  >
    <el-descriptions :column="2" :title="`ID: ${state.data[state.idx].id}`" border size="medium">
      <el-descriptions-item :span="2" label="模块标题">{{ state.data[state.idx].title }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="操作时间">
        {{ dateTimeStr(state.data[state.idx].operTime) }}
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="操作人员ID">{{ state.data[state.idx].operUserId }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="操作人员账号">
        {{ state.data[state.idx].operUserName }}
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="操作人员角色">
        {{ state.data[state.idx].operUserRoles }}
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="用户组名称">{{ state.data[state.idx].groupName }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="主机地址">{{ state.data[state.idx].operIp }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="操作地点">{{ state.data[state.idx].operLocation }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="请求URL">{{ state.data[state.idx].operUrl }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="请求方式">{{ state.data[state.idx].requestMethod }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="操作状态">
        {{ dictVal(state.dicts.sysOperLogStatus, state.data[state.idx].statusDict) }}
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="方法名称">{{ state.data[state.idx].method }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="请求参数">
        <fd-code-editor v-model="state.operParam" language="application/json" readonly />
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="返回参数">
        <fd-code-editor v-model="state.jsonResult" language="application/json" readonly />
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="错误消息">{{ state.data[state.idx].errorMsg }}</el-descriptions-item>
      <template #extra>
        <el-button v-show="state.ifEditable" size="medium" type="primary" @click="onEdit">编辑</el-button>
        <el-button v-show="state.ifShowNavigation" :disabled="prevDisabled" size="medium" @click="onPrev">
          <fd-icon class="is-in-btn" icon="left-small"></fd-icon>
          上一个
        </el-button>
        <el-button v-show="state.ifShowNavigation" :disabled="nextDisabled" size="medium" @click="onNext">
          下一个
          <fd-icon class="is-in-btn right" icon="right-small"></fd-icon>
        </el-button>
      </template>
    </el-descriptions>
  </fd-right-panel>
</template>

<script lang="ts">
export default {
  name: 'SystemOperLogDetail'
}
</script>

<script setup lang="ts">
import useDetail, { OPEN_EDIT_EVENT } from '@/components/crud/use-detail'
import { operLogFields } from '@/api/system/oper-log'
import FdCodeEditor from '@/components/code-editor/index.vue'

const emit = defineEmits([OPEN_EDIT_EVENT])

const stateOption = {
  idField: operLogFields.idField,
  ifEditable: false,
  resetFormData: {
    id: '',
    title: '',
    method: '',
    requestMethod: '',
    operUserId: 0,
    operUserName: '',
    operUserRoles: '',
    groupName: '',
    operUrl: '',
    operIp: '',
    operLocation: '',
    operParam: '',
    jsonResult: '',
    statusDict: '',
    errorMsg: '',
    operTime: ''
  },

  operParam: '',
  jsonResult: ''
}

const { mixState: state, mixComputed, mixMethods } = useDetail(stateOption, emit)
const { prevDisabled, nextDisabled } = mixComputed
const { open, dictVal, dateTimeStr, onEdit, onPrev, onNext, close, onCurrentChanged } = mixMethods

const formatJson = (idx: number) => {
  if (state.data && state.data[idx]) {
    try {
      state.operParam = JSON.stringify(JSON.parse(state.data[idx].operParam), null, 2)
    } catch {
      state.operParam = state.data[idx].operParam
    }
    try {
      state.jsonResult = JSON.stringify(JSON.parse(state.data[idx].jsonResult), null, 2)
    } catch {
      state.jsonResult = state.data[idx].jsonResult
    }
  }
}

onCurrentChanged(async (idx: number) => {
  formatJson(idx)
})

defineExpose({
  open,
  close
})
</script>

<style lang="scss" scoped>
.el-descriptions {
  ::v-deep(.el-descriptions__label) {
    width: 110px;
  }

  ::v-deep(.el-descriptions__body) {
    .el-descriptions__table {
      table-layout: fixed;
      .el-descriptions__cell {
        word-break: break-all;
      }
    }
  }
}
</style>
