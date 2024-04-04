
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

// 控制点方位
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
    DRAW_LINK = 'draw-link', // 绘制连线
    MOUSE_DOWN = 'mouse-down', // 鼠标按下时
    MOUSE_UP = 'mouse-up', // 鼠标按下时
    MOUSE_WHEEL = 'mouse-wheel',  // 滚轮滚动时
    MOUSE_MOVE = 'mouse-move',  // 滚轮滚动时
    DRAW = 'draw',   // 绘制画布所有元素时
    BLUR = 'blur',  // 元素失去焦点时
    FOCUS = 'focus',  // 元素获取焦点时
    DRAW_AREA = 'draw-area',  // 绘制区域时
    DB_CLICK = 'db-click',   // 双击时
    RIGHT_CLICK = 'right-click',   // 双击时
    FEATURE_GRAG = 'feature-drag',
    FEATURE_GRAG_END = 'feature-drag-end',
    FEATURE_MOUSEOVER = 'feature-mouseover',
    FEATURE_MOUSEMOVE = 'feature-mousemove',
    FEATURE_MOUSEDOWN = 'feature-mousedown',
    FEATURE_MOUSEUP = 'feature-mouseup',

    GRAG_CTRL = 'drag-ctrl',
    ANGLE_CTRL_END = 'rotate-ctrl-end',
    ANGLE_CTRL = 'rotate-ctrl',
    SIZE_CTRL = 'ctrl-ctrl',
    SIZE_CTRL_END = 'ctrl-ctrl-end',
    DRAW_ALL = 'draw-all'
}

// 线段样式
enum LinkStyle {
    DEFAULT = 'default',  // 直线
    BROKEN_ONE = 'broken_one', // 折线
    BROKEN_TWO = 'broken_two', // 折线
    CURVE_H = 'curve_h',  // 曲线
    CURVE_V = 'curve_v',  // 曲线
    CURVE = 'curve'  // 曲线
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

// 选中模式
enum DrawAreaMode {
    RECT = 'rect',
    IRREGULAR = 'irregular',
}

enum AlignType {
    TOP = 'top',
    LEFT = 'left',
    BOTTOM = 'bottom',
    RIGHT = 'right',
    CENTER = 'center',
    HORIZONAL = 'horizonal',
    VERTICAL = 'vertical',
}

enum ClassName {
    IMG = 'img',
    VIDEO = 'video',
    CIRCLE = 'circle',
    LINE = 'line',
    LINK = 'link',
    RECT = 'rect',
    TEXT = 'text',
    RCTRLPNT = 'rctrlpnt',
    SCTRLPNT = 'sctrlpnt',
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
    DrawAreaMode,
    AlignType,
    ClassName,
}