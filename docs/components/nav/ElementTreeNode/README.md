## ElementTreeNode 基于DOM的树类
### 概述
ElementTreeNode是一个基于DOM表现层的一个抽象树控件，用于给各种树形控件提供基础的方法与操作；

包括选中、单选多选、展开、文字、图标、手风琴效果等的设置；

### 继承关系

* 父类：[TreeNodeBase](components/basic/treeBase/README);
* 子类：[Menu](components/nav/Menu/README)，[Tree](components/nav/Tree/README)

### 实例
```js
// 一般不直接使用此类
let tree = new ElementTreeNode({
    expand: true,
    isLeaf: false,
    container: document.body,
    ajax: (node) => {
        return Ajax.fetch(node.content.url).then(result => {
            return result.resopnse
        })
    }
});
```

### 相关接口
[IBasicTreePara](components/basic/treeBase/README)
```js
// 树初始化接口
interface IElementTreeNodePara extends IBasicTreePara{
    text?: string; // 文字
    children?: IElementTreeNodePara[]; // 子节点
    disabled?: boolean; // 是否禁用
    selected?: boolean; // 是否选中
    multiSelect? :string; // 子项是多选还是单选
    onlyLeafSelect?: boolean; // 只有叶子节点可以选中默认false
    isVirtual?: boolean; // 是否是虚拟节点
    isAccordion?: boolean; // 子项是否手风琴效果
    icon?: string; // 图标
    expand?: boolean; // 是否展开
    isLeaf?: boolean; // 是否是叶子节点
    container? :HTMLElement; // 容器
    ajax?: IElementTreeAjax<ElementTreeNode, IElementTreeNodePara>;// ajax
}

// 树ajax加载函数接口
interface IElementTreeAjaxHandler<T, K>{
    // 触发ajax时提供触发的节点，接收一个promise对象, 将参数传到promise中
    (tnode: T): Promise<K[]>;
}

// ajax参数接口, 可以是函数或者false, 不传的话则向上继承, 传false表示不继承,不执行ajax.
type IElementTreeAjax<T extends ElementTreeNode, K extends IElementTreeNodePara> = IElementTreeAjaxHandler<T, K> | false;
```

### 构造函数
```js
new ElementTreeNode(para: IElementTreeNodePara);
```

参数 para:
* ##### `text`:
    * 类型: `string`
    * 显示在节点上的文字
* ##### `icon`:
    * 类型: `string`
    * 节点的图标, 是一个类名
* ##### `disabled`(可继承):
    * 类型: `boolean`
    * 默认值: `false`
    * 是否禁用
* ##### `selected`:
    * 类型: `boolean`
    * 默认值: `false`
    * 是否选中,
* ##### `multiSelect`(可继承):
    * 类型: `string`
    * 默认值: `false`
    * 子项是多选还是单选;
* ##### `onlyLeafSelect`(可继承):
    * 类型: `boolean`
    * 默认值: `false`
    * 是否只有叶子节点可以选中
* ##### `children`:
    * 类型: `IElementTreeNodePara[]`
    * 子节点参数
* ##### `isVirtual`:
    * 类型: `boolean`
    * 默认值: !ElementTreeNode.prototype.parent(), 判断是否有父节点
    * 是否是虚拟节点, **每棵树都有自己的根节点, 但在大多数界面展示的情况下, 显示出来的树的第二层节点, 根节点是隐藏的, 这个隐藏的节点称为虚拟节点**, (一般无需设置此值)
* ##### `isAccordion` (可继承):
    * 类型: `boolean`
    * 默认值: `false`
    * 子项是否手风琴效果，手风琴效果的意思是展开一项的时候，其他同级的则关闭，当前只能展开一项
* ##### `expand`:
    * 类型: `boolean`
    * 默认值: `false`
    * 是否展开
* ##### `isLeaf`:
    * 类型: `boolean`
    * 默认值: tools.isEmpty(para.children)
    * 是否是叶子节点, 一般用来控制是否显示展开图标, 此值为false时,不完全代表节点有子元素, 也代表节点可能会(即将)有子元素, 所以如果此值设置会false, 就算子元素为空, 也会出现展开图标, 点击会触发ajax加载;
* ##### `container`:
    * 类型: `HTMLElement`
    * 树的容器, 只有跟节点能设置此值
* ##### `ajax`(可继承):
    * 类型: `IElementTreeAjax<this, IElementTreeNodePara>`
    * ajax参数接口, 可以是函数或者false, 不传的话则向上继承, 传false表示不继承,不执行ajax;
       如果是函数, 控件本身不提供ajax功能, 需要在ajax参数里面自己实现, 设置此函数后, 会在特定的情况触发此函数.

       触发条件, 设置expand时判断:
       ```js
       this.isLeaf && this.ajax && !this.disabled && this.expand && tools.isEmpty(this.children)
       ```
        * 参数 node: 当前哪个节点触发了ajax请求
        * 返回值 Promise<IElementTreeNodePara>: 触发ajax后, 将初始化参数(IElementTreeNodePara[]) 类型传入其中

!> **可继承**表示如果子节点如果未设置此参数，则往上查找父元素的此参数作为自己的参数；

### ElementTreeNode实例 (ElementTreeNode.prototype)

#### 实例属性

`disabled: boolean`

是否禁用

`selected: boolean`

是否选中

`expand: boolean`

是否展开

`text: string`

设置，获取文本内容

`icon: string`

显示的图标class类

`isAccordion:boolean`

是否时手风琴效果

`multiSelect: boolean`

是否多选

`readonly wrapper: HTMLElement`

获取此节点的dom

`container: HTMLElement`

设置此节点的容器

#### 事件

`onOpen: (node: this) => void`(可继承)

打开时的回调, 此类不主动触发，一般留给继承此类的子类触发

`onSelect: handler: (node: ElementTreeNode) => void` (可继承)

当节点被选择时触发的回调函数，node为被选中的节点

`onExpand: (node: this, isExpand:boolean) => void` (可继承)

当节点被展开时触发的回调, node是展开的节点, isExpand表示是展开还是关闭

```js
let tree = new Tree(para);
tree.onSelect = function( node){
    alert(`${node.content}被选中啦`);
}
```

#### 实例方法

`getSelectedNodes():this[]`

获取当前节点所有选中的子节点(包括本身), 即当前节点的子节点如果selected为true则都会返回

`destroy()`

销毁这棵树