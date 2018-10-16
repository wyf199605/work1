/// <amd-module name="ChangePasswordPage">
import BasicPage from "../basicPage";
import d = G.d;
import tools = G.tools;
import {Button} from "../../../global/components/general/button/Button";
import {TextInput} from "../../../global/components/form/text/text";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {BwRule} from "../../common/rule/BwRule";
import CONF = BW.CONF;

export class ChangePasswordPage extends BasicPage {

    constructor(private para) {
        super(para);
        if(!this.isMb){
            this.initPcPage();
        }
        ChangePasswordPage.changePassword(this.para.dom);
    }

    protected initPcPage(){
        let el = this.para.dom,
            detail = d.create('<div class="change-password-detail"></div>'),
            //用户密码修改
            content = d.create(`<div class="content">
                    <form action="#">
                    <div class="form-group">
                        <div data-type="old-password">
                            <label class="control-label">旧密码</label>
                        </div>
                        <div data-type="new-password">
                            <label class="control-label">新密码</label>
                        </div>
                        <div data-type="again-password">
                            <label class="control-label">确认密码</label>
                        </div>
                        <div data-type="submit"></div>
                    </div>
                    </form>
                </div>`);

        d.append(detail, content);
        d.append(el, detail);

        new TextInput({
            container: el.querySelector('div[data-type="old-password"]'),
            type: 'password',
            placeholder: '请输入当前密码',
            icons: ['iconfont icon-suo4']
        });
        new TextInput({
            container: el.querySelector('div[data-type="new-password"]'),
            type: 'password',
            placeholder: '请输入新密码',
            icons: ['iconfont icon-suo4']
        });
        new TextInput({
            container: el.querySelector('div[data-type="again-password"]'),
            type: 'password',
            placeholder: '请再次输入密码',
            icons: ['iconfont icon-suo4']
        });
        new Button({
            container: el.querySelector('[data-type=submit]'),
            content: '确定',
            type: 'primary'
        });

        (<HTMLButtonElement>content.querySelector('[data-type=submit]>button')).type = 'submit';
    }

    /*
     * 密码修改
     * */
    public static changePassword(el){
        let form = el.querySelector('form'),
            old_input = (<HTMLInputElement>d.query('[data-type=old-password] input', form)),
            new_input = (<HTMLInputElement>d.query('[data-type=new-password] input', form)),
            again_input = (<HTMLInputElement>d.query('[data-type=again-password] input', form));
        d.on(form, 'submit', function (ev) {
            ev.preventDefault();
            let old_password = old_input.value,
                new_password = new_input.value,
                again_password = again_input.value;
            if (!tools.str.toEmpty(old_password) || !tools.str.toEmpty(new_password) || !tools.str.toEmpty(again_password)) {
                Modal.alert('密码不能为空');
            }else if(new_password !== again_password){
                Modal.alert('密码不一致');
            }else {
                let url = CONF.ajaxUrl.changePassword;

                BwRule.Ajax.fetch(url,{
                    type: 'POST',
                    data: {
                        old_password,
                        new_password
                    }
                }).then(({response}) => {
                    let result = response.msg;
                    Modal.toast(result);
                    if(result.indexOf('成功') > -1){
                        old_input.value = '';
                        new_input.value = '';
                        again_input.value = '';
                    }
                });
            }
        });

    }

}