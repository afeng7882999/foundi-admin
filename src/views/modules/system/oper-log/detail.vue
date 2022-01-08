<template>
  <el-dialog v-model="visible" :close-on-click-modal="false" :title="`系统操作日志详细 (${idx + 1} / ${data.length})`" width="80%">
    <el-descriptions :column="2" :title="`ID: ${data[idx].id}`" border size="medium">
      <el-descriptions-item label="模块标题">{{ data[idx].title }}</el-descriptions-item>
      <el-descriptions-item label="操作时间">{{ data[idx].operTime }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="方法名称">{{ data[idx].method }}</el-descriptions-item>
      <el-descriptions-item label="操作人员ID">{{ data[idx].operUserId }}</el-descriptions-item>
      <el-descriptions-item label="操作人员账号">{{ data[idx].operUserName }}</el-descriptions-item>
      <el-descriptions-item label="操作人员角色">{{ data[idx].operUserRoles }}</el-descriptions-item>
      <el-descriptions-item label="用户组名称">{{ data[idx].groupName }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="请求URL">{{ data[idx].operUrl }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="请求方式">{{ data[idx].requestMethod }}</el-descriptions-item>
      <el-descriptions-item label="主机地址">{{ data[idx].operIp }}</el-descriptions-item>
      <el-descriptions-item label="操作地点">{{ data[idx].operLocation }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="请求参数">{{ data[idx].operParam }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="返回参数">{{ data[idx].jsonResult }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="错误消息">{{ data[idx].errorMsg }}</el-descriptions-item>
      <el-descriptions-item label="操作状态">
        {{ dictVal(dicts.sysOperLogStatus, data[idx].statusDict) }}
      </el-descriptions-item>
      <el-descriptions-item label="操作时间">{{ data[idx].operTime }}</el-descriptions-item>
      <template #extra>
        <el-button v-show="ifEditable" size="medium" type="primary" @click="onEdit">编辑</el-button>
        <el-button v-show="ifShowNavigation" :disabled="prevDisabled" size="medium" @click="onPrev">
          <fd-icon class="is-in-btn" icon="left-small"></fd-icon>
          上一个
        </el-button>
        <el-button v-show="ifShowNavigation" :disabled="nextDisabled" size="medium" @click="onNext">
          下一个
          <fd-icon class="is-in-btn right" icon="right-small"></fd-icon>
        </el-button>
      </template>
    </el-descriptions>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import useDetail, { OPEN_EDIT_EVENT } from '@/components/crud/use-detail'
import { operLogFields } from '@/api/system/oper-log'

export default defineComponent({
  name: 'SystemOperLogDetail',
  emits: [OPEN_EDIT_EVENT],
  setup(props, { emit }) {
    const stateOption = {
      idField: operLogFields.idField,
      ifEditable: false
    }

    const { mixState, mixComputed, mixMethods } = useDetail(stateOption, emit)

    return {
      ...toRefs(mixState),
      ...mixComputed,
      ...mixMethods
    }
  }
})
</script>

<style lang="scss" scoped>
.el-descriptions {
  ::v-deep(.el-descriptions__label) {
    width: 110px;
  }
}
</style>
