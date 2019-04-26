/// <amd-module name="UnBinding"/>

import { Modal } from "../../../global/components/feedback/modal/Modal";
import { BwRule } from "../../common/rule/BwRule";
import sys = BW.sys;
import tools = G.tools;
import CONF = BW.CONF;
import d = G.d;
interface UnBindingPara {
    MODEL: string
    VENDOR: string
    REGISTER_TIME: string
    UUID: string
}
export class UnBinding {
    private modal: Modal;
    private config: obj;
    private ul: HTMLElement;
    private length: Number;
    constructor(data: UnBindingPara[], config: obj) {
        let full;
        if (sys.os !== 'pc') {
            full = 'full';
        }
        let ul = <ul className="device-view" />;
        this.ul = ul;
        this.config = config;
        this.modal = new Modal({
            header: '设备管理',
            body: ul,
            position: full,
            isOnceDestroy: true
        });
        this.modal.isShow = true;
        this.renderList(data)
        //遍历li

        let self = this;
        //unbind
        d.on(ul, 'click', '.unbind', function () {
            let data = JSON.stringify([{ uuid: this.dataset.name }]);
            BwRule.Ajax.fetch(CONF.ajaxUrl.unbound, {
                type: 'post',
                data: data,
            }).then(() => {
                self.getData();
                Modal.toast('解绑成功');
                if (self.length <= 1) {
                    setTimeout(() => {
                        sys.window.load(CONF.url.reg);
                    }, 1000);
                }
               
            });
        });
    }

    show() {
        this.modal.isShow = true;
    }
    renderList(data) {
        this.length = data.length;
        this.ul.innerHTML = '';
        let deviceInfo = JSON.parse(localStorage.getItem("deviceInfo"))
        if (data.length > 0) {
            let list = data.filter(item => {
                return item.UUID == deviceInfo.uuid
            })
            if (list.length > 0) {
                let first = <div class="dev_title"><p>当前设备</p></div>
                this.ul.appendChild(first)
                first.appendChild(this.deviceTpl(list[0]));
            }
        }
        if (data.length > 0) {
            let list = data.filter(item => {
                return item.UUID != deviceInfo.uuid
            })
            if (list.length > 0) {
                let second = <div class="dev_title"><p>其他设备</p></div>
                this.ul.appendChild(second)
                list.forEach(d => {
                    this.ul.appendChild(this.deviceTpl(d));
                });
            }
        }
    }
    getData() {
        // let data = [{
        //     MODEL: "搜索",
        //     VENDOR: "xxx",
        //     REGISTER_TIME: "xxx",
        //     UUID: "xxxy"
        // }];
        // this.renderList(data)
        // return false;
        BwRule.Ajax.fetch(CONF.ajaxUrl.unBinding, {
            data: {
                mobile: this.config.mobile,
                check_code: this.config.mobile,
                userid: this.config.userid,
                uuid: this.config.uuid
            },
            type: 'get'
        }).then(({ response }) => {
            this.renderList(response.data)
        })
    }

    private deviceTpl(data: UnBindingPara): HTMLUListElement {
        return <li className="device-cell">
            <div className="icon-box">

                <span className={`iconfont ${tools.isMb ? 'icon-device-mb' : 'icon-device-pc'}`} />
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