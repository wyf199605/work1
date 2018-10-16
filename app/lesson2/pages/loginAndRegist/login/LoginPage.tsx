/// <amd-module name="LoginPage"/>
import SPAPage = G.SPAPage;
import d = G.d;
import tools = G.tools;
import SPA = G.SPA;
import {Modal} from "../../../../global/components/feedback/modal/Modal";
import {CheckBox} from "../../../../global/components/form/checkbox/checkBox";
import {LeRule} from "../../../common/rule/LeRule";
import {Loading} from "../../../../global/components/ui/loading/loading";
import {Button} from "global/components/general/button/Button";

export class LoginPage extends SPAPage {
    set title(t: string) {
        this._title = t;
    }

    get title() {
        return this._title;
    }

    private rememberPwd: CheckBox;

    protected wrapperInit() {
        let loginBtn:Button;
        let userid = localStorage.getItem('userid'),
            password = localStorage.getItem('password');
        let loginHTML = <div className="login-page-common login-page">
            <div className="college-name">闽江学院</div>
            <div className="lesson2-title">
                <p className="lang-ch">第二课堂后台管理系统</p>
                <p className="lang-en">Background management system</p>
            </div>
            <div className="login-form-common login-form">
                <div className="input-wrapper group">
                    <input type="text" name="account" id="account" value={userid} placeholder="账号/手机号/身份证号"/>
                </div>
                <div className="input-wrapper group">
                    <input type="password" name="password" id="password" value={password} placeholder="请输入登录密码"/>
                </div>
                <div className="forget-and-regist">
                    <div className="remember-pwd">

                    </div>
                    <div>
                        <a href="#/loginReg/regist" className="regist">注册</a> | <a href="#/loginReg/forget"
                                                                                   className="forget-pwd">忘记密码</a>
                    </div>
                </div>
                {loginBtn = <Button c-var="login" className="log-btn submit sys-btn" content="登录" onClick={()=>{
                    let account = (d.query('#account', this.wrapper) as HTMLFormElement).value.replace(/\s/g, ''),
                        password = (d.query('#password', this.wrapper) as HTMLFormElement).value.replace(/\s/g, '');
                    if (tools.isEmpty(account)) {
                        Modal.alert('登录账号不能为空!');
                        return;
                    }
                    if (tools.isEmpty(password)) {
                        Modal.alert('登录密码不能为空!');
                        return;
                    }
                    loginBtn.disabled = true;
                    let loading = new Loading({
                        msg:"登录中..."
                    });
                    // 登录
                    LeRule.Ajax.fetch(LE.CONF.ajaxUrl.loginPassword, {
                        type: 'post',
                        data: [{
                            userid: account,
                            password: password
                        }]
                    }).then(({response}) => {
                        loading.destroy();
                        loginBtn.disabled = false;
                        if (this.rememberPwd.get() === true) {
                            localStorage.setItem('userid', account);
                            localStorage.setItem('password', password);
                        }
                        localStorage.setItem('loginData',JSON.stringify(response.data));
                        SPA.open(SPA.hashCreate('lesson2','home'));
                    }).catch(()=>{
                        loading.destroy();
                        loginBtn.disabled = false;
                    })
                }}/>}
                <Button className="log-btn reset" content="重置" onClick={()=>{
                    let accountInput = d.query('#account', this.wrapper) as HTMLFormElement,
                        pwdInput = d.query('#password', this.wrapper) as HTMLFormElement;
                    accountInput.value = '';
                    pwdInput.value = '';
                }}/>
            </div>
        </div>;
        this.rememberPwd = new CheckBox({
            container: d.query('.remember-pwd', loginHTML),
            text: '记住密码'
        });
        tools.isNotEmpty(password) && (this.rememberPwd.checked = true);
        return loginHTML;
    }

    protected init(para: Primitive[], data?) {
        // setTimeout(() => {
        //     this.loginEvents.on();
        // }, 50);
    }

    // private loginEvents = (() => {
    //
    //     // 忘记密码
    //     let forgetPwdHandler = () => {
    //
    //     };
    //     let inputFocusHandler = (e) => {
    //         let inputWrapper = d.closest(e.target, '.input-wrapper');
    //         inputWrapper.classList.add('active');
    //     };
    //     let inputBlurHandler = (e) => {
    //         let inputWrapper = d.closest(e.target, '.input-wrapper');
    //         inputWrapper.classList.remove('active');
    //     };
    //     return {
    //         on: () => {
    //             d.on(this.wrapper, 'click', '.orget-pwd', forgetPwdHandler);
    //             d.on(this.wrapper, 'focus', '.input-wrapper>input', inputFocusHandler);
    //             d.on(this.wrapper, 'blur', '.input-wrapper>input', inputBlurHandler);
    //         },
    //         off: () => {
    //             d.off(this.wrapper, 'click', '.orget-pwd', forgetPwdHandler);
    //             d.off(this.wrapper, 'focus', '.input-wrapper>input', inputFocusHandler);
    //             d.off(this.wrapper, 'blur', '.input-wrapper>input', inputBlurHandler);
    //         }
    //     }
    // })();

    destroy() {
        super.destroy();
        // this.loginEvents.off();
    }
}