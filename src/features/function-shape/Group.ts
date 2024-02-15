
import { IPoint } from "@/Interface";
import Rect from "../basic-shape/Rect";
import Feature from "../Feature";

export default class Group extends Rect {

    constructor(features: Feature[]) {   // 相对坐标
        super(0, 0, 0, 0);
        let allPointArr: IPoint[] = [];
        features.map(f => allPointArr.push(...f.pointArr));
        let [minX, maxX, minY, maxY] = this.getRectWrapExtent(allPointArr);  // [leftTop, rightTop, rightBottom, leftBottom]
        let center = this.getCenterPos(allPointArr);  // [leftTop, rightTop, rightBottom, leftBottom]
        this.setPos(center.x, center.y);
        this.setSize(maxX - minX, maxY - minY);
        this.className = 'Group';
        features.forEach(f => { this.addFeature(f, false);})
        this.fillStyle = this.focusStyle = this.hoverStyle = this.strokeStyle = "transparent";
        this.isStroke = true;
        this.closePath = true;
        this.lineDashArr = [8, 12]
        this.lineWidth = .1;
        this.gls.addFeature(this, false);
    }
}