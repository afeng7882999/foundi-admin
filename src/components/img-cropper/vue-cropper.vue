<template>
  <div ref="cropper" class="vue-cropper vue-cropper-container" @mouseout="imgWheelScaleEnd" @mouseover="imgWheelScaleBegin">
    <div class="vue-cropper-img">
      <div v-show="!loading" class="vue-cropper-img__canvas">
        <img :src="img.imgSrc" :style="cropperImgStyle" alt="vue-cropper-img" />
      </div>
    </div>
    <div
      class="vue-cropper-drag"
      :class="{ 'cropper-move': !ifCrop, 'cropper-crop': ifCrop, 'cropper-modal': cropping }"
      @mousedown="moveRotateCropBegin"
      @touchstart="moveRotateCropBegin"
    ></div>
    <div v-show="cropping" class="vue-cropper-crop" :style="cropperCropStyle">
      <div class="vue-cropper-crop__canvas">
        <img :style="cropperCropImgStyle" :src="img.imgSrc" alt="vue-cropper-img" />
      </div>
      <div class="vue-cropper-crop__face cropper-move" @mousedown="cropMoveBegin" @touchstart="cropMoveBegin"></div>
      <div v-if="cropShowInfo" class="vue-cropper-crop__info" :style="{ top: outputInfo.top }">
        {{ outputInfo.width }} ×
        {{ outputInfo.height }}
      </div>
      <div v-show="!cropSizeFixed">
        <div
          class="vue-cropper-crop__line line-w"
          @mousedown="cropScaleBegin($event, false, true, 0, 1)"
          @touchstart="cropScaleBegin($event, false, true, 0, 1)"
        >
          <div class="vue-cropper-crop__line-inner"></div>
        </div>
        <div
          class="vue-cropper-crop__line line-a"
          @mousedown="cropScaleBegin($event, true, false, 1, 0)"
          @touchstart="cropScaleBegin($event, true, false, 1, 0)"
        >
          <div class="vue-cropper-crop__line-inner"></div>
        </div>
        <div
          class="vue-cropper-crop__line line-s"
          @mousedown="cropScaleBegin($event, false, true, 0, 2)"
          @touchstart="cropScaleBegin($event, false, true, 0, 2)"
        >
          <div class="vue-cropper-crop__line-inner"></div>
        </div>
        <div
          class="vue-cropper-crop__line line-d"
          @mousedown="cropScaleBegin($event, true, false, 2, 0)"
          @touchstart="cropScaleBegin($event, true, false, 2, 0)"
        >
          <div class="vue-cropper-crop__line-inner"></div>
        </div>
        <div
          class="vue-cropper-crop__point point1"
          @mousedown="cropScaleBegin($event, true, true, 1, 1)"
          @touchstart="cropScaleBegin($event, true, true, 1, 1)"
        ></div>
        <div
          class="vue-cropper-crop__point point2"
          @mousedown="cropScaleBegin($event, false, true, 0, 1)"
          @touchstart="cropScaleBegin($event, false, true, 0, 1)"
        ></div>
        <div
          class="vue-cropper-crop__point point3"
          @mousedown="cropScaleBegin($event, true, true, 2, 1)"
          @touchstart="cropScaleBegin($event, true, true, 2, 1)"
        ></div>
        <div
          class="vue-cropper-crop__point point4"
          @mousedown="cropScaleBegin($event, true, false, 1, 0)"
          @touchstart="cropScaleBegin($event, true, false, 1, 0)"
        ></div>
        <div
          class="vue-cropper-crop__point point5"
          @mousedown="cropScaleBegin($event, true, false, 2, 0)"
          @touchstart="cropScaleBegin($event, true, false, 2, 0)"
        ></div>
        <div
          class="vue-cropper-crop__point point6"
          @mousedown="cropScaleBegin($event, true, true, 1, 2)"
          @touchstart="cropScaleBegin($event, true, true, 1, 2)"
        ></div>
        <div
          class="vue-cropper-crop__point point7"
          @mousedown="cropScaleBegin($event, false, true, 0, 2)"
          @touchstart="cropScaleBegin($event, false, true, 0, 2)"
        ></div>
        <div
          class="vue-cropper-crop__point point8"
          @mousedown="cropScaleBegin($event, true, true, 2, 2)"
          @touchstart="cropScaleBegin($event, true, true, 2, 2)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, PropType, reactive, ref, toRefs, watch } from 'vue'
