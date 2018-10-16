## 指纹
定义指纹验证、导入等方法。

### 方法
#### fingerGet(异步) - 原callFinger
唤起客户端监听指纹

> 注：调用`asyncFunction`时需要传入`back`参数触发每次读取结果，`infor`触发读取的过程.

* 参数:
    ```js
    {
        "type": number // 开启类型, 0: 匹配校验指纹, 1: 注册指纹; 默认1;
        "option": number // type为0时, option取1为开启学习；type为1时， option取1为需要多次
    }
    ```
* back返回:
    ```js
    {
        "fingerType": number // 0或1或2, 代表3种不同指纹器.
        "finger": string     // 指纹数据,  其它状态不需要.
    }
    ```

* infor返回:
    ```js
    {
        "text": string       // 当前状态文字表述, 跟state值对应
    }
    ```

#### fingerCancel(同步) - 原cancelFinger
取消客户端监听指纹
* 参数: 无
* 返回值: 无


#### fingerVerify(同步) - 原verifyFinger
验证两个指纹是否匹配
* 参数:
    ```js
    {
        "enterFinger": string, // 用户输入的指纹
        "matchFinger": string, // 本地需要匹配的指纹
        "fingerType": number   // 是那一种指纹器，值为0或1或2
    }
    ```
* 返回值:
    ```js
    {
        "matched": boolean //是否匹配成功
    }
    ```

### 废除事件

* callFingerMsg: 读取指纹过程中shell通知js
* setFinger: 读取完成后shell通知js

> 这两个事件被在调用 fingerListenOn 的事件监听代替; state在100之前, 表示callFingerMsg状态, state等于100时, 则表示setFinger状态.
