<template>
  <login-layout>
    <template #default>
      <div class="page-login-card vivify driveInTop delay-500 duration-700">
        <div class="page-login-card__img">
          <img alt="text" class="img-text" src="/static/img/text.png" />
        </div>
        <div class="page-login-card__form">
          <div class="form-header">
            <div class="form-header__logo">{{ loginTypePrompt }}</div>
            <el-button v-if="!showQrcode" class="form-header__btn" type="text" @click="toggleLoginType">
              <fd-icon :icon="loginType === 'password' ? 'iphone' : 'computer'"></fd-icon>
              {{ loginType === 'password' ? '手机登录' : '密码登陆' }}
            </el-button>
            <el-button v-if="showQrcode" class="form-header__close" type="text" @click="closeQrcode">
              <fd-icon icon="close"></fd-icon>
              关闭
            </el-button>
          </div>
          <el-form
            v-if="!showQrcode"
            ref="loginForm"
            :model="loginParam"
            :rules="loginRules"
            auto-complete="on"
            class="form-main"
            label-position="left"
          >
            <el-form-item v-if="loginType === 'password'" class="form-main__item" prop="username">
              <span class="item-svg">
                <fd-icon icon="people"></fd-icon>
              </span>
              <el-input v-model="loginParam.username" name="username" placeholder="用户名/手机号/邮箱" type="text" />
            </el-form-item>
            <el-form-item v-if="loginType === 'password'" class="form-main__item" prop="password">
              <span class="item-svg">
                <fd-icon icon="lock"></fd-icon>
              </span>
              <el-input
                v-model="loginParam.password"
                :type="pwdType"
                auto-complete="on"
                name="password"
                placeholder="密码"
                @keyup.enter="login"
              />
            </el-form-item>
            <el-form-item v-if="loginType === 'mobile'" :error="mobileError" class="form-main__item" prop="mobile">
              <span class="item-svg">
                <fd-icon icon="iphone"></fd-icon>
              </span>
              <el-input v-model="loginParam.mobile" auto-complete="on" name="mobile" placeholder="手机号" type="text" />
            </el-form-item>
            <el-form-item v-if="loginType === 'mobile'" class="form-main__item btn-input" prop="validCode">
              <span class="item-svg">
                <fd-icon icon="message-one"></fd-icon>
              </span>
              <el-input v-model="loginParam.validCode" placeholder="验证码"></el-input>
              <fd-count-down-button
                ref="countDownButton"
                :button-prop="{ type: 'primary' }"
                :disable-time="20"
                @click="getMobileValidCode"
              ></fd-count-down-button>
            </el-form-item>
            <el-checkbox v-model="loginParam.rememberMe" class="login-form__remember-me">记住我</el-checkbox>
            <el-form-item>
              <el-button :loading="loading" style="width: 100%" type="primary" @click="login">
                <span v-if="!loading">登 录</span>
                <span v-else>登 录 中...</span>
              </el-button>
            </el-form-item>
          </el-form>
          <div v-if="showQrcode" class="form-qrcode">
            <fd-qrcode ref="fdQrcode" :expire="120" @refresh-click="refreshQrcode"></fd-qrcode>
          </div>
          <div class="form-more">
            <a v-if="!showQrcode" href="/forgot-password">忘记密码</a>
            <a v-if="!showQrcode" href="/register">没有账号? 马上注册</a>
            <span v-if="showQrcode">请使用微信扫码登录, 点击刷新</span>
          </div>
          <div class="form-third">
            <el-divider>扫码直接登录</el-divider>
            <div class="form-third__act">
              <fd-icon :class="{ selected: loginType === 'weixin' }" icon="wechat" @click="showWeixinQrcode"></fd-icon>
              <fd-icon icon="qq" @click="redirectToQQ"></fd-icon>
              <fd-icon icon="weibo" @click="redirectToWeibo"></fd-icon>
            </div>
          </div>
        </div>
      </div>
    </template>
  </login-layout>
  <fd-captcha-dialog ref="captchaDialog" @verify-captcha="onReturnCaptcha"></fd-captcha-dialog>
</template>

