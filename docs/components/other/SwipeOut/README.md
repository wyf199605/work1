## 滑块按钮
### 概述

可以左右拖拽显示功能按钮，点击按钮触发事件

```js
new SwipeOut({
    target: container,
    left: button,
    right: button
})
```

### 相关接口

```js
interface ISwipeOutPara {
    target: HTMLElement;//要添加滑块按钮的元素
    left?: IButton | HTMLElement | (IButton | HTMLElement)[];//左边按钮
    right?: IButton | HTMLElement | (IButton | HTMLElement)[];//右边按钮，左右按钮可同时添加
}
```
left和right可以传入一个HTMLElement，也可以传入`IButton`对象，`IButton`详细请查看`Button`类。

!>使用`SwipeOut`类会改变target内部的结构，但并无太大影响。注：绝对不要对传入的target元素的子元素使用子元素选择器，即`target > child`，请使用后代选择器。

### 构造函数

```js
new SwipeOut(para: ISwipeOutPara)
```

### 参数

`para`

### SwipeOut

#### 实例 (SwipeOut.prototype)

##### 属性

`set left(btn: IButton | HTMLElement | (IButton | HTMLElement)[])`

* 参数：`Button`的参数、或者HTML元素对象（button，a，input），或者包含前两者的数组；
* 概述：用于设置传入元素的左边滑块按钮，可传入数组设置多个并排按钮。

`get left()`

* 参数：无；
* 概述：获取当前滑块左按钮的IButton对象、Element对象或者包含前两者的数组。

`set right(btn: IButton | HTMLElement | (IButton | HTMLElement)[])`

* 参数：`Button`的参数、或者HTML元素对象（button，a，input），或者包含前两者的数组；
* 概述：用于设置传入元素的右边滑块按钮，可传入数组设置多个并排按钮。

`get right()`

* 参数：无；
* 概述：获取当前滑块右按钮的IButton对象、Element对象或者包含前两者的数组。

##### 方法

`destroy(): void`

* 参数：无参数；
* 概述：用于销毁你创建的滑块按钮。


