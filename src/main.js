import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
// 树形表格插件
import TreeTable from 'vue-table-with-tree-grid'
// 富文本编辑器组件
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 添加axios请求拦截器来添加token，以保证拥有获取数据的权限
axios.interceptors.request.use(config => {
  // console.log(config)
  // 最后必须return
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
Vue.use(VueQuillEditor)
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

// Vue.use(ElementUI)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
