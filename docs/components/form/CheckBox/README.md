## 多选框控件
### 概述

`CheckBox`通过对基类`BasicCom`继承，实现对多选框的功能的封装，提供多个接口，实现多种功能。

```js
let checkBox = new CheckBox({
    container: container,
    text: 'test',
    disabled: false,
    onClick(isChecked){
        console.log(isChecked);
    },
    clickArea: 'all'
})
```

### 相关接口

```js
interface ICheckBoxPara extends ComPara {
    container: HTMLElement; //提供存放多选框的元素
    className?: string; //为container添加className
    text?: string; //多选框的文字内容
    status?: number; //多选框选择状态：0未选中，1选中，2半选中。默认未选中
    size?: number  //多选框的大小
    onClick?(isChecked: boolean): void; //点击多选框触发的事件
    clickArea?: 'all' | 'box'; //多选框的点击区域，'all'代表整个container，'box'代表方框，默认'all'。
    onSet?(isChecked: boolean): void;
    custom?: ICustomCheck; // 定制多选框的样式
    disabled?: boolean;  //设置多选框是否不可点击，默认false
}
```

定制多选框custom的接口`ICustomCheck`

```js
interface ICustomCheck{
    check?: string; //选中
    noCheck?: string; //未选中
    indeterminate?: string; //半选中
}
```

### 构造函数

```js
new CheckBox(para: ICheckBoxPara)
```

### 参数
`para`

### CheckBox实例

#### 实例 (CheckBox.prototype)

##### 属性

`set checked(checked: boolean)`

* 参数：布尔值；
* 概述：用于设置多选框的两种状态，选中为true，为选中为false，默认false。

`get checked()`

* 概述：获取多选框的状态，返回布尔值。

`set status(status: number)`

* 参数：状态值，0、1、2；
* 概述：用于设置多选框的三种状态，0为为选中，1为选中，2为半选中，默认0；

`get status()`

* 概述：获取多选框的状态，返回数字类型。

`set size(size: number)`

* 参数：多选框的大小，数字类型；
* 概述：用于手动设置多选框的大小，默认样式不设置。

`get size()`

* 概述：获取多选框的大小数值。

`set disabled(e: boolean)`

* 参数：布尔值；
* 概述：用于设置多选框是否不可点击，默认可点击。

`get disabled()`

* 概述：获取多选是否不可点击状态，返回布尔值。

`set onClick(e : (isChecked: boolean) => void)`

* 参数：点击checkbox触发的方法，返回一个参数；
* 概述：设置点击`CheckBox`是触发的事件，该事件返回一个参数`isChecked`，代表当前`CheckBox`的状态。

`get onClick()`

* 概述：获取当前`CheckBox`的点击事件。

`set custom(obj: ICustomCheck)`

* 参数：定制CheckBox样式的接口，详情可以查看相关接口的`ICustomCheck`；
* 概述：用于自己定制CheckBox的样式，`ICustomCheck`可传入三个属性来改变`CheckBox`的样式：
    * check代表选中，传入string类型；
    * noCheck代表未选中，传入string类型；
    * indeterminate代表半选中，传入string类型；

`get custom()`

* 概述：获取当前定制样式对象。

##### 方法

`destroy(): void`

* 参数：无；
* 概述：用于销毁你创建的`CheckBox`。