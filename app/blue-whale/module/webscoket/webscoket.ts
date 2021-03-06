/// <amd-dependency path="reconnectingWebscoket" name="ReconnectingWebSocket"/>
import {Modal} from "global/components/feedback/modal/Modal";
import {User} from "../../../global/entity/User";
import {Message} from "../../../global/entity/Message";
import d = G.d;
import tools = G.tools;
import {Notify} from "../../../global/components/feedback/notify/Notify";
import {Hints} from "../hints/hints";
import sys = BW.sys;
import sysPcHistory = BW.sysPcHistory;
import CONF = BW.CONF;
declare let ReconnectingWebSocket : any;

export = class webscoket {
    private ws;
    private hint : Hints;
    constructor(private props) {
        let network,user = User.get(),self = this;
        if(!user.userid)
            return ;
        if ('WebSocket' in window) {
            self.ws = new ReconnectingWebSocket(props.wsUrl+'/websocket/'+user.userid+'/single',null,{ debug:true,reconnectInterval:1000});
        } else {
            Modal.toast('您的浏览器不支持websocket.');
            return;
        }
        // console.info("创建websocket对象成功.");
        self.ws.onopen = () => {
            // console.info("websocket 连接打开.");
        };
        self.ws.onmessage = (r) => self.onMessage(r);
        self.ws.onerror = function(e){
            // console.warn("websocket出现异常."+e);
        };
        self.ws.onclose = function(e){
            // console.info("websocket连接关闭.");
        };
        document.addEventListener("netchange", () => {
            // console.log('检查网络变化.');
            if (network == 1) {
                if(self.ws){
                    // console.log('离开网络.');
                }else{
                    // console.log('连接服务器的websocket通道已经关闭.');
                }
            }else if(network == 3) {
                if(self.ws){
                    // console.log('连上wifi.');
                    self.ws.refresh();
                }else{
                    // console.log('连接服务器的websocket通道已经关闭.');
                }
            }else if(network == 6) {
                if(self.ws){
                    // console.log('连上4g.');
                    self.ws.refresh();
                }else{
                    // console.log('连接服务器的websocket通道已经关闭.');
                }
            }
        });
    }

    private onMessage(r){
        //console.info("后台返回的数据:"+r.data);

        let data = JSON.parse(r.data),type = data.respType,self = this;
        console.log(data);
        switch(type){
            case "notify" :
                let dataMap = data.data.dataMap[0];
                //let messageAction = new MessageAction();
                let message = new Message({
                    sender:  tools.str.toEmpty(dataMap.sender),
                    content:tools.str.toEmpty(dataMap.content.content),
                    link:    tools.isEmpty(dataMap.content.link)?"":self.props.mgrPath+dataMap.content.link,
                    time:   tools.str.toEmpty(dataMap.createDate),
                    num:    data.data.dataMap.length
                });
                //messageAction.saveMessage(message);
                G.localMsg.add(data.data.dataMap);
                let os = BW.sys.os;
                if(os === 'ip' || os === 'ad'){
                    if(os !== 'ip'){
                        BW.sys.ui.notice({
                            msg:JSON.stringify(message.toString())
                        });
                    }
                    tools.event.fire('newMsg', JSON.stringify(data.data.dataMap));
                }else if(os === 'pc'){
                    let listData=data.data.dataMap;
                    for(let i=0;i<listData.length;i++){
                        $('.messageList').prepend(self.messageDom(listData[i]));
                        let url = CONF.siteUrl + listData[i].content.link;

                        new Notify({
                            title:dataMap.sender,
                            content:listData[i].content.content,
                            onClick : () => {
                                if (sysPcHistory.indexOf(url) >= 0) {
                                    sys.window.refresh(url);
                                }
                                sys.window.open({url})
                            }
                        })

                    }
                }


                let jsonMsg = {
                    "reqType" : data.respType,
                    "userId" : data.data.userId,
                    'notifyIds' : data.data.notifyIds
                };
                self.ws.send(JSON.stringify(jsonMsg));
                break;
            case "sql" :
                let content = d.query('#sqlMonitorContent',document.body);
                if(content) {
                    let pageContainer = d.closest(content, '.page-container');
                    for (let i = 0, l = data.data.length; i < l; i++) {
                        d.append(content,document.createElement('br'));
                        d.append(content,data.data[i].replace(/\t/g, "\u00A0\u00A0\u00A0\u00A0").replace(/\n/g, ""));
                    }
                    d.append(content,document.createElement('br'));
                    pageContainer.scrollTop = content.scrollHeight;
                }
                break;
            case "hint" :
                // if(this.hint){
                //     this.hint.destroy();
                // }
                // this.hint = new Hints({
                //     data : data.data
                // });
                break;
            default :
                console.info("后台返回未知的消息类型.");
                break;
        }
    }

    private messageDom(listData){
        let messageDom='<li class="unread" data-url="'+listData.content.link+'" data-notifyid="'+listData.notifyId+'">'+
            '<a href="javascript:void(0)" class="unread">'+
            '<div class="clearfix">'+
            '<div class="thread-content">'+
//                '<span class="author">'+data.data.userId+'</span>'+
            '<span class="preview">'+listData.content.content+'</span>'+
            '<span class="time">'+listData.createDate+'</span>'+
            '</div>'+
            '</div>'+
            '</a>'+
            '</li>';
        return messageDom;
    }
}