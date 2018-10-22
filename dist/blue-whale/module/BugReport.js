define("BugReport", ["require", "exports", "TextInput1", "Modal", "Button", "UploadModule", "BwRule"], function (require, exports, TextInput_1, Modal_1, Button_1, uploadModule_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    var CONF = BW.CONF;
    var sys = BW.sys;
    var BugReportModal = /** @class */ (function (_super) {
        __extends(BugReportModal, _super);
        function BugReportModal(id, isRefresh, pageInfo) {
            var _this = this;
            var bugReport = new BugReport({
                success: function () {
                    _this.destroy();
                    isRefresh && sys.window.load(location.href);
                },
                bugId: id,
                pageInfo: pageInfo
            });
            _this = _super.call(this, {
                header: {
                    title: '故障申报'
                },
                body: bugReport.wrapper,
                isShow: true,
                width: '730px',
                className: 'bug-report',
                position: 'full'
            }) || this;
            return _this;
        }
        return BugReportModal;
    }(Modal_1.Modal));
    exports.BugReportModal = BugReportModal;
    var BugReport = /** @class */ (function (_super) {
        __extends(BugReport, _super);
        function BugReport(para) {
            var _this = _super.call(this) || this;
            _this.closeImgEvent = (function () {
                var removeImg = function (e) {
                    setTimeout(function () {
                        var img = d.closest(e.target, '.upload-img'), i = parseInt(img.dataset.index), type = img.dataset.type;
                        d.remove(img);
                        if (type === 'img') {
                            _this.setDataIndex();
                            i >= 0 && _this.bugReportItem.picture.splice(i, 1);
                        }
                        else {
                            if (type === 'video') {
                                _this.bugReportItem.video.shift();
                            }
                        }
                    }, 10);
                };
                return {
                    on: function () { return d.on(_this.wrapper, 'click', '.close-ball', removeImg); },
                    off: function () { return d.off(_this.wrapper, 'click', '.close-ball', removeImg); }
                };
            })();
            // 播放视频
            _this.playVideoEvent = (function () {
                var playVideo = function (e) {
                };
                return {
                    on: function () { return d.on(_this.wrapper, 'click', '.app-shipin', playVideo); },
                    off: function () { return d.off(_this.wrapper, 'click', '.app-shipin', playVideo); }
                };
            })();
            _this.success = para.success;
            _this.isUpload = true;
            var bugId = tools.isEmpty(para.bugId) ? -1 : para.bugId;
            _this.pageInfo = para.pageInfo;
            bugId >= 0 && BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.bugDetail + '?bugid=' + bugId)
                .then(function (_a) {
                var response = _a.response;
                response.errorCode === 0 && (_this.bugData = response.data);
            });
            _this.closeImgEvent.on();
            _this.playVideoEvent.on();
            return _this;
        }
        Object.defineProperty(BugReport.prototype, "isUpload", {
            get: function () {
                return this._isUpload;
            },
            set: function (up) {
                this._isUpload = up;
            },
            enumerable: true,
            configurable: true
        });
        BugReport.prototype.wrapperInit = function () {
            var _this = this;
            var form = h("form", { className: "bug-report-form" },
                h("div", { className: "form-group" },
                    h("div", { className: "form-text", "data-name": "title" }),
                    h("div", { className: "form-textarea", "data-name": "detail" }),
                    h("div", { className: "form-img", "data-name": "uploader" },
                        h("div", { className: "uploader-wrapper" })),
                    h("div", { className: "msg" }, "\u6E29\u99A8\u63D0\u793A: \u6700\u591A\u53EF\u4E0A\u4F205\u5F20\u56FE\u7247\u548C1\u4E2A\u77ED\u89C6\u9891")),
                h("div", { className: "submit", "data-name": "submit" }));
            this.formEle = {
                title: null,
                detail: null,
                upload: null,
                submit: null
            };
            d.queryAll('[data-name]', form).forEach(function (el) {
                var name = el.dataset.name;
                switch (name) {
                    case 'title':
                        var titleModule = new TextInput_1.TextInput1({
                            placeholder: '添加标题',
                            type: 'text',
                            labelWidth: 0,
                            container: el,
                        });
                        el.appendChild(h("span", { className: "title-num" }, "30"));
                        _this.formEle['title'] = titleModule;
                        var previousValue_1 = '';
                        d.on(titleModule.wrapper, 'input', 'input', function (e) {
                            var input = e.target, strLen = tools.str.utf8Len(input.value);
                            if (strLen > 60) {
                                input.value = previousValue_1;
                                Modal_1.Modal.toast('最多可输入30个字');
                            }
                            else {
                                previousValue_1 = input.value;
                                var len = Math.floor((60 - strLen) / 2);
                                d.query('.title-num', el).innerHTML = len < 0 ? '0' : len.toString();
                            }
                        });
                        break;
                    case 'detail':
                        _this.formEle['detail'] = new TextInput_1.TextAreaInput({
                            className: 'report-textarea',
                            container: el,
                            placeholder: '请描述具体故障问题'
                        });
                        break;
                    case 'uploader':
                        var addImg_1 = h("div", { className: "addImage" },
                            h("div", { className: "upload" })), elWrap = d.query('.uploader-wrapper', el);
                        var type_1 = '', videoName_1 = '';
                        _this.formEle['upload'] = addImg_1;
                        elWrap.appendChild(addImg_1);
                        var uploader_1 = new uploadModule_1.default({
                            uploadUrl: CONF.ajaxUrl.fileUpload,
                            nameField: 'FILE_ID',
                            // 上传成功
                            onComplete: function (res, file) {
                                var fileId = res.data.blobField.value;
                                if (type_1 === 'img') {
                                    var name_1 = file.name;
                                    var pics = _this.bugReportItem.picture;
                                    for (var i = 0, len = pics.length; i < len; i++) {
                                        var pic = pics[i];
                                        if (tools.isEmpty(pic.fileId) && pic.fileName === name_1) {
                                            pic.fileId = fileId;
                                            break;
                                        }
                                    }
                                }
                                else {
                                    _this.bugReportItem.video[0]['fileId'] = fileId;
                                }
                            },
                            onError: function (file) {
                                if (type_1 === 'img') {
                                    var name_2 = file.name;
                                    var pics = _this.bugReportItem.picture;
                                    for (var i = 0, len = pics.length; i < len; i++) {
                                        var pic = pics[i];
                                        if (pic.fileName === name_2 && tools.isEmpty(pic.fileId)) {
                                            var imgWrapper = d.query(".upload-img[data-index=\"" + i + "\"]", _this.wrapper);
                                            _this.addErrorMark(imgWrapper);
                                            pics.splice(i, 1);
                                            break;
                                        }
                                    }
                                }
                                else {
                                    _this.bugReportItem.video = [];
                                    var img = d.query('.upload-img[data-type=video]', _this.wrapper);
                                    _this.addErrorMark(img, false);
                                    videoName_1 = '';
                                }
                            },
                            container: d.query('.upload', addImg_1),
                            text: '+'
                        });
                        // 上传失败
                        // uploader.com.on('uploadError', (file) => {
                        //
                        // });
                        // 所有文件上传完成时调用
                        uploader_1.com.on('uploadFinished', function () {
                            _this.isUpload = true;
                        });
                        // 文件加入上传队列
                        uploader_1.com.on('fileQueued', function (file) {
                            if (file.type.split('/')[0] === 'image') {
                                if (_this.bugReportItem.picture.length <= 4) {
                                    var pics = _this.bugReportItem.picture;
                                    var name_3 = file.name;
                                    for (var i = 0, len = pics.length; i < len; i++) {
                                        var pic = pics[i];
                                        if (pic.fileName === name_3) {
                                            Modal_1.Modal.alert('已经添加过该图片');
                                            return false;
                                        }
                                    }
                                    _this.isUpload = false;
                                    var obj = {
                                        fileId: '',
                                        fileName: name_3
                                    };
                                    _this.bugReportItem.picture.push(obj);
                                    var url = window.URL.createObjectURL(file.source.source);
                                    d.before(addImg_1, _this.addImg(url, 'img'));
                                    d.query('.form-img', _this.wrapper).scrollLeft = d.query('.form-img', _this.wrapper).scrollLeft + 100;
                                    type_1 = 'img';
                                    uploader_1.com.upload();
                                }
                                else {
                                    Modal_1.Modal.alert('最多可添加5张图片和1个视频');
                                    return false;
                                }
                            }
                            else if (file.type.split('/')[0] === 'video') {
                                if (tools.isNotEmpty(videoName_1)) {
                                    if (file.name === videoName_1) {
                                        Modal_1.Modal.alert('已经添加过该视频了');
                                        return false;
                                    }
                                    Modal_1.Modal.alert('最多可添加一个视频');
                                    return false;
                                }
                                _this.isUpload = false;
                                var obj = {
                                    fileId: '',
                                    fileName: file.name
                                };
                                _this.bugReportItem.video.push(obj);
                                videoName_1 = file.name;
                                var url = window.URL.createObjectURL(file.source.source);
                                d.before(addImg_1, _this.addImg(url, 'video'));
                                type_1 = 'video';
                                uploader_1.com.upload();
                            }
                        });
                        break;
                    case 'speak':
                        new Button_1.Button({
                            content: '按住说话',
                            icon: 'app-maikefeng',
                            iconPre: 'appcommon',
                            container: el,
                            onClick: function () {
                            },
                            className: 'speak-btn'
                        });
                        new Button_1.Button({
                            content: '录制视频',
                            icon: 'app-shipin',
                            iconPre: 'appcommon',
                            container: el,
                            onClick: function () {
                            }
                        });
                        break;
                    case 'submit':
                        _this.formEle['submit'] = new Button_1.Button({
                            content: '提交',
                            container: el,
                            className: 'submit-btn',
                            onClick: function () {
                                var info = _this.bugReportItem.info, formEle = _this.formEle;
                                info.title = formEle['title'].value;
                                info.message = formEle['detail'].value;
                                var pageInfo = _this.pageInfo;
                                if (tools.isNotEmpty(pageInfo)) {
                                    info.url = pageInfo.url;
                                    info.param = pageInfo.param;
                                    info.reqType = pageInfo.reqType;
                                    info.errMsg = pageInfo.errMsg;
                                }
                                if (tools.isNotEmpty(info.title)) {
                                    if (_this.isUpload) {
                                        if (tools.isNotEmpty(_this.bugData)) {
                                            var para = tools.obj.merge(_this.bugReportItem);
                                            para.info['bugId'] = _this.bugData.info.bugId;
                                            BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.bugReport, {
                                                type: 'POST',
                                                data: para
                                            }).then(function (_a) {
                                                var response = _a.response;
                                                response.errorCode === 0 && Modal_1.Modal.toast('修改成功');
                                                _this.success();
                                            });
                                        }
                                        else {
                                            BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.bugReport, {
                                                type: 'POST',
                                                data: _this.bugReportItem
                                            }).then(function (_a) {
                                                var response = _a.response;
                                                response.errorCode === 0 && Modal_1.Modal.toast('提交故障成功');
                                                _this.success();
                                            });
                                        }
                                    }
                                    else {
                                        Modal_1.Modal.alert('图片或视频正在上传，请稍候...');
                                    }
                                }
                                else {
                                    Modal_1.Modal.alert('标题不能为空!');
                                }
                            }
                        });
                        break;
                    default:
                        break;
                }
            });
            return form;
        };
        BugReport.prototype.setDataIndex = function () {
            var imgs = d.queryAll('.upload-img[data-type="img"]', this.wrapper);
            imgs = imgs.filter(function (img) {
                return img.dataset.index !== '-1';
            });
            if (tools.isNotEmpty(imgs)) {
                imgs.forEach(function (img, index) {
                    img.dataset.index = index.toString();
                });
            }
        };
        Object.defineProperty(BugReport.prototype, "bugData", {
            get: function () {
                return this._bugData;
            },
            set: function (bugData) {
                var _this = this;
                this._bugData = bugData;
                // 设置数据
                var bugItem = this.bugReportItem;
                bugItem.info.title = bugData.info.title;
                bugItem.info.message = bugData.info.message;
                bugItem.picture = bugData.picture;
                bugItem.video = bugData.video;
                bugItem.voice = bugData.voice;
                // 设置界面
                this.formEle['title'].value = bugData.info.title;
                this.formEle['detail'].value = bugData.info.message;
                var strLen = tools.str.utf8Len(bugData.info.title);
                var len = Math.floor((60 - strLen) / 2);
                d.query('.title-num', this.wrapper).innerHTML = len < 0 ? '0' : len.toString();
                var imgs = bugData.picture, addImg = this.formEle['upload'];
                tools.isNotEmpty(imgs) && imgs.forEach(function (img) {
                    var url = _this.getFileUrl(img.fileId);
                    d.before(addImg, _this.addImg(url, 'img'));
                });
                var videos = bugData.video;
                tools.isNotEmpty(videos) && videos.forEach(function (vi) {
                    var url = _this.getFileUrl(vi.fileId);
                    d.before(addImg, _this.addImg(url, 'video'));
                });
            },
            enumerable: true,
            configurable: true
        });
        BugReport.prototype.addImg = function (url, type) {
            var imgs = d.queryAll('.upload-img', this.wrapper);
            imgs.length > 0 && (imgs = imgs.filter(function (img) {
                return img.dataset.index !== '-1';
            }));
            var len = imgs.length;
            var imgWrapper = null;
            if (type === 'img') {
                imgWrapper = h("div", { className: "upload-img", "data-index": len, "data-type": "img" },
                    h("img", { src: url, alt: "\u6545\u969C\u622A\u56FE" }),
                    h("div", { className: "close-ball" }, "\u00D7"));
            }
            else {
                imgWrapper = h("div", { className: "upload-img", "data-index": "0", "data-type": "video" },
                    h("video", { src: url }),
                    h("i", { className: "appcommon app-shipin" }),
                    h("div", { className: "close-ball" }, "\u00D7"));
            }
            return imgWrapper;
        };
        BugReport.prototype.addErrorMark = function (imgWrapper, isImg) {
            if (isImg === void 0) { isImg = true; }
            if (isImg) {
                imgWrapper.dataset.index = '-1';
            }
            else {
                imgWrapper.dataset.type = 'video-error';
            }
            imgWrapper.appendChild(h("div", { className: "bug-error" },
                h("i", { className: "appcommon app-shibai" }),
                h("br", null),
                "\u4F20\u8F93\u5931\u8D25"));
            isImg && this.setDataIndex();
        };
        Object.defineProperty(BugReport.prototype, "bugReportItem", {
            get: function () {
                if (!this._bugReportItem) {
                    var deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
                    this._bugReportItem = {
                        info: {
                            title: '',
                            uuid: deviceInfo.uuid,
                            message: '',
                            url: '',
                            param: '',
                            reqType: '',
                            errMsg: ''
                        },
                        picture: [],
                        voice: [],
                        video: []
                    };
                }
                return this._bugReportItem;
            },
            enumerable: true,
            configurable: true
        });
        BugReport.prototype.getFileUrl = function (fileId) {
            return tools.url.addObj(CONF.ajaxUrl.fileDownload, {
                md5_field: 'FILE_ID',
                file_id: fileId,
                down: 'allow'
            });
        };
        BugReport.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.playVideoEvent.off();
            this.closeImgEvent.off();
        };
        return BugReport;
    }(Component));
    exports.BugReport = BugReport;
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
