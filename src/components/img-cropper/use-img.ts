import { crossOriginIos } from './utils'
import { nextTick } from 'vue'
import {
  CropInfo,
  CropperContainer,
  CropperImg,
  CropperProps,
  ExifData,
  ImgLoadedWithExif,
  ImgTransform
} from './types'
import { getCenterTranslate, getScaleByMode } from './use-transform'

const useImg = (
  props: CropperProps,
  container: CropperContainer,
  theImg: CropperImg,
  cropInfo: CropInfo,
  transform: ImgTransform
) => {
  // load image
  const load = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!props.img) {
        reject('Image is empty')
      }
      crossOriginIos(props.img)
      const img = new Image()
      img.onload = () => {
        try {
          loadImgWithExif(img, img.width, img.height).then(({ src }) => {
            theImg.imgSrc = src
            setImgLayout(img).then(() => resolve())
          })
        } catch (e) {
          reject(e)
        }
      }
      img.onerror = () => {
        reject('Image load error')
      }
      img.src = props.img
    })
  }

  // load an image, and apply rotation and flipping based on image's EXIF info
  const loadImgWithExif = async (img: HTMLImageElement, width: number, height: number): Promise<ImgLoadedWithExif> => {
    let src = ''
    let imageData
    let orientation
    let data

    try {
      imageData = await getData(img)
      orientation = imageData.orientation || 1
      data = imageData.arrayBuffer
    } catch (e) {
      console.warn(e)
      return { src: props.img, data: data, orientation: null }
    }

    const max = props.imgMaxSize
    if (orientation === 1 && width < max && height < max) {
      return { src: props.img, data: data, orientation: 1 }
    }

    if (width > max) {
      height = (height / width) * max
      width = max
    }
    if (height > max) {
      width = (width / height) * max
      height = max
    }

    const canvas = getCanvasRotated(img, orientation, width, height)
    src = await canvasToBlob(canvas, props.outputType)
    return { src, data, orientation }
  }

  // set the parameters of image layout
  const setImgLayout = async (img: HTMLImageElement) => {
    theImg.trueW = img.width
    theImg.trueH = img.height
    theImg.outW = theImg.trueW
    theImg.outH = theImg.trueH
    if (!props.imgOriginalRatio) {
      transform.scale = getScaleByMode(props.imgMode, theImg, container, transform.rotate)
    } else {
      transform.scale = 1
    }
    await nextTick(() => {
      // center
      const trans = getCenterTranslate(theImg, container)
      transform.translateX = trans.transX
      transform.translateY = trans.transY
    })
  }

  return {
    load
  }
}

// get canvas of Image after rotation and flipping based on EXIF orientation
const getCanvasRotated = (img: HTMLImageElement, orientation: number, width: number, height: number) => {
  const canvas = document.createElement('canvas')
  const ct = canvas.getContext('2d') as any
  ct.save()

  switch (orientation) {
    case 2:
      // horizontal flip
      canvas.width = width
      canvas.height = height
      ct.translate(width, 0)
      ct.scale(-1, 1)
      break
    case 3:
      // 180 degree
      setCanvasWH(canvas, width, height)
      ct.translate(width / 2, height / 2)
      ct.rotate((180 * Math.PI) / 180)
      ct.translate(-width / 2, -height / 2)
      break
    case 4:
      // vertical flip
      setCanvasWH(canvas, width, height)
      ct.translate(0, height)
      ct.scale(1, -1)
      break
    case 5:
      // vertical flip + 90 rotate right
      setCanvasWH(canvas, height, width)
      ct.rotate(0.5 * Math.PI)
      ct.scale(1, -1)
      break
    case 6:
      // 90 degree
      setCanvasWH(canvas, height, width)
      ct.translate(height / 2, width / 2)
      ct.rotate((90 * Math.PI) / 180)
      ct.translate(-width / 2, -height / 2)
      break
    case 7:
      // horizontal flip + 90 rotate right
      setCanvasWH(canvas, height, width)
      ct.rotate(0.5 * Math.PI)
      ct.translate(width, -height)
      ct.scale(-1, 1)
      break
    case 8:
      // -90 degree
      setCanvasWH(canvas, height, width)
      ct.translate(height / 2, width / 2)
      ct.rotate((-90 * Math.PI) / 180)
      ct.translate(-width / 2, -height / 2)
      break
    default:
      // orientation = 1, need not convert
      canvas.width = width
      canvas.height = height
  }

  ct.drawImage(img, 0, 0, width, height)
  ct.restore()

  return canvas
}

