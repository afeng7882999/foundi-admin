import { getDateListByRange, getLastDateList } from '@/utils/time'
import { IContentStat } from '@/api/dashboard'

export type ContentStatRange = number | Date[]

export const getContentStat = async (range = 7 as ContentStatRange): Promise<IContentStat[]> => {
  let dateList
  if (typeof range === 'number') {
    dateList = getLastDateList(range)
  } else {
    dateList = getDateListByRange(range[0] as Date, range[1] as Date)
  }

  const reads = [
    768, 471, 853, 960, 1101, 1785, 929, 1594, 896, 845, 694, 597, 1249, 978, 787, 483, 479, 746, 857, 1049, 405, 372,
    943, 1724, 971, 470, 1382, 875, 935, 1353
  ]
  const likes = [
    441, 65, 516, 569, 636, 1266, 402, 1089, 558, 462, 468, 219, 1016, 581, 468, 241, 246, 308, 480, 658, 104, 146, 540,
    1282, 629, 162, 904, 604, 544, 983
  ]
  const shares = [
    33, 41, 39, 25, 84, 110, 85, 101, 30, 61, 95, 57, 127, 65, 39, 30, 37, 48, 95, 42, 23, 17, 57, 61, 43, 27, 75, 85,
    42, 40
  ]
  const comments = [
    14, 4, 23, 10, 56, 95, 15, 84, 8, 18, 74, 3, 105, 29, 21, 5, 16, 13, 58, 20, 1, 4, 33, 39, 17, 7, 55, 59, 22, 12
  ]
  const result = [] as IContentStat[]
  for (let i = 0; i < dateList.length; i++) {
    const n = i % 30
    result.push({ date: dateList[i], read: reads[n], like: likes[n], comment: comments[n], share: shares[n] })
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(result)
    }, 500)
  })
}
