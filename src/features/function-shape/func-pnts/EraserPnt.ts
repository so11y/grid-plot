import { ClassName, Events } from "@/Constants";
import { getMousePos } from "../../../utils";
import Pnt from "../Pnt";

// 橡皮擦工具
class EraserPnt extends Pnt {

    public static instance: EraserPnt | null = null;
    // 静态方法，用于获取单例实例  
    public static getInstance(width = 14): EraserPnt {
        if (!EraserPnt.instance) {
            EraserPnt.instance = new EraserPnt(width);
        }
        return EraserPnt.instance;
    }

    isMouseDown = false;

    constructor(width: number = 14) {   // 相对坐标
        if (EraserPnt.instance) {
            return EraserPnt.instance;
        }
        super(0, 0, width, width);
        this.fillStyle = this.hoverStyle = this.focusStyle = "#66ccff";
        this.className = ClassName.ERASERPNT;
        this.zIndex = Infinity;
        this.isStroke = false;
        this.isFixedSize = true;
        this.cbCapture = false;
        this.cbSelect = false;
        document.addEventListener(Events.MOUSE_MOVE, this.removeTarget.bind(this));
        document.addEventListener(Events.MOUSE_DOWN, this.mousedown.bind(this));
        document.addEventListener(Events.MOUSE_UP, this.mouseup.bind(this));
    }

    mousedown() {
        this.isMouseDown = true;
    }
    mouseup() {
        this.isMouseDown = false;
    }

    removeTarget(e: any) {
        this.position = this.gls.getRelativePos(getMousePos(this.gls.domElement, e));
        if (this.isMouseDown) {
            let focusNode = this.gls.features.find(f => f.isPointIn);  // 寻找鼠标悬浮元素
            if (focusNode) {
                this.gls.removeFeature(focusNode)
            }
        }
    }

    destory() {
        document.removeEventListener(Events.MOUSE_MOVE, this.removeTarget);
        document.removeEventListener(Events.MOUSE_DOWN, this.mousedown);
        document.removeEventListener(Events.MOUSE_UP, this.mouseup);
    }
}

export default EraserPnt;