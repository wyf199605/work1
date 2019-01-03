# SlidePopover 滑动弹出菜单

### 概述

* slidePopover是一个可以滑动和弹出的操作菜单，菜单本身拥有超过四个按钮时可以滑动；点击下拉按钮时可以弹出菜单详情。
* 该控件基于Component控件进行再封装，通过传入参数设置菜单相关样式

### 控件路径

>  **global/components/ui/slidePopover**

### 兼容性

> 支持移动和PC端

### 继承性

> 继承于控件基类 *Component*

### 结构

- 默认菜单
```typescript jsx
<div className="slide-popover-wrapper">
    <div className="slide-buttons"/>
    <div className="popover-toggle iconfont icon-arrow-down"/>
</div>
```

- 菜单详情
```typescript jsx
<div className="slider-popover-modal-wrapper">
    <div className="slider-title">
        <span>选择按钮</span>
        <div className="slider-popover-modal-toggle iconfont icon-arrow-up"/>
    </div>
    {this.buttonsWrapper = <div className="buttons-wrapper"/>}
</div>
```

### 主要参数

* Component的参数
* ISlidePopoverPara（默认菜单的参数）和ISlidePopoverModal（弹出菜单的参数）:
    - buttons：IButton 

### 示例

```typescript jsx
let slidePopover = new SlidePopover({
    buttons: [
        {
            content: 'button1',
            onClick: () => {
                console.log('click1');
            }
        },
        {
            content: 'button2',
            onClick: () => {
                console.log('click2');
            }
        },
        {
            content: 'button3',
            onClick: () => {
                console.log('click3');
            }
        },
        {
            content: 'button4',
            onClick: () => {
                console.log('click4');
            }
        },
        {
            content: 'button5',
            onClick: () => {
                console.log('click5');
            }
        },
    ]
});
```

### 效果图

![默认菜单](/默认菜单.png)

![弹出菜单](/弹出菜单.png)

### 属性

* 相同：

* 不同：

  * SlidePopover：

    - **private属性**

      + _buttons： 存放所有的button

    - **public属性**

      + modal：SlidePopoverModal，用于存放弹出菜单

  * SlidePopoverModal：

    - **private属性**：
    
      + _isShow：弹出菜单是否显示
      + buttonsWrapper：弹出菜单中的按钮组的包裹dom

### 函数(方法)

* 相同：

  * **protected函数**

    > wrapperInit():
    
    - para： 无
    - 作用：设置控件的包裹dom

  * **private 函数**
  
    > createButtons：
    
    - 根据para创建菜单（默认或弹出）
    
    > initEvents
    
    - 无参数
    - 匿名函数闭包，返回on和off两个函数。分别用于开启或关闭绑定的事件

  * **public 函数**

    > destroy()
    
    - 无参数
    - 销毁该组件

* 不同：

  * SlidePopover：

    - **getter和setter：**

      > buttons：getter获取所有的button；setter初始化时创建默认菜单和弹出菜单

  * SlidePopoverModal：

    - **getter和setter：**

      > isShow：getter获取显示状态；setter控制样式