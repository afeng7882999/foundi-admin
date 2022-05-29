import { CropInfo, CropperContainer, CropperImg, CropperProps, FlipType, ImgTransform, RotateType, ZoomType } from './types'
import useAxis, { getImgProjection } from './use-axis'

// use image transform
const useTransform = (
  props: CropperProps,
  container: CropperContainer,
  theImg: CropperImg,
  cropInfo: CropInfo,
  transform: ImgTransform
) => {
  let moveX0 = 0
  let moveY0 = 0
  let touches0 = {} as TouchList
  let touchScale0 = 1
  let rotateAngle0 = 0

  const { getImgAxis, checkContainerBoundary } = useAxis(props, theImg, cropInfo)

  // image zoom by setting zoom type
  const zoomByTyp = (typ: ZoomType, factor?: number) => {
    if (typ === 'original') {
      transform.scale = 1
      center()
      return
    }
    if (typ === 'cover') {
      transform.scale = getScaleByMode('cover', theImg, container, transform.rotate)
      center()
      return
    }
    if (typ === 'contain') {
      transform.scale = getScaleByMode('contain', theImg, container, transform.rotate)
      center()
      return
    }
    factor = factor ? 1 + factor / 10 : 2
    if (typ === 'zoomIn') {
      const scale = transform.scale * factor
      zoom(scale, container.w / 2, container.h / 2)
      return
    }
    if (typ === 'zoomOut') {
      const scale = transform.scale / factor
      zoom(scale, container.w / 2, container.h / 2)
      return
    }
  }

  // image zoom by mouse wheel
  const zoomByWheel = (change: number, e: WheelEvent, factor?: number) => {
    const centerX = e.clientX - container.left
    const centerY = e.clientY - container.top
    let scale = transform.scale
    change = change > 0 ? 1 : -1
    factor = factor ? 1 + factor / 10 : 2
    change > 0 ? (scale *= factor) : (scale /= factor)
    zoom(scale, centerX, centerY)
  }

  // image zoom by touch begin
  const zoomByTouchBegin = (e: TouchEvent) => {
    touches0 = e.touches
    touchScale0 = transform.scale
  }

  // image zoom by touch
  const zoomByTouch = (e: TouchEvent) => {
    const oldTouch1 = {
      x: touches0[0].clientX,
      y: touches0[0].clientY
    }
    const newTouch1 = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
    const oldTouch2 = {
      x: touches0[1].clientX,
      y: touches0[1].clientY
    }
    const newTouch2 = {
      x: e.touches[1].clientX,
      y: e.touches[1].clientY
    }
    const centerX = (newTouch2.x + newTouch1.x) / 2
    const centerY = (newTouch2.y + newTouch1.y) / 2
    const oldL = Math.sqrt(Math.pow(oldTouch1.x - oldTouch2.x, 2) + Math.pow(oldTouch1.y - oldTouch2.y, 2))
    const newL = Math.sqrt(Math.pow(newTouch1.x - newTouch2.x, 2) + Math.pow(newTouch1.y - newTouch2.y, 2))
    const change = touchScale0 * (newL / oldL)
    zoom(change, centerX, centerY)
  }

  // image zoom
  const zoom = (scale: number, centerX: number, centerY: number) => {
    const dx = ((theImg.trueW / 2 - centerX + transform.translateX) / transform.scale) * (scale - transform.scale)
    const dy = ((theImg.trueH / 2 - centerY + transform.translateY) / transform.scale) * (scale - transform.scale)
    let transX = transform.translateX + dx
    let transY = transform.translateY + dy

    const boundary = checkContainerBoundary(getImgAxis(transX, transY, scale, transform.rotate), container)
    const { transX: centerTransX, transY: centerTransY } = getCenterTranslate(theImg, container)

    if (theImg.outW * scale <= container.w && theImg.outH * scale <= container.h) {
      transform.scale = getScaleByMode('contain', theImg, container, transform.rotate)
      center()
      return
    }
    if (theImg.outW * transform.scale <= container.w) {
      transX = centerTransX
    } else if (boundary.left && !boundary.right) {
      transX = -(theImg.trueW / 2 - (theImg.outW * scale) / 2)
    } else if (!boundary.left && boundary.right) {
      transX = -(theImg.trueW / 2 - (container.w - (theImg.outW * scale) / 2))
    }
    if (theImg.outH * transform.scale <= container.h) {
      transY = centerTransY
    } else if (boundary.top && !boundary.bottom) {
      transY = -(theImg.trueH / 2 - (theImg.outH * scale) / 2)
    } else if (!boundary.top && boundary.bottom) {
      transY = -(theImg.trueH / 2 - (container.h - (theImg.outH * scale) / 2))
    }

    transform.translateX = transX
    transform.translateY = transY
    transform.scale = scale
  }

  // image move begin
  const moveBegin = (clientX: number, clientY: number) => {
    moveX0 = clientX - transform.translateX
    moveY0 = clientY - transform.translateY
  }

  // image move
  const move = (clientX: number, clientY: number) => {
    let changeX = clientX - moveX0
    let changeY = clientY - moveY0
    const axis = getImgAxis(changeX, changeY, transform.scale, transform.rotate)

    const boundary = checkContainerBoundary(
      getImgAxis(transform.translateX, transform.translateY, transform.scale, transform.rotate),
      container
    )
    const boundary2 = checkContainerBoundary(axis, container)
    if (boundary.left && boundary.right) {
      changeX = -(theImg.trueW / 2 - container.w / 2)
    } else {
      if (boundary2.left && !boundary2.right) {
        changeX = -(theImg.trueW / 2 - (theImg.outW * transform.scale) / 2)
      } else if (!boundary2.left && boundary2.right) {
        changeX = -(theImg.trueW / 2 - (container.w - (theImg.outW * transform.scale) / 2))
      }
    }
    if (boundary.top && boundary.bottom) {
      changeY = -(theImg.trueH / 2 - container.h / 2)
    } else {
      if (boundary2.top && !boundary2.bottom) {
        changeY = -(theImg.trueH / 2 - (theImg.outH * transform.scale) / 2)
      } else if (!boundary2.top && boundary2.bottom) {
        changeY = -(theImg.trueH / 2 - (container.h - (theImg.outH * transform.scale) / 2))
      }
    }

    transform.translateX = changeX
    transform.translateY = changeY
  }

  // center the image
  const center = () => {
    const trans = getCenterTranslate(theImg, container)
    transform.translateX = trans.transX
    transform.translateY = trans.transY
  }

  // image rotate by setting rotate type
  const rotateByTyp = (typ: RotateType) => {
    let rotateAngle = transform.rotate
    if (typ === 'rotateR') {
      rotateAngle = transform.rotate + Math.PI / 2
    }
    if (typ === 'rotateL') {
      rotateAngle = transform.rotate - Math.PI / 2
    }
    if (typ === 'reset') {
      rotateAngle = 0
    }

    rotate(rotateAngle)
  }

  // image rotate by mouse begin
  const rotateByMouseBegin = (clientX: number, clientY: number) => {
    moveX0 = clientX - container.left
    moveY0 = clientY - container.top
    rotateAngle0 = Math.atan2(moveY0 - container.h / 2, moveX0 - container.w / 2) - transform.rotate
  }

  // image rotate by mouse
  const rotateByMouse = (clientX: number, clientY: number) => {
    const mouseX = clientX - container.left
    const mouseY = clientY - container.top
    const angle = Math.atan2(mouseY - container.h / 2, mouseX - container.w / 2)
    const rotateAngle = angle - rotateAngle0

    rotate(rotateAngle)
  }

  // rotate an image, around the container's center
  const rotate = (angle: number) => {
    const dx =
      container.w / 2 +
      (theImg.trueW / 2 + transform.translateX - container.w / 2) * Math.cos(angle - transform.rotate) -
      (theImg.trueH / 2 + transform.translateY - container.h / 2) * Math.sin(angle - transform.rotate) -
      (theImg.trueW / 2 + transform.translateX)
    const dy =
      container.h / 2 +
      (theImg.trueW / 2 + transform.translateX - container.w / 2) * Math.sin(angle - transform.rotate) +
      (theImg.trueH / 2 + transform.translateY - container.h / 2) * Math.cos(angle - transform.rotate) -
      (theImg.trueH / 2 + transform.translateY)

    let translateX = transform.translateX + dx
    let translateY = transform.translateY + dy
    const boundary = checkContainerBoundary(getImgAxis(transform.translateX, transform.translateY, transform.scale, angle), container)

    if (theImg.outW * transform.scale <= container.w && theImg.outH * transform.scale <= container.h) {
      const { outW, outH } = getImgProjection(theImg.trueW, theImg.trueH, angle)
      transform.scale = getScaleByMode('contain', theImg, container, angle)
      transform.rotate = angle
      theImg.outW = outW
      theImg.outH = outH
      return
    }

    const { transX: centerTransX, transY: centerTransY } = getCenterTranslate(theImg, container)
    if (theImg.outW * transform.scale <= container.w) {
      translateX = centerTransX
    } else if (boundary.left) {
      translateX = -(theImg.trueW / 2 - (theImg.outW * transform.scale) / 2)
    } else if (boundary.right) {
      translateX = -(theImg.trueW / 2 - (container.w - (theImg.outW * transform.scale) / 2))
    }

    if (theImg.outH * transform.scale <= container.h) {
      translateY = centerTransY
    } else if (boundary.top) {
      translateY = -(theImg.trueH / 2 - (theImg.outH * transform.scale) / 2)
    } else if (boundary.bottom) {
      translateY = -(theImg.trueH / 2 - (container.h - (theImg.outH * transform.scale) / 2))
    }

    const { outW, outH } = getImgProjection(theImg.trueW, theImg.trueH, angle)
    transform.translateX = translateX
    transform.translateY = translateY
    transform.rotate = angle
    theImg.outW = outW
    theImg.outH = outH
  }

  // set image angle -PI to PI, after rotating
  const rotateEnd = () => {
    if (transform.rotate > Math.PI) {
      transform.rotate -= 2 * Math.PI
      return
    }
    if (transform.rotate < -Math.PI) {
      transform.rotate += 2 * Math.PI
      return
    }
  }

  // image flip
  const flip = (typ: FlipType) => {
    if (typ === 'horizontal') {
      transform.flipH = !transform.flipH
      return
    }
    if (typ === 'vertical') {
      transform.flipV = !transform.flipV
      return
    }
    if (typ === 'reset') {
      transform.flipH = false
      transform.flipV = false
      return
    }
  }

  // reset the transform of image
  const reset = () => {
    rotate(0)
    transform.scale = getScaleByMode('contain', theImg, container, transform.rotate)
    center()
  }

  return {
    moveBegin,
    move,
    zoomByTyp,
    zoomByWheel,
    zoomByTouchBegin,
    zoomByTouch,
    zoom,
    rotateByTyp,
    rotateByMouseBegin,
    rotateByMouse,
    rotate,
    rotateEnd,
    flip,
    center,
    reset
  }
}

