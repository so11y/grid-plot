import { ClassName, FontFamily, LinkMark, LinkStyle } from "../../Constants";
import { IPixelPos, IRelativePos, ITriangle, IVctor } from "../../Interface";
import { createVctor, getAngleOfTwoPnts, getPntInVct, getPntsOf3Bezier } from "../../utils";
import Feature from "../Feature";
import Line from "./Line";

let startIndex = 0;

// 连接线
export default class Link extends Line {

    pntsLimit = 200  // 曲线生成的点的数量
    linkStyle: LinkStyle = LinkStyle.CURVE;
    startFeature: Feature | null = null;
    endFeature: Feature | null = null;
    triangleInfo: ITriangle = {
        hidden: true,
        width: .8,
        height: 1,
        angle: 0,
        color: "#5ED7FD",
        fill: "#5ED7FD",
        lineWidth: .2,
    }

    // 如果是传的是点,那么可能无法更新link的位置
    constructor(startFeature: Feature | IRelativePos, endFeature: Feature | IRelativePos) {
        let startPos: IRelativePos = { x: 0, y: 0 };
        let endPos: IRelativePos = { x: 0, y: 0 };

        if (startFeature instanceof Feature) {   // 是Feature元素则获取元素的中心点
            startPos = Feature.getCenterPos(startFeature.pointArr);
        } else {
            startPos = startFeature as IRelativePos;
        }
        if (endFeature instanceof Feature) {
            endPos = Feature.getCenterPos(endFeature.pointArr);
        } else {
            endPos = endFeature as IRelativePos;
        }

        super([startPos as IRelativePos, endPos as IRelativePos]);

        this.className = ClassName.LINK
        this.cbTranslate = false;
        this.tipInfo.txt = '测试文字'
        this.tipInfo.offset.y = -10;
        this.tipInfo.fontFamily = FontFamily.SHISHANG;
        this.strokeStyle = "rgba(220, 233, 126, 1)";

        if (startFeature instanceof Feature) {
            this.startFeature = startFeature;
            startFeature.translateEvents.push(() => { this.pointArr[0] = Feature.getCenterPos(startFeature.pointArr) })
        }
        if (endFeature instanceof Feature) {
            this.endFeature = endFeature;
            endFeature.translateEvents.push(() => { this.pointArr[1] = Feature.getCenterPos(endFeature.pointArr) })
        }
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPixelPos[], lineWidth: number, radius = 0) {
        let newPnts: IPixelPos[] = [];
        switch (this.linkStyle) {
            case LinkStyle.BROKEN:
                newPnts = this.getBrokenPoints(pointArr[0], pointArr[1]);
                break;
            case LinkStyle.CURVE:
                newPnts = this.getCurvePoints(pointArr[0], pointArr[1]);
                this.flowSegment(ctx, newPnts, lineWidth);
                break;
            default:
                newPnts = pointArr;
                break;
        }
        this.actualPointArr = newPnts;
        const path = super.draw(ctx, newPnts, lineWidth, radius);
        // if (this.tipInfo.txt && pointArr.length > 1) {
        this.drawTriangle(ctx, newPnts);
        // }
        return path;
    }

    drawTriangle(ctx: CanvasRenderingContext2D, pointArr: IPixelPos[]) {
        if (pointArr.length < 2 || this.triangleInfo.hidden) return;
        const width = this.gls.getRatioSize(this.triangleInfo.width);
        const height = this.gls.getRatioSize(this.triangleInfo.height);
        const lineWidth = this.gls.getRatioSize(this.triangleInfo.lineWidth);
        const [end1Pos, end2Pos] = [pointArr[pointArr.length - 1], pointArr[pointArr.length - 2]];
        const angle = getAngleOfTwoPnts(end2Pos, end1Pos);   // 获取两个点 水平方向上的角度
        ctx.save();
        this.rotateCtx(ctx, end1Pos, angle + 90);
        ctx.strokeStyle = this.triangleInfo.color;
        ctx.fillStyle = this.triangleInfo.fill;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = this.lineJoin;
        ctx.moveTo(end1Pos.x, end1Pos.y + height / 2);
        ctx.lineTo(end1Pos.x - width, end1Pos.y + height);
        ctx.lineTo(end1Pos.x, end1Pos.y - height / 2);
        ctx.lineTo(end1Pos.x + width, end1Pos.y + height);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }

