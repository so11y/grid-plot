
import { AlignType } from "@/Constants";
import { BasicFeature, IPoint } from "@/Interface";
import { getLenOfPntToLine, getLenOfTwoPnts, getMidOfTwoPnts, isBasicFeature } from "@/utils";
import Feature from "../Feature";

export default class Group extends Feature {

    constructor(features: BasicFeature[]) {   // 相对坐标
        super([]);
        features.forEach(f => this.add(f))
        this.className = 'Group';
        // this.fillStyle = this.focusStyle = this.hoverStyle = this.strokeStyle = "transparent";
        this.isStroke = false;
        this.isClosePath = true;
        this.fillStyle = "rgba(250, 242, 180, .5)"
        this.hoverStyle = "rgba(250, 242, 180, .8)"
        this.lineDashArr = [8, 12]
        this.lineWidth = .1;
        this.zIndex = -1;
        this.cbTransformChild = false;
    }

    add(feature: BasicFeature) {
        if (!isBasicFeature(feature)) return;
        if (feature.isFixedPos || feature.isFixedSize) return;  // 非基础元素不添加
        this.addFeature(feature, { cbSelect: false });
        this.toResize(this.children);
    }
    remove(feature: BasicFeature) {
        this.removeChild(feature);
        this.toResize(this.children);
    }
    toResize(features: BasicFeature[]) {  // 重新创建后重设大小
        const allPointArr: IPoint[] = [];
        features.map(f => allPointArr.push(...f.pointArr));
        this.pointArr = this.getRectWrapPoints(allPointArr);  // [leftTop, rightTop, rightBottom, leftBottom]
    }

    toTopAlign(features: Feature[] = this.children) { // 顶部对齐
        const angle = this.angle;
        const center = this.getCenterPos();
        const pointArr = this.getPointArr(this.pointArr, -angle, center);  // 获取旋转之前的点
        features.forEach(f => {
            const fPointArr = f.getPointArr(f.pointArr, -angle, center); // 获取旋转之前的点
            const [minX, maxX, minY, maxY] = f.getRectWrapExtent(fPointArr);  // 获取包围盒最左侧的点
            const len = getLenOfPntToLine({ x: 0, y: minY }, pointArr[0], pointArr[1]);
            const dx = len * Math.sin(-angle * Math.PI / 180);
            const dy = len * Math.cos(-angle * Math.PI / 180);
            f.translate(-dx, -dy)
        })
    }
    toLeftAlign(features: Feature[] = this.children) { // 左对齐
        const angle = this.angle;
        const center = this.getCenterPos();
        const pointArr = this.getPointArr(this.pointArr, -angle, center);  // 获取旋转之前的点
        features.forEach((f, i) => {
            const fPointArr = this.getPointArr(JSON.parse(JSON.stringify(f.pointArr)), -angle, center); // 获取旋转之前的点
            const [minX, maxX, minY, maxY] = f.getRectWrapExtent(fPointArr);  // 获取包围盒最左侧的点
            const len = getLenOfPntToLine({ x: minX, y: 0 }, pointArr[0], pointArr[3]);
            const dx = len * Math.cos(angle * Math.PI / 180);
            const dy = len * Math.sin(angle * Math.PI / 180);
            if (i == 0) {
                console.log(minX, "minX");
                this.gls.test = this.gls.getPixelPos({ x: minX, y: 0 })
            }
            f.translate(-dx, -dy)
        })
    }
    toBottomAlign(features: Feature[] = this.children) {
        const angle = this.angle;
        const center = this.getCenterPos();
        const pointArr = this.getPointArr(this.pointArr, -angle, center);  // 获取旋转之前的点
        features.forEach(f => {
            const fPointArr = f.getPointArr(f.pointArr, -angle, center); // 获取旋转之前的点
            const [minX, maxX, minY, maxY] = f.getRectWrapExtent(fPointArr);  // 获取包围盒最左侧的点
            const len = getLenOfPntToLine({ x: 0, y: maxY }, pointArr[2], pointArr[3]);
            const dx = len * Math.sin(-angle * Math.PI / 180);
            const dy = len * Math.cos(-angle * Math.PI / 180);
            f.translate(dx, dy)
        })
    }
    toRightAlign(features: Feature[] = this.children) {
        const angle = this.angle;
        const center = this.getCenterPos();
        const pointArr = this.getPointArr(this.pointArr, -angle, center);  // 获取旋转之前的点
        features.forEach(f => {
            const fPointArr = f.getPointArr(f.pointArr, -angle, center); // 获取旋转之前的点
            const [minX, maxX, minY, maxY] = f.getRectWrapExtent(fPointArr);  // 获取包围盒最左侧的点
            const len = getLenOfPntToLine({ x: maxX, y: 0 }, pointArr[1], pointArr[2]);
            const dx = len * Math.cos(angle * Math.PI / 180);
            const dy = len * Math.sin(angle * Math.PI / 180);
            f.translate(dx, dy)
        })
    }
    toVerticalAlign(features: Feature[] = this.children) {
        const angle = this.angle;
        const center = this.getCenterPos();
        features.forEach(f => {
            const fPointArr = f.getPointArr(f.pointArr, -angle, center); // 获取旋转之前的点
            const fCenter = f.getCenterPos(fPointArr)
            const len = center.x - fCenter.x;
            const dx = len * Math.cos(angle * Math.PI / 180);
            const dy = len * Math.sin(angle * Math.PI / 180);
            f.translate(dx, dy)
        })
    }
    toHorizonalAlign(features: Feature[] = this.children) {
        const angle = this.angle;
        const center = this.getCenterPos();
        features.forEach(f => {
            const fPointArr = f.getPointArr(f.pointArr, -angle, center); // 获取旋转之前的点
            const fCenter = f.getCenterPos(fPointArr)
            const len = center.y - fCenter.y;
            const dx = len * Math.sin(-angle * Math.PI / 180);
            const dy = len * Math.cos(-angle * Math.PI / 180);
            f.translate(dx, dy)
        })
    }

