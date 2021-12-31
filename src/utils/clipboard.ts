import ClipboardJS from 'clipboard'
import { ElMessage } from 'element-plus'

/**
 * 复制文本到剪贴板
 */
export default function handleClipboard(text: string, event: Event): void {
  if (event.target instanceof Element) {
    const clipboard = new ClipboardJS(event.target, {
      text: () => text
    })
    clipboard.on('success', () => {
      ElMessage({
        message: '成功复制',
        type: 'success',
        duration: 1500
      })
      clipboard.destroy()
    })
    clipboard.on('error', () => {
      ElMessage({
        message: '复制操作失败',
        type: 'error',
        duration: 1500
      })
      clipboard.destroy()
    })
    ;(clipboard as any).onClick(event)
  }
}
