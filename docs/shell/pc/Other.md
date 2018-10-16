## startUp开机自动启动壳、关闭自动关机相关方法

#### setAutoStart(同步)
开机壳自动启动，仅支持win7
* 参数:
    ```js
    {
        "autoStart": true, // 开启
    }
    ```
* 返回值:
    ```js
    {
        "msg": string; // 提示信息
        "success": "true"
    }
    ```

#### queryAutoStart(同步)
查询当前开机自动启动状态
* 返回值:
    ```js
    {
        "data": "true", // 开启
    }
    ```

#### powerOff(同步)
关闭壳自动关机
* 参数:
    ```js
    {
        "autoStart": true, // 开启
    }
    ```
* 返回值:
    ```js
    {
        "msg": string; // 提示信息
        "success": "true"
    }
    ```

#### setFullScreen(同步)
壳全屏
* 参数:
  ```js
  {
    "fullScreen": true // 开启全屏
  }

* 返回值:
  ```js
  {
      "msg": "成功"; // 提示信息
      "success": "true"
  }
  ```