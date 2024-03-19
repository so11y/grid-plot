<template>
    <div class="app-container">
        <div class="top-toolbar">
            <a-row type="flex" align="middle">
                <div :class="['icon-wrap', { 'active': activeI === 0 }]" @click="onSelectTool(8)" title="锁定状态">
                    <i class="iconfont gls-xuanze"></i>
                </div>
                <a-divider type="vertical"></a-divider>
                <div :class="['icon-wrap subscript', { 'active': activeI === 0 }]" @click="onSelectTool(0)" title="区域选择">
                    <i class="iconfont gls-kuangxuan"></i>
                    <!-- <ul class="list-wrap hover-tab">
                        <li @click.stop="onSelectTool(0, 'rect')">
                            <a-row type="flex" align="middle">
                                <i class="iconfont gls-kuangxuan" style="margin-right: 4px;"></i> <span>矩形</span>
                            </a-row>
                        </li>
                    </ul> -->
                </div>
                <div :class="['icon-wrap subscript', { 'active': activeI === 1 }]" @click="onSelectTool(1)" title="单击创建矩形">
                    <i class="iconfont gls-zhengfangxing"></i>
                </div>
                <div :class="['icon-wrap subscript', { 'active': activeI === 2 }]" @click="onSelectTool(2)" title="单击创建圆">
                    <i class="iconfont gls-yaunxing"></i>
                </div>
                <div :class="['icon-wrap subscript', { 'active': activeI === 3 }]" @click="onSelectTool(3)"
                    title="连续点击创建折线">
                    <i class="iconfont gls-zhixian"></i>
                </div>
                <div :class="['icon-wrap subscript', { 'active': activeI === 4 }]" @click="onSelectTool(4)" title="自由画笔">
                    <i class="iconfont gls-huabi"></i>
                    <ul class="list-wrap hover-tab">
                        <li @click.stop="onSelectTool(4, true)">
                            <a-row type="flex" align="middle">
                                <i class="iconfont gls-jiguangbi" style="margin-right: 4px;"></i> <span>激光笔</span>
                            </a-row>
                        </li>
                    </ul>
                </div>
                <div :class="['icon-wrap subscript', { 'active': activeI === 5 }]" @click="onSelectTool(5)" title="单击创建文本">
                    <i class="iconfont gls-wenzi"></i>
                </div>
                <div :class="['icon-wrap subscript', { 'active': activeI === 6 }]" @click="onSelectTool(6)"
                    title="单击创建图片, 可上传图片或者svg">
                    <i class="iconfont gls-tupian"></i>
                </div>
                <div :class="['icon-wrap subscript', { 'active': activeI === 7 }]" @click="onSelectTool(7)" title="网格背景">
                    <i class="iconfont gls-wanggeguan"></i>
                </div>
                <div :class="['icon-wrap subscript', { 'active': activeI === 7 }]" @click="onSelectTool(8)" title="网格吸附">
                    <i class="iconfont gls-zidongxifu"></i>
                </div>
                <a-divider type="vertical"></a-divider>
                <div :class="['icon-wrap', { 'active': activeI === 8 }]" @click="onSelectTool(7)" title="更多工具">
                    <i class="iconfont gls-gengduogongju"></i>
                    <ul class="list-wrap hover-tab">
                        <li>123</li>
                    </ul>
                </div>
            </a-row>
        </div>
        <div class="props-tab">
            <div class="icon-wrap gengduo" @click="isShowSide = !isShowSide">
                <i class="iconfont gls-gengduo"></i>
            </div>
            <div class="props-page" v-if="isShowSide" style="margin-right: 15px">
                <ul class="list-wrap">
                    <li @click="onImportFile"><i class="iconfont gls-xiazai" /> 打开 </li>
                    <li @click="onSaveFile"><i class="iconfont gls-xiazai" /> 保存到...</li>
                    <li @click="onShowPreview"><i class="iconfont gls-daochutupian" /> 导出图片...</li>
                    <li @click="isShowHelp = true"><i class="iconfont gls-bangzhu" /> 帮助</li>
                    <li @click="reset(true)"><i class="iconfont gls-shanchu" /> 重置画布</li>
                    <!-- <li @click="darkTheme"><i class="iconfont gls-shanchu" /> 深色模式</li> -->
                    <a-divider type="horizonal"></a-divider>
                    <li @click="linkTo('https://littlesunnn.github.io/')"><i class="iconfont gls-github" /> GitHub</li>
                    <li @click="linkTo('https://space.bilibili.com/436686692?spm_id_from=333.788.0.0')"><i
                            class="iconfont gls-bilibili" /> 关注up实时进展...</li>
                    <a-divider type="horizonal"></a-divider>
                    <li class="canvas-bg">
                        <div class="title">画布背景</div>
                        <a-row type="flex" align="middle" class="func-wrap">
                            <a-button size="small" style="background-color: #ffc9c9"
                                @click="() => { gls && (gls.backgroundColor = '#ffc9c9') }"></a-button>
                            <a-button size="small" style="background-color: #b2f2bb"
                                @click="() => { gls && (gls.backgroundColor = '#b2f2bb') }"></a-button>
                            <a-button size="small" style="background-color: #a5d8ff"
                                @click="() => { gls && (gls.backgroundColor = '#a5d8ff') }"></a-button>
                            <a-button size="small" style="background-color: #ffec99"
                                @click="() => { gls && (gls.backgroundColor = '#ffec99') }"></a-button>
                            <a-divider type="vertical"></a-divider>
                            <input type="color" class="color-picker" ref="color-picker"
                                @input="(e: any) => { gls && (gls.backgroundColor = e.target.value) }" />
                        </a-row>
                    </li>
                </ul>
            </div>
            <div class="props-page props-setting" v-if="isShowSide">
                <ul class="list-wrap">
                    <li>
                        <div class="title">描边色</div>
                        <a-row type="flex" align="middle" class="func-wrap">
                            <a-button size="middle" style="background-color: #e03131"
                                @click="modifyStrokeStyle('#e03131')"></a-button>
                            <a-button size="middle" style="background-color: #2f9e44"
                                @click="modifyStrokeStyle('#2f9e44')"></a-button>
                            <a-button size="middle" style="background-color: #1971c2"
                                @click="modifyStrokeStyle('#1971c2')"></a-button>
                            <a-button size="middle" style="background-color: #f08c00"
                                @click="modifyStrokeStyle('#f08c00')"></a-button>
                            <a-divider type="vertical"></a-divider>
                            <input type="color" class="color-picker" ref="color-picker"
                                @input="(e: any) => { modifyStrokeStyle(e.target.value) }" />
                        </a-row>
                    </li>
                    <li>
                        <div class="title">背景色</div>
                        <a-row type="flex" align="middle" class="func-wrap">
                            <a-button size="middle" style="background-color: #ffc9c9"
                                @click="modifyFillStyle('#ffc9c9')"></a-button>
                            <a-button size="middle" style="background-color: #b2f2bb"
                                @click="modifyFillStyle('#b2f2bb')"></a-button>
                            <a-button size="middle" style="background-color: #a5d8ff"
                                @click="modifyFillStyle('#a5d8ff')"></a-button>
                            <a-button size="middle" style="background-color: #ffec99"
                                @click="modifyFillStyle('#ffec99')"></a-button>
                            <a-divider type="vertical"></a-divider>
                            <input type="color" class="color-picker" ref="color-picker"
                                @input="(e: any) => { modifyFillStyle(e.target.value) }" />
                        </a-row>
                    </li>
                    <li>
                        <div class="title">描边宽度</div>
                        <a-row type="flex" align="middle" class="func-wrap">
                            <a-button style="background-color: hsl(240 25% 96%)" @click="modifyLineWidth(.1)" title="细">
                                <i class="iconfont gls-xi-zhixian"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" @click="modifyLineWidth(.5)" title="粗">
                                <i class="iconfont gls-zhong-zhixian"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" @click="modifyLineWidth(1)" title="特粗">
                                <i class="iconfont gls-cu-zhixian"></i>
                            </a-button>
                            <a-divider type="vertical"></a-divider>
                            <a-slider id="test" :step=".1" :min=".1" :max="2" v-model:value="props.lineWidth"
                                style="width: 100px;" @change="(e: any) => modifyLineWidth(e)" />
                        </a-row>
                    </li>
                    <li>
                        <div class="title">边框样式</div>
                        <a-row type="flex" align="middle" class="func-wrap">
                            <a-button style="background-color: hsl(240 25% 96%)" @click="() => { modifyBorderStyle([]) }"
                                title="实线">
                                <i class="iconfont gls-xi-zhixian"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)"
                                @click="() => { modifyBorderStyle([5, 12]) }" title="虚线">
                                <i class="iconfont gls-xuxian"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)"
                                @click="() => { modifyBorderStyle([5, 20]) }" title="特虚">
                                <i class="iconfont gls-xuxian1"></i>
                            </a-button>
                            <a-divider type="vertical"></a-divider>
                            <a-slider id="test" :step="1" :min="1" :max="30" v-model:value="props.lineWidth"
                                style="width: 100px;" @change="(e: any) => modifyBorderStyle([5, e])" />
                        </a-row>
                    </li>
                    <li>
                        <div class="title">圆角大小</div>
                        <a-row type="flex" align="middle" class="func-wrap">
                            <a-button style="background-color: hsl(240 25% 96%)" @click="modifyRadius(0)" title="直角">
                                <i class="iconfont gls-zhijiao"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" @click="modifyRadius(0.5)" title="圆角">
                                <i class="iconfont gls-yuanjiao"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%);visibility: hidden;" title="圆角">
                            </a-button>
                            <a-divider type="vertical"></a-divider>
                            <a-slider id="test" v-model:value="props.radius" :step=".1" :min="0" :max="1"
                                style="width: 100px;" @change="(e: any) => modifyRadius(e)" />
                        </a-row>
                    </li>
                    <li>
                        <div class="title">透明度</div>
                        <a-slider id="test" v-model:value="props.opacity" :step=".1" :min=".1" :max="2"
                            @change="(e: any) => modifyOpacity(e)" />
                    </li>
                    <li>
                        <div class="title">图层</div>
                        <a-row type="flex" align="middle" class="func-wrap">
                            <a-button style="background-color: hsl(240 25% 96%)" title="置于顶层"
                                @click="gls?.toMaxIndex(gls.getFocusNode() as BasicFeature); message.info('置于顶层')">
                                <i class="iconfont gls-zhiyudingceng"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" title="上移一层"
                                @click="gls?.toPlusIndex(gls.getFocusNode() as BasicFeature);; message.info('上移一层')">
                                <i class="iconfont gls-shangyiyiceng"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" title="下移一层"
                                @click="gls?.toMinusIndex(gls.getFocusNode() as BasicFeature);; message.info('下移一层')">
                                <i class="iconfont gls-xiayiyiceng"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" title="置于底层"
                                @click="gls?.toMinIndex(gls.getFocusNode() as BasicFeature); message.info('置于底层')">
                                <i class="iconfont gls-zhiyudiceng"></i>
                            </a-button>
                        </a-row>
                    </li>
                    <li>
                        <div class="title">对齐</div>
                        <a-row type="flex" align="middle" class="func-wrap" style="margin-bottom: 8px">
                            <a-button style="background-color: hsl(240 25% 96%)" title="左对齐" @click="toLeftAlign">
                                <i class="iconfont gls-zuoduiqi"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" title="垂直对齐" @click="toVerticalAlign">
                                <i class="iconfont gls-chuizhijuzhongduiqi"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" title="右对齐" @click="toRightAlign">
                                <i class="iconfont gls-youduiqi"></i>
                            </a-button>
                        </a-row>
                        <a-row type="flex" align="middle" class="func-wrap" style="margin-bottom: 8px">
                            <a-button style="background-color: hsl(240 25% 96%)" title="顶对齐" @click="toTopAlign">
                                <i class="iconfont gls-dingduiqi"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" title="水平对齐" @click="toHorizonalAlign">
                                <i class="iconfont gls-shuipingjuzhongduiqi"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" title="底对齐" @click="toBottomAlign">
                                <i class="iconfont gls-diduiqi"></i>
                            </a-button>
                        </a-row>
                        <a-row type="flex" align="middle" class="func-wrap">
                            <a-button style="background-color: hsl(240 25% 96%)" title="水平-弹性布局"
                                @click="toSpacebetween(AlignType.HORIZONAL)">
                                <i class="iconfont gls-chuizhi-flex"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" title="垂直-弹性布局"
                                @click="toSpacebetween(AlignType.VERTICAL)">
                                <i class="iconfont gls-shuiping-flex"></i>
                            </a-button>
                        </a-row>
                    </li>
                    <li>
                        <div class="title">操作</div>
                        <a-row type="flex" align="middle" class="func-wrap">
                            <a-button style="background-color: hsl(240 25% 96%)" title="复制"
                                @click="gls?.focusNode && gls?.recordFeature(gls.focusNode as BasicFeature); message.info('复制了')">
                                <i class="iconfont gls-fuzhi"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" title="删除"
                                @click="gls?.removeFeature(gls.getFocusNode()); gls?.enableBbox(gls.getFocusNode()); message.info('删除了')">
                                <i class="iconfont gls-shanchu"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" title="是否闭合"
                                @click="gls?.focusNode && (gls.focusNode.closePath = !gls.focusNode.closePath)">
                                <i class="iconfont gls-bihe"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" title="合并为组"
                                @click="gls?.focusNode && (gls.focusNode.closePath = !gls.focusNode.closePath)">
                                <i class="iconfont gls-hebing"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" title="同步缩放" @click="setTranformChild">
                                <i class="iconfont gls-scale-same"></i>
                            </a-button>
                        </a-row>
                        <a-row type="flex" align="middle" class="func-wrap">
                            <a-button style="background-color: hsl(240 25% 96%)" title="复制为图片到剪贴板"
                                @click="copyImageToClipboard()">
                                <i class="iconfont gls-fuzhitupian"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" title="复制为SVG到剪贴板"
                                @click="copySvgToClipboard()">
                                <i class="iconfont gls-SVG"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" title="水平翻转"
                                @click="revert(AlignType.HORIZONAL)">
                                <i class="iconfont gls-zuoyoufanzhuan"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" title="垂直翻转"
                                @click="revert(AlignType.VERTICAL)">
                                <i class="iconfont gls-shangxiafanzhuan"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" title="复制样式" @click="copyStyle()">
                                <i class="iconfont gls-copy"></i>
                            </a-button>
                            <a-button style="background-color: hsl(240 25% 96%)" title="粘贴样式" @click="modifyStyle()">
                                <i class="iconfont gls-paste"></i>
                            </a-button>

                        </a-row>
                    </li>
                </ul>
            </div>
        </div>
        <canvas id="myCanvas" width="1580" height="880" ref="cvs"></canvas>
        <a-modal v-model:open="isShowSaveImage" title="保存为图片" width="80vw">
            <a-row type="flex" justify="center">
                <img alt="" id="preview-img" width="80%">
            </a-row>
            <template #footer>
                <a-button key="submit" type="primary" @click="onSaveImg">下载图片</a-button>
                <a-button key="back" @click="isShowSaveImage = false">关 闭</a-button>
            </template>
        </a-modal>
        <a-modal v-model:open="isShowHelp" title="帮助" width="50vw">
            <div class="list-of-instructions">
                <h4 class="title">源码地址: </h4>
                <a-alert type="success">
                    <template #message>
                        <a href="https://github.com/littlesunnn/grid-plot.git" target="_blank"
                            title="点击跳转github">https://github.com/littlesunnn/grid-plot.git</a> (欢迎star)
                    </template>
                </a-alert>
                <h4 class="title">基本操作: </h4>
                <ul>
                    <li>1.鼠标左键点击用于选择元素, 右键移动可以拖动画布, 滚轮缩放画布大小</li>
                    <li>2.创建矩形,圆形, 文本, 图片, 鼠标左键点击创建</li>
                    <li>3.创建折线, 鼠标左键点击创建, 右键点击结束绘制</li>
                    <li>4.创建自由画笔, 鼠标左键移动绘制, 松开后还会继续绘制, 右键点击结束绘制</li>
                </ul>
                <br />
                <div style="width: 50%" class="list-wrap">
                    <h4 class="title">快捷键列表: </h4>
                    <a-row type="flex" justify="space-between" class="row">
                        <span>删除元素</span> <a-tag>Del</a-tag>
                    </a-row>
                    <a-row type="flex" justify="space-between" class="row">
                        <span>撤销</span>
                        <div><a-tag>Ctrl</a-tag><a-tag>Z</a-tag></div>
                    </a-row>
                    <a-row type="flex" justify="space-between" class="row">
                        <span>恢复</span>
                        <div><a-tag>Ctrl</a-tag><a-tag>Y</a-tag></div>
                    </a-row>
                    <a-row type="flex" justify="space-between" class="row">
                        <span>合并为组(使用区域选择框选多个元素)</span>
                        <div><a-tag>Ctrl</a-tag><a-tag>U</a-tag></div>
                    </a-row>
                </div>
            </div>
            <template #footer>
                <a-button key="back" @click="isShowHelp = false">关 闭</a-button>
            </template>
        </a-modal>
        <div class="update-time">
            <a-row type="flex" align="middle">
                <span style="margin-right: 10px;">最后更新时间: {{ env.BUILD_TIME }}</span>
                <a-button style="width: 34px;height: 34px;padding: 0;line-height: 34px;" @click="isShowHelp = true"><i
                        class="iconfont gls-bangzhu" style="font-size: 20px"></i></a-button>
            </a-row>
        </div>
        <a-row class="stack-wrap">
            <a-row style="border-radius: 7px;overflow: hidden;margin-right: 10px;">
                <button @click="gls?.zoomTo(gls.scale - 1)"><i class="iconfont gls-jianhao"></i></button>
                <button style="border-radius: 0;width: 55px">缩放</button>
                <button @click="gls?.zoomTo(gls.scale + 1)"><i class="iconfont gls-jiahao"></i></button>
            </a-row>
            <a-row style="border-radius: 7px;overflow: hidden;">
                <button @click="GridSystem.Stack?.undo()"><i class="iconfont gls-chexiao" /></button>
                <button @click="GridSystem.Stack?.restore()"><i class="iconfont gls-huifu" /></button>
            </a-row>
        </a-row>
    </div>
