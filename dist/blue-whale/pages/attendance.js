define(["require", "exports", "BasicPage", "Modal", "BwRule", "NewFinger"], function (require, exports, basicPage_1, Modal_1, BwRule_1, NewFinger_1) {
    "use strict";
    var d = G.d;
    var CONF = BW.CONF;
    return /** @class */ (function (_super) {
        __extends(AttendancePage, _super);
        function AttendancePage(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            // protected shell: any = null;
            _this.timer = null;
            _this.fingerNode = null;
            /*
            * 初始化页面
            * */
            _this.msgTimer = null;
            // this.shell = ShellAction.get();
            var parent = para.dom.parentNode;
            var height = parent.offsetHeight - parent.firstChild.offsetHeight;
            para.dom.style.height = height + 'px';
            _this.initPage();
            return _this;
        }
        AttendancePage.prototype.initPage = function () {
            var self = this, para = self.para, text = '指纹机正在初始化，请稍后';
            var detail = h("div", { class: "attend-detail" });
            //创建左侧框
            var content = h("div", { class: "attend-content" },
                h("h4", { class: "datetime" }));
            //指纹考勤块
            self.fingerNode = h("div", { class: "finger-content" },
                h("p", { class: "finger-title" }, "\u8003\u52E4\u4FE1\u606F"),
                h("p", { class: "finger-msg" }, text));
            //创建右侧考勤展示框
            var listMsg = h("div", { class: "attend-msg" },
                h("ul", { class: "list-msg" }));
            content.appendChild(self.fingerNode);
            detail.appendChild(content);
            para.dom.appendChild(detail);
            para.dom.appendChild(listMsg);
            //显示时间'
            var dateEl = detail.querySelector('.datetime');
            dateEl.innerHTML = getDate();
            self.timer = setInterval(function () {
                dateEl.innerHTML = getDate();
            }, 1000);
            var i = 0, dots = '';
            var fingerMsg = this.fingerNode.querySelector('.finger-msg');
            self.msgTimer = setInterval(function () {
                if (i >= 10) {
                    Modal_1.Modal.alert('初始化指纹机失败，请重新刷新!');
                    fingerMsg.innerHTML = '初始化指纹机失败！';
                    clearInterval(self.msgTimer);
                    return;
                }
                dots += '.';
                fingerMsg.innerHTML = text + dots;
                if (i++ % 3 === 0) {
                    dots = '';
                }
            }, 1000);
            /*
            * 获取时间
            * */
            function getDate() {
                var date = new Date();
                var two = function (num) { return num < 10 ? '0' + num : '' + num; };
                return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' +
                    two(date.getHours()) + ':' + two(date.getMinutes()) + ':' + two(date.getSeconds());
            }
            //调用指纹考勤
            self.attendFinger();
        };
        /*
        * 指纹考勤
        * */
        AttendancePage.prototype.attendFinger = function () {
            var self = this;
            var fingerMsg = this.fingerNode.querySelector('.finger-msg');
            var fingerTitle = this.fingerNode.querySelector('.finger-title');
            var fingerObj = new NewFinger_1.NewFinger({
                callFinger: function (text) {
                    if (self.msgTimer !== null) {
                        clearInterval(self.msgTimer);
                        self.msgTimer = null;
                    }
                    fingerMsg.innerHTML = '<span>' + text + '</span>';
                },
                fingerFinish: function (e) {
                    fingerMsg.innerHTML = '<span>指纹获取成功，正在匹配中...</span>';
                    return ajaxValid({
                        userid: e.userid,
                        fingerprint: e.print,
                        fingertype: e.type,
                        verify: e.verify
                    });
                }
            });
            //根据获取的指纹信息通过Ajax验证
            function ajaxValid(data) {
                // Rule.ajax(CONF.ajaxUrl.atdFingerAtd, {
                //     type: 'POST',
                //     data: '[' + JSON.stringify(data) + ']',
                //     success: (response) => {
                //         let result = response.body.bodyList[0];
                //         self.addList(result);
                //         fingerTitle.innerHTML = '<span class="green">' + result.userName + result.result + '</span>';
                //         fingerObj.addFinger(result.fingerData);
                //         fingerObj.againOpen();
                //     },
                //     error: () => {
                //         Modal.toast('考勤失败请重试');
                //         fingerTitle.innerHTML = '<span class="red">考勤失败，请重新录入</span>';
                //         fingerObj.againOpen()
                //     },
                //     netError: () => {
                //         Modal.toast('网络错误');
                //         fingerObj.againOpen()
                //     }
                // });
                return new Promise(function (resolve, reject) {
                    BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.atdFingerAtd, {
                        type: 'POST',
                        data: [data]
                    }).then(function (_a) {
                        var response = _a.response;
                        var result = response.body.bodyList[0];
                        self.addList(result);
                        fingerTitle.innerHTML = '<span class="green">' + result.userName + result.result + '</span>';
                        // fingerObj.addFinger(result.fingerData);
                        resolve();
                    }).catch(function () {
                        Modal_1.Modal.toast('考勤失败请重试');
                        fingerTitle.innerHTML = '<span class="red">考勤失败，请重新录入</span>';
                        reject();
                    }).finally(function () {
                        // fingerObj.againOpen();
                    });
                });
            }
        };
        //右侧展示考勤成功信息
        AttendancePage.prototype.addList = function (result) {
            var list = this.dom.querySelector('.list-msg');
            var li = d.create("<li>\n                        <span class=\"arrow\">" + result.datetime + "</span>\n                        <span>" + (result.userName + result.result) + "</span></li>");
            list.insertBefore(li, list.firstChild);
            var timer = setTimeout(function () {
                li.className = 'animated';
                clearTimeout(timer);
            }, 1);
        };
        //销毁
        AttendancePage.prototype.destroy = function () {
            clearInterval(this.timer);
            // this.shell.erp().cancelFinger();
        };
        return AttendancePage;
    }(basicPage_1.default));
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
