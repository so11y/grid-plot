import { Orientation } from "../Constants";
import GridSystem from "../GridSystem";
import { IPoint, Size } from "../Interface";
import MiniMap from "../MiniMap";
import { getLenOfTwoPnts, getRotatePnt, getUuid } from "../utils";
import AnchorPnt from "./function-shape/AnchorPnt";
import CtrlPnt from "./function-shape/CtrlPnt";

class Feature {

    static TargetRender: GridSystem | MiniMap | null = null;  // 当前渲染所处环境， GridSystem, MiniMap

    pointArr: IPoint[] = [];
    fillStyle: string = '#999';
    strokeStyle: string = '#999';
    hoverStyle: string = '#666';
    focusStyle: string = '#333';
    zIndex: number = 0;
    lineWidth: number = .5;
    lineCap: CanvasLineCap = "round"   // butt, round, square
    lineJoin: CanvasLineJoin = "round"

    opacity: number = 1; // 整体透明度
    lineDashArr: number[] = [];  // 虚线
    lineDashOffset: number = 0;

    id: string  // 唯一id
    name: string = ''  //名称
    className = 'Feature'  //名称
    hidden: boolean = false;
    position: IPoint = { x: 0, y: 0 }
    offset: IPoint = { x: 0, y: 0 } // 相对于父元素中心点偏移
    size: Size = { width: 0, height: 0 }
    scale: IPoint = { x: 1, y: 1 };
    angle: number = 0;

    gridPos: IPoint = { x: 0, y: 0 };  // 网格坐标系下的坐标
    parent: Feature | null = null;  // 父元素
    children: Feature[] = [];  // 子节点
    ctrlPnts: CtrlPnt[] = [];
    anchorPnts: AnchorPnt[] = [];  // 锚点
    gls: GridSystem = GridSystem.Gls;
    lastRelativePnt: IPoint = this.getRectWrapPoints()[0];
    adsorbTypes = ["grid", "feature"];  // 移动时吸附规则
    pntDistanceLimit = 5;  // 距离太近的两个点,就不重复添加了
    pntExtentPer: {
        left: IPoint[],
        right: IPoint[]
    } = {
            left: [], // pointArr距离左边百分比
            right: [], // pointArr距离上边百分比
        }

    // 节点状态
    isClosePath: boolean = true;  // 是否闭合
    isPointIn: boolean = false; //鼠标是否悬浮在元素上
    isFocused: boolean = false; //是否正在操作, 鼠标按在这个元素身上
    isFixedPos: boolean = false;  // 是否固定位置.不跟随网格移动
    isFixedSize: boolean = false; // 是否固定大小
    isOutScreen: boolean = false;  // 是否在屏幕外
    isObstacle: boolean = false;  // 是否是障碍物
    isOverflowHidden: boolean = false;  // 子元素超出是否隐藏
    isStroke: boolean = true;  // 是否渲染边框
    isTransform: boolean = true; // 是否形变
    isShowAdsorbLine: boolean = false;  // 是否显示吸附辅助线
    isOnlyCenterAdsorb: boolean = false;  // 是否只以中心对其
    isOnlyHorizonalDrag: boolean = false;  // 是否只能 水平 方向拖拽
    isOnlyVerticalDrag: boolean = false;  // 是否只能 垂直 方向拖拽

    // 节点功能
    cbSelect: boolean = true;  // 是否可被选择
    cbMove: boolean = true;  // 是否可被拖拽
    cbChangeZindex: boolean = true; // 是否获取焦点时改变层级关系
    cbAdsorb: boolean = true;

    // 节点事件
    onmouseover: Function | null = null;  // 如果有，鼠标悬浮后就会被调用
    onmousemove: Function | null = null;  // 如果有，在元素上移动触发
    onmousedown: Function | null = null;  // 如果有，鼠标点击后就会被调用
    onmouseup: Function | null = null;  // 如果有，鼠标点击后就会被调用
    onmouseleave: Function | null = null;  // 如果有，鼠标离开后就会被调用
    ondbclick: Function | null = null;  // 如果有，鼠标双击后就会被调用
    // ontranslate: Function | null = null;  // 拖拽中的事件
    ondragend: Function | null = null;  // 拖拽中的事件
    resize: Function | null = null;  // 宽高更新后触发的事件， 控制点控制的
    ondraw: Function | null = null;  // 每次绘制触发
    onrotate: Function | null = null;
    ondelete: Function | null = null;

    onTranslate: Function | null = null;
    translateEvents: Function[] = [];

