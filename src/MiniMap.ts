import { ClassName, Events } from "./Constants";
import GridSystem from "./GridSystem";
import { IPixelPos } from "./Interface";
import { getMousePos } from "./utils"

interface ViewRect {
    x: number,
    y: number,
    width: number,
    height: number,
}

// 小地图
class MiniMap extends GridSystem {
    className = ClassName.MINIMAP
    // static gls: GridSystem;
    viewRect: ViewRect;  // 当前显示的区域
    isDraging: boolean;  // 是否正在渲染中
    gls: GridSystem;  // 主页面gls实例
    lastMove: IPixelPos = { x: 0, y: 0 };
    ratio = 1;

    constructor(gls: GridSystem, width = 450) {
        const canvasDom = document.createElement("canvas");
        canvasDom.style.position = "fixed";
        canvasDom.style.border = "1px solid #ccc"
        canvasDom.style.background = "transparent"
        document.body.appendChild(canvasDom);
        super(canvasDom, false);
        this.gls = gls;
        this.ratio = this.gls.ctx.canvas.height / this.gls.ctx.canvas.width
        canvasDom.width = width;
        canvasDom.height = width * this.ratio;
        this.setMyCanvas(canvasDom);
        this.viewRect = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }
        this.isDraging = false;
        this.pageSlicePos = {
            x: this.ctx.canvas.width / 2,
            y: this.ctx.canvas.height / 2
        };
        this.scale = .5;
        this.setViewRect();
        this.gls.on("drag", () => {
            this.setViewRect();
        })
        this.gls.on(Events.MOUSE_WHEEL, () => {
            this.setViewRect();
        })
    }

    setMyCanvas(canvasDom: HTMLCanvasElement) {
        const { x, y, width, height } = this.gls.domElement.getBoundingClientRect();
        canvasDom.style.left = `${x + width - canvasDom.width}px`
        canvasDom.style.top = `${y + height - canvasDom.height}px`
    }

    initEventListener() {  // 重写
        this.domElement.addEventListener("mousedown", (e) => {
            this.dragViewRect(e)
        })
        this.domElement.addEventListener("contextmenu", (e) => { // 禁用右键上下文
            e.preventDefault();
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = this.background;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.drawFeatures(this.gls.features);  // 绘制所有元素
        // 绘制当前显示区域的矩形框
        this.ctx.fillStyle = "rgba(255,251,143,.5)"
        this.ctx.fillRect(this.viewRect.x, this.viewRect.y, this.viewRect.width, this.viewRect.height)
    }

    setViewRect() {
        // 主页面区域总宽高
        const parent = this.gls;
        // 跟新小地图可视框
        this.viewRect.width = parent.ctx.canvas.width / parent.scale * this.scale
        this.viewRect.height = this.viewRect.width * this.ratio
        this.viewRect.x = this.pageSlicePos.x - parent.pageSlicePos.x / parent.scale  * this.scale
        this.viewRect.y = this.pageSlicePos.y - parent.pageSlicePos.y / parent.scale  * this.scale
    }

    dragViewRect = (e: any) => {
        const { x, y } = getMousePos(this.domElement, e)
        this.lastMove = { x, y };
        const parent = this.gls;

        if (x > this.viewRect.x && x < this.viewRect.x + this.viewRect.width && y > this.viewRect.y && y < this.viewRect.y + this.viewRect.height) {  // 鼠标在矩形框内
            this.isDraging = true;
            const mousemove = (ev: any) => {
                this.domElement.style.cursor = "move"
                const { x: x1, y: y1 } = getMousePos(this.domElement, ev);
                if (this.lastMove.x && this.lastMove.y) {
                    const dx = (x1 - this.lastMove.x);
                    const dy = (y1 - this.lastMove.y);
                    this.viewRect.x += dx * this.scale
                    this.viewRect.y += dy * this.scale

                    parent.pageSlicePos.x -= dx * parent.scale
                    parent.pageSlicePos.y -= dy * parent.scale
                }
                this.lastMove = { x: x1, y: y1 };
            }
            const mouseup = (ev: any) => {
                this.domElement.style.cursor = "default"
                this.isDraging = false;
                document.removeEventListener("mousemove", mousemove)
                document.removeEventListener("mouseup", mouseup)
            }
            document.addEventListener("mousemove", mousemove)
            document.addEventListener("mouseup", mouseup)
        } else {
            this.domElement.style.cursor = "default";
        }
    }

    destory() {
        document.body.removeChild(this.domElement)
        document.removeEventListener("draw", this.draw)
        this.domElement.removeEventListener("mousedown", this.dragViewRect)
    }
}

export default MiniMap;
