import { ClassName } from "@/Constants";
import Rect from "@/features/basic-shape/Rect";
import { IPixelPos } from "@/Interface";
import { getRoundedRect } from "@/utils";
import Feature from "../Feature";

// 基础点状元素
class Pnt extends Rect {

    constructor(x: number = 0, y: number = 0, width: number = 18, height: number = 18) {
        super(x, y, width, height);
        this.className = ClassName.PNT
        this.isOnlyCenterAdsorb = true;
        this.fillStyle = this.hoverStyle = this.focusStyle = "#7AAAF8"
        this.zIndex = Infinity;
        this.lineWidth = 0;
        this.radius = .5;
        this.isStroke = false;
        this.gls.addFeature(this, false);
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPixelPos[], lineWidth: number, lineDashArr: number[], radius = 0) {
        if (this.isPointIn) {
            ctx.fillStyle = this.hoverStyle;
            if (this.gls.focusNode === this) {
                ctx.fillStyle = this.focusStyle;
            }
        } else {
            ctx.fillStyle = this.fillStyle;
        }
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = this.strokeStyle;
        const center = Feature.getCenterPos(pointArr);
        const path = getRoundedRect(center.x - this.size.width / 2, center.y - this.size.height / 2, this.size.width, this.size.height, radius) // pnt始终固定大小,不随画布缩放
        ctx.fill(path);
        ctx.lineWidth = lineWidth;
        this.isStroke && ctx.stroke(path);
        this.setPointIn(ctx, path);
        return path;
    }
}

export default Pnt;