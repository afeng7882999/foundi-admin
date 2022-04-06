<template>
  <div class="fd-upload-img">
    <el-upload
      ref="imgUpload"
      class="fd-upload-img__upload"
      :before-upload="beforeUpload"
      :headers="uploadHeaders"
      :http-request="uploadFile"
      :multiple="false"
      name="files"
      action=""
      :on-error="uploadError"
      :on-success="uploadSuccess"
      :show-file-list="false"
    >
      <div v-loading="state.loading" class="fd-upload-img__section">
        <fd-icon v-if="!modelValue" class="section-icon" icon="add-pic"></fd-icon>
        <el-image v-if="modelValue" :src="modelValue" fit="cover" class="section-image" />
        <div v-if="modelValue" class="section-actions">
          <el-button size="small" @click.stop="openPreview">
            <fd-icon icon="preview-open"></fd-icon>
            预览
          </el-button>
          <el-button size="small" @click.stop="removeImage">
            <fd-icon icon="delete"></fd-icon>
            移除
          </el-button>
        </div>
      </div>
    </el-upload>
    <el-dialog v-model="state.dialogVisible" title="预览" custom-class="fd-upload-img__preview" append-to-body>
      <img :src="modelValue" alt="预览" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import useUpload from './use-upload'
import { DEFAULT_OSS } from '@/api/system/file'
import { localOrRemoteUrl } from '@/utils/query'

defineOptions({
  name: 'FdUploadImg'
})

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  oss: {
    type: String,
    default: DEFAULT_OSS
  }
})

const emit = defineEmits(['update:modelValue'])

const state = reactive({
  loading: false,
  dialogVisible: false
})

const { uploadHeaders, uploadError: _uploadError, uploadFile } = useUpload({ oss: props.oss })

const removeImage = () => {
  emit('update:modelValue', '')
}

const openPreview = () => {
  state.dialogVisible = true
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
</script>
