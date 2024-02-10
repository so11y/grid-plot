import { CoordinateSystem } from "./Constants";
import GridSystem from "./GridSystem";

export default class GridLine {

    solidColor: string;
    dashedColor: string;
    zeroColor: string;
    crossLen: number;
    mode: number;
    width: number;
    height: number;
    background: string;

    constructor(mode = 3, width: number = 200, height: number = 200, background = 'rgba(226, 225, 224 ,.2)') {
        this.solidColor = "rgba(0,0,0,.2)"; // 实线颜色
        this.dashedColor = "rgba(0,0,0,.1)"; // 虚线颜色
        this.zeroColor = "rgba(0,0,0,.4)"; // 坐标系颜色 #358bf3
        this.crossLen = 1
        this.mode = mode;  // 1 十字架 网格 2 普通网格 3 限制范围网格
        this.width = width;
        this.height = height;
        this.background = background;
    }

    draw(gls: GridSystem) {
        /*获取绘图工具*/
        // 设置网格大小
        var gridSize = gls.getRatioSize(CoordinateSystem.GRID_SIZE);

        // 获取Canvas的width、height
        var CanvasWidth = gls.ctx.canvas.width;
        var CanvasHeight = gls.ctx.canvas.height;
        // 在 pageSlicePos 的 x，y 点位画一个 10 * 10 的红色标记用来表示当前页面的 0 0 坐标
        // gls.ctx.fillRect(gls.pageSlicePos.x - 5, gls.pageSlicePos.y - 5, 10, 10); // 效果图红色小方块
        // gls.ctx.fillStyle = 'red';
        const canvasXHeight = CanvasHeight - gls.pageSlicePos.y;
        const canvasYWidth = CanvasWidth - gls.pageSlicePos.x;

        let yPageSliceTotal = Math.ceil(canvasYWidth / gridSize); // 计算需要绘画y轴的条数
        let xPageSliceTotal = Math.ceil(canvasXHeight / gridSize);

        // 从 pageSlicePos.y 处开始往 Y 轴负方向画 X 轴网格
        let xRemaining = gls.pageSlicePos.y;
        let xRemainingTotal = Math.ceil(xRemaining / gridSize);
        // 从 pageSlicePos.x 处开始往 X 轴负方向画 Y 轴网格
        let yRemaining = gls.pageSlicePos.x;
        let yRemainingTotal = Math.ceil(yRemaining / gridSize);

        switch (this.mode) {
            case 1:
                var crossLen = gls.getPixelLen(this.crossLen)
                for (let i = 0; i < xPageSliceTotal; i++) {
                    gls.ctx.beginPath(); // 开启路径，设置不同的样式
                    for (let j = 0; j < yPageSliceTotal; j++) {
                        gls.ctx.moveTo(gridSize * j + gls.pageSlicePos.x - crossLen, gls.pageSlicePos.y + gridSize * i);
                        gls.ctx.lineTo(gridSize * j + gls.pageSlicePos.x + crossLen, gls.pageSlicePos.y + gridSize * i);
                    }
                    for (let j = 0; j < yRemainingTotal; j++) {
                        gls.ctx.moveTo(-gridSize * j + gls.pageSlicePos.x - crossLen, gls.pageSlicePos.y + gridSize * i);
                        gls.ctx.lineTo(-gridSize * j + gls.pageSlicePos.x + crossLen, gls.pageSlicePos.y + gridSize * i);
                    }
                    gls.ctx.strokeStyle = "#c2c2d6"; // 如果为 0 则用蓝色标记，取余 5 为实线，其余为比较淡的线
                    gls.ctx.stroke();
                }

                for (let j = 0; j < yPageSliceTotal; j++) {
                    gls.ctx.beginPath(); // 开启路径，设置不同的样式  
                    for (let i = 0; i < xPageSliceTotal; i++) {
                        gls.ctx.moveTo(gls.pageSlicePos.x + gridSize * j, gls.pageSlicePos.y + gridSize * i - crossLen);
                        gls.ctx.lineTo(gls.pageSlicePos.x + gridSize * j, gls.pageSlicePos.y + gridSize * i + crossLen);
                    }
                    for (let i = 0; i < xRemainingTotal; i++) {
                        gls.ctx.moveTo(gls.pageSlicePos.x + gridSize * j, gls.pageSlicePos.y - gridSize * i - crossLen);
                        gls.ctx.lineTo(gls.pageSlicePos.x + gridSize * j, gls.pageSlicePos.y - gridSize * i + crossLen);
                    }
                    gls.ctx.strokeStyle = "#c2c2d6";// 如果为 0 则用蓝色标记，取余 5 为实线，其余为比较淡的线
                    gls.ctx.stroke();
                }

                for (let j = 0; j < yRemainingTotal; j++) {
                    if (j === 0) continue;
                    gls.ctx.beginPath(); // 开启路径，设置不同的样式
                    for (let i = 0; i < xPageSliceTotal; i++) {
                        gls.ctx.moveTo(gls.pageSlicePos.x - gridSize * j, gls.pageSlicePos.y + gridSize * i - crossLen);
                        gls.ctx.lineTo(gls.pageSlicePos.x - gridSize * j, gls.pageSlicePos.y + gridSize * i + crossLen);
                    }
                    for (let i = 0; i < xRemainingTotal; i++) {
                        gls.ctx.moveTo(gls.pageSlicePos.x - gridSize * j, gls.pageSlicePos.y - gridSize * i - crossLen);
                        gls.ctx.lineTo(gls.pageSlicePos.x - gridSize * j, gls.pageSlicePos.y - gridSize * i + crossLen);
                    }
                    gls.ctx.strokeStyle = "#c2c2d6";// 如果为 0 则用蓝色标记，取余 5 为实线，其余为比较淡的线
                    gls.ctx.stroke();
                }


                for (let i = 0; i < xRemainingTotal; i++) {
                    if (i === 0) continue;
                    gls.ctx.beginPath(); // 开启路径，设置不同的样式
                    for (let j = 0; j < yPageSliceTotal; j++) {
                        gls.ctx.moveTo(gridSize * j + gls.pageSlicePos.x - crossLen, gls.pageSlicePos.y - gridSize * i);
                        gls.ctx.lineTo(gridSize * j + gls.pageSlicePos.x + crossLen, gls.pageSlicePos.y - gridSize * i);
                    }
                    for (let j = 0; j < yRemainingTotal; j++) {
                        gls.ctx.moveTo(-gridSize * j + gls.pageSlicePos.x - crossLen, gls.pageSlicePos.y - gridSize * i);
                        gls.ctx.lineTo(-gridSize * j + gls.pageSlicePos.x + crossLen, gls.pageSlicePos.y - gridSize * i);
                    }
                    gls.ctx.strokeStyle = "#c2c2d6";// 如果为 0 则用蓝色标记，取余 5 为实线，其余为比较淡的线
                    gls.ctx.stroke();
                }

                break;
            case 2:

                // 从 pageSlicePos.y 处开始往 Y 轴正方向画 X 轴网格
                for (let i = 0; i < xPageSliceTotal; i++) {
                    gls.ctx.beginPath(); // 开启路径，设置不同的样式
                    gls.ctx.moveTo(0, gls.pageSlicePos.y + gridSize * i);
                    gls.ctx.lineTo(CanvasWidth, gls.pageSlicePos.y + gridSize * i);
                    gls.ctx.strokeStyle = i === 0 ? this.zeroColor : (i % 5 === 0 ? this.solidColor : this.dashedColor); // 如果为 0 则用蓝色标记，取余 5 为实线，其余为比较淡的线
                    gls.ctx.stroke();
                }

                // 从 pageSlicePos.y 处开始往 Y 轴负方向画 X 轴网格
                for (let i = 0; i < xRemainingTotal; i++) {
                    if (i === 0) continue;
                    gls.ctx.beginPath(); // 开启路径，设置不同的样式
                    gls.ctx.moveTo(0, gls.pageSlicePos.y - gridSize * i); // -0.5是为了解决像素模糊问题
                    gls.ctx.lineTo(CanvasWidth, gls.pageSlicePos.y - gridSize * i);
                    gls.ctx.strokeStyle = i === 0 ? this.zeroColor : (i % 5 === 0 ? this.solidColor : this.dashedColor);// 如果为 0 则用蓝色标记，取余 5 为实线，其余为比较淡的线
                    gls.ctx.stroke();
                }

                // 从 pageSlicePos.x 处开始往 X 轴正方向画 Y 轴网格
                for (let j = 0; j < yPageSliceTotal; j++) {
                    gls.ctx.beginPath(); // 开启路径，设置不同的样式
                    gls.ctx.moveTo(gls.pageSlicePos.x + gridSize * j, 0);
                    gls.ctx.lineTo(gls.pageSlicePos.x + gridSize * j, CanvasHeight);
                    gls.ctx.strokeStyle = j === 0 ? this.zeroColor : (j % 5 === 0 ? this.solidColor : this.dashedColor);// 如果为 0 则用蓝色标记，取余 5 为实线，其余为比较淡的线
                    gls.ctx.stroke();
                }

                // 从 pageSlicePos.x 处开始往 X 轴负方向画 Y 轴网格
                for (let j = 0; j < yRemainingTotal; j++) {
                    if (j === 0) continue;
                    gls.ctx.beginPath(); // 开启路径，设置不同的样式
                    gls.ctx.moveTo(gls.pageSlicePos.x - gridSize * j, 0);
                    gls.ctx.lineTo(gls.pageSlicePos.x - gridSize * j, CanvasHeight);
                    gls.ctx.strokeStyle = j === 0 ? this.zeroColor : (j % 5 === 0 ? this.solidColor : this.dashedColor);// 如果为 0 则用蓝色标记，取余 5 为实线，其余为比较淡的线
                    gls.ctx.stroke();
                }
                break;

            case 3:
                
                const width = gls.getRatioSize(this.width);
                const height = gls.getRatioSize(this.height);
                let ySliceTotal = Math.ceil(width / gridSize); // 计算需要绘画y轴的条数
                let xSliceTotal = Math.ceil(height / gridSize);
                gls.ctx.fillStyle = this.background
                gls.ctx.fillRect(gls.pageSlicePos.x - width, gls.pageSlicePos.y-height, width*2, height*2);

                for (let i = 0; i < xSliceTotal; i++) {
                    gls.ctx.beginPath(); // 开启路径，设置不同的样式
                    gls.ctx.moveTo(gls.pageSlicePos.x - width, gls.pageSlicePos.y - gridSize * i)
                    gls.ctx.lineTo(gls.pageSlicePos.x + width, gls.pageSlicePos.y - gridSize * i)
                    gls.ctx.strokeStyle = "#c2c2d6"
                    gls.ctx.stroke()

                    gls.ctx.beginPath(); // 开启路径，设置不同的样式
                    gls.ctx.moveTo(gls.pageSlicePos.x - width, gls.pageSlicePos.y + gridSize * i)
                    gls.ctx.lineTo(gls.pageSlicePos.x + width, gls.pageSlicePos.y + gridSize * i)
                    gls.ctx.strokeStyle = "#c2c2d6"
                    gls.ctx.stroke()
                }

                for (let i = 0; i < ySliceTotal; i++) {
                    gls.ctx.beginPath(); // 开启路径，设置不同的样式
                    gls.ctx.moveTo(gls.pageSlicePos.x - gridSize * i, gls.pageSlicePos.y - height)
                    gls.ctx.lineTo(gls.pageSlicePos.x - gridSize * i, gls.pageSlicePos.y + height)
                    gls.ctx.strokeStyle = "#c2c2d6"
                    gls.ctx.stroke()

                    gls.ctx.beginPath(); // 开启路径，设置不同的样式
                    gls.ctx.moveTo(gls.pageSlicePos.x + gridSize * i, gls.pageSlicePos.y - height)
                    gls.ctx.lineTo(gls.pageSlicePos.x + gridSize * i, gls.pageSlicePos.y + height)
                    gls.ctx.strokeStyle = "#c2c2d6"
                    gls.ctx.stroke()
                }
                break;
            default:
                break;
        }


    }
}