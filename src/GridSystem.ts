import { CoordinateSystem, FontFamily, Events, Orientation } from "./Constants";
import Feature from "./features/Feature";
import Line from "./features/basic-shape/Line";
import Rect from "./features/basic-shape/Rect";
import AdsorbPnt from "./features/function-shape/AdsorbPnt";
import { BasicFeature, IPoint, Props } from "./Interface";
import Stack from "./Stack";
import { getMidOfTwoPnts, getMousePos, swapElements } from "./utils";
import gsap from "gsap";
import { fontMap } from "./Maps";
import Shortcuts from "./Shortcuts";
import Img from "./features/basic-shape/Img";
import Text from "./features/basic-shape/Text";
import Bbox from "./features/function-shape/Bbox";
import Circle from "./features/basic-shape/Circle";
import SelectArea from "./features/function-shape/SelectArea";
import AnchorPnt from "./features/function-shape/AnchorPnt";
import Group from "./features/function-shape/Group";

class GridSystem {
    static Gls: GridSystem;
    static Stack: Stack | null;
    static Bbox: Bbox | null;
    static Shortcuts: Shortcuts | null;
    static lastAndPrevMouseMovePoint = {
        last_p: { x: 0, y: 0 },
        prev_p: { x: 0, y: 0 },
    }

    className = 'GridSystem';
    scale: number = 10;
    angle: number = 0;
    pageSlicePos: IPoint = {
        x: 200,
        y: 200,
    };
    firstPageSlicePos: IPoint = Object.freeze({
        x: this.pageSlicePos.x,
        y: this.pageSlicePos.y
    });  // 首次渲染时候的pagePos
    extent: [number, number, number, number] = [Infinity, Infinity, Infinity, Infinity]  // 限制画布拖拽范围: 上右下左,顺时针  测试 750, 800, 750, 800;
    mousePos = {
        x: 0,
        y: 0
    }

    dom: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    timer: number = 0;
    backgroundColor: string = '#fff'

    hoverNode: Feature | null | undefined;  // 获取焦点的元素, 如果是null ，那就是画布
    focusNode: Feature | null | undefined;  // 获取焦点的元素, 如果是null ，那就是画布
    features: Feature[] = [];  // 所有元素的集合

    dragEndTransition: boolean | number = 2.3;  // 画布拖拽松开是否过渡，时间大于零表示过渡时间
    dragingSensitivity: number = 1.5;   // 拖拽时候的灵敏度, 建议 0 ~ infinity
    lastClickTime: number = 0;  // 用于双击
    focusedTransform = true;   // 获取焦点时就增加包围盒形变

    cbOverlap: boolean = true;  // 元素间是否可重叠
    cbScale: boolean = true; // 画布是否可调节缩放
    cbDragBackground: boolean = true;  // 画布是否可被拖拽
    cbSelectFeature: boolean = true;  // 画布中的元素是否可被选中
    cbAdsorption: boolean = false;  // 元素拖拽是否启用吸附
    cbDragOutScreen: boolean = true; // 是否可被移动到屏幕外
    cbDrawMiniFeature: boolean = true; // 是否渲染太小的元素，因为画布缩放的原因, 提升渲染效率
    cbDrawOutScreen: boolean = true;  // 元素在屏幕外时是否绘制， 因为画布拖拽, 提升渲染效率

    // 提供的事件
    ondrag: Function = () => { };
    onzoom: Function = () => { }  // 画布缩放时，触发
    onmousedown: Function = () => { };
    onmousemove: Function = () => { };
    onmouseup: Function = () => { };
    ondbclick: Function = () => { };

    test: IPoint = { x: 0, y: 0 }

    constructor(canvasDom: HTMLCanvasElement, isMain: boolean = true) {
        // 当前 canvas 的 0 0 坐标，我们设置 canvas 左上角顶点为 0 0，向右👉和向下👇是 X Y 轴正方向，0，0 为 pageSlicePos 初始值
        isMain && (GridSystem.Gls = this, Feature.Gls = this);
        this.dom = canvasDom;
        this.ctx = this.dom.getContext('2d') || new CanvasRenderingContext2D();
        this.initEventListener();
    }

    draw(loop = true, fn?: Function) {
        // console.time();
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        // this.ctx.rotate(30 * Math.PI/180)
        fn && fn()
        this.drawFeatures();
        // this.ctx.fillStyle = "red"
        // this.ctx.fillRect(this.test.x, this.test.y, 5, 5);
        // this.ctx.rotate(-30 * Math.PI/180)
        // console.timeEnd();
        if (loop) {  // 是否循环渲染
            // this.timer = setInterval(() => {this.draw(loop, fn)})
            this.timer = window.requestAnimationFrame(() => this.draw(loop, fn))
        }
    };

    // --------------------以下是私有的方法----------------------------
    // --------------------绘制元素，以及鼠标事件监听----------------------------
    drawFeatures(features: Feature[] = this.features) {
        features.forEach(f => {
            if (f.hidden) return;
            let pointArr = f.pointArr.map(p => this.getPixelPos(p, f.isFixedPos))
            if (!this.cbDrawMiniFeature) {  // 是否渲染太小的元素，因为画布缩放的原因
                let [minX, maxX, minY, maxY] = f.getRectWrapExtent(pointArr);
                if (Math.abs(maxX - minX) < 30 && Math.abs(maxY - minY) < 30) {
                    return
                }
            }
            if (!this.cbDragOutScreen) { // 是否渲染屏幕外的元素
                if (pointArr.every(p => {
                    return p.x < 0 || p.x > this.ctx.canvas.width || p.y < 0 || p.y > this.ctx.canvas.height
                })) return
            }
            Feature.TargetRender = this;
            let lineWidth = this.getRatioSize(f.lineWidth);
            this.ctx.save();
            let path;
            if (f instanceof Rect) {
                let radius = this.getRatioSize(f.radius);
                path = f.draw(this.ctx, pointArr, lineWidth, radius)
            } else {
                path = f.draw(this.ctx, pointArr, lineWidth);
            }
            f.ondraw && f.ondraw()
            // f.isOverflowHidden && this.ctx.clip(path);
            this.ctx.restore();
        })
    }

    initEventListener() {
        this.dom.addEventListener("mousemove", this.mouseMove);
        this.dom.addEventListener("mousedown", this.mouseDown);
        this.dom.addEventListener("mousewheel", this.mouseWheel);
        this.dom.addEventListener("contextmenu", (e) => { // 禁用右键上下文
            e.preventDefault();
        });
        GridSystem.Shortcuts = new Shortcuts();
        GridSystem.Shortcuts.addEvent('del', () => {
            this.removeFeature(this.getFocusNode(), true)
            this.enableBbox(null)
        })
        GridSystem.Shortcuts.addEvent(["shift", "z"], () => GridSystem.Stack && GridSystem.Stack.undo.bind(this))
        GridSystem.Shortcuts.addEvent(["shift", "y"], () => GridSystem.Stack && GridSystem.Stack.restore.bind(this))
    }

