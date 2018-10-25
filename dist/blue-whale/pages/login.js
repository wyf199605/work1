define("LoginPage", ["require", "exports", "Modal", "User", "Device", "BwRule", "CheckBox", "Button", "FqaModal", "UnBinding", "NewFinger"], function (require, exports, Modal_1, User_1, Device_1, BwRule_1, checkBox_1, Button_1, fqa_1, UnBinding_1, NewFinger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="LoginPage"/>
    var sys = BW.sys;
    var tools = G.tools;
    var CONF = BW.CONF;
    var d = G.d;
    var Shell = G.Shell;
    /**
     * 移动和电脑的登录页面
     */
    var LoginPage = /** @class */ (function () {
        function LoginPage(props) {
            var _this = this;
            this.props = props;
            /**
             * 微信登录
             */
            this.wechatChick = function () {
                if (!_this.validReg()) {
                    return;
                }
                if (sys.os === 'ad' || sys.os === 'ip') {
                    sys.window.wechatin(function (e) {
                        var json = JSON.parse(e.detail);
                        if (json.success) {
                            _this.ajaxLogin(CONF.ajaxUrl.loginWeiXin, {
                                openid: json.msg.unionid
                            });
                        }
                        else {
                            if (json.msg == 1) {
                                Modal_1.Modal.toast("操作取消");
                            }
                            else if (json.msg == 2) {
                                Modal_1.Modal.toast("登录请求被微信拒绝");
                            }
                            else if (json.msg == 3) {
                                Modal_1.Modal.toast("请安装微信客户端后再使用");
                            }
                            else {
                                Modal_1.Modal.toast(json.msg);
                            }
                        }
                    });
                }
            };
            var response = props.responseBean;
            this.device = Device_1.Device.get();
            this.deviceUpdate();
            if (response && response.body && response.body.bodyList && response.body.bodyList[0]) {
                var dataList = response.body.bodyList[0].dataList;
                var meta = response.body.bodyList[0].meta;
                response.data = BwRule_1.BwRule.getCrossTableData(meta, dataList);
                if (response.data && response.data[0] && response.data[0].AUTH_CODE) {
                    this.device.auth_code = response.data[0].AUTH_CODE;
                }
                else {
                    this.device.auth_code = '';
                }
            }
            else {
                this.device.auth_code = '';
            }
            this.loadPassword();
            this.initEvent(props);
            if (sys.isMb) {
                sys.window.close = double_back;
            }
            // sys.window.getGps(() =>{});
            // sys.window.openGps();
            // let fqa = new FqaModal({
            //     container: document.body
            // });
        }
        /*
        * 手机短信验证登录
        * */
        LoginPage.prototype.phoneVerify = function () {
            var _this = this;
            // 初始化页面
            var body = d.create('<div class="login-wrapper modal-body-login"></div>');
            var title = d.create('<div class="login-title">短信验证码登录</div>');
            var form = d.create("\n        <form action=\"#\" class=\"login-form\">\n            <div class=\"form-group\">\n                <input class=\"tel\" type=\"text\" placeholder=\"\u8BF7\u8F93\u5165\u624B\u673A\u53F7\u7801\"/>\n            </div>\n            <div class=\"form-group\">\n                <input class=\"code\" type=\"text\" placeholder=\"\u8BF7\u8F93\u5165\u77ED\u4FE1\u9A8C\u8BC1\u7801\"/>\n            </div>\n            <div class=\"btn-group\"></div>\n        </form>");
            var tel = d.query('.tel', form), // 手机号码输入框
            code = d.query('.code', form); // 验证码输入框
            // 获取验证码按钮
            var checkCodeBtn = new Button_1.Button({
                container: code.parentElement,
                content: '获取验证码',
                className: 'get-code-btn',
                onClick: function () {
                    if (tools.valid.isTel(tel.value)) {
                        var time_1 = 60;
                        checkCodeBtn.isDisabled = true;
                        checkCodeBtn.content = time_1 + 's后重新获取';
                        var timer_1 = setInterval(function () {
                            time_1--;
                            if (time_1 === 0) {
                                clearInterval(timer_1);
                                checkCodeBtn.content = '获取验证码';
                                checkCodeBtn.isDisabled = false;
                            }
                            else {
                                checkCodeBtn.content = time_1 + 's后重新获取';
                            }
                        }, 1000);
                        // 通过后台发送验证码
                        BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.smsSend, {
                            data: {
                                mobile: tel.value,
                                uuid: _this.device.uuid
                            },
                            data2url: true,
                            type: 'POST',
                            headers: { uuid: _this.device.uuid }
                        }).catch(function () {
                            // 发送失败时，获取验证码按钮不进入倒计时。
                            clearInterval(timer_1);
                            checkCodeBtn.content = '获取验证码';
                            checkCodeBtn.isDisabled = false;
                        });
                    }
                    else {
                        Modal_1.Modal.alert('请输入正确的手机号码');
                    }
                }
            });
            // 登录按钮
            var loginBtn = new Button_1.Button({
                container: d.query('.btn-group', form),
                content: '登录',
                className: 'login-submit',
            });
            loginBtn.wrapper.type = 'submit';
            d.append(body, title);
            d.append(body, form);
            // 初始化短信验证码登录模态框
            var modal = new Modal_1.Modal({
                container: document.body,
                header: ' ',
                body: body,
                position: tools.isMb ? 'full' : '',
                width: '730px',
                isShow: true,
                isOnceDestroy: true,
                className: 'sms-login'
            });
            // 短信验证码登录
            d.on(form, 'submit', function (ev) {
                ev.preventDefault();
                var telVal = tel.value, codeVal = code.value;
                // 验证是否输入手机号与短信验证码
                if (!tools.valid.isTel(telVal)) {
                    Modal_1.Modal.alert('请输入正确的手机号码');
                }
                else if (tools.isEmpty(codeVal)) {
                    Modal_1.Modal.alert('请输入短信验证码');
                }
                else {
                    loginBtn.isLoading = true;
                    loginBtn.isDisabled = true;
                    loginBtn.content = '登陆中...';
                    // 前端验证通过后向后台发送数据
                    _this.ajaxLogin(CONF.ajaxUrl.loginCode, {
                        mobile: telVal,
                        check_code: codeVal,
                    }, function (result) {
                        return new Promise(function (resolve, reject) {
                            if (result.success) {
                                //身份验证通过时，提示是否绑定微信；
                                _this.bindWeChat(telVal, function () { return resolve(); });
                            }
                            else {
                                // 身份验证未通过时，不做任何处理
                                resolve();
                            }
                        });
                    }).then(function () {
                        // 登录成功
                        loginBtn.isLoading = false;
                        loginBtn.content = '登陆成功';
                    }).catch(function () {
                        // 登录失败
                        loginBtn.isLoading = false;
                        loginBtn.isDisabled = false;
                        loginBtn.content = '登录';
                    });
                }
            });
        };
        /*
        * 绑定微信
        * */
        LoginPage.prototype.bindWeChat = function (mobile, callback) {
            // 绑定微信方法
            var bindWeChat = function () {
                sys.window.wechatin(function (e) {
                    var result = JSON.parse(e.detail);
                    if (result.success) {
                        // 获取openId成功
                        var response = Object.assign({}, result.msg || {}, { mobile: mobile }); // 请求数据
                        BwRule_1.BwRule.Ajax.fetch(BW.CONF.ajaxUrl.bindWeChat, {
                            type: 'post',
                            timeout: 1500,
                            data: [response]
                        }).then(function (ev) {
                            if (ev.body && tools.isNotEmpty(ev.body)) {
                                // 绑定成功
                                Modal_1.Modal.toast('绑定成功！');
                                callback();
                            }
                            else {
                                // 绑定失败
                                bindError();
                            }
                        }).catch(function () {
                            // ajax请求失败时
                            bindError();
                        });
                    }
                    else {
                        // 获取openid失败
                        bindError();
                    }
                });
            };
            // 绑定失败时提示是否重新绑定
            var bindError = function () {
                Modal_1.Modal.confirm({
                    msg: '绑定失败，是否重新绑定？',
                    callback: function (isBind) {
                        if (isBind) {
                            // 重新绑定
                            bindWeChat();
                        }
                        else {
                            // 不绑定
                            callback();
                        }
                    }
                });
            };
            BwRule_1.BwRule.Ajax.fetch(BW.CONF.ajaxUrl.bindWeChat, {
                data: { mobile: mobile }
            }).then(function (_a) {
                var response = _a.response;
                var body = response.body || {}, bodyList = body.bodyList ? body.bodyList[0] : {}, flag = bodyList.flag;
                if (flag === 1) {
                    // 已经绑定微信，直接跳转到首页
                    callback();
                }
                else if (flag === 2) {
                    // 未绑定微信，提示是否绑定
                    Modal_1.Modal.confirm({
                        msg: '您的手机尚未绑定微信，是否需要绑定微信账号？',
                        callback: function (isBind) {
                            // 判断是否绑定微信
                            if (isBind) {
                                // 获取WeChat的openid进行绑定
                                bindWeChat();
                            }
                            else {
                                callback();
                            }
                        }
                    });
                }
                else {
                    Modal_1.Modal.alert(response.msg, '温馨提示', function () {
                        callback();
                    });
                }
            }).catch(function (e) {
                // 请求失败时，不做任何处理
                callback();
            });
        };
        /*
        * 解绑
        * */
        LoginPage.prototype.unBindling = function () {
            var _this = this;
            // 初始化页面
            var body = d.create('<div class="login-wrapper modal-body-login"></div>');
            var title = d.create('<div class="login-title">短信获取解绑信息</div>');
            var form = d.create("\n        <form action=\"#\" class=\"login-form\">\n            <div class=\"form-group\">\n                <input class=\"user\" type=\"text\" placeholder=\"\u8BF7\u8F93\u5165\u5458\u5DE5\u53F7\"/>\n            </div>\n            <div class=\"form-group\">\n                <input class=\"tel\" type=\"text\" placeholder=\"\u8BF7\u8F93\u5165\u624B\u673A\u53F7\u7801\"/>\n            </div>\n            <div class=\"form-group\">\n                <input class=\"code\" type=\"text\" placeholder=\"\u8BF7\u8F93\u5165\u77ED\u4FE1\u9A8C\u8BC1\u7801\"/>\n            </div>\n            <div class=\"btn-group\"></div>\n        </form>");
            var tel = d.query('.tel', form), // 手机号码输入框
            code = d.query('.code', form), // 验证码输入框
            user = d.query('.user', form); // 员工号输入框
            // 获取验证码按钮
            var checkCodeBtn = new Button_1.Button({
                container: code.parentElement,
                content: '获取验证码',
                className: 'get-code-btn',
                onClick: function () {
                    if (tools.valid.isTel(tel.value)) {
                        var time_2 = 60;
                        checkCodeBtn.isDisabled = true;
                        checkCodeBtn.content = time_2 + 's后重新获取';
                        var timer_2 = setInterval(function () {
                            time_2--;
                            if (time_2 === 0) {
                                clearInterval(timer_2);
                                checkCodeBtn.content = '获取验证码';
                                checkCodeBtn.isDisabled = false;
                            }
                            else {
                                checkCodeBtn.content = time_2 + 's后重新获取';
                            }
                        }, 1000);
                        // 通过后台发送验证码
                        BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.smsSend, {
                            data: {
                                mobile: tel.value,
                                uuid: _this.device.uuid
                            },
                            data2url: true,
                            type: 'POST',
                            headers: { uuid: _this.device.uuid }
                        }).catch(function () {
                            // 发送失败时，获取验证码按钮不进入倒计时。
                            clearInterval(timer_2);
                            checkCodeBtn.content = '获取验证码';
                            checkCodeBtn.isDisabled = false;
                        });
                    }
                    else {
                        Modal_1.Modal.alert('请输入正确的手机号码');
                    }
                }
            });
            // 解绑按钮
            var loginBtn = new Button_1.Button({
                container: d.query('.btn-group', form),
                content: '前往解绑',
                className: 'login-submit',
            });
            loginBtn.wrapper.type = 'submit';
            d.append(body, title);
            d.append(body, form);
            // 初始化短信验证码登录模态框
            var modal = new Modal_1.Modal({
                container: document.body,
                header: ' ',
                body: body,
                position: tools.isMb ? 'full' : '',
                width: '730px',
                isShow: true,
                isOnceDestroy: true,
                className: 'sms-login'
            });
            // 短信验证码登录
            d.on(form, 'submit', function (ev) {
                ev.preventDefault();
                var telVal = tel.value, codeVal = code.value, userVal = user.value;
                // 验证是否输入手机号与短信验证码
                if (tools.isEmpty(userVal)) {
                    Modal_1.Modal.alert('请输入员工号');
                }
                else if (!tools.valid.isTel(telVal)) {
                    Modal_1.Modal.alert('请输入正确的手机号码');
                }
                else if (tools.isEmpty(codeVal)) {
                    Modal_1.Modal.alert('请输入短信验证码');
                }
                else {
                    loginBtn.isLoading = true;
                    loginBtn.isDisabled = true;
                    loginBtn.content = '前往中...';
                    // 前端验证通过后向后台发送数据
                    BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.unBinding, {
                        data: {
                            mobile: telVal,
                            check_code: codeVal,
                            userid: userVal
                        },
                        type: 'get'
                    }).then(function (_a) {
                        var response = _a.response;
                        new UnBinding_1.UnBinding(response.data);
                    }).finally(function () {
                        loginBtn.isLoading = false;
                        loginBtn.isDisabled = false;
                        loginBtn.content = '前往解绑';
                    });
                }
            });
        };
        Object.defineProperty(LoginPage.prototype, "fingerModal", {
            get: function () {
                var _this = this;
                if (!this._fingerModal) {
                    this._fingerModal = new Modal_1.Modal({
                        header: '指纹登录',
                        body: d.create("<div data-action=\"fingerModal\"><i class=\"iconfont icon-zhiwen red block margin-bottom-10\" style=\"font-size:2em;\"></i>\n                    <p style=\"float:left;margin-top:6px;margin-left:10px;max-width:230px;\"></p></div>"),
                        onClose: function () {
                            fingerObj && fingerObj.destroy && fingerObj.destroy();
                        }
                    });
                }
                var modal = this._fingerModal, textEl = d.query('p', modal.bodyWrapper);
                // input = <HTMLInputElement>d.query('input',　modal.body);
                // let myDB = {
                //     storeName: 'fingers',
                //     version: 3
                // };
                var fingerObj = new NewFinger_1.NewFinger({
                    autoCache: false,
                    callFinger: function (text) {
                        textEl.innerHTML = '<span>' + text + '</span>';
                    },
                    fingerFinish: function (fdata) {
                        textEl.innerHTML = '<span>指纹获取成功，正在匹配中...</span>';
                        textEl.innerHTML = '<span>指纹获取成功开始匹配</span><br/>';
                        //Modal.alert(JSON.stringify(text.msg));
                        return new Promise(function () {
                            _this.ajaxLogin(CONF.ajaxUrl.loginFinger, {
                                userid: fdata.userid,
                                fingerprint: fdata.print,
                                fingertype: fdata.type,
                                verify: fdata.verify
                            }, function (ev) {
                                if (ev.success) {
                                    var data = ev.data.dataArr;
                                    var finger_1 = '';
                                    if (tools.isNotEmpty(data)) {
                                        finger_1 = data[data.length - 1].fingerData;
                                    }
                                    return new Promise(function (resolve, reject) {
                                        fingerObj.addFinger({
                                            userid: fdata.userid,
                                            print: finger_1 || fdata.print,
                                            type: fdata.type,
                                            verify: fdata.verify
                                        }).finally(function () {
                                            modal.isShow = false;
                                            resolve();
                                        });
                                        // if(typeof finger === 'string' && finger !== ''){
                                        //     // fingerObj.addFinger(finger, () => {
                                        //     //     resolve();
                                        //     //     modal.isShow = false;
                                        //     // });
                                        // } else {
                                        //     resolve();
                                        //     modal.isShow = false;
                                        // }
                                    });
                                }
                                else {
                                    return new Promise(function (resolve, reject) {
                                        modal.isShow = false;
                                        resolve();
                                    });
                                }
                            });
                        });
                    }
                });
                // let fingerObj: Finger = new Finger(myDB);
                // fingerObj.callFinger = (text) => {
                //     textEl.innerHTML = '<span>' + text.msg + '</span>';
                // };
                // fingerObj.success = (ev) => {
                //     textEl.innerHTML = '<span>指纹获取成功，正在匹配中...</span>';
                //     textEl.innerHTML = '<span>指纹获取成功开始匹配</span><br/>';
                //
                //     //Modal.alert(JSON.stringify(text.msg));
                //     this.ajaxLogin(CONF.ajaxUrl.loginFinger, {
                //         userid: ev.userid,
                //         fingerprint: ev.print,
                //         fingertype: ev.type,
                //         verify: ev.verify
                //     }, (ev) => {
                //         if(ev.success){
                //             let data = ev.data.dataArr;
                //             let finger = '';
                //             if (tools.isNotEmpty(data)) {
                //                 finger = data[data.length - 1].fingerData;
                //             }
                //             return new Promise((resolve, reject) => {
                //                 if(typeof finger === 'string' && finger !== ''){
                //                     fingerObj.addFinger(finger, () => {
                //                         resolve();
                //                         modal.isShow = false;
                //                     });
                //                 } else {
                //                     resolve();
                //                     modal.isShow = false;
                //                 }
                //             });
                //
                //         } else {
                //             return new Promise((resolve, reject) => {
                //                 modal.isShow = false;
                //                 resolve();
                //             });
                //         }
                //     });
                //
                // };
                return this._fingerModal;
            },
            enumerable: true,
            configurable: true
        });
        LoginPage.prototype.loginByFinger = function () {
            // debugger;
            if (!this.validReg()) {
                return;
            }
            var result = ('BlueWhaleShell' in window || 'AppShell' in window) ?
                // JSON.parse(BlueWhaleShell.postMessage('callFinger','{"type":"0"}'))
                { success: true, msg: 'yes' }
                : { success: false, msg: '必须在客户端内使用' };
            // textEl.innerHTML = `<span${result.success ? '' : ' class="red"'}>${result.msg}</span><br/>`;
            if (!result.success) {
                Modal_1.Modal.alert(result.msg);
                return;
            }
            this.fingerModal.isShow = true;
        };
        ;
        /**
         * 移动指纹登录
         */
        LoginPage.prototype.touchidClick = function () {
            var loginPage = this;
            if (!loginPage.validReg()) {
                return;
            }
            sys.window.touchid(function (e) {
                var json = JSON.parse(e.detail);
                if (json.success) {
                    BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.passwordEncrypt, {
                        data: { str: loginPage.device.auth_code }
                    }).then(function (_a) {
                        var response = _a.response;
                        var authCode = response.body.bodyList[0];
                        loginPage.ajaxLogin(CONF.ajaxUrl.loginTouchID, {
                            password: authCode
                        });
                    });
                }
                else {
                    if (json.msg == 1) {
                        Modal_1.Modal.toast("指纹匹配不正确");
                    }
                    else if (json.msg == 2) {
                        Modal_1.Modal.toast("该设备不支持指纹");
                    }
                    else {
                        Modal_1.Modal.toast(json.msg);
                    }
                }
            });
        };
        /**
         * 密码登录
         */
        LoginPage.prototype.loginClick = function () {
            var loginPage = this, saveBtn = loginPage.props.saveButton, isSavePw = saveBtn instanceof checkBox_1.CheckBox ? saveBtn.checked : saveBtn.checked, password = loginPage.props.password.value, userId = loginPage.props.userId.value.replace(/\s+/g, "");
            if (tools.isEmpty(userId)) {
                Modal_1.Modal.alert('请填写用户名');
                return;
            }
            if (tools.isEmpty(password)) {
                Modal_1.Modal.alert('请填写密码');
                return;
            }
            loginPage.device.isSavePassword = isSavePw;
            BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.passwordEncrypt, {
                data: { str: password }
            }).then(function (_a) {
                var response = _a.response;
                var encodePassword = response.body.bodyList[0];
                loginPage.ajaxLogin(CONF.ajaxUrl.loginPassword, {
                    userid: userId.toUpperCase(),
                    password: encodePassword
                }, function () {
                    return new Promise(function (resolve) {
                        loginPage.device.userid = userId.toUpperCase();
                        loginPage.device.password = password;
                        resolve();
                    });
                });
            });
        };
        /**
         * 登录ajax
         */
        LoginPage.prototype.ajaxLogin = function (url, loginData, callback) {
            if (callback === void 0) { callback = function (result) { return Promise.resolve(); }; }
            var loginPage = this, loginBtn = loginPage.props.loginButton, login = loginBtn instanceof Button_1.Button ? loginBtn.wrapper : loginBtn;
            if (login.classList.contains('disabled')) {
                return;
            }
            // let shell:any = ShellAction.get();
            loginPage.loginBtnState(1);
            // let loginUrl = tools.url.addObj(url, loginData);
            var result = { success: false, data: null };
            return new Promise(function (resolve, reject) {
                BwRule_1.BwRule.Ajax.fetch(url, {
                    type: 'post',
                    data: [loginData],
                    headers: { 'auth_code': loginPage.device.auth_code, 'uuid': loginPage.device.uuid }
                }).then(function (_a) {
                    var response = _a.response;
                    result.success = true;
                    result.data = response;
                    callback(result).then(function () {
                        loginPage.loginBtnState(10);
                        var user = User_1.User.get();
                        response.dataArr.forEach(function (col, index) {
                            if (col.NAME === 'are_id') {
                                user.are_id = col.VALUE;
                            }
                            else if (col.NAME === 'userid') {
                                user.userid = col.VALUE;
                            }
                            else if (col.NAME === 'USERNAME') {
                                user.department = col.VALUE;
                                user.username = col.VALUE;
                            }
                            else if (col.NAME === 'auth_code') {
                                loginPage.device.auth_code = col.VALUE;
                            }
                        });
                        // debugger;
                        if (sys.os === 'ad' || sys.os === 'ip') {
                            var accessToken = response.head.accessToken || '';
                            sys.window.opentab(user.userid, accessToken.toString());
                        }
                        else {
                            BW.sysPcHistory.setLockKey(user.userid);
                            BW.sysPcHistory.setInitType('1');
                            sys.window.opentab();
                            // BW.sysPcHistory.remainLockOnly(() => sys.window.opentab());
                        }
                        resolve();
                    });
                }).catch(function (ev) {
                    typeof callback === 'function' && callback(result).then(function () {
                        loginPage.loginBtnState(0);
                        reject(ev);
                    });
                });
            });
        };
        LoginPage.prototype.initEvent = function (props) {
            var _this = this;
            var loginPage = this;
            if (props.regButton) {
                var registerHandler_1 = function () {
                    if (tools.isEmpty(loginPage.device.auth_code)) {
                        sys.window.load(CONF.url.reg);
                    }
                    else {
                        Modal_1.Modal.toast('您的设备已注册');
                    }
                };
                if (props.regButton instanceof Button_1.Button) {
                    props.regButton.onClick = function () {
                        registerHandler_1();
                    };
                }
                else {
                    d.on(props.regButton, 'click', function () {
                        registerHandler_1();
                    });
                }
            }
            if (props.loginButton) {
                if (props.loginButton instanceof Button_1.Button) {
                    props.loginButton.onClick = function () {
                        loginPage.loginClick();
                    };
                }
                else {
                    d.on(props.loginButton, 'click', function () {
                        loginPage.loginClick();
                    });
                }
            }
            if (props.wxButton) {
                d.on(props.wxButton, 'click', function () {
                    loginPage.wechatChick();
                });
            }
            if (props.fingerMbBtn) {
                d.on(props.fingerMbBtn, 'click', function () {
                    loginPage.touchidClick();
                });
            }
            if (props.fingerPcBtn) {
                d.on(props.fingerPcBtn, 'click', function () {
                    loginPage.loginByFinger();
                });
            }
            if (props.SMSBtn) {
                if (props.SMSBtn instanceof Button_1.Button) {
                    props.SMSBtn.onClick = tools.pattern.throttling(function () {
                        _this.phoneVerify();
                    }, 1000);
                }
            }
            if (props.utButton) {
                props.utButton.onClick = tools.pattern.throttling(function () {
                    _this.unBindling();
                }, 1000);
            }
            if (props.fqaBtn) {
                props.fqaBtn.onClick = tools.pattern.throttling(function () {
                    new fqa_1.FqaModal({});
                }, 1000);
            }
            var usertap = 0, maxtap = 5;
            (tools.isMb ? d.query('.login-logo>img') : d.query('[data-action="selectServer"]')).addEventListener('click', function () {
                usertap += 1;
                if (usertap === maxtap) {
                    sys.window.load(CONF.url.selectServer);
                    usertap = 0;
                }
            });
        };
        /**
         * 验证是否注册过
         */
        LoginPage.prototype.validReg = function () {
            if (tools.isEmpty(this.device.auth_code)) {
                Modal_1.Modal.confirm({
                    msg: '设备未注册',
                    btns: ['取消', '前往注册'],
                    callback: function (index) {
                        if (index === true) {
                            sys.window.load(CONF.url.reg);
                        }
                    }
                });
                return false;
            }
            return true;
        };
        /**
         * 改变登录状态
         */
        LoginPage.prototype.loginBtnState = function (type) {
            var btn = this.props.loginButton, login = btn instanceof Button_1.Button ? btn.wrapper : btn, loginText = sys.isMb ? login : login.querySelector('.text');
            switch (type) {
                case 0:
                    login.classList.remove('disabled');
                    loginText.innerHTML = '登录';
                    break;
                case 1:
                    login.classList.add('disabled');
                    if (sys.isMb) {
                        loginText.innerHTML = '<span style="width:22px;height:22px;vertical-align:sub" class="mui-spinner"></span> 登录中...';
                    }
                    else {
                        loginText.innerHTML = '登录中...';
                    }
                    break;
                case 10:
                    login.classList.remove('disabled');
                    loginText.innerHTML = '登录成功';
                    break;
            }
        };
        /**
         * 保存账号密码
         */
        LoginPage.prototype.loadPassword = function () {
            //加载保存的用户名密码
            var saveButton = this.props.saveButton;
            if (this.device.isSavePassword) {
                if (saveButton instanceof checkBox_1.CheckBox) {
                    saveButton.checked = true;
                }
                else {
                    saveButton.checked = true;
                }
                this.props.userId.value = tools.str.toEmpty(this.device.userid);
                this.props.password.value = tools.str.toEmpty(this.device.password);
            }
        };
        /**
         * 设备升级uuid获取
         */
        LoginPage.prototype.deviceUpdate = function () {
            var _this = this;
            if ('BlueWhaleShell' in window) {
                var versionText = BlueWhaleShell.postMessage('getVersion', '');
                // Rule.ajax(CONF.ajaxUrl.pcVersion, {
                //     data : {getversion : versionText},
                //     silent : true,
                //     success: function (rs) {
                //         //sys.ui.alert(JSON.stringify(rs.data[0]));
                //         BlueWhaleShell.postMessage('downloadFile',JSON.stringify(rs.data[0]));
                //         //versionText = BlueWhaleShell.postMessage('downloadFile','{"byteLength":945152,"file":[{"fileId":"BlueWhale.exe","filePath":"https://bwd.sanfu.com/nsf/rest/attachment/download/file?name_field=ATTACHNAME&md5_field=FILE_ID&attachname=BlueWhale.exe&file_id=66DBFB91D2ADBA0D36C4478C9867BAD4&down=allow","fileSize":780288,"fileVersion":"1.0.0.2"}]}');
                //         //let versionText = BlueWhaleShell.postMessage('downloadFile','{"byteLength":"780288","file":[{"fileId":"BlueWhale.exe","fileVersion":"1.0.0.2","filePath":"https://bwd.sanfu.com/version/1.1/BlueWhale.exe"}]}');
                //         //sys.ui.alert(versionText);
                //     }
                // });
                BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.pcVersion, {
                    data: { getversion: versionText },
                    silent: true,
                }).then(function (_a) {
                    var response = _a.response;
                    BlueWhaleShell.postMessage('downloadFile', JSON.stringify(response.data[0]));
                });
                var json = BlueWhaleShell.postMessage('getDevice', '');
                if (!tools.isEmpty(json)) {
                    this.device.uuid = JSON.parse(json).msg.uuid;
                }
                else {
                    Modal_1.Modal.toast("获取不到设备信息");
                }
            }
            else if (sys.os === 'ip') {
                sys.window.getDevice("uuid");
                window.addEventListener('getDevice', function (e) {
                    var json = JSON.parse(e.detail);
                    if (json.success) {
                        _this.device.uuid = json.msg.uuid;
                    }
                    else {
                        Modal_1.Modal.toast(json.msg);
                    }
                });
            }
            else if (sys.os === 'ad') {
                this.device.uuid = sys.window.getDevice("uuid").msg;
            }
            else if ('AppShell' in window && tools.isPc) {
                var base = Shell.base;
                base.versionUpdate(CONF.ajaxUrl.pcVersion, function () { }, function () { });
                var result = base.device;
                if (result.success) {
                    this.device.uuid = result.data.uuid;
                    // console.log(this.device.uuid);
                }
                else {
                    Modal_1.Modal.toast("获取不到设备信息");
                }
            }
            else {
                //this.device.uuid = '28-D2-44-0C-4E-B5';
            }
        };
        return LoginPage;
    }());
    exports.LoginPage = LoginPage;
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
