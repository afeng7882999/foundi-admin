export const rAF = window.requestAnimationFrame || ((func) => setTimeout(func, 1000 / 60))

/**
 * 下次重绘之前调用
 */
export function nextFrame(fn: any) {
  rAF(() => {
    rAF(fn)
  })
}
