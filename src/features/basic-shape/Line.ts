import Feature from "../Feature";
import { IPoint } from "../../Interface";
import CtrlPnt from "../function-shape/CtrlPnt";
import GridSystem from "@/GridSystem";

class Line extends Feature {

    isFreeStyle: boolean = false;
    lineWidthArr: number[] = [];

    constructor(pointArr: IPoint[] = []) {
        super(pointArr);
        this.className = "Line";
        this.closePath = false;
        this.lineCap = "round"
        this.lineJoin = "round";
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPoint[], lineWidth: number) {
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
                    ctx.strokeStyle = this.strokeStyle;
                    ctx.lineCap = this.lineCap;
                    ctx.stroke();
                }
            });
        } else {
            ctx.beginPath();
            pointArr.forEach((p, i) => {
                if (i == 0) {
                    path.moveTo(p.x, p.y)
                } else {
                    path.lineTo(p.x, p.y)
                }
            })
            this.closePath && path.closePath()
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
            this.lineDashArr.length > 0 && ctx.setLineDash(this.lineDashArr);
            ctx.lineWidth = lineWidth;
            ctx.stroke(path);
            ctx.fillStyle = this.fillStyle
            this.closePath && ctx.fill(path);
        }
        this.setPointIn(ctx, path);
        ctx.restore()
        return path;
    }

    enableCtrlPnts() {
        this.pointArr.forEach((p, i) => {
            new CtrlPnt(this, i);
        })
    }

    clearCtrlPos() {
        let ctrlPnts = this.gls.features.filter(f => f instanceof CtrlPnt && f.parent === this);
        ctrlPnts.forEach(cp => {
            this.gls.removeFeature(cp, false);
        })
    }

    getCtrlPnts() {
        let ctrlPnts = this.gls.features.filter(f => f instanceof CtrlPnt && f.parent === this);
        return ctrlPnts;
    }

    destroy(): void {
        super.destroy();
        this.getCtrlPnts().forEach(cp => {
            this.gls.removeFeature(cp);
        })
    }
}

export default Line;