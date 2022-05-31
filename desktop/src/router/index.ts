import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { createRouterGuards } from '@b/app/permission'
import { App } from 'vue'

// desktop page path root
export const PAGE_ROOT_NORMAL = '/src/views/'

// affix tags
export const AFFIX_PATHS = ['dashboard']

// anonymous paths
export const ANON_PATHS = ['/login', '/register', '/404', '/forgot-password']

// import pages
export const importModules = import.meta.glob('/src/views/**/*.vue')
export const importBaseModules = import.meta.glob('../base/src/views/**/*.vue')

// static routes
export const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    meta: { title: '登录', noCache: true },
    component: importModules['/src/views/modules/login/index.vue']
  },
  {
    path: '/register',
    component: importModules['/src/views/modules/login/register.vue']
  },
  {
    path: '/forgot-password',
    component: importModules['/src/views/modules/login/forgot-password.vue']
  },
  {
    path: '/404',
    component: importModules['/src/views/common/404.vue']
  },
  {
    path: '/redirect',
    component: importModules['/src/views/layout/index.vue'],
    children: [
      {
        path: '/redirect/:path*',
        component: importBaseModules['../base/src/views/common/redirect.vue']
      }
    ]
  }
]

// dynamic routes
export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/views/layout/index.vue'),
    name: 'main',
    redirect: '/dashboard',
    meta: { title: '管理主页' },
    children: []
  }
]

// create router
const router = createRouter({
  history: createWebHistory(),
  routes: [...staticRoutes],
  scrollBehavior: () => ({ left: 0, top: 0, behavior: 'smooth' })
})

// setup router
export function setupRouter(app: App) {
  createRouterGuards(router, dynamicRoutes[0], PAGE_ROOT_NORMAL, AFFIX_PATHS, ANON_PATHS, importModules)
  app.use(router)
}

export default router
