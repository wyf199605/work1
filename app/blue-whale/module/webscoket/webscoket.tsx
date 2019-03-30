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
            this.scanHandle();
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
                //messageAction.saveMessage(message);
                // data.data.dataMap=[{"notifyId":8702026,"notifyType":2,"sender":"1000","isread":1,"objectName":"LinkMsg","content":{"content":"您有一封新邮件请查收！","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=345X0000093"},"createDate":"2019-03-26 10:39:47"},{"notifyId":8702026,"notifyType":2,"sender":"1000","isread":1,"objectName":"LinkMsg","content":{"content":"您有一封新邮件请查收！","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=345X0000093"},"createDate":"2019-03-26 10:39:47"},{"notifyId":8642024,"notifyType":2,"sender":"CMS3","isread":1,"objectName":"LinkMsg","content":{"content":"测试移动端消息提醒","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=345X0000090"},"createDate":"2019-03-25 09:46:29"},{"notifyId":8482027,"notifyType":2,"sender":"CW5","isread":1,"objectName":"LinkMsg","content":{"content":"Test040514","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001456"},"createDate":"2019-03-01 16:07:57"},{"notifyId":8482027,"notifyType":2,"sender":"CW5","isread":0,"objectName":"LinkMsg","content":{"content":"Test040514","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001456"},"createDate":"2019-03-01 16:07:57"},{"notifyId":8382024,"notifyType":2,"sender":"CMS3","isread":0,"objectName":"LinkMsg","content":{"content":"视频","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=345X0000063"},"createDate":"2019-01-24 11:31:36"},{"notifyId":7522027,"notifyType":1,"sender":"CW5","isread":0,"objectName":"LinkMsg","content":{"content":"55","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001080"},"createDate":"2018-12-13 11:06:27"},{"notifyId":7522026,"notifyType":1,"sender":"CMS3","isread":0,"objectName":"LinkMsg","content":{"content":"test1213","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=345X0000020"},"createDate":"2018-12-13 11:03:35"},{"notifyId":7522025,"notifyType":1,"sender":"CMS3","isread":0,"objectName":"LinkMsg","content":{"content":"test213","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=345X0000019"},"createDate":"2018-12-13 10:55:53"},{"notifyId":7522024,"notifyType":1,"sender":"CMS3","isread":0,"objectName":"LinkMsg","content":{"content":"test1123","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=345X0000018"},"createDate":"2018-12-13 10:53:10"},{"notifyId":7502037,"notifyType":1,"sender":"CW5","isread":0,"objectName":"LinkMsg","content":{"content":"Ghh","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001078"},"createDate":"2018-12-12 17:30:29"},{"notifyId":7502038,"notifyType":1,"sender":"CW5","isread":0,"objectName":"LinkMsg","content":{"content":"1231","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001079"},"createDate":"2018-12-12 17:31:40"},{"notifyId":7502035,"notifyType":1,"sender":"CW5","isread":0,"objectName":"LinkMsg","content":{"content":"1231","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001076"},"createDate":"2018-12-12 17:27:15"},{"notifyId":7502036,"notifyType":1,"sender":"CW5","isread":0,"objectName":"LinkMsg","content":{"content":"测评","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001077"},"createDate":"2018-12-12 17:28:28"},{"notifyId":7502034,"notifyType":1,"sender":"CW5","isread":0,"objectName":"LinkMsg","content":{"content":"1231","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001075"},"createDate":"2018-12-12 17:18:53"},{"notifyId":7502033,"notifyType":1,"sender":"1000","isread":0,"objectName":"LinkMsg","content":{"content":"发送消息公告测试1","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001074"},"createDate":"2018-12-12 17:12:59"},{"notifyId":7502032,"notifyType":1,"sender":"1000","isread":0,"objectName":"LinkMsg","content":{"content":"发送消息公告测试1","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001073"},"createDate":"2018-12-12 17:04:07"},{"notifyId":7502030,"notifyType":1,"sender":"1000","isread":0,"objectName":"LinkMsg","content":{"content":"发送消息公告测试1","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001071"},"createDate":"2018-12-12 16:51:38"},{"notifyId":7502031,"notifyType":1,"sender":"1000","isread":0,"objectName":"LinkMsg","content":{"content":"发送消息公告测试1","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001072"},"createDate":"2018-12-12 16:52:21"},{"notifyId":7502027,"notifyType":1,"sender":"1000","isread":0,"objectName":"LinkMsg","content":{"content":"发送消息公告测试1","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001068"},"createDate":"2018-12-12 16:36:57"},{"notifyId":7502028,"notifyType":1,"sender":"1000","isread":0,"objectName":"LinkMsg","content":{"content":"发送消息公告测试1","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001069"},"createDate":"2018-12-12 16:37:07"},{"notifyId":7502029,"notifyType":1,"sender":"1000","isread":0,"objectName":"LinkMsg","content":{"content":"发送消息公告测试1","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001070"},"createDate":"2018-12-12 16:37:21"},{"notifyId":7502024,"notifyType":1,"sender":"1000","isread":0,"objectName":"LinkMsg","content":{"content":"发送消息公告测试1","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001065"},"createDate":"2018-12-12 16:20:36"},{"notifyId":7502026,"notifyType":1,"sender":"1000","isread":0,"objectName":"LinkMsg","content":{"content":"发送消息公告测试1","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001067"},"createDate":"2018-12-12 16:21:00"},{"notifyId":7502025,"notifyType":1,"sender":"1000","isread":0,"objectName":"LinkMsg","content":{"content":"发送消息公告测试1","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001066"},"createDate":"2018-12-12 16:20:46"},{"notifyId":7482049,"notifyType":2,"sender":"1000","isread":0,"objectName":"LinkMsg","content":{"content":"消息提醒测试！","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001064"},"createDate":"2018-12-12 15:43:41"},{"notifyId":7482039,"notifyType":3,"sender":"hy87","isread":0,"objectName":"LinkMsg","content":{"content":"信息测试！","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=345X0000016"},"createDate":"2018-12-12 14:53:10"},{"notifyId":7482038,"notifyType":3,"sender":"hy87","isread":0,"objectName":"LinkMsg","content":{"content":"信息测试！","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=345X0000013"},"createDate":"2018-12-12 14:52:14"},{"notifyId":7482033,"notifyType":3,"sender":"hy87","isread":0,"objectName":"LinkMsg","content":{"content":"信息测试！","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001053"},"createDate":"2018-12-12 14:47:38"},{"notifyId":7482034,"notifyType":3,"sender":"hy87","isread":0,"objectName":"LinkMsg","content":{"content":"信息测试！","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=345X0000011"},"createDate":"2018-12-12 14:48:21"},{"notifyId":7482031,"notifyType":3,"sender":"hy87","isread":0,"objectName":"LinkMsg","content":{"content":"信息测试！","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001051"},"createDate":"2018-12-12 14:26:52"},{"notifyId":7462024,"notifyType":2,"sender":"1000","isread":0,"objectName":"LinkMsg","content":{"content":"您有一封新邮件请查收！","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=345X0000008"},"createDate":"2018-12-11 17:07:28"},{"notifyId":7442024,"notifyType":2,"sender":"1000","isread":0,"objectName":"LinkMsg","content":{"content":"您有一封新邮件请查收！","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001040"},"createDate":"2018-12-11 16:52:20"},{"notifyId":7442025,"notifyType":2,"sender":"1000","isread":0,"objectName":"LinkMsg","content":{"content":"您有一封新邮件请查收！","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001041"},"createDate":"2018-12-11 16:53:05"},{"notifyId":7422055,"notifyType":2,"sender":"1000","isread":0,"objectName":"LinkMsg","content":{"content":"您有一封新邮件请查收！","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=ZBZX0001038"},"createDate":"2018-12-11 16:28:01"},{"notifyId":7422051,"notifyType":2,"sender":"1000","isread":0,"objectName":"LinkMsg","content":{"content":"您有一封新邮件请查收！","link":"/app_sanfu_retail/v1/ui/view/n1092_data-3?mailid=345X0000006"},"createDate":"2018-12-11 16:26:25"}];
                let local = G.localMsg.get();//JSON.parse(localStorage.getItem("local_msg_CMS3"));
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
                break;
            default:
                console.info("后台返回未知的消息(" + type + ")类型.");
                break;
        }
    }
    private scanHandle = () => {
        let scanBtn = d.query("#scan_btn");
        let flag = false;
        d.on(scanBtn, "click", () => {
            if (flag) {
                return false;
            }
            flag = true;
            setTimeout(() => {
                flag = false;
            }, 1500);
            ShellAction.get().device().scan({
                callback: (event) => {
                    let detail = JSON.parse(event.detail);
                    this.handleUrl(detail.data);
                }
            });
        })
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