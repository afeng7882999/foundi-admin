import Api, {ApiObj, ApiQuery, ExportRange} from '@b/api'
import request from '@b/app/request'
import { Indexable } from '@b/common/types'

export type DictList = Indexable<DictItem[]>

export interface DictItem extends ApiObj {
  // 主键
  id?: string
  // 排序（升序）
  sort?: number
  // 字典项键值
  itemKey: string
  // 字典项值
  itemValue: string
  // 字典类型
  dictId?: string
  // 备注信息
  remarks?: string
  // 创建者
  createBy?: string
  // 创建时间
  createAt?: string
  // 更新者
  updateBy?: string
  // 更新时间
  updateAt?: string
  // 是否删除  1：已删除  0：正常
  delFlag?: boolean
}

export const dictItemFields = {
  idField: 'id'
}

export const dictItemParams = {
  dictId: undefined as string | undefined
}

export const dictItemQuery = {
  itemKey: undefined,
  itemValue: undefined
} as ApiQuery

// api url
export const url = '/api/system/dictItem'

// 获取单个字典条目
export const dictItemGetOne = async (id: string) => Api.getOne<DictItem>(url, id)

// 获取字典条目列表
export const dictItemList = async (query?: ApiQuery) => Api.getList<DictItem>(url, query)

// 添加字典条目
export const dictItemPostOne = async (data: Partial<DictItem>) => Api.postOne(url, data)

// 编辑字典条目
export const dictItemPutOne = async (data: Partial<DictItem>) => Api.putOne(url, data)

// 删除字典条目
export const dictItemDel = async (ids: string[]) => Api.del(url, ids)

// 导出字典条目列表
export const dictItemExport = async (filename?: string, params?: ApiQuery, range: ExportRange = 'page') =>
  Api.exportRange(url, filename, params, range)

// 由字典名获取字典条目列表
export const getDictListByName = async (names: string[]): Promise<DictList> => {
  const { data } = await request({
    url: `${url}/listByName/${names.join(',')}`,
    method: 'get'
  })
  return data.content
}
