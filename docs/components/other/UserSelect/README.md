## 鼠标拖选范围控制
### 概述

可以控制鼠标拖动可选文本的选中范围不超过指定范围。

```js
new UserSelect({
    target: container,
    className : string
})
```

### 相关接口

```js
interface UserSelectPara{
    target : HTMLElement;//限制可选的范围
    className? : string;//可添加类到target上
}
```
可通过给className设置，给target添加自定义类来控制限制范围内的其他元素不可选。

### 构造函数

```js
new UserSelect(para: UserSelectPara)
```

### 参数

`para`

### UserSelect

#### 实例 (UserSelect.prototype)

##### 方法

`on(): void`

* 参数：无参数；
* 概述：用于开启可选范围限制。

`off(): void`

* 参数：无参数；
* 概述：用于关闭可选范围限制。