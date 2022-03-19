<template>
  <el-dialog v-model="visible" :append-to-body="true" title="创建密码" width="570px" @closed="hideDialog">
    <el-form ref="form" :model="formData" :rules="formRule" label-width="80px">
      <el-form-item label="新密码" prop="password">
        <el-input v-model="formData.password" placeholder="长度6-20,可包含字母,数字,下划线" show-password></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="checkPass">
        <el-input v-model="formData.checkPass" placeholder="与新密码一致" show-password></el-input>
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
import useEdit, { REFRESH_DATA_EVENT } from '@/extend/crud/use-edit'
import { currentAddPassword } from '@/api/system/user'
import { validPassword } from '@/utils/validate'
import { omit } from 'lodash-es'

export default defineComponent({
  name: 'UserProfileAddPassword',
  emits: [REFRESH_DATA_EVENT],
  setup(props, { emit }) {
    const validatePassword = (rule: any, value: string, callback: any) => {
      if (!value) {
        callback(new Error('密码不能为空'))
      } else if (!validPassword(value)) {
        callback(new Error('请输入长度6-20的密码(可包含字母,数字,下划线)'))
      } else {
        callback()
      }
    }

    const validateCheckPass = (rule: any, value: string, callback: any) => {
      if (!value || value !== mixState.formData.password) {
        callback(new Error('两次输入密码必须一致'))
      } else {
        callback()
      }
    }

    const stateOption = {
      postApi: currentAddPassword,
      resetFormData: {
        password: '',
        checkPass: ''
      },
      formRule: {
        password: [{ required: true, validator: validatePassword, trigger: 'blur' }],
        checkPass: [{ required: true, validator: validateCheckPass, trigger: 'blur' }]
      }
    }

    const { mixRefs, mixState, mixMethods } = useEdit(stateOption, emit)

    mixMethods.open = async () => {
      mixState.isCreate = true
      mixMethods.resetForm()
      mixState.visible = true
    }

    mixMethods.onBeforeSubmitData(async () => {
      mixState.formData = omit(mixState.formData, ['checkPass'])
    })

    return {
      ...mixRefs,
      ...toRefs(mixState),
      ...mixMethods,
      validatePassword,
      validateCheckPass
    }
  }
})
</script>
