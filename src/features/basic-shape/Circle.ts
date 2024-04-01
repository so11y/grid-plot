import Feature from "../Feature";
import { getCirclePoints, } from "../../utils";
import { ClassName } from "@/Constants";

// 圆形元素
class Circle extends Feature {

    constructor(x: number, y: number, width: number, height: number) {   // 相对坐标
        let pointArr = getCirclePoints(x, y, width, height, 0);
        super(pointArr);
        this.position.x = x;
        this.position.y = y;
        this.size.width = width;
        this.size.height = height;
        this.pntMinDistance = .1;
        this.className = ClassName.CIRCLE
    }

    setPos(x: number = this.position.x, y: number = this.position.x) {
        this.position.x = x;
        this.position.y = y;
        this.pointArr = getCirclePoints(this.position.x, this.position.y, this.size.width, this.size.height, this.angle);
    }

    setSize = (width: number = this.size.width, height: number = this.size.height) => {
        this.size.width = width;
        this.size.height = height;
        this.pointArr = getCirclePoints(this.position.x, this.position.y, this.size.width, this.size.height, this.angle);
    }

}

export default Circle;