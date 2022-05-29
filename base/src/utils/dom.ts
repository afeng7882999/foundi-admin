/* eslint-disable prettier/prettier */

/**
 * 判断Element对象是否包含特定类名
 */
export function hasClass (el: Element, cls: string): boolean {
  if (!el || !cls) return false
  if (cls.includes(' ')) throw new Error('className should not contain space.')
  return el.classList.contains(cls)
}

/**
 * Element对象添加特定类名
 */
export function addClass (el: Element, cls: string) {
  if (!el || !cls.trim()) return
  el.classList.add(...classNameToArray(cls))
}

/**
 * Element对象删除特定类名
 */
export function removeClass (el: Element, cls: string) {
  if (!el || !cls.trim()) return
  el.classList.remove(...classNameToArray(cls))
}

/**
 * Element对象切换特定类名
 */
export function toggleClass(el: HTMLElement | Element, cls: string): void {
  if (!el || !cls) {
    return
  }
  if (hasClass(el, cls)) {
    removeClass(el, cls)
  } else {
    addClass(el, cls)
  }
}


/**
 * 多个对象类名转化为字符串数组
 */
export function classNameToArray (cls = '') {
  return cls.split(' ').filter((item) => !!item.trim())
}

/**
 * 新建浏览器窗口
 */
export function openWindow(url: string, title: string, w: number, h: number): void {
  // Fixes dual-screen position
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : (screen as any).left
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : (screen as any).top

  const width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : screen.width
  const height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : screen.height

  const left = width / 2 - w / 2 + dualScreenLeft
  const top = height / 2 - h / 2 + dualScreenTop
  const newWindow = window.open(
    url,
    title,
    'toolbar=no, location=no, directories=no, status=no, menubar=no, ' +
      'scrollbars=no, resizable=yes, copyhistory=no, width=' +
      w +
      ', height=' +
      h +
      ', top=' +
      top +
      ', left=' +
      left
  )

  // Puts focus on the newWindow
  if (newWindow) {
    newWindow.focus()
  }
}

/**
 * 绑定Event
 */
export const on = function (
  element: HTMLElement | Document | Window,
  event: string,
  handler: EventListenerOrEventListenerObject,
  useCapture = false
): void {
  if (element && event && handler) {
    element.addEventListener(event, handler, useCapture)
  }
}

/**
 * 解绑Event
 */
export const off = function (
  element: HTMLElement | Document | Window,
  event: string,
  handler: EventListenerOrEventListenerObject,
  useCapture = false
): void {
  if (element && event && handler) {
    element.removeEventListener(event, handler, useCapture)
  }
}
