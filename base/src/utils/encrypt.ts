import JSEncrypt from 'jsencrypt/lib'
import CryptoJS from 'crypto-js'

const RsaPublicKey =
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCD+Mx7i2wievyjGKiOwR1grWFCpKobzgK62MaFzCzxoHTIXz2RXeOV1Hxi/BdQIVvfZLlxYV0rG8DR7Q1i/7a6fQhCXzladTVr6cuaixLLXo2XbFCsHaC8009D012FXUI2wJveZcmtjYzx2z4eLTIGbWHX6j4Gyf4utI94AEeKhwIDAQAB'

/**
 * BASE64的url-safe编码
 */
function base64ToUrlSafeEncode(base64Str: string): string {
  if (!base64Str) return ''
  return base64Str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * BASE64的url-safe解码
 */
function UrlSafeToBase64Decode(base64UrlStr: string): string {
  if (!base64UrlStr) return ''
  const str = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/')
  return str + '===='.substring(0, str.length % 4)
}

/**
 * BASE64编码
 */
function Base64Encode(plain: string): string {
  const wordArray = CryptoJS.enc.Utf8.parse(plain)
  return base64ToUrlSafeEncode(CryptoJS.enc.Base64.stringify(wordArray))
}

/**
 * RSA公钥加密
 */
export function encryptByRsa(plain: string): string {
  const enc = new JSEncrypt({})
  enc.setPublicKey(RsaPublicKey) // 设置公钥
  const encrypted = enc.encrypt(plain)
  return encrypted ? base64ToUrlSafeEncode(encrypted) : ''
}

/**
 * AES加密
 */
export function encryptByAES(plain: string, key: string, iv: string): string {
  const cipherParams = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(plain), CryptoJS.enc.Utf8.parse(key), {
    iv: CryptoJS.enc.Utf8.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  const encrypt = cipherParams.ciphertext
  return base64ToUrlSafeEncode(CryptoJS.enc.Base64.stringify(encrypt))
}

/**
 * AES解密
 */
export function decryptByAES(encrypted: string, key: string, iv: string): string {
  // 解密Base64编码后的密文
  const wordArray = CryptoJS.AES.decrypt(UrlSafeToBase64Decode(encrypted), CryptoJS.enc.Utf8.parse(key), {
    iv: CryptoJS.enc.Utf8.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  return CryptoJS.enc.Utf8.stringify(wordArray).toString()
}

/**
 * 生成密钥
 */
const GENERATE_KEY_ARRAY = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
export function generateKey(strength = 128): string {
  let result = ''
  for (let i = 0; i < strength / 8; i++) {
    result += GENERATE_KEY_ARRAY.charAt(Math.random() * GENERATE_KEY_ARRAY.length)
  }
  return result
}
