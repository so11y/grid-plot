import { IPixelPos } from "@/Interface";
import { AdsorbType, ClassName, Events } from "../../../Constants";
import { getMousePos } from "../../../utils";
import Pnt from "../Pnt";

// 吸附功能的点,方便选取用
class AdsorbPnt extends Pnt {

    cbAdsorption: boolean = true;  // 是否吸附
    cbCrossLine: boolean = true;
    crossLineStrokeStyle = "#2471A3";
    adsorbType = AdsorbType.POINT;

    constructor(width: number = 14, cbAdsorption = false, cbCrossLine = true) {   // 相对坐标
        super(0, 0, width, width);
        this.fillStyle = this.hoverStyle = this.focusStyle = "#66ccff";
        this.className = ClassName.ADSORBPNT;
        this.zIndex = Infinity;
        this.isStroke = false;
        this.radius = .3;
        this.isFixedSize = true;
        this.cbAdsorption = cbAdsorption;
        this.cbCrossLine = cbCrossLine;
        this.cbCapture = false;
        this.cbSelect = false;
        this.gls.addFeature(this, false)
        document.addEventListener("mousemove", this.setPos.bind(this));
    }


    draw(ctx: CanvasRenderingContext2D, pointArr: IPixelPos[], lineWidth: number, lineDashArr: number[], radius?: number): Path2D {
        const path = super.draw(ctx, pointArr, lineWidth, lineDashArr, radius);
        // const center = this.getCenterPos(pointArr);
        // if (this.cbCrossLine) {
        //     ctx.save();
        //     ctx.beginPath();
        //     ctx.lineWidth = .5;
        //     ctx.strokeStyle = this.crossLineStrokeStyle;
        //     ctx.moveTo(0, center.y);
        //     ctx.lineTo(ctx.canvas.width, center.y);
        //     ctx.moveTo(center.x, 0)
        //     ctx.lineTo(center.x, ctx.canvas.height)
        //     ctx.setLineDash([8, 10])
        //     ctx.stroke();
        //     ctx.restore();
        // }
        return path;
    }

    setPos(e: any) {
        const gls = this.gls;
        const { x: rx, y: ry } = gls.getRelativePos(getMousePos(gls.domElement, e));
        this.position = {
            x: rx,
            y: ry
        };
        if (this.cbAdsorption) {
            const { x: x1, y: y1 } = this.adsorbType == AdsorbType.POINT ?  gls.getAdsorb2Point({ x: rx, y: ry }) : this.adsorbType == AdsorbType.GRID ?  gls.getAdsorb2Grid({ x: rx, y: ry }) : gls.getAdsorb2Grid({ x: rx, y: ry });
            this.position.x += x1;
            this.position.y += y1;
        }
        // super.setPos(this.position.x, this.position.y);
    }

    destory() {
        document.removeEventListener(Events.MOUSE_MOVE, this.setPos);
    }
}

export default AdsorbPnt;