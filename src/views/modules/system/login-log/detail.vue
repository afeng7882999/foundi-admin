<template>
  <el-dialog v-model="visible" :close-on-click-modal="false" :title="`系统访问日志详细 (${idx + 1} / ${data.length})`" width="80%">
    <el-descriptions :column="2" :title="`ID: ${data[idx].id}`" border size="medium">
      <el-descriptions-item :span="2" label="访问时间">{{ data[idx].operTime }}</el-descriptions-item>
      <el-descriptions-item label="类型">{{ dictVal(dicts.sysLoginLogType, data[idx].typeDict) }}</el-descriptions-item>
      <el-descriptions-item label="登录方式">
        {{ dictVal(dicts.sysAuthcType, data[idx].authcTypeDict) }}
      </el-descriptions-item>
      <el-descriptions-item label="用户账号">{{ data[idx].userName }}</el-descriptions-item>
      <el-descriptions-item label="登录IP地址">{{ data[idx].ip }}</el-descriptions-item>
      <el-descriptions-item label="登录地点">{{ data[idx].location }}</el-descriptions-item>
      <el-descriptions-item label="浏览器类型">{{ data[idx].browser }}</el-descriptions-item>
      <el-descriptions-item label="操作系统">{{ data[idx].os }}</el-descriptions-item>
      <el-descriptions-item label="登录状态">
        {{ dictVal(dicts.sysLoginLogStatus, data[idx].statusDict) }}
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="提示消息">{{ data[idx].message }}</el-descriptions-item>
      <template #extra>
        <el-button v-show="ifEditable" size="medium" type="primary" @click="onEdit">编辑</el-button>
        <el-button v-show="ifShowNavigation" :disabled="prevDisabled" size="medium" @click="onPrev">
          <fd-icon class="in-button" icon="left-small"></fd-icon>
          上一个
        </el-button>
        <el-button v-show="ifShowNavigation" :disabled="nextDisabled" size="medium" @click="onNext">
          下一个
          <fd-icon class="in-button right" icon="right-small"></fd-icon>
        </el-button>
      </template>
    </el-descriptions>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import useDetail, { OPEN_EDIT_EVENT } from '@/components/crud/use-detail'
import { loginLogFields } from '@/api/system/login-log'

export default defineComponent({
  name: 'SystemLoginLogDetail',
  emits: [OPEN_EDIT_EVENT],
  setup(props, { emit }) {
    const stateOption = {
      idField: loginLogFields.idField,
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
    width: 100px;
  }
}
</style>
