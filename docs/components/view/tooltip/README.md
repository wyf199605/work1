## 提示框
### 概述
简易的提示框组件,通过封装balloon插件，来实现简单的提示。
### 代码示例
```js
    new Tooltip({
                el: document.body,
                errorMsg: "提示语句",
                length:'medium'
      });
```

### 参数

| 属性      | 说明                                                  | 类型        | 默认值                    | 可选值                | 是否必传  |
| --------  |:-----------------------------------------------------:| -----------:|------------------------:  |--------------------:  |----------:|
| pos       | 提示框显示的位置，分为上(up)下(down)左(right)右(left) | string      |up                         |  up,down,left,right   |否         |
| length    | 提示框的大小                                          | string      |fit                        | small,medium,large,fit|否         |
| visible   | 是否显示                                              | boolean     |false                      |    false,true         |否         |
| errorMsg  | 提示框提示信息                                        |  string     |""                         |                       |是         |
| el        | 提示框挂载的节点                                      |  HTMLElement|null                       |                       |是         |

### 实例方法

#### show():void

> 说明

显示提示框

>  参数

无

---

#### hide():void

> 说明

隐藏提示框

> 参数

无

