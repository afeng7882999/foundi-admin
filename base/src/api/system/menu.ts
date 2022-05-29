import Api, { ApiObj, ApiQuery, ExportRange } from '@b/api'
import { DictItem } from '@b/api/system/dict-item'

export interface Menu extends ApiObj {
  // 主键
  id: string
  // 父菜单ID，一级菜单为0
  parentId: string
  // 菜单名称
  name: string
  // 菜单URL
  url: string
  // 菜单跳转
  redirect: string
  // 页面文件路径
  pagePath: string
  // 授权（多个用逗号分隔，如：user:list,user:create）
  perms: string
  // 类型（字典：SysMenuType，0：目录，1：菜单，2：按钮）
  typeDict: string
  // 菜单图标
  icon: string
  // 菜单缩写
  abbr: string
  // 排序
  sort: number
  // 注释
  remark: string
  // 是否显示
  visible: boolean
  // 创建时间
  createAt: string
  // 修改时间
  updateAt: string
}

export const menuFields = {
  idField: 'id'
}

export const menuTreeFields = {
  idField: 'id',
  labelField: 'name',
  parentIdField: 'parentId',
  sortField: 'sort',
  childrenField: 'children'
}

export const menuDicts = {
  sysMenuType: [] as DictItem[]
}

export const menuQuery = {
  parentId: undefined
} as ApiQuery

// api url
export const url = '/api/system/menu'

// 获取单个系统菜单
export const menuGetOne = async (id: string) => Api.getOne<Menu>(url, id)

// 获取系统菜单列表
export const menuList = async (query?: ApiQuery) => Api.getList<Menu>(url, query)

// 添加系统菜单
export const menuPostOne = async (data: Partial<Menu>) => Api.postOne(url, data)

// 编辑系统菜单
export const menuPutOne = async (data: Partial<Menu>) => Api.putOne(url, data)

// 删除系统菜单
export const menuDel = async (ids: string[]) => Api.del(url, ids)

// 导出系统菜单列表
export const menuExport = async (filename?: string, params?: ApiQuery, range: ExportRange = 'page') =>
  Api.exportRange(url, filename, params, range)
