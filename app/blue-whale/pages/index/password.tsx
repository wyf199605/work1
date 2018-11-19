/// <amd-module name="PersonPassword"/>

import BasicPage from "../basicPage";
import d = G.d;
import {BwRule} from "../../common/rule/BwRule";
import CONF = BW.CONF;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Button} from "../../../global/components/general/button/Button";
import {TextInput} from "../../../global/components/form/text/text";
import {Spinner} from "../../../global/components/ui/spinner/spinner";

export class PersonPassword extends BasicPage{
    constructor(para){
        super(para);
        let input1: TextInput, input2: TextInput, input3 :TextInput;
        let body=<div className="pw-content">
            <div className="form-group old-group">
                <label >旧密码：</label>
                {input1 = <TextInput placeholder="请输入旧密码" type="password"/>}
            </div>
            <div className="form-group new-group">
                <label>新密码：</label>
                {input2 = <TextInput placeholder="请输入新密码" type="password"/>}
            </div>
            <div className="form-group confirm-group">
                <label>确认密码：</label>
                {input3 = <TextInput placeholder="确认密码" type="password"/>}
            </div>
            <div className="btn-group"><div className="btn-confirm change-btn"/></div>
        </div>;
        let confirmBtn = d.query('.btn-confirm', body);
        let confirm = new Button({
            container: confirmBtn,
            content:'确定',
            className:'btn-confirm',
            onClick:() => {
                for(let input of[input1, input2, input3]){
                    if(!input.get()){
                        return
                    }
                }
                if(input2.get() === input3.get()){
                    confirm.isDisabled = true;
                    let spinner = new Spinner({
                        el: confirm.wrapper,
                        type: Spinner.SHOW_TYPE.cover
                    });
                    spinner.show();
                    this.sendPassword({
                        "new_password": input2.get(),
                        "old_password": input1.get()
                    }).finally(() => {
                        confirm.isDisabled = false;
                        spinner && spinner.hide();
                        spinner = null;
                    })
                }
            }
        });
        d.append(para.dom, body);
        this.bindBlur('.old-group',body,[input1, input2, input3]);
        this.bindBlur('.new-group',body,[input1, input2, input3]);
        this.bindBlur('.confirm-group',body,[input1, input2, input3])
    }
    bindBlur(para:string,el:HTMLElement,inputs:TextInput[]){
        let temp = para + ' '+'input';
        d.on(d.query(temp,el),'blur',()=>{
            let tip = d.query('.password-tip',el);
            if(tip){
                d.remove(tip);
            }
            for(let input of inputs){
                if(!input.get()){
                    d.append(d.query('.confirm-group',el),<div className="password-tip">提示：密码为空</div>);
                    return
                }
            }
            if(inputs[1].get() !== inputs[2].get()){
                d.append(d.query('.confirm-group',el),<div className="password-tip">提示：两次输入密码不一致</div>);
            }
        })
    }
    sendPassword(data:object){
        let userInfo: any = window.localStorage.getItem('userInfo');
        try {
            userInfo = JSON.parse(userInfo);
        }catch (e) {
            userInfo = {};
        }

       return BwRule.Ajax.fetch(CONF.ajaxUrl.personPassword, {
            type: 'POST',
            data: {
                'upuser_id': userInfo['userid'],
                'new_password': data['new_password'],
                'old_password': data['old_password']
            }
        }).then((response) => {
            Modal.toast(response.msg);
        });
    }
}