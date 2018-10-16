## javascript 与 shell 之间的交互

### 概述
通过定义三个数据传递API，来达到支持所有交互目的。交互方式有同步和异步两种。

* 同步: js发送方法名称与参数到shell，shell立即返回结果。
* 异步: js除了发送方法名和参数，还需加上事件名称，首先shell立即返回当前方法是否可用，如果可用，方法完成时，shell则通过事件的形式通知js处理完成。

> 注: 全局数据类型定义, [点击查看](shell/Types.md)。

### API

#### js调用shell

`AppShell.syncFunction(name: string, data: JSON): Result`
* 概述: 同步返回结果方法, 执行完shell直接返回结果.
* 返回值: 执行结果.
* 参数:
    * `name`: 字符串, shell执行的方法名称;
    * `data`: shell接受的参数

`AppShell.asyncFunction(name: string, data: JSON, back?: string, infor?:string): boolean`
* 概述: 异步返回的方法, shell通过调用`Tools.event.fire`发送事件返回执行结果;
* 返回值: `boolean`, 返回`false`表示无法正常运行, `true`表示可正常运行.
* 参数:
    * `name`: shell执行的方法名称;
    * `data`: shell接受的参数；
    * `back`: 完成时触发的事件，可选, 如果设置此值, shell触发js事件时则用此值作为事件名, 没有设置则用参数name作为事件名.
    * `infor`: 过程通知触发的事件；

#### shell触发js事件
`Tools.event.fire(event: string, data: Result)`
* 概述: shell触发js事件.
* 参数:
    * `event`: 事件名称;
    * `data`: 传输数据