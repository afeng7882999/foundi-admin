<template>
  <fd-drawer
    v-model="state.visible"
    :close-on-click-modal="false"
    :modal="false"
    :title="`系统访问日志详细 (${state.idx + 1} / ${state.data.length})`"
    size="600px"
  >
    <el-descriptions :column="2" :title="`ID: ${state.data[state.idx].id}`" border size="medium">
      <el-descriptions-item :span="2" label="访问时间">
        {{ dateTimeStr(state.data[state.idx].operTime) }}
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="类型">
        {{ dictVal(state.dicts.sysLoginLogType, state.data[state.idx].typeDict) }}
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="登录方式">
        {{ dictVal(state.dicts.sysAuthcType, state.data[state.idx].authcTypeDict) }}
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="用户账号">{{ state.data[state.idx].userName }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="IP地址">{{ state.data[state.idx].ip }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="地点">{{ state.data[state.idx].location }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="浏览器">{{ state.data[state.idx].browser }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="操作系统">{{ state.data[state.idx].os }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="状态">
        {{ dictVal(state.dicts.sysLoginLogStatus, state.data[state.idx].statusDict) }}
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="提示消息">{{ state.data[state.idx].message }}</el-descriptions-item>
      <template #extra>
        <el-button v-show="state.ifEditable" size="medium" type="primary" @click="onEdit">编辑</el-button>
        <el-button v-show="state.ifShowNavigation" size="medium" :disabled="prevDisabled" @click="onPrev">
          <fd-icon icon="left-small" class="is-in-btn"></fd-icon>
          上一个
        </el-button>
        <el-button v-show="state.ifShowNavigation" size="medium" :disabled="nextDisabled" @click="onNext">
          下一个
          <fd-icon icon="right-small" class="is-in-btn right"></fd-icon>
        </el-button>
      </template>
    </el-descriptions>
  </fd-drawer>
</template>

<script lang="ts">
export default {
  name: 'SystemLoginLogDetail'
}
</script>

<script setup lang="ts">
import useDetail, { OPEN_EDIT_EVENT } from '@/components/crud/use-detail'
import { loginLogFields } from '@/api/system/login-log'

const emit = defineEmits([OPEN_EDIT_EVENT])

const stateOption = {
  idField: loginLogFields.idField,
  ifEditable: false,
  resetFormData: {
    id: ''
  }
}

const { mixState: state, mixComputed, mixMethods } = useDetail(stateOption, emit)
const { prevDisabled, nextDisabled } = mixComputed
const { open, dictVal, dateTimeStr, onEdit, onPrev, onNext, close } = mixMethods

defineExpose({
  open,
  close
})
</script>

<style lang="scss" scoped>
.el-descriptions {
  ::v-deep(.el-descriptions__label) {
    width: 80px;
  }
}
</style>
