<template>
  <login-layout>
    <template #default>
      <div class="forgot-password-card vivify fadeIn duration-300">
        <div class="page-login-card__img">
          <!--          <img class="img-text" alt="text" src="/static/img/text.png" />-->
        </div>
        <div class="forgot-password-card__content">
          <fd-page-header icon="key" title="重置密码"></fd-page-header>
          <el-steps :active="state.step" class="steps" finish-status="success">
            <el-step description="输入重置密码的账号" title="输入账号"></el-step>
            <el-step description="请选择重置密码方式" title="重置方式"></el-step>
            <el-step description="通过验证设置新密码" title="设置密码"></el-step>
            <el-step description="完成设置" title="完成"></el-step>
          </el-steps>
          <div v-if="state.step === 0" class="step-content">
            <el-form
              ref="userForm"
              :model="state.userParam"
              class="step-content__form"
              label-width="80px"
              @keyup.enter="checkUsername"
              @submit.prevent
            >
              <el-form-item :error="state.usernameError" label="用户名" prop="username">
                <el-input v-model="state.userParam.username" placeholder="请输入需重置密码的用户名"></el-input>
              </el-form-item>
            </el-form>
            <div class="step-content__act">
              <el-button type="primary" @click="checkUsername">
                下一步
                <fd-icon icon="right"></fd-icon>
              </el-button>
            </div>
          </div>
          <div v-if="state.step === 1" class="step-content">
            <div class="step-content__form">
              <div class="form-main">
                <el-button v-if="state.email" class="form-main__btn-large" @click="resetByEmail">
                  <fd-icon icon="mail"></fd-icon>
                  <span>通过邮箱重置密码</span>
                </el-button>
                <el-button v-if="state.mobile" class="form-main__btn-large" @click="resetByMobile">
                  <fd-icon icon="message-one"></fd-icon>
                  <span>通过手机短信重置密码</span>
                </el-button>
              </div>
            </div>
            <div class="step-content__act">
              <el-button plain @click="stepBackward">
                <fd-icon icon="left"></fd-icon>
                上一步
              </el-button>
              <el-button disabled type="primary" @click="resetPassword">
                下一步
                <fd-icon icon="right"></fd-icon>
              </el-button>
            </div>
          </div>
          <div v-if="state.step === 2" class="step-content">
            <el-form ref="submitForm" :model="state.submitParam" :rules="state.submitRules" class="step-content__form" label-width="80px">
              <el-form-item class="step-content__btn-input" label="验证码" prop="code">
                <el-input v-model="state.submitParam.code" :placeholder="validPrompt"></el-input>
                <fd-count-down-button
                  ref="countDownButton"
                  :button-prop="{ type: 'primary' }"
                  :disable-time="20"
                  @click="getResetValid"
                ></fd-count-down-button>
              </el-form-item>
              <el-form-item label="新密码" prop="password">
                <el-input v-model="state.submitParam.password" placeholder="长度6-20,可包含字母,数字,下划线" show-password></el-input>
              </el-form-item>
              <el-form-item label="确认密码" prop="checkPass">
                <el-input v-model="state.submitParam.checkPass" placeholder="与新密码一致" show-password></el-input>
              </el-form-item>
            </el-form>
            <div class="step-content__act">
              <el-button plain @click="stepBackward">
                <fd-icon icon="left"></fd-icon>
                上一步
              </el-button>
              <el-button type="primary" @click="resetPassword">
                下一步
                <fd-icon icon="right"></fd-icon>
              </el-button>
            </div>
          </div>
          <div v-if="state.step === 3" class="step-content">
            <div class="step-content__success vivify popIn">
              <fd-icon icon="success-tick"></fd-icon>
              <span>重置密码完成, 请重新登录！</span>
            </div>
            <div class="step-content__act">
              <el-button type="primary" @click="goLogin">
                重新登录
                <fd-icon icon="right"></fd-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </login-layout>
</template>

<script lang="ts">
export default {
  name: 'ForgotPassword'
}
</script>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { validPassword, validUsername } from '@b/utils/validate'
import FdCountDownButton from '@/components/count-down-button/index.vue'
import { checkUserExist, sendResetPasswordCode, resetPassword as _resetPassword } from '@b/api/system/login'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import LoginLayout from '@/views/modules/login/login-layout.vue'

const userForm = ref()
const submitForm = ref()
const countDownButton = ref()

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
  if (!value || value !== state.submitParam.password) {
    callback(new Error('两次输入密码必须一致'))
  } else {
    callback()
  }
}

