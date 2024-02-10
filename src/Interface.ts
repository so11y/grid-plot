import Circle from "./features/basic-shape/Circle";
import Img from "./features/basic-shape/Img";
import Line from "./features/basic-shape/Line";
import Link from "./features/basic-shape/Link";
import Rect from "./features/basic-shape/Rect";
import Text from "./features/basic-shape/Text";
import Feature from "./features/Feature";

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

interface IBBox {
    x: number,
    y: number,
    width: number,
    height: number,
    left?: number,
    right?: number,
    top?: number,
    bottom?: number,
}

type Src = string | HTMLImageElement | HTMLVideoElement | null

type Props = Partial<Feature & Text & Img & Link> & {
    id: string
}

type BasicFeature = Img | Line | Rect | Text | Circle

type Vector = [number, number]

export type { IPoint, RelativePos, PixelPos, Size, IVctor, IBBox, Src, Props, BasicFeature, Vector };