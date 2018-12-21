/// <amd-module name="LoginPage"/>
import sys = BW.sys;
import tools = G.tools;
import CONF = BW.CONF;
import d = G.d;
import {Modal} from "global/components/feedback/modal/Modal";
import {User} from "../../../global/entity/User";
import {Device} from "../../../global/entity/Device";
import {BwRule} from "../../common/rule/BwRule";
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";
import {Button} from "../../../global/components/general/button/Button";
import {UnBinding} from "../../module/unBinding/UnBinding";
import {NewFinger} from "../../module/fingerPrint/NewFinger";
import Shell = G.Shell;
import {Spinner} from "../../../global/components/ui/spinner/spinner";

interface IProps {
    drive?: string,
    responseBean : obj,
    loginButton : HTMLElement | Button,
    userId : HTMLInputElement,
    password : HTMLInputElement,
    saveButton : HTMLElement | CheckBox,
    regButton : HTMLElement | Button,
    fingerMbBtn ?: HTMLElement,
    fingerPcBtn ?: HTMLElement,
    wxButton ?: HTMLElement,
    utButton ?: Button,
    SMSBtn?: HTMLElement | Button;
    fqaBtn?: Button,
}
/**
 * 移动和电脑的登录页面
 */
export class LoginPage{

    constructor(private props: IProps) {
        tools.isMb && this.getVersion();
        let response = props.responseBean;
        this.device = Device.get();
        this.deviceUpdate();

        if(response && response.body && response.body.bodyList && response.body.bodyList[0]){
            let dataList = response.body.bodyList[0].dataList;
            let meta = response.body.bodyList[0].meta;
            response.data = BwRule.getCrossTableData(meta, dataList);
            if(response.data && response.data[0] && response.data[0].AUTH_CODE){
                this.device.auth_code = response.data[0].AUTH_CODE;
            }else{
                this.device.auth_code = '';
            }
        }else{
            this.device.auth_code = '';
        }
        this.loadPassword();
        this.initEvent(props);
        if(sys.isMb){
            sys.window.close = double_back;
        }
        // sys.window.getGps(() =>{});
        // sys.window.openGps();
        // let fqa = new FqaModal({
        //     container: document.body
        // });
    }

