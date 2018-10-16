/// <amd-module name="RegistPage"/>
import SPAPage = G.SPAPage;
import d = G.d;
import {RegistModule1} from "./RegistModule1";
import {RegistModule2} from "./RegistModule2";
import {RegistModule3} from "./RegistModule3";

export class RegistPage extends SPAPage {
    set title(t: string) {
        this._title = t;
    }

    get title() {
        return this._title;
    }

    protected wrapperInit() {
        let registHTML = <div className="login-page-common regist-page">
            <div className="college-name">闽江学院</div>
            <div className="lesson2-title">
                <p className="lang-ch">第二课堂后台管理系统</p>
                <p className="lang-en">Background management system</p>
            </div>
            <div className="login-form-common regist-wrapper"></div>
        </div>;
        let registWrapper = d.query('.regist-wrapper', registHTML);
        new RegistModule1({
            container: registWrapper,
            loginTitle: '请输入登录密码',
            isRegist:true,
            submitHandler: (loginPwd:obj) => {
                registWrapper.innerHTML = '';
                new RegistModule2({
                    container: registWrapper,
                    loginPwd:loginPwd.password,
                    submitHandler: (data) => {
                        registWrapper.innerHTML = '';
                        new RegistModule3({
                            container: registWrapper,
                            title: '恭喜您完成注册及身份验证',
                            explain: '您可以使用账号、手机号、身份证号加密码的方式登录系统。\n' +
                            '请登录系统于个人中心模块核对或补充您的个人资料。\n' +
                            '若您是学生，请及时完成微信端的绑定及人像采集。',
                            userInfo:data
                        })
                    }
                })
            }
        });
        return registHTML;

    }

    protected init(para: Primitive[], data?) {

    }
}