<template>
  <div class="fd-upload-input">
    <el-input :model-value="modelValue" :placeholder="placeholder" :size="size" clearable @input="changeValue" @clear="clearValue">
      <template #append>
        <el-upload
          ref="fileUpload"
          :before-upload="checkFile"
          :headers="uploadHeaders"
          :http-request="uploadFile"
          :multiple="false"
          name="files"
          action=""
          :on-error="uploadError"
          :on-success="uploadSuccess"
          :show-file-list="false"
        >
          <el-tooltip :content="tipContent" placement="top" :disabled="ifHideTip">
            <div class="fd-upload-input__trigger">
              <fd-icon icon="more"></fd-icon>
            </div>
          </el-tooltip>
        </el-upload>
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import useUpload from './use-upload'
import { DEFAULT_OSS } from '@b/api/system/file'
import { localOrRemoteUrl } from '@b/utils/query'

defineOptions({
  name: 'FdUploadInput'
})

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  oss: {
    type: String,
    default: DEFAULT_OSS
  },
  fileSize: {
    type: Number,
    default: 5
  },
  fileType: {
    type: Array as PropType<string[]>,
    default: () => ['doc', 'xls', 'ppt', 'txt', 'pdf', 'jpg', 'png', 'bmp']
  },
  tip: {
    type: String,
    default: '点击按钮上传文件'
  },
  placeholder: {
    type: String,
    default: '上传文件'
  },
  size: {
    type: String,
    default: 'default'
  }
})

const emit = defineEmits(['update:modelValue'])

const {
  uploadHeaders,
  ifHideTip,
  tipContent,
  uploadSuccess: _uploadSuccess,
  uploadError,
  checkFile,
  uploadFile
} = useUpload({ oss: props.oss, fileSize: props.fileSize, tip: props.tip })

const uploadSuccess = (response: string[]) => {
  _uploadSuccess(response)
  emit('update:modelValue', localOrRemoteUrl(response[0], 'upload'))
}

const changeValue = (val: string) => {
  emit('update:modelValue', val)
}

const clearValue = () => {
  emit('update:modelValue', '')
}
</script>
