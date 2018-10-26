/// <amd-module name="RegisterPcPage"/>

import {Button} from "../../../global/components/general/button/Button";
import d = G.d;
import {RegPage} from "./register";

export class RegisterPcPage extends RegPage {
    constructor(para) {

        // 初始化头部logo
        let logoWrapper = <div className="logo">
            <img data-action="selectServer" src={G.requireBaseUrl + '../img/login-logo.png'} alt="fastlion"/>
        </div>;

        let body = <div className="register-content mui-content">
            <div className="register-title">设备注册</div>
            <form className="register-form">
                <div className="form-group">
                    <input id="tel" type="text" placeholder="请输入手机号"/>
                </div>
                <div className="form-group">
                    <input id="verify" type="text" placeholder="请输入验证码"/>
                    <div className="more-group"/>
                </div>
                <div className="btn-group"></div>
            </form>
        </div>;

        d.on(d.query('.register-form', body), 'submit', (e) => {
            e.preventDefault();
        });

        let registerBtn = new Button({
            container: d.query('.btn-group', body),
            content: '注册',
            className: 'register-submit',
        });

        let goLogin = new Button({
            container: d.query('.btn-group', body),
            content: '返回登录',
            className: 'goLogin'
        });

        let checkCodeBtn = new Button({
            container: d.queryAll('.more-group', body)[0],
            content: '获取验证码',
            className: 'check-code',
        });

        // 底部
        let footer = <div className="footer">
            <div className="login-fqa"></div>
            <div className="copyright">&copy;2018速狮软件版权所有</div>
        </div>
        let fqaBtn = new Button({
            container: d.query('.login-fqa', footer),
            content: '常见问题',
        });

        let wrapper = <div className="register-wrapper mui-content">
            {logoWrapper}
            {body}
            {footer}
        </div>;

        d.append(para.dom, wrapper);
        para.dom.style.backgroundImage = `url(${G.requireBaseUrl + '../img/bg.png'})`;
        para.dom.style.backgroundRepeat = 'repeat-x';
        para.dom.style.backgroundPositionY = 'center';

        super({
            goLogin: goLogin.wrapper,
            saveReg: registerBtn.wrapper,
            tel: d.query('#tel', body) as HTMLInputElement,
            sendVerify: checkCodeBtn.wrapper,
            smsCheckCode: d.query('#verify', body) as HTMLInputElement,
            fqaBtn
        });
    }

}