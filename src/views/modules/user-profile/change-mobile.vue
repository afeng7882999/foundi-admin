<template>
  <el-dialog v-model="visible" :append-to-body="true" title="绑定手机">
    <el-form ref="form" :model="formData" :rules="formRule" label-width="80px">
      <el-form-item label="新号码" prop="mobile">
        <el-input v-model="formData.mobile" placeholder="请输入手机号"></el-input>
      </el-form-item>
      <el-form-item class="btn-input" label="验证码" prop="code">
        <el-input v-model="formData.code" placeholder="验证码">
          <template #append>
            <fd-count-down-button :button-prop="{ type: 'primary' }" :disable-time="30" @count-down-button-click="getResetValidCode"></fd-count-down-button>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="fd-dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import useListEdit, { REFRESH_DATA_EVENT } from '@/components/crud/use-list-edit'
import { validMobile } from '@/utils/validate'
import FdCountDownButton from '@/components/count-down-button/index.vue'
import { currentChangeMobile, currentChangeMobileValid, currentCheckMobile } from '@/api/system/user'
import { ElMessage } from 'element-plus'
import { AnyObject } from '@/utils'

export default defineComponent({
  name: 'UserProfileChangeMobile',
  components: { FdCountDownButton },
  emits: [REFRESH_DATA_EVENT],
  setup(props, { emit }) {
    const validateMobile = async (rule: any, value: string, callback: any) => {
      if (!value || value === '') {
        callback(new Error('手机号码不能为空'))
      } else if (!validMobile(value)) {
        callback(new Error('请输入正确的手机号码'))
      } else {
        try {
          const canUse = await currentCheckMobile(value)
          if (!canUse) {
            callback(new Error('手机号已经被占用'))
          } else {
            callback()
          }
        } catch (e) {
          callback(new Error(e.msg))
        }
      }
    }

    const stateOption = {
      postApi: async (form: AnyObject) => {
        await currentChangeMobile(form.code, form.mobile)
      },
      resetFormData: {
        code: '',
        mobile: ''
      },
      formRule: {
        mobile: [{ required: true, validator: validateMobile, trigger: 'blur' }],
        code: [{ required: true, trigger: 'blur', message: '验证码不能为空' }]
      }
    }

    const { mixRefs, mixState, mixMethods } = useListEdit(stateOption, emit)

    mixMethods.open = async () => {
      mixState.isCreate = true
      mixMethods.resetForm()
      mixState.visible = true
    }

    const getResetValidCode = () => {
      ;(mixRefs.form.value as any).validateField('mobile', async (isValid?: any) => {
        if (isValid) {
          // if isValid contains error message
          return
        }
        try {
          await currentChangeMobileValid(mixState.formData.mobile)
          ElMessage({
            message: '验证码已发送至' + '手机' + mixState.formData.mobile,
            type: 'success',
            duration: 1500
          })
        } catch (e) {
          console.log(e)
        }
      })
    }

    return {
      ...mixRefs,
      ...toRefs(mixState),
      ...mixMethods,
      getResetValidCode
    }
  }
})
</script>
