## 前端开发规范

***

### 1.缩进

js每行的缩进由4个空格组成。  
sass每行得缩进由2个空格组成。  
可修改编译器设置来修改制表符空格长度。

`javascript`

```js
for(let a = 0; a < 10; a ++){
    console.log(a);
}
```

`css`

```css
.table{
  display: none;
}
```

### 2.行长度

每行长度不应该超过80个字符。如果一行多于80个字符，应当在一个运算符（逗号，加号）后换行。

### 3.字符串

字符串统一使用单引号。

```js
let str = '<div class="box"></div>';
```

!> 注：除了个别需要双引号，如json等。

```json
{
    "name": "name"
}
```

### 4.null值的使用

+ 用来初始化一个变量，这个变量可能被赋值为一个对象；
+ 当函数的参数期望是对象时，被当做参数使用；
+ 当函数返回值期望为对象时，被用作返回值传出。

### 5.undefined值的使用

避免使用undefined判断一个变量是否定义，应当使用typeof操作符。

```js
let isExist = typeof a !== 'undefined';
```

### 6.运算符间距

二元运算符、三元运算符前后必须使用一个空格来保持表达式的整洁。

```js
let found = (value[i] === item);

if(found && (count >= 10)) {
    doSomething();
}

for(let i = 0; i < 100; i++) {
    console.log(i);
}

let a = found ? 'a' : 'b';

//不好的写法
if(found&&(count>10)) {
    doSomething();
}
//不好的写法
for(let i=0; i<100; i++) {
    console.log(i);
}
//不好的写法
let b = found?'a':'b';
```

### 7.括号间距

当时用括号时，紧接左括号之后和紧接右括号之前不应该有空格

```js
let found = (value[i] === item);

if(found && (count >= 10)) {
    doSomething();
}

for(let i = 0; i < 100; i++) {
    console.log(i);
}

//不好的写法
if( found && ( count > 10 ) ) {
    doSomething();
}
//不好的写法
for(let i=0; i<100; i++) {
    console.log( i );
}
```

### 8.对象直接变量

1. 起始左花括号应当与表达式保持同一行；
2. 属性名不应当有引号（除有特殊字符外）；
3. 结束的右花括号应当独占一行。

```js
let obj = {
    key1: value1,
    key2: value2,
    func: function() {
        // do something
    }
}

doSomething({
    key1: value1,
    key2: value2
});

//不好的写法
let obj = 
    {
            k1: v1,
            k2: v2
    }
    
// 不好的写法
doSomething({ key1: value1, key2: value2});
```
 
### 9.变量声明

多个变量一起声明时，只使用一个let，每个变量用逗号和换行隔开。

```js
let a = 10,
    b = 20,
    c = 30;
    
// 不好的写法
let a = 10, b = 20,
    c = 30;

// 未初始化的变量放在最后一行
let a = 10,
    b = 20,
    c;
// 不好的写法，未初始化的变量放在第一行
let c,
    a = 10,
    b = 20;

// 不好的写法， 多个let表达式
let a = 10,
    b = 30;
let c = 100;
```

### 10.函数声明

```js
// 好的写法
function doSomething(arg1, arg2) {
    return arg1 + arg2;
}
// 不好写法: 空格不对
function doSomething (arg1, arg2){
    return arg1 + arg2;
}

// 不好写法: 第一行花括号位置不对
function doSomething(arg1, arg2)
{
    return arg1 + arg2;
}
// 不好写法: 用Function构造器
var doSomething = new Function("arg1", "arg2", "return arg1 + arg2");
```

### 11.命名

1. 变量与函数用小写开头驼峰法 : girlName, setName(), getData();
2. 构造函数大写开头驼峰法：MyObject, SomeObject;
3. 常量用单词用大写且用下划线隔开：MY_ADDRESS, TOTAL_MONEY;

### 12.等号

使用 === 或者 !== 严格等号，避免类型转换带来的潜在问题

### 13.语句

1. 每行只能有一行语句，且用分号结尾；
2. ii.if, for, while等中所有语句都用花括号括起来；

### 14.注释

 1.在文件开始时写块注释：

```
    /** 
    * 作用于哪些页面
    * 注明代码业务/功能说明
    */ 
```

2.单个函数注释


 ```
    /**
    * 函数功能简述
    *
    * 具体描述一些细节
    *
    * @param    {string}  address     地址
    * @param    {array}   com         商品数组
    * @param    {string}  pay_status  支付方式
    * @returns  void
    */

```

3.css注释的写法

```
    /* Footer */

    内容区

    /* End Footer */

```

### 15.文件命名规范
  
   > --项目中支持tsx，尽量使用tsx来定义脚本文件
   
   1. 移动端: **xxx.mb.scss**    &nbsp;&nbsp;&nbsp;&nbsp;  **xxx.mb.tsx**
   2. PC端: **xxx.pc.scss**   &nbsp;&nbsp;&nbsp;&nbsp;      **xxx.pc.tsx**

### <a href="#/standard/component.md">15.组件化</a>


### <a href="#/standard/technology.md">16.技术栈</a>

### <a href="#/standard/framework.md">17.框架</a>


