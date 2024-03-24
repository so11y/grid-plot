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

interface RelativePos {
    x: number,
    y: number,
}

interface PixelPos {
    x: number,
    y: number,
}

interface Size {
    width: number,
    height: number,
}

interface IVctor {
    0: number,
    1: number
}

interface Txt {
    txt: string,
    fontSize:number,
    color: string,
    fontFamily: FontFamily,
    offset: IPoint,
    lineHeight?: number,
    fontWeight?:number,
    bolder: boolean,
}

type Props = Partial<Feature & Text & Img & Link & Group> & {
    id: string,
    children: Props[]
}

type BasicFeature = Line | Rect | Circle | Group

type Vector = [number, number]

export type { IPoint, RelativePos, PixelPos, Size, IVctor, Txt, Props, BasicFeature, Vector };