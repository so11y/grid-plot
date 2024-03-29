import { FontFamily, CtrlType, AlignType } from "../../Constants";
import { IPoint, IPixelPos, ITxt } from "../../Interface";
import Rect from "./Rect";
import Feature from "../Feature";

class Text extends Rect {

    static mousePos: IPoint = { x: 0, y: 0 }
    static cursorPos: IPoint = { x: 0, y: 0 }
    static lastDate = Date.now()
    static inputDom: HTMLTextAreaElement | null;

    textInfo: Required<ITxt> = {
        txt: '',
        fontSize: 1,
        fontFamily: FontFamily.HEITI,
        color: "#000",
        lineHeight: 1,
        fontWeight: 1,
        offset: { x: 0, y: 0 },
        bolder: false,
    }
    fitSize: boolean;
    textArr: string[];  // 当前文本被分成多少行
    contentHeight: number;
    padding: number = 0;

    editble: boolean;  // 双击是否可编辑
    alpha: number;
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
        this.fitSize = false;
        this.textInfo.txt = text;
        this.textInfo.fontSize = fontSize;
        this.textInfo.lineHeight = .4;
        this.textInfo.fontWeight = 0;
        this.fillStyle = "#fff";
        this.hoverStyle = "#fff";
        this.focusStyle = "#fff";
        this.editble = false;
        this.alpha = 1;
        this.lineWidth = .2;
        this.textArr = [];
        this.contentHeight = 0;
        let lastWidth = this.getSize().width;
        this.resizeEvents.push((e: CtrlType) => {  // 控制点改变大小触发的钩子
            if (this.fitSize && e === CtrlType.SIZE_CTRL) {
                const { width } = this.getSize()
                this.textInfo.fontSize *= (1 + (width - lastWidth) / width);   // 根据宽度变化的百分比,同步放大fontSize
                lastWidth = width;
            }
            if (e === CtrlType.WIDTH_CTRL) {
                lastWidth = this.getSize().width
                this.textArr = this.getFormatStr(lastWidth, this.gls.getPixelLen(this.textInfo.fontSize));
            }
        })
        // this.dbclickEvents.push((e: any) => {
        //     this.cursorIndex = -1;
        //     this.editble = true;
        //     Text.mousePos = getMousePos(this.gls.domElement, e);
        //     this.createInputDom(Text.mousePos)
        // })
        // this.blurEvents.push((e: any) => {
        //     this.cursorIndex = -1;
        //     this.editble = false;
        //     Text.mousePos = { x: 0, y: 0 };
        //     this.removeInputDom();
        // })
        this.textArr = this.getFormatStr(width, this.gls.getPixelLen(this.textInfo.fontSize));
    }

    getFormatStr(boxWidth: number, fontSize: number) {
        const offscreenCanvas = document.createElement('canvas');
        // 获取离屏Canvas的2D渲染上下文  
        const ctx = offscreenCanvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.font = `${this.textInfo.bolder ? 'bolder' : ''} ${fontSize}px ${this.textInfo.fontFamily}`;

        let contentHeight = 0; //绘制字体距离canvas顶部初始的高度
        let lastSubstrIndex = 0; //每次开始截取的字符串的索引
        let contentWidth = 0;
        const padding = this.gls.getRatioSize(this.padding);
        // startY += padding;
        const lineHeight = this.gls.getRatioSize(this.textInfo.lineHeight);
        const textArr = [];

        for (let i = 0; i < this.textInfo.txt.length; i++) {
            const fontWidth = ctx.measureText(this.textInfo.txt[i]).width;
            if (this.textInfo.txt[i] === '\n') {
                const txt = this.textInfo.txt.substring(lastSubstrIndex, i);
                textArr.push(txt);
                contentHeight += (fontWidth + lineHeight);
                contentWidth = 0;
                lastSubstrIndex = i + 1;
                continue;
            }
            if ((contentWidth + fontWidth) > (boxWidth - padding * 2)) {
                const txt = this.textInfo.txt.substring(lastSubstrIndex, i);
                textArr.push(txt);
                contentHeight += (fontWidth + lineHeight);
                contentWidth = 0;
                lastSubstrIndex = i;
                contentWidth += fontWidth;
                continue;
            }
            if (i == this.textInfo.txt.length - 1) {
                const txt = this.textInfo.txt.substring(lastSubstrIndex, i + 1);
                textArr.push(txt);
                continue;
            }
            contentWidth += fontWidth;
        }
        return textArr;
    }

    draw(ctx: CanvasRenderingContext2D, pointArr: IPixelPos[], lineWidth: number, radius = 0) {
        const path = super.draw(ctx, pointArr, lineWidth, radius);
        if (Feature.TargetRender) {
            const { leftTop } = this.getSize(pointArr);
            ctx.save();
            this.rotateCtx(ctx, leftTop);
            ctx.clip(path);   // 要放在旋转后面
            ctx.textBaseline = "top";
            ctx.fillStyle = this.textInfo.color;
            ctx.lineWidth = this.textInfo.fontWeight;
            ctx.globalAlpha = this.opacity;
            const fontSize = Feature.TargetRender.getRatioSize(this.textInfo.fontSize);
            ctx.font = `${this.textInfo.bolder ? 'bolder' : ''} ${fontSize}px ${this.textInfo.fontFamily}`;
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
        ctx.font = `${this.textInfo.bolder ? 'bolder' : ''} ${fontSize}px ${this.textInfo.fontFamily}`;
        let contentHeight = 0; //绘制字体距离canvas顶部初始的高度
        let lastSubstrIndex = 0; //每次开始截取的字符串的索引
        let contentWidth = 0;
        const padding = this.gls.getRatioSize(this.padding);
        startY += padding;
        const lineHeight = this.gls.getRatioSize(this.textInfo.lineHeight);
        const textArr = [];

        for (let i = 0; i < this.textInfo.txt.length; i++) {
            const fontWidth = ctx.measureText(this.textInfo.txt[i]).width;
            if ((contentWidth + fontWidth) > (boxWidth - padding * 2) || this.textInfo.txt[i] === '\n') {
                const txt = this.textInfo.txt.substring(lastSubstrIndex, i);
                ctx.fillText(txt, startX + padding, startY + contentHeight) //绘制未截取的部分
                contentHeight += (fontSize + lineHeight);
                contentWidth = 0;
                lastSubstrIndex = i;
            }
            if (i == this.textInfo.txt.length - 1) {
                const txt = this.textInfo.txt.substring(lastSubstrIndex + 1, i + 1);
                ctx.fillText(txt, startX + padding, startY + contentHeight);
                textArr.push({
                    text: txt,
                    pos: { x: startX + fontWidth * i, y: startY + contentHeight },
                })
            }
            textArr.push({
                text: this.textInfo.txt[i],
                pos: { x: startX + contentWidth, y: startY + contentHeight },
            })
            contentWidth += fontWidth;
        }

        // if (this.editble) {
        //     if (this.cursorIndex == i) {
        //         Text.cursorPos.x = Text.mousePos.x = (startX + padding + contentWidth);
        //         Text.cursorPos.y = startY + contentHeight;
        //     }
        //     if (this.cursorIndex == this.textInfo.txt.length) {  // 末尾文字处理
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
        //             if (realMousePosX > contentWidth - ctx.measureText(this.textInfo.txt[i - 1]).width / 2 && realMousePosX < contentWidth + fontWidth / 2) {
        //                 Text.cursorPos.x = (startX + padding + contentWidth);
        //                 this.cursorIndex = i;
        //             }
        //             if (realMousePosX > contentWidth + fontWidth / 2 && i === this.textInfo.txt.length - 1) {  // 末尾文字处理
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

    removeInputDom() {
        if (Text.inputDom) {
            document.body.removeChild(Text.inputDom);
            Text.inputDom = null;
        }
    }

    getSvg(pointArr: IPixelPos[] = [], lineWidth: number = 1, radius = 0) {
        const offscreenCanvas = document.createElement('canvas');
        // 获取离屏Canvas的2D渲染上下文  
        const ctx = offscreenCanvas.getContext('2d') as CanvasRenderingContext2D;

        const padding = this.gls.getRatioSize(this.padding);
        const lineHeight = this.gls.getRatioSize(this.textInfo.lineHeight);

        const { width, height, leftTop } = this.getSize(pointArr);
        const svgStr = super.getSvg(pointArr, lineWidth, radius);
        const fontSize = this.gls.getRatioSize(this.textInfo.fontSize)

        let textArr = ''
        let contentHeight = 0; //绘制字体距离canvas顶部初始的高度
        let lastSubstrIndex = 0; //每次开始截取的字符串的索引
        let contentWidth = 0;

        ctx.font = `${this.textInfo.bolder ? 'bolder' : ''} ${fontSize}px ${this.textInfo.fontFamily}`;

        // 文本的起始坐标
        const startX = leftTop.x + lineWidth / 2 + padding;
        const startY = leftTop.y + lineWidth / 2 + padding + lineHeight;

        for (let i = 0; i < this.textInfo.txt.length; i++) {  // 去换行
            const fontWidth = ctx.measureText(this.textInfo.txt[i]).width;
            contentWidth += fontWidth;
            if (contentWidth > (width - padding * 2 - lineWidth * 2) || this.textInfo.txt[i] === '\n') {
                textArr += `<text x="${startX}" y="${startY + contentHeight}" dominant-baseline="hanging" style="fill:${this.textInfo.color}; font-family: '${this.textInfo.fontFamily}'; font-size: ${fontSize}; font-weight:${this.textInfo.bolder ? 'bolder' : ''};"
                >${this.textInfo.txt.substring(lastSubstrIndex, i)}</text>`
                contentHeight += (fontSize + lineHeight);
                contentWidth = 0;
                lastSubstrIndex = i;
            }
            if (i == this.textInfo.txt.length - 1) {
                textArr += `<text x="${startX}" y="${startY + contentHeight}" dominant-baseline="hanging" style="fill:${this.textInfo.color}; font-family: '${this.textInfo.fontFamily}'; font-size: ${fontSize}; font-weight:${this.textInfo.bolder ? 'bolder' : ''};"
                >${this.textInfo.txt.substring(lastSubstrIndex, i + 1)}</text>`
            }
        }

        return svgStr + `
        <g transform="rotate(${this.angle} ${leftTop.x} ${leftTop.y})">
            ${textArr} 
        </g>
        `
    }

    // 元素删除时需要做的事情
    destroy() {
        super.destroy();
    }

}

export default Text;