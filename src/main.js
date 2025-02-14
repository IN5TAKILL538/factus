import { createApp } from 'vue'
import './style.css'
import { createPinia } from 'pinia'


import { Quasar } from 'quasar'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from './App.vue'

import router from './router/router.js'

const myApp = createApp(App)
const pinia =createPinia()


myApp.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
})
.use(pinia)

// Assumes you have a <div id="app"></div> in your index.html
.use(router)
myApp.mount('#app')

