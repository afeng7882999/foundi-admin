<template>
  <el-dialog v-model="visible" :append-to-body="true" title="绑定邮箱">
    <el-form ref="form" :model="formData" :rules="formRule" label-width="80px">
      <el-form-item label="新邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱地址"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="fd-dialog__footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import useEdit, { REFRESH_DATA_EVENT } from '@b/crud/hooks/use-edit'
import { validEmail } from '@b/utils/validate'
import { currentChangeEmail, currentCheckEmail } from '@b/api/system/user'
import { Indexable } from '@b/common/types'

export default defineComponent({
  name: 'UserProfileChangeEmail',
  emits: [REFRESH_DATA_EVENT],
  setup(props, { emit }) {
    const validateEmail = async (rule: any, value: string, callback: any) => {
      if (value && value !== '' && !validEmail(value)) {
        callback(new Error('请输入正确的邮件地址'))
      } else {
        try {
          const canUse = await currentCheckEmail(value)
          if (!canUse) {
            callback(new Error('邮箱地址已经使用'))
          } else {
            callback()
          }
        } catch (e) {
          callback(new Error('验证邮箱地址出错'))
        }
      }
    }

    const stateOption = {
      postApi: async (form: Indexable) => {
        await currentChangeEmail(form.email)
      },
      resetFormData: {
        email: ''
      },
      formRule: {
        email: [{ required: true, validator: validateEmail, trigger: 'blur' }]
      }
    }

    const { editRefs, editState, editMethods } = useEdit(stateOption, emit)

    editMethods.open = async () => {
      editState.isCreate = true
      editMethods.resetForm()
      editState.visible = true
    }

    return {
      ...editRefs,
      ...toRefs(editState),
      ...editMethods
    }
  }
})
</script>
