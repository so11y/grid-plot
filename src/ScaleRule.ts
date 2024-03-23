// 比例尺
import { CoordinateSystem } from "./Constants";
import GridSystem from "./GridSystem"

class ScaleRuler {

    functions: string[];

    constructor(functions = ["scaleNum", "ruler"]) {
        this.functions = functions;
    }

    draw(gls: GridSystem) {
        const ctx = gls.ctx;
        ctx.save()
        if (this.functions.includes("scaleNum")) {
            const text = `x ${gls.scale.toFixed(2)}`;
            const textWidth = ctx.measureText(text).width
            ctx.beginPath();
            ctx.strokeStyle = "#002c8c";
            ctx.moveTo(gls.ctx.canvas.width - 100, gls.ctx.canvas.height - 30);
            ctx.lineTo(gls.ctx.canvas.width - 100, gls.ctx.canvas.height - 20);
            ctx.lineTo(gls.ctx.canvas.width - (50 - textWidth), gls.ctx.canvas.height - 20);
            ctx.lineTo(gls.ctx.canvas.width - (50 - textWidth), gls.ctx.canvas.height - 30);
            ctx.stroke();
            ctx.fillStyle = '#002c8c';
            ctx.font = '15px Arial';
            ctx.fillText(text, gls.ctx.canvas.width - 80, gls.ctx.canvas.height - 27);
        }
        if (this.functions.includes("ruler")) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = .7;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(gls.ctx.canvas.width, 0);
            ctx.moveTo(0, 0);
            ctx.lineTo(0, gls.ctx.canvas.height);
            ctx.fillStyle = '#000';
            const fontSize = 12
            ctx.font = `${fontSize}px 黑体`;
            const gridSize = Number(gls.getRatioSize(CoordinateSystem.GRID_SIZE).toFixed(0));
            console.log("gridSize:" + CoordinateSystem.GRID_SIZE, "ratioSize:" + gridSize);


            // 水平方向
            for (let index = 0; index < gls.pageSlicePos.x / gridSize; index++) {
                const x = gls.pageSlicePos.x - gridSize * index;
                ctx.moveTo(x, 0);  // 刻度
                ctx.lineTo(x, 8);
                const label = String(gridSize * index)  // 刻度下面得文字
                const labelWidth = ctx.measureText(label).width
                ctx.fillText(label, x - labelWidth / 2, 18);
            }
            for (let index = 0; index < (gls.ctx.canvas.width - gls.pageSlicePos.x) / gridSize; index++) {
                const x = gls.pageSlicePos.x + gridSize * index;
                ctx.moveTo(x, 0);  // 刻度
                ctx.lineTo(x, 8);
                const label = String(gridSize * index)  // 刻度下面得文字
                const labelWidth = ctx.measureText(label).width
                ctx.fillText(label, x - labelWidth / 2, 18);
            }

            // 垂直方向
            for (let index = 0; index < gls.pageSlicePos.y / gridSize; index++) {
                const y = gls.pageSlicePos.y - gridSize * index;
                ctx.moveTo(0, y);  // 刻度
                ctx.lineTo(10, y);
                const label = String(gridSize * index)  // 刻度下面得文字
                ctx.fillText(label, 15, y + fontSize / 2);
            }
            for (let index = 0; index < (gls.ctx.canvas.height - gls.pageSlicePos.y) / gridSize; index++) {
                const y = gls.pageSlicePos.y + gridSize * index;
                ctx.moveTo(0, y);  // 刻度
                ctx.lineTo(10, y);
                const label = String(gridSize * index)  // 刻度下面得文字
                ctx.fillText(label, 15, y + fontSize / 2);
            }

            ctx.stroke();
        }
        ctx.restore()
    }
}

export default ScaleRuler;