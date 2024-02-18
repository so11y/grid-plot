
import { IBBox, IPoint, IVctor, Size, Vector } from "./Interface";

/**
 * 获取鼠标点击后相对于canvas左上角的坐标
 * @param dom 
 * @param e 
 * @returns 
 */
function getMousePos(dom: HTMLCanvasElement, e: any | IPoint): IPoint {
    let downX: number;
    let downY: number;
    if (e.x && e.y) {
        downX = e.x;
        downY = e.y;
    } else {
        downX = e.clientX;
        downY = e.clientY;
    }

    let { left, top } = dom.getBoundingClientRect();

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
 * 一个点相对另一个点旋转后的坐标
 * @param point // 要旋转的点
 * @param originPoint // 相对的原点,不动的点
 * @param angle // 旋转的角度
 * @returns 
 */
function getRotatePoint(point: IPoint, originPoint: IPoint = { x: 0, y: 0 }, angle: number) {
    const cosA = Math.cos(angle * Math.PI / 180);
    const sinA = Math.sin(angle * Math.PI / 180);
    const rx = originPoint.x + (point.x - originPoint.x) * cosA - (point.y - originPoint.y) * sinA;
    const ry = originPoint.y + (point.x - originPoint.x) * sinA + (point.y - originPoint.y) * cosA;
    return { x: rx, y: ry };
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

/**
 * 点与线的最短距离
 * @param x 点
 * @param y 
 * @param x1 两点连成的线
 * @param y1 
 * @param x2 
 * @param y2 
 * @returns 
 */
function distanceOfPoint2Line(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0) //线段长度不能为0
        param = dot / len_sq;

    var xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    }
    else if (param > 1) {
        xx = x2;
        yy = y2;
    }
    else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

function getMinDistLine(point: IPoint, lines: any[]) {
    if (lines.length <= 0) return;
    let dists: number[] = []
    lines.forEach(item => {
        let xdist1 = item[0].x - point.x;
        let ydist1 = item[0].y - point.y;

        let xdist2 = item[1].x - point.x;
        let ydist2 = item[1].y - point.y;

        dists.push(Math.sqrt(xdist1 * xdist1 + ydist1 * ydist1) + Math.sqrt(xdist2 * xdist2 + ydist2 * ydist2));
    })

    let minDist = Math.min(...dists);
    let index = dists.findIndex(item => item == minDist)
    return lines[index]
}

//点P到线段AB的距离
//使用矢量算法，计算线AP在线段AB方向上的投影
function point2SegDist(point: IPoint, point1: IPoint, point2: IPoint) {
    let x = point.x, x1 = point1.x, x2 = point2.x
    let y = point.y, y1 = point1.y, y2 = point2.y

    //线段AB 为一个点
    if (x1 == x2 && y1 == y2) return {
        type: true,
        point: point1,
        dist: 0
    }

    let cross = (x2 - x1) * (x - x1) + (y2 - y1) * (y - y1);
    let d2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    //r = 0 垂足为point1  r = 1 垂足为point2
    let r = cross / d2;
    let px = x1 + (x2 - x1) * r;
    let py = y1 + (y2 - y1) * r;
    return {
        type: r >= 0 && r <= 1, //true  垂足在线段内   false 垂足在线段外
        point: { x: px, y: py },
        dist: Math.sqrt((x - px) * (x - px) + (py - y) * (py - y))
    };
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

// 获取向量的长度
function getVectorLength(vector: IPoint) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y)
}

// 获取线段的中点
function getVectorCenter(point1: IPoint, point2: IPoint) {
    return {
        x: (point1.x + point2.x) / 2,
        y: (point1.y + point2.y) / 2
    }
}

//  求两个向量之间的夹角
function get2vectorAngle(vector1: IPoint, vector2: IPoint) {
    var angle = Math.atan2(vector2.y, vector2.x) - Math.atan2(vector1.y, vector1.x);
    // if (angle < 0) angle += 2 * Math.PI;
    return angle;
}

