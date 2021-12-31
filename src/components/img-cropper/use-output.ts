import { CropInfo, CropperImg, CropperProps, ImgTransform } from './types'
import { computed } from 'vue'

const useOutput = (props: CropperProps, theImg: CropperImg, cropInfo: CropInfo, transform: ImgTransform) => {
  // get output data of image cropped
  const getOutput = (cb: (c: HTMLCanvasElement) => void) => {
    const canvas = document.createElement('canvas')
    const img = new Image()
    const scale = transform.scale
    const trueW = theImg.trueW
    const trueH = theImg.trueH

    img.onload = () => {
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

      // dpr
      let dpr = 1
      if (props.outputHighDpr && !props.outputFullSize) {
        dpr = window.devicePixelRatio
      }
      if (props.outputEnlarge !== 1 && !props.outputFullSize) {
        dpr = Math.abs(props.outputEnlarge) * dpr
      }

      // scale
      let width = cropInfo.cropW * dpr
      let height = cropInfo.cropH * dpr
      let imgW = trueW * scale * dpr
      let imgH = trueH * scale * dpr
      let dx = (transform.translateX - cropInfo.cropOffsetX + (trueW * (1 - scale)) / 2) * dpr
      let dy = (transform.translateY - cropInfo.cropOffsetY + (trueH * (1 - scale)) / 2) * dpr

      // output full size
      if (props.outputFullSize) {
        width = width / scale
        height = height / scale
        imgW = imgW / scale
        imgH = imgH / scale
        dx = dx / scale
        dy = dy / scale
      }

      canvas.width = Math.round(width)
      canvas.height = Math.round(height)
      ctx.save()

      // flip
      if (transform.flipH) {
        ctx.translate(width, 0)
        ctx.scale(-1, 1)
      }
      if (transform.flipV) {
        ctx.translate(0, height)
        ctx.scale(1, -1)
      }

      // rotate
      const transX = transform.flipH ? width - (dx + imgW / 2) : dx + imgW / 2
      const transY = transform.flipV ? height - (dy + imgH / 2) : dy + imgH / 2
      let rotate = transform.flipH ? -transform.rotate : transform.rotate
      rotate = transform.flipV ? -rotate : rotate
      ctx.translate(transX, transY)
      ctx.rotate(rotate)

      ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH)
      ctx.restore()
      cb(canvas)
    }

    // not Base64, enable CORS
    const s = (props.img as any).substr(0, 4)
    if (s !== 'data') {
      img.crossOrigin = 'Anonymous'
    }
    img.src = theImg.imgSrc
  }

  // output to Base64
  const outputBase64 = (cb: (s: string) => void) => {
    getOutput((data) => {
      cb(data.toDataURL('image/' + props.outputType, props.outputQuality))
    })
  }

  // output to Blob
  const outputBlob = (cb: (b: Blob | null) => void) => {
    getOutput((data) => {
      data.toBlob((blob) => cb(blob), 'image/' + props.outputType, props.outputQuality)
    })
  }

  // get image preview info
  const getPreview = () => {
    const w = cropInfo.cropW
    const h = cropInfo.cropH
    const scale = transform.scale
    const obj = {} as any
    obj.div = {
      width: `${w}px`,
      height: `${h}px`
    }
    const transformX = transform.translateX - cropInfo.cropOffsetX
    const transformY = transform.translateY - cropInfo.cropOffsetY
    obj.w = w
    obj.h = h
    obj.url = theImg.imgSrc
    obj.img = {
      width: `${theImg.trueW}px`,
      height: `${theImg.trueH}px`,
      transform: `translate(${transformX}px,${transformY}px) rotateZ(${transform.rotate}rad) scaleX(${
        transform.flipH ? '-' : ''
      }${scale}) scaleY(${transform.flipV ? '-' : ''}${scale})`
    }

    return obj
  }

  const outputInfo = computed(() => {
    const top = cropInfo.cropOffsetY > 21 ? '-21px' : '0px'
    let width = cropInfo.cropW > 0 ? cropInfo.cropW : 0
    let height = cropInfo.cropH > 0 ? cropInfo.cropH : 0
    if (props.cropShowInfo) {
      let dpr = 1
      if (props.outputHighDpr && !props.outputFullSize) {
        dpr = window.devicePixelRatio
      }
      if (props.outputEnlarge !== 1 && !props.outputFullSize) {
        dpr = Math.abs(props.outputEnlarge)
      }
      width = width * dpr
      height = height * dpr
      if (props.outputFullSize) {
        width = width / transform.scale
        height = height / transform.scale
      }
    }
    const w = width.toFixed(0)
    const h = height.toFixed(0)
    return { top: top, width: w, height: h }
  })

  return {
    outputBase64,
    outputBlob,
    getPreview,
    outputInfo
  }
}

export default useOutput
