# 网格系统文档

### 基本使用方法

#### 实例化网格系统对象
```
    let canvas = document.querySelector("#myCanvas");
    let gls = new GridSystem(canvas);
```
> 源代码中用private修饰的方法表示私有，系统自用的，使用时可以忽略不看
<br>
#### gls实例对象的API
<br>

> 用于绘制画布以及画布内的元素

```
   gls.draw()
```

> 限制拖拽范围,传入一个数组，数组有四个数值分别是上，右，下，左
```
   gls.setPageSliceByExtent([0,0,0,0])
```

> 根据相对坐标获取像素坐标,传入一个数组，数组有两个数值分别是x,y。返回一个数组坐标
关于相对坐标与绝对坐标解释：
相对坐标是实例化后用于设置元素的位置，这个位置是相对于网格的原点的，是开发中所使用的
绝对坐标是源代码内部渲染到画布上所用到的坐标，是相对于canvas左上角的，所以开发时基本不用关心（绝对坐标我也会表述成绝对坐标）
```
   gls.getPixelPos([0,0])
```
> 根据像素坐标获取相对坐标,传入一个数组，数组有两个数值分别是x,y。返回一个数组坐标
```
   gls.getRelativePos([0,0])
```
> 获取像素大小,传入一个数字。返回一个数字
```
   gls.getRatioSize(0)
```
> 获取相对大小,传入一个数字。返回一个数字
```
   gls.getOriginalSize(0)
```
> 获取像素坐标以及像素长度,传入一个对象，对象包含x,y,width,height。返回同样的对象
```
   gls.getPixelPosAndWH({x:0, y:0, width: 0, height: 0})
```
> 获取相对坐标以及相对长度,传入一个对象，对象包含x,y,width,height。返回同样的对象
```
   gls.getRelativePosAndWH({x:0, y:0, width: 0, height: 0})
```
> 向画布中添加实例化后的元素MyText,Rect....传入一个元素
```
   let feature = new Feature(...)
   gls.addFeature(feature)
```
> 从画布中删除指定元素，传入一个元素
```
   gls.removeFeature(feature)
```
> 通过元素的id从画布中删除元素，传入一个元素的id
```
   gls.removeFeatureById(id)
```
> 加载字体，建议在渲染（draw）之前使用,传入FontFamily对象
```
   gls.loadFont(fontFamily)
```
> 获得点与canvas中心的距离,传入一个点坐标，返回一个x,y的距离值
```
   gls.getCenterDist(point)
```
> 获得canvas中心点
```
   gls.getCenterPoint()
```
> 将画布缩放至指定大小。第一个参数缩放等级， 第二个参数传一个数组坐标，以该点作为中心点缩放
```
   gls.zoomTo(0)
```
> 移动画布使元素居中，传入一个元素
```
   gls.toCenter(feature)
```
> 将画布移动至指定坐标， 第一个参数坐标，第二个参数移动的过渡时间
```
   gls.movePageto([x,y], 0)
```
> 判断某个网格坐标内有没有元素
```
   gls.hasFeatureInGridCoord([x,y], 0)
```
> 根据鼠标（像素）坐标获取网格坐标
```
   gls.getGridCoord(0,0)
```
> 根据网格坐标获取相对坐标
```
   gls.getPosByGridCoord(0,0)
```
> 判断某个网格坐标内有没有元素
```
   gls.hasFeatureInGridCoord([x,y], 0)
```
> 获取元素的坐标大小以及边界值信息，第一个参数传入feature元素, 第二个参数传布尔值, true表示获取像素坐标大小以及上下左右边界坐标， false则表示获取的是相对值
```
   gls.getEdgePoints(feature, false)
```
> 判断元素有没有在画布外面
```
   gls.hasOutScreen(feature)
```
> 开启或关闭历史记录
```
   gls.enableStack(true)
```
> 开启或关闭历史记录,用于编辑时的撤销恢复
```
   gls.enableStack(true)
```
> 撤销一步
```
   gls.undo()
```
> 恢复一步
```
   gls.restore()
```
> 根据canvas宽高跟新宽高属性
```
   gls.updateWH()
```
> 改变canvas画布大小
```
   gls.changeSize(0,0)
```
> 通过单击创建元素，传入一个你要创建元素
```
   gls.click2DrawByClick(feature)
```
> 通过连续点击创建元素，传入一个你要创建元素，一般用于创建多点线段
```
   gls.click2DrawByContinuousClick(feature)
```
> 通过连续移动创建元素，传入一个你要创建元素，比如自由绘制线段（画笔）
```
   gls.click2DrawByMove(feature)
```
> 获取传入元素的所有点坐标，第一个参数设置返回值的格式
```
   gls.getAllVertices(boolean, features)
```
> 传入元素，找出这些元素组成的矩形上下左右最大值最小值，第二个参数设置返回值是像素坐标还是相对坐标
```
   gls.getFeaturesRange(features, boolean)
```
> 传入元素组成的矩形范围，让他们整体居中,并缩放至所有元素都在canvas范围内，第二个参数是pandding值，留出边缘的空隙距离
```
   gls.toFitView(features, 0)
```