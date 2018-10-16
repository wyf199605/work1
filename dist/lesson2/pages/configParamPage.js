define("ActiveConfig", ["require", "exports", "CommonConfig"], function (require, exports, commonConfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ActiveConfig = /** @class */ (function (_super) {
        __extends(ActiveConfig, _super);
        function ActiveConfig(para) {
            return _super.call(this, para) || this;
        }
        ActiveConfig.prototype.getSaveUrl = function () {
            return LE.CONF.ajaxUrl.activeConfigSave;
        };
        ActiveConfig.prototype.getSettingUrl = function () {
            return LE.CONF.ajaxUrl.activeConfig;
        };
        ActiveConfig.prototype.bodyInit = function () {
            if (!this._tpl) {
                this._tpl = h("div", { className: "setting config-param-page" },
                    h("div", { className: "set credit-setting" },
                        h("div", null, "1\u5B66\u5206\u00A0=\u00A0"),
                        h("div", { className: "line" }),
                        h("div", { className: "credit-content" },
                            h("div", { className: "credit-num" },
                                h("input", { "data-name": "crenumber", min: "0", className: "default", type: "number" }),
                                " \u6CE8:\u6570\u503C\uFF0C\u5982100"),
                            h("div", { className: "credit-unit" },
                                h("input", { "data-name": "creunit", className: "default", type: "text" }),
                                " \u6CE8:\u5355\u4F4D\uFF0C\u5982\u79EF\u5206"))),
                    h("div", { className: "set default-radius" },
                        "\u9ED8\u8BA4\u7B7E\u5230\u534A\u5F84:\u00A0\u00A0",
                        h("input", { "data-name": "radius", min: "0", className: "default", type: "number" }),
                        " \u7C73"),
                    h("div", { className: "set default-evaluate-time" },
                        "\u9ED8\u8BA4\u8BC4\u4EF7\u622A\u6B62\u65F6\u95F4: \u00A0\u00A0\u6D3B\u52A8\u540E\u00A0\u00A0",
                        h("input", { "data-name": "assess", min: "0", className: "default", type: "number" }),
                        " \u5929"),
                    h("div", { className: "set default-evaluate-time" },
                        "\u9ED8\u8BA4\u89D2\u8272\u79EF\u5206\u500D\u6570: \u00A0\u00A0\u7BA1\u7406\u8005\u00A0\u00A0",
                        h("input", { "data-name": "intmanager", min: "0", className: "default", type: "number" }),
                        " \u00A0\u00A0\u7EC4\u7EC7\u8005\u00A0\u00A0",
                        h("input", { "data-name": "intorganizer", min: "0", className: "default", type: "number" }),
                        " \u500D"),
                    h("div", { className: "set btns" },
                        h("div", { className: "btn editing" }, "\u7F16\u8F91"),
                        h("div", { className: "btn save" }, "\u4FDD\u5B58")));
            }
            return this._tpl;
        };
        return ActiveConfig;
    }(commonConfig_1.CommonConfig));
    exports.ActiveConfig = ActiveConfig;
});

