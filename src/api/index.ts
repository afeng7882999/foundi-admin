import request from '@/app/request'
import qs from 'qs'
import { downloadFile } from '@/utils/file'
import { getToken } from '@/app/account'
import axios, { AxiosResponse } from 'axios'
import { addOrRemoveSlash } from '@/utils/query'
import { Indexable } from '@/common/types'

// axios response
export type Response<T = ResData> = AxiosResponse<T>

// http返回数据页
export type ResPage = Partial<{
  count: number
  limit: number
  total: number
  current: number
}>

// http返回数据，response.data
export type ResData<T = any> = Partial<
  {
    msg: string | string[]
    ex: string
    content: T | T[] | Indexable<T>
    page: ResPage
    token: string
  } & {
    [key: string]: any
  }
>

// 提交或返回的单一数据
export type ApiObj = Indexable

// 返回的数据列表
export type ApiObjList<T extends ApiObj> = {
  data: T[]
  resData: ResData<T>
} & Partial<{
  total: number
  count: number
}>

// 查询条件
export type ApiQuery = Indexable

// 排序字段
export type SortField = {
  name: string
  comment: string
}

// 导出范围
export type ExportRange = 'all' | 'page'

// 获取单个项目
const getOne = async <T extends ApiObj>(getUrl: string, id: string): Promise<T> => {
  getUrl = addOrRemoveSlash(getUrl, true)
  const { data } = await request({
    url: `${getUrl}${id}`,
    method: 'get'
  })
  return data.content
}

// 获取列表
const getList = async <T extends ApiObj>(listUrl: string, query?: ApiQuery): Promise<ApiObjList<T>> => {
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
  const { data } = await request({
    url: listUrl,
    method: 'get'
  })

  if (data.page) {
    return {
      data: data.content,
      total: data.page.total,
      count: data.page.count,
      resData: data
    }
  } else {
    return {
      data: data.content,
      resData: data
    }
  }
}

// 添加项目
const postOne = async (postUrl: string, data: ApiObj) => {
  await request({
    url: postUrl,
    method: 'post',
    data: data
  })
}

// 编辑项目
const putOne = async (putUrl: string, data: ApiObj) => {
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
const exportData = async (exportUrl: string, filename?: string, params?: ApiQuery) => {
  const { data } = await download(exportUrl, params)
  downloadFile(data, filename ? filename : '数据', 'xlsx')
}

// 下载文件
const download = async (downloadUrl: string, params?: ApiQuery): Promise<any> => {
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
  return date.toString()
}

export default { getOne, getList, postOne, putOne, del, exportData, download, upload }
