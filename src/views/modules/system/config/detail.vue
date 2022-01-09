<template>
  <div class="fd-page__form">
    <el-descriptions
      :column="2"
      :title="`系统配置详细 - ${state.data[state.idx].configKey}`"
      border
      direction="vertical"
      size="medium"
    >
      <el-descriptions-item label="配置分类">
        {{ dictVal(state.dicts.sysConfigType, state.data[state.idx].configTypeDict) }}
      </el-descriptions-item>
      <el-descriptions-item label="是否启用">
        <el-tag v-if="state.data[state.idx].enabled" size="mini" type="success">启用</el-tag>
        <el-tag v-else size="mini" type="danger">禁用</el-tag>
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="键">{{ state.data[state.idx].configKey }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="值">
        <fd-code-editor v-model:value="state.data[state.idx].configValue" language="application/json" readonly />
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="备注">{{ state.data[state.idx].remark }}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SystemConfigDetail'
}
</script>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import useDetail, { OPEN_EDIT_EVENT } from '@/components/crud/use-detail'
import { configFields } from '@/api/system/config'
import FdCodeEditor from '@/components/code-editor/index.vue'

const stateOption = {
  idField: configFields.idField,
  resetFormData: {
    id: '',
    configTypeDict: '',
    configKey: '',
    configValue: '',
    enabled: '',
    remark: ''
  }
}

const emit = defineEmits([OPEN_EDIT_EVENT])

const { mixState: state, mixMethods } = useDetail(stateOption, emit)

const { open, resetForm, dictVal, close } = mixMethods

onBeforeMount(async () => {
  resetForm()
})

defineExpose({
  open,
  close
})
</script>

<style lang="scss" scoped>
.el-descriptions {
  ::v-deep(.el-descriptions__body) {
    table {
      table-layout: fixed;
    }
  }
}
</style>
