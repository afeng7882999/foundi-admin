import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { createRouterGuards } from '@/app/permission'
import { App } from 'vue'
import { normalizeUrl } from '@/utils/query'

// desktop page path root
export const PAGE_ROOT_NORMAL = '/src/views/'

// mobile page path root
export const PAGE_ROOT_MOBILE = '/src/views-m/'

// affix tags
export const DEFAULT_AFFIX_ROUTE = ['dashboard']

// anonymous paths
const anonList = ['/login', '/register', '/404', '/forgot-password']
export const ANON_LIST = [...anonList, ...anonList.map((s) => normalizeUrl(s, true))]

// import pages
export const importModules = import.meta.glob('/src/views*/**/*.vue')

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
        component: importModules['/src/views/common/redirect.vue']
      }
    ]
  },
  {
    path: '/m/login',
    meta: { title: '登录', noCache: true },
    component: importModules['/src/views-m/modules/login/index.vue'] ?? importModules['/src/views/modules/login/index.vue']
  },
  {
    path: '/m/register',
    component: importModules['/src/views-m/modules/login/register.vue'] ?? importModules['/src/views/modules/login/register.vue']
  },
  {
    path: '/m/forgot-password',
    component:
      importModules['/src/views-m/modules/login/forgot-password.vue'] ?? importModules['/src/views/modules/login/forgot-password.vue']
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
  },
  {
    path: '/m/',
    component: () => import('@/views/layout/index.vue'),
    name: 'mainM',
    redirect: '/m/dashboard',
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
  createRouterGuards(router)
  app.use(router)
}

export default router