    private mouseMove = (e: any) => {
        this.onmousemove && this.onmousemove(e);
        const pos = getMousePos(this.dom, e);
        this.mousePos.x = pos.x;
        this.mousePos.y = pos.y;
        document.dispatchEvent(new CustomEvent(Events.MOUSE_MOVE, { detail: e }));
    }

    private mouseDown = (ev: any) => {
        const curPageSlicePos = {
            x: this.pageSlicePos.x,
            y: this.pageSlicePos.y,
        }
        document.dispatchEvent(new CustomEvent(Events.MOUSE_DOWN, { detail: ev }));
        this.onmousedown && this.onmousedown(ev);
        const { x: downX, y: downY } = getMousePos(this.dom, ev);
        const { x: px, y: py } = this.pageSlicePos;
        let focusNode = this.focusNode = this.features.slice().reverse().find(f => f.cbSelect && f.cbMove && f.isPointIn);  // 寻找鼠标悬浮元素
        let lastMovePos = { x: 0, y: 0 }   // 记录上一次鼠标移动的坐标
        let moveFlag = false;
        var mousemove = (e: any) => { };
        if (ev.buttons != 1) {
            this.focusNode = focusNode;
        } else {  // 左键点击
            focusNode?.onmousedown && focusNode.onmousedown();
            if (!(focusNode instanceof Bbox) && this.focusedTransform && this.cbSelectFeature && !(this.isCtrlFeature(focusNode))) {  // 点击了就加控制点,没点击就去除所有控制点
                this.enableBbox(null);
                if ((this.isBasicFeature(focusNode) || this.getFocusNode() instanceof SelectArea)) {
                    let bbox = this.enableBbox(focusNode as BasicFeature | SelectArea);
                    bbox && (focusNode = bbox);
                }
            };
            // 如果有区域选择,那么选择其他元素或者点击空白就清除SelectArea
            if (!(this.getFocusNode() instanceof SelectArea) && !this.isCtrlFeature(this.focusNode)) {
                this.enableSelectArea(false)
            }
        }
        if (focusNode && ev.buttons == 1) {  // 拖拽元素
            focusNode.isFocused = true;
            let pointArr = JSON.parse(JSON.stringify(focusNode.pointArr));
            let { x: dx, y: dy } = this.getRelativePos({ x: downX, y: downY }, focusNode.isFixedPos);
            function translateChild(children: Feature[], move: IPoint) {
                children.forEach(cf => {
                    cf.translate(move.x, move.y);
                    translateChild(cf.children, move)
                })
            }
            mousemove = (e: any) => {
                if (focusNode && focusNode.cbMove) {
                    const { x: moveX, y: moveY } = getMousePos(this.dom, e);
                    const { x: mx, y: my } = this.getRelativePos({ x: moveX, y: moveY }, focusNode.isFixedPos)
                    if (lastMovePos.x && lastMovePos.y) {  // 移动元素
                        // focusNode.translate(mx - lastMovePos.x, my - lastMovePos.y)
                        focusNode.pointArr.forEach((p, i) => {   // 拖动元素
                            if (!focusNode?.isOnlyVerticalDrag) {
                                p.x = pointArr[i].x + (mx - dx)
                            }
                            if (!focusNode?.isOnlyHorizonalDrag) {
                                p.y = pointArr[i].y + (my - dy)
                            };
                        })
                        translateChild(focusNode.children, { x: mx - lastMovePos.x, y: my - lastMovePos.y });   // 递归的移动所有子元素
                        if (this.cbAdsorption && focusNode.cbAdsorb) {  // 是否边缘吸附
                            let { x: offsetX, y: offsetY, orientations } = this.getAdsorbOffsetDist(focusNode, {
                                gridCompute: focusNode.adsorbTypes.includes("grid"),
                                featureCompute: focusNode.adsorbTypes.includes("feature"),
                                onlyCenter: focusNode.isOnlyCenterAdsorb
                            });
                            focusNode.translate(offsetX, offsetY)
                            focusNode._orientations = orientations;
                        }
                        moveFlag = true;
                    }
                    focusNode.ontranslate();
                    lastMovePos = { x: mx, y: my }
                }
            }
        } else if (this.cbDragBackground && ev.buttons == 2) {  // 判断是否左键拖拽画布
            mousemove = (e: any) => {
                GridSystem.lastAndPrevMouseMovePoint.prev_p = GridSystem.lastAndPrevMouseMovePoint.last_p;
                GridSystem.lastAndPrevMouseMovePoint.last_p = { x: e.clientX, y: e.clientY };
                this.ondrag && this.ondrag(e);
                const { x: moveX, y: moveY } = getMousePos(this.dom, e);
                this.pageSlicePos.x = px + (moveX - downX) * this.dragingSensitivity;
                this.pageSlicePos.y = py + (moveY - downY) * this.dragingSensitivity;
                this.setPageSliceByExtent(this.extent);
            }
        }

        var mouseup = (e: any) => {
            this.onmouseup && this.onmouseup(e);
            document.dispatchEvent(new CustomEvent(Events.MOUSE_UP, { detail: e }));
            if (focusNode) {
                focusNode.isFocused = false;
                focusNode._orientations = null;
                focusNode.onmouseup && focusNode.onmouseup();
                focusNode.ondragend && focusNode.ondragend();
                if (this.isBasicFeature(this.getFocusNode()) || this.getFocusNode() instanceof SelectArea && moveFlag) { // 修改时候记录,没移动的不记录
                    GridSystem.Stack && GridSystem.Stack.record();
                }
            }
            document.removeEventListener("mousemove", mousemove)
            document.removeEventListener("mouseup", mouseup);
            if (ev.buttons === 2 && this.pageSlicePos.x === curPageSlicePos.x && this.pageSlicePos.y === curPageSlicePos.y) {  // 判断右击
                document.dispatchEvent(new CustomEvent(Events.RIGHT_CLICK, { detail: ev }));
            }
        }
        document.addEventListener("mouseup", mouseup)
        document.addEventListener("mousemove", mousemove)
        // 判断双击事件
        if (new Date().getTime() - this.lastClickTime < CoordinateSystem.DB_CLICK_DURATION) {  // 如果是双击
            this.ondbclick && this.ondbclick(ev);
            document.dispatchEvent(new CustomEvent(Events.DB_CLICK, { detail: ev }));
        }
        this.lastClickTime = new Date().getTime();
    }

