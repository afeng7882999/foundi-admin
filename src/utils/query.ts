import { cleanArray } from '@/utils/lang'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { Indexable } from '@/common/types'
import settings from '@/app/settings'
import { PAGE_ROOT_MOBILE, PAGE_ROOT_NORMAL } from '@/router'

/**
 * 判断url是本地还是远端，自动添加服务器地址
 */
export function localOrRemoteUrl(path: string, base: 'proxy' | 'upload' = 'proxy'): string {
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
export function obj2Param(json: Indexable): string {
  if (!json) {
    return ''
  }
  const params = Object.keys(json).map((k) => (json[k] !== undefined ? encodeURIComponent(k) + '=' + encodeURIComponent(json[k]) : ''))
  return cleanArray(params).join('&')
}

/**
 * url参数转Json
 */
export function param2Obj(url: string): Indexable {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"').replace(/\+/g, ' ') + '"}'
  )
}

/**
 * url参数转object
 */
export function getQueryObj(url: string): Indexable {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {} as Indexable
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

/**
 * 根据当前Route获取页面ID
 */
export function getPageIdFromRoute(route: RouteLocationNormalizedLoaded): string {
  const fullPath = route.fullPath.replace(/^\//, '')
  return fullPath.replace(/\//g, '_')
}

/**
 * 规范化Url，根据isMobile返回相应地址
 */
export function normalizeUrl(url: string, isMobile = false): string {
  const urlOfMobile = url.startsWith(settings.mobileRoot + '/') || url.startsWith('/' + settings.mobileRoot + '/')
  if (urlOfMobile && isMobile) {
    return url
  }
  if (!urlOfMobile && !isMobile) {
    return url
  }

  if (urlOfMobile) {
    return url.slice(settings.mobileRoot.length + 1)
  }

  return url.charAt(0) === '/' ? `/${settings.mobileRoot}${url}` : `${settings.mobileRoot}/${url}`
}

/**
 * 规范化Url, 返回数组[ desktop_url, mobile_url ]
 */
export function normalizeUrlMatch(check: string, url: string): boolean {
  if (url === check) {
    return true
  }
  const urlOfMobile = url.startsWith(settings.mobileRoot + '/') || url.startsWith('/' + settings.mobileRoot + '/')
  if (urlOfMobile) {
    return url.slice(settings.mobileRoot.length + 1) === check
  } else {
    const normalized = url.charAt(0) === '/' ? `/${settings.mobileRoot}${url}` : `${settings.mobileRoot}/${url}`
    return normalized === check
  }
}

// 规范化页面文件路径
export function normalizePath(path: string, isMobile = false): string {
  if (path.startsWith(PAGE_ROOT_NORMAL)) {
    if (!isMobile) {
      return path
    }
    return PAGE_ROOT_MOBILE + path.slice(11)
  }
  if (path.startsWith(PAGE_ROOT_MOBILE)) {
    return path
  }
  path = path.replace(/^\//, '')
  return isMobile ? PAGE_ROOT_MOBILE + path : PAGE_ROOT_NORMAL + path
}