define("AutoReview", ["require", "exports", "CommonConfig"], function (require, exports, commonConfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var AutoReview = /** @class */ (function (_super) {
        __extends(AutoReview, _super);
        function AutoReview(para) {
            return _super.call(this, para) || this;
        }
        AutoReview.prototype.getSaveUrl = function () {
            return LE.CONF.ajaxUrl.autoReviewSave;
        };
        AutoReview.prototype.getSettingUrl = function () {
            return LE.CONF.ajaxUrl.autoReview;
        };
        AutoReview.prototype.getAjaxData = function () {
            var inputs = d.queryAll('[data-name][type="checkbox"]', this.tpl()), radios = d.queryAll('input[type="radio"]', this.tpl()), ajaxData = {};
            inputs.forEach(function (check) {
                ajaxData[check.dataset.name] = check.checked ? 0 : 1;
            });
            radios.forEach(function (radio) {
                if (radio.checked) {
                    switch (radio.id) {
                        case 'signsuccess':
                            ajaxData.pass = 0;
                            break;
                        case 'comment':
                            ajaxData.pass = 1;
                            break;
                        case 'nosign':
                            ajaxData.pass = 2;
                            break;
                        case 'signfail':
                            ajaxData.refuse = 0;
                            break;
                        case 'nocomment':
                            ajaxData.refuse = 1;
                            break;
                    }
                }
            });
            return { saveparam: ajaxData };
            // console.log(ajaxData);
        };
        AutoReview.prototype.radioSetting = function (setting) {
            switch (setting.pass) {
                case 0:
                    d.query('#signsuccess', this.tpl()).checked = true;
                    break;
                case 1:
                    d.query('#comment', this.tpl()).checked = true;
                    break;
                case 2:
                    d.query('#nosign', this.tpl()).checked = true;
                    break;
            }
            switch (setting.refuse) {
                case 0:
                    d.query('#signfail', this.tpl()).checked = true;
                    break;
                case 1:
                    d.query('#nocomment', this.tpl()).checked = true;
                    break;
            }
        };
        AutoReview.prototype.bodyInit = function () {
            if (!this._tpl) {
                this._tpl = h("div", { className: "setting config-param-page" },
                    h("div", { className: "auto-review" },
                        h("div", { className: "set tips" },
                            h("span", { className: "set-tips" }, "\u63D0\u793A\uFF1A\u81EA\u52A8\u5BA1\u6838\u6267\u884C\u6570\u636E\u4E3A\u914D\u7F6E\u4FDD\u5B58\u540E\u5F00\u59CB\u751F\u6548\uFF0C\u4EE5\u5F80\u6570\u636E\u4F9D\u7136\u9700\u8981\u624B\u52A8\u5BA1\u6838\u3002")),
                        h("div", { className: "set select line" },
                            h("div", { className: "select-set" },
                                h("span", { className: "explain bold-text" }, "\u79EF\u5206\u5BA1\u6279\u6D41\u7A0B:"),
                                h("input", { "data-name": "gradefirstcheck", type: "checkbox", className: "normal", name: "grade", id: "start" }),
                                h("label", { htmlFor: "start" }, "\u6210\u7EE9\u521D\u5BA1"),
                                h("input", { "data-name": "gradefinalcheck", type: "checkbox", className: "normal", name: "grade", id: "end" }),
                                h("label", { htmlFor: "end" }, "\u6210\u7EE9\u7EC8\u5BA1")),
                            h("div", { className: "select-set" },
                                h("span", { className: "explain" }, "\u901A\u8FC7/\u8BC4\u5206:"),
                                h("input", { type: "radio", className: "normal", checked: true, name: "sign", id: "signsuccess" }),
                                h("label", { htmlFor: "signsuccess" }, "\u7B7E\u5230\u6210\u529F"),
                                h("input", { type: "radio", className: "normal", name: "sign", id: "comment" }),
                                h("label", { htmlFor: "comment" }, "\u7B7E\u5230\u6210\u529F\u4E14\u6709\u8BC4\u8BBA"),
                                h("input", { type: "radio", className: "normal", name: "sign", id: "nosign" }),
                                h("label", { htmlFor: "nosign" }, "\u6709\u65E0\u7B7E\u5230\u90FD\u53EF\u4EE5")),
                            h("div", { className: "select-set" },
                                h("span", { className: "explain" }, "\u62D2\u7EDD/\u4E0D\u8BC4\u5206:"),
                                h("input", { type: "radio", className: "normal", checked: true, name: "nsign", id: "signfail" }),
                                h("label", { htmlFor: "signfail" }, "\u7B7E\u5230\u5931\u8D25"),
                                h("input", { type: "radio", className: "normal", name: "nsign", id: "nocomment" }),
                                h("label", { htmlFor: "nocomment" }, "\u7B7E\u5230\u6210\u529F\u4F46\u672A\u8BC4\u8BBA"))),
                        h("div", { className: "set select line" },
                            h("div", { className: "flow" },
                                h("span", { className: "explain bold-text" }, "\u6D3B\u52A8\u7533\u62A5\u6D41\u7A0B:"),
                                " ",
                                h("span", { className: "set-tips" }, "\uFF08\u52FE\u9009\u7684\u89D2\u8272\u65E0\u9700\u5BA1\u6838\u4E1A\u52A1\u76F4\u63A5\u5230\u8FBE\u4E0A\u4E00\u7EA7\u5BA1\u6838\uFF0C\u5F53\u6240\u6709\u7684\u89D2\u8272\u90FD\u52FE\u9009\uFF0C\u4EE3\u8868\u76F4\u63A5\u6240\u6709\u89D2\u8272\u90FD\u662F\u76F4\u63A5\u6267\u884C\u7EC8\u5BA1\u6743\u9650\uFF09")),
                            h("div", { className: "select-set" },
                                h("span", { className: "explain" }),
                                h("input", { "data-name": "declarefirstcheck", type: "checkbox", className: "normal", name: "apply", id: "applystart" }),
                                h("label", { htmlFor: "applystart" }, "\u7533\u62A5\u521D\u5BA1"),
                                h("input", { "data-name": "declarefinalcheck", type: "checkbox", className: "normal", name: "apply", id: "applyend" }),
                                h("label", { htmlFor: "applyend" }, "\u7533\u62A5\u7EC8\u5BA1"))),
                        h("div", { className: "set select" },
                            h("div", { className: "flow" },
                                h("span", { className: "explain bold-text" }, "\u6D3B\u52A8\u7533\u62A5\u6D41\u7A0B:"),
                                " ",
                                h("span", { className: "set-tips" }, "\uFF08\u52FE\u9009\u7684\u89D2\u8272\u65E0\u9700\u5BA1\u6838\uFF0C\u5F53\u6700\u540E\u4E00\u5BA1\u65E0\u9700\u5BA1\u6838\uFF0C\u8BC1\u4E66\u76F4\u63A5\u8BA4\u8BC1\u5F97\u5206\uFF09")),
                            h("div", { className: "select-set" },
                                h("span", { className: "explain" }),
                                h("input", { "data-name": "crefirstcheck", type: "checkbox", className: "normal", name: "auth", id: "authstart" }),
                                h("label", { htmlFor: "authstart" }, "\u8BA4\u8BC1\u521D\u5BA1"),
                                h("input", { "data-name": "crefinalcheck", type: "checkbox", className: "normal", name: "auth", id: "authend" }),
                                h("label", { htmlFor: "authend" }, "\u8BA4\u8BC1\u7EC8\u5BA1"))),
                        h("div", { className: "set btns" },
                            h("div", { className: "btn editing" }, "\u7F16\u8F91"),
                            h("div", { className: "btn save" }, "\u4FDD\u5B58"))));
            }
            return this._tpl;
        };
        return AutoReview;
    }(commonConfig_1.CommonConfig));
    exports.AutoReview = AutoReview;
});

