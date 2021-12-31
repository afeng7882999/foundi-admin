import { rAF } from '@/utils/next-frame'

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
export function scrollTo(start: number, end: number, move: (val: number) => void, duration = 500) {
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
  animateScroll()
}

/**
 * 滚动到页面顶端
 */
export function scrollToTop(end = 0, duration = 500) {
  const move = function (val: number) {
    document.documentElement.scrollTop = val
    ;(document.body.parentNode as Element).scrollTop = val
    document.body.scrollTop = val
  }

  const start = function () {
    return (
      document.documentElement.scrollTop || (document.body.parentNode as Element).scrollTop || document.body.scrollTop
    )
  }

  scrollTo(start(), end, (val) => move(val), duration)
}
