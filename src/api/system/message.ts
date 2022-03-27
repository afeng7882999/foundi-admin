import Api, { ApiObj, ApiQuery, ExportRange } from '@/api'
import request from '@/app/request'
import { DictItem } from '@/api/system/dict-item'

export interface Message extends ApiObj {
  // 主键
  id: string
  // 标题
  title: string
  // 信息内容
  content: string
  // 信息类型（字典：SysMessageType）
  typeDict: string
  // 发送方
  senderId: string
  // 是否群发
  isGroup: boolean
  // 接收组
  groupId: string
  // 发送时间
  createAt: string
}

export interface UserMessage extends ApiObj {
  // 主键
  id: string
  // 标题
  title: string
  // 信息内容
  content: string
  // 信息类型（字典：SysMessageType）
  typeDict: string
  // 发送方
  senderId: string
  // 是否群发
  isGroup: boolean
  // 接收组
  groupId: string
  // 接收方
  receiverId: string
  // 消息状态（字典：SysMessageStatus，0：未读、1：已读、2：删除）
  statusDict: string
  // 发送时间
  createAt: string
}

export const messageFields = {
  idField: 'id'
}

export const messageDicts = {
  sysMessageType: [] as DictItem[]
}

export const messageQuery = {
  title: undefined,
  typeDict: undefined,
  createAt: [] as Date[]
} as ApiQuery

export const useMessageFields = {
  idField: 'id'
}

export const userMessageDicts = {
  sysMessageType: [] as DictItem[],
  sysMessageStatus: [] as DictItem[]
}

export const userMessageQuery = {
  title: undefined,
  typeDict: undefined,
  statusDict: undefined,
  createAt: [] as Date[]
} as ApiQuery

// api url
export const url = '/api/system/message'

// api url of current user
export const userMessageUrl = '/api/system/message/current'

// 获取单个系统消息
export const messageGetOne = async (id: string) => Api.getOne<Message>(url, id)

// 获取系统消息列表
export const messageList = async (query?: ApiQuery) => Api.getList<Message>(url, query)

// 添加系统消息
export const messagePostOne = async (data: Partial<Message>) => Api.postOne(url, data)

// 编辑系统消息
export const messagePutOne = async (data: Partial<Message>) => Api.putOne(url, data)

// 删除系统消息
export const messageDel = async (ids: string[]) => Api.del(url, ids)

// 导出系统消息列表
export const messageExport = async (filename?: string, params?: ApiQuery, range: ExportRange = 'page') =>
  Api.exportRange(url, filename, params, range)

// 获取当前用户系统消息列表
export const listMessageOfCurrent = async (query?: ApiQuery) => Api.getList<UserMessage>(userMessageUrl, query)

// 当前用户系统消息设置已读
export const SetMessageReadOfCurrent = async (ids: string[]) => {
  await request({
    url: `${userMessageUrl}/${ids.join(',')}`,
    method: 'put'
  })
}

// 删除当前用户系统消息
export const DelMessageOfCurrent = async (ids: string[]) => Api.del(userMessageUrl, ids)
