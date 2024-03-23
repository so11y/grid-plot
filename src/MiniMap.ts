import GridSystem from "./GridSystem";
import { getMousePos } from "./utils"

interface ViewRect {
    x: number,
    y: number,
    width: number,
    height: number,
}

// 小地图
class MiniMap extends GridSystem {
    className = 'MiniMap'
    // static gls: GridSystem;
    viewRect: ViewRect;  // 当前显示的区域
    isDraging: boolean;  // 是否正在渲染中
    gls: GridSystem;  // 主页面gls实例

    constructor(gls: GridSystem, width = 300, height = 170) {
        // MiniMap.miniMap = null;
        if (!gls.extent || isNaN(gls.extent[0]) || isNaN(gls.extent[1]) || isNaN(gls.extent[2]) || isNaN(gls.extent[3])) { throw new Error("GridSystem必须设置拖拽范围!"); }
        const canvasDom = document.createElement("canvas");
        canvasDom.width = width;
        canvasDom.height = height;
        canvasDom.style.position = "fixed";
        canvasDom.style.border = "1px solid #ccc"
        canvasDom.style.backgroundColor = "#fff"
        document.body.appendChild(canvasDom);
        super(canvasDom, false);
        this.gls = gls;
        this.setMyCanvas(canvasDom);
        this.viewRect = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }
        this.isDraging = false;
    }

    setMyCanvas(canvasDom: HTMLCanvasElement) {
        const { x, y, width, height } = this.gls.dom.getBoundingClientRect();
        canvasDom.style.left = `${x + width - canvasDom.width}px`
        canvasDom.style.top = `${y + height - canvasDom.height}px`
    }

    initEventListener() {
        this.dom.addEventListener("mousedown", (e) => {
            this.dragViewRect(e)
        })
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.drawFeatures(this.gls.features);
        if (!this.isDraging) {
            this.setViewRect();
        }
        this.drawViewRect();
    }

    dragViewRect = (e: any) => {
        const { x, y } = getMousePos(this.dom, e)
        const that = this;
        const glsTotalWidth = this.gls.extent[1] + this.gls.ctx.canvas.width + this.gls.extent[3];
        const glsTotalHeight = this.gls.extent[0] + this.gls.ctx.canvas.height + this.gls.extent[2];

        if (x > this.viewRect.x && x < this.viewRect.x + this.viewRect.width && y > this.viewRect.y && y < this.viewRect.y + this.viewRect.height) {
            this.isDraging = true;
            const vx = this.viewRect.x;
            const vy = this.viewRect.y;
            function mousemove(e: any) {
                that.dom.style.cursor = "move"
                const { x: x1, y: y1 } = getMousePos(that.dom, e);
                const dx = vx + (x1 - x);
                const dy = vy + (y1 - y);
                that.viewRect.x = dx;
                that.viewRect.y = dy;
                // 判断是否超出边界
                if (that.viewRect.x < 0) { that.viewRect.x = 0 };
                if (that.viewRect.y < 0) { that.viewRect.y = 0 };
                if (that.viewRect.x > that.ctx.canvas.width - that.viewRect.width) { that.viewRect.x = that.ctx.canvas.width - that.viewRect.width };
                if (that.viewRect.y > that.ctx.canvas.height - that.viewRect.height) { that.viewRect.y = that.ctx.canvas.height - that.viewRect.height };
                // 更新主页面中心坐标位置
                that.gls.pageSlicePos.x = that.gls.extent[3] - (that.viewRect.x / that.ctx.canvas.width * glsTotalWidth - that.gls.firstPageSlicePos.x);
                that.gls.pageSlicePos.y = that.gls.extent[0] - (that.viewRect.y / that.ctx.canvas.height * glsTotalHeight - that.gls.firstPageSlicePos.y);
            }
            function mouseup(e: any) {
                that.dom.style.cursor = "default"
                that.isDraging = false;
                document.removeEventListener("mousemove", mousemove)
                document.removeEventListener("mouseup", mouseup)
            }
            document.addEventListener("mousemove", mousemove)
            document.addEventListener("mouseup", mouseup)
        } else {
            that.dom.style.cursor = "default";
        }
    }

    setViewRect() {
        // 主页面区域总宽高
        const glsTotalWidth = this.gls.extent[1] + this.gls.ctx.canvas.width + this.gls.extent[3];
        const glsTotalHeight = this.gls.extent[0] + this.gls.ctx.canvas.height + this.gls.extent[2];

        // 跟新小地图可视框
        this.viewRect.x = (this.gls.extent[3] - this.gls.pageSlicePos.x + this.gls.firstPageSlicePos.x) / glsTotalWidth * this.ctx.canvas.width
        this.viewRect.y = (this.gls.extent[0] - this.gls.pageSlicePos.y + this.gls.firstPageSlicePos.y) / glsTotalHeight * this.ctx.canvas.height
        this.viewRect.width = this.gls.ctx.canvas.width / glsTotalWidth * this.ctx.canvas.width
        this.viewRect.height = this.gls.ctx.canvas.height / glsTotalHeight * this.ctx.canvas.height

        // 设置小地图中心坐标与缩放大小
        this.scale = this.ctx.canvas.width / (glsTotalWidth / this.gls.scale);
        // console.log(this.scale, this.gls.scale);
        this.pageSlicePos = {
            x: this.ctx.canvas.width * ((this.gls.firstPageSlicePos.x + this.gls.extent[3]) / glsTotalWidth),
            y: this.ctx.canvas.height * ((this.gls.firstPageSlicePos.y + this.gls.extent[0]) / glsTotalHeight)
        };
    }

    // 绘制可视范围rect
    drawViewRect() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.viewRect.x, this.viewRect.y);
        this.ctx.lineTo(this.viewRect.x + this.viewRect.width, this.viewRect.y);
        this.ctx.lineTo(this.viewRect.x + this.viewRect.width, this.viewRect.y + this.viewRect.height);
        this.ctx.lineTo(this.viewRect.x, this.viewRect.y + this.viewRect.height);
        this.ctx.lineTo(this.viewRect.x, this.viewRect.y);
        this.ctx.fillStyle = "rgba(255,251,143,.5)"
        this.ctx.fill();
        this.ctx.closePath();
        // this.ctx.fillStyle = "red"
        // this.ctx.fillRect(0,0,10,10)
    }

    destory() {
        document.body.removeChild(this.dom)
        document.removeEventListener("draw", this.draw)
        this.dom.removeEventListener("mousedown", this.dragViewRect)
    }
}

export default MiniMap;
