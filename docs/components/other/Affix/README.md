## 固定组件
### 概述
    简易的固定组件，用来将某个元素固定在页面某个位置,通过绝对定位的方式来将元素固定在页面某个位置.
    通过监听页面以及固定的dom的大小变化来作出相应的固定位置的调整。
### 代码示例
```js
    new Affix({
           el : document.body,
           target : container,
           offsetTop : 10,
           offsetBottom : 10,
           onChange : ()=>{}
       });
```
### 参数
| 属性         | 说明                                                | 类型        | 默认值      | 可选值  | 是否必传  |
| --------     |:---------------------------------------------------:| -----------:|-----------: |--------:|----------:|
| el           | 需要固定的dom节点,指固定的元素                      | HTMLElement |document.body|         |是         |
| target       | 含有纵向滚动框的dom节点,指具有滚动条的el第一个父节点| HTMLElement |document.body|         |是         |
| offsetTop    | el距离target节点顶部的距离                          |  number     |0            |         |否         |
| offsetBottom | el距离target节点底部的距离                          |  number     |0            |         |否         |
| onChange     | 固定或者解除固定时触发的函数                        |  Function   |()=>{}       |         |否         |

### 方法
