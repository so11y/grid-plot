
import { CoordinateSystem } from "./Constants";
import { IPoint, IVctor, ISize, IVctor } from "./Interface";

/**
 * 获取鼠标点击后相对于canvas左上角的坐标
 * @param domElement 
 * @param e 
 * @returns 
 */
function getMousePos(domElement: HTMLCanvasElement, e: any | IPoint): IPoint {
    let downX: number;
    let downY: number;
    if (e.x && e.y) {
        downX = e.x;
        downY = e.y;
    } else {
        downX = e.clientX;
        downY = e.clientY;
    }

    let { left, top } = domElement.getBoundingClientRect();

    let xDist = downX - left;
    let yDist = downY - top;

    return {
        x: xDist,
        y: yDist,
    };
}

/**
 * 生成唯一id
 * @returns 
 */
function getUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v
            = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16);
    });
}

/**
 * 三次贝赛尔曲线, 两个控制点
 * @param t // 第几段,
 * @param p0 // 起始点
 * @param p1 // 控制点1
 * @param p2 // 控制点2
 * @param p3 // 终点
 * @returns 
 */
function calculateBezierPointForCubic(t: number, p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint): IPoint {
    var point: IPoint = { x: 0, y: 0 };
    var temp = 1 - t;
    point.x = p0.x * temp * temp * temp + 3 * p1.x * t * temp * temp + 3 * p2.x * t * t * temp + p3.x * t * t * t;
    point.y = p0.y * temp * temp * temp + 3 * p1.y * t * temp * temp + 3 * p2.y * t * t * temp + p3.y * t * t * t;
    return point;
}

// 根据两点获取向量
function getVector(point1: IPoint, point2: IPoint) {
    return {
        x: point1.x - point2.x,
        y: point1.y - point2.y
    }
}

function crossMul(point1: IPoint, point2: IPoint) {
    return point1.x * point2.y - point1.y * point2.x;
}

//  求两个向量之间的夹角
function getAngleOfTwoVct(vector1: IVctor, vector2: IVctor) {
    var angle = Math.atan2(vector2[1], vector2[0]) - Math.atan2(vector1[1], vector1[0]);
    // if (angle < 0) angle += 2 * Math.PI;
    return angle;
}

function getCenterOfTwoPnts(point1: IPoint, point2: IPoint): IPoint {
    return {
        x: (point2.x + point1.x) / 2,
        y: (point2.y + point1.y) / 2
    }
}

// 16进制转rgb
function hex2Rgba(hex: string, opacity: number) {
    if (!hex) hex = '#ededed';
    let rgba = 'rgba(' + parseInt('0x' + hex.slice(1, 3)) + ',' +
        parseInt('0x' + hex.slice(3, 5)) + ',' +
        parseInt('0x' + hex.slice(5, 7)) + ',' +
        (opacity || "1") + ')'
    return rgba
}

// rgba转16进制
function rgb2Hex(rgb: string) {
    if (!rgb) rgb = 'rgb(237,237,237)'
    var regexp = /[0-9]{0,3}/g
    var res: any = rgb.match(regexp) // 利用正则表达式去掉多余的部分，将rgb中的数字提取
    var hexRes = '#'
    var hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
    var hexArr = []
    for (let i = 0; i < res.length; i++) {
        if (res[i]) {
            if (res[i] > 16) {
                let leftIndex = (res[i] / 16) >> 0 // 向下取整
                let rightIndex = +res[i] % 16
                hexArr.push(hex[leftIndex])
                hexArr.push(hex[rightIndex])
            } else {
                hexArr.push(0)
                hexArr.push(hex[res[i]])
            }
        }
    }
    return hexRes += hexArr.join('')  // #EDEDED
}


/**
 * 获取随机数,指定范围内
 */
function randomNum(minNum: number, maxNum: number) {
    switch (arguments.length) {
        case 1:
            return Math.random() * minNum + 1;
        case 2:
            return Math.random() * (maxNum - minNum + 1) + minNum;
        default:
            return 0;
    }
}

function createVctor(start: IPoint, end: IPoint): IVctor {
    let x = end.x - start.x;
    let y = end.y - start.y;
    return [x, y];
};
function getVctLen(vct: IVctor) {
    return Math.sqrt(vct[0] * vct[0] + vct[1] * vct[1]);
};

/**
* 根据点在向量上的比例计算点坐标, [xO, yO]为起点，[xVct, yVct]为向量，k 为该点在向量方向上的长度
* 获取
*/
function getPntInVct(O: IPoint, [xVct, yVct]: IVctor, k = 0): IPoint {
    let lenVct = getVctLen([xVct, yVct]);  // 获取向量长度
    let stdVct;
    if (lenVct === 0) {
        stdVct = [0, 0];
    } else {
        stdVct = [xVct / lenVct, yVct / lenVct];   // 单位向量
    }
    // return [O.x + k * stdVct[0], O.y + k * stdVct[1]];
    return {
        x: O.x + k * stdVct[0],
        y: O.y + k * stdVct[1],
    };
};