const state = reactive({
  userParam: {
    username: ''
  },
  usernameError: '',
  submitParam: {
    username: 'admin',
    code: '',
    password: '',
    checkPass: ''
  },
  submitRules: {
    code: [{ required: true, trigger: 'blur', message: '验证码不能为空' }],
    password: [{ required: true, trigger: 'blur', validator: validatePassword }],
    checkPass: [{ required: true, trigger: 'blur', validator: validateCheckPass }]
  },
  step: 0,
  mobile: '',
  email: '',
  byEmail: true,
  loading: false,
  pwdType: 'password',
  redirect: ''
})

const validPrompt = computed(() => {
  return state.byEmail ? '通过邮箱' + state.email + '接收' : '通过手机' + state.mobile + '接收'
})

onMounted(() => {
  state.step = 0
  state.byEmail = true
})

const validateUsername = async (value: string) => {
  if (!value || value === '') {
    state.usernameError = '用户名不能为空'
    return Promise.reject(state.usernameError)
  }
  if (!validUsername(value)) {
    state.usernameError = '此用户未注册'
    return Promise.reject(state.usernameError)
  }
  const { exist, mobile, email } = await checkUserExist(value)
  if (exist) {
    state.usernameError = ''
    state.mobile = mobile
    state.email = email
    return Promise.resolve()
  }
  state.usernameError = '此用户未注册'
  return Promise.reject(state.usernameError)
}

const checkUsername = async () => {
  try {
    await validateUsername(state.userParam.username)
    state.step = state.step + 1
  } catch (e) {
    console.log(e)
  }
}

const resetByEmail = () => {
  state.byEmail = true
  state.step = state.step + 1
}

const resetByMobile = () => {
  state.byEmail = false
  state.step = state.step + 1
}

const getResetValid = async () => {
  try {
    ;(countDownButton.value as any).countDown()
    await sendResetPasswordCode(state.userParam.username, state.byEmail ? 'email' : 'mobile')
    const prompt = state.byEmail ? '邮箱' + state.email : '手机' + state.mobile
    ElMessage({
      message: '验证码已发送至' + prompt,
      type: 'success',
      duration: 1500
    })
  } catch (e) {
    console.log(e)
  }
}

const resetPassword = async () => {
  try {
    await (submitForm.value as any).validate()
    await _resetPassword({
      username: state.userParam.username,
      code: state.submitParam.code,
      type: state.byEmail ? 'email' : 'mobile',
      password: state.submitParam.password
    })
    state.step++
  } catch (e) {
    console.log(e)
  }
}

const stepBackward = () => {
  state.step -= 1
}

const router = useRouter()

const goLogin = () => {
  router.push('/login')
}
</script>

<style lang="scss" scoped>
@use '../base/src/assets/style/variable' as *;
@use '../base/src/assets/style/mixin' as *;

.forgot-password-card {
  display: flex;
  min-width: 600px;
  width: 800px;
  height: 500px;
  margin: 20px;
  background-color: $color-white;
  box-shadow: $real-shadow-base;

  .page-login-card__img {
    flex: 1;
    text-align: center;
    background: rgba(95, 171, 255, 0.77) url('/static/img/back02.jpg') 50%;
    background-size: cover;

    &:after {
      display: block;
      content: '';
      width: 100%;
      height: 100%;
      background-color: rgba(95, 171, 255, 0.4);
      top: 0;
      left: 0;
      z-index: -1;
    }

    .img-text {
      position: absolute;
      width: 300px;
      margin-top: 200px;
      margin-left: -150px;
    }
  }

  .forgot-password-card__content {
    flex: 4;
    padding: 20px;

    .steps {
      margin: 40px 20px 0 20px;
    }

    .step-content {
      display: flex;
      width: 100%;
      height: 340px;
      padding: 40px 0 40px 0;
      flex-direction: column;
      align-items: center;

      .form-main {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0 0 0 40px;

        .form-main__btn-large {
          width: 100%;
          height: 60px;
          margin: 20px 30px 0 30px;

          ::v-deep(span) {
            display: flex;
            align-items: center;

            .fd-icon {
              width: 30px;
              height: 30px;
            }

            span {
              margin-left: 10px;
            }
          }
        }
      }

      .step-content__form {
        flex: 1;
        width: 100%;
        padding: 0 50px 0 10px;

        .step-content__btn-input {
          ::v-deep(.el-form-item__content) {
            display: flex;
            flex-direction: row;

            .el-input {
              flex: 1;
            }
          }
        }
      }

      .step-content__act {
        align-self: flex-end;
        margin: 0 50px 0 0;
      }

      .step-content__success {
        flex: 1;
        width: 100%;

        .fd-icon {
          width: 100%;
          height: 120px;
          margin: 20px 0 20px 0;
          color: var(--el-color-success);
        }

        span {
          display: inline-block;
          width: 100%;
          text-align: center;
          color: var(--el-color-success);
        }
      }
    }
  }
}
</style>
