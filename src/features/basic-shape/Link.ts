import { CoordinateSystem, LinkStyle } from "../../Constants";
import GridSystem from "../../GridSystem";
import { BasicFeature, IPoint, Vector } from "../../Interface";
import { createVctor, getLenOfTwoPnts, getMidOfTwoPnts, getPntInVct, getPntsOf3Bezier, getRectPoint, getRotatePnt, getVctLen, isPointInPolygon } from "../../utils";
import Feature from "../Feature";
import AnchorPnt from "../function-shape/AnchorPnt";
import Line from "./Line";
let startIndex = 0;

interface NearNode {
    x: number,  // 坐标,以网格为单元的值
    y: number,
    name?: string,
    g?: number,  // 当前点与附近点的距离,写死
    h?: number,  // 当前点与终点水平垂直方向距离之和
    f?: number // g+h之和
}
// 获取当前节点附近的6个点,分别是 左, 上, 右, 下, 左上, 右上, 右下, 左下
function getNearNodes(startPos: NearNode, endPos: IPoint, unitLen = 1) {
    let leftNode = {
        name: "left",
        x: startPos.x - unitLen,
        y: startPos.y,
        g: 1,
        h: 0,
        f: 0,
    };
    setDistProp(leftNode);

    let topNode = {
        name: "top",
        x: startPos.x,
        y: startPos.y - unitLen,
        g: 1,
        h: 0,
        f: 0,
    };
    setDistProp(topNode);


    let rightNode = {
        name: "right",
        x: startPos.x + unitLen,
        y: startPos.y,
        g: 1,
        h: 0,
        f: 0,
    };
    setDistProp(rightNode);

    let bottomNode = {
        name: "bottom",
        x: startPos.x,
        y: startPos.y + unitLen,
        g: 1,
        h: 0,
        f: 0,
    };
    setDistProp(bottomNode);

    return [leftNode, topNode, rightNode, bottomNode,]

    function setDistProp(startPos: NearNode) {
        if (!startPos.g) {
            startPos.g = 0;
        }
        startPos.h = Math.abs(endPos.x - startPos.x) + Math.abs(endPos.y - startPos.y);
        startPos.f = startPos.g + startPos.h;
    }
}


export default class Link extends Line {

    pntsLimit = 200  // 曲线生成的点的数量
    linkStyle: LinkStyle = LinkStyle.BROKEN;
    targets: [AnchorPnt, AnchorPnt];

    constructor(startFeature: AnchorPnt, endFeature: AnchorPnt) {
        super([startFeature.getCenterPos(), endFeature.getCenterPos()]);
        this.targets = [startFeature, endFeature];
        this.className = "Link"
        this.cbSelect = false;
        this.strokeStyle = "rgba(220, 233, 126, 1)";
        this.targets[0].parent.translateEvents.push(() => { this.pointArr[0] = this.targets[0].getCenterPos() })
        this.targets[1].parent.translateEvents.push(() => { this.pointArr[1] = this.targets[1].getCenterPos() })
        this.targets[0].translateEvents.push(() => { this.pointArr[0] = this.targets[0].getCenterPos() })
        this.targets[1].translateEvents.push(() => { this.pointArr[1] = this.targets[1].getCenterPos() })
        this.gls.addFeature(this, false)
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPoint[], lineWidth: number) {
        let newPnts: IPoint[] = [];
        switch (this.linkStyle) {
            case LinkStyle.BROKEN:
                // let center = this.startFeature.getCenterPos();
                // let center2 = this.endFeature.getCenterPos();
                // let startPos = getMidOfTwoPnts(this.startFeature.pointArr[0], this.startFeature.pointArr[1])
                // let endPos = getMidOfTwoPnts(this.endFeature.pointArr[0], this.endFeature.pointArr[3])
                // let vct = createVctor(center, startPos)
                // let vct2 = createVctor(center2, endPos)
                // let newStartPos = getPntInVct(center, vct, 30);
                // let newEndPos = getPntInVct(center2, vct2, 30);
                // this.gls.test = this.gls.getPixelPos(newEndPos);
                newPnts = this.getBrokenPoints(pointArr[0], pointArr[1]);
                // newPnts.unshift(this.gls.getPixelPos(startPos))
                // newPnts.push(this.gls.getPixelPos(endPos))
                break;
            case LinkStyle.CURVE:
                newPnts = this.getBezierPoints(pointArr[0], pointArr[1]);
                this.flowSegment(ctx, newPnts, lineWidth);
                break;
            default:
                newPnts = pointArr;
                break;
        }
        let path = super.draw(ctx, newPnts, lineWidth);
        return path;
    }

    getBezierPoints(startPos: IPoint, endPos: IPoint): IPoint[] {
        let divide = Math.abs(startPos.x - endPos.x) / GridSystem.Gls.scale / 2;
        let dirct = startPos.x > endPos.x ? 1 : -1
        let vct: Vector = [endPos.x - startPos.x, endPos.y - startPos.y];
        let cp1 = getPntInVct(startPos, vct, divide * GridSystem.Gls.scale);
        let cp2 = getPntInVct(startPos, vct, getVctLen(vct) + divide * GridSystem.Gls.scale);
        let rcp1 = getRotatePnt(startPos, cp1, -10 * dirct);
        let rcp2 = getRotatePnt(endPos, cp2, 150 * dirct);
        let points = getPntsOf3Bezier(startPos, rcp1, rcp2, endPos, this.pntsLimit);
        return points;
    }

    getBrokenPoints(startPos: IPoint, endPos: IPoint) {
        let coordList: IPoint[] = [];
        const unitLen = CoordinateSystem.GRID_SIZE * CoordinateSystem.GRID_SIZE / this.gls.scale;
        var getCoordList = (): IPoint[] => {
            let nearNodeArr = getNearNodes(startPos, endPos, unitLen);
            let minFNode = nearNodeArr.sort((a, b) => a.f - b.f)[0]; // 离目标最近的点
            if (minFNode) {
                coordList.push({ x: minFNode.x, y: minFNode.y });
                startPos = minFNode;
                if (isPointInPolygon(minFNode, getRectPoint(endPos, { width: unitLen, height: unitLen }))) {
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

    // 流光
    flowSegment(ctx: CanvasRenderingContext2D, curvePnts: IPoint[], lineWidth = 0) {
        ctx.beginPath();
        let flowPnts = curvePnts.slice(startIndex, startIndex + Math.ceil(this.pntsLimit * .2)) // 取总长度的百分之20片段
        flowPnts.forEach((p, i) => {
            if (i == 0) {
                ctx.moveTo(p.x, p.y);
            } else {
                ctx.lineTo(p.x, p.y);
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
        ctx.lineCap = "round";
        ctx.stroke();
        if (startIndex >= (this.pntsLimit - Math.ceil(this.pntsLimit * .2))) {
            startIndex = 0;
        } else {
            startIndex += .3;
        }
    }
}