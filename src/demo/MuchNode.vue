<template>
    <div class="canvas-wrap">
        <canvas id="myCanvas" width="1580" height="880" style="border: 0px solid"></canvas>
    </div>
</template>
    
<script lang="ts">
import GridLine from "../GridLine";
import GridSystem from "../GridSystem";
import Rect from "../features/basic-shape/Rect";
import { randomNum } from "../utils";

export default {
    data() {
        return {
        };
    },
    mounted() {
        let canvas = document.querySelector("#myCanvas") as HTMLCanvasElement;

        let gls = new GridSystem(canvas);
        gls.extent = [750, 800, 750, 800]
        let gridLine = new GridLine();

        function startTime() {
            console.time();
            gls.draw(true, () => {
                gridLine.draw(gls)
            });
            console.timeEnd();
        }
        startTime();

        for (let index = 0; index <= 16000; index++) {
            let rect = new Rect(gls.getRelativeLen(randomNum(0, gls.ctx.canvas.width))*2, gls.getRelativeLen(randomNum(0, gls.ctx.canvas.height))*2, 15, 15)   // 5个单位长度
            gls.addFeature(rect);
        }
    },
};
</script>

<style>
body {
    margin: 0;
}

button {
    margin: 5px;
}

canvas {
    /* background-color: #000; */
}
</style>