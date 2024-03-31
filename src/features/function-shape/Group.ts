
import { AlignType } from "@/Constants";
import { IBasicFeature, IPixelPos, IPoint, IRelativePos } from "@/Interface";
import { getLenOfPntToLine, getLenOfTwoPnts, isBasicFeature } from "@/utils";
import Feature from "../Feature";

// 多个子元素的包围集合
export default class Group extends Feature {

    constructor(features: IBasicFeature[]) {   // 相对坐标
        super([]);
        features.forEach(f => this.add(f))
        this.className = 'Group';
        // this.fillStyle = this.focusStyle = this.hoverStyle = this.strokeStyle = "transparent";
        this.isStroke = false;
        this.isClosePath = true;
        this.fillStyle = "rgba(250, 242, 180, .1)"
        this.hoverStyle = "rgba(250, 242, 180, .2)"
        this.focusStyle = "rgba(250, 242, 180, .3)"
        this.lineDashArr = [8, 12]
        this.lineWidth = .1;
        this.zIndex = -1;
        this.cbTransformChild = false;
    }

    add(feature: IBasicFeature) {
        if (!isBasicFeature(feature)) return;
        if (feature.isFixedPos || feature.isFixedSize) return;  // 非基础元素不添加
        this.addChild(feature, { cbSelect: false }, false);
        this.toResize(this.children);
    }
    remove(feature: IBasicFeature) {
        this.removeChild(feature);
        this.toResize(this.children);
    }
    toResize(features: IBasicFeature[]) {  // 重新创建后重设大小
        const allPointArr: IRelativePos[] = [];
        features.map(f => allPointArr.push(...f.pointArr));
        this.pointArr = Feature.getRectWrapPoints(allPointArr);  // [leftTop, rightTop, rightBottom, leftBottom]
    }

    toTopAlign(features: Feature[] = this.children) { // 顶部对齐
        const angle = this.angle;
        const center = Feature.getCenterPos(this.pointArr);
        const pointArr = this.getPointArr(this.pointArr, -angle, center);  // 获取旋转之前的点
        features.forEach(f => {
            const fPointArr = f.getPointArr(f.pointArr, -angle, center); // 获取旋转之前的点
            const [minX, maxX, minY, maxY] = Feature.getRectWrapExtent(fPointArr);  // 获取包围盒最左侧的点
            const len = getLenOfPntToLine({ x: 0, y: minY }, pointArr[0], pointArr[1]);
            const dx = len * Math.sin(-angle * Math.PI / 180);
            const dy = len * Math.cos(-angle * Math.PI / 180);
            f.translate(-dx, -dy)
        })
    }
    toLeftAlign(features: Feature[] = this.children) { // 左对齐
        const angle = this.angle;
        const center = Feature.getCenterPos(this.pointArr);
        const pointArr = this.getPointArr(this.pointArr, -angle, center);  // 获取旋转之前的点
        features.forEach((f, i) => {
            const fPointArr = f.getPointArr(f.pointArr, -angle, center); // 获取旋转之前的点
            const [minX, maxX, minY, maxY] = Feature.getRectWrapExtent(fPointArr);  // 获取包围盒最左侧的点
            const len = getLenOfPntToLine({ x: minX, y: 0 }, pointArr[0], pointArr[3]);
            const dx = len * Math.cos(angle * Math.PI / 180);
            const dy = len * Math.sin(angle * Math.PI / 180);
            // if (i == 0) {
            //     console.log(fPointArr[0], "minX");
            //     this.gls.test = this.gls.getPixelPos({ x: minX, y: 0 })
            // }
            f.translate(-dx, -dy)
        })
    }
    toBottomAlign(features: Feature[] = this.children) {
        const angle = this.angle;
        const center = Feature.getCenterPos(this.pointArr);
        const pointArr = this.getPointArr(this.pointArr, -angle, center);  // 获取旋转之前的点
        features.forEach(f => {
            const fPointArr = f.getPointArr(f.pointArr, -angle, center); // 获取旋转之前的点
            const [minX, maxX, minY, maxY] = Feature.getRectWrapExtent(fPointArr);  // 获取包围盒最左侧的点
            const len = getLenOfPntToLine({ x: 0, y: maxY }, pointArr[2], pointArr[3]);
            const dx = len * Math.sin(-angle * Math.PI / 180);
            const dy = len * Math.cos(-angle * Math.PI / 180);
            f.translate(dx, dy)
        })
    }
    toRightAlign(features: Feature[] = this.children) {
        const angle = this.angle;
        const center = Feature.getCenterPos(this.pointArr);
        const pointArr = this.getPointArr(this.pointArr, -angle, center);  // 获取旋转之前的点
        features.forEach(f => {
            const fPointArr = f.getPointArr(f.pointArr, -angle, center); // 获取旋转之前的点
            const [minX, maxX, minY, maxY] = Feature.getRectWrapExtent(fPointArr);  // 获取包围盒最左侧的点
            const len = getLenOfPntToLine({ x: maxX, y: 0 }, pointArr[1], pointArr[2]);
            const dx = len * Math.cos(angle * Math.PI / 180);
            const dy = len * Math.sin(angle * Math.PI / 180);
            f.translate(dx, dy)
        })
    }
    toVerticalAlign(features: Feature[] = this.children) {
        const angle = this.angle;
        const center = Feature.getCenterPos(this.pointArr);
        features.forEach(f => {
            const fPointArr = f.getPointArr(f.pointArr, -angle, center); // 获取旋转之前的点
            const fCenter = Feature.getCenterPos(fPointArr)
            const len = center.x - fCenter.x;
            const dx = len * Math.cos(angle * Math.PI / 180);
            const dy = len * Math.sin(angle * Math.PI / 180);
            f.translate(dx, dy)
        })
    }
    toHorizonalAlign(features: Feature[] = this.children) {
        const angle = this.angle;
        const center = Feature.getCenterPos(this.pointArr);
        features.forEach(f => {
            const fPointArr = f.getPointArr(f.pointArr, -angle, center); // 获取旋转之前的点
            const fCenter = Feature.getCenterPos(fPointArr)
            const len = center.y - fCenter.y;
            const dx = len * Math.sin(-angle * Math.PI / 180);
            const dy = len * Math.cos(-angle * Math.PI / 180);
            f.translate(dx, dy)
        })
    }

