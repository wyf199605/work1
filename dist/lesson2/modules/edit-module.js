define("LeEditQrCode", ["require", "exports", "FormCom"], function (require, exports, basic_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LeEditQrCode = /** @class */ (function (_super) {
        __extends(LeEditQrCode, _super);
        function LeEditQrCode() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        LeEditQrCode.prototype.wrapperInit = function (para) {
            return h("div", { className: "le-edit-qrcode" });
        };
        LeEditQrCode.prototype.get = function () {
            return this.value;
        };
        LeEditQrCode.prototype.set = function (any) {
            this.value = any;
        };
        Object.defineProperty(LeEditQrCode.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (val) {
                var _this = this;
                if (val) {
                    var _a = val.split('_'), value_1 = _a[0], time_1 = _a[1], timeVal_1 = parseInt(time_1);
                    require(['QrCode'], function (q) {
                        q.QrCode.toCanvas(value_1 + '_' + Math.floor(Date.now() / 1000), 200, 200, _this.wrapper);
                        if (!_this.timerId && timeVal_1) {
                            _this.timerId = setInterval(function () {
                                _this.wrapper.innerHTML = '';
                                q.QrCode.toCanvas(value_1 + '_' + Math.floor(Date.now() / 1000), 200, 200, _this.wrapper);
                            }, parseInt(time_1) * 1000);
                        }
                    });
                    this._value = val;
                }
            },
            enumerable: true,
            configurable: true
        });
        LeEditQrCode.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            clearTimeout(this.timerId);
        };
        return LeEditQrCode;
    }(basic_1.FormCom));
    exports.LeEditQrCode = LeEditQrCode;
});

