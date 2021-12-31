<template>
  <div class="fd-upload-img">
    <el-upload
      ref="imgUpload"
      :before-upload="beforeUpload"
      :headers="uploadHeaders"
      :http-request="uploadFile"
      :multiple="false"
      name="files"
      action=""
      :on-error="uploadError"
      :on-success="uploadSuccess"
      :show-file-list="false"
      class="img-upload"
    >
      <div v-loading="loading" class="upload-section">
        <fd-icon v-if="!modelValue" class="upload-icon" icon="folder-add"></fd-icon>
        <el-image v-if="modelValue" :src="modelValue" fit="fill" class="upload-img" />
        <div v-if="modelValue" class="upload-actions">
          <span title="预览" @click.stop="dialogVisible === true"><i class="el-icon-zoom-in"></i></span>
          <span title="移除" @click.stop="removeImage"><i class="el-icon-delete"></i></span>
        </div>
      </div>
    </el-upload>
    <el-dialog v-model:visible="dialogVisible" title="预览" class="upload-preview" append-to-body>
      <img :src="modelValue" alt="预览" />
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue'
import useUpload from './use-upload'
import { DEFAULT_OSS } from '@/api/system/file'
import { localOrRemoteUrl } from '@/utils/query'

export default defineComponent({
  name: 'FdUploadImg',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    oss: {
      type: String,
      default: DEFAULT_OSS
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const state = reactive({
      loading: false,
      dialogVisible: false
    })

    const { uploadHeaders, uploadError: _uploadError, uploadFile } = useUpload({ oss: props.oss })

    const removeImage = () => {
      emit('update:modelValue', '')
    }

    const uploadSuccess = (response: string[]) => {
      emit('update:modelValue', localOrRemoteUrl(response[0], 'upload'))
      state.loading = false
    }

    const beforeUpload = () => {
      state.loading = true
    }

    const uploadError = () => {
      _uploadError()
      state.loading = false
    }

    return {
      ...toRefs(state),
      uploadHeaders,
      removeImage,
      uploadSuccess,
      beforeUpload,
      uploadError,
      uploadFile
    }
  }
})
</script>

<style lang="scss">
@use 'src/assets/style/variable' as *;

.fd-img-upload {
  .el-upload {
    display: inline-block;
    vertical-align: top;
  }

  .upload-section {
    position: relative;
    display: flex;
    align-items: center;
    width: 150px;
    height: 150px;
    border: 1px solid var(--el-border-color-base);
    background-color: var(--el-fill-base);
    border-radius: var(--el-border-radius-base);
    overflow: hidden;

    .upload-icon {
      flex: 1;
      font-size: 80px;
      color: var(--el-text-color-placeholder);
    }

    .upload-img {
      flex: 1;
      align-self: stretch;
      .el-image__error {
        background-color: var(--el-fill-base);
      }
    }

    .upload-actions {
      opacity: 0;
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(var(--el-color-white-rgb), 0.8);
      transition: all $default-transition-time;
      span {
        padding: 10px;
        color: var(--el-text-color-primary);
        font-size: 22px;
        &:hover {
          color: var(--el-color-primary);
        }
      }
    }

    &:hover .upload-actions {
      opacity: 1;
    }
  }

  .upload-preview {
    width: 800px;

    img {
      display: block;
      max-width: 100%;
      margin: 0 auto;
    }
  }
}
</style>
