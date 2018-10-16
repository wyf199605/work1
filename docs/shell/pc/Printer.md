## Print相关方法

#### printersGet
* 简述: 获取打印机列表
* 参数: 无
* 返回值:
    ```js
    {
        "driveList": [
          {
            "driveName": string,  // 打印机名称
            "driveCode": number   // 打印机编码
          }
      ]  
      
    }
    ```


#### labelPrint
* 简述: 打印
* 参数:
    ```js
    {
       "quantity": number,  // 份数
       "driveCode": number, // 打印机编码
       "image": Blob // 图像
    }
    ```
* 返回值: 无
