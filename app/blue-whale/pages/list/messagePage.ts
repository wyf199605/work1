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
function setBadge() {
    let badge = document.querySelector('[data-field=badge]');
    let num = localMsg.getUnreadCount();
    if (num > 0) {
        badge.classList.remove('hide');
        badge.textContent = num + '';
    }
    else {
        badge.classList.add('hide');
    }
}

export = class messagePage {
    constructor(private para) {

        let listDOM = document.querySelector('ul.mui-table-view');

        showList(localMsg.get(), false);

        d.on(listDOM, 'click', '[data-action]', function () {
            switch (this.dataset.action) {
                case 'read':
                    let tapThis = this;
                    read(tapThis);
                    sys.window.open({url:para.mgrPath+tapThis.dataset.url});
                    break;
            }
        });

        window.addEventListener('newMsg', function (e:CustomEvent) {
            showList(JSON.parse(e.detail), true);
        });

        function read(msgDOM) {
            let unreadDot = msgDOM.querySelector('.mui-badge.unread');
            if(unreadDot !== null){
                d.remove(unreadDot);
                localMsg.read(parseInt(msgDOM.dataset.notifyId));
                setBadge();
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
                    '<div class="mui-slider-handle inner-padding-row">' +
                    '<div data-action="read" data-url="'+list[i].content.link+'" class="mui-slider-handle" data-notify-id="' + list[i].notifyId + '"><a href="#msgDetail">';
                html += li;

                html += `<h5>
                        ${list[i].isread === 0 ? `<span class="mui-badge badge-dot mui-badge-primary unread"></span>` : ``}
                        <span data-field="sender">${list[i].sender }</span>
                        <span class="mui-h5 pull-right">
                            <span data-field="createDate">${list[i].createDate}</span>
                            <span class="mui-icon mui-icon-arrowright"></span>
                        </span>
                    </h5>`;
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
                        type : 'none',
                        onClick : () => {
                            Modal.confirm({
                                msg : '确定要删除？',
                                callback : flag => {
                                    if(flag){
                                        localMsg.remove(list[i].notifyId);
                                        d.remove(dom as any);
                                        setBadge();
                                    }
                                }
                            });

                        }
                    },
                });

            }
            setBadge();
        }
        sys.window.close = double_back;
    }
}