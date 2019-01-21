## rfid相关方法

#### rfidStart(同步)
开启rfid,此函数需指定回调事件名
* 参数:
    ```js
    {
        "ipAddress": string, // ip地址
        "ipPort": string // ip端口
    }
    ```
* 或参数:
     ```js
     {
        "comPort": string, // com口
        "comBaud": string, // 波特率
     }
     ```
* 返回值:
    ```js
    {
        "data": string[]; // rfid数据
        "msg": string; // 提示信息
        "success": "true"
    }
    ```

#### rfidReset(同步)
重启rfid，修改完功率、蜂鸣器、led后需调用改函数重启读写器才能生效，此函数需指定回调事件名.
* 参数:
    ```js
    {
        "ipAddress": string, // ip地址
        "ipPort": string // ip端口
    }
    ```
* 或参数:
     ```js
     {
        "comPort": string, // com口
        "comBaud": string, // 波特率
     }
     ```
* 返回值:
    ```js
    {
        "msg": string; // 提示信息
        "success": "true"
    }
    ```

#### rfidConfig(同步)
配置rfid，如天线功率、蜂鸣器、led，调用此方法修改rfid配置，调用完此方法后需调用reset重启读写器方可生效，此函数需指定回调事件名
* 参数:
    ```js
    {
        "ipAddress": string, // ip地址
        "ipPort": string // ip端口
        "config": {
             "power" : string,  // 功率
             "buzzer": true, // 蜂鸣器
             "led": true, // led
             "mode" : number, // 模式
         }
    }
    ```
* 或参数:
     ```js
     {
        "comPort": string, // com口
        "comBaud": string, // 波特率
        "config": {
            "power" : string,  // 功率
            "buzzer": true, // 蜂鸣器
            "led": true, // led
            "mode" : number, // 模式
        }
     }
     ```
* 返回值
```js
    {
        "success": true，
        "msg": "成功",
    }
```

#### rfidStop(同步)
关闭rfid，此函数需指定回调事件名
* 返回值
```js
    {
        "success": true，
        "msg": "成功",
    }
```

#### downloadbarcode(同步)
调用壳下载数据，此函数需指定回调事件名
* 参数:
    ```js
    {
        "url": string, // 下载地址
        "token":string, 
        "uniqueFlag":string,
    }
    ```
* 返回值
```js
    {
        "success": true,
        "msg": "成功",
        "data":[{
           "SHO_ID":"店号",
         },{
           "GOD_ID":"货号"
         },{
           "CAPTION":"标题"
         }]
    }
```
