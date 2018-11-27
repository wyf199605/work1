/// <amd-module name="ContactsModule"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import tools = G.tools;
import d = G.d;
import {BwRule} from "../../common/rule/BwRule";
import sys = BW.sys;

export class ContactsModule {
    protected contactModal: Modal;
    protected sepValue = ';';
    public iframe;

    constructor(para: R_Field) {
        let isAppend = true, captionName = para.name,
            href = para.dataAddr ? BW.CONF.siteUrl + BwRule.reqAddr(para.dataAddr) : '';
        if (tools.isMb) {
            this.iframe = tools.iPage(href, {id: 'iframe_' + captionName});
        }
        localStorage.setItem('fromPickCaption', captionName);
        localStorage.setItem('fromPickData', JSON.stringify(tools.str.toEmpty({})));
        if (sys.os === 'pc') {
            if (isAppend) {
                this.initIframe(href);
                isAppend = false;
            }
            this.contactModal.isShow = true;
        } else {
            this.iframe.show();
        }

        d.once(window, 'selectContact', (e: CustomEvent) => {
            if(this.contactModal){
                this.contactModal.isShow = false;
            }
            console.log(e.detail);
            // onSelect(e.detail);
        });

    }

    protected initIframe(href: string) {
        /*初始化收件人模态框*/
        if (!href) {
            return;
        }
        let iframe: HTMLIFrameElement = <iframe className="pageIframe"
                                                src={tools.url.addObj(href, {isMb: true}, false)}/>;

        this.contactModal = new Modal({
            body: iframe,
            className: 'contact-modal',
        });

        iframe.onload = () => {
            let iframeBody = iframe.contentDocument.body,
                a: HTMLElement = iframeBody.querySelector('header a.sys-action-back');
            a && (a.style.display = 'none');
        }
    }
}