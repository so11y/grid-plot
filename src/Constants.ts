
// 系统用的常量
enum CoordinateSystem {
    GRID_SIZE = 5,  // N*N的网格组,网格大小
    MAX_SCALESIZE = 40,  // 最大放大比例
    MIN_SCALESIZE = 1,  // 最小缩小比例
    SCALE_ABILITY = .8,  // 缩放快慢
    NATIVE_SCALE = 10,  // 原始缩放大小
    AREA_FILL_COLOR = "rgba(145,202,255, .5)",  // 区域选择的rect填充色
    DB_CLICK_DURATION = 250,  // 双击间隔的时间
    DRAG_TRANSITION_MIN_DIST = 5  // 拖拽滑动最小距离
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
    ROTATE_DIST = 25,
    // BEZIER_POINT = "bezierPoint"  // 贝塞尔曲线控制点
}

// 元素的类型,小类
enum BlockType {
    RECT = "rect",
    CIRCLE = "circle",
    IMAGE = "image",
    VIDEO = "video",
    FREELINE = "freeline",
    TEXT = "text",
    LINE = "line",
    PIPE = "pipe",
    LINK = "link",
    TRIANGLE = "triangle",
    POLYGON = "polygon",
    ARROW = "arrow",
    CUSTOM = "custom",
}

// 操作的类型
enum OperateType {
    ADD = "add",
    DEL = "del",
    UPDATE = "update",
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
    BROKEN = 'broken', // 折线
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
    HORIZONAL = 'horizonal',
    VERTICAL = 'vertical',
}

export {
    CoordinateSystem,
    CtrlType,
    BlockType,
    OperateType,
    LinkMark,
    Events,
    LinkStyle,
    FontFamily,
    Orientation,
    SelectMode,
    DrawAreaMode,
    AlignType,
}