function getRotateAng([x1 = 0, y1 = 0], [x2 = 0, y2 = 0]) {
    let EPSILON = 1.0e-8;
    let dist, dot, cross, degree, angle;

    dist = Math.sqrt(x1 * x1 + y1 * y1);
    x1 /= dist;
    y1 /= dist;
    dist = Math.sqrt(x2 * x2 + y2 * y2);
    x2 /= dist;
    y2 /= dist;

    dot = x1 * x2 + y1 * y2;
    if (Math.abs(dot - 1.0) <= EPSILON) {
        angle = 0;
    } else if (Math.abs(dot + 1.0) <= EPSILON) {
        angle = Math.PI;
    } else {
        angle = Math.acos(dot);
        cross = x1 * y2 - x2 * y1;
        if (cross < 0) {
            angle = 2 * Math.PI - angle;
        }
    }
    degree = angle * 180 / Math.PI;
    return degree;
};


function getLenOfTwoPnts(p1: IPoint, p2: IPoint) {
    return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
};

function getMidOfTwoPnts(p1: IPoint, p2: IPoint) {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
    }
};

/**
 * 获取O点到直线PQ的距离
 */
function getLenOfPntToLine(O: IPoint, P: IPoint, Q: IPoint) {
    if ((O.x == P.x && O.y == P.y) || (P.x == Q.x && P.y == Q.y)) {
        return 0;
    }
    let rotateAng = getRotateAng([O.x - P.x, O.y - P.y], [Q.x - P.x, Q.y - P.y]);
    let len = getLenOfTwoPnts(O, P) * Math.sin(rotateAng * Math.PI / 180);
    len = len < 0 ? -len : len;
    return len;
};


function getRotateVct(vct: IVctor, angle = 0): IVctor {
    let rad = angle * Math.PI / 180;
    let x1 = Math.cos(rad) * vct[0] - Math.sin(rad) * vct[1];
    let y1 = Math.sin(rad) * vct[0] + Math.cos(rad) * vct[1];
    return [x1, y1];  // 返回的是向量
};

/**
* P 绕 O 点逆时针旋转angle角度后得到新的点坐标
*/
function getRotatePnt(O: IPoint, P: IPoint, angle: number): IPoint {
    if (angle === 0) {
        return P;
    }
    let vctOP = createVctor(O, P),
        OP = getVctLen(vctOP);
    let dvctOQ = getRotateVct(vctOP, angle);
    let newPoint = getPntInVct(O, dvctOQ, OP);
    return newPoint;
};

/**
* 在一段三次贝塞尔曲线上均匀取点, 不包括终点
* @param counts 一段贝塞尔曲线中取点的数量
*/
function getPntsOf3Bezier(p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, counts: number): IPoint[] {
    let per = counts && counts != 0 ? 1 / counts : 0.02;    //取点间隔
    let points: IPoint[] = [];
    for (let t = 0; t <= 0.999999; t += per) {
        points.push(getPntIn3Bezier(p0, p1, p2, p3, t));
    }
    return points;
};

/**
 * 获取三次贝塞尔曲线上的一点，t∈[0,1]
 * @param t 介于0 ~ 1, 表示点在曲线中的相对位置
 */
function getPntIn3Bezier(p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, t: number): IPoint {
    let t_ = 1 - t;
    let x = p0.x * t_ * t_ * t_ + 3 * p1.x * t * t_ * t_ + 3 * p2.x * t * t * t_ + p3.x * t * t * t,
        y = p0.y * t_ * t_ * t_ + 3 * p1.y * t * t_ * t_ + 3 * p2.y * t * t * t_ + p3.y * t * t * t;
    return { x, y };
};

function toBase64(img: HTMLImageElement) {
    var canvas = document.createElement('canvas') as HTMLCanvasElement;
    // 设置画布大小与图片相同
    canvas.width = img.width;
    canvas.height = img.height;
    // 获取2D上下文
    var ctx = canvas.getContext('2d');
    // 将图片绘制到画布上
    ctx && ctx.drawImage(img, 0, 0);
    // 通过toDataURL方法将画布内容转换为Base64字符串
    return canvas.toDataURL('image/png', 1.0);
}

/**
 * 在一段椭圆弧上均匀取点，rotateAngle是椭圆绕中心点逆时针旋转的角度
 * endAngle必须大于startAngle, ~[-360, 360]
 * @param xiaoshu bool, 角度是否为整数, true则添加最后一个点
 */
