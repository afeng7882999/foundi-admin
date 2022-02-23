import Api, { ApiObj, ApiQuery } from '@/api'
import { DictItem } from '@/api/system/dict-item'

export interface OperLog extends ApiObj {
  // 主键
  id: string
  // 模块标题
  title: string
  // 方法名称
  method: string
  // 请求方式
  requestMethod: string
  // 操作人员ID
  operUserId: string
  // 操作人员账号名
  operUserName: string
  // 操作人员角色
  operUserRoles: string
  // 用户组名称
  groupName: string
  // 请求URL
  operUrl: string
  // 主机地址
  operIp: string
  // 操作地点
  operLocation: string
  // 请求参数
  operParam: string
  // 返回参数
  jsonResult: string
  // 操作状态（字典：SysOperLogStatus，0：正常，1：异常）
  statusDict: string
  // 错误消息
  errorMsg: string
  // 操作时间
  operTime: string
}

export const operLogFields = {
  idField: 'id'
}

export const operLogDicts = {
  sysOperLogStatus: [] as DictItem[]
}

export const operLogQuery = {
  title: undefined,
  method: undefined,
  operUserName: undefined,
  operIp: undefined,
  operTime: [] as Date[],
  orderByList: [] as string[]
} as ApiQuery

// api url
export const url = '/api/system/operLog'

// 获取单个系统操作日志
export const operLogGetOne = async (id: string) => Api.getOne<OperLog>(url, id)

// 获取系统操作日志列表
export const operLogList = async (query?: ApiQuery) => Api.getList<OperLog>(url, query)

// 添加系统操作日志
export const operLogPostOne = async (data: Partial<OperLog>) => Api.postOne(url, data)

// 编辑系统操作日志
export const operLogPutOne = async (data: Partial<OperLog>) => Api.putOne(url, data)

// 删除系统操作日志
export const operLogDel = async (ids: string[]) => Api.del(url, ids)

// 导出系统操作日志列表
export const operLogExport = async (filename?: string, params?: ApiQuery) => Api.exportData(url + '/export', filename, params)
