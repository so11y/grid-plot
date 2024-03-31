import Rect from "@/features/basic-shape/Rect";
import { IPixelPos } from "@/Interface";
import Feature from "../Feature";

class Pnt extends Rect {

    constructor(x: number = 0, y: number = 0, width: number = 18, height: number = 18) {
        super(x, y, width, height);
        this.isOnlyCenterAdsorb = true;
        this.fillStyle = this.hoverStyle = this.focusStyle = "#7AAAF8"
        this.zIndex = Infinity;
        this.lineWidth = 0;
        this.gls.addFeature(this, false);
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPixelPos[], lineWidth: number, radius = 0) {
        const path = new Path2D();
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
        path.rect(center.x - this.size.width/2, center.y - this.size.height/2, this.size.width, this.size.height)   // pnt始终固定大小,不随画布缩放
        ctx.fill(path);
        ctx.lineWidth = lineWidth;
        this.isStroke && ctx.stroke(path);
        this.setPointIn(ctx, path)
        return path;
    }
}

export default Pnt;