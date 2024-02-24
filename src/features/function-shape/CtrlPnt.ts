import Rect from "../basic-shape/Rect";
import Feature from "../Feature";

// 控制点元素，依赖pointArr
class CtrlPnt extends Rect {

    index: number = 0;  // 关联的点是第几个

    constructor(parent: Feature, i = 0, width: number = 14) {   // 相对坐标
        const pos = parent.pointArr[i];
        super(pos.x, pos.y, width, width);
        this.className = "CtrlPnt";
        this.parent = parent;
        this.isFixedPos = parent.isFixedPos;
        this.isFixedSize = true;
        this.isShowAdsorbLine = false;
        this.isOnlyCenterAdsorb = true;
        this.index = i;
        this.fillStyle = this.hoverStyle = this.focusStyle = "#66ccff"
        this.lineWidth = 0;
        this.radius = .2;
        this.zIndex = Infinity;
        this.isStroke = false;
        this.isOnlyCenterAdsorb = true;
        this.gls.addFeature(this, false);
        this.translateEvents.push(this.onUpdateParentPos.bind(this));
        this.drawEvents.push(this.onUpdatePosByParent.bind(this))
    }

    onUpdateParentPos() {  // 拖拽时修改父元素的点位置
        let pos = this.getCenterPos();
        if (this.parent) {
            this.parent.pointArr[this.index] = {
                x: pos.x,
                y: pos.y,
            }
        }
    }

    onUpdatePosByParent() {  // 父元素位置变化时实时更新控制点位置
        if (this.parent) {
            let x = this.parent.pointArr[this.index].x;
            let y = this.parent.pointArr[this.index].y;
            this.setPos(x, y)
        }
    }

}

export default CtrlPnt;