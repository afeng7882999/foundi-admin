import axios, { AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from 'axios'
import router from '@/router'
import { getToken, setToken, userLogout } from '@/app/account'
import settings from '@/app/settings'
import { ElMessage, ElMessageBox } from 'element-plus'
import { decryptByAES, encryptByAES, encryptByRsa, generateKey } from '@/utils/encrypt'
import { merge } from 'lodash-es'

// 返回数据页
export interface ResPage {
  count?: number
  limit?: number
  total?: number
  current?: number
}

// 返回数据
export interface ResData<T = any> {
  msg?: string | string[]
  ex?: string
  data?: T
  page?: ResPage
  token?: string
}

// 加密config
interface AxiosRequestConfigWithEnc extends AxiosRequestConfig {
  encrypt: { key: string; iv: string }
}

// axios实例
const http = axios.create({
  baseURL: import.meta.env.DEV ? '/' : (import.meta.env.VITE_APP_BASE_API as string),
  timeout: settings.timeout
})

// request拦截器
http.interceptors.request.use(
  (config) => {
    if (config.headers == undefined) {
      config.headers = {} as AxiosRequestHeaders
    }
    const headers = config.headers as AxiosRequestHeaders

    // set token in headers
    if (getToken()) {
      headers['Authorization'] = 'Bearer ' + getToken()
    }

    // encrypt request body
    if (headers['Encrypt']) {
      config = encryptRequest(config)
    }

    headers['Content-Type'] = 'application/json'
    return config
  },

  async (error) => {
    throw new Error(error)
  }
)

// response拦截器
http.interceptors.response.use(
  async (response) => {
    let res = response.data

    // need decrypt
    if (response.headers['encrypt'] === 'true') {
      res = decryptResponse(response)
    }

    console.log('[Foundi Response]: ', res)

    // Blob，use response directly
    if (res instanceof Blob) {
      return response
    }

    // business exception
    if (res.bz_code !== 1) {
      ElMessage({
        message: buildErrorMess(res),
        type: 'error',
        duration: 2500
      })
      return Promise.reject('后台业务异常')
    }

    // set token
    if (res.token) {
      await setToken(res.token)
    }

    return response
  },

  async (error) => {
    let status = 0
    try {
      status = error.response.status
    } catch (e) {
      // timeout
      if (error.toString().indexOf('Error: timeout') !== -1) {
        ElMessage({
          message: '网络请求超时',
          type: 'error',
          duration: 2500
        })
      }
      return Promise.reject('后台接口超时')
    }

    // api failure
    if (!status) {
      ElMessage({
        message: error.response.data.msg ? buildErrorMess(error.response) : '接口请求失败',
        type: 'error',
        duration: 2500
      })
      return Promise.reject('后台接口请求失败')
    }

    // 401
    if (status === 401 || status === 403) {
      await ElMessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await userLogout()
      location.reload()
      return Promise.reject('后台接口需要认证')
    }

    // show 404 page
    if (status === 404) {
      await router.push('/404')
      return Promise.reject('后台接口不可用')
    }

    let errorResData = error.response.data

    // need decrypt
    if (error.response.headers['encrypt'] === 'true') {
      errorResData = decryptResponse(error.response)
    }

    // resubmit exception
    if (errorResData?.ex === 'ResubmitException') {
      // hide error message
      return Promise.reject(errorResData.ex)
    }

    // LoginRetryLimitException exception
    if (errorResData?.ex === 'LoginRetryLimitException') {
      // hide error message
      return Promise.reject(errorResData.ex)
    }

    // others, 400, 500...
    if (errorResData) {
      ElMessage({
        message: buildErrorMess(errorResData),
        type: 'error',
        duration: 2500
      })
    }
    return Promise.reject(errorResData.ex)
  }
)

// 加密axios
const httpEncrypt = async (config: AxiosRequestConfig) => {
  config = merge({}, { headers: { Encrypt: 'true' } }, config)
  return http(config)
}

// 加密Request
function encryptRequest(config: AxiosRequestConfig) {
  const key = generateKey()
  const iv = generateKey()
  ;(config as AxiosRequestConfigWithEnc).encrypt = { key, iv }

  const headers = config.headers as AxiosRequestHeaders
  headers['Encrypt'] = encryptByRsa(key + iv)

  if (config.params) {
    const enc = encryptByAES(JSON.stringify(config.params), key, iv)
    config.params = { enc: enc }
  }

  if (config.data) {
    config.data = encryptByAES(JSON.stringify(config.data), key, iv)
  }

  return config
}

// 解密response
function decryptResponse(response: AxiosResponse) {
  const encrypt = (response.config as AxiosRequestConfigWithEnc).encrypt
  if (encrypt?.key && encrypt?.iv && response.data) {
    const json = decryptByAES(response.data, encrypt.key, encrypt.iv)
    return JSON.parse(json)
  }

  return response.data
}

function buildErrorMess(responseData: any): string {
  if (responseData.msg && Array.isArray(responseData.msg)) {
    return responseData.msg.join(', ')
  }
  return responseData.msg ? responseData.msg : ''
}

export default http
export { httpEncrypt }
