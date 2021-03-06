// import GLOBAL_CONF = require('conf.ts');
// import tools = require('tools');
interface ICloseConfirmPara {
    condition?: () => boolean | Promise<boolean>;
    msg?: string;
    btn?: string[],
    noHandler?: Function;
}
namespace BW{
    import d = G.d;
    declare const AppShell :any;
    import tools = G.tools;


    export class SYSAD implements SYS_Type{
        public os: string;
        public isMb : boolean;

        public window = (function(self) {
            let closeConfirmConfig: ICloseConfirmPara = null;
            return {
                backHome: function (){},
                open: function (o: winOpen) {
                    if (typeof o.data === "string") {
                        o.data = JSON.parse(o.data);
                    }
                    o.extras = {viewData: JSON.stringify(o.extras)};

                    new Promise(((resolve, reject) => {
                        if(o.gps) {
                            self.window.getGps((gps) => {
                                if(gps.success) {
                                    resolve(gps.gps)
                                }else{
                                    reject(gps);
                                }
                            })
                        }else{
                            resolve({})
                        }
                    })).then(gps => {
                        o.header = gps ? Object.assign(o.header || {}, {position: gps}) : o.header;
                        self.handle('open', JSON.stringify(o));
                    }).catch(reason =>{
                        if(!reason.flag){
                            alert('gps未打开, 点击确定去开启.');
                            self.window.openGps();
                        } else {
                            alert(reason.msg);
                        }
                    });
                },
                set closeConfirm(obj: ICloseConfirmPara) {
                    if(obj) {
                        closeConfirmConfig = Object.assign({msg: '是否关闭页面？'}, obj);
                    } else {
                        closeConfirmConfig = null;
                    }
                },
                close: function (event: string, data: obj) {
                    closeConfirmConfig = closeConfirmConfig || {};
                    let {msg, noHandler, btn, condition} = closeConfirmConfig ;
                    if(msg && typeof condition !== 'function') {
                        condition = () => true;
                    }
                    if(msg) {
                        let flagPromise =  condition() ;
                        if(!(flagPromise instanceof Promise)){
                            flagPromise = Promise.resolve(!!flagPromise);
                        }
                        flagPromise.then(flag => {
                            if(!flag){
                                close();
                                return;
                            }
                            require(['Modal'], function (m) {
                                m.Modal.confirm({
                                    msg:  msg,
                                    btns: btn ? btn : ['不关闭', '关闭'],
                                    callback: (flag: boolean) => {
                                        if(flag){
                                            tools.isFunction(noHandler) && noHandler();
                                        }else{
                                            close();
                                        }
                                    }
                                })
                            })
                        });

                        return;
                    }

                    close();
                    function close(){
                        self.handle('close', '{event:"' + event + '",data:"' + data + '"}');
                    }
                },
                load: function (url: string, data) {
                    self.handle('load', '{url:"' + url + '",event:"windowData",data:"' + data + '"}');
                },
                back: function (event: string, data: object) {
                    self.handle('back', '{event:"' + event + '",data:"' + data + '"}');
                },
                wake: function (event, data) {
                    self.handle('wake', '{event:"' + event + '",data:"' + data + '"}');
                },
                opentab: function (userid = '', accessToken = '') {
                    let ja = [
                        {icon: "home", name: "首页", url: CONF.url.home},
                        {icon: "contacts", name: "通讯", url: CONF.url.contact},
                        {icon: "message", name: "消息", url: CONF.url.message},
                        {icon: "myselfMenu", name: "我的", url: CONF.url.myselfMenu}
                    ];
                    let dict = {
                        data: JSON.stringify(ja),
                        userid,
                        accessToken
                    };
                    self.handle('opentab', JSON.stringify(dict));
                },
                logout: function (url: string = CONF.url.index) {
                    let uuid = this.getDevice("uuid").msg;
                    url = tools.url.addObj(url, {uuid});
                    self.handle('logout', '{url:"' + url + '"}');
                },
                quit: function () {
                    self.handle('quit');
                },
                copy: function (text: string) {
                    text = tools.str.toEmpty(text).trim();
                    self.handle('copy', '{data:"' + text + '"}');
                    toast('复制成功');
                },
                getGps: function (callback: Function) {
                    self.handle('getGps', '{type:1,event:"putGps"}');

                    toast('gps获取中, 请稍等');

                    let timer = setTimeout(() => {
                        d.off(window, 'putGps', handler);
                        callback({success: false, msg: '获取gps超时, 请重试...'});
                    }, 5000);


                    let handler = function (e: CustomEvent) {
                        d.off(window, 'putGps', handler);
                        clearInterval(timer);

                        // alert(e.detail);
                        let json = JSON.parse(e.detail);
                        // json.success = !!json.gps;
                        callback(json);
                    };
                    d.on(window, 'putGps', handler);
                },
                openGps: function() {
                    self.handle('openGps');
                },
                update: function () {
                    self.handle('checkUpdate');
                    toast('已经是最新版本');
                },
                clear: function () {
                    self.handle('clear');
                },
                getDevice: function (key) {
                    if (tools.isEmpty(key)) {
                        return self.handle('getDevice');
                    } else {
                        return self.handle('getDevice', '{key:' + key + '}');
                    }
                },
                openImg: function (url: string) {
                    self.handle('openImg', '{url:"' + url + '"}');
                },
                download: function (url: string) {
                    self.handle('download', '{url:"' + url + '"}');
                },
                touchid: function (callback) {
                    let event = "touchidCallback";
                    self.handle('touchid', '{event:"' + event + '"}');
                    d.once(window, event, function (e) {
                        callback(e);
                    });
                },
                wechatin: function (callback) {
                    let event = "wechatCallback";
                    self.handle('wechatin', '{event:"' + event + '"}');
                    d.once(window, event, function (e) {
                        callback(e);
                    });
                },
                firePreviousPage: function () {

                },
                fire: function (type: string, data?: obj) {
                    tools.event.fire(type, data, window);
                },
                scan: function (event: string) {

                    self.handle('scan', '{event:"' + event + '"}');
                },
                shake: function (event: string) {
                    self.handle('shake', '{event:"' + event + '"}');
                },
                powerManager: function () {
                    this.adHandle('powerManager', '');
                },
                whiteBat: function () {
                    this.adHandle('whiteBat', '');
                }
            }
        })(this);

        public ui = (function(self){
            return {
                notice: function (obj) {
                    self.handle('callMsg',obj.msg);
                }
            }
        })(this);

        private handle (action:string,dict?:string) {
            if(tools.isEmpty(dict)){
                return JSON.parse(AppShell.postMessage(action));
            }else{
                return JSON.parse(AppShell.postMessage(action,dict));
            }
        }
    }

}
