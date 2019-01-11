/// <amd-module name="LoginMbPage"/>

import {LoginPage} from "./login";
import {Button} from "../../../global/components/general/button/Button";
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";
import d = G.d;

export class LoginMbPage extends LoginPage {

    constructor(para) {
        // 初始化头部logo和注册按钮
        let logoWrapper = <div className="login-logo">
            <img src={G.requireBaseUrl + "../img/fastlion_logo.png"} alt="fastlion"/>
        </div>;
        let header = <header className="login-header mui-bar mui-bar-nav ios-top"/>;
        let registerBtn = new Button({
            container: header,
            content: '注册',
            className: 'login-register',
        });
        registerBtn.wrapper.classList.add('mui-pull-right');

        let untied = new Button({
            container: header,
            content: '解绑',
            className: 'login-untied',
        });
        untied.wrapper.classList.add('mui-pull-right');


        // 初始化表单内容（输入框、按钮等）
        let form = <form className="login-form">
            <div className="form-group">
                <label for="username">账号</label>
                <input id="username" type="text" placeholder="请输入员工号/手机号码"/>
            </div>
            <div className="form-group">
                <label for="password">密码</label>
                <input id="password" type="password" placeholder="请输入登录密码"/>
                <button className="password-show" type="button">
                    <i className="appcommon app-xianxingyanjing"/>
                </button>
            </div>
            <div className="form-group checkbox-group"/>
            <div className="btn-group"/>
            <button type="submit" className="hide"/>
        </form>;

        d.on(form, 'submit', (e) => {
            e.preventDefault();
            loginBtn.wrapper.click();
        });
            // alert(2);
        let passwordInput = d.query('#password', form) as HTMLInputElement;
        // 显示密码按钮事件
        d.on(d.query('.password-show', form), 'click', function (e) {
            e.preventDefault();
            this.classList.toggle('checked');
            passwordInput.type = this.classList.contains('checked') ? 'text' : 'password';
        });
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
        // 指纹和微信登录按钮
        let moreLogin = <div className="login-more">
            <div className="login-tel-msg"/>
            <div className="login-link-list">
                <a href="#" className="zhiwen">
                    <i className="iconfont icon-zhiwen"/>
                    指纹登录
                </a>
                <a href="#" className="weixin">
                    <i className="iconfont icon-weixin"/>
                    微信登录
                </a>
            </div>
            <div className="login-fqa"/>
        </div>;

        // 短信验证码登录按钮
        let smsBtn = new Button({
            container: d.query('.login-tel-msg', moreLogin),
            content: '短信验证码登录',
        });

        let fqaBtn = new Button({
            container: d.query('.login-fqa', moreLogin),
            content: '常见问题',
        });

        // 初始化登录页
        let wrapper = <div className="login-wrapper mui-content">
            {logoWrapper}
            {form}
            {moreLogin}
        </div>;
        d.append(para.dom, header);
        d.append(para.dom, wrapper);

        super({
            responseBean: para.responseBean,
            loginButton: loginBtn,
            userId: document.getElementById('username') as HTMLInputElement,
            password: document.getElementById('password') as HTMLInputElement,
            saveButton: checkBox,
            fingerMbBtn: d.query('.zhiwen', moreLogin),
            wxButton: d.query('.weixin', moreLogin),
            regButton: registerBtn,
            utButton: untied,
            SMSBtn: smsBtn,
            fqaBtn
        });
    }

}