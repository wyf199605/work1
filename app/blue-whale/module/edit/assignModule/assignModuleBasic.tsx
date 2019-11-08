/// <amd-module name="AssignModuleBasic"/>
import tools = G.tools;
import d = G.d;
import sys = BW.sys;
import { FormCom } from "../../../../global/components/form/basic";
import { Modal } from "global/components/feedback/modal/Modal";
export class AssignModuleBasic extends FormCom {
    onSet: (val) => void;
    get(): any { return undefined; }
    set(...any): void { }
    get value() { return undefined; }
    set value(any) { }

    protected contactModal: Modal;
    protected sepValue = ';';
    public iframe;

    public initPicker(pickDom: HTMLElement, input: HTMLInputElement, href: string, data: obj, onSelect: Function) {

        if (pickDom) {
            let captionName = pickDom.parentElement.dataset.name;
            if (sys.isMb) {
                // this.destroy();
                this.iframe = tools.iPage(href);
            }
            let init = () => {
                localStorage.setItem('fromPickCaption', captionName);
                localStorage.setItem('fromPickData', JSON.stringify(tools.str.toEmpty(data)));
                if (sys.os === 'pc') {
                    this.initIframe(href);
                    this.contactModal.isShow = true;
                } else {
                    this.iframe.show();
                }

                d.once(window, 'selectContact', (e: CustomEvent) => {
                    if (this.contactModal) {
                        this.contactModal.isShow = false;
                    }
                    onSelect(e.detail);
                });
            };
            input && d.on(input, 'keydown', (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    init();
                }
            });
            d.on(pickDom, 'click', () => {
                // contactModal.show();
                init();
            });
        }
    }

    protected initIframe(href: string) {
        /*初始化收件人模态框*/
        if (this.contactModal) {
            return;
        }
        if (!href) {
            return;
        }
        // debugger;
        let iframe: HTMLIFrameElement = <iframe className="pageIframe" src={tools.url.addObj(href, { isMb: true }, false)}></iframe>;

        this.contactModal = new Modal({
            body: iframe,
            // isOnceDestroy : true,
            className: 'contact-modal'
        });

        let modalScreen = d.query('.modal-screen')//<div className="modal-screen lock-screen"></div>;
        d.on(modalScreen, 'click', () => {
            this.contactModal.isShow = false
        });

        // iframe.onload = () => {
        //     let contactIframe = this.contactModal.body as HTMLIFrameElement,
        //         iframeBody = contactIframe.contentDocument.body,
        //         ulDom = iframeBody.querySelector('#list ul.mui-table-view'),
        //         list = iframeBody.querySelector('#list'),
        //         div = document.createElement('div'),
        //         htmlDom = <style>{"header a.sys-action-back{display: none} .ulOverFlow{ height:448px; overflow-y : auto} #list{height: 100vh}"}</style>;
        //
        //     contactIframe.contentDocument.head.appendChild(htmlDom);
        //     list.querySelector('.mui-scroll').remove();
        //     let scrollbar = list.querySelector('.mui-scrollbar');
        //     scrollbar && scrollbar.remove();
        //     div.classList.add('ulOverFlow');
        //     div.appendChild(ulDom);
        //     list.appendChild(div);
        // };
        iframe.onload = () => {
            let iframeBody = iframe.contentDocument.body,
                a: HTMLElement = iframeBody.querySelector('header a.sys-action-back');

            a && (a.style.display = 'none');
        }
    }

    public assignDataGet(data, resData) {
        let assignValueArr = {},
            assignData: obj = {};

        if (typeof resData !== 'object' || !resData) {
            return assignData;
        }

        let keyArr = Object.keys(resData);

        keyArr.forEach(key => {
            let data = resData[key];
            assignValueArr[key] = typeof data === 'string' ? data.split(this.sepValue) : [data];
        });

        (typeof data === 'string' ? data.split(this.sepValue) : [data]).forEach((v, i) => {
            if (tools.isEmpty(v)) {
                return;
            }
            // let assignD : obj = {};
            keyArr.forEach((key) => {
                if (!assignData[key]) {
                    assignData[key] = [];
                }
                assignData[key].push(assignValueArr[key][i])
            });
        });

        return assignData;
    }

    protected wrapperInit(): HTMLElement {
        return undefined;
    }

    destroy() {
        if (this.iframe) {
            d.remove(this.iframe.get());
        }
        this.contactModal && this.contactModal.destroy();
        this.contactModal = null;
        super.destroy();
    }
}
