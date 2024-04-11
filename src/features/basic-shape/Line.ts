import Feature from "../Feature";
import { IPoint, IPixelPos, IRelativePos, ITxt } from "../../Interface";
import SCtrlPnt from "../function-shape/ctrl-pnts/SCtrlPnt";
import { getAngleOfTwoPnts, getMidOfTwoPnts, getPntsOf2Bezier } from "@/utils";
import { ClassName, Events, FontFamily } from "@/Constants";
import BCtrlPnt from "../function-shape/ctrl-pnts/BCtrlPnt";
import ACtrlPnt from "../function-shape/ctrl-pnts/ACtrlPnt";

// 线段元素
class Line extends Feature {

    lineWidthArr: number[] = [];
    curveCtrlPnt: SCtrlPnt[] = [];
    actualPointArr: IPixelPos[] | null = null;   // 实际渲染到画布上的点集合

    tipInfo: ITxt = {
        hidden: true,
        txt: '',
        fontSize: 1.5,
        color: "rgba(174, 253, 181)",
        offset: { x: 0, y: 0 },
        fontFamily: FontFamily.HEITI,
        bolder: false,
    };

    constructor(pointArr: IRelativePos[] = []) {
        super(pointArr);
        this.className = ClassName.LINE;
        this.isClosePath = false;
        this.hoverStyle = '#F8EA7A'
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPixelPos[], lineWidth: number, lineDashArr: number[], radius: number) {
        const path = new Path2D();
        ctx.save()
        ctx.globalAlpha = this.opacity;
        pointArr.forEach((p, i) => {
            if (i == 0) {
                path.moveTo(p.x, p.y)
            } else {
                path.lineTo(p.x, p.y)
            }
        })
        this.isClosePath && path.closePath()
        if (this.isPointIn) {
            ctx.strokeStyle = this.hoverStyle;
            if (this.gls.focusNode === this) {
                ctx.strokeStyle = this.focusStyle;
            }
        } else {
            ctx.strokeStyle = this.strokeStyle;
        }
        ctx.lineCap = this.lineCap;
        ctx.lineJoin = this.lineJoin;
        ctx.lineDashOffset = this.lineDashOffset;
        lineDashArr.length > 0 && ctx.setLineDash(lineDashArr);
        ctx.lineWidth = lineWidth;
        ctx.stroke(path);
        ctx.fillStyle = this.fillStyle
        this.isClosePath && ctx.fill(path);
        this.setPointIn(ctx, path);
        this.drawTip(ctx, this.getTwoPntOfTip(pointArr), lineWidth);
        this.flowLineDash();
        ctx.restore()
        return path;
    }

    getTwoPntOfTip(pointArr: IPixelPos[]): [IPoint, IPoint] {
        return [pointArr[0], pointArr[pointArr.length - 1]]
    }

    drawTip(ctx: CanvasRenderingContext2D, pointArr: [IPoint, IPoint], lineWidth = 0) {
        const startP = pointArr[0];
        const endP = pointArr[1];
        if (startP && endP && !this.tipInfo.hidden) {  // 只接受起点和终点, 文本
            const center = getMidOfTwoPnts(startP, endP);
            let angle = getAngleOfTwoPnts(startP, endP);   // 获取两个点 水平方向上的角度
            if (angle > 90 && angle < 180 || angle < -90 && angle > -180) {
                angle += 180  // 镜像翻转,文字始终朝上
            }
            ctx.save()
            ctx.font = `${this.gls.getRatioSize(this.tipInfo.fontSize)}px ${this.tipInfo.fontFamily}`;
            const { width } = ctx.measureText(this.tipInfo.txt);  // 文本的宽度
            ctx.fillStyle = this.tipInfo.color;
            this.rotateCtx(ctx, center, angle);
            ctx.fillText(this.tipInfo.txt, center.x - width / 2 + this.tipInfo.offset.x, center.y - lineWidth + this.tipInfo.offset.y);
            ctx.fill();
            ctx.restore()
        }
    }

