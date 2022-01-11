import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

export const DEFAULT_DATETIME_FORMAT = 'YYYY[年]MM[月]DD[日] HH:mm:ss'
export const DEFAULT_DATE_FORMAT = 'YYYY[年]MM[月]DD[日]'
export const DEFAULT_TIME_FORMAT = 'HH:mm:ss'

/**
 * 语义化时间戳
 */
export function formatTimestamp(timestamp: number, option = DEFAULT_DATETIME_FORMAT): string {
  if (('' + timestamp).length === 10) {
    timestamp = timestamp * 1000
  } else {
    timestamp = +timestamp
  }
  const d = dayjs(timestamp)
  const diff = dayjs().diff(d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }

  return d.format(option)
}

/**
 * 时间戳转日期时间字符串
 */
export function formatTimestamp2(timestamp: number, option = DEFAULT_DATETIME_FORMAT): string {
  if (('' + timestamp).length === 10) {
    timestamp = timestamp * 1000
  } else {
    timestamp = +timestamp
  }
  const d = dayjs(timestamp)
  return d.format(option)
}

/**
 * 获取最近N天的日期字符串数组
 */
export function getLastDateList(num: number): string[] {
  const today = dayjs()
  const result = [] as string[]
  for (let i = num; i > 0; i--) {
    result.push(today.subtract(i, 'day').format(DEFAULT_DATE_FORMAT))
  }
  return result
}

/**
 * 获取日期范围内的日期字符串数组
 */
export function getDateListByRange(start: Date, end: Date): string[] {
  let d1 = dayjs(start)
  const d2 = dayjs(end).endOf('day')
  const result = [] as string[]
  while (!d1.isAfter(d2)) {
    result.push(d1.format(DEFAULT_DATE_FORMAT))
    d1 = d1.add(1, 'day')
  }
  return result
}
