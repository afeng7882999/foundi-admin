<template>
  <el-dialog v-model="visible" :close-on-click-modal="false" :title="isCreate ? '新增' : '修改'" @closed="hideDialog">
    <el-form ref="form" :model="formData" :rules="formRule" label-width="100px" size="medium" @keyup.enter="submit">
      <el-form-item label="用户组名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入用户组名称"></el-input>
      </el-form-item>
      <el-form-item label="上级用户组" prop="parentId">
        <fd-tree-select v-model="formData.parentId" :data-list="parentList" :tree-fields="{ labelField: 'name' }" style="width: 100%"></fd-tree-select>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model="formData.sort" placeholder="请输入排序"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="fd-dialog-footer">
        <el-button size="medium" @click="visible = false">取消</el-button>
        <el-button size="medium" type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import useTreeEdit, { REFRESH_DATA_EVENT } from '@/components/crud/use-tree-edit'
import { groupFields, groupGetOne, groupList, groupPostOne, groupPutOne, groupTreeFields } from '@/api/system/group'

export default defineComponent({
  name: 'SystemGroupEdit',
  emits: [REFRESH_DATA_EVENT],
  setup(props, { emit }) {
    const stateOption = {
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
        name: [{ required: true, message: '用户组名称不能为空', trigger: 'blur' }]
      }
    }

    const { mixRefs, mixState, mixMethods } = useTreeEdit(stateOption, emit)

    return {
      ...mixRefs,
      ...toRefs(mixState),
      ...mixMethods
    }
  }
})
</script>
