import { IBasicFeature } from "@/Interface";
import { ClassName, CtrlType, DrawAreaMode, SelectMode } from "../../Constants";
import { isPntInPolygon, getMousePos, isBasicFeature } from "../../utils";
import Group from "./Group";

// 鼠标选取某个范围选中N个元素
class SelectArea extends Group {

    selectMode: SelectMode = SelectMode.ONE_P;  // 是否框中一个点就判定为选中，还是全部点进入才判定选中
    drawMode: DrawAreaMode = DrawAreaMode.RECT;  // 绘制模式,多边形或者矩形
    callback: Function;

    constructor(fn = () => { }) {
        super([]);
        this.callback = fn;
        this.className = ClassName.SELECTAREA;
        this.cbTransformChild = true;
        this.fillStyle = this.hoverStyle = this.focusStyle = "rgba(220, 233, 126, .4)"
        this.ctrlTypes = [CtrlType.SIZE_CTRL, CtrlType.ANGLE_CTRL];
        document.addEventListener("mousedown", this.setPointArr);
    }

    setPointArr = (e: any) => {
        if (e.buttons == 1) {
            let startP = this.gls.getRelativePos(getMousePos(this.gls.domElement, e));
            this.pointArr[0] = startP;
            this.gls.addFeature(this, false);
            const mouseMove = (ev: any) => {
                switch (this.drawMode) {
                    case DrawAreaMode.RECT: {
                        let endP = this.gls.getRelativePos(getMousePos(this.gls.domElement, ev));
                        this.pointArr[1] = {
                            x: endP.x,
                            y: startP.y
                        }
                        this.pointArr[2] = {
                            x: endP.x,
                            y: endP.y
                        }
                        this.pointArr[3] = {
                            x: startP.x,
                            y: endP.y
                        }
                    }
                        break;
                    case DrawAreaMode.IRREGULAR: {
                        let moveP = this.gls.getRelativePos(getMousePos(this.gls.domElement, ev));
                        this.addPoint(moveP);
                    }
                        break;
                    default:
                        break;
                }
            }
            const mouseUp = () => {
                let featuresIn = this.getSelectFeature();
                featuresIn.forEach(fi => {
                    this.addChild(fi as IBasicFeature, {}, false)
                })
                this.gls.enableBbox(this)
                this.callback(featuresIn);
                document.removeEventListener("mousedown", this.setPointArr)
                document.removeEventListener("mousemove", mouseMove)
                document.removeEventListener("mouseup", mouseUp)
            }
            document.addEventListener("mousemove", mouseMove);
            document.addEventListener("mouseup", mouseUp);
        }
    }

    getSelectFeature() {
        let features = this.gls.features.filter(f => isBasicFeature(f) && !f.parent);
        let featureIn = features.filter(f => {
            if (!f.cbSelect) return
            let pointArr = f.pointArr;
            if (this.selectMode === SelectMode.ALL_P) {
                return pointArr.every(p => {
                    return isPntInPolygon(p, this.pointArr);
                });
            }
            if (this.selectMode === SelectMode.ONE_P) {
                return pointArr.some(p => {
                    return isPntInPolygon(p, this.pointArr);
                });
            }
            return []
        })
        return featureIn
    }

    destroy() {
        this.gls.cbSelectFeature = true;
        this.children.forEach(cf => cf.parent = null)
    }
}

export default SelectArea;