import { BasicFeature, IPoint } from "../../Interface";
import Rect from "../basic-shape/Rect";

// 自定义控制点元素
class AnchorPnt extends Rect {

    getPoint: () => IPoint;
    lastAngle: number = 0;
    isBinding = false;  // 是否与link绑定了
    parent: BasicFeature;

    constructor(parent: BasicFeature, fn: () => IPoint, width: number = 7) {   // 相对坐标
        let pos = fn();
        super(pos.x, pos.y, width, width);
        this.getPoint = fn;
        this.className = "AnchorPnt";
        this.parent = parent;
        this.isFixedPos = parent.isFixedPos;
        this.isShowAdsorbLine = false;
        this.isOnlyCenterAdsorb = true;
        this.fillStyle = this.hoverStyle = this.focusStyle = "#66ccff"
        this.lineWidth = 0;
        this.radius = .2;
        this.zIndex = Infinity;
        this.isStroke = false;
        this.isOnlyCenterAdsorb = true;
        this.gls.addFeature(this, false);
        this.ondraw = this.onUpdatePosByParent;
    }
    
    onUpdatePosByParent() {
        if(this.isFocused) return;
        let pos = this.getPoint();
        this.setPos(pos.x, pos.y);
    }
}

export default AnchorPnt;