/// <amd-module name="ContactsModule"/>

import { Modal } from "../../../global/components/feedback/modal/Modal";
import tools = G.tools;
import d = G.d;
import { BwRule } from "../../common/rule/BwRule";
import sys = BW.sys;

interface IContactsModule {
    field: R_Field;
    onGetData: (data: obj[]) => void;
    onDestroy?: () => void;
}

export class ContactsModule {
    protected contactModal: Modal;
    public iframe;
    private para: IContactsModule = null;

    constructor(para: IContactsModule) {
        this.para = para;
        let captionName = para.field.name,
            href = para.field.dataAddr ? BW.CONF.siteUrl + BwRule.reqAddr(para.field.dataAddr) : '';
        if (tools.isMb) {
            this.iframe = tools.iPage(href, { id: 'iframe_' + captionName });
        }
        localStorage.setItem('fromPickCaption', captionName);
        localStorage.setItem('fromPickData', JSON.stringify(tools.str.toEmpty({})));
        if (sys.os === 'pc') {
            this.initIframe(href);
            this.contactModal && (this.contactModal.isShow = true);
        } else {
            this.iframe.show();
        }

        d.once(window, 'selectContact', (e: CustomEvent) => {
            if (this.contactModal) {
                this.contactModal && (this.contactModal.isShow = false);
            }
            tools.isFunction(para.onGetData) && para.onGetData(e.detail.data);
            // onSelect(e.detail);
        });

    }

    protected initIframe(href: string) {
        /*初始化收件人模态框*/
        if (!href) {
            return;
        }
        let iframe: HTMLIFrameElement = <iframe className="pageIframe"
            src={tools.url.addObj(href, { isMb: true }, false)} />;
        this.contactModal = new Modal({
            body: iframe,
            className: 'contact-modal',
            isOnceDestroy: true,
            zIndex: 2000,
            onClose: () => {
                this.para && this.para.onDestroy();
                this.destroy();
            }
        });
        iframe.onload = () => {
            let iframeBody = iframe.contentDocument.body,
                a: HTMLElement = iframeBody.querySelector('header a.sys-action-back');
            a && (a.style.display = 'none');
        }
    }

    destroy() {
        this.iframe = null;
        this.contactModal.destroy();
    }
}