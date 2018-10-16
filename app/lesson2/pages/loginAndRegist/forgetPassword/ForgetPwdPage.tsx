/// <amd-module name="ForgetPwdPage"/>
import SPAPage = G.SPAPage;
import d = G.d;
import {RegistModule1} from "../regist/RegistModule1";
import {RegistModule3} from "../regist/RegistModule3";

export class ForgetPwdPage extends SPAPage {
    set title(t: string) {
        this._title = t;
    }

    get title() {
        return this._title;
    }

    protected wrapperInit() {
        let forgetHTML = <div className="login-page-common forget-page">
            <div className="college-name">闽江学院</div>
            <div className="lesson2-title">
                <p className="lang-ch">第二课堂后台管理系统</p>
                <p className="lang-en">Background management system</p>
            </div>
            <div className="login-form-common forget-wrapper"></div>
        </div>;
        let registWrapper = d.query('.forget-wrapper', forgetHTML);
        new RegistModule1({
            container: registWrapper,
            loginTitle: '请重置您的登录密码',
            submitHandler: (objData: obj) => {
                registWrapper.innerHTML = '';
                new RegistModule3({
                    container: registWrapper,
                    title: '您的密码已重置成功，您的身份信息如下:',
                    explain: '您可以使用账号、手机号、身份证号加密码的方式登录系统。',
                    userInfo: objData
                })
            }
        });
        return forgetHTML;
    }

    protected init(para: Primitive[], data?) {

    }
}