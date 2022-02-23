import Api, { ApiObj, ApiQuery } from '@/api'
import request from '@/app/request'
import { downloadFile } from '@/utils/file'
import { DictItem } from '@/api/system/dict-item'
import { isString } from '@vueuse/core'

export interface GenTable extends ApiObj {
  // 主键
  id: string
  // 表名
  tableName: string
  // 表中文名
  tableComment: string
  // 表创建时间
  tableCreateTime: string
  // 数据库引擎
  tableEngine: string
  // 表编码集
  tableEncoding: string
  // 实体名
  entityName: string
  // 模块名
  module: string
  // 包名
  pack: string
  // 前端代码路径
  frontPath: string
  // 是否是子表
  isSub: boolean
  // 是否是树表
  isTree: boolean
  // 树编码字段
  treeId: string
  // 树名称字段
  treeName: string
  // 树父编码字段
  treeParentId: string
  // 树排序字段
  treeSort: string
  // 前端编辑（新增）页面
  isFrontEdit: boolean
  // 前端详细页面
  isFrontDetail: boolean
  // 菜单标题
  menuTitle: string
  // 上级菜单ID
  menuParentId: string
  // 作者
  author: string
}

export interface GenTableColumn extends ApiObj {
  // 主键
  id: string
  // 表名称
  tableName: string
  // 列名称
  columnName: string
  // 列描述
  columnComment: string
  // 列类型
  columnType: string
  // 列键类型
  columnKey: string
  // 列额外参数
  columnExtra: string
  // JAVA类型
  fieldType: string
  // 字段名称
  fieldName: string
  // 是否必填
  isRequired: boolean
  // 是否为插入字段
  isInsert: boolean
  // 是否编辑字段
  isEdit: boolean
  // 是否列表字段
  isList: boolean
  // 是否查询字段
  isQuery: boolean
  // 是否排序字段
  isOrder: boolean
  // 查询方式（等于、不等于、大于、小于、范围）
  queryType: string
  // 显示类型（文本框、文本域、下拉框、复选框、单选框、日期控件）
  htmlType: string
  // 字典类型
  dictType: string
  // 排序
  sort: number
}

export interface CodePreview {
  // 文件路径
  path: string
  // 文件名
  name: string
  // 文件内容
  content: string
}

export interface GenData extends ApiObj {
  table: Partial<GenTable>
  columns: Partial<GenTableColumn>[]
}

export const genTableFields = {
  idField: 'id'
}

export const genTableDicts = {
  gender: [] as DictItem[],
  sysUserStatus: [] as DictItem[]
}

export const genTableQuery = {
  tableName: undefined,
  tableComment: undefined,
  tableCreateTime: [] as Date[]
} as ApiQuery

// api url
export const url = '/api/generator/genTable'

// 获取单个业务表
export const genTableGetOne = async (id: string) => Api.getOne<GenData>(url, id)

// 获取业务表列表
export const genTableList = async (query?: ApiQuery) => Api.getList<GenTable>(url, query)

// 由数据库查询业务表
export const genTableListDb = async (query?: ApiQuery) => Api.getList<GenTable>(url + '/listDb', query)

// 由数据库导入业务表
export const genTableImportDb = async (tableNames: string[]) => {
  await request({
    url: url + '/importDb',
    method: 'post',
    data: tableNames
  })
}

// 编辑业务表
export const genTablePutOne = async (data: GenData) => Api.putOne(url, data)

// 删除业务表
export const genTableDel = async (ids: string[]) => Api.del(url, ids)

// 同步字段数据
export const genTableSyncDb = async (id: string) => {
  await request({
    url: `${url}/syncDb/${id}`,
    method: 'get'
  })
}

// 生成代码并预览
export const preview = async (ids: string[] | string): Promise<CodePreview[]> => {
  const param = isString(ids) ? ids : ids.join(',')
  const { data } = await request({
    url: `${url}/preview/${param}`,
    method: 'get'
  })
  return data.content
}

// 生成代码并下载
export const download = async (ids: string[], tableName?: string) => {
  const { data } = await request({
    url: `${url}/download/${ids.join(',')}`,
    method: 'get',
    responseType: 'blob'
  })
  downloadFile(data, tableName ? tableName : 'code', 'zip')
}