<script lang="ts">
import { userLogin } from '@b/app/account'
import FdCountDownButton from '@/components/count-down-button/index.vue'
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref, toRefs, watch } from 'vue'
import { validMobile } from '@b/utils/validate'
import { useRoute, useRouter } from 'vue-router'
import {
  getQQUrl,
  getWeiboUrl,
  getWeixinUrl,
  loginByMobile as _loginByMobile,
  loginByQQ,
  loginByWeibo,
  loginByWeixin,
  sendMobileCode
} from '@b/api/system/login'
import settings from '@b/app/settings'
import Config from '@b/app/settings'
import { ElMessage } from 'element-plus'
import Cookies from 'js-cookie'
import { encryptByRsa } from '@b/utils/encrypt'
import { AnyFunction } from '@b/common/types'
import FdCaptchaDialog from '@/components/captcha/index.vue'
import LoginLayout from '@/views/modules/login/login-layout.vue'
import FdQrcode from '@b/components/qrcode/index.vue'

export default defineComponent({
  name: 'Login',
  components: {
    LoginLayout,
    FdQrcode,
    FdCountDownButton,
    FdCaptchaDialog
  },
  setup() {
    const loginForm = ref()
    const fdQrcode = ref()
    const captchaDialog = ref()
    const countDownButton = ref()

    const validateUsername = (rule: any, value: string, callback: any) => {
      if (!value) {
        callback(new Error('用户名/手机号/邮箱不能为空'))
      } else {
        callback()
      }
    }

    const validatePass = (rule: any, value: string, callback: any) => {
      if (value.length < 6) {
        callback(new Error('密码不能小于6位'))
      } else {
        callback()
      }
    }

    const validateMobile = (rule: any, value: string, callback: any) => {
      if (!value || value === '') {
        callback(new Error('手机号码不能为空'))
      } else if (!validMobile(value)) {
        callback(new Error('请输入正确的手机号码'))
      } else {
        callback()
      }
    }

    const state = reactive({
      loginParam: {
        username: 'admin',
        password: 'adminadmin',
        rememberMe: false,
        uuid: '',
        mobile: '',
        validCode: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePass }],
        mobile: [{ required: true, trigger: 'blur', validator: validateMobile }],
        validCode: [{ required: true, trigger: 'blur', message: '验证码不能为空' }]
      },
      passwordCookie: '',
      loading: false,
      pwdType: 'password',
      redirect: '',
      loginType: 'password',
      mobileError: '',
      checkLoginRate: 2000, // 2 seconds
      checkLoginTimes: 60, // 2 minutes
      clockForLogin: 0
    })

    const route = useRoute()
    const router = useRouter()

    const loginTypePrompt = computed(() => {
      switch (state.loginType) {
        case 'password':
          return '密码登录 FOUNDi...'
        case 'mobile':
          return '手机登录 FOUNDi...'
        default:
          // weixin
          return '微信登录...'
      }
    })

    const showQrcode = computed(() => {
      return !(state.loginType === 'password' || state.loginType === 'mobile')
    })

    watch(
      route,
      (r) => {
        if (r.query && r.query.redirect) {
          state.redirect = r.query.redirect as string
        }
      },
      { immediate: true }
    )

    onMounted(() => {
      getCookie()
    })

    onBeforeUnmount(() => {
      clearClock()
    })

    const getCookie = () => {
      const username = Cookies.get('username')
      const password = Cookies.get('password')
      const mobile = Cookies.get('mobile')
      const rememberMe = Cookies.get('rememberMe')
      if (username !== undefined) {
        state.loginParam.username = username
      }
      if (password !== undefined) {
        state.passwordCookie = password
        state.loginParam.password = password
      }
      if (mobile != undefined) {
        state.loginParam.mobile = mobile
      }
      if (rememberMe !== undefined) {
        state.loginParam.rememberMe = Boolean(rememberMe)
      }
    }

    const setCookie = () => {
      if (state.loginParam.rememberMe) {
        Cookies.set('username', state.loginParam.username, { expires: Config.passCookieExpires })
        Cookies.set('password', state.passwordCookie, { expires: Config.passCookieExpires })
        Cookies.set('mobile', state.loginParam.mobile, { expires: Config.passCookieExpires })
        Cookies.set('rememberMe', state.loginParam.rememberMe.toString(), { expires: Config.passCookieExpires })
      } else {
        Cookies.remove('username')
        Cookies.remove('password')
        Cookies.remove('mobile')
        Cookies.remove('rememberMe')
      }
    }

    const checkMobile = async (value: string) => {
      if (!value || value === '') {
        state.mobileError = '手机号码不能为空'
        return Promise.reject(state.mobileError)
      }
      if (!validMobile(value)) {
        state.mobileError = '请输入正确的手机号码'
        return Promise.reject(state.mobileError)
      }
      state.mobileError = ''
      return Promise.resolve()
    }

    const getMobileValidCode = async () => {
      try {
        await checkMobile(state.loginParam.mobile)
        ;(countDownButton.value as any).countDown()
        await sendMobileCode(state.loginParam.mobile)
        ElMessage({
          message: '验证码已发送至' + '手机' + state.loginParam.mobile,
          type: 'success',
          duration: 1500
        })
      } catch (e) {
        console.log(e)
      }
    }

    const login = () => {
      if (state.loginType === 'password') {
        loginByPassword()
      } else {
        loginByMobile()
      }
    }

    const loginByPassword = async () => {
      try {
        await (loginForm.value as any).validate()
        state.loading = true
        const user = {
          username: state.loginParam.username,
          password: state.loginParam.password,
          rememberMe: state.loginParam.rememberMe,
          uuid: state.loginParam.uuid
        }
        if (user.password !== state.passwordCookie) {
          user.password = encryptByRsa(user.password)
          state.passwordCookie = user.password
        }
        setCookie()
        await userLogin(user)
        await handleLogin()
      } catch (e) {
        if (e && e === 'LoginRetryLimitException') {
          await (captchaDialog.value as any).open()
        }
        state.loading = false
      }
    }

    const loginByMobile = async () => {
      try {
        await (loginForm.value as any).validate()
        state.loading = true
        setCookie()
        await _loginByMobile(state.loginParam.mobile, state.loginParam.validCode, settings.appName)
        await handleLogin()
      } catch (e) {
        state.loading = false
      }
    }

    const handleLogin = async () => {
      clearClock()
      await router.push(state.redirect ? { path: state.redirect } : { path: '/' })
      state.loading = false
    }

    const refreshQrcode = async () => {
      try {
        const { authzUrl, state } = await getWeixinUrl(settings.appName)
        if (authzUrl && state) {
          ;(fdQrcode.value as any).refresh(authzUrl)
          nextTick(() => {
            checkAuthc(state, loginByWeixin)
          })
        }
      } catch (e) {
        console.log(e)
      }
    }

    const redirectToQQ = async () => {
      try {
        const { authzUrl, state } = await getQQUrl(settings.appName)
        if (authzUrl && state) {
          window.open(authzUrl, '_blank')
          nextTick(() => {
            checkAuthc(state, loginByQQ)
          })
        }
      } catch (e) {
        console.log(e)
      }
    }

    const redirectToWeibo = async () => {
      try {
        const { authzUrl, state } = await getWeiboUrl(settings.appName)
        if (authzUrl && state) {
          window.open(authzUrl, '_blank')
          nextTick(() => {
            checkAuthc(state, loginByWeibo)
          })
        }
      } catch (e) {
        console.log(e)
      }
    }

    const checkAuthc = async (checkState: string, checkApi: AnyFunction) => {
      clearClock()
      let times = 0
      state.clockForLogin = window.setInterval(async () => {
        try {
          const success = await checkApi(checkState)
          if (success) {
            clearClock()
            await handleLogin()
          }
          times = times + 1
          if (times >= state.checkLoginRate) {
            clearClock()
          }
        } catch (e) {
          clearClock()
          console.log(e)
        }
      }, state.checkLoginRate)
    }

    const showWeixinQrcode = () => {
      state.loginType = 'weixin'
      refreshQrcode()
    }

    const closeQrcode = () => {
      clearClock()
      state.loginType = 'password'
    }

    const toggleLoginType = () => {
      if (state.loginType === 'password') {
        state.loginType = 'mobile'
      } else {
        state.loginType = 'password'
      }
    }

    const clearClock = () => {
      if (state.clockForLogin) {
        window.clearInterval(state.clockForLogin)
      }
    }

    const onReturnCaptcha = (uuid: string) => {
      state.loginParam.uuid = uuid
    }

    return {
      loginForm,
      fdQrcode,
      captchaDialog,
      countDownButton,
      ...toRefs(state),
      loginTypePrompt,
      showQrcode,
      getMobileValidCode,
      login,
      refreshQrcode,
      redirectToQQ,
      redirectToWeibo,
      checkAuthc,
      showWeixinQrcode,
      closeQrcode,
      toggleLoginType,
      clearClock,
      onReturnCaptcha
    }
  }
})
</script>

