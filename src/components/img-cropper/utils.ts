export function wheelEvt() {
  return 'onwheel' in document.createElement('div')
    ? 'wheel'
    : (document as any).onmousewheel !== undefined
      ? 'mousewheel'
      : 'DOMMouseScroll'
}

export function toBlobPolyfill() {
  if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
      // eslint-disable-next-line no-undef
      value: function (callback: BlobCallback, type?: string, quality?: any) {
        const binStr = atob(this.toDataURL(type, quality).split(',')[1])
        const len = binStr.length
        const arr = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
          arr[i] = binStr.charCodeAt(i)
        }
        callback(new Blob([arr], { type: this.type || 'image/png' }))
      }
    })
  }
}

export function crossOriginIos(img: any) {
  // 判断如果不是base64图片 再添加crossOrigin属性，否则会导致iOS低版本(10.2)无法显示图片
  if (typeof img !== 'string' && (img as any).substr(0, 4) !== 'data') {
    img.crossOrigin = ''
  }
}
