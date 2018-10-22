define(["require", "exports", "reconnectingWebscoket", "Modal", "User", "Message", "Notify"], function (require, exports, ReconnectingWebSocket, Modal_1, User_1, Message_1, Notify_1) {
    "use strict";
    var d = G.d;
    var tools = G.tools;
    var sys = BW.sys;
    var sysPcHistory = BW.sysPcHistory;
    var CONF = BW.CONF;
    return /** @class */ (function () {
        function webscoket(props) {
            this.props = props;
            var network, user = User_1.User.get(), self = this;
            if (!user.userid)
                return;
            if ('WebSocket' in window) {
                self.ws = new ReconnectingWebSocket(props.wsUrl + '/websocket/' + user.userid + '/single', null, { debug: true, reconnectInterval: 1000 });
            }
            else {
                Modal_1.Modal.toast('您的浏览器不支持websocket.');
                return;
            }
            // console.info("创建websocket对象成功.");
            self.ws.onopen = function () {
                // console.info("websocket 连接打开.");
            };
            self.ws.onmessage = function (r) { return self.onMessage(r); };
            self.ws.onerror = function (e) {
                // console.warn("websocket出现异常."+e);
            };
            self.ws.onclose = function (e) {
                // console.info("websocket连接关闭.");
            };
            document.addEventListener("netchange", function () {
                // console.log('检查网络变化.');
                if (network == 1) {
                    if (self.ws) {
                        // console.log('离开网络.');
                    }
                    else {
                        // console.log('连接服务器的websocket通道已经关闭.');
                    }
                }
                else if (network == 3) {
                    if (self.ws) {
                        // console.log('连上wifi.');
                        self.ws.refresh();
                    }
                    else {
                        // console.log('连接服务器的websocket通道已经关闭.');
                    }
                }
                else if (network == 6) {
                    if (self.ws) {
                        // console.log('连上4g.');
                        self.ws.refresh();
                    }
                    else {
                        // console.log('连接服务器的websocket通道已经关闭.');
                    }
                }
            });
        }
        webscoket.prototype.onMessage = function (r) {
            //console.info("后台返回的数据:"+r.data);
            var data = JSON.parse(r.data), type = data.respType, self = this;
            console.log(data);
            switch (type) {
                case "notify":
                    var dataMap = data.data.dataMap[0];
                    //let messageAction = new MessageAction();
                    var message = new Message_1.Message({
                        sender: tools.str.toEmpty(dataMap.sender),
                        content: tools.str.toEmpty(dataMap.content.content),
                        link: tools.isEmpty(dataMap.content.link) ? "" : self.props.mgrPath + dataMap.content.link,
                        time: tools.str.toEmpty(dataMap.createDate),
                        num: data.data.dataMap.length
                    });
                    //messageAction.saveMessage(message);
                    G.localMsg.add(data.data.dataMap);
                    var os = BW.sys.os;
                    if (os === 'ip' || os === 'ad') {
                        if (os !== 'ip') {
                            BW.sys.ui.notice({
                                msg: JSON.stringify(message.toString())
                            });
                        }
                        tools.event.fire('newMsg', JSON.stringify(data.data.dataMap));
                    }
                    else if (os === 'pc') {
                        var listData = data.data.dataMap;
                        var _loop_1 = function (i) {
                            $('.messageList').prepend(self.messageDom(listData[i]));
                            var url = CONF.siteUrl + listData[i].content.link;
                            new Notify_1.Notify({
                                title: dataMap.sender,
                                content: listData[i].content.content,
                                onClick: function () {
                                    if (sysPcHistory.indexOf(url) >= 0) {
                                        sys.window.refresh(url);
                                    }
                                    sys.window.open({ url: url });
                                }
                            });
                        };
                        for (var i = 0; i < listData.length; i++) {
                            _loop_1(i);
                        }
                    }
                    var jsonMsg = {
                        "reqType": data.respType,
                        "userId": data.data.userId,
                        'notifyIds': data.data.notifyIds
                    };
                    self.ws.send(JSON.stringify(jsonMsg));
                    break;
                case "sql":
                    var content = d.query('#sqlMonitorContent', document.body);
                    if (content) {
                        var pageContainer = d.closest(content, '.page-container');
                        for (var i = 0, l = data.data.length; i < l; i++) {
                            d.append(content, document.createElement('br'));
                            d.append(content, data.data[i].replace(/\t/g, "\u00A0\u00A0\u00A0\u00A0").replace(/\n/g, ""));
                        }
                        d.append(content, document.createElement('br'));
                        pageContainer.scrollTop = content.scrollHeight;
                    }
                    break;
                case "hint":
                    // if(this.hint){
                    //     this.hint.destroy();
                    // }
                    // this.hint = new Hints({
                    //     data : data.data
                    // });
                    break;
                default:
                    console.info("后台返回未知的消息类型.");
                    break;
            }
        };
        webscoket.prototype.messageDom = function (listData) {
            var messageDom = '<li class="unread" data-url="' + listData.content.link + '" data-notifyid="' + listData.notifyId + '">' +
                '<a href="javascript:void(0)" class="unread">' +
                '<div class="clearfix">' +
                '<div class="thread-content">' +
                //                '<span class="author">'+data.data.userId+'</span>'+
                '<span class="preview">' + listData.content.content + '</span>' +
                '<span class="time">' + listData.createDate + '</span>' +
                '</div>' +
                '</div>' +
                '</a>' +
                '</li>';
            return messageDom;
        };
        return webscoket;
    }());
});

/**
 * 本文件用于gulp打包时引用，防止找不到变量G
 */
/// <reference path="polyfill.ts"/>
/// <reference path="rule.ts"/>
/// <reference path="storage.ts"/>
/// <reference path="tools.ts"/>
/// <reference path="dom.ts"/>
/// <reference path="ajax.ts"/>
/// <reference path="components/Component.ts"/>
/// <reference path="requireConfig.ts"/>
/// <reference path="spa.ts"/>
/// <reference path="shell.ts"/>

/// <reference path="Config.ts"/>
/// <reference path="common/sys/sys.ad.ts"/>
/// <reference path="common/sys/sys.h5.ts"/>
/// <reference path="common/sys/sys.ip.ts"/>
/// <reference path="common/sys/sys.pc.ts"/>
/// <reference path="common/sys/sysHistory.pc.ts"/>
/// <reference path="common/sys/sysPage.pc.ts"/>
/// <reference path="common/sys/sysTab.pc.ts"/>
/// <reference path="common/sys/sys.ts"/>
