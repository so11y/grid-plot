<template>
    <div class="canvas-wrap">
        <canvas id="myCanvas" width="1580" height="800" style="border: 0px solid"></canvas>
        <br>
        <div class="flex-column-wrap">
            <div class="flex-column">
                <a-input type="color" id="colorPick" />
                <a-button id="modifyFocusStroke">修改线段颜色</a-button>
                <input type="number" placeholder="圆角" id="radiusModify" :step=".2">
                <!-- <a-button id="modifyFocusStroke">修改填充颜色</a-button>
                <a-button id="modifyFocusStroke">修改圆角</a-button>
                <a-button id="modifyFocusStroke">修改线段颜色</a-button>
                <a-button id="modifyFocusStroke">修改线段颜色</a-button>
                <a-button id="modifyFocusStroke">修改线段颜色</a-button> -->
            </div>
            <div class="flex-column">
                <a-button id="moveTop">上移</a-button>
                <a-button id="moveBottom">下移</a-button>
                <a-button id="moveLeft">左移</a-button>
                <a-button id="moveRight">右移</a-button>
            </div>
            <div class="flex-column">
                <a-button id="createLineByClick">连续点击Line(折线)</a-button>
                <a-button id="createLineByClickMove">按住移动Line(自由画笔)</a-button>
                <a-button id="createLineByClickMove2">按住移动Line(直线)</a-button>
                <a-button id="createImgByClick">点击创建图片Img</a-button>
                <a-button id="createRectByClick">点击创建矩形Rect元素</a-button>
                <a-button id="createCircleByClick">点击创建矩形Cicle元素</a-button>
                <a-button id="removeFocusNode">删除当前元素</a-button>
                <a-button id="copyFocusNode">复制当前元素</a-button>
            </div>
            <div class="flex-column">
                <a-button id="addCtrlPnt">添加单个控制点</a-button>
                <a-button id="clearCtrlPnt">清除控制点</a-button>
                <a-button id="addBbox">添加包围盒形变</a-button>
            </div>
            <div class="flex-column">
                <a-button id="selectArea">框选区域</a-button>
                <a-button id="topAlign">顶部对齐</a-button>
                <a-button id="leftAlign">左对齐</a-button>
                <a-button id="horizonalAlign">水平对齐</a-button>
                <a-button id="verticalAlign">垂直对齐</a-button>
                <a-button id="spaceAround">均匀分布SpaceAround</a-button>
                <a-button id="spaceBetween">均匀分布SpaceBetween</a-button>
            </div>
            <div class="flex-column">
                <a-button id="startTimer">开启Loop渲染</a-button>
                <a-button id="stopTimer">停止定时器</a-button>
            </div>
            <div class="flex-column">
                <a-button id="undo">撤 销</a-button>
                <a-button id="restore">恢 复</a-button>
                <a-button id="save">保存画布状态</a-button>
                <a-button id="loadData">加载数据</a-button>
            </div>
            <div class="flex-column">
                <a-button id="miniMapBtn">小地图导航</a-button>
                <a-button id="scaleRuler">比例尺</a-button>
            </div>
        </div>
    </div>
</template>
    
<script setup lang="ts">
import GridLine from "../GridLine";
import GridSystem from "../GridSystem";
import Feature from "../features/Feature";    
import Rect from "../features/basic-shape/Rect";
import Line from "../features/basic-shape/Line";
import Img from "../features/basic-shape/Img";
import Link from "../features/basic-shape/Link";
import Text from "../features/basic-shape/Text";
// import AnchorPnt from "../features/function-shape/AnchorPnt";
import Bbox from "../features/function-shape/Bbox";
import AutoSearchPath from "../AutoSearchPath";
import SelectArea from "../features/function-shape/SelectArea";
import Circle from "../features/basic-shape/Circle";
import MiniMap from "../MiniMap";
import Stack from "../Stack";
import { onMounted, ref, reactive, toRef } from "vue";
import ScaleRuler from "../ScaleRule";
import { message } from "ant-design-vue";

    // var tagArr = ref<string[]>(['LOL', 'Code', 'Computer', '宅']);

