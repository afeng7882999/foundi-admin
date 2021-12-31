import Api, { IResData } from '@/api'
import { AnyObject } from '@/utils'
import { IDictItem } from '@/api/system/dict-item'

export interface IRole extends IResData {
  // 主键
  id: string
  // 角色名称
  name: string
  // 角色标识
  label: string
  // 备注
  remark: string
  // 数据范围（字典：SysRoleDataScope）
  dataScopeDict: string
  // 创建用户id
  createBy: string
  // 创建时间
  createAt: string
  // 修改用户id
  updateBy: string
  // 修改时间
  updateAt: string
  // 是否删除  1：已删除  0：正常
  delFlag: boolean
  // 菜单（业务）权限
  menuIdList: string[]
  // 用户组（数据）权限
  groupIdList: string[]
}

export const roleFields = {
  idField: 'id'
}

export const roleDicts = {
  sysRoleDataScope: [] as IDictItem[]
}

export const roleQuery = {
  name: undefined,
  label: undefined,
  dataScopeDict: undefined
}

// api url
export const url = '/api/system/role'

// 获取单个系统角色
export const roleGetOne = async (id: string) => Api.getOne<IRole>(url, id)

// 获取系统角色列表
export const roleList = async (query?: AnyObject) => Api.getList<IRole>(url, query)

// 添加系统角色
export const rolePostOne = async (data: AnyObject) => Api.postOne(url, data)

// 编辑系统角色
export const rolePutOne = async (data: AnyObject) => Api.putOne(url, data)

// 删除系统角色
export const roleDel = async (ids: string[]) => Api.del(url, ids)

// 导出系统角色列表
export const roleExport = async (filename?: string, params?: AnyObject) =>
  Api.exportData(url + '/export', filename, params)
