/// <amd-module name="PersonPassword"/>

import BasicPage from "../basicPage";
import {ChangePassword} from "../../module/changePassword/changePassword";
import {BwRule} from "../../common/rule/BwRule";
import CONF = BW.CONF;
import {Modal} from "../../../global/components/feedback/modal/Modal";

export class PersonPassword extends BasicPage{
    constructor(para){
        super(para);
        let personPassword = new ChangePassword({
            container:para.dom,
            confirm: obj => {
                return this.sendPassword(obj);
            }
        });
    }

    sendPassword(data:object){
        let userInfo: any = window.localStorage.getItem('userInfo');
        try {
            userInfo = JSON.parse(userInfo);
        }catch (e) {
            userInfo = {};
        }

        return BwRule.Ajax.fetch(CONF.siteUrl + CONF.ajaxUrl.personPassword, {
            type: 'POST',
            data: {
                'upuserid': userInfo['userid'],
                'old_password': data['old_password'],
                'new_password': data['new-password']
            }
        }).then((response) => {
            Modal.toast(response.msg);
        })
    }
}