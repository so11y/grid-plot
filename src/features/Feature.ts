import { AlignType, CtrlType, Orientation } from "../Constants";
import GridSystem from "../GridSystem";
import type MiniMap from "../MiniMap";
import { IBasicFeature, IPoint, IPixelPos, IProps, IRelativePos, ISize } from "../Interface";
import { getLenOfTwoPnts, getRotatePnt, getUuid } from "../utils";
import AnchorPnt from "./function-shape/AnchorPnt";
import gsap from "gsap";

class Feature {

    static Gls: GridSystem;  // GridSystem实例
    static TargetRender: GridSystem | MiniMap | null = null;  // 当前画布实例是哪一个  GridSystem实例 或 MiniMap实例
    static getRectWrapExtent(pointArr: IPoint[]): number[] {  // 获取元素包围盒矩形的上下左右边距
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        for (const point of pointArr) {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        }
        return [minX, maxX, minY, maxY];
    }
    static getRectWrapPoints(pointArr: IPoint[]): IPoint[] { // [leftTop, rightTop, rightBottom, leftBottom]  获取元素包围盒矩形的四个点
        const [minX, maxX, minY, maxY] = Feature.getRectWrapExtent(pointArr);
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
    static getCenterPos(pointArr: IPoint[]): IPoint {  // 获取元素包围盒的中心点
        const [minX, maxX, minY, maxY] = Feature.getRectWrapExtent(pointArr);
        return {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2,
        }
    }

    pointArr: IRelativePos[] = [];
    fillStyle: string = 'transparent';
    strokeStyle: string = '#f08c00';
    hoverStyle: string = '#fff1b5';
    focusStyle: string = '#fff1b5';
    zIndex: number = 0;
    lineWidth: number = .5;
    lineCap: CanvasLineCap = "round"   // 线段端点处的样式 butt, round, square
    lineJoin: CanvasLineJoin = "round"  // 线段之间连接处的样式 butt, round, square
    opacity: number = 1; // 整体透明度
    lineDashArr: number[] = [];  // 虚线
    lineDashOffset: number = 0; // 虚线位移

    className = 'Feature'  //类名
    id: string  // id,元素的唯一标识
    name: string = ''  // 元素的name, 给当前元素起个名字
    hidden: boolean = false;   // 是否隐藏元素,跳过渲染
    position: IRelativePos = { x: 0, y: 0 }  // 元素包围盒的中心点, 一般Rect类型用
    size: ISize = { width: 0, height: 0 }  // 元素包围盒的宽高
    scale: IPoint = { x: 1, y: 1 }; // 元素缩放, [暂未用到]
    angle: number = 0; // 元素旋转的角度
    radius: number = 0; // 元素的圆角大小, 一般Rect类型用

    parent: Feature | null = null;  // 元素的父元素
    children: IBasicFeature[] = [];  // 元素的子元素们
    gls: GridSystem = Feature.Gls;  // GridSystem的实例
    adsorbTypes = ["grid"];  // 移动时吸附规则  "grid", "feature"
    pntMinDistance = 2;  // 元素添加时,俩点之间太近就不添加,设置的最小距离参数
    pntExtentPerOfBBox: {  // 元素距离包围盒的上下左右边距的百分比
        left: IPoint[],
        right: IPoint[]
    } = {
            left: [], // pointArr距离左边百分比
            right: [], // pointArr距离上边百分比
        }

    // 节点状态
    isClosePath: boolean = false;  // 是否闭合
    isPointIn: boolean = false; //鼠标是否悬浮在元素上
    isFocused: boolean = false; //元素是否处于焦点状态, 鼠标按在这个元素身上
    isFixedPos: boolean = false;  // 元素是否固定位置,不随画布拖动而移动
    isFixedSize: boolean = false;  // 元素是否固定大小, 不随画布缩放而缩放
    isOutScreen: boolean = false;  // 元素是否超出了画布范围
    isOverflowHidden: boolean = false;  // 子元素超出元素范围,是否隐藏(裁剪掉)
    isStroke: boolean = true;  // 元素是否绘制边框
    isOnlyCenterAdsorb: boolean = false;  // 元素吸附是否只以包围盒的中心点对其
    isOnlyHorizonalMove: boolean = false;  // 元素是否只能水平方向拖拽(移动)
    isOnlyVerticalMove: boolean = false;  // 元素是否只能垂直方向拖拽(移动)
    isHorizonalRevert = false;  // 元素是否水平翻转了(用于确定元素左上角的点)
    isVerticalRevert = false;  // 元素是否垂直翻转了(用于确定元素左上角的点)

    // 节点功能
    cbCapture: boolean = true;  // 元素是否可被鼠标捕获
    cbSelect: boolean = true;  // 元素是否可被选中
    cbTranslate: boolean = true;  // 元素是否可被移动
    cbTransform: boolean = true;  // 元素是否可被形变缩放
    cbTransformChild: boolean = true; // 元素的子元素是否可被形变缩放

    // // 节点事件
    // ondelete: Function | null = null;

    onTranslate: Function | null = null;  // 移动时,包含draging时
    translateEvents: Function[] = [];
    onMouseover: Function | null = null;  // 鼠标悬浮后就会被调用
    mouseoverEvents: Function[] = [];
    onMousemove: Function | null = null;  // 在元素上移动触发
    mousemoveEvents: Function[] = [];
    onMousedown: Function | null = null;  // 鼠标点击后就会被调用
    mousedownEvents: Function[] = [];
    onMouseup: Function | null = null;  // 鼠标松开后就会被调用
    mouseupEvents: Function[] = [];
    onMouseleave: Function | null = null;  // 鼠标离开后就会被调用
    mouseleaveEvents: Function[] = [];
    onDbclick: Function | null = null;  // 鼠标双击后就会被调用
    dbclickEvents: Function[] = [];
    onDragend: Function | null = null;  // 拖拽中的事件
    dragendEvents: Function[] = [];
    onDrag: Function | null = null;  // 拖拽中的事件
    dragEvents: Function[] = [];
    onResize: Function | null = null;  // 宽高更新后触发的事件， 控制点控制的
    resizeEvents: Function[] = [];
    onDraw: Function | null = null;  // 每次绘制触发
    drawEvents: Function[] = [];
    onRotate: Function | null = null;  // 旋转时
    rotateEvents: Function[] = [];
    onDelete: Function | null = null;  // 删除的时候
    deleteEvents: Function[] = [];
    onBlur: Function | null = null;  // 删除的时候
    blurEvents: Function[] = [];

    _orientations: Orientation[] | null = null;   // 对齐的方向， 上下左右

    constructor(pointArr: IRelativePos[] = []) {
        // 相对坐标
        this.pointArr = pointArr;
        this.id = getUuid();
    }

    /**
     * 旋转元素
     * @param angle 要旋转的角度
     * @param O 旋转所围绕的中心点
     */
    rotate(angle: number = this.angle, O: IPoint = Feature.getCenterPos(this.pointArr)) {
        this.pointArr = this.getPointArr(this.pointArr, angle, O)
        this.angle += angle;
        this.children.forEach(cf => {  // 子元素递归旋转
            cf.rotate(angle, O)
        })
        this.onrotate && this.onrotate();
    }

    /**
     * 元素位移
     * @param offsetX 
     * @param offsetY 
     * @returns 
     */
    translate(offsetX: number = 0, offsetY: number = 0) {
        if (!this.cbTranslate) return;
        this.pointArr = this.pointArr.map(p => {
            return {
                x: !this.isOnlyVerticalMove ? p.x += offsetX : p.x,
                y: !this.isOnlyHorizonalMove ? p.y += offsetY : p.y
            }
        })
        // 照顾fixedSize元素
        this.position.x += offsetX;
        this.position.y += offsetY;
        if (this.children) {  // 子元素递归偏移
            this.children.forEach(cf => cf.translate(offsetX, offsetY))
        }
        this.ontranslate();
    }

    /**
     * 元素渲染到画布上
     * @param ctx canvas 上下文
     * @param pointArr 元素的点坐标
     * @param lineWidth 元素的边框,线段粗细
     * @param r 元素的圆角 一般Rect用
     * @returns 
     */
    draw(ctx: CanvasRenderingContext2D, pointArr: IPixelPos[], lineWidth: number, radius: number) {
        const path = new Path2D();
        pointArr.forEach((p, i) => {
            if (i == 0) {
                path.moveTo(p.x, p.y)
            } else {
                path.lineTo(p.x, p.y)
            }
        })
        ctx.save()
        this.isClosePath && path.closePath()
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
        this.isClosePath && ctx.fill(path);
        this.drawAdsorbLine(ctx, pointArr)
        this.setPointIn(ctx, path)
        ctx.restore();
        return path;
    }

    /**
     * 判断鼠标是否悬浮到元素上
     * @param ctx 
     * @param path 
     */
    setPointIn(ctx: CanvasRenderingContext2D, path?: Path2D) {
        if (Feature.TargetRender && Feature.TargetRender?.className === 'GridSystem') {
            if (this.cbCapture && this.gls.cbSelectFeature) {
                const mousePos = this.gls.mousePos;
                let isPointIn = false;
                if (this.isClosePath) {
                    isPointIn = path ? ctx.isPointInPath(path, mousePos.x, mousePos.y) : ctx.isPointInPath(mousePos.x, mousePos.y)
                } else {
                    isPointIn = path ? ctx.isPointInStroke(path, mousePos.x, mousePos.y) : ctx.isPointInStroke(mousePos.x, mousePos.y)
                }
                if (!this.isPointIn && isPointIn) {  // 判断是不是第一次进入，是就是mouseover
                    this.onmouseover && this.onmouseover();
                } else if (this.isPointIn && !isPointIn) {
                    this.onmouseleave && this.onmouseleave();
                }
                this.isPointIn = isPointIn;
                this.isPointIn && this.onmousemove && this.onmousemove();
            }
        }
    }

    /**
     * 元素添加点坐标
     * @param point 坐标点
     * @param isLimitDistance 两点之间最小距离
     * @returns 
     */
    addPoint(point: IRelativePos, isLimitDistance = this.pntMinDistance > 0) {
        if (isLimitDistance) {
            const prevPnt = this.pointArr[this.pointArr.length - 1];
            if (prevPnt && getLenOfTwoPnts(point, prevPnt) < this.pntMinDistance) {
                console.warn("两点距离太近了, 就不添加了!");
                return;
            }
        }
        this.pointArr.push(point);
    }

    /**
     * 元素添加子元素
     * @param feature 子元素
     * @param props 给子元素额外设置的属性
     * @returns 
     */
    addChild(feature: IBasicFeature, props: Partial<IProps> = {}, translate = true) {
        if (translate) {
            const [leftTop] = Feature.getRectWrapPoints(this.pointArr);
            feature.translate(leftTop.x, leftTop.y);   // 移动到父元素左上角
        }
        if (this.children.find(cf => cf === feature)) return;  // 非基础元素不添加 或者 已经存在
        this.children.push(feature);
        feature.parent = this;
        feature.isFixedPos = this.isFixedPos;
        function setProps(f: Feature) {   // 递归设置子元素属性
            if (props) {
                props.cbSelect != undefined && (f.cbSelect = props.cbSelect);
                props.cbCapture != undefined && (f.cbCapture = props.cbCapture);
                props.angle != undefined && (f.angle = props.angle);
            }
            f.children.forEach(cf => { setProps(cf) })
        }
        setProps(feature);
        if (!this.gls.features.find(f => f === feature)) {
            this.gls.addFeature(feature, true)
        }
    }
    removeChild(feature: Feature) { // 删除指定子元素
        feature.parent = null;
        this.children.splice(this.children.findIndex(cf => cf == feature), 1);
    }

    toFixedPos() {  // 元素变为固定位置
        if (!this.isFixedPos) {
            const { x, y } = this.gls.getPixelPos({ x: this.position.x, y: this.position.y });
            this.position.x = x;
            this.position.y = y;
        }
        this.isFixedPos = true;
    }
    toRelativePos() {  // 元素变为相对位置
        if (this.isFixedPos) {
            const { x, y } = this.gls.getRelativePos({ x: this.position.x, y: this.position.y });
            this.position.x = x;
            this.position.y = y;
        }
        this.isFixedPos = false;
    }

    /**
     * 元素导出Svg格式
     * @param pointArr 
     * @param lineWidth 
     * @returns 
     */
    getSvg(pointArr: IPixelPos[] = [], lineWidth: number = 1) {
        let path = ''
        pointArr.forEach((p, i) => {
            if (i === 0) {
                path += `M ${p.x} ${p.y} `
            } else {
                path += `L ${p.x} ${p.y} `
            }
        })
        if (this.isClosePath) {
            path += ' Z'
        }
        return `<path d="${path}" stroke="${this.strokeStyle}" stroke-width="${lineWidth}" fill="${this.isClosePath ? this.fillStyle : 'transparent'}" stroke-linecap="${this.lineCap}" stroke-linejoin="${this.lineJoin}" stroke-dasharray="${this.lineDashArr}" stroke-dashoffset="${this.lineDashOffset}"/>`
    }

    /**
     * 元素的镜像翻转
     * @param direction 翻转的方向
     * @param center 翻转围绕的中心点
     * @param isParent 是否是主元素,因为子元素也要跟着翻转
     */
    revert(direction: AlignType, center?: IPoint, isParent = true) {
        if (!center) center = Feature.getCenterPos(this.pointArr);  // 获取包围盒中心点
        this.children.forEach(cf => {  // 遍历子元素翻转,如果他有子元素的话
            cf.revert(direction, center, false)
        })
        switch (direction) {
            case AlignType.HORIZONAL: {  // 水平翻转
                const centerPos = center as IPoint;
                this.pointArr = this.pointArr.map(p => {
                    return { x: 2 * centerPos.x - p.x, y: p.y }
                })
                this.isHorizonalRevert = !this.isHorizonalRevert;
                this.angle = 360 - this.angle;
                break;
            }
            case AlignType.VERTICAL: { // 垂直翻转
                const centerPos = center as IPoint;
                this.pointArr = this.pointArr.map(p => {
                    return { x: p.x, y: 2 * centerPos.y - p.y }
                })
                this.isVerticalRevert = !this.isVerticalRevert;
                this.angle = 360 - this.angle;
                break;
            }
            default:
                break;
        }
        if (isParent) {
            this.gls.enableBbox();
            this.gls.enableBbox(this);
        }
    }

    // --------------------元素鼠标事件相关----------------
    onmouseover(e?: any) {
        this.mouseoverEvents.forEach(f => { f(e) })
        this.onMouseover && this.onMouseover(e);
    }
    onmousemove(e?: any) {
        this.mousemoveEvents.forEach(f => { f(e) })
        this.onMousemove && this.onMousemove(e);
    }
    onmousedown(e?: any) {
        this.mousedownEvents.forEach(f => { f(e) })
        this.onMousedown && this.onMousedown(e);
    }
    onmouseup(e?: any) {
        this.mouseupEvents.forEach(f => { f(e) })
        this.onMouseup && this.onMouseup(e);
    }
    onmouseleave(e?: any) {
        this.children.forEach(cf => {
            cf.onmouseleave(e)
        })
        this.mouseleaveEvents.forEach(f => { f(e) })
        this.onMouseleave && this.onMouseleave(e);
    }
    ondbclick(e?: any) {
        this.children.forEach(cf => {
            cf.ondbclick(e)
        })
        this.dbclickEvents.forEach(f => { f(e) })
        this.onDbclick && this.onDbclick(e);
    }
    // --------------------元素绘制相关----------------
    ontranslate(e?: any) {
        this.children.forEach(cf => {
            cf.ontranslate(e)
        })
        this.translateEvents.forEach(f => { f(e) })
        this.onTranslate && this.onTranslate(e);
    }
    onresize(type?: CtrlType) {
        this.children.forEach(cf => {
            cf.onresize(type)
        })
        this.resizeEvents.forEach(f => { f(type) })
        this.onResize && this.onResize(type);
    }
    ondraw(e?: any) {
        this.children.forEach(cf => {
            cf.ondraw(e)
        })
        this.drawEvents.forEach(f => { f(e) })
        this.onDraw && this.onDraw(e);
    }
    onrotate(e?: any) {
        this.children.forEach(cf => {
            cf.onrotate(e)
        })
        this.rotateEvents.forEach(f => { f(e) })
        this.onRotate && this.onRotate(e);
    }
    ondragend(e?: any) {
        this.children.forEach(cf => {
            cf.ondragend(e)
        })
        this.dragendEvents.forEach(f => { f(e) })
        this.onDragend && this.onDragend(e);
    }
    ondrag(e?: any) {
        this.dragEvents.forEach(f => { f(e) })
        this.onDrag && this.onDrag(e);
    }
    // --------------------元素操作相关----------------
    ondelete(e?: any) {
        this.deleteEvents.forEach(f => { f(e) })
        this.onDelete && this.onDelete(e);
    }
    // 只作用于基础元素
    onblur(e?: any) {
        this.blurEvents.forEach(f => { f(e) })
        this.onBlur && this.onBlur(e);
    }

    destroy() {
        this.children.forEach(cf => {
            this.gls.removeFeature(cf, false);
        })
    };


    drawAdsorbLine(ctx: CanvasRenderingContext2D, pointArr: IPixelPos[]) {   // 吸附的对齐线
        if (Feature.TargetRender && Feature.TargetRender.className === 'GridSystem' && this.gls.cbAdsorption && this.adsorbTypes.length > 0 && this.gls.isShowAdsorbLine) {
            const [leftX, rightX, topY, bottomY] = Feature.getRectWrapExtent(pointArr);
            const { x: centerX, y: centerY } = Feature.getCenterPos(pointArr);
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
                ctx.strokeStyle = "rgba(254, 0, 0)";
                ctx.lineWidth = .7;
                ctx.setLineDash([8, 8]);
                ctx.stroke();
                ctx.restore();
            }
        }
    }

