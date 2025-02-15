import Vue from 'vue'
import Vuex from 'vuex'

import getters from './getters'
import app from './modules/app'
// dynamic router permission control (Experimental)
// 动态路由模式（api请求后端生成）
import permission from './modules/async-router'
// default router permission control
// 默认路由模式为静态路由 (router.config.js)
// import permission from './modules/static-router'
import user from './modules/user'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    user,
    permission
  },
  state: {},
  mutations: {},
  actions: {},
  getters
})
