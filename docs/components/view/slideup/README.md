## 上滑框
### 概述
用于存放内容的可收缩框。
### 代码示例
```js
   
   new SlideUp({
       container : container,
       contentEl : body,
       contentTitle : '查询记录',
       width : 300,
       isShow : true,
       className : 'asynQuery'
   });
```
### 相关接口
```js
    interface ISlideUpPara extends IComponentPara{
        position?: string; // 不可更改
        width?: number; // 设置组件宽度
        height?: number;  // 设置内容高度，不包括title
        text?: string; // 固定条显示文字
        contentTitle?: string;
        contentEl?: HTMLElement | DocumentFragment;
        contentHasClose?: boolean // 默认false
        isShow?:boolean;  // 是否展开
    }

```

### 构造函数 

```js
new SlideUp(para: ISlideUpPara);
```

### SlideUp实例

#### 实例 (SlideUp.prototype)

##### 属性

`set width(width : number)`

* 参数：显示框的宽度；
* 概述：用于设置组件的宽度。

`get width()`

* 概述：获取当前组件的宽度。

`set height(height : number)`

* 参数：内容的高度。
* 概述：用于设置显示内容的高度，溢出滚动。

`get height()`

* 概述：获取显示内容的高度。

`set text(text : string)`

* 参数：固定条显示信息。
* 概述：用于设置固定条显示文字。

`get text()`

* 概述：获取固定条的文字。

`set contentTitle(title : string)`

* 参数：标题文字。
* 概述：用于设置标题文字，若不传，则无标题。

`get contentTitle()`

* 概述：获取标题文字。

`set contentEl(contentEl : HTMLElement)`

* 参数：显示内容。
* 概述：用于设置主体内容。

`get contentEl()`

* 概述：获取内容元素。

`set button(button : Button)`

* 参数：按钮。
* 概述：用于设置按钮，这里传递的是Button组件。

`get button()`

* 概述：获取按钮元素。

`set show(isShow : boolean)`

* 参数：是否展开。
* 概述：用于控制上滑框的展开或收缩。 

`get show()`

* 概述：获取上滑块状态是否展开。  