</template>
    
<script lang="ts" setup>
import { AlignType, Events } from "@/Constants";
import Circle from "@/features/basic-shape/Circle";
import Img from "@/features/basic-shape/Img";
import Line from "@/features/basic-shape/Line";
import Rect from "@/features/basic-shape/Rect";
import Text from "@/features/basic-shape/Text";
import Feature from "@/features/Feature";
import SelectArea from "@/features/function-shape/SelectArea";
import Group from "@/features/function-shape/Group";
import GridLine from "@/GridLine";
import { randomNum } from "@/utils";
import { message } from "ant-design-vue";
import { nextTick, onMounted, reactive, ref, toRef, toRefs } from "vue";
import { DrawAreaMode } from "../Constants";
// import GridLine from "../GridLine";
import GridSystem from "../GridSystem";
import { BasicFeature } from "@/Interface";

const cvs = ref(null);
const rPanel = ref(null);
const activeI = ref(-1);
const isShowSide = ref(false);
const props = ref<Partial<Feature & Rect & Line>>({
    opacity: 1,
    lineWidth: .2,
    radius: 0,
});
let gl: GridLine | null = new GridLine();
let sa: SelectArea | null | undefined = null;
let gls: GridSystem | null;
const isShowPropTab = ref(false);
const copyStyles = ref({});
const isShowSaveImage = ref(false);
const isShowHelp = ref(false);
const globalStrokeColor = ref("")
const globalBorderStyle = ref([])
const env = import.meta.env;
onMounted(() => {
    reset();
    gl = new GridLine();
    // document.addEventListener(Events.RIGHT_CLICK, (e: any) => {
    //     isShowRightClickPanel.value = true;
    //     nextTick(()=>{
    //         rPanel.value.style.left = e.detail.clientX + "px";
    //         rPanel.value.style.top = e.detail.clientY + "px";
    //     })
    // })
})

