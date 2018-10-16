/// <amd-module name="LeUploadModule"/>
define("LeUploadModule", ["require", "exports", "NewUploader", "LeRule", "Utils", "Modal", "Loading"], function (require, exports, newUploader_1, LeRule_1, utils_1, Modal_1, loading_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var d = G.d;
    var Component = G.Component;
    var LeUploadModule = /** @class */ (function (_super) {
        __extends(LeUploadModule, _super);
        function LeUploadModule(para) {
            var _this = _super.call(this, Object.assign({}, para, {
                beforeSendFile: function (file) {
                    return new Promise(function (resolve) {
                        _this.getFileMd5(file).then(function (md5) {
                            var ajaxData = {
                                status: "md5Check",
                                md5: md5.toUpperCase(),
                                nameField: para.nameField
                            };
                            LeRule_1.LeRule.Ajax.fetch(_this.url, {
                                type: "POST",
                                traditional: true,
                                data: ajaxData,
                                timeout: 2000,
                                dataType: "json"
                            }).then(function (_a) {
                                var response = _a.response;
                                resolve(response);
                            }).catch(function (e) {
                                // ajax请求失败则只能认为该文件不曾上传过
                                resolve({
                                    ifExist: 0,
                                });
                            });
                        }).catch(function (e) {
                            // 获取md5值失败则只能认为该文件不曾上传过
                            resolve({
                                ifExist: 0,
                            });
                        });
                    });
                }
            })) || this;
            _this.para = para;
            return _this;
        }
        LeUploadModule.prototype.getFileMd5 = function (file) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var reader = new FileReader(), md5Mark = '';
                reader.onload = function (event) {
                    var binary = event.target.result;
                    var md5 = utils_1.Utils.md5(binary).toString();
                    md5Mark = md5;
                    _this.formData = function () {
                        return {
                            md5: md5
                        };
                    };
                    resolve(md5);
                };
                reader.onerror = function (e) {
                    reject(e);
                };
                reader.readAsBinaryString(file);
            });
        };
        LeUploadModule.prototype.upload = function () {
            var _this = this;
            var promises = [];
            this.temporaryFile.forEach(function (file) {
                promises.push(_this.getFileMd5(file));
            });
            return Promise.all(promises).then(function (md5s) {
                var loading = new loading_1.Loading({
                    msg: '上传中...',
                });
                loading.show();
                return _super.prototype.upload.call(_this).then(function (res) {
                    var promises = [];
                    res.forEach(function (data, index) {
                        var file = data.file;
                        var uniqueFileName = utils_1.Utils.md5('' + file.name + file.type + file.lastModifiedDate + file.size), chunksTotal = 0, chunkSize = 5000 * 1024;
                        promises.push(new Promise(function (resolve, reject) {
                            if ((chunksTotal = Math.ceil(file.size / chunkSize)) >= 1) {
                                var data_1 = {
                                    status: "chunksMerge",
                                    name: uniqueFileName,
                                    chunks: chunksTotal,
                                    md5: md5s[index].toUpperCase(),
                                    file_name: file.name,
                                    nameField: _this.para.nameField
                                };
                                // let newData = {};
                                // if (this.para.isExcel === false) {
                                //     newData = Object.assign(data, {nameField: this.para.nameField});
                                // } else {
                                //     newData = data;
                                // }
                                LeRule_1.LeRule.Ajax.fetch(_this.url, {
                                    type: 'POST',
                                    data: data_1,
                                    traditional: true,
                                }).then(function (_a) {
                                    var response = _a.response;
                                    resolve({
                                        data: response,
                                        file: file
                                    });
                                }).catch(function (err) {
                                    reject(err);
                                });
                            }
                        }));
                    });
                    return new Promise(function (resolve, reject) {
                        Promise.all(promises).then(function (res) {
                            resolve(res);
                        }).catch(function (e) {
                            reject(e);
                        }).finally(function () {
                            loading.hide();
                        });
                    });
                });
            });
        };
        return LeUploadModule;
    }(newUploader_1.NewUploader));
    exports.LeUploadModule = LeUploadModule;
    var ImgUploader = /** @class */ (function (_super) {
        __extends(ImgUploader, _super);
        function ImgUploader(para) {
            var _this = _super.call(this, para) || this;
            _this.closeEvent = (function () {
                var handler = null;
                return {
                    on: function () {
                        d.on(_this.imgWrapper, 'click', '.pic-close', handler = function (ev) {
                            var picEl = d.closest(ev.target, '.pic-item');
                            if (picEl) {
                                var data = picEl.dataset.data, index = _this.fileNameMd5.indexOf(data);
                                _this.fileNameMd5.splice(index, 1);
                                _this.upload.delFile(index);
                                d.remove(picEl);
                            }
                        });
                    },
                    off: function () {
                        d.off(_this.imgWrapper, 'click', '.pic-close', handler);
                    }
                };
            })();
            _this.enlEvent = (function () {
                var handler = null, imgEl = null, index = 0;
                var showImg = function (src) {
                    if (tools.isNotEmpty(src)) {
                        var arrowLeft = null, arrowRight = null, body = h("div", { className: "picture-modal-body", style: "height: 100%; width: 100%; text-align: center;" },
                            _this.isMulti ? arrowLeft = h("a", { className: "arrow arrow-left" },
                                h("i", { className: "sec seclesson-zuojiantou" })) : null,
                            _this.isMulti ? arrowRight = h("a", { className: "arrow arrow-right" },
                                h("i", { className: "sec seclesson-youjiantou" })) : null);
                        if (_this.isMulti) {
                            d.on(arrowLeft, 'click', function () {
                                changeImg(-1);
                            });
                            d.on(arrowRight, 'click', function () {
                                changeImg(1);
                            });
                        }
                        new Modal_1.Modal({
                            header: {
                                title: '查看大图',
                                isFullScreen: true,
                            },
                            width: '800px',
                            height: '600px',
                            body: body,
                            isOnceDestroy: true
                        });
                        d.append(body, imgEl = h("img", { style: "max-height: 100%; max-width: 100%;", src: src, alt: "" }));
                    }
                };
                var changeImg = function (flag) {
                    index += flag;
                    index = index < 0 ? _this.fileNameMd5.length - 1 : index;
                    index = index >= _this.fileNameMd5.length ? 0 : index;
                    imgEl.src = LeRule_1.LeRule.fileUrlGet(_this.fileNameMd5[index], _this.field);
                };
                return {
                    on: function () {
                        d.on(_this.imgWrapper, 'click', '.pic', handler = function (ev) {
                            var picEl = d.closest(ev.target, '.pic-item');
                            if (picEl) {
                                var data = picEl.dataset.data;
                                index = _this.fileNameMd5.indexOf(data);
                                showImg(LeRule_1.LeRule.fileUrlGet(data, _this.field));
                            }
                        });
                    },
                    off: function () {
                        d.off(_this.imgWrapper, 'click', '.pic', handler);
                    }
                };
            })();
            _this.fileNameMd5 = [];
            _this.field = para.field;
            _this.closeEvent.on();
            _this.enlEvent.on();
            return _this;
        }
        ImgUploader.prototype.wrapperInit = function (para) {
            var _this = this;
            var accept = { extensions: 'jpg,png' };
            this.isMulti = para.isMulti || false;
            return h("div", { className: "img-uploader-wrapper" },
                h("div", { className: "btn-wrapper" },
                    this.upload = h(LeUploadModule, { nameField: para.nameField, isAutoUpload: true, text: '选择图片', url: LE.CONF.ajaxUrl.fileUpload, accept: accept, fileSingleSizeLimit: para.size, successHandler: function (data) {
                            _this.changePictures(data);
                        }, isChangeText: false, isMulti: this.isMulti }),
                    tools.isEmpty(para.remark) ? null : h("span", { className: "uploader-tip" }, para.remark)),
                this.imgWrapper = h("div", { className: "pictures-wrapper" }));
        };
        ImgUploader.prototype.changePictures = function (data) {
            var _this = this;
            var md5s = [];
            data && data.forEach(function (item) {
                var res = item.data;
                md5s.push(res.data[_this.field]);
            });
            md5s.length > 0 && (this.value = md5s.join(','));
        };
        ImgUploader.prototype.set = function (value) {
            this.value = value;
        };
        ImgUploader.prototype.get = function () {
            return this.value;
        };
        Object.defineProperty(ImgUploader.prototype, "value", {
            get: function () {
                return this.fileNameMd5.join(',');
            },
            set: function (md5s) {
                var _this = this;
                if (typeof md5s === 'string') {
                    var res = [];
                    if (!this.isMulti) {
                        this.fileNameMd5 = [];
                        this.imgWrapper.innerHTML = '';
                        res = [md5s].filter(function (md5) { return tools.isNotEmpty(md5); });
                    }
                    else {
                        res = md5s.split(',').filter(function (md5) { return tools.isNotEmpty(md5); });
                    }
                    res.forEach(function (md5) {
                        // let img = this.innerEl.img as HTMLMediaElement,
                        //     placehold = this.innerEl.placehold;
                        // img.classList.remove('hide');
                        // placehold.classList.add('hide');
                        // img.setAttribute('src', LeRule.fileUrlGet(md5, this.field));
                        d.append(_this.imgWrapper, ImgUploader.initPicItem(LeRule_1.LeRule.fileUrlGet(md5, _this.field), md5, _this.isMulti && !_this.disabled));
                    });
                    this.fileNameMd5 = this.fileNameMd5.concat(res);
                }
            },
            enumerable: true,
            configurable: true
        });
        ImgUploader.initPicItem = function (url, data, isClose) {
            if (isClose === void 0) { isClose = false; }
            return h("div", { className: "pic-item", "data-data": data },
                h("div", { className: "pic" },
                    h("img", { src: url, alt: "\u56FE\u7247" })),
                isClose ? h("a", { className: "pic-close" },
                    h("i", { className: "sec seclesson-guanbi" })) : null);
        };
        ImgUploader.prototype.destroy = function () {
            this.closeEvent.off();
            this.enlEvent.off();
            _super.prototype.destroy.call(this);
        };
        return ImgUploader;
    }(Component));
    exports.ImgUploader = ImgUploader;
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

/// <reference path="index.ts"/>
/// <reference path="common/Config.ts"/>
/// <reference path="common/rule/LeRule.tsx"/>