    getCurvePoints(pointArr: IRelativePos[]) {
        const pointArrs = []
        const bctrls = this.getBCtrlPnts();
        for (let index = 0; index < bctrls.length; index++) {
            pointArrs.push(pointArr[index])
            const ctrl = bctrls[index];
            const center = Feature.getCenterPos(ctrl.pointArr);
            const prevP = pointArr[index];
            const curP = pointArr[index + 1];
            const points = getPntsOf2Bezier(prevP, center, curP, 20);
            pointArrs.push(...points)
        }
        pointArrs.push(pointArr[pointArr.length - 1])
        console.log(pointArrs);
        return pointArrs;
    }
    enableCtrlPnts(bool = true) {
        this.clearCtrlPos();
        if (bool) {
            const originPointArr = this.pointArr.filter(p => p.flag);
            originPointArr.forEach((p, i) => {
                if (i > 0) {
                    const bezierCtrl = new BCtrlPnt(this, () => {
                        const prevPnt = originPointArr[i - 1];
                        const curP = originPointArr[i];
                        const mid = getMidOfTwoPnts(prevPnt, curP);
                        return mid;
                    });
                    bezierCtrl.on(Events.TRANSLATE, () => {
                        this.pointArr = this.getCurvePoints(originPointArr);
                    })
                }
                const pntCtrl = new ACtrlPnt(this, () => {
                    const originPointArrs = this.pointArr.filter(p => p.flag);
                    return originPointArrs[i]
                });
                pntCtrl.on(Events.TRANSLATE, () => {
                    originPointArr[i].x = Feature.getCenterPos(pntCtrl.pointArr).x;
                    originPointArr[i].y = Feature.getCenterPos(pntCtrl.pointArr).y;
                    this.pointArr = this.getCurvePoints(originPointArr);
                })
            })
        } else {
            this.clearCtrlPos();
        }
    }
    clearCtrlPos() {
        const ctrlPnts = this.getCtrlPnts();
        ctrlPnts.forEach(cp => {
            this.gls.removeFeature(cp, false);
        })
    }

    getBCtrlPnts(): BCtrlPnt[] {
        return this.gls.features.filter(f => (f.className == ClassName.BCTRLPNT || f.className == ClassName.ACTRLPNT) && f.parent == this) as BCtrlPnt[];
    }

    // 每两点插入一个中点
    insertMidpoints(pointArr = this.pointArr) {
        // 结果数组，用来存放插入中点后的坐标  
        const newPointArr = [];
        // 遍历坐标数组  
        for (let i = 0; i < pointArr.length - 1; i++) {
            // 获取当前点和下一点  
            const current = pointArr[i];
            const next = pointArr[i + 1];
            // 计算中间点  
            const midpoint = {
                x: (current.x + next.x) / 2,
                y: (current.y + next.y) / 2
            };
            // 将当前点和中点加入结果数组  
            newPointArr.push(current);
            newPointArr.push(midpoint);
        }
        // 最后一个点不需要再计算中点，直接添加到结果数组  
        newPointArr.push(pointArr[pointArr.length - 1]);
        this.pointArr = newPointArr;
    }

    getPointOfPer(per: number) {  // 获取选段百分之多少处的点 per: 0~1
        const pointArr = this.actualPointArr || this.pointArr;
        const index = Math.round(pointArr.length * per);
        return pointArr[index]
    }

    getSvg(pointArr: IPixelPos[] = [], lineWidth: number = 1) {
        let path = super.getSvg(pointArr, lineWidth);
        if (this.tipInfo.txt) {
            const [startP, endP] = this.getTwoPntOfTip(pointArr);
            const center = getMidOfTwoPnts(startP, endP);
            let angle = getAngleOfTwoPnts(startP, endP);   // 获取两个点 水平方向上的角度
            if (angle > 90 && angle < 180 || angle < -90 && angle > -180) {
                angle += 180  // 镜像翻转,文字始终朝上
            }
            const fontSize = this.gls.getRatioSize(this.tipInfo.fontSize);
            const width = fontSize * this.tipInfo.txt.length;
            path += `
                <g transform="rotate(${angle} ${center.x} ${center.y})">
                <text x="${center.x - width / 2}" y="${center.y}" dominant-baseline="hanging" style="fill:${this.tipInfo.color}; font-family: '${this.tipInfo.fontFamily}'; font-size: ${fontSize}; font-weight:${this.tipInfo.bolder ? 'bolder' : ''};"
                >${this.tipInfo.txt}</text>
                </g>`
        }
        return path;
    }

    destroy(): void {
        super.destroy();
        this.clearCtrlPos();
    }
}

export default Line;