///<amd-module name="LeTableEditModule"/>
define("LeTableEditModule", ["require", "exports", "LeButtonGroup", "FormFactory", "LeRule"], function (require, exports, LeButtonGroup_1, FormFactory_1, LeRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var LeTableEditModule = /** @class */ (function (_super) {
        __extends(LeTableEditModule, _super);
        function LeTableEditModule(para) {
            var _this = _super.call(this, Object.assign({}, para, {
                cond: para.ui.fields,
                isTitle: true,
            })) || this;
            _this.ui = para.ui;
            var btnWrapper = h("div", { style: _this.isWrapLine ? '' : 'display: inline-block', className: "form-com-item" },
                h("div", { className: "form-com-title", style: "opacity: 0;visibility: hidden;" }, "\u6309\u94AE\uFF1A"));
            new LeButtonGroup_1.LeButtonGroup({
                buttons: para.ui.button,
                dataGet: function () {
                    return _this.json;
                },
                container: btnWrapper,
            });
            var wrapper = _this.isWrapLine ? _this.wrapper : d.query('.form-com-wrapper', _this.wrapper);
            d.append(d.query('.form-com-wrapper', _this.wrapper), btnWrapper);
            var isAutoLoad = tools.isEmpty(para.isAutoLoad) ? true : para.isAutoLoad;
            if (isAutoLoad) {
                var link = para.ui.link || (para.ui.defaults ? para.ui.defaults.link : null);
                _this.initComData(link, para.ui.assigns);
            }
            return _this;
        }
        LeTableEditModule.prototype.selectParaInit = function (cond, para) {
            var _this = this;
            var result = {}, view = para.ui.view || false, noShowField = para.ui.noShowField ? para.ui.noShowField.split(',') : [], noEditField = para.ui.noEditField ? para.ui.noEditField.split(',') : [], fieldName = cond.fieldName;
            if (this.fields && fieldName) {
                if (noEditField && noEditField.indexOf(fieldName) > -1) {
                    result.disabled = true;
                }
                else {
                    for (var _i = 0, _a = this.fields; _i < _a.length; _i++) {
                        var item = _a[_i];
                        if (fieldName === item.name) {
                            result.disabled = !item.modifyFlag;
                            break;
                        }
                    }
                }
            }
            if (cond.showFlag === false || (noShowField && noShowField.indexOf(fieldName) > -1)) {
                result.showFlag = false;
            }
            result.onSet = tools.isNotEmpty(cond.relateFields) ? function (e) {
                var targetCom = null;
                for (var _i = 0, _a = _this.forms; _i < _a.length; _i++) {
                    var item = _a[_i];
                    if (item.custom.fieldName === cond.relateFields) {
                        targetCom = item;
                        break;
                    }
                }
                if (typeof e === 'object' && cond.relateFields in e) {
                    targetCom && targetCom.set(e[cond.relateFields]);
                }
            } : void 0;
            if (cond.type === 'pick') {
                var edit = para.ui.edit;
                if (edit && Array.isArray(edit.picks)) {
                    for (var _b = 0, _c = edit.picks; _b < _c.length; _b++) {
                        var pick = _c[_b];
                        if (pick.fieldname === fieldName) {
                            result.ui = pick;
                            break;
                        }
                    }
                }
            }
            if (view) {
                result.className = LeTableEditModule.EDIT_COM_VIEW_CLASS;
                result.disabled = true;
                result.placeholder = ' ';
            }
            return result;
        };
        LeTableEditModule.prototype.wrapperInit = function (para) {
            return h("div", { className: "edit-wrapper" });
        };
        LeTableEditModule.prototype.ajaxData = function (link, fieldName, relateName) {
            var _this = this;
            if (relateName === void 0) { relateName = fieldName; }
            return new Promise(function (resolve, reject) {
                if (tools.isEmpty(link)) {
                    reject();
                }
                else {
                    var request = {};
                    for (var _i = 0, _a = _this.forms; _i < _a.length; _i++) {
                        var com = _a[_i];
                        var fieldName_1 = com.custom.fieldName;
                        request[fieldName_1] = com.get();
                    }
                    LeRule_1.LeRule.linkReq(link, request).then(function (_a) {
                        var response = _a.response;
                        console.log(response);
                        var body = response.data, dataList = body ? body.data : [], result = [];
                        dataList.forEach(function (item) {
                            var json = {};
                            for (var key in item) {
                                json[key] = item[key];
                                if (key === fieldName) {
                                    json.text = item[key];
                                    json.value = item[key];
                                }
                            }
                            result.push(json);
                        });
                        resolve(result);
                    });
                }
            });
        };
        LeTableEditModule.prototype.loadDefaultData = function (data) {
            var link = this.ui.link || (this.ui.defaults ? this.ui.defaults.link : null);
            this.initComData(link, this.ui.assigns, data);
        };
        LeTableEditModule.prototype.initComData = function (link, assigns, data) {
            var _this = this;
            if (tools.isNotEmpty(link)) {
                var objOfForms_1 = {};
                for (var _i = 0, _a = this.forms; _i < _a.length; _i++) {
                    var com = _a[_i];
                    objOfForms_1[com.custom.fieldName] = com;
                }
                LeRule_1.LeRule.linkReq(link, data).then(function (_a) {
                    var response = _a.response;
                    var body = response.data, data = body && body.data[0];
                    if (data) {
                        for (var key in data) {
                            var com = objOfForms_1[key], value = tools.isEmpty(data[key]) ? '' : data[key] + '';
                            // if(com instanceof ReportUploadModule){
                            //     value = tools.url.addObj(LE.CONF.ajaxUrl.fileDownload, {
                            //         md5_field: 'FILE_ID',
                            //         file_id: value,
                            //         down: 'allow'
                            //     })
                            // }
                            com && com.set(value);
                            // delete objOfForms[key];
                            // objOfForms[key] && objOfForms[key].set(data[key] + '');
                        }
                        var _loop_1 = function (key) {
                            var com = objOfForms_1[key], custom = com.custom, relateFields = custom.relateFields, fieldName = custom.fieldName;
                            if (custom.link && relateFields && objOfForms_1[relateFields]) {
                                var value_1 = objOfForms_1[relateFields].get(), request = {};
                                for (var _i = 0, _a = _this.forms; _i < _a.length; _i++) {
                                    var com_1 = _a[_i];
                                    var fieldName_2 = com_1.custom.fieldName;
                                    request[fieldName_2] = com_1.get();
                                }
                                LeRule_1.LeRule.linkReq(custom.link, request).then(function (_a) {
                                    var response = _a.response;
                                    var dataList = response.data.data;
                                    if (Array.isArray(dataList)) {
                                        for (var _i = 0, dataList_1 = dataList; _i < dataList_1.length; _i++) {
                                            var data_1 = dataList_1[_i];
                                            if (data_1[relateFields] === value_1) {
                                                com && com.set(tools.isEmpty(data_1[fieldName]) ? '' : data_1[fieldName]);
                                                break;
                                            }
                                        }
                                    }
                                }).catch(function (e) {
                                    console.log(e);
                                });
                            }
                            // for(let assign of assigns){
                            //     if(assign.fieldname === custom.relateFields){
                            //     }
                            // }
                        };
                        for (var key in objOfForms_1) {
                            _loop_1(key);
                        }
                    }
                });
            }
        };
        Object.defineProperty(LeTableEditModule.prototype, "json", {
            get: function () {
                var result = {};
                if (this.forms) {
                    for (var _i = 0, _a = this.forms; _i < _a.length; _i++) {
                        var com = _a[_i];
                        var name_1 = com.custom.fieldName, value = com.get();
                        result[name_1] = value;
                    }
                }
                console.log(JSON.stringify(result));
                return result;
            },
            enumerable: true,
            configurable: true
        });
        LeTableEditModule.EDIT_COM_VIEW_CLASS = 'form-com-view';
        return LeTableEditModule;
    }(FormFactory_1.FormFactory));
    exports.LeTableEditModule = LeTableEditModule;
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