import { throttle } from 'lodash-es'
import { toBlobPolyfill, wheelEvt } from './utils'
import { CropInfo, CropperContainer, CropperImg, ImgOperType, ImgTransform } from './types'
import useImg from './use-img'
import useCrop from './use-crop'
import useTransform from './use-transform'
import useOutput from './use-output'
import useAxis from '@/components/img-cropper/use-axis'
import { nextFrame } from '@/utils/next-frame'
import { AnyFunction } from '@/types/global'

export default defineComponent({
  name: 'VueCropper',
  props: {
    // image src
    img: {
      type: String,
      default: ''
    },
    // whether to keep the aspect ratio of image when uploaded
    imgOriginalRatio: {
      type: Boolean,
      default: false
    },
    // display mode of image, 'contain', 'cover', '50px', '50px 60px', 'auto 60px', '80%'
    imgMode: {
      type: String,
      default: 'contain'
    },
    // when width, height of image reach max size, image will be resized
    imgMaxSize: {
      type: Number,
      default: 2000
    },
    // mode of mouse operation, move or rotate
    imgMoveOrRotate: {
      type: String as PropType<ImgOperType>,
      default: 'move'
    },
    // whether image can be scaled by mouse wheel
    imgScaleByWheel: {
      type: Boolean,
      default: true
    },
    // quality of output image 0 - 1
    outputQuality: {
      type: Number,
      default: 1
    },
    // type of output image, jpeg, png, webp
    outputType: {
      type: String,
      default: 'png'
    },
    // whether output image is high dpr
    outputHighDpr: {
      type: Boolean,
      default: true
    },
    // enlarge size of output image, 0 - 1000
    outputEnlarge: {
      type: Number,
      default: 1
    },
    // whether output image is scaled
    outputFullSize: {
      type: Boolean,
      default: false
    },
    // whether to show the crop info
    cropShowInfo: {
      type: Boolean,
      default: false
    },
    // whether aspect ratio of crop box is fixed
    cropRatioFixed: {
      type: Boolean,
      default: false
    },
    // aspect ratio of fixed crop box, array
    cropRatioWhenFixed: {
      type: Array as PropType<number[]>,
      default: () => [1, 1]
    },
    // whether crop box size is fixed
    cropSizeFixed: {
      type: Boolean,
      default: false
    },
    // whether the crop box can be moved
    cropMovable: {
      type: Boolean,
      default: true
    },
    // whether to create a crop box at beginning
    autoCrop: {
      type: Boolean,
      default: false
    },
    // width of crop box auto created
    autoCropWidth: {
      type: Number,
      default: 0
    },
    // height of crop box auto created
    autoCropHeight: {
      type: Number,
      default: 0
    }
  },
  emits: ['update-preview', 'img-loaded', 'crop-moving', 'img-transform'],
  setup(props, { emit }) {
    const cropper = ref<HTMLElement | null>(null)

    const state = reactive({
      container: {
        left: 0,
        top: 0,
        w: 0,
        h: 0
      } as CropperContainer,
      img: {
        imgSrc: '',
        trueW: 0,
        trueH: 0,
        outW: 0,
        outH: 0
      } as CropperImg,
      transform: {
        scale: 1,
        translateX: 0,
        translateY: 0,
        rotate: 0,
        flipH: false,
        flipV: false,
        ifAnimate: false,
        animateTime: 300
      } as ImgTransform,
      crop: {
        cropW: 0,
        cropH: 0,
        cropX: 0,
        cropY: 0,
        cropOffsetX: 0,
        cropOffsetY: 0
      } as CropInfo,
      ifCrop: false,
      loading: true,
      cropping: false,
      wheelEvt: wheelEvt(),
      touches: {} as TouchList
    })

    // toBlob polyfill
    toBlobPolyfill()

    const cropperImgStyle = computed(() => {
      const tx = state.transform.translateX
      const ty = state.transform.translateY
      const r = state.transform.rotate
      const sx = state.transform.flipH ? -state.transform.scale : state.transform.scale
      const sy = state.transform.flipV ? -state.transform.scale : state.transform.scale
      return {
        width: state.img.trueW + 'px',
        height: state.img.trueH + 'px',
        transition: state.transform.ifAnimate ? `all ${state.transform.animateTime}ms` : 'none',
        transform: `translate(${tx}px,${ty}px) rotateZ(${r}rad) scaleX(${sx}) scaleY(${sy})`
      }
    })

    const cropperCropStyle = computed(() => {
      return {
        width: state.crop.cropW + 'px',
        height: state.crop.cropH + 'px',
        transform: `translate(${state.crop.cropOffsetX}px,${state.crop.cropOffsetY}px)`
      }
    })

    const cropperCropImgStyle = computed(() => {
      const tx = state.transform.translateX - state.crop.cropOffsetX
      const ty = state.transform.translateY - state.crop.cropOffsetY
      const r = state.transform.rotate
      const sx = state.transform.flipH ? -state.transform.scale : state.transform.scale
      const sy = state.transform.flipV ? -state.transform.scale : state.transform.scale
      return {
        width: state.img.trueW + 'px',
        height: state.img.trueH + 'px',
        transition: state.transform.ifAnimate ? `all ${state.transform.animateTime}ms` : 'none',
        transform: `translate(${tx}px,${ty}px) rotateZ(${r}rad) scaleX(${sx}) scaleY(${sy})`
      }
    })

    const { load } = useImg(props, state.container, state.img, state.crop, state.transform)
    const { getImgAxis, getCropAxis } = useAxis(props, state.img, state.crop)
    const {
      zoomByTyp,
      zoomByWheel,
      zoomByTouchBegin,
      zoomByTouch,
      moveBegin,
      move,
      rotateByTyp,
      rotateByMouseBegin,
      rotateByMouse,
      rotateEnd,
      flip,
      reset: transformReset
    } = useTransform(props, state.container, state.img, state.crop, state.transform)
    const {
      create,
      createAuto,
      createBegin,
      scaleBegin,
      scale,
      moveBegin: _cropMoveBegin,
      move: _cropMove,
      clear
    } = useCrop(props, state.container, state.img, state.crop)
    const { outputBase64, outputBlob, getPreview, outputInfo } = useOutput(props, state.img, state.crop, state.transform)

    watch([() => props.img, () => props.imgMode], () => {
      loadImg()
    })

    watch(
      [
        () => state.crop.cropW,
        () => state.crop.cropH,
        () => state.crop.cropOffsetX,
        () => state.crop.cropOffsetY,
        () => state.transform.scale,
        () => state.transform.translateX,
        () => state.transform.translateY
      ],
      () => {
        updatePreview()
      }
    )

    watch([() => props.autoCrop, () => props.autoCropWidth, () => props.autoCropHeight], (val) => {
      if (val[0]) {
        cropAuto()
      }
    })

    watch([() => state.transform.rotate, () => state.transform.flipH, () => state.transform.flipV], () => {
      if (props.autoCrop) {
        cropAuto(state.crop.cropW, state.crop.cropH)
      } else {
        if (state.crop.cropW > 0 || state.crop.cropH > 0) {
          cropAuto(state.crop.cropW, state.crop.cropH)
        }
      }
      window.setTimeout(() => {
        updatePreview()
      }, state.transform.animateTime)
    })

    onMounted(() => {
      console.log((cropper.value as HTMLElement).offsetWidth)
      updatePreview()
      loadImg()
    })

    onBeforeUnmount(() => {
      window.removeEventListener('mousemove', cropMove)
      window.removeEventListener('mouseup', cropMoveEnd)
      window.removeEventListener('touchmove', cropMove)
      window.removeEventListener('touchend', cropMoveEnd)
    })

    // load image
    const loadImg = () => {
      initState()
      // nextFrame to wait until container has updated
      nextFrame(async () => {
        state.container.w = (cropper.value as HTMLElement).offsetWidth
        state.container.h = (cropper.value as HTMLElement).offsetHeight
        const rect = (cropper.value as HTMLElement).getBoundingClientRect()
        state.container.left = rect.left
        state.container.top = rect.top
        try {
          await load()
          state.loading = false
          if (props.autoCrop) {
            cropAuto()
          }
          nextFrame(() => {
            updatePreview()
          })
          emit('img-loaded')
        } catch (e) {
          console.error(e)
        }
      })
    }

    // begin moving, rotating or cropping, when mouse down inside cropper drag
    const moveRotateCropBegin = (e: Event) => {
      e.preventDefault()
      const mobile = !!(e as TouchEvent).touches

      // move image
      if (!state.ifCrop) {
        if (mobile && (e as TouchEvent).touches.length === 1) {
          // move or rotate image by touching
          if (props.imgMoveOrRotate === 'move') {
            moveBegin((e as TouchEvent).touches[0].clientX, (e as TouchEvent).touches[0].clientY)
          } else if (props.imgMoveOrRotate === 'rotate') {
            rotateByMouseBegin((e as TouchEvent).touches[0].clientX, (e as TouchEvent).touches[0].clientY)
          }
          window.addEventListener('touchmove', imgMoveRotate)
          window.addEventListener('touchend', imgMoveRotateEnd)
        }
        if (mobile && (e as TouchEvent).touches.length === 2) {
          // scale image by touching
          zoomByTouchBegin(e as TouchEvent)
          window.addEventListener('touchmove', imgTouchScale)
          window.addEventListener('touchend', imgTouchScaleEnd)
        }
        if (!mobile) {
          // move or rotate image by mouse
          if (props.imgMoveOrRotate === 'move') {
            moveBegin((e as MouseEvent).clientX, (e as MouseEvent).clientY)
          } else if (props.imgMoveOrRotate === 'rotate') {
            rotateByMouseBegin((e as MouseEvent).clientX, (e as MouseEvent).clientY)
          }
          window.addEventListener('mousemove', imgMoveRotate)
          window.addEventListener('mouseup', imgMoveRotateEnd)
        }
        // emitting
        emit('img-transform', {
          moving: true,
          axis: getImgAxis(state.transform.translateX, state.transform.translateY, state.transform.scale, state.transform.rotate)
        })
      }

      // crop image, create crop box
      if (state.ifCrop) {
        state.cropping = true
        window.addEventListener('mousemove', cropCreate)
        window.addEventListener('mouseup', cropCreateEnd)
        window.addEventListener('touchmove', cropCreate)
        window.addEventListener('touchend', cropCreateEnd)
        let offsetX, offsetY, x, y
        if (mobile) {
          offsetX = (e as TouchEvent).touches[0].pageX - (cropper.value as HTMLElement).offsetLeft
          offsetY = (e as TouchEvent).touches[0].pageY - (cropper.value as HTMLElement).offsetTop
          x = (e as TouchEvent).touches[0].clientX
          y = (e as TouchEvent).touches[0].clientY
        } else {
          offsetX = (e as MouseEvent).offsetX
          offsetY = (e as MouseEvent).offsetY
          x = (e as MouseEvent).clientX
          y = (e as MouseEvent).clientY
        }
        createBegin(offsetX, offsetY, x, y)
      }
    }

    // image is moving
    const imgMoveRotate = (e: Event) => {
      e.preventDefault()
      let mobile = !!(e as TouchEvent).touches

      if (mobile && (e as TouchEvent).touches.length === 2) {
        state.touches = (e as TouchEvent).touches
        window.addEventListener('touchmove', imgTouchScale)
        window.addEventListener('touchend', imgTouchScaleEnd)
        window.removeEventListener('touchmove', imgMoveRotate)
        return false
      }

      let nowX = !mobile ? (e as MouseEvent).clientX : (e as TouchEvent).touches[0].clientX
      let nowY = !mobile ? (e as MouseEvent).clientY : (e as TouchEvent).touches[0].clientY
      nextTick(() => {
        if (props.imgMoveOrRotate === 'move') {
          move(nowX, nowY)
        } else if (props.imgMoveOrRotate === 'rotate') {
          rotateByMouse(nowX, nowY)
        }
        emit('img-transform', {
          moving: true,
          axis: getImgAxis(state.transform.translateX, state.transform.translateY, state.transform.scale, state.transform.rotate)
        })
      })
    }

    // image moving stop
    const imgMoveRotateEnd = () => {
      window.removeEventListener('mousemove', imgMoveRotate)
      window.removeEventListener('touchmove', imgMoveRotate)
      window.removeEventListener('mouseup', imgMoveRotateEnd)
      window.removeEventListener('touchend', imgMoveRotateEnd)
      rotateEnd()
      emit('img-transform', {
        moving: false,
        axis: getImgAxis(state.transform.translateX, state.transform.translateY, state.transform.scale, state.transform.rotate)
      })
    }

    // scale image by touch
    const scaleFuncTouch = throttle(zoomByTouch, 8, { leading: true, trailing: false })
    const imgTouchScale = (e: TouchEvent) => {
      e.preventDefault()
      scaleFuncTouch(e)
    }

    // scale image by touch stop
    const imgTouchScaleEnd = () => {
      window.removeEventListener('touchmove', imgTouchScale)
    }

    // begin scaling image by wheel
    const imgWheelScaleBegin = () => {
      if (props.imgScaleByWheel) {
        window.addEventListener(state.wheelEvt, imgWheelScale, { passive: false })
      }
    }

    // scale image by wheel stop
    const imgWheelScaleEnd = () => {
      if (props.imgScaleByWheel) {
        window.removeEventListener(state.wheelEvt, imgWheelScale)
      }
    }

    // scaling image by wheel
    const scaleFuncWheel = throttle(zoomByWheel, 5, { leading: true, trailing: false })
    const imgWheelScale = (e: Event) => {
      e.preventDefault()
      let change = (e as WheelEvent).deltaY > 0 ? -1 : 1
      scaleFuncWheel(change, e as WheelEvent, 0.8)
    }

    // create crop box
    const cropCreate = (e: Event) => {
      e.preventDefault()
      let mobile = !!(e as TouchEvent).touches
      let nowX = !mobile ? (e as MouseEvent).clientX : (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientX : 0
      let nowY = !mobile ? (e as MouseEvent).clientY : (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientY : 0
      nextTick(() => {
        create(nowX, nowY)
      })
    }

    // creating crop box end
    const cropCreateEnd = () => {
      if (state.crop.cropW === 0 && state.crop.cropH === 0) {
        state.cropping = false
      }
      window.removeEventListener('mousemove', cropCreate)
      window.removeEventListener('mouseup', cropCreateEnd)
      window.removeEventListener('touchmove', cropCreate)
      window.removeEventListener('touchend', cropCreateEnd)
    }

    // begin scaling crop box
    const cropScaleBegin = (e: Event, w: boolean, h: boolean, typeX: number, typeY: number) => {
      e.preventDefault()
      let mobile = !!(e as TouchEvent).touches
      window.addEventListener('mousemove', cropScale)
      window.addEventListener('mouseup', cropScaleEnd)
      window.addEventListener('touchmove', cropScale)
      window.addEventListener('touchend', cropScaleEnd)
      const x = !mobile ? (e as MouseEvent).clientX : (e as TouchEvent).touches[0].clientX
      const y = !mobile ? (e as MouseEvent).clientY : (e as TouchEvent).touches[0].clientY
      scaleBegin(x, y, w, h, typeX, typeY)
    }

    // scaling crop box
    const cropScale = (e: Event) => {
      e.preventDefault()
      let mobile = !!(e as TouchEvent).touches
      let nowX = !mobile ? (e as MouseEvent).clientX : (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientX : 0
      let nowY = !mobile ? (e as MouseEvent).clientY : (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientY : 0
      scale(nowX, nowY)
    }

    // scaling crop box stop
    const cropScaleEnd = () => {
      window.removeEventListener('mousemove', cropScale)
      window.removeEventListener('mouseup', cropScaleEnd)
      window.removeEventListener('touchmove', cropScale)
      window.removeEventListener('touchend', cropScaleEnd)
    }

    // begin moving crop box
    const cropMoveBegin = (e: Event) => {
      e.preventDefault()
      let mobile = !!(e as TouchEvent).touches
      if (!props.cropMovable) {
        state.ifCrop = false
        moveRotateCropBegin(e)
        return false
      }

      if (mobile && (e as TouchEvent).touches.length === 2) {
        state.ifCrop = false
        moveRotateCropBegin(e)
        cropMoveEnd()
        return false
      }
      window.addEventListener('mousemove', cropMove)
      window.addEventListener('mouseup', cropMoveEnd)
      window.addEventListener('touchmove', cropMove)
      window.addEventListener('touchend', cropMoveEnd)
      let x = !mobile ? (e as MouseEvent).clientX : (e as TouchEvent).touches[0].clientX
      let y = !mobile ? (e as MouseEvent).clientY : (e as TouchEvent).touches[0].clientY
      _cropMoveBegin(x, y)
      emit('crop-moving', {
        moving: true,
        axis: getCropAxis()
      })
    }

    // crop box is moving
    const cropMove = (e?: Event, isMove?: boolean) => {
      let nowX = 0
      let nowY = 0
      if (e) {
        e.preventDefault()
        let mobile = !!(e as TouchEvent).touches
        nowX = !mobile ? (e as MouseEvent).clientX : (e as TouchEvent).touches[0].clientX
        nowY = !mobile ? (e as MouseEvent).clientY : (e as TouchEvent).touches[0].clientY
      }
      nextTick(() => {
        _cropMove(nowX, nowY, isMove)
        emit('crop-moving', {
          moving: true,
          axis: getCropAxis()
        })
      })
    }

    // moving crop box stop
    const cropMoveEnd = () => {
      window.removeEventListener('mousemove', cropMove)
      window.removeEventListener('mouseup', cropMoveEnd)
      window.removeEventListener('touchmove', cropMove)
      window.removeEventListener('touchend', cropMoveEnd)
      emit('crop-moving', {
        moving: false,
        axis: getCropAxis()
      })
    }

    // create crop box at the beginning
    const cropAuto = (cw?: number, ch?: number) => {
      if (state.img.imgSrc === '') return
      clear()
      state.cropping = true
      createAuto(cw, ch)
    }

    // emit an event, update preview data
    const updatePreview = throttle(() => emit('update-preview', getPreview()), 16, { leading: true, trailing: false })

    // init state
    const initState = () => {
      state.img.imgSrc = ''
      state.transform.scale = 1
      state.ifCrop = false
      state.transform.rotate = 0
      state.img.trueW = 0
      state.img.trueH = 0
      state.transform.flipH = false
      state.transform.flipV = false
      state.transform.ifAnimate = false
      state.cropping = false
      clear()
    }

    // init and reload
    const refresh = () => {
      initState()
      nextTick(() => {
        loadImg()
      })
    }

    const zoomIn = throttle(
      () => {
        animate(() => zoomByTyp('zoomIn', 5))
      },
      state.transform.animateTime,
      { leading: true, trailing: false }
    )

    const zoomOut = throttle(
      () => {
        animate(() => zoomByTyp('zoomOut', 5))
      },
      state.transform.animateTime,
      { leading: true, trailing: false }
    )

    const zoomToCover = () => {
      animate(() => zoomByTyp('cover'))
    }

    const zoomToContain = () => {
      animate(() => zoomByTyp('contain'))
    }

    const zoomToOriginal = () => {
      animate(() => zoomByTyp('original'))
    }

    const rotateLeft = throttle(
      () => {
        animate(
          () => rotateByTyp('rotateL'),
          () => rotateEnd()
        )
      },
      state.transform.animateTime,
      { leading: true, trailing: false }
    )

    const rotateRight = throttle(
      () => {
        animate(
          () => rotateByTyp('rotateR'),
          () => rotateEnd()
        )
      },
      state.transform.animateTime,
      { leading: true, trailing: false }
    )

    const rotateClear = throttle(
      () => {
        animate(() => rotateByTyp('reset'))
      },
      state.transform.animateTime,
      { leading: true, trailing: false }
    )

    const flipHorizontal = throttle(
      () => {
        animate(() => flip('horizontal'))
      },
      state.transform.animateTime,
      { leading: true, trailing: false }
    )

    const flipVertical = throttle(
      () => {
        animate(() => flip('vertical'))
      },
      state.transform.animateTime,
      { leading: true, trailing: false }
    )

    const reset = throttle(() => animate(() => transformReset()), state.transform.animateTime, {
      leading: true,
      trailing: false
    })

    const startCrop = () => {
      state.ifCrop = true
    }

    const stopCrop = () => {
      state.ifCrop = false
    }

    const animate = (func: AnyFunction, cb?: AnyFunction) => {
      state.transform.ifAnimate = true
      func()
      nextTick(() => {
        window.setTimeout(() => {
          state.transform.ifAnimate = false
          if (cb) {
            cb()
          }
        }, state.transform.animateTime)
      })
    }

    return {
      cropper,
      ...toRefs(state),
      cropperImgStyle,
      cropperCropStyle,
      cropperCropImgStyle,
      outputInfo,
      imgWheelScaleEnd,
      imgWheelScaleBegin,
      moveRotateCropBegin,
      cropMoveBegin,
      cropScaleBegin,
      zoomIn,
      zoomOut,
      zoomToCover,
      zoomToContain,
      zoomToOriginal,
      rotateLeft,
      rotateRight,
      rotateClear,
      flipHorizontal,
      flipVertical,
      reset,
      startCrop,
      stopCrop,
      refresh,
      outputBase64,
      outputBlob
    }
  }
})
</script>

<style lang="scss" scoped>
@use 'src/assets/style/variable.scss' as *;

.vue-cropper {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  user-select: none;
  touch-action: none;
  text-align: left;
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');
}

.vue-cropper-img,
.vue-cropper-img__canvas,
.vue-cropper-drag,
.vue-cropper-crop,
.vue-cropper-crop__face {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  user-select: none;
}

.vue-cropper-img__canvas img {
  position: relative;
  text-align: left;
  user-select: none;
  transform: none;
  max-width: none;
  max-height: none;
  transform-origin: center;
}

.vue-cropper-img {
  overflow: hidden;
}

.cropper-move {
  cursor: move;
}

.cropper-crop {
  cursor: crosshair;
}

.cropper-modal {
  background: rgba(0, 0, 0, 0.5);
}

.vue-cropper-crop {
  /*border: 2px solid #39f;*/
}

.vue-cropper-crop__canvas {
  display: block;
  overflow: hidden;
  width: 100%;
  height: 100%;
  user-select: none;
}

.vue-cropper-crop__canvas img {
  user-select: none;
  text-align: left;
  max-width: none;
  max-height: none;
  transform-origin: center;
}

.vue-cropper-crop__face {
  top: 0;
  left: 0;
  background-color: #fff;
  opacity: 0.1;
}

.vue-cropper-crop__info {
  position: absolute;
  left: 0;
  min-width: 65px;
  text-align: center;
  color: white;
  line-height: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  font-size: 12px;
}

.vue-cropper-crop__line {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  .vue-cropper-crop__line-inner {
    background: none;
    transition: border 0.5s;
    border: 0 solid rgba($color-white, 0.3);
  }
}

.line-w {
  top: -5px;
  left: 0;
  height: 10px;
  cursor: n-resize;

  .vue-cropper-crop__line-inner {
    height: 0;
    width: 100%;
    border-top-width: 1px;
  }
}

.line-a {
  top: 0;
  left: -5px;
  width: 10px;
  cursor: w-resize;

  .vue-cropper-crop__line-inner {
    height: 100%;
    width: 0;
    border-left-width: 1px;
  }
}

.line-s {
  bottom: -5px;
  left: 0;
  height: 10px;
  cursor: s-resize;

  .vue-cropper-crop__line-inner {
    height: 0;
    width: 100%;
    border-bottom-width: 1px;
  }
}

.line-d {
  top: 0;
  right: -5px;
  width: 10px;
  cursor: e-resize;

  .vue-cropper-crop__line-inner {
    height: 100%;
    width: 0;
    border-right-width: 1px;
  }
}

.vue-cropper-crop__point {
  position: absolute;
  width: 10px;
  height: 10px;
  opacity: 1;
  background-color: $color-white;
}

.point1 {
  top: -5px;
  left: -5px;
  cursor: nw-resize;
}

.point2 {
  top: -5px;
  left: 50%;
  margin-left: -5px;
  cursor: n-resize;
}

.point3 {
  top: -5px;
  right: -5px;
  cursor: ne-resize;
}

.point4 {
  top: 50%;
  left: -5px;
  margin-top: -5px;
  cursor: w-resize;
}

.point5 {
  top: 50%;
  right: -5px;
  margin-top: -5px;
  cursor: e-resize;
}

.point6 {
  bottom: -5px;
  left: -5px;
  cursor: sw-resize;
}

.point7 {
  bottom: -5px;
  left: 50%;
  margin-left: -5px;
  cursor: s-resize;
}

.point8 {
  bottom: -5px;
  right: -5px;
  cursor: se-resize;
}
</style>
