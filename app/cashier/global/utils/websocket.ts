/// <amd-module name="BwWebsocket"/>
/// <amd-dependency path="reconnectingWebscoket" name="ReconnectingWebSocket"/>
import {Modal} from "../components/feedback/modal/Modal";
import Rule = C.Rule;
interface IBwWebsocketPara{
    onOpen? : (r?) => void
    onMessage? : (r) => void
    onError? : (r) => void
    onClose? : (r) => void
    url? : string
    sendData? : string
}
declare let ReconnectingWebSocket : any;
let url = 'wss://bwt.sanfu.com/cashier/sql/websocket/'+ Rule.getSqlRandom();
export class BwWebsocket{
    ws : WebSocket;
    p : IBwWebsocketPara;
    constructor(para? : IBwWebsocketPara){
        // console.log(para)
        this.p = para;
        let sf = this;
        if ('WebSocket' in window) {
            this.ws = new ReconnectingWebSocket(url,null,{ debug:true,reconnectInterval:1000});
        }else {
            Modal.toast('您的浏览器不支持websocket.');
            return;
        }
        this.ws.onopen = () => {
            // heartCheck.reset().start();
            para.sendData && this.ws.send(para.sendData);
        };
        this.ws.onmessage = function (e) {
            para.onMessage(e)
        };
        this.ws.onclose = () => {};
        this.ws.onerror = () => {};

        var heartCheck = {
            timeout: 55000,        // 55s发一次心跳，比server端设置的连接时间稍微小一点，在接近断开的情况下以通信的方式去重置连接时间。
            serverTimeoutObj: null,
            reset: function () {
                clearTimeout(this.timeoutObj);
                clearTimeout(this.serverTimeoutObj);
                return this;
            },
            start: function () {
                this.serverTimeoutObj = setInterval(function () {
                    if ( sf.ws.readyState == 1) {
                        console.log("连接状态，发送消息保持连接");
                        sf.ws.send(JSON.stringify({reqType:"ping"}));
                        heartCheck.reset().start();    // 如果获取到消息，说明连接是正常的，重置心跳检测
                    }
                }, this.timeout)
            }
        }
    }


}
