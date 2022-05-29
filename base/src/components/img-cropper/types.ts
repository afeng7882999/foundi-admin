import { AnyFunction } from '@b/common/types'

// vue cropper
export interface IVueCropper {
  zoomIn: () => void
  zoomOut: () => void
  zoomToCover: () => void
  zoomToContain: () => void
  zoomToOriginal: () => void
  rotateLeft: () => void
  rotateRight: () => void
  rotateClear: () => void
  flipHorizontal: () => void
  flipVertical: () => void
  reset: () => void
  startCrop: () => void
  stopCrop: () => void
  outputBase64: (fn: AnyFunction) => void
  outputBlob: (fn: AnyFunction) => void
}

// vue cropper props
export interface CropperProps {
  img: string
  imgOriginalRatio: boolean
  imgMode: string
  imgMaxSize: number
  imgMoveOrRotate: ImgOperType
  imgScaleByWheel: boolean
  outputQuality: number
  outputType: string
  outputHighDpr: boolean
  outputEnlarge: number
  cropShowInfo: boolean
  outputFullSize: boolean
  cropRatioFixed: boolean
  cropRatioWhenFixed: number[]
  cropSizeFixed: boolean
  cropMovable: boolean
  autoCrop: boolean
  autoCropWidth: number
  autoCropHeight: number
}

// state of cropper container
export interface CropperContainer {
  left: number
  top: number
  w: number
  h: number
}

// state of image to be cropped
export interface CropperImg {
  imgSrc: string
  trueW: number
  trueH: number
  outW: number
  outH: number
}

// state of image transform info
export interface ImgTransform {
  scale: number
  translateX: number
  translateY: number
  rotate: number
  flipH: boolean
  flipV: boolean
  ifAnimate: boolean // if use transition
  animateTime: number // transition time
}

// state of crop info
export interface CropInfo {
  cropW: number
  cropH: number
  cropX: number
  cropY: number
  cropOffsetX: number
  cropOffsetY: number
}

export type ImgOperType = 'move' | 'rotate'
export type ZoomType = 'zoomIn' | 'zoomOut' | 'cover' | 'contain' | 'original'
export type RotateType = 'rotateR' | 'rotateL' | 'reset'
export type FlipType = 'horizontal' | 'vertical' | 'reset'

export interface ExifData {
  arrayBuffer?: any
  orientation?: any
}

export interface Axis {
  left: number
  right: number
  top: number
  bottom: number
}

export interface Boundary {
  left: boolean
  right: boolean
  top: boolean
  bottom: boolean
}

export interface ImgLoadedWithExif {
  src: string
  data: ArrayBuffer
  orientation: number | null
}
