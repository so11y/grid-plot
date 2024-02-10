import GridSystem from './GridSystem';
import { IPoint } from './Interface';

interface NearNode {
    x: number,  // 坐标,以网格为单元的值
    y: number,
    name?: string,
    g?: number,  // 当前点与附近点的距离,写死
    h?: number,  // 当前点与终点水平垂直方向距离之和
    f?: number // g+h之和
}

class AutoSearchPath {

    coordList: IPoint[];  // 路径点集合
    originPos: NearNode;  // 起点
    targetPos: NearNode;  // 终点
    biasX: boolean;  // x轴偏向
    biasY: boolean;  // y轴偏向
    step: number;  // 跑步数
    onComplete: Function | null;

    constructor(originPos: IPoint, targetPos: IPoint) {
        this.coordList = [];
        this.originPos = originPos;
        this.targetPos = targetPos;
        this.biasX = this.targetPos.x > this.originPos.x;  // 偏左
        this.biasY = this.targetPos.y > this.originPos.y;  // 偏上
        this.step = 0;
        this.onComplete = null;
    }

    // 获取当前节点附近的6个点,分别是 左, 上, 右, 下, 左上, 右上, 右下, 左下
    getNearNodes(originPos: NearNode) {
        let leftNode = {
            name: "left",
            x: originPos.x - 1,
            y: originPos.y,
            g: !this.biasX ? .9 : 1,
            h: 0,
            f: 0,
        };
        this.setDistProp(leftNode);


        let leftTopNode = {
            name: "left-top",
            x: originPos.x - 1,
            y: originPos.y - 1,
            g: 1.4,
            h: 0,
            f: 0,
        };
        this.setDistProp(leftTopNode);

        let topNode = {
            name: "top",
            x: originPos.x,
            y: originPos.y - 1,
            g: !this.biasY ? .9 : 1,
            h: 0,
            f: 0,
        };
        this.setDistProp(topNode);

        let topRightNode = {
            name: "top-right",
            x: originPos.x + 1,
            y: originPos.y + 1,
            g: 1.4,
            h: 0,
            f: 0,
        };
        this.setDistProp(topRightNode);

        let rightNode = {
            name: "right",
            x: originPos.x + 1,
            y: originPos.y,
            g: this.biasX ? .9 : 1,
            h: 0,
            f: 0,
        };
        this.setDistProp(rightNode);

        let rightBottomNode = {
            name: "right-bottom",
            x: originPos.x + 1,
            y: originPos.y - 1,
            g: 1.4,
            h: 0,
            f: 0,
        };
        this.setDistProp(rightBottomNode);

        let bottomNode = {
            name: "bottom",
            x: originPos.x,
            y: originPos.y + 1,
            g: !this.biasY ? .9 : 1,
            h: 0,
            f: 0,
        };
        this.setDistProp(bottomNode);

        let leftBottomNode = {
            name: "left-bottom",
            x: originPos.x - 1,
            y: originPos.y - 1,
            g: 1.4,
            h: 0,
            f: 0,
        };
        this.setDistProp(leftBottomNode);
        // leftTopNode, rightBottomNode, topRightNode, leftBottomNode
        return [leftNode, topNode, rightNode, bottomNode,]

    }

    // 递归找离目标点最近的点,push到数组当中
    getCoordList(): IPoint[] {
        let nearNodeArr = this.getNearNodes(this.originPos);
        let minFNode = null;   // 离目标最近的点
        let obstacle = GridSystem.Gls.features.filter(f => f.isObstacle);  // 障碍物s
        for (let index = 0; index < nearNodeArr.length; index++) {
            const node = nearNodeArr[index];
            let lastCoordNode = this.coordList[this.coordList.length - 2] || { x: 0, y: 0 };
            if (GridSystem.Gls.hasFeatureIngridPos(obstacle, node.x, node.y) || (node.x == lastCoordNode.x && node.y == lastCoordNode.y)) {
                continue;
            }
            if (!minFNode) {
                minFNode = node;
            } else if (node.f <= minFNode.f) {
                minFNode = node;
            }
        }
        if (minFNode) {
            this.coordList.push({ x: minFNode.x, y: minFNode.y });
            this.originPos = minFNode;
            if (minFNode.x == this.targetPos.x && minFNode.y == this.targetPos.y) {
                this.coordList.push({ x: this.targetPos.x, y: this.targetPos.y });
                return this.coordList;
            } else {
                return this.getCoordList();
            }
        }
        return []
    }

    setDistProp(node: NearNode) {
        if (!node.g) {
            node.g = 0;
        }
        node.h = Math.abs(this.targetPos.x - node.x) + Math.abs(this.targetPos.y - node.y);
        node.f = node.g + node.h;
    }
}

export default AutoSearchPath;