import { CtrlType } from "@/Constants";
import GridSystem from "@/GridSystem";
import { IBasicFeature, IVctor } from "../../Interface";
import { createVctor, getLenOfPntToLine, getLenOfTwoPnts, getMidOfTwoPnts, getPntInVct, getRotateAng, getRotateVct } from "../../utils";
import Rect from "../basic-shape/Rect";
import Feature from "../Feature";
import BCtrlPnt from "./ctrl-pnts/BCtrlPnt";
import CtrlPnt from "./ctrl-pnts/CtrlPnt";
import SelectArea from "./SelectArea";

export default class Bbox extends Rect {

    static isAbsorbAngle = true; // 是否旋转角度的吸附
    static isKeepRatio = true; // 是否按宽高比例缩放
    static ctrlPSize = 14; // 控制点大小

    ratio: number = 1;  // 宽高比, keepRatio用
    vctX: IVctor = [100, 0];
    vctY: IVctor = [0, 100];
    lastLenX = 0;
    lastLenY = 0;
    target: Feature;

    constructor(target: IBasicFeature | SelectArea) {   // 相对坐标
        // const angle = target.angle;
        // target.rotate(-angle)
        const center = Feature.getCenterPos(target.pointArr);
        const [minX, maxX, minY, maxY] = Feature.getRectWrapExtent(target.pointArr);  // [leftTop, rightTop, rightBottom, leftBottom]
        super(center.x, center.y, maxX - minX, maxY - minY);
        this.className = 'Bbox';
        this.isFixedPos = target.isFixedPos;
        // this.rotate(angle)
        // target.rotate(angle)
        this.target = target;
        this.fillStyle = this.focusStyle = this.hoverStyle = "transparent";
        this.isStroke = true;
        this.isClosePath = true;
        this.strokeStyle = "#55585A";
        this.lineDashArr = [8, 8]
        this.lineWidth = .06;
        this.ratio = this.getRatio();
        this.addFeature(target);
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
            const lenX = getLenOfPntToLine(p, this.pointArr[0], this.pointArr[3]);
            const lenY = getLenOfPntToLine(p, this.pointArr[0], this.pointArr[1]);

            const lenX1 = getLenOfPntToLine(p, this.pointArr[1], this.pointArr[2]);
            const lenY1 = getLenOfPntToLine(p, this.pointArr[2], this.pointArr[3]);
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
            const ctrlP = new CtrlPnt(this, i, Bbox.ctrlPSize);
            ctrlP.name = CtrlType.SIZE_CTRL;
            ctrlP.translateEvents.push(this.onSizeChange.bind(ctrlP))
        })
        // 旋转点
        const bCtrlP = new BCtrlPnt(this, () => {
            const pointArr = this.pointArr;
            const vct = createVctor(pointArr[0], pointArr[3]);   // 控制点1,2的向量
            const midPnt = getMidOfTwoPnts(pointArr[0], pointArr[1]);
            const rotateCtrlPnt = getPntInVct(midPnt, vct, -15)  // 关联点长度同步移动
            return rotateCtrlPnt;
        }, Bbox.ctrlPSize);
        bCtrlP.name = CtrlType.ANGLE_CTRL;
        bCtrlP.adsorbTypes = []
        bCtrlP.translateEvents.push(() => {
            const bboxPos = Feature.getCenterPos(this.pointArr); // bbox的中心点
            const bctrlPos = Feature.getCenterPos(bCtrlP.pointArr); // 旋转控制点的中心点
            const vct1: IVctor = [0, -100];
            const vct2 = createVctor(bboxPos, bctrlPos);
            let angle = getRotateAng(vct1, vct2);
            const offsetAngle = angle - bCtrlP.lastAngle;
            this.rotate(offsetAngle);

            if (Bbox.isAbsorbAngle) { // 角度吸附
                let absorbAngle = 0
                if (this.angle <= 2 && !absorbAngle) {
                    absorbAngle = 0 - this.angle
                }
                if (this.angle >= 43 && this.angle <= 47 && !absorbAngle) {
                    absorbAngle = 45 - this.angle
                }
                if (this.angle >= 88 && this.angle <= 92 && !absorbAngle) {
                    absorbAngle = 90 - this.angle
                }
                if (this.angle >= 133 && this.angle <= 137 && !absorbAngle) {
                    absorbAngle = 135 - this.angle
                }
                if (this.angle >= 178 && this.angle <= 182 && !absorbAngle) {
                    absorbAngle = 180 - this.angle
                }
                if (this.angle >= 223 && this.angle <= 227 && !absorbAngle) {
                    absorbAngle = 225 - this.angle
                }
                if (this.angle >= 268 && this.angle <= 272 && !absorbAngle) {
                    absorbAngle = 270 - this.angle
                }
                if (this.angle >= 313 && this.angle <= 317 && !absorbAngle) {
                    absorbAngle = 315 - this.angle
                }
                if (this.angle >= 358 && !absorbAngle) {
                    absorbAngle = 360 - this.angle
                }
                this.rotate(absorbAngle);
                angle += absorbAngle;
            }

            bCtrlP.lastAngle = angle;
        })

        // 左边
        const bCtrlP2 = new BCtrlPnt(this, () => {
            const pointArr = this.pointArr;
            const widthCtrlPnt = getMidOfTwoPnts(pointArr[0], pointArr[3]);
            return widthCtrlPnt;
        }, Bbox.ctrlPSize);
        bCtrlP2.name = CtrlType.WIDTH_CTRL;
        bCtrlP2.translateEvents.push(() => {
            const pointArr = this.pointArr;
            const ctrlPos = Feature.getCenterPos(bCtrlP2.pointArr);  // 当前控制点的中心点
            const lenX = getLenOfPntToLine(ctrlPos, pointArr[1], pointArr[2]); // 控制点到vct的距离， 移动的距离
            const pnt = getPntInVct(pointArr[1], getRotateVct(this.vctX, 180), lenX)  // 关联点长度同步移动
            const pnt2 = getPntInVct(pointArr[2], getRotateVct(this.vctX, 180), lenX)  // 关联点长度同步移动
            pointArr[0].x = pnt.x;
            pointArr[0].y = pnt.y;
            pointArr[3].x = pnt2.x;
            pointArr[3].y = pnt2.y;
            if (this.lastLenX) {
                const setTranform = (feature: Feature) => {
                    feature.pointArr.forEach((p, i) => {
                        const newPntX = getPntInVct(p, this.vctX, (lenX - this.lastLenX) * -feature.pntExtentPer.right[i].x);
                        p.x = newPntX.x;
                        p.y = newPntX.y;
                    })
                    feature.onresize(CtrlType.WIDTH_CTRL);
                    if (feature.cbTransformChild) {
                        feature.children.forEach(f => {
                            setTranform(f);
                        })
                    }
                }
                setTranform(this.target);
            }
            this.lastLenX = lenX;
            this.ratio = this.getRatio();
        })

        // 右边
        const bCtrlP3 = new BCtrlPnt(this, () => {
            const pointArr = this.pointArr;
            const widthCtrlPnt = getMidOfTwoPnts(pointArr[1], pointArr[2]);
            return widthCtrlPnt;
        }, Bbox.ctrlPSize);
        bCtrlP3.name = CtrlType.WIDTH_CTRL;
        bCtrlP3.translateEvents.push(() => {
            const pointArr = this.pointArr;
            const ctrlPos = Feature.getCenterPos(bCtrlP3.pointArr);  // 当前控制点的中心点
            const lenX = getLenOfPntToLine(ctrlPos, pointArr[0], pointArr[3]); // 控制点到vct的距离， 移动的距离
            const pnt = getPntInVct(pointArr[0], this.vctX, lenX)  // 关联点长度同步移动
            const pnt2 = getPntInVct(pointArr[3], this.vctX, lenX)  // 关联点长度同步移动
            pointArr[1].x = pnt.x;
            pointArr[1].y = pnt.y;
            pointArr[2].x = pnt2.x;
            pointArr[2].y = pnt2.y;
            if (this.lastLenX) {
                const setTranform = (feature: Feature) => {
                    feature.pointArr.forEach((p, i) => {
                        const newPntX = getPntInVct(p, this.vctX, (lenX - this.lastLenX) * feature.pntExtentPer.left[i].x);
                        p.x = newPntX.x;
                        p.y = newPntX.y;
                    })
                    feature.onresize(CtrlType.WIDTH_CTRL);
                    if (feature.cbTransformChild) {
                        feature.children.forEach(f => {
                            setTranform(f);
                        })
                    }
                    Feature.getRectWrapExtent(feature.pointArr)
                }
                setTranform(this.target);
            }
            this.lastLenX = lenX;
            this.ratio = this.getRatio();
        })

        // 上边
        const bCtrlP4 = new BCtrlPnt(this, () => {
            const pointArr = this.pointArr;
            const heightCtrlPnt = getMidOfTwoPnts(pointArr[0], pointArr[1]);
            return heightCtrlPnt;
        }, Bbox.ctrlPSize);
        bCtrlP4.name = CtrlType.HEIGHT_CTRL;
        bCtrlP4.translateEvents.push(() => {
            const pointArr = this.pointArr;
            const ctrlPos = Feature.getCenterPos(bCtrlP4.pointArr);  // 当前控制点的中心点
            const lenY = getLenOfPntToLine(ctrlPos, pointArr[2], pointArr[3]); // 控制点到vct的距离， 移动的距离
            const pnt = getPntInVct(pointArr[2], this.vctY, -lenY)  // 关联点长度同步移动
            const pnt2 = getPntInVct(pointArr[3], this.vctY, -lenY)  // 关联点长度同步移动
            pointArr[1].x = pnt.x;
            pointArr[1].y = pnt.y;
            pointArr[0].x = pnt2.x;
            pointArr[0].y = pnt2.y;
            if (this.lastLenY) {
                const setTranform = (feature: Feature) => {
                    feature.pointArr.forEach((p, i) => {
                        const newPntX = getPntInVct(p, this.vctY, (lenY - this.lastLenY) * -feature.pntExtentPer.right[i].y);
                        p.x = newPntX.x;
                        p.y = newPntX.y;
                    })
                    feature.onresize(CtrlType.HEIGHT_CTRL);
                    if (feature.cbTransformChild) {
                        feature.children.forEach(f => {
                            setTranform(f);
                        })
                    }
                }
                setTranform(this.target);
            }
            this.lastLenY = lenY;
            this.ratio = this.getRatio();
        })

        // 下边
        const bCtrlP5 = new BCtrlPnt(this, () => {
            const pointArr = this.pointArr;
            const heightCtrlPnt = getMidOfTwoPnts(pointArr[2], pointArr[3]);
            return heightCtrlPnt;
        }, Bbox.ctrlPSize);
        bCtrlP5.name = CtrlType.HEIGHT_CTRL;
        bCtrlP5.translateEvents.push(() => {
            const pointArr = this.pointArr;
            const ctrlPos = Feature.getCenterPos(bCtrlP5.pointArr);  // 当前控制点的中心点
            const lenY = getLenOfPntToLine(ctrlPos, pointArr[0], pointArr[1]); // 控制点到vct的距离， 移动的距离
            const pnt = getPntInVct(pointArr[0], this.vctY, lenY)  // 关联点长度同步移动
            const pnt2 = getPntInVct(pointArr[1], this.vctY, lenY)  // 关联点长度同步移动
            pointArr[3].x = pnt.x;
            pointArr[3].y = pnt.y;
            pointArr[2].x = pnt2.x;
            pointArr[2].y = pnt2.y;
            if (this.lastLenY) {
                const setTranform = (feature: Feature) => {
                    feature.pointArr.forEach((p, i) => {
                        const newPntX = getPntInVct(p, this.vctY, (lenY - this.lastLenY) * feature.pntExtentPer.left[i].y);
                        p.x = newPntX.x;
                        p.y = newPntX.y;
                    })
                    feature.onresize(CtrlType.HEIGHT_CTRL);
                    if (feature.cbTransformChild) {
                        feature.children.forEach(f => {
                            setTranform(f);
                        })
                    }
                }
                setTranform(this.target);
            }
            this.lastLenY = lenY;
            this.ratio = this.getRatio();
        })

        // if (this.target.className != 'SelectArea') {  // 区域选择不可以锚点
        //     // 左边 锚点
        //     const aCtrlP1 = new AnchorPnt(this, () => {
        //         const pointArr = this.pointArr;
        //         const leftCenter = getMidOfTwoPnts(pointArr[0], pointArr[3]);
        //         const newLeftCenter = getPntInVct(leftCenter, this.vctX, -10);
        //         return newLeftCenter;
        //     });
        //     aCtrlP1.name = "leftAnchor";
        //     aCtrlP1.mousedownEvents.push(() => {
        //         this.gls.initAnchorPnts();
        //         const anchorPnts = this.target.getAnchorPnts();
        //         const link = new Link(anchorPnts.find(ap => ap.name == aCtrlP1.name) as AnchorPnt, aCtrlP1);
        //         link.name = 'tempLink';
        //     })
        //     aCtrlP1.mouseupEvents.push(() => {
        //         let touchedAnchor: AnchorPnt | undefined;
        //         const anchorPnts = this.gls.features.filter(f => f instanceof AnchorPnt && f !== aCtrlP1) as AnchorPnt[]
        //         const hasTouch = anchorPnts.some(a => {
        //             const touched = aCtrlP1.pointArr.some(p => isPntInPolygon(p, a.pointArr))
        //             if (touched) touchedAnchor = a;
        //             return touched
        //         })
        //         const tempLink = this.gls.features.find(f => f.name === 'tempLink');
        //         tempLink && this.gls.removeFeature(tempLink, false);
        //         if (hasTouch && touchedAnchor) {
        //             const anchorPnts = this.target.getAnchorPnts();
        //             const startAnchor = anchorPnts.find(ap => ap.name == aCtrlP1.name) as AnchorPnt;
        //             startAnchor.isBinding = true;
        //             touchedAnchor.isBinding = true;
        //             new Link(startAnchor, touchedAnchor);
        //         }
        //         this.gls.removeAnchorPnts();
        //     })
        // }

        this.getCtrlPnts().forEach(cp => cp.dragendEvents.push(() => {
            GridSystem.Stack && GridSystem.Stack.record()
        }))
    }

    onSizeChange() {
        const bbox = this.parent as Bbox;
        const pointArr = bbox.pointArr;
        const ctrlPos = Feature.getCenterPos(this.pointArr);  // 当前控制点的中心点
        switch (this.index) {
            case 0:  // 左上角
                {
                    const lenX = getLenOfPntToLine(ctrlPos, pointArr[2], pointArr[1]); // 控制点到vct的距离， 移动的距离
                    const pnt = getPntInVct(pointArr[2], bbox.vctX, -lenX)  // 关联点长度同步移动

                    const lenY = Bbox.isKeepRatio ? lenX / bbox.ratio : getLenOfPntToLine(ctrlPos, pointArr[2], pointArr[3]); // 控制点到vct的距离， 移动的距离
                    const pnt2 = getPntInVct(pointArr[2], bbox.vctY, -lenY)  // 关联点长度同步移动

                    pointArr[3].x = pnt.x;
                    pointArr[3].y = pnt.y;

                    pointArr[1].x = pnt2.x;
                    pointArr[1].y = pnt2.y;

                    if (Bbox.isKeepRatio) {
                        const pnt3 = getPntInVct(pointArr[3], bbox.vctY, -lenY)  // 关联点长度同步移动
                        pointArr[0].x = pnt3.x;
                        pointArr[0].y = pnt3.y;
                        this.setPos(pnt3.x, pnt3.y)
                    }

                    if (bbox.lastLenX && bbox.lastLenY) {
                        function setTranform(feature: Feature) {
                            feature.pointArr.forEach((p, i) => {
                                const newPntX = getPntInVct(p, getRotateVct(bbox.vctX, 180), (lenX - bbox.lastLenX) * feature.pntExtentPer.right[i].x);
                                p.x = newPntX.x;
                                p.y = newPntX.y;
                                const newPntY = getPntInVct(p, bbox.vctY, (lenY - bbox.lastLenY) * -feature.pntExtentPer.right[i].y);
                                p.x = newPntY.x;
                                p.y = newPntY.y;
                            })
                            feature.onresize(CtrlType.SIZE_CTRL);
                            if (feature.cbTransformChild) {
                                feature.children.forEach(f => {
                                    setTranform(f);
                                })
                            }
                        }
                        setTranform(bbox.target);
                    }
                    bbox.lastLenX = lenX;
                    bbox.lastLenY = lenY;
                    break;
                }
            case 1:  // 右上角
                {
                    const lenX = getLenOfPntToLine(ctrlPos, pointArr[3], pointArr[0]); // 控制点到vct的距离， 移动的距离
                    const pnt = getPntInVct(pointArr[3], bbox.vctX, lenX)  // 关联点长度同步移动

                    const lenY = Bbox.isKeepRatio ? lenX / bbox.ratio : getLenOfPntToLine(ctrlPos, pointArr[3], pointArr[2]); // 控制点到vct的距离， 移动的距离
                    const pnt2 = getPntInVct(pointArr[3], bbox.vctY, -lenY)  // 关联点长度同步移动

                    pointArr[2].x = pnt.x;
                    pointArr[2].y = pnt.y;

                    pointArr[0].x = pnt2.x;
                    pointArr[0].y = pnt2.y;

                    if (Bbox.isKeepRatio) {
                        const pnt3 = getPntInVct(pointArr[2], bbox.vctY, -lenY)  // 关联点长度同步移动
                        pointArr[1].x = pnt3.x;
                        pointArr[1].y = pnt3.y;
                        this.setPos(pnt3.x, pnt3.y)
                    }

                    if (bbox.lastLenX && bbox.lastLenY) {
                        function setTranform(feature: Feature) {
                            feature.pointArr.forEach((p, i) => {
                                const newPntX = getPntInVct(p, bbox.vctX, (lenX - bbox.lastLenX) * feature.pntExtentPer.left[i].x);
                                p.x = newPntX.x;
                                p.y = newPntX.y;
                                const newPntY = getPntInVct(p, bbox.vctY, (lenY - bbox.lastLenY) * -feature.pntExtentPer.right[i].y);
                                p.x = newPntY.x;
                                p.y = newPntY.y;
                            })
                            feature.onresize(CtrlType.SIZE_CTRL);
                            if (feature.cbTransformChild) {
                                feature.children.forEach(f => {
                                    setTranform(f);
                                })
                            }
                        }
                        setTranform(bbox.target);
                    }
                    bbox.lastLenX = lenX;
                    bbox.lastLenY = lenY;
                    break;
                }
            case 2:  // 右下角
                {
                    const lenX = getLenOfPntToLine(ctrlPos, pointArr[0], pointArr[3]); // 控制点到vct的距离， 移动的距离
                    const pnt = getPntInVct(pointArr[0], bbox.vctX, lenX)  // 关联点长度同步移动

                    const lenY = Bbox.isKeepRatio ? lenX / bbox.ratio : getLenOfPntToLine(ctrlPos, pointArr[0], pointArr[1]); // 控制点到vct的距离， 移动的距离
                    const pnt2 = getPntInVct(pointArr[0], bbox.vctY, lenY)  // 关联点长度同步移动

                    pointArr[1].x = pnt.x;
                    pointArr[1].y = pnt.y;

                    pointArr[3].x = pnt2.x;
                    pointArr[3].y = pnt2.y;

                    if (Bbox.isKeepRatio) {
                        const pnt3 = getPntInVct(pointArr[1], bbox.vctY, lenY)  // 关联点长度同步移动
                        pointArr[2].x = pnt3.x;
                        pointArr[2].y = pnt3.y;
                        this.setPos(pnt3.x, pnt3.y)
                    }

                    if (bbox.lastLenX && bbox.lastLenY) {
                        function setTranform(feature: Feature) {
                            feature.pointArr.forEach((p, i) => {
                                const newPntX = getPntInVct(p, bbox.vctX, (lenX - bbox.lastLenX) * feature.pntExtentPer.left[i].x);
                                p.x = newPntX.x;
                                p.y = newPntX.y;
                                const newPntY = getPntInVct(p, bbox.vctY, (lenY - bbox.lastLenY) * feature.pntExtentPer.left[i].y);
                                p.x = newPntY.x;
                                p.y = newPntY.y;
                            })
                            feature.onresize(CtrlType.SIZE_CTRL);
                            if (feature.cbTransformChild) {
                                feature.children.forEach(f => {
                                    setTranform(f);
                                })
                            }
                        }
                        setTranform(bbox.target);
                    }
                    bbox.lastLenX = lenX;
                    bbox.lastLenY = lenY;
                    break;
                }
            case 3:  // 左下角
                {
                    const lenX = getLenOfPntToLine(ctrlPos, pointArr[1], pointArr[2]); // 控制点到vct的距离， 移动的距离
                    const pnt = getPntInVct(pointArr[1], bbox.vctX, -lenX)  // 关联点长度同步移动

                    const lenY = Bbox.isKeepRatio ? lenX / bbox.ratio : getLenOfPntToLine(ctrlPos, pointArr[1], pointArr[0]); // 控制点到vct的距离， 移动的距离
                    const pnt2 = getPntInVct(pointArr[1], bbox.vctY, lenY)  // 关联点长度同步移动

                    pointArr[0].x = pnt.x;
                    pointArr[0].y = pnt.y;

                    pointArr[2].x = pnt2.x;
                    pointArr[2].y = pnt2.y;

                    if (Bbox.isKeepRatio) {
                        const pnt3 = getPntInVct(pointArr[0], bbox.vctY, lenY)  // 关联点长度同步移动
                        pointArr[3].x = pnt3.x;
                        pointArr[3].y = pnt3.y;
                        this.setPos(pnt3.x, pnt3.y)
                    }



                    if (bbox.lastLenX && bbox.lastLenY) {
                        function setTranform(feature: Feature) {
                            feature.pointArr.forEach((p, i) => {
                                const newPntX = getPntInVct(p, bbox.vctX, (lenX - bbox.lastLenX) * -feature.pntExtentPer.right[i].x);
                                p.x = newPntX.x;
                                p.y = newPntX.y;
                                const newPntY = getPntInVct(p, bbox.vctY, (lenY - bbox.lastLenY) * feature.pntExtentPer.left[i].y);
                                p.x = newPntY.x;
                                p.y = newPntY.y;
                            })
                            feature.onresize(CtrlType.SIZE_CTRL);
                            if (feature.cbTransformChild) {
                                feature.children.forEach(f => {
                                    setTranform(f);
                                })
                            }
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
        const ctrlPnts = this.getCtrlPnts();
        const anchorPnts = this.getAnchorPnts();
        ctrlPnts.forEach(cp => {
            this.gls.removeFeature(cp, false);
        })
        anchorPnts.forEach(ap => {
            this.gls.removeFeature(ap, false);
        })
        this.children.forEach(cf => cf.parent = null)
    }
}