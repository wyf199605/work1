define(["require", "exports"], function (require, exports) {
    "use strict";
    var localMsg = G.localMsg;
    var sys = BW.sys;
    var d = G.d;
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
    return /** @class */ (function () {
        function messagePage(para) {
            this.para = para;
            // mui.init();
            // mui('.mui-scroll-wrapper').scroll();
            var listDOM = document.querySelector('ul.mui-table-view');
            var unreadNum = document.querySelector('[data-field=badge]');
            console.log(localMsg.get());
            //debugger
            showList(localMsg.get(), false);
            /*  mui('ul.mui-table-view').on('tap', '.mui-table-view-cell .inner-padding-row .mui-slider-handle', function () {
                  let tapThis = this;
                  read(tapThis);
                  sys.window.open({url:para.mgrPath+tapThis.dataset.url});
      //             Array.prototype.forEach.call(tapThis.querySelectorAll('[data-field]'), function (el) {
      //                 data[el.dataset.field] = el.textContent;
      //             });
                  //   data.badge = parseInt(unreadNum.textContent);
                  //   mui.fire(msgDetailView, 'msgRead', JSON.stringify(data));
                  //   plus.webview.show(msgDetailView, 'slide-in-right');
              });*/
            d.on(listDOM, 'click', '[data-action]', function () {
                switch (this.dataset.action) {
                    case 'read':
                        var tapThis = this;
                        read(tapThis);
                        sys.window.open({ url: para.mgrPath + tapThis.dataset.url });
                        break;
                    case 'del':
                        var target = this, li = target.parentElement;
                        d.remove(li);
                        var notify = d.query('[data-notify-id]', li), notifyId = void 0;
                        notify && (notifyId = notify.dataset.notifyId);
                        localMsg.remove(parseInt(notifyId));
                        break;
                }
            });
            window.addEventListener('newMsg', function (e) {
                showList(JSON.parse(e.detail), true);
            });
            function read(msgDOM) {
                var unreadDot = msgDOM.querySelector('.mui-badge.unread');
                if (unreadDot !== null) {
                    msgDOM.querySelector('a[href]').removeChild(unreadDot);
                    localMsg.read(msgDOM.dataset.notifyId);
                    setBadge(unreadNum, parseInt(unreadNum.textContent) - 1);
                }
            }
            function showList(list, isAppend) {
                var len = list.length, html;
                var unreadCount = 0;
                if (!isAppend) {
                    listDOM.innerHTML = '';
                    if (len === 0) {
                        listDOM.appendChild(d.create('<li class="nodata"><span class="iconfont icon-gongyongwushuju"></span></li>'));
                    }
                }
                for (var i = 0; i < len; i++) {
                    html = '';
                    html += '<li class="mui-table-view-cell">' +
                        '<div class="mui-slider-right mui-disabled" data-action="del"><a class="mui-btn mui-btn-red">删除</a></div>' +
                        '<div class="mui-slider-handle inner-padding-row">' +
                        '<div data-action="read" data-url="' + list[i].content.link + '" class="mui-slider-handle" data-notify-id="' + list[i].notifyId + '"><a href="#msgDetail">';
                    if (list[i].isread === 0) {
                        html += '<span class="mui-badge badge-dot mui-badge-primary unread"></span>';
                        unreadCount++;
                    }
                    //          <span class="mui-icon mui-icon-contact avatar"></span>
                    html += '<h5><span data-field="sender">' + list[i].sender + '</span> <span class="mui-h5 pull-right">' +
                        '<span data-field="createDate">' + list[i].createDate + '</span><span class="mui-icon mui-icon-arrowright"></span></span></h5>';
                    html += '<p class="mui-h6 ellipsis-row2" data-field="content">' + list[i].content.content + '</p>';
                    html += '</a></div></div></li>';
                    if (isAppend) {
                        listDOM.insertBefore(d.create(html), listDOM.firstChild);
                    }
                    else {
                        listDOM.appendChild(d.create(html));
                    }
                }
                if (isAppend) {
                    var badgeNum = parseInt(unreadNum.textContent);
                    setBadge(unreadNum, badgeNum + unreadCount);
                }
                else {
                    setBadge(unreadNum, unreadCount);
                }
            }
            sys.window.close = double_back;
        }
        return messagePage;
    }());
});

/**
 * 本文件用于gulp打包时引用，防止找不到变量G
 */
/// <reference path="polyfill.ts"/>
/// <reference path="rule.ts"/>
/// <reference path="storage.ts"/>
/// <reference path="tools.ts"/>
/// <reference path="dom.ts"/>
/// <reference path="ajax.ts"/>
/// <reference path="components/Component.ts"/>
/// <reference path="requireConfig.ts"/>
/// <reference path="spa.ts"/>
/// <reference path="shell.ts"/>

/// <reference path="Config.ts"/>
/// <reference path="common/sys/sys.ad.ts"/>
/// <reference path="common/sys/sys.h5.ts"/>
/// <reference path="common/sys/sys.ip.ts"/>
/// <reference path="common/sys/sys.pc.ts"/>
/// <reference path="common/sys/sysHistory.pc.ts"/>
/// <reference path="common/sys/sysPage.pc.ts"/>
/// <reference path="common/sys/sysTab.pc.ts"/>
/// <reference path="common/sys/sys.ts"/>
