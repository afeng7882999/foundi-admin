<template>
  <div class="fd-img-cropper">
    <el-image :src="imageSrc" class="img-cropper-img" fit="contain" @click="uploadShow">
      <template #error>
        <div class="el-image__error" @click="uploadShow">点击上传</div>
      </template>
    </el-image>
    <input
      id="uploads"
      ref="uploadInput"
      accept="image/png, image/jpeg, image/gif, image/jpg"
      style="position: absolute; clip: rect(0 0 0 0)"
      type="file"
      @change="uploadImg($event)"
    />
    <el-dialog v-model="dialogVisible" :close-on-click-modal="false" append-to-body custom-class="fd-img-cropper-dialog" title="上传图片">
      <el-row :gutter="20">
        <el-col :span="18">
          <div class="cropper">
            <vueCropper
              ref="cropper"
              :auto-crop="true"
              :auto-crop-height="300"
              :auto-crop-width="300"
              :img-scale-by-wheel="true"
              :img-move-or-rotate="moveRotate"
              :crop-movable="true"
              :crop-size-fixed="false"
              :crop-ratio-fixed="true"
              :crop-ratio-when-fixed="imgRatio"
              :crop-show-info="false"
              :img="image"
              img-mode="cover"
              @update-preview="onUpdatePreview"
            ></vueCropper>
          </div>
          <div class="actions">
            <el-tooltip content="向左旋转" effect="dark" placement="bottom" :show-after="500">
              <fd-icon-button class="btn" icon="rotate" @click="rotateLeft"></fd-icon-button>
            </el-tooltip>
            <el-tooltip content="向右旋转" effect="dark" placement="bottom" :show-after="500">
              <fd-icon-button class="btn" icon="rotate-right" @click="rotateRight"></fd-icon-button>
            </el-tooltip>
            <el-divider direction="vertical"></el-divider>
            <el-tooltip content="放大" effect="dark" placement="bottom" :show-after="500">
              <fd-icon-button class="btn" icon="zoom-in" @click="zoomIn"></fd-icon-button>
            </el-tooltip>
            <el-tooltip content="缩小" effect="dark" placement="bottom" :show-after="500">
              <fd-icon-button class="btn" icon="zoom-out" @click="zoomOut"></fd-icon-button>
            </el-tooltip>
            <el-divider direction="vertical"></el-divider>
            <el-tooltip content="水平翻转" effect="dark" placement="bottom" :show-after="500">
              <fd-icon-button class="btn" icon="flip-horizontally" @click="flip(true)"></fd-icon-button>
            </el-tooltip>
            <el-tooltip content="垂直翻转" effect="dark" placement="bottom" :show-after="500">
              <fd-icon-button class="btn" icon="flip-vertically" @click="flip(false)"></fd-icon-button>
            </el-tooltip>
            <el-divider direction="vertical"></el-divider>
            <el-tooltip content="覆盖（contain）" effect="dark" placement="bottom" :show-after="500">
              <fd-icon-button class="btn" icon="extend" @click="zoomToCover"></fd-icon-button>
            </el-tooltip>
            <el-tooltip content="包含（cover）" effect="dark" placement="bottom" :show-after="500">
              <fd-icon-button class="btn" icon="img-contain" @click="zoomToContain"></fd-icon-button>
            </el-tooltip>
            <el-tooltip content="实际大小" effect="dark" placement="bottom" :show-after="500">
              <fd-icon-button class="btn" icon="equal-ratio" @click="zoomToOriginal"></fd-icon-button>
            </el-tooltip>
            <el-divider direction="vertical"></el-divider>
            <el-tooltip content="切换鼠标移动/旋转" effect="dark" placement="bottom" :show-after="500">
              <fd-icon-button
                class="btn"
                :icon="moveRotate === 'move' ? 'direction-adjustment-three' : 'rotating-forward'"
                @click="toggleMoveRotate"
              ></fd-icon-button>
            </el-tooltip>
            <el-divider direction="vertical"></el-divider>
            <el-tooltip content="重置图片" effect="dark" placement="bottom" :show-after="500">
              <fd-icon-button class="btn" icon="undo" @click="reset"></fd-icon-button>
            </el-tooltip>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="preview-title">
            <span>图片预览</span>
          </div>
          <div class="preview">
            <div class="preview-inner">
              <div :style="previewStyle">
                <div :style="previews.div">
                  <img :src="previews.url" :style="previews.img" alt="" />
                </div>
              </div>
            </div>
          </div>
          <div v-if="showCircle" class="preview round">
            <div class="preview-inner">
              <div :style="previewStyle">
                <div :style="previews.div">
                  <img :src="previews.url" :style="previews.img" alt="" />
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      <template #footer>
        <span class="fd-dialog__footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveImg">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import VueCropper from './vue-cropper.vue'
