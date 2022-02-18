<template>
  <el-dialog custom-class="fd-captcha-dialog" v-model="state.visible" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false" :center="false" title="" :width="200" @closed="hideDialog">
    <div class="fd-captcha-dialog__img">
      <img :src="state.captchaUrl" alt="" @click="getCaptcha" />
    </div>
    <div v-if="state.captcha.extra" class="fd-captcha-dialog__extra">
      <span>{{ state.captcha.extra }}</span>
    </div>
    <el-form :model="state.captcha" :rules="state.captchaRule" label-position="left" label-width="0px" ref="captchaForm">
      <el-form-item prop="code">
        <el-input v-model="state.captcha.code" auto-complete="off" placeholder="" @keyup.enter="submit">
          <template #prefix>
            <span class="icon-in-input">
              <fd-icon icon="protect" />
            </span>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="fd-dialog-footer">
        <el-button type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: 'FdCaptchaDialog'
}
</script>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { getCaptcha as _getCaptcha, verifyCaptcha } from '@/api/system/login'

const captchaForm = ref()
const state = reactive({
  captchaUrl: '',
  captcha: {
    code: '',
    uuid: '',
    extra: ''
  },
  captchaRule: {
    code: [{ required: true, trigger: 'blur', message: '验证码不能为空' }]
  },
  visible: false
})

const open = async () => {
  resetForm()
  await getCaptcha()
  state.visible = true
}

const getCaptcha = async () => {
  try {
    const { img, uuid, extra } = await _getCaptcha()
    state.captchaUrl = img
    state.captcha.uuid = uuid
    state.captcha.extra = extra
  } catch (e) {
    console.log(e)
  }
}

const emit = defineEmits(['verify-captcha'])
const submit = async () => {
  await (captchaForm.value as any).validate()
  try {
    await verifyCaptcha(state.captcha.uuid, state.captcha.code)
    emit('verify-captcha', state.captcha.uuid)
    hideDialog()
  } catch (e) {
    await getCaptcha()
    console.log(e)
  }
}

const hideDialog = () => {
  state.visible = false
  resetForm()
}

const resetForm = () => {
  state.captchaUrl = ''
  state.captcha.code = ''
  state.captcha.uuid = ''
}

defineExpose({
  open
})
</script>

<style lang="scss">
@use 'src/assets/style/variable.scss' as *;

.fd-captcha-dialog {
  width: 300px;

  &__img img {
    width: 250px;
    height: 200px;
    border: 1px solid var(--el-border-color-base);
    border-radius: var(--el-border-radius-base);
  }

  &__extra {
    padding: 5px 0;
  }
}
</style>