    /**
     * 网格吸附，获取吸附边缘的偏离值
     * @param feature 
     * @param options 
     * @returns 
     */
    private getAdsorbOffsetDist(feature: Feature, options = {
        gridCompute: false, featureCompute: false, onlyCenter: false
    }) {
        var gridSize = CoordinateSystem.GRID_SIZE;
        let offsetX = 0, offsetY = 0;
        let orientations = [];
        let [leftX, rightX, topY, bottomY] = feature.getRectWrapExtent();
        let { x: centerX, y: centerY } = feature.getCenterPos();

        // 吸附的约束，灵敏度
        let min = gridSize * .2;
        let max = gridSize * .8;

        function getDeviation(num: number): number {
            var gridSize = CoordinateSystem.GRID_SIZE;
            return (num / gridSize) % gridSize;
        }

        if (options.gridCompute) {
            //  ------------- 水平对齐
            if (!options.onlyCenter) {
                // 以元素左边为基准
                var offsetLeftX = getDeviation(leftX);
                if (offsetX == 0 && (offsetLeftX > 0 && offsetLeftX < min) || (offsetLeftX < 0 && offsetLeftX > -min)) {
                    offsetX = -leftX % gridSize;
                    orientations.push(Orientation.LEFT)
                }
                if (offsetX == 0 && (offsetLeftX > max && offsetLeftX < gridSize) || (offsetLeftX > -gridSize && offsetLeftX < -max)) {
                    offsetX = gridSize * (offsetLeftX > 0 ? 1 : -1) - leftX % gridSize;
                    orientations.push(Orientation.LEFT)
                }
                // 以元素右边为基准
                var offsetRightX = getDeviation(rightX);
                if (offsetX == 0 && (offsetRightX > 0 && offsetRightX < min) || (offsetRightX < 0 && offsetRightX > -min)) {
                    offsetX = -rightX % gridSize;
                    orientations.push(Orientation.RIGHT)
                }
                if (offsetX == 0 && (offsetRightX > max && offsetRightX < gridSize) || (offsetRightX > -gridSize && offsetRightX < -max)) {
                    offsetX = gridSize * (offsetRightX > 0 ? 1 : -1) - rightX % gridSize;
                    orientations.push(Orientation.RIGHT)
                }
            }
            // 以中心为基准
            var offsetCenterX = getDeviation(centerX);
            if (offsetX == 0 && (offsetCenterX > 0 && offsetCenterX < min) || (offsetCenterX < 0 && offsetCenterX > -min)) {
                offsetX = -centerX % gridSize;
                orientations.push(Orientation.CENTER_X)
            }
            if (offsetX == 0 && (offsetCenterX > max && offsetCenterX < gridSize) || (offsetCenterX > -gridSize && offsetCenterX < -max)) {
                offsetX = gridSize * (offsetCenterX > 0 ? 1 : -1) - centerX % gridSize;
                orientations.push(Orientation.CENTER_X)
            }

            // //  ------------- 垂直对齐
            // 以元素上边为基准
            if (!options.onlyCenter) {
                var offsetTopY = getDeviation(topY);
                if (offsetY == 0 && (offsetTopY > 0 && offsetTopY < min) || (offsetTopY < 0 && offsetTopY > -min)) {
                    offsetY = -topY % gridSize;
                    orientations.push(Orientation.TOP)
                }
                if (offsetY == 0 && (offsetTopY > max && offsetTopY < gridSize) || (offsetTopY > -gridSize && offsetTopY < -max)) {
                    offsetY = gridSize * (offsetTopY > 0 ? 1 : -1) - topY % gridSize;
                    orientations.push(Orientation.TOP)
                }
                // 以元素下边为基准
                var offsetBottomY = getDeviation(bottomY);
                if (offsetY == 0 && (offsetBottomY > 0 && offsetBottomY < min) || (offsetBottomY < 0 && offsetBottomY > -min)) {
                    offsetY = -bottomY % gridSize;
                    orientations.push(Orientation.BOTTOM)
                }
                if (offsetY == 0 && (offsetBottomY > max && offsetBottomY < gridSize) || (offsetBottomY > -gridSize && offsetBottomY < -max)) {
                    offsetY = gridSize * (offsetBottomY > 0 ? 1 : -1) - bottomY % gridSize;
                    orientations.push(Orientation.BOTTOM)
                }
            }

            var offsetCenterY = getDeviation(centerY);
            if (offsetY == 0 && (offsetCenterY > 0 && offsetCenterY < min) || (offsetCenterY < 0 && offsetCenterY > -min)) {
                offsetY = -centerY % gridSize;
                orientations.push(Orientation.CENTER_Y)
            }
            if (offsetY == 0 && (offsetCenterY > max && offsetCenterY < gridSize) || (offsetCenterY > -gridSize && offsetCenterY < -max)) {
                offsetY = gridSize * (offsetCenterY > 0 ? 1 : -1) - centerY % gridSize;
                orientations.push(Orientation.CENTER_Y)
            }
        }
        if (options.featureCompute) {
            min = gridSize * .1;
            max = gridSize * .9;
            // 元素间对其
            for (let index = 0; index < this.features.length; index++) {
                const f = this.features[index];
                if (f === feature) {
                    continue
                }
                let [left, right, top, bottom] = f.getRectWrapExtent();
                // let { left, right, top, bottom } = this.getEdgePoints(f);
                if (offsetX == 0) {
                    let hxs = [left, right, f.position.x]
                    hxs.forEach(hx => {
                        if (Math.abs(leftX - hx) < min * 10) {
                            if (leftX > hx) {
                                offsetX = -(leftX - hx);
                                orientations.push(Orientation.LEFT)
                            } else {
                                offsetX = (hx - leftX);
                                orientations.push(Orientation.LEFT)
                            }
                        }
                        if (Math.abs(rightX - hx) < min * 10) {
                            if (leftX > hx) {
                                offsetX = -(rightX - hx);
                                orientations.push(Orientation.RIGHT)
                            } else {
                                offsetX = (hx - rightX);
                                orientations.push(Orientation.RIGHT)
                            }
                        }
                        if (Math.abs(centerX - hx) < min * 10) {
                            if (leftX > hx) {
                                offsetX = -(centerX - hx);
                                orientations.push(Orientation.CENTER_X)
                            } else {
                                offsetX = (hx - centerX);
                                orientations.push(Orientation.CENTER_X)
                            }
                        }
                    })
                }
                if (offsetY == 0) {
                    let vys = [top, bottom, f.position.y]
                    vys.forEach(vy => {
                        if (Math.abs(topY - vy) < min * 15) {
                            if (topY > vy) {
                                offsetY = -(topY - vy);
                                orientations.push(Orientation.TOP)
                            } else {
                                offsetY = (vy - topY);
                                orientations.push(Orientation.TOP)
                            }
                        }
                        if (Math.abs(bottomY - vy) < min * 15) {
                            if (bottomY > vy) {
                                offsetY = -(bottomY - vy);
                                orientations.push(Orientation.BOTTOM)
                            } else {
                                offsetY = (vy - bottomY);
                                orientations.push(Orientation.BOTTOM)
                            }
                        }
                        if (Math.abs(centerY - vy) < min * 15) {
                            if (topY > vy) {
                                offsetY = -(centerY - vy);
                                orientations.push(Orientation.CENTER_Y)
                            } else {
                                offsetY = (vy - centerY);
                                orientations.push(Orientation.CENTER_Y)
                            }
                        }
                    })
                }
            }
        }
        return { x: offsetX, y: offsetY, orientations };
    }

