/// <amd-module name="LoginPcPage"/>

import { LoginPage } from "./login";
import { Button } from "../../../global/components/general/button/Button";
import { CheckBox } from "../../../global/components/form/checkbox/checkBox";
import d = G.d;

export class LoginPcPage extends LoginPage {

    constructor(para) {
        // 初始化头部logo和注册按钮
        let logoWrapper = <div className="logo">
            <img data-action="selectServer" src={G.requireBaseUrl + '../img/logo/fastlion.png'} alt="fastlion" />
        </div>;

        // 初始化表单内容（输入框、按钮等）
        let form = <form className="login-form">
            <div className="form-group">
                <input id="username" type="text" placeholder="请输入员工号/手机号码" />
            </div>
            <div className="form-group">
                <input id="password" type="password" placeholder="请输入密码" />
            </div>
            <div className="form-group checkbox-group" />
            <div className="btn-group" />
            <button type="submit" className="hide" />
        </form>;

        d.on(form, 'submit', (e) => {
            e.preventDefault();
            loginBtn.wrapper.click();
        });
        // alert(2);
        let passwordInput = d.query('#password', form) as HTMLInputElement;
        // 登录按钮
        let loginBtn = new Button({
            container: d.query('.btn-group', form),
            content: '登录',
            className: 'login-submit',
        });

        // 记住密码
        let checkBox = new CheckBox({
            container: d.query('.checkbox-group', form),
            text: '记住密码',
        });

        // 忘记密码
        let forgetPwd = <div class="forget-pwd"><a href="#">忘记密码?</a></div>;
        // let forgetPwd = <div class="forget-pwd"></div>;
        // let btn = new Button({
        //     container: d.query('.fotget-pwd', forgetPwd),
        //     content: '忘记密码'
        // });
        d.append(d.query('.checkbox-group', form), forgetPwd);

        // 指纹登录和设备注册按钮
        let loginOption = <div className="login-option">
            <a href="#" className="zhiwen">
                <i className="iconfont icon-zhiwen" />
                指纹登录
                </a>
            <a href="#" className="device">
                <i className="iconfont icon-device-mb" />
                设备注册
                </a>
            <a href="#" className="scanLogin">
                <i class="iconfont icon-saoma"></i>
                扫码登陆
                </a>
        </div>;

        d.append(form, loginOption);



        let footer = <div className="footer">
            <div className="login-fqa"></div>
            <div className="copyright">&copy;2018速狮软件版权所有</div>
        </div>
        let fqaBtn = new Button({
            container: d.query('.login-fqa', footer),
            content: '常见问题',
        });

        // 初始化登录页
        let wrapper = <div className="login-wrapper mui-content">
            {logoWrapper}
            {form}
            {footer}
        </div>;
        d.append(para.dom, wrapper);
        para.dom.style.backgroundImage = `url(${G.requireBaseUrl + '../img/bg.png'})`;
        para.dom.style.backgroundRepeat = 'repeat-x';
        para.dom.style.backgroundPositionY = 'center';

        super({
            responseBean: para.responseBean,
            loginButton: loginBtn,
            userId: document.getElementById('username') as HTMLInputElement,
            password: document.getElementById('password') as HTMLInputElement,
            saveButton: checkBox,
            fingerMbBtn: d.query('.zhiwen', loginOption),
            regButton: d.query('.device', loginOption),
            scanButton: d.query(".scanLogin", loginOption),
            fqaBtn
        });

    }

}