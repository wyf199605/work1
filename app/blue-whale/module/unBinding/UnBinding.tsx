/// <amd-module name="UnBinding"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import {BwRule} from "../../common/rule/BwRule";
import sys = BW.sys;
import tools = G.tools;
import CONF = BW.CONF;
import d = G.d;
interface UnBindingPara {
    MODEL : string
    VENDOR : string
    REGISTER_TIME : string
    UUID : string
}
export class UnBinding {
    private modal:Modal;
    constructor(data : UnBindingPara[]){
        let full;
        if(sys.os !== 'pc') {
            full = 'full';
        }
        let ul = <ul className="device-view"/>;
        this.modal = new Modal({
            header : '设备管理',
            body : ul,
            position : full,
            isOnceDestroy : true
        });
        this.modal.isShow = true;

        //遍历li
        data.forEach(d => {
            ul.appendChild(this.deviceTpl(d));
        });
        let self = this;
            //unbind
        d.on(ul, 'click', '.unbind', function () {
                let data = JSON.stringify([{uuid : this.dataset.name}]);
                // Rule.ajax(CONF.ajaxUrl.unbound,{
                //     type: 'post',
                //     data: data,
                //     success : function (r) {
                //         self.modal.isShow = false;
                //         Modal.toast('解绑成功');
                //     }
                // });
                BwRule.Ajax.fetch(CONF.ajaxUrl.unbound, {
                    type: 'post',
                    data: data,
                }).then(() => {
                    self.modal.isShow = false;
                    Modal.toast('解绑成功');
                });
            });
    }

    show(){
        this.modal.isShow = true;
    }

    private deviceTpl(data : UnBindingPara) : HTMLUListElement {
        return <li className="device-cell">
            <div className="icon-box">

                <span className={`iconfont ${tools.isMb ? 'icon-device-mb' : 'icon-device-pc'}`}/>
            </div>
            <div className="device-name">
                <div className="device-modal">型号：{data.MODEL}</div>
                <div className="device-vendor">品牌：{data.VENDOR}</div>
                <div className="device-time">注册时间：{data.REGISTER_TIME}</div>
            </div>
            <div className="btn-group">
                <button className="unbind" data-name={data.UUID}>解绑</button>
            </div>
        </li>
    }
}