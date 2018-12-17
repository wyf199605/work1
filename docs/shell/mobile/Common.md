#### speak
* 简述: 语音转文字或者文字转语音
* 参数:
    ```js
    {
        "type": number, // 0表示语音识别，如果！= 0表示语音合成;
        "text": string, // 如果type!=0 text为要使用语音播放的字符串,即文字转语音;
    }
    ```
* 返回值:
    ```js
    {
        "msg": string, // 提示信息
        "data": string; // 语音内容
        "success": "true"
    }
    ```
    
### getEditImg
* 简述：开启涂鸦或签名
* 参数：
    ```js
    {
        "type" : number, // 0表示签名，!0表示涂鸦
        "image": string, // 如果type=!0,image为base64图片格式，如果image为空，表示截取当前页面
    }
   ```
   返回值：
   ```js
    {
        "success": "true",
        "data": "base64图片",
        "uuid": "用户已经取消", // success为false
    }