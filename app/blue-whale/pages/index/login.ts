/// <amd-module name="LoginPage"/>
import sys = BW.sys;
import tools = G.tools;
import CONF = BW.CONF;
import d = G.d;
import { Modal } from "global/components/feedback/modal/Modal";
import { User } from "../../../global/entity/User";
import { Device } from "../../../global/entity/Device";
import { BwRule } from "../../common/rule/BwRule";
import { CheckBox } from "../../../global/components/form/checkbox/checkBox";
import { Button } from "../../../global/components/general/button/Button";
import { UnBinding } from "../../module/unBinding/UnBinding";
import { NewFinger } from "../../module/fingerPrint/NewFinger";
import Shell = G.Shell;
import { Spinner } from "../../../global/components/ui/spinner/spinner";
import { QrCode } from "../../../global/utils/QRCode";
import { ShareCode } from "blue-whale/common/share-code/shareCode";
interface IProps {
    drive?: string,
    responseBean: obj,
    loginButton: HTMLElement | Button,
    userId: HTMLInputElement,
    password: HTMLInputElement,
    saveButton: HTMLElement | CheckBox,
    regButton: HTMLElement | Button,
    fingerMbBtn?: HTMLElement,
    fingerPcBtn?: HTMLElement,
    wxButton?: HTMLElement,
    utButton?: Button,
    SMSBtn?: HTMLElement | Button;
    fqaBtn?: Button,
    scanButton?: HTMLElement,
    jiebangButton?: HTMLElement
}
/**
 * 移动和电脑的登录页面
 */
