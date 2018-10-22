///<amd-module name="Finger"/>
define("Finger", ["require", "exports", "ShellAction", "Modal", "Button", "InputBox", "IDB"], function (require, exports, ShellAction_1, Modal_1, Button_1, InputBox_1, IDB_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var Finger = /** @class */ (function () {
        function Finger(conf) {
            var _a;
            this.erp = null;
            this.db = null; //IDB
            this.DBConf = {
                storeName: '',
                version: 1
            };
            this.verify = '0';
            /*
            * 指纹数据获取成功调用success
            * success返回一个参数FingerEvent
            * */
            this._success = function () {
            };
            /*
            * _callFinger接收一个参数text
            * 实时返回指纹设备的信息
            * */
            this._callFinger = function () {
            };
            this.erp = ShellAction_1.ShellAction.get().erp();
            //修改默认配置
            for (var attr in conf) {
                this.DBConf[attr] = conf[attr];
            }
            this.storeConf = (_a = {},
                _a[this.DBConf.storeName] = ['userid', 'prints'] //[type0,type1,type2]
            ,
                _a);
            //指纹方法调用
            this.erp.callFinger({ type: 0 });
            this.callFingerMsg();
            this.setFinger();
        }
        /*
        * 再次调用指纹
        * */
        Finger.prototype.againOpen = function () {
            this.erp.callFinger({ type: 0 });
        };
        Object.defineProperty(Finger.prototype, "success", {
            set: function (cb) {
                this._success = cb;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Finger.prototype, "callFinger", {
            set: function (cb) {
                this._callFinger = cb;
            },
            enumerable: true,
            configurable: true
        });
        /*
        * 实时返回指纹设备的信息
        * */
        Finger.prototype.callFingerMsg = function () {
            var _this = this;
            this.erp.callFingerMsg({
                callback: function (event) {
                    var text = JSON.parse(event.detail);
                    _this._callFinger && _this._callFinger(text);
                }
            });
        };
        /*
        * 获取到指纹信息调用
        * */
        Finger.prototype.setFinger = function () {
            var _this = this;
            var self = this;
            self.erp.setFinger({
                callback: function (event) {
                    var text = JSON.parse(event.detail);
                    var print = text.msg.fingerPrint;
                    var type = text.msg.fingerType;
                    if (text.success) {
                        _this.findFinger(type, print);
                    }
                    else {
                        _this.againOpen();
                        Modal_1.Modal.alert('指纹获取失败！');
                    }
                }
            });
        };
        //创建模态框获取userid
        Finger.prototype.getUserId = function (type, print) {
            var self = this;
            var inputBox = new InputBox_1.InputBox({}), okBtn = new Button_1.Button({ content: '确定', type: 'primary', key: 'okBtn' });
            inputBox.addItem(okBtn);
            var submitUserId = function (fingerModal) {
                var userid = fingerModal.body.querySelector('input').value.toUpperCase();
                if (!tools.str.toEmpty(userid)) {
                    self.againOpen();
                    fingerModal.destroy();
                    Modal_1.Modal.toast('请重新录入指纹');
                }
                else {
                    fingerModal.destroy();
                    self.userid = userid;
                    var fingers = {
                        userid: userid,
                        type: type,
                        print: print,
                        verify: self.verify,
                    };
                    self._success && self._success(fingers);
                }
            };
            //创建模态框手动输入userID
            var fingerModal = new Modal_1.Modal({
                header: '登记本地指纹ID',
                isOnceDestroy: true,
                body: d.create("<div data-action=\"fingerModal\">\n                                        <form>\n                                            <label>\u8BF7\u8F93\u5165\u60A8\u7684\u5458\u5DE5\u53F7</label>\n                                            <input type=\"text\" >\n                                        </form>\n                                    </div>"),
                footer: {
                    rightPanel: inputBox
                },
                isBackground: false,
                onOk: function () {
                    submitUserId(fingerModal);
                },
                onClose: function () {
                    Modal_1.Modal.toast('请重新录入指纹');
                    self.againOpen();
                }
            });
            //自动获取焦点
            fingerModal.bodyWrapper.querySelector('input').focus();
            //表单提交触发onOK事件
            d.on(fingerModal.bodyWrapper.querySelector('form'), 'submit', function (ev) {
                ev.preventDefault();
                submitUserId(fingerModal);
            });
        };
        /*
        * 根据fingerType 和fingerPrint 获取indexedDB 中的userid
        * */
        Finger.prototype.findFinger = function (type, print) {
            var self = this;
            self.db = new IDB_1.IDB('fingerDB', self.DBConf.version, self.storeConf);
            self.db.success = function () {
                var store = self.db.collection(self.DBConf.storeName);
                store.find(function (val) {
                    // Modal.alert(val.prints['type' + type])
                    if (typeof val.prints['type' + type] === "undefined") {
                        return false;
                    }
                    var data = JSON.parse(self.erp.verifyFinger({
                        data: {
                            enterFinger: print,
                            matchFinger: val.prints['type' + type][0],
                            fingerType: type,
                        }
                    }).data);
                    return data.success;
                }, function (response) {
                    if (tools.isEmpty(response)) {
                        self.verify = '1';
                        self.type = type;
                        self.getUserId(type, print);
                    }
                    else {
                        self.verify = '0';
                        var fingers = {
                            userid: response[0].userid,
                            type: type,
                            print: print,
                            verify: self.verify,
                        };
                        self._success && self._success(fingers);
                    }
                });
            };
        };
        /*
        * indexedDB 无缓存的userid
        * 则调用addFinger 添加本地userid
        * */
        Finger.prototype.addFinger = function (print, callback) {
            var self = this, userid = self.userid, type = self.type;
            if (self.verify === '1' && typeof print !== 'undefined') {
                self.db = new IDB_1.IDB('fingerDB', self.DBConf.version, self.storeConf);
                self.db.success = function () {
                    var store = self.store = self.db.collection(self.DBConf.storeName);
                    /*
                    * 查询数据仓库是否有存在userid,
                    * 有就更新，没有就添加
                    * */
                    store.update(function (result) {
                        return (result.userid === userid);
                    }, function (result) {
                        result.userid = userid;
                        if (typeof result.prints['type' + type] === 'undefined') {
                            result.prints['type' + type] = [];
                        }
                        result.prints['type' + type].unshift(print);
                        if (result.prints['type' + type].length > 1) {
                            result.prints['type' + type].pop();
                        }
                        return result;
                    }, function () {
                        typeof callback === 'function' && callback();
                    }, function () {
                        var data = {
                            userid: userid,
                            prints: {
                                "type0": [],
                                "type1": [],
                                "type2": [],
                            },
                        };
                        data.prints['type' + type].push(print);
                        store.insert(data, function () {
                            typeof callback === 'function' && callback();
                        });
                    });
                };
            }
        };
        /*
        * 销毁
        * */
        Finger.prototype.destroy = function () {
            this.erp.cancelFinger();
            try {
                this.db.destroy();
            }
            catch (e) {
                console.log(e);
            }
        };
        return Finger;
    }());
    exports.Finger = Finger;
});

///<amd-module name="NewFinger"/>
define("NewFinger", ["require", "exports", "NewIDB", "Modal", "InputBox", "Button"], function (require, exports, NewIDB_1, Modal_1, InputBox_1, Button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Shell = G.Shell;
    var d = G.d;
    var tools = G.tools;
    var NewFinger = /** @class */ (function () {
        function NewFinger(para) {
            var _a;
            /*
            * 指纹数据获取成功调用_fingerFinish
            * _fingerFinish返回一个参数FingerEvent
            * */
            this._fingerFinish = function () { return Promise.resolve(); };
            para = para || {};
            this.autoCache = tools.isEmpty(para.autoCache) ? true : para.autoCache;
            this.callFinger = para.callFinger;
            this.fingerFinish = para.fingerFinish;
            this.IDB = new NewIDB_1.NewIDB({
                name: 'fingerDB',
                version: 2,
                tableConf: (_a = {},
                    _a[NewFinger.FINGER_TABLE] = ['userid', 'prints'],
                    _a)
            });
            this.initFingerOpen();
        }
        NewFinger.prototype.initFingerOpen = function () {
            var _this = this;
            console.log('<<<');
            Shell.finger.cancel();
            setTimeout(function () {
                Shell.finger.get({
                    type: 0,
                    option: 0
                }, function (ev) {
                    // console.log(ev);
                    if (ev.success) {
                        var print_1 = ev.data.finger, type = ev.data.fingerType;
                        _this.findFinger({ type: type, print: print_1 });
                    }
                    else {
                        // this.againOpen();
                        Modal_1.Modal.alert('指纹获取失败！');
                        _this.initFingerOpen();
                    }
                }, function (ev) {
                    /*
                    * 实时返回指纹设备的信息
                    * */
                    // console.log(ev);
                    _this._callFinger && _this._callFinger(ev.data.text);
                }, true);
            }, 100);
        };
        /*
        * 根据fingerType 和fingerPrint 获取indexedDB 中的userid
        * */
        NewFinger.prototype.findFinger = function (obj) {
            var _this = this;
            var type = obj.type, print = obj.print;
            this.IDB.getCollection(NewFinger.FINGER_TABLE).then(function (store) {
                store.find(function (val) {
                    // Modal.alert(val.prints['type' + type])
                    if (!val.prints['type' + type]) {
                        return false;
                    }
                    var matchPrint = val.prints['type' + type][0];
                    if (!matchPrint) {
                        return false;
                    }
                    var data = Shell.finger.verify(print, matchPrint, type);
                    return data.data.matched;
                }).then(function (response) {
                    new Promise(function (resolve, reject) {
                        var fingerObj;
                        if (tools.isEmpty(response)) {
                            fingerObj = {
                                userid: '',
                                type: type,
                                print: print,
                                verify: '1',
                            };
                            // fingerObj.verify = '1';
                            // fingerObj.type = type;
                            _this.getUserId(fingerObj).then(function (data) {
                                resolve(data);
                            }).catch(function () {
                                reject();
                            });
                        }
                        else {
                            fingerObj = {
                                userid: response[0].userid,
                                type: type,
                                print: print,
                                verify: '0',
                            };
                            resolve(fingerObj);
                        }
                    }).then(function (data) {
                        if (typeof _this.fingerFinish === 'function') {
                            _this.fingerFinish(data).finally(function () {
                                _this.autoCache && _this.addFinger(data).finally(function () {
                                    _this.initFingerOpen();
                                }).catch(function (e) {
                                    console.log(e);
                                });
                            });
                        }
                        else {
                            _this.autoCache && _this.addFinger(data).finally(function () {
                                _this.initFingerOpen();
                            }).catch(function (e) {
                                console.log(e);
                            });
                        }
                    }).catch(function (e) {
                        console.log(e);
                        Modal_1.Modal.toast('请重新获取指纹');
                        _this.initFingerOpen();
                    });
                });
            });
        };
        //创建模态框获取userid
        NewFinger.prototype.getUserId = function (fingerObj) {
            return new Promise(function (resolve, reject) {
                var inputBox = new InputBox_1.InputBox({}), okBtn = new Button_1.Button({ content: '确定', type: 'primary', key: 'okBtn' });
                inputBox.addItem(okBtn);
                var submitUserId = function () {
                    var userid = fingerModal.body.querySelector('input').value.toUpperCase();
                    if (!tools.str.toEmpty(userid)) {
                        // self.againOpen();
                        fingerModal.destroy();
                        Modal_1.Modal.toast('请重新录入指纹');
                        reject();
                    }
                    else {
                        fingerModal.destroy();
                        // self._success && self._success(fingers);
                        resolve(Object.assign(fingerObj, { userid: userid }));
                    }
                };
                //创建模态框手动输入userID
                var fingerModal = new Modal_1.Modal({
                    header: '登记本地指纹ID',
                    isOnceDestroy: true,
                    body: h("div", { "data-action": "fingerModal" },
                        h("form", null,
                            h("label", null, "\u8BF7\u8F93\u5165\u60A8\u7684\u5458\u5DE5\u53F7"),
                            h("input", { type: "text" }))),
                    footer: {
                        rightPanel: inputBox
                    },
                    isBackground: false,
                    onOk: function () {
                        submitUserId();
                    },
                    onClose: function () {
                        Modal_1.Modal.toast('请重新录入指纹');
                        // self.againOpen();
                        reject();
                    }
                });
                //表单提交触发onOK事件
                d.on(fingerModal.bodyWrapper.querySelector('form'), 'submit', function (ev) {
                    ev.preventDefault();
                    submitUserId();
                });
                // debugger;
                setTimeout(function () {
                    //自动获取焦点
                    fingerModal.bodyWrapper.querySelector('input').focus();
                }, 150);
            });
        };
        /*
        * indexedDB 无缓存的userid
        * 则调用addFinger 添加本地userid
        * */
        NewFinger.prototype.addFinger = function (fingerObj) {
            var _this = this;
            var userid = fingerObj.userid, type = fingerObj.type, print = fingerObj.print, verify = fingerObj.verify;
            return new Promise(function (resolve, reject) {
                if (verify === '1' && tools.isNotEmpty(print)) {
                    _this.IDB.getCollection(NewFinger.FINGER_TABLE).then(function (store) {
                        /*
                        * 查询数据仓库是否有存在userid,
                        * 有就更新，没有就添加
                        * */
                        store.update(function (result) {
                            return (result.userid === userid);
                        }, function (result) {
                            result = Object.assign({}, result || {});
                            result.userid = userid;
                            if (!result.prints) {
                                result.prints = {};
                            }
                            if (!result.prints['type' + type]) {
                                result.prints['type' + type] = [];
                            }
                            result.prints['type' + type].unshift(print);
                            if (result.prints['type' + type].length > 1) {
                                result.prints['type' + type].pop();
                            }
                            return result;
                        }).then(function () {
                            resolve();
                        }).catch(function () {
                            var data = {
                                userid: userid,
                                prints: {
                                    "type0": [],
                                    "type1": [],
                                    "type2": [],
                                },
                            };
                            data.prints['type' + type].push(print);
                            store.insert(data).then(function (e) {
                                console.log(e);
                                resolve(e);
                                store.findAll().then(function (e) { return console.log(e); }).catch(function (e) { return console.log(e); });
                            }).catch(function (e) {
                                console.log(e);
                                reject(e);
                            });
                        });
                    });
                }
                else {
                    reject();
                }
            });
        };
        Object.defineProperty(NewFinger.prototype, "callFinger", {
            get: function () {
                return this._callFinger;
            },
            set: function (cb) {
                this._callFinger = cb;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NewFinger.prototype, "fingerFinish", {
            get: function () {
                return this._fingerFinish;
            },
            set: function (cb) {
                this._fingerFinish = cb;
            },
            enumerable: true,
            configurable: true
        });
        /*
        * 销毁
        * */
        NewFinger.prototype.destroy = function () {
            Shell.finger.cancel();
            try {
                this.IDB.destroy();
            }
            catch (e) {
                console.log(e);
            }
        };
        NewFinger.FINGER_TABLE = 'fingers';
        return NewFinger;
    }());
    exports.NewFinger = NewFinger;
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
