namespace BW {
    import d = G.d;
    import tools = G.tools;

    export class SYSIP implements SYS_Type {
        public os: string;
        public isMb: boolean;
        public window = (function (self) {
            return {
                backHome: function () {
                    self.handle('backHome');
                },
                open: function (o: winOpen) {
                    if (typeof o.data === "object") {
                        o.data = JSON.stringify(o.data);
                    }
                    window.localStorage.setItem('viewData', JSON.stringify(o.extras));
                    let dict = {
                        url: o.url,
                        // header: o.header || {},
                        header: o.header,
                        event: "windowData",
                        extras: {viewData: JSON.stringify(o.extras)},
                        data: o.data
                    };
                    // self.handle('open', dict);
                    // self.window.getGps((gps) => {
                    //
                    //     if(gps.success) {
                    //         dict.header = Object.assign({position: JSON.stringify(gps.msg)}, dict.header || {});
                    //         self.handle('open', dict);
                    //     }else{
                    //         alert('gps获取失败, 请重试');
                    //     }
                    // })

                    new Promise(((resolve, reject) => {
                        if (o.gps) {
                            self.window.getGps((gps) => {
                                if (gps.success) {
                                    resolve(gps.gps)
                                } else {
                                    reject(gps.msg);
                                }
                            })
                        } else {
                            resolve({})
                        }
                    })).then(gps => {
                        o.header = gps ? Object.assign(o.header || {}, {position: JSON.stringify(gps)}) : o.header;
                        self.handle('open', o);
                    }).catch(reason => {
                        alert(reason)
                    });

                },
                close: function (event: string, data: obj) {
                    let dict: obj = {};
                    dict.data = data;
                    dict.event = event;
                    self.handle('close', dict);
                },
                load: function (url: string, data?) {
                    let dict: obj = {};
                    dict.url = url;
                    dict.data = data;
                    dict.event = "windowData";
                    self.handle('load', dict);
                },
                back: function (event: string, data: obj) {
                    let dict: obj = {};
                    dict.event = event;
                    dict.data = data;
                    self.handle('back', dict);
                },
                wake: function (event, data) {
                    let dict: obj = {};
                    dict.data = data;
                    dict.event = event;
                    self.handle('wake', dict);
                },
                opentab: function (userid = '', accessToken = '', noShow?: string[], data = {}) {
                    let ja = [
                        {icon: "home", name: "首页", url: BW.CONF.url.home, show: 0},
                        {icon: "contacts", name: "通讯", url: BW.CONF.url.contact, show: 0},
                        {icon: "message", name: "消息", url: BW.CONF.url.message, show: 0},
                        {icon: "myselfMenu", name: "我的", url: BW.CONF.url.myselfMenu, show: 0}
                    ];

                    noShow && noShow.forEach((name) => {
                        for (let key in ja) {
                            if (ja[key].icon === name) {
                                ja[key].show = 1;
                            }
                        }
                    });
                    let dict = {
                        data: JSON.stringify(ja),
                        userid,
                        accessToken,
                        siteUrl: BW.CONF.siteAppVerUrl
                    };
                    for(let key in data){
                        dict[key] = data[key];
                    }
                    self.handle('opentab', dict);
                },
                logout: function (url: string = CONF.url.login) {

                    this.getDevice("uuid");
                    d.once(window, 'getDevice', function (e: CustomEvent) {
                        let json = JSON.parse(e.detail);
                        if (json.success) {
                            let uuid = json.msg.uuid;
                            url = tools.url.addObj(url, {uuid});
                            self.handle('logout', {url: url});

                        }
                    });
                },
                uploadVersion: function (version: string) {
                    self.handle('uploadVersion', {"url": BW.CONF.siteUrl, "code": version});
                },
                quit: function () {
                    self.handle('quit');
                },
                copy: function (text: string) {
                    text = G.tools.str.toEmpty(text).trim();
                    self.handle('copy', {data: text});
                    toast('复制成功');
                },
                getGps: function (callback: Function) {

                    // self.handle('getGps',dict);
                    // d.once(window, 'putGps', function (e: CustomEvent) {
                    //     let json = JSON.parse(e.detail);
                    //     callback(json);
                    // });

                    self.handle('getGps', {type: 1, event: "putGps"});

                    let timer = setTimeout(() => {
                        d.off(window, 'putGps', handler);
                        callback({success: false, msg: '定位服务未开启,请进入系统设置>隐私>定位服务中打开开关,并允许App使用定位服务'});
                    }, 1000);

                    let handler = function (e: CustomEvent) {
                        d.off(window, 'putGps', handler);
                        clearTimeout(timer);
                        try {
                            let data = JSON.parse(e.detail);

                            // alert(e.detail);
                            if (data.success) {
                                data.gps = data.msg
                            } else {
                                data.msg = '定位服务未开启,请进入系统设置>隐私>定位服务中打开开关,并允许App使用定位服务';
                            }
                            callback(data);
                        } catch (e) {
                            callback({success: false, msg: '定位服务未开启,请进入系统设置>隐私>定位服务中打开开关,并允许App使用定位服务'});
                        }

                    };
                    d.on(window, 'putGps', handler);
                },
                openGps: function () {
                    self.handle('openGps');
                },
                update: function () {
                    self.handle('checkUpdate');
                },
                clear: function () {
                    self.handle('clear');
                },
                getDevice: function (key) {
                    let dict: obj = {};
                    if (!G.tools.isEmpty(key)) {
                        dict.key = key;
                    }
                    dict.event = "getDevice";
                    self.handle('getDevice', dict);
                },
                openImg: function (url: string) {
                    let dict: obj = {};
                    dict.url = url;
                    self.handle('openImg', dict);
                },
                download: function (url: string) {
                    let dict: obj = {};
                    dict.url = url;
                    self.handle('download', dict);
                },
                touchid: function (callback) {
                    let event = "touchidCallback";
                    self.handle('touchid', {event: event});
                    d.once(window, event, function (e) {
                        callback(e);
                    });
                },
                wechatin: function (callback) {
                    let event = "wechatCallback";
                    self.handle('wechatin', {event: event});
                    d.once(window, event, function (e) {
                        callback(e);
                    });
                },
                firePreviousPage: function () {

                },
                fire: function (type: string, data?: obj,) {
                    tools.event.fire(type, data, window);
                },
                getFile: function (callback: (file: CustomFile[]) => void, multi: boolean = false, accpet: string, error: Function) {
                    let event = '__EVT_GET_IMG_BY_DEVICE__',
                        handler = null;
                    d.on(window, event, handler = function (response: CustomEvent) {
                        d.off(window, event, handler);
                        try {
                            let detail = JSON.parse(response.detail);

                            if (detail.success && detail.msg) {
                                let data = detail.msg;
                                let file = tools.base64ToFile(data.dataurl, data.filename);
                                callback && callback([file]);
                            } else {
                                error && error(detail);
                            }
                        } catch (e) {
                            error && error();
                        }
                    });
                    self.handle('getImg', {event});
                },
                getEditImg(image: string | Function, callback?: Function) {
                    if (typeof image === 'function') {
                        callback = image;
                        image = '';
                    }
                    let event = '__EVT_GET_EDIT_IMG_BY_DEVICE__';
                    d.once(window, event, (response: CustomEvent) => {
                        let detail = JSON.parse(response.detail);

                    });
                    self.handle('getSignImg', {event, type: 1, image});
                },
                getSign(callback: Function, error?: Function) {
                    let event = '__EVT_GET_SIGN_BY_DEVICE__';
                    d.once(window, event, (response: CustomEvent) => {
                        try {
                            let detail = JSON.parse(response.detail);

                            if (detail.success && detail.msg) {
                                let data = detail.msg;
                                let file = tools.base64ToFile(data.dataurl, data.filename);
                                callback && callback([file]);
                            } else {
                                error && error(detail.msg || '');
                            }
                        } catch (e) {
                            error && error('获取图片失败');
                        }
                    });
                    self.handle('getSignImg', {event, type: 0});
                },
                reOpen: function (o: winOpen) {
                    self.handle('reOpen', o);
                },
                toClient: function () {
                    self.handle('toClient');
                },
                clientCode: function (callback) {
                    let event = '__EVT_TO_CLIENT__';
                    d.once(window, event, (response: CustomEvent) => {
                        try {
                            let detail = JSON.parse(response.detail);
                            if (detail.success) {
                                let data = detail.data,
                                    content = data.content;
                                if (content && content.appUrls) {
                                    let urls = content.appUrls,
                                        html = '<option value="">-select-</option>';
                                    urls.forEach((item) => {
                                        html += `<option value="${item.envUrl}">${item.envName}</option>`;
                                    });
                                    callback(html);
                                }
                            }
                        } catch (e) {
                            alert("JSON解析出错")
                        }
                    });
                    self.handle('clientCode', {back: event});
                },
                refreshHome() {
                    self.handle('refreshHome');
                }
            }
        })(this);


        public ui = (function (self) {
            return {
                notice: function (obj) {
                    let dict: obj = {};
                    dict.data = obj.msg;
                    self.handle('callMsg', dict);
                },
            }
        })(this);

        private handle(action: string, dict?: obj) {
            if (tools.isEmpty(dict)) {
                dict = {};
            }
            dict.action = action;

            webkit.messageHandlers.AppShell.postMessage(dict);
        }
    }

}
