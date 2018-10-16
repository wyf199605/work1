## 弹出菜单
### 概述

为任意元素添加一小块浮层，用于弹出一个小型菜单。

`Popover`类依赖`Component`类，`Popover`的每项item依赖`PopoverItem`类。

您只需调用`Popover`类，即可初始化完成您的弹出菜单。

```js
let popover = new Popover({
    target: target,
    items: [
        {
            title: 'item1'
        },
        {
            title: 'item2'
        }
    ],
    onClick: (index) => {
        console.log(index);
    }
})
```

### 相关接口


```js
interface IPopoverPara extends IComponentPara{
    items: IPopoverItemPara[];//popover的每个子项
    onClick?: (index:string) => void; //popover点击事件，接收一个参数，每个子项对应的number
    target: HTMLElement; // 点击该元素显示popover
    show?: boolean; //设置默认显示popover与否，默认否；可主动设置show控制popover显示隐藏
    position?: 'auto' | 'up' | 'down' | 'right' | 'left'; // popover方向设置，默认auto；可主动设置方向
    isBackground?: boolean; //遮罩层是否不全透明，默认是
    onClose?: () => void; //popover关闭时触发事件
    animated?: boolean; //是否出现淡入淡出效果，默认是
}
```

popover的子项接口

```js
interface IPopoverItemPara extends IComponentPara{
    name?: string;
    title: string;//子项的内容
    onClick?: EventListener;//子项的点击事件
    disabled?: boolean;//设置子项是否不可点击，默认否
    icon?: string;//设置icon（图标） class，默认无
}
```

### 构造函数

```js
new Popover(para: IPopoverPara);
```

### 参数
`para`

弹出菜单的json对象，构造函数将根据此参数初始化一个弹出菜单。

### Popover实例

#### 实例 (Popover.prototype)

##### 属性

`set show(e: boolean)`

* 参数：是否显示弹出菜单；
* 概述：用于设置弹出菜单的显示隐藏，`true`为显示，`false`为隐藏。

`get show()`

获取当前弹出菜单是否显示，返回布尔值。

!>注：内部`Popover`类控制显示、隐藏，都是通过设置show的值来实现的。

`set onClick(e: (index:string) => void)`

* 参数：设置点击弹出菜单的子项后，触发的函数；
* 概述：该参数方法返回一个参数index，index为点击的对应子项的data-index的值。

`get onClick()`

获取当前弹出菜单的点击事件，返回当前事件。

`set onClose(e: () => void)`

* 参数：设置关闭弹出菜单后，触发的函数；
* 概述：关闭弹出菜单后触发。

`readonly popoverItems()`

获取当前popover对象子项实例化对象数组。

`set items(e: IPopoverItemPara[])`

* 参数：弹出菜单子项类配置参数的集合；
* 概述：用于设置弹出菜单，每项子项的内容、事件、图标、是否可点击。

`get items()`

获取弹出菜单子项类配置参数的集合；

!>注：通常子项在`Popover`初始化就完成配置，无需后续设置。

`set position(position: 'auto' | 'up' | 'down' | 'right' | 'left')`

* 参数：可选值`'auto' | 'up' | 'down' | 'right' | 'left'`；
* 概述：用于设置弹出菜单的方向，`auto`为默认值，无需设置。`auto`会根据当前弹出菜单的位置，判断弹出菜单的方向。

`get position()`

获取当前弹出菜单的方向值。

##### 方法

`itemAdd(e: IPopoverItemPara): void`

* 参数：要添加的子项配置；
* 概述：用于在`Popover`实例化后，添加后续的子项，添加必须填入正确的配置，否则将无法正确添加。

`itemRemove(index: number): boolean`

* 参数：要删除的子项的对应序号；
* 概述：删除对应`data-index`的number的子项，即使填入不正确的序号，也不会报错。删除成功返回`true`，删除失败(即无改子项存在，或改子项已删除)，则返回`false`。

`destroy(): void`

* 参数：无参数；
* 概述：用于销毁你创建的弹出菜单。