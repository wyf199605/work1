/// <amd-module name="bugDetailPage"/>
define("bugDetailPage", ["require", "exports", "BwRule", "Modal"], function (require, exports, BwRule_1, Modal_1) {
    "use strict";
    var d = G.d;
    var tools = G.tools;
    var CONF = BW.CONF;
    return /** @class */ (function () {
        function BugDetailPage() {
            var _this = this;
            this.statusTap = (function () {
                var statusTap = function (e) {
                    var target = d.closest(e.target, '.status');
                    target && Modal_1.Modal.alert('请到我的标签页中点击进入详情页修改！');
                };
                return {
                    on: function () { return d.on(_this.bugDetailWrapper, 'tap', statusTap); },
                    off: function () { return d.off(_this.bugDetailWrapper, 'tap', statusTap); }
                };
            })();
            this.tapEvent = (function () {
                var closeTap = function (e) {
                    var allStatus = d.queryAll('.status', _this.bugDetailWrapper), currentStatus = allStatus[_this.currentStatus], closeStatus = allStatus[2], reopenStatus = allStatus[3];
                    var url = tools.url.addObj(CONF.ajaxUrl.bugstatus, {
                        bugid: _this.bugId,
                        bugstatus: 2
                    });
                    BwRule_1.BwRule.Ajax.fetch(url).then(function (_a) {
                        var response = _a.response;
                        Modal_1.Modal.toast('状态修改成功');
                        currentStatus.classList.remove('active');
                        closeStatus.classList.add('active');
                        closeStatus.classList.add('disabled');
                        reopenStatus.classList.remove('disabled');
                        reopenStatus.classList.remove('active');
                    });
                };
                var redoTap = function (e) {
                    var allStatus = d.queryAll('.status', _this.bugDetailWrapper), redoStatus = allStatus[3], closeStatus = allStatus[2];
                    var url = tools.url.addObj(CONF.ajaxUrl.bugstatus, {
                        bugid: _this.bugId,
                        bugstatus: 3
                    });
                    BwRule_1.BwRule.Ajax.fetch(url).then(function (_a) {
                        var response = _a.response;
                        Modal_1.Modal.toast('状态修改成功');
                        closeStatus.classList.remove('active');
                        closeStatus.classList.remove('disabled');
                        redoStatus.classList.add('active');
                        redoStatus.classList.add('disabled');
                    });
                };
                return {
                    on: function () {
                        d.on(_this.bugDetailWrapper, 'tap', '.close', closeTap);
                        d.on(_this.bugDetailWrapper, 'tap', '.redo', redoTap);
                    },
                    off: function () {
                        d.off(_this.bugDetailWrapper, 'tap', '.close', closeTap);
                        d.off(_this.bugDetailWrapper, 'tap', '.redo', redoTap);
                    }
                };
            })();
            this.bugId = tools.url.getPara('bugid');
            this.isSelf = tools.url.getPara('isself') === 'true' ? true : false;
            this.bugDetailWrapper = h("div", { className: "bug-detail-container" });
            d.query('.mui-content').appendChild(this.bugDetailWrapper);
            tools.isNotEmpty(this.bugId) && BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.bugDetail + '?bugid=' + this.bugId)
                .then(function (_a) {
                var response = _a.response;
                response.errorCode === 0 && _this.initDom(response.data);
            });
            this.isSelf && this.tapEvent.on();
            !this.isSelf && this.statusTap.on();
        }
        BugDetailPage.prototype.initDom = function (bugDetail) {
            var _this = this;
            var message = bugDetail.info.message;
            message = tools.isNotEmpty(message) ? message : '用户未描述';
            // info
            var infoWrapper = h("div", null,
                h("h1", { className: "title" }, bugDetail.info.title),
                h("p", { className: "time" },
                    "\u7533\u544A\u65F6\u95F4: ",
                    this.handlerTime(bugDetail.info.createTime)),
                h("p", { className: "message" }, message));
            this.bugDetailWrapper.appendChild(infoWrapper);
            // picture
            var picture = bugDetail.picture;
            if (tools.isNotEmpty(picture)) {
                picture.forEach(function (pic) {
                    _this.bugDetailWrapper.appendChild(h("img", { src: _this.getFileUrl(pic.fileId) }));
                });
            }
            // video
            var video = bugDetail.video;
            if (tools.isNotEmpty(video)) {
                this.bugDetailWrapper.appendChild(h("div", { className: "video" },
                    h("video", { src: this.getFileUrl(video[0].fileId) }),
                    h("i", { className: "video-btn appcommon app-shipin" })));
            }
            // voice
            var voice = bugDetail.voice;
            if (tools.isNotEmpty(voice)) {
            }
            var stautsTitleArr = ['未处理', '处理中', '已解决', '重新申报'], // 0,1,2,3
            statusWrapper = h("div", { className: "status-wrapper" }), statusClassArr = ['status disabled', 'status disabled', 'status close', 'status disabled redo'];
            if (this.isSelf) {
                if (parseInt(bugDetail.info.bugStatus) === 0) {
                    // 未处理
                    statusClassArr = ['status disabled', 'status disabled', 'status close', 'status disabled redo'];
                }
                else if (parseInt(bugDetail.info.bugStatus) === 1) {
                    // 处理中
                    statusClassArr = ['status disabled', 'status disabled', 'status close', 'status disbled redo'];
                }
                else if (parseInt(bugDetail.info.bugStatus) === 2) {
                    statusClassArr = ['status disabled', 'status disabled', 'status disabled close', 'status redo'];
                }
                else if (parseInt(bugDetail.info.bugStatus) === 3) {
                    statusClassArr = ['status disabled', 'status disabled', 'status close', 'status disabled redo'];
                }
            }
            else {
                statusClassArr = ['status disabled', 'status disabled', 'status disabled close', 'status disabled redo'];
            }
            var currentStatus = parseInt(bugDetail.info.bugStatus);
            this.currentStatus = currentStatus;
            stautsTitleArr.forEach(function (title, index) {
                var status = null;
                if (index === currentStatus) {
                    status = h("div", { className: 'active ' + statusClassArr[index] }, title);
                }
                else {
                    status = h("div", { className: statusClassArr[index] }, title);
                }
                statusWrapper.appendChild(status);
            });
            this.bugDetailWrapper.appendChild(statusWrapper);
        };
        BugDetailPage.prototype.getFileUrl = function (fileId) {
            return tools.url.addObj(CONF.ajaxUrl.fileDownload, {
                md5_field: 'FILE_ID',
                file_id: fileId,
                down: 'allow'
            });
        };
        BugDetailPage.prototype.handlerTime = function (time) {
            var date = new Date(time * 1000), year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate(), hour = date.getHours(), minutes = date.getMinutes(), seconds = date.getSeconds(), monthStr = month < 10 ? '0' + month : month, dayStr = day < 10 ? '0' + day : day, hourStr = hour < 10 ? '0' + hour : hour, minutesStr = minutes < 10 ? '0' + minutes : minutes, secondsStr = seconds < 10 ? '0' + seconds : seconds;
            return year + '-' + monthStr + '-' + dayStr + ' ' + hourStr + ':' + minutesStr + ':' + secondsStr;
        };
        BugDetailPage.prototype.destory = function () {
            this.isSelf && this.tapEvent.off();
            !this.isSelf && this.statusTap.off();
            d.remove(this.bugDetailWrapper);
        };
        return BugDetailPage;
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
