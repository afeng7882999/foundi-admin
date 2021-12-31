<template>
  <el-dialog v-model="visible" :close-on-click-modal="false" :title="isCreate ? '新增' : '修改'" @closed="resetForm">
    <el-form ref="form" :model="formData" :rules="formRule" label-width="100px" size="medium" @keyup.enter="submit()">
      <el-form-item label="字典ID" prop="dictId">
        <el-input v-model="formData.dictId" disabled placeholder="请输入字典ID"></el-input>
      </el-form-item>
      <el-form-item label="字典项键值" prop="itemKey">
        <el-input v-model="formData.itemKey" placeholder="请输入字典项键值"></el-input>
      </el-form-item>
      <el-form-item label="字典项值" prop="itemValue">
        <el-input v-model="formData.itemValue" placeholder="请输入字典项值"></el-input>
      </el-form-item>
      <el-form-item label="备注信息" prop="remarks">
        <el-input v-model="formData.remarks" placeholder="请输入备注信息"></el-input>
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
import useListEdit, { REFRESH_DATA_EVENT } from '@/components/crud/use-list-edit'
import { dictItemFields, dictItemGetOne, dictItemPostOne, dictItemPutOne } from '@/api/system/dict-item.ts'

export default defineComponent({
  name: 'SystemDictItemEdit',
  emits: [REFRESH_DATA_EVENT],
  setup(props, { emit }) {
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

    const { mixRefs, mixState, mixMethods } = useListEdit(stateOption, emit)

    // create/edit dialog
    const openDictItemEdit = async (dictId: string, id: string) => {
      mixState.formData.dictId = dictId
      mixState.resetFormData.dictId = dictId
      await mixMethods.open(id)
    }

    return {
      ...mixRefs,
      ...toRefs(mixState),
      ...mixMethods,
      openDictItemEdit
    }
  }
})
</script>
