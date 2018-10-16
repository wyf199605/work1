/// <amd-module name="LoginPage"/>
import SPAPage = G.SPAPage;
import {Button} from "../../../global/components/general/button/Button";
import tools = G.tools;
import d = G.d;
import {TextInput} from "../../../global/components/form/text/text";
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import SPA = G.SPA;
import {DVAjax} from "../../module/util/DVAjax";
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";

export class LoginPage extends SPAPage {

    set title(title: string) {
        this._title = '登录';
    }

    get title() {
        return this._title;
    }

    protected wrapperInit(): Node {
        return d.create(`
        <div class="loginPage">
        <div class="logo"><img src="../../img/develop/login-logo.png" alt=""></div>
        <div class="login-form">
        <div class="account from-group"><label>账号&nbsp;&nbsp;&nbsp;</label></div>
        <div class="pwd from-group"><label>密码&nbsp;&nbsp;&nbsp;</label></div>
        <div class="select-sys from-group"><label>子系统&nbsp;&nbsp;&nbsp;</label></div>
        <div class="remember-pwd from-group"><label></label></div>
        <div class="login-btn from-group"><label></label></div>
        
</div>
<div class="info">© 2018 速狮软件版权所有</div>
</div>
        `);
    }

    private formItems: obj;

    protected init(para: Primitive[], data?) {
        this.title = "登录";

        let account = new TextInput({
            placeholder: '请输入账号',
            container: d.query('.account', this.wrapper)
        });
        account.on('input', (e) => {
            let input = (e.target as HTMLFormElement),
                value = input.value.replace(/\s+/g, "");
            input.value = value.toUpperCase();
            if (tools.isNotEmpty(localStorage.getItem(value))) {
                this.formItems.pwd.set(localStorage.getItem(value));
            }
        });

        let pwd = new TextInput({
            placeholder: '请输入密码',
            container: d.query('.pwd', this.wrapper),
            type: 'password'
        });

        let selectSys = new SelectInput({
            container:d.query('.select-sys', this.wrapper),
            dropClassName:'appId'
        });

        DVAjax.getAppId((res)=>{
            selectSys.setPara({data:res});
            tools.isNotEmptyArray(res) && selectSys.set('app_sanfu_retail');
        });

        let rememberPwd = new CheckBox({
            text: '记住密码',
            container: d.query('.remember-pwd', this.wrapper)
        });

        this.formItems = {
            account: account,
            pwd: pwd,
            rememberPwd: rememberPwd,
            selectSys:selectSys
        };

        let localAccount = localStorage.getItem('account'),
            localPwd = localStorage.getItem(localAccount);
        if (tools.isNotEmpty(localAccount) && tools.isNotEmpty(localPwd)){
            account.set(localAccount);
            pwd.set(localPwd);
            selectSys.set(localStorage.getItem('app_id'));
            rememberPwd.set(true);
        }

        let loginBtn = new Button({
            content: '登录',
            container: d.query('.login-btn', this.wrapper),
            onClick: () => {
                let formItems = this.formItems,
                    account = formItems.account.get().replace(/\s+/g, ""),
                    pwd = formItems.pwd.get().replace(/\s+/g, ""),
                    isSave = formItems.rememberPwd.get(),
                    app_id = formItems.selectSys.get(),
                    self = this;
                if (tools.isEmpty(account)) {
                    Modal.toast('请填写账号');
                    return;
                }
                if (tools.isEmpty(pwd)) {
                    Modal.toast('请填写密码');
                    return;
                }
                // 登录
                DVAjax.encyptionPassword(pwd, (res) => {
                    if (res.errorCode === 0) {
                        let encyptionPwd = res.data;
                        DVAjax.login({
                            type: 'POST',
                            data: [{"userid": account, "password": encyptionPwd,"oappid":app_id}]
                        }, function (logRes) {
                            if (logRes.errorCode === 0) {
                                Modal.toast(logRes.msg);
                                if (isSave) {
                                    self.savePwd(account, pwd);
                                }
                                // 存app_id
                                localStorage.setItem('app_id',selectSys.get());
                                // 存userId
                                localStorage.setItem('userId', logRes.data.userId);
                                SPA.open(SPA.hashCreate('develop', 'home'));
                            }
                        })
                    }
                });

            }
        })
    }

    private savePwd(account: string, pwd: string) {
        localStorage.setItem('account', account);
        localStorage.setItem(account, pwd);
    }
}