# ActionSheet 操作菜单

### 概述

* actionSheet是一个从屏幕下方弹出的操作菜单，类似于微信的分享菜单（小程序菜单）。
* 该控件基于Modal控件进行再封装，通过传入参数设置菜单相关样式

### 控件路径

>  **global/components/ui/actionSheet**

### 兼容性

> 仅支持移动端

### 继承性

> 继承于控件基类 *Modal*

### 结构

```typescript jsx
<div className="action-sheet-wrapper">
    <div className="action-sheet-buttons">
        <div className="btn-wrapper">
            <i></i>
            <div className="btn-content">content1</div>
        </div>
    </div>
    <div className="action-sheet-cancel">取消</div>
</div>
```
* 注：对于div.action-sheet-wrapper，里面有多个btn-wrapper（数量取决于**传入的buttons**）

### 主要参数

* Modal（Component）的参数
* IActionSheet:
    * buttons：IActionSheetButton 菜单项数组（必须）
        + content：菜单项名称（必须）
        + icon：图标
        + onClick：点击事件（必须）

### 示例

* 注： 
  * actionSheet默认设置**isShow为false**，即初始时不会弹出
  * 菜单默认每行**3**个按钮，**超过9个**时左右滑动显示

```typescript jsx
let actionSheet = new ActionSheet({
    buttons: [
        {
            content: 'content1',
            onClick: () => {
                console.log('click 1');
            }
        },
        {
            content: 'content2',
            onClick: () => {
                console.log('click 2');
            }
        }
    ]
});
```

### 效果图

![效果图](/actionSheet(9).png)

![效果图](/actionSheet(大于9).png)

### 属性

##### private 属性

* actionSheetWrapper：包装dom元素
* buttons：所有的button

### 函数(方法)

##### private 函数

> 1. createActionSheet(para: IActionSheet)

* para:  就是传入的参数
* 作用： 初始化控件

> 2. initEvents

* 无参数
* 匿名函数闭包，返回on和off两个函数。分别用于开启或关闭绑定的事件

##### public 函数

> 1. destroy()

* 无参数
* 销毁该组件