function getPntsInEllipse(center: IVctor, majorRadius: number, minorRadius: number, startAngle: number, endAngle: number, rotateAngle: number, xiaoshu?: boolean) {
    let x = null,
        y = null,
        points = [],
        perAngle = Math.PI / 180,
        startAngle_ = startAngle * Math.PI / 180,
        endAngle_ = endAngle * Math.PI / 180;
    let angle = startAngle_;

    if (rotateAngle === 0 || !rotateAngle) {
        for (let i = 0; i <= (endAngle_ - startAngle_) / perAngle; i++) {
            x = center[0] + majorRadius * Math.cos(angle);
            y = center[1] + minorRadius * Math.sin(angle);
            points.push({ x, y });
            angle += perAngle;
        }
        if (xiaoshu) {
            points.push({ x: center[0] + majorRadius * Math.cos(endAngle_), y: center[1] + minorRadius * Math.sin(endAngle_) })
        }
    } else {
        for (let i = 0; i <= (endAngle_ - startAngle_) / perAngle; i++) {
            x = center[0] + majorRadius * Math.cos(angle);
            y = center[1] + minorRadius * Math.sin(angle);
            let temp = getRotatePnt({ x: center[0], y: center[1] }, { x, y }, rotateAngle);
            points.push(temp);
            angle += perAngle;
        }
        if (xiaoshu) {
            points.push({ x: center[0] + majorRadius * Math.cos(endAngle_), y: center[1] + minorRadius * Math.sin(endAngle_) })
        }
    }
    return points;
};

// 判断点是否在多边形内
function isPntInPolygon(point: IPoint, polygon: IPoint[]) {
    var j = polygon.length - 1;
    var isInside = false;

    for (var i = 0; i < polygon.length; i++) {
        if (
            ((polygon[i].y < point.y && polygon[j].y >= point.y) || (polygon[j].y < point.y && polygon[i].y >= point.y))
            &&
            (polygon[i].x + (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) * (polygon[j].x - polygon[i].x) < point.x)
        ) {
            isInside = !isInside;
        }
        j = i;
    }

    return isInside;
}

function getRectPoint(pos: IPoint, size: ISize) {
    return [
        { x: pos.x - size.width / 2, y: pos.y - size.height / 2 },
        { x: pos.x + size.width / 2, y: pos.y - size.height / 2 },
        { x: pos.x + size.width / 2, y: pos.y + size.height / 2 },
        { x: pos.x - size.width / 2, y: pos.y + size.height / 2 },
    ]
}

// 数组两个元素交换位置
function swapElements<F>(arr: F[], index1 = 0, index2 = 0) {
    if (index1 < 0 || index1 >= arr.length || index2 < 0 || index2 >= arr.length) {
        console.log("Invalid index");
        return;
    }
    var temp = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = temp;
}

function isBase64(str: string) {
    try {
        const decodedStr = atob(str);
        // 如果解码成功，再判断解码后的字符串是否等于原始字符串
        return btoa(decodedStr) === str;
    } catch (error) {
        return false; // 解码失败则认为不是Base64
    }
}

// 获取字符串大小
function getSizeInBytes(str: string) {
    var binaryString = window.atob(str); // 将Base64字符串转换为二进制字符串
    return binaryString.length; // 返回二进制字符串的长度（单位为字节）
}

function beautifyHTML(html: string, indentSize = 2) {
    var formatted = '';
    // 去除多余空白字符并添加换行符
    html.replace(/^\s+|\s+$/gm, '').split('\n').forEach((line) => {
        if (line !== '') {
            formatted += line + '\n';
        }
    });
    return formatted;
}

// ----------------------------判断型方法-------------------------------
// 判断是否时基础元素
function isBasicFeature(f?: any) {
    if (!f) return false;
    // return (f instanceof Rect || f instanceof Line || f instanceof Circle) && !(f instanceof AnchorPnt) && !(f instanceof CtrlPnt)
    return f.className == 'Img' || f.className == 'Line' || f.className == 'Link' || f.className == 'Rect' || f.className == 'Text' || f.className == 'Circle' || f.className == 'Group'
}
// 判断是否时控制点元素
function isCtrlFeature(f?: any) {
    if (!f) return false;
    return f.className === 'CtrlPnt' || f.className === 'BCtrlPnt' || f.className === 'AnchorPnt' || f.className === 'SCtrlPnt'
}

function getAngleOfTwoPnts(point1: IPoint, point2: IPoint) {
    var deltaX = point2.x - point1.x;
    var deltaY = point2.y - point1.y;
    return Math.atan2(deltaY, deltaX) * 180 / Math.PI;
}

function getUnitSize() {
    return CoordinateSystem.GRID_SIZE * CoordinateSystem.GRID_SIZE
}

export {
    getMousePos,
    getUnitSize,
    getUuid,
    crossMul,
    randomNum,
    hex2Rgba,
    rgb2Hex,

    calculateBezierPointForCubic,
    getVector,
    getVctLen,
    getRotateVct,
    getLenOfPntToLine,
    getLenOfTwoPnts,
    getMidOfTwoPnts,
    getAngleOfTwoPnts,
    getAngleOfTwoVct,
    getCenterOfTwoPnts,
    getRotateAng,
    getPntInVct,
    createVctor,
    getRotatePnt,
    getPntsOf3Bezier,
    getRectPoint,
    getPntsInEllipse,

    toBase64,
    getSizeInBytes,
    beautifyHTML,
    swapElements,

    isBase64,
    isPntInPolygon,
    isBasicFeature,
    isCtrlFeature,
}