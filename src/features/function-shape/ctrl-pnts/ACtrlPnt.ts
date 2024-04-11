import { AdsorbType, ClassName, Events } from "@/Constants";
import { IBasicFeature, IPoint } from "../../../Interface";
import Pnt from "../Pnt";

// 锚点连线控制点
class ACtrlPnt extends Pnt {

    getPoint: () => IPoint;
    parent: IBasicFeature;

    constructor(parent: IBasicFeature, fn: () => IPoint, width: number = 10) {
        const pos = fn();
        super(pos.x, pos.y, width, width);
        this.getPoint = fn;
        this.className = ClassName.ACTRLPNT;
        this.parent = parent;
        this.isFixedPos = parent.isFixedPos;
        this.adsorbTypes = [AdsorbType.POINT];
        this.fillStyle = this.hoverStyle = this.focusStyle = "#C4FFC9"
        this.on(Events.DRAW, this.onUpdatePosByParent.bind(this))
    }

    onUpdatePosByParent() {
        if (this.isFocused) return;
        const pos = this.getPoint();
        this.setPos(pos.x, pos.y);
    }
}

export default ACtrlPnt;