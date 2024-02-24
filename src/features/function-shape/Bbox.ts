import GridSystem from "@/GridSystem";
import { BasicFeature, IPoint, Vector } from "../../Interface";
import { createVctor, getLenOfPntToLine, getLenOfTwoPnts, getMidOfTwoPnts, getPntInVct, getRotateAng, getRotateVct, isPointInPolygon } from "../../utils";
import Link from "../basic-shape/Link";
import Rect from "../basic-shape/Rect";
import Text from "../basic-shape/Text";
import Feature from "../Feature";
import AnchorPnt from "./AnchorPnt";
import BCtrlPnt from "./BCtrlPnt";
import CtrlPnt from "./CtrlPnt";
import SelectArea from "./SelectArea";

export default class Bbox extends Rect {

    keepRatio: boolean;  // 是否按比例缩放
    ratio: number;  // 宽高比
    ctrlPntSize: number;
    lastAngle: number = 0;
    vctX: Vector = [100, 0];
    vctY: Vector = [0, 100];
    lastLenX = 0;
    lastLenY = 0;
    target: Feature;

    constructor(target: BasicFeature | SelectArea, ctrlPntSize = 10) {   // 相对坐标
        let [minX, maxX, minY, maxY] = target.getRectWrapExtent();  // [leftTop, rightTop, rightBottom, leftBottom]
        let center = target.getCenterPos();
        super(center.x, center.y, maxX - minX, maxY - minY);
        this.className = 'Bbox';
        this.isFixedPos = target.isFixedPos;
        // this.isFixedSize = target.isFixedSize;

        this.addFeature(target);
        this.target = target;
        this.ctrlPntSize = ctrlPntSize;
        this.fillStyle = this.focusStyle = this.hoverStyle = "transparent";
        this.isStroke = true;
        this.closePath = true;
        this.strokeStyle = "#55585A";
        this.lineDashArr = [8, 8]
        this.lineWidth = .1;
        this.keepRatio = true;
        this.ratio = this.getRatio();
        this.initBCtrlPnt();
        this.setVct();
        this.setPointArrPer(target, getLenOfTwoPnts(this.pointArr[0], this.pointArr[1]), getLenOfTwoPnts(this.pointArr[0], this.pointArr[3]));
        this.gls.addFeature(this, false);
    }

    // 获取父元素pointArr所有点距离包围盒上下百分比
    setPointArrPer(target: Feature, width = 0, height = 0) {
        target.pntExtentPer.left = []
        target.pntExtentPer.right = []
        target && target.pointArr.forEach(p => {
            let lenX = getLenOfPntToLine(p, this.pointArr[0], this.pointArr[3]);
            let lenY = getLenOfPntToLine(p, this.pointArr[0], this.pointArr[1]);

            let lenX1 = getLenOfPntToLine(p, this.pointArr[1], this.pointArr[2]);
            let lenY1 = getLenOfPntToLine(p, this.pointArr[2], this.pointArr[3]);
            // console.log(target);
            // if (target instanceof Text) {
            //     target.pntExtentPer.left.push({
            //         x: -lenX / width,
            //         y: -lenY / height,
            //     })
            // }
            target.pntExtentPer.left.push({
                x: lenX / width,
                y: lenY / height,
            })
            target.pntExtentPer.right.push({
                x: lenX1 / width,
                y: lenY1 / height,
            })
        })
        target.children.forEach(f => {
            this.setPointArrPer(f, width, height);
        })
    }

    // 初始化设置包围盒水平方向与垂直方向的向量
    setVct() {
        this.vctX = createVctor(this.pointArr[0], this.pointArr[1]);   // 控制点1,2的向量
        this.vctY = createVctor(this.pointArr[0], this.pointArr[3]);   // 控制点1,2的向量
    }

