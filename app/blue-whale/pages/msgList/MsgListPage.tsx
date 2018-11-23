import BasicPage from "../basicPage";
import d = G.d;
import tools = G.tools;
import {Tab} from "../../../global/components/ui/tab/tab";
import localMsg = G.localMsg;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import sys = BW.sys;
import CONF = BW.CONF;
import {Pagination} from "../../../global/components/navigation/pagination/pagination";

interface IDataMapPara {
    content: {
        caption: string
        content: string,
        link: string,
    },
    createDate: string,
    isread: number
    notifyId: number,
    notifyType: number
    objectName: string,
    sender: string,
}

export class MsgListPage extends BasicPage {
    constructor(para: BasicPagePara) {
        super(para);
        this.readDom = this.listCreate(1);
        this.unReadDom = this.listCreate(0);
        this.allMsgDom = this.listCreate();
        this.initTab();

    }

    private paging(arr : IDataMapPara[], html : HTMLElement, read : number){
        let pagDom = <div class="msg-paging"></div>,
            len = arr.length;

        if(len > 5){
            let pag = new Pagination({
                container : pagDom,
                pageOptions : [5],
                onChange : (state) => {
                    html.innerHTML = null;
                    return new Promise(resolve => {
                        let index = state.current * 5,
                            data = arr.slice(index, index + 5);
                        data.forEach(obj => {
                            d.append(html, this.createLi(obj, read));
                        });
                        resolve()
                    })

                }
            });
            pag.total = len;
            d.append(this.getDom(read), pagDom)
        }
    }

    private getDom(read : number){
        switch (read) {
            case 0:
                return this.unReadDom;
            case 1:
                return this.readDom;
        }
        return this.allMsgDom;
    }

    private listCreate(read?: number): HTMLElement {
        let html = <ul class="msg-list"></ul>,
            data = localMsg.get(),
            arr = [];

        this.getDom(read) && (this.getDom(read).innerHTML = null);
        data.forEach(obj => {
            if (tools.isNotEmpty(read)) {
                if (read === obj.isread) {
                    arr.push(obj);
                }
            } else {
                arr.push(obj);
            }
        });
        arr.forEach((obj : IDataMapPara, i) => {
            if(i < 5){
                d.append(html, this.createLi(obj, read));
            }
        });
        // setTimeout(() => {
        this.paging(arr, html, read);
        // });
        return html;
    }

    private createLi(obj: IDataMapPara, read?: number) {
        let del,
            notifyId = obj.notifyId,
            li = <li className={'msg-li ' + (obj.isread === 1 ? 'opacity-6' : '')}>
                <div className="msg-title">{obj.content.caption || '消息提示'}</div>
                <div className="msg-content">{obj.content.content}</div>
                <div class="msg-last">
                    <div className="msg-time">时间：{obj.createDate}</div>
                    <div className="msg-sender">发送人：{obj.sender}</div>
                    {del = <div className="msg-del">
                        <span class="iconfont icon-shanchu"></span>
                        <span>删除</span>
                    </div>}
                </div>
            </li>;

        d.on(li, 'click', function () {
            // sys.window.open({url: CONF.siteUrl + obj.content.link});
            if (read !== 1) {
                li.classList.add('opacity-6');
            }
            localMsg.read(notifyId)
        });

        d.on(del, 'click', function (e) {
            e.stopPropagation();
            Modal.confirm({
                msg: '是否确认删除？',
                callback: (confirm) => {
                    if (confirm) {
                        localMsg.remove(notifyId);
                        li.remove();
                    }
                }
            });
        });
        return li;
    };

    private initTab() {
        new Tab({
            tabParent: this.pageWrapper,
            panelParent: this.pageWrapper,
            className : 'msg-tab',
            tabs: [{
                title: '未读信息',
                dom: this.unReadDom,
            }, {
                title: '已读信息',
                dom: this.readDom,
            }, {
                title: '所有信息',
                dom: this.allMsgDom,
            }],
            onClick: (index: number) => {
                switch (index) {
                    case 0:
                        this.unReadDom = this.listCreate(0);
                        break;
                    case 1:
                        this.readDom = this.listCreate(1);
                        break;
                    case 2:
                        this.allMsgDom = this.listCreate();
                        break;
                }
            }
        });
    }

    protected wrapperInit() {
        return <div class="msgListPage modal-box container-fluid"></div>
    }

    private _readDom: HTMLElement;
    get readDom() {
        if (!this._readDom) {
            this._readDom = <div class="read-msg"></div>;
        }
        return this._readDom;
    }

    set readDom(html: HTMLElement) {
        this.removeUl(this.readDom);
        d.prepend(this.readDom, html);
    }

    private _unReadDom: HTMLElement;
    get unReadDom() {
        if (!this._unReadDom) {
            this._unReadDom = <div class="unread-msg"></div>;
        }
        return this._unReadDom;
    }

    set unReadDom(html: HTMLElement) {
        this.removeUl(this.unReadDom);
        d.prepend(this.unReadDom, html);
    }

    private _allMsgDom: HTMLElement;
    get allMsgDom() {
        if (!this._allMsgDom) {
            this._allMsgDom = <div class="all-msg"></div>;
        }
        return this._allMsgDom;
    }

    set allMsgDom(html: HTMLElement) {
        this.removeUl(this.allMsgDom);
        d.prepend(this.allMsgDom, html);
    }

    private removeUl(dom : HTMLElement){
        let ul = d.query('.msg-list', dom);
        ul && ul.remove();
    }
}