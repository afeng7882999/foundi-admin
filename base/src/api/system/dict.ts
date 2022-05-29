import Api, { ApiObj, ApiQuery, ExportRange } from '@b/api'

export interface Dict extends ApiObj {
  // 主键
  id: string
  // 字典名
  name: string
  // 字典中文名
  nameCn: string
  // 备注信息
  remarks: string
  // 创建者
  createBy: string
  // 创建时间
  createAt: string
  // 更新者
  updateBy: string
  // 更新时间
  updateAt: string
  // 是否删除  1：已删除  0：正常
  delFlag: boolean
}

export const dictFields = {
  idField: 'id'
}

export const dictQuery = {
  name: undefined,
  nameCn: undefined
} as ApiQuery

// api url
export const url = '/api/system/dict'

// 获取单个字典
export const dictGetOne = async (id: string) => Api.getOne<Dict>(url, id)

// 获取字典列表
export const dictList = async (query?: ApiQuery) => Api.getList<Dict>(url, query)

// 添加字典
export const dictPostOne = async (data: Partial<Dict>) => Api.postOne(url, data)

// 编辑字典
export const dictPutOne = async (data: Partial<Dict>) => Api.putOne(url, data)

// 删除字典
export const dictDel = async (ids: string[]) => Api.del(url, ids)

// 导出字典列表
export const dictExport = async (filename?: string, params?: ApiQuery, range: ExportRange = 'page') =>
  Api.exportRange(url, filename, params, range)
