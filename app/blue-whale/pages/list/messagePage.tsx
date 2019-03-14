import localMsg = G.localMsg;
import sys = BW.sys;
import d = G.d;
import {SwipeOut} from "../../../global/components/other/SwipeOut/SwipeOut";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Tab} from "../../../global/components/ui/tab/tab";
import {BwRule} from "../../common/rule/BwRule";
import CONF = BW.CONF;
import {Button} from "../../../global/components/general/button/Button";
interface TaskMsgPara{
    hintId : string,
    caption : string,
    textMsg : string,
    wordWrap : number,
    createDate : string,
    openlink : R_ReqAddr,
    btnAddr : R_ReqAddr,
}
export = class messagePage {
    private p : obj;
    private tab : Tab;
    constructor(private para) {
        this.p = para;
        let container = d.query('.mui-scroll'),
            listDOM = <ul className="mui-table-view full-height has-header"/>,
            taskDom = <ul className="task"/>;
        this.tab = new Tab({
            panelParent : container,
            tabParent : container,
            tabs : [{
                title : '任务消息',
                dom : taskDom,
                name : 'task'
            },{
                title : '系统消息',
                dom : listDOM,
                name : 'sys',
            }],
            onClick : (index) => {
                index === 1 ? this.showSysList(localMsg.get(), false, listDOM) : null
            }
        });

        this.initSysMsg(listDOM);
        this.initTaskMsg(taskDom);
    }

    initTaskMsg(taskDom : HTMLElement){
        BwRule.Ajax.fetch(CONF.url.taskMsg,{
            dataType : 'json',
            type : 'get'
        }).then(({response}) => {
            console.log(response);
            d.append(taskDom, this.showTaskList(response.data));
        });

    }

    private noReminder(url : string){
        BwRule.Ajax.fetch(CONF.siteUrl + url, {
            type: 'POST',
        }).then(({response}) => {
            Modal.toast(response.msg);
            this._noReminder && (this._noReminder.className = 'disabled');
        });
    }

    private _noReminder: Button;
    private showTaskList(list: TaskMsgPara[]){
        let fragment = document.createDocumentFragment();
        list.forEach(m => {
            let link = m.openlink && m.openlink.dataAddr,
                btnAddr = m.btnAddr && m.btnAddr.dataAddr;
            let li = <li className="task-msg">
                {/*<div class="task-msg-time">推送时间({m.createDate})</div>*/}
                <div class="task-msg-body">
                    <div class="task-msg-title">{m.caption}</div>
                    <div class="task-msg-content">{m.textMsg}</div>
                    <div className="task-msg-footer">
                        {link ? <Button onClick={() => sys.window.open({url: CONF.siteUrl + link})}  className="task-msg-link" content="打开"/> : ``}
                        {btnAddr ? this._noReminder = <Button onClick={() => this.noReminder(btnAddr)} className="task-msg-deal" content="今日不提醒" /> : ``}
                    </div>
                </div>
            </li>;
            d.append(fragment, li);
        });

        return fragment;
    }

    initSysMsg(listDOM : HTMLElement){
        let lis = d.queryAll('li[data-name]', this.tab.getTab());
        lis.forEach( li => {
            d.append(li, <span className="mui-badge mui-badge-primary hide" data-field={li.dataset.name}/>);
        });
        window.addEventListener('newMsg',  (e:CustomEvent) => {
            this.showSysList(JSON.parse(e.detail), true, listDOM);
        });

        this.setSysBadge();

        sys.window.close = double_back;
    }

    private read(msgDOM) {
        let unreadDot = d.query('.mui-badge.unread', msgDOM);
        if(unreadDot !== null){
            d.remove(unreadDot);
            localMsg.read(parseInt(msgDOM.dataset.notifyId));
            this.setSysBadge();
        }
    }

    private showSysList(list : obj[], isAppend : boolean, listDOM : HTMLElement) {
        let self = this;
        d.on(listDOM, 'click', '[data-action]', function () {
            switch (this.dataset.action) {
                case 'read':
                    let tapThis = this;
                    self.read(tapThis);
                    BwRule.Ajax.fetch(CONF.ajaxUrl.userMsg,{
                        data : {
                            reqType : 'notifyread',
                            userId : this.dataset.sender,
                            notifyIds : this.dataset.notifyId
                        },
                        type : 'post'
                    }).then(({response}) => {
                        console.log(response);
                        sys.window.open({url : CONF.siteUrl + tapThis.dataset.url});
                    });
                    break;
            }
        });
        let len = list.length;
        if(!isAppend){
            listDOM.innerHTML = '';
            if(len === 0){
                listDOM.appendChild(<li class="nodata"><span class="iconfont icon-gongyongwushuju"/></li>);
            }
        }
        for(let i = 0; i < len; i++){
            let data = list[i];
            let html = <li class="mui-table-view-cell">
                <div class="mui-slider-handle inner-padding-row">
                    <div data-sender={data.sender} data-action="read" data-url={data.content.link} class="mui-slider-handle" data-notify-id={data.notifyId}>
                        <a href="#">
                            <h5>
                                {data.isread === 0 ? <span class="mui-badge badge-dot mui-badge-primary unread"/> : ``}
                                <span data-field="sender">{data.sender}</span>
                                <span className="mui-h5 pull-right">
                                    <span data-field="createDate">{data.createDate}</span>
                                    <span className="mui-icon mui-icon-arrowright"/>
                                </span>
                            </h5>
                            <p className="mui-h6 ellipsis-row2" data-field="content">{data.content.content}</p>
                        </a>
                    </div>
                </div>
            </li>;


            isAppend ? listDOM.insertBefore(html, listDOM.firstChild) : listDOM.appendChild(html);

            new SwipeOut({
                target: html as any,
                right: {
                    content : '删除',
                    className : 'mui-btn mui-btn-red',
                    type : 'none',
                    onClick : () => {
                        Modal.confirm({
                            msg : '确定要删除？',
                            callback : flag => {
                                if(flag){
                                    localMsg.remove(data.notifyId);
                                    d.remove(html as any);
                                    this.setSysBadge();
                                }
                            }
                        });

                    }
                },
            });

        }
        this.setSysBadge();
    }

     /**
     * 设置角标，数字为0时，则不显示角标
     */
    private setSysBadge() {
        let badge = d.query(`[data-field=sys]`),
            num = localMsg.getUnreadCount();
        if (num > 0) {
            badge.classList.remove('hide');
            badge.textContent = num + '';
        } else {
            badge.classList.add('hide');
        }
    }

}