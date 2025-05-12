import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { naive } from './plugins/naive-ui'
import 'leaflet/dist/leaflet.css' // 引入 Leaflet 樣式
import 'leaflet.markercluster/dist/MarkerCluster.css' // 引入 MarkerCluster 樣式
import 'leaflet.markercluster/dist/MarkerCluster.Default.css' // 引入 MarkerCluster 預設樣式
import '@/assets/css/base.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(naive)

app.mount('#app')
