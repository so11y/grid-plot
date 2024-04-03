import { ClassName } from "@/Constants";
import Feature from "../../Feature";
import Pnt from "../Pnt";

// size 宽高控制点元素，依赖pointArr
class SCtrlPnt extends Pnt {

    index: number = 0;  // 关联的点是第几个

    constructor(parent: Feature, i = 0, width: number = 14) {   // 相对坐标
        const pos = parent.pointArr[i];
        super(pos.x, pos.y, width, width);
        this.className = ClassName.SCTRLPNT;
        this.parent = parent;
        this.isFixedPos = parent.isFixedPos;
        this.isFixedSize = true;
        this.isOnlyCenterAdsorb = true;
        this.index = i;
        this.fillStyle = this.hoverStyle = this.focusStyle = "#66ccff"
        this.lineWidth = 0;
        this.zIndex = Infinity;
        this.isStroke = false;
        this.on('translate', this.onUpdateParentPos.bind(this))
        this.on('draw', this.onUpdatePosByParent.bind(this))
    }

    onUpdateParentPos() {  // 控制点拖拽时修改主元素对应的点位置
        const pos = Feature.getCenterPos(this.pointArr);
        if (this.parent) {
            this.parent.pointArr[this.index] = {
                x: pos.x,
                y: pos.y,
            }
        }
    }

    onUpdatePosByParent() {  // 主元素位置变化时实时更新控制点位置
        if (this.parent) {
            const { x, y } = this.parent.pointArr[this.index];
            this.setPos(x, y)
        }
    }

}

export default SCtrlPnt;