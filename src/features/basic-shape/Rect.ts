import { IPoint } from "../../Interface";
import { getLenOfTwoPnts, getRectPoint } from "../../utils";
import Feature from "../Feature";

class Rect extends Feature {

    radius = 0;   // 做成圆,radius = width/10
    isFixedSize: boolean = false; // 是否固定大小

    constructor(x: number = 0, y: number = 0, width: number = 5, height: number = 5) {   // 相对坐标
        let points = getRectPoint({x, y}, {width, height})
        super(points);
        this.className = "Rect";
        this.position.x = x;
        this.position.y = y;
        this.size.width = width;
        this.size.height = height;
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPoint[], lineWidth: number, radius = 0) {
        let path = new Path2D();
        if (radius == 0) {
            pointArr.forEach((p, i) => {
                if (i == 0) {
                    path.moveTo(p.x, p.y)
                } else {
                    path.lineTo(p.x, p.y)
                }
            })
        } else {
            this.setChildAngle(ctx, pointArr);
            const { width, height, leftTop } = this.getSize(pointArr);
            this.drawRoundedRect(path, leftTop.x, leftTop.y, width, height, radius);
        }
        ctx.save()
        this.closePath && path.closePath()
        this.setPointIn(ctx, path)
        ctx.lineCap = this.lineCap;
        ctx.globalAlpha = this.opacity;
        this.lineDashArr.length > 0 && ctx.setLineDash(this.lineDashArr)
        ctx.lineDashOffset = this.lineDashOffset;
        ctx.strokeStyle = this.strokeStyle;
        if (this.isPointIn) {
            ctx.fillStyle = this.hoverStyle;
            if (this.gls.focusNode === this) {
                ctx.fillStyle = this.focusStyle;
            }
        } else {
            ctx.fillStyle = this.fillStyle;
        }
        ctx.lineWidth = lineWidth;
        this.isStroke && ctx.stroke(path);
        this.closePath && ctx.fill(path);
        this.isShowAdsorbLine && this.drawAdsorbLine(ctx, pointArr)
        this.updateChild();
        ctx.restore();
        return path;
    }

    // 绘制圆角矩形
    drawRoundedRect(path: Path2D, x: number, y: number, width: number, height: number, r: number) {
        path.moveTo(x + r, y);
        path.lineTo(x + width / 4 - r, y);
        path.arc(x + width - r, y + r, r, Math.PI * 1.5, Math.PI * 2);
        path.lineTo(x + width, y + height - r);
        path.arc(x + width - r, y + height - r, r, 0, Math.PI * 0.5);
        path.lineTo(x + r, y + height);
        path.arc(x + r, y + height - r, r, Math.PI * 0.5, Math.PI);
        path.lineTo(x, y + r);
        path.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
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

    // 以左上角去旋转内容， 文字或者图片
    setChildAngle = (ctx: CanvasRenderingContext2D, pointArr: IPoint[]) => {
        let boxInfo = {
            x: pointArr[0].x,
            y: pointArr[0].y,
        }
        ctx.translate(boxInfo.x, boxInfo.y)
        ctx.rotate(this.angle * Math.PI / 180)
        ctx.translate(-boxInfo.x, -boxInfo.y)
    }

    // 获取矩形的宽度，包括旋转，不是包围盒
    getSize(pointArr: IPoint[] = this.pointArr) {
        return {
            leftTop: pointArr[0],
            width: getLenOfTwoPnts(pointArr[0], pointArr[1]),
            height: getLenOfTwoPnts(pointArr[0], pointArr[3]),
        }
    }

    /**
* 获得元素宽高比
* @returns 
*/
    getRatio() {
        let { width, height } = this.getSize()
        return width / height;
    }
}

export default Rect;