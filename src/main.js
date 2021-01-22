import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'

Vue.config.productionTip = false

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 添加axios请求拦截器来添加token，以保证拥有获取数据的权限
axios.interceptors.request.use(config => {
  // console.log(config)
  // 最后必须return
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

// Vue.use(ElementUI)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
