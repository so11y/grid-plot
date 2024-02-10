import { IBBox, IPoint, Src } from "../../Interface";
import { getLenOfTwoPnts, toBase64 } from "../../utils";
import Rect from "./Rect";

class Img extends Rect {

    element: HTMLImageElement | HTMLVideoElement  // 图片对象
    src: Src // 图片地址
    base64Str: string = '';

    constructor(src: Src, x: number = 0, y: number = 0, width: number = 5, height: number = 5) {   // 相对坐标
        super(x, y, width, height);
        this.className = "Img";
        this.src = src;
        if (typeof (src) == 'string') {
            if (src.indexOf(".mp4") != -1) {
                this.element = document.createElement("video");
                document.body.appendChild(this.element);
                this.element.src = src;
                this.element.style.display = "none";
                this.element.play();
            } else {
                this.element = new Image();
                this.element.src = src;
                this.element.onload = () => {
                    // this.ratio = this.element.width / this.element.height;
                }
            }
            this.src = this.element;
        } else if (src instanceof HTMLImageElement) {
            this.element = src;
            // this.ratio = this.element.width / this.element.height;
        } else if (src instanceof HTMLVideoElement) {
            this.element = src;
            document.body.appendChild(this.element);
            this.element.style.display = "none";
            this.element.play();
        } else {
            throw "参数错误!"
        }
        if (this.element instanceof HTMLImageElement) {
            this.base64Str = toBase64(this.element);
        }
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPoint[], lineWidth: number, radius = 0) {
        let path = super.draw(ctx, pointArr, lineWidth, radius);
        if (this.element) {
            const { width, height, leftTop } = this.getSize(pointArr);
            // this.setChildAngle(ctx, pointArr);
            ctx.save();
            this.radius !== 0 && ctx.clip(path);   // 考虑优化问题
            ctx.drawImage(this.element, leftTop.x, leftTop.y, width, height);
            ctx.restore();
        }
        return path;
    }
}

export default Img;