    // 修改起点或终点的位置
    modifyTarget(feature: Feature | IRelativePos, type: LinkMark = LinkMark.START) {
        switch (type) {
            case LinkMark.START: {
                if (feature instanceof Feature) {
                    const center = Feature.getCenterPos(feature.pointArr);
                    this.startFeature = feature;
                    this.pointArr[0] = center;
                    feature.translateEvents.push(() => { this.pointArr[0] = Feature.getCenterPos(feature.pointArr) })
                } else {
                    this.pointArr[0] = feature;
                }
            }
                break;
            case LinkMark.END: {
                if (feature instanceof Feature) {
                    const center = Feature.getCenterPos(feature.pointArr);
                    this.endFeature = feature;
                    this.pointArr[1] = center;
                    feature.translateEvents.push(() => { this.pointArr[1] = Feature.getCenterPos(feature.pointArr) })
                } else {
                    this.pointArr[1] = feature;
                }
            }
                break;
            default:
                break;
        }
    }

    getTwoPntByTip(pointArr: IPixelPos[]): [IPixelPos, IPixelPos] {
        if (pointArr.length < 2) throw new Error("数组长度必须大于1");
        switch (this.linkStyle) {
            case LinkStyle.BROKEN:
                const pnts = [pointArr[1], pointArr[2]]
                return pnts.sort((a, b) => a.x - b.x) as [IPixelPos, IPixelPos]
            case LinkStyle.CURVE:
                const mid = pointArr.length / 2
                return [pointArr[mid - 1], pointArr[mid + 1]]
            default:
                return [pointArr[0], pointArr[pointArr.length - 1]]
        }
    }

    getCurvePoints(startPos: IPixelPos, endPos: IPixelPos, ctrlExtent = 1.5): IPixelPos[] {
        const vct1 = createVctor(startPos, { x: startPos.x, y: -1000000 });
        const vct2 = createVctor(endPos, { x: endPos.x, y: -1000000 });
        const cp1 = getPntInVct(startPos, vct1, (startPos.y - endPos.y) / ctrlExtent);
        const cp2 = getPntInVct(endPos, vct2, (endPos.y - startPos.y) / ctrlExtent);
        const points = getPntsOf3Bezier(startPos, cp1, cp2, endPos, this.pntsLimit);
        return points;
    }

    getBrokenPoints(startPos: IPixelPos, endPos: IPixelPos, ctrlExtent = 2): IPixelPos[] {
        const vct = createVctor(startPos, { x: startPos.x, y: -1000000 });
        const cp = getPntInVct(startPos, vct, (startPos.y - endPos.y) / ctrlExtent);
        const points = [startPos, { x: startPos.x, y: cp.y }, { x: endPos.x, y: cp.y }, endPos];
        return points;
    }

    // 流光
    flowSegment(ctx: CanvasRenderingContext2D, curvePnts: IPixelPos[], lineWidth = 0) {
        const path = new Path2D();
        ctx.beginPath();
        const flowPnts = curvePnts.slice(startIndex, startIndex + Math.ceil(this.pntsLimit * .2)) // 取总长度的百分之20片段
        flowPnts.forEach((p, i) => {
            if (i == 0) {
                path.moveTo(p.x, p.y);
            } else {
                path.lineTo(p.x, p.y);
            }
        })
        ctx.lineWidth = lineWidth * .9
        const gradient = ctx.createLinearGradient(flowPnts[0].x, flowPnts[0].y, flowPnts[flowPnts.length - 1].x, flowPnts[flowPnts.length - 1].y)
        gradient.addColorStop(0, "rgb(0, 255, 127,0)")
        gradient.addColorStop(0.2, "rgb(0, 255, 127,0.01)")
        gradient.addColorStop(0.4, "rgb(0, 255, 127,0.04)")
        gradient.addColorStop(0.6, "rgb(0, 255, 127,0.1)")
        gradient.addColorStop(0.8, "rgb(0, 255, 127,0.2)")
        gradient.addColorStop(1, "rgb(0, 255, 127,.6)");
        ctx.strokeStyle = gradient;
        ctx.lineCap = this.lineCap;
        ctx.stroke(path);
        if (startIndex >= (this.pntsLimit - Math.ceil(this.pntsLimit * .2))) {
            startIndex = 0;
        } else {
            startIndex += .3;
        }
    }
}