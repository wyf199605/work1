/// <amd-module name="RegisterMbPage"/>

import {Button} from "../../../global/components/general/button/Button";
import d = G.d;
import {RegPage} from "./register";

interface IRegisterMbPara {
    container: HTMLElement;
}

export class RegisterMbPage extends RegPage{
    constructor(para: IRegisterMbPara) {
        let header = <header className="register-header mui-bar mui-bar-nav ios-top">
            <a id="goLogin" className="mui-icon mui-pull-left mui-icon-left-nav"/>
        </header>;
        let body = <div className="register-content mui-content">
            <div className="register-title">账号注册</div>
            <form className="register-form">
                <div className="form-group">
                    <input id="tel" type="number" placeholder="输入手机号码"/>
                </div>
                <div className="form-group">
                    <input id="verifyCodeInput" type="number" maxlength="5" placeholder="输入验证码"/>
                    <div className="more-group">
                        <canvas width="80" height="30">您的浏览器不支持canvas，请用其他浏览器打开。</canvas>
                    </div>
                </div>
                <div className="form-group">
                    <input id="verify" type="number" maxlength="6" placeholder="输入短信验证码"/>
                    <div className="more-group"/>
                </div>
                <div className="btn-group"/>
            </form>
        </div>;

        d.on(d.query('.register-form', body), 'submit', (e) => {
            e.preventDefault();
        });
        d.on(d.query("#tel",body),"blur",()=>{
            document.body.scrollTop = 0;
        })
        d.on(d.query("#verifyCodeInput",body),"blur",()=>{
            document.body.scrollTop = 0;
        })
        d.on(d.query("#verify",body),"blur",()=>{
            document.body.scrollTop = 0;
        })
        let registerBtn = new Button({
            container: d.query('.btn-group', body),
            content: '注册',
            className: 'register-submit',
        });

        let checkCodeBtn = new Button({
            container: d.queryAll('.more-group', body)[1],
            content: '获取验证码',
            className: 'check-code',
        });
        d.append(para.container, header);
        d.append(para.container, body);
        // this.renderCheckCode(d.query('.more-group>canvas', body));
        // d.on(d.query('.more-group>canvas', body), 'click', () => {
        //     console.log(this.renderCheckCode(d.query('.more-group>canvas', body)));
        //
        // })
        super({
            goLogin: d.query('#goLogin', header),
            saveReg: registerBtn.wrapper,
            tel: d.query('#tel', body) as HTMLInputElement,
            verifyELCodeInput: d.query('#verifyCodeInput', body) as HTMLInputElement,
            verifyELCode: d.query('.more-group>canvas', body) as HTMLCanvasElement,
            sendVerify: checkCodeBtn.wrapper,
            smsCheckCode: d.query('#verify', body) as HTMLInputElement,
        });
    }

}