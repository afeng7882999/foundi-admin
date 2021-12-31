import Api, { IResData } from '@/api'
import { AnyObject } from '@/utils'

export interface IGroup extends IResData {
  // 主键
  id: string
  // 上级用户组ID，一级用户组为0
  parentId: string
  // 排序
  sort: number
  // 用户组名称
  name: string
  // 是否删除  1：已删除  0：正常
  delFlag: boolean
}

export const groupFields = {
  idField: 'id'
}

export const groupTreeFields = {
  idField: 'id',
  labelField: 'name',
  parentIdField: 'parentId',
  sortField: 'sort',
  childrenField: 'children'
}

export const GROUP_DEFAULT_ROOT = {
  id: '-1',
  parentId: '0',
  sort: 0,
  name: '全部',
  delFlag: false,
  children: [] as IGroup[]
}

// api url
export const url = '/api/system/group'

// 获取单个系统用户组
export const groupGetOne = async (id: string) => Api.getOne<IGroup>(url, id)

// 获取系统用户组列表
export const groupList = async (query?: AnyObject) => Api.getList<IGroup>(url, query)

// 添加系统用户组
export const groupPostOne = async (data: AnyObject) => Api.postOne(url, data)

// 编辑系统用户组
export const groupPutOne = async (data: AnyObject) => Api.putOne(url, data)

// 删除系统用户组
export const groupDel = async (ids: string[]) => Api.del(url, ids)

// 导出系统用户组列表
export const groupExport = async (filename?: string, params?: AnyObject) =>
  Api.exportData(url + '/export', filename, params)
