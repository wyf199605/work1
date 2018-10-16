## 菜单控件
### 概述

Menu类通过对基类[ElementTreeNode](components/nav/ElementTreeNode/README)的继承,实现对一个菜单的封装.
该类的参数与[Tree树形控件](components/nav/Tree/README)的参数都一样,只是增加了topMode与childMode两个额外的参数,topMode规定菜单第一层的展现
状态,childMode规定菜单第一层之外的展现状态.

```js
 let menu = new Menu({
        text : 'virtualNode',
        container : container,
        topMode : 'h',
        childMode : 'h',
        children : [{
                text : '1',
                icon : 'iconClass'
            } ,{
                 text : '2',
                 icon : 'iconClass'
              }]
         })
```
### 相关接口
```js
interface IMenu extends IElementTreeNodePara{
      children?: IMenu[];
      topMode?: string;//模式 v(垂直) h(水平)
      childMode? :string;//模式 v(垂直) h(水平)
}
```

### 构造函数
```js
new Menu(para: IMenu);
```
### 参数
`para`

构造菜单的json对象, 构造函数将根据此参数返回一个菜单
---

### Menu属性

#### 属性设置

`set topMode(topMode: string)`

* 参数: 要设置的当前菜单的第一层模式 'h'(水平模式) 'v'(垂直模式)
* 概述: topMode为当前菜单的第一层展现模式,当前菜单第一层展现模式分为水平与垂直展开两种模式

`get topMode():string`

获取当前菜单第一层展现模式

`set childMode(childMode: string)`

* 参数: 要设置的第一层之外的展现模式 'h'(水平模式) 'v'(垂直模式)
* 概述: childMode为当前菜单的非第一层展现模式,当前菜单非第一层展现模式分为水平与垂直展开两种模式

`get childMode():string`

获取当前菜单非第一层的展现模式

!> 注:topMode与childMode可以交叉使用,即有以下四种形式传参
* 1:
    * `{topMode : 'v',childMode : 'v'}`
    * 概述: 第一层为纵向模式,非第一层也为纵向模式.
* 2:
    * `{topMode : 'v',childMode : 'h'}`
    * 概述: 第一层为纵向模式,非第一层为横向模式.
* 3:
    * `{topMode : 'h',childMode : 'v'}`
    * 概述: 第一层为横向模式,非第一层为纵向模式.
* 4:
    * `{topMode : 'h',childMode : 'h'}`
    * 概述: 第一层为横向模式,非第一层也为横向模式.