let cb: any;
function onSelectTool(index = 0, param?: any) {
    if (activeI.value === index) {
        activeI.value = -1
    }
    if (cb) { cb(false); cb = null };
    switch (index) {
        case 0: // 选择区域
            message.info("按住左键移动吧!")
            let sa = gls?.enableSelectArea() as SelectArea;
            sa && (sa.drawMode = DrawAreaMode.RECT);
            // console.log(111);
            break;
        case 1: // 单击创建Rect
            message.info("点击画布创建吧!")
            let rect = new Rect(0, 0, 50, 20);
            rect.name = '你好'
            cb = gls?.click2DrawByClick(rect)
            break;
        case 2: // 单击创建Circle
            message.info("点击画布创建吧!")
            let circle = new Circle(0, 0, 50, 50);
            cb = gls?.click2DrawByClick(circle)
            break;
        case 3: // 点击创建Line
            message.info("点击画布创建吧!")
            let line = new Line();

            console.log(globalBorderStyle.value, "globalBorderStyle.value");

            line.lineDashArr = globalBorderStyle.value;
            cb = gls?.click2DrawByContinuousClick(line)
            break;
        case 4: // 自由笔
            message.info("点击移动绘制吧!")
            if (cb) { cb(); cb = null; return };
            function click2DrawByMove() {
                let line = new Line();
                line.isFreeStyle = true;
                line.strokeStyle = globalStrokeColor.value || "red"
                line.hoverStyle = "#666"
                line.focusStyle = "#666"
                cb = gls?.click2DrawByMove(line, !!param, () => {
                    line.strokeStyle = globalStrokeColor.value || "red"
                    click2DrawByMove();
                })
            }
            click2DrawByMove();
            break;
        case 5: // 选择区域
            var txt = prompt("请输入文字", "测试文字");
            if (txt) {
                message.info("点击画布创建吧!")
                let text = new Text(txt as string, 0, 0, 20, 10);
                text.fitSize = true;
                gls?.click2DrawByClick(text)
            }

            break;
        case 6: // 选择区域
            window.showOpenFilePicker().then((res: any) => {
                if (res[0].kind === 'file') {
                    const reader = new FileReader();
                    res[0].getFile().then((file: any) => {
                        reader.readAsDataURL(file);
                    })
                    reader.onload = function () {
                        message.info("点击画布创建吧!")
                        let img = new Img(reader.result as string, 0, 0);
                        gls?.click2DrawByClick(img)
                    }
                }
            });
            break;
        case 7: // 选择区域
            gl ? gl = null : gl = new GridLine()
            break;
        case 8: // 选择区域
            if (gls) {
                gls.cbAdsorption = !gls.cbAdsorption;
            }
            break;
        default:
            break;
    }
    if (activeI.value < 0) {
        return
    }
    activeI.value = index;
}