define("CommonConfig", ["require", "exports", "LeRule", "LeBasicPage"], function (require, exports, LeRule_1, LeBasicPage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="CommonConfig"/>
    var d = G.d;
    var CommonConfig = /** @class */ (function (_super) {
        __extends(CommonConfig, _super);
        function CommonConfig() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.isSetting = false;
            return _this;
        }
        CommonConfig.prototype.init = function () {
            d.append(this.para.container, this.tpl());
            this.initEven();
            this.setting(this.getSettingUrl());
        };
        CommonConfig.prototype.getSettingUrl = function () {
            return '';
        };
        CommonConfig.prototype.initEven = function () {
            var _this = this;
            var tpl = this.tpl(), editBtn = d.query('.editing', tpl), saveBtn = d.query('.save', tpl);
            d.on(editBtn, 'click', function () {
                tpl.classList.add('edit');
            });
            d.on(saveBtn, 'click', function () {
                tpl.classList.remove('edit');
                _this.ajaxLoad(_this.getSaveUrl(), {
                    dataType: 'json',
                    data: JSON.stringify(_this.getAjaxData()),
                    type: 'post'
                }).then(function (_a) {
                    var response = _a.response;
                    console.log(response);
                });
            });
        };
        CommonConfig.prototype.getAjaxData = function () {
            var inputs = d.queryAll('input[data-name]', this.tpl()), ajaxData = {};
            inputs.forEach(function (obj) {
                ajaxData[obj.dataset.name] = obj.value;
            });
            ajaxData = this.radioSave(ajaxData);
            console.log({ saveparam: ajaxData });
            return { saveparam: ajaxData };
        };
        CommonConfig.prototype.radioSave = function (ajaxData) {
            return ajaxData;
        };
        CommonConfig.prototype.getSaveUrl = function () {
            return '';
        };
        CommonConfig.prototype.setting = function (item) {
            var _this = this;
            if (this.isSetting) {
                return;
            }
            this.isSetting = true;
            this.ajaxLoad(item, {
                dataType: 'json'
            }).then(function (_a) {
                var response = _a.response;
                var setting = response && response.data && response.data.data[0], texts = d.queryAll('input[data-name][type="text"]', _this.tpl()), nums = d.queryAll('input[data-name][type="number"]', _this.tpl()), checks = d.queryAll('input[data-name][type="checkbox"]', _this.tpl());
                texts = texts.concat(nums);
                if (G.tools.isEmpty(setting)) {
                    return;
                }
                texts.forEach(function (obj) {
                    var dataName = obj.dataset.name.toLocaleUpperCase();
                    if (dataName in setting) {
                        obj.value = setting[dataName];
                    }
                });
                checks.forEach(function (obj) {
                    var dataName = obj.dataset.name.toLocaleUpperCase();
                    if (dataName in setting) {
                        var num = setting[dataName];
                        if (num === 0) {
                            obj.checked = true;
                        }
                        else if (num === 1) {
                            obj.checked = false;
                        }
                    }
                });
                var obj = {};
                for (var item_1 in setting) {
                    obj[item_1.toLocaleLowerCase()] = setting[item_1];
                }
                _this.radioSetting(obj);
            });
        };
        CommonConfig.prototype.radioSetting = function (setting) {
        };
        CommonConfig.prototype.ajaxLoad = function (url, setting) {
            return LeRule_1.LeRule.Ajax.fetch(url, setting);
        };
        CommonConfig.prototype.tpl = function () {
            if (!this._tpl) {
                this._tpl = h("div", null);
            }
            return this._tpl;
        };
        return CommonConfig;
    }(LeBasicPage_1.LeBasicPage));
    exports.CommonConfig = CommonConfig;
});

