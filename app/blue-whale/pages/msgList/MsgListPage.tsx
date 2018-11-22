import BasicPage from "../basicPage";
import d = G.d;
import tools = G.tools;
import {Tab} from "../../../global/components/ui/tab/tab";
import localMsg = G.localMsg;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import sys = BW.sys;
import CONF = BW.CONF;

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

    private listCreate(read?: number): HTMLElement {
        let html = <ul class="msg-list"></ul>,
            data = localMsg.get();
        data.forEach(obj => {
            if (tools.isNotEmpty(read)) {
                if (read === obj.isread) {
                    d.append(html, this.createLi(obj, read));
                }
            } else {
                d.append(html, this.createLi(obj, read));
            }
        });

        return html;
    }

    private createLi(obj: IDataMapPara, read?: number) {
        let del,
            notifyId = obj.notifyId,
            li = <li className={'msg-li ' + (obj.isread === 1 ? 'opacity-6' : '')}>
                <div className="msg-title">{obj.content.caption || '我是标题'}</div>
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
            sys.window.open({url: CONF.siteUrl + obj.content.link});
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
        return this._readDom;
    }

    set readDom(html: HTMLElement) {
        if (!this._readDom) {
            this._readDom = <div class="read-msg"></div>;
        }
        this._readDom.innerHTML = null;
        d.append(this._readDom, html);
    }

    private _unReadDom: HTMLElement;
    get unReadDom() {
        return this._unReadDom;
    }

    set unReadDom(html: HTMLElement) {
        if (!this._unReadDom) {
            this._unReadDom = <div class="unread-msg"></div>;
        }
        this._unReadDom.innerHTML = null;
        d.append(this._unReadDom, html);
    }

    private _allMsgDom: HTMLElement;
    get allMsgDom() {
        return this._allMsgDom;
    }

    set allMsgDom(html: HTMLElement) {
        if (!this._allMsgDom) {
            this._allMsgDom = <div class="all-msg"></div>;
        }
        this._allMsgDom.innerHTML = null;
        d.append(this._allMsgDom, html);
    }

}