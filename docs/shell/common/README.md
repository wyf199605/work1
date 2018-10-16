## 通用方法
### 概述
此处定义pc、android、ios三种shell的公用方法


#### deviceGet(同步) - 原getDevice
获取硬件设备信息

* 参数: 无
* 返回:
    ```js
    // 格式类型
    {
        "model": string,           // 设备型号
        "name": string,            // 设备系统
        "version": string,         // 系统版本
        "vendor": string,          // 设备供应商
        "density": number,         // 密度
        "resolutionWidth": number, // 真实宽度
        "resolutionHeight":number, // 真实高度
        "uuid": string,            // 设备唯一主键（设备号）
        "scale": number,           // 尺寸
    }
    // 例如
    {
        "model":"Redmi 4",
        "name":"Android",
        "version":"6.0.1",
        "vendor":"Xiaomi",
        "density":3,
        "resolutionWidth":360,
        "resolutionHeight":640,
        "uuid":"863285032259650",
        "scale":5,
    }
    ```
