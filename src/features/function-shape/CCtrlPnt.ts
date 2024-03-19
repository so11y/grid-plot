import Rect from "../basic-shape/Rect";

class CCtrlPnt extends Rect {

    constructor(x: number = 0, y: number = 0, width: number = 14) {   // 相对坐标
        super(x, y, width, width);
        this.className = "CCtrlPnt";
        this.isFixedSize = true;
        this.isShowAdsorbLine = false;
        this.isOnlyCenterAdsorb = true;
        this.fillStyle = this.hoverStyle = this.focusStyle = "#7AAAF8"
        this.lineWidth = 0;
        this.zIndex = Infinity;
        this.isStroke = false;
        this.gls.addFeature(this, false);
    }

}

export default CCtrlPnt;