    // 初始化添加控制点
    initBCtrlPnt() {
        const pointArr = this.pointArr;
        pointArr.forEach((p, i) => {
            let ctrlP = new CtrlPnt(this, i);
            ctrlP.name = 'ctrl' + i;
            ctrlP.translateEvents.push(this.onSizeChange.bind(ctrlP))
        })
        // 旋转点
        let bCtrlP1 = new BCtrlPnt(this, () => {
            const pointArr = this.pointArr;
            const vct = createVctor(pointArr[0], pointArr[3]);   // 控制点1,2的向量
            const midPnt = getMidOfTwoPnts(pointArr[0], pointArr[1]);
            const rotateCtrlPnt = getPntInVct(midPnt, vct, -15)  // 关联点长度同步移动
            return rotateCtrlPnt;
        });
        bCtrlP1.adsorbTypes = []
        bCtrlP1.translateEvents.push(() => {
            const centerPos = this.getCenterPos(); // 当前控制点的中心点
            const pos = bCtrlP1.getCenterPos(); // 当前控制点的中心点
            let vct1: Vector = [0, -100];
            let vct2 = createVctor(centerPos, pos);
            let angle = getRotateAng(vct1, vct2);
            let offsetAngle = angle - bCtrlP1.lastAngle;
            // if (this.parent) {
            //         if (Math.floor(this.parent.angle + offsetAngle) >= 43 && Math.floor(this.parent.angle + offsetAngle) <= 47.angle != 45) {
            //         offsetAngle = 45 - this.parent.angle;
            //     }
            // }
            this.rotate(offsetAngle, centerPos);
            bCtrlP1.lastAngle = angle;
        })

        // 左边
        let bCtrlP2 = new BCtrlPnt(this, () => {
            const pointArr = this.pointArr;
            const widthCtrlPnt = getMidOfTwoPnts(pointArr[0], pointArr[3]);
            return widthCtrlPnt;
        });
        bCtrlP2.translateEvents.push(() => {
            const pointArr = this.pointArr;
            const ctrlPos = bCtrlP2.getCenterPos();  // 当前控制点的中心点
            const lenX = getLenOfPntToLine(ctrlPos, pointArr[1], pointArr[2]); // 控制点到vct的距离， 移动的距离
            const pnt = getPntInVct(pointArr[1], getRotateVct(this.vctX, 180), lenX)  // 关联点长度同步移动
            const pnt2 = getPntInVct(pointArr[2], getRotateVct(this.vctX, 180), lenX)  // 关联点长度同步移动
            pointArr[0].x = pnt.x;
            pointArr[0].y = pnt.y;
            pointArr[3].x = pnt2.x;
            pointArr[3].y = pnt2.y;
            if (this.lastLenX) {
                var setTranform = (feature: Feature) => {
                    feature.pointArr.forEach((p, i) => {
                        let newPntX = getPntInVct(p, this.vctX, (lenX - this.lastLenX) * -feature.pntExtentPer.right[i].x);
                        p.x = newPntX.x;
                        p.y = newPntX.y;
                    })
                    feature.resize();
                    feature.children.forEach(f => {
                        setTranform(f);
                    })
                }
                setTranform(this.target);
            }
            this.lastLenX = lenX;
            this.ratio = this.getRatio();
        })

        // 右边
        let bCtrlP3 = new BCtrlPnt(this, () => {
            const pointArr = this.pointArr;
            const widthCtrlPnt = getMidOfTwoPnts(pointArr[1], pointArr[2]);
            return widthCtrlPnt;
        });
        bCtrlP3.translateEvents.push(() => {
            const pointArr = this.pointArr;
            const ctrlPos = bCtrlP3.getCenterPos();  // 当前控制点的中心点
            const lenX = getLenOfPntToLine(ctrlPos, pointArr[0], pointArr[3]); // 控制点到vct的距离， 移动的距离
            const pnt = getPntInVct(pointArr[0], this.vctX, lenX)  // 关联点长度同步移动
            const pnt2 = getPntInVct(pointArr[3], this.vctX, lenX)  // 关联点长度同步移动
            pointArr[1].x = pnt.x;
            pointArr[1].y = pnt.y;
            pointArr[2].x = pnt2.x;
            pointArr[2].y = pnt2.y;
            if (this.lastLenX) {
                var setTranform = (feature: Feature) => {
                    feature.pointArr.forEach((p, i) => {
                        let newPntX = getPntInVct(p, this.vctX, (lenX - this.lastLenX) * feature.pntExtentPer.left[i].x);
                        p.x = newPntX.x;
                        p.y = newPntX.y;
                    })
                    feature.resize();
                    feature.children.forEach(f => {
                        setTranform(f);
                    })
                }
                setTranform(this.target);
            }
            this.lastLenX = lenX;
            this.ratio = this.getRatio();
        })

        // 上边
        let bCtrlP4 = new BCtrlPnt(this, () => {
            const pointArr = this.pointArr;
            const heightCtrlPnt = getMidOfTwoPnts(pointArr[0], pointArr[1]);
            return heightCtrlPnt;
        });
        bCtrlP4.translateEvents.push(() => {
            const pointArr = this.pointArr;
            const ctrlPos = bCtrlP4.getCenterPos();  // 当前控制点的中心点
            const lenY = getLenOfPntToLine(ctrlPos, pointArr[2], pointArr[3]); // 控制点到vct的距离， 移动的距离
            const pnt = getPntInVct(pointArr[2], this.vctY, -lenY)  // 关联点长度同步移动
            const pnt2 = getPntInVct(pointArr[3], this.vctY, -lenY)  // 关联点长度同步移动
            pointArr[1].x = pnt.x;
            pointArr[1].y = pnt.y;
            pointArr[0].x = pnt2.x;
            pointArr[0].y = pnt2.y;
            if (this.lastLenY) {
                var setTranform = (feature: Feature) => {
                    feature.pointArr.forEach((p, i) => {
                        let newPntX = getPntInVct(p, this.vctY, (lenY - this.lastLenY) * -feature.pntExtentPer.right[i].y);
                        p.x = newPntX.x;
                        p.y = newPntX.y;
                    })
                    feature.resize();
                    feature.children.forEach(f => {
                        setTranform(f);
                    })
                }
                setTranform(this.target);
            }
            this.lastLenY = lenY;
            this.ratio = this.getRatio();
        })

        // 下边
        let bCtrlP5 = new BCtrlPnt(this, () => {
            const pointArr = this.pointArr;
            const heightCtrlPnt = getMidOfTwoPnts(pointArr[2], pointArr[3]);
            return heightCtrlPnt;
        });
        bCtrlP5.translateEvents.push(() => {
            const pointArr = this.pointArr;
            const ctrlPos = bCtrlP5.getCenterPos();  // 当前控制点的中心点
            const lenY = getLenOfPntToLine(ctrlPos, pointArr[0], pointArr[1]); // 控制点到vct的距离， 移动的距离
            const pnt = getPntInVct(pointArr[0], this.vctY, lenY)  // 关联点长度同步移动
            const pnt2 = getPntInVct(pointArr[1], this.vctY, lenY)  // 关联点长度同步移动
            pointArr[3].x = pnt.x;
            pointArr[3].y = pnt.y;
            pointArr[2].x = pnt2.x;
            pointArr[2].y = pnt2.y;
            if (this.lastLenY) {
                var setTranform = (feature: Feature) => {
                    feature.pointArr.forEach((p, i) => {
                        let newPntX = getPntInVct(p, this.vctY, (lenY - this.lastLenY) * feature.pntExtentPer.left[i].y);
                        p.x = newPntX.x;
                        p.y = newPntX.y;
                    })
                    feature.resize();
                    feature.children.forEach(f => {
                        setTranform(f);
                    })
                }
                setTranform(this.target);
            }
            this.lastLenY = lenY;
            this.ratio = this.getRatio();
        })

        if (this.target.className != 'SelectArea') {  // 区域选择不可以锚点
            // 左边 锚点
            let aCtrlP1 = new AnchorPnt(this, () => {
                const pointArr = this.pointArr;
                const leftCenter = getMidOfTwoPnts(pointArr[0], pointArr[3]);
                let newLeftCenter = getPntInVct(leftCenter, this.vctX, -10);
                return newLeftCenter;
            });
            aCtrlP1.name = "leftAnchor";
            aCtrlP1.mousedownEvents.push(() => {
                this.gls.initAnchorPnts();
                let anchorPnts = this.target.getAnchorPnts();
                let link = new Link(anchorPnts.find(ap => ap.name == aCtrlP1.name) as AnchorPnt, aCtrlP1);
                link.name = 'tempLink';
            })
            aCtrlP1.mouseupEvents.push(() => {
                let touchedAnchor: AnchorPnt | undefined;
                let anchorPnts = this.gls.features.filter(f => f instanceof AnchorPnt && f !== aCtrlP1) as AnchorPnt[]
                let hasTouch = anchorPnts.some(a => {
                    let touched = aCtrlP1.pointArr.some(p => isPointInPolygon(p, a.pointArr))
                    if (touched) touchedAnchor = a;
                    return touched
                })
                let tempLink = this.gls.features.find(f => f.name === 'tempLink');
                tempLink && this.gls.removeFeature(tempLink, false);
                if (hasTouch && touchedAnchor) {
                    let anchorPnts = this.target.getAnchorPnts();
                    let startAnchor = anchorPnts.find(ap => ap.name == aCtrlP1.name) as AnchorPnt;
                    startAnchor.isBinding = true;
                    touchedAnchor.isBinding = true;
                    new Link(startAnchor, touchedAnchor);
                }
                this.gls.removeAnchorPnts();
            })
        }

        this.getCtrlPnts().forEach(cp => cp.dragendEvents.push(() => {
            GridSystem.Stack && GridSystem.Stack.record()
        }))
    }

