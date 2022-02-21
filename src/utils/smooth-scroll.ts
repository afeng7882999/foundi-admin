import { rAF } from '@/utils/next-frame'
import { isNumber } from '@vueuse/core'

/**
 * 曲线函数
 */
function easeInOutQuad(t: number, b: number, c: number, d: number): number {
  t /= d / 2
  if (t < 1) {
    return (c / 2) * t * t + b
  }
  t--
  return (-c / 2) * (t * (t - 2) - 1) + b
}

/**
 * 平滑滚动
 */
export function scrollTo(start: number, end: number, move: (val: number) => void, duration = 300) {
  const change = end - start
  const increment = 20
  let currentTime = 0
  const animateScroll = function () {
    currentTime += increment
    const val = easeInOutQuad(currentTime, start, change, duration)
    // move
    move(val)
    if (currentTime < duration) {
      rAF(animateScroll)
    }
  }
  duration > 1000 / 60 ? animateScroll() : move(end)
}

/**
 * 横向滚动
 */
export function scrollElementH(target: HTMLElement, end: HTMLElement | number, duration = 300) {
  const endNum = isNumber(end) ? end : end.scrollLeft
  scrollTo(
    target.scrollLeft,
    endNum,
    (val) => {
      target.scrollLeft = val
    },
    duration
  )
}

/**
 * 纵向滚动
 */
export function scrollElementV(target: HTMLElement, end: HTMLElement | number, duration = 300) {
  const endNum = isNumber(end) ? end : end.scrollTop
  scrollTo(
    target.scrollTop,
    endNum,
    (val) => {
      target.scrollTop = val
    },
    duration
  )
}

/**
 * 获取页面的scrollTop
 */
export function getDocumentTop(): number {
  return document.documentElement.scrollTop || (document.body.parentNode as Element).scrollTop || document.body.scrollTop
}

/**
 * 设置页面的scrollTop
 */
function setDocumentTop(val: number) {
  document.documentElement.scrollTop = val
  ;(document.body.parentNode as Element).scrollTop = val
  document.body.scrollTop = val
}

/**
 * 页面纵向滚动
 */
export function scrollDocH(end: HTMLElement | number, duration = 300) {
  const endNum = isNumber(end) ? end : end.scrollTop
  scrollTo(getDocumentTop(), endNum, (val) => setDocumentTop(val), duration)
}

/**
 * 页面滚动到顶端
 */
export function scrollDocToTop(duration = 300) {
  scrollDocH(0, duration)
}
