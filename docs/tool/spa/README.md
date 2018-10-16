## SPA单页应用框架
### 概述
此框架封装了一套构架单页应用的方法. 原理是通过url的hash值来作为每一个页面的唯一标识, 然后监听hash值的改变, 来跳转页面.

除此之外, 本框架支持一个网页在多个spa应用直接切换; 比如登录注册页作为一个单页应用, 登陆后的主程序作为一个单页应用. 在两者互相切换时, 会清理到当前单页应用所有的东西.

每一个spa应用都可以指定一个主(main)页面，主页面会一直存在于网页上，不会加入历史记录，也可以将其他页面放入到主页面中.

!> 此类不需要实例化

### 示例

```js

/***
 * 初始化单页应用
 * 此配置默认打开参数数组的第一个的默认页面.
 */
SPA.init([
    {   // 第一个单页应用
        name: 'loginReg', // 登录注册
        container: 'body',
        max: 2, // 最大页面 默认10
        router: { // 路由配置
            login: LoginPage,
            reg: RegPage,
        },
        defaultRouter: { // 默认打开
            login: null,
        }
    },
    {   // 第二个单页应用
        name: 'mainPage', // 单页应用的名称
        container: '#body',
        router: { // 路由配置
            main:  MainPage,
            chat: ChatPage
            // 其他页面
        },
        main: {
            router: ['main', []],
            container: '.dev-header',
        }
    }
]);

// 打开mainPage中的chat页面
SPA.open('mainPage', 'chat');
// 关闭页面
SPA.close('mainPage', 'chat');
```

### 相关接口
```js
// 初始化配置
interface ISPAPara {
    name: string; // 单页应用的名称
    container: HTMLElement | string; // dom节点或者css选择器
    router: ISPARouter; // 路由配置
    main?: ISPAMainPara; // 主页配置
    defaultRouter?: objOf<string[]>; // 默认打开页面
    max?: number; // 最大页面 默认10
    isLocalHistory?: boolean; // 是否开启本地缓存
}

// 路由参数, 键值为路由名称, 值为页面构造函数或者一个函数返回页面的构造函数
interface ISPARouter {
    [name:string] : typeof SPAPage | ((para:any[]) => typeof SPAPage)
}

// 主页面设置
interface ISPAMainPara {
    router: [string, string[]]; // 数组第一位: 路由名称, 第二位: 参数数组
    container: HTMLElement | string; // 主页面放到此节点下. 可传css选择器或节点
}
```

### 方法
`SPA.init(paras: ISPAPara[])`

* 概述: 初始化单页, 可以传入多个单页配置, 如果此时url的hash为空或无法解析, 默认跳转到第一个参数中的默认路由页面;
       初始流程: 如果没有打开主页面 -> 则先打开主页面 -> 再打开默认页面; 此时要有一点需要留意, 配置ISPAPara.container可以是主页面的节点.
* 参数: 配置数组

`SPA.open(spaName: string, routeName: string, para?: string[], data = null)`

* 概述: 打开页面; 如果打开页面超出ISPAPara.max, 则销毁最前面的页面; 如果打开跟上次不一样的spaName, 则销毁上次spa应用下所有页面.
* 参数:
    * spaName, 应用名称
    * routeName, 此应用下的路由名称
    * para, 一个数组, 页面的参数
    * data, 页面数据, 可以是任意类型, 不会存于历史记录中.

`SPA.close(spaName: string, routeName: string, para?: string[])`

* 概述: 关闭一个页面
* 参数:
    * spaName: 应用名称
    * routeName: 路由名称
    * para: 参数数组SPA

---

## SPAPage 单页页面
## 概述
提供一个抽象类给所有页面作为基类, 即所有的页面都需要继承此类.

## 构造函数
```js
new SPAPage(para: Primitive[], data?:any);
```

### 原型链(SPAPage.prototype)

#### 属性

`protected para: Primitive[]`

参数

`protected data: any`

外部传入的数据

`public readonly hash: string`

页面的hash值

`public readonly wrapper: HTMLElement`

页面的节点

`public isShow: boolean`

控制页面的隐藏和显示

#### 方法

`protected abstract wrapperInit(): Node | DocumentFragment;`

用于初始化wrapper中的内容, 需要返回节点或者文档片段, 此类会自动把返回结果放入到wrapper中, 一般用于初始化页面的布局结构;

!> 抽象方法，***子类中必须实现这个方法***；

`protected abstract init(para: Primitive[], data?:any);`

初始化类的方法。 将所有初始化的内容放入此方法中，实例化于刷新时会调用此方法。

执行顺序: 先wrapperInit, 再init;

!> 抽象方法，***子类中必须实现这个方法***；

`protected wrapperCreate(): HTMLElement`

创建wrapper本身，当创建时需求修改wrapper时可以继承此方法， 对父类的返回值做相应的修改。

`protected destroy()`

执行关闭页面时销毁的动作，一般需要被继承

`public close()`

关闭页面，此方法中会调用destroy方法。

`public refresh()`

刷新页面

### 实例(创建一个页面)
```js

// 页面实现
class HelloWorldPage extends SPAPage {

    init(para, data) {
        // 绑定事件
        d.on(this.wrapper, 'click', function(){
            Modal.alert(para[0]);
        });
    }

    wrapperInit() {
        return document.createTextNode('Hello, world!');
    }
}

// 配置
SPA.init([
    {   // 第一个单页应用
        name: 'helloPage', // 登录注册
        container: 'body',
        max: 2, // 最大页面 默认10
        router: { // 路由配置
            hello: HelloWorldPage,
        },
        defaultRouter: { // 默认打开
            hello: ['para1', 'para2'],
        }
    }
]);

// 此时url为： http://xxxx/xx/xxx#helloPage/hello?para=para1,para2
// 点击页面则会弹出第一个参数: para1
```