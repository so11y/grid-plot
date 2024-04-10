import { AdsorbType, ClassName, Events } from "@/Constants";
import { getMidOfTwoPnts } from "@/utils";
import { IBasicFeature, IPoint } from "../../../Interface";
import Pnt from "../Pnt";

// 贝塞尔曲线控制点
class BCtrlPnt extends Pnt {

    getPoint: () => IPoint;
    parent: IBasicFeature;

    constructor(parent: IBasicFeature, fn: () => IPoint, width: number = 10) {
        const pos = fn();
        super(pos.x, pos.y, width, width);
        this.getPoint = fn;
        this.className = ClassName.BCTRLPNT;
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
        parent.addChild(this, {}, false)
        // this.on(Events.DRAW, this.onUpdatePosByParent.bind(this))
    }

    // onUpdatePosByParent() {
    //     if (this.isFocused) return;
    //     const mid = getMidOfTwoPnts(this.parent.pointArr[this.index -1], this.parent.pointArr[this.index])
    //     this.setPos(mid.x, mid.y);
    // }
}

export default BCtrlPnt;