function getCenterPoint(point1: IPoint, point2: IPoint): IPoint {
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

function getRandomChineseWord() {
    var _rsl = "";
    var _randomUniCode = Math.floor(Math.random() * (40870 - 19968) + 19968).toString(16);
    eval("_rsl=" + '"\\u' + _randomUniCode + '"');
    return _rsl;
}

function calculateCenter(lnglatarr: IPoint[]) {
    var total = lnglatarr.length;
    var X = 0, Y = 0, Z = 0;
    lnglatarr.forEach(function (lnglat: IPoint) {
        var lng = lnglat.x * Math.PI / 180;
        var lat = lnglat.y * Math.PI / 180;
        var x, y, z;
        x = Math.cos(lat) * Math.cos(lng);
        y = Math.cos(lat) * Math.sin(lng);
        z = Math.sin(lat);
        X += x;
        Y += y;
        Z += z;
    });
    X = X / total;
    Y = Y / total;
    Z = Z / total;

    var Lng = Math.atan2(Y, X);
    var Hyp = Math.sqrt(X * X + Y * Y);
    var Lat = Math.atan2(Z, Hyp);
    console.log(Lng, Lat, Hyp);
    return { x: Lng * 180 / Math.PI, y: Lat * 180 / Math.PI };
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


//四个坐标 两条直线 求交叉点
function segmentsIntr(a: Vector, b: Vector, c: Vector, d: Vector) {
    /** 1 解线性方程组, 求线段交点. **/
    // 如果分母为0 则平行或共线, 不相交
    var denominator = (b[1] - a[1]) * (d[0] - c[0]) - (a[0] - b[0]) * (c[1] - d[1]);
    if (denominator == 0) {
        return false;
    }
    // 线段所在直线的交点坐标 (x , y)
    var x = ((b[0] - a[0]) * (d[0] - c[0]) * (c[1] - a[1])
        + (b[1] - a[1]) * (d[0] - c[0]) * a[0]
        - (d[1] - c[1]) * (b[0] - a[0]) * c[0]) / denominator;
    var y = -((b[1] - a[1]) * (d[1] - c[1]) * (c[0] - a[0])
        + (b[0] - a[0]) * (d[1] - c[1]) * a[1]
        - (d[0] - c[0]) * (b[1] - a[1]) * c[1]) / denominator;
    /** 2 判断交点是否在两条线段上 **/
    if (
        // 交点在线段1上
        (x - a[0]) * (x - b[0]) <= 0 && (y - a[1]) * (y - b[1]) <= 0
        // 且交点也在线段2上
        && (x - c[0]) * (x - d[0]) <= 0 && (y - c[1]) * (y - d[1]) <= 0
    ) {
        // 返回交点p
        return [x, y]
    }
    //否则不相交
    return false
}

function createVctor(start: IPoint, end: IPoint): Vector {
    let x = end.x - start.x;
    let y = end.y - start.y;
    return [x, y];
};

function getVctLen([x = 0, y = 0]) {
    return Math.sqrt(x * x + y * y);
};

/**
* 根据点在向量上的比例计算点坐标, [xO, yO]为起点，[xVct, yVct]为向量，k 为该点在向量方向上的长度
* 获取
*/
function getPntInVct(O: IPoint, [xVct, yVct]: Vector, k = 0): IPoint {
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


function getRotateVct(vct: IVctor, angle = 0): Vector {
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
function getPntsInEllipse(center: Vector, majorRadius: number, minorRadius: number, startAngle: number, endAngle: number, rotateAngle: number, xiaoshu?: boolean) {
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
function isPointInPolygon(point: IPoint, polygon: IPoint[]) {
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

function getRectPoint(pos: IPoint, size: Size) {
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
function getSizeInBytes(str:string) {
    var binaryString = window.atob(str); // 将Base64字符串转换为二进制字符串
    return binaryString.length; // 返回二进制字符串的长度（单位为字节）
}
 

export {
    getMousePos,
    getUuid,
    getRotatePoint,
    calculateBezierPointForCubic,
    distanceOfPoint2Line,
    getMinDistLine,
    getVectorLength,
    getVectorCenter,
    get2vectorAngle,
    point2SegDist,
    getVector,
    crossMul,
    getCenterPoint,
    hex2Rgba,
    rgb2Hex,
    getRandomChineseWord,
    calculateCenter,
    randomNum,
    segmentsIntr,
    getRotateVct,
    getLenOfPntToLine,
    getLenOfTwoPnts,
    getMidOfTwoPnts,
    getRotateAng,
    getPntInVct,
    getVctLen,
    createVctor,
    getRotatePnt,
    getPntsOf3Bezier,
    toBase64,
    isPointInPolygon,
    getRectPoint,
    getPntsInEllipse,
    swapElements,
    isBase64,
    getSizeInBytes,
}