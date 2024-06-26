import { ClassName } from "@/Constants";
import MiniMap from "@/MiniMap";
import { IPoint, IPixelPos } from "../../Interface";
import { getLenOfTwoPnts, getRectPoint, getRoundedRect } from "../../utils";
import Feature from "../Feature";

// 矩形元素
class Rect extends Feature {

    constructor(x: number = 0, y: number = 0, width: number = 15, height: number = 15) {   // 相对坐标
        const pointArr = getRectPoint({ x, y }, { width, height })
        super(pointArr);
        this.className = ClassName.RECT;
        this.position.x = x;
        this.position.y = y;
        this.size.width = width;
        this.size.height = height;
        this.isClosePath = true;
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPixelPos[], lineWidth: number, lineDashArr: number[], radius = 0) {
        const { width, height, leftTop } = this.getSize(pointArr);
        let path:Path2D;
        if (this.isFixedSize) {
            const { x: x1, y: y1 } = this.gls.getPixelPos(this.position)
            path = getRoundedRect(x1 - this.size.width / 2, y1 - this.size.height / 2, this.size.width, this.size.height, radius);
        } else {
            path = getRoundedRect(leftTop.x, leftTop.y, width, height, radius);
        }
        // ctx.fillStyle = "#fff"
        // ctx.fillRect(0,0,10,10)
        // if(Feature.TargetRender?.className === 'minimap'){
        //     console.log(leftTop, "pointArr");
        // }
        ctx.save()
        this.isClosePath && path.closePath()
        lineDashArr.length > 0 && ctx.setLineDash(lineDashArr)
        ctx.lineCap = this.lineCap;
        ctx.lineJoin = this.lineJoin;
        ctx.globalAlpha = this.opacity;
        ctx.lineDashOffset = this.lineDashOffset;
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = lineWidth;
        if (this.isPointIn) {
            ctx.fillStyle = this.hoverStyle;
            if (this.gls.focusNode === this) {
                ctx.fillStyle = this.focusStyle;
            }
        } else {
            ctx.fillStyle = this.fillStyle;
        }
        this.rotateCtx(ctx, leftTop)
        this.isStroke && ctx.stroke(path);
        this.isClosePath && ctx.fill(path);
        this.drawAdsorbLine(ctx, pointArr)
        this.setPointIn(ctx, path)
        this.flowLineDash();
        ctx.restore();
        return path;
    }

    setPos(x: number = this.position.x, y: number = this.position.x) {
        this.position.x = x;
        this.position.y = y;
        this.pointArr = getRectPoint(this.position, this.size);
    }

    setSize = (width: number = this.size.width, height: number = this.size.height) => {
        this.size.width = width;
        this.size.height = height;
        this.pointArr = getRectPoint(this.position, this.size);
    }

    // 获取矩形的宽度，包括旋转，不是包围盒
    getSize(pointArr: IPoint[] = this.pointArr) {
        let leftTop = { x: 0, y: 0 };
        if (!this.isHorizonalRevert && !this.isVerticalRevert) {
            leftTop = pointArr[0]
        }
        if (this.isHorizonalRevert && this.isVerticalRevert) {
            leftTop = pointArr[2]
        }
        if (this.isHorizonalRevert && !this.isVerticalRevert) {
            leftTop = pointArr[1]
        }
        if (!this.isHorizonalRevert && this.isVerticalRevert) {
            leftTop = pointArr[3]
        }
        return {
            leftTop,
            width: getLenOfTwoPnts(pointArr[0], pointArr[1]),
            height: getLenOfTwoPnts(pointArr[0], pointArr[3]),
        }
    }

    /**
* 获得元素宽高比 
* @returns 
*/
    getRatio() {
        const { width, height } = this.getSize()
        return width / height;
    }

    getSvg(pointArr: IPixelPos[] = [], lineWidth: number = 1, radius = 0) {
        const { width, height, leftTop } = this.getSize(pointArr);
        return `
        <g transform="rotate(${this.angle} ${leftTop.x} ${leftTop.y})" style="stroke-width:${lineWidth};stroke:${this.strokeStyle};fill:${this.fillStyle};">
            <rect x="${leftTop.x}" y="${leftTop.y}" rx="${radius}" ry="${radius}" width="${width}" height="${height}"/>
        </g>
        `
    }

}

export default Rect;