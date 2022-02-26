/* eslint-disable prettier/prettier */

/**
 * 去除空格
 */
const trimArr = function (s: string) {
  return (s || '').split(' ').filter((item) => !!item.trim())
}

/**
 * HTMLElement是否有某个class
 */
export function hasClass(el: HTMLElement | Element, cls: string): boolean {
  if (!el || !cls) return false
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.')
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    const className = el.getAttribute('class') || ''
    return className.split(' ').includes(cls)
  }
}

/**
 * HTMLElement添加某个class
 */
export function addClass(el: HTMLElement | Element, cls: string): void {
  if (!el) return
  let className = el.getAttribute('class') || ''
  const curClass = trimArr(className)
  const classes = (cls || '').split(' ').filter((item) => !curClass.includes(item) && !!item.trim())

  if (el.classList) {
    el.classList.add(...classes)
  } else {
    className += ` ${classes.join(' ')}`
    el.setAttribute('class', className)
  }
}

/**
 * HTMLElement移除某个class
 */
export function removeClass(el: HTMLElement | Element, cls: string): void {
  if (!el || !cls) return
  const classes = trimArr(cls)
  let curClass = el.getAttribute('class') || ''

  if (el.classList) {
    el.classList.remove(...classes)
    return
  }
  classes.forEach((item) => {
    curClass = curClass.replace(` ${item} `, ' ')
  })
  const className = trimArr(curClass).join(' ')
  el.setAttribute('class', className)
}

/**
 * HTMLElement切换某个class
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
