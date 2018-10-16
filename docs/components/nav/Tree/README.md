## 树控件
### 概述
Tree类继承了[ElementTreeNode](components/nav/ElementTreeNode/README)，实现对树控件更多的封装，
如： checkBox的支持。

```js
let tree = new Tree({
    text : 'virtualNode',
    container : container,
    isAccordion : true,
    isShowCheckBox: true,
    checked: true,
    disableCheckBox: false,
    children : [{
        text : '1',
        icon : 'iconClass'
    }, {
        text : '2',
        icon : 'iconClass'
    }]
})

//重新赋值,重新设置checked属性,tree会根据新的属性作出相应的改变
tree.checked = false;
```
### 相关接口
[IElementTreeNodePara](components/nav/ElementTreeNode/README)
```js
interface ITreePara extends IElementTreeNodePara{
    isShowCheckBox? : boolean; //是否有checkBox
    checked?: boolean; // 是否被选中
    disableCheckBox?: boolean; // 是否禁用checkBox
    dblclickOpen?: boolean; // 是否双节打开
    children?: ITreePara[]; // 子元素
    ajax?:  IElementTreeAjaxHandler<Tree, ITreePara>; // ajax
}
```

### 构造函数
```js
new Tree(para: ITree);
```
### 参数
`para`:

* ##### `isShowCheckBox`(可继承):
    * 类型: `boolean`
    * 默认值: `false`
    * 是否显示checkBox
* ##### `checked`(可继承):
    * 类型: `boolean`
    * 默认值: `false`
    * 是否被选中, 此参数与有没有checkbox无关, 只是一种状态.没有checkbox也可以是checked状态
* ##### `disableCheckBox`:
    * 类型: `boolean`
    * 默认值: `false`
    * 是否禁用checkBox
* ##### `dblclickOpen`:
    * 类型: `boolean`
    * 默认值: `true`
    * 是否双节打开, 默认情况, 双击触发非叶子节点的`onExpand`, 和叶子节点的`onOpen`, 设置为false则改为单击触发
* ##### `toggleSelect`(可继承):
    * 类型: `boolean`
    * 默认值: `false`
    * 连续点击时是否切换选中状态, 默认多次点击是不会切换选中状态.

---

### Tree原型(Tree.prototype)

#### 属性
`isShowCheckBox: boolean`(可继承):

是否显示checkBox

`checked: boolean`(可继承):

是否被选中

`disableCheckBox: boolean`:

是否禁用checkBox

#### 方法
`getCheckedNodes: this[]`:

返回当前所有选中的节点