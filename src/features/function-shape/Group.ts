
import { BasicFeature, IPoint } from "@/Interface";
import Rect from "../basic-shape/Rect";
import Feature from "../Feature";

export default class Group extends Rect {

    constructor(features: BasicFeature[]) {   // 相对坐标
        super(0, 0, 0, 0);
        features = features.filter(f => !f.isFixedPos && !f.isFixedSize) // 过滤不合法的元素
        features.forEach(f => {
            this.addFeature(f, false);
        })
        this.toResize(features);
        this.className = 'Group';
        this.fillStyle = this.focusStyle = this.hoverStyle = this.strokeStyle = "transparent";
        this.isStroke = false;
        this.closePath = true;
        this.lineDashArr = [8, 12]
        this.lineWidth = .1;
        // this.translateEvents.push(() => {
        //     console.log(111);
        // })
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
        if (minY == undefined) {
            if (features.length > 1) {
                let minYs = features.map(f => f.getRectWrapExtent()[2]);
                minY = minYs.sort(function (a, b) { return a - b })[0];  // 找到最大的minY

            }
        } else {
            // minY = this.gls.getRelativeY(minY);
        }
        features.forEach(f => {
            f.translate(0, (minY || 0) - f.getRectWrapExtent()[2])
        })
    }
    toBottomAlign(features: Feature[] = this.children, maxY: number = this.getRectWrapExtent()[3]) {
        if (maxY == undefined) {
            if (features.length > 1) {
                let maxYs = features.map(f => f.getRectWrapExtent()[3]);
                maxY = maxYs.sort(function (a, b) { return b - a })[0];
            }
        } else {
            // maxY = this.gls.getRelativeY(maxY);
        }
        features.forEach(f => {
            f.translate(0, (maxY || 0) - f.getRectWrapExtent()[3])
        })
    }
    toLeftAlign(features: Feature[] = this.children, minX: number = this.getRectWrapExtent()[0]) {
        if (minX == undefined) {
            if (features.length > 1) {
                let minXs = features.map(f => f.getRectWrapExtent()[0]);
                minX = minXs.sort(function (a, b) { return a - b })[0];
            }
        } else {
            // minX = this.gls.getRelativeY(minX);
        }
        features.forEach(f => {
            f.translate((minX || 0) - f.getRectWrapExtent()[0], 0)
        })
    }
    toRightAlign(features: Feature[] = this.children, maxX: number = this.getRectWrapExtent()[1]) {
        if (maxX == undefined) {
            if (features.length > 1) {
                let maxXs = features.map(f => f.getRectWrapExtent()[1]);
                maxX = maxXs.sort(function (a, b) { return b - a })[0];
            }
        } else {
            // maxX = this.gls.getRelativeY(maxX);
        }

        features.forEach(f => {
            f.translate((maxX || 0) - f.getRectWrapExtent()[1], 0)
        })
    }
    toHorizonalAlign(features: Feature[] = this.children, centerX: number = this.getCenterPos().y) {
        if (centerX == undefined) {
            if (features.length > 1) {
                let ys = features.map(f => f.getCenterPos().y);
                centerX = ys.reduce((a, b) => a + b) / ys.length;
            }
        } else {
            // centerX = this.gls.getRelativeY(centerX);
        }
        features.forEach(f => {
            f.translate(0, (centerX || 0) - f.getCenterPos().y)
        })
    }
    toVerticalAlign(features: Feature[] = this.children, centerY: number = this.getCenterPos().x) {
        if (centerY == undefined) {
            if (features.length > 1) {
                let xs = features.map(f => f.getCenterPos().x);
                centerY = xs.reduce((a, b) => a + b) / xs.length;
            }
        } else {
            // centerY = this.gls.getRelativeY(centerY);
        }
        features.forEach(f => {
            f.translate((centerY || 0) - f.getCenterPos().x, 0)
        })
    }

    // 均匀分布子元素, 两边有空隙
    toSpaceAroud(features: Feature[] = this.children) {
        if (features.length > 1) {
            features.sort((a, b) => a.getRectWrapExtent()[1] - b.getRectWrapExtent()[0])
            this.toLeftAlign(features);
            const { width, height, leftTop } = this.getSize();
            let sonWidths = 0;
            features.forEach(f => {
                let [minX, maxX, minY, maxY] = f.getRectWrapExtent();
                sonWidths += (maxX - minX);
            })
            let spaceWidth = (width - sonWidths) / (features.length + 1)
            let lastWidth = 0
            features.forEach((f, i) => {
                if (features[i - 1]) {
                    let [minX, maxX, minY, maxY] = features[i - 1].getRectWrapExtent();
                    lastWidth += (maxX - minX);
                }
                f.translate(spaceWidth * (i + 1) + lastWidth, 0)
            })
        }
    }

    // 均匀分布子元素, 两边吗没有空隙
    toSpaceBetween(features: Feature[] = this.children) {
        if (features.length > 1) {
            features.sort((a, b) => a.getRectWrapExtent()[1] - b.getRectWrapExtent()[0])
            this.toLeftAlign(features);
            const { width, height, leftTop } = this.getSize();  // group的大小
            let sonWidths = 0;
            features.forEach(f => {
                let [minX, maxX, minY, maxY] = f.getRectWrapExtent();
                sonWidths += (maxX - minX);
            })
            let spaceWidth = (width - sonWidths) / (features.length - 1)
            let lastWidth = 0
            features.forEach((f, i) => {
                if (features[i - 1]) {
                    let [minX, maxX, minY, maxY] = features[i - 1].getRectWrapExtent();
                    lastWidth += (maxX - minX);
                }
                f.translate(spaceWidth * i + lastWidth, 0)
            })
        }
    }
}