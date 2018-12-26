# ContextMenu 点击弹出菜单(类似右键菜单)

### 概述

> contextMenu是类似于右键菜单的弹出菜单，可以但不局限于右键弹出，也可点击弹出
> 该控件基于绝对定位实现位置的变换，通过用户点击行为得到点击位置，进而设置控件位置

### 控件路径

>  **global/components/ui/actionSheet**

### 继承性

> 继承于控件基类 *Component*

### 结构

```
<div class="g-context-menu" style="left: 441px; top: 22px;">
  <div class="btn-wrapper" data-index="0">
    <i class="bg-download fg-white appcommon app-xiazaidaobendi"></i>
    <div class="btn-content">下载至本地</div>
  </div>
</div>
```

### 示例

##### 初始化
* buttons 菜单项数组 content:菜单项名称,icon:图标,onClick:点击时触发的函数
* container: 父容器元素

```
new ContextMenu({
      buttons: [
        {
          content: '下载至本地',
          icon: 'bg-download fg-white appcommon app-xiazaidaobendi',
          onClick: () => {
              // 点击事件
          }
        }
      ],
      container: this.wrapper
})
```


##### 触发点击事件设置位置

* x: 绝对定位中的left
* y: 绝对定位中的top

```
contextMenu.setPosition({
   x: number,
   y: number
});
```


### 属性

##### private 属性

* buttons 菜单项参数数组，用于记录所有菜单项的参数

##### public 属性 

* isShow 控制菜单的显示和消失

### 函数(方法)

##### private 函数

> 1. initContextMenu(para: IContextMenu)

* para: 菜单参数，包含buttons和container等
* 作用： 初始化菜单,创建菜单选项

> 2. initEvents

* 无参数
* 匿名函数闭包，返回on和off两个函数。分别用于开启或关闭绑定的事件

##### public 函数

> 1. setPosition({x,y}:point)

* para:{x,y} 一个含有x和y属性的对象，分别对应控件的x坐标和y坐标，即需要设置的left和top
* 用于改变控件的位置，使其显示在用户点击的地方
