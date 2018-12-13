import localMsg = G.localMsg;
import sys = BW.sys;
import tools = G.tools;
import d = G.d;
import {SwipeOut} from "../../../global/components/other/SwipeOut/SwipeOut";
import {Modal} from "../../../global/components/feedback/modal/Modal";
/**
 * 设置角标，数字为0时，则不显示角标
 * @param {Element} badge
 * @param {int} num
 */
function setBadge(badge, num) {
    if (num > 0) {
        badge.classList.remove('hide');
        badge.textContent = num;
    }
    else {
        badge.classList.add('hide');
    }
}

export = class messagePage {
    constructor(private para) {

        let listDOM = document.querySelector('ul.mui-table-view');
        let unreadNum = document.querySelector('[data-field=badge]');

        showList(localMsg.get(), false);

        d.on(listDOM, 'click', '[data-action]', function () {
            switch (this.dataset.action) {
                case 'read':
                    let tapThis = this;
                    read(tapThis);
                    sys.window.open({url:para.mgrPath+tapThis.dataset.url});
                    break;
                case 'del':
                    let target = <HTMLElement>this,
                        li = target.parentElement;
                    d.remove(li);
                    let notify = d.query('[data-notify-id]',li),notifyId;
                    notify && (notifyId = notify.dataset.notifyId);
                    localMsg.remove(parseInt(notifyId));
                    break;
            }
        });

        window.addEventListener('newMsg', function (e:CustomEvent) {
            showList(JSON.parse(e.detail), true);
        });

        function read(msgDOM) {
            let unreadDot = msgDOM.querySelector('.mui-badge.unread');
            if(unreadDot !== null){
                msgDOM.querySelector('a[href]').removeChild(unreadDot);
                localMsg.read(msgDOM.dataset.notifyId);
                setBadge(unreadNum, parseInt(unreadNum.textContent) - 1);
            }
        }

        function showList(list, isAppend) {
            let len = list.length, html;
            let unreadCount = 0;
            if(!isAppend){
                listDOM.innerHTML = '';
                if(len === 0){
                    listDOM.appendChild(d.create('<li class="nodata"><span class="iconfont icon-gongyongwushuju"></span></li>'));
                }
            }
            for(let i = 0; i < len; i++){
                html='';
                let li = '<li class="mui-table-view-cell">' +
                    // '<div class="mui-slider-right mui-disabled" data-action="del"><a class="mui-btn mui-btn-red">删除</a></div>' +
                    '<div class="mui-slider-handle inner-padding-row">' +
                    '<div data-action="read" data-url="'+list[i].content.link+'" class="mui-slider-handle" data-notify-id="' + list[i].notifyId + '"><a href="#msgDetail">';
                html += li;
                if (list[i].isread === 0){
                    html += '<span class="mui-badge badge-dot mui-badge-primary unread"></span>';
                    unreadCount ++;
                }
//          <span class="mui-icon mui-icon-contact avatar"></span>
                html += '<h5><span data-field="sender">' + list[i].sender + '</span> <span class="mui-h5 pull-right">' +
                    '<span data-field="createDate">' + list[i].createDate + '</span><span class="mui-icon mui-icon-arrowright"></span></span></h5>';
                html += '<p class="mui-h6 ellipsis-row2" data-field="content">' + list[i].content.content + '</p>';
                html += '</a></div></div></li>';
                let dom = d.create(html);
                if(isAppend) {
                    listDOM.insertBefore(dom, listDOM.firstChild);
                }else{
                    listDOM.appendChild(dom);
                }

                new SwipeOut({
                    target: dom as any,
                    right: {
                        content : '删除',
                        className : 'mui-btn mui-btn-red',
                        onClick : () => {
                            Modal.confirm({
                                msg : '确定要删除？',
                                callback : flag => {
                                    if(flag){
                                        localMsg.remove(list[i].notifyId);
                                        d.remove(dom as any);
                                    }
                                }
                            });

                        }
                    },
                });

            }
            if(isAppend){
                let badgeNum = parseInt(unreadNum.textContent);
                setBadge(unreadNum, badgeNum + unreadCount);
            }else{
                setBadge(unreadNum, unreadCount);
            }
        }
        sys.window.close = double_back;
    }
}