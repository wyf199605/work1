## Component控件基层类
### 概述
`Component`属于抽象类，它本身不能进行实例化，只能被global中的控件继承。

主要对控件进行统一管理，定义了子类必须实现的方法及属性等，也可对Component中内置的方法、属性进行重写。

继承该类的组件可以使用JSX来实例化对象。

```js
class Button extends Component{}

let btn = <Button container={null} className={'button'}/>
```

### 相关接口

```js
interface IComponentPara {
    container?: HTMLElement; // wrapper放置的位置
    className?: string; // 添加class
    data?: obj; // 用于存放json数据
    disabled?: boolean; // 是否禁用
    tabIndex?: boolean; // 是否设置tabIndex属性，同时为该组件添加键盘事件`keyHandle`
    tabIndexKey?: number; //
    custom?: any; // 用于存放任意数据
}
```

### 构造函数
无

### Component实例

#### 实例

#### 抽象方法
抽象方法为继承该类**必须**实现的方法

`wrapperInit(para): HTMLElement`

* 参数：para为实例化该组件时的参数；
* 概述：创建存放该组件的最外层元素（可使用JSX），即该组件所有内容全部存放在`wrapperInit`创建的元素中。

#### 属性

`set tabIndex(tabIndex: boolean)`

* 参数：布尔值；
* 概述：用于设置wrapper的tabIndex属性，并添加键盘事件。

`get tabIndex(): boolean`

获取当前是否设置了`tabIndex`。

`get wrapper(): HTMLElement`

获取当前组件的`wrapper`。

`set className(str: string)`

* 参数：字符串；
* 概述：设置当前组件`wrapper`的`className`。

`get className(): string`

获取当前组件`wrapper`的`className`。

`set disabled(e: boolean)`

* 参数：布尔值；
* 概述：设置当前组件是否禁用。

`get disabled(): boolean`

获取当前组件是否禁用。

`public data: obj`

获取或设置组件的json数据。

`public custom: any`

获取或设置组件自定义数据（任意类型）。

`get eventHandlers(): objOf<Function[]>`

获取通过`on()`方法绑定在该组件上的的所有事件。

`set container(container: HTMLElement)`

* 参数：DOM元素；
* 概述：用于更改wrapper的容器。

`get container(): HTMLElement`

获取wrapper的容器。

#### 方法

`on(name: string, handler: Function): void`

* 参数：`name`事件名称，`handler`绑定的事件；
* 概述：为该组件绑定一个自定义的事件，事件存放在`eventHandlers`中。

`off(name: string, handler?: Function): void`

* 参数：`name`解绑的事件名称，`handler`解绑的事件；
* 概述：根据事件名称和事件，解除绑定在该组件上的事件。

`trigger(type: string, ...para): void`

* 参数：`type`为触发的事件名称，para为触发该事件时附带的参数；
* 概述：根据type来主动触发绑定在组件上的事件，可带自定义参数。

`isFocused(): boolean`

* 参数：无参数；
* 概述：判断当前组件wrapper是否是焦点元素。

`destroy(): void`

* 参数：无参数；
* 概述：销毁当前组件。

