import Api, { ApiObj, ApiQuery, ExportRange } from '@b/api'
import { DictItem } from '@b/api/system/dict-item'

export interface Config extends ApiObj {
  // 主键
  id: string
  // 配置分类（字典：SysConfigType)
  configTypeDict: string
  // 键
  configKey: string
  // 值
  configValue: string
  // 是否启用
  enabled: boolean
  // 备注
  remark: string
  // 创建时间
  createAt: string
}

export const configFields = {
  idField: 'id'
}

export const configDicts = {
  sysConfigType: [] as DictItem[]
}

export const configQuery = {
  configTypeDict: undefined,
  configKey: undefined,
  enabled: undefined
} as ApiQuery

// api url
export const url = '/api/system/config'

// 获取单个系统配置
export const configGetOne = async (id: string) => Api.getOne<Config>(url, id)

// 获取系统配置列表
export const configList = async (query?: ApiQuery) => Api.getList<Config>(url, query)

// 添加系统配置
export const configPostOne = async (data: Partial<Config>) => Api.postOne(url, data)

// 编辑系统配置
export const configPutOne = async (data: Partial<Config>) => Api.putOne(url, data)

// 删除系统配置
export const configDel = async (ids: string[]) => Api.del(url, ids)

// 导出系统配置列表
export const configExport = async (filename?: string, params?: ApiQuery, range: ExportRange = 'page') =>
  Api.exportRange(url, filename, params, range)

// 获取OSS配置列表
const OSS_CONFIG_DICT_KEYS = ['100', '101', '102', '103']
export const configListOss = async () => Api.getList<Config>(url, { configTypeDict: OSS_CONFIG_DICT_KEYS, enabled: true })