const previewImg = ref('')
function onSaveImg() {
    if (previewImg.value) {
        // 创建一个隐藏的<a>元素用于下载  
        var downloadLink = document.createElement('a');
        downloadLink.href = previewImg.value;
        downloadLink.download = 'canvas-image.png'; // 设置下载文件名  

        // 将<a>元素添加到DOM中，并模拟点击事件  
        document.body.appendChild(downloadLink);
        downloadLink.click();

        // 从DOM中移除<a>元素  
        document.body.removeChild(downloadLink);
    }
}

function onShowPreview() {
    isShowSaveImage.value = true;
    setTimeout(() => {
        if (gls) {
            var base64 = gls.dom.toDataURL("image/png");
            let img = document.getElementById("preview-img") as HTMLImageElement;
            img.src = base64;
            previewImg.value = base64;
        }
    }, 1000);
}

function onSaveFile() {
    if (gls?.features && gls.features.length <= 0) {
        return message.warning("没有元素,保存啥?")
    }
    let str = gls?.save();
    const text = JSON.stringify(str)
    const blob = new Blob([text], {
        type: "text/plain;charset=utf-8"
    })
    // 根据 blob生成 url链接
    const objectURL = URL.createObjectURL(blob)
    const domElement = document.createElement('a')
    domElement.href = objectURL;
    domElement.download = `${new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString()}.gls`
    domElement.click()
    URL.revokeObjectURL(objectURL)
}
function onImportFile() {
    window.showOpenFilePicker().then((res: any) => {
        if (res[0].kind === 'file') {
            const reader = new FileReader();
            res[0].getFile().then((file: any) => {
                reader.readAsText(file);
            })
            reader.onload = function () {
                let features = JSON.parse(JSON.parse(reader.result as string))
                gls?.loadData(features);
            }
        }
    });
}

