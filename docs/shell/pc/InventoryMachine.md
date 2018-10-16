## 盘点机相关方法

#### casioUpload(异步) - 原callUpload
获取盘点机数据接口, 此函数需指定back, infor参数
* 参数:
    ```js
    {
        "port": string, // 端口号 COM1 或者 COM2
        "speed": string // 传输速度 , 例如： "1280000"
        
    }
    ```
* 返回值:
    ```js
    {
        "state": number; // 0: 等待, 1: 获取中, 10: 结束
        "progress": number; // state为1时, 返回进度
    }
    ```

#### casioDownload(异步) - 原callDownload
为盘点及设置数据, 此函数需指定回调事件名.
* 参数:
    ```js
    {
        "port": string,     // 端口号 COM1 或者 COM2
        "speed": "1280000", // 传输速度， 例如： "1280000"
        "data": JSON        // 文件json数据字符串
    }
    ```
* 返回值:
    ```js
    {
        "state": number; // 0: 等待, 1: 设置中, 2: 结束
        "progress": number; // state为1时, 返回进度
    }
    ```

#### casioDataGet(同步)
上传成功时，调用此方法获取数据
* 返回值
```js
    {
        "success": true，
        "msg": "成功",
        "data": Base64
    }
```

### 废除事件

* sendMessage: 读取指纹过程中shell通知js
* sendFinish: 读取完成后shell通知js
* getUploadData: 获取上传数据接口

> 都用自定义回调事件代替
