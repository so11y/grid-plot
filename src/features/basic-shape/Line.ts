import Feature from "../Feature";
import { IPoint } from "../../Interface";
import CtrlPnt from "../function-shape/ctrl-pnts/CtrlPnt";
import { getMidOfTwoPnts } from "@/utils";
// import CtrlPnt from "../function-shape/ctrl-pnts/CtrlPnt";

class Line extends Feature {

    static freeLineConfig = {  // 自由画笔线条粗细参数配置
        maxWidth: .3,
        minWidth: .03,
        maxSpeed: 1.5,
        minSpeed: 0.1,
    }

    isFreeStyle: boolean = false;
    lineWidthArr: number[] = [];
    curveCtrlPnt: CtrlPnt[] = [];

    constructor(pointArr: IPoint[] = []) {
        super(pointArr);
        this.className = "Line";
        this.closePath = false;
        this.hoverStyle = '#F8EA7A'
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPoint[], lineWidth: number, r: number) {
        let path = new Path2D();
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
                //     let center = this.gls.getPixelPos(this.curveCtrlPnt[i].getCenterPos());
                //     path.quadraticCurveTo(center.x, center.y, p.x, p.y)
                // } else {
                    path.lineTo(p.x, p.y)
                // }
            }
        })
        this.closePath && path.closePath()
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
        this.closePath && ctx.fill(path);
        this.setPointIn(ctx, path);
        ctx.restore()
        return path;
    }

    enableCtrlPnts(bool = true) {
        this.clearCtrlPos();
        if (bool) {
            this.pointArr.forEach((p, i) => {
                new CtrlPnt(this, i);
                // if (i > 0) {
                    // let centerPos = getMidOfTwoPnts(p, this.pointArr[i - 1])
                    // let ccp = new CtrlPnt(this, i);
                    // this.addFeature(ccp, true)  // 这里是为了方便同时移动
                    // this.curveCtrlPnt[i] = ccp;
                // }
            })
        }else {
            this.clearCtrlPos();
        }
        console.log(this.children, this.curveCtrlPnt);
    }

    clearCtrlPos() {
        let ctrlPnts = this.getCtrlPnts();
        ctrlPnts.forEach(cp => {
            this.gls.removeFeature(cp, false);
        })
    }

    getCtrlPnts() {
        let ctrlPnts = this.gls.features.filter(f => (f instanceof CtrlPnt || f instanceof CtrlPnt) && f.parent === this);
        return ctrlPnts;
    }

    getSvg(pointArr: IPoint[] = [], lineWidth: number = 1) {
        let path = ''
        if (this.isFreeStyle) {
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
            pointArr.forEach((p, i) => {
                if (i === 0) {
                    path += `M ${p.x} ${p.y} `
                } else {
                    path += `L ${p.x} ${p.y} `
                }
            })
            if (this.closePath) {
                path += ' Z'
            }
            return `<path d="${path}" stroke="${this.strokeStyle}" stroke-width="${lineWidth}" fill="${this.closePath ? this.fillStyle : 'transparent'}" stroke-linecap="${this.lineCap}" stroke-linejoin="${this.lineJoin}" stroke-dasharray="${this.lineDashArr}" stroke-dashoffset="${this.lineDashOffset}"/>`
        }
    }

    destroy(): void {
        super.destroy();
        this.clearCtrlPos();
    }
}

export default Line;