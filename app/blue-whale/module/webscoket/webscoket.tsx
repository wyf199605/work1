/// <amd-dependency path="reconnectingWebscoket" name="ReconnectingWebSocket"/>
import { Modal } from "global/components/feedback/modal/Modal";
import { User } from "../../../global/entity/User";
import { Message } from "../../../global/entity/Message";
import d = G.d;
import Shell = G.Shell;
import tools = G.tools;
import { Notify } from "../../../global/components/feedback/notify/Notify";
import { Hints } from "../hints/hints";
import sys = BW.sys;
import sysPcHistory = BW.sysPcHistory;
import CONF = BW.CONF;
import { BwRule } from "../../common/rule/BwRule";
import localMsg = G.localMsg;
import { ShellAction } from "../../../global/action/ShellAction";

declare let ReconnectingWebSocket: any;

export = class webscoket {
    private ws;
    private hint: Hints;
    constructor(private props) {
        let network, user = User.get(), self = this;
        let single = tools.isMb ? '/single/' : '/pc/';


        if (!user.userid) {
            user.userid = 'null';
        }
        if ('WebSocket' in window) {
            self.ws = new ReconnectingWebSocket(props.wsUrl + '/websocket/' + user.userid + single + BwRule.getSqlRandom(), null, { debug: true, reconnectInterval: 1000 });
            // self.ws = new ReconnectingWebSocket(props.wsUrl+'/sql/websocket/' + BwRule.getSqlRandom(),null,{ debug:true,reconnectInterval:1000});
        } else {
            Modal.toast('您的浏览器不支持websocket.');
            return;
        }

        let heartCheck = {
            timeout: 55000,        // 55s发一次心跳，比server端设置的连接时间稍微小一点，在接近断开的情况下以通信的方式去重置连接时间。
            serverTimeoutObj: null,
            reset: function () {
                clearTimeout(this.timeoutObj);
                clearTimeout(this.serverTimeoutObj);
                return this;
            },
            start: function () {
                this.serverTimeoutObj = setInterval(function () {
                    if (self.ws.readyState == 1) {
                        // console.log("连接状态，发送消息保持连接");
                        self.ws.send(JSON.stringify({ reqType: "ping" }));
                        heartCheck.reset().start();    // 如果获取到消息，说明连接是正常的，重置心跳检测
                    }
                }, this.timeout)
            }
        };

        // console.info("创建websocket对象成功.");
        self.ws.onopen = () => {
            heartCheck.reset().start();
            console.info("websocket 连接打开.");
            require(['messagePage'], (messagePage) => {
                messagePage.setSysBadge();
            });

        };
        self.ws.onmessage = (r) => {
            heartCheck.reset().start();
            self.onMessage(r);
        };
        self.ws.onerror = function (e) {
            // console.warn("websocket出现异常."+e);
        };
        self.ws.onclose = function (e) {
            // console.info("websocket连接关闭.");
        };
        document.addEventListener("netchange", () => {
            // console.log('检查网络变化.');
            if (network == 1) {
                if (self.ws) {
                    // console.log('离开网络.');
                } else {
                    // console.log('连接服务器的websocket通道已经关闭.');
                }
            } else if (network == 3) {
                if (self.ws) {
                    // console.log('连上wifi.');
                    self.ws.refresh();
                } else {
                    // console.log('连接服务器的websocket通道已经关闭.');
                }
            } else if (network == 6) {
                if (self.ws) {
                    // console.log('连上4g.');
                    self.ws.refresh();
                } else {
                    // console.log('连接服务器的websocket通道已经关闭.');
                }
            }
        });
    }

    private onMessage(r) {
        let data = JSON.parse(r.data), type = data.respType, self = this;
        switch (type) {
            case "notify":
                let dataMap = data.data.dataMap[0];
                //let messageAction = new MessageAction();
                let message = new Message({
                    sender: tools.str.toEmpty(dataMap.sender),
                    content: tools.str.toEmpty(dataMap.content.content),
                    link: tools.isEmpty(dataMap.content.link) ? "" : self.props.mgrPath + dataMap.content.link,
                    time: tools.str.toEmpty(dataMap.createDate),
                    num: data.data.dataMap.length
                });
                let arr = G.localMsg.get();
                var obj = {};
                var local = [];
                local = arr.reduce(function (item, next) {
                    obj[next.notifyId] ? '' : obj[next.notifyId] = true && item.push(next);
                    return item;
                }, []);
                let newLocal = [];
                data.data.dataMap.forEach(item => {
                    if (local.length == 0) {
                        newLocal.push(item)
                    } else {
                        let status = false;
                        local.forEach(child => {
                            if (item.notifyId !== child.notifyId) {
                                status = true;
                            }
                        })
                        if (status) {
                            newLocal.push(item)
                        }
                    }

                })

                G.localMsg.add(newLocal);
                if (tools.isMb) {
                    let unreadMsgNum = d.query('#unreadMsgNum'),
                        num = localMsg.getUnreadCount();
                    if (unreadMsgNum) {
                        if (num > 0) {
                            unreadMsgNum.classList.remove('hide');
                            unreadMsgNum.innerText = num + '';
                        }
                    }
                    tools.event.fire(BwRule.FRESH_SYS_MSG);//刷新信息
                    // G.Shell.other.sendMsgCount({ MsgCount: localMsg.getUnreadCount() }, () => { })
                    require(['messagePage'], (messagePage) => {
                        messagePage.setSysBadge();
                    });
                }
                let os = BW.sys.os;
                if (os === 'ip' || os === 'ad') {
                    if (os !== 'ip') {
                        BW.sys.ui.notice({
                            msg: JSON.stringify(message.toString())
                        });
                    }
                    tools.event.fire('newMsg', JSON.stringify(data.data.dataMap));
                } else if (os === 'pc') {
                    let listData = data.data.dataMap;
                    listData.forEach(obj => {
                        let url = CONF.siteUrl + obj.content.link;
                        new Notify({
                            title: obj.content.caption || '消息提示',
                            content: obj.content.content,
                            onClick: () => {
                                localMsg.read(dataMap.notifyId);
                                if (sysPcHistory.indexOf(url) >= 0) {
                                    sys.window.refresh(url);
                                }

                                sys.window.open({
                                    url: url ? url : CONF.url.msgList,
                                    title: '消息'
                                });
                            }
                        })
                    });
                }


                let jsonMsg = {
                    "reqType": data.respType,
                    "userId": data.data.userId,
                    'notifyIds': data.data.notifyIds
                };
                self.ws.send(JSON.stringify(jsonMsg));

                break;
            case "sql":
                let content = d.query('#sqlMonitorContent', document.body);
                if (content) {
                    let pageContainer = d.closest(content, '.page-container');
                    for (let i = 0, l = data.data.length; i < l; i++) {
                        d.append(content, document.createElement('br'));
                        d.append(content, data.data[i].replace(/\t/g, "\u00A0\u00A0\u00A0\u00A0").replace(/\n/g, ""));
                    }
                    d.append(content, document.createElement('br'));
                    pageContainer.scrollTop = content.scrollHeight;
                }
                break;
            case "hint":
                if (tools.isMb) {
                    return
                }
                if (this.hint) {
                    this.hint.destroy();
                }
                this.hint = new Hints({
                    data: data.data
                });
                break;
            case "qrcodelogin":
                this.openLoginModal(data.data);
                break;
            case "ping":
                // let num = Math.random();
                // let a = [{
                //     "notifyId": num,
                //     "notifyType": 2,
                //     "sender": "CMS3",
                //     "isread": 0,
                //     "objectName": "LinkMsg",
                //     "content": {
                //         "content": "随便" + num,
                //         "link":''
                //     },
                //     "createDate": "2019-04-10 19:40:21"
                // }]
                // G.localMsg.add(a);
                // tools.event.fire(BwRule.FRESH_SYS_MSG);//刷新信息
                // new Message({
                //     sender: tools.str.toEmpty(a[0].sender),
                //     content: tools.str.toEmpty(a[0].content.content),
                //     link: tools.isEmpty(a[0].content.link) ? "" : self.props.mgrPath + a[0].content.link,
                //     time: new Date().toLocaleTimeString(),
                //     num: 2
                // });

                break;
            default:
                console.info("后台返回未知的消息(" + type + ")类型.");
                break;
        }
    }
    // 节流
    protected throttle(delay, action) {
        let last = 0;
        return function () {
            var curr = +new Date();
            if (curr - last > delay) {
                action.apply(this, arguments);
                last = curr;
            }
        }
    }
    private handleUrl(code: string) {
        BwRule.Ajax.fetch(CONF.siteUrl + "/app_sanfu_retail/null/commonsvc/scan", {
            data: {
                code: code
            }
        }).then(({ response }) => {
            let list = response.next.vars;

            // 判断是扫码登陆还是扫码跳转
            // type = 0 登录
            // type = 1 跳转
            if (response.next.type == 1) {
                if (list && response.next.url) {
                    sys.window.open({
                        url: CONF.siteUrl + response.next.url + '?' + list[0] + '=' + code
                    })
                }
            } else {
                if (list && list.indexOf("code") > -1) {
                    this.requestUrl(CONF.siteUrl + response.next.url, code);
                }
            }
        })
    }
    private requestUrl(url: string, code: string | number) {
        BwRule.Ajax.fetch(url, {
            data: {
                code: code
            }
        }).then(({ response }) => {
            if (Number(response.state) === 1) {
                this.openLoginModal(code);
            } else {
                Modal.toast(response.msg)
            }
        })
    }
    //打开确认登录的弹窗，1：用户手动点击扫码  2：webscoket自动推送扫描
    private openLoginModal(lgToken: string | number) {
        let dom = <div class="login_modal_page">
            <div className="isLogin_modal">
                <p className="login_pic"><i class="iconfont icon-weibiaoti-"></i></p>
                <p className="login_tip">将在电脑上登录速狮软件</p>
                <button className="login_btn" id="js_scan_login">登录</button>
                <p className="login_cancel" id="js_cancal_login">取消登录</p>
            </div>;

        </div>
        if (!d.query(".isLogin_modal")) {
            d.append(document.body, dom);
            let cancelBtn = d.query("#js_cancal_login")
            d.on(cancelBtn, "click", () => {
                this.req_cancelLogin(lgToken)
            })
            let loginBtn = d.query("#js_scan_login", dom);
            d.on(loginBtn, "click", () => {
                this.req_sureLogin(lgToken);
            })
        }
    }
    private req_cancelLogin(lgtoken: string | number) {
        BwRule.Ajax.fetch(CONF.siteUrl + "/app_sanfu_retail/null/codelogin/change", {
            data: {
                code: lgtoken,
                action: "cancel"
            }
        }).then(({ response }) => {
            let state = Number(response.state);
            if (state === 1) {
                d.query(".login_modal_page").remove();
            }

        })
    }
    private req_sureLogin(lgtoken: string | number) {
        //lgtoken=XXXXXX&userid=xxx  & token=XXXXX
        let userid = JSON.parse(localStorage.getItem("userInfo")).userid,
            token = localStorage.getItem("token");
        BwRule.Ajax.fetch(CONF.siteUrl + "/app_sanfu_retail/null/codelogin/change", {
            data: {
                code: lgtoken,
                userid: userid,
                token: token
            }
        }).then(({ response }) => {
            d.query(".login_modal_page").remove();
        })
    }
    private messageDom(listData) {
        return <li class="unread" data-url={listData.content.link} data-notifyid={listData.notifyId}>
            <a href="javascript:void(0)" class="unread">
                <div class="clearfix">
                    <div class="thread-content">
                        <span class="preview">{listData.content.content}</span>
                        <span class="time">{listData.createDate}</span>
                    </div>
                </div>
            </a>
        </li>;
    }
}