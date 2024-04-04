import { AdsorbType, ClassName } from "@/Constants";
import { IBasicFeature, IPoint } from "../../../Interface";
import Pnt from "../Pnt";

// 锚点连线控制点
class ACtrlPnt extends Pnt {

    getPoint: () => IPoint;
    isBinding = false;  // 是否与link绑定了
    parent: IBasicFeature;

    constructor(parent: IBasicFeature, fn: () => IPoint, width: number = 10) {   // 相对坐标
        const pos = fn();
        super(pos.x, pos.y, width, width);
        this.getPoint = fn;
        this.className = ClassName.ANCHORPNT;
        this.isFixedSize = true;
        this.parent = parent;
        this.isFixedPos = parent.isFixedPos;
        this.isOnlyCenterAdsorb = true;
        this.fillStyle = this.hoverStyle = this.focusStyle = "#C4FFC9"
        this.lineWidth = 0;
        this.radius = .2;
        this.zIndex = Infinity;
        this.isStroke = false;
        this.adsorbTypes = [AdsorbType.POINT];
        this.isOnlyCenterAdsorb = true;
        this.gls.addFeature(this, false);
        this.on('draw', this.onUpdatePosByParent.bind(this))
    }

    onUpdatePosByParent() {
        if (this.isFocused) return;
        const pos = this.getPoint();
        this.setPos(pos.x, pos.y);
    }
}

export default ACtrlPnt;