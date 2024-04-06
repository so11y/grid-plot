import { FontFamily } from "./Constants";
import Circle from "./features/basic-shape/Circle";
import Img from "./features/basic-shape/Img";
import Line from "./features/basic-shape/Line";
import Link from "./features/basic-shape/Link";
import Rect from "./features/basic-shape/Rect";
import Text from "./features/basic-shape/Text";
import Feature from "./features/Feature";
import Group from "./features/function-shape/Group";

interface IPoint {
    x: number,
    y: number,
}

interface IRelativePos {
    x: number,
    y: number,
}

interface IPixelPos {
    x: number,
    y: number,
}

interface ISize {
    width: number,
    height: number,
}

interface IVctor {
    0: number,
    1: number
}

interface ITxt {
    hidden: boolean,
    txt: string,
    fontSize: number,
    color: string,
    fontFamily: FontFamily,
    offset: IPoint,
    lineHeight?: number,
    fontWeight?: number,
    bolder: boolean,
}

interface ITriangle {
    hidden: boolean,
    width: number,
    height: number,
    angle: number,
    color: string,
    lineWidth: number,
    fill: string,
}

type IProps = Partial<Feature & Text & Img & Link & Group & Line> & {
    id: string,
    children: IProps[]
}

type IBasicFeature = Line | Rect | Circle | Group | Link

interface Listeners {
    [key: string]: Function[]
}

interface NearNode {
    x: number,  // 坐标,以网格为单元的值
    y: number,
    name?: string,
    g?: number,  // 当前点与附近点的距离,写死
    h?: number,  // 当前点与终点水平垂直方向距离之和
    f?: number // g+h之和
}

interface Itree {
    label: string,
    children: Itree[],
    x?: number,
    y?: number,
    width?: number,
    height?: number,
}

export type { IPoint, IRelativePos, IPixelPos, ISize, IVctor, ITxt, ITriangle, IProps, IBasicFeature, Listeners, NearNode, Itree };