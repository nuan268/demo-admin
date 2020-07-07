import Vue from 'vue'
import VueRouter from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import utils from '@/utils'
import store from '@/store'
import api from '@/api'
import layoutHeaderAside from '@/layout/header-aside'

// fix vue-router NavigationDuplicated
const VueRouterPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return VueRouterPush.call(this, location).catch(err => err)
}
const VueRouterReplace = VueRouter.prototype.replace
VueRouter.prototype.replace = function replace (location) {
  return VueRouterReplace.call(this, location).catch(err => err)
}

Vue.use(VueRouter)

/**
 * @description 创建在 layout 中显示的路由设置
 * @param {Array} routes 动态路由设置
 */
export function createRoutesInLayout (routes = []) {
  return [
    {
      path: '/',
      redirect: { name: 'index' },
      component: layoutHeaderAside,
      children: [
        { path: 'index', name: 'index', meta: { title: '首页', auth: true }, component: utils.import('system/index') },
        { path: 'log', name: 'log', meta: { title: '前端日志', auth: true }, component: utils.import('system/log') },
        ...routes
      ]
    }
  ]
}

// 在 layout 之外显示的路由
export const routesOutLayout = [
  { path: '/refresh', name: 'refresh', component: utils.import('system/function/refresh'), hidden: true },
  { path: '/redirect/:route*', name: 'redirect', component: utils.import('system/function/redirect'), hidden: true },
  { path: '/login', name: 'login', component: utils.import('system/login'), hidden: true },
  { path: '*', name: '404', component: utils.import('system/error/404'), hidden: true }
]

// 默认的路由
export const constantRoutes = createRoutesInLayout().concat(routesOutLayout)

/**
 * @description 创建路由
 * @param {Array} routes 路由设置
 */
const createRouter = (routes = []) => new VueRouter({
  scrollBehavior: () => ({ y: 0 }),
  routes
})

// 导出路由 在 main.js 里使用
const router = createRouter(constantRoutes)

/**
 * @description 重新设置路由
 * @param {Array} routes 额外追加的路由
 */
export function resetRouter (routes = []) {
  router.matcher = createRouter(routes).matcher
}
const whiteList = ['/login', '/redirect']
router.beforeEach(async (to, from, next) => {
  NProgress.start()
  try {
       // 确认已经加载多标签页数据 https://github.com/d2-projects/d2-admin/issues/201
    await store.dispatch('d2admin/page/isLoaded')
    // 加载动态路由 内部已经做了对登录状态和是否已经加载动态路由的判断
    await store.dispatch('d2admin/permission/load', { to: to.fullPath })
    next()
    // 验证当前路由所有的匹配中是否需要有验证的 由于在网络请求的钩子里有对 token 异常的判断，所以在这里不处理异常重定向
    if (to.matched.some(r => r.meta.auth)) {
      const token = utils.cookies.get('token')
      if(token && token !=='undefined'){
        next()
      }else{
        next({
          name: 'login',
          query: {
            redirect: to.fullPath
          }
        })
      }
      NProgress.done()
    } else {
      next()
    }
  } catch (error) {
    next(false)
  }
  NProgress.done()
  
})

router.afterEach(to => {
  // 进度条
  NProgress.done()
  // 多页控制 打开新的页面
  store.dispatch('d2admin/page/open', to)
  // 更改标题
  utils.title(to.meta.title)
})

export const asyncRoutes = [
  {
    path: '/js/a/sys/empUser/index',
    component: () => import('@/views/management/user'),
    name: 'userManager',
    meta: {
      title: '用户管理'
    }
  },
  {
    path: '/js/a/sys/office/index',
    component: () => import('@/views/management/dept'),
    name: 'institution',
    meta: {
      title: '机构管理'
    }
  },
  {
    path: '/js/a/sys/company/list',
    component: () => import('@/views/management/dict'),
    name: 'company',
    meta: {
      title: '公司管理'
    }
  },
  {
    path: '/js/a/sys/post/list',
    component: () => import('@/views/management/post'),
    name: 'post',
    meta: {
      title: '岗位管理'
    }
  },
  {
    path: 'listData',
    component: () => import('@/views/management/role'),
    name: 'role',
    meta: {
      title: '角色管理'
    }
  },
  {
    path: 'secAdmin',
    component: () => import('@/views/management/config'),
    name: 'secAdmin',
    meta: {
      title: '二级管理员'
    }
  }
]
export default router
