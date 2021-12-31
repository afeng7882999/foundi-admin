import request, { httpEncrypt as requestEncrypt } from '@/app/request'
import { AnyObject } from '@/utils'

export interface ILoginParam {
  username: string
  password: string
  appName: string
  uuid: string
}

export interface IRegisterParam {
  username: string
  email: string
  password: string
}

export interface IResetPasswordParam {
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
export const login = async (param: ILoginParam) => {
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
  })) as AnyObject
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
  })) as AnyObject

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
  })) as AnyObject
  return {
    authzUrl: data.authzUrl as string,
    state: data.state as string
  }
}

// 通过微信登录
export const loginByWeixin = async (state: string) => {
  const { data } = (await request({
    url: url + '/weixin-login',
    method: 'get',
    params: {
      state
    }
  })) as any
  return data.content as boolean
}

// 获取QQ认证url
export const getQQUrl = async (appName: string) => {
  const { data } = (await request({
    url: url + '/qq-url',
    method: 'get',
    params: {
      appName
    }
  })) as AnyObject
  return {
    authzUrl: data.authzUrl as string,
    state: data.state as string
  }
}

// 通过QQ登录
export const loginByQQ = async (state: string) => {
  const { data } = (await request({
    url: url + '/qq-login',
    method: 'get',
    params: {
      state
    }
  })) as any
  return data.content as boolean
}

// 获取微博认证url
export const getWeiboUrl = async (appName: string) => {
  const { data } = (await request({
    url: url + '/weibo-url',
    method: 'get',
    params: {
      appName
    }
  })) as AnyObject
  return {
    authzUrl: data.authzUrl as string,
    state: data.state as string
  }
}

// 通过微博登录
export const loginByWeibo = async (state: string) => {
  const { data } = (await request({
    url: url + '/weibo-login',
    method: 'get',
    params: {
      state
    }
  })) as any
  return data.content as boolean
}

// 注册
export const register = async (param: IRegisterParam) => {
  await requestEncrypt({
    url: url + '/register',
    method: 'post',
    data: param
  })
}

// 检测用户名是否可用
export const checkUsername = async (username: string) => {
  const { data } = (await request({
    url: url + '/check-username',
    method: 'get',
    params: {
      username
    }
  })) as any
  return data.content as boolean
}

// 检测Email是否可用
export const checkEmail = async (email: string) => {
  const { data } = (await request({
    url: url + '/check-email',
    method: 'get',
    params: {
      email
    }
  })) as any
  return data.content as boolean
}

// 检测是否是注册用户
export const checkUserExist = async (username: string) => {
  const { data } = (await request({
    url: url + '/check-exist',
    method: 'get',
    params: {
      username
    }
  })) as AnyObject
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
export const resetPassword = async (param: IResetPasswordParam) => {
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
  })) as AnyObject
  return {
    agreement: data.userAgreement as string,
    privacy: data.userPrivacy as string
  }
}
