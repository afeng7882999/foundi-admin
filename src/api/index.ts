import { AnyObject } from '@/utils'
import request from '@/app/request'
import qs from 'qs'
import { downloadFile } from '@/utils/file'
import { getToken } from '@/app/account'
import axios from 'axios'
import { addOrRemoveSlash } from '@/utils/query'

export type IResData = AnyObject

// 获取单个项目
const getOne = async <T extends IResData>(getUrl: string, id: string) => {
  getUrl = addOrRemoveSlash(getUrl, true)
  const { data } = await request({
    url: `${getUrl}${id}`,
    method: 'get'
  })
  return data.content as T
}

// 获取列表
const getList = async <T extends IResData>(listUrl: string, query?: AnyObject) => {
  listUrl = addOrRemoveSlash(listUrl, false)
  if (query !== undefined) {
    listUrl =
      listUrl +
      '?' +
      qs.stringify(query, {
        indices: false,
        arrayFormat: 'repeat',
        serializeDate: dateSerialize
      })
  }
  const { data } = (await request({
    url: listUrl,
    method: 'get'
  })) as AnyObject

  if (data.page) {
    return {
      data: data.content as T[],
      total: data.page.total as number,
      count: data.page.count as number,
      resData: data as AnyObject
    }
  } else {
    return {
      data: data.content as T[],
      resData: data as AnyObject
    }
  }
}

// 添加项目
const postOne = async (postUrl: string, data: AnyObject) => {
  await request({
    url: postUrl,
    method: 'post',
    data: data
  })
}

// 编辑项目
const putOne = async (putUrl: string, data: AnyObject) => {
  await request({
    url: putUrl,
    method: 'put',
    data: data
  })
}

// 删除
const del = async (delUrl: string, ids: string[]) => {
  delUrl = addOrRemoveSlash(delUrl, true)
  await request({
    url: `${delUrl}${ids.join(',')}`,
    method: 'delete'
  })
}

// 导出
const exportData = async (exportUrl: string, filename?: string, params?: AnyObject) => {
  const { data } = await download(exportUrl, params)
  downloadFile(data, filename ? filename : '数据', 'xlsx')
}

// 下载文件
const download = async (downloadUrl: string, params?: AnyObject): Promise<any> => {
  downloadUrl = addOrRemoveSlash(downloadUrl, false)
  if (params !== undefined) {
    downloadUrl = downloadUrl + '?' + qs.stringify(params, { indices: false })
  }
  return request({
    url: downloadUrl,
    method: 'get',
    responseType: 'blob'
  })
}

// 上传文件
async function upload(uploadUrl: string, file: Blob): Promise<any> {
  const data = new FormData()
  data.append('file', file)
  const config = {
    headers: { Authorization: 'Bear ' + getToken() }
  }
  return axios.post(uploadUrl, data, config)
}

// Date类型序列化
const dateSerialize = (date: Date) => {
  // console.log(date.toString())
  return date.toString()
}

export default { getOne, getList, postOne, putOne, del, exportData, download, upload }
