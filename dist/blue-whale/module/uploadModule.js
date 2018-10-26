define("UploadModule", ["require", "exports", "Uploader", "FormCom", "Modal"], function (require, exports, uploader_1, basic_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var UploadModule = /** @class */ (function (_super) {
        __extends(UploadModule, _super);
        function UploadModule(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            _this.uploadState = 0;
            var fileName = '', self = _this;
            _this.com = new uploader_1.Uploader({
                container: para.container,
                uploadUrl: para.uploadUrl,
                accept: para.accept,
                nameField: para.nameField,
                thumbField: para.thumbField,
                onComplete: function (data, file) {
                    if (data.code == 200 || data.errorCode === 0) {
                        _this.com.text = _this.para.showNameOnComplete !== false ? fileName : '点击上传';
                        self.uploadState = 10; // 上传完成
                        _this.para.onComplete && _this.para.onComplete.call(_this, data, file);
                    }
                    else {
                        _this.para.onError && _this.para.onError.call(_this, file);
                        Modal_1.Modal.alert(data.message);
                    }
                }
            });
            // 有文件被选中时
            _this.com.on('fileQueued', function (file) {
                _this.para.onChange && _this.para.onChange();
                //有文件在上传
                // if (self.uploadState === 1) {
                //     return;
                // }
                //开始上传
                _this.com.text = '上传中...';
                fileName = file.name;
                // bodyMui.progressbar({progress: 0}).show();
                self.uploadState = 1; //上传中
                _this.com.upload();
            });
            _this.com.on("error", function (type) {
                var msg = {
                    'Q_TYPE_DENIED': '文件类型有误',
                    'F_EXCEED_SIZE': '文件大小不能超过4M',
                };
                Modal_1.Modal.alert(msg[type] ? msg[type] : '文件出错, 类型:' + type);
            });
            // let bodyProgressBar = bodyMui.progressbar();
            _this.com.on('uploadProgress', function (file, percentage) {
                // bodyProgressBar.setProgress(percentage * 100);
            });
            return _this;
        }
        UploadModule.prototype.get = function () {
            return this.value;
        };
        UploadModule.prototype.set = function (filename) {
            this.com.text = filename;
            this.com.set(filename);
        };
        UploadModule.prototype.destroy = function () {
            this.com && this.com.destroy();
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(UploadModule.prototype, "value", {
            get: function () {
                return this.com.get();
            },
            set: function (filename) {
                this.com.text = filename;
                this.com.set(filename);
            },
            enumerable: true,
            configurable: true
        });
        UploadModule.prototype.wrapperInit = function (para) {
            return undefined;
        };
        return UploadModule;
    }(basic_1.FormCom));
    exports.default = UploadModule;
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
