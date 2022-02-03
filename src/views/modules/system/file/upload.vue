<template>
  <el-dialog v-model="state.visible" :close-on-click-modal="false" title="上传文件" @closed="hideDialog">
    <el-form ref="form" label-width="80px" size="medium">
      <el-form-item label="OSS配置">
        <fd-tree-select
          v-model="state.oss"
          :data-list="state.configList"
          :select-params="{ placeholder: 'OSS配置' }"
          :tree-fields="{ idField: 'configKey', labelField: 'configKey' }"
        ></fd-tree-select>
      </el-form-item>
      <el-form-item label="文件">
        <el-upload
          ref="fileUpload"
          :auto-upload="false"
          :before-upload="checkFile"
          :file-list="state.fileList"
          :headers="uploadHeaders"
          :http-request="uploadFile"
          :multiple="true"
          :on-error="uploadError"
          :on-success="uploadSuccess"
          action=""
          name="files"
        >
          <template #trigger>
            <el-button size="medium" type="primary">选取文件</el-button>
          </template>
          <template #tip>
            <div v-if="!ifHideTip" class="el-upload__tip">{{ tipContent }}</div>
          </template>
          <el-button size="medium" style="margin-left: 10px" type="success" @click="onUploadSubmit">
            上传到服务器
          </el-button>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="fd-dialog-footer">
        <el-button size="medium" @click="state.visible = false">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: 'SystemFileUpload'
}
</script>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { REFRESH_DATA_EVENT } from '@/components/crud/use-edit'
import { configListOss, IConfig } from '@/api/system/config'
import useUpload from '@/components/upload-form/use-upload'
import { DEFAULT_OSS } from '@/api/system/file'

const emit = defineEmits([REFRESH_DATA_EVENT])

const fileUpload = ref()

const state = reactive({
  configList: [] as IConfig[],
  fileList: [] as string[],
  oss: DEFAULT_OSS,
  visible: false
})

const fileSize = 500
const tip = '上传文件'
const {
  uploadHeaders,
  ifHideTip,
  tipContent,
  uploadSuccess: _uploadSuccess,
  uploadError,
  checkFile,
  uploadFile
} = useUpload({ oss: state.oss, fileSize, tip })

const open = async () => {
  resetForm()
  state.configList = (await configListOss()).data
  state.visible = true
}

const hideDialog = () => {
  emit(REFRESH_DATA_EVENT)
  state.visible = false
  resetForm()
  ;(fileUpload.value as any).clearFiles()
}

const resetForm = () => {
  state.fileList = []
  state.oss = DEFAULT_OSS
}

const uploadSuccess = (response: string[]) => {
  _uploadSuccess(response)
}

const onUploadSubmit = () => {
  ;(fileUpload.value as any).submit()
}

defineExpose({
  open
})
</script>
