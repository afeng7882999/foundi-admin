import Api, { ApiObj, ApiQuery, ExportRange, Response } from '@b/api'
import request from '@b/app/request'
import { OAuthUser } from '@b/api/system/oauth-user'
import { DictItem } from '@b/api/system/dict-item'

export interface User extends ApiObj {
  // 主键
  id: string
  // 用户名
  username: string
  // 密码
  password: string
  // 手机号
  mobile: string
  // 用户组
  groupId: string
  // 姓名
  name: string
  // 头像
  avatar: string
  // 状态（字典：SysUserStatus，0：正常，1：禁用）
  statusDict: string
  // 邮箱
  email: string
  // 性别（字典：Gender，0：未知，1：男，2：女）
  genderDict: string
  // 出生日期
  birthday: string
  // 住址
  address: string
  // 省份
  province: string
  // 所在城市
  city: string
  // 所在地区
  district: string
  // 创建时间
  createAt: string
  // 创建者id
  createBy: string
  // 修改者id
  updateBy: string
  // 修改时间
  updateAt: string
  // 角色
  roleIdList: string[]
  // 是否设置密码
  hasPassword: boolean
  // 绑定的OAUth2用户
  oAuthUserList: OAuthUser[]
}

export interface PasswordParam extends ApiObj {
  // 主键
  id: string
  // 旧密码
  oldPass: string
  // 新密码
  password: string
}

export const userFields = {
  idField: 'id'
}

export const userDicts = {
  gender: [] as DictItem[],
  sysUserStatus: [] as DictItem[]
}

export const userQuery = {
  account: '',
  groupId: [] as string[],
  roleId: [] as string[],
  statusDict: ''
} as ApiQuery

// api url
export const url = '/api/system/user'

// 获取单个系统用户
export const userGetOne = async (id: string) => Api.getOne<User>(url, id)

// 获取系统用户列表
export const userList = async (query?: ApiQuery) => Api.getList<User>(url, query)

// 添加系统用户
export const userPostOne = async (data: Partial<User>) => Api.postOne(url, data)

// 编辑系统用户
export const userPutOne = async (data: Partial<User>) => Api.putOne(url, data)

// 删除系统用户
export const userDel = async (ids: string[]) => Api.del(url, ids)

// 导出系统用户列表
export const userExport = async (filename?: string, params?: ApiQuery, range: ExportRange = 'page') =>
  Api.exportRange(url, filename, params, range)

// 检查系统用户的用户名
export const checkUsername = async (username: string, id?: string): Promise<boolean> => {
  const params = id ? { id: id, username: username } : { username: username }
  const { data } = (await request({
    url: url + '/username/check',
    method: 'get',
    params: params
  })) as Response
  return data.content
}

// 检查系统用户的EMail
export const checkEmail = async (id: string, email: string): Promise<boolean> => {
  const params = id ? { id: id, email: email } : { email: email }
  const { data } = (await request({
    url: url + '/email/check',
    method: 'get',
    params: params
  })) as Response
  return data.content
}

// 检查系统用户的手机号
export const checkMobile = async (id: string, mobile: string): Promise<boolean> => {
  const params = id ? { id: id, mobile: mobile } : { mobile: mobile }
  const { data } = (await request({
    url: url + '/mobile/check',
    method: 'get',
    params: params
  })) as Response
  return data.content
}

// 系统用户更改密码
export const changePassword = async (param: PasswordParam) => Api.putOne(url + '/password', param)

// 当前用户信息
export const getCurrentInfo = async () => {
  const { data } = (await request({
    url: url + '/current/info',
    method: 'get'
  })) as Response

  const { user, roles, groups, menu, perms } = data
  return {
    user,
    roles,
    groups,
    menu,
    perms
  }
}

// 当前用户添加密码
export const currentAddPassword = async (data: PasswordParam) => Api.postOne(url + '/current/password', data)

// 当前用户修改密码
export const currentChangePassword = async (data: PasswordParam) => Api.putOne(url + '/current/password', data)

// 修改当前用户
export const currentEdit = async (param: User) => {
  await request({
    url: url + '/current',
    method: 'put',
    data: param
  })
}

// 当前用户修改头像
export const currentChangeAvatar = async (avatar: string) => {
  await request({
    url: url + '/current/avatar',
    method: 'put',
    params: {
      avatar
    }
  })
}

// 当前用户检测用户名
export const currentCheckUsername = async (username: string): Promise<boolean> => {
  const { data } = (await request({
    url: url + '/current/username/check',
    method: 'get',
    params: {
      username
    }
  })) as Response
  return data.content
}

// 当前用户检测手机号
export const currentCheckMobile = async (mobile: string): Promise<boolean> => {
  const { data } = (await request({
    url: url + '/current/mobile/check',
    method: 'get',
    params: {
      mobile
    }
  })) as Response
  return data.content
}

// 当前用户获取手机验证码
export const currentChangeMobileValid = async (mobile: string) => {
  await request({
    url: url + '/current/mobile/valid',
    method: 'get',
    params: {
      mobile
    }
  })
}

// 当前用户修改手机号
export const currentChangeMobile = async (code: string, mobile: string): Promise<boolean> => {
  const { data } = (await request({
    url: url + '/current/mobile',
    method: 'put',
    params: {
      code,
      mobile
    }
  })) as Response
  return data.content
}

// 当前用户解绑手机号
export const currentClearMobile = async () => {
  await request({
    url: url + '/current/mobile/clear',
    method: 'get'
  })
}

// 当前用户检测邮箱是否可用
export const currentCheckEmail = async (email: string): Promise<boolean> => {
  const { data } = (await request({
    url: url + '/current/email/check',
    method: 'get',
    params: {
      email
    }
  })) as Response
  return data.content
}

// 当前用户更换邮箱
export const currentChangeEmail = async (email: string): Promise<boolean> => {
  const { data } = (await request({
    url: url + '/current/email',
    method: 'put',
    params: {
      email
    }
  })) as Response
  return data.content
}

// 当前用户解绑邮箱
export const currentClearEmail = async () => {
  await request({
    url: url + '/current/email/clear',
    method: 'get'
  })
}

// 当前用户绑定微信
export const currentBindWeixin = async (state: string): Promise<boolean> => {
  const { data } = (await request({
    url: url + '/current/weixin',
    method: 'get',
    params: {
      state
    }
  })) as Response
  return data.content
}

// 当前用户解绑微信
export const currentClearWeixin = async () => {
  await request({
    url: url + '/current/weixin/clear',
    method: 'get'
  })
}

// 当前用户绑定QQ
export const currentBindQQ = async (state: string): Promise<boolean> => {
  const { data } = (await request({
    url: url + '/current/qq',
    method: 'get',
    params: {
      state
    }
  })) as Response
  return data.content
}

// 当前用户解绑QQ
export const currentClearQQ = async () => {
  await request({
    url: url + '/current/qq/clear',
    method: 'get'
  })
}

// 当前用户绑定微博
export const currentBindWeibo = async (state: string): Promise<boolean> => {
  const { data } = (await request({
    url: url + '/current/weibo',
    method: 'get',
    params: {
      state
    }
  })) as Response
  return data.content
}

// 当前用户解绑微博
export const currentClearWeibo = async () => {
  await request({
    url: url + '/current/weibo/clear',
    method: 'get'
  })
}
