import { uniqueId, keys } from 'lodash'
import utils from '@/utils'
import router, { createRoutesInLayout, routesOutLayout,asyncRoutes, resetRouter } from '@/router'

export default context => {
  /**
   * 给菜单数据补充上 path 字段
   * https://github.com/d2-projects/d2-admin/issues/209
   * @param {Array} menu 原始的菜单数据
   */
  function supplementPath (menu) {
    return menu.map(e => ({
      ...e,
      path: e.path || uniqueId('d2-menu-empty-'),
      ...e.children ? {
        children: supplementPath(e.children)
      } : {}
    }))
  }
  /**
   * @description 检查一个菜单是否有子菜单
   * @param {Object} item 接口返回菜单中的一项原始数据
   */
  function hasRouteChildren (item = {}, keyname = 'childList') {
    return utils.helper.hasChildren(item, keyname) && item[keyname].reduce((count, menu) => menu.menuType == context.env.VUE_APP_DICT_MENU_TYPE_MENU ? ++count : count, 0) > 0
  }
  /**
   * @description 从接口返回的数据中计算出菜单
   * @param {Array} menuSource 接口返回的原始菜单数据
   */
  function getMenus (menuSource) {
    /**
     * @description 检验是否为合法菜单
     * @param {Object} sourceItem 原始数据的一项
     */
    function isEffectiveMenu (sourceItem) {
      if (sourceItem.menuType != context.env.VUE_APP_DICT_MENU_TYPE_MENU) return
      if (sourceItem.isShow != context.env.VUE_APP_DICT_VISIBLE_TRUE) return
      if (sourceItem.menuName == '') return
      return true
    }
    /**
     * @description 依次处理原始数据，返回处理后的菜单
     * @param {Array} menus 上次处理返回的结果
     * @param {Object} sourceItem 原始数据的一项
     */
    function maker (menus, sourceItem) {
      if (!isEffectiveMenu(sourceItem)) return menus
      let menu = {}
      menu.title = sourceItem.menuName
      menu.icon = sourceItem.menuIcon
      menu.path = sourceItem.menuUrl
      if (hasRouteChildren(sourceItem)) menu.children = sourceItem.childList.reduce(maker, [])
      menus.push(menu)
      return menus
    }
    return menuSource.reduce(maker, [])
  }
  /**
   * @description 从接口返回的数据中计算出权限列表
   * @param {Array} menuSource 接口返回的原始菜单数据
   */
  function getPermissions (menuSource) {
    /**
     * @description 检验是否为合法权限
     * @param {Object} sourceItem 原始数据的一项
     */
    function isEffectivePermission (sourceItem) {
      if (sourceItem.menuType != context.env.VUE_APP_DICT_MENU_TYPE_BUTTON) return
      if (sourceItem.permission == '') return
      return true
    }
    /**
     * @description 依次处理原始数据，返回处理后的权限列表
     * @param {Array} permissions 上次处理返回的结果
     * @param {Object} sourceItem 原始数据的一项
     */
    function maker (permissions, sourceItem) {
      if (isEffectivePermission(sourceItem)) permissions.push(sourceItem.permission)
      if (utils.helper.hasChildren(sourceItem)) permissions = permissions.concat(sourceItem.childList.reduce(maker, []))
      return permissions
    }
    return menuSource.reduce(maker, [])
  }
  /**
   * @description 从接口返回的数据中计算出路由【 现有接口限制，现在只能根据path匹配 】
   * @param {Array} menuSource 接口返回的原始菜单数据
   * @param {Array} routes 前端维护的路由表
   */
  function getRoutes(menuSource,routes){
    function isEffectiveMenuURL (sourceItem) {
      if (sourceItem.menuType != context.env.VUE_APP_DICT_MENU_TYPE_MENU) return
      if (sourceItem.isShow != context.env.VUE_APP_DICT_VISIBLE_TRUE) return
      if (sourceItem.menuUrl == '') return
      return true
    }
    function maker (menus, sourceItem) {
      if (hasRouteChildren(sourceItem)) sourceItem.childList.reduce(maker, menus)
      if(isEffectiveMenuURL(sourceItem))
        menus.push(sourceItem.menuUrl);
      return menus
    }
    const menuUrls = menuSource.reduce(maker, [])


    return routes.filter(function(item){
      return menuUrls.includes(item.path);
    })
  }
  
  return {
    namespaced: true,
    state: {
      // 是否已经加载
      isLoaded: false,
      // 用户权限
      permissions: []
    },
    actions: {
      /**
       * @description 加载用户菜单
       * @param {Object} vuex context
       * @param {Object} payload focus {Boolean} 强制重新加载动态路由 此项有值的时候加载状态校验跳过
       * @param {Object} payload to {String} 动态路由加载完成后跳转的页面
       * @param {Object} payload data {Array} 手动设置数据源 用来人工模拟权限数据或者重置权限设置 此项有值的时候登陆状态校验跳过
       */
      async load ({ state, rootState, commit, dispatch }, { focus = false, to = '', data }) {
        // 取消请求 - 没有登录
        if (!data && !rootState.d2admin.user.isLogged) return
        // 取消请求 - 已经加载过动态路由
        if (!focus && state.isLoaded) return
        // 获取接口原始数据
        const source = data || await context.api.MENU_USER()
        // [ 权限 ] 计算权限列表
        state.permissions = getPermissions(source)
        // [ 菜单 ] 计算菜单
        const menus = supplementPath(getMenus(source))
        // [ 菜单 ] 设置顶栏菜单
        
        commit('d2admin/menu/headerSet', menus, { root: true })
        // [ 菜单 ] 设置侧边栏菜单
        
        commit('d2admin/menu/asideSet', menus.length>0?menus[0].children:menus, { root: true })
        // [ 路由 ] 计算路由
        const routes = createRoutesInLayout(getRoutes(source,asyncRoutes)).concat(routesOutLayout)
        // [ 路由 ] 重新设置路由
        resetRouter(routes)
        // [ 路由 ] 重新设置多标签页池
        commit('d2admin/page/init', routes, { root: true })
        // [ 标签页 ] 重新计算多标签页数据
        dispatch('d2admin/page/openedLoad', { filter: true }, { root: true })
        // [ 搜索 ] 初始化搜索数据
        commit('d2admin/search/init', menus, { root: true })
        // [ 路由 ] 重新访问        
        if (to) router.replace(to)
        // 标记已经加载过动态路由
        commit('isLoadedSet', true)
      },
      /**
       * @description 验证是是否包含权限
       * @param {Object} state state
       * @param {Object} payload {Array|String} need 需要的数据
       * @param {Object} payload {Boolean} all 是否需要全部包含
       */
      has ({ state }, { need = '', all = false } = {}) {
        return utils.helper[all ? 'allIn' : 'oneOf'](state.permissions, need)
      }
    },
    mutations: {
      /**
       * @description 设置动态路由加载状态
       * @param {Object} state state
       * @param {Boolean} value 是否已经加载动态路由
       */
      isLoadedSet (state, value) {
        state.isLoaded = value
      }
    }
  }
}