function darkTheme() {

}

function startTime(gls: GridSystem) {
    gls.draw(true, () => {
        gl && gl.draw(gls)
    });
}

function reset(clear = false) {
    if (clear) localStorage.setItem("features", '');
    if (gls) {
        gls.destroy();
        gls = null;
    }
    let canvasDom = cvs.value as unknown as HTMLCanvasElement;
    gls = new GridSystem(canvasDom);
    // gls.loadData();
    setCanvasSize(canvasDom);
    startTime(gls as GridSystem);

    let rect = new Rect(100, 100, 100, 100)
    rect.radius = 2;
    rect.rotate(60)
    // rect.isFixedPos = true;
    // rect.fillStyle = "transparent"
    // rect.isOverflowHidden = true;
    gls.addFeature(rect, false)

    const text = new Text(`当内容
特别多的时候，canvas不会自动
换行，canvas需要特别处理当\n内容特别多的时候，canvas不会自动换行`, 460, 100, 200, 50);
    text.fitSize = true;
    text.radius = 2
    // text.rotate(30)
    gls.addFeature(text, false);
    // rect.addFeature(text);

    let rect2 = new Rect(150, 150, 50, 50)
    rect2.fillStyle = "transparent"
    gls.addFeature(rect2, false)

    // let rect4 = new Rect(350, 200, 50, 50);
    // // rect4.isFixedSize = true;
    // gls.addFeature(rect4, false)
    // const text2 = new Text("测试文本", 350, 200);
    // text.fitSize = true;
    // gls.addFeature(text2, false);
    // rect4.addFeature(text2, { cbSelect: false })
    // rect4.rotate(45)

    let circle = new Circle(280, 180, 30, 30)
    gls.addFeature(circle, false)

    // var line = new Line([
    //     { x: 10, y: 10 },
    //     { x: 0, y: 80 },
    //     { x: 100, y: 120 },
    // ])
    // line.radius = 20;
    // // line.rotate(30)
    // line.translate(200)
    // gls.addFeature(line, false)

    var line = new Line([
        { x: 10, y: 10 },
        { x: 0, y: 80 },
        { x: 100, y: 120 },
    ])
    // line.closePath = true;
    line.radius = 4;
    // line.rotate(30)
    line.translate(200)
    // line.enableCtrlPnts();
    gls.addFeature(line, false)


    let img = new Img("/img2.png", 400, 100);
    gls.addFeature(img, false)

    // 合并为组
    let group = new Group([rect, rect2, circle]);
    // group.rotate(60)
    group.translate(100)
    group.cbTransformChild = true;
    gls.addFeature(group, false)
    rect.name = "bigrect"
    // rect.onMousemove = () => {
    //     console.log(222);
    // }
    // group.onMousemove = () => {
    //     console.log(11);
    // }
    // group.resizeEvents.push(group.toSpaceBetween.bind(group, group.children, AlignType.HORIZONAL))

    // line.cbTransform = false;
    // const text2 = new Text("测试文本", 60, 80, 100, 10);
    // // text2.fitSize = true;
    // gls.addFeature(text2, false);
    // line.addFeature(text2, false);
    // line.enableCtrlPnts();

    // console.log(group, rect, rect2);

    // setTimeout(() => {
    //     gls.removeFeature(rect4)
    // }, 1000);

    // img.fillStyle = "transparent"
    // img.rotate(20)
    gls.enableStack();
}