    /**
     * 滚轮滚动事件,重绘网格
     * @param e 
     * @returns 
     */
    private mouseWheel = (e: any, scale?: number) => {
        if (!this.cbScale) return;
        let lastgridSize = this.getRatioSize(CoordinateSystem.GRID_SIZE);  // 上一次的gridSize大小
        this.onzoom && this.onzoom(e);
        e.preventDefault();
        let { x, y } = getMousePos(this.dom, e);
        if (e.wheelDelta > 0) {
            let nextScale = scale || this.scale + CoordinateSystem.SCALE_ABILITY
            if (nextScale > CoordinateSystem.MAX_SCALESIZE) {
                this.scale = CoordinateSystem.MAX_SCALESIZE
            } else {
                this.scale = nextScale;
                this.back2center(x, y, lastgridSize);
            }
        } else {
            let nextScale = scale || this.scale - CoordinateSystem.SCALE_ABILITY
            if (nextScale < CoordinateSystem.MIN_SCALESIZE) {
                this.scale = CoordinateSystem.MIN_SCALESIZE
            } else {
                this.scale = nextScale;
                this.back2center(x, y, lastgridSize);
            }
        }
        document.dispatchEvent(new CustomEvent(Events.MOUSE_WHEEL, { detail: e }));
    };

    // 以鼠标中心点位置去放大
    private back2center(x: number, y: number, lastgridSize: number) {
        var gridSize = this.getRatioSize(CoordinateSystem.GRID_SIZE);  // 当前单位大小
        var different = gridSize - lastgridSize;   // 当前单位大小与上一次单位大小之差
        this.pageSlicePos.x -= ((x - this.pageSlicePos.x) / lastgridSize) * different;
        this.pageSlicePos.y -= ((y - this.pageSlicePos.y) / lastgridSize) * different;
    }

    private setPageSliceByExtent(extent: number[] = []) { // 限制拖拽范围
        if (extent?.length > 0) {
            let topExtent = extent[0];
            let rightExtent = extent[1];
            let bottomExtent = extent[2];
            let leftExtent = extent[3];

            if (this.pageSlicePos.x > this.firstPageSlicePos.x + leftExtent) {
                this.pageSlicePos.x = this.firstPageSlicePos.x + leftExtent;
            }
            if (this.pageSlicePos.x < this.firstPageSlicePos.x - rightExtent) {
                this.pageSlicePos.x = this.firstPageSlicePos.x - rightExtent;
            }
            if (this.pageSlicePos.y > this.firstPageSlicePos.y + topExtent) {
                this.pageSlicePos.y = this.firstPageSlicePos.y + topExtent;
            }
            if (this.pageSlicePos.y < this.firstPageSlicePos.y - bottomExtent) {
                this.pageSlicePos.y = this.firstPageSlicePos.y - bottomExtent;
            }
        }
    }

    // --------------------以下是暴露的方法----------------------------
    // --------------------画布内元素的增删查API----------------------------
    removeFeature(f: Feature | string | undefined, isRecord = true) {
        if (!f) return;
        let feature: Feature | null | undefined = null;
        if (f instanceof Feature) {
            feature = f;
        } else {
            feature = this.features.find(ff => ff.id == f)
        }
        if (feature) {
            feature.destroy();
            feature.ondelete();
            this.features = this.features.filter(f => f != feature);
            feature = null;
            isRecord && GridSystem.Stack && GridSystem.Stack.record();  // 删除元素记录
        }
    }
    addFeature(feature: Feature, isRecord = true) {
        this.focusNode = feature;
        this.features.push(feature);
        if (!feature.zIndex) {
            let features = this.features.filter(f => !this.isCtrlFeature(f));  // 不是ctrlNode的元素重编 zIndex
            feature.zIndex = features.length;
            this.features.sort((a, b) => a.zIndex - b.zIndex);
        }
        isRecord && GridSystem.Stack && GridSystem.Stack.record();  // 新增元素记录
    }
    toMinusIndex(feature: BasicFeature) {
        let index = this.features.findIndex(f => f === feature);
        swapElements<Feature>(this.features, index, index - 1);
        this.resetIndex();
    }
    toPlusIndex(feature: BasicFeature) {
        let index = this.features.findIndex(f => f === feature);
        swapElements<Feature>(this.features, index, index + 1);
        this.resetIndex();
    }
    toMinIndex(feature: BasicFeature) {
        let index = this.features.findIndex(f => f === feature);
        this.features.splice(index, 1);
        this.features.unshift(feature);
        this.resetIndex();
    }
    // 将元素置顶，在画布最上层显示
    toMaxIndex(feature: BasicFeature) {
        let index = this.features.findIndex(f => f === feature);
        this.features.splice(index, 1);
        this.features.push(feature);
        this.resetIndex();
    }
    resetIndex() {
        let features = this.features.filter(f => this.isBasicFeature(f));
        features.forEach((f, i) => f.zIndex = i);
        this.features.sort((a, b) => a.zIndex - b.zIndex);
    }

    // 获取焦点元素, 但不是 CtrlPnt, BCtrlPnt, AnchorPnt
    getFocusNode() {
        if (this.focusNode) {
            if (this.focusNode instanceof Bbox) {
                return this.focusNode.children[0] as BasicFeature;
            }
            if (this.isCtrlFeature(this.focusNode)) {
                if (this.focusNode.parent instanceof Bbox) {   // bbox的ctrlNode
                    return this.focusNode.parent.parent as BasicFeature;
                } else {  // 比如线段的ctrlNode
                    return this.focusNode.parent as BasicFeature;
                }
            }
            return this.focusNode as BasicFeature;
        }
        return;
    }

