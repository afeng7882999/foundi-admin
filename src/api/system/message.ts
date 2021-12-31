import Api, { IResData } from '@/api'
import { AnyObject } from '@/utils'
import request from '@/app/request'
import { IDictItem } from '@/api/system/dict-item'

export interface IMessage extends IResData {
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

export interface IUserMessage extends IResData {
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
  sysMessageType: [] as IDictItem[]
}

export const messageQuery = {
  title: undefined,
  typeDict: undefined,
  createAt: [] as Date[]
}

export const useMessageFields = {
  idField: 'id'
}

export const userMessageDicts = {
  sysMessageType: [] as IDictItem[],
  sysMessageStatus: [] as IDictItem[]
}

export const userMessageQuery = {
  title: undefined,
  typeDict: undefined,
  statusDict: undefined,
  createAt: [] as Date[]
}

// api url
export const url = '/api/system/message'

// api url of current user
export const userMessageUrl = '/api/system/message/current'

// 获取单个系统消息
export const messageGetOne = async (id: string) => Api.getOne<IMessage>(url, id)

// 获取系统消息列表
export const messageList = async (query?: AnyObject) => Api.getList<IMessage>(url, query)

// 添加系统消息
export const messagePostOne = async (data: AnyObject) => Api.postOne(url, data)

// 编辑系统消息
export const messagePutOne = async (data: AnyObject) => Api.putOne(url, data)

// 删除系统消息
export const messageDel = async (ids: string[]) => Api.del(url, ids)

// 导出系统消息列表
export const messageExport = async (filename?: string, params?: AnyObject) =>
  Api.exportData(url + '/export', filename, params)

// 获取当前用户系统消息列表
export const listMessageOfCurrent = async (query?: AnyObject) => Api.getList<IUserMessage>(userMessageUrl, query)

// 当前用户系统消息设置已读
export const SetMessageReadOfCurrent = async (ids: string[]) => {
  await request({
    url: `${userMessageUrl}/${ids.join(',')}`,
    method: 'put'
  })
}

// 删除当前用户系统消息
export const DelMessageOfCurrent = async (ids: string[]) => Api.del(userMessageUrl, ids)
