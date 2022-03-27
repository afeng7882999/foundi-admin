import Api, {ApiObj, ApiQuery, ExportRange} from '@/api'
import { DictItem } from '@/api/system/dict-item'

export interface OAuthUser extends ApiObj {
  // 主键
  id: string
  // 账号
  account: string
  // 昵称
  nickName: string
  // 头像
  avatar: string
  // 性别（字典：Gender）
  genderDict: string
  // OpenId
  openId: string
  // 认证类型（字典：SysOAuthType）
  oAuthTypeDict: string
  // 关联user
  userId: string
  // 创建时间
  createAt: string
  // 修改时间
  updateAt: string
}

export const oauthUserFields = {
  idField: 'id'
}

export const oauthUserDicts = {
  gender: [] as DictItem[],
  sysOAuthType: [] as DictItem[]
}

export const oauthUserQuery = {
  account: '',
  nickName: '',
  oAuthTypeDict: '',
  userId: ''
} as ApiQuery

// api url
export const url = '/api/system/oauthUser'

// 获取单个OAuth用户
export const oauthUserGetOne = async (id: string) => Api.getOne<OAuthUser>(url, id)

// 获取OAuth用户列表
export const oauthUserList = async (query?: ApiQuery) => Api.getList<OAuthUser>(url, query)

// 添加OAuth用户
export const oauthUserPostOne = async (data: Partial<OAuthUser>) => Api.postOne(url, data)

// 编辑OAuth用户
export const oauthUserPutOne = async (data: Partial<OAuthUser>) => Api.putOne(url, data)

// 删除OAuth用户
export const oauthUserDel = async (ids: string[]) => Api.del(url, ids)

// 导出OAuth用户列表
export const oauthUserExport = async (filename?: string, params?: ApiQuery, range: ExportRange = 'page') =>
  Api.exportRange(url, filename, params, range)
