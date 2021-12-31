import { AnyObject } from '@/utils'
import store from '@/store'
import { login, logout } from '@/api/system/login'
import settings from '@/app/settings'
import { getCurrentInfo } from '@/api/system/user'

const ADMIN_PERM = 'admin:dashboard'

/**
 * 获取Token
 */
export function getToken(): string | undefined {
  return store.state.user.token
}

/**
 * 设置Token
 */
export async function setToken(token: string): Promise<void> {
  await store.dispatch('user/setToken', token)
}

/**
 * 用户登录
 */
export async function userLogin(accountInfo: AnyObject): Promise<void> {
  const username = accountInfo.username.trim()
  await login({
    username: username,
    password: accountInfo.password,
    appName: settings.appName,
    uuid: accountInfo.uuid
  })
  await store.dispatch('view/delAllViews')
}

/**
 * 用户登出
 */
export async function userLogout(): Promise<void> {
  try {
    await logout()
  } catch (e) {
    console.log(e)
  } finally {
    await store.dispatch('user/clearUser')
  }
}

/**
 * 设置用户信息
 */
export async function getUserInfo(): Promise<void> {
  const { user, roles, perms, menu } = await getCurrentInfo()
  await store.dispatch('user/setUserInfo', { user, roles, perms, menu })
}

/**
 * 清除用户信息
 */
export async function clearUserInfo(): Promise<void> {
  await store.dispatch('user/clearUser')
}

/**
 * 判断是否包含某个权限值
 */
export function isAuth(key: string): boolean {
  return (store.state.user.perms && store.state.user.perms.indexOf(key) !== -1) || false
}

/**
 * 判断是否是管理员
 */
export function isAdmin(): boolean {
  return (store.state.user.perms && store.state.user.perms.indexOf(ADMIN_PERM) !== -1) || false
}
