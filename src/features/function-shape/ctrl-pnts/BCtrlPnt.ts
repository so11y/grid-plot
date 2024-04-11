import { AdsorbType, ClassName, Events } from "@/Constants";
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
        this.parent = parent;
        this.isFixedPos = parent.isFixedPos;
        this.adsorbTypes = [AdsorbType.POINT];
        parent.addChild(this, {}, false)
    }
}

export default BCtrlPnt;