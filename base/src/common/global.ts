// global const
export const DEFAULT_POPPER_Z_INDEX = 2000

export const LAYOUT_SIZES = {
  ratio: 3,
  titleHeight: 48,
  tabHeight: 48,
  titlePadding: 8,
  sidebarMiniWidth: 56,
  sidebarNormalWidth: 256,
  footerHeight: 48,
  pageHeaderHeight: 48
}

export const LAYOUT_BREAKPOINTS = {
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1920
}

// global functions and objects
export type NextZIndex = () => number
export type MessageFn = (message: string, type: string, duration: number) => void
export type MessageBoxConfirmFn = (message: string, title: string, confirmText: string, cancelText: string, type: string) => Promise<void>

export type FoundiGlobalOptions = Partial<{
  scrollbar: string
  nextZIndex: NextZIndex
  messageFn: MessageFn
  messageBoxConfirmFn: MessageBoxConfirmFn
}>

const foundiGlobal = {
  scrollbar: 'div',
  nextZIndex: undefined,
  messageFn: undefined,
  messageBoxConfirmFn: undefined
} as FoundiGlobalOptions

export const registerFnGlobal = (options: FoundiGlobalOptions) => {
  options.scrollbar && (foundiGlobal.scrollbar = options.scrollbar)
  foundiGlobal.nextZIndex = options.nextZIndex
  foundiGlobal.messageFn = options.messageFn
  foundiGlobal.messageBoxConfirmFn = options.messageBoxConfirmFn
}

export const message = (message: string, type: string, duration: number) => {
  foundiGlobal.messageFn?.(message, type, duration)
}

export const messageBoxConfirm = async (message: string, title: string, confirmText = '确定', cancelText = '取消', type = 'warning') => {
  await foundiGlobal.messageBoxConfirmFn?.(message, title, confirmText, cancelText, type)
}

export const nextZIndex = (): number => {
  return foundiGlobal.nextZIndex?.() ?? DEFAULT_POPPER_Z_INDEX
}

export default foundiGlobal
