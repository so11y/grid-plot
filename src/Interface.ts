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

type IProps = Partial<Feature & Text & Img & Link & Group> & {
    id: string,
    children: IProps[]
}

type IBasicFeature = Line | Rect | Circle | Group

export type { IPoint, IRelativePos, IPixelPos, ISize, IVctor, ITxt, ITriangle, IProps, IBasicFeature };