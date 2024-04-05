import { CoordinateSystem, FontFamily, Events, Orientation, ClassName, LinkStyle, AdsorbType, AlignType } from "./Constants";
import Feature from "./features/Feature";
import Line from "./features/basic-shape/Line";
import Rect from "./features/basic-shape/Rect";
import AdsorbPnt from "./features/function-shape/func-pnts/AdsorbPnt";
import { IBasicFeature, IPoint, IPixelPos, IProps, IRelativePos } from "./Interface";
import Stack from "./Stack";
import { beautifyHTML, getNearestPoint, getLenOfTwoPnts, getMousePos, getUnitSize, isBasicFeature, isCtrlFeature, swapElements, getMidOfTwoPnts } from "./utils";
import gsap from "gsap";
import { fontMap } from "./Maps";
import Shortcuts from "./Shortcuts";
import Img from "./features/basic-shape/Img";
import Text from "./features/basic-shape/Text";
import Bbox from "./features/function-shape/Bbox";
import Circle from "./features/basic-shape/Circle";
import SelectArea from "./features/function-shape/SelectArea";
import Group from "./features/function-shape/Group";
import EraserPnt from "./features/function-shape/func-pnts/EraserPnt";
import Link from "./features/basic-shape/Link";
import RCtrlPnt from "./features/function-shape/ctrl-pnts/RCtrlPnt";
import SCtrlPnt from "./features/function-shape/ctrl-pnts/SCtrlPnt";
import Pnt from "./features/function-shape/Pnt";
import ACtrlPnt from "./features/function-shape/ctrl-pnts/ACtrlPnt";

class GridSystem {

    static Gls: GridSystem;
    static Stack: Stack | null;
    static Bbox: Bbox | null;
    static Shortcuts: Shortcuts | null;
    static Eraser: EraserPnt | null;

    className: string = ClassName.GRIDSYSTEM;
    scale: number = 10;
    angle: number = 0;
    pageSlicePos: IPoint = {
        x: 0,
        y: 0,
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

    domElement: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    timer: number = 0;
    timer2: number = 0;
    background: string = 'rgba(0,0,0,1)'

    focusNode: Feature | null | undefined;  // 获取焦点的元素, 如果是null ，那就是画布
    features: Feature[] = [];  // 所有元素的集合

    dragingSensitivity: number = 1;   // 拖拽时候的灵敏度, 建议 0 ~ 3
    friction = .93;  // 摩擦力
    lastClickTime: number = 0;  // 用于双击
    focusedTransform = true;   // 获取焦点时就增加包围盒形变

    cbOverlap: boolean = true;  // 元素间是否可重叠
    cbScale: boolean = true; // 画布是否可调节缩放
    cbDragBackground: boolean = true;  // 画布是否可被拖拽
    cbSelectFeature: boolean = true;  // 画布中的元素是否可被选中
    cbAdsorption: boolean = true;  // 元素拖拽是否启用吸附
    cbDragOutScreen: boolean = true; // 是否可被移动到屏幕外
    cbDrawMiniFeature: boolean = true; // 是否渲染太小的元素，因为画布缩放的原因, 提升渲染效率
    cbDrawOutScreen: boolean = true;  // 元素在屏幕外时是否绘制， 因为画布拖拽, 提升渲染效率
    isShowAdsorbLine: boolean = false;

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
        this.domElement = canvasDom;
        this.ctx = this.domElement.getContext('2d') || new CanvasRenderingContext2D();
        this.initEventListener();
    }

    draw(loop = true, fn?: Function) {
        // console.log("clear");
        // console.time();

        this.ctx.fillStyle = this.background;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        // this.ctx.rotate(30 * Math.PI/180)
        fn && fn()
        this.drawFeatures();
        this.ctx.fillStyle = "red"
        this.ctx.fillRect(this.test.x, this.test.y, 5, 5);
        // this.ctx.rotate(-30 * Math.PI/180)
        // console.timeEnd();
        if (loop) {  // 是否循环渲染
            // this.timer = setInterval(() => { this.draw(loop, fn) })
            this.timer = window.requestAnimationFrame(() => this.draw(loop, fn))
        }
    };

    // --------------------以下是私有的方法----------------------------
    initEventListener() {
        this.domElement.addEventListener("mousemove", this.mouseMove);
        this.domElement.addEventListener("mousedown", this.mouseDown);
        this.domElement.addEventListener("mousewheel", this.mouseWheel);
        this.domElement.addEventListener("contextmenu", (e) => { // 禁用右键上下文
            e.preventDefault();
        });
        this.domElement.addEventListener("drop", e => this.dropToFeature(e));
        document.ondragover = function (e) { e.preventDefault(); };  // 阻止默认应为,不然浏览器会打开新的标签去预览
        document.ondrop = function (e) { e.preventDefault(); };
        GridSystem.Shortcuts = new Shortcuts();
        // GridSystem.Shortcuts.addEvent('del', () => {
        //     const feature = this.getFocusNode();
        //     if (feature instanceof Text && feature.editble) {  // 文本光标向右删除
        //         if (feature.cursorIndex < feature.text.length) {
        //             feature.text = feature.text.slice(0, feature.cursorIndex) + feature.text.slice(feature.cursorIndex + 1);
        //         }
        //     } else {
        //         this.removeFeature(feature, true);
        //     }
        // })
        // GridSystem.Shortcuts.addEvent('backspace', () => { // 文本光标向左删除
        //     const feature = this.getFocusNode();
        //     if (feature instanceof Text && feature.editble && feature.cursorIndex > 0) {
        //         feature.text = feature.text.slice(0, feature.cursorIndex - 1) + feature.text.slice(feature.cursorIndex);
        //         feature.cursorIndex--;
        //     }
        // })
        GridSystem.Shortcuts.addEvent(["ctrl", "z"], () => GridSystem.Stack && GridSystem.Stack.undo())
        GridSystem.Shortcuts.addEvent(["ctrl", "y"], () => GridSystem.Stack && GridSystem.Stack.restore())
        GridSystem.Shortcuts.addEvent(["ctrl", "v"], this.clipboardToFeature.bind(this))
        GridSystem.Shortcuts.addEvent(["ctrl", "u"], () => {
            const feature = this.getFocusNode();
            if (feature instanceof SelectArea) {
                const group = new Group(feature.children);
                this.addFeature(group)
                this.toMinIndex(group)
            }
        })
        GridSystem.Shortcuts.addEvent("esc", () => {
            const sa = this.features.find(f => f instanceof SelectArea) as SelectArea;
            this.removeFeature(sa)
        })
        GridSystem.Shortcuts.addEvent("del", () => {
            const focusNode = this.getFocusNode();
            this.removeFeature(focusNode)
        })
        // GridSystem.Shortcuts.addEvent("left", () => {
        //     const feature = this.getFocusNode();
        //     if (feature instanceof Text) {
        //         feature.cursorIndex > 0 && feature.cursorIndex--;
        //         console.log(feature.cursorIndex, "feature.cursorIndex");
        //     }
        // })
        // GridSystem.Shortcuts.addEvent("right", () => {
        //     const feature = this.getFocusNode();
        //     if (feature instanceof Text) {
        //         feature.cursorIndex < feature.text.length && feature.cursorIndex++;
        //     }
        // })
        // GridSystem.Shortcuts.addEvent("up", () => {
        //     const feature = this.getFocusNode();
        //     if (feature instanceof Text) {
        //         Text.mousePos.y -= this.getRatioSize(feature.fontSize);
        //         feature.cursorIndex = -1;
        //     }
        // })
        // GridSystem.Shortcuts.addEvent("down", () => {
        //     const feature = this.getFocusNode();
        //     if (feature instanceof Text) {
        //         Text.mousePos.y += this.getRatioSize(feature.fontSize)
        //         feature.cursorIndex = -1;
        //     }
        // })
    }

