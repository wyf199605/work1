define("LeBasicPage", ["require", "exports", "Modal", "LeBasicPageHeader"], function (require, exports, Modal_1, LeBasicPageHeader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="LeBasicPage"/>
    var SPAPage = G.SPAPage;
    var SPA = G.SPA;
    var d = G.d;
    var LeBasicPage = /** @class */ (function (_super) {
        __extends(LeBasicPage, _super);
        function LeBasicPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(LeBasicPage.prototype, "title", {
            get: function () {
                if (this.header) {
                    return this.header.title;
                }
                else if (this.modal) {
                    return this.modal.modalHeader.title;
                }
                return '';
            },
            // private _titleEl : HTMLElement;
            set: function (t) {
                if (this.header) {
                    this.header.title = t;
                }
                else if (this.modal) {
                    this.modal.modalHeader.title = t;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LeBasicPage.prototype, "body", {
            // set body(html : HTMLElement){
            //     this._bodyEl.innerHTML = null;
            //     this._bodyEl.appendChild(html);
            // }
            get: function () {
                return this._bodyEl;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LeBasicPage.prototype, "buttonGroupEl", {
            get: function () {
                return this.header ? this.header.buttonGroupEl : this._buttonGroupEl;
            },
            enumerable: true,
            configurable: true
        });
        LeBasicPage.prototype.modalParaGet = function () {
            return {};
        };
        LeBasicPage.prototype.wrapperInit = function () {
            var para = this.para;
            this.isModal = !!para.inModal;
            if (this.isModal) {
                this.modal = h(Modal_1.Modal, __assign({ className: "le-page-modal", header: "\u9875\u9762", isBackground: false, isOnceDestroy: true, onClose: function () {
                        SPA.close();
                    } }, this.modalParaGet()));
                this._bodyEl = this.modal.bodyWrapper;
            }
            else {
                this.basicPageEl = h("div", { className: "basic-page" },
                    this.header = para.inTab ? null : h(LeBasicPageHeader_1.LeBasicPageHeader, null),
                    this._buttonGroupEl = para.inTab ? h("div", { className: "basic-page-btns" }) : null,
                    this._bodyEl = h("div", { className: "basic-page-body" }, this.bodyInit()));
                return this.basicPageEl;
            }
        };
        LeBasicPage.prototype.bodyInit = function () {
            return null;
        };
        LeBasicPage.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            if (this.basicPageEl) {
                d.remove(this.basicPageEl);
                this.basicPageEl = null;
            }
            if (this.modal) {
                this.modal.destroy();
                this.modal = null;
            }
        };
        return LeBasicPage;
    }(SPAPage));
    exports.LeBasicPage = LeBasicPage;
});

define("LeBasicPageHeader", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="LeBasicPageHeader"/>
    var Component = G.Component;
    var tools = G.tools;
    var LeBasicPageHeader = /** @class */ (function (_super) {
        __extends(LeBasicPageHeader, _super);
        function LeBasicPageHeader(props) {
            var _this = _super.call(this, props) || this;
            _this.title = props.title;
            return _this;
        }
        LeBasicPageHeader.prototype.wrapperInit = function (para) {
            return h("div", { className: "basic-page-header" },
                h("span", { "c-var": "title", className: "basic-page-line" }),
                h("div", { "c-var": "buttonGroup", className: "basic-page-header-btns" }));
        };
        Object.defineProperty(LeBasicPageHeader.prototype, "title", {
            get: function () {
                return this.innerEl && this.innerEl.title ? this.innerEl.title.innerHTML : '';
            },
            set: function (title) {
                if (title && this.innerEl && this.innerEl.title) {
                    this.innerEl.title.innerHTML = tools.str.toEmpty(title);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LeBasicPageHeader.prototype, "buttonGroupEl", {
            get: function () {
                return this.innerEl.buttonGroup;
            },
            enumerable: true,
            configurable: true
        });
        return LeBasicPageHeader;
    }(Component));
    exports.LeBasicPageHeader = LeBasicPageHeader;
});

define("LeCommonPage", ["require", "exports", "LeBasicPage", "LeRule", "Modal", "Tab", "Button", "LeButtonGroup", "LeEditPage"], function (require, exports, LeBasicPage_1, LeRule_1, Modal_1, tab_1, Button_1, LeButtonGroup_1, LeEditPage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var d = G.d;
    var LeCommonPage = /** @class */ (function (_super) {
        __extends(LeCommonPage, _super);
        function LeCommonPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        LeCommonPage.prototype.init = function (para, data) {
            var _this = this;
            var url = para.url;
            if (!url) {
                Modal_1.Modal.alert('界面地址为空');
            }
            this.modal && (this.modal.width = '700px');
            var tablePage = null;
            LeRule_1.LeRule.Ajax.fetch(LE.CONF.siteUrl + url, {
                data: { output: "json" },
                loading: {
                    msg: '页面加载中...',
                    container: this.container
                }
            }).then(function (_a) {
                var response = _a.response;
                var lePage = response.data || {}, leHead = lePage.head, leBody = lePage.body, leCommon = lePage.common;
                var headerTitle = tools.isNotEmpty(_this.header) ? _this.header : _this;
                headerTitle.title = leHead ? leHead.caption : '页面';
                if (tools.isEmpty(leBody)) {
                    Modal_1.Modal.alert('页面UI数据为空');
                    return;
                }
                _this.fieldsInit(leCommon && leCommon.fields);
                // Header Buttons
                if (tools.isNotEmpty(leBody.buttons)) {
                    leBody.buttons.forEach(function (btn) {
                        new Button_1.Button({
                            content: btn.caption,
                            container: _this.header.buttonGroupEl,
                            onClick: function () {
                                var data = {};
                                if (btn.multi !== 1 && tools.isNotEmpty(tablePage)) {
                                    data = tablePage.tableModule.main.ftable.selectedRowsData;
                                }
                                LeButtonGroup_1.buttonAction.click(btn, data);
                            }
                        });
                    });
                }
                var tabsUi = leBody.container && leBody.container.tab;
                _this.pages = _this.pages || [];
                if (tools.isNotEmptyArray(tabsUi)) {
                    var tabContainer = h("div", { className: "le-tabs menu-tabs" });
                    d.after(_this.header.wrapper, tabContainer);
                    var moudleParaArr_1 = [];
                    _this.tab = new tab_1.Tab({
                        tabParent: tabContainer,
                        panelParent: _this.body,
                        onClick: function (index) {
                            var modulePara = moudleParaArr_1[index];
                            // 确保第一次时才初始化
                            if (!_this.pages[index] && modulePara) {
                                delete moudleParaArr_1[index];
                                var tabEl_1 = d.query(".tab-pane[data-index=\"" + index + "\"]", _this.tab.getPanel());
                                if (modulePara.custom) {
                                    var _a = modulePara.custom.link, pageName_1 = _a.dataAddr, varList_1 = _a.varList;
                                    require([pageName_1], function (module) {
                                        _this.pages[index] = new module[pageName_1]({
                                            container: tabEl_1
                                        });
                                        if (pageName_1 = 'ActivityDetailModule') {
                                            _this.pages[index].set(varList_1[0].varValue);
                                        }
                                    });
                                }
                                else if (modulePara.table) {
                                    require(['LeTablePage'], function (module) {
                                        _this.pages[index] = new module.LeTablePage(Object.assign({
                                            container: tabEl_1,
                                            basePage: _this,
                                            queryData: para.query ? JSON.parse(para.query) : null,
                                            common: lePage.common,
                                            inTab: true
                                        }, modulePara));
                                    });
                                }
                            }
                        }
                    });
                    // 控件UI分组
                    tabsUi.forEach(function (tabUi) {
                        var modulePara = {};
                        ['querier', 'editor', 'table', 'custom'].forEach(function (key) {
                            var id = tabUi[key] && tabUi[key][0], le = id ? (leBody[key] || []).filter(function (leKey) { return leKey.id === id; })[0] : null;
                            if (le) {
                                modulePara[key] = le;
                            }
                        });
                        _this.tab.addTab([{
                                title: tabUi.caption,
                                dom: null
                            }]);
                        moudleParaArr_1.push(modulePara);
                    });
                    _this.tab.active(leBody.container.deftPage);
                }
                else {
                    if (tools.isNotEmpty(leBody.editor)) {
                        var page = new LeEditPage_1.LeEditPage({
                            container: _this.body,
                            pageEl: lePage,
                            basePage: _this,
                        });
                        _this.pages.push(page);
                    }
                    var modulePara_1 = {};
                    ['querier', 'table'].forEach(function (key) {
                        var le = (leBody[key] || [])[0];
                        if (le) {
                            modulePara_1[key] = le;
                        }
                    });
                    if (tools.isNotEmpty(modulePara_1)) {
                        require(['LeTablePage'], function (module) {
                            tablePage = new module.LeTablePage(Object.assign({
                                container: _this.body,
                                basePage: _this,
                                common: lePage.common,
                                queryData: para.query ? JSON.parse(para.query) : null
                            }, modulePara_1));
                            _this.pages.push(tablePage);
                        });
                    }
                }
            });
        };
        LeCommonPage.prototype.fieldsInit = function (fields) {
            Array.isArray(fields) && fields.forEach(function (field) {
                if (field) {
                    if (field.dataType === LeRule_1.LeRule.DT_DATETIME && !field.displayFormat) {
                        field.displayFormat = 'yyyy-MM-dd HH:mm:ss';
                    }
                    if (field.dataType === LeRule_1.LeRule.DT_TIME && !field.displayFormat) {
                        field.displayFormat = 'HH:mm:ss';
                    }
                }
            });
        };
        LeCommonPage.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.pages && this.pages.forEach(function (page) { return page && page.destroy(); });
            this.pages = [];
            this.tab = null;
        };
        return LeCommonPage;
    }(LeBasicPage_1.LeBasicPage));
    exports.LeCommonPage = LeCommonPage;
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
