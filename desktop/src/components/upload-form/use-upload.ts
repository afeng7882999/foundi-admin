import { computed } from 'vue'
import { getToken } from '@b/app/account'
import { ElMessage } from 'element-plus'
import { UploadFile } from 'element-plus/es/components/upload/src/upload.type'
import { getFileExt } from '@b/utils/file'
import { ElUploadRequestOptions } from 'element-plus/es/components/upload/src/upload.type'
import { upload } from '@b/api/system/file'

export interface IUploadComProps {
  oss: string
  fileSize?: number
  fileType?: string[]
  tip?: string
}

export default function (props: IUploadComProps) {
  const uploadHeaders = computed(() => {
    return {
      Authorization: 'Bearer ' + getToken()
    }
  })

  const ifHideTip = computed(() => {
    return !!props.tip
  })

  const tipContent = computed(() => {
    const tip = props.tip ? props.tip : '上传文件'
    if (props.fileSize && props.fileType) {
      return `${tip}，最大${props.fileSize} MB，${props.fileType.join('/')}格式`
    }
    return tip
  })

  const uploadSuccess = (response: string[]) => {
    ElMessage({
      message: '上传成功',
      type: 'success',
      duration: 1500
    })
    return response
  }

  const uploadError = () => {
    ElMessage({
      message: '错误: 上传文件出错',
      type: 'error',
      duration: 1500
    })
  }

  const checkFile = (file: UploadFile) => {
    console.log(file)
    if (props.fileType) {
      const ext = getFileExt(file.name)
      const isTypeOk = props.fileType.some((type) => {
        return ext && ext.indexOf(type) > -1
      })
      if (!isTypeOk) {
        ElMessage({
          message: `文件格式不正确, 请上传${props.fileType.join('/')}格式文件!`,
          type: 'error',
          duration: 1500
        })
        return false
      }
    }
    if (props.fileSize) {
      const isSizeOk = file.size / 1024 / 1024 < props.fileSize
      if (!isSizeOk) {
        ElMessage({
          message: `上传文件大小不能超过 ${props.fileSize} MB!`,
          type: 'error',
          duration: 1500
        })
        return false
      }
    }
    return true
  }

  const uploadFile = async (param: ElUploadRequestOptions) => {
    return await upload([param.file], props.oss)
  }

  return {
    uploadHeaders,
    ifHideTip,
    tipContent,
    uploadSuccess,
    uploadError,
    checkFile,
    uploadFile
  }
}
