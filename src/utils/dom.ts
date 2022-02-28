/* eslint-disable prettier/prettier */
import { addClass, hasClass, removeClass } from 'element-plus/es/utils/index'

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

export { addClass, hasClass, removeClass }
