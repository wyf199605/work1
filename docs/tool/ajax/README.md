## Ajax封装
### 概述
此类封装了ajax的操作，接口参考jQuery的参数，实现了常用的ajax功能，并用promise控制异步的操作。

```js
Ajax.fetch(url)
    // 成功
    .then(result => {
        console.log(`返回值：${result.response}， 状态：${result.statusText}`)
    })
    // 异常
    .catch(reason => {
        console.log(`错误状态：${reason.statusText}`)
    })
    // 无论成功、异常，最终都会执行
    .finally(() => {
        console.log('请求完成');
    });

// 或者通过对象的解构赋值
Ajax.fetch(url)
    .then(({response, statusText, xhr}) => {
        console.log(`返回值：${response}， 状态：${statusText}`)
    }).catch(({xhr, statusText, errorThrown}) => {
        console.log(`错误状态：${statusText}`)
    });
```

### 相关接口
```js
// 执行ajax的相关参数
interface IAjaxSetting {
    type?: string; // 请求类型，一般有 GET, POST, PUT, DELETE等
    data?: obj | string | number; // 发送到后台的数据
    dataType?: string; // 期望接受的数据类型
    processData?: boolean; // 是否预处理返回数据
    contentType?: string | boolean; // header中的content-type， false表示不发送content-type
    headers?: objOf<string>; // 请求头
    cache?: boolean; // 默认什么也不做，false: 在url上加入时间戳参数来达到不缓存的效果, true:开启本地缓存
    timeout?: number; // 超时设置
    xhrFields?:obj; // 直接设置xhr对象上的属性.
}

// ajax成功返回的参数
interface IAjaxSuccess {
    response, // 返回数据
    statusText: string, // 状态
    xhr: XMLHttpRequest // 当前XMLHttpRequest对象
}

// ajax失败返回的参数
interface IAjaxError {
    xhr: XMLHttpRequest, // 当前XMLHttpRequest对象
    statusText: string, // 错误状态 包括：error（网络错误）、timeout（超时错误）、parsererror（返回数据解析错误）
    errorThrown: string // try catch 语句中抛出的错误
}
```

### 构造函数
```js
new Ajax();
```

### 参数
无

---

### 方法

`fetch(url: string, setting?: IAjaxSetting): Promise<IAjaxSuccess>`

此方法直接发起一个ajax请求， 返回一个promise对象

参数：

* url: 请求地址；

* setting: 请求相关设置, 可选, 具体属性如下：
    * `type`: 请求类型，一般有 GET, POST, PUT, DELETE等，默认GET；
    * `data`: 发送到后台的数据, 可以是对象，数字与字符串，最终都会被转为字符串，对象用JSON.parse转；
    * `dataType`: 期望接受的数据类型, 可设置的值有text,xml,json，默认text, 类型的mineType将放在header中发到后台，
        如果`processData`为true, 返回的promise的then方法的参数(`IAjaxSuccess`)中的response则为对应的类型;
    * `processData`: 是否根据dataType类型来预处理返回的数据，默认true；
    * `contentType`: 告诉服务器发送的数据的类型，也就是header中的content-type，默认为JSON类型("application/json"), false表示不发送content-type;
    * `headers`: 请求头;
    * `cache`: 默认什么也不做，false: 在url上加入时间戳参数来达到不缓存的效果, true:开启本地缓存 **注：直接在Ajax对象上调用fetch不支持本地缓存，如需使用可见Ajax原型上的fetch方法**
    * `timeout`: 超时时间设置
    * `xhrFields`: 直接设置xhr对象上的属性, 跨域时可以设置此值{withCredentials: true}.

返回值:

返回一个promise对象。
```js
Promise.then((result: IAjaxSuccess) => {
    // 成功

}).catch((reason: IAjaxError) => {
    // 出错，
});
```

---

### Ajax原型(Ajax.prototype)


##### 方法

`fetch(url: string, setting?: IAjaxSetting): Promise<IAjaxSuccess>`
原型上的方法与Ajax对象上的方法大体功能一样，但有两点不同值得注意：
1. 实例化之后的fetch方法，setting参数支持`cache:true`属性，如果开启本地缓存的话, 第一次请求会将请求的结果缓存在实例化的对象上,
    之后同一对象再用此方法请求则直接读取本地缓存，最大缓存条数为30条。开启条件：
    ```js
    setting.cache && setting.type == 'GET' && (setting.dataType == 'json' || setting.dataType == 'text')
    ```
2. 实例化后的对象重复调用fetch方法，如果上一次请求还没有结束，则会直接终止上一次的请求，promise的状态变为reject。
    这在处理需要多次查询的功能时非常有用，用户不必等上一次查询结束，则可以直接进行下一次查询。

    ```js
    let ajax = new Ajax();

    ajax.fetch(url).then(() => {
        // 请求时间 1000ms
        console.log('success1')
    }).catch(() => {
        console.log('error1')
    });

    setTimeout(() => {
        // 此时上一个请求还未结束，则中断上一个请求
        ajax.fetch(url).then(() => {
            // 请求时间 1000ms
            console.log('success2')
        }).catch(() => {
            console.log('error2')
        });
    }, 500)

    // 500ms后输出error，1500ms后输出success2
    ```


## Rule.Ajax

概述：针对当前项目的ajax对象，继承于上面的Ajax类；相对于Ajax类，Rule.Ajax类的fetch加上了两个新的参数，以及对返回的最原始数据针对后台规则做了一些预处理，
会针对不同的错误弹出提示：请求超时，登陆过期，数据为空，以及后台设置的错误提示等，提示这些错误时也会让promise变成reject状态。

### 相关接口
```js
interface IRAjaxSetting extends IAjaxSetting{
    data2url?: boolean; // 是否将data属性连接到url后面，默认false
    silent?: boolean; // 是否不提示错误，默认false
}
```
### 构造函数
```js
new Rule.Ajax();
```


### 方法

`fetch(url: string, setting?: IRAjaxSetting): Promise<IAjaxSuccess>`


参数：

* url: 请求地址；
* setting: 请求相关设置, 相对Ajax.fetch()多出的属性如下：
    * `data2url`: 是否将data添加到url后面，默认false。一般情况，如果data是对象且请求方式是GET，则默认把data转化为url参数添加到url后面，但是此属性可以控制其它请求类型，也把data添加到url后面。
    * `silent`: 是否不提示错误，默认false

**注：Rule.Ajax.fetch 中的setting的dataType属性默认为json，也就是说默认会把后台返回的数据转为一个对象**

返回值:

返回一个promise对象。
```js
Promise.then((result: IAjaxSuccess) => {
    // 成功

}).catch((reason: IAjaxError) => {
    // 出错，reason.statusText增加了emptyData（数据为空），logout（已登出），errorCode（后台报错）三种状态
});

### Rule.Ajax原型(Rule.Ajax.prototype)
```

##### 方法

`fetch(url: string, setting?: IRAjaxSetting): Promise<IAjaxSuccess>`

与Ajax.fetch 用法相同