    onSizeChange() {
        const bbox = this.parent as Bbox;
        const pointArr = bbox.pointArr;
        const ctrlPos = this.getCenterPos();  // 当前控制点的中心点
        switch (this.name) {
            case 'ctrl0':  // 左上角
                {
                    const lenX = getLenOfPntToLine(ctrlPos, pointArr[2], pointArr[1]); // 控制点到vct的距离， 移动的距离
                    const pnt = getPntInVct(pointArr[2], bbox.vctX, -lenX)  // 关联点长度同步移动

                    const lenY = bbox.keepRatio ? lenX / bbox.ratio : getLenOfPntToLine(ctrlPos, pointArr[2], pointArr[3]); // 控制点到vct的距离， 移动的距离
                    const pnt2 = getPntInVct(pointArr[2], bbox.vctY, -lenY)  // 关联点长度同步移动

                    if (bbox.keepRatio) {
                        const pnt3 = getPntInVct(pointArr[3], bbox.vctY, -lenY)  // 关联点长度同步移动
                        pointArr[0].x = pnt3.x;
                        pointArr[0].y = pnt3.y;
                        this.setPos(pnt3.x, pnt3.y)
                    }

                    pointArr[3].x = pnt.x;
                    pointArr[3].y = pnt.y;

                    pointArr[1].x = pnt2.x;
                    pointArr[1].y = pnt2.y;

                    if (bbox.lastLenX && bbox.lastLenY) {
                        function setTranform(feature: Feature) {
                            feature.pointArr.forEach((p, i) => {
                                let newPntX = getPntInVct(p, getRotateVct(bbox.vctX, 180), (lenX - bbox.lastLenX) * feature.pntExtentPer.right[i].x);
                                p.x = newPntX.x;
                                p.y = newPntX.y;
                                let newPntY = getPntInVct(p, bbox.vctY, (lenY - bbox.lastLenY) * -feature.pntExtentPer.right[i].y);
                                p.x = newPntY.x;
                                p.y = newPntY.y;
                            })
                            feature.resize();
                            feature.children.forEach(f => {
                                setTranform(f);
                            })
                        }
                        setTranform(bbox.target);
                    }
                    bbox.lastLenX = lenX;
                    bbox.lastLenY = lenY;
                    break;
                }
            case 'ctrl1':  // 右上角
                {
                    const lenX = getLenOfPntToLine(ctrlPos, pointArr[3], pointArr[0]); // 控制点到vct的距离， 移动的距离
                    const pnt = getPntInVct(pointArr[3], bbox.vctX, lenX)  // 关联点长度同步移动

                    const lenY = bbox.keepRatio ? lenX / bbox.ratio : getLenOfPntToLine(ctrlPos, pointArr[3], pointArr[2]); // 控制点到vct的距离， 移动的距离
                    const pnt2 = getPntInVct(pointArr[3], bbox.vctY, -lenY)  // 关联点长度同步移动

                    if (bbox.keepRatio) {
                        const pnt3 = getPntInVct(pointArr[2], bbox.vctY, -lenY)  // 关联点长度同步移动
                        pointArr[1].x = pnt3.x;
                        pointArr[1].y = pnt3.y;
                        this.setPos(pnt3.x, pnt3.y)
                    }

                    pointArr[2].x = pnt.x;
                    pointArr[2].y = pnt.y;

                    pointArr[0].x = pnt2.x;
                    pointArr[0].y = pnt2.y;

                    if (bbox.lastLenX && bbox.lastLenY) {
                        function setTranform(feature: Feature) {
                            feature.pointArr.forEach((p, i) => {
                                let newPntX = getPntInVct(p, bbox.vctX, (lenX - bbox.lastLenX) * feature.pntExtentPer.left[i].x);
                                p.x = newPntX.x;
                                p.y = newPntX.y;
                                let newPntY = getPntInVct(p, bbox.vctY, (lenY - bbox.lastLenY) * -feature.pntExtentPer.right[i].y);
                                p.x = newPntY.x;
                                p.y = newPntY.y;
                            })
                            feature.resize();
                            feature.children.forEach(f => {
                                setTranform(f);
                            })
                        }
                        setTranform(bbox.target);
                    }
                    bbox.lastLenX = lenX;
                    bbox.lastLenY = lenY;
                    break;
                }
            case 'ctrl2':  // 右下角
                {
                    const lenX = getLenOfPntToLine(ctrlPos, pointArr[0], pointArr[3]); // 控制点到vct的距离， 移动的距离
                    const pnt = getPntInVct(pointArr[0], bbox.vctX, lenX)  // 关联点长度同步移动

                    const lenY = bbox.keepRatio ? lenX / bbox.ratio : getLenOfPntToLine(ctrlPos, pointArr[0], pointArr[1]); // 控制点到vct的距离， 移动的距离
                    const pnt2 = getPntInVct(pointArr[0], bbox.vctY, lenY)  // 关联点长度同步移动

                    pointArr[1].x = pnt.x;
                    pointArr[1].y = pnt.y;

                    pointArr[3].x = pnt2.x;
                    pointArr[3].y = pnt2.y;

                    if (bbox.keepRatio) {
                        const pnt3 = getPntInVct(pointArr[1], bbox.vctY, lenY)  // 关联点长度同步移动
                        pointArr[2].x = pnt3.x;
                        pointArr[2].y = pnt3.y;
                        this.setPos(pnt3.x, pnt3.y)
                    }

                    if (bbox.lastLenX && bbox.lastLenY) {
                        function setTranform(feature: Feature) {
                            feature.pointArr.forEach((p, i) => {
                                let newPntX = getPntInVct(p, bbox.vctX, (lenX - bbox.lastLenX) * feature.pntExtentPer.left[i].x);
                                p.x = newPntX.x;
                                p.y = newPntX.y;
                                let newPntY = getPntInVct(p, bbox.vctY, (lenY - bbox.lastLenY) * feature.pntExtentPer.left[i].y);
                                p.x = newPntY.x;
                                p.y = newPntY.y;
                            })
                            feature.resize();
                            feature.children.forEach(f => {
                                setTranform(f);
                            })
                        }
                        setTranform(bbox.target);
                    }
                    bbox.lastLenX = lenX;
                    bbox.lastLenY = lenY;
                    break;
                }
            case 'ctrl3':  // 左下角
                {
                    const lenX = getLenOfPntToLine(ctrlPos, pointArr[1], pointArr[2]); // 控制点到vct的距离， 移动的距离
                    const pnt = getPntInVct(pointArr[1], bbox.vctX, -lenX)  // 关联点长度同步移动

                    const lenY = bbox.keepRatio ? lenX / bbox.ratio : getLenOfPntToLine(ctrlPos, pointArr[1], pointArr[0]); // 控制点到vct的距离， 移动的距离
                    const pnt2 = getPntInVct(pointArr[1], bbox.vctY, lenY)  // 关联点长度同步移动

                    if (bbox.keepRatio) {
                        const pnt3 = getPntInVct(pointArr[0], bbox.vctY, lenY)  // 关联点长度同步移动
                        pointArr[3].x = pnt3.x;
                        pointArr[3].y = pnt3.y;
                        this.setPos(pnt3.x, pnt3.y)
                    }

                    pointArr[0].x = pnt.x;
                    pointArr[0].y = pnt.y;

                    pointArr[2].x = pnt2.x;
                    pointArr[2].y = pnt2.y;

                    if (bbox.lastLenX && bbox.lastLenY) {
                        function setTranform(feature: Feature) {
                            feature.pointArr.forEach((p, i) => {
                                let newPntX = getPntInVct(p, bbox.vctX, (lenX - bbox.lastLenX) * -feature.pntExtentPer.right[i].x);
                                p.x = newPntX.x;
                                p.y = newPntX.y;
                                let newPntY = getPntInVct(p, bbox.vctY, (lenY - bbox.lastLenY) * feature.pntExtentPer.left[i].y);
                                p.x = newPntY.x;
                                p.y = newPntY.y;
                            })
                            feature.resize();
                            feature.children.forEach(f => {
                                setTranform(f);
                            })
                        }
                        setTranform(bbox.target);
                    }
                    bbox.lastLenX = lenX;
                    bbox.lastLenY = lenY;
                    break;
                }
            default:
                break;
        }
    }

    getCtrlPnts(): (CtrlPnt | BCtrlPnt)[] {
        return this.gls.features.filter(f => (f.className == 'CtrlPnt' || f.className == 'BCtrlPnt') && f.parent == this) as (CtrlPnt | BCtrlPnt)[];
    }

    destroy() {
        // super.destroy();
        let ctrlPnts = this.getCtrlPnts();
        let anchorPnts = this.getAnchorPnts();
        ctrlPnts.forEach(cp => {
            this.gls.removeFeature(cp, false);
        })
        anchorPnts.forEach(ap => {
            this.gls.removeFeature(ap, false);
        })
        this.children.forEach(cf => cf.parent = null)
    }
}