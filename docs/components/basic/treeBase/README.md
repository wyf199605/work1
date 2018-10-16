## 底层树控件
### 概述
树(`TreeNodeBase`)的数据结构实现, 提供了树的一些基础操作.

包括遍历, 查找, 删除, 添加等. 所有的树形结构的控件都继承于此类;

每一个实例都是一棵树, 一个树可以看作由很多颗小的树构成.

```js
let tree = new TreeNodeBase({
    content: 1,
    children: [
        {
            content: 2,
            children: [
                {
                    content: 3
                },
                {
                    content: 4
                }
            ]
        }
    ]
});
// 前序遍历
tree.each((t) => {
    console.log(t.content);
});
//  1, 2, 3, 4
```

### 相关接口
```js
interface IBasicTreePara {
    content?:any; // 用来存放内容
    children?: IBasicTreePara[] // 子元素
}
```

### 构造函数
```js
new TreeNodeBase(para: IBasicTreePara);
```

### 参数
`para`

构造树的json对象, 构造函数将根据此参数返回一颗树.

---

### TreeNodeBase实例

#### 实例 (TreeNodeBase.prototype)

##### 属性

`readonly deep: number`

获取当前节点的在树上的深度，根节点返回0;

`parent:this`

获取或设置父节点, 例如：`this.parent = tnode;`

设置父节点时, **此属性也会将this 添加到tnode的子元素数组, 属于双项操作**, 也就是说此方法即会改变this的parent, 也会改变tnode的children.
!> 注: 所有的父子操作: `childrenSet`, `childrenAdd`, `childrenRemove` 都是属于双项操作, 既改变本身属性也改变参数的属性.

`children:this[]`

设置或者获取子元素数组， 设置时调用`childrenSet()`;

`content: any`

设置此节点的数据，可以是任意内容。

`root: this`

获取树的根节点

##### 方法


`childrenSet(children: this | this[])`

* 概述: 重置子元素, **本方法是覆盖操作**, 先把本身所有的children的父节点设置为null, 然后把参数的parent指向本身, 并把本身节点的children指向传入的参数.
* 参数: 要设置的子元素, 可以是单个节点, 也可以是数组


`childrenAdd(children: this | this[])`

* 概述: 添加子元素, 同为双项操作, 也会把新的子元素的parent指向调用此方法的节点.
* 参数: 子元素, 可以是单个节点, 也可以是数组

`childrenRemove(tnode: this | this[])`

* 概述: 删除子元素, 也是双项操作, 删除同时也会把删除子元素的parent设置为空.
* 参数: 子元素, 可以是单个节点, 也可以是数组

`find(filterCb: (tnode: this) => boolean, maxDeep = -1): this[]`

* 概述: 遍历查找符合条件的节点集合 (包括根节点).
* 参数:
    * `filterCb`
        * 概述: filterCb是一个用来做条件判断的函数, 内部用来筛选, 参数是循环的每一个子节点, 若符合条件的返回`true`, 否则返回`false`
        * 类型: (tnode: this) => boolean
        * 返回值: boolean, 条件是否成立
    * `maxDeep`
        * 概述: 最大的查找深度, -1 代表不限制. 默认 -1
        * 类型: number
* 返回值: 返回条件成立的树节点数组, 没找到则返回`null`;
* 示例:
```js
// 获取内容大于1的所有节点
let nodes = tree.find(function(node) {
    return node.content > 1;
});
```

`backFind(filterCb:(tnode: this) => boolean): this`
* 概述: 与find方法不一样，此方法为向上查找父元素（包括本身），返回一个里当前节点最近的符合条件的节点；
* 参数: `filterCb`
    * 概述: filterCb用来做条件判断，符合条件的返回`true`, 否则返回`false`
    * 类型: (tnode: this) => boolean
    * 返回值: boolean, 条件是否成立


`each(cb: (tnode: this, deep:number) => void)`

* 概述: 用前序遍历整棵树的所有节点
* 参数:
    * `cb`
        * 概述: 用于做循环操作的函数
        * 类型: (tnode: this, deep:number) => void
        * 参数:
            * `tnode` : 循环出的每一个节点,
            * `deep`: 当前节点的深度, 从0开始, 根节点是0

`nodeGetByPath(path: numer[]):this`
* 概述: 通过路径获取一个节点
* 参数:
    * path: 一个数字数组, 表示子元素的路径, 直接对应节点的children中的下标.
* 返回: 找到的节点, 没找到返回 null
