
// 系统用的常量
enum CoordinateSystem {
    GRID_SIZE = 5,  // N*N的网格组,网格大小
    MAX_SCALESIZE = 40,  // 最大放大比例
    MIN_SCALESIZE = 1,  // 最小缩小比例
    SCALE_ABILITY = .8,  // 缩放快慢
    NATIVE_SCALE = 10,  // 原始缩放大小
    AREA_FILL_COLOR = "rgba(145,202,255, .5)",  // 区域选择的rect填充色
    DB_CLICK_DURATION = 250,  // 双击间隔的时间
    DRAG_TRANSITION_MIN_DIST = 10,  // 拖拽滑动最小距离
    SCALE_SHOW_MIN_SIZE = 10  // 显示元素的最小size,太小的元素不显示
}

// 字体family
enum FontFamily {
    HEITI = "黑体",
    SONGTI = "宋体",
    KAITI = "楷体",
    SHISHANG = "shishang",
    YOUSHE = "youshe",
    ZONGYI = "zongyi",
}

// 控制点方位
enum CtrlType {
    SIZE_CTRL = "sizeCtrl",
    ANGLE_CTRL = "angleCtrl",
    WIDTH_CTRL = "widthCtrl",
    HEIGHT_CTRL = "heightCtrl",
    ANCHOR_CTRL = "anchorCtrl",
    ROTATE_DIST = 25,
    // BEZIER_POINT = "bezierPoint"  // 贝塞尔曲线控制点
}

// link的起点终点标识
enum LinkMark {
    START = "start",
    END = 'end',
}

// 自定义事件名称
enum Events {
    MOUSE_DOWN = 'mousedown', // 鼠标按下时
    MOUSE_UP = 'mouseup', // 鼠标松开时
    MOUSE_WHEEL = 'mousewheel',  // 滚轮滚动时
    MOUSE_MOVE = 'mousemove',  // 鼠标在目标上移动时
    MOUSE_OVER = 'mouseover',  // 鼠标进入时
    MOUSE_LEAVE = 'mouseleave',  // 鼠标移开时
    CONTEXTMENU = 'contextmenu',  // 鼠标移开时
    DRAW = 'draw',   // 绘制画布所有元素时
    BLUR = 'blur',  // 失去焦点时
    FOCUS = 'focus',  // 获取焦点时
    DB_CLICK = 'db-click',   // 双击时
    RIGHT_CLICK = 'right-click',   // 双击时
    DRAG_END = 'drag-end',  // 拖拽结束时
    DELETE = 'delete', // 元素删除时
    RESIZE = 'resize', // 元素形变时
    ROTATE = 'rotate', // 元素旋转时
    TRANSLATE = 'translate', //画布或元素移动时
}

// 线段样式
enum LinkStyle {
    DEFAULT = 'default',  // 直线
    BROKEN_ONE = 'broken_one', // 折线
    BROKEN_TWO = 'broken_two', // 折线
    CURVE_H = 'curve_h',  // 曲线
    CURVE_V = 'curve_v',  // 曲线
    CURVE = 'curve',  // 曲线
    AUTOBROKEN = 'autobroken'  // 自动寻路
}

// 对齐方向
enum Orientation {
    LEFT = 'left',
    RIGHT = 'right',
    TOP = 'top',
    BOTTOM = 'bottom',
    CENTER_X = 'centerx',
    CENTER_Y = 'centery',
}
// 对齐配置类型
enum AdsorbType {
    GRID = 'grid',
    FEATURE = 'feature',
    POINT = 'point',
}

// 选中模式
enum SelectMode {
    ALL_P = 'all',
    ONE_P = 'one',
}

// SelectArea选中模式
enum AreaSelectMode {
    RECT = 'rect',  // 矩形范围
    IRREGULAR = 'irregular',  // 不规则几何形范围
}
// group内对齐方式
enum AlignType {
    TOP = 'top',
    LEFT = 'left',
    BOTTOM = 'bottom',
    RIGHT = 'right',
    CENTER = 'center',
    HORIZONAL = 'horizonal',
    VERTICAL = 'vertical',
}
// 类名, 为什么不用constructor.className?因为打包后会乱码,无法判断
enum ClassName {
    IMG = 'img',
    VIDEO = 'video',
    CIRCLE = 'circle',
    LINE = 'line',
    PEN = 'pen',
    LINK = 'link',
    RECT = 'rect',
    TEXT = 'text',
    RCTRLPNT = 'rctrlpnt',
    SCTRLPNT = 'sctrlpnt',
    BCTRLPNT = 'bctrlpnt',
    ADSORBPNT = 'adsorbpnt',
    ANCHORPNT = 'anchorpnt',
    ERASERPNT = 'eraserpnt',
    BBOX = 'bbox',
    GROUP = 'group',
    PNT = 'pnt',
    SELECTAREA = 'selectarea',
    GRIDSYSTEM = 'gridsystem',
    MINIMAP = 'minimap',
    FEATURE = 'feature',
}

export {
    CoordinateSystem,
    CtrlType,
    LinkMark,
    Events,
    LinkStyle,
    FontFamily,
    Orientation,
    AdsorbType,
    SelectMode,
    AreaSelectMode,
    AlignType,
    ClassName,
}