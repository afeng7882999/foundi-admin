<template>
  <el-dialog v-model="state.visible" :close-on-click-modal="false" :title="state.isCreate ? '新增' : '修改'" @closed="hideDialog">
    <el-form ref="form" :model="state.formData" :rules="state.formRule" label-width="100px">
      <el-form-item label="上级用户组" prop="parentId">
        <fd-tree-select
          v-model="state.formData.parentId"
          :data-list="state.parentList"
          :tree-fields="{ labelField: 'name' }"
          style="width: 100%"
        ></fd-tree-select>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model="state.formData.sort" placeholder="请输入排序"></el-input>
      </el-form-item>
      <el-form-item label="用户组名称" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入用户组名称"></el-input>
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
  name: 'SystemGroupEdit'
}
</script>

<script setup lang="ts">
import { groupFields, groupTreeFields, groupList, groupGetOne, groupPostOne, groupPutOne, Group } from '@b/api/system/group'
import useEdit, { REFRESH_DATA_EVENT } from '@b/crud/hooks/use-edit'

const emit = defineEmits([REFRESH_DATA_EVENT])

const stateOption = {
  treeTable: true,
  idField: groupFields.idField,
  treeFields: groupTreeFields,
  getApi: groupGetOne,
  listApi: groupList,
  postApi: groupPostOne,
  putApi: groupPutOne,
  resetFormData: {
    id: '',
    parentId: '',
    sort: 0,
    name: ''
  },
  formRule: {
    parentId: [{ required: true, message: '上级用户组ID不能为空', trigger: 'blur' }],
    name: [{ required: true, message: '用户组名称不能为空', trigger: 'blur' }]
  }
}

const { editRefs, editState: state, editMethods } = useEdit<Group>(stateOption, emit)
const { form } = editRefs
const { open, submit, hideDialog } = editMethods

defineExpose({
  open
})
</script>