    // 均匀分布子元素, 两边吗没有空隙
    toSpaceBetween(features: Feature[] = this.children, flexFLow = AlignType.HORIZONAL) {
        const angle = this.angle;
        const center = this.getCenterPos();

        const pointArr = this.getPointArr(this.pointArr, -angle, center);  // 获取旋转之前的点
        const [leftTop, rightTop, rightBottom, leftBottom] = this.getRectWrapPoints(pointArr);
        const wrapWidth = getLenOfTwoPnts(leftTop, rightTop);
        const wrapHeight = getLenOfTwoPnts(leftTop, leftBottom);

        if (features.length > 1) {
            switch (flexFLow) {
                case AlignType.HORIZONAL:
                    {

                        let childTotalWidth = 0;
                        features.forEach((f, i) => {
                            const fPointArr = f.getPointArr(f.pointArr, -angle, center); // 获取旋转之前的点
                            const [leftTop, rightTop] = f.getRectWrapPoints(fPointArr);
                            childTotalWidth += getLenOfTwoPnts(leftTop, rightTop); // 计算所有子元素的宽度之和
                        })
                        const spaceLen = (wrapWidth - childTotalWidth) / (features.length - 1)   // 每一段可分配空间
                        if (spaceLen < 0) return
                        features.sort((a, b) => a.getRectWrapExtent()[1] - b.getRectWrapExtent()[0])
                        this.toLeftAlign(features);
                        let lastLen = 0  // 之前所有的子元素宽度+之前所有分配的空间长度

                        features.forEach((f, i) => {
                            const prevFeature = features[i - 1];  // 上一个元素
                            if (prevFeature) {
                                const fPointArr = prevFeature.getPointArr(prevFeature.pointArr, -angle, center); // 获取旋转之前的点
                                const [leftTop, rightTop] = f.getRectWrapPoints(fPointArr);
                                lastLen += getLenOfTwoPnts(leftTop, rightTop) + spaceLen;
                            }
                            const dx = lastLen * Math.cos(angle * Math.PI / 180);
                            const dy = lastLen * Math.sin(angle * Math.PI / 180);
                            f.translate(dx, dy)
                        })
                        break;
                    }
                case AlignType.VERTICAL:
                    {
                        let childTotalHeight = 0;
                        features.forEach((f, i) => {
                            const fPointArr = f.getPointArr(f.pointArr, -angle, center); // 获取旋转之前的点
                            const [leftTop, rightTop, rightBottom, leftBottom] = f.getRectWrapPoints(fPointArr);
                            childTotalHeight += getLenOfTwoPnts(leftTop, leftBottom); // 计算所有子元素的宽度之和
                        })
                        const spaceLen = (wrapHeight - childTotalHeight) / (features.length - 1)   // 每一段可分配空间
                        if (spaceLen < 0) return
                        features.sort((a, b) => a.getRectWrapExtent()[3] - b.getRectWrapExtent()[2])
                        this.toTopAlign(features);
                        let lastLen = 0  // 之前所有的子元素宽度+之前所有分配的空间长度

                        features.forEach((f, i) => {
                            const prevFeature = features[i - 1];  // 上一个元素
                            if (prevFeature) {
                                const fPointArr = prevFeature.getPointArr(prevFeature.pointArr, -angle, center); // 获取旋转之前的点
                                const [leftTop, rightTop, rightBottom, leftBottom] = f.getRectWrapPoints(fPointArr);
                                lastLen += getLenOfTwoPnts(leftTop, leftBottom) + spaceLen;
                            }
                            const dx = lastLen * Math.sin(-angle * Math.PI / 180);
                            const dy = lastLen * Math.cos(-angle * Math.PI / 180);
                            f.translate(dx, dy)
                        })
                        break;
                    }
                default:
                    break;
            }
        }
    }
    // 均匀分布子元素, 两边有空隙
    toSpaceAroud(features: Feature[] = this.children, flexFLow = AlignType.HORIZONAL) {
        if (features.length <= 1) return
        const angle = this.angle;
        const center = this.getCenterPos();
        const pointArr = this.getPointArr(this.pointArr, -angle, center);  // 获取旋转之前的点
        const [leftTop, rightTop, rightBottom, leftBottom] = this.getRectWrapPoints(pointArr);
        const wrapWidth = getLenOfTwoPnts(leftTop, rightTop);
        const wrapHeight = getLenOfTwoPnts(leftTop, leftBottom);

        switch (flexFLow) {
            case AlignType.HORIZONAL:
                {
                    let childTotalWidth = 0;
                    features.forEach((f, i) => {
                        const fPointArr = f.getPointArr(f.pointArr, -angle, center); // 获取旋转之前的点
                        const [leftTop, rightTop] = f.getRectWrapPoints(fPointArr);
                        childTotalWidth += getLenOfTwoPnts(leftTop, rightTop); // 计算所有子元素的宽度之和
                    })
                    const spaceLen = (wrapWidth - childTotalWidth) / (features.length + 1)   // 每一段可分配空间
                    if (spaceLen < 0) return
                    features.sort((a, b) => a.getRectWrapExtent()[1] - b.getRectWrapExtent()[0])
                    this.toLeftAlign(features);
                    let lastLen = spaceLen  // 之前所有的子元素宽度+之前所有分配的空间长度

                    features.forEach((f, i) => {
                        const prevFeature = features[i - 1];  // 上一个元素
                        if (prevFeature) {
                            const fPointArr = prevFeature.getPointArr(prevFeature.pointArr, -angle, center); // 获取旋转之前的点
                            const [leftTop, rightTop] = f.getRectWrapPoints(fPointArr);
                            lastLen += getLenOfTwoPnts(leftTop, rightTop) + spaceLen;
                        }
                        const dx = lastLen * Math.cos(angle * Math.PI / 180);
                        const dy = lastLen * Math.sin(angle * Math.PI / 180);
                        f.translate(dx, dy)
                    })
                    break;
                }
            case AlignType.VERTICAL:
                {
                    let childTotalHeight = 0;
                    features.forEach((f, i) => {
                        const fPointArr = f.getPointArr(f.pointArr, -angle, center); // 获取旋转之前的点
                        const [leftTop, rightTop, rightBottom, leftBottom] = f.getRectWrapPoints(fPointArr);
                        childTotalHeight += getLenOfTwoPnts(leftTop, leftBottom); // 计算所有子元素的宽度之和
                    })
                    const spaceLen = (wrapHeight - childTotalHeight) / (features.length + 1)   // 每一段可分配空间
                    if (spaceLen < 0) return
                    features.sort((a, b) => a.getRectWrapExtent()[3] - b.getRectWrapExtent()[2])
                    this.toTopAlign(features);
                    let lastLen = spaceLen  // 之前所有的子元素宽度+之前所有分配的空间长度

                    features.forEach((f, i) => {
                        const prevFeature = features[i - 1];  // 上一个元素
                        if (prevFeature) {
                            const fPointArr = prevFeature.getPointArr(prevFeature.pointArr, -angle, center); // 获取旋转之前的点
                            const [leftTop, rightTop, rightBottom, leftBottom] = f.getRectWrapPoints(fPointArr);
                            lastLen += getLenOfTwoPnts(leftTop, leftBottom) + spaceLen;
                        }
                        const dx = lastLen * Math.sin(-angle * Math.PI / 180);
                        const dy = lastLen * Math.cos(-angle * Math.PI / 180);
                        f.translate(dx, dy)
                    })
                    break;
                }
            default:
                break;
        }
    }

    getSize(pointArr = this.pointArr) {
        const [leftTop, rightTop, rightBottom, leftBottom] = this.getRectWrapPoints(pointArr);
        return {
            width: getLenOfTwoPnts(leftTop, rightTop),
            height: getLenOfTwoPnts(leftTop, leftBottom),
        }
    }

    // flex-start：子项在起点位置对齐
    // flex - end：子项在结束位子对齐
    // center：子项在中心位置对齐
    // space - between两端顶对齐
    // between是中间的意思，就是多余的空白间距在元素中间分配
    // space - around：
    // around是环绕的意思，意思是每个flex子项两侧都环绕互不干扰的等宽的空白间距，最终视觉上边缘两侧的空白只有中间空白宽度一半。
    // space - evenly：
    // evenly是匀称、平等的意思。也就是视觉上，每个flex子项两侧空白间距完全相等。

}