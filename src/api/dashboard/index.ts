import dayjs from 'dayjs'
import request from '@/app/request'
import { IResData } from '@/api'

export interface IContentStat extends IResData {
  // 日期
  date: string
  // 阅读
  read: number
  // 点赞
  like: number
  // 评论
  comment: number
  // 转发
  share: number
}

export type ContentStatRange = number | Date[]

const dashboardUrl = '/dashboard'

export const getContentStat = async (range = 7 as ContentStatRange) => {
  let start, end
  if (typeof range === 'number') {
    start = dayjs().subtract(range, 'day').startOf('day').valueOf()
    end = dayjs().subtract(1, 'day').endOf('day').valueOf()
  } else {
    start = (range[0] as Date).getTime()
    end = (range[1] as Date).getTime()
  }

  const { data } = await request({
    url: dashboardUrl + '/contentStat',
    method: 'get',
    params: {
      start: start,
      end: end
    }
  })
  return data as IContentStat[]
}