// get translate number when center the image
const getCenterTranslate = (theImg: CropperImg, container: CropperContainer) => {
  return { transX: container.w / 2 - theImg.trueW / 2, transY: container.h / 2 - theImg.trueH / 2 }
}

// get scale of image by display mode
const getScaleByMode = (mode: string, theImg: CropperImg, container: CropperContainer, rotate: number) => {
  let scale = 1
  const { outW, outH } = getImgProjection(theImg.trueW, theImg.trueH, rotate)

  // 'contain', resize to fit within container
  if (mode.indexOf('contain') !== -1) {
    if (outW > container.w) {
      scale = container.w / outW
    }
    if (outH * scale > container.h) {
      scale = container.h / outH
    }
    return scale
  }
  // 'cover', resize to fill the container
  if (mode.indexOf('cover') !== -1) {
    scale = container.w / outW
    if (outH * scale < container.h) {
      scale = container.h / outH
    }
    return scale
  }
  try {
    // image size in pixels, '100px', '100px 100px', 'auto 100px'
    let ms = mode.match(/\bauto\b|[.|0-9]+(?=px)/g)
    if (ms && ms.length === 1 && ms[0] !== 'auto') {
      scale = parseFloat(ms[0]) / outW
      return scale
    }
    if (ms && ms.length === 2 && ms[0] !== 'auto') {
      scale = Math.min(parseFloat(ms[0]) / outW, parseFloat(ms[1]) / outH)
      return scale
    }
    if (ms && ms.length === 2 && ms[0] === 'auto') {
      scale = parseFloat(ms[1]) / outH
      return scale
    }
    // image size in percent, '50%', 'auto 50%'
    ms = mode.match(/\bauto\b|[.|0-9]+(?=%)/g)
    if (ms && ms.length === 1) {
      scale = ((parseFloat(ms[0]) / 100) * container.w) / outW
      return scale
    }
    if (ms && ms.length === 2) {
      scale = ((parseFloat(ms[1]) / 100) * container.h) / outH
      return scale
    }
  } catch (e) {
    console.warn('Value of property "ImgMode" is illegal')
    return 1
  }

  console.warn('Value of property "ImgMode" is illegal')
  return 1
}

export default useTransform
export { getScaleByMode, getCenterTranslate }
