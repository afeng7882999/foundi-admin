<template>
  <fd-drawer v-model="s.visible" :title="s.isCreate ? '新增系统配置' : '修改系统配置'" size="600px" @closed="m.hideDialog">
    <fd-form ref="form" :model="s.formData" :rules="s.formRules" label-width="80px">
      <fd-item-dict label="配置分类" prop="configTypeDict" :dict="s.dicts.sysConfigType" />
      <fd-item label="键" prop="configKey" />
      <fd-item-json label="值" prop="configValue" />
      <fd-item-boolean label="是否启用" prop="enabled" />
      <fd-item-multiline label="备注" prop="remark" />
    </fd-form>
    <template #footer>
      <el-button @click="s.visible = false">取消</el-button>
      <el-button type="primary" @click="m.submit">确定</el-button>
    </template>
  </fd-drawer>
</template>

<script lang="ts">
export default {
  name: 'SystemConfigEdit'
}
</script>

<script setup lang="ts">
import useEdit, { REFRESH_DATA_EVENT } from '@/crud/hooks/use-edit'
import { Config, configDicts, configFields, configGetOne, configPostOne, configPutOne } from '@/api/system/config'

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
    enabled: undefined,
    remark: ''
  } as Partial<Config>,
  formRules: {
    configKey: [{ required: true, message: '键不能为空', trigger: 'blur' }],
    configValue: [{ required: true, message: '值不能为空', trigger: 'blur' }]
  }
}

const emit = defineEmits([REFRESH_DATA_EVENT])

const { editRefs, editState: s, editMethods: m } = useEdit<Config>(stateOption, emit)
const { form } = editRefs

defineExpose({
  open: m.open
})
</script>
