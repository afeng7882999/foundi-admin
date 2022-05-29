import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import config from './settings'
import store from '@b/store'
import { clearUserInfo, getToken, getUserInfo, isAdmin } from '@b/app/account'
import { Router, RouteRecordRaw } from 'vue-router'
import { traverseTree, TreeNodeDefault } from '@b/utils/data-tree'
import { camelToDash, urlToCamel } from '@b/utils/lang'
import { message } from '@b/common/global'
import { Indexable } from '@b/common/types'

export function createRouterGuards(
  router: Router,
  rootRoute: RouteRecordRaw,
  pageRoot: string,
  affixes: string[],
  anons: string[],
  importModules: Record<string, () => Promise<Indexable>>
) {
  NProgress.configure({ showSpinner: false })

  router.beforeEach(async (to, from, next) => {
    if (to.meta.title) {
      document.title = to.meta.title + ' - ' + config.title
    }
    NProgress.start()

    // unauthorized
    if (!getToken()) {
      if (anons.indexOf(to.path) !== -1) {
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
          message('登录失败，无权限!', 'error', 1500)
          next({ path: '/' })
          return
        }
      } catch (e) {
        console.log(e)
        await clearUserInfo()
        message('认证失败, 请登录!', 'error', 1500)
        next({ path: '/' })
        return
      }
    }

    // has not initialized menu
    if (store.state.user.menu && !store.state.router.routeLoaded) {
      const menus = store.state.user.menu as TreeNodeDefault[]
      await initDynamicRoutes(router, rootRoute, menus, pageRoot, affixes, importModules)
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
export async function initDynamicRoutes(
  router: Router,
  rootRoute: RouteRecordRaw,
  menus: TreeNodeDefault[],
  pageRoot: string,
  affixes: string[],
  importModules: Record<string, () => Promise<Indexable>>
): Promise<void> {
  const routes = [] as RouteRecordRaw[]

  traverseTree(menus, (item) => {
    if ((item.typeDict === '1' || item.typeDict === '0') && item.url && /\S/.test(item.url)) {
      const url = item.url.replace(/^\//, '')
      // only match the pattern: /xxx/xxx/:p/:p2...
      const urlNoParam = url.replace(/\/:.*/g, '')
      const fixed = affixes.indexOf(url) !== -1
      const meta = { id: item.id, title: item.name, icon: item.icon, remark: item.remark, isDynamic: true, affix: fixed }
      const route = {
        path: url,
        // router's name must be equal to component's name for caching
        name: urlToCamel(urlNoParam),
        redirect: item.redirect,
        meta
      } as RouteRecordRaw
      const urlDash = camelToDash(urlNoParam)
      const moduleName = item.pagePath ? `modules${item.pagePath}.vue` : `modules/${urlDash}/index.vue`
      try {
        route.component = importModules[pageRoot + moduleName]
      } catch (e) {
        console.log(e)
      }

      routes.push(route)
    }
  })

  rootRoute.children?.push(...routes)
  router.addRoute(rootRoute)
  router.addRoute({ path: '/:catchAll(.*)', redirect: '/404' })

  await store.dispatch('router/setRoutes', routes)
  await store.dispatch('router/setRouteLoaded', true)
}
