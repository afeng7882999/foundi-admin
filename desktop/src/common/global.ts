import { ElMessage, ElMessageBox, useZIndex } from 'element-plus'
import { registerFnGlobal } from '@b/common/global'

const registerBaseGlobal = () => {
  const { nextZIndex } = useZIndex()

  const messageFn = (message: string, type: string, duration: number) => {
    ElMessage({
      message,
      type: type as 'success' | 'info' | 'warning' | 'error',
      duration
    })
  }

  const messageBoxConfirmFn = async (
    message: string,
    title: string,
    confirmText: string,
    cancelText: string,
    type: string
  ): Promise<void> => {
    await ElMessageBox.confirm(message, title, {
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      type: type as 'success' | 'info' | 'warning' | 'error'
    })
  }

  registerFnGlobal({
    scrollbar: 'ElScrollbar',
    nextZIndex,
    messageFn,
    messageBoxConfirmFn
  })
}

export default registerBaseGlobal
