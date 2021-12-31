import { AnyObject } from '@/utils/index'

/**
 * 格式化时间，Date对象或时间戳
 */
export function parseTime(time: string | number | Date, cFormat: string): string | null {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'undefined' || time === null || time === 'null') {
    return ''
  } else if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  } as AnyObject
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

/**
 * 语义化时间戳
 */
export function formatTime(time: number, option: string): string | null {
  if (('' + time).length === 10) {
    time = time * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d.getTime()) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分'
  }
}

/**
 * 语义化时间戳
 */
export function formatTime2(time: number): string {
  time = time * 1000
  const d = new Date(time)
  return (
    d.getFullYear() + '年' + d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分'
  )
}

/**
 * Date转字符串
 */
export function formatDate(date: Date, patten: string): string {
  const o = {
    'M+': date.getMonth() + 1, // month
    'd+': date.getDate(), // day
    'H+': date.getHours(), // hour
    'm+': date.getMinutes(), // minute
    's+': date.getSeconds(), // second
    'q+': Math.floor((date.getMonth() + 3) / 3), // season
    S: date.getMilliseconds() // millisecond
  } as AnyObject
  if (/(y+)/.test(patten)) patten = patten.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(patten)) {
      patten = patten.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
    }
  }
  return patten
}