// convert image to ArrayBuffer and get orientation from EXIF of image
function getData(img: HTMLImageElement) {
  return new Promise<ExifData>((resolve, reject) => {
    const obj = {} as ExifData
    getImageData(img)
      .then((data) => {
        obj.arrayBuffer = data
        obj.orientation = getOrientation(data as ArrayBuffer)
        resolve(obj)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function getImageData(img: HTMLImageElement) {
  let data = null
  return new Promise((resolve, reject) => {
    if (!img.src) {
      reject('Image src is empty')
    }
    if (/^data:/i.test(img.src)) {
      // Data URI
      data = base64ToArrayBuffer(img.src)
      resolve(data)
    } else if (/^blob:/i.test(img.src)) {
      // Blob
      const fileReader = new FileReader()
      fileReader.onload = function (e: any) {
        data = e.target.result
        resolve(data)
      }
      objectURLToBlob(img.src, function (blob: Blob) {
        fileReader.readAsArrayBuffer(blob)
      })
    } else {
      // Simple URL
      const http = new XMLHttpRequest()
      http.onload = function () {
        if (this.status === 200 || this.status === 0) {
          data = http.response
          resolve(data)
        } else {
          reject('Could not load image')
        }
      }
      http.open('GET', img.src, true)
      http.responseType = 'arraybuffer'
      http.send(null)
    }
  })
}

function objectURLToBlob(url: string, callback: (b: Blob) => void) {
  const http = new XMLHttpRequest()
  http.open('GET', url, true)
  http.responseType = 'blob'
  http.onload = function () {
    if (this.status === 200 || this.status === 0) {
      callback(this.response)
    }
  }
  http.send()
}

function base64ToArrayBuffer(base64: string) {
  base64 = base64.replace(/^data:([^;]+);base64,/gim, '')
  const binary = atob(base64)
  const len = binary.length
  const buffer = new ArrayBuffer(len)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < len; i++) {
    view[i] = binary.charCodeAt(i)
  }
  return buffer
}

function getStringFromCharCode(dataView: DataView, start: number, length: number) {
  let str = ''
  let i
  for (i = start, length += start; i < length; i++) {
    str += String.fromCharCode(dataView.getUint8(i))
  }
  return str
}

function getOrientation(arrayBuffer: ArrayBuffer) {
  const dataView = new DataView(arrayBuffer)
  let orientation, exifIDCode, tiffOffset, littleEndian, app1Start, ifdStart

  // Only handle JPEG image (start by 0xFFD8)
  if (dataView.getUint8(0) === 0xff && dataView.getUint8(1) === 0xd8) {
    const length = dataView.byteLength
    let offset = 2
    while (offset + 1 < length) {
      if (dataView.getUint8(offset) === 0xff && dataView.getUint8(offset + 1) === 0xe1) {
        app1Start = offset
        break
      }
      offset++
    }
  }
  if (app1Start) {
    exifIDCode = app1Start + 4
    tiffOffset = app1Start + 10
    if (getStringFromCharCode(dataView, exifIDCode, 4) === 'Exif') {
      const endianness = dataView.getUint16(tiffOffset)
      littleEndian = endianness === 0x4949
      if (littleEndian || endianness === 0x4d4d /* bigEndian */) {
        if (dataView.getUint16(tiffOffset + 2, littleEndian) === 0x002a) {
          const firstIFDOffset = dataView.getUint32(tiffOffset + 4, littleEndian)
          if (firstIFDOffset >= 0x00000008) {
            ifdStart = tiffOffset + firstIFDOffset
          }
        }
      }
    }
  }
  if (ifdStart) {
    const length = dataView.getUint16(ifdStart, littleEndian)
    for (let i = 0; i < length; i++) {
      let offset = ifdStart + i * 12 + 2
      if (dataView.getUint16(offset, littleEndian) === 0x0112 /* Orientation */) {
        // 8 is the offset of the current tag's value
        offset += 8
        // Get the original orientation value
        orientation = dataView.getUint16(offset, littleEndian)
        // Override the orientation with its default value
        dataView.setUint16(offset, 1, littleEndian)
        break
      }
    }
  }

  return orientation
}

// Promise wrapper for Canvas.toBlob
const canvasToBlob = (canvas: HTMLCanvasElement, outputType: string): Promise<string> => {
  return new Promise((resolve) =>
    canvas.toBlob(
      (blob) => {
        resolve(URL.createObjectURL(blob as Blob))
      },
      'image/' + outputType,
      1
    )
  )
}

// set canvas' width and height
const setCanvasWH = (canvas: HTMLCanvasElement, w: number, h: number) => {
  canvas.width = h
  canvas.height = w
}

export default useImg
