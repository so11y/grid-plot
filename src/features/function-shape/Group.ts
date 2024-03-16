
import { AlignType } from "@/Constants";
import { BasicFeature, IPoint } from "@/Interface";
import { createVctor, getLenOfPntToLine, getRotatePnt } from "@/utils";
import Rect from "../basic-shape/Rect";
import Feature from "../Feature";

export default class Group extends Rect {

    constructor(features: BasicFeature[]) {   // 相对坐标
        super(0, 0, 0, 0);
        console.log(features, "features");
        features.forEach(f => this.add(f))
        this.toResize(features);
        this.className = 'Group';
        this.fillStyle = this.focusStyle = this.hoverStyle = this.strokeStyle = "transparent";
        this.isStroke = false;
        this.closePath = true;
        this.lineDashArr = [8, 12]
        this.lineWidth = .1;
        this.cbTransformChild = false;
    }

    add(feature: BasicFeature) {
        if (!feature || feature.isFixedPos || feature.isFixedSize) return
        this.addFeature(feature, { cbSelect: false });
        this.toResize(this.children);
    }
    remove(feature: BasicFeature) {
        this.removeChild(feature);
        this.toResize(this.children);
    }
    toResize(features: BasicFeature[]) {  // 重新创建后重设大小
        let allPointArr: IPoint[] = [];
        features.map(f => allPointArr.push(...f.pointArr));
        let [minX, maxX, minY, maxY] = this.getRectWrapExtent(allPointArr);  // [leftTop, rightTop, rightBottom, leftBottom]
        let center = this.getCenterPos(allPointArr);  // [leftTop, rightTop, rightBottom, leftBottom]
        this.setPos(center.x, center.y);
        this.setSize(maxX - minX, maxY - minY);
    }

    // 顶部对齐
    toTopAlign(features: Feature[] = this.children, minY: number = this.getRectWrapExtent()[2]) {
        if (features.length > 1) {
            let minYs = features.map(f => f.getRectWrapExtent()[2]);
            minY = minYs.sort(function (a, b) { return a - b })[0];  // 找到最大的minY

        }
        features.forEach(f => {
            f.translate(0, (minY || 0) - f.getRectWrapExtent()[2])
        })
    }
    toBottomAlign(features: Feature[] = this.children, maxY: number = this.getRectWrapExtent()[3]) {
        if (features.length > 1) {
            let maxYs = features.map(f => f.getRectWrapExtent()[3]);
            maxY = maxYs.sort(function (a, b) { return b - a })[0];
        }
        features.forEach(f => {
            f.translate(0, (maxY || 0) - f.getRectWrapExtent()[3])
        })
    }
    toLeftAlign(features: Feature[] = this.children) {
        // features.forEach((f, i) => {
        //     let [leftTop, rightTop, rightBottom, leftBottom] = f.getRectWrapPoints();
        //     let pointArr = this.getRotatePoints(f.getRectWrapPoints(), f.angle);
        //     if (i == 1) {
        //         console.log(f.angle, this.angle);

        //         this.gls.test = this.gls.getPixelPos(leftTop);
        //     }
        //     const distance = getLenOfPntToLine(pointArr[0], this.pointArr[0], this.pointArr[3]);
        //     console.log(distance, "distance");
        //     // f.translate((minX || 0) - f.getRectWrapExtent()[0], 0)
        // })
    }
    toRightAlign(features: Feature[] = this.children, maxX: number = this.getRectWrapExtent()[1]) {
        if (features.length > 1) {
            let maxXs = features.map(f => f.getRectWrapExtent()[1]);
            maxX = maxXs.sort(function (a, b) { return b - a })[0];
        }
        features.forEach(f => {
            f.translate((maxX || 0) - f.getRectWrapExtent()[1], 0)
        })
    }
    toHorizonalAlign(features: Feature[] = this.children, centerX: number = this.getCenterPos().y) {
        if (features.length > 1) {
            let ys = features.map(f => f.getCenterPos().y);
            centerX = ys.reduce((a, b) => a + b) / ys.length;
        }
        features.forEach(f => {
            f.translate(0, (centerX || 0) - f.getCenterPos().y)
        })
    }
    toVerticalAlign(features: Feature[] = this.children, centerY: number = this.getCenterPos().x) {
        if (features.length > 1) {
            let xs = features.map(f => f.getCenterPos().x);
            centerY = xs.reduce((a, b) => a + b) / xs.length;
        }
        features.forEach(f => {
            f.translate((centerY || 0) - f.getCenterPos().x, 0)
        })
    }

