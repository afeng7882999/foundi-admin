<template>
  <fd-drawer
    v-model="s.visible"
    :close-on-click-modal="false"
    :modal="false"
    :title="`系统访问日志详细 (${s.idx + 1} / ${s.data.length})`"
    size="600px"
  >
    <el-descriptions :column="2" :direction="isMobile ? 'vertical' : 'horizontal'" border>
      <el-descriptions-item :span="2" label="ID">
        {{ s.data[s.idx].id }}
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="访问时间">
        <fd-fmt-datetime :data="s.data[s.idx].operTime" />
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="类型">
        <fd-fmt-dict :dict="s.dicts.sysLoginLogType" :data="s.data[s.idx].typeDict" />
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="登录方式">
        <fd-fmt-dict :dict="s.dicts.sysAuthcType" :data="s.data[s.idx].authcTypeDict" />
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="用户账号">{{ s.data[s.idx].userName }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="IP地址">{{ s.data[s.idx].ip }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="地点">{{ s.data[s.idx].location }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="浏览器">{{ s.data[s.idx].browser }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="操作系统">{{ s.data[s.idx].os }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="状态">
        <fd-fmt-dict :dict="s.dicts.sysLoginLogStatus" :data="s.data[s.idx].statusDict" />
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="提示消息">{{ s.data[s.idx].message }}</el-descriptions-item>
      <template #extra>
        <el-button v-show="s.ifEditable" type="primary" @click="onEdit">编辑</el-button>
        <el-button-group>
          <el-button v-show="s.ifShowNavigation" :disabled="!prevEnabled" @click="onPrev">
            <fd-icon icon="left-small" class="is-in-btn"></fd-icon>
            上一个
          </el-button>
          <el-button v-show="s.ifShowNavigation" :disabled="!nextEnabled" @click="onNext">
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
import useDetail, { NAVIGATE_EVENT, OPEN_EDIT_EVENT } from '@/crud/hooks/use-detail'
import { LoginLog, loginLogFields } from '@/api/system/login-log'
import useLayoutSize from '@/hooks/use-layout-size'

const emit = defineEmits([OPEN_EDIT_EVENT, NAVIGATE_EVENT])

const stateOption = {
  idField: loginLogFields.idField,
  ifEditable: false,
  resetFormData: {
    id: ''
  }
}

const { detailState: s, detailComputed, detailMethods } = useDetail<LoginLog>(stateOption, emit)
const { prevEnabled, nextEnabled } = detailComputed
const { open, onEdit, onPrev, onNext, close } = detailMethods

const { isMobile } = useLayoutSize()

defineExpose({
  open,
  close
})
</script>
