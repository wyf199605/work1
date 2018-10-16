## 基础方法

#### versionGet(同步) - 原getVersion
获取客户端版本号接口, 用于传输到后台做版本对比
* 参数: 无
* 返回值:
    ```js
    [{
        "fileId":"d3dcompiler_43.dll",
        "version":"1.0.0.1"
    },{
        "fileId":"libcef.dll",
        "version":"1.0.0.1"
    }]
    ```

#### versionUpdate(异步) - 原downloadFile
更新app文件接口, 参数一般直接从后台返回
* 参数:
    ```js
    {
        "byteLength": "1024",
        "file":[
            {
                "fileId":"d3dcompiler_43.dll",
                "fileVersion":"1.0.0.1",
                "filePath":"https://bw.sanfu.com/version/1.5/ d3dcompiler_43.dll"
            },
            {
                "fileId":"libcef.dll",
                "fileVersion":"1.0.0.1",
                "filePath":"https://bw.sanfu.com/version/1.5/libcef.dll"
            }
        ]
    }
    ```
* 返回值: 无
