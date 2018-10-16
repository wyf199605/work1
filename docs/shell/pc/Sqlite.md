## Sqlite相关方法

#### sqliteQuery
* 简述: 执行sqlite命令或运行sql语句(__命令以.开头__), 并返回控制台回显的结果或查询结果.
* 参数:
    ```js
    {
        "query": string // 字符串, 表示sqlite命令或sql语句.
    }
    ```
返回值:
    ```js
    {
        "errorCode": 0, // 错误码
        "type": "table",
        "head": {totalNum: 2}, // 数据库总条数
        "data": {
            "dataList": [ // 表数据数组，下标与表头对应
                ["衣服",001,"132.3","广州"],
                ["裤子",003,"203","深圳"],
                // ...
             ],
            // 表头信息
            "meta": ["GOOD","NUMBER","PRICE","SUPPLIER"]
        }
    }
    ```


#### sqliteMetaDataQuery
* 简述: 查询表结构
* 参数:
    ```js
    {
        "query": string //字符串, 表示查询表格名称,alltable为全部表格
    }
    ```

* 返回值:
    ```js
    {
        "errorCode": 0,
        "type": "meta",
        "dataArr": [
            {
                "tableName": "GOODS",
                "columns": [
                    {
                        "columnName": "GOOD",
                        "columnType": 12,
                        "columnTypeName": "VARCHAR",
                        "columnDisplaySize": 23
                    },
                    {
                        "columnName": "NUMBER",
                        "columnType": 4,
                        "columnTypeName": "INTEGER",
                        "columnDisplaySize": 23
                    },
                    {
                        "columnName": "PRICE",

                        "columnType": 8,
                        "columnTypeName": "DOUBLE",
                        "columnDisplaySize": 23
                    },
                    {
                        "columnName": "SUPPLIER",
                        "columnType": 12,
                        "columnTypeName": "VARCHAR",
                        "columnDisplaySize": 23
                    }
                ]
            }
        ]
    }
    ```

* 注: 常见表格的列类型名称对照表

| Oracle           	|columnTypeName java.sql.Types| columnType JDBC类型索引(int)|
|-------------------|--------------:|----------------:|
|blob             	|BLOB 	        | 2004            |
|char             	|CHAR 	        | 1               |
|clob             	|CLOB 	        | 2005            |
|date             	|DATE 	        | 91              |
|number           	|DECIMAL 	    | 3               |
|long             	|VARBINARY 	    | -3              |
|nclob,nvarchar2  	|OTHER 	        | 1111            |
|smallint         	|SMALLINT 	    | 5               |
|timestamp        	|TIMSTAMP       | 93              |
|raw              	|VARBINARY      | -3              |
|varchar2         	|VARCHAR        | 12              |