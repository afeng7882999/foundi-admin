/* eslint-disable prettier/prettier */
/**
 * HTMLElement是否有某个class
 */
export function hasClass(he: HTMLElement, cls: string): boolean {
  return !!he.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * HTMLElement添加某个class
 */
export function addClass(he: HTMLElement, cls: string): void {
  if (!hasClass(he, cls)) he.className += ' ' + cls
}

/**
 * HTMLElement移除某个class
 */
export function removeClass(he: HTMLElement, cls: string): void {
  if (hasClass(he, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
    he.className = he.className.replace(reg, ' ')
  }
}

/**
 * HTMLElement切换某个class
 */
export function toggleClass(he: HTMLElement, cls: string): void {
  if (!he || !cls) {
    return
  }
  let classString = he.className
  const nameIndex = classString.indexOf(cls)
  if (nameIndex === -1) {
    classString += '' + cls
  } else {
    classString = classString.substr(0, nameIndex) + classString.substr(nameIndex + cls.length)
  }
  he.className = classString
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