    // ------------------ 获取像素，或相对坐标，宽度等-----------------
    getPixelPos(point: IPoint, isFixedPos?: boolean): IPoint {
        if (isFixedPos) {
            return point
        } else {
            return {
                x: this.pageSlicePos.x + (point.x / CoordinateSystem.GRID_SIZE) * this.scale,
                y: this.pageSlicePos.y + (point.y / CoordinateSystem.GRID_SIZE) * this.scale,
            };
        }
    }
    getPxielX(num: number) {
        return this.pageSlicePos.x + (num / CoordinateSystem.GRID_SIZE) * this.scale
    }
    getPxielY(num: number) {
        return this.pageSlicePos.y + (num / CoordinateSystem.GRID_SIZE) * this.scale
    }

    getRelativePos(point: IPoint, isFixedPos?: boolean): IPoint {
        if (isFixedPos) {
            return point
        } else {
            return {
                x: ((point.x - this.pageSlicePos.x) / this.scale) * CoordinateSystem.GRID_SIZE,
                y: ((point.y - this.pageSlicePos.y) / this.scale) * CoordinateSystem.GRID_SIZE,
            };
        }
    }
    getRelativeX(num: number = 0) {
        return ((num - this.pageSlicePos.x) / this.scale) * CoordinateSystem.GRID_SIZE
    }
    getRelativeY(num: number = 0) {
        return ((num - this.pageSlicePos.y) / this.scale) * CoordinateSystem.GRID_SIZE
    }

    // 获取像素长度， 比如获取元素的宽高
    getPixelLen(len: number) {
        return len * CoordinateSystem.GRID_SIZE;
    }
    getRelativeLen(len: number) {
        return len / CoordinateSystem.GRID_SIZE;
    }

    getRatioSize(size: number): number {  // 获取像素宽度， 比如lineWidth， fontSize, 随网格缩放而缩放
        return size * this.scale;
        // return size / this.scale;
    }

    // ------------------ 鼠标点击方式去创建元素-----------------
    click2DrawByClick(rect: Rect | Circle, fn?: Function) {
        this.addFeature(rect, false);
        let adsorbPnt = new AdsorbPnt(8, this.cbAdsorption);
        this.cbSelectFeature = false;
        var clear = (remove = true) => {
            this.cbSelectFeature = true;
            remove && this.removeFeature(rect, false);
            this.removeFeature(adsorbPnt, false);
            document.removeEventListener(Events.MOUSE_DOWN, click2draw);
            document.removeEventListener(Events.MOUSE_MOVE, move2draw);
            !remove && GridSystem.Stack && GridSystem.Stack.record();   // 修改时候记录
        }
        var click2draw = (e: any) => {
            if (e.detail.button === 0) {
                rect.setPos(adsorbPnt.position.x, adsorbPnt.position.y);
                clear(false);
                fn && fn();
            } else {
                throw "请用左键绘制!"
            }
        }
        var move2draw = () => {
            rect.setPos(adsorbPnt.position.x, adsorbPnt.position.y)
        }
        document.addEventListener(Events.MOUSE_DOWN, click2draw);
        document.addEventListener(Events.MOUSE_MOVE, move2draw);
        return clear;
    }

    // 鼠标点一下添加一个点去画折线
    click2DrawByContinuousClick(line: Line, fn?: Function) {
        this.cbSelectFeature = false;
        let adsorbPnt = new AdsorbPnt(8, this.cbAdsorption);
        var clear = (remove = true) => {
            this.cbSelectFeature = true;
            remove && this.removeFeature(line, false);
            this.removeFeature(adsorbPnt, false);
            document.removeEventListener(Events.MOUSE_DOWN, click2draw);
            document.removeEventListener(Events.RIGHT_CLICK, overDraw);
            document.removeEventListener(Events.MOUSE_MOVE, move2draw);
            !remove && GridSystem.Stack && GridSystem.Stack.record();   // 修改时候记录
        }
        var move2draw = (e: any) => {
            line.pointArr[line.pointArr.length - 1] = { x: adsorbPnt.position.x, y: adsorbPnt.position.y };
        }
        var click2draw = (e: any) => {
            if (e.detail.button === 0) {
                line.addPoint({ x: adsorbPnt.position.x, y: adsorbPnt.position.y }, false);
                if (line.pointArr.length == 1) {
                    line.addPoint({ x: adsorbPnt.position.x, y: adsorbPnt.position.y }, false);
                }
                this.addFeature(line, false);
                document.addEventListener(Events.MOUSE_MOVE, move2draw);
            } else {
                throw "请用左键绘制!"
            }
        }
        let overDraw = () => {
            clear(false);
            fn && fn();
        }
        document.addEventListener(Events.RIGHT_CLICK, overDraw);
        document.addEventListener(Events.MOUSE_DOWN, click2draw);
        return clear;
    }

    // 鼠标按住不放持续画线
    click2DrawByMove(line: Line, isLaserPen = false, fn?: Function) {
        this.cbSelectFeature = false;
        let adsorbPnt = new AdsorbPnt(8, this.cbAdsorption);
        let lastLineWidth = 0
        let lastTime = 0
        var clear = (remove = true) => {
            this.cbSelectFeature = true;
            remove && this.removeFeature(line, false);
            this.removeFeature(adsorbPnt, false);
            document.removeEventListener(Events.MOUSE_DOWN, click2draw);
            document.removeEventListener(Events.MOUSE_MOVE, move2draw);
            document.removeEventListener(Events.MOUSE_UP, overDraw);
            !remove && !isLaserPen && GridSystem.Stack && GridSystem.Stack.record();   // 修改时候记录
        }
        var move2draw = () => {
            let { x, y } = { x: adsorbPnt.position.x, y: adsorbPnt.position.y };
            line.addPoint({ x, y });
            if (line.pointArr.length > 1) {
                // 自由画笔的宽度计算
                let lineWidth = 0
                let diffx = x - line.pointArr[line.pointArr.length - 2].x
                let diffy = y - line.pointArr[line.pointArr.length - 2].y
                let distance = Math.pow(diffx * diffx + diffy * diffy, 0.5);

                let speed = distance / (Date.now() - lastTime) // 0.1 - 3
                if (speed >= Line.freeLineConfig.maxSpeed) {
                    lineWidth = Line.freeLineConfig.minWidth
                } else if (speed <= Line.freeLineConfig.minSpeed) {
                    lineWidth = Line.freeLineConfig.maxWidth
                } else {
                    lineWidth = Line.freeLineConfig.maxWidth - (speed / Line.freeLineConfig.maxSpeed) * Line.freeLineConfig.maxWidth
                }
                lineWidth = lineWidth * (1 / 3) + lastLineWidth * (2.8 / 3)
                lastLineWidth = lineWidth
                lastTime = Date.now();
                line.lineWidthArr.push(lineWidth);
            }
        }
        let overDraw = () => {
            if (isLaserPen) {  // 激光笔
                let timer = 0, timer2 = 0;
                timer = setTimeout(() => {
                    timer2 = setInterval(() => {
                        line.pointArr.shift();
                        if (line.pointArr.length <= 0) {
                            clearInterval(timer2)
                            clearTimeout(timer)
                            this.removeFeature(line, false);
                        }
                    }, 20)
                }, 350)
            }
            clear(false);
            fn && fn();
        }
        var click2draw = (e: any) => {  // 
            if (e.detail.button === 0) {
                let { x, y } = { x: adsorbPnt.position.x, y: adsorbPnt.position.y };
                line.addPoint({ x, y });
                document.addEventListener(Events.MOUSE_MOVE, move2draw);
                document.addEventListener(Events.MOUSE_UP, overDraw);
                this.addFeature(line, false);
            } else {
                throw "请用左键绘制!"
            }
        }
        // document.addEventListener(Events.MOUSE_UP, overDraw);
        document.addEventListener(Events.MOUSE_DOWN, click2draw);
        return clear;
    }


