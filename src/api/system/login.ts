import request, { httpEncrypt as requestEncrypt } from '@/app/request'
import { Response } from '@/api'

export interface LoginParam {
  username: string
  password: string
  appName: string
  uuid: string
}

export interface RegisterParam {
  username: string
  email: string
  password: string
}

export interface ResetPasswordParam {
  username: string
  code: string
  type: 'email' | 'mobile'
  password: string
}

// login url
export const url = '/api/login'
// logout url
export const logoutUrl = '/api/logout'

// 账密登录
export const login = async (param: LoginParam) => {
  await requestEncrypt({
    url: url,
    method: 'post',
    data: param
  })
}

// 登出
export const logout = async () => {
  await request({
    url: logoutUrl,
    method: 'post'
  })
}

// 获取验证码
export const getCaptcha = async () => {
  const { data } = (await request({
    url: url + '/captcha',
    method: 'get'
  })) as Response
  const img = 'data:image/gif;base64,' + data.content.img
  const uuid = data.content.uuid
  const extra = data.content.extra

  return { img, uuid, extra }
}

// 验证码验证
export const verifyCaptcha = async (uuid: string, code: string) => {
  const { data } = (await request({
    url: url + '/captcha-verify',
    method: 'get',
    params: {
      uuid,
      code
    }
  })) as Response

  return data.content as boolean
}

// 使用手机验证码方式登录
export const loginByMobile = async (mobile: string, code: string, appName: string) => {
  await request({
    url: url + '/mobile',
    method: 'post',
    params: {
      mobile,
      code,
      appName
    }
  })
}

// 发送手机验证码
export const sendMobileCode = async (mobile: string) => {
  await request({
    url: url + '/mobile-valid',
    method: 'get',
    params: {
      mobile
    }
  })
}

// 获取微信认证url
export const getWeixinUrl = async (appName: string) => {
  const { data } = (await request({
    url: url + '/weixin-url',
    method: 'get',
    params: {
      appName
    }
  })) as Response
  return {
    authzUrl: data.content.authzUrl as string,
    state: data.content.state as string
  }
}

// 通过微信登录
export const loginByWeixin = async (state: string): Promise<boolean> => {
  const { data } = (await request({
    url: url + '/weixin-login',
    method: 'get',
    params: {
      state
    }
  })) as Response
  return data.content
}

// 获取QQ认证url
export const getQQUrl = async (appName: string) => {
  const { data } = (await request({
    url: url + '/qq-url',
    method: 'get',
    params: {
      appName
    }
  })) as Response
  return {
    authzUrl: data.content.authzUrl as string,
    state: data.content.state as string
  }
}

// 通过QQ登录
export const loginByQQ = async (state: string): Promise<boolean> => {
  const { data } = (await request({
    url: url + '/qq-login',
    method: 'get',
    params: {
      state
    }
  })) as Response
  return data.content
}

// 获取微博认证url
export const getWeiboUrl = async (appName: string) => {
  const { data } = (await request({
    url: url + '/weibo-url',
    method: 'get',
    params: {
      appName
    }
  })) as Response
  return {
    authzUrl: data.content.authzUrl as string,
    state: data.content.state as string
  }
}

// 通过微博登录
export const loginByWeibo = async (state: string): Promise<boolean> => {
  const { data } = (await request({
    url: url + '/weibo-login',
    method: 'get',
    params: {
      state
    }
  })) as Response
  return data.content
}

// 注册
export const register = async (param: RegisterParam) => {
  await requestEncrypt({
    url: url + '/register',
    method: 'post',
    data: param
  })
}

// 检测用户名是否可用
export const checkUsername = async (username: string): Promise<boolean> => {
  const { data } = (await request({
    url: url + '/check-username',
    method: 'get',
    params: {
      username
    }
  })) as Response
  return data.content
}

// 检测Email是否可用
export const checkEmail = async (email: string): Promise<boolean> => {
  const { data } = (await request({
    url: url + '/check-email',
    method: 'get',
    params: {
      email
    }
  })) as Response
  return data.content
}

// 检测是否是注册用户
export const checkUserExist = async (username: string) => {
  const { data } = (await request({
    url: url + '/check-exist',
    method: 'get',
    params: {
      username
    }
  })) as Response
  return {
    exist: data.exist as boolean,
    mobile: data.mobile as string,
    email: data.email as string
  }
}

// 发送重置密码的验证码
export const sendResetPasswordCode = async (username: string, type: 'email' | 'mobile') => {
  await request({
    url: url + '/reset-valid',
    method: 'get',
    params: {
      username,
      type
    }
  })
}

// 重置密码
export const resetPassword = async (param: ResetPasswordParam) => {
  await requestEncrypt({
    url: url + '/reset-password',
    method: 'put',
    data: param
  })
}

// 获取网站用户协议与隐私政策
export const getAgreement = async () => {
  const { data } = (await request({
    url: url + '/agreement',
    method: 'get'
  })) as Response
  return {
    agreement: data.userAgreement as string,
    privacy: data.userPrivacy as string
  }
}
