// global functions and objects
export type MessageFn = (message: string, type: string, duration: number) => void
export type MessageBoxConfirmFn = (message: string, title: string, confirmText: string, cancelText: string, type: string) => Promise<void>

const foundiGlobal = {
  messageFn: undefined as MessageFn | undefined,
  messageBoxConfirmFn: undefined as MessageBoxConfirmFn | undefined
}

export const registerFnGlobal = (messageFn: MessageFn, messageBoxConfirmFn: MessageBoxConfirmFn) => {
  foundiGlobal.messageFn = messageFn
  foundiGlobal.messageBoxConfirmFn = messageBoxConfirmFn
}

export const message = (message: string, type: string, duration: number) => {
  foundiGlobal.messageFn?.(message, type, duration)
}

export const messageBoxConfirm = async (message: string, title: string, confirmText: string, cancelText: string, type: string) => {
  await foundiGlobal.messageBoxConfirmFn?.(message, title, confirmText, cancelText, type)
}