onMounted(()=>{
    
        let isShowMiniMap = false;
        let isShowScaleRuler = false;
        let canvas = document.querySelector("#myCanvas") as HTMLCanvasElement;
        let colorPick = document.querySelector("#colorPick") as HTMLElement;
        let modifyFocusStroke = document.querySelector("#modifyFocusStroke") as HTMLElement;
        let radiusModify = document.querySelector("#radiusModify") as HTMLElement;
        
        let createRectByClick = document.querySelector("#createRectByClick") as HTMLElement;
        let createCircleByClick = document.querySelector("#createCircleByClick") as HTMLElement;
        let createLineByClick = document.querySelector("#createLineByClick") as HTMLElement;
        let createLineByClickMove = document.querySelector("#createLineByClickMove") as HTMLElement;
        let createImgByClick = document.querySelector("#createImgByClick") as HTMLElement;
        let createLineByClickMove2 = document.querySelector("#createLineByClickMove2") as HTMLElement;
        let startTimer = document.querySelector("#startTimer") as HTMLElement;
        let stopTimer = document.querySelector("#stopTimer") as HTMLElement;
        let selectArea = document.querySelector("#selectArea") as HTMLElement;
        let topAlign = document.querySelector("#topAlign") as HTMLElement;
        let leftAlign = document.querySelector("#leftAlign") as HTMLElement;
        let horizonalAlign = document.querySelector("#horizonalAlign") as HTMLElement;
        let verticalAlign = document.querySelector("#verticalAlign") as HTMLElement;
        let spaceAround = document.querySelector("#spaceAround") as HTMLElement;
        let spaceBetween = document.querySelector("#spaceBetween") as HTMLElement;
        
        let addCtrlPnt = document.querySelector("#addCtrlPnt") as HTMLElement;
        let clearCtrlPnt = document.querySelector("#clearCtrlPnt") as HTMLElement;
        let addBbox = document.querySelector("#addBbox") as HTMLElement;
        

        let undo = document.querySelector("#undo") as HTMLElement;
        let restore = document.querySelector("#restore") as HTMLElement;
        let removeFocusNode = document.querySelector("#removeFocusNode") as HTMLElement;
        let copyFocusNode = document.querySelector("#copyFocusNode") as HTMLElement;

        let save = document.querySelector("#save") as HTMLElement;
        let loadData = document.querySelector("#loadData") as HTMLElement;
        let moveTop = document.querySelector("#moveTop") as HTMLElement;
        let moveBottom = document.querySelector("#moveBottom") as HTMLElement;
        let moveLeft = document.querySelector("#moveLeft") as HTMLElement;
        let moveRight = document.querySelector("#moveRight") as HTMLElement;

        let miniMapBtn = document.querySelector("#miniMapBtn") as HTMLElement;
        let scaleRuler = document.querySelector("#scaleRuler") as HTMLElement;
        
        let gls = new GridSystem(canvas);
        gls.enableStack();
        let gridLine = new GridLine();
        let miniMap:MiniMap|null = null;
        let ruler:ScaleRuler|null = null;
        function startTime() {
            gls.draw(true, () => {
                gridLine.draw(gls);
                miniMap && miniMap.draw();
                ruler && ruler.draw(gls);
            });
        }
        startTimer.onclick = startTime;
        startTime();

        miniMapBtn.onclick = ()=>{
            isShowMiniMap = !isShowMiniMap;
            if(isShowMiniMap){
                gls.extent = [750, 800, 750, 800]
                miniMap = new MiniMap(gls);
            }else {
                gls.extent = [Infinity,Infinity,Infinity,Infinity]
                miniMap && miniMap.destory();
                miniMap = null;
            }
        }

        scaleRuler.onclick = ()=>{
            isShowScaleRuler = !isShowScaleRuler;
            if(isShowScaleRuler){
                ruler = new ScaleRuler();
            }else {
                ruler = null;
            }
        }
        
        let feature = new Line([
            { x: 25, y: 0 },
            { x: 50, y: 50 },
            { x: 0, y: 50 },
        ]);
        feature.closePath = true;
        feature.onTranslate = ()=>{
            console.log(777);
        }
        gls.addFeature(feature);
        feature.translate(50);
        // console.log(feature.id, gls.findFeatureById(feature.id), "xunzh");

        let line = new Line([
            { x: 40, y: 90 },
            { x: 100, y: 150 },
            { x: 40, y: 200 },
        ]);
        line.closePath = false;
        line.lineWidth = .6
        gls.addFeature(line)
        // 5 gridSize  380

        // console.log(gls.getRatioSize(5/2), "gls.getRatioSize(5)");
        // // 75 一个单位    scale 10   gridSzie 5
        // // let rect = new Rect(1/4 * gls.getRatioSize(5), 1/4 * gls.getRatioSize(5), 1/2 * gls.getRatioSize(5), 1/2 * gls.getRatioSize(5))   // 5个单位长度
        // let rect = new Rect(50,50, 1/2 * gls.getRatioSize(5), 1/2 * gls.getRatioSize(5))   // 5个单位长度
        // rect.fillStyle = "rgba(0,0,0,.1)"
        // rect.radius = .5
        // gls.addFeature(rect);
        // let rect2 = new Rect(100,100, 1/2 * gls.getRatioSize(5), 1/2 * gls.getRatioSize(5))   // 5个单位长度
        // gls.addFeature(rect2);

        // let link = new Link(rect, rect2);
        // let rp = gls.getRelativePosByGridPos(2,2);
        // rect.setPos(rp.x, rp.y)
        
        // let rp = gls.getGridPosByRelativePos(rect.position.x, rect.position.y);
        // console.log(rp, "");
        

        // let searchPath = new AutoSearchPath({x: 2,y: 2}, {x: 10, y: 10});
        // let pathPoints = searchPath.getCoordList();
 
        // let index = 0;
        // setInterval(()=>{
        //     let pos = gls.getRelativePosByGridPos(pathPoints[index].x, pathPoints[index].y);
        //     rect.setPos(pos.x, pos.y)
        //     index++;
        // },1000)


        let text = new Text("测试文本",  500, 100, 150, 50, 5);
        text.fitSize = true;
        text.radius = .3
        gls.addFeature(text)

        let imgEle = new Image();
        imgEle.src = "/meigong1.png";
        imgEle.onload = () => {
            let img = new Img(imgEle,300, 100, 200, 120);
            // img.isFixedPos = true;
            img.radius = .5;
            img.isOverflowHidden = true;
            // gls.toCenter(img)
            // img.height = 50;
            // img.toFixedPos();
            // let angle = 35
            // setInterval(() => {
            //     angle+=.001
            // img.rotate(angle);
            // }, 1000)
            img.fillStyle = "rgba(255,255,255,.8)"
            // img.isOnlyHorizonalDrag = true;

            let rect2 = new Rect(10, 20, 50, 5);
            img.addChildren(rect2)

            gls.addFeature(img)


            let text2 = new Text("测试文本", 0, 0, 20, 10);
            text2.toFitSize()
            rect2.addChildren(text2)

            // let line = new Line([
            //     { x: 40, y: 90 },
            //     { x: 100, y: 150 },
            //     { x: 40, y: 200 },
            // ]);
            // line.closePath = false;
            // img.addChildren(line)

            // let link = new Link(img.children[0], text);

        }

        createRectByClick.onclick = () => {
            let rect1 = new Rect(0, 0, 50, 20);
            gls.click2DrawByClick(rect1, true)
        }

        createCircleByClick.onclick = ()=>{
            let circle = new Circle(700, 110, 45, 45);
            gls.click2DrawByClick(circle, true)
        }

        createLineByClick.onclick = () => {
            let line = new Line();
            gls.click2DrawByContinuousClick(line, true, true)
        }

        function click2DrawByMove() {
            let line = new Line();
            line.fillStyle = "#000"
            gls.click2DrawByMove(line, false, false, () => {
                click2DrawByMove();
            })
        }


        createLineByClickMove.onclick = click2DrawByMove;

        createLineByClickMove2.onclick = () => {
            let line = new Line();
            gls.click2DrawByMove(line, true, false)
        }


        createImgByClick.onclick = () => {
            let imgEle = new Image();
            imgEle.src = "/meigong1.png";
            imgEle.onload = () => {
                let img = new Img(imgEle, 0, 0, 50, 30);
                gls.click2DrawByClick(img, true)
            }
        }

        stopTimer.onclick = () => {
            cancelAnimationFrame(gls.timer);
        }

        modifyFocusStroke.onclick = () => {
            if (gls.focusNode) {
                gls.focusNode.strokeStyle = colorPick.value;
            }
        }

        addCtrlPnt.onclick = () => {
            if (gls.focusNode && gls.focusNode instanceof Line) {
                gls.setCtrlPnts(gls.focusNode);
                // gls.clearCtrlPos(feature);
            }else {
                message.info("单个控制点只能给线性元素添加")
            }
        }

        clearCtrlPnt.onclick = () => {
            if (gls.focusNode) {
                gls.clearCtrlPos(gls.focusNode);
            }
        }

        undo.onclick = () => {
            console.log(GridSystem.Stack);
            GridSystem.Stack?.undo();
        }
        restore.onclick = () => {
            GridSystem.Stack?.restore();
        }

        removeFocusNode.onclick = () => {
            if (gls.focusNode) {
                gls.removeFeature(gls.focusNode)
            }
        }

        copyFocusNode.onclick = ()=>{
            if (gls.focusNode) {
                gls.createFeature(gls.focusNode, {fillStyle: 'red', x: gls.focusNode.x + 30, y: gls.focusNode.y + 30})
            }
        }

        save.onclick = () => {
            gls.save();
        }
        loadData.onclick = () => {
            gls.loadData();
        }

        var sa:SelectArea|null = null;
        selectArea.onclick = () => {
            sa = new SelectArea();
        }
        topAlign.onclick = () => {
            sa && sa.toTopAlign(sa.featuresIn);
            sa?.destroy();
        }
        leftAlign.onclick = () => {
            sa && sa.toLeftAlign(sa.featuresIn);
            sa?.destroy();
        }
        horizonalAlign.onclick = () => {
            sa && sa.toHorizonalAlign(sa.featuresIn);
            sa?.destroy();
        }
        verticalAlign.onclick = () => {
            sa && sa?.toVerticalAlign(sa.featuresIn);
            sa?.destroy();
        }
        spaceAround.onclick = () => {
            sa && sa?.toSpaceAroud(sa.featuresIn);
            sa?.destroy();
        }
        spaceBetween.onclick = () => {
            sa && sa?.toSpaceBetween(sa.featuresIn);
            sa?.destroy();
        }
        

        moveTop.onclick = () => {
            gls.focusNode?.translate(0, -10)
        }
        moveBottom.onclick = () => {
            gls.focusNode?.translate(0, 10)
        }
        moveLeft.onclick = () => {
            gls.focusNode?.translate(-10, 0)
        }
        moveRight.onclick = () => {
            gls.focusNode?.translate(10, 0)
        }

        addBbox.onclick = ()=>{
            if (gls.focusNode) {
                gls.enableTranform(gls.focusNode, true)
            }
        }

        radiusModify.onclick = ()=>{
            if(gls.focusNode && gls.focusNode instanceof Rect){
                gls.focusNode.radius = radiusModify.value;
            }
        }
    })

// export default {
//     data() {
//         return {
//             // gls: {},
//         };
//     },
//     mounted() {
        
//     },
// };

</script>

<!-- <script>
  class Feature {
        constructor(){
            console.log("实例化Feature");
        }

        createRect(){
            return new CtrlPnt();
        }
    }

    class Rect extends Feature {

        constructor(){
            super();
            console.log(111);
        }


    }

    class CtrlPnt extends Rect {

        constructor(){
            super();
            console.log("实例化CtrlPnt");
        }

    }

    let feature = new Rect();
    let rect = feature.createRect();
    console.log(rect, "rect");
</script> -->
<style>
body {
    margin: 0;
}

.props-wrap {
    display: inline-block;
}

button,
input {
    margin: 5px 5px;
    width: 100%;
}

.flex-column {
    margin: 10px 20px;
    width: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column;
}

.flex-column-wrap {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
}

canvas {
    /* background-color: #000; */
}
</style>