    private mouseMove = (e: any) => {
        this.onmousemove && this.onmousemove(e);
        const pos = getMousePos(this.domElement, e);
        this.mousePos.x = pos.x;
        this.mousePos.y = pos.y;
        document.dispatchEvent(new CustomEvent(Events.MOUSE_MOVE, { detail: e }));
    }

    private mouseDown = (ev: any) => {
        cancelAnimationFrame(this.timer2);
        const lastFocusNode = this.getFocusNode();
        const curPageSlicePos = { x: this.pageSlicePos.x, y: this.pageSlicePos.y }
        const velocity = { x: 0, y: 0 }; // 速度分量
        const lastMove = { x: 0, y: 0 } // 上一次鼠标位置

        document.dispatchEvent(new CustomEvent(Events.MOUSE_DOWN, { detail: ev }));
        this.onmousedown && this.onmousedown(ev);
        this.features.forEach(f => f.isFocused = false);
        const focusNodes = this.features.slice().reverse().filter(f => f.cbSelect && f.isPointIn)
        let focusNode = this.focusNode = focusNodes[0];  // 寻找鼠标悬浮元素
        let moveFlag = false;
        let mousemove = (e: any) => { };
        if (this.cbSelectFeature) {
            if (ev.buttons != 1) {
                this.focusNode = focusNode;
            } else {  // 左键点击
                focusNodes.forEach(f => f.dispatch(new CustomEvent('mousedown', { detail: ev })))
                if (!(focusNode instanceof Bbox) && this.focusedTransform && !(isCtrlFeature(focusNode))) {  // 点击了就加控制点,没点击就去除所有控制点
                    this.enableBbox(null);
                    if ((isBasicFeature(focusNode) || this.getFocusNode() instanceof SelectArea)) {
                        const bbox = this.enableBbox(focusNode as IBasicFeature | SelectArea);
                        bbox && (focusNode = bbox);
                    }
                };
                // 如果有区域选择,那么选择其他元素或者点击空白就清除SelectArea
                if (!(this.getFocusNode() instanceof SelectArea) && !isCtrlFeature(this.focusNode)) { this.enableSelectArea(false) }
                if (lastFocusNode && this.getFocusNode() !== lastFocusNode) { lastFocusNode.dispatch(new CustomEvent('blur', { detail: ev })) };
            }
            if (focusNode && ev.buttons == 1) {  // 拖拽元素
                focusNode.isFocused = true;
                this.cbSelectFeature = false;
                mousemove = (e: any) => {
                    if (focusNode) {
                        // console.log(focusNode, "focusNode");
                        const { x: moveX, y: moveY } = getMousePos(this.domElement, e);
                        let { x: mx, y: my } = this.getRelativePos({ x: moveX, y: moveY }, focusNode.isFixedPos)
                        if (lastMove.x && lastMove.y) {
                            focusNode.translate(mx - lastMove.x, my - lastMove.y); // 移动元素
                            if (this.cbAdsorption) {  // 是否边缘吸附
                                const { x: offsetX, y: offsetY, orientations } = this.getAdsorbOffsetDist(focusNode, {
                                    gridCompute: focusNode.adsorbTypes.includes(AdsorbType.GRID),
                                    featureCompute: focusNode.adsorbTypes.includes(AdsorbType.FEATURE),
                                    pointCompute: focusNode.adsorbTypes.includes(AdsorbType.POINT),
                                    onlyCenter: focusNode.isOnlyCenterAdsorb
                                });
                                focusNode.translate(offsetX, offsetY)
                                mx += offsetX;
                                my += offsetY;
                                focusNode._orientations = orientations;
                            }
                            moveFlag = true;
                        }
                        lastMove.x = mx;
                        lastMove.y = my;
                        focusNode.dispatch(new CustomEvent('drag', { detail: e }))
                    }
                }
            } else if (this.cbDragBackground && ev.buttons == 2) {  // 判断是否左键拖拽画布
                this.domElement.style.cursor = "grabbing"
                mousemove = (e: any) => {
                    const { x: moveX, y: moveY } = getMousePos(this.domElement, e);
                    this.ondrag && this.ondrag(e);
                    if (lastMove.x && lastMove.y) {
                        this.translate((moveX - lastMove.x) * this.dragingSensitivity, (moveY - lastMove.y) * this.dragingSensitivity)
                    }
                    this.setPageSlicePosByExtent(this.extent);
                    velocity.x = moveX - lastMove.x; // 计算dx
                    velocity.y = moveY - lastMove.y; // 计算dy
                    lastMove.x = moveX;
                    lastMove.y = moveY;
                }
            }
        }
        const mouseup = (e: any) => {
            this.domElement.style.cursor = "auto"
            this.cbSelectFeature = true;
            this.onmouseup && this.onmouseup(e);
            document.dispatchEvent(new CustomEvent(Events.MOUSE_UP, { detail: e }));
            if (focusNode) {
                focusNode._orientations = null;
                focusNode.dispatch(new CustomEvent('mouseup', { detail: e }))
                focusNode.dispatch(new CustomEvent('dragend', { detail: e }))
                if ((isBasicFeature(this.getFocusNode()) || this.getFocusNode() instanceof SelectArea) && moveFlag) {  // 鼠标抬起后,记录一下
                    GridSystem.Stack && GridSystem.Stack.record(); // 移动时候记录,没移动的不记录
                }
            }
            document.removeEventListener("mousemove", mousemove)
            document.removeEventListener("mouseup", mouseup);
            if (ev.buttons === 2 && this.pageSlicePos.x === curPageSlicePos.x && this.pageSlicePos.y === curPageSlicePos.y) {  // 判断右击
                document.dispatchEvent(new CustomEvent(Events.RIGHT_CLICK, { detail: ev }));
            }

            // 摩擦力过渡停止
            if (this.friction > 0 && (Math.abs(velocity.x) > CoordinateSystem.DRAG_TRANSITION_MIN_DIST || Math.abs(velocity.y) > CoordinateSystem.DRAG_TRANSITION_MIN_DIST)) {  // 有设置摩擦力,and 速度分量要到一定程度才缓动
                const that = this;
                const STOP_D = 0.1  // 停止的最小距离条件
                function animate() {
                    that.pageSlicePos.x += velocity.x * that.dragingSensitivity;
                    that.pageSlicePos.y += velocity.y * that.dragingSensitivity;
                    velocity.x *= that.friction;
                    velocity.y *= that.friction;
                    that.timer2 = requestAnimationFrame(animate);
                    if (Math.abs(velocity.x) < STOP_D && Math.abs(velocity.y) < STOP_D) {
                        cancelAnimationFrame(that.timer2);
                    }
                }
                animate();
            }
        }
        document.addEventListener("mouseup", mouseup)
        document.addEventListener("mousemove", mousemove)
        // 判断双击事件
        if (new Date().getTime() - this.lastClickTime < CoordinateSystem.DB_CLICK_DURATION) {  // 如果是双击
            this.ondbclick && this.ondbclick(ev);
            if (focusNode) {
                focusNode.dispatch(new CustomEvent('dbclick', { detail: ev }))
            }
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
        gridCompute: false, featureCompute: false, onlyCenter: false, pointCompute: false,
    }) {
        const gridSize = CoordinateSystem.GRID_SIZE;
        let offsetX = 0, offsetY = 0;
        const orientations = [];
        const [leftX, rightX, topY, bottomY] = Feature.getRectWrapExtent(feature.pointArr);
        const { x: centerX, y: centerY } = Feature.getCenterPos(feature.pointArr);

        // 吸附的约束，灵敏度
        let min = gridSize * .2;
        let max = gridSize * .8;
        const minD = 5;

        function getDeviation(num: number): number {   // 附近可吸附的位置
            const gridSize = CoordinateSystem.GRID_SIZE;
            return (num / gridSize) % gridSize;
        }

        if (options.gridCompute) {
            //  ------------- 水平对齐
            if (!options.onlyCenter) {
                // 以元素左边为基准
                const offsetLeftX = getDeviation(leftX);
                if (offsetX == 0 && (offsetLeftX > 0 && offsetLeftX < min) || (offsetLeftX < 0 && offsetLeftX > -min)) {
                    offsetX = -leftX % gridSize;
                    orientations.push(Orientation.LEFT)
                }
                if (offsetX == 0 && (offsetLeftX > max && offsetLeftX < gridSize) || (offsetLeftX > -gridSize && offsetLeftX < -max)) {
                    offsetX = gridSize * (offsetLeftX > 0 ? 1 : -1) - leftX % gridSize;
                    orientations.push(Orientation.LEFT)
                }
                // 以元素右边为基准
                const offsetRightX = getDeviation(rightX);
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
            const offsetCenterX = getDeviation(centerX);
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
                const offsetTopY = getDeviation(topY);
                if (offsetY == 0 && (offsetTopY > 0 && offsetTopY < min) || (offsetTopY < 0 && offsetTopY > -min)) {
                    offsetY = -topY % gridSize;
                    orientations.push(Orientation.TOP)
                }
                if (offsetY == 0 && (offsetTopY > max && offsetTopY < gridSize) || (offsetTopY > -gridSize && offsetTopY < -max)) {
                    offsetY = gridSize * (offsetTopY > 0 ? 1 : -1) - topY % gridSize;
                    orientations.push(Orientation.TOP)
                }
                // 以元素下边为基准
                const offsetBottomY = getDeviation(bottomY);
                if (offsetY == 0 && (offsetBottomY > 0 && offsetBottomY < min) || (offsetBottomY < 0 && offsetBottomY > -min)) {
                    offsetY = -bottomY % gridSize;
                    orientations.push(Orientation.BOTTOM)
                }
                if (offsetY == 0 && (offsetBottomY > max && offsetBottomY < gridSize) || (offsetBottomY > -gridSize && offsetBottomY < -max)) {
                    offsetY = gridSize * (offsetBottomY > 0 ? 1 : -1) - bottomY % gridSize;
                    orientations.push(Orientation.BOTTOM)
                }
            }

            const offsetCenterY = getDeviation(centerY);
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
                if (f === feature || !isBasicFeature(feature)) {
                    continue
                }
                const [left, right, top, bottom] = Feature.getRectWrapExtent(f.pointArr);
                // const { left, right, top, bottom } = this.getEdgePoints(f);
                if (offsetX == 0) {
                    const hxs = [left, right, f.position.x]
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
                    const vys = [top, bottom, f.position.y]
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
        if (options.pointCompute) {
            if (offsetX == 0 || offsetY == 0) {
                const center = { x: centerX, y: centerY }
                const points = this.features.filter(f => f instanceof Pnt).map(f => Feature.getCenterPos(f.pointArr));
                const nearP = getNearestPoint(center, points) as IRelativePos;
                if (nearP) {
                    const d = getLenOfTwoPnts(nearP, center);
                    if (d < minD) {
                        offsetX = nearP.x - center.x;
                        offsetY = nearP.y - center.y;
                    }
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
        const lastGirdSize = this.getRatioSize(CoordinateSystem.GRID_SIZE);  // 上一次的gridSize大小
        this.onzoom && this.onzoom(e);
        e.preventDefault();
        const { x, y } = getMousePos(this.domElement, e);
        if (e.wheelDelta > 0) {
            const nextScale = scale || this.scale + CoordinateSystem.SCALE_ABILITY
            if (nextScale > CoordinateSystem.MAX_SCALESIZE) {
                this.scale = CoordinateSystem.MAX_SCALESIZE
            } else {
                this.scale = nextScale;
                this.back2center(x, y, lastGirdSize);
            }
        } else {
            const nextScale = scale || this.scale - CoordinateSystem.SCALE_ABILITY
            if (nextScale < CoordinateSystem.MIN_SCALESIZE) {
                this.scale = CoordinateSystem.MIN_SCALESIZE
            } else {
                this.scale = nextScale;
                this.back2center(x, y, lastGirdSize);
            }
        }
        document.dispatchEvent(new CustomEvent(Events.MOUSE_WHEEL, { detail: e }));
    };

    // 以鼠标中心点位置去放大
    private back2center(x: number, y: number, lastGirdSize: number) {
        const gridSize = this.getRatioSize(CoordinateSystem.GRID_SIZE);  // 当前单位大小
        const different = gridSize - lastGirdSize;   // 当前单位大小与上一次单位大小之差
        this.pageSlicePos.x -= ((x - this.pageSlicePos.x) / lastGirdSize) * different;
        this.pageSlicePos.y -= ((y - this.pageSlicePos.y) / lastGirdSize) * different;
    }

    setPageSlicePosByExtent(extent: number[] = []) { // 限制拖拽范围
        if (extent?.length > 0) {
            const topExtent = extent[0];
            const rightExtent = extent[1];
            const bottomExtent = extent[2];
            const leftExtent = extent[3];

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
    drawFeatures(features: Feature[] = this.features, isChild: boolean = false) {
        features.forEach(f => {
            const isBasic = isBasicFeature(f);
            if (f.hidden) return;
            if (isBasic && f.parent && isBasicFeature(f.parent) && !isChild) return
            const pointArr = f.pointArr.map(p => this.getPixelPos(p, f.isFixedPos))
            if (!this.cbDrawMiniFeature) {  // 是否渲染太小的元素，因为画布缩放的原因(也有元素本身很小)
                const [minX, maxX, minY, maxY] = Feature.getRectWrapExtent(f.pointArr);
                if (Math.abs(maxX - minX) < CoordinateSystem.SCALE_SHOW_MIN_SIZE && Math.abs(maxY - minY) < CoordinateSystem.SCALE_SHOW_MIN_SIZE) {
                    return
                }
            }
            if (!this.cbDragOutScreen) { // 是否渲染屏幕外的元素
                if (pointArr.every(p => {
                    return p.x < 0 || p.x > this.ctx.canvas.width || p.y < 0 || p.y > this.ctx.canvas.height
                })) return
            }
            Feature.TargetRender = this;
            const lineWidth = this.getRatioSize(f.lineWidth, f.isFixedSize);
            let path;
            const radius = this.getRatioSize(f.radius, f.isFixedSize);
            const lineDashArr = f.lineDashArr.length == 2 ? [this.getRatioSize(f.lineDashArr[0], f.isFixedSize), this.getRatioSize(f.lineDashArr[1], f.isFixedSize)] : [];
            path = f.draw(this.ctx, pointArr, lineWidth, lineDashArr as [number, number], radius);
            f.dispatch(new CustomEvent('draw', { detail: '' }))
            this.ctx.save();
            f.isOverflowHidden && this.ctx.clip(path);
            if (isBasic) {
                const children = this.features.filter(cf => cf.parent === f && isBasicFeature(cf));  // 找出子元素
                if (children.length > 0) this.drawFeatures(children, true);
            }
            this.ctx.restore();
        })
    }

    removeFeature(f: Feature | string | undefined, isRecord = true) {
        if (!f) return;
        let feature: Feature | null | undefined = null;
        if (f instanceof Feature) {
            feature = f;
        } else {
            feature = this.features.find(ff => ff.id == f)
        }
        if (feature) {
            const bbox = this.features.find(f => f instanceof Bbox) as Bbox | undefined;
            if (bbox && bbox.target === feature) {
                setTimeout(() => {
                    this.enableBbox(null)
                }, 10);
            }
            feature.destroy();
            feature.dispatch(new CustomEvent('delete', { detail: '' }))
            this.features = this.features.filter(f => feature && (f.id != feature.id));
            feature = null;
            isRecord && GridSystem.Stack && GridSystem.Stack.record();  // 删除元素记录
        }
    }
    addFeature(feature: Feature, isRecord = true) {
        this.focusNode = feature;
        this.features.push(feature);
        if (!feature.zIndex) {
            const features = this.features.filter(f => !isCtrlFeature(f));  // 不是ctrlNode的元素重编 zIndex
            if (!feature.zIndex) feature.zIndex = features.length;
            this.features.sort((a, b) => a.zIndex - b.zIndex);
        }
        this.initAnchorPnts(feature);
        isRecord && GridSystem.Stack && GridSystem.Stack.record();  // 新增元素记录
    }
    getFocusNode() { // 获取焦点元素, 但不是 SCtrlPnt, RCtrlPnt, ACtrlPnt Bbox
        if (this.focusNode) {
            if (this.focusNode instanceof Bbox) {
                return this.focusNode.children[0] as IBasicFeature;
            }
            if (this.focusNode instanceof RCtrlPnt || this.focusNode instanceof SCtrlPnt) {
                const parent = this.focusNode.parent as Bbox;
                return parent.children[0] as IBasicFeature;
            }
            if (isCtrlFeature(this.focusNode)) {
                if (this.focusNode.parent instanceof Bbox) {   // bbox的ctrlNode
                    return this.focusNode.parent.children[0] as IBasicFeature;
                } else {  // 比如线段的ctrlNode
                    return this.focusNode.parent as IBasicFeature;
                }
            }
            return this.focusNode as IBasicFeature;
        }
        return;
    }

    // --------------------------调整元素上下层级相关--------------------------------
    toMinusIndex(feature: IBasicFeature) {
        const index = this.features.findIndex(f => f === feature);
        swapElements<Feature>(this.features, index, index - 1);
        this.resortIndex();
    }
    toPlusIndex(feature: IBasicFeature) {
        const index = this.features.findIndex(f => f === feature);
        swapElements<Feature>(this.features, index, index + 1);
        this.resortIndex();
    }
    toMinIndex(feature: IBasicFeature) {
        const index = this.features.findIndex(f => f === feature);
        this.features.splice(index, 1);
        this.features.unshift(feature);
        this.resortIndex();
    }
    // 将元素置顶，在画布最上层显示
    toMaxIndex(feature: IBasicFeature) {
        const index = this.features.findIndex(f => f === feature);
        this.features.splice(index, 1);
        this.features.push(feature);
        this.resortIndex();
    }
    resortIndex() {
        const features = this.features.filter(f => isBasicFeature(f));
        features.forEach((f, i) => f.zIndex = i);
        this.features.sort((a, b) => a.zIndex - b.zIndex);
    }

    // ------------------ 获取像素，或相对坐标，宽度等-------------------------
    // 获取像素位置坐标
    getPixelPos(point: IRelativePos, isFixedPos = false, target = this.pageSlicePos): IPixelPos {
        if (isFixedPos) {
            return point
        } else {
            return {
                x: target.x + (point.x / CoordinateSystem.GRID_SIZE) * this.scale,
                y: target.y + (point.y / CoordinateSystem.GRID_SIZE) * this.scale,
            };
        }
    }

    // 获取相对位置坐标
    getRelativePos(point: IPixelPos, isFixedPos?: boolean): IRelativePos {
        if (isFixedPos) {
            return point
        } else {
            return {
                x: ((point.x - this.pageSlicePos.x) / this.scale) * CoordinateSystem.GRID_SIZE,
                y: ((point.y - this.pageSlicePos.y) / this.scale) * CoordinateSystem.GRID_SIZE,
            };
        }
    }
    // 获取像素长度， 比如获取元素的宽高
    getPixelLen(len: number) {
        return len * CoordinateSystem.GRID_SIZE;
    }
    getRelativeLen(len: number) {
        return len / CoordinateSystem.GRID_SIZE;
    }
    // 获取像素宽度， 比如lineWidth， fontSize, 随网格缩放而缩放
    getRatioSize(size: number, isFixedSize?: boolean): number {
        if (isFixedSize) {
            return size;
        } else {
            return size * this.scale;
        }
    }

    // ------------------ 鼠标点击, 剪贴板, 拖拽方式去创建元素-----------------
    singleClickToFeature(rect: Rect | Circle, fn?: Function) {
        this.addFeature(rect, false);
        const adsorbPnt = new AdsorbPnt(8, this.cbAdsorption);
        this.cbSelectFeature = false;
        const clear = (remove = true) => {
            this.cbSelectFeature = true;
            remove && this.removeFeature(rect, false);
            this.removeFeature(adsorbPnt, false);
            document.removeEventListener(Events.MOUSE_DOWN, clickDraw);
            document.removeEventListener(Events.MOUSE_MOVE, moveDraw);
            !remove && GridSystem.Stack && GridSystem.Stack.record();   // 修改时候记录
        }
        const clickDraw = (e: any) => {
            if (e.detail.button === 0) {
                rect.setPos(adsorbPnt.position.x, adsorbPnt.position.y);
                clear(false);
                fn && fn();
            } else {
                throw "请用左键绘制!"
            }
        }
        const moveDraw = () => {
            rect.setPos(adsorbPnt.position.x, adsorbPnt.position.y)
        }
        document.addEventListener(Events.MOUSE_DOWN, clickDraw);
        document.addEventListener(Events.MOUSE_MOVE, moveDraw);
        return clear;
    }
    continuousClickToFeature(line: Line, fn?: Function) { // 鼠标点一下添加一个点去画折线
        this.cbSelectFeature = false;
        const adsorbPnt = new AdsorbPnt(8, this.cbAdsorption);
        const clear = (remove = true) => {
            this.cbSelectFeature = true;
            remove && this.removeFeature(line, false);
            this.removeFeature(adsorbPnt, false);
            document.removeEventListener(Events.MOUSE_DOWN, clickDraw);
            document.removeEventListener(Events.RIGHT_CLICK, overDraw);
            document.removeEventListener(Events.MOUSE_MOVE, moveDraw);
            !remove && GridSystem.Stack && GridSystem.Stack.record();   // 修改时候记录
        }
        const moveDraw = (e: any) => {
            line.pointArr[line.pointArr.length - 1] = { x: adsorbPnt.position.x, y: adsorbPnt.position.y };
        }
        const clickDraw = (e: any) => {
            if (e.detail.button === 0) {
                line.addPoint({ x: adsorbPnt.position.x, y: adsorbPnt.position.y }, false);
                if (line.pointArr.length == 1) {
                    line.addPoint({ x: adsorbPnt.position.x, y: adsorbPnt.position.y }, false);
                }
                this.addFeature(line, false);
                document.addEventListener(Events.MOUSE_MOVE, moveDraw);
            } else {
                throw "请用左键绘制!"
            }
        }
        const overDraw = () => {
            clear(false);
            fn && fn();
        }
        document.addEventListener(Events.RIGHT_CLICK, overDraw);
        document.addEventListener(Events.MOUSE_DOWN, clickDraw);
        return clear;
    }
    downMoveToFeature(line: Line, isLaserPen = false, fn?: Function) { // 鼠标按住不放持续画线
        this.cbSelectFeature = false;
        const adsorbPnt = new AdsorbPnt(8, false);
        let lastLineWidth = 0
        let lastTime = 0
        const clear = (remove = true) => {
            this.cbSelectFeature = true;
            remove && this.removeFeature(line, false);
            this.removeFeature(adsorbPnt, false);
            document.removeEventListener(Events.MOUSE_DOWN, clickDraw);
            document.removeEventListener(Events.MOUSE_MOVE, moveDraw);
            document.removeEventListener(Events.MOUSE_UP, overDraw);
            !remove && !isLaserPen && GridSystem.Stack && GridSystem.Stack.record();   // 修改时候记录
        }
        const moveDraw = () => {
            const { x, y } = { x: adsorbPnt.position.x, y: adsorbPnt.position.y };
            line.addPoint({ x, y });
            if (line.pointArr.length > 1) {
                // 自由画笔的宽度计算
                let lineWidth = 0
                const diffx = x - line.pointArr[line.pointArr.length - 2].x
                const diffy = y - line.pointArr[line.pointArr.length - 2].y
                const distance = Math.pow(diffx * diffx + diffy * diffy, 0.5);

                const speed = distance / (Date.now() - lastTime) // 0.1 - 3
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
        const overDraw = () => {
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
        const clickDraw = (e: any) => {  // 
            if (e.detail.button === 0) {
                const { x, y } = { x: adsorbPnt.position.x, y: adsorbPnt.position.y };
                line.addPoint({ x, y });
                document.addEventListener(Events.MOUSE_MOVE, moveDraw);
                document.addEventListener(Events.MOUSE_UP, overDraw);
                this.addFeature(line, false);
            } else {
                throw "请用左键绘制!"
            }
        }
        // document.addEventListener(Events.MOUSE_UP, overDraw);
        document.addEventListener(Events.MOUSE_DOWN, clickDraw);
        return clear;
    }

    async clipboardToFeature(pos = getMousePos(this.domElement, this.mousePos)) { // 读取剪贴板内容生成文字或图片
        try {
            const clipboardData = await navigator.clipboard.read();
            pos = this.getRelativePos(pos)
            // 判断剪贴板数据类型为图像
            if (clipboardData) {
                const index = clipboardData[0].types.findIndex(type => type === 'image/png' || type === 'image/jpeg');
                if (index > -1) {
                    // 将图像转换成Blob对象
                    const imageBlob = new Blob([await clipboardData[0].getType(clipboardData[0].types[index])], { type: 'image/' + clipboardData[index].types[0].split('/')[1] });
                    const reader = new FileReader();
                    reader.readAsDataURL(imageBlob);  // 读取base64
                    reader.onload = () => {
                        const dataUrl = reader.result as string;
                        console.log(dataUrl, "dataUrl");
                        if (dataUrl) {
                            const img = new Img(dataUrl, pos.x, pos.y)
                            this.addFeature(img);
                        }
                    }
                    return;
                }
                // 判断剪贴板数据类型为文本
                if (clipboardData[0]?.types.includes('text/plain')) {
                    const textBlob = await clipboardData[0].getType(clipboardData[0].types[0]);
                    const reader = new FileReader();
                    reader.readAsText(textBlob);  // 获取文本
                    reader.onload = () => {
                        const txt = reader.result as string
                        if (txt && txt.length > 0) {
                            const text = new Text(txt, pos.x, pos.y, this.ctx.measureText(txt).width)
                            this.addFeature(text);
                        }
                    }
                    return;
                }
            }
        } catch (error) {
            console.error('Failed to read clipboard content: ', error);
            return null;
        }
    }
    dropToFeature(e: any) { // 拖放去添加图片
        //取得拖进来的文件
        const data = e.dataTransfer;
        const files = data.files;  // file继承与blob
        if (files && (files[0].type === 'image/png' || files[0].type === 'image/jpeg' || files[0].type === 'video/mp4')) {
            const pos = this.getRelativePos(getMousePos(this.domElement, { x: e.clientX, y: e.clientY }))
            const reader = new FileReader();
            reader.readAsDataURL(files[0]);  // base64
            reader.onload = () => {
                const dataUrl = reader.result as string;
                if (dataUrl) {
                    const img = new Img(dataUrl, pos.x, pos.y)
                    this.addFeature(img);
                }
            }
        }
    }

    // -------------------创建feature, 修改feature属性, 读取feature属性---------------------------
    createFeature(props: IProps, newProps?: Partial<IProps>) {
        newProps && (props = Object.assign({}, props, newProps));
        let feature: IBasicFeature | undefined;
        if (this.features.find(f => f.id === props.id)) return;
        switch (props.className) {
            case ClassName.IMG:
                if (props.position && props.size) {
                    feature = new Img(props.src || '', props.position.x, props.position.y, props.size.width, props.size.height)
                } else {
                    throw "参数异常!"
                }
                break;
            case ClassName.RECT:
                if (props.position && props.size) {
                    feature = new Rect(props.position.x, props.position.y, props.size.width, props.size.height)
                } else {
                    throw "参数异常!"
                }
                break;
            case ClassName.TEXT:
                if (props.position && props.size) {
                    feature = new Text(props.textInfo ? props.textInfo.txt : '占位符', props.position.x, props.position.y, props.size.width, props.size.height)
                } else {
                    throw "参数异常!"
                }
                break;
            case ClassName.CIRCLE:
                if (props.position && props.size) {
                    feature = new Circle(props.position.x, props.position.y, props.size.width, props.size.height)
                } else {
                    throw "参数异常!"
                }
                break;
            case ClassName.GROUP:
                if (props.position && props.size) {
                    feature = new Group([])
                } else {
                    throw "参数异常!"
                }
                break;
            case ClassName.LINE:
                feature = new Line(props.pointArr)
                break;
            case ClassName.LINK:
                if (props.startFeature && props.endFeature) {
                    let startFeature, endFeature;
                    if (props.startFeature.id && props.endFeature.id) {  // 是元素
                        startFeature = this.features.find(f => f.id === (props.startFeature && props.startFeature.id));
                        endFeature = this.features.find(f => f.id === (props.endFeature && props.endFeature.id));
                    } else {  // 是点坐标
                        startFeature = props.startFeature;
                        endFeature = props.endFeature;
                    }
                    if (startFeature && endFeature) {
                        feature = new Link(startFeature, endFeature)
                    } else {
                        throw "参数异常!"
                    }
                } else {
                    throw "参数异常!"
                }
                break;
            default:
                break;
        }
        if (feature) {
            if (props.id) {
                this.modifyFeature(feature, props);
                this.addFeature(feature, false);
                if (props.children) {
                    props.children.forEach(cfProp => {
                        const cf = this.features.find(f => f.id === cfProp.id);
                        feature && feature.addChild(cf as IBasicFeature || this.createFeature(cfProp as IProps), {}, false)
                    })
                    if (feature instanceof Group) {  // gourp添加子元素需要resize
                        feature.toResize(feature.children);
                    }
                    // if (feature instanceof Text) {  // gourp添加子元素需要resize
                    //     feature.onresize();
                    // }
                }
            } else {
                throw "参数异常!,缺少id"
            }
        }
        return feature;
    }
    modifyFeature(feature: IBasicFeature, props: IProps) {
        props.id != undefined && (feature.id = props.id);
        props.className != undefined && (feature.className = props.className)
        if (props.pointArr) {
            feature.pointArr = []
            props.pointArr.forEach(p => {
                feature.addPoint({
                    x: p.x,
                    y: p.y,
                })
            })
        }
        props.position != undefined && (feature.position = props.position)
        props.size != undefined && (feature.size = props.size)
        props.angle != undefined && (feature.angle = props.angle)
        props.fillStyle != undefined && (feature.fillStyle = props.fillStyle)
        props.focusStyle != undefined && (feature.focusStyle = props.focusStyle)
        props.hoverStyle != undefined && (feature.hoverStyle = props.hoverStyle)
        props.lineWidth != undefined && (feature.lineWidth = props.lineWidth)
        props.lineCap != undefined && (feature.lineCap = props.lineCap)
        props.lineJoin != undefined && (feature.lineJoin = props.lineJoin)
        props.opacity != undefined && (feature.opacity = props.opacity)
        props.lineDashArr != undefined && (feature.lineDashArr = props.lineDashArr)
        props.lineDashOffset != undefined && (feature.lineDashOffset = props.lineDashOffset)

        props.zIndex != undefined && (feature.zIndex = props.zIndex)
        props.adsorbTypes != undefined && (feature.adsorbTypes = props.adsorbTypes)
        props.ctrlTypes != undefined && (feature.ctrlTypes = props.ctrlTypes)
        props.pntMinDistance != undefined && (feature.pntMinDistance = props.pntMinDistance)

        props.isClosePath != undefined && (feature.isClosePath = props.isClosePath)
        props.isPointIn != undefined && (feature.isPointIn = props.isPointIn)
        props.isFixedPos != undefined && (feature.isFixedPos = props.isFixedPos)
        props.isOutScreen != undefined && (feature.isOutScreen = props.isOutScreen)
        props.isOverflowHidden != undefined && (feature.isOverflowHidden = props.isOverflowHidden)
        props.isStroke != undefined && (feature.isStroke = props.isStroke)
        props.isOnlyCenterAdsorb != undefined && (feature.isOnlyCenterAdsorb = props.isOnlyCenterAdsorb)
        props.isOnlyHorizonalMove != undefined && (feature.isOnlyHorizonalMove = props.isOnlyHorizonalMove)
        props.isOnlyVerticalMove != undefined && (feature.isOnlyVerticalMove = props.isOnlyVerticalMove)
        props.isHorizonalRevert != undefined && (feature.isHorizonalRevert = props.isHorizonalRevert)
        props.isVerticalRevert != undefined && (feature.isVerticalRevert = props.isVerticalRevert)
        props.isFlowLineDash != undefined && (feature.isFlowLineDash = props.isFlowLineDash)

        if (feature instanceof Rect) {
            props.isFixedSize != undefined && (feature.isFixedSize = props.isFixedSize);
            props.radius != undefined && (feature.radius = props.radius);
        }
        if (feature instanceof Img) {
            props.src != undefined && (feature.src = props.src);
        }
        if (feature instanceof Text) {
            props.fitSize != undefined && (feature.fitSize = props.fitSize);
            props.textInfo != undefined && (feature.textInfo = props.textInfo);
        }
        if (feature instanceof Line) {
            props.isFreeStyle != undefined && (feature.isFreeStyle = props.isFreeStyle);
            props.lineWidthArr != undefined && (feature.lineWidthArr = props.lineWidthArr);
            props.tipInfo != undefined && (feature.tipInfo = props.tipInfo);
            props.actualPointArr != undefined && (feature.actualPointArr = props.actualPointArr)
        }  // 38
        return feature;
    }
    recordFeature(f: IBasicFeature | IProps, onlyStyle = false): Partial<IProps> {  // 复制或读取元素属性
        const styleProps = {
            fillStyle: f.fillStyle,
            focusStyle: f.focusStyle,
            hoverStyle: f.hoverStyle,
            lineWidth: f.lineWidth,
            lineCap: f.lineCap,
            lineJoin: f.lineJoin,
            opacity: f.opacity,
            lineDashArr: f.lineDashArr,
            lineDashOffset: f.lineDashOffset,
            isStroke: f.isStroke,  // 是否渲染边框
            isFlowLineDash: f.isFlowLineDash,
            radius: f instanceof Rect ? f.radius : 0,
            fitSize: f instanceof Text ? f.fitSize : false,
            textInfo: f instanceof Text ? f.textInfo : {},
            tipInfo: f instanceof Line ? f.tipInfo : {},
            triangleInfo: f instanceof Link ? f.actualPointArr : {},
            linkStyle: f instanceof Link ? f.linkStyle : LinkStyle.DEFAULT,
        }
        if (onlyStyle) {
            return styleProps as Partial<IProps>
        } else {
            return {
                id: f.id,
                className: f.className,
                position: f.position,
                size: f.size,
                angle: f.angle,
                zIndex: f.zIndex,
                adsorbTypes: f.adsorbTypes,
                ctrlTypes: f.ctrlTypes,
                pntMinDistance: f.pntMinDistance,

                isClosePath: f.isClosePath,
                isFixedPos: f.isFixedPos,
                isFixedSize: f.isFixedSize,
                isFocused: f.isFocused,
                isOutScreen: f.isOutScreen,
                isOverflowHidden: f.isOverflowHidden,
                isOnlyCenterAdsorb: f.isOnlyCenterAdsorb,
                isOnlyHorizonalMove: f.isOnlyHorizonalMove,
                isOnlyVerticalMove: f.isOnlyVerticalMove,
                isHorizonalRevert: f.isHorizonalRevert,
                isVerticalRevert: f.isVerticalRevert,

                pointArr: JSON.parse(JSON.stringify(f.pointArr)) as IRelativePos[],

                src: f instanceof Img ? f.src : '',
                isFreeStyle: f instanceof Line ? f.isFreeStyle : false,
                lineWidthArr: f instanceof Line ? f.lineWidthArr : [],
                actualPointArr: f instanceof Line ? f.actualPointArr : [],
                startFeature: f instanceof Link ? f.startFeature ? this.recordFeature(f.startFeature as IBasicFeature) as Feature : null : null,
                endFeature: f instanceof Link ? f.endFeature ? this.recordFeature(f.endFeature as IBasicFeature) as Feature : null : null,

                children: f.children ? f.children.map(cf => this.recordFeature(cf)) as IProps[] : [],
                // parent: f.parent ? this.recordFeature(f.parent as IBasicFeature) as Feature: null,
                ...styleProps,
            }
        }
    }


    // ---------------------开启或关闭历史记录, bbox, 区域选择
    enableStack(enabled: boolean = true) {  // 开启或关闭历史记录 
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
    enableBbox(feature: IBasicFeature | SelectArea | null | undefined = null) {  // 包围盒控制点
        const bbox = this.features.find(f => f instanceof Bbox);
        this.removeFeature(bbox, false);
        if (feature) {
            if (feature.className === ClassName.LINK || feature.isFixedSize || !feature.cbTransform) return;
            const nbbox = new Bbox(feature);
            return nbbox;
        }
    }
    enableSelectArea(bool = true) {   // 区域选择
        let sa = this.features.find(f => f instanceof SelectArea);
        this.removeFeature(sa, false);
        if (bool) {
            sa = new SelectArea();
            return sa;
        }
    }

    enableEraserPnt() {  // 橡皮擦
        if (GridSystem.Eraser) {
            this.removeFeature(GridSystem.Eraser);
            GridSystem.Eraser = null;
        } else {
            GridSystem.Eraser = EraserPnt.getInstance();
            this.addFeature(GridSystem.Eraser, false)
        }
    }

    // -------------------保存画布状态,读取画布状态,加载状态---------------------------
    save(featurePropsArr?: IProps[]) {
        if (!featurePropsArr) {
            featurePropsArr = [];
            this.features.forEach(f => {
                if (isBasicFeature(f)) {
                    const fProps = this.recordFeature(f as IBasicFeature);
                    featurePropsArr && featurePropsArr.push(fProps as IProps)
                }
            })
        }
        const str = JSON.stringify(featurePropsArr);
        localStorage.setItem("features", str);
        return str
    }
    loadData(featurePropsArr?: IProps[]) {  // 加载数据
        if (!featurePropsArr) {
            try {
                featurePropsArr = JSON.parse(localStorage.getItem("features") || '') as IProps[];
            } catch (error) {
                featurePropsArr = []
            }
        }
        featurePropsArr.forEach(fp => {
            this.createFeature(fp)
        })
    }

    loadFont(fontFamily: FontFamily) { // 加载字体
        const fontface = new FontFace(fontFamily, `url(${fontMap.get(fontFamily)})`);
        if (!document.fonts.has(fontface)) {
            fontface.load().then(function (loadFace) {
                console.log("字体加载完毕!");
                document.fonts.add(loadFace);
            });
        }
    }

    // ----------------------剪切板相关---------------------------
    copyImageToClipboard(feature = this.getFocusNode(), padding = 10): Promise<Blob> { // 复制元素为png到剪贴板
        // 绘制子元素,子元素偏移的距离等于父元素偏移的距离
        const drawChildren = (ctx: CanvasRenderingContext2D, features: IBasicFeature[], offset: IPoint) => {
            features.forEach(cf => {
                if (isBasicFeature(cf, false)) {
                    const pointArr = cf.pointArr.map(p => this.getPixelPos(p, cf.isFixedPos))
                    // 将多边形移动到Canvas的左上角  
                    pointArr.forEach(point => {
                        point.x -= offset.x;  // 水平方向移动到左侧边界
                        point.y -= offset.y; // 垂直方向移动到顶部边界  
                    });
                    const lineWidth = this.getRatioSize(cf.lineWidth);
                    const lineDashArr = cf.lineDashArr.length == 2 ? [this.getRatioSize(cf.lineDashArr[0], cf.isFixedSize), this.getRatioSize(cf.lineDashArr[1], cf.isFixedSize)] : [];
                    cf.draw(ctx, pointArr, lineWidth, lineDashArr, this.getRatioSize(cf.radius));
                    drawChildren(ctx, cf.children, offset)
                }
            });
        }
        return new Promise((resolve, reject) => {
            if (feature) {
                const offscreenCanvas = document.createElement('canvas');
                const ctx = offscreenCanvas.getContext('2d') as CanvasRenderingContext2D;
                const pointArr = feature.pointArr.map(p => this.getPixelPos(p, feature.isFixedPos))
                const [leftTop, rightTop, rightBottom, leftBottom] = Feature.getRectWrapPoints(pointArr);
                const lineWidth = this.getRatioSize(feature.lineWidth);
                offscreenCanvas.width = Math.abs(rightTop.x - leftTop.x) + padding;
                offscreenCanvas.height = Math.abs(leftTop.y - leftBottom.y) + padding;
                // 将多边形移动到Canvas的左上角 
                pointArr.forEach(point => {
                    point.x -= leftTop.x - padding / 2;  // 水平方向移动到左侧边界
                    point.y -= leftTop.y - padding / 2; // 垂直方向移动到顶部边界  
                });
                ctx.fillStyle = this.background
                ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
                if (isBasicFeature(feature, false)) {
                    const lineDashArr = feature.lineDashArr.length == 2 ? [this.getRatioSize(feature.lineDashArr[0], feature.isFixedSize), this.getRatioSize(feature.lineDashArr[1], feature.isFixedSize)] : [];
                    feature.draw(ctx, pointArr, lineWidth, lineDashArr, this.getRatioSize(feature.radius));
                }
                drawChildren(ctx, feature.children, { x: leftTop.x - padding / 2, y: leftTop.y - padding / 2 });
                const url = offscreenCanvas.toDataURL("image/png");   // canvas 转 图片
                fetch(url).then(data => {
                    data.blob().then(blob => { // 图片转blob
                        const data = [new ClipboardItem({
                            [blob.type]: blob
                        })];
                        navigator.clipboard.write(data).then(() => {
                            console.log("复制成功!");
                            resolve(blob)
                        }, (err) => {
                            reject("复制失败:" + err)
                        })
                    })
                });
            }
        })
    }
    copySvgToClipboard(feature = this.getFocusNode(), padding = 10, background = this.background): Promise<string> {// 复制元素为svg到剪贴板
        let svgstr = '';
        // 绘制子元素,子元素偏移的距离等于父元素偏移的距离  递归,道理跟刚才一样
        const addChildrenSvg = (features: IBasicFeature[], offset: IPoint, width = 0, height = 0, padding = 0) => {
            features.forEach(cf => {
                if (isBasicFeature(cf)) {
                    const pointArr = cf.pointArr.map(p => this.getPixelPos(p, cf.isFixedPos))
                    // 将多边形移动到Canvas的左上角  
                    pointArr.forEach(point => {
                        point.x -= offset.x;  // 水平方向移动到左侧边界
                        point.y -= offset.y; // 垂直方向移动到顶部边界  
                    });
                    const lineWidth = this.getRatioSize(cf.lineWidth);
                    if (cf instanceof Rect) {
                        svgstr += cf.getSvg(pointArr, lineWidth, this.getRatioSize(cf.radius));   // svg旋转默认围绕viewBox左上角
                    } else {
                        svgstr += cf.getSvg(pointArr, lineWidth);   // svg旋转默认围绕viewBox左上角
                    }
                    if (cf.children) {
                        addChildrenSvg(cf.children, offset, padding)
                    }
                }
            });
        }
        return new Promise((resolve, reject) => {
            if (feature) {
                const pointArr = feature.pointArr.map(p => this.getPixelPos(p, feature.isFixedPos))
                const [leftTop, rightTop, rightBottom, leftBottom] = Feature.getRectWrapPoints(pointArr);
                const width = Math.abs(rightTop.x - leftTop.x) + padding;
                const height = Math.abs(leftTop.y - leftBottom.y) + padding;
                const lineWidth = this.getRatioSize(feature.lineWidth);
                // 将多边形移动到SVG的左上角
                pointArr.forEach(point => {
                    point.x -= leftTop.x - padding / 2;  // 水平方向移动到左侧边界
                    point.y -= leftTop.y - padding / 2; // 垂直方向移动到顶部边界 
                });
                this.test = pointArr[1];
                if (feature instanceof Rect) {
                    svgstr += feature.getSvg(pointArr, lineWidth, this.getRatioSize(feature.radius));   // svg旋转默认围绕viewBox左上角
                } else {
                    svgstr += feature.getSvg(pointArr, lineWidth);   // svg旋转默认围绕viewBox左上角
                }
                addChildrenSvg(feature.children, { x: leftTop.x - padding / 2, y: leftTop.y - padding / 2 });
                const svgStr = beautifyHTML(`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
                    <rect x="0" y="0" width="${width}" height="${height}" fill="${background}"/>
                        ${svgstr}
                    </svg>`)
                // 使用剪切板API进行复制
                const blob = new Blob([svgStr], { type: 'text/plain' });
                const data = [new ClipboardItem({
                    [blob.type]: blob
                })];

                navigator.clipboard.write(data).then(() => {
                    console.log("复制成功!");
                    resolve(svgStr)
                }, (err) => {
                    reject("复制失败:" + err)
                })
            }
        })
    }

    // ----------------------------画布相关操作方法------------------------------
    translate(offsetX: number = 0, offsetY: number = 0, duration = 0) {  // 移动画布
        if (duration > 0) {
            gsap.to(this.pageSlicePos, {
                duration,
                x: offsetX,
                y: offsetY,
                ease: "slow.out",
            })
        } else {
            this.pageSlicePos.x += offsetX;
            this.pageSlicePos.y += offsetY;
        }
    }
    zoomTo(scale: number, point?: IRelativePos) { // 缩放至 
        const lastGirdSize = this.getRatioSize(CoordinateSystem.GRID_SIZE);  // 上一次的gridSize大小
        if (!point) point = this.getCenterPos()[0]
        this.scale = scale;
        this.back2center(point.x, point.y, lastGirdSize)
    }
    getCenterPos() { // 获取中心点
        const centerP = { x: this.domElement.width / 2, y: this.domElement.height / 2 };
        const canvasR = this.getRelativePos(centerP)
        return [centerP, canvasR]
    }
    getCenterDist(point: IPixelPos) { // 求点与canvas中心的距离
        const canvasCenter = { x: this.domElement.width / 2, y: this.domElement.height / 2 }
        return {
            x: canvasCenter.x - point.x,
            y: canvasCenter.y - point.y
        }
    }
    setSize(width?: number | null, height?: number | null) {  // 设置画布大小
        if (width) this.ctx.canvas.width = width;
        if (height) this.ctx.canvas.height = height;
    }
    getFeaturesRange(features: Feature[]): IPixelPos[] {  // 获取多个元素的包围盒矩形的四个坐标点
        const featuresPointArr: IRelativePos[] = []
        features.map(f => featuresPointArr.push(...f.pointArr));
        return Feature.getRectWrapPoints(featuresPointArr.map(p => this.getPixelPos(p)));  // [leftTop, rightTop, rightBottom, leftBottom]
    }
    /**
  * 居中,并缩放至所有元素都在canvas范围内
  * @param padding 上下或左右的边距
  */
    toFitView(features: Feature[] = this.features, padding: number = 20, domElement = this.ctx.canvas) {
        // 先缩放
        features = this.features.filter(f => isBasicFeature(f))
        const [leftTop, rightTop, rightBottom, leftBottom] = this.getFeaturesRange(features);   // 所有元素的范围大小
        const totalHeight = Math.abs(leftBottom.y - leftTop.y);
        const totalWidth = Math.abs(rightTop.x - leftTop.x);
        if (totalWidth > totalHeight) {
            this.scale = domElement.width / ((totalWidth + padding) / this.scale);   // 像素宽度/scale是相对宽度, 画布宽度/相对宽度得到缩放比例 这个跟miniMap算法一样
        } else {
            this.scale = domElement.height / ((totalHeight + padding) / this.scale);
        }
        setTimeout(() => {
            // 后居中
            const [leftTop1, rightTop1, rightBottom1, leftBottom1] = this.getFeaturesRange(features);
            const { x: distX, y: distY } = this.getCenterDist({ x: (rightTop1.x + leftBottom1.x) / 2, y: (leftTop1.y + rightBottom1.y) / 2 });
            this.pageSlicePos.x = this.pageSlicePos.x + distX
            this.pageSlicePos.y = this.pageSlicePos.y + distY  // 以所有元素的中心点对齐
        }, 100)
    }

    /**
     *  整个画布导出为图片URL
     * @param isFitView 
     * @param padding 
     * @param zoom 
     * @returns 
     */
    toImage(isFitView = false, padding = 20, zoom = 50) {
        if (isFitView) {
            const features = this.features.filter(f => isBasicFeature(f))
            const scale = this.scale;
            this.scale = zoom;  // 放大倍数,数值越大图片越清晰,同时文件也越大
            const [leftTop, rightTop, rightBottom, leftBottom] = this.getFeaturesRange(this.features);   // 所有元素的范围大小
            const totalWidth = Math.abs(rightTop.x - leftBottom.x);
            const totalHeight = Math.abs(rightBottom.y - leftTop.y);
            const offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.width = totalWidth + padding;
            offscreenCanvas.height = totalHeight + padding;
            const ctx = offscreenCanvas.getContext('2d') as CanvasRenderingContext2D;
            ctx.fillStyle = this.background
            ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
            features.forEach(feature => {
                const pointArr = feature.pointArr.map(p => this.getPixelPos(p))
                const lineWidth = this.getRatioSize(feature.lineWidth);
                // 将多边形移动到Canvas的左上角 
                pointArr.forEach(p => {
                    p.x -= leftTop.x - padding / 2;  // 水平方向移动到左侧边界
                    p.y -= leftTop.y - padding / 2; // 垂直方向移动到顶部边界  
                });
                const lineDashArr = feature.lineDashArr.length == 2 ? [this.getRatioSize(feature.lineDashArr[0], feature.isFixedSize), this.getRatioSize(feature.lineDashArr[1], feature.isFixedSize)] : [];
                feature.draw(ctx, pointArr, lineWidth, lineDashArr, this.getRatioSize(feature.radius));
            })
            this.scale = scale;
            return offscreenCanvas.toDataURL("image/png");
        } else {
            return this.domElement.toDataURL("image/png");
        }
    }

    // ------------------------网格坐标相关方法--------------------------
    // 根据相对坐标获取网格坐标
    getGridPosByRelativePos(point: IPoint): IPoint {
        const gridSize = getUnitSize();  // 实际网格单元大小
        const gx = point.x > 0 ? Math.ceil(point.x / gridSize) : Math.floor(point.x / gridSize);
        const gy = point.y > 0 ? Math.ceil(point.y / gridSize) : Math.floor(point.y / gridSize);
        return { x: gx, y: gy }
    }
    // 根据网格坐标获取相对坐标
    getRelativePosByGridPos(point: IPoint): IPoint {
        if (point.x === 0 || point.y === 0) throw "坐标不合法,x或y不能为0"
        const gridSize = getUnitSize();  // 实际网格单元大小
        return {
            x: point.x > 0 ? gridSize * (point.x - 1) + gridSize / 2 : gridSize * point.x + gridSize / 2,
            y: point.y > 0 ? gridSize * (point.y - 1) + gridSize / 2 : gridSize * point.y + gridSize / 2,
        }
    }

    // ----------------------其他功能性API------------------------
    /**
 * 根据一个点获取他周围的吸附距离
 * @param point 
 * @returns 
 */
    getAdsorb2Grid(point: IRelativePos) {
        const gridSize = CoordinateSystem.GRID_SIZE;
        let offsetX = 0, offsetY = 0;
        // 相对像素
        // 吸附的约束，灵敏度
        const min = gridSize * .4;
        const max = gridSize * .6;

        //  ------------- 水平对齐
        const diffX = getDeviation(point.x);
        if (offsetX == 0 && (diffX > 0 && diffX < min) || (diffX < 0 && diffX > -min)) {
            offsetX = -point.x % (gridSize * gridSize);
        }
        if (offsetX == 0 && (diffX > max && diffX < gridSize) || (diffX > -gridSize && diffX < -max)) {
            offsetX = (gridSize * gridSize) * (diffX > 0 ? 1 : -1) - point.x % (gridSize * gridSize);
        }
        //  ------------- 垂直对齐
        const diffY = getDeviation(point.y);
        if (offsetY == 0 && (diffY > 0 && diffY < min) || (diffY < 0 && diffY > -min)) {
            offsetY = -point.y % (gridSize * gridSize);
        }
        if (offsetY == 0 && (diffY > max && diffY < gridSize) || (diffY > -gridSize && diffY < -max)) {
            offsetY = (gridSize * gridSize) * (diffY > 0 ? 1 : -1) - point.y % (gridSize * gridSize);
        }

        return { x: offsetX, y: offsetY };

        function getDeviation(num: number): number {
            const gridSize = CoordinateSystem.GRID_SIZE;
            return (num / gridSize) % gridSize;
        }
    }

    getAdsorb2Point(point: IRelativePos) {
        // 吸附的约束，灵敏度
        const minD = 5;
        const points = this.features.filter(f => f instanceof Pnt).map(f => Feature.getCenterPos(f.pointArr));
        const nearP = getNearestPoint(point, points) as IRelativePos;
        if (nearP) {
            const d = getLenOfTwoPnts(nearP, point);
            if (d < minD) {
                return { x: nearP.x - point.x, y: nearP.y - point.y };
            }
        }
        return { x: 0, y: 0 };
    }

    initAnchorPnts(feature: Feature) {
        if (isBasicFeature(feature) && !(feature instanceof Line)) {  // 非基础元素或线性元素不添加锚点
            let pnt = new ACtrlPnt(feature as IBasicFeature, () => {
                const [leftTop, rightTop, rightBottom, leftBottom] = Feature.getRectWrapPoints(feature.pointArr)
                return getMidOfTwoPnts(leftTop, leftBottom);
            });
            pnt.name = AlignType.LEFT
            pnt.cbSelect = false;
            pnt.hidden = true;
            feature.addChild(pnt, {}, false)
            let pnt2 = new ACtrlPnt(feature as IBasicFeature, () => {
                const [leftTop, rightTop, rightBottom, leftBottom] = Feature.getRectWrapPoints(feature.pointArr)
                return getMidOfTwoPnts(rightTop, rightBottom);
            });
            pnt2.name = AlignType.RIGHT
            pnt2.cbSelect = false;
            pnt2.hidden = true;
            feature.addChild(pnt2, {}, false)
            let pnt3 = new ACtrlPnt(feature as IBasicFeature, () => {
                const [leftTop, rightTop, rightBottom, leftBottom] = Feature.getRectWrapPoints(feature.pointArr)
                return getMidOfTwoPnts(leftTop, rightTop);
            });
            pnt3.name = AlignType.TOP
            pnt3.cbSelect = false;
            pnt3.hidden = true;
            feature.addChild(pnt3, {}, false)
            let pnt4 = new ACtrlPnt(feature as IBasicFeature, () => {
                const [leftTop, rightTop, rightBottom, leftBottom] = Feature.getRectWrapPoints(feature.pointArr)
                return getMidOfTwoPnts(leftBottom, rightBottom);
            });
            pnt4.name = AlignType.BOTTOM
            pnt4.cbSelect = false;
            pnt4.hidden = true;
            feature.addChild(pnt4, {}, false)
        }
    }

    destroy() {
        cancelAnimationFrame(this.timer);
        this.features.forEach(f => {
            this.removeFeature(f, false);
        })
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

}

export default GridSystem;