    // 节点事件, 内部使用
    _onmouseover: Function | null = null;  // 如果有，鼠标悬浮后就会被调用
    _onmousemove: Function | null = null;  // 如果有，在元素上移动触发
    _onmousedown: Function | null = null;  // 如果有，鼠标点击后就会被调用
    _onmouseup: Function | null = null;  // 如果有，鼠标点击后就会被调用
    _onmouseleave: Function | null = null;  // 如果有，鼠标离开后就会被调用
    _ondbclick: Function | null = null;  // 如果有，鼠标双击后就会被调用
    _ontranslate: Function | null = null;  // 拖拽中的事件
    _ondragend: Function | null = null;  // 拖拽中的事件
    _resize: Function | null = null;  // 宽高更新后触发的事件， 控制点控制的
    _ondraw: Function | null = null;  // 每次绘制触发
    _onrotate: Function | null = null;
    _ondelete: Function | null = null;

    _orientations: Orientation[] | null = null;   // 对齐的方向， 上下左右

    constructor(pointArr: IPoint[] = []) {
        // 相对坐标
        this.pointArr = pointArr;
        this.id = getUuid();
    }

    rotate(angle: number = this.angle, O: IPoint = this.getCenterPos(this.pointArr)) {
        this.angle += angle;
        this.pointArr.forEach(p => {
            let rp = getRotatePnt(O, p, angle);
            p.x = rp.x;
            p.y = rp.y;
        })
        this.onrotate && this.onrotate()
    }

    translate(offsetX: number = 0, offsetY: number = 0) {
        this.pointArr.forEach(p => {
            if (!this.isOnlyVerticalDrag) {
                p.x += offsetX;
            }
            if (!this.isOnlyHorizonalDrag) {
                p.y += offsetY;
            }
        })
        this.ontranslate();
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPoint[], lineWidth: number) {
        let path = new Path2D();
        pointArr.forEach((p, i) => {
            if (i == 0) {
                path.moveTo(p.x, p.y)
            } else {
                path.lineTo(p.x, p.y)
            }
        })
        ctx.save()
        this.isClosePath && path.closePath()
        this.setPointIn(ctx, path)
        ctx.lineCap = this.lineCap;
        ctx.lineJoin = this.lineJoin;
        ctx.globalAlpha = this.opacity;
        this.lineDashArr.length > 0 && ctx.setLineDash(this.lineDashArr)
        ctx.lineDashOffset = this.lineDashOffset;
        ctx.strokeStyle = this.strokeStyle;
        if (this.isPointIn) {
            ctx.fillStyle = this.hoverStyle;
            if (this.gls.focusNode === this) {
                ctx.fillStyle = this.focusStyle;
            }
        } else {
            ctx.fillStyle = this.fillStyle;
        }
        ctx.lineWidth = lineWidth;
        this.isStroke && ctx.stroke(path);
        ctx.fill(path);
        this.isShowAdsorbLine && this.drawAdsorbLine(ctx, pointArr)
        this.updateChild();
        ctx.restore();
        return path;
    }

    drawAdsorbLine(ctx: CanvasRenderingContext2D, pointArr: IPoint[]) {
        if (Feature.TargetRender && Feature.TargetRender?.className === 'GridSystem') {
            let [leftX, rightX, topY, bottomY] = this.getRectWrapExtent(pointArr);
            let { x: centerX, y: centerY } = this.getCenterPos(pointArr);
            if (this._orientations) {
                ctx.save();
                ctx.beginPath()
                if (this._orientations.includes(Orientation.LEFT)) {
                    ctx.moveTo(leftX, 0)
                    ctx.lineTo(leftX, this.gls.ctx.canvas.height);
                } else if (this._orientations.includes(Orientation.RIGHT)) {
                    ctx.moveTo(rightX, 0)
                    ctx.lineTo(rightX, this.gls.ctx.canvas.height);
                }
                if (this._orientations.includes(Orientation.TOP)) {
                    ctx.moveTo(0, topY)
                    ctx.lineTo(this.gls.ctx.canvas.width, topY);
                } else if (this._orientations.includes(Orientation.BOTTOM)) {
                    ctx.moveTo(0, bottomY)
                    ctx.lineTo(this.gls.ctx.canvas.width, bottomY);
                }
                if (this._orientations.includes(Orientation.CENTER_X)) {
                    ctx.moveTo(centerX, 0)
                    ctx.lineTo(centerX, this.gls.ctx.canvas.height);
                }
                if (this._orientations.includes(Orientation.CENTER_Y)) {
                    ctx.moveTo(0, centerY)
                    ctx.lineTo(this.gls.ctx.canvas.width, centerY);
                }
                ctx.strokeStyle = "red";
                ctx.lineWidth = .8;
                ctx.setLineDash([8, 8]);
                ctx.stroke();
                ctx.restore();
            }
        }
    }

