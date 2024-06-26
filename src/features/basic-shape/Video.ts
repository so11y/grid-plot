import { AlignType, ClassName } from "@/Constants";
import { IPoint, IPixelPos } from "../../Interface";
import Rect from "./Rect";

// 图片/视频
class Video extends Rect {

    domElement: HTMLVideoElement | null = null;  // 图片/视频的dom元素
    src: string // 图片/视频的地址

    /**
     * @param src 如果是html标签就传入.src属性, 如果是base64直接传入, 
     */
    constructor(src: string, x: number = 0, y: number = 0, width: number = 100, height?: number) {   // 相对坐标
        if (encodeURIComponent(src).replace(/%../g, "x").length > 2000000) {
            throw "只支持2M一下的文件!"
        }

        super(x, y, width, height);
        this.className = ClassName.VIDEO;
        this.src = src;
        if (src.endsWith(".mp4") || src.startsWith("data:video/mp4;")) {
            const video = this.domElement = document.createElement("video") as HTMLVideoElement;
            video.loop = true
            // document.body.appendChild(this.domElement);
            this.domElement.src = src;
            this.domElement.style.display = "none";
            this.domElement.play();
            // 视频加载完成事件
            if (!height) {
                video.addEventListener('loadeddata', () => {  // 重新设置video大小
                    height = (video.videoHeight / video.videoWidth) * width;
                    this.setSize(this.gls.getRelativeLen(video.videoWidth), this.gls.getRelativeLen(video.videoHeight))
                });
            }
        } else {
            throw "参数错误!"
        }
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPixelPos[], lineWidth: number, lineDashArr: number[], radius = 0) {
        const path = super.draw(ctx, pointArr, lineWidth, lineDashArr, radius);
        if (this.domElement) {
            const { width, height, leftTop } = this.getSize(pointArr);
            ctx.save();
            this.rotateCtx(ctx, leftTop);
            ctx.clip(path);   // 放在旋转后面
            ctx.globalAlpha = this.opacity;
            ctx.drawImage(this.domElement, leftTop.x, leftTop.y, width, height);
            ctx.restore();
        }
        return path;
    }

    revert(direction: AlignType, center?: IPoint, isParent = true) { return }

    getSvg(pointArr: IPixelPos[] = [], lineWidth: number = 1, radius = 0) { return '' }
}

export default Video;