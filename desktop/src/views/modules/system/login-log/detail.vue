<template>
  <fd-drawer
    v-model="s.visible"
    :close-on-click-modal="false"
    :modal="false"
    :title="`系统访问日志详细 (${s.idx + 1} / ${s.siz})`"
    size="500px"
  >
    <el-descriptions :column="2" direction="horizontal" border>
      <el-descriptions-item :span="2" label="ID">
        {{ s.data.id }}
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="访问时间">
        <fd-fmt-datetime :data="s.data.operTime" />
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="类型">
        <fd-fmt-dict :dict="s.dicts.sysLoginLogType" :data="s.data.typeDict" />
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="登录方式">
        <fd-fmt-dict :dict="s.dicts.sysAuthcType" :data="s.data.authcTypeDict" />
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="用户账号">{{ s.data.userName }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="IP地址">{{ s.data.ip }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="地点">{{ s.data.location }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="浏览器">{{ s.data.browser }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="操作系统">{{ s.data.os }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="状态">
        <fd-fmt-dict :dict="s.dicts.sysLoginLogStatus" :data="s.data.statusDict" />
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="提示消息">{{ s.data.message }}</el-descriptions-item>
      <template #extra>
        <el-button v-show="s.ifEditable" type="primary" @click="onEdit">编辑</el-button>
        <el-button-group>
          <el-button v-show="s.ifShowNavigation" :disabled="!s.prevEnabled" @click="onNavigate('prev')">
            <fd-icon icon="left-small" class="is-in-btn"></fd-icon>
            上一个
          </el-button>
          <el-button v-show="s.ifShowNavigation" :disabled="!s.nextEnabled" @click="onNavigate('next')">
            下一个
            <fd-icon icon="right-small" class="is-in-btn is-right"></fd-icon>
          </el-button>
        </el-button-group>
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
import useDetail, { OPEN_EDIT_EVENT } from '@b/crud/hooks/use-detail'
import { LoginLog, loginLogFields } from '@b/api/system/login-log'

const emit = defineEmits([OPEN_EDIT_EVENT])

const stateOption = {
  idField: loginLogFields.idField,
  ifEditable: false,
  resetFormData: {
    id: ''
  }
}

const { detailState: s, detailMethods } = useDetail<LoginLog>(stateOption, emit)
const { open, onEdit, onNavigate, close } = detailMethods

defineExpose({
  open,
  close
})
</script>