    setPointIn(ctx: CanvasRenderingContext2D, path?: Path2D) {
        if (Feature.TargetRender && Feature.TargetRender?.className === 'GridSystem') {
            let isPointIn = false;
            if (this.isClosePath) {
                isPointIn = path ? ctx.isPointInPath(path, GridSystem.MousePos.x, GridSystem.MousePos.y) : ctx.isPointInPath(GridSystem.MousePos.x, GridSystem.MousePos.y)
            } else {
                isPointIn = path ? ctx.isPointInStroke(path, GridSystem.MousePos.x, GridSystem.MousePos.y) : ctx.isPointInStroke(GridSystem.MousePos.x, GridSystem.MousePos.y)
            }
            // if(isPointIn){
            //     this.gls.hoverNode = this;
            // }

            if (!this.isPointIn && isPointIn) {  // 判断是不是第一次进入，是就是mouseover
                this.onmouseover && this.onmouseover(this);
            } else if (this.isPointIn && !isPointIn) {
                this.onmouseleave && this.onmouseleave(this);
            }
            if (this.cbSelect) {
                this.isPointIn = isPointIn;
                this.isPointIn && this.onmousemove && this.onmousemove(this);
            }
        }
    }

    getRectWrapExtent(pointArr: IPoint[] = this.pointArr): number[] {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (let point of pointArr) {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        }

        return [minX, maxX, minY, maxY];
    }


    // [leftTop, rightTop, rightBottom, leftBottom]
    getRectWrapPoints(pointArr: IPoint[] = this.pointArr): IPoint[] {
        let [minX, maxX, minY, maxY] = this.getRectWrapExtent(pointArr);
        if (minX != null && minY != null && maxX != null && maxY != null) {
            return [
                { x: minX, y: minY },
                { x: maxX, y: minY },
                { x: maxX, y: maxY },
                { x: minX, y: maxY },
            ]
        }
        return []
    }

    getCenterPos(pointArr: IPoint[] = this.pointArr): IPoint {
        let [minX, maxX, minY, maxY] = this.getRectWrapExtent(pointArr);
        return {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2,
        }
    }

    addPoint(point: IPoint) {
        let prevPnt = this.pointArr[this.pointArr.length - 1];
        if (prevPnt && getLenOfTwoPnts(point, prevPnt) < this.pntDistanceLimit) {
            console.warn("两点距离太近了, 就不添加了!");
            return;
        }
        this.pointArr.push(point);
    }

    addChildren(feature: Feature, cbSelect = false) {
        feature.translate(this.lastRelativePnt.x + feature.position.x, this.lastRelativePnt.y + feature.position.y)   // 第一次添加需要将子元素移动到定位点并且加上他的x,y
        this.children.push(feature);
        feature.parent = this;
        feature.cbSelect = cbSelect;
        feature.isFixedPos = this.isFixedPos;
        feature.angle = feature.parent.angle;
    }
    // 删除指定子元素
    removeChild(feature: Feature) {
        feature.parent = null;
        this.children.splice(this.children.findIndex(cf => cf == feature), 1);
    }
    updateChild() {
        if (this.children && this.children.length > 0) {
            let leftTop = this.pointArr[0];  // 左上角
            // this.gls.test = this.gls.getPixelPos(leftTop)
            this.children.forEach(cf => {
                cf.translate(leftTop.x - this.lastRelativePnt.x, leftTop.y - this.lastRelativePnt.y);
                // cf.angle = this.angle
                // this.gls.test = this.gls.getPixelPos(O)
                // this.children.forEach(cf => {
                //     // cf.rotate(angle);
                //     cf.pointArr.forEach(p => {
                //         let rp = getRotatePnt(O, p, angle);
                //         p.x = rp.x;
                //         p.y = rp.y;
                //     })
                // })
            })
            this.lastRelativePnt = { x: leftTop.x, y: leftTop.y };
        }
    }

    addCtrlPnt(feature: CtrlPnt) {
        // new CtrlPnt();
        this.ctrlPnts.push(feature);
        feature.parent = this;
        feature.angle = feature.parent.angle;
    }
    // 删除指定子元素
    removeCtrlPnt(feature: CtrlPnt) {
        feature.parent = null;
        this.ctrlPnts.splice(this.ctrlPnts.findIndex(cf => cf == feature), 1);
    }

    toFixedPos() {
        if (!this.isFixedPos) {
            let { x, y } = this.gls.getPixelPos({ x: this.position.x, y: this.position.y });
            this.position.x = x;
            this.position.y = y;
        }
        this.isFixedPos = true;
    }

    toRelativePos() {
        if (this.isFixedPos) {
            let { x, y } = this.gls.getRelativePos({ x: this.position.x, y: this.position.y });
            this.position.x = x;
            this.position.y = y;
        }
        this.isFixedPos = false;
    }

    // 获取包围盒矩形的Size
    getPixelSize() {
        const [leftTop, rightTop, rightBottom] = this.getRectWrapPoints();
        return {
            x: getLenOfTwoPnts(leftTop, rightTop),
            y: getLenOfTwoPnts(leftTop, rightBottom),
        }
    }

    ontranslate() {
        this.translateEvents.forEach(f => { f() })
        this.onTranslate && this.onTranslate();
    }

    destroy() { };
}

export default Feature;