import { IVueCropper } from './types'
import { localOrRemoteUrl } from '@/utils/query'
import { computed, defineComponent, PropType, reactive, ref, toRefs, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { upload } from '@/api/system/file'
import { isObject } from 'lodash-es'
import { Indexable } from '@/app/types'

export default defineComponent({
  name: 'FdImageCropper',
  components: { VueCropper },
  props: {
    // 双向绑定图片地址
    modelValue: {
      type: String,
      default: ''
    },
    // 默认图片
    defaultImg: {
      type: String,
      default: ''
    },
    // 上传地址
    uploadUrl: {
      type: String,
      default: '/system/file/upload'
    },
    // 图片宽高比
    imgRatio: {
      type: Array as PropType<number[]>,
      default: () => [1, 1]
    },
    // 是否显示圆形预览图
    showCircle: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'img-uploaded'],
  setup(props, ctx) {
    const uploadInput = ref<HTMLElement | null>(null)
    const cropper = ref<IVueCropper>()

    const state = reactive({
      image: '', // 上传的图片数据
      filename: '', // 上传的图片名称
      uploadedFilename: '', // 服务器上的图片地址
      previews: {}, // 预览样式
      previewStyle: {}, // 预览样式
      dialogVisible: false,
      moveRotate: 'move'
    })

    const imageSrc = computed(() => {
      return state.uploadedFilename ? localOrRemoteUrl(state.uploadedFilename, 'upload') : props.defaultImg
    })

    watch(
      () => props.modelValue,
      (val) => {
        state.uploadedFilename = val
      },
      { immediate: true }
    )

    const uploadShow = () => {
      ;(uploadInput.value as HTMLElement).click()
    }

    const zoomIn = () => {
      ;(cropper.value as IVueCropper).zoomIn()
    }

    const zoomOut = () => {
      ;(cropper.value as IVueCropper).zoomOut()
    }

    const zoomToCover = () => {
      ;(cropper.value as IVueCropper).zoomToCover()
    }

    const zoomToOriginal = () => {
      ;(cropper.value as IVueCropper).zoomToOriginal()
    }

    const zoomToContain = () => {
      ;(cropper.value as IVueCropper).zoomToContain()
    }

    const flip = (ifHorizontal: boolean) => {
      if (ifHorizontal) {
        ;(cropper.value as IVueCropper).flipHorizontal()
      } else {
        ;(cropper.value as IVueCropper).flipVertical()
      }
    }

    const rotateLeft = () => {
      ;(cropper.value as IVueCropper).rotateLeft()
    }

    const rotateRight = () => {
      ;(cropper.value as IVueCropper).rotateRight()
    }

    const toggleMoveRotate = () => {
      if (state.moveRotate === 'move') {
        state.moveRotate = 'rotate'
      } else {
        state.moveRotate = 'move'
      }
    }

    const reset = () => {
      ;(cropper.value as IVueCropper).reset()
    }

    const onUpdatePreview = (data: Indexable) => {
      let zoom = 200
      const ratio = props.imgRatio[0] / props.imgRatio[1]
      if (ratio < 200 / 120) {
        zoom = 120
      }
      state.previewStyle = {
        width: data.w + 'px',
        height: data.h + 'px',
        overflow: 'hidden',
        margin: '0',
        zoom: zoom / data.w
      }
      state.previews = data
    }

    const uploadImg = (e: Event) => {
      const target = e.target as any
      const file = target.files[0]
      if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(target.value)) {
        ElMessage({
          message: '图片类型必须是.gif,jpeg,jpg,png,bmp中的一种',
          type: 'error',
          duration: 1500
        })
        return false
      }
      state.filename = file.name.split('.').slice(0, -1).join('.')
      const reader = new FileReader()
      reader.onload = (e: Event) => {
        let data = ''
        const target = e.target as any
        if (isObject(target.result)) {
          data = window.URL.createObjectURL(new Blob([target.result]))
        } else {
          data = target.result
        }
        state.image = data
        state.dialogVisible = true
        ;(uploadInput.value as any).value = ''
      }
      reader.readAsArrayBuffer(file)
    }

    const saveImg = () => {
      ;(cropper.value as IVueCropper).outputBlob(async (data: Blob) => {
        const downFilename = state.filename ? state.filename + '.png' : 'cropped' + '.png'
        const file = new File([data], downFilename, { type: 'image/png' })
        try {
          const res = await upload([file])
          console.log('res', res)
          if (res && res[0]) {
            // only accept one image
            state.uploadedFilename = res[0]
            ctx.emit('update:modelValue', res[0])
            ctx.emit('img-uploaded', res[0])
            ElMessage({
              message: '上传成功',
              type: 'success',
              duration: 1500
              // onClose: () => {}
            })
            state.dialogVisible = false
          }
        } catch (e) {
          console.log(e)
          return false
        }
      })
    }

    return {
      uploadInput,
      cropper,
      ...toRefs(state),
      imageSrc,
      uploadShow,
      zoomIn,
      zoomOut,
      zoomToCover,
      zoomToContain,
      zoomToOriginal,
      flip,
      rotateLeft,
      rotateRight,
      toggleMoveRotate,
      reset,
      onUpdatePreview,
      uploadImg,
      saveImg
    }
  }
})
</script>

<style lang="scss">
@use 'src/assets/style/variable' as *;
@use 'src/assets/style/color' as *;

.fd-img-cropper {
  display: flex;
  font-size: $font-size-tiny;
  color: var(--el-border-color-base);
  border: 1px solid var(--el-border-color-base);
  border-radius: var(--el-border-radius-base);
  box-sizing: border-box;
  background-color: var(--el-fill-base);
  overflow: hidden;
  cursor: pointer;

  .img-cropper-img {
    width: 100%;
    height: 100%;
  }

  &:hover {
    border-color: var(--el-border-color-hover);
  }
}

.fd-img-cropper-dialog {
  max-width: 900px;
  min-width: 700px;

  .el-dialog__body {
    background-color: var(--el-bg-color);
  }

  .cropper {
    width: 100%;
    height: 400px;
    margin: auto auto 0;
  }

  .actions {
    margin-top: 5px;
  }

  .preview-title {
    padding: 0;
  }

  .preview {
    float: left;
    padding: 3px;
    margin: 5px 5px 0 0;
    border: 1px solid var(--el-border-color-base);
    background-color: var(--el-fill-base);

    .preview-inner {
      overflow: hidden;
    }

    &.round {
      border-radius: 50%;
      overflow: hidden;

      .preview-inner {
        border-radius: 50%;
      }
    }
  }
}
</style>
