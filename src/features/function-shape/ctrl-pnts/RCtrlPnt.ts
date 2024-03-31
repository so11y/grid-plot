import { ClassName } from "@/Constants";
import { IPoint } from "../../../Interface";
import { createVctor } from "../../../utils";
import Bbox from "../Bbox";
import Pnt from "../Pnt";

// rotate 旋转控制点元素
class RCtrlPnt extends Pnt {

    getPoint: () => IPoint;
    lastAngle: number;
    parent: Bbox | null = null;

    constructor(parent: Bbox, fn: () => IPoint, width: number = 14) {   // 相对坐标
        const pos = fn();
        super(pos.x, pos.y, width, width);
        this.lastAngle = parent.angle;
        this.getPoint = fn;
        this.className = ClassName.RCTRLPNT;
        this.parent = parent;
        this.isFixedPos = parent.isFixedPos;
        this.isFixedSize = true;
        
        this.isOnlyCenterAdsorb = true;
        this.fillStyle = this.hoverStyle = this.focusStyle = "#66ccff"
        this.lineWidth = 0;
        this.zIndex = Infinity;
        this.isStroke = false;
        this.radius = .2;
        this.dragendEvents.push(this.onUpdateParentVct.bind(this))
        this.drawEvents.push(this.onUpdatePosByParent.bind(this))
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
        const pos = this.getPoint();
        this.setPos(pos.x, pos.y);
    }
}

export default RCtrlPnt;