    // ----------------------其他功能性API------------------------
    /**
 * 根据一个点获取他周围的吸附距离
 * @param pnt 
 * @returns 
 */
    getAdsorbPos(pnt: IPoint) {
        var gridSize = CoordinateSystem.GRID_SIZE;
        let offsetX = 0, offsetY = 0;
        // 相对像素
        // 吸附的约束，灵敏度
        let min = gridSize * .4;
        let max = gridSize * .6;

        //  ------------- 水平对齐
        var diffX = getDeviation(pnt.x);
        if (offsetX == 0 && (diffX > 0 && diffX < min) || (diffX < 0 && diffX > -min)) {
            offsetX = -pnt.x % (gridSize * gridSize);
        }
        if (offsetX == 0 && (diffX > max && diffX < gridSize) || (diffX > -gridSize && diffX < -max)) {
            offsetX = (gridSize * gridSize) * (diffX > 0 ? 1 : -1) - pnt.x % (gridSize * gridSize);
        }
        //  ------------- 垂直对齐
        var diffY = getDeviation(pnt.y);
        if (offsetY == 0 && (diffY > 0 && diffY < min) || (diffY < 0 && diffY > -min)) {
            offsetY = -pnt.y % (gridSize * gridSize);
        }
        if (offsetY == 0 && (diffY > max && diffY < gridSize) || (diffY > -gridSize && diffY < -max)) {
            offsetY = (gridSize * gridSize) * (diffY > 0 ? 1 : -1) - pnt.y % (gridSize * gridSize);
        }

        return { x: offsetX, y: offsetY };

        function getDeviation(num: number): number {
            var gridSize = CoordinateSystem.GRID_SIZE;
            return (num / gridSize) % gridSize;
        }
    }

    // 判断是否时基础元素
    isBasicFeature(f?: Feature | null | undefined) {
        if (!f) return false;
        // return (f instanceof Rect || f instanceof Line || f instanceof Circle) && !(f instanceof AnchorPnt) && !(f instanceof CtrlPnt)
        return f.className == 'Img' || f.className == 'Line' || f.className == 'Rect' || f.className == 'Text' || f.className == 'Circle' || f.className == 'Group'
    }
    // 判断是否时控制点元素
    isCtrlFeature(f?: Feature | null | undefined) {
        if (!f) return false;
        return f.className == 'CtrlPnt' || f.className == 'BCtrlPnt' || f.className == 'AnchorPnt'
    }

    translate(offsetX: number = 0, offsetY: number = 0, duration = .25) {
        gsap.to(this.pageSlicePos, {
            duration,
            x: offsetX,
            y: offsetY,
            ease: "slow.out",
        })
        // this.pageSlicePos.x += offsetX;
        // this.pageSlicePos.y += offsetY;
    }

    // 加载字体
    loadFont(fontFamily: FontFamily) {
        const fontface = new FontFace(fontFamily, `url(${fontMap.get(fontFamily)})`);
        if (!document.fonts.has(fontface)) {
            fontface.load().then(function (loadFace) {
                console.log("字体加载完毕!");
                document.fonts.add(loadFace);
            });
        }
    }

    setCanvasSize(width?: number | null, height?: number | null) {
        if (width) this.ctx.canvas.width = width;
        if (height) this.ctx.canvas.height = height;
    }

    // 求点与canvas中心的距离
    getCenterDist(point: IPoint) {
        let canvasCenter = { x: this.dom.width / 2, y: this.dom.height / 2 }
        return {
            x: canvasCenter.x - point.x,
            y: canvasCenter.y - point.y
        }
    }
    // 获取中心点
    getCenterPoint() {
        let centerP = { x: this.dom.width / 2, y: this.dom.height / 2 };
        let canvasR = this.getRelativePos(centerP)
        return [centerP, canvasR]
    }

    // 缩放至 
    zoomTo(scale: number, point?: IPoint) {
        let lastgridSize = this.getRatioSize(CoordinateSystem.GRID_SIZE);  // 上一次的gridSize大小
        if (!point) point = this.getCenterPoint()[0]
        this.scale = scale;
        this.back2center(point.x, point.y, lastgridSize)
    }

    // // 判断某个网格内有没有元素
    // hasFeatureIngridPos(pool: Feature[], gx: number, gy: number): Feature | undefined {
    //     let target: Feature | undefined;
    //     for (let index = 0; index < pool.length; index++) {
    //         const block = pool[index];
    //         if (block.gridPos.x == gx && block.gridPos.y == gy) {
    //             target = block;
    //             break;
    //         }
    //     }
    //     return target;
    // }
    // 根据相对坐标获取网格坐标
    getGridPosByRelativePos(x: number, y: number): IPoint {
        let gridSize = CoordinateSystem.GRID_SIZE * CoordinateSystem.GRID_SIZE;  // 实际网格单元大小
        let gx = x / gridSize;
        let gy = y / gridSize;
        return { x: gx, y: gy }
    }
    // // 根据鼠标,像素坐标获取网格坐标
    // getGridPosByPixelPos(x: number, y: number): IPoint {
    //     let gridSize = CoordinateSystem.GRID_SIZE * this.scale;  // 实际网格单元大小
    //     let gx = x > this.pageSlicePos.x ? Math.ceil((x - this.pageSlicePos.x) / gridSize) : Math.floor((x - this.pageSlicePos.x) / gridSize);
    //     let gy = y > this.pageSlicePos.y ? Math.ceil((y - this.pageSlicePos.y) / gridSize) : Math.floor((y - this.pageSlicePos.y) / gridSize);
    //     return { x: gx, y: gy }
    // }
    // 根据网格坐标获取相对坐标
    getRelativePosByGridPos(x: number, y: number): IPoint {
        let gridSize = CoordinateSystem.GRID_SIZE * CoordinateSystem.GRID_SIZE;  // 实际网格单元大小
        return {
            x: x > 0 ? gridSize * (x - 1) : gridSize * x,
            y: y > 0 ? gridSize * (y - 1) : gridSize * y,
        }
    }