<style lang="scss" scoped>
@use '../base/src/assets/style/variable' as *;
@use '../base/src/assets/style/mixin' as *;

.page-login-card {
  display: flex;
  min-width: 600px;
  width: 800px;
  height: 500px;
  margin: 20px;
  border-radius: var(--el-border-radius-base);
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

  .page-login-card__form {
    flex: 1;
    position: relative;
    padding: 20px;
    background-color: $color-white;

    .form-header {
      display: flex;
      padding: 50px 0 0 0;
      align-items: center;

      .form-header__logo {
        flex: 1;
        text-align: left;
        font: $font-size-large;
        font-weight: $font-weight-bold;
      }

      .form-header__btn,
      .form-header__close {
        font-size: $font-size-small;
      }
    }

    .form-main {
      max-width: 100%;
      margin: 15px 0 0 0;

      .form-main__item {
        height: 41px;
        border: 1px solid var(--el-border-color-base);
        border-radius: var(--el-border-radius-base);

        .el-input {
          display: inline-block;
          width: 85%;

          ::v-deep(input) {
            background-color: transparent;
            border: 0;
            -webkit-appearance: none;
            border-radius: 0;
            padding: 12px 5px 12px 10px;
            color: $color-text-primary;
            height: 40px;

            &:-webkit-autofill {
              box-shadow: 0 0 0 1000px #e5e5e5 inset !important;
              -webkit-box-shadow: 0 0 0 1000px #e5e5e5 inset !important;
              -webkit-text-fill-color: $color-text-primary !important;
            }
          }
        }

        .item-svg {
          padding: 0 0 0 15px;
          color: $color-text-primary;
          font-size: 18px;
          vertical-align: middle;
          width: 35px;
          display: inline-block;
        }

        &.btn-input {
          ::v-deep(.el-form-item__content) {
            display: flex;
            flex-direction: row;

            .el-input {
              flex: 1;
            }
          }
        }
      }

      .login-form__remember-me {
        margin-bottom: 10px;
      }
    }

    .form-qrcode {
      display: flex;
      padding: 10px 0 10px 0;
      flex-direction: column;
      align-items: center;
      user-select: none;
    }

    .form-more {
      display: flex;
      width: 100%;
      font-size: $font-size-small;
      color: $color-text-secondary;

      a:hover {
        color: $color-text-primary;
      }

      a:first-child {
        flex: 1;
      }

      span {
        text-align: center;
        flex: 1;
      }
    }

    .form-third {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 115px;
      padding: 0 20px;

      .el-divider {
        ::v-deep(.el-divider__text) {
          font-size: $font-size-small;
          color: $color-text-secondary;
        }
      }

      .form-third__act {
        display: flex;
        padding: 0 70px;
        justify-content: space-around;
        width: 100%;

        .fd-icon {
          margin: 0 10px;
          padding: 8px;
          flex-shrink: 0;
          color: $color-text-secondary;
          font-size: 40px;
          cursor: pointer;
          border-radius: 50%;

          &:first-child {
            &:hover,
            &.selected {
              color: #fff;
              background-color: #4fbe31;
            }
          }

          &:nth-child(2) {
            &:hover,
            &.selected {
              color: #fff;
              background-color: #2da9e7;
            }
          }

          &:last-child {
            &:hover,
            &.selected {
              color: #fff;
              background-color: #e0152c;
            }
          }
        }
      }
    }
  }
}
</style>
