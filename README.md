# 网格系统文档

#### 最基本使用
```
    let canvas = document.querySelector("#myCanvas");
    let gls = new GridSystem(canvas);

    let rect = new Rect(50, 50, 50, 50);
    gls.addFeature(rect);
```

**GridSystem 类**

> 用于绘制画布以及画布内的元素
```
   gls.draw(bool, fn)  // 1. 是否循环渲染还是只渲染一次  2. 没渲染一次执行的回调函数
```
> 遍历计算元素的每个点坐标,调用他们的draw去绘制到画布上(重要)
```
   gls.drawFeatures(features, bool)  // 1. 要渲染的元素是哪些  2. 是否是子元素
```
> 初始化监听事件
```
   gls.initEventListener()
```
> 记录当前鼠标在画布上的坐标
```
   gls.mouseMove()
```
> 鼠标点击画布,判断是点击到元素还是画布,元素的话可以拖拽, 画布的话也是拖拽(重要)
```
   gls.mouseDown()
```
> 获取某个元素相邻的吸附点,作用于拖拽时的网格对齐或元素对齐
```
   gls.getAdsorbOffsetDist(feature, options)  // 1.目标元素 2. 配置项
```
> 鼠标滚轮,放大或所有画布上的元素
```
   gls.mouseWheel()
```
> 鼠标滚轮,已当前鼠标点作为中心去放大
```
   gls.back2center(x, y, lastGirdSize)  // 1,2 鼠标坐标点, 3 上一次网格的大小宽高
```
> 限制画布拖拽范围,传入一个数组，数组有四个数值分别是上，右，下，左
```
   gls.setPageSlicePosByExtent([0,0,0,0])
```
> 向画布中添加实例化后的元素MyText,Rect....传入一个元素
```
   let feature = new Feature(...)
   gls.addFeature(feature, bool)  // 1. 要添加的元素 2. 是否记录到栈,撤销恢复用
```
> 从画布中删除指定元素，传入一个元素
```
   gls.removeFeature(feature, bool) // 1. 要删除的元素 2. 是否记录到栈,撤销恢复用
```
> 获取当前焦点(被选中的)元素,返回basic-shape元素,过滤到比如BBox, CtrlPnt这些功能型元素
```
   gls.getFocusNode()
```
> 鼠标滚轮,放大或所有画布上的元素
```
   gls.toMinusIndex(feature)  // 下移一层 
   gls.toPlusIndex(feature) // 上移一层
   gls.toMinIndex(feature) // 移动到到最底层
   gls.toMaxIndex(feature)  // 移动到到最顶层
   gls.resortIndex() // 元素重新排序
```
> 根据相对坐标获取像素坐标,传入一个数组，数组有两个数值分别是x,y。返回一个数组坐标
关于相对坐标与像素坐标解释：
相对坐标是实例化后用于设置元素的位置，这个位置是相对于网格的原点的，是开发中所使用的;
像素坐标是源代码内部渲染到画布上所用到的坐标，是相对于canvas左上角的，所以开发时基本不用关心（像素坐标我也会表述成像素坐标）

