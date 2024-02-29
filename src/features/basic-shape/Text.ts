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
    static lastDate = Date.now()
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
        this.lineHeight = .4;
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
                lastWidth = this.getSize().width
            }
        })
        this.dbclickEvents.push((e: any) => {
            this.cursorIndex = -1;
            this.editble = true;
            Text.mousePos = getMousePos(this.gls.dom, e);
            this.editText(Text.mousePos)
        })
        this.blurEvents.push((e: any) => {
            this.cursorIndex = -1;
            this.editble = false;
            Text.mousePos = { x: 0, y: 0 };
            this.removeInputDom();
        })
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPoint[], lineWidth: number, radius = 0) {
        console.log();
        // Text.cursorVisible
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

            if (this.editble) {  // 光标闪烁
                if (Date.now() - Text.lastDate > 600) {
                    ctx.fillStyle = "red";
                    ctx.fillRect(Text.cursorPos.x, Text.cursorPos.y, 2, fontSize)
                    if(Date.now() - Text.lastDate > 1300){
                        Text.lastDate = Date.now();
                    }
                }
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

    // 自适应换行  57
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
            if ((contentWidth + curFontWidth) > (boxWidth - padding * 2) || this.text[i] === '\n') {
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
                Text.cursorPos.x = (startX + padding + contentWidth);
                Text.cursorPos.y = startY + contentHeight;
            }
            if (this.cursorIndex == this.text.length) {  // 末尾文字处理
                Text.cursorPos.x = (startX + padding + contentWidth + curFontWidth);
                Text.cursorPos.y = startY + contentHeight;
            }
            if (this.cursorIndex < 0) {
                const realMousePosY = Text.mousePos.y - startY;
                if (realMousePosY > contentHeight && realMousePosY < contentHeight + fontSize) {
                    Text.cursorPos.y = startY + contentHeight;
                    const realMousePosX = Text.mousePos.x - startX - padding;
                    if (realMousePosX > contentWidth - ctx.measureText(this.text[i - 1]).width / 2 && realMousePosX < contentWidth + curFontWidth / 2) {
                        Text.cursorPos.x = (startX + padding + contentWidth);
                        this.cursorIndex = i;
                    }
                    if (realMousePosX > contentWidth + curFontWidth / 2 && i === this.text.length - 1) {  // 末尾文字处理
                        Text.cursorPos.x = (startX + padding + contentWidth + curFontWidth);
                        this.cursorIndex = i + 1;
                    }
                }
            }
            contentWidth += curFontWidth;
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
                //     console.log(e.keyCode, "keydow");
                // })
                Text.inputDom.onchange = () => {
                    if (Text.inputDom) {
                        this.text = this.text.slice(0, this.cursorIndex) + Text.inputDom.value + this.text.slice(this.cursorIndex);
                        this.cursorIndex += Text.inputDom.value.length;
                        Text.inputDom.value = ''
                    }
                }
            }
        }, 100)
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

    removeInputDom() {
        if (Text.inputDom) {
            document.body.removeChild(Text.inputDom);
            Text.inputDom = null;
        }
    }

    // 元素删除时需要做的事情
    destroy() {
        super.destroy();
    }

}

export default Text;