    // 均匀分布子元素, 两边没有空隙
    toSpaceBetween(features: Feature[] = this.children, flexFLow = AlignType.HORIZONAL) {
        const angle = this.angle;
        const center = Feature.getCenterPos(this.pointArr);

        const pointArr = this.getPointArr(this.pointArr, -angle, center);  // 获取旋转之前的点
        const [leftTop, rightTop, rightBottom, leftBottom] = Feature.getRectWrapPoints(pointArr);
        const wrapWidth = getLenOfTwoPnts(leftTop, rightTop);
        const wrapHeight = getLenOfTwoPnts(leftTop, leftBottom);

        if (features.length > 1) {
            switch (flexFLow) {
                case AlignType.HORIZONAL:  // 水平方向
                    {
                        let childTotalWidth = 0;   // 子元素宽度总和
                        features.forEach((f, i) => {
                            const fPointArr = f.getPointArr(f.pointArr, -angle, center); // 获取旋转之前的点
                            const [leftTop, rightTop] = Feature.getRectWrapPoints(fPointArr);
                            childTotalWidth += getLenOfTwoPnts(leftTop, rightTop); // 计算所有子元素的宽度之和
                        })
                        const spaceLen = (wrapWidth - childTotalWidth) / (features.length - 1)   // 每一段可分配空间
                        if (spaceLen < 0) return
                        features.sort((a, b) => Feature.getRectWrapExtent(a.pointArr)[1] - Feature.getRectWrapExtent(b.pointArr)[0])
                        this.toLeftAlign(features);   // 先左对齐让子元素处于同一起点
                        let lastLen = 0  // 之前所有的子元素宽度+之前所有分配的空间长度

                        features.forEach((f, i) => {
                            const prevFeature = features[i - 1];  // 上一个元素
                            if (prevFeature) {
                                const fPointArr = prevFeature.getPointArr(prevFeature.pointArr, -angle, center); // 获取旋转之前的点
                                const [leftTop, rightTop] = Feature.getRectWrapPoints(fPointArr);
                                lastLen += getLenOfTwoPnts(leftTop, rightTop) + spaceLen;
                            }
                            const dx = lastLen * Math.cos(angle * Math.PI / 180);
                            const dy = lastLen * Math.sin(angle * Math.PI / 180);
                            f.translate(dx, dy)
                        })
                        break;
                    }
                case AlignType.VERTICAL:  // 垂直方向同理
                    {
                        let childTotalHeight = 0;
                        features.forEach((f, i) => {
                            const fPointArr = f.getPointArr(f.pointArr, -angle, center); // 获取旋转之前的点
                            const [leftTop, rightTop, rightBottom, leftBottom] = Feature.getRectWrapPoints(fPointArr);
                            childTotalHeight += getLenOfTwoPnts(leftTop, leftBottom); // 计算所有子元素的宽度之和
                        })
                        const spaceLen = (wrapHeight - childTotalHeight) / (features.length - 1)   // 每一段可分配空间
                        if (spaceLen < 0) return
                        features.sort((a, b) => Feature.getRectWrapExtent(a.pointArr)[3] - Feature.getRectWrapExtent(b.pointArr)[2])
                        this.toTopAlign(features);
                        let lastLen = 0  // 之前所有的子元素宽度+之前所有分配的空间长度

                        features.forEach((f, i) => {
                            const prevFeature = features[i - 1];  // 上一个元素
                            if (prevFeature) {
                                const fPointArr = prevFeature.getPointArr(prevFeature.pointArr, -angle, center); // 获取旋转之前的点
                                const [leftTop, rightTop, rightBottom, leftBottom] = Feature.getRectWrapPoints(fPointArr);
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
        const center = Feature.getCenterPos(this.pointArr);
        const pointArr = this.getPointArr(this.pointArr, -angle, center);  // 获取旋转之前的点
        const [leftTop, rightTop, rightBottom, leftBottom] = Feature.getRectWrapPoints(pointArr);
        const wrapWidth = getLenOfTwoPnts(leftTop, rightTop);
        const wrapHeight = getLenOfTwoPnts(leftTop, leftBottom);

        switch (flexFLow) {
            case AlignType.HORIZONAL:
                {
                    let childTotalWidth = 0;
                    features.forEach((f, i) => {
                        const fPointArr = f.getPointArr(f.pointArr, -angle, center); // 获取旋转之前的点
                        const [leftTop, rightTop] = Feature.getRectWrapPoints(fPointArr);
                        childTotalWidth += getLenOfTwoPnts(leftTop, rightTop); // 计算所有子元素的宽度之和
                    })
                    const spaceLen = (wrapWidth - childTotalWidth) / (features.length + 1)   // 每一段可分配空间
                    if (spaceLen < 0) return
                    features.sort((a, b) => Feature.getRectWrapExtent(a.pointArr)[1] - Feature.getRectWrapExtent(b.pointArr)[0])
                    this.toLeftAlign(features);
                    let lastLen = spaceLen  // 之前所有的子元素宽度+之前所有分配的空间长度

                    features.forEach((f, i) => {
                        const prevFeature = features[i - 1];  // 上一个元素
                        if (prevFeature) {
                            const fPointArr = prevFeature.getPointArr(prevFeature.pointArr, -angle, center); // 获取旋转之前的点
                            const [leftTop, rightTop] = Feature.getRectWrapPoints(fPointArr);
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
                        const [leftTop, rightTop, rightBottom, leftBottom] = Feature.getRectWrapPoints(fPointArr);
                        childTotalHeight += getLenOfTwoPnts(leftTop, leftBottom); // 计算所有子元素的宽度之和
                    })
                    const spaceLen = (wrapHeight - childTotalHeight) / (features.length + 1)   // 每一段可分配空间
                    if (spaceLen < 0) return
                    features.sort((a, b) => Feature.getRectWrapExtent(a.pointArr)[3] - Feature.getRectWrapExtent(b.pointArr)[2])
                    this.toTopAlign(features);
                    let lastLen = spaceLen  // 之前所有的子元素宽度+之前所有分配的空间长度

                    features.forEach((f, i) => {
                        const prevFeature = features[i - 1];  // 上一个元素
                        if (prevFeature) {
                            const fPointArr = prevFeature.getPointArr(prevFeature.pointArr, -angle, center); // 获取旋转之前的点
                            const [leftTop, rightTop, rightBottom, leftBottom] = Feature.getRectWrapPoints(fPointArr);
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
        const [leftTop, rightTop, rightBottom, leftBottom] = Feature.getRectWrapPoints(pointArr);
        return {
            width: getLenOfTwoPnts(leftTop, rightTop),
            height: getLenOfTwoPnts(leftTop, leftBottom),
        }
    }

    getSvg(pointArr?: IPixelPos[], lineWidth?: number): string {
        return ""
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