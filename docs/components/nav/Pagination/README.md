## 分页控件
### 概述

`Pagination`类对分页功能进行集成，实现下拉刷新，上拉加载等多种功能。

```js
let pagination = new Pagination({
    scroll:{
        scrollEl: <HTMLElement>div, // 分页内容放置位置元素
        auto: false // 是否自动加载
    },
    onChange: (state) => {
        return new Promise((resolve, reject) => {
            if(state.current === 0){ // 下拉刷新时state.current状态为0;
                resolve();
            }else{
                if(Math.random() > .5){
                    resolve();// 分页加载
                }else{
                    reject();// 分页加载完毕
                }
            }
        });
    }
});
```

### 相关接口

```js
interface IPaginationPara extends IComponentPara{
    total?: number,             // 总记录数属性
    pageSize?: number,          // 单页条数
    onChange: (state: IPaginationState) => Promise<any>,
        // 加载和刷新时触发的事件，该事件接收一个IPaginationState接口对象
    scroll: IPaginationScroll   // 下拉刷新与上拉加载接口对象
}
```
`IPaginationScroll`
```js
interface IPaginationScroll{
    scrollEl: HTMLElement,   // 滚动的元素
    isPulldownRefresh?: boolean; // 是否下拉刷新，默认true
    auto?: boolean,          // 触底加载方式 (true: 自动触底加载，false: 手动点击加载)
    loadingText?: string,    // 触底加载显示提示, '点击继续加载...'
    nomoreText?: string,      // 翻页结束文字
}
```
`IPaginationState`
```js
interface IPaginationState{
    current : number; // 当前页数
    pageSize : number;  // 单页条数
}
```

!>注：`scrollEl`传入的元素会改变其内部结构，不要对`scrollEl`元素使用子元素选择器，便不会改变其样式。

### 构造函数
```js
new Pagination(para: IPaginationPara);
```

### 参数
`para`

分页控件的参数对象，构造函数将根据此参数初始化一个分页控件。

### Popover实例

#### 实例 (Popover.prototype)

##### 属性

`set onChange(e: (state: IPaginationState) => Promise<any>)`

# 参数：接收一个返回一个Promise对象的函数，该函数接收一个返回值`IPaginationState`
```js
interface IPaginationState{
    current : number; // 当前页数
    pageSize : number;  // 单页条数
}
```
# 概述：用于设置，分页控件进行上拉加载与下拉刷新时触发的事件。当该事件接收的参数state.current为0时，代表触发的是下拉刷新。

`get onChange()`

# 概述：获取分页控件上拉加载与下拉刷新时触发的事件。

`set current(num: number)`

# 参数：整数int；
# 概述：用于设置当前页码，从0开始。

`get current()`

# 概述：获取当前页码。

`set pageSize(num: number)`

# 参数：整数int；
# 概述：设置每页的条数。

`get pageSize()`

# 概述：获取每页的条数。

`set isEnd(e: boolean)`

# 参数：布尔值；
# 概述：设置当前分页控件是否已经加载完毕。

`get isEnd()`

# 概述：获取当前是否已经加载完毕，返回布尔值。



##### 方法

`refresh()`

# 参数：无；
# 概述：刷新该分页控件，即重新加载数据。

` next()`

# 参数：无；
# 概述：跳到下一页。

` prev()`

# 参数：无；
# 概述：跳到上一页。

` destroy()`

# 参数：无；
# 概述：销毁当前分页控件。


