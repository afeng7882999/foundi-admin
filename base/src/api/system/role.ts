import Api, { ApiObj, ApiQuery, ExportRange } from '@b/api'
import { DictItem } from '@b/api/system/dict-item'

export interface Role extends ApiObj {
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
  sysRoleDataScope: [] as DictItem[]
}

export const roleQuery = {
  name: undefined,
  label: undefined,
  dataScopeDict: undefined
} as ApiQuery

// api url
export const url = '/api/system/role'

// 获取单个系统角色
export const roleGetOne = async (id: string) => Api.getOne<Role>(url, id)

// 获取系统角色列表
export const roleList = async (query?: ApiQuery) => Api.getList<Role>(url, query)

// 添加系统角色
export const rolePostOne = async (data: Partial<Role>) => Api.postOne(url, data)

// 编辑系统角色
export const rolePutOne = async (data: Partial<Role>) => Api.putOne(url, data)

// 删除系统角色
export const roleDel = async (ids: string[]) => Api.del(url, ids)

// 导出系统角色列表
export const roleExport = async (filename?: string, params?: ApiQuery, range: ExportRange = 'page') =>
  Api.exportRange(url, filename, params, range)
