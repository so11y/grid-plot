<template>
  <div class="canvas-wrap">
    <canvas id="myCanvas" width="1580" height="880" style="border: 0px solid"></canvas>
    <img src="/img.png" alt id="imgs" style="display: none;" />
  </div>
</template>

<script lang="ts">
import GridSystem from "../GridSystem";
import Rect from "../features/basic-shape/Rect";
import Line from "../features/basic-shape/Line";
import Text from "../features/basic-shape/Text";
import Img from "../features/basic-shape/Img";
import Circle from "../features/basic-shape/Circle";
// import Circle from "../features/Circle";
import { FontFamily } from "../Constants";
import GridLine from "../GridLine";

export default {
  data() {
    return {
    };
  },
  mounted() {
    let canvas = document.querySelector("#myCanvas") as HTMLCanvasElement;
    let gls = new GridSystem(canvas);
    gls.loadFont(FontFamily.YOUSHE);
    // let gridLine = new GridLine();
    gls.enableStack();
    function startTime() {
      gls.draw(true, () => {
        // gridLine.draw(gls);
      });
    }
    startTime();
    gls.translate(-300, -300);

    let rect = new Rect(500, 260, 650, 370);
    rect.isStroke = false;
    rect.cbSelect = false;
    let rect1 = new Rect(250, 110, 20, 20);
    rect1.rotate(45)
    rect1.isStroke = false
    let rect2 = new Rect(255, 110, 20, 20);
    rect2.rotate(45)
    rect2.lineWidth = .2
    let rect3 = new Rect(385, 265, 300, 180);
    rect3.lineWidth = .1
    rect3.strokeStyle = "#000"
    rect3.cbSelect = false;

    let rect4 = new Rect(600, 150, 20, 20);
    rect4.rotate(45)
    rect4.strokeStyle = "#4f80a8";
    rect4.lineWidth = .2
    let rect5 = new Rect(600, 250, 20, 20);
    rect5.strokeStyle = "#4f80a8";
    rect5.rotate(45)
    rect5.lineWidth = .2
    let rect6 = new Rect(600, 350, 20, 20);
    rect6.strokeStyle = "#4f80a8";
    rect6.rotate(45)
    rect6.lineWidth = .2
    let circle1 = new Circle(700, 110, 5, 5);
    let circle2 = new Circle(720, 110, 5, 5);
    let circle3 = new Circle(740, 110, 5, 5);
    let circle4 = new Circle(760, 110, 5, 5);
    circle1.fillStyle = circle1.strokeStyle = "#efad6b"
    circle2.fillStyle = circle2.strokeStyle = "#4f80a8"
    circle3.fillStyle = circle3.strokeStyle = "#dbc5ab"
    circle4.fillStyle = circle4.strokeStyle = "#a0bbc2"

    let text = new Text("工作思想", 360, 110, 140, 25, 5);
    text.isStroke = false;
    text.fillStyle = "transparent"
    let text1 = new Text("团队协作", 680, 150, 80, 20, 4);
    text1.fillStyle = "transparent"
    text1.isStroke = false;
    let text2 = new Text("演示文稿是一种实用的工具，可以是演示，演讲，报告等。大部分时间，它们都是在为观众服务。它们有多种用途，是演讲和教学的有力工具。", 715, 195, 150, 50, 1.7);
    text2.fillStyle = "transparent"
    text2.isStroke = false;
    let text3 = new Text("领导思想", 680, 250, 80, 20, 4);
    text3.fillStyle = "transparent"
    text3.isStroke = false;
    let text4 = new Text("演示文稿是一种实用的工具，可以是演示，演讲，报告等。大部分时间，它们都是在为观众服务。它们有多种用途，是演讲和教学的有力工具。", 715, 295, 150, 50, 1.7);
    text4.fillStyle = "transparent"
    text4.isStroke = false;
    let text5 = new Text("培养员工", 680, 350, 80, 20, 4);
    text5.fillStyle = "transparent"
    text5.isStroke = false;
    let text6 = new Text("演示文稿是一种实用的工具，可以是演示，演讲，报告等。大部分时间，它们都是在为观众服务。它们有多种用途，是演讲和教学的有力工具。", 715, 395, 150, 50, 1.7);
    text6.fillStyle = "transparent"
    text6.isStroke = false;
    text.lineWidth = 0
    text.fontFamily = FontFamily.YOUSHE
    text.color = '#404040'
    // text.bold = true
    // text1.fontSize = 7
    // text3.fontSize = 7
    // text5.fontSize = 7
    text3.color = "#efad6b"
    text2.color = "#666"
    text4.color = "#666"
    text6.color = "#666"

    rect.fillStyle = '#f2f2f2';
    // rect.cbSelect = false;
    rect1.fillStyle = '#efad6b';
    rect2.fillStyle = 'rgba(0,0,0,0)';
    rect3.fillStyle = 'rgba(0,0,0,0)';
    rect4.fillStyle = 'rgba(0,0,0,0)';
    rect5.fillStyle = 'rgba(0,0,0,0)';
    rect6.fillStyle = 'rgba(0,0,0,0)';
    gls.addFeature(rect);
    gls.addFeature(rect2);
    gls.addFeature(rect1);
    gls.addFeature(rect4);
    gls.addFeature(rect5);
    gls.addFeature(rect6);
    gls.addFeature(text);
    gls.addFeature(text1);
    gls.addFeature(text2);
    gls.addFeature(text3);
    gls.addFeature(text4);
    gls.addFeature(text5);
    gls.addFeature(text6);
    gls.addFeature(circle1);
    gls.addFeature(circle2);
    gls.addFeature(circle3);
    gls.addFeature(circle4);

    // let group = new FeatureGroup();
    // group.add(rect);
    // group.add(rect2);
    // group.add(rect1);
    // group.add(rect4);
    // group.add(rect5);
    // group.add(rect6);
    // group.add(circle1);
    // group.add(circle2);
    // group.add(circle3);
    // group.add(circle4);
    // group.add(text);
    // group.add(text1);
    // group.add(text2);
    // group.add(text3);
    // group.add(text4);
    // group.add(text5);
    // group.add(text6);

    let imgs = document.querySelector("#imgs") as HTMLImageElement;
    // let imgs = document.querySelector("#vid");
    let img;
    if (imgs) {
      img = new Img(imgs, 370, 250, 300, 180);
      img.isStroke = false
      img.zIndex = 2
      gls.addFeature(rect3);
      gls.addFeature(img)
      // group.add(rect3);
      // group.add(img);
    }

    // setTimeout(() => {
    //   gls.toFitView()
    // }, 1000)
  },
};
</script>

<style scoped></style>