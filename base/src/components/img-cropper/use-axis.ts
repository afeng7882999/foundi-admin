import { Axis, Boundary, CropInfo, CropperContainer, CropperImg, CropperProps } from './types'

const useAxis = (props: CropperProps, theImg: CropperImg, cropInfo: CropInfo) => {
  // get image position in container after moving and scaling
  const getImgAxis = (translateX: number, translateY: number, scale: number, rotate: number) => {
    const axis = {} as Axis
    axis.left = translateX + theImg.trueW / 2 - (theImg.outW * scale) / 2
    axis.right = axis.left + theImg.outW * scale
    axis.top = translateY + theImg.trueH / 2 - (theImg.outH * scale) / 2
    axis.bottom = axis.top + theImg.outH * scale
    return axis
  }

  // get crop box position
  const getCropAxis = () => {
    const axis = {} as Axis
    axis.left = cropInfo.cropOffsetX
    axis.right = axis.left + cropInfo.cropW
    axis.top = cropInfo.cropOffsetY
    axis.bottom = axis.top + cropInfo.cropH
    return axis
  }

  const checkContainerBoundary = (axis: Axis, container: CropperContainer) => {
    return {
      left: axis.left >= 0,
      right: axis.right <= container.w,
      top: axis.top >= 0,
      bottom: axis.bottom <= container.h
    } as Boundary
  }

  // whether image is out of crop box after moving or scaling
  const checkImgAxis = (translateX: number, translateY: number, scale: number, rotate: number) => {
    const axis = getImgAxis(translateX, translateY, scale, rotate)
    const cropAxis = getCropAxis()
    return axis.left <= cropAxis.left && axis.right >= cropAxis.right && axis.top <= cropAxis.top && axis.bottom >= cropAxis.bottom
  }

  return {
    getImgAxis,
    checkImgAxis,
    getCropAxis,
    checkContainerBoundary
  }
}

// get projection width and height of image
const getImgProjection = (imgW: number, imgH: number, rotateAngle: number) => {
  return {
    outW: Math.floor(Math.abs(imgW * Math.cos(rotateAngle)) + Math.abs(imgH * Math.sin(rotateAngle))),
    outH: Math.floor(Math.abs(imgH * Math.cos(rotateAngle)) + Math.abs(imgW * Math.sin(rotateAngle)))
  }
}

export default useAxis
export { getImgProjection }
