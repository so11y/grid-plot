// 绘制自定义文字

import { FontFamily, Events, CtrlType } from "../../Constants";
import { IPoint } from "../../Interface";
import gsap from "gsap";
import Rect from "./Rect";
import Feature from "../Feature";
import { getMousePos } from "@/utils";

class Text extends Rect {

    static mousePos: IPoint = { x: 0, y: 0 }
    static cursorPos: IPoint = { x: 0, y: 0 }
    static inputDom: HTMLInputElement | null;

    text: string;
    fitSize: boolean;
    fontSize: number;
    color: string;
    fontFamily: FontFamily;
    lineHeight: number;
    rows: number;  // 当前文本被分成多少行
    padding: number = 0;

    fontWeight: number;
    editble: boolean;  // 双击是否可编辑
    alpha: number;
    bold: boolean;
    cursorIndex: number = -1;

    constructor(text: string = "默认文本", x: number, y: number, width?: number, height?: number, fontSize = 2) {
        super(x, y, width, height);
        if (width == undefined) {
            width = this.gls.getPixelLen(text.length * (fontSize + .01))
        }
        if (height == undefined) {
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
        this.rows = 1;
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
        this.mousedownEvents.push((e: any) => {
            // if(this.isFocused || this.parent?.isFocused){
            this.cursorIndex = -1;
            this.editble = true;
            Text.mousePos = getMousePos(this.gls.dom, e);
            this.editText(Text.mousePos)
            // }else {
            //     this.editble = false;
            //     this.cursorIndex = -1;
            //     Text.mousePos = {x: 0, y: 0}
            // }
        })
        document.addEventListener("keydown", (e) => {
            if (e.keyCode == 8 && this.cursorIndex > 0) {
                this.text = this.text.slice(0, this.cursorIndex - 1) + this.text.slice(this.cursorIndex);
                this.cursorIndex--;
            }
            // console.log(e.keyCode);
            // if (e.keyCode == 8 && this.cursorIndex > 0) {
            //     this.text = this.text.slice(0, this.cursorIndex - 1) + this.text.slice(this.cursorIndex);
            //     this.cursorIndex--;
            // }
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
            const fontSize = Feature.TargetRender.getRatioSize(this.fontSize);
            this.rows = this.toFormateStr(ctx, fontSize, width, leftTop.x, leftTop.y);

            if (this.editble) {
                ctx.fillStyle = "red";
                ctx.fillRect(Text.cursorPos.x, Text.cursorPos.y, 2, fontSize)
            }

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
        var contentHeight = 0; //绘制字体距离canvas顶部初始的高度
        var lastSunStrIndex = 0; //每次开始截取的字符串的索引
        var contentWidth = 0;
        const padding = this.gls.getRatioSize(this.padding);
        startY += padding;
        const lineHeight = this.gls.getRatioSize(this.lineHeight);
        let breakI = 0;  // 换行触的字符下标
        for (let i = 0; i < this.text.length; i++) {
            const curFontWidth = ctx.measureText(this.text[i]).width;
            contentWidth += curFontWidth;
            if (contentWidth > (boxWidth - padding * 2) || this.text[i] === '\n') {
                breakI = i;
                ctx.fillText(this.text.substring(lastSunStrIndex, i), startX + padding, startY + contentHeight) //绘制未截取的部分
                contentHeight += (fontSize + lineHeight);
                contentWidth = 0;
                lastSunStrIndex = i;
            }
            if (i == this.text.length - 1) {
                ctx.fillText(this.text.substring(lastSunStrIndex, i + 1), startX + padding, startY + contentHeight);
            }

            if (this.cursorIndex == i) {
                let contentWidth2 = 0;
                while (breakI < i) {
                    contentWidth2 += ctx.measureText(this.text[breakI]).width;
                    breakI++;
                }
                Text.cursorPos.x = (startX + padding + contentWidth2);
                Text.cursorPos.y = startY + contentHeight;
            }
            if (this.cursorIndex <= 0) {
                if ((Text.mousePos.y - startY) > contentHeight && (Text.mousePos.y - startY) < contentHeight + fontSize) {
                    Text.cursorPos.y = startY + contentHeight;
                    let realMousePos = Text.mousePos.x - startX - padding;
                    if (realMousePos > contentWidth - curFontWidth / 2 && realMousePos < contentWidth + ctx.measureText(this.text[i + 1]).width / 2) {
                        let contentWidth2 = 0;
                        while (breakI < i) {
                            contentWidth2 += ctx.measureText(this.text[breakI]).width;
                            breakI++;
                        }
                        Text.cursorPos.x = (startX + padding + contentWidth2);
                        this.cursorIndex = i;
                    }
                }
            }
        }
        return contentHeight / fontSize + 1;
    }


    editText = (pos: IPoint) => {
        // if (this.isPointIn) {
        Text.inputDom = document.createElement("input") as HTMLInputElement;
        let { left, top } = this.gls.dom.getBoundingClientRect();
        Text.inputDom.style.position = "fixed";
        Text.inputDom.style.opacity = '0';
        Text.inputDom.style.pointerEvents = 'none';
        Text.inputDom.style.top = `${pos.y + top}px`;
        Text.inputDom.style.left = `${pos.x + left}px`;
        // Text.inputDom.value = this.text;
        document.body.appendChild(Text.inputDom);
        // new Shortcuts("enter", this.enter2Stop.bind(this))
        setTimeout(() => {
            if (Text.inputDom) {
                Text.inputDom.focus();
                // Text.inputDom.addEventListener("keydown", (e: any)=>{
                //     console.log(e.keyCode);
                // })
                Text.inputDom.onchange = () => {
                    if (Text.inputDom) {
                        this.text = this.text.slice(0, this.cursorIndex) + Text.inputDom.value + this.text.slice(this.cursorIndex);
                        this.cursorIndex += Text.inputDom.value.length;
                        Text.inputDom.value = ''
                    }
                }
            }
        }, 500)
        // this.editble = true;
        // this.animate = gsap.to(this, {
        //     alpha: 0,
        //     duration: .45,
        //     yoyo: true,
        //     repeat: -1,
        //     // onUpdate(e) {
        //     //     // console.log(111, that.alpha);
        //     // }
        // })
        // }
    }
    // 元素删除时需要做的事情
    destroy() {
        super.destroy();
    }

}

export default Text;