> 根据相对坐标获取实际渲染到画布上的像素坐标
```
   gls.getPixelPos({x, y})    // 相对坐标
```
> 根据像素坐标获取相对坐标
```
   gls.getRelativePos({x, y})  // 像素坐标
```
> 获取像素大小
```
   gls.getRatioSize(size)   // 相对宽度,长度..
```
> 获取相对大小
```
   gls.getOriginalSize(size) // 像素宽度,长度..
```
> 获取长度
```
   gls.getPixelLen(size)  // 获取像素长度， 比如获取元素的宽高
   gls.getRelativeLen(size)  // 获取相对长度， 比如获取元素的宽高
```
> 单击画布创建元素, 比如 方块,圆形,文字,图片
```
   gls.singleClickToFeature(feature, fn)  // 1. 元素 2. 绘制完的回调函数
```
> 连续点击画布从创建线性元素,比如Line
```
   gls.continuousClickToFeature(line, fn) // 1. 元素 2. 绘制完的回调函数
```
> 鼠标按下移动绘制线段,自由画笔
```
   gls.downMoveToFeature(line, fn) // 1. 元素 2. 绘制完的回调函数
```
> 读取剪贴板内容生成文字或图片
```
   gls.clipboardToFeature()
```
> 拖拽图片到画布去创建图片元素
```
   gls.dropToFeature()
```
> 根据传入的属性去创建一个元素
```
   gls.createFeature(props)  1. 元素用到的属性
```
> 修改元素的某些属性
```
   gls.modifyFeature(feature, props)  1. 目标元素, 2.要修改的属性
```
> 复制或读取元素属性
```
   gls.recordFeature(feature, bool) // 1. 目标元素 2. 是否只读取或复制 样式类的属性
```
> 开启或关闭历史记录
```
   gls.enableStack(bool)  // 1. 是否开启
```
> 开启或关闭包围盒控制点
```
   gls.enableBbox(bool) // 1. 是否开启
```
> 开启或关闭区域选择
```
   gls.enableSelectArea(bool) // 1. 是否开启
```
> 开启或关闭橡皮擦
```
   gls.enableEraserPnt(bool) // 1. 是否开启
```
> 保存画布状态
```
   gls.save()
```
> 读取画布状态
```
   gls.loadData() // 1. 是否开启
```
> 开启或关闭区域选择
```
   gls.enableSelectArea() // 1. 是否开启
```
> 加载字体，建议在渲染（draw）之前使用,传入FontFamily对象
```
   gls.loadFont(fontFamily)
```
> 复制元素为图片到剪贴板
```
   gls.copyImageToClipboard(feature, padding) // 1. 目标元素 2. 内边距
```
> 复制元素为svg到剪贴板
```
   gls.copySvgToClipboard(feature, padding)  // 1. 目标元素 2. 内边距
```
> 移动画布
```
   gls.translate(x,y,duration) // 1,2 移动的距离 3.过渡时间
```
> 缩放画布
```
   gls.zoomTo(number, point) // 1. 缩放的大小 2. 以某个点去缩放
```
> 获取画布中心点
```
   gls.getCenterPos() 
```
> 获取点到画布中心点的距离
```
   gls.getCenterDist(point) // 1. 目标点
```
> 设置画布大小
```
   gls.setSize(width, height) // 1. 宽度 2.高度
```
> 获取某些元素的矩形包围盒范围
```
   gls.getFeaturesRange(features) // 1. 目标元素们
```
> 居中,并缩放至所有元素都在canvas范围内
```
   gls.toFitView(features, padding) // 1. 目标元素们 2. 内边距
```
> 画布导出为图片
```
   gls.toImage(isFitView, padding, zoom) // 1. 是否自适应元素们的大小, 2. 内边距 3. 缩放比例(越大越清晰)  2,3只针对isFitView为ture时
```
> 根据相对坐标获取网格坐标
```
   gls.getGridPosByRelativePos(point) // 相对坐标点
```
> 根据网格坐标获取相对坐标
```
   gls.getRelativePosByGridPos(point) // 网格坐标点
```
> 获取某个点周围可吸附的点的距离
```
   gls.getAdsorbPos(point) // 相对坐标点
```

**Feature 类**
> Feature类的属性
```
   Feature.Gls  // GridSystem实例
   Feature.TargetRender // 当前画布实例是哪一个  GridSystem实例 或 MiniMap实例

   .pointArr;   // 组成元素的点的数组

   .fillStyle, strokeStyle, hoverStyle, focusStyle, zIndex, lineWidth, lineCap, lineJoin, opacity, lineDashArr, lineDashOffset;   // 元素的样式属性
   
   .id  // id,元素的唯一标识
   .name  // 元素的name, 元素名字
   .className  // 元素的类名, 常量
   .hidden  // 是否隐藏元素,跳过渲染
   .position  // 元素包围盒的中心点, 一般Rect类型用
   .size  // 元素包围盒的宽高
   .scale  // 元素缩放, [暂未用到]
   .angle  // 元素旋转的角度
   .radius  // 元素的圆角大小, 一般Rect类型用

   .parent  // 元素的父元素
   .children  // 元素的子元素们
   .gls  // GridSystem的实例
   .adsorbTypes  // 移动时吸附规则  "grid", "feature"
   .pntMinDistance  // 元素添加时,俩点之间太近就不添加,设置的最小距离参数
   .pntExtentPerOfBBox  // 元素距离包围盒的上下左右边距的百分比

   .isClosePath  // 元素是否闭合
   .isPointIn  // 鼠标是否在元素上
   .isFocused  // 元素是否是焦点元素
   .isFixedPos  // 元素是否固定位置,不随画布拖动而移动
   .isFixedSize  // 元素是否固定大小, 不随画布缩放而缩放
   .isOutScreen  // 元素是否超出画布范围
   .isOverflowHidden  // 子元素超出元素范围,是否隐藏(裁剪掉)
   .isStroke  // 元素是否绘制边框
   .isShowAdsorbLine  // 元素吸附时是否显示对齐线
   .isOnlyCenterAdsorb  // 元素吸附是否只以包围盒的中心点对其
   .isOnlyHorizonalMove  // 元素是否只能水平方向拖拽(移动)
   .isHorizonalRevert  // 元素是否水平翻转了(用于确定元素左上角的点)
   .isVerticalRevert  // 元素是否垂直翻转了(用于确定元素左上角的点)

   .cbCapture  // 元素是否可被鼠标捕获
   .cbSelect  // 元素是否可被选中
   .cbMove  // 元素是否可被移动
   .cbTransform  // 元素是否可被形变缩放
   .cbTransformChild  // 元素的子元素是否可被形变缩放

```
> 获取某个点周围可吸附的点的距离