import { nextTick } from 'vue'
import { CropInfo, CropperContainer, CropperImg, CropperProps } from './types'

const useCrop = (props: CropperProps, container: CropperContainer, theImg: CropperImg, cropInfo: CropInfo) => {
  let canChangeX = false
  let canChangeY = false
  let cropOldW = 0
  let cropOldH = 0
  let changeCropTypeX = 1
  let changeCropTypeY = 1
  let cropStartOffsetX = 0
  let cropStartOffsetY = 0

  // set crop state when cropping start
  const createBegin = (offsetX: number, offsetY: number, x: number, y: number) => {
    cropInfo.cropOffsetX = offsetX
    cropInfo.cropOffsetY = offsetY
    cropInfo.cropX = x
    cropInfo.cropY = y
    cropInfo.cropW = 0
    cropInfo.cropH = 0
    cropStartOffsetX = offsetX
    cropStartOffsetY = offsetY
  }

  // crop box is creating
  const create = (x: number, y: number) => {
    const dx = x - cropInfo.cropX
    const dy = y - cropInfo.cropY
    if (dx > 0) {
      cropInfo.cropW = dx + cropStartOffsetX > container.w ? container.w - cropStartOffsetX : dx
      cropInfo.cropOffsetX = cropStartOffsetX
    } else {
      cropInfo.cropW = container.w - cropStartOffsetX + Math.abs(dx) > container.w ? cropStartOffsetX : Math.abs(dx)
      cropInfo.cropOffsetX = cropStartOffsetX + dx > 0 ? cropStartOffsetX + dx : 0
    }

    if (!props.cropRatioFixed) {
      if (dy > 0) {
        cropInfo.cropH = dy + cropStartOffsetY > container.h ? container.h - cropStartOffsetY : dy
        cropInfo.cropOffsetY = cropStartOffsetY
      } else {
        cropInfo.cropH = container.h - cropStartOffsetY + Math.abs(dy) > container.h ? cropStartOffsetY : Math.abs(dy)
        cropInfo.cropOffsetY = cropStartOffsetY + dy > 0 ? cropStartOffsetY + dy : 0
      }
    } else {
      const fixedHeight = (cropInfo.cropW / props.cropRatioWhenFixed[0]) * props.cropRatioWhenFixed[1]
      if (fixedHeight + cropInfo.cropOffsetY > container.h) {
        cropInfo.cropH = container.h - cropInfo.cropOffsetY
        cropInfo.cropW = (cropInfo.cropH / props.cropRatioWhenFixed[1]) * props.cropRatioWhenFixed[0]
        if (dx > 0) {
          cropInfo.cropOffsetX = cropStartOffsetX
        } else {
          cropInfo.cropOffsetX = cropStartOffsetX - cropInfo.cropW
        }
      } else {
        cropInfo.cropH = fixedHeight
      }
    }
  }

  // set crop state when scaling start
  const scaleBegin = (x: number, y: number, changeableX: boolean, changeableY: boolean, typeX: number, typeY: number) => {
    cropInfo.cropX = x
    cropInfo.cropY = y
    canChangeX = changeableX
    canChangeY = changeableY
    changeCropTypeX = typeX
    changeCropTypeY = typeY
    cropOldW = cropInfo.cropW
    cropOldH = cropInfo.cropH
    cropStartOffsetX = cropInfo.cropOffsetX
    cropStartOffsetY = cropInfo.cropOffsetY
    if (props.cropRatioFixed) {
      if (canChangeX && canChangeY) {
        canChangeY = false
      }
    }
  }

  // crop box is scaling
  const scale = (x: number, y: number) => {
    const wrapperW = container.w
    const wrapperH = container.h
    const minX = 0
    const minY = 0

    nextTick(() => {
      const dx = x - cropInfo.cropX
      const dy = y - cropInfo.cropY
      if (canChangeX) {
        if (changeCropTypeX === 1) {
          if (cropOldW - dx > 0) {
            cropInfo.cropW = wrapperW - cropStartOffsetX - dx <= wrapperW - minX ? cropOldW - dx : cropOldW + cropStartOffsetX - minX
            cropInfo.cropOffsetX = wrapperW - cropStartOffsetX - dx <= wrapperW - minX ? cropStartOffsetX + dx : minX
          } else {
            cropInfo.cropW = Math.abs(dx) + cropStartOffsetX <= wrapperW ? Math.abs(dx) - cropOldW : wrapperW - cropOldW - cropStartOffsetX
            cropInfo.cropOffsetX = cropStartOffsetX + cropOldW
          }
        } else if (changeCropTypeX === 2) {
          if (cropOldW + dx > 0) {
            cropInfo.cropW = cropOldW + dx + cropInfo.cropOffsetX <= wrapperW ? cropOldW + dx : wrapperW - cropInfo.cropOffsetX
            cropInfo.cropOffsetX = cropStartOffsetX
          } else {
            cropInfo.cropW =
              wrapperW - cropStartOffsetX + Math.abs(dx + cropOldW) <= wrapperW - minX ? Math.abs(dx + cropOldW) : cropStartOffsetX - minX
            cropInfo.cropOffsetX =
              wrapperW - cropStartOffsetX + Math.abs(dx + cropOldW) <= wrapperW - minX ? cropStartOffsetX - Math.abs(dx + cropOldW) : minX
          }
        }
      }

      if (canChangeY) {
        if (changeCropTypeY === 1) {
          if (cropOldH - dy > 0) {
            cropInfo.cropH = wrapperH - cropStartOffsetY - dy <= wrapperH - minY ? cropOldH - dy : cropOldH + cropStartOffsetY - minY
            cropInfo.cropOffsetY = wrapperH - cropStartOffsetY - dy <= wrapperH - minY ? cropStartOffsetY + dy : minY
          } else {
            cropInfo.cropH = Math.abs(dy) + cropStartOffsetY <= wrapperH ? Math.abs(dy) - cropOldH : wrapperH - cropOldH - cropStartOffsetY
            cropInfo.cropOffsetY = cropStartOffsetY + cropOldH
          }
        } else if (changeCropTypeY === 2) {
          if (cropOldH + dy > 0) {
            cropInfo.cropH = cropOldH + dy + cropInfo.cropOffsetY <= wrapperH ? cropOldH + dy : wrapperH - cropInfo.cropOffsetY
            cropInfo.cropOffsetY = cropStartOffsetY
          } else {
            cropInfo.cropH =
              wrapperH - cropStartOffsetY + Math.abs(dy + cropOldH) <= wrapperH - minY ? Math.abs(dy + cropOldH) : cropStartOffsetY - minY
            cropInfo.cropOffsetY =
              wrapperH - cropStartOffsetY + Math.abs(dy + cropOldH) <= wrapperH - minY ? cropStartOffsetY - Math.abs(dy + cropOldH) : minY
          }
        }
      }

      if (canChangeX && props.cropRatioFixed) {
        const fixedHeight = (cropInfo.cropW / props.cropRatioWhenFixed[0]) * props.cropRatioWhenFixed[1]
        if (fixedHeight + cropInfo.cropOffsetY > wrapperH) {
          cropInfo.cropH = wrapperH - cropInfo.cropOffsetY
          cropInfo.cropW = (cropInfo.cropH / props.cropRatioWhenFixed[1]) * props.cropRatioWhenFixed[0]
        } else {
          cropInfo.cropH = fixedHeight
        }
      }

      if (canChangeY && props.cropRatioFixed) {
        const fixedWidth = (cropInfo.cropH / props.cropRatioWhenFixed[1]) * props.cropRatioWhenFixed[0]
        if (fixedWidth + cropInfo.cropOffsetX > wrapperW) {
          cropInfo.cropW = wrapperW - cropInfo.cropOffsetX
          cropInfo.cropH = (cropInfo.cropW / props.cropRatioWhenFixed[0]) * props.cropRatioWhenFixed[1]
        } else {
          cropInfo.cropW = fixedWidth
        }
      }
    })
  }

  // set crop state when moving start
  const moveBegin = (x: number, y: number) => {
    cropInfo.cropX = x - cropInfo.cropOffsetX
    cropInfo.cropY = y - cropInfo.cropOffsetY
  }

  // crop box is moving
  const move = (x: number, y: number, isMove?: boolean) => {
    let cx, cy
    let dx = x - cropInfo.cropX
    let dy = y - cropInfo.cropY
    if (isMove) {
      dx = cropInfo.cropOffsetX
      dy = cropInfo.cropOffsetY
    }

    if (dx <= 0) {
      cx = 0
    } else if (dx + cropInfo.cropW > container.w) {
      cx = container.w - cropInfo.cropW
    } else {
      cx = dx
    }
    if (dy <= 0) {
      cy = 0
    } else if (dy + cropInfo.cropH > container.h) {
      cy = container.h - cropInfo.cropH
    } else {
      cy = dy
    }

    cropInfo.cropOffsetX = cx
    cropInfo.cropOffsetY = cy
  }

  // auto create a crop box
  const createAuto = (width?: number, height?: number) => {
    const maxWidth = container.w
    const maxHeight = container.h
    let w = width || props.autoCropWidth
    let h = height || props.autoCropHeight
    if (w === 0 || h === 0) {
      // set width or height 80% of container, if props is zero
      w = maxWidth * 0.8
      h = maxHeight * 0.8
    }
    w = w > maxWidth ? maxWidth : w
    h = h > maxHeight ? maxHeight : h
    if (props.cropRatioFixed) {
      h = (w / props.cropRatioWhenFixed[0]) * props.cropRatioWhenFixed[1]
    }
    if (h > container.h) {
      h = container.h
      w = (h / props.cropRatioWhenFixed[1]) * props.cropRatioWhenFixed[0]
    }
    changeSize(w, h)
  }

  // change crop box size
  const changeSize = (width: number, height: number) => {
    cropInfo.cropW = width
    cropInfo.cropH = height
    nextTick(() => {
      // center crop box
      cropInfo.cropOffsetX = (container.w - width) / 2
      cropInfo.cropOffsetY = (container.h - height) / 2
    })
  }

  // clear crop box
  const clear = () => {
    cropInfo.cropW = 0
    cropInfo.cropH = 0
  }

  return {
    create,
    createAuto,
    createBegin,
    scaleBegin,
    scale,
    moveBegin,
    move,
    clear
  }
}

export default useCrop
