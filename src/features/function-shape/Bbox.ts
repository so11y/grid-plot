import { BasicFeature, IPoint, Vector } from "../../Interface";
import { createVctor, getLenOfPntToLine, getLenOfTwoPnts, getMidOfTwoPnts, getPntInVct, getRotateAng, getRotateVct, isPointInPolygon } from "../../utils";
import Link from "../basic-shape/Link";
import Rect from "../basic-shape/Rect";
import Feature from "../Feature";
import AnchorPnt from "./AnchorPnt";
import BCtrlPnt from "./BCtrlPnt";
import CtrlPnt from "./CtrlPnt";
import SelectArea from "./SelectArea";

export default class Bbox extends Rect {

    keepRatio: boolean;  // 是否按比例缩放
    ratio: number;  // 宽高比
    ctrlPntSize: number;
    lastMove: IPoint;
    lastAngle: number = 0;
    vctX: Vector = [100, 0];
    vctY: Vector = [0, 100];
    bctrlPnts: (BCtrlPnt | CtrlPnt)[] = [];
    lastLenX = 0;
    lastLenY = 0;

    constructor(parent: BasicFeature | SelectArea, ctrlPntSize = 10) {   // 相对坐标
        let [minX, maxX, minY, maxY] = parent.getRectWrapExtent();  // [leftTop, rightTop, rightBottom, leftBottom]
        let center = parent.getCenterPos();  // [leftTop, rightTop, rightBottom, leftBottom]
        super(center.x, center.y, maxX - minX, maxY - minY);
        this.className = 'Bbox';
        this.parent = parent;
        this.isFixedPos = parent.isFixedPos;
        this.angle = 0;
        this.ctrlPntSize = ctrlPntSize;
        this.fillStyle = this.focusStyle = this.hoverStyle = "transparent";
        this.isStroke = false;
        this.strokeStyle = "red"
        this.lineWidth = .1;
        this.cbSelect = false;
        this.zIndex = Infinity;
        this.keepRatio = false;
        this.lastMove = { x: this.parent.pointArr[0].x, y: this.parent.pointArr[0].y };
        this.ratio = this.getRatio();
        this.gls.addFeature(this, false);
        this.parent.translateEvents.push(this.onMoveByParent.bind(this))
        this.initBCtrlPnt();
        this.setVct();
        this.setParentPointArrPer(this.parent);
        // document.addEventListener('pointArr' + this.id, this.onMoveByParent.bind(this));
    }

    // 获取父元素pointArr所有点距离包围盒上下百分比
    setParentPointArrPer(parent: Feature) {
        let width = getLenOfTwoPnts(this.pointArr[0], this.pointArr[1]);
        let height = getLenOfTwoPnts(this.pointArr[0], this.pointArr[3]);
        parent && parent.pointArr.forEach(p => {
            let lenX = getLenOfPntToLine(p, this.pointArr[0], this.pointArr[3]);
            let lenY = getLenOfPntToLine(p, this.pointArr[0], this.pointArr[1]);

            let lenX1 = getLenOfPntToLine(p, this.pointArr[1], this.pointArr[2]);
            let lenY1 = getLenOfPntToLine(p, this.pointArr[2], this.pointArr[3]);
            parent.pntExtentPer.left.push({
                x: lenX / width,
                y: lenY / height,
            })
            parent.pntExtentPer.right.push({
                x: lenX1 / width,
                y: lenY1 / height,
            })
        })
        if (parent instanceof SelectArea) {
            parent.featuresIn.forEach(f => {
                this.setParentPointArrPer(f);
            })
        }
    }

