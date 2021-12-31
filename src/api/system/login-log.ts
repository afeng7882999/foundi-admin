import Api, { IResData } from '@/api'
import { AnyObject } from '@/utils'
import { IDictItem } from '@/api/system/dict-item'

export interface ILoginLog extends IResData {
  // 主键
  id: string
  // 登录、登出时间
  operTime: string
  // 类型（字典：SysLoginLogType，0：login，1：logout）
  typeDict: string
  // 登录方式
  authcTypeDict: string
  // 用户账号
  userName: string
  // 登录IP地址
  ip: string
  // 登录地点
  location: string
  // 浏览器类型
  browser: string
  // 操作系统
  os: string
  // 登录状态（字典：SysLoginLogStatus，0：成功，1：失败）
  statusDict: string
  // 提示消息
  message: string
}

export const loginLogFields = {
  idField: 'id'
}

export const loginLogDicts = {
  sysLoginLogType: [] as IDictItem[],
  sysAuthcType: [] as IDictItem[],
  sysLoginLogStatus: [] as IDictItem[]
}

export const loginLogQuery = {
  operTime: [] as Date[],
  typeDict: undefined,
  authcTypeDict: undefined,
  userName: undefined,
  ip: undefined,
  statusDict: undefined
}

// api url
export const url = '/api/system/loginLog'

// 获取单个系统访问日志
export const loginLogGetOne = async (id: string) => Api.getOne<ILoginLog>(url, id)

// 获取系统访问日志列表
export const loginLogList = async (query?: AnyObject) => Api.getList<ILoginLog>(url, query)

// 添加系统访问日志
export const loginLogPostOne = async (data: AnyObject) => Api.postOne(url, data)

// 编辑系统访问日志
export const loginLogPutOne = async (data: AnyObject) => Api.putOne(url, data)

// 删除系统访问日志
export const loginLogDel = async (ids: string[]) => Api.del(url, ids)

// 导出系统访问日志列表
export const loginLogExport = async (filename?: string, params?: AnyObject) =>
  Api.exportData(url + '/export', filename, params)
