import Feature from "../Feature";
import { getPntsInEllipse, } from "../../utils";

function getCirclePointsWithPosAndAngle(x: number, y: number, width: number, height: number, angle = 0) {
    let O: [number, number] = [x, y];
    let points = getPntsInEllipse(O, width / 2, height / 2, 0, 360, angle);
    return points;
}

// 矩形点状元素
class Circle extends Feature {

    constructor(x: number, y: number, width: number, height: number) {   // 相对坐标
        let pointArr = getCirclePointsWithPosAndAngle(x, y, width, height, 0);
        super(pointArr);
        this.position.x = x;
        this.position.y = y;
        this.size.width = width;
        this.size.height = height;
        this.pntDistanceLimit = .1;
        this.className = "Circle"
    }

    setPos(x: number = this.position.x, y: number = this.position.x) {
        this.position.x = x;
        this.position.y = y;
        this.pointArr = getCirclePointsWithPosAndAngle(this.position.x, this.position.y, this.size.width, this.size.height, this.angle);
    }

    setSize = (width: number = this.size.width, height: number = this.size.height) => {
        this.size.width = width;
        this.size.height = height;
        this.pointArr = getCirclePointsWithPosAndAngle(this.position.x, this.position.y, this.size.width, this.size.height, this.angle);
    }

}

export default Circle;