    // 设置 包围盒 水平方向 与 垂直方向 向量
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
            this.addBCtrlPnt(ctrlP);
        })
        // 旋转点
        let bCtrlP1 = new BCtrlPnt(this, () => {
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
            console.log(offsetAngle, "offsetAngle");
            // if (this.parent) {
            //         if (Math.floor(this.parent.angle + offsetAngle) >= 43 && Math.floor(this.parent.angle + offsetAngle) <= 47 && this.parent.angle != 45) {
            //         offsetAngle = 45 - this.parent.angle;
            //     }
            // }
            this.rotate(offsetAngle)
            if (this.parent) {
                this.parent.rotate(offsetAngle, this.getCenterPos());
                if (this.parent instanceof SelectArea) {
                    this.parent.featuresIn.forEach(f => {
                        f.rotate(offsetAngle, this.getCenterPos());
                    })
                }
                this.lastMove.x = this.parent.pointArr[0].x;
                this.lastMove.y = this.parent.pointArr[0].y;

            }
            bCtrlP1.lastAngle = angle;
            this.onUpdateLastMove();
        })

        // 左边
        let bCtrlP2 = new BCtrlPnt(this, () => {
            const widthCtrlPnt = getMidOfTwoPnts(pointArr[0], pointArr[3]);
            return widthCtrlPnt;
        });
        bCtrlP2.translateEvents.push(() => {
            const ctrlPos = bCtrlP2.getCenterPos();  // 当前控制点的中心点
            const lenX = getLenOfPntToLine(ctrlPos, pointArr[1], pointArr[2]); // 控制点到vct的距离， 移动的距离
            const pnt = getPntInVct(pointArr[1], getRotateVct(this.vctX, 180), lenX)  // 关联点长度同步移动
            const pnt2 = getPntInVct(pointArr[2], getRotateVct(this.vctX, 180), lenX)  // 关联点长度同步移动
            pointArr[0].x = pnt.x;
            pointArr[0].y = pnt.y;
            pointArr[3].x = pnt2.x;
            pointArr[3].y = pnt2.y;
            if (this.lastLenX && this.parent) {
                var setTranform = (feature: Feature) => {
                    feature.pointArr.forEach((p, i) => {
                        let newPntX = getPntInVct(p, this.vctX, (lenX - this.lastLenX) * -feature.pntExtentPer.right[i].x);
                        p.x = newPntX.x;
                        p.y = newPntX.y;
                    })
                }
                setTranform(this.parent);
                if (this.parent instanceof SelectArea) {
                    this.parent.featuresIn.forEach(f => {
                        setTranform(f);
                    })
                }
            }
            this.lastLenX = lenX;
            this.onUpdateLastMove();
        })

        // 左边 锚点
        let aCtrlP1 = new AnchorPnt(this, () => {
            const leftCenter = getMidOfTwoPnts(pointArr[0], pointArr[3]);
            let newLeftCenter = getPntInVct(leftCenter, this.vctX, -10);
            return newLeftCenter;
        });
        aCtrlP1.name = "leftAnchor";
        aCtrlP1.onmousedown = () => {
            if (this.parent) {
                let link = new Link(this.parent.anchorPnts.find(ap => ap.name == aCtrlP1.name) as AnchorPnt, aCtrlP1);
                link.name = 'tempLink';
            }
        }
        aCtrlP1.onmouseup = () => {
            let touchAnchor = null;
            let anchorPnts = this.gls.features.filter(f => f instanceof AnchorPnt && f !== aCtrlP1)
            let hasTouch = anchorPnts.some(a => {
                let touched = aCtrlP1.pointArr.some(p => isPointInPolygon(p, a.pointArr))
                if (touched) touchAnchor = a;
                return touched
            })
            let tempLink = this.gls.features.find(f => f.name === 'tempLink');
            this.gls.removeFeature(tempLink);
            if (hasTouch && touchAnchor && this.parent) {
                new Link(this.parent.anchorPnts.find(ap => ap.name == aCtrlP1.name) as AnchorPnt, touchAnchor);
            }
        }

        // 右边
        let bCtrlP3 = new BCtrlPnt(this, () => {
            const widthCtrlPnt = getMidOfTwoPnts(pointArr[1], pointArr[2]);
            return widthCtrlPnt;
        });
        bCtrlP3.translateEvents.push(() => {
            const ctrlPos = bCtrlP3.getCenterPos();  // 当前控制点的中心点
            const lenX = getLenOfPntToLine(ctrlPos, pointArr[0], pointArr[3]); // 控制点到vct的距离， 移动的距离
            const pnt = getPntInVct(pointArr[0], this.vctX, lenX)  // 关联点长度同步移动
            const pnt2 = getPntInVct(pointArr[3], this.vctX, lenX)  // 关联点长度同步移动
            pointArr[1].x = pnt.x;
            pointArr[1].y = pnt.y;
            pointArr[2].x = pnt2.x;
            pointArr[2].y = pnt2.y;
            if (this.lastLenX && this.parent) {
                var setTranform = (feature: Feature) => {
                    feature.pointArr.forEach((p, i) => {
                        let newPntX = getPntInVct(p, this.vctX, (lenX - this.lastLenX) * feature.pntExtentPer.left[i].x);
                        p.x = newPntX.x;
                        p.y = newPntX.y;
                    })
                }
                setTranform(this.parent);
                if (this.parent instanceof SelectArea) {
                    this.parent.featuresIn.forEach(f => {
                        setTranform(f);
                    })
                }
            }
            this.lastLenX = lenX;
            this.onUpdateLastMove();
        })

        // 上边
        let bCtrlP4 = new BCtrlPnt(this, () => {
            const heightCtrlPnt = getMidOfTwoPnts(pointArr[0], pointArr[1]);
            return heightCtrlPnt;
        });
        bCtrlP4.translateEvents.push(() => {
            const ctrlPos = bCtrlP4.getCenterPos();  // 当前控制点的中心点
            const lenY = getLenOfPntToLine(ctrlPos, pointArr[2], pointArr[3]); // 控制点到vct的距离， 移动的距离
            const pnt = getPntInVct(pointArr[2], this.vctY, -lenY)  // 关联点长度同步移动
            const pnt2 = getPntInVct(pointArr[3], this.vctY, -lenY)  // 关联点长度同步移动
            pointArr[1].x = pnt.x;
            pointArr[1].y = pnt.y;
            pointArr[0].x = pnt2.x;
            pointArr[0].y = pnt2.y;
            if (this.lastLenY && this.parent) {
                var setTranform = (feature: Feature) => {
                    feature.pointArr.forEach((p, i) => {
                        let newPntX = getPntInVct(p, this.vctY, (lenY - this.lastLenY) * -feature.pntExtentPer.right[i].y);
                        p.x = newPntX.x;
                        p.y = newPntX.y;
                    })
                }
                setTranform(this.parent);
                if (this.parent instanceof SelectArea) {
                    this.parent.featuresIn.forEach(f => {
                        setTranform(f);
                    })
                }
            }
            this.lastLenY = lenY;
            this.onUpdateLastMove();
        })


        // 下边
        let bCtrlP5 = new BCtrlPnt(this, () => {
            const heightCtrlPnt = getMidOfTwoPnts(pointArr[2], pointArr[3]);
            return heightCtrlPnt;
        });
        bCtrlP5.translateEvents.push(() => {
            const ctrlPos = bCtrlP5.getCenterPos();  // 当前控制点的中心点
            const lenY = getLenOfPntToLine(ctrlPos, pointArr[0], pointArr[1]); // 控制点到vct的距离， 移动的距离
            const pnt = getPntInVct(pointArr[0], this.vctY, lenY)  // 关联点长度同步移动
            const pnt2 = getPntInVct(pointArr[1], this.vctY, lenY)  // 关联点长度同步移动
            pointArr[3].x = pnt.x;
            pointArr[3].y = pnt.y;
            pointArr[2].x = pnt2.x;
            pointArr[2].y = pnt2.y;
            if (this.lastLenY && this.parent) {
                var setTranform = (feature: Feature) => {
                    feature.pointArr.forEach((p, i) => {
                        let newPntX = getPntInVct(p, this.vctY, (lenY - this.lastLenY) * feature.pntExtentPer.left[i].y);
                        p.x = newPntX.x;
                        p.y = newPntX.y;
                    })
                }
                setTranform(this.parent);
                if (this.parent instanceof SelectArea) {
                    this.parent.featuresIn.forEach(f => {
                        setTranform(f);
                    })
                }
            }
            this.lastLenY = lenY;
            this.onUpdateLastMove();
        })
        // bCtrlP1._ontranslate = this.onRotateChange;
        this.addBCtrlPnt(bCtrlP1);
        this.addBCtrlPnt(bCtrlP2);
        this.addBCtrlPnt(bCtrlP3);
        this.addBCtrlPnt(bCtrlP4);
        this.addBCtrlPnt(bCtrlP5);
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

                    if (bbox.lastLenX && bbox.lastLenY && bbox.parent) {
                        function setTranform(feature: Feature) {
                            feature.pointArr.forEach((p, i) => {
                                let newPntX = getPntInVct(p, getRotateVct(bbox.vctX, 180), (lenX - bbox.lastLenX) * feature.pntExtentPer.right[i].x);
                                p.x = newPntX.x;
                                p.y = newPntX.y;
                                let newPntY = getPntInVct(p, bbox.vctY, (lenY - bbox.lastLenY) * -feature.pntExtentPer.right[i].y);
                                p.x = newPntY.x;
                                p.y = newPntY.y;
                            })
                        }
                        setTranform(bbox.parent);
                        if (bbox.parent instanceof SelectArea) {
                            bbox.parent.featuresIn.forEach(f => {
                                setTranform(f);
                            })
                        }
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

                    if (bbox.lastLenX && bbox.lastLenY && bbox.parent) {
                        function setTranform(feature: Feature) {
                            feature.pointArr.forEach((p, i) => {
                                let newPntX = getPntInVct(p, bbox.vctX, (lenX - bbox.lastLenX) * feature.pntExtentPer.left[i].x);
                                p.x = newPntX.x;
                                p.y = newPntX.y;
                                let newPntY = getPntInVct(p, bbox.vctY, (lenY - bbox.lastLenY) * -feature.pntExtentPer.right[i].y);
                                p.x = newPntY.x;
                                p.y = newPntY.y;
                            })
                        }
                        setTranform(bbox.parent);
                        if (bbox.parent instanceof SelectArea) {
                            bbox.parent.featuresIn.forEach(f => {
                                setTranform(f);
                            })
                        }
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

                    if (bbox.lastLenX && bbox.lastLenY && bbox.parent) {
                        function setTranform(feature: Feature) {
                            feature.pointArr.forEach((p, i) => {
                                let newPntX = getPntInVct(p, bbox.vctX, (lenX - bbox.lastLenX) * feature.pntExtentPer.left[i].x);
                                p.x = newPntX.x;
                                p.y = newPntX.y;
                                let newPntY = getPntInVct(p, bbox.vctY, (lenY - bbox.lastLenY) * feature.pntExtentPer.left[i].y);
                                p.x = newPntY.x;
                                p.y = newPntY.y;
                            })
                        }
                        setTranform(bbox.parent);
                        if (bbox.parent instanceof SelectArea) {
                            bbox.parent.featuresIn.forEach(f => {
                                setTranform(f);
                            })
                        }
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

                    if (bbox.lastLenX && bbox.lastLenY && bbox.parent) {
                        function setTranform(feature: Feature) {
                            feature.pointArr.forEach((p, i) => {
                                let newPntX = getPntInVct(p, bbox.vctX, (lenX - bbox.lastLenX) * -feature.pntExtentPer.right[i].x);
                                p.x = newPntX.x;
                                p.y = newPntX.y;
                                let newPntY = getPntInVct(p, bbox.vctY, (lenY - bbox.lastLenY) * feature.pntExtentPer.left[i].y);
                                p.x = newPntY.x;
                                p.y = newPntY.y;
                            })
                        }
                        setTranform(bbox.parent);
                        if (bbox.parent instanceof SelectArea) {
                            bbox.parent.featuresIn.forEach(f => {
                                setTranform(f);
                            })
                        }
                    }
                    bbox.lastLenX = lenX;
                    bbox.lastLenY = lenY;
                    break;
                }
            default:
                break;
        }
        bbox.parent && bbox.parent._resize && bbox.parent._resize();
        bbox.parent && bbox.parent.resize && bbox.parent.resize();
        if (bbox.parent instanceof SelectArea) {
            bbox.parent.featuresIn.forEach(f => {
                f._resize && f._resize();
                f.resize && f.resize();
            })
        }
        bbox.onUpdateLastMove();
    }

    addBCtrlPnt(feature: CtrlPnt | BCtrlPnt) {
        this.bctrlPnts.push(feature);
        feature.parent = this;
        feature.angle = feature.parent.angle;
    }
    // 删除指定子元素
    removeBCtrlPnt(feature: (CtrlPnt | BCtrlPnt)) {
        feature.parent = null;
        this.bctrlPnts.splice(this.bctrlPnts.findIndex(cf => cf == feature), 1);
    }

    // 父元素位置变化时实时更新bbox位置
    onMoveByParent() {
        this.pointArr.forEach(p => {
            if (this.parent) {
                p.x += this.parent.pointArr[0].x - this.lastMove.x;
                p.y += this.parent.pointArr[0].y - this.lastMove.y;
            }
        })
        this.onUpdateLastMove();
    }

    onUpdateLastMove() {
        if (this.parent) {
            this.lastMove.x = this.parent.pointArr[0].x;
            this.lastMove.y = this.parent.pointArr[0].y;
        }
    }

    destroy() {
        this.bctrlPnts.forEach(cp => {
            this.gls.removeFeature(cp);
        })
    }
}