    enableStack(enabled: boolean = true) {
        if (!enabled) {
            GridSystem.Stack?.destory();
            GridSystem.Stack = null;
        } else {
            if (GridSystem.Stack) {
                GridSystem.Stack?.destory();
                GridSystem.Stack = null;
            } else {
                GridSystem.Stack = new Stack();
            }
        }
    }

    enableBbox(f: BasicFeature | SelectArea | null | undefined = null) {
        let bbox = this.features.find(f => f instanceof Bbox);
        this.removeFeature(bbox, false);
        if (f) {
            let nbbox = new Bbox(f);
            return nbbox;
        }
    }

    enableSelectArea(bool = true) {
        let sa = this.features.find(f => f instanceof SelectArea);
        this.removeFeature(sa, false);
        if (bool) {
            sa = new SelectArea();
            this.addFeature(sa, false);
            return sa;
        }
    }

    createFeature(props: Props, newProps?: Partial<Props>) {
        newProps && (props = Object.assign({}, props, newProps));
        let feature: BasicFeature | undefined;
        switch (props.className) {
            case 'Img':
                if (props.position && props.size) {
                    feature = new Img(props.src || '', props.position.x, props.position.y, props.size.width, props.size.height)
                } else {
                    throw "参数异常"
                }
                break;
            case 'Rect':
                if (props.position && props.size) {
                    feature = new Rect(props.position.x, props.position.y, props.size.width, props.size.height)
                } else {
                    throw "参数异常"
                }
                break;
            case 'Text':
                if (props.position && props.size) {
                    feature = new Text(props.text, props.position.x, props.position.y, props.size.width, props.size.height)
                } else {
                    throw "参数异常"
                }
                break;
            case 'Circle':
                if (props.position && props.size) {
                    feature = new Circle(props.position.x, props.position.y, props.size.width, props.size.height)
                } else {
                    throw "参数异常"
                }
                break;
            case 'Group':
                if (props.position && props.size) {
                    feature = new Group([])
                } else {
                    throw "参数异常"
                }
                break;
            case 'Line':
                feature = new Line(props.pointArr)
                break;
            case 'Link':
                // if (props.startFeatureId && props.endFeatureId) {
                //     let startFeature = this.findFeatureById(props.startFeatureId, true);
                //     let endFeature = this.findFeatureById(props.endFeatureId, true);
                //     if (startFeature && endFeature) {
                //         feature = new Link(startFeature, endFeature)
                //     } else {
                //         throw "参数异常"
                //     }
                // } else {
                //     throw "参数异常"
                // }
                break;
            default:
                break;
        }
        if (feature) {
            if (props.id) {
                this.setFeatureProps(feature, props);
                this.addFeature(feature, false);
                if (props.children) {
                    props.children.forEach(cfProp => {
                        feature && feature.addFeature(this.createFeature(cfProp), false)
                    })
                    if (feature instanceof Group) {  // gourp添加子元素需要resize
                        feature.toResize(feature.children);
                    }
                }
            } else {
                throw "参数异常,缺少id"
            }
        }
        return feature;
    }

    setFeatureProps(feature: BasicFeature, props: Props) {
        props.id && (feature.id = props.id);
        props.className && (feature.className = props.className)
        if (props.pointArr) {
            feature.pointArr = []
            props.pointArr.forEach(p => {
                feature.addPoint({
                    x: p.x,
                    y: p.y,
                })
            })
        }
        props.position && (feature.position = props.position)
        props.size && (feature.size = props.size)
        props.angle && (feature.angle = props.angle)
        props.fillStyle && (feature.fillStyle = props.fillStyle)
        props.focusStyle && (feature.focusStyle = props.focusStyle)
        props.hoverStyle && (feature.hoverStyle = props.hoverStyle)
        props.zIndex && (feature.zIndex = props.zIndex)
        props.lineWidth && (feature.lineWidth = props.lineWidth)
        props.lineCap && (feature.lineCap = props.lineCap)
        props.lineJoin && (feature.lineJoin = props.lineJoin)
        props.opacity && (feature.opacity = props.opacity)
        props.lineDashArr && (feature.lineDashArr = props.lineDashArr)
        props.lineDashOffset && (feature.lineDashOffset = props.lineDashOffset)

        props.closePath && (feature.closePath = props.closePath)
        props.isPointIn && (feature.isPointIn = props.isPointIn)
        props.isFixedPos && (feature.isFixedPos = props.isFixedPos)
        props.isOutScreen && (feature.isOutScreen = props.isOutScreen)
        props.isOverflowHidden && (feature.isOverflowHidden = props.isOverflowHidden)
        props.isStroke && (feature.isStroke = props.isStroke)
        props.isShowAdsorbLine && (feature.isShowAdsorbLine = props.isShowAdsorbLine)
        props.isOnlyCenterAdsorb && (feature.isOnlyCenterAdsorb = props.isOnlyCenterAdsorb)
        props.isOnlyHorizonalDrag && (feature.isOnlyHorizonalDrag = props.isOnlyHorizonalDrag)
        props.isOnlyVerticalDrag && (feature.isOnlyVerticalDrag = props.isOnlyVerticalDrag)

        if (feature instanceof Rect) {
            props.isFixedSize && (feature.isFixedSize = props.isFixedSize);
            props.radius && (feature.radius = props.radius);
        }

        if (feature instanceof Img) {
            props.base64Str && (feature.src = props.base64Str);
        }

        if (feature instanceof Text) {
            props.fitSize && (feature.fitSize = props.fitSize);
            props.fontWeight && (feature.fontWeight = props.fontWeight);
            props.color && (feature.color = props.color);
            props.fontFamily && (feature.fontFamily = props.fontFamily);
            props.text && (feature.text = props.text);
            props.lineHeight && (feature.lineHeight = props.lineHeight);
            props.rows && (feature.rows = props.rows);
        }

        if (feature instanceof Line) {
            props.isFreeStyle && (feature.isFreeStyle = props.isFreeStyle);
            props.lineWidthArr && (feature.lineWidthArr = props.lineWidthArr);
        }

        return feature;
    }

