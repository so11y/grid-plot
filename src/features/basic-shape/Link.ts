import { ClassName, FontFamily, LinkMark, LinkStyle } from "../../Constants";
import { IPixelPos, IRelativePos, ITriangle, IVctor } from "../../Interface";
import { createVctor, getAngleOfTwoPnts, getNearNodes, getPntInVct, getRectPoint, getPntsOf3Bezier, getPntsOf2Bezier, isPntInPolygon, getUnitSize } from "../../utils";
import Feature from "../Feature";
import Line from "./Line";

let flowIndex = 0;

// 连接线
export default class Link extends Line {

    pntsLimit = 50  // 曲线生成的点的数量
    linkStyle: LinkStyle = LinkStyle.DEFAULT;
    startFeature: Feature | null = null;
    endFeature: Feature | null = null;
    isFlowSegment = true;
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
        this.strokeStyle = "rgba(220, 233, 126, .4)";

        if (startFeature instanceof Feature) {
            this.startFeature = startFeature;
            startFeature.on('translate', this.onTranslateStart.bind(this))
            startFeature.on('delete', this.onDelete.bind(this))
        }
        if (endFeature instanceof Feature) {
            this.endFeature = endFeature;
            endFeature.on('translate', this.onTranslateEnd.bind(this))
            endFeature.on('delete', this.onDelete.bind(this))
        }
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPixelPos[], lineWidth: number, lineDashArr: number[], radius = 0) {
        let newPnts: IPixelPos[] = [];
        switch (this.linkStyle) {
            case LinkStyle.BROKEN_TWO:
                newPnts = this.getBrokenPoints2(pointArr[0], pointArr[1]);
                break;
            case LinkStyle.BROKEN_ONE:
                newPnts = this.getBrokenPoints1(pointArr[0], pointArr[1]);
                break;
            case LinkStyle.CURVE_V:
                newPnts = this.getCurveVPoints(pointArr[0], pointArr[1]);
                break;
            case LinkStyle.CURVE_H:
                newPnts = this.getCurveHPoints(pointArr[0], pointArr[1]);
                break;
            case LinkStyle.CURVE:
                newPnts = this.getCurvePoints(pointArr[0], pointArr[1]);
                break;
            case LinkStyle.AUTOBROKEN:
                newPnts = this.getAutoBrokenPoints(pointArr[0], pointArr[1]);
                break;
            default:
                newPnts = pointArr;
                break;
        }
        this.actualPointArr = newPnts;
        const path = super.draw(ctx, newPnts, lineWidth, lineDashArr, radius);
        const flowIndex = this.getFlowIndex(newPnts.length, .1);
        this.drawTriangle(ctx, newPnts);
        this.drawFlowSegment(ctx, newPnts, lineWidth, flowIndex);
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

    // 修改起点或终点的位置,切换起始点或终点
    modifyTarget(feature: Feature | IRelativePos, type: LinkMark = LinkMark.START) {
        switch (type) {
            case LinkMark.START: {
                if (feature instanceof Feature) {
                    const center = Feature.getCenterPos(feature.pointArr);
                    this.startFeature = feature;
                    this.pointArr[0] = center;
                    feature.on('translate', () => { this.pointArr[0] = Feature.getCenterPos(feature.pointArr) })
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
                    feature.on('translate', () => { this.pointArr[1] = Feature.getCenterPos(feature.pointArr) })
                } else {
                    this.pointArr[1] = feature;
                }
            }
                break;
            default:
                break;
        }
    }

    getTwoPntOfTip(pointArr: IPixelPos[]): [IPixelPos, IPixelPos] {
        if (pointArr.length < 2) throw new Error("数组长度必须大于1");
        switch (this.linkStyle) {
            case LinkStyle.BROKEN_TWO: {
                const pnts = [pointArr[1], pointArr[2]]
                return pnts.sort((a, b) => a.x - b.x) as [IPixelPos, IPixelPos]
            }
            case LinkStyle.BROKEN_ONE: {
                const pnts = [pointArr[0], pointArr[2]]
                return pnts.sort((a, b) => a.x - b.x) as [IPixelPos, IPixelPos]
            }
            case LinkStyle.CURVE: // CURVE_V或CURVE_H
            case LinkStyle.CURVE_V:
            case LinkStyle.AUTOBROKEN: 
            case LinkStyle.CURVE_H: {
                const mid = pointArr.length / 2
                return [pointArr[mid - 1], pointArr[mid + 1]]
            }
            default:
                return [pointArr[0], pointArr[pointArr.length - 1]]
        }
    }

    getCurveVPoints(startPos: IPixelPos, endPos: IPixelPos, ctrlExtent = 1.5): IPixelPos[] {
        const vct = [0, -1000000] as IVctor;
        const cp1 = getPntInVct(startPos, vct, (startPos.y - endPos.y) / ctrlExtent);
        const cp2 = getPntInVct(endPos, vct, (endPos.y - startPos.y) / ctrlExtent);
        const points = getPntsOf3Bezier(startPos, cp1, cp2, endPos, this.pntsLimit);
        return points;
    }

    getCurveHPoints(startPos: IPixelPos, endPos: IPixelPos, degreex = .8, degreey = .3): IPixelPos[] {
        const vct1 = [-100, 0] as IVctor;
        const vct3 = [100, 0] as IVctor;
        const cp1 = getPntInVct(startPos, vct1, (endPos.x - startPos.x) * degreex)
        const scp = { x: cp1.x, y: cp1.y + (endPos.y - startPos.y) * degreey };
        const cp2 = getPntInVct(endPos, vct3, (endPos.x - startPos.x) * degreex)
        const ecp = { x: cp2.x, y: cp2.y + (startPos.y - endPos.y) * degreey };
        const points = getPntsOf3Bezier(startPos, scp, ecp, endPos, this.pntsLimit);
        return points;
    }

    getBrokenPoints2(startPos: IPixelPos, endPos: IPixelPos, ctrlExtent = .5): IPixelPos[] {
        const vct = createVctor(startPos, { x: startPos.x, y: -1000000 });
        const cp = getPntInVct(startPos, vct, (startPos.y - endPos.y) * ctrlExtent);
        const points = [startPos, { x: startPos.x, y: cp.y }, { x: endPos.x, y: cp.y }, endPos];
        return points;
    }

    getBrokenPoints1(startPos: IPixelPos, endPos: IPixelPos, ctrlExtent = 1): IPixelPos[] {
        const vct = [-100, 0] as IVctor;
        const cp = getPntInVct(startPos, vct, -(startPos.x - endPos.x) * ctrlExtent);
        const points = [startPos, { x: startPos.x, y: cp.y }, { x: endPos.x, y: cp.y }, endPos];
        return points;
    }

    getCurvePoints(startPos: IPixelPos, endPos: IPixelPos, ctrlExtent = 1): IPixelPos[] {
        const vct = [100, 0] as IVctor;
        const cp = getPntInVct(startPos, vct, -(startPos.x - endPos.x) * ctrlExtent);
        const points = getPntsOf2Bezier(startPos, cp, endPos, this.pntsLimit);
        return points;
    }

    getAutoBrokenPoints(startPos: IPixelPos, endPos: IPixelPos) {
        let width = getUnitSize();
        let coordList: IPixelPos[] = [];
        var getCoordList = (): IPixelPos[] => {
            let nearNodeArr = getNearNodes(startPos, endPos, width);
            let minFNode = nearNodeArr.sort((a, b) => a.f - b.f)[0]; // 离目标最近的点
            if (minFNode) {
                coordList.push({ x: minFNode.x, y: minFNode.y });
                startPos = minFNode;
                if (isPntInPolygon(minFNode, getRectPoint(endPos, { width, height: width }))) {  // 判断有没有到终点
                    coordList.push({ x: Math.ceil(endPos.x), y: Math.ceil(endPos.y) });
                    return coordList;
                } else {
                    return getCoordList();
                }
            }
            return []
        }
        return getCoordList();
    }

    // 一个流动的点
    getFlowIndex(endIndex = 0, speed = .3) {
        if (!this.isFlowSegment) return
        if (flowIndex >= (endIndex)) {
            flowIndex = 0;
        } else {
            flowIndex += speed;
        }
        return Math.floor(flowIndex);
    }

    drawFlowSegment(ctx: CanvasRenderingContext2D, curvePnts: IPixelPos[], lineWidth = 0, flowIndex = 0) {
        if (!this.isFlowSegment) return
        const path = new Path2D();
        let endIndex = flowIndex + Math.ceil(curvePnts.length * .2)
        if (endIndex > curvePnts.length - 1) {
            endIndex = curvePnts.length - 1;
        }
        const flowPnts = curvePnts.slice(flowIndex, endIndex) // 取总长度的百分之20片段
        if (flowPnts.length > 0) {
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
            gradient.addColorStop(0.6, "rgb(0, 255, 127,0.3)")
            gradient.addColorStop(0.8, "rgb(0, 255, 127,0.6)")
            gradient.addColorStop(1, "rgb(0, 255, 127,.9)");
            ctx.strokeStyle = gradient;
            ctx.lineCap = this.lineCap;
            ctx.stroke(path);
        }
    }

    onTranslateStart() {
        const feature = this.startFeature as Feature
        this.pointArr[0] = Feature.getCenterPos(feature.pointArr)
    }
    onTranslateEnd() {
        const feature = this.endFeature as Feature;
        this.pointArr[1] = Feature.getCenterPos(feature.pointArr)
    }

    onDelete() {
        this.gls.removeFeature(this)
    }

}