define("FaceRecognition", ["require", "exports", "CommonConfig"], function (require, exports, commonConfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var FaceRecognition = /** @class */ (function (_super) {
        __extends(FaceRecognition, _super);
        function FaceRecognition(para) {
            return _super.call(this, para) || this;
        }
        FaceRecognition.prototype.getSettingUrl = function () {
            return LE.CONF.ajaxUrl.faceRecognition;
        };
        FaceRecognition.prototype.radioSetting = function (setting) {
            var isOpen = setting.isopen, yes = d.query('#yes', this.tpl()), no = d.query('#no', this.tpl());
            if (isOpen === 0) {
                yes.checked = true;
                no.checked = false;
            }
            else if (isOpen === 1) {
                yes.checked = false;
                no.checked = true;
            }
        };
        FaceRecognition.prototype.getSaveUrl = function () {
            return LE.CONF.ajaxUrl.faceRecognitionSave;
        };
        FaceRecognition.prototype.radioSave = function (ajaxData) {
            var yes = d.query('#yes', this.tpl());
            if (yes.checked) {
                ajaxData.isopen = 0;
            }
            else {
                ajaxData.isopen = 1;
            }
            return ajaxData;
        };
        FaceRecognition.prototype.bodyInit = function () {
            if (!this._tpl) {
                this._tpl = h("div", { className: "setting config-param-page" },
                    h("div", { className: "set" },
                        "\u7B7E\u5230\u4EBA\u8138\u901A\u8FC7\u7387:",
                        h("input", { "data-name": "facerecognition", className: "default", placeholder: "\u767E\u5206\u6570\uFF0C\u598260%", type: "text" }),
                        " %"),
                    h("div", { className: "set select-set" },
                        h("span", { className: "explain" }, "\u542F\u7528\u72B6\u6001"),
                        h("input", { type: "radio", className: "normal", checked: true, name: "status", id: "yes" }),
                        h("label", { htmlFor: "yes" }, "\u542F\u7528"),
                        h("input", { type: "radio", className: "normal", name: "status", id: "no" }),
                        h("label", { htmlFor: "no" }, "\u7981\u7528")),
                    h("div", { className: "set btns" },
                        h("div", { className: "btn editing" }, "\u7F16\u8F91"),
                        h("div", { className: "btn save" }, "\u4FDD\u5B58")));
            }
            return this._tpl;
        };
        return FaceRecognition;
    }(commonConfig_1.CommonConfig));
    exports.FaceRecognition = FaceRecognition;
});