    recordFeatureProps(f: BasicFeature): Props {
        return {
            id: f.id,
            className: f.className,
            position: f.position,
            size: f.size,
            angle: f.angle,
            fillStyle: f.fillStyle,
            focusStyle: f.focusStyle,
            hoverStyle: f.hoverStyle,
            zIndex: f.zIndex,
            lineWidth: f.lineWidth,
            lineCap: f.lineCap,
            lineJoin: f.lineJoin,
            opacity: f.opacity,
            lineDashArr: f.lineDashArr,
            lineDashOffset: f.lineDashOffset,

            closePath: f.closePath,  // 是否闭合
            isPointIn: f.isPointIn, //鼠标是否悬浮在元素上
            isFixedPos: f.isFixedPos,  // 是否绝对位置.不跟随网格移动
            isOutScreen: f.isOutScreen,  // 是否在屏幕外
            isOverflowHidden: f.isOverflowHidden,  // 子元素超出是否隐藏
            isStroke: f.isStroke,  // 是否渲染边框
            isShowAdsorbLine: f.isShowAdsorbLine,  // 是否显示吸附辅助线
            isOnlyCenterAdsorb: f.isOnlyCenterAdsorb,  // 是否只以中心对其
            isOnlyHorizonalDrag: f.isOnlyHorizonalDrag,  // 是否只能 水平 方向拖拽
            isOnlyVerticalDrag: f.isOnlyVerticalDrag,  // 是否只能 垂直 方向拖拽

            pointArr: JSON.parse(JSON.stringify(f.pointArr)) as IPoint[],

            isFixedSize: f instanceof Rect ? f.isFixedSize : false,
            radius: f instanceof Rect ? f.radius : 0,

            src: f instanceof Img ? f.base64Str : '',

            text: f instanceof Text ? f.text : '',
            fitSize: f instanceof Text ? f.fitSize : false,
            fontWeight: f instanceof Text ? f.fontWeight : 0,
            color: f instanceof Text ? f.color : '',
            fontFamily: f instanceof Text ? f.fontFamily : undefined,
            lineHeight: f instanceof Text ? f.lineHeight : 0,
            rows: f instanceof Text ? f.rows : 1,

            isFreeStyle: f instanceof Line ? f.isFreeStyle : false,
            lineWidthArr: f instanceof Line ? f.lineWidthArr : [],

            children: f.children.map(cf => this.recordFeatureProps(cf as BasicFeature)) as Props[],
            // startFeatureId: f instanceof Link ? f.startFeatureId : '',
            // endFeatureId: f instanceof Link ? f.endFeatureId : '',
        }
    }

    initAnchorPnts() {
        this.features.filter(f => this.isBasicFeature(f) && !(f instanceof AnchorPnt)).forEach(f => {
            let anchorPnts = f.getAnchorPnts();
            if (!anchorPnts.find(ap => ap.name == 'leftAnchor')) {
                let lAnchorPnt = new AnchorPnt(f, () => {
                    const [leftTop, rightTop, rightBottom, leftBottom] = f.getRectWrapPoints();
                    const leftCenter = getMidOfTwoPnts(leftTop, leftBottom);
                    return leftCenter;
                });
                lAnchorPnt.name = 'leftAnchor';
                lAnchorPnt.fillStyle = lAnchorPnt.focusStyle = lAnchorPnt.hoverStyle = "#C8D5DE"
                lAnchorPnt.cbSelect = false;
            }
            if (!anchorPnts.find(ap => ap.name == 'rightAnchor')) {
                let rAnchorPnt = new AnchorPnt(f, () => {
                    const [leftTop, rightTop, rightBottom, leftBottom] = f.getRectWrapPoints();
                    const rightCenter = getMidOfTwoPnts(rightTop, rightBottom);
                    return rightCenter;
                });
                rAnchorPnt.name = 'rightAnchor';
                rAnchorPnt.fillStyle = rAnchorPnt.focusStyle = rAnchorPnt.hoverStyle = "#C8D5DE"
                rAnchorPnt.cbSelect = false;
            }
            if (!anchorPnts.find(ap => ap.name == 'topAnchor')) {
                let tAnchorPnt = new AnchorPnt(f, () => {
                    const [leftTop, rightTop, rightBottom, leftBottom] = f.getRectWrapPoints();
                    const rightCenter = getMidOfTwoPnts(leftTop, rightTop);
                    return rightCenter;
                });
                tAnchorPnt.name = 'tAnchorPnt';
                tAnchorPnt.fillStyle = tAnchorPnt.focusStyle = tAnchorPnt.hoverStyle = "#C8D5DE"
                tAnchorPnt.cbSelect = false;
            }
            if (!anchorPnts.find(ap => ap.name == 'bottomAnchor')) {
                let bAnchorPnt = new AnchorPnt(f, () => {
                    const [leftTop, rightTop, rightBottom, leftBottom] = f.getRectWrapPoints();
                    const rightCenter = getMidOfTwoPnts(rightBottom, leftBottom);
                    return rightCenter;
                });
                bAnchorPnt.name = 'bottomAnchor';
                bAnchorPnt.fillStyle = bAnchorPnt.focusStyle = bAnchorPnt.hoverStyle = "#C8D5DE"
                bAnchorPnt.cbSelect = false;
            }
        })
    }

    removeAnchorPnts() {
        this.features = this.features.filter(f => !(f instanceof AnchorPnt) || (f instanceof AnchorPnt && (f.isBinding || f.parent?.className === 'Bbox')));   // 画布中再删除一遍
    }

    save(featurePropsArr: Props[]) {
        if (!featurePropsArr) {
            featurePropsArr = [];
            this.features.forEach(f => {
                if (this.isBasicFeature(f)) {
                    let fProps = this.recordFeatureProps(f as BasicFeature);
                    featurePropsArr.push(fProps)
                }
            })
        }
        let str = JSON.stringify(featurePropsArr);
        localStorage.setItem("features", str);
        return str
    }

    loadData(featurePropsArr?: Props[]) {
        if (!featurePropsArr) {
            try {
                featurePropsArr = JSON.parse(localStorage.getItem("features") || '') as Props[];
            } catch (error) {
                featurePropsArr = []
            }
        }
        featurePropsArr.forEach(fp => {
            this.createFeature(fp)
        })
    }

    destroy() {
        cancelAnimationFrame(this.timer);
        this.features.forEach(f => {
            this.removeFeature(f, false);
        })
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    /**
* 鼠标松开后的缓动减速
* @param lastAndPrevMouseMovePoint 
* @returns 
*/
    // private toSlideMove(lastAndPrevMouseMovePoint: {
    //     last_p: IPoint,
    //     prev_p: IPoint
    // }) {
    //     if (!this.cbSlideTransition) return;
    // }
}

export default GridSystem;