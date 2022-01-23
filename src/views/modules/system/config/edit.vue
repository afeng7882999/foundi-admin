<template>
  <fd-right-panel
    v-model="state.visible"
    :close-on-click-modal="false"
    :modal="false"
    :title="state.isCreate ? '新增系统配置' : '修改系统配置'"
    size="600px"
    @closed="hideDialog"
  >
    <el-form ref="form" :model="state.formData" :rules="state.formRule" label-width="80px" size="medium">
      <el-form-item label="配置分类" prop="configTypeDict">
        <el-select v-model="state.formData.configTypeDict" style="width: 100%">
          <el-option
            v-for="item in state.dicts.sysConfigType"
            :key="item.itemKey"
            :label="item.itemValue"
            :value="item.itemKey"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="键" prop="configKey">
        <el-input v-model="state.formData.configKey" placeholder="请输入键"></el-input>
      </el-form-item>
      <el-form-item class="json-editor-form-item" label="值" prop="configValue">
        <fd-code-editor
          ref="jsonEditor"
          v-model="state.formData.configValue"
          border
          language="application/json"
          line-numbers
        />
      </el-form-item>
      <el-form-item label="是否启用" prop="enabled">
        <el-switch v-model="state.formData.enabled" active-text="是" inactive-text="否"></el-switch>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="state.formData.remark"
          :autosize="{ minRows: 3 }"
          placeholder="请输入备注"
          type="textarea"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="fd-dialog-footer">
        <el-button size="medium" @click="state.visible = false">取消</el-button>
        <el-button size="medium" type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </fd-right-panel>
</template>

<script lang="ts">
export default {
  name: 'SystemConfigEdit'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import useListEdit, { REFRESH_DATA_EVENT } from '@/components/crud/use-list-edit'
import { configDicts, configFields, configGetOne, configPostOne, configPutOne } from '@/api/system/config'
import FdCodeEditor from '@/components/code-editor/index.vue'
import { nextFrame } from '@/utils/next-frame'
import { cleanStr, formatJson } from '@/utils/lang'

const jsonEditor = ref()

const stateOption = {
  idField: configFields.idField,
  getApi: configGetOne,
  postApi: configPostOne,
  putApi: configPutOne,
  dicts: configDicts,
  resetFormData: {
    id: '',
    configTypeDict: '',
    configKey: '',
    configValue: '',
    enabled: false,
    remark: ''
  },
  formRule: {
    configKey: [{ required: true, message: '键不能为空', trigger: 'blur' }],
    configValue: [{ required: true, message: '值不能为空', trigger: 'blur' }]
  },
  json: ''
}

const emit = defineEmits([REFRESH_DATA_EVENT])

const { mixRefs, mixState: state, mixMethods } = useListEdit(stateOption, emit)
const { form } = mixRefs
const { open, submit, hideDialog, onBeforeOpen, onBeforeSubmitData } = mixMethods

onBeforeOpen(async () => {
  if (state.isCreate) {
    nextFrame(() => {
      ;(jsonEditor.value as any).refresh()
    })
  } else {
    state.formData.configValue = formatJson(state.formData.configValue)
  }
})

onBeforeSubmitData(async () => {
  if (state.formData.configValue) {
    state.formData.configValue = cleanStr(state.formData.configValue)
  }
})

defineExpose({
  open
})
</script>

<style lang="scss" scoped>
.el-form-item.json-editor-form-item {
  ::v-deep(.el-form-item__content) {
    min-height: 75px;
    overflow: hidden;
    .fd-code-editor {
      height: 100%;
    }
  }
}
</style>
