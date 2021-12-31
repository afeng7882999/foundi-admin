import Api, { IResData } from '@/api'
import { AnyObject } from '@/utils'

export interface IDict extends IResData {
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
}

// api url
export const url = '/api/system/dict'

// 获取单个字典
export const dictGetOne = async (id: string) => Api.getOne<IDict>(url, id)

// 获取字典列表
export const dictList = async (query?: AnyObject) => Api.getList<IDict>(url, query)

// 添加字典
export const dictPostOne = async (data: AnyObject) => Api.postOne(url, data)

// 编辑字典
export const dictPutOne = async (data: AnyObject) => Api.putOne(url, data)

// 删除字典
export const dictDel = async (ids: string[]) => Api.del(url, ids)

// 导出字典列表
export const dictExport = async (filename?: string, params?: AnyObject) =>
  Api.exportData(url + '/export', filename, params)
