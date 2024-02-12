import { createApp } from 'vue'
import './style.css'
import App from './demo/App.vue'
import MuchNode from './demo/MuchNode.vue'
import PPT from './demo/PPT.vue'
import Excalidraw from './demo/Excalidraw.vue'

import Antd from 'ant-design-vue';
// import 'ant-design-vue/dist/antd.css';

// var app = createApp(App)
// var app = createApp(MuchNode)
// var app = createApp(App)
var app = createApp(Excalidraw)
app.use(Antd);
app.mount('#app')