function linkTo(url: string) {
    window.open(url);
}

function setCanvasSize(canvasDom: HTMLCanvasElement) {
    canvasDom.width = document.documentElement.clientWidth - 4;
    canvasDom.height = document.documentElement.clientHeight - 4;

    window.onresize = () => {
        canvasDom.width = document.documentElement.clientWidth - 4;
        canvasDom.height = document.documentElement.clientHeight - 4;
    }
}

function toTopAlign() {
    let sa = gls?.features.find(f => f instanceof SelectArea || f instanceof Group) as SelectArea;
    sa && sa.toTopAlign();
    message.info('顶对齐');
}
function toBottomAlign() {
    let sa = gls?.features.find(f => f instanceof SelectArea || f instanceof Group) as SelectArea;
    sa && sa.toBottomAlign();
    message.info('底对齐');
}
function toRightAlign() {
    let sa = gls?.features.find(f => f instanceof SelectArea || f instanceof Group) as SelectArea;
    sa && sa.toRightAlign();
    message.info('右对齐');
}
function toLeftAlign() {
    let sa = gls?.features.find(f => f instanceof SelectArea || f instanceof Group) as SelectArea;
    sa && sa.toLeftAlign();
    message.info('左对齐');
}
function toHorizonalAlign() {
    let sa = gls?.features.find(f => f instanceof SelectArea || f instanceof Group) as SelectArea;
    sa && sa.toHorizonalAlign();
    message.info('水平对齐');
}
function toVerticalAlign() {
    let sa = gls?.features.find(f => f instanceof SelectArea || f instanceof Group) as SelectArea;
    sa && sa.toVerticalAlign();
    message.info('垂直对齐');
}
function toSpacebetween(flexFLow = AlignType.HORIZONAL) {
    let sa = gls?.features.find(f => f instanceof SelectArea || f instanceof Group) as SelectArea;
    // sa && sa.toSpaceAroud();
    sa && sa.toSpaceBetween(sa.children, flexFLow);
    message.info('均匀分布');
}


