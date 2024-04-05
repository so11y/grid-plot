import { createApp } from 'vue'
import './style.css'
import MuchNode from './demo/MuchNode.vue'
import PPT from './demo/PPT.vue'
import Tree from './demo/Tree.vue'
import Excalidraw from './demo/Excalidraw.vue'

import Antd from 'ant-design-vue';
// import 'ant-design-vue/dist/antd.css';

// var app = createApp(MuchNode)
// var app = createApp(App)
var app = createApp(Excalidraw)
// var app = createApp(Tree)
app.use(Antd);
app.mount('#app')
