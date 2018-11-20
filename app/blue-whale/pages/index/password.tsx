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
                        Modal.alert('您有未填写的项目');
                        return
                    }
                }
                if(input1.get() === input2.get()){
                    Modal.alert('新密码和旧密码不能相同');
                    return
                }else{
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
                        },input1).finally(() => {
                            confirm.isDisabled = false;
                            spinner && spinner.hide();
                            spinner = null;
                            input1.value='';
                            input2.value='';
                            input3.value='';
                        })
                    }else{
                        Modal.alert('新密码和确认密码不一致');
                    }
                }

            }
        });
        d.append(para.dom, body);
    }
    sendPassword(data:object,input:TextInput){
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
            Modal.alert(response.msg);
        });
    }
}