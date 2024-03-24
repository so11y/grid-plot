import { FontFamily, LinkStyle } from "../../Constants";
import { IPixelPos, IVctor } from "../../Interface";
import { createVctor, getPntInVct, getPntsOf3Bezier } from "../../utils";
import Feature from "../Feature";
import Line from "./Line";

let startIndex = 0;

export default class Link extends Line {

    pntsLimit = 200  // 曲线生成的点的数量
    linkStyle: LinkStyle = LinkStyle.BROKEN;
    targets: [Feature, Feature];

    constructor(startFeature: Feature, endFeature: Feature) {
        super([startFeature.getCenterPos(), endFeature.getCenterPos()]);
        this.targets = [startFeature, endFeature];
        this.className = "Link"
        this.cbSelect = false;
        this.tipInfo.txt = '测试文字'
        this.tipInfo.offset.y = -10;
        this.tipInfo.fontFamily = FontFamily.SHISHANG;
        this.strokeStyle = "rgba(220, 233, 126, 1)";

        this.targets[0].translateEvents.push(() => { this.pointArr[0] = this.targets[0].getCenterPos() })
        this.targets[1].translateEvents.push(() => { this.pointArr[1] = this.targets[1].getCenterPos() })
        this.gls.addFeature(this, false)
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPixelPos[], lineWidth: number, r = 0) {
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
        const path = super.draw(ctx, newPnts, lineWidth, r);
        return path;
    }

    getTipPnt(pointArr: IPixelPos[]): [IPixelPos, IPixelPos] {
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
        var gradient = ctx.createLinearGradient(flowPnts[0].x, flowPnts[0].y, flowPnts[flowPnts.length - 1].x, flowPnts[flowPnts.length - 1].y)
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