import Feature from "../Feature";
import { IPoint, IPixelPos, IRelativePos, ITxt } from "../../Interface";
import SCtrlPnt from "../function-shape/ctrl-pnts/SCtrlPnt";
import { getAngleOfTwoPnts, getMidOfTwoPnts } from "@/utils";
import { FontFamily } from "@/Constants";

class Line extends Feature {

    static freeLineConfig = {  // 自由画笔线条粗细参数配置
        maxWidth: .3,
        minWidth: .03,
        maxSpeed: 1.5,
        minSpeed: 0.1,
    }

    isFreeStyle: boolean = false;
    lineWidthArr: number[] = [];
    curveCtrlPnt: SCtrlPnt[] = [];
    actualPointArr: IPixelPos[] | null = null;   // 实际渲染到画布上的点集合

    tipInfo: ITxt = {
        txt: '',
        fontSize: 2,
        color: "rgba(174, 253, 181)",
        offset: { x: 0, y: 0 },
        fontFamily: FontFamily.HEITI,
        bolder: false,
    };

    constructor(pointArr: IRelativePos[] = []) {
        super(pointArr);
        this.className = "Line";
        this.isClosePath = false;
        this.hoverStyle = '#F8EA7A'
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPixelPos[], lineWidth: number, radius: number) {
        const path = new Path2D();
        ctx.save()
        ctx.globalAlpha = this.opacity;
        if (this.isFreeStyle) {
            pointArr.forEach((p, i) => {
                if (i > 1) {
                    ctx.beginPath();
                    const { x: centerX, y: centerY } = pointArr[i - 1]
                    const { x: endX, y: endY } = p;
                    const { x: startX, y: startY } = pointArr[i - 2]
                    const [lastX, lastY] = [(startX + centerX) / 2, (startY + centerY) / 2]
                    const [x, y] = [(centerX + endX) / 2, (centerY + endY) / 2]
                    ctx.beginPath();
                    ctx.moveTo(lastX, lastY);
                    ctx.quadraticCurveTo(centerX, centerY, x, y);
                    ctx.lineWidth = this.gls.getRatioSize(this.lineWidthArr[i] || this.lineWidthArr[i - 1] || .2);
                    if (this.isPointIn) {
                        ctx.strokeStyle = this.hoverStyle;
                        if (this.gls.focusNode === this) {
                            ctx.strokeStyle = this.focusStyle;
                        }
                    } else {
                        ctx.strokeStyle = this.strokeStyle;
                    }
                    // ctx.strokeStyle = this.strokeStyle;
                    ctx.lineCap = this.lineCap;
                    ctx.stroke();
                }
            });
        }
        ctx.beginPath();
        pointArr.forEach((p, i) => {
            if (i == 0) {
                path.moveTo(p.x, p.y)
            } else {
                // if (this.curveCtrlPnt[i]) {
                //     const center = this.gls.getPixelPos(Feature.getCenterPos(this.curveCtrlPnt[i].pointArr));
                //     path.quadraticCurveTo(center.x, center.y, p.x, p.y)
                // } else {
                path.lineTo(p.x, p.y)
                // }
            }
        })
        this.isClosePath && path.closePath()
        if (!this.isFreeStyle) {
            if (this.isPointIn) {
                ctx.strokeStyle = this.hoverStyle;
                if (this.gls.focusNode === this) {
                    ctx.strokeStyle = this.focusStyle;
                }
            } else {
                ctx.strokeStyle = this.strokeStyle;
            }
        } else {
            ctx.strokeStyle = "transparent"
        }
        ctx.lineCap = this.lineCap;
        ctx.lineJoin = this.lineJoin;
        ctx.lineDashOffset = this.lineDashOffset;
        this.lineDashArr.length > 0 && ctx.setLineDash(this.lineDashArr);
        ctx.lineWidth = lineWidth;
        ctx.stroke(path);
        ctx.fillStyle = this.fillStyle
        this.isClosePath && ctx.fill(path);
        this.setPointIn(ctx, path);
        if (this.tipInfo.txt && pointArr.length > 1) {
            this.drawTip(ctx, this.getTwoPntByTip(pointArr), lineWidth);
        }
        ctx.restore()
        return path;
    }

    getTwoPntByTip(pointArr: IPixelPos[]): [IPoint, IPoint] {
        return [pointArr[0], pointArr[pointArr.length - 1]]
    }

    drawTip(ctx: CanvasRenderingContext2D, pointArr: [IPoint, IPoint], lineWidth = 0) {
        if (pointArr.length == 2 && this.tipInfo.txt) {  // 只接受起点和终点, 文本
            const startP = pointArr[0];
            const endP = pointArr[1];
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

    enableCtrlPnts(bool = true) {
        this.clearCtrlPos();
        if (bool) {
            this.pointArr.forEach((p, i) => {
                new SCtrlPnt(this, i);
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

    getCtrlPnts() {
        const ctrlPnts = this.gls.features.filter(f => (f instanceof SCtrlPnt || f instanceof SCtrlPnt) && f.parent === this);
        return ctrlPnts;
    }

    getPointOfPer(per: number) {  // 获取选段百分之多少处的点 per: 0~1
        const pointArr = this.actualPointArr || this.pointArr;
        const index = Math.round(pointArr.length * per);
        return pointArr[index]
    }

    getSvg(pointArr: IPixelPos[] = [], lineWidth: number = 1) {
        let path = ''
        if (this.isFreeStyle) {  // 自由画笔
            pointArr.forEach((p, i) => {
                if (i > 1) {
                    const { x: centerX, y: centerY } = pointArr[i - 1]
                    const { x: endX, y: endY } = p;
                    const { x: startX, y: startY } = pointArr[i - 2]
                    const [lastX, lastY] = [(startX + centerX) / 2, (startY + centerY) / 2]
                    const [x, y] = [(centerX + endX) / 2, (centerY + endY) / 2]
                    const lineWidth2 = this.lineWidthArr[i] * 2 || this.lineWidthArr[i - 1] || .2;
                    path += `<path d="M ${lastX} ${lastY} Q ${centerX} ${centerY} ${x} ${y}" stroke="${this.strokeStyle}" stroke-width="${this.gls.getRatioSize(lineWidth2) * .8}" stroke-linecap="${this.lineCap}" stroke-linejoin="${this.lineJoin}" stroke-dasharray="${this.lineDashArr}" stroke-dashoffset="${this.lineDashOffset}"/>`
                }
            })
            return path;
        } else {
            let path = super.getSvg(pointArr, lineWidth);
            if (this.tipInfo.txt) {
                const [startP, endP] = this.getTwoPntByTip(pointArr);
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
    }

    destroy(): void {
        super.destroy();
        this.clearCtrlPos();
    }
}

export default Line;