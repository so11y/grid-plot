import { getSizeInBytes } from "@/utils";
import { IPoint, Src } from "../../Interface";
import Rect from "./Rect";

class Img extends Rect {

    element: HTMLImageElement | HTMLVideoElement | null = null;  // 图片/视频的dom元素
    src: string // 图片/视频的地址

    /**
     * @param src 如果是html标签就传入.src属性, 如果是base64直接传入, 
     */
    constructor(src: string, x: number = 0, y: number = 0, width?: number, height?: number) {   // 相对坐标
        console.log(new Path2D());
        
        if(encodeURIComponent(src).replace(/%../g,"x").length > 500000){
            throw "只支持0.5M一下的文件!"   
        }
        try {
            var binaryString = window.atob(src); // 将Base64字符串转换为二进制字符串
            console.log(binaryString);
        } catch (error) {
            console.log(error);
        }
        // console.log(src, "getSizeInBytes(src)");

        // if(getSizeInBytes(src)){
        //     throw "信息量太大,不支持创建!"            
        // }
        super(x, y, width, height);
        this.className = "Img";
        this.src = src;
        if (src.endsWith(".mp4") || src.startsWith("data:video/mp4;")) {
            const video = this.element = document.createElement("video") as HTMLVideoElement;
            document.body.appendChild(this.element);
            this.element.src = src;
            this.element.style.display = "none";
            this.element.play();
            // 视频加载完成事件
            if (!width && !height) {
                this.element.addEventListener('loadeddata', () => {  // 重新设置img大小
                    this.setSize(this.gls.getRelativeLen(video.videoWidth), this.gls.getRelativeLen(video.videoHeight))
                });
            }
            this.mousedownEvents.push(() => {
                video.play();
            })
        } else if (src.endsWith('.png') || src.endsWith('.jpg') || src.startsWith("data:image/png;") || src.startsWith("data:image/jpeg;")) {
            const image = this.element = new Image();
            this.element.src = src;
            if (!width && !height) {
                this.element.onload = () => {
                    this.setSize(this.gls.getRelativeLen(image.width), this.gls.getRelativeLen(image.height))
                }
            }
        } else {
            throw "参数错误!"
        }
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPoint[], lineWidth: number, radius = 0) {
        let path = super.draw(ctx, pointArr, lineWidth, radius);
        if (this.element) {
            const { width, height, leftTop } = this.getSize(pointArr);
            this.radius == 0 && this.setChildAngle(ctx, pointArr);
            ctx.save();
            this.radius !== 0 && ctx.clip(path);   // 考虑优化问题
            ctx.globalAlpha = this.opacity;
            ctx.drawImage(this.element, leftTop.x, leftTop.y, width, height);
            ctx.restore();
        }
        return path;
    }
}

export default Img;