/**
 * 校验登录名：只能输入5-20个以汉字、字母开头、可带数字、“_”、“.”的字串
 */
export function validUsername(str: string): boolean {
  return /^[a-zA-Z\u4e00-\u9fa5]([a-zA-Z0-9\u4e00-\u9fa5]|[._]){4,19}$/.test(str)
}

/**
 * 判断中英文姓名，包含空格和 “·”
 */
export function validName(str: string): boolean {
  return /^[\u4E00-\u9FA5A-Za-z\s]+(·[\u4E00-\u9FA5A-Za-z]+)*$/.test(str)
}

/**
 * 校验URL
 */
export function validURL(url: string): boolean {
  const reg =
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return reg.test(url)
}

/**
 * 校验Email地址
 */
export function validEmail(email: string): boolean {
  const reg =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return reg.test(email)
}

/**
 * 校验手机号
 */
export function validMobile(str: string): boolean {
  return /^1[0-9]{10}$/.test(str)
}

/**
 * 校验座机号
 */
export function validPhone(str: string): boolean {
  return /^([0-9]{3,4}-)?[0-9]{7,8}$/.test(str)
}

/**
 * 校验密码：只能输入6-20个字母、数字、下划线
 */
export function validPassword(str: string): boolean {
  return /^(\w){6,20}$/.test(str)
}

/**
 * 校验IP地址
 */
export function validIP(str: string): boolean {
  const reg =
    /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
  return reg.test(str)
}

/**
 * 校验手机号码或者固话
 */
export function validPhoneOrMobile(str: string): boolean {
  const reg = /^((0\d{2,3}-\d{7,8})|(1[34578]\d{9}))$/
  return reg.test(str)
}

/**
 * 校验身份证号码
 */
export function validIdNum(str: string): boolean {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return reg.test(str)
}

/**
 * 是否是外链
 */
export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 是否全部小写字母
 */
export function isLowerCase(str: string): boolean {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/**
 * 是否全部小大写字母
 */
export function isUpperCase(str: string): boolean {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/**
 * 是否全部为字母
 */
export function isAlphabets(str: string): boolean {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}
