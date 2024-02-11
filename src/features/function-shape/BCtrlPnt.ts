import { IPoint } from "../../Interface";
import { createVctor } from "../../utils";
import Rect from "../basic-shape/Rect";
import Bbox from "./Bbox";

// 自定义控制点元素
class BCtrlPnt extends Rect {

    getPoint: () => IPoint;
    lastAngle: number = 0;
    parent: Bbox | null = null;

    constructor(parent: Bbox, fn: () => IPoint, width: number = 7) {   // 相对坐标
        let pos = fn();
        super(pos.x, pos.y, width, width);
        this.getPoint = fn;
        this.className = "BCtrlPnt";
        this.parent = parent;
        this.isFixedPos = parent.isFixedPos;
        this.isShowAdsorbLine = false;
        this.isOnlyCenterAdsorb = true;
        this.fillStyle = this.hoverStyle = this.focusStyle = "#66ccff"
        this.lineWidth = 0;
        this.zIndex = Infinity;
        this.isStroke = false;
        this.radius = .2;
        this.isOnlyCenterAdsorb = true;
        this.ondragend = this.onUpdateParentVct;
        this.ondraw = this.onUpdatePosByParent;
        this.gls.addFeature(this, false);
    }

    // 更新bbox的水平与垂直向量
    onUpdateParentVct() {
        if (this.parent) {
            this.parent.vctX = createVctor(this.parent.pointArr[0], this.parent.pointArr[1]);   // 控制点1,2的向量
            this.parent.vctY = createVctor(this.parent.pointArr[0], this.parent.pointArr[3]);   // 控制点1,2的向量
        }
    }

    // 更新自己的位置, 除了自己正在被操控时
    onUpdatePosByParent() {
        if (this.isFocused) return;
        let pos = this.getPoint();
        this.setPos(pos.x, pos.y);
    }
}

export default BCtrlPnt;