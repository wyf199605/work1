## 遮罩层

### 概述

用于创建一个防止点击的遮罩层，通过调用Mask类来创建简单的遮罩层。

```js
let mask = new Mask({
    background: true,
    onClick: (e) => {
        console.log(e);
    }
})
```

### 相关接口

```js
interface IMaskPara extends IComponentPara {
    background: boolean | string;//显示透明与否的遮罩层
    onClick?: EventListener;//点击遮罩层触发的事件
}
```

### 构造函数

```js
new Mask(para: IMaskPara);
```

### 参数

`para`

遮罩层的json对象，构造函数将根据此参数初始化一个遮罩层。

### Mask实例

#### 实例(Mask.prototype)

##### 属性

`set background(e: boolean | string)`

* 参数：设置遮罩的颜色；
* 概述：background可设置的类型为boolean和string，设置为false显示全透明的遮罩，true显示半透明的遮罩，也可传入string类型设置颜色。

`get background()`

获取当前遮罩层的_background值。

`set onClick(e: EventListener)`

* 参数：传入一个EventListener参数
* 概述：点击遮罩层后，会触发EventListener。

`get onClick()`

获取当前遮罩层的事件函数。

##### 方法

`destroy()`

* 参数：无参数；
* 概述：用于销毁创建的遮罩层。