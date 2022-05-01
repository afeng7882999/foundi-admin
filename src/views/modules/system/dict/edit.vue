<template>
  <el-dialog v-model="state.visible" :close-on-click-modal="false" :title="state.isCreate ? '新增' : '修改'">
    <el-form ref="form" :model="state.formData" :rules="state.formRule" label-width="90px" @keyup.enter="submit()">
      <el-form-item label="字典名" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入字典名"></el-input>
      </el-form-item>
      <el-form-item label="字典中文名" prop="nameCn">
        <el-input v-model="state.formData.nameCn" placeholder="请输入字典中文名"></el-input>
      </el-form-item>
      <el-form-item label="备注信息" prop="remarks">
        <el-input v-model="state.formData.remarks" placeholder="请输入备注信息"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="fd-dialog__footer">
        <el-button @click="state.visible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: 'SystemDictEdit'
}
</script>

<script setup lang="ts">
import useEdit, { REFRESH_DATA_EVENT } from '@/crud/hooks/use-edit'
import { Dict, dictFields, dictGetOne, dictPostOne, dictPutOne } from '@/api/system/dict'

const stateOption = {
  idField: dictFields.idField,
  getApi: dictGetOne,
  postApi: dictPostOne,
  putApi: dictPutOne,
  resetFormData: {
    id: '',
    name: '',
    nameCn: '',
    remarks: ''
  },
  formRule: {
    name: [{ required: true, message: '字典名不能为空', trigger: 'blur' }]
  }
}
const emit = defineEmits([REFRESH_DATA_EVENT])

const { editRefs, editState: state, editMethods } = useEdit<Dict>(stateOption, emit)
const { form } = editRefs
const { open, submit } = editMethods

defineExpose({
  open
})
</script>
