## 树控件
### 概述
Tree类实现对树的封装,提供了对树的构造功能,通过用户传递的数据，转化为树的结构

通过对基类ElementTreeNode的继承,Tree类可以通过(tree.属性)的方式为树节点某个属性重新赋值
Tree中第一个节点的根节点,在实际界面中不会显示出来,只会显示children中的节点

```js
 let tree = new Tree({
        text : 'virtualNode',
        container : this.para.menu,
        isAccordion : true,
        children : [{
                text : '1',
                icon : 'iconClass'
            } ,{
                 text : '2',
                 icon : 'iconClass'
              }]
         })

  //重新赋值,重新设置isAccording属性,tree会根据新的属性作出相应的改变
     tree.isAccordion = false;
```
### 相关接口
```js
interface IElementTreeNodePara{
    text?: string;//当前树节点文本内容
    children?: IElementTreeNodePara[];//子节点
    disabled?: boolean;//节点是否是禁止状态
    selected?: boolean;//节点是否选中
    isAccordion?: boolean;//节点的子节点是否为手风琴模式
    icon?: string;//节点的图标
    expand? : boolean;//节点的展开状态
    container? :HTMLElement;//节点的父容器 只有根节点需要传该值
    selection? :string;//子项选中方式 分为单选,多选
    ajax?: {//节点点击之后请求子节点的ajax请求函数
        fun?(tnode: ElementTreeNode, callback: (para: IElementTreeNodePara[]) => void)
    };
    onClick ?(e,node): void;//节点点击之后的操作
}

interface ITree extends IElementTreeNodePara{
    isCheckBox? : boolean; //是否显示checkBox
    theme? : string;//节点主题
    children?: ITree[]//子节点
}
```

### 构造函数
```js
new Tree(para: ITree);
```
### 参数
`para`

构造树的json对象, 构造函数将根据此参数返回一颗树.
---

### Tree实例

#### 实例方法 (Tree.prototype)

`set children(children: Array<Tree>)`

* 参数: 要设置的子节点
* 概述: 当前children属性是将子节点的container属性设置为当前节点的childrenEl节点,并且将所有的子节点添加进当前节点的childrenEl节点中.

`get children()`

获取当前节点的子节点

`set expand(expand: boolean)`

* 参数: 要设置的打开或者关闭状态,默认为false(关闭状态)
* 概述: expand属性针对本身,当设置为true的时候则当前节点若有子节点则为打开状态，否则默认为关闭状态

`get expand()`

获取当前节点的打开状态

`set selected(selected : boolean)`

* 参数: 要设置的当前节点的选中状态,默认为false(不选中状态)
* 概述: selected属性针对本身,当设置为true的时候则当前节点为选中状态,否则为未选中状态

`get selected()`

获取当前节点的选中状态

`set isCheckBox(isCheckBox : boolean)`

* 参数: 设置当前节点是否包含checkBox,默认为false(不包含checkBox)
* 概述: isCheckBox当设置为true的时候则当前节点包含checkBox,并且默认为当前节点的所有子节点也添加checkBox,若当前节点的子节点
中有节点明确指定为false,则当前节点的该子节点不设置checkBox.

`get isCheckBox()`

* 概述:获取当前节点是否包含CheckBox,如果获取的结果不为false,则当前节点包含checkbox

`set isAccordion(isAccordion : boolean)`

* 参数: 要设置的当前节点的手风琴状态,默认为false
* 概述: isAccordion属性针对当前节点的子节点,当该属性为true时,则该节点的所有子节点在同一个时刻只能展开一个,当展开手动一个子节点的时候,
若当前子节点有展开的节点,则先关闭已展开的节点,再展开当前要展开的节点.

`get isAccordion()`

获取当前节点的手风琴状态

`set text(text: string)`

* 参数: 当前节点的文本内容,默认为空
* 概述: 当前节点的文本

`get text()`

获取当前节点的文本内容

`set icon(icon: string)`

* 参数:设置当前节点的图标,默认为空
* 概述:icon为当前节点图标的class名,默认图标用``<i>``节点

`get icon()`

获取当前节点的图标类名

`set selection(selection : string)`

* 参数:设置当前节点子节点的选中类型,默认为多选(multi),可选参数值为**multi**,**single**
* 概述:该属性针对当前节点的子节点,若该属性为multi则当前节点的子节点可以有多选的状态,
若为single,则当前节点的所有子节点在同一时刻只能有一个节点被选中

`get selection()`

获取当前节点子节点的选中类型

`set theme(theme : string)`

* 参数:设置当前节点的主题,即为当前节点的展开图标类型 upDown(上下箭头) addMinus(加减号) 默认值为upDown
* 概述:theme为当前节点的展开关闭图标类型,当为upDown时为上下箭头类型,当为addMinus时候为加减号类型

`get theme()`

获取当前节点的展开关闭图标类型

`set container(el : HTMLElement)`

* 参数:设置当前节点的容器,即设置盛放当前节点的dom元素
* 概述:该属性只需要在new Tree时候传进来,即将当前树放进哪个节点,children中不需要传container属性,
children中的container属性在Tree类中已经动态初始化,所以children中不需要传container属性.

`get container()`

获取盛放当前节点的容器
