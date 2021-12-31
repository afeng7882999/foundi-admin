import { generateId } from './lang'

/**
 * 下载文件
 */
export function downloadFile(obj: Blob, name: string, suffix: string): void {
  const url = window.URL.createObjectURL(new Blob([obj]))
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  const fileName = name + '_' + generateId() + '.' + suffix
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 获取文件扩展名
 */
export function getFileExt(filename: string): string {
  const idx = filename.lastIndexOf('.')
  return filename.substr(idx + 1)
}
