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