    // 均匀分布子元素, 两边有空隙
    toSpaceAroud(features: Feature[] = this.children, flexFLow = AlignType.HORIZONAL) {
        if (features.length > 1) {
            switch (flexFLow) {
                case AlignType.HORIZONAL:
                    {
                        features.sort((a, b) => a.getRectWrapExtent()[1] - b.getRectWrapExtent()[0])
                        this.toLeftAlign(features);
                        const { width, height, leftTop } = this.getSize();
                        let sonLen = 0;
                        features.forEach(f => {
                            let [minX, maxX, minY, maxY] = f.getRectWrapExtent();
                            sonLen += (maxX - minX);
                        })
                        let spaceLen = (width - sonLen) / (features.length + 1)
                        let lastLen = 0
                        features.forEach((f, i) => {
                            if (features[i - 1]) {
                                let [minX, maxX, minY, maxY] = features[i - 1].getRectWrapExtent();
                                lastLen += (maxX - minX);
                            }
                            f.translate(spaceLen * (i + 1) + lastLen, 0)
                        })
                        break;
                    }
                case AlignType.VERTICAL:
                    {
                        features.sort((a, b) => a.getRectWrapExtent()[3] - b.getRectWrapExtent()[2])
                        this.toTopAlign(features);
                        const { width, height, leftTop } = this.getSize();
                        let sonLen = 0;
                        features.forEach(f => {
                            let [minX, maxX, minY, maxY] = f.getRectWrapExtent();
                            sonLen += (maxY - minY);
                        })
                        let spaceLen = (height - sonLen) / (features.length + 1)
                        let lastLen = 0
                        features.forEach((f, i) => {
                            if (features[i - 1]) {
                                let [minX, maxX, minY, maxY] = features[i - 1].getRectWrapExtent();
                                lastLen += (maxY - minY);
                            }
                            f.translate(0, spaceLen * (i + 1) + lastLen)
                        })
                        break;
                    }
                default:
                    break;
            }
        }
    }

    // 均匀分布子元素, 两边吗没有空隙
    toSpaceBetween(features: Feature[] = this.children, flexFLow = AlignType.HORIZONAL) {
        if (features.length > 1) {
            switch (flexFLow) {
                case AlignType.HORIZONAL:
                    {
                        features.sort((a, b) => a.getRectWrapExtent()[1] - b.getRectWrapExtent()[0])
                        this.toLeftAlign(features);
                        // const { width, height, leftTop } = this.getSize();  // group的大小
                        // let sonLen = 0;
                        // features.forEach(f => {
                        //     let [minX, maxX, minY, maxY] = f.getRectWrapExtent();
                        //     sonLen += (maxX - minX);
                        // })
                        // let spaceLen = (width - sonLen) / (features.length - 1)
                        // let lastLen = 0
                        // features.forEach((f, i) => {
                        //     if (features[i - 1]) {
                        //         let [minX, maxX, minY, maxY] = features[i - 1].getRectWrapExtent();
                        //         lastLen += (maxX - minX);
                        //     }
                        //     f.translate(spaceLen * i + lastLen, 0)
                        // })
                        break;
                    }
                case AlignType.VERTICAL:
                    {
                        features.sort((a, b) => a.getRectWrapExtent()[3] - b.getRectWrapExtent()[2])
                        this.toTopAlign(features);
                        const { width, height, leftTop } = this.getSize();  // group的大小
                        let sonLen = 0;
                        features.forEach(f => {
                            let [minX, maxX, minY, maxY] = f.getRectWrapExtent();
                            sonLen += (maxY - minY);
                        })
                        let spaceLen = (height - sonLen) / (features.length - 1)
                        let lastLen = 0
                        features.forEach((f, i) => {
                            if (features[i - 1]) {
                                let [minX, maxX, minY, maxY] = features[i - 1].getRectWrapExtent();
                                lastLen += (maxY - minY);
                            }
                            f.translate(0, spaceLen * i + lastLen)
                        })
                        break;
                    }
                default:
                    break;
            }
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