define("IntegrityNorm", ["require", "exports", "CommonConfig"], function (require, exports, commonConfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IntegrityNorm = /** @class */ (function (_super) {
        __extends(IntegrityNorm, _super);
        function IntegrityNorm(para) {
            return _super.call(this, para) || this;
        }
        IntegrityNorm.prototype.getSaveUrl = function () {
            return LE.CONF.ajaxUrl.integrityNormSave;
        };
        IntegrityNorm.prototype.getSettingUrl = function () {
            return LE.CONF.ajaxUrl.integrityNorm;
        };
        IntegrityNorm.prototype.bodyInit = function () {
            if (!this._tpl) {
                this._tpl = h("div", { className: "setting config-param-page" },
                    h("div", { className: "set" },
                        "\u5B66\u751F\u8BDA\u4FE1\u521D\u59CB\u503C:",
                        h("input", { "data-name": "intvalue", className: "base-manager-input default", type: "text" })),
                    h("div", { className: "set" },
                        h("div", { className: "set-title" },
                            "\u5956\u60E9\u914D\u7F6E",
                            h("span", { className: "set-tips" }, "\u63D0\u793A\uFF1A\u5956\u52B1\u8BF7\u8F93\u5165\u6B63\u503C\uFF1B\u60E9\u7F5A\u6216\u6263\u5206\u8BF7\u8F93\u5165\u8D1F\u503C\uFF1B\u6CA1\u5956\u6CA1\u6263\u8BF7\u8F93\u51650")),
                        h("div", { className: "set-content" },
                            h("div", { className: "set-item-group" },
                                h("span", { className: "no-shrink" }, "\u6D3B\u52A8\u62A5\u540D\u4E00\u6B21"),
                                h("input", { "data-name": "signin", className: "base-manager-input default", type: "text" }),
                                h("span", { className: "no-shrink" }, "\u6D3B\u52A8\u7F3A\u52E4\u4E00\u6B21"),
                                h("input", { "data-name": "absence", className: "base-manager-input default", type: "text" }),
                                h("span", null, "( \u5355\u8BFE\u65F6\u6D3B\u52A8\uFF0C\u7F3A\u52E4\u6263\u56DE\u62A5\u540D\u6240\u5F97\u8BDA\u4FE1\u503C\uFF0C\u53C8\u6309\u7F3A\u52E4\u503C\u60E9\u7F5A\uFF1B\u591A\u8BFE\u65F6\u6D3B\u52A8\u7B7E\u5230\u5176\u4E2D\u4E00\u8282\u8BFE\u4E0D\u56DE\u6263\u62A5\u540D\u6240\u5F97\u8BDA\u4FE1\u503C )")),
                            h("div", { className: "set-item-group" },
                                h("span", { className: "no-shrink" }, "\u6D3B\u52A8\u8BC4\u4EF7\u4E00\u6B21"),
                                h("input", { "data-name": "assess", className: "base-manager-input default", type: "text" }),
                                h("span", { className: "no-shrink" }, "\u6D3B\u52A8\u7F3A\u8BC4\u4E00\u6B21"),
                                h("input", { "data-name": "misscomment", className: "base-manager-input default", type: "text" })),
                            h("div", { className: "set-item-group" },
                                h("span", { className: "no-shrink" }, "\u8BC1\u4E66\u901A\u8FC7\u4E00\u6B21"),
                                h("input", { "data-name": "crepass", className: "base-manager-input default", type: "text" }),
                                h("span", { className: "no-shrink" }, "\u8BC1\u4E66\u60E9\u7F5A\u4E00\u6B21"),
                                h("input", { "data-name": "crepunish", className: "default", type: "text" }),
                                h("span", null, "( \u8BC1\u4E66\u5220\u9664\u540E\uFF0C\u6263\u56DE\u8BC1\u4E66\u901A\u8FC7\u6240\u5F97\u8BDA\u4FE1\u503C\u3002\u8BC1\u4E66\u5220\u9664\uFF0C\u6263\u56DE\u901A\u8FC7\u6240\u5F97\u8BDA\u4FE1\u503C\u540E\u518D\u6263\u60E9\u7F5A\u7684\u8BDA\u4FE1\u503C )")),
                            h("div", { className: "set-item-group" },
                                h("span", { className: "no-shrink" }, "\u7B7E\u5230\u60E9\u7F5A\u4E00\u6B21"),
                                h("input", { "data-name": "signpunish", className: "default", type: "text" }),
                                h("span", null, "( \u8FDD\u89C4\u7B7E\u5230\u6216\u7B7E\u5230\u9003\u8BFE\uFF0C\u6263\u56DE\u62A5\u540D\u6240\u5F97\u8BDA\u4FE1\u503C\uFF0C\u518D\u6263\u8BE5\u60E9\u7F5A\u7684\u8BDA\u4FE1\u503C )")))),
                    h("div", { className: "set" },
                        h("div", { className: "set-title" }, "\u8BDA\u4FE1\u89C4\u5219\uFF08\u5EFA\u8BAE\uFF1A\u6587\u672C\u63CF\u8FF0\uFF09\uFF1A"),
                        h("div", { className: "set-content" },
                            h("p", null, "\"\u901A\u77E51\uFF1A\u81F32018.05.07\u8D77\uFF0C\u8BDA\u4FE1\u89C4\u5219\u6309\u4EE5\u4E0B\u8C03\u6574"),
                            h("p", null, "\u3010\u6D3B\u52A8\u8BDA\u4FE1\u503C\u3011"),
                            h("p", null, "1\uFF09\u5355\u8BFE\u65F6\u6D3B\u52A8\uFF1A\u62A5\u540D\u6D3B\u52A8\u4E00\u6B21\u5F97\u8BDA\u4FE1\u503C +1\uFF1B \u7F3A\u52E4\u6D3B\u52A8\u4E00\u6B21\u6263\u9664\u62A5\u540D\u8BE5\u6D3B\u52A8\u6240\u5F97\u8BDA\u4FE1\u503C -1\uFF0C\u518D\u6263\u9664\u7F3A\u52E4\u8BDA\u4FE1\u503C -1 \u3002"),
                            h("p", null, "2\uFF09\u591A\u8BFE\u65F6\u6D3B\u52A8\uFF1A\u62A5\u540D\u6D3B\u52A8\u4E00\u6B21\u7684\u8BDA\u4FE1\u503C +1\uFF1B \u5F53\u5B66\u751F\u591A\u8BFE\u65F6\u4E2D\u7B7E\u5230\u8BFE\u65F6\u22651\uFF0C\u7F3A\u52E4\u5176\u4E2D\u4E00\u8282\u8BFE\uFF0C\u5C31\u6263\u9664\u8BE5\u8282\u8BFE\u7684\u7F3A\u52E4\u8BDA\u4FE1\u503C -1\u3002"),
                            h("p", null, "3\uFF09\u8BFE\u7A0B\u88AB\u6559\u5E08\u5173\u95ED\u540E\uFF0C\u5B66\u751F\u6240\u5F97\u8BDA\u4FE1\u503C\u4E0D\u6263\u9664\u3002"),
                            h("p", null, "\u3010\u8BC4\u4EF7\u8BDA\u4FE1\u503C\u3011"),
                            h("p", null, "\u6CE8\uFF1A\u672C\u7CFB\u7EDF\u4E2D\uFF0C\u4E0D\u7BA1\u5355\u8BFE\u65F6\u6D3B\u52A8\u8FD8\u662F\u591A\u8BFE\u65F6\u6D3B\u52A8\uFF0C\u53EA\u80FD\u5728\u8BC4\u4EF7\u671F\u95F4\u5185\u8BC4\u4EF7\u4E00\u6B21\u3002\u53C2\u4E0E\u5176\u4ED6\u5B66\u751F\u8BC4\u4EF7\u7684\u4E92\u8BC4\u4E0D\u7B97\u8BDA\u4FE1\u503C"),
                            h("p", null, "4\uFF09\u8BC4\u4EF7\u6D3B\u52A8\u4E00\u6B21\u5F97\u8BDA\u4FE1\u503C +1\uFF1B\u7F3A\u8BC4\u6D3B\u52A8\u4E00\u6B21\u6263\u8BDA\u4FE1\u503C -1\u3002"),
                            h("p", null, "\u3010\u8BC1\u4E66\u8BDA\u4FE1\u503C\u3011"),
                            h("p", null, "5\uFF09\u8BC1\u4E66\u7533\u8BF7\u8BA4\u8BC1\u901A\u8FC7\u4E00\u6B21\u5F97\u8BDA\u4FE1\u503C +1\uFF1B\u8BC1\u4E66\u88AB\u5220\u9664\u5C06\u6263\u56DE\u8BE5\u8BC1\u4E66\u6240\u5F97\u8BDA\u4FE1\u503C -1\u3002"),
                            h("p", null, "6\uFF09\u82E5\u6076\u610F\u91CD\u590D\u63D0\u4EA4\u8BC1\u4E66\uFF0C\u88AB\u5BA1\u6838\u5458\u53D1\u73B0\uFF0C\u5220\u9664\u4E14\u60E9\u7F5A\uFF0C\u5219\u5C06\u6263\u56DE\u539F\u6765\u8BE5\u8BC1\u4E66\u6240\u5F97\u8BDA\u4FE1\u503C -1\uFF0C\u518D\u60E9\u7F5A\u8BDA\u4FE1\u503C -1\u3002"),
                            h("p", null, "\u3010\u6210\u7EE9\u8865\u5F55\u8BDA\u4FE1\u503C\u3011"),
                            h("p", null, "\u6CE8\uFF1A\u56E0\u7CFB\u7EDF\u6216\u5176\u4ED6\u975E\u5B66\u751F\u672C\u4EBA\u56E0\u7D20\uFF0C\u9020\u6210\u65E0\u6CD5\u7B7E\u5230\uFF0C\u8BDA\u4FE1\u503C\u88AB\u6263\u3002\u7ECF\u8054\u7EDC\u5458\u786E\u8BA4\u767B\u8BB0\uFF0C\u53EF\u4EE5\u901A\u8FC7\u8865\u6210\u7EE9\u8FD4\u56DE\u88AB\u6263\u8BDA\u4FE1\u503C"),
                            h("p", null, "7\uFF09\u5355\u8BFE\u65F6\u6D3B\u52A8\uFF1A\u8865\u5F55\u5B66\u751F\u6210\u7EE9\u901A\u8FC7\u540E\uFF0C\u5C06\u8865\u56DE\uFF0C\u7F3A\u52E4\u6240\u6263\u7684\u62A5\u540D\u6D3B\u52A8\u6240\u5F97\u8BDA\u4FE1\u503C +1\uFF1B\u548C\u8865\u56DE\u7F3A\u52E4\u6263\u9664\u7684\u8BDA\u4FE1\u503C +1\u3002"),
                            h("p", null, "8\uFF09\u591A\u8BFE\u65F6\u6D3B\u52A8\uFF1A\u8865\u5F55\u5B66\u751F\u6210\u7EE9\u901A\u8FC7\u540E\uFF0C\u5C06\u8865\u56DE\u5B66\u751F\u7684\u7F3A\u52E4\u6263\u9664\u7684\u8BDA\u4FE1\u503C +1\uFF1B\u82E5\u6263\u9664\u62A5\u540D\u6240\u5F97\u8BDA\u4FE1\u503C\uFF0C\u5C06\u8865\u56DE\u8BE5\u8BDA\u4FE1\u503C\u3002"),
                            h("p", null, "\u901A\u77E52\uFF1A\u81F32018.05.19\u8D77\uFF0C\u5B66\u751F\u7B7E\u5230\u8FDD\u89C4\u6216\u7B7E\u5230\u9003\u8BFE\u88AB\u62BD\u67E5\u5230\uFF0C\u5C06\u6839\u636E\u5B9E\u9645\u60C5\u51B5\u6388\u4E88\u6210\u7EE9\u6216\u4E0D\u6388\u4E88\u6210\u7EE9\u3002\u8BDA\u4FE1\u503C\u5C06\u6263\u56DE\u62A5\u540D\u6240\u5F97\u8BDA\u4FE1\u503C -1\uFF0C\u518D\u60E9\u7F5A\u8BDA\u4FE1\u503C-1\u3002\""))),
                    h("div", { className: "set btns" },
                        h("div", { className: "btn editing" }, "\u7F16\u8F91"),
                        h("div", { className: "btn save" }, "\u4FDD\u5B58")));
            }
            return this._tpl;
        };
        return IntegrityNorm;
    }(commonConfig_1.CommonConfig));
    exports.IntegrityNorm = IntegrityNorm;
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
