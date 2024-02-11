import { MyEvent } from "../../Constants";
import { IPoint } from "../../Interface";
import { getMousePos } from "../../utils";
import Rect from "../basic-shape/Rect";

// 矩形点状元素
class AdsorbPnt extends Rect {

    cbAdsorption: boolean = true;  // 是否吸附
    cbCrossLine: boolean = true;
    crossLineStrokeStyle: string;

    constructor(width: number = 5, cbAdsorption = false, cbCrossLine = false) {   // 相对坐标
        super(0, 0, width, width);
        this.fillStyle = this.hoverStyle = this.focusStyle = "#66ccff";
        this.className = "AdsorbPnt";
        this.zIndex = Infinity;
        this.isStroke = false;
        this.radius = .3;
        this.isFixedSize = true;
        this.cbAdsorption = cbAdsorption;
        this.cbCrossLine = cbCrossLine;
        this.crossLineStrokeStyle = "#2471A3";
        this.gls.addFeature(this, false)
        document.addEventListener("mousemove", this.setPos.bind(this));
    }


    draw(ctx: CanvasRenderingContext2D, pointArr: IPoint[], lineWidth: number, radius?: number): Path2D {
        let path = super.draw(ctx, pointArr, lineWidth, radius);
        let center = this.getCenterPos(pointArr);
        if (this.cbCrossLine) {
            ctx.save();
            ctx.beginPath();
            ctx.lineWidth = .5;
            ctx.strokeStyle = this.crossLineStrokeStyle;
            ctx.moveTo(0, center.y);
            ctx.lineTo(ctx.canvas.width, center.y);
            ctx.moveTo(center.x, 0)
            ctx.lineTo(center.x, ctx.canvas.height)
            ctx.setLineDash([8, 10])
            ctx.stroke();
            ctx.restore();
        }
        return path;
    }

    setPos(e: any) {
        let gls = this.gls;
        let { x: rx, y: ry } = gls.getRelativePos(getMousePos(gls.dom, e));
        this.position = {
            x: rx,
            y: ry
        };
        if (this.cbAdsorption) {
            let { x: x1, y: y1 } = gls.getAdsorbPos({ x: rx, y: ry });
            this.position.x += x1;
            this.position.y += y1;
        }
        super.setPos(this.position.x, this.position.y);
    }

    destory() {
        document.removeEventListener(MyEvent.MOUSE_MOVE, this.setPos);
    }
}

export default AdsorbPnt;