// 绘制自定义文字

import { FontFamily, CtrlType, AlignType } from "../../Constants";
import { IPoint } from "../../Interface";
import Rect from "./Rect";
import Feature from "../Feature";
import { getMousePos } from "@/utils";

class Text extends Rect {

    static mousePos: IPoint = { x: 0, y: 0 }
    static cursorPos: IPoint = { x: 0, y: 0 }
    static lastDate = Date.now()
    static inputDom: HTMLTextAreaElement | null;

    text: string;
    fitSize: boolean;
    fontSize: number;
    color: string;
    fontFamily: FontFamily;
    lineHeight: number;
    textArr: string[];  // 当前文本被分成多少行
    contentHeight: number;
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
        this.textArr = [];
        this.contentHeight = 0;
        let lastWidth = this.getSize().width;
        this.resizeEvents.push((e: CtrlType) => {  // 控制点改变大小触发的钩子
            if (this.fitSize && e === CtrlType.SIZE_CTRL) {
                const { width } = this.getSize()
                this.fontSize *= (1 + (width - lastWidth) / width);   // 根据宽度变化的百分比,同步放大fontSize
                lastWidth = width;
            }
            if (e === CtrlType.WIDTH_CTRL) {
                lastWidth = this.getSize().width
                this.textArr = this.getFormatStr(lastWidth, this.gls.getPixelLen(this.fontSize));
            }
        })
        // this.dbclickEvents.push((e: any) => {
        //     this.cursorIndex = -1;
        //     this.editble = true;
        //     Text.mousePos = getMousePos(this.gls.dom, e);
        //     this.createInputDom(Text.mousePos)
        // })
        // this.blurEvents.push((e: any) => {
        //     this.cursorIndex = -1;
        //     this.editble = false;
        //     Text.mousePos = { x: 0, y: 0 };
        //     this.removeInputDom();
        // })
        this.textArr = this.getFormatStr(width, this.gls.getPixelLen(this.fontSize));
    }

    getFormatStr(boxWidth: number, fontSize: number) {
        var offscreenCanvas = document.createElement('canvas');
        // 获取离屏Canvas的2D渲染上下文  
        var ctx = offscreenCanvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.font = `${this.bold ? 'bold' : ''} ${fontSize}px ${this.fontFamily}`;

        var contentHeight = 0; //绘制字体距离canvas顶部初始的高度
        var lastSubstrIndex = 0; //每次开始截取的字符串的索引
        var contentWidth = 0;
        const padding = this.gls.getRatioSize(this.padding);
        // startY += padding;
        const lineHeight = this.gls.getRatioSize(this.lineHeight);
        const textArr = [];

        for (let i = 0; i < this.text.length; i++) {
            const fontWidth = ctx.measureText(this.text[i]).width;
            if (this.text[i] === '\n') {
                const txt = this.text.substring(lastSubstrIndex, i);
                textArr.push(txt);
                contentHeight += (fontWidth + lineHeight);
                contentWidth = 0;
                lastSubstrIndex = i + 1;
                continue;
            }
            if ((contentWidth + fontWidth) > (boxWidth - padding * 2)) {
                const txt = this.text.substring(lastSubstrIndex, i);
                textArr.push(txt);
                contentHeight += (fontWidth + lineHeight);
                contentWidth = 0;
                lastSubstrIndex = i;
                contentWidth += fontWidth;
                continue;
            }
            if (i == this.text.length - 1) {
                const txt = this.text.substring(lastSubstrIndex, i + 1);
                textArr.push(txt);
                continue;
            }
            contentWidth += fontWidth;
        }
        return textArr;
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPoint[], lineWidth: number, radius = 0) {
        const path = super.draw(ctx, pointArr, lineWidth, radius);
        if (Feature.TargetRender) {
            const { leftTop } = this.getSize(pointArr);
            ctx.save();
            ctx.clip(path);   // 会导致后面元素旋转无效
            this.setAngle(ctx, leftTop);
            ctx.textBaseline = "top";
            ctx.fillStyle = this.color;
            ctx.lineWidth = this.fontWeight;
            ctx.globalAlpha = this.opacity;
            const fontSize = Feature.TargetRender.getRatioSize(this.fontSize);
            ctx.font = `${this.bold ? 'bold' : ''} ${fontSize}px ${this.fontFamily}`;
            for (let i = 0; i < this.textArr.length; i++) {
                const txt = this.textArr[i];
                ctx.fillText(txt, leftTop.x, leftTop.y + i * fontSize)
            }
            // const { textArr, contentHeight } = this.toFormateStr(ctx, fontSize, width, leftTop.x, leftTop.y);
            // this.textArr = textArr;
            // this.gls.test = textArr[35].pos;
            // this.contentHeight = contentHeight;
            // if (this.editble) {  // 光标闪烁
            //     if (Date.now() - Text.lastDate > 600) {
            //         ctx.fillStyle = "red";
            //         ctx.fillRect(Text.cursorPos.x, Text.cursorPos.y, 2, fontSize)
            //         if (Date.now() - Text.lastDate > 1300) {
            //             Text.lastDate = Date.now();
            //         }
            //     }
            // }
        }
        ctx.restore();
        return path;
    }

    // 自适应换行
    toFormateStr(ctx: CanvasRenderingContext2D, fontSize: number, boxWidth: number, startX: number, startY: number) {
        ctx.font = `${this.bold ? 'bold' : ''} ${fontSize}px ${this.fontFamily}`;
        var contentHeight = 0; //绘制字体距离canvas顶部初始的高度
        var lastSubstrIndex = 0; //每次开始截取的字符串的索引
        var contentWidth = 0;
        const padding = this.gls.getRatioSize(this.padding);
        startY += padding;
        const lineHeight = this.gls.getRatioSize(this.lineHeight);
        const textArr = [];

        for (let i = 0; i < this.text.length; i++) {
            const fontWidth = ctx.measureText(this.text[i]).width;
            if ((contentWidth + fontWidth) > (boxWidth - padding * 2) || this.text[i] === '\n') {
                const txt = this.text.substring(lastSubstrIndex, i);
                ctx.fillText(txt, startX + padding, startY + contentHeight) //绘制未截取的部分
                contentHeight += (fontSize + lineHeight);
                contentWidth = 0;
                lastSubstrIndex = i;
            }
            if (i == this.text.length - 1) {
                const txt = this.text.substring(lastSubstrIndex + 1, i + 1);
                ctx.fillText(txt, startX + padding, startY + contentHeight);
                textArr.push({
                    text: txt,
                    pos: { x: startX + fontWidth * i, y: startY + contentHeight },
                })
            }
            textArr.push({
                text: this.text[i],
                pos: { x: startX + contentWidth, y: startY + contentHeight },
            })
            contentWidth += fontWidth;
        }

        // if (this.editble) {
        //     if (this.cursorIndex == i) {
        //         Text.cursorPos.x = Text.mousePos.x = (startX + padding + contentWidth);
        //         Text.cursorPos.y = startY + contentHeight;
        //     }
        //     if (this.cursorIndex == this.text.length) {  // 末尾文字处理
        //         Text.cursorPos.x = Text.mousePos.x = (startX + padding + contentWidth + fontWidth);
        //         Text.cursorPos.y = startY + contentHeight;
        //     }
        //     if (this.cursorIndex < 0) {
        //         const realMousePosY = 0;
        //         const mouseY = Text.mousePos.y - startY;
        //         if (mouseY < 0) {
        //             realMousePosY = 0;
        //             Text.mousePos.y = startY;
        //         } else if (mouseY > this.contentHeight) {
        //             realMousePosY = this.contentHeight;
        //             Text.mousePos.y = startY + this.contentHeight;
        //         } else {
        //             realMousePosY = mouseY;
        //         }
        //         if (realMousePosY >= contentHeight && realMousePosY <= contentHeight + fontSize) {
        //             Text.cursorPos.y = startY + contentHeight;
        //             const realMousePosX = Text.mousePos.x - startX - padding;
        //             if (realMousePosX > contentWidth - ctx.measureText(this.text[i - 1]).width / 2 && realMousePosX < contentWidth + fontWidth / 2) {
        //                 Text.cursorPos.x = (startX + padding + contentWidth);
        //                 this.cursorIndex = i;
        //             }
        //             if (realMousePosX > contentWidth + fontWidth / 2 && i === this.text.length - 1) {  // 末尾文字处理
        //                 Text.cursorPos.x = (startX + padding + contentWidth + fontWidth);
        //                 this.cursorIndex = i + 1;
        //             }
        //         }
        //     }
        // }

        return {
            contentHeight,
            textArr,
        };
    }


    // createInputDom = (pos: IPoint) => {
    //     Text.inputDom = document.createElement("textarea") as HTMLTextAreaElement;
    //     const [leftTop, rightTop, rightBottom, leftBottom] = this.getRectWrapPoints();
    //     const { x, y } = this.gls.getPixelPos(leftTop);
    //     const { x: x1, y: y1 } = this.gls.getPixelPos(rightTop);
    //     const fontSize = this.gls.getRatioSize(this.fontSize)
    //     Text.inputDom.style.position = "fixed";
    //     Text.inputDom.style.opacity = '1';
    //     Text.inputDom.style.left = `${x - 500}px`;
    //     Text.inputDom.style.top = `${y}px`;
    //     Text.inputDom.style.width = `${x1 - x}px`;
    //     Text.inputDom.rows = this.textArr.length;
    //     Text.inputDom.style.padding = `${0}px`;
    //     Text.inputDom.style.border = `none`;
    //     Text.inputDom.style.resize = `none`;
    //     Text.inputDom.style.transform = `rotate(${this.angle}deg)`;
    //     Text.inputDom.style.transformOrigin = `center center`;
    //     Text.inputDom.style.outline = `none`;
    //     // Text.inputDom.style.opacity = `0`;
    //     // Text.inputDom.style.background = `transparent`;
    //     Text.inputDom.style.background = `#fff`;
    //     Text.inputDom.style.fontFamily = `${this.fontFamily}`;
    //     Text.inputDom.style.fontWeight = `${this.fontWeight}`;
    //     Text.inputDom.style.fontSize = `${fontSize}px`;
    //     Text.inputDom.value = this.text;
    //     document.body.appendChild(Text.inputDom);
    //     setTimeout(() => {
    //         if (Text.inputDom) {
    //             setCursorPosition(Text.inputDom, this.cursorIndex)
    //             Text.inputDom.focus();
    //             Text.inputDom.oninput = () => {
    //                 if (Text.inputDom) {
    //                     this.text = Text.inputDom.value;
    //                     this.textArr = this.getFormatStr(x1 - x, this.gls.getPixelLen(this.fontSize));
    //                     this.cursorIndex = getCursorPosition(Text.inputDom).end;
    //                 }
    //             }
    //             Text.inputDom.onkeydown = () => {
    //                 setTimeout(() => {
    //                     if (Text.inputDom) {
    //                         this.textArr = this.getFormatStr(x1 - x, this.gls.getPixelLen(this.fontSize));
    //                         this.cursorIndex = getCursorPosition(Text.inputDom).end;
    //                     }
    //                 }, 100)
    //             }
    //         }
    //     }, 100)
    // }

    removeInputDom() {
        if (Text.inputDom) {
            document.body.removeChild(Text.inputDom);
            Text.inputDom = null;
        }
    }

    getSvg(pointArr: IPoint[] = [], lineWidth: number = 1, radius = 0) {
        var offscreenCanvas = document.createElement('canvas');
        // 获取离屏Canvas的2D渲染上下文  
        var ctx = offscreenCanvas.getContext('2d') as CanvasRenderingContext2D;

        const padding = this.gls.getRatioSize(this.padding);
        const lineHeight = this.gls.getRatioSize(this.lineHeight);

        const { width, height, leftTop } = this.getSize(pointArr);
        const svgStr = super.getSvg(pointArr, lineWidth, radius);
        const fontSize = this.gls.getRatioSize(this.fontSize)

        var textArr = ''
        var contentHeight = 0; //绘制字体距离canvas顶部初始的高度
        var lastSubstrIndex = 0; //每次开始截取的字符串的索引
        var contentWidth = 0;

        ctx.font = `${this.bold ? 'bold' : ''} ${fontSize}px ${this.fontFamily}`;

        // 文本的起始坐标
        const startX = leftTop.x + lineWidth / 2 + padding;
        const startY = leftTop.y + lineWidth / 2 + padding + lineHeight;

        for (let i = 0; i < this.text.length; i++) {  // 去换行
            const fontWidth = ctx.measureText(this.text[i]).width;
            contentWidth += fontWidth;
            if (contentWidth > (width - padding * 2 - lineWidth * 2) || this.text[i] === '\n') {
                textArr += `<text x="${startX}" y="${startY + contentHeight}" dominant-baseline="hanging" style="fill:${this.color}; font-family: '${this.fontFamily}'; font-size: ${fontSize}; font-weight:${this.bold ? 'bold' : ''};"
                >${this.text.substring(lastSubstrIndex, i)}</text>`
                contentHeight += (fontSize + lineHeight);
                contentWidth = 0;
                lastSubstrIndex = i;
            }
            if (i == this.text.length - 1) {
                textArr += `<text x="${startX}" y="${startY + contentHeight}" dominant-baseline="hanging" style="fill:${this.color}; font-family: '${this.fontFamily}'; font-size: ${fontSize}; font-weight:${this.bold ? 'bold' : ''};"
                >${this.text.substring(lastSubstrIndex, i + 1)}</text>`
            }
        }

        return svgStr + `
        <g transform="rotate(${this.angle} ${leftTop.x} ${leftTop.y})">
            ${textArr} 
        </g>
        `
    }

    // revert(direction: AlignType, center?: IPoint, isParent?: boolean): void {
        
    // }

    // 元素删除时需要做的事情
    destroy() {
        super.destroy();
    }

}

export default Text;