function modifyStrokeStyle(color: string) {
    globalStrokeColor.value = color;
    let focuseNode = gls?.getFocusNode();
    if (focuseNode) {
        focuseNode.strokeStyle = color;
    }
}

function modifyFillStyle(color: string) {
    let focuseNode = gls?.getFocusNode();
    if (focuseNode) {
        focuseNode.fillStyle = focuseNode.hoverStyle = focuseNode.focusStyle = color;
    }
}

function modifyBorderStyle(arr: number[]) {
    let focuseNode = gls?.getFocusNode();
    if (focuseNode) {
        focuseNode.lineDashArr = arr;
    }
}

function modifyLineWidth(width: number) {
    let focuseNode = gls?.getFocusNode();
    if (focuseNode) {
        focuseNode.lineWidth = width;
    }
}

function modifyRadius(radius: number) {
    let focuseNode = gls?.getFocusNode();
    if (focuseNode && focuseNode instanceof Rect) {
        focuseNode.radius = radius;
    }
}

function modifyOpacity(opacity: number) {
    let focuseNode = gls?.getFocusNode();
    if (focuseNode) {
        console.log(opacity, "opacity");

        focuseNode.opacity = opacity;
    }
}

function setTranformChild() {
    let focuseNode = gls?.getFocusNode();
    if (focuseNode) {
        focuseNode.cbTransformChild = !focuseNode.cbTransformChild;
        console.log(focuseNode.cbTransformChild, "focuseNode.cbTransformChild");
    }
    message.info('同步缩放');
}

function copyImageToClipboard() {
    let focuseNode = gls?.getFocusNode();
    if (focuseNode && gls) {
        gls.copyImageToClipboard(focuseNode).then(blob => {
            let reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = (res) => {
                window.open('', '_blank')?.document.write(`<html><body><img src='${res.target?.result}'></body></html>`);
            }
        })
    }
    message.info('已复制为图片到剪贴板');
}

function copySvgToClipboard() {
    let focuseNode = gls?.getFocusNode();
    if (focuseNode && gls) {
        gls.copySvgToClipboard(focuseNode).then(res => {
            window.open('', '_blank')?.document.write(res);
        })
    }
    message.info('已复制为SVG到剪贴板');
}

function revert(direction: AlignType) {
    let focuseNode = gls?.getFocusNode();
    if (focuseNode && gls) {
        focuseNode.revert(direction)
    }
    message.info('镜像翻转');
}

function copyStyle() {
    let focuseNode = gls?.getFocusNode();
    if (focuseNode && gls) {
        copyStyles.value = gls.recordFeature(focuseNode, true);
    }
    message.info('复制样式');
}

function modifyStyle() {
    let focuseNode = gls?.getFocusNode();
    if (focuseNode && gls) {
        copyStyles.value = gls.modifyFeature(focuseNode, copyStyles.value);
    }
    message.info('粘贴样式');
}


</script>

<style scoped lang="less">
body {
    // width: 100vw;
    // height: 100vh;
}

canvas {
    // border: 1px solid;
}

