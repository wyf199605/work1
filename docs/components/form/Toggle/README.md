## 开关按钮
### 概述

`Toggle`类实现了对开关控件的封装，支持移动端点击和滑动两种手势对开关进行操作；

默认开关控件不带任何文字，需要自己设置，打开时为绿色背景。

```js
let toggle = new Toggle({
    container: container,
    onClick(isChecked){
        console.log(isChecked);
    },
    custom: {
        check: 'ON',
        noCheck: 'OFF'
    }
});
```

### 相关接口

```js
interface ITogglePara extends ComPara{
    checked?: boolean; //设置开关是否选中
    custom?: ICustom;   //设置开关选中与未选中的文字
    size?: number;  //设置开关控件的大小
    onChange?(isChecked: boolean): void; //当点击或滑动开关时触发
    onSet?(isChecked: boolean): void;
    container: HTMLElement; //放置开关控件的元素
    disabled?: boolean; //设置开关是否可点击
}
```

`ICustom`接口

```js
interface ICustom {
    check?: string;//开关开启时的文字
    noCheck?: string;//开关关闭时的文字
}
```

### 构造函数

```js
new Toggle(para: ITogglePara);
```

### 参数

`para`

### Toggle

#### 实例 (Toggle.prototype)

##### 属性

`set checked(e: boolean)`

* 参数：布尔值；
* 概述：用来设置开关控件的状态，开启为true，关闭为false。

`get checked()`

* 概述：获取当前开关控件的状态。

`set disabled(e: boolean)`

* 参数：布尔值；
* 概述：设置当前开关控件是否不可点击，true为不可点击，false为可点击。

`get disabled()`

* 概述：获取当前开关控件是否不可点击的状态。

`set custom(obj: ICustom)`

* 参数：继承`ICustom`接口的对象；
* 概述：设置开关控件开启与关闭时的文字样式，obj.check为开启时的文字，obj.noCheck为关闭时文字。

`get custom()`

* 概述：获取当前开关控件的文字样式的对象。

`set onChange(e: (isChecked: boolean) => void)`

* 参数：function；
* 概述：点击或滑动当前开关触发的事件，该函数接收一个参数，即当前开关控件的状态。

`get onChange()`

* 概述：获取当前开关控件的onChange事件。

`set size(num: number)`

* 参数：number；
* 概述：用于设置当前开关控件的高度，其宽度随高度改变而改变。

`get size()`

* 概述：获取当前开关控件的大小，即高度。

##### 方法

`destroy(): void`

* 参数：无；
* 概述：用于销毁你创建的`Toggle`。