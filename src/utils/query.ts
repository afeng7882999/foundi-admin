import { AnyObject } from '@/utils/index'
import { cleanArray } from '@/utils/lang'

/**
 * 判断url是本地还是远端，自动添加服务器地址
 */
export function localOrRemoteUrl(path: string, base: 'proxy' | 'upload' = 'proxy' ): string {
  if (!path) {
    return ''
  }
  if (path.charAt(0) !== '/') {
    return path
  }
  const baseUrl = base === 'proxy' ? getProxyBaseApi() : getUploadBaseApi()
  return baseUrl + path
}

/**
 * 获取代理地址
 */
export function getProxyBaseApi(): string {
  return import.meta.env.VITE_APP_PROXY_BASE_API as string
}

/**
 * 获取代理地址
 */
export function getUploadBaseApi(): string {
  return import.meta.env.VITE_APP_UPLOAD_BASE_API as string
}

/**
 * Json转url参数
 */
export function obj2Param(json: AnyObject): string {
  if (!json) {
    return ''
  }
  const params = Object.keys(json).map((k) =>
    json[k] !== undefined ? encodeURIComponent(k) + '=' + encodeURIComponent(json[k]) : ''
  )
  return cleanArray(params).join('&')
}

/**
 * url参数转Json
 */
export function param2Obj(url: string): AnyObject {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
      decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"').replace(/\+/g, ' ') +
      '"}'
  )
}

/**
 * url参数转object
 */
export function getQueryObj(url: string): AnyObject {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {} as AnyObject
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

/**
 * url添加'/'
 */
export function addOrRemoveSlash(url: string, ifAdd: boolean): string {
  const result = url.replace(/\/$/g, '')
  return ifAdd ? result + '/' : result
}
