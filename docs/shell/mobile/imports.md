## imports离线操作相关方法

#### downloadbarcode（异步）
开启条码扫码下载
* 参数：
    ```js
    {
      "uniqueFlag" : string, // 唯一值，每个节点id
      "downUrl": string, // 下载地址
      "defaultUpload": boolean, // true上传 false下载
    }
    ```
* 返回值:
     ```js
       {
          "msg": string; // 提示信息
          "success": "true"
       }
   ```
   
#### uploadcodedata(异步)
上传条码数据
* 参数：
    ```js
    {
      "uniqueFlag" : string, // 唯一值，每个节点id
      "uploadUrl": string, // 上传地址
    }
    ```
* 返回值:
     ```js
       {
          "msg": string; // 提示信息
          "success": "true"
       }
   ```
   
#### getCountData(异步)
条码扫码总量统计
* 参数：
   ```js
   {
     "uniqueFlag" : string, // 唯一值，每个节点id
     "uploadUrl": string, // 上传地址
     "itemid": string, // 表id
     "fieldname" : string, // 前端定义的名字，壳返回数据时作为键值对
     "expression" : string, // 计算规则
     "where" : string, // 条件
   }
   ```
* 返回值:
    ```js
      {
         "msg": string; // 提示信息
         "success": "true",
         "data" : {
            [fieldname] : string  
         }
      }
  ```
  
#### operateTable(异步)
增删改查字段数据
* 参数：
     ```js
     {
       "uniqueFlag" : string, // 唯一值，每个节点id
       "itemid": string, // 表id
       "params" : string, // 要操作的字段
       "where" : string, // 条件
       "type" : string // “delete”，“updata”，“query”分别 表示删改查
     }
     ```
* 返回值:
  ```js
    {
       "msg": string; // 提示信息
       "success": "true",
       "data" : obj // 查询时返回详情数据
    }
  ```
  
#### operateScanTable(异步)
表数据查询
* 参数：
   ```js
   {
     "uniqueFlag" : string, // 唯一值，每个节点id
     "sancode": string, // 查询值
     "option" : string, // 0：查询、1：逐一、2：替换、3：累加
     "keyfield" : string, // 主表主键值
     "num" : string, // 替换、累加的值
     "numName" : string // option对应的name值
   }
   ```
* 返回值:
```js
  {
     "msg": string; // 提示信息
     "success": "true",
     "data" : obj[] // 查询时返回详情数据
  }
```
