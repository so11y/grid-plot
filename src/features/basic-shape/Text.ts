// 绘制自定义文字

import { FontFamily, Events, CtrlType } from "../../Constants";
import { IPoint } from "../../Interface";
import gsap from "gsap";
import Rect from "./Rect";
import Feature from "../Feature";

class Text extends Rect {

    text: string;
    fitSize: boolean;
    fontSize: number;
    color: string;
    fontFamily: FontFamily;
    lineHeight: number;
    rows: number;  // 当前文本被分成多少行

    fontWeight: number;
    editble: boolean;  // 双击是否可编辑
    alpha: number;
    bold: boolean;
    inputDom: HTMLElement | null;
    animate: any;
    onChange: Function | null;

    constructor(text: string = "默认文本", x: number, y: number, width?: number, height?: number, fontSize = 2) {
        super(x, y, width, height);
        if(width == undefined){  
            width = this.gls.getPixelLen(text.length * (fontSize + .01))
        }
        if(height == undefined){
            height = this.gls.getPixelLen(fontSize)
        }
        this.setSize(width, height)
        this.className = "Text";
        this.text = text;
        this.fitSize = false;
        this.fontSize = fontSize;
        this.fontWeight = 0;
        this.fillStyle = "#fff";
        this.hoverStyle = "#fff";
        this.focusStyle = "#fff";
        this.color = "#000"
        this.fontFamily = FontFamily.HEITI
        this.editble = false;
        this.alpha = 1;
        this.bold = false;
        this.lineHeight = 0;
        this.lineWidth = .2;
        this.inputDom = null;
        this.onChange = null;
        this.rows = 1;
        document.addEventListener(Events.DB_CLICK, this.editText);
        document.addEventListener(Events.MOUSE_DOWN, this.stopEditText);
        let lastWidth = this.getSize().width;
        this.resizeEvents.push((e: CtrlType) => {  // 控制点改变大小触发的钩子
            if (this.fitSize && e === CtrlType.SIZE_CTRL) {
                const { width } = this.getSize()
                this.fontSize *= (1 + (width - lastWidth) / width);   // 根据宽度变化的百分比,同步放大fontSize
                lastWidth = width;
            }
            if (e === CtrlType.WIDTH_CTRL) {
                // this.getRectWrapExtent();
                // this.pointArr[2].y = this.pointArr[0].y + this.rows*this.gls.getPixelLen(this.fontSize);
                // this.pointArr[3].y = this.pointArr[0].y + this.rows*this.gls.getPixelLen(this.fontSize);
                lastWidth = this.getSize().width
            }
        })
        this.mousedownEvents.push((e)=>{
            console.log(11);
        })
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPoint[], lineWidth: number, radius = 0) {
        let path = super.draw(ctx, pointArr, lineWidth, radius);
        ctx.save();
        this.radius == 0 && this.setChildAngle(ctx, pointArr);
        ctx.textBaseline = "top";
        ctx.fillStyle = this.color;
        ctx.lineWidth = this.fontWeight;
        if (Feature.TargetRender) {
            const { width, leftTop } = this.getSize(pointArr);
            ctx.save();
            this.radius !== 0 && ctx.clip(path);   // 会导致后面元素旋转无效
            ctx.globalAlpha = this.opacity;
            this.rows = this.toFormateStr(ctx, Feature.TargetRender.getRatioSize(this.fontSize), width, leftTop.x, leftTop.y);
            ctx.restore();
        }
        ctx.restore();
        // if (this.editble) {  // 如果可以编辑, 绘制光标 
        //     ctx.save()
        //     ctx.moveTo(boxInfo.x + ctx.measureText(this.text).width + 5, boxInfo.y - boxInfo.height / 2);
        //     ctx.lineTo(boxInfo.x + ctx.measureText(this.text).width + 5, boxInfo.y + boxInfo.height / 2);
        //     ctx.lineWidth = 4;
        //     ctx.strokeStyle = `rgba(0,0,0,${this.alpha})`;
        //     ctx.stroke();
        //     ctx.restore();
        //     // let rgba = hex2Rgba(ctx.fillStyle, .5)
        // }
        return path;
    }

    // 自适应换行
    toFormateStr(ctx: CanvasRenderingContext2D, fontSize: number, boxWidth: number, startX: number, startY: number) {
        ctx.font = `${this.bold ? 'bold' : ''} ${fontSize}px ${this.fontFamily}`;
        var totalHeight = 0; //绘制字体距离canvas顶部初始的高度
        var lastSunStrIndex = 0; //每次开始截取的字符串的索引
        var contentWidth = 0;
        var padding = this.gls.getRatioSize(1);
        if (ctx.measureText(this.text).width <= boxWidth) {
            ctx.fillText(this.text, startX, startY + totalHeight);
            return 1
        }
        for (let i = 0; i < this.text.length; i++) {
            contentWidth += ctx.measureText(this.text[i]).width;
            if (contentWidth > boxWidth - padding * 3) {
                ctx.fillText(this.text.substring(lastSunStrIndex, i), startX + padding, startY + totalHeight) //绘制未截取的部分
                totalHeight += (fontSize + this.gls.getRatioSize(this.lineHeight));
                contentWidth = 0;
                lastSunStrIndex = i;
            }
            if (i == this.text.length - 1) {
                ctx.fillText(this.text.substring(lastSunStrIndex, i + 1), startX + padding, startY + totalHeight);
            }
        }
        return totalHeight / fontSize + 1;
    }

    editText = () => {
        if (this.isPointIn) {
            this.inputDom = document.createElement("input") as HTMLInputElement;
            let { left, top } = this.gls.dom.getBoundingClientRect();
            let { x, y } = this.gls.getPixelPos(this);
            this.inputDom.style.position = "fixed";
            this.inputDom.style.opacity = '0';
            this.inputDom.style.pointerEvents = 'none';
            this.inputDom.style.top = `${y + top}px`;
            this.inputDom.style.left = `${x + left}px`;
            this.inputDom.value = this.text;
            document.body.appendChild(this.inputDom);
            // new Shortcuts("enter", this.enter2Stop.bind(this))
            setTimeout(() => {
                if (this.inputDom) {
                    this.inputDom.focus();
                    this.inputDom.oninput = () => {
                        this.text = this.inputDom?.value;
                        // console.log(this.width, this.height * this.text.length, "");
                        // if (textWidth > this.width) {
                        //     this.width = textWidth;
                        // }
                    }
                }
            }, 500)
            this.editble = true;
            this.animate = gsap.to(this, {
                alpha: 0,
                duration: .45,
                yoyo: true,
                repeat: -1,
                // onUpdate(e) {
                //     // console.log(111, that.alpha);
                // }
            })
        }
    }

    // enter2Stop() {
    //     setTimeout(() => {
    //         console.log(1111);
    //         this.stopEditText();
    //     }, 500)
    // }

    stopEditText = () => {
        if (this.editble) {
            this.onChange && this.onChange(this.text, this);
            this.editble = false;
            this.alpha = 1;
            if (this.inputDom) {
                document.body.removeChild(this.inputDom);
            }
            this.inputDom = null;
            this.animate && this.animate.kill();
        }
    }

    // 元素删除时需要做的事情
    destroy() {
        super.destroy();
        document.removeEventListener(Events.DB_CLICK, this.editText);
        document.removeEventListener(Events.MOUSE_DOWN, this.stopEditText);
    }

}

export default Text;