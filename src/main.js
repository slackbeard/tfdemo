import Vue from 'vue'
import VueMaterial from 'vue-material'

import App from './App.vue'
import router from './router'

import './styles/main.scss'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

import * as tf from '@tensorflow/tfjs'

Vue.config.productionTip = false
Vue.use(VueMaterial);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
