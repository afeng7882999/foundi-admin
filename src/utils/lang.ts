import config from '@/app/settings'

/**
 * url转驼峰风格
 */
export function urlToCamel(url: string): string {
  const result = url.replace(/(\/\w)/g, (m) => {
    return m[1].toUpperCase()
  })
  return result.charAt(0).toUpperCase() + result.slice(1)
}

/**
 * 驼峰风格字符串转“-”分隔
 */
export function camelToDash(str: string): string {
  return str.replace(/[A-Z]/g, (s) => `-${s.toLowerCase()}`)
}

/**
 * 首字母大写
 */
export function upperFirst(str: string): string {
  return str.substring(0, 1).toUpperCase() + str.substring(1)
}

/**
 * 首字母小写
 */
export function lowerFirst(str: string): string {
  return str.substring(0, 1).toLowerCase() + str.substring(1)
}

/**
 * 获取utf8字符串的字节数
 */
export function byteLength(str: string): number {
  let s = str.length
  for (let i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i)
    if (code > 0x7f && code <= 0x7ff) s++
    else if (code > 0x7ff && code <= 0xffff) s += 2
    if (code >= 0xdc00 && code <= 0xdfff) i--
  }
  return s
}

/**
 * 初始化列表
 */
export function cleanArray(actual: unknown[]): unknown[] {
  const newArray = []
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i])
    }
  }
  return newArray
}

/**
 * html转文本
 */
export function html2Text(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText
}

/**
 * 列表去重
 */
export function uniqueArr(arr: any[]): any[] {
  return Array.from(new Set(arr))
}

/**
 * 产生唯一ID
 */
export function createUniqueString(): string {
  const timestamp = +new Date() + ''
  const randomNum = parseInt((1 + Math.random()) * 65536 + '') + ''
  return (+(randomNum + timestamp)).toString(32)
}

/**
 * 获取页面标题
 */
export function getPageTitle(pageTitle: string): string {
  if (pageTitle) {
    return `${pageTitle} - ${config.title}`
  }
  return `${config.title}`
}

/**
 * 字符串是否有特定结尾
 */
export function endsWith(str: string, ...searches: string[]): boolean {
  const len = str.length
  for (const search of searches) {
    if (str.substring(len - search.length) === search) {
      return true
    }
  }
  return false
}

/**
 * 生成ID
 */
export function generateId(): number {
  return Math.floor(Math.random() * 10000)
}

/**
 * 生成ID
 */
export function generateId2(): string {
  return Math.random().toString(36).substr(2, 6)
}
