import Feature from "../Feature";
import { IPoint, IPixelPos, IRelativePos } from "../../Interface";
import { ClassName } from "@/Constants";

// 线段元素
class Pen extends Feature {

    static freeLineConfig = {  // 自由画笔线条粗细参数配置
        maxWidth: .3,
        minWidth: .03,
        maxSpeed: 1.5,
        minSpeed: 0.1,
    }

    lineWidthArr: number[] = [];

    constructor(pointArr: IRelativePos[] = []) {
        super(pointArr);
        this.className = ClassName.PEN;
        this.hoverStyle = '#F8EA7A'
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPixelPos[], lineWidth: number, lineDashArr: number[], radius: number) {
        const path = new Path2D();
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
        // ctx.save()
        // ctx.globalAlpha = this.opacity;
        // ctx.lineCap = this.lineCap;
        // ctx.lineJoin = this.lineJoin;
        // ctx.lineDashOffset = this.lineDashOffset;
        // lineDashArr.length > 0 && ctx.setLineDash(lineDashArr);
        // ctx.lineWidth = lineWidth;
        // ctx.stroke(path);
        // this.setPointIn(ctx, path);
        this.flowLineDash();
        // ctx.restore()
        return path;
    }

    getSvg(pointArr: IPixelPos[] = [], lineWidth: number = 1) {
        let path = ''
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
    }
}

export default Pen;