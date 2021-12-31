import Api, { IResData } from '@/api'
import { AnyObject } from '@/utils'
import { IDictItem } from '@/api/system/dict-item'
import request from '@/app/request'

export interface IFile extends IResData {
  // 主键
  id: string
  // 文件名
  name: string
  // 文件上传的OSS配置键值
  oss: string
  // 文件类型（字典：SysFileType）
  typeDict: string
  // URL地址
  url: string
  // 创建人
  createBy: string
  // 创建时间
  createAt: string
}

export const fileFields = {
  idField: 'id'
}

export const fileDicts = {
  sysFileType: [] as IDictItem[]
}

export const fileQuery = {
  name: undefined,
  oss: undefined,
  typeDict: undefined
}

export const DEFAULT_OSS = 'local_oss_default'

// api url
export const url = '/api/system/file'

// 获取单个文件
export const fileGetOne = async (id: string) => Api.getOne<IFile>(url, id)

// 获取文件列表
export const fileList = async (query?: AnyObject) => Api.getList<IFile>(url, query)

// 编辑文件
export const filePutOne = async (data: AnyObject) => Api.putOne(url, data)

// 删除文件
export const fileDel = async (ids: string[]) => Api.del(url, ids)

// 上传文件
export const upload = async (files: File[], oss = DEFAULT_OSS) => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  formData.append('oss', oss)
  try {
    const { data } = await request({
      url: url + '/upload',
      method: 'post',
      headers: { 'Content-type': 'multipart/form-data' },
      data: formData
    })
    return data.content as string[]
  } catch (e) {
    console.log(e)
  }
}

// 查询当前用户文件
export const listFileOfCurrent = async (query?: AnyObject) => Api.getList<IFile>(url + '/current', query)
