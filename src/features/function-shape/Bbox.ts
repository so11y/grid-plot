import { AlignType, ClassName, CtrlType, LinkMark } from "@/Constants";
import { IBasicFeature, IPoint, IVctor } from "../../Interface";
import { createVctor, getLenOfPntToLine, getLenOfTwoPnts, getMidOfTwoPnts, getMousePos, getPntInVct, getRotateAng, getRotateVct, isBasicFeature, isPntInPolygon } from "../../utils";
import Line from "../basic-shape/Line";
import Link from "../basic-shape/Link";
import Rect from "../basic-shape/Rect";
import Feature from "../Feature";
import ACtrlPnt from "./ctrl-pnts/ACtrlPnt";
import RCtrlPnt from "./ctrl-pnts/RCtrlPnt";
import SCtrlPnt from "./ctrl-pnts/SCtrlPnt";
import Pnt from "./Pnt";
import SelectArea from "./SelectArea";

// 包围盒元素, 形变(放大,缩小)元素用
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

    constructor(target: IBasicFeature | SelectArea, isAnchor = true) {   // 相对坐标
        const angle = target.angle;
        target.rotate(-angle)
        const center = Feature.getCenterPos(target.pointArr);
        const [minX, maxX, minY, maxY] = Feature.getRectWrapExtent(target.pointArr);  // [leftTop, rightTop, rightBottom, leftBottom]
        super(center.x, center.y, maxX - minX, maxY - minY);
        this.className = ClassName.BBOX;
        this.isFixedPos = target.isFixedPos;
        this.rotate(angle)
        target.rotate(angle)
        this.target = target;
        this.fillStyle = this.focusStyle = this.hoverStyle = "transparent";
        this.isStroke = true;
        this.isClosePath = true;
        this.strokeStyle = "#fff";
        this.lineDashArr = [.8, .8]
        this.lineWidth = .06;
        this.ratio = this.getRatio();
        this.addChild(target, {}, false);
        this.initBCtrlPnt();
        this.setVct();
        this.setPointArrPer(target, getLenOfTwoPnts(this.pointArr[0], this.pointArr[1]), getLenOfTwoPnts(this.pointArr[0], this.pointArr[3]));
        isAnchor && this.enableAnchorPnts();  // 添加锚点,连接线
        this.gls.addFeature(this, false);
    }

    // 获取父元素pointArr所有点距离包围盒上下百分比
    setPointArrPer(target: Feature, width = 0, height = 0) {
        target.pntExtentPerOfBBox.left = []
        target.pntExtentPerOfBBox.right = []
        target.pointArr.forEach(p => {
            const lenX = getLenOfPntToLine(p, this.pointArr[0], this.pointArr[3]);
            const lenY = getLenOfPntToLine(p, this.pointArr[0], this.pointArr[1]);

            const lenX1 = getLenOfPntToLine(p, this.pointArr[1], this.pointArr[2]);
            const lenY1 = getLenOfPntToLine(p, this.pointArr[2], this.pointArr[3]);
            target.pntExtentPerOfBBox.left.push({
                x: lenX / width,
                y: lenY / height,
            })
            target.pntExtentPerOfBBox.right.push({
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
        if (this.target.ctrlTypes.includes(CtrlType.SIZE_CTRL)) {
            pointArr.forEach((p, i) => {
                const ctrlP = new SCtrlPnt(this, i, Bbox.ctrlPSize);
                ctrlP.name = CtrlType.SIZE_CTRL;
                ctrlP.on('translate', this.onSizeChange.bind(ctrlP))
            })
        }
        // 旋转点
        if (this.target.ctrlTypes.includes(CtrlType.ANGLE_CTRL)) {
            const rCtrlP = new RCtrlPnt(this, () => {
                const pointArr = this.pointArr;
                const vct = createVctor(pointArr[0], pointArr[3]);   // 控制点1,2的向量
                const midPnt = getMidOfTwoPnts(pointArr[0], pointArr[1]);
                const rotateCtrlPos = getPntInVct(midPnt, vct, -15)  // 关联点长度同步移动
                return rotateCtrlPos;
            }, Bbox.ctrlPSize);
            rCtrlP.name = CtrlType.ANGLE_CTRL;
            rCtrlP.adsorbTypes = []
            rCtrlP.on('translate', () => {
                const bboxPos = Feature.getCenterPos(this.pointArr); // bbox的中心点
                const bctrlPos = Feature.getCenterPos(rCtrlP.pointArr); // 旋转控制点的中心点
                const vct1: IVctor = [0, -100];
                const vct2 = createVctor(bboxPos, bctrlPos);
                let angle = getRotateAng(vct1, vct2);
                const offsetAngle = angle - rCtrlP.lastAngle;
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

                rCtrlP.lastAngle = angle;
            })
        }

        if (this.target.ctrlTypes.includes(CtrlType.WIDTH_CTRL)) {
            // 左边
            const bCtrlP2 = new RCtrlPnt(this, () => {
                const pointArr = this.pointArr;
                const widthCtrlPnt = getMidOfTwoPnts(pointArr[0], pointArr[3]);
                return widthCtrlPnt;
            }, Bbox.ctrlPSize);
            bCtrlP2.name = CtrlType.WIDTH_CTRL;
            bCtrlP2.on('translate', () => {
                const pointArr = this.pointArr;
                const ctrlPos = Feature.getCenterPos(bCtrlP2.pointArr);  // 当前控制点的中心点
                const lenX = getLenOfPntToLine(ctrlPos, pointArr[1], pointArr[2], true); // 控制点到vct的距离， 移动的距离
                if (lenX < 1) return
                const pnt = getPntInVct(pointArr[1], getRotateVct(this.vctX, 180), lenX)  // 关联点长度同步移动
                const pnt2 = getPntInVct(pointArr[2], getRotateVct(this.vctX, 180), lenX)  // 关联点长度同步移动
                pointArr[0].x = pnt.x;
                pointArr[0].y = pnt.y;
                pointArr[3].x = pnt2.x;
                pointArr[3].y = pnt2.y;
                if (this.lastLenX) {
                    const setTranform = (feature: Feature) => {
                        feature.pointArr.forEach((p, i) => {
                            const newPntX = getPntInVct(p, this.vctX, (lenX - this.lastLenX) * -feature.pntExtentPerOfBBox.right[i].x);
                            p.x = newPntX.x;
                            p.y = newPntX.y;
                        })
                        feature.dispatch(new CustomEvent('resize', { detail: CtrlType.WIDTH_CTRL }))
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
            const bCtrlP3 = new RCtrlPnt(this, () => {
                const pointArr = this.pointArr;
                const widthCtrlPnt = getMidOfTwoPnts(pointArr[1], pointArr[2]);
                return widthCtrlPnt;
            }, Bbox.ctrlPSize);
            bCtrlP3.name = CtrlType.WIDTH_CTRL;
            bCtrlP3.on('translate', () => {
                const pointArr = this.pointArr;
                const ctrlPos = Feature.getCenterPos(bCtrlP3.pointArr);  // 当前控制点的中心点
                const lenX = getLenOfPntToLine(ctrlPos, pointArr[0], pointArr[3], true); // 控制点到vct的距离， 移动的距离
                if (lenX < 1) return
                const pnt = getPntInVct(pointArr[0], this.vctX, lenX)  // 关联点长度同步移动
                const pnt2 = getPntInVct(pointArr[3], this.vctX, lenX)  // 关联点长度同步移动
                pointArr[1].x = pnt.x;
                pointArr[1].y = pnt.y;
                pointArr[2].x = pnt2.x;
                pointArr[2].y = pnt2.y;
                if (this.lastLenX) {
                    const setTranform = (feature: Feature) => {
                        feature.pointArr.forEach((p, i) => {
                            const newPntX = getPntInVct(p, this.vctX, (lenX - this.lastLenX) * feature.pntExtentPerOfBBox.left[i].x);
                            p.x = newPntX.x;
                            p.y = newPntX.y;
                        })
                        feature.dispatch(new CustomEvent('resize', { detail: CtrlType.WIDTH_CTRL }))
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
        }

        if (this.target.ctrlTypes.includes(CtrlType.HEIGHT_CTRL)) {
            // 上边
            const bCtrlP4 = new RCtrlPnt(this, () => {
                const pointArr = this.pointArr;
                const heightCtrlPnt = getMidOfTwoPnts(pointArr[0], pointArr[1]);
                return heightCtrlPnt;
            }, Bbox.ctrlPSize);
            bCtrlP4.name = CtrlType.HEIGHT_CTRL;
            bCtrlP4.on('translate', () => {
                const pointArr = this.pointArr;
                const ctrlPos = Feature.getCenterPos(bCtrlP4.pointArr);  // 当前控制点的中心点
                const lenY = getLenOfPntToLine(ctrlPos, pointArr[2], pointArr[3], true); // 控制点到vct的距离， 移动的距离
                if (lenY < 1) return
                const pnt = getPntInVct(pointArr[2], this.vctY, -lenY)  // 关联点长度同步移动
                const pnt2 = getPntInVct(pointArr[3], this.vctY, -lenY)  // 关联点长度同步移动
                pointArr[1].x = pnt.x;
                pointArr[1].y = pnt.y;
                pointArr[0].x = pnt2.x;
                pointArr[0].y = pnt2.y;
                if (this.lastLenY) {
                    const setTranform = (feature: Feature) => {
                        feature.pointArr.forEach((p, i) => {
                            const newPntX = getPntInVct(p, this.vctY, (lenY - this.lastLenY) * -feature.pntExtentPerOfBBox.right[i].y);
                            p.x = newPntX.x;
                            p.y = newPntX.y;
                        })
                        feature.dispatch(new CustomEvent('resize', { detail: CtrlType.HEIGHT_CTRL }))
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
            const bCtrlP5 = new RCtrlPnt(this, () => {
                const pointArr = this.pointArr;
                const heightCtrlPnt = getMidOfTwoPnts(pointArr[2], pointArr[3]);
                return heightCtrlPnt;
            }, Bbox.ctrlPSize);
            bCtrlP5.name = CtrlType.HEIGHT_CTRL;
            bCtrlP5.on('translate', () => {
                const pointArr = this.pointArr;
                const ctrlPos = Feature.getCenterPos(bCtrlP5.pointArr);  // 当前控制点的中心点
                const lenY = getLenOfPntToLine(ctrlPos, pointArr[0], pointArr[1], true); // 控制点到vct的距离， 移动的距离
                if (lenY < 1) return
                const pnt = getPntInVct(pointArr[0], this.vctY, lenY)  // 关联点长度同步移动
                const pnt2 = getPntInVct(pointArr[1], this.vctY, lenY)  // 关联点长度同步移动
                pointArr[3].x = pnt.x;
                pointArr[3].y = pnt.y;
                pointArr[2].x = pnt2.x;
                pointArr[2].y = pnt2.y;
                if (this.lastLenY) {
                    const setTranform = (feature: Feature) => {
                        feature.pointArr.forEach((p, i) => {
                            const newPntX = getPntInVct(p, this.vctY, (lenY - this.lastLenY) * feature.pntExtentPerOfBBox.left[i].y);
                            p.x = newPntX.x;
                            p.y = newPntX.y;
                        })
                        feature.dispatch(new CustomEvent('resize', { detail: CtrlType.HEIGHT_CTRL }))
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
        }
    }

    onSizeChange() {
        const bbox = this.parent as Bbox;
        const pointArr = bbox.pointArr;
        const ctrlPos = Feature.getCenterPos(this.pointArr);  // 当前控制点的中心点
        switch (this.index) {
            case 0:  // 左上角
                {
                    let lenX = getLenOfPntToLine(ctrlPos, pointArr[2], pointArr[1], true); // 控制点到vct的距离， 移动的距离
                    if (lenX < 1) { lenX = 1 }
                    const pnt = getPntInVct(pointArr[2], bbox.vctX, -lenX)  // 关联点长度同步移动

                    const lenY = Bbox.isKeepRatio ? lenX / bbox.ratio : getLenOfPntToLine(ctrlPos, pointArr[2], pointArr[3], true); // 控制点到vct的距离， 移动的距离
                    if (lenY < 1) { lenX = 1 }
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
                                const newPntX = getPntInVct(p, getRotateVct(bbox.vctX, 180), (lenX - bbox.lastLenX) * feature.pntExtentPerOfBBox.right[i].x);
                                p.x = newPntX.x;
                                p.y = newPntX.y;
                                const newPntY = getPntInVct(p, bbox.vctY, (lenY - bbox.lastLenY) * -feature.pntExtentPerOfBBox.right[i].y);
                                p.x = newPntY.x;
                                p.y = newPntY.y;
                            })
                            feature.dispatch(new CustomEvent('resize', { detail: CtrlType.SIZE_CTRL }))
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
                    let lenX = getLenOfPntToLine(ctrlPos, pointArr[3], pointArr[0], true); // 控制点到vct的距离， 移动的距离
                    if (lenX < 1) { lenX = 1 }
                    const pnt = getPntInVct(pointArr[3], bbox.vctX, lenX)  // 关联点长度同步移动

                    let lenY = Bbox.isKeepRatio ? lenX / bbox.ratio : getLenOfPntToLine(ctrlPos, pointArr[3], pointArr[2], true); // 控制点到vct的距离， 移动的距离
                    if (lenY < 1) { lenY = 1 }
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
                                const newPntX = getPntInVct(p, bbox.vctX, (lenX - bbox.lastLenX) * feature.pntExtentPerOfBBox.left[i].x);
                                p.x = newPntX.x;
                                p.y = newPntX.y;
                                const newPntY = getPntInVct(p, bbox.vctY, (lenY - bbox.lastLenY) * -feature.pntExtentPerOfBBox.right[i].y);
                                p.x = newPntY.x;
                                p.y = newPntY.y;
                            })
                            feature.dispatch(new CustomEvent('resize', { detail: CtrlType.SIZE_CTRL }))
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
                    let lenX = getLenOfPntToLine(ctrlPos, pointArr[0], pointArr[3], true); // 控制点到vct的距离， 移动的距离
                    if (lenX < 1) { lenX = 1 }
                    const pnt = getPntInVct(pointArr[0], bbox.vctX, lenX)  // 关联点长度同步移动

                    let lenY = Bbox.isKeepRatio ? lenX / bbox.ratio : getLenOfPntToLine(ctrlPos, pointArr[0], pointArr[1], true); // 控制点到vct的距离， 移动的距离
                    if (lenY < 1) { lenY = 1 }
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
                                const newPntX = getPntInVct(p, bbox.vctX, (lenX - bbox.lastLenX) * feature.pntExtentPerOfBBox.left[i].x);
                                p.x = newPntX.x;
                                p.y = newPntX.y;
                                const newPntY = getPntInVct(p, bbox.vctY, (lenY - bbox.lastLenY) * feature.pntExtentPerOfBBox.left[i].y);
                                p.x = newPntY.x;
                                p.y = newPntY.y;
                            })
                            feature.dispatch(new CustomEvent('resize', { detail: CtrlType.SIZE_CTRL }))
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
                    let lenX = getLenOfPntToLine(ctrlPos, pointArr[1], pointArr[2], true); // 控制点到vct的距离， 移动的距离
                    if (lenX < 1) { lenX = 1 }
                    const pnt = getPntInVct(pointArr[1], bbox.vctX, -lenX)  // 关联点长度同步移动

                    let lenY = Bbox.isKeepRatio ? lenX / bbox.ratio : getLenOfPntToLine(ctrlPos, pointArr[1], pointArr[0], true); // 控制点到vct的距离， 移动的距离
                    if (lenY < 1) { lenY = 1 }
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
                                const newPntX = getPntInVct(p, bbox.vctX, (lenX - bbox.lastLenX) * -feature.pntExtentPerOfBBox.right[i].x);
                                p.x = newPntX.x;
                                p.y = newPntX.y;
                                const newPntY = getPntInVct(p, bbox.vctY, (lenY - bbox.lastLenY) * feature.pntExtentPerOfBBox.left[i].y);
                                p.x = newPntY.x;
                                p.y = newPntY.y;
                            })
                            feature.dispatch(new CustomEvent('resize', { detail: CtrlType.SIZE_CTRL }))
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

    enableAnchorPnts(bool = true) {
        if (!isBasicFeature(this.target) || (this.target instanceof Line)) return  // 非基础元素或线性元素不添加锚点
        if (bool) {
            const anchorPnts: ACtrlPnt[] = []
            for (let index = 0; index < 4; index++) {
                switch (index) {
                    case 0: {
                        let leftAp = new ACtrlPnt(this, () => {
                            const midPnt = getMidOfTwoPnts(this.pointArr[0], this.pointArr[3]);
                            const anchorPos = getPntInVct(midPnt, this.vctX, -8)  // 关联点长度同步移动
                            return anchorPos;
                        });
                        leftAp.name = AlignType.LEFT
                        anchorPnts.push(leftAp);
                    }
                        break;
                    case 1: {
                        let topAp = new ACtrlPnt(this, () => {
                            const midPnt = getMidOfTwoPnts(this.pointArr[0], this.pointArr[1]);
                            const anchorPos = getPntInVct(midPnt, this.vctY, -8)  // 关联点长度同步移动
                            return anchorPos;
                        });
                        topAp.name = AlignType.TOP
                        anchorPnts.push(topAp);
                    }
                        break;
                    case 2: {
                        let rightAp = new ACtrlPnt(this, () => {
                            const midPnt = getMidOfTwoPnts(this.pointArr[2], this.pointArr[1]);
                            const anchorPos = getPntInVct(midPnt, this.vctX, 8)  // 关联点长度同步移动
                            return anchorPos;
                        });
                        rightAp.name = AlignType.RIGHT
                        anchorPnts.push(rightAp);
                    }
                        break;
                    case 3: {
                        let bottomAp = new ACtrlPnt(this, () => {
                            const midPnt = getMidOfTwoPnts(this.pointArr[2], this.pointArr[3]);
                            const anchorPos = getPntInVct(midPnt, this.vctY, 8)  // 关联点长度同步移动
                            return anchorPos;
                        });
                        bottomAp.name = AlignType.BOTTOM
                        anchorPnts.push(bottomAp);
                    }
                        break;
                    case 4: {
                        let cenrterAp = new ACtrlPnt(this, () => {
                            const center = Feature.getCenterPos(this.pointArr);
                            return center;
                        });
                        cenrterAp.name = AlignType.CENTER
                        anchorPnts.push(cenrterAp);
                    }
                        break;
                    default:
                        break;
                }
            }

            let link: Link | null;
            anchorPnts.forEach(ap => {
                ap.on('mousedown', (e: any) => {
                    if (!link) {
                        link = new Link(this.target, ap);
                        this.gls.addFeature(link, false);
                        this.gls.features.filter(f => (f instanceof ACtrlPnt) && isBasicFeature(f.parent) && (f.hidden = false))
                    }
                })
                ap.on('mouseup', (e: any) => {
                    const mousePos = this.gls.getRelativePos(getMousePos(this.gls.domElement, e.detail));
                    const endFeature = this.gls.features.filter(f => (f instanceof ACtrlPnt) && f != ap).find(f => isPntInPolygon(mousePos, Feature.getRectWrapPoints(f.pointArr)));
                    link && this.gls.removeFeature(link, false)
                    this.gls.features.filter(f => (f instanceof ACtrlPnt) && isBasicFeature(f.parent) && (f.hidden = true))
                    if (endFeature) {
                        const startFeature = this.target.children.find(cf => cf.name === ap.name);
                        if (startFeature) {
                            this.gls.addFeature(new Link(startFeature, endFeature), false);
                            link = null;
                        }
                    }
                })
            })
        } else {
            const anchorPnts = this.getACtrlPnts();
            anchorPnts.forEach(ap => {
                this.gls.removeFeature(ap, false);
            })
        }
    }

    destroy() {
        const ctrlPnts = this.getCtrlPnts();
        ctrlPnts.forEach(cp => {
            this.gls.removeFeature(cp, false);
        })
        const anchorPnts = this.getACtrlPnts();
        anchorPnts.forEach(ap => {
            this.gls.removeFeature(ap, false);
        })
        this.children.forEach(cf => cf.parent = null)
    }
}