    protected getVersion(){
        G.Ajax.fetch(CONF.ajaxUrl.getVersion).then(({response}) => {
            response = JSON.parse(response);
            sys.window.uploadVersion(response.data.version);
        }).catch((e) => {
            console.log(e);
        })
    }
    /*
    * 手机短信验证登录
    * */
    protected phoneVerify(){
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
                if(tools.valid.isTel(tel.value)){
                    let time = 60;
                    checkCodeBtn.isDisabled = true;
                    checkCodeBtn.content = time + 's后重新获取';
                    let timer = setInterval(() => {
                        time --;
                        if(time === 0){
                            clearInterval(timer);
                            checkCodeBtn.content =  '获取验证码';
                            checkCodeBtn.isDisabled = false;
                        }else{
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
                        headers: {uuid: this.device.uuid}
                    }).catch(() => {
                        // 发送失败时，获取验证码按钮不进入倒计时。
                        clearInterval(timer);
                        checkCodeBtn.content =  '获取验证码';
                        checkCodeBtn.isDisabled = false;
                    });
                }else{
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
            position: tools.isMb ? 'full' : '',
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
            // 验证是否输入手机号与短信验证码
            if(!tools.valid.isTel(telVal)){
                Modal.alert('请输入正确的手机号码');
            }else if(tools.isEmpty(codeVal)){
                Modal.alert('请输入短信验证码');
            }else{
                loginBtn.isLoading = true;
                loginBtn.isDisabled = true;
                loginBtn.content = '登陆中...';
                // 前端验证通过后向后台发送数据
                this.ajaxLogin(CONF.ajaxUrl.loginCode, {
                    mobile: telVal,
                    check_code: codeVal,
                }, (result) => {
                    return new Promise((resolve, reject) => {
                        if(result.success) {
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
                    loginBtn.content = '登陆成功';
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
    protected bindWeChat(mobile: string, callback: Function){
        // 绑定微信方法
        let bindWeChat = () => {
            sys.window.wechatin((e) => {
                let result = JSON.parse(e.detail);
                if(result.success){
                    // 获取openId成功
                    let response = Object.assign({}, result.msg || {}, {mobile});// 请求数据
                    BwRule.Ajax.fetch(BW.CONF.ajaxUrl.bindWeChat, {
                        type: 'post',
                        timeout: 1500,
                        data: [response]
                    }).then((ev) => {
                        if(ev.body && tools.isNotEmpty(ev.body)) {
                            // 绑定成功
                            Modal.toast('绑定成功！');
                            callback();
                        }else{
                            // 绑定失败
                            bindError();
                        }
                    }).catch(() => {
                        // ajax请求失败时
                        bindError();
                    });
                }else{
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
            data: {mobile}
        }).then(({response}) => {
            let body = response.body || {},
                bodyList = body.bodyList ? body.bodyList[0] : {},
                flag = bodyList.flag;
            if(flag === 1){
                // 已经绑定微信，直接跳转到首页
                callback();
            }else if(flag === 2){
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
            }else{
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
    protected unBindling(){
        // 初始化页面
        let body = d.create('<div class="login-wrapper modal-body-login"></div>');
        let title = d.create('<div class="login-title">短信获取解绑信息</div>');
        let form = d.create(`
        <form action="#" class="login-form">
            <div class="form-group">
                <input class="user" type="text" placeholder="请输入员工号"/>
            </div>
            <div class="form-group">
                <input class="tel" type="number" placeholder="请输入手机号码"/>
            </div>
            <div class="form-group">
                <input class="code" type="number" placeholder="请输入短信验证码"/>
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
                if(tools.valid.isTel(tel.value)){
                    let time = 60;
                    checkCodeBtn.isDisabled = true;
                    checkCodeBtn.content = time + 's后重新获取';
                    let timer = setInterval(() => {
                        time --;
                        if(time === 0){
                            clearInterval(timer);
                            checkCodeBtn.content =  '获取验证码';
                            checkCodeBtn.isDisabled = false;
                        }else{
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
                        headers: {uuid: this.device.uuid}
                    }).catch(() => {
                        // 发送失败时，获取验证码按钮不进入倒计时。
                        clearInterval(timer);
                        checkCodeBtn.content =  '获取验证码';
                        checkCodeBtn.isDisabled = false;
                    });
                }else{
                    Modal.alert('请输入正确的手机号码');
                }
            }
        });

        // 解绑按钮
        let loginBtn = new Button({
            container: d.query('.btn-group', form),
            content: '前往解绑',
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
            position: tools.isMb ? 'full' : '',
            width: '730px',
            isShow: true,
            isOnceDestroy: true,
            className: 'sms-login'
        });

        // 短信验证码登录
        d.on(form, 'submit', (ev) => {
            ev.preventDefault();
            let telVal = tel.value,
                codeVal = code.value,
                userVal = user.value;
            // 验证是否输入手机号与短信验证码
            if(tools.isEmpty(userVal)){
                Modal.alert('请输入员工号');
            } else if(!tools.valid.isTel(telVal)){
                Modal.alert('请输入正确的手机号码');
            }else if(tools.isEmpty(codeVal)){
                Modal.alert('请输入短信验证码');
            }else{
                loginBtn.isLoading = true;
                loginBtn.isDisabled = true;
                loginBtn.content = '前往中...';
                // 前端验证通过后向后台发送数据
                BwRule.Ajax.fetch(CONF.ajaxUrl.unBinding,{
                    data : {
                        mobile: telVal,
                        check_code: codeVal,
                        userid: userVal
                    },
                    type : 'get'
                }).then(({response}) => {
                    new UnBinding(response.data)
                }).finally(() => {
                    loginBtn.isLoading = false;
                    loginBtn.isDisabled = false;
                    loginBtn.content = '前往解绑';
                })
            }
        });
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
                        if(ev.success){
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

    private loginByFinger() {
        // debugger;
        if(!this.validReg()) {
            return;
        }
        let result = ('BlueWhaleShell' in window || 'AppShell' in window) ?
                // JSON.parse(BlueWhaleShell.postMessage('callFinger','{"type":"0"}'))
            {success: true,  msg:'yes'}
            : {success:false, msg:'必须在客户端内使用'};

        // textEl.innerHTML = `<span${result.success ? '' : ' class="red"'}>${result.msg}</span><br/>`;

        if(!result.success) {
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
        if(!loginPage.validReg()){
            return;
        }
        sys.window.touchid((e) => {
            let json = JSON.parse(e.detail);
            if(json.success) {
                BwRule.Ajax.fetch(CONF.ajaxUrl.passwordEncrypt, {
                    data: {str: loginPage.device.auth_code}
                }).then(({response}) => {
                    let authCode = response.body.bodyList[0];
                    loginPage.ajaxLogin(CONF.ajaxUrl.loginTouchID, {
                        password: authCode
                    });
                })
            } else {
                if(json.msg == 1) {
                    Modal.toast("指纹匹配不正确");
                }else if(json.msg == 2) {
                    Modal.toast("该设备不支持指纹");
                }else{
                    Modal.toast(json.msg);
                }
            }
        });
    }

    /**
     * 微信登录
     */
    private wechatChick = () => {
        if(!this.validReg()){
            return;
        }
        if (sys.os === 'ad' || sys.os === 'ip') {
            sys.window.wechatin((e)=>{
                let json = JSON.parse(e.detail);
                if(json.success){
                    this.ajaxLogin(CONF.ajaxUrl.loginWeiXin, {
                        openid: json.msg.unionid
                    });
                }else{
                    if(json.msg==1){
                        Modal.toast("操作取消");
                    }else if(json.msg==2){
                        Modal.toast("登录请求被微信拒绝");
                    }else if(json.msg==3){
                        Modal.toast("请安装微信客户端后再使用");
                    }else{
                        Modal.toast(json.msg);
                    }
                }
            });
        }
    };

    /**
     * 密码登录
     */
    private loginClick()  {
        let loginPage = this,
            saveBtn = loginPage.props.saveButton,
            isSavePw = saveBtn instanceof CheckBox ? saveBtn.checked : (<HTMLInputElement>saveBtn).checked,
            password = loginPage.props.password.value,
            userId = loginPage.props.userId.value.replace(/\s+/g, "");
        if(tools.isEmpty(userId)){
            Modal.alert('请填写用户名');
            return;
        }
        if(tools.isEmpty(password)){
            Modal.alert('请填写密码');
            return;
        }
        loginPage.device.isSavePassword = isSavePw;

        BwRule.Ajax.fetch(CONF.ajaxUrl.passwordEncrypt, {
            data: {str: password}
        }).then(({response}) => {
            let encodePassword = response.body.bodyList[0];

            loginPage.ajaxLogin(CONF.ajaxUrl.loginPassword, {
                    userid: userId.toUpperCase(),
                    password: encodePassword
                }, () => {
                    return new Promise((resolve) => {
                        loginPage.device.userid = userId.toUpperCase();
                        loginPage.device.password = password;
                        resolve();
                    });
                });
        })
    }

    /**
     * 登录ajax
     */
    ajaxLogin(url:string, loginData, callback = (result)=>Promise.resolve()) {
        let loginPage = this,
            loginBtn = loginPage.props.loginButton,
            login = loginBtn instanceof Button ? loginBtn.wrapper : loginBtn;
        if (login.classList.contains('disabled')) {
            return;
        }
        // let shell:any = ShellAction.get();
        loginPage.loginBtnState(1);
        // let loginUrl = tools.url.addObj(url, loginData);
        let result = {success: false, data: null};
        return new Promise((resolve, reject) => {
            BwRule.Ajax.fetch(url, {
                type: 'post',
                data: [loginData],
                headers: {'auth_code': loginPage.device.auth_code, 'uuid': loginPage.device.uuid}
            }).then(({response}) => {
                result.success = true;
                result.data = response;
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
                        } else if (col.NAME === 'hideBaseMenu'){
                            noShow = col.VALUE.split(',');
                        }else if(col.NAME === 'PLATFORM_NAME'){
                            user.platformName = col.VALUE;
                        }
                    });
                    // debugger;
                    if (sys.os === 'ad' || sys.os === 'ip') {
                        let accessToken = response.head.accessToken || '';
                        sys.window.opentab(user.userid, accessToken.toString(), noShow);
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

    private initEvent(props: IProps){
        let loginPage = this;
        if(props.regButton){
            let registerHandler = () => {
                if(tools.isEmpty(loginPage.device.auth_code)){
                    sys.window.load(CONF.url.reg);
                }else{
                    Modal.toast('您的设备已注册');
                }
            };
            if(props.regButton instanceof Button){
                props.regButton.onClick = () => {
                    registerHandler();
                };
            }else{
                d.on(props.regButton, 'click', () => {
                    registerHandler();
                });
            }
        }
        if(props.loginButton) {
            if(props.loginButton instanceof Button){
                props.loginButton.onClick = () => {
                    loginPage.loginClick()
                }
            }else{
                d.on(props.loginButton, 'click', () => {
                    loginPage.loginClick()
                });
            }
        }

        if(props.wxButton) {
            if(tools.isEmpty(this.device.auth_code)){
                d.remove(props.wxButton);
                props.wxButton = null;
            }else{
                d.on(props.wxButton, 'click', () => {
                    loginPage.wechatChick()
                });
            }
        }
        if(props.fingerMbBtn){
            d.on(props.fingerMbBtn, 'click', () => {
                loginPage.touchidClick()
            });
        }
        if(props.fingerPcBtn){
            d.on(props.fingerPcBtn, 'click',  () => {
                loginPage.loginByFinger()
            });
        }

        if(props.SMSBtn){
            if(props.SMSBtn instanceof Button){
                props.SMSBtn.onClick = tools.pattern.throttling(() => {
                    this.phoneVerify();
                 }, 1000)
            }
        }

        if(props.utButton){
            props.utButton.onClick = tools.pattern.throttling(() => {
                this.unBindling();
            }, 1000)
        }

        if(props.fqaBtn){
            props.fqaBtn.onClick = tools.pattern.throttling(() => {
                // 使用异步加载fqa模块，防止一进入页面直接加载，堵塞
                props.fqaBtn.disabled = true;
                let spinner = new Spinner({
                    type: Spinner.SHOW_TYPE.replace,
                    el: props.fqaBtn.wrapper
                });
                spinner.show();
                new Promise((resolve, reject) => {
                    if(tools.isMb){
                        require(['FqaModal'], (f) => {
                            new f.FqaModal({});
                            resolve();
                        });
                    }
                    else{
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
        let usertap = 0,maxtap = 5;
        (tools.isMb ? d.query('.login-logo>img') :  d.query('[data-action="selectServer"]')).addEventListener('click',() => {
            usertap += 1 ;
            if(usertap === maxtap){
                sys.window.load(CONF.url.selectServer);
                usertap = 0;
            }
        });
    }

    /**
     * 验证是否注册过
     */
    private validReg():boolean {
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
    private loginBtnState(type:number){
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
                if(sys.isMb){
                    loginText.innerHTML = '<span style="width:22px;height:22px;vertical-align:sub" class="mui-spinner"></span> 登录中...';
                }else{
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
        if('BlueWhaleShell' in window){
            let versionText = BlueWhaleShell.postMessage('getVersion','');
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
                data: {getversion: versionText},
                silent: true,
            }).then(({response}) => {
                BlueWhaleShell.postMessage('downloadFile',JSON.stringify(response.data[0]));
            });

            let json = BlueWhaleShell.postMessage('getDevice','');
            if(!tools.isEmpty(json)){
                this.device.uuid = JSON.parse(json).msg.uuid;
            }else{
                Modal.toast("获取不到设备信息");
            }
        }else if(sys.os==='ip'){
            sys.window.getDevice("uuid");
            window.addEventListener('getDevice', (e:CustomEvent) => {
                let json = JSON.parse(e.detail);
                if(json.success){
                    this.device.uuid = json.msg.uuid;
                }else{
                    Modal.toast(json.msg);
                }
            });
        }else if(sys.os==='ad'){
            this.device.uuid = sys.window.getDevice("uuid").msg;
        }else if('AppShell' in window && tools.isPc) {
            let base = Shell.base;
            base.versionUpdate(CONF.ajaxUrl.pcVersion, () => {}, () => {});

            let result = base.device;
            if(result.success){
                this.device.uuid = result.data.uuid;
                // console.log(this.device.uuid);
            }else{
                Modal.toast("获取不到设备信息");
            }
        } else{
            //this.device.uuid = '28-D2-44-0C-4E-B5';
        }
    }

    private device:Device;
}