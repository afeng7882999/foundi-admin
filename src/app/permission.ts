import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import store from '@/store'
import router, { ANON_LIST, DEFAULT_AFFIX_ROUTE, dynamicRoutes, importModules, PAGE_ROOT_MOBILE, PAGE_ROOT_NORMAL } from '@/router'
import config from './settings'
import { clearUserInfo, getToken, getUserInfo, isAdmin } from '@/app/account'
import { ElMessage } from 'element-plus'
import { Router, RouteRecordRaw } from 'vue-router'
import { traverseTree, TreeNodeDefault } from '@/utils/data-tree'
import { camelToDash, urlToCamel } from '@/utils/lang'
import { getDeviceSize } from '@/hooks/use-layout-size'
import { DeviceType } from '@/store/modules/app'
import { normalizeUrl, normalizeUrlMatch } from '@/utils/query'
import settings from './settings'

export function createRouterGuards(router: Router) {
  NProgress.configure({ showSpinner: false })

  router.beforeEach(async (to, from, next) => {
    if (to.meta.title) {
      document.title = to.meta.title + ' - ' + config.title
    }
    NProgress.start()

    const isMobile = isMobileSize()

    // unauthorized
    if (!getToken()) {
      if (ANON_LIST.indexOf(to.path) !== -1) {
        next()
      } else {
        // redirect to login page
        next(normalizeUrl(`/login?redirect=${to.path}`, isMobile))
        NProgress.done()
      }
      return
    }

    if (normalizeUrlMatch(to.path, '/login')) {
      next({ path: normalizeUrl('/', isMobile) })
      NProgress.done()
      return
    }

    if (to.path === '/404') {
      next()
      return
    }

    // has not get user's info
    if ((store.state.user.user && store.state.user.user.username === '') || store.state.user.token === '') {
      try {
        await getUserInfo()

        // check perm to access admin background
        if (!isAdmin()) {
          await clearUserInfo()
          ElMessage({ message: '登录失败，无权限!', type: 'error', duration: 1500 })
          next({ path: normalizeUrl('/', isMobile) })
          return
        }
      } catch (e) {
        console.log(e)
        await clearUserInfo()
        ElMessage({ message: '认证失败, 请登录!', type: 'error', duration: 1500 })
        next({ path: normalizeUrl('/', isMobile) })
        return
      }
    }

    // has not initialized menu
    if (store.state.user.menu && !store.state.router.routeLoaded) {
      await initDynamicRoutes(store.state.user.menu)
      next({ ...to, replace: true })
      return
    }

    // switch to mobile page
    if (isMobile && !to.path.startsWith('/' + settings.mobileRoot)) {
      next({ path: '/' + settings.mobileRoot + to.path, replace: true })
      return
    }

    // switch to desktop page
    if (!isMobile && to.path.startsWith('/' + settings.mobileRoot)) {
      next({ path: to.path.slice(2), replace: true })
      return
    }

    next()
  })

  router.afterEach(() => {
    NProgress.done()
  })
}

/**
 * initialize dynamic routes
 */
export async function initDynamicRoutes(menus: TreeNodeDefault[]): Promise<void> {
  const routes = [] as RouteRecordRaw[]
  const routesMobile = [] as RouteRecordRaw[]

  traverseTree(menus, (item) => {
    if ((item.typeDict === '1' || item.typeDict === '0') && item.url && /\S/.test(item.url)) {
      const url = item.url.replace(/^\//, '')
      // only match the pattern: /xxx/xxx/:p/:p2...
      const urlNoParam = url.replace(/\/:.*/g, '')
      const fixed = DEFAULT_AFFIX_ROUTE.indexOf(url) !== -1
      const meta = { id: item.id, title: item.name, icon: item.icon, remark: item.remark, isDynamic: true, affix: fixed, isMobile: false }

      const route = {
        path: url,
        // router's name must be equal to component's name for caching
        name: urlToCamel(urlNoParam),
        redirect: item.redirect,
        meta
      } as RouteRecordRaw

      const routeMobile = {
        path: url,
        name: urlToCamel(urlNoParam) + 'M',
        redirect: item.redirect,
        meta: { ...meta, isMobile: true }
      } as RouteRecordRaw

      const urlDash = camelToDash(urlNoParam)
      const moduleName = item.pagePath ? `modules${item.pagePath}.vue` : `modules/${urlDash}/index.vue`
      try {
        routeMobile.component = importModules[PAGE_ROOT_MOBILE + moduleName] ?? importModules[PAGE_ROOT_NORMAL + moduleName]
        route.component = importModules[PAGE_ROOT_NORMAL + moduleName]
      } catch (e) {
        console.log(e)
      }

      routes.push(route)
      routesMobile.push(routeMobile)
    }
  })

  dynamicRoutes[0].children?.push(...routes)
  dynamicRoutes[1].children?.push(...routesMobile)
  router.addRoute(dynamicRoutes[0])
  router.addRoute(dynamicRoutes[1])
  router.addRoute({ path: '/:catchAll(.*)', redirect: '/404' })

  await store.dispatch('router/setRoutes', [...routes, ...routesMobile])
  await store.dispatch('router/setRouteLoaded', true)
}

/**
 * Check whether the size of window if smaller than mobile size threshold
 */
const isMobileSize = () => {
  const deviceSize = store.state.app.deviceSize ?? getDeviceSize()
  return deviceSize === DeviceType.Mobile
}
