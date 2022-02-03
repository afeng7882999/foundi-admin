import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import store from '@/store'
import router, { ANON_LIST, DEFAULT_AFFIX_ROUTE, importModules, dynamicRoutes } from '@/router'
import config from './settings'
import { clearUserInfo, getToken, getUserInfo, isAdmin } from '@/app/account'
import { ElMessage } from 'element-plus'
import { Router, RouteRecordRaw } from 'vue-router'
import { ITreeNodeDefault, traverseTree } from '@/utils/data-tree'
import { camelToDash, urlToCamel } from '@/utils/lang'

export function createRouterGuards(router: Router) {
  NProgress.configure({ showSpinner: false })

  router.beforeEach(async (to, from, next) => {
    if (to.meta.title) {
      document.title = to.meta.title + ' - ' + config.title
    }
    NProgress.start()

    // unauthorized
    if (!getToken()) {
      if (ANON_LIST.indexOf(to.path) !== -1) {
        next()
      } else {
        // redirect to login page
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
      return
    }

    if (to.path === '/login') {
      next({ path: '/' })
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
          next({ path: '/' })
          return
        }
      } catch (e) {
        console.log(e)
        await clearUserInfo()
        ElMessage({ message: '认证失败, 请登录!', type: 'error', duration: 1500 })
        next({ path: '/' })
        return
      }
    }

    // has not initialized menu
    if (store.state.user.menu && !store.state.router.routeLoaded) {
      await initDynamicRoutes(store.state.user.menu)
      next({ ...to, replace: true })
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
export async function initDynamicRoutes(menus: ITreeNodeDefault[]): Promise<void> {
  const routes = [] as RouteRecordRaw[]

  traverseTree(menus, (item) => {
    if ((item.typeDict === '1' || item.typeDict === '0') && item.url && /\S/.test(item.url)) {
      const url = item.url.replace(/^\//, '')
      // only match the pattern: /xxx/xxx/:p/:p2...
      const urlNoParam = url.replace(/\/:.*/g, '')
      const fixed = DEFAULT_AFFIX_ROUTE.indexOf(url) !== -1
      const route = {
        path: url,
        // router's name must be equal to component's name for caching
        name: urlToCamel(urlNoParam),
        redirect: item.redirect,
        meta: { id: item.id, title: item.name, icon: item.icon, remark: item.remark, isDynamic: true, affix: fixed }
      } as RouteRecordRaw
      const urlDash = camelToDash(urlNoParam)
      try {
        if (item.pagePath) {
          route.component = importModules[`/src/views/modules${item.pagePath}.vue`]
        } else {
          route.component = importModules[`/src/views/modules/${urlDash}/index.vue`]
        }
      } catch (e) {
        console.log(e)
      }
      routes.push(route)
    }
  })
  ;(dynamicRoutes.children as RouteRecordRaw[]).push(...routes)
  router.addRoute(dynamicRoutes)
  router.addRoute({ path: '/:catchAll(.*)', redirect: '/404' })
  await store.dispatch('router/setRoutes', routes)
  await store.dispatch('router/setRouteLoaded', true)
}
