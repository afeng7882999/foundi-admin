<template>
  <fd-drawer
    v-model="state.visible"
    :close-on-click-modal="false"
    :modal="false"
    :title="`系统配置详细 (${state.idx + 1} / ${state.data.length})`"
    size="600px"
  >
    <el-descriptions :column="2" border direction="vertical" size="medium">
      <el-descriptions-item label="配置分类">
        {{ dictVal(state.dicts.sysConfigType, state.data[state.idx].configTypeDict) }}
      </el-descriptions-item>
      <el-descriptions-item label="是否启用">
        <el-tag v-if="state.data[state.idx].enabled" size="mini" type="success">启用</el-tag>
        <el-tag v-else size="mini" type="danger">禁用</el-tag>
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="键">{{ state.data[state.idx].configKey }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="值">
        <fd-code-editor v-model="state.configValue" language="application/json" readonly />
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="备注">{{ state.data[state.idx].remark }}</el-descriptions-item>
      <template #extra>
        <el-button
          v-show="state.ifEditable && hasAuth('system:config:edit')"
          plain
          size="medium"
          type="primary"
          style="margin-right: auto"
          @click="onEdit"
        >
          编辑
        </el-button>
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
  </fd-drawer>
</template>

<script lang="ts">
export default {
  name: 'SystemConfigDetail'
}
</script>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import useDetail, { NAVIGATE_EVENT, OPEN_EDIT_EVENT } from '@/components/crud/use-detail'
import { configFields } from '@/api/system/config'
import FdCodeEditor from '@/components/code-editor/index.vue'
import { formatJson } from '@/utils/lang'
import usePage from '@/components/crud/use-page'

const stateOption = {
  ifEditable: true,
  idField: configFields.idField,
  resetFormData: {
    id: '',
    configTypeDict: '',
    configKey: '',
    configValue: '',
    enabled: '',
    remark: ''
  },
  configValue: ''
}

const emit = defineEmits([OPEN_EDIT_EVENT, NAVIGATE_EVENT])

const { mixState: state, mixComputed, mixMethods } = useDetail(stateOption, emit)
const { prevDisabled, nextDisabled } = mixComputed
const { open, resetForm, dictVal, close, onCurrentChanged, onEdit, onPrev, onNext } = mixMethods

const { hasAuth } = usePage()

onBeforeMount(async () => {
  resetForm()
})

onCurrentChanged(async (idx: number) => {
  state.configValue = formatJson(state.data[idx].configValue)
})

defineExpose({
  open,
  close
})
</script>

<style lang="scss" scoped>
.el-descriptions {
  ::v-deep(.el-descriptions__body) {
    .el-descriptions__table {
      table-layout: fixed;
    }
  }
}
</style>
