import Api, { ApiObj, ApiQuery, ExportRange, SortField } from '@/api'
import { DictItem } from '@/api/system/dict-item'

export interface LoginLog extends ApiObj {
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

export const loginLogSortFields: SortField[] = [
  { name: 'userName', comment: '用户账号' },
  { name: 'ip', comment: 'IP地址' }
]

export const loginLogDicts = {
  sysLoginLogType: [] as DictItem[],
  sysAuthcType: [] as DictItem[],
  sysLoginLogStatus: [] as DictItem[]
}

export const loginLogQuery = {
  operTime: [] as Date[],
  typeDict: undefined,
  authcTypeDict: undefined,
  userName: undefined,
  ip: undefined,
  statusDict: undefined
} as ApiQuery

// api url
export const url = '/api/system/loginLog'

// 获取单个系统访问日志
export const loginLogGetOne = async (id: string) => Api.getOne<LoginLog>(url, id)

// 获取系统访问日志列表
export const loginLogList = async (query?: ApiQuery) => Api.getList<LoginLog>(url, query)

// 添加系统访问日志
export const loginLogPostOne = async (data: Partial<LoginLog>) => Api.postOne(url, data)

// 编辑系统访问日志
export const loginLogPutOne = async (data: Partial<LoginLog>) => Api.putOne(url, data)

// 删除系统访问日志
export const loginLogDel = async (ids: string[]) => Api.del(url, ids)

// 导出系统访问日志列表
export const loginLogExport = async (filename?: string, params?: ApiQuery, range: ExportRange = 'page') => {
  if (range === 'page') {
    await Api.exportData(url + '/exportPage', filename, params)
  } else if (range === 'all') {
    await Api.exportData(url + '/exportAll', filename, params)
  }
}