export class LoginPage {
    private LoginModal: Modal;
    private Interval: number;
    constructor(private props: IProps) {
        tools.isMb && this.getVersion();
        let response = props.responseBean;
        this.device = Device.get();
        this.deviceUpdate();

        if (response && response.body && response.body.bodyList && response.body.bodyList[0]) {
            let dataList = response.body.bodyList[0].dataList;
            let meta = response.body.bodyList[0].meta;
            response.data = BwRule.getCrossTableData(meta, dataList);
            if (response.data && response.data[0] && response.data[0].AUTH_CODE) {
                this.device.auth_code = response.data[0].AUTH_CODE;
            } else {
                this.device.auth_code = '';
            }
        } else {
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
        this.setLoginType();
        //判断是否拥有指纹识别
        Shell.other.isSupportFinger((res) => {
            if (!res) {
                props.fingerMbBtn.style.display = "none";
            }
        })
    }

    protected setLoginType() {
        G.Ajax.fetch(tools.url.addObj(CONF.url.login, {
            output: 'json'
        })).then(({ response }) => {
            response = JSON.parse(response);
            let data = tools.keysVal(response, 'body', 'bodyList', 0);
            let {
                SMSBtn,
                scanButton,
                wxButton,
                fingerMbBtn,
                fingerPcBtn,
                regButton
            } = this.props;

            if (data) {
                if (data.iconName) {
                    let logoWrapper = tools.isMb ? d.query('.login-logo') : d.query('.logo');
                    logoWrapper.innerHTML = '';
                    d.append(logoWrapper, d.create(`
                    <img src="${G.requireBaseUrl + "../img/logo/" + data.iconName + ".png"}" alt="${data.iconName}"/>
                     `));
                    data.caption && d.append(logoWrapper, d.create(`
                    <p class="text">${data.caption}</p>
                    `));
                }

                if (data.loginMessage == 1) {
                    if (SMSBtn instanceof Button) {
                        SMSBtn.destroy();
                    } else {
                        d.remove(SMSBtn);
                    }
                }

                if (data.loginScan == 1) {
                    d.remove(scanButton);
                }

                if (data.loginWechat == 1) {
                    d.remove(wxButton);
                }

                if (data.loginFingerprint == 1) {
                    d.remove(fingerPcBtn);
                    d.remove(fingerMbBtn);
                }

                if (data.singIn == 1) {
                    if (regButton instanceof Button) {
                        regButton.destroy();
                    } else {
                        d.remove(regButton);
                    }
                }
            }
        });
    }

    protected getVersion() {
        G.Ajax.fetch(CONF.ajaxUrl.getVersion).then(({ response }) => {
            response = JSON.parse(response);
            sys.window.uploadVersion(response.data.version);
        }).catch((e) => {
            console.log(e);
        })
    }
    /*
    * 手机短信验证登录
    * */
    protected phoneVerify() {
        // 初始化页面
        let body = d.create('<div class="login-wrapper modal-body-login"></div>');
        let title = d.create('<div class="login-title">短信验证码登录</div>');
        let form = d.create(`
        <form action="#" class="login-form">
            <div class="form-group">
                <input class="tel" type="number" placeholder="请输入手机号码"/>
            </div>
            <div class="form-group">
                <input class="code" type="number" placeholder="请输入短信验证码"/>
            </div>
            <div class="btn-group"></div>
        </form>`);

        let tel = <HTMLInputElement>d.query('.tel', form),// 手机号码输入框
            code = <HTMLInputElement>d.query('.code', form);// 验证码输入框

        // 获取验证码按钮
        let checkCodeBtn = new Button({
            container: code.parentElement,
            content: '获取验证码',
            className: 'get-code-btn',
            onClick: () => {
                if (tools.valid.isTel(tel.value)) {
                    let time = 60;
                    checkCodeBtn.isDisabled = true;
                    checkCodeBtn.content = time + 's后重新获取';
                    let timer = setInterval(() => {
                        time--;
                        if (time === 0) {
                            clearInterval(timer);
                            checkCodeBtn.content = '获取验证码';
                            checkCodeBtn.isDisabled = false;
                        } else {
                            checkCodeBtn.content = time + 's后重新获取';
                        }
                    }, 1000);
                    // 通过后台发送验证码
                    BwRule.Ajax.fetch(CONF.ajaxUrl.smsSend, {
                        data: {
                            mobile: tel.value,
                            uuid: this.device.uuid
                        },
                        data2url: true,
                        type: 'POST',
                        headers: { uuid: this.device.uuid }
                    }).catch(() => {
                        // 发送失败时，获取验证码按钮不进入倒计时。
                        clearInterval(timer);
                        checkCodeBtn.content = '获取验证码';
                        checkCodeBtn.isDisabled = false;
                    });
                } else {
                    Modal.alert('请输入正确的手机号码');
                }
            }
        });

        // 登录按钮
        let loginBtn = new Button({
            container: d.query('.btn-group', form),
            content: '登录',
            className: 'login-submit',
        });
        (<HTMLButtonElement>loginBtn.wrapper).type = 'submit';

        d.append(body, title);
        d.append(body, form);

        // 初始化短信验证码登录模态框
        let modal = new Modal({
            container: document.body,
            header: ' ',
            body,
            isMb: true,
            width: '730px',
            isShow: true,
            isOnceDestroy: true,
            className: 'sms-login'
        });

        // 短信验证码登录
        d.on(form, 'submit', (ev) => {
            ev.preventDefault();
            let telVal = tel.value,
                codeVal = code.value;
            if (!tools.valid.isTel(telVal)) {
                Modal.alert('请输入正确的手机号码');
            } else if (tools.isEmpty(codeVal)) {
                Modal.alert('请输入短信验证码');
            } else {
                loginBtn.isLoading = true;
                loginBtn.isDisabled = true;
                loginBtn.content = '登录中...';
                // 前端验证通过后向后台发送数据
                this.ajaxLogin(CONF.ajaxUrl.loginCode, {
                    mobile: telVal,
                    check_code: codeVal,
                }, (result) => {
                    return new Promise((resolve, reject) => {
                        if (result.success) {
                            //身份验证通过时，提示是否绑定微信；
                            this.bindWeChat(telVal, () => resolve());
                        } else {
                            // 身份验证未通过时，不做任何处理
                            resolve();
                        }
                    })
                }).then(() => {
                    // 登录成功
                    loginBtn.isLoading = false;
                    loginBtn.content = '登录成功';
                }).catch(() => {
                    // 登录失败
                    loginBtn.isLoading = false;
                    loginBtn.isDisabled = false;
                    loginBtn.content = '登录';
                });
            }
        });
    }

    /*
    * 绑定微信
    * */
    protected bindWeChat(mobile: string, callback: Function) {
        // 绑定微信方法
        let bindWeChat = () => {
            sys.window.wechatin((e) => {
                let result = JSON.parse(e.detail);
                if (result.success) {
                    // 获取openId成功
                    let response = Object.assign({}, result.msg || {}, { mobile });// 请求数据
                    BwRule.Ajax.fetch(BW.CONF.ajaxUrl.bindWeChat, {
                        type: 'post',
                        timeout: 1500,
                        data: [response]
                    }).then((ev) => {
                        if (ev.body && tools.isNotEmpty(ev.body)) {
                            // 绑定成功
                            Modal.toast('绑定成功！');
                            callback();
                        } else {
                            // 绑定失败
                            bindError();
                        }
                    }).catch(() => {
                        // ajax请求失败时
                        bindError();
                    });
                } else {
                    // 获取openid失败
                    bindError();
                }
            });
        };
        // 绑定失败时提示是否重新绑定
        let bindError = () => {
            Modal.confirm({
                msg: '绑定失败，是否重新绑定？',
                callback: (isBind) => {
                    if (isBind) {
                        // 重新绑定
                        bindWeChat();
                    } else {
                        // 不绑定
                        callback();
                    }
                }
            });
        };

        BwRule.Ajax.fetch(BW.CONF.ajaxUrl.bindWeChat, {
            data: { mobile }
        }).then(({ response }) => {
            let body = response.body || {},
                bodyList = body.bodyList ? body.bodyList[0] : {},
                flag = bodyList.flag;
            if (flag === 1) {
                // 已经绑定微信，直接跳转到首页
                callback();
            } else if (flag === 2) {
                // 未绑定微信，提示是否绑定
                Modal.confirm({
                    msg: '您的手机尚未绑定微信，是否需要绑定微信账号？',
                    callback: (isBind) => {
                        // 判断是否绑定微信
                        if (isBind) {
                            // 获取WeChat的openid进行绑定
                            bindWeChat();
                        } else {
                            callback();
                        }
                    }
                });
            } else {
                Modal.alert(response.msg, '温馨提示', () => {
                    callback();
                });
            }
        }).catch((e) => {
            // 请求失败时，不做任何处理
            callback();
        });
    }


    /*
    * 解绑
    * */
    protected unBindling() {
        // 初始化页面
        let body = d.create('<div class="login-wrapper modal-body-login"></div>');
        let title = d.create('<div class="login-title">短信获取解绑信息</div>');
        let form = d.create(`
        <form action="#" class="login-form">
            <div class="form-group">
                <input class="user" id="flow0" type="text" placeholder="请输入员工号"/>
            </div>
            <div class="form-group">
                <input class="tel" id="flow1" type="number" placeholder="请输入手机号码"/>
            </div>
            <div class="form-group">
                <input class="code" id="flow2" type="number" placeholder="请输入短信验证码"/>
            </div>
            <div class="btn-group"></div>
        </form>`);

        let tel = <HTMLInputElement>d.query('.tel', form),// 手机号码输入框
            code = <HTMLInputElement>d.query('.code', form),// 验证码输入框
            user = <HTMLInputElement>d.query('.user', form);// 员工号输入框

        // 获取验证码按钮
        let checkCodeBtn = new Button({
            container: code.parentElement,
            content: '获取验证码',
            className: 'get-code-btn',
            onClick: () => {
                if (tools.valid.isTel(tel.value)) {
                    let time = 60;
                    checkCodeBtn.isDisabled = true;
                    checkCodeBtn.content = time + 's后重新获取';
                    let timer = setInterval(() => {
                        time--;
                        if (time === 0) {
                            clearInterval(timer);
                            checkCodeBtn.content = '获取验证码';
                            checkCodeBtn.isDisabled = false;
                        } else {
                            checkCodeBtn.content = time + 's后重新获取';
                        }
                    }, 1000);
                    // 通过后台发送验证码
                    BwRule.Ajax.fetch(CONF.ajaxUrl.smsSend, {
                        data: {
                            mobile: tel.value,
                            uuid: this.device.uuid
                        },
                        data2url: true,
                        type: 'POST',
                        headers: { uuid: this.device.uuid }
                    }).catch(() => {
                        // 发送失败时，获取验证码按钮不进入倒计时。
                        clearInterval(timer);
                        checkCodeBtn.content = '获取验证码';
                        checkCodeBtn.isDisabled = false;
                    });
                } else {
                    Modal.alert('请输入正确的手机号码');
                }
            }
        });

        // 解绑按钮
        let loginBtn = new Button({
            container: d.query('.btn-group', form),
            content: '前往解绑',
            className: 'login-submit wjb',
            onClick: (ev) => {
                // 短信验证码登录
                ev.preventDefault();
                let telVal = tel.value,
                    codeVal = code.value,
                    userVal = user.value;
                let deviceInfo = JSON.parse(localStorage.getItem("deviceInfo"));
                if (user.value) {
                    userVal = user.value.toUpperCase();
                }
                // let a = [{
                //     MODEL: "搜索",
                //     VENDOR: "xxx",
                //     REGISTER_TIME: "xxx",
                //     UUID: "xxxy"
                // }, {
                //     MODEL: "搜索2",
                //     VENDOR: "xxx2",
                //     REGISTER_TIME: "xxx2",
                //     UUID: "xxxy"
                // }, {
                //     MODEL: "搜索4",
                //     VENDOR: "xxx2",
                //     REGISTER_TIME: "xxx2",
                //     UUID: ""
                // }];
                // let obj = {
                //     mobile: telVal,
                //     check_code: codeVal,
                //     userid: userVal,
                //     uuid: deviceInfo.uuid
                // }
                // new UnBinding(a, obj);
                // return false;

                // 验证是否输入手机号与短信验证码
                if (tools.isEmpty(userVal)) {
                    Modal.alert('请输入员工号');
                } else if (!tools.valid.isTel(telVal)) {
                    Modal.alert('请输入正确的手机号码');
                } else if (tools.isEmpty(codeVal)) {
                    Modal.alert('请输入短信验证码');
                } else if (tools.isEmpty(deviceInfo) && tools.isEmpty(deviceInfo.uuid)) {
                    Modal.alert('uuid为空');
                } else {
                    G.Ajax.fetch(CONF.ajaxUrl.unBinding, {
                        data: {
                            mobile: telVal,
                            check_code: codeVal,
                            userid: userVal,
                            uuid: deviceInfo.uuid
                        },
                        type: 'get'
                    }).then(({ response }) => {
                        let res = JSON.parse(response);
                        // alert(response);
                        if (Number(res.errorCode) === 0) {
                            new UnBinding({
                                mobile: telVal,
                                check_code: codeVal,
                                userid: userVal,
                                uuid: deviceInfo.uuid
                            })
                            return false;
                        } else if (res.errorCode == 50012) {
                            if (res.msg === '当前设备已解绑成功') {
                                Modal.alert(res.msg, null, () => { sys.window.load(CONF.url.reg); });
                            } else {
                                Modal.alert(res.msg);
                            }
                        } else {
                            Modal.alert(res.msg);
                        }
                    }).catch(err => {
                        console.log(err)
                    }).finally(() => {
                        loginBtn.isLoading = false;
                        loginBtn.isDisabled = false;
                        loginBtn.content = '前往解绑';
                    })
                }
            }
        });

        (<HTMLButtonElement>loginBtn.wrapper).type = 'submit';

        d.append(body, title);
        d.append(body, form);
        // 初始化短信验证码登录模态框
        let modal = new Modal({
            container: document.body,
            header: ' ',
            body,
            position: tools.isMb ? 'full' : '',
            width: '730px',
            isShow: true,
            isOnceDestroy: true,
            className: 'sms-login',
            onClose() {
                window.location.reload();
            }
        });
        /** 按钮上弹无法点击 */
        let test = document.querySelector("#flow0"),
            test1 = document.querySelector("#flow1"),
            test2 = document.querySelector("#flow2");
        d.on(test, "blur", this.scrollTop);
        d.on(test1, "blur", this.scrollTop);
        d.on(test2, "blur", this.scrollTop);
    }
    private scrollTop() {
        document.body.scrollTop = 0;
    }
    /**
     * 电脑指纹登录
     */

    private _fingerModal: Modal;
    private get fingerModal() {
        if (!this._fingerModal) {
            this._fingerModal = new Modal({
                header: '指纹登录',
                body: d.create(
                    `<div data-action="fingerModal"><i class="iconfont icon-zhiwen red block margin-bottom-10" style="font-size:2em;"></i>
                    <p style="float:left;margin-top:6px;margin-left:10px;max-width:230px;"></p></div>`),
                onClose() {
                    fingerObj && fingerObj.destroy && fingerObj.destroy();
                }
            });
        }

        let modal = this._fingerModal,
            textEl = d.query('p', modal.bodyWrapper);
        // input = <HTMLInputElement>d.query('input',　modal.body);

        // let myDB = {
        //     storeName: 'fingers',
        //     version: 3
        // };

        let fingerObj = new NewFinger({
            autoCache: false,
            callFinger: (text) => {
                textEl.innerHTML = '<span>' + text + '</span>';
            },
            fingerFinish: (fdata) => {
                textEl.innerHTML = '<span>指纹获取成功，正在匹配中...</span>';
                textEl.innerHTML = '<span>指纹获取成功开始匹配</span><br/>';

                //Modal.alert(JSON.stringify(text.msg));
                return new Promise<any>(() => {
                    this.ajaxLogin(CONF.ajaxUrl.loginFinger, {
                        userid: fdata.userid,
                        fingerprint: fdata.print,
                        fingertype: fdata.type,
                        verify: fdata.verify
                    }, (ev) => {
                        if (ev.success) {
                            let data = ev.data.dataArr;
                            let finger = '';
                            if (tools.isNotEmpty(data)) {
                                finger = data[data.length - 1].fingerData;
                            }
                            return new Promise((resolve, reject) => {
                                fingerObj.addFinger({
                                    userid: fdata.userid,
                                    print: finger || fdata.print,
                                    type: fdata.type,
                                    verify: fdata.verify
                                }).finally(() => {
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

                        } else {
                            return new Promise((resolve, reject) => {
                                modal.isShow = false;
                                resolve();
                            });
                        }
                    });
                })
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
    }
    private handleCancelBind() {
        this.renderCancelBind();
    }
    private renderCancelBind = () => {
        d.query('.login-wrapper').style.display = "none";
        let dom = d.create(`
            <div class="cancel-bind-wrapper">
                <div class='register-wrapper'>
                    <div class="logo">
                        <img data-action="selectServer" src= ${G.requireBaseUrl + '../img/logo/fastlion.png'} alt="fastlion" />
                    </div>
                    <div class="register-content mui-content">
                        <div class="register-title">设备解绑</div>
                        <form class="register-form">
                            <div class="form-group">
                                <input id="name" type="text" placeholder="请输入用户名"/>
                            </div>
                            <div class="form-group">
                                <input id="tel" type="text" placeholder="请输入手机号"/>
                            </div>
                            <div class="form-group">
                                <input id="verify" type="text" placeholder="请输入验证码"/>
                                <div class="more-group"/>
                            </div>
                            <div class="btn-group-cancel"></div>
                        </form>
                    </div>
                </div>
           </div>
         `)

        d.append(d.query(".login-page-container"), dom);
        let container = d.query(".cancel-bind-wrapper")
        let registerBtn = new Button({
            container: d.query('.btn-group-cancel', container),
            content: '解绑',
            className: 'register-submit',
        });
        let checkCodeBtn = new Button({
            container: d.queryAll('.more-group', container)[0],
            content: '获取验证码',
            className: 'check-code',
        });
        let goLogin = new Button({
            container: d.query('.btn-group-cancel', container),
            content: '返回登录',
            className: 'goLogin'
        });
        let tel: any = d.query('#tel', container);
        let verify: any = d.query('#verify', container);
        let name: any = d.query('#name', container);
        let that = this;
        d.on(goLogin.wrapper, 'click', () => {
            sys.window.load(CONF.url.login);
        });
        d.on(checkCodeBtn.wrapper, 'click', function (e) {
            let sendVerify = this;
            let mobile = G.tools.str.toEmpty(tel.value);
            if (G.tools.isEmpty(mobile) || !G.tools.valid.isTel(mobile)) {
                Modal.alert('手机号格式有误');
                return;
            }
            let countdown = 60;
            sendVerify.classList.add('disabled');
            sendVerify.innerHTML = countdown + 's';

            let timer = setInterval(function () {
                countdown--;
                if (countdown == 0) {
                    clearInterval(timer);
                    sendVerify.classList.remove('disabled');
                    sendVerify.innerHTML = '获取';
                } else {
                    sendVerify.classList.add('disabled');
                    sendVerify.innerHTML = countdown + 's';
                }
            }, 1000);

            BwRule.Ajax.fetch(CONF.ajaxUrl.smsSend, {
                data: {
                    mobile: mobile,
                    uuid: that.device.uuid
                },
                data2url: true,
                type: 'POST',
                headers: { uuid: that.device.uuid }
            }).then(() => {
                Modal.toast('验证码发送成功');
            }).catch(() => {

            }).finally(() => {
                sendVerify.innerHTML = '获取';
                sendVerify.classList.add('disabled');
            });
            e.stopPropagation();
        });
        d.on(registerBtn.wrapper, 'click', function (ev) {
            ev.preventDefault();
            let telVal = tel.value,
                codeVal = verify.value,
                userVal = name.value;
            let deviceInfo = JSON.parse(localStorage.getItem("deviceInfo"));
            if (G.tools.isEmpty(name.value)) {
                Modal.alert('请输入用户名');
                return;
            }
            let mobile = G.tools.str.toEmpty(tel.value);
            if (G.tools.isEmpty(mobile) || !G.tools.valid.isTel(mobile)) {
                Modal.alert('手机号格式有误');
                return;
            }
            if (G.tools.isEmpty(verify.value)) {
                Modal.alert('请输入验证码');
                return;
            }
            if (tools.isEmpty(deviceInfo) && tools.isEmpty(deviceInfo.uuid)) {
                Modal.alert('uuid为空');
            }
            G.Ajax.fetch(CONF.ajaxUrl.unBinding, {
                data: {
                    mobile: telVal,
                    check_code: codeVal,
                    userid: userVal,
                    uuid: deviceInfo.uuid
                },
                type: 'get'
            }).then(({ response }) => {
                let res = JSON.parse(response);
                // alert(response);
                if (Number(res.errorCode) === 0) {
                    new UnBinding({
                        mobile: telVal,
                        check_code: codeVal,
                        userid: userVal,
                        uuid: deviceInfo.uuid
                    })
                    return false;
                } else if (res.errorCode == 50012) {
                    if (res.msg === '当前设备已解绑成功') {
                        Modal.alert(res.msg, null, () => { sys.window.load(CONF.url.reg); });
                    } else {
                        Modal.alert(res.msg);
                    }
                } else {
                    Modal.alert(res.msg);
                }
            }).catch(err => {
                console.log(err)
            })

        })
    }
    private loginByFinger() {
        // debugger;
        if (!this.validReg()) {
            return;
        }
        let result = ('BlueWhaleShell' in window || 'AppShell' in window) ?
            // JSON.parse(BlueWhaleShell.postMessage('callFinger','{"type":"0"}'))
            { success: true, msg: 'yes' }
            : { success: false, msg: '必须在客户端内使用' };

        // textEl.innerHTML = `<span${result.success ? '' : ' class="red"'}>${result.msg}</span><br/>`;

        if (!result.success) {
            Modal.alert(result.msg);
            return;
        }
        this.fingerModal.isShow = true;
    };

    /**
     * 移动指纹登录
     */
    private touchidClick() {
        let loginPage = this;
        if (!loginPage.validReg()) {
            return;
        }
        sys.window.touchid((e) => {
            let json = JSON.parse(e.detail);
            if (json.success) {
                BwRule.Ajax.fetch(CONF.ajaxUrl.passwordEncrypt, {
                    data: { str: loginPage.device.auth_code }
                }).then(({ response }) => {
                    let authCode = response.body.bodyList[0];
                    loginPage.ajaxLogin(CONF.ajaxUrl.loginTouchID, {
                        password: authCode
                    });
                })
            } else {
                if (json.msg == 1) {
                    Modal.toast("指纹匹配不正确");
                } else if (json.msg == 2) {
                    //1098bug单说由壳提示
                    // Modal.toast("该设备不支持指纹");
                } else {
                    Modal.toast(json.msg);
                }
            }
        });
    }

    /**
     * 微信登录
     */
    private wechatChick = () => {
        if (!this.validReg()) {
            return;
        }
        if (sys.os === 'ad' || sys.os === 'ip') {
            sys.window.wechatin((e) => {
                let json = JSON.parse(e.detail);
                if (json.success) {
                    this.ajaxLogin(CONF.ajaxUrl.loginWeiXin, {
                        openid: json.msg.unionid
                    });
                } else {
                    if (json.msg == 1) {
                        Modal.toast("操作取消");
                    } else if (json.msg == 2) {
                        Modal.toast("登录请求被微信拒绝");
                    } else if (json.msg == 3) {
                        Modal.toast("请安装微信客户端后再使用");
                    } else {
                        Modal.toast(json.msg);
                    }
                }
            });
        }
    };
    private loginFunc = () => {
        // new UnBinding({check_code: "123", mobile: "13799914019", uuid: "8C-16-45-29-A5-B8", register: "on"})
        // return false;
        let loginPage = this,
            saveBtn = loginPage.props.saveButton,
            isSavePw = saveBtn instanceof CheckBox ? saveBtn.checked : (<HTMLInputElement>saveBtn).checked,
            password = loginPage.props.password.value,
            userId = loginPage.props.userId.value.replace(/\s+/g, "");
        if (tools.isEmpty(userId)) {
            Modal.alert('请填写用户名');
            return;
        }
        if (tools.isEmpty(password)) {
            Modal.alert('请填写密码');
            return;
        }
        loginPage.device.isSavePassword = isSavePw;

        BwRule.Ajax.fetch(CONF.ajaxUrl.passwordEncrypt, {
            data: { str: password }
        }).then(({ response }) => {
            let encodePassword = response.body.bodyList[0];

            loginPage.ajaxLogin(CONF.ajaxUrl.loginPassword, {
                userid: userId.toUpperCase(),
                password: encodePassword
            }, () => {
                return new Promise((resolve) => {
                    loginPage.device.userid = userId.toUpperCase();
                    // loginPage.device.password = password;
                    resolve();
                });
            });
        })
    }
    /**
     * 密码登录
     */
    private loginClick() {
        this.loginFunc();
        return false;
        if (tools.isMb) {
            try {
                Shell.other.isPermission((e) => {
                    if (e.data === 'false') {
                        // Modal.alert("没有权限进入系统");
                        Modal.alert("没有权限进入系统", "提示", () => {
                            if (sys.os === 'ad' || sys.os === 'ip') {
                                sys.window.quit();
                            }
                        })
                    } else {
                        this.loginFunc();
                    }
                });
            } catch (error) {
                Modal.alert("isPermission接口报错")
            }

        } else {
            this.loginFunc();
        }
    }
    /**
     * 登录ajax
     */
    ajaxLogin(url: string, loginData, callback = (result) => Promise.resolve()) {
        let loginPage = this,
            loginBtn = loginPage.props.loginButton,
            login = loginBtn instanceof Button ? loginBtn.wrapper : loginBtn;
        if (login.classList.contains('disabled')) {
            return;
        }
        // let shell:any = ShellAction.get();
        loginPage.loginBtnState(1);
        // let loginUrl = tools.url.addObj(url, loginData);
        let result = { success: false, data: null };
        return new Promise((resolve, reject) => {
            BwRule.Ajax.fetch(url, {
                type: 'post',
                data: [loginData],
                headers: { 'auth_code': loginPage.device.auth_code, 'uuid': loginPage.device.uuid }
            }).then(({ response }) => {
                result.success = true;
                result.data = response;
                let token = response.head.accessToken || '';
                window.localStorage.setItem('token', token);
                // console.log(response);
                // debugger
                callback(result).then(() => {
                    loginPage.loginBtnState(10);
                    let user = User.get(),
                        noShow = [];
                    user.clearStorage();
                    response.dataArr.forEach((col, index) => {
                        if (col.NAME === 'are_id') {
                            user.are_id = col.VALUE;
                        } else if (col.NAME === 'userid') {
                            user.userid = col.VALUE;
                        } else if (col.NAME === 'USERNAME') {
                            user.department = col.VALUE;
                            user.username = col.VALUE;
                        } else if (col.NAME === 'auth_code') {
                            loginPage.device.auth_code = col.VALUE;
                        } else if (col.NAME === 'hideBaseMenu') {
                            noShow = col.VALUE.split(',');
                        } else if (col.NAME === 'PLATFORM_NAME') {
                            user.platformName = col.VALUE;
                        }
                    });
                    if (sys.os === 'ad' || sys.os === 'ip') {
                        let accessToken = response.head.accessToken || '',
                            jwtToken = response.head.jwtToken || '',
                            refreshToken = response.head.refreshToken || '';
                        sys.window.opentab(user.userid, accessToken.toString(), noShow, {
                            refreshToken,
                            jwtToken
                        });
                    } else {
                        BW.sysPcHistory.setLockKey(user.userid);
                        BW.sysPcHistory.setInitType('1');
                        sys.window.opentab(void 0, void 0, noShow);
                        // BW.sysPcHistory.remainLockOnly(() => sys.window.opentab());
                    }
                    resolve();
                });
            }).catch((ev) => {
                typeof callback === 'function' && callback(result).then(() => {
                    loginPage.loginBtnState(0);
                    reject(ev);
                });
            });
        })
    }

    private initEvent(props: IProps) {
        let loginPage = this;
        if (props.regButton) {
            let registerHandler = () => {
                if (tools.isEmpty(loginPage.device.auth_code)) {
                    sys.window.load(CONF.url.reg);
                } else {
                    Modal.toast('您的设备已注册');
                }
            };
            if (props.regButton instanceof Button) {
                props.regButton.onClick = () => {
                    registerHandler();
                };
            } else {
                d.on(props.regButton, 'click', () => {
                    registerHandler();
                });
            }
        }
        if (props.loginButton) {
            if (props.loginButton instanceof Button) {
                props.loginButton.onClick = () => {
                    loginPage.loginClick()
                }
            } else {
                d.on(props.loginButton, 'click', () => {
                    loginPage.loginClick()
                });
            }
        }

        if (props.wxButton) {
            if (tools.isEmpty(this.device.auth_code)) {
                d.remove(props.wxButton);
                props.wxButton = null;
            } else {
                d.on(props.wxButton, 'click', () => {
                    loginPage.wechatChick()
                });
            }
        }
        if (props.fingerMbBtn) {
            d.on(props.fingerMbBtn, 'click', () => {
                loginPage.touchidClick()
            });
        }
        if (props.scanButton) {
            d.on(props.scanButton, "click", () => {
                // console.log(this.props.userId.value.replace(/\s+/g, ""))
                let userName = this.props.userId.value.replace(/\s+/g, "")
                this.scanHandle(tools.isEmpty(userName) ? false : true);
            })
        }
        if (props.fingerPcBtn) {
            d.on(props.fingerPcBtn, 'click', () => {
                loginPage.loginByFinger()
            });
        }
        if (props.jiebangButton) {
            d.on(props.jiebangButton, 'click', () => {
                loginPage.handleCancelBind()
            });
        }
        if (props.SMSBtn) {
            if (props.SMSBtn instanceof Button) {
                props.SMSBtn.onClick = tools.pattern.throttling(() => {
                    this.phoneVerify();
                }, 1000)
            }
        }

        if (props.utButton) {
            props.utButton.onClick = tools.pattern.throttling(() => {
                this.unBindling();
            }, 1000)
        }

        if (props.fqaBtn) {
            props.fqaBtn.onClick = tools.pattern.throttling(() => {
                // 使用异步加载fqa模块，防止一进入页面直接加载，堵塞
                props.fqaBtn.disabled = true;
                let spinner = new Spinner({
                    type: Spinner.SHOW_TYPE.replace,
                    el: props.fqaBtn.wrapper
                });
                spinner.show();
                new Promise((resolve, reject) => {
                    if (tools.isMb) {
                        require(['FqaModal'], (f) => {
                            new f.FqaModal({});
                            resolve();
                        });
                    }
                    else {
                        require(['FqaPcModal'], (f) => {
                            new f.FqaPcModal({});
                            resolve();
                        });
                    }
                }).then(() => {
                    spinner.hide();
                    props.fqaBtn.disabled = false;
                })
            }, 1000);
        }
        let usertap = 0, maxtap = 5;
        let type = tools.isMb ? 'touchstart' : 'click';
        (tools.isMb ? d.query('.login-logo') : d.query('.logo')).addEventListener(type, () => {
            usertap += 1;
            if (usertap === maxtap) {
                sys.window.load(CONF.url.selectServer);
                usertap = 0;
            }
        });
        ShareCode.scanCode();
    }

    /**
     * 验证是否注册过
     */
    private validReg(): boolean {
        if (tools.isEmpty(this.device.auth_code)) {
            Modal.confirm({
                msg: '设备未注册',
                btns: ['取消', '前往注册'],
                callback: (index) => {
                    if (index === true) {
                        sys.window.load(CONF.url.reg);
                    }
                }
            });
            return false;
        }
        return true;
    }

    /**
     * 改变登录状态
     */
    private loginBtnState(type: number) {
        let btn = this.props.loginButton,
            login = btn instanceof Button ? btn.wrapper : btn,
            loginText = login;
        switch (type) {
            case 0:
                login.classList.remove('disabled');
                loginText.innerHTML = '登录';
                break;
            case 1:
                login.classList.add('disabled');
                if (sys.isMb) {
                    loginText.innerHTML = '<span style="width:22px;height:22px;vertical-align:sub" class="mui-spinner"></span> 登录中...';
                } else {
                    loginText.innerHTML = '登录中...';
                }
                break;
            case 10:
                login.classList.remove('disabled');
                loginText.innerHTML = '登录成功';
                break;
        }
    }

    /**
     * 保存账号密码
     */
    private loadPassword() {
        //加载保存的用户名密码
        let saveButton = this.props.saveButton;
        if (this.device.isSavePassword) {
            if (saveButton instanceof CheckBox) {
                saveButton.checked = true;
            } else {
                (<HTMLInputElement>saveButton).checked = true;
            }
            this.props.userId.value = tools.str.toEmpty(this.device.userid);
            this.props.password.value = tools.str.toEmpty(this.device.password);
        }
    }

    /**
     * 设备升级uuid获取
     */
    private deviceUpdate() {
        if ('BlueWhaleShell' in window) {
            let versionText = BlueWhaleShell.postMessage('getVersion', '');
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
            BwRule.Ajax.fetch(CONF.ajaxUrl.pcVersion, {
                data: { getversion: versionText },
                silent: true,
            }).then(({ response }) => {
                BlueWhaleShell.postMessage('downloadFile', JSON.stringify(response.data[0]));
            });

            let json = BlueWhaleShell.postMessage('getDevice', '');
            if (!tools.isEmpty(json)) {
                this.device.uuid = JSON.parse(json).msg.uuid;
            } else {
                Modal.toast("获取不到设备信息");
            }
        } else if (sys.os === 'ip') {
            sys.window.getDevice("uuid");
            window.addEventListener('getDevice', (e: CustomEvent) => {
                let json = JSON.parse(e.detail);
                if (json.success) {
                    this.device.uuid = json.msg.uuid;
                } else {
                    Modal.toast(json.msg);
                }
            });
        } else if (sys.os === 'ad') {
            this.device.uuid = sys.window.getDevice("uuid").msg;
        } else if ('AppShell' in window && tools.isPc) {
            let base = Shell.base;
            base.versionUpdate(CONF.ajaxUrl.pcVersion, () => { }, () => { });

            let result = base.device;
            if (result.success) {
                this.device.uuid = result.data.uuid;
                // console.log(this.device.uuid);
            } else {
                Modal.toast("获取不到设备信息");
            }
        } else {
            //this.device.uuid = '28-D2-44-0C-4E-B5';
        }
    }
    //扫码登陆
    private scanHandle = (status: boolean = false) => {
        alert('扫码');
        d.query(".login-wrapper", document.body).style.display = "none";
        // isLogin 判断是否初次登录,code 整个弹窗 close 关闭按钮
        let isLogin = status, code = null, close = null;
        if (isLogin) {
            code = this.renderLogined();
            close = d.query("#js_other", code);
        } else {
            code = this.renderUnLogin();
            close = d.query("#close", code);
        }
        // 其他方式登录,退回旧的登录弹窗
        d.on(close, "click", () => {
            if (this.Interval) {
                clearInterval(this.Interval)
            }
            d.query(".login-wrapper", document.body).style.display = "block";
            code.parentNode.removeChild(code)
        })
        //切换用户按钮(转到未登录，生成二维码)
        let cueUser = d.query("#js_cue", code);
        d.on(cueUser, "click", () => {
            code.remove();
            this.scanHandle(false)
        })
    }
    renderUnLogin = () => {
        let wrap = d.query(".code_login", document.body)
        if (wrap) {
            wrap.style.display = "none";
        }
        //<div class="refresh_code">请刷新</div>
        let dom = d.create(`
           <div>
                <div class="scan_logo">
                    <img data-action="selectServer" src= ${G.requireBaseUrl + '../img/login-logo.png'} alt="fastlion" />
                </div>
                <div class='code_login'>
                    <div class="cav_wrapper">
                       <div class="refresh_code">
                          <span>二维码失效</span>
                          <div id="code_refresh">刷新</div>
                       </div>
                       <div id='code_login_cav'></div>
                    </div>
                    <p class="tip">请打开速狮APP扫码登录</p>
                    <div id="close">其他方式</div>
                </div>
           </div>
         `)
        d.append(d.query(".login-page-container"), dom);
        this.req_getLgToken();
        d.on(d.query("#code_refresh"), "click", () => {
            d.query(".refresh_code").style.display = "none";
            d.query("#code_login_cav").innerHTML = null;
            this.req_getLgToken();
        })
        return dom;
    }
    renderLogined = () => {
        let dom = d.create(`
         <div>
            <div class="scan_logo">
               <img data-action="selectServer" src= ${G.requireBaseUrl + '../img/login-logo.png'} alt="fastlion" />
           </div>
            <div class="has_logined">
                    <p class="current_user">当前用户</p>
                    <span class="user_icon">
                      <i class="iconfont icon-yonghu1"></i>
                    </span>
                    <p class="current_name"></p>
                    <button id="js_login_btn">登录</button>
                    <div class="has_logined_footer">
                            <div id="js_cue">切换用户</div>
                            <div id="js_other">其他方式登录</div>
                    </div>
            </div>
         </div>
        `)
        d.append(d.query(".login-page-container"), dom);
        d.query(".current_name", dom).innerText = this.props.userId.value.replace(/\s+/g, "")
        let loginBtn = d.query("#js_login_btn");
        d.on(loginBtn, "click", () => {
            this.req_sendServer()
            // .then((res)=>{
            //     console.log(res)
            //     Modal.toast('请在手机上确认登录');
            // })
        })

        return dom;
    }
    // 点击登录 --非初次登录 通知服务端该用户点击登录了，服务端websocket给userid对应的用户弹出确认登录弹窗
    req_sendServer() {
        //userid=XXX 
        BwRule.Ajax.fetch(CONF.siteUrl + "/app_sanfu_retail/null/codelogin/code", {
            data: {
                userid: this.props.userId.value
            }
        }).then(({ response }) => {
            Modal.toast("请打开速狮APP确认登录")
            this.req_countdown(response.lgToken, () => {

            })
        })

    }
    //扫码登录获取LgToken
    req_getLgToken = () => {
        G.Ajax.fetch(CONF.siteUrl + "/app_sanfu_retail/null/codelogin/code ").then(({ response }) => {
            response = JSON.parse(response)
            QrCode.toCanvas(response.lgToken, 150, 150, d.query("#code_login_cav"));
            this.req_countdown(response.lgToken, () => {
                let dom = d.query("#code_login_cav")
                dom.innerHTML = "";
                this.req_getLgToken()
            })
        }).catch((e) => {
            console.log(e);
        })
    }

    req_countdown(lgToken, cb) {
        let i = 180;
        this.Interval = setInterval(() => {
            this.req_polling(lgToken).then(({ response }) => {
                //手机确认登录或扫码成功
                if (response.head) {
                    let user = User.get(),
                        noShow = [];
                    user.clearStorage();
                    response.dataArr.forEach((col, index) => {
                        if (col.NAME === 'are_id') {
                            user.are_id = col.VALUE;
                        } else if (col.NAME === 'userid') {
                            user.userid = col.VALUE;
                        } else if (col.NAME === 'USERNAME') {
                            user.department = col.VALUE;
                            user.username = col.VALUE;
                        } else if (col.NAME === 'hideBaseMenu') {
                            noShow = col.VALUE.split(',');
                        } else if (col.NAME === 'PLATFORM_NAME') {
                            user.platformName = col.VALUE;
                        }
                    });
                    if (sys.os === 'ad' || sys.os === 'ip') {
                        let accessToken = response.head.accessToken || '';
                        sys.window.opentab(user.userid, accessToken.toString(), noShow);
                    } else {
                        BW.sysPcHistory.setLockKey(user.userid);
                        BW.sysPcHistory.setInitType('1');
                        sys.window.opentab(void 0, void 0, noShow);
                        // BW.sysPcHistory.remainLockOnly(() => sys.window.opentab());
                    }
                    clearInterval(this.Interval)
                }
                let state = Number(response.state);
                if (state < 0) {
                    if (state === -2) {
                        d.query(".refresh_code").style.display = "block";
                        if (d.query(".has_logined")) {
                            Modal.alert(response.msg || '二维码失效，请重试')
                        }
                    }
                    clearInterval(this.Interval)
                }
                // if (Number(response.state) !== 0) {
                //     if (Number(response.state) === -2) {
                //         d.query(".refresh_code").style.display = "block";
                //     }
                //     if (Number(response.state) !== 1) {
                //         clearInterval(this.Interval)
                //     }

                // }
                //手机确认过 state=1
                // if (Number(response.state) === 1) {
                //     i--;
                //     if (i === 1) {
                //         cb();
                //         clearInterval(this.Interval)
                //     }
                // } if (Number(response.state) === -2) {
                //     d.query(".refresh_code").style.display="block";
                //     clearInterval(this.Interval)
                // } else {
                //     Modal.toast(response.msg)
                //     clearInterval(this.Interval)
                // }
            }).catch(() => {
                clearInterval(this.Interval)
            })
        }, 1000)
    }
    //轮询
    req_polling(lgToken: string) {
        return BwRule.Ajax.fetch(CONF.siteUrl + "/app_sanfu_retail/null/codelogin/state", {
            data: {
                lgtoken: lgToken
            }
        })
    }
    private device: Device;
}