    getAnchorPnts(): AnchorPnt[] {
        return this.gls.features.filter(f => f.className == 'AnchorPnt' && f.parent == this) as AnchorPnt[];
    }

    toCenter(feature: Feature) { // 将元素移动到画中间
        const { x, y } = this.gls.getPixelPos(Feature.getCenterPos(feature.pointArr));
        const { x: distX, y: distY } = this.gls.getCenterDist({ x, y })
        gsap.to(this.gls.pageSlicePos, {
            duration: 0.25,
            x: this.gls.pageSlicePos.x + distX,
            y: this.gls.pageSlicePos.y + distY,
            ease: "slow.out",
        })
    }

    getPointArr(pointArr = this.pointArr, angle = 0, O: IPoint) { // 一个点围绕某个点旋转angle角度, 返回旋转后的pointArr
        if (angle === 0) {
            return pointArr;
        }
        return pointArr.map(p => {
            return getRotatePnt(O, p, angle)
        })
    }

    rotateCtx = (ctx: CanvasRenderingContext2D, O: IPoint, angle = this.angle) => { // 以O点去旋转内容，文字或者图片
        if (angle) {
            ctx.translate(O.x, O.y)
            ctx.rotate(angle * Math.PI / 180)
            ctx.translate(-O.x, -O.y)
        }
    }

}

export default Feature;