.app-container {
    position: relative;
    font-family: "glsfont";
    overflow: hidden;

    .top-toolbar {
        position: absolute;
        left: 50%;
        top: 20px;
        padding: 0 10px;
        transform: translateX(-50%);
        background: #fff;
        box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, .17), 0px 0px 3px 0px rgba(0, 0, 0, .08), 0px 7px 14px 0px rgba(0, 0, 0, .05);
        border-radius: 8px;
        color: #676767;
    }

    .props-tab {
        position: absolute;
        left: 20px;
        top: 20px;

        .props-page {
            margin-top: 10px;
            border-radius: 10px;
            padding: 5px;
            float: left;
            // width: 180px;
            background-color: rgba(250, 250, 250, .95);
            box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, .17), 0px 0px 3px 0px rgba(0, 0, 0, .08), 0px 7px 14px 0px rgba(0, 0, 0, .05);

            .list-wrap {
                font-size: 14px;

                li {
                    padding: 8px 15px;
                    border-radius: 5px;
                    color: #333;
                    margin: 5px 0;
                    cursor: pointer;

                    &:hover {
                        background-color: rgba(222, 230, 237, .5);
                    }

                    &>i {
                        margin-right: 4px;
                    }
                }

                li.canvas-bg {
                    button {
                        width: 20px;
                        height: 20px;
                        margin-right: 5px;

                    }

                    .color-picker {
                        width: 20px;
                        height: 20px;
                        padding: 0px;
                    }
                }
            }
        }

        .title {
            font-size: 12px;
            margin-bottom: 6px;
        }

        .props-setting {
            // margin-left: 15px;


            .list-wrap {
                li {
                    padding: 4px 10px;

                    &:hover {
                        background-color: transparent;
                    }
                }
            }

            .func-wrap {
                display: flex;
                margin-top: 8px;

                button {
                    margin-right: 12px;
                    width: 32px;
                    height: 32px;
                    padding: 0;

                    i {
                        font-size: 20px;
                    }
                }

                .color-picker {
                    display: inline-block;
                    width: 32px;
                    height: 32px;
                    border: 1px solid #d9d9d9;
                    border-radius: 5px;
                    margin-left: 5px;
                    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.02);
                }

                // .icon-wrap {
                //     background-color: rgba(192, 202, 210, .5);
                //     &:hover {
                //         background-color: rgba(192, 202, 210, 1);
                //     }
                // }
            }
        }
    }

    .icon-wrap {
        width: 25px;
        height: 25px;
        padding: 5px;
        margin: 5px 10px;
        margin-left: 0;
        cursor: pointer;
        text-align: center;
        line-height: 25px;
        border-radius: 5px;

        &.subscript {
            position: relative;
            counter-increment: chapter;

            &:after {
                content: ". " counter(chapter);
                /* 使用counters函数获取当前计数值并显示 */
                /* 递增计数器 */
                position: absolute;
                right: 0px;
                bottom: -2px;
                font-size: 12px;
                font-weight: lighter;
                color: #000;
            }
        }

        i {
            font-size: 22px;
        }

        &:hover {
            background-color: #C6E2F8;
        }

        &.active {
            background-color: #5DB5F9;
        }

        &.gengduo {
            position: relative;
            z-index: 100;
            border-radius: 6px;
            background-color: rgba(192, 202, 210, .5);
            box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, .17), 0px 0px 3px 0px rgba(0, 0, 0, .08), 0px 7px 14px 0px rgba(0, 0, 0, .05);

            &:hover {
                background-color: rgba(192, 202, 210, 1);
            }
        }

        &:hover {
            &>.hover-tab {
                padding: 4px 7px;
                width: 80px;
                display: inline-block;
            }

            li:hover {
                background-color: rgba(192, 202, 210, .5);
            }
        }

        .hover-tab {
            background-color: #fff;
            border-radius: 5px;
            // border: 1px solid #d9d9d9;
            box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, .17), 0px 0px 3px 0px rgba(0, 0, 0, .08), 0px 7px 14px 0px rgba(0, 0, 0, .05);
            display: none;
            margin-top: 20px;
            padding: 10px;
        }
    }

    .right-click-panel {
        position: fixed;
        left: 0;
        top: 0;
        z-index: 1000;
    }

    .update-time {
        position: fixed;
        right: 5px;
        bottom: 5px;
        color: #999;
        font-size: 12px;
        // background-color: #fff;
        padding: 5px 10px;
        border-radius: 5px;
    }

    .stack-wrap {
        position: fixed;
        left: 10px;
        bottom: 10px;
        color: #999;
        font-size: 12px;

        i {
            font-size: 23px;
        }

        button {
            line-height: 34px;
            padding: 0 0px;
            width: 45px;
            height: 34px;
            border: none;
            background-color: #ececf4;
            border-radius: 0;

            &:hover {
                background-color: rgb(224, 224, 243);
            }
        }
    }
}

.list-of-instructions {
    .list-wrap {
        .row {
            border-bottom: 1px solid rgba(240, 240, 240, 1);
            padding: 5px;
            margin: 5px 0;
        }
    }

}
</style>