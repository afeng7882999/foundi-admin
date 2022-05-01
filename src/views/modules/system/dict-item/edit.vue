<template>
  <el-dialog v-model="state.visible" :close-on-click-modal="false" :title="state.isCreate ? '新增' : '修改'" @closed="resetForm">
    <el-form ref="form" :model="state.formData" :rules="state.formRule" label-width="100px" @keyup.enter="submit()">
      <el-form-item label="字典ID" prop="dictId">
        <el-input v-model="state.formData.dictId" disabled placeholder="请输入字典ID"></el-input>
      </el-form-item>
      <el-form-item label="字典项键值" prop="itemKey">
        <el-input v-model="state.formData.itemKey" placeholder="请输入字典项键值"></el-input>
      </el-form-item>
      <el-form-item label="字典项值" prop="itemValue">
        <el-input v-model="state.formData.itemValue" placeholder="请输入字典项值"></el-input>
      </el-form-item>
      <el-form-item label="备注信息" prop="remarks">
        <el-input v-model="state.formData.remarks" placeholder="请输入备注信息"></el-input>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model="state.formData.sort" placeholder="请输入排序"></el-input>
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
  name: 'SystemDictItemEdit'
}
</script>

<script setup lang="ts">
import useEdit, { REFRESH_DATA_EVENT } from '@/crud/hooks/use-edit'
import { dictItemFields, dictItemGetOne, dictItemPostOne, dictItemPutOne } from '@/api/system/dict-item'

const emit = defineEmits([REFRESH_DATA_EVENT])

const stateOption = {
  idField: dictItemFields.idField,
  getApi: dictItemGetOne,
  postApi: dictItemPostOne,
  putApi: dictItemPutOne,
  resetFormData: {
    id: '',
    dictId: '',
    itemKey: '',
    itemValue: '',
    remarks: '',
    sort: 0
  },
  formRule: {
    dictId: [{ required: true, message: '字典ID不能为空', trigger: 'blur' }],
    itemKey: [{ required: true, message: '字典项键值不能为空', trigger: 'blur' }],
    itemValue: [{ required: true, message: '字典项值不能为空', trigger: 'blur' }]
  }
}

const { editRefs, editState: state, editMethods } = useEdit(stateOption, emit)
const { form } = editRefs
const { open, resetForm, submit } = editMethods

// create/edit dialog
const openDictItemEdit = async (dictId: string, id: string) => {
  state.formData.dictId = dictId
  state.resetFormData.dictId = dictId
  await open(id)
}

defineExpose({
  openDictItemEdit
})
</script>
