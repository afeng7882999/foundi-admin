<template>
  <fd-drawer v-model="s.visible" :title="`系统配置详细 (${s.idx + 1} / ${s.data.length})`" size="600px">
    <el-descriptions :column="2" border direction="vertical">
      <el-descriptions-item label="配置分类">
        <fd-fmt-dict :dict="s.dicts.sysConfigType" :data="s.data[s.idx].configTypeDict" />
      </el-descriptions-item>
      <el-descriptions-item label="是否启用">
        <fd-fmt-boolean :data="s.data[s.idx].enabled" labels="启用,禁用" />
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="键">{{ s.data[s.idx].configKey }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="值">
        <fd-fmt-json :data="s.data[s.idx].configValue" />
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="备注">{{ s.data[s.idx].remark }}</el-descriptions-item>
      <template #extra>
        <fd-descriptions-act v-bind="actAttrs" edit="system:config:edit" />
      </template>
    </el-descriptions>
  </fd-drawer>
</template>

<script lang="ts">
export default {
  name: 'SystemConfigDetail'
}
</script>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import useDetail, { OPEN_EDIT_EVENT } from '@/crud/hooks/use-detail'
import { Config, configFields } from '@/api/system/config'

const stateOption = {
  ifEditable: true,
  idField: configFields.idField,
  resetFormData: {
    id: '',
    configTypeDict: '',
    configKey: '',
    configValue: '',
    enabled: undefined,
    remark: ''
  }
}

const emit = defineEmits([OPEN_EDIT_EVENT])

const { detailState: s, detailMethods: m, detailAttrs } = useDetail<Config>(stateOption, emit)
const { actAttrs } = detailAttrs

onBeforeMount(async () => {
  m.resetForm()
})

defineExpose({
  open: m.open,
  close: m.close
})
</script>
