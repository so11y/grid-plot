import { AlignType, CoordinateSystem } from "@/Constants";
import { IPoint } from "../../Interface";
import Rect from "./Rect";

class Img extends Rect {

    domElement: HTMLImageElement | HTMLVideoElement | null = null;  // 图片/视频的dom元素
    src: string // 图片/视频的地址

    /**
     * @param src 如果是html标签就传入.src属性, 如果是base64直接传入, 
     */
    constructor(src: string, x: number = 0, y: number = 0, width: number = 100, height?: number) {   // 相对坐标
        if (encodeURIComponent(src).replace(/%../g, "x").length > 500000) {
            throw "只支持0.5M一下的文件!"
        }
        super(x, y, width, height);
        this.className = "Img";
        this.src = src;
        if (src.endsWith(".mp4") || src.startsWith("data:video/mp4;")) {
            const video = this.domElement = document.createElement("video") as HTMLVideoElement;
            document.body.appendChild(this.domElement);
            this.domElement.src = src;
            this.domElement.style.display = "none";
            this.domElement.play();
            // 视频加载完成事件
            if (!width && !height) {
                this.domElement.addEventListener('loadeddata', () => {  // 重新设置img大小
                    this.setSize(this.gls.getRelativeLen(video.videoWidth), this.gls.getRelativeLen(video.videoHeight))
                });
            }
            this.mousedownEvents.push(() => {
                video.play();
            })
        } else if (src.endsWith('.png') || src.endsWith('.jpg') || src.startsWith("data:image/png;") || src.startsWith("data:image/jpeg;")) {
            const image = this.domElement = new Image();
            this.domElement.src = src;
            if (!height) {
                height = (this.domElement.height / this.domElement.width) * width;
                this.domElement.onload = () => {
                    this.setSize(width, height)
                }
            }
        } else {
            throw "参数错误!"
        }
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPoint[], lineWidth: number, radius = 0) {
        let path = super.draw(ctx, pointArr, lineWidth, radius);
        if (this.domElement) {
            const { width, height, leftTop } = this.getSize(pointArr);
            ctx.save();
            // ctx.clip(path);   // 会导致后面元素旋转无效
            this.setAngle(ctx, leftTop);
            ctx.globalAlpha = this.opacity;
            ctx.drawImage(this.domElement, leftTop.x, leftTop.y, width, height);
            ctx.restore();
        }
        return path;
    }

    revert(direction: AlignType, center?: IPoint, isParent = true) {
        var offscreenCanvas = document.createElement('canvas');
        if (this.domElement) {
            offscreenCanvas.width = this.domElement.width;
            offscreenCanvas.height = this.domElement.height;
            // 获取离屏Canvas的2D渲染上下文  
            var ctx = offscreenCanvas.getContext('2d') as CanvasRenderingContext2D;
            // 镜像反转
            switch (direction) {
                case AlignType.HORIZONAL:
                    ctx.scale(-1, 1);
                    ctx.drawImage(this.domElement, -offscreenCanvas.width, 0);
                    break;
                case AlignType.VERTICAL:
                    ctx.scale(1, -1);
                    ctx.drawImage(this.domElement, 0, -offscreenCanvas.height);
                    break;
                default:
                    break;
            }
            this.src = offscreenCanvas.toDataURL();
            const image = new Image();
            image.src = this.src;
            image.onload = () => {
                this.domElement = image;
                super.revert(direction, center, isParent)
            }
        }
    }

    getSvg(pointArr: IPoint[] = [], lineWidth: number = 1, radius = 0) {
        let { width, height, leftTop } = this.getSize(pointArr);
        let svgStr = super.getSvg(pointArr, lineWidth, radius);
        return svgStr + `
        <g transform="rotate(${this.angle} ${leftTop.x} ${leftTop.y})">
            <image href="${this.src}" x="${leftTop.x}" y="${leftTop.y}"  width="${width}" height="${height}"
            />
        </g>
        `
    }
}

export default Img;