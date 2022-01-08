<template>
  <login-layout>
    <template #default>
      <div class="page-register-card vivify fadeIn duration-300">
        <div class="page-login-card__img">
          <!--          <img class="img-text" alt="text" src="/static/img/text.png" />-->
        </div>
        <div class="register-card-content">
          <div class="card-header">
            <fd-page-header icon="people" title="用户注册"></fd-page-header>
            <div class="card-header-act"></div>
          </div>
          <div class="card-content">
            <el-form ref="registerForm" :model="state.registerData" :rules="state.submitRules" class="card-content__form" label-width="80px">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="state.registerData.username" placeholder="长度5-20,字母开头,可包含字母,数字,下划线,点"></el-input>
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="state.registerData.email" placeholder="请输入邮箱地址"></el-input>
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input v-model="state.registerData.password" placeholder="长度6-20,可包含字母,数字,下划线" type="password"></el-input>
              </el-form-item>
              <el-form-item label="确认密码" prop="checkPass">
                <el-input v-model="state.registerData.checkPass" placeholder="与密码一致" type="password"></el-input>
              </el-form-item>
            </el-form>
            <el-checkbox v-model="state.privacyAgree" class="card-content__agreement">
              注册登录即表示同意
              <a class="content-agreement__link" @click.prevent="showAgreement()">用户协议</a>
              和
              <a class="content-agreement__link" @click.prevent="showPrivacy()">隐私政策</a>
            </el-checkbox>
            <div class="card-content__act">
              <el-button class="content-act__direct" @click="goLogin">
                <fd-icon class="is-in-btn large" icon="two-dimensional-code"></fd-icon>
                登录页直接扫码登录
              </el-button>
              <el-button class="content-act__submit" type="primary" @click="submit">注册</el-button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </login-layout>
  <user-agreement-dialog ref="userAgreementDialog"></user-agreement-dialog>
</template>

<script lang="ts">
export default {
  name: 'Register'
}
</script>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { validEmail, validPassword, validUsername } from '@/utils/validate'
import { checkEmail, checkUsername, register } from '@/api/system/login'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import LoginLayout from '@/views/modules/login/login-layout.vue'
import UserAgreementDialog from './agreement.vue'

const registerForm = ref()
const userAgreementDialog = ref()

const validateUsername = async (rule: any, value: string, callback: any) => {
  if (!value || value === '') {
    callback(new Error('用户名不能为空'))
  } else if (!validUsername(value)) {
    callback(new Error('请输入长度5-20，汉字、字母开头的用户名(可包含字母, 数字, "_", ".")'))
  } else {
    try {
      const canUse = await checkUsername(value)
      if (!canUse) {
        callback(new Error('用户名已经被占用'))
      } else {
        callback()
      }
    } catch (e) {
      callback(new Error(e.msg))
    }
  }
}

const validateEmail = async (rule: any, value: string, callback: any) => {
  if (!value || value === '') {
    callback(new Error('邮箱地址不能为空'))
  } else if (!validEmail(value)) {
    callback(new Error('请输入正确邮箱地址'))
  } else {
    try {
      const canUse = await checkEmail(value)
      if (!canUse) {
        callback(new Error('邮箱地址已经使用'))
      } else {
        callback()
      }
    } catch (e) {
      callback(new Error(e.msg))
    }
  }
}

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
  if (!value || value !== state.registerData.password) {
    callback(new Error('两次输入密码必须一致'))
  } else {
    callback()
  }
}

const state = reactive({
  registerData: {
    username: '',
    email: '',
    password: '',
    checkPass: ''
  },
  privacyAgree: false,
  submitRules: {
    username: [{ required: true, validator: validateUsername, trigger: 'blur' }],
    email: [{ required: true, validator: validateEmail, trigger: 'blur' }],
    password: [{ required: true, validator: validatePassword, trigger: 'blur' }],
    checkPass: [{ required: true, validator: validateCheckPass, trigger: 'blur' }]
  }
})

const router = useRouter()

const submit = async () => {
  try {
    await (registerForm.value as any).validate()
    if (!state.privacyAgree) {
      ElMessage({ message: '请确认同意用户协议、隐私政策', type: 'warning', duration: 1500 })
      return
    }
    await register({
      username: state.registerData.username,
      email: state.registerData.email,
      password: state.registerData.password
    })
    ElMessage({
      message: '成功注册, 正在转到登录页面...',
      type: 'success',
      duration: 2500,
      onClose: () => {
        router.push('/login')
      }
    })
  } catch (e) {
    console.log(e)
  }
}

const showAgreement = () => {
  userAgreementDialog.value.show(true)
}

const showPrivacy = () => {
  userAgreementDialog.value.show(false)
}

const goLogin = () => {
  router.push('/login')
}
</script>

<style lang="scss">
@use 'src/assets/style/variable' as *;
@use 'src/assets/style/mixin' as *;

.page-register-card {
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

  .register-card-content {
    flex: 4;
    padding: 20px;

    .card-header {
      display: flex;
      padding: 0 20px 0 0;

      .fd-page-header {
        flex: 1;
      }

      .card-header-act {
        display: inline-block;
        align-self: flex-end;
        margin-bottom: 26px;
        height: 24px;
        line-height: 24px;
        font-size: $font-size-small;
        color: $color-text-secondary;
      }
    }

    .card-content {
      display: flex;
      width: 100%;
      height: 430px;
      padding: 40px 0 40px 0;
      flex-direction: column;
      align-items: flex-start;

      .card-content__form {
        width: 100%;
        padding: 0 20px 0 0;
      }

      .el-checkbox.card-content__agreement {
        align-self: flex-end;
        padding: 0 20px 0 0;
        color: $color-text-secondary;
        cursor: default;

        .el-checkbox__label {
          font-size: $font-size-small;
        }

        .el-checkbox__input.is-checked + .el-checkbox__label {
          color: $color-text-secondary;
        }

        a.content-agreement__link {
          color: var(--el-color-primary);
        }
      }

      .card-content__act {
        display: flex;
        align-self: flex-end;
        width: 100%;
        padding: 40px 20px 0 80px;

        .content-act__direct {
          flex: 1;
          padding: 9px 20px;

          span {
            display: flex;
            align-items: center;
            justify-content: center;

            .fd-icon.is-in-btn.large {
              font-size: 20px;
            }
          }
        }

        .content-act__submit {
          flex: 1;
        }
      }
    }
  }
}
</style>
