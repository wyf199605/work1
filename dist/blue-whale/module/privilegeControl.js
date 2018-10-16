define("PrivilegeControl", ["require", "exports", "PrivilegeConfigure", "PrivilegeQuery"], function (require, exports, privilegeConfigure_1, privilegeQuery_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var PrivilegeControl = /** @class */ (function () {
        function PrivilegeControl(para) {
            this.container = para.dom;
            this.url = d.closest(this.container, '[data-src]').dataset.src;
            this.initPage(para);
        }
        //根据url参数生成不同页面
        PrivilegeControl.prototype.initPage = function (para) {
            var self = this, urlPara = G.tools.url.getPara('uiTypeTest', this.url);
            switch (urlPara) {
                //权限组配置页面
                case 'privilegeConfigure':
                    new privilegeConfigure_1.PrivilegeConfigure({
                        container: this.container,
                        title: '权限配置',
                        dom: self.container,
                        url: para.url,
                        controllUrl: para.controllUrl
                    });
                    break;
                case 'privilegeSearch':
                    new privilegeQuery_1.PrivilegeQuery({
                        container: this.container,
                        title: '权限查询',
                        dom: self.container,
                        url: para.url,
                        iurl: para.iurl
                    });
                    break;
            }
        };
        return PrivilegeControl;
    }());
    exports.PrivilegeControl = PrivilegeControl;
});

/// <amd-module name="PrivilegeConfigure"/>
define("PrivilegeConfigure", ["require", "exports", "BasicPage", "PrivilegeDefault", "PrivilegePersonal"], function (require, exports, basicPage_1, privilegeDefault_1, privilegePersonal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CONF = BW.CONF;
    var d = G.d;
    var tools = G.tools;
    var PrivilegeConfigure = /** @class */ (function (_super) {
        __extends(PrivilegeConfigure, _super);
        function PrivilegeConfigure(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            _this.ajaxUrl = para.url;
            _this.controllUrl = para.controllUrl;
            _this.url = tools.isNotEmpty(para.url) ? para.url : CONF.ajaxUrl.rmprivsSelect;
            _this.generate();
            return _this;
        }
        /**
         * 构建主页面
         * */
        PrivilegeConfigure.prototype.generate = function () {
            var _this = this;
            // 生成顶部【缺省/个性权限配置】切换栏和装载容器
            this.dpConfMenuDom = d.create("<ul class=\"df-conf-menu\"></ul>");
            //【缺省权限配置】的装载容器
            var defaultContentDom = d.create("<div class=\"default-content\"></div>");
            //【个性权限配置】的装载容器
            var personalContentDom = d.create("<div class=\"personal-content\"></div>");
            var dpConfContentDom = d.create("<div class=\"df-conf-content\"></div>"), defaultLi = d.create("<li>\u7F3A\u7701\u6743\u9650\u914D\u7F6E</li>"), personalLi = d.create("<li>\u4E2A\u6027\u6743\u9650\u914D\u7F6E</li>");
            //装载容器
            this.dpConfMenuDom.appendChild(defaultLi);
            this.dpConfMenuDom.appendChild(personalLi);
            dpConfContentDom.appendChild(defaultContentDom);
            dpConfContentDom.appendChild(personalContentDom);
            this.para.container.appendChild(this.dpConfMenuDom);
            this.para.container.appendChild(dpConfContentDom);
            //【缺省/个性权限配置】切换，默认显示为缺省权限配置页面
            personalContentDom.style.display = 'none';
            defaultLi.classList.add('li-select');
            this.privilegeDefault = tools.isNotEmpty(this.ajaxUrl) ? new privilegeDefault_1.PrivilegeDefault(defaultContentDom, this.url) : new privilegeDefault_1.PrivilegeDefault(defaultContentDom);
            d.on(defaultLi, 'click', function () {
                personalLi.classList.remove('li-select');
                defaultLi.classList.add('li-select');
                personalContentDom.style.display = 'none';
                defaultContentDom.style.display = 'block';
            });
            d.on(personalLi, 'click', function () {
                if (!_this.privilegePersonal) {
                    _this.privilegePersonal = tools.isNotEmpty(_this.ajaxUrl) ? new privilegePersonal_1.PrivilegePersonal(personalContentDom, _this.url, _this.controllUrl) : new privilegePersonal_1.PrivilegePersonal(personalContentDom);
                }
                defaultLi.classList.remove('li-select');
                personalLi.classList.add('li-select');
                defaultContentDom.style.display = 'none';
                personalContentDom.style.display = 'block';
            });
        };
        return PrivilegeConfigure;
    }(basicPage_1.default));
    exports.PrivilegeConfigure = PrivilegeConfigure;
});

define("PrivilegeQuery", ["require", "exports", "BasicPage", "SelectInput", "TableModulePc", "BwRule", "TextInput", "Modal", "Button", "SearchInput", "InputBox", "Tab", "Tree", "Spinner", "Loading"], function (require, exports, basicPage_1, selectInput_1, TableModulePc, BwRule_1, text_1, Modal_1, Button_1, searchInput_1, InputBox_1, tab_1, Tree_1, spinner_1, loading_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="PrivilegeQuery"/>
    var CONF = BW.CONF;
    var d = G.d;
    var tools = G.tools;
    /**
     * 权限查询
     */
    var PrivilegeQuery = /** @class */ (function (_super) {
        __extends(PrivilegeQuery, _super);
        function PrivilegeQuery(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            _this.userId = [];
            _this.ajaxUrl = tools.isNotEmpty(para.url) ? para.url : '';
            _this.iurl = tools.isNotEmpty(para.iurl) ? para.iurl : '';
            _this.init();
            return _this;
        }
        PrivilegeQuery.prototype.init = function () {
            var _this = this;
            var tpl = this.initTpl();
            this.para.dom.appendChild(tpl);
            var dropDom = d.query('.priv-user-drop', tpl);
            //节点
            var text = new text_1.TextInput({
                container: d.query('.priv-node', tpl),
                readonly: true,
                icons: ['iconfont icon-arrow-down'],
                iconHandle: function (value) {
                    if (!_this.nodeModal) {
                        var rightPanel = _this.clearBtn(text, function () {
                            _this.nodeModal.isShow = false;
                        });
                        rightPanel.addItem(new Button_1.Button({
                            content: '确定',
                            onClick: function () {
                                // let tnode = this.tree.find((node) => {
                                //     if(node.content && node.content.nodeId === 'node_m1') {
                                //         return node;
                                //     }
                                // });
                                // console.log(tnode);
                                var select = _this.tree.getSelectedNodes(), data = [], str = '';
                                select && (data = select.map(function (node) { return node.content; }));
                                _this.nodeData = '';
                                data.forEach(function (obj) {
                                    str += obj.title + '；';
                                    _this.nodeData += obj.nodeId + ',';
                                });
                                _this.nodeData = _this.nodeData.substring(0, _this.nodeData.length - 1);
                                text.set(str);
                                _this.nodeModal.isShow = false;
                            }
                        }));
                        _this.nodeModal = new Modal_1.Modal({
                            container: _this.para.dom,
                            className: 'priv-query-modal',
                            // isShow : false,
                            body: d.create("<div></div>"),
                            footer: {
                                rightPanel: rightPanel
                            },
                            width: '250px'
                        });
                        _this.nodeSuccess(_this.nodeModal.body);
                    }
                    else {
                        _this.nodeModal.isShow = true;
                    }
                }
            });
            var userInput = new selectInput_1.SelectInput({
                container: d.query('.priv-user', tpl),
                data: [{
                        text: '用户',
                        value: 'USER',
                    }, {
                        text: '用户组',
                        value: 'GROUP'
                    }],
                onSet: function (data) {
                }
            });
            userInput.set('USER');
            var u = tools.isNotEmpty(this.iurl) ?
                this.iurl : tools.url.addObj(CONF.siteAppVerUrl + '/ui/pick/n1174_data-4/pick-4', { isMb: true }, false);
            //用户or用户组
            var iframe = d.create("<iframe class=\"pageIframe\" src=\"" + u + "\"></iframe>");
            var tableText = new text_1.TextInput({
                container: dropDom,
                readonly: true,
                icons: ['iconfont icon-arrow-down'],
                className: 'user-drop',
                iconHandle: function () {
                    _this.textClick(userInput, text, iframe, tableText);
                }
            });
            var tableModule;
            var queryBtn = new Button_1.Button({
                content: '查询',
                type: 'primary',
                container: d.query('.priv-query-btn', tpl),
                onClick: function (btn) {
                    var userType = userInput.get(), id;
                    _this.ajaxLoad([{
                            select_type: "getoperprivsbynodeidoruser",
                            user_id: _this.userId.join(','),
                            user_type: userType,
                            node_id: _this.nodeData
                        }]).then(function (response) {
                        console.log(response, 'user');
                        if (response.meta.indexOf('USER_ID') > -1) {
                            id = 'USER_ID';
                        }
                        else {
                            id = 'GROUP_ID';
                        }
                        var parentDom = d.query('.parent-table', tpl), childDom = d.query('.child-table', tpl), tableDom = d.create("<table><tbody></tbody></table>");
                        parentDom.innerHTML = null;
                        parentDom.appendChild(tableDom);
                        tableModule = _this.createTable(tableDom, parentDom, response.data, _this.resetCols(response.head.cols), 108);
                        tableModule.table.clickEvent.add('tbody tr', function (e) {
                            var data = tableModule.table.rowDataGet(d.closest(e.target, 'tr').dataset.index), oper = d.query('.oper-priv', tpl), prop = d.query('.prop-priv', tpl), level = d.query('.level-priv', tpl);
                            console.log(data);
                            if (!_this.tab) {
                                _this.tab = new tab_1.Tab({
                                    tabParent: childDom,
                                    panelParent: childDom,
                                    tabs: [
                                        {
                                            title: '功能',
                                            dom: oper,
                                            name: 'OPER_PRIVS'
                                        }, {
                                            title: '属性',
                                            dom: prop,
                                            name: 'PROP_PRIVS'
                                        }, {
                                            title: '层级',
                                            dom: level,
                                            name: 'LEVEL_PRIVS'
                                        }
                                    ],
                                    onClick: function (index) {
                                        var dom, action;
                                        switch (index) {
                                            case 0:
                                                dom = oper;
                                                action = 'OPER_PRIVS';
                                                break;
                                            case 1:
                                                dom = prop;
                                                action = 'PROP_PRIVS';
                                                break;
                                            case 2:
                                                dom = level;
                                                action = 'LEVEL_PRIVS';
                                                break;
                                        }
                                        _this.tabLoad(action, dom, data[id], userType, data);
                                    }
                                });
                            }
                            _this.tabLoad('OPER_PRIVS', oper, data[id], userType, data);
                        });
                    });
                }
            });
        };
        /**
         * 选项卡ui
         * @param action
         * @param dom
         * @param data
         * @param inputType
         * @param tableData
         */
        PrivilegeQuery.prototype.tabLoad = function (action, dom, data, inputType, tableData) {
            var _this = this;
            console.log(tableData);
            this.ajaxLoad([{
                    select_type: 'getprivsinfo',
                    user_input: data,
                    input_type: inputType,
                    node_id: tableData['NODE_ID'],
                    privs_type: action
                }]).then(function (response) {
                var tableDom = d.create("<table><tbody></tbody></table>");
                dom.innerHTML = null;
                dom.appendChild(tableDom);
                _this.createTable(tableDom, dom, response.data, _this.resetCols(response.head.cols));
            });
        };
        /**
         * 创建表格
         * @param tableDom
         * @param scrollEl
         * @param data
         * @param cols
         * @param fixTop
         * @returns {TableModulePc}
         */
        PrivilegeQuery.prototype.createTable = function (tableDom, scrollEl, data, cols, fixTop) {
            var tableConf = {
                tableEl: tableDom,
                scrollEl: scrollEl,
            };
            if (fixTop) {
                tableConf['fixTop'] = fixTop;
            }
            return new TableModulePc(tableConf, {
                cols: cols,
                multPage: 2,
                isSub: true,
                data: data,
            });
        };
        /**
         * 模态框清除按钮
         * @param text
         * @param cb
         * @returns {InputBox}
         */
        PrivilegeQuery.prototype.clearBtn = function (text, cb) {
            var clear = new InputBox_1.InputBox();
            clear.addItem(new Button_1.Button({
                content: '清除',
                onClick: function () {
                    text.set('');
                    cb();
                }
            }));
            return clear;
        };
        /**
         * 用户、用户组
         * @param userInput
         * @param text  节点
         * @param iframe
         * @param tableText
         */
        PrivilegeQuery.prototype.textClick = function (userInput, text, iframe, tableText) {
            switch (userInput.get()) {
                case 'USER':
                    this.userUi(iframe, tableText);
                    break;
                case 'GROUP':
                    this.groupUi(tableText);
                    break;
            }
        };
        /**
         * 用户组ui
         * @param tableText
         */
        PrivilegeQuery.prototype.groupUi = function (tableText) {
            var _this = this;
            var groupTable;
            this.ajaxLoad([{ select_type: 'getusergroupbyuserinput', user_input: '' }], false).then(function (response) {
                if (!_this.groupModal) {
                    var rightPanel = _this.clearBtn(tableText, function () {
                        _this.userId = [];
                        _this.groupModal.isShow = false;
                    });
                    rightPanel.addItem(new Button_1.Button({
                        content: '确定',
                        onClick: function () {
                            var str = '';
                            _this.userId = [];
                            groupTable.table.rowSelectDataGet().forEach(function (obj) {
                                str += obj['GROUP_NAME'] + ';';
                                _this.userId.push(obj['GROUP_ID']);
                            });
                            tableText.set(str);
                            _this.groupModal.isShow = false;
                        }
                    }));
                    _this.groupModal = new Modal_1.Modal({
                        header: '用户组',
                        container: _this.para.dom,
                        body: d.create("<div><div class=\"group-search\"></div><div class=\"scroll-el\"><table><tbody></tbody></table></div></div>"),
                        className: 'priv-query-group-modal',
                        width: '435px',
                        footer: {
                            rightPanel: rightPanel
                        },
                    });
                    _this.groupSearch = new searchInput_1.SearchInput({
                        container: d.query('.group-search', _this.groupModal.body),
                        placeholder: '搜索...',
                        ajax: {
                            fun: function (url, data, recentValue, cb) {
                                _this.ajaxLoad([{
                                        select_type: 'getusergroupbyuserinput',
                                        user_input: recentValue
                                    }]).then(function (res) {
                                    groupTable.tableData.setNewData(res.data);
                                });
                            }
                        }
                    });
                    var dom = d.query('table', _this.groupModal.bodyWrapper), scrollEl = d.query('.scroll-el', _this.groupModal.bodyWrapper);
                    groupTable = _this.createTable(dom, scrollEl, response.data, _this.resetCols(response.head.cols));
                }
                else {
                    _this.groupModal.isShow = true;
                }
            });
        };
        /**
         * 用户ui
         * @param iframe
         * @param tableText
         */
        PrivilegeQuery.prototype.userUi = function (iframe, tableText) {
            var _this = this;
            if (!this.userModal) {
                this.userModal = new Modal_1.Modal({
                    body: iframe,
                    className: 'priv-modal',
                    container: this.para.dom,
                    footer: {
                        rightPanel: this.clearBtn(tableText, function () {
                            _this.userId = [];
                            _this.userModal.isShow = false;
                        })
                    }
                });
                iframe.onload = function () {
                    var contactIframe = _this.userModal.body, iframeBody = contactIframe.contentDocument.body, scrollDom = iframeBody.querySelector('#list .mui-scroll'), list = iframeBody.querySelector('#list'), div = document.createElement('div'), htmlDom = G.d.create("<style>header a.sys-action-back{display: none} .ulOverFlow{ height:424px; overflow-y : auto} #list{height: 100vh}</style>");
                    contactIframe.contentDocument.head.appendChild(htmlDom);
                    scrollDom.classList.add('ulOverFlow');
                    iframeBody.querySelector('header .mui-title').innerHTML = '用户名';
                };
            }
            else {
                this.userModal.isShow = true;
            }
            d.once(window, 'selectContact', function (e) {
                if (_this.userModal) {
                    _this.userModal.isShow = false;
                }
                var str = '';
                _this.userId = [];
                e.detail.data.forEach(function (obj) {
                    str += obj.USERID + ';';
                    _this.userId.push(obj.USERID);
                });
                tableText.set(str);
            });
        };
        /**
         * 表格cols构造
         * @param cols
         * @returns {Array}
         */
        PrivilegeQuery.prototype.resetCols = function (cols) {
            var data = [];
            cols.forEach(function (col) {
                data.push({
                    name: col.name,
                    title: col.caption
                });
            });
            return data;
        };
        PrivilegeQuery.prototype.initTpl = function () {
            return d.create("<div class=\"priv-query\">\n        <div class=\"priv-condition\">\n            <div class=\"width-50\">\u8282\u70B9\uFF1A</div>\n            <div class=\"priv-node\"></div>\n            <div class=\"priv-user\"></div>\n            <div class=\"priv-user-drop\"></div> \n            <div class=\"priv-query-btn\"></div>\n        </div>\n        <div class=\"parent-table\"></div>\n        <div class=\"child-table\">\n            <div class=\"oper-priv\"></div>\n            <div class=\"prop-priv\"></div>\n            <div class=\"level-priv\"></div>\n        </div>\n        </div>");
        };
        PrivilegeQuery.prototype.ajaxLoad = function (data, hasLoading) {
            var _this = this;
            if (hasLoading === void 0) { hasLoading = true; }
            if (hasLoading)
                if (!this.loading) {
                    this.loading = new loading_1.Loading({ duration: 30 });
                }
                else {
                    this.loading.show();
                }
            var url = tools.isNotEmpty(this.ajaxUrl) ? this.ajaxUrl + '?deal_type=select' : CONF.ajaxUrl.rmprivsSelect;
            return BwRule_1.BwRule.Ajax.fetch(url, {
                type: 'POST',
                data: JSON.stringify(data),
                // cache: true,
                timeout: 30000,
            }).then(function (_a) {
                var response = _a.response;
                hasLoading && _this.loading.hide();
                return response;
            });
            // Rule.ajax(CONF.siteUrl + '/app_sanfu_retail/v1/rmprivs/privsget/select', {
            //     type: 'Post',
            //     data: JSON.stringify(data),
            //     cache: true,
            //     timeout : 30000,
            //     success : (response) => {
            //         typeof cb === 'function' && cb(response);
            //         hasLoading && this.loading.hide();
            //     }
            // });
        };
        PrivilegeQuery.prototype.childData = function (response) {
            var data = [];
            response.data.forEach(function (obj) {
                data.push({
                    text: obj.CAPTION_EXPLAIN,
                    icon: obj.ICON_NAME,
                    content: {
                        nodeId: obj.NODE_ID,
                        title: obj.CAPTION_EXPLAIN
                    },
                    // isAccordion : false,
                    isLeaf: obj.IS_END === 1,
                });
            });
            return data;
        };
        /**
         * 节点ui
         * @param container
         */
        PrivilegeQuery.prototype.nodeSuccess = function (container) {
            var _this = this;
            if (!this.spinner) {
                this.spinner = new spinner_1.Spinner({
                    el: container,
                    type: spinner_1.Spinner.SHOW_TYPE.cover,
                });
            }
            this.spinner.show();
            this.tree = new Tree_1.Tree({
                container: container,
                isAccordion: false,
                expand: true,
                isLeaf: false,
                multiSelect: true,
                toggleSelect: true,
                ajax: function (node) {
                    _this.spinner.hide();
                    return _this.ajaxLoad([{
                            select_type: 'getnextnodeinfo',
                            current_node_id: node.content && node.content.nodeId
                        }], false).then(function (response) {
                        return _this.childData(response);
                    });
                    // return <Promise<ITreePara>>this.childData(this.ajaxLoad([{
                    //     select_type : 'getnextnodeinfo',
                    //     current_node_id : node.content && node.content.nodeId}],
                    // ));
                }
            });
        };
        return PrivilegeQuery;
    }(basicPage_1.default));
    exports.PrivilegeQuery = PrivilegeQuery;
});

define("PrivilegeDefault", ["require", "exports", "PrivilegeDP", "Modal"], function (require, exports, privilegeDP_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var PrivilegeDefault = /** @class */ (function (_super) {
        __extends(PrivilegeDefault, _super);
        function PrivilegeDefault(dom, url) {
            var _this = _super.call(this, dom, url) || this;
            _this.dom = dom;
            _this.pageType = 'DEFAULT';
            _this.urls = [
                _this.confUrl('/col/reset', url),
                _this.confUrl('/col/save', url),
                _this.confUrl('/col/del', url),
                _this.confUrl('/level/reset', url),
                _this.confUrl('/level/save', url),
                _this.confUrl('/level/del', url)
            ];
            _this.generate();
            return _this;
        }
        PrivilegeDefault.prototype.generate = function () {
            var privGroup = d.create('<div class="priv-group"></div>'), confWrapper = d.create("<div class=\"priv-wrapper\"></div>");
            this.dom.appendChild(privGroup);
            this.dom.appendChild(confWrapper);
            this.generatePrivGroup(privGroup);
            this.confSearchDom = d.create("<div class=\"conf-search\"></div>");
            this.confSaveDom = d.create("<div class=\"conf-save\"></div>");
            this.confContentDom = d.create("<div class=\"conf-content\"></div>");
            confWrapper.appendChild(this.confSearchDom);
            confWrapper.appendChild(this.confSaveDom);
            confWrapper.appendChild(this.confContentDom);
            //构建保存模块
            this.generateSave();
            //默认构建属性搜索框
            this.generateFieldSearch();
            //构建属性、层级切换菜单模块
            this.generatePLSwitchMenu();
        };
        /**
         * 构造属性/层级菜单
         * */
        PrivilegeDefault.prototype.generatePLSwitchMenu = function () {
            var _this = this;
            var navContent = d.create('<div class="nav-content"></div>'), plSwitchDom = d.create("<div class=\"switch-menu\"></div>"), plContent = d.create("<div class=\"pl-content\"></div>"), fieldLi = d.create("<li class=\"li-select\"><i class=\"iconfont icon-tongji\"></i>\u5C5E\u6027</li>"), levelLi = d.create("<li><i class=\"iconfont icon-function\"></i>\u5C42\u7EA7</li>");
            plSwitchDom.appendChild(fieldLi);
            plSwitchDom.appendChild(levelLi);
            navContent.appendChild(plSwitchDom);
            this.confContentDom.appendChild(navContent);
            this.confContentDom.appendChild(plContent);
            this.generateConfSavaSelectBox(navContent);
            //【属性/层级】切换，默认显示为属性模块
            if (!this.fieldContentDom) {
                this.fieldContentDom = d.create("<div class=\"field-content\"></div>");
                plContent.appendChild(this.fieldContentDom);
                this.switchType = 'FIELD';
            }
            this.generateFieldContent();
            d.on(fieldLi, 'click', function () {
                levelLi.classList.remove('li-select');
                fieldLi.classList.add('li-select');
                if (_this.levelContentDom) {
                    _this.levelContentDom.style.display = 'none';
                }
                _this.fieldContentDom.style.display = 'block';
                _this.switchType = 'FIELD';
                _this.generateFieldContent();
            });
            d.on(levelLi, 'click', function () {
                fieldLi.classList.remove('li-select');
                levelLi.classList.add('li-select');
                if (!_this.levelContentDom) {
                    _this.levelContentDom = d.create("<div class=\"level-content\"></div>");
                    plContent.appendChild(_this.levelContentDom);
                }
                _this.generateLGContent();
                _this.fieldContentDom.style.display = 'none';
                _this.levelContentDom.style.display = 'block';
                _this.switchType = 'LEVEL';
            });
        };
        PrivilegeDefault.prototype.judgeControl = function () {
            this.generateLGContent();
        };
        PrivilegeDefault.prototype.saveBtnCb = function () {
            var self = this;
            var privGroupData = self.privGroupTable.rowSelectDataGet(), privGroupLen = privGroupData.length, fieldRowData = self.fieldTable.rowSelectDataGet();
            //单选权限组
            if (privGroupLen === 1 && self.privGroudId) {
                var delData_1 = [], addData_1 = [];
                //属性模块
                if (self.switchType === 'FIELD') {
                    if (fieldRowData.length < 1) {
                        Modal_1.Modal.alert('请选择要新增/删除的字段行');
                        return;
                    }
                    else {
                        fieldRowData.forEach(function (d) {
                            if (d['IS_CHECKED'] && d['FIELD_NAME']) {
                                delData_1.push(d['FIELD_NAME']);
                            }
                            else if (d['FIELD_NAME']) {
                                addData_1.push(d['FIELD_NAME']);
                            }
                        });
                    }
                    //删除属性行
                    if (delData_1[0]) {
                        var json = [{
                                privGroupId: self.privGroudId,
                                operType: '1',
                                operId: '1',
                                fieldName: delData_1.join(',')
                            }];
                        self.saveResponse(self.urls[2], json, !addData_1[0]);
                    }
                    //添加属性行
                    if (addData_1[0]) {
                        var json = [{
                                privGroupId: self.privGroudId,
                                operType: '1',
                                operId: '1',
                                fieldName: addData_1.join(',')
                            }];
                        self.saveResponse(self.urls[1], json);
                    }
                }
                //层级模块
                else if (self.switchType === 'LEVEL') {
                    if (!self.delLevelData[0] && !self.resLevelData[0]) {
                        Modal_1.Modal.alert('请对层级权限进行配置！');
                        return;
                    }
                    if (self.delLevelData[0]) {
                        var join_1 = [];
                        console.log(self.delLevelData, 'delLevelData');
                        self.delLevelData.forEach(function (delData) {
                            var obj = {
                                privGroupId: self.privGroudId,
                                operType: '1',
                                operId: '1',
                                levelId: delData['LEVEL_ID'],
                                insType: delData['INS_TYPE'],
                                insValue: delData['INS_VALUE']
                            };
                            join_1.push(obj);
                        });
                        var isAlert = !self.resLevelData[0];
                        self.saveResponse(self.urls[5], join_1, isAlert);
                    }
                    if (self.resLevelData[0]) {
                        var join_2 = [];
                        console.log(self.resLevelData, 'resLevelData');
                        self.resLevelData.forEach(function (resData) {
                            var obj = {
                                privGroupId: self.privGroudId,
                                operType: '1',
                                operId: '1',
                                levelId: resData['LEVEL_ID'],
                                insType: resData['INS_TYPE'],
                                insValue: resData['INS_VALUE'],
                            };
                            join_2.push(obj);
                        });
                        self.saveResponse(self.urls[4], join_2);
                    }
                }
            }
            //多选权限组
            else if (privGroupLen > 1 && self.confSaveSelectBox) {
                var privIds_1 = [];
                privGroupData.forEach(function (priv) {
                    privIds_1.push(priv['PRIV_GROUP_ID']);
                });
                //属性模块
                if (self.switchType === 'FIELD') {
                    var json = [], fieldNames_1 = [];
                    if (fieldRowData.length < 1) {
                        Modal_1.Modal.alert('请选择要新增/删除的字段行');
                        return;
                    }
                    fieldRowData.forEach(function (d) {
                        fieldNames_1.push(d['FIELD_NAME']);
                    });
                    json = [{
                            privGroupId: privIds_1.join(','),
                            operType: '1',
                            operId: '1',
                            fieldName: fieldNames_1.join(',')
                        }];
                    self.saveResponse(self.urls[self.confSaveSelectBox.get()[0]], json);
                }
                //层级模块
                else if (self.switchType === 'LEVEL') {
                    if (!self.delLevelData[0] && !self.resLevelData[0]) {
                        Modal_1.Modal.alert('请对层级权限进行配置！');
                        return;
                    }
                    var json_1 = [];
                    if (self.delLevelData[0]) {
                        self.delLevelData.forEach(function (delData) {
                            var obj = {
                                privGroupId: privIds_1.join(','),
                                operType: '1',
                                operId: '1',
                                levelId: delData['LEVEL_ID'],
                                insType: delData['INS_TYPE'],
                                insValue: delData['INS_VALUE']
                            };
                            json_1.push(obj);
                        });
                    }
                    if (self.resLevelData[0]) {
                        self.resLevelData.forEach(function (resData) {
                            var obj = {
                                privGroupId: privIds_1.join(','),
                                operType: '1',
                                operId: '1',
                                levelId: resData['LEVEL_ID'],
                                insType: resData['INS_TYPE'],
                                insValue: resData['INS_VALUE']
                            };
                            json_1.push(obj);
                        });
                    }
                    self.saveResponse(self.urls[self.confSaveSelectBox.get()[0] + 3], json_1);
                }
            }
            else {
                Modal_1.Modal.alert('请选择权限组！');
            }
        };
        return PrivilegeDefault;
    }(privilegeDP_1.PrivilegeDP));
    exports.PrivilegeDefault = PrivilegeDefault;
});

define("PrivilegePersonal", ["require", "exports", "PrivilegeDP", "TableModulePc", "SearchInput", "Button", "Modal", "Tree", "BwRule"], function (require, exports, privilegeDP_1, TableModulePc, searchInput_1, Button_1, Modal_1, Tree_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var PrivilegePersonal = /** @class */ (function (_super) {
        __extends(PrivilegePersonal, _super);
        function PrivilegePersonal(dom, url, controllUrl) {
            var _this = _super.call(this, dom, url) || this;
            _this.dom = dom;
            _this.controllUrl = controllUrl;
            _this.pageType = 'PERSONAL';
            _this.urls = [
                _this.confUrl('function/reset', url),
                _this.confUrl('function/save', url),
                _this.confUrl('function/del', url),
                _this.confUrl('col/reset', url),
                _this.confUrl('col/save', url),
                _this.confUrl('col/del', url),
                _this.confUrl('level/reset', url),
                _this.confUrl('level/save', url),
                _this.confUrl('level/del', url)
            ];
            _this.generate();
            return _this;
        }
        PrivilegePersonal.prototype.generate = function () {
            var infoPlatEl = d.create("<div class=\"info-platform\"></div>"), privGroupEl = d.create('<div class="priv-group"></div>'), confWrapper = d.create("<div class=\"priv-wrapper\"></div>"), div = d.create("<div class=\"control-area\"></div>"), tip = d.create("<div class=\"priv-tip\">\u8BF7\u5148\u9009\u4E2D\u4E00\u4E2A\u8282\u70B9</div>");
            this.dom.appendChild(infoPlatEl);
            this.dom.appendChild(div);
            div.appendChild(tip);
            div.appendChild(privGroupEl);
            div.appendChild(confWrapper);
            this.generateInfoPlatform(infoPlatEl);
            this.generatePrivGroup(privGroupEl);
            this.confSearchDom = d.create("<div class=\"conf-search\"></div>");
            this.confSaveDom = d.create("<div class=\"conf-save\"></div>");
            this.confContentDom = d.create("<div class=\"conf-content\"></div>");
            confWrapper.appendChild(this.confSearchDom);
            confWrapper.appendChild(this.confSaveDom);
            confWrapper.appendChild(this.confContentDom);
            //构建保存模块
            this.generateSave();
            //默认构建功能搜索框
            this.generateFunctionSearch();
            //构建属性、层级切换菜单模块
            this.generatePLSwitchMenu();
        };
        /**
         * 构造功能/属性/层级菜单
         * */
        PrivilegePersonal.prototype.generatePLSwitchMenu = function () {
            var _this = this;
            var navContent = d.create('<div class="nav-content"></div>'), plSwitchDom = d.create("<div class=\"switch-menu\"></div>"), plContent = d.create("<div class=\"pl-content\"></div>"), fieldLi = d.create("<li><i class=\"iconfont icon-tongji\"></i>\u5C5E\u6027</li>"), levelLi = d.create("<li><i class=\"iconfont icon-function\"></i>\u5C42\u7EA7</li>");
            this.functionLi = d.create("<li class=\"li-select\"><i class=\"iconfont icon-tongji\"></i>\u529F\u80FD</li>");
            plSwitchDom.appendChild(this.functionLi);
            plSwitchDom.appendChild(fieldLi);
            plSwitchDom.appendChild(levelLi);
            navContent.appendChild(plSwitchDom);
            this.confContentDom.appendChild(navContent);
            this.confContentDom.appendChild(plContent);
            this.generateConfSavaSelectBox(navContent);
            //【功能/属性/层级】切换，默认显示为功能模块
            if (!this.operateContentDom) {
                this.operateContentDom = d.create("<div class=\"operate-content\"></div>");
                plContent.appendChild(this.operateContentDom);
                this.generateOperateContent();
                this.lastSwitchLi = this.functionLi;
                this.switchType = 'FUNCTION';
            }
            d.on(this.functionLi, 'click', function () {
                levelLi.classList.remove('li-select');
                fieldLi.classList.remove('li-select');
                _this.functionLi.classList.add('li-select');
                if (_this.levelContentDom) {
                    _this.levelContentDom.style.display = 'none';
                }
                _this.operateContentDom.style.display = 'block';
                if (_this.fieldContentDom) {
                    _this.fieldContentDom.style.display = 'none';
                    _this.fieldSearchDom.style.display = 'none';
                }
                _this.functionSearchDom.style.display = 'block';
                _this.switchType = 'FUNCTION';
                _this.lastSwitchLi = _this.functionLi;
                if (_this.operateContentDom && _this.lastOperTable && _this.operType) {
                    var container = d.query('.operate-conf', _this.operateContentDom), index = _this.operTypeArr.indexOf(_this.operType), operate = _this.operateListString[index];
                    if (container) {
                        _this.getActionType(container, operate.type, operate.name, operate.title, _this.operType);
                    }
                }
            });
            d.on(fieldLi, 'click', function () {
                levelLi.classList.remove('li-select');
                _this.functionLi.classList.remove('li-select');
                fieldLi.classList.add('li-select');
                if (!_this.fieldContentDom) {
                    _this.fieldContentDom = d.create("<div class=\"field-content\"></div>");
                    plContent.appendChild(_this.fieldContentDom);
                }
                _this.generateFieldContent();
                if (_this.levelContentDom) {
                    _this.levelContentDom.style.display = 'none';
                }
                _this.operateContentDom.style.display = 'none';
                _this.fieldContentDom.style.display = 'block';
                if (!_this.fieldSearchDom) {
                    _this.generateFieldSearch();
                }
                _this.functionSearchDom.style.display = 'none';
                _this.fieldSearchDom.style.display = 'block';
                _this.switchType = 'FIELD';
                _this.lastSwitchLi = fieldLi;
            });
            d.on(levelLi, 'click', function () {
                fieldLi.classList.remove('li-select');
                _this.functionLi.classList.remove('li-select');
                levelLi.classList.add('li-select');
                if (!_this.levelContentDom) {
                    _this.levelContentDom = d.create("<div class=\"level-content\"></div>");
                    plContent.appendChild(_this.levelContentDom);
                }
                _this.generateLGContent();
                if (_this.fieldContentDom) {
                    _this.fieldContentDom.style.display = 'none';
                }
                _this.operateContentDom.style.display = 'none';
                _this.levelContentDom.style.display = 'block';
                _this.switchType = 'LEVEL';
                _this.lastSwitchLi = levelLi;
            });
        };
        /**
         * 生成功能模块对应的各个操作
         * */
        PrivilegePersonal.prototype.generateOperateContent = function () {
            var _this = this;
            var operateMenuDom = d.create("<ul class=\"operate-menu select-box-small\"></ul>"), operateConfDom = d.create("<div class=\"operate-conf select-box-small\"></div>");
            this.operateContentDom.appendChild(operateMenuDom);
            this.operateContentDom.appendChild(operateConfDom);
            this.operateListString.forEach(function (obj) {
                var str = obj.typeName, liDom = d.create("<li class=\"menu-item\">" + str + "</li>");
                operateMenuDom.appendChild(liDom);
                d.on(liDom, 'click', function () {
                    if (_this.lastLi && _this.lastLi !== liDom) {
                        _this.lastLi.classList.remove('li-select');
                    }
                    _this.lastLi = liDom;
                    liDom.classList.add('li-select');
                    switch (str) {
                        case '标准操作':
                            _this.getActionType(operateConfDom, 'STANDARD', 'OPER_ID', 'OPER_NAME', 1);
                            break;
                        case '数据操作':
                            _this.getActionType(operateConfDom, 'ACTION', 'ELEMENT_ID', 'CAPTION', 2);
                            break;
                        case '全局操作':
                            _this.getActionType(operateConfDom, 'HANDLE', 'ELEMENT_ID', 'CAPTION', 3);
                            break;
                        case '关联操作':
                            _this.getActionType(operateConfDom, 'ASSOCIATE', 'ELEMENT_ID', 'CAPTION', 4);
                            break;
                        case '操作组':
                            _this.getActionType(operateConfDom, 'OPERGROUP', 'OPER_GROUP_ID', 'OPER_GROUP_NAME', 0);
                            break;
                    }
                });
            });
            //默认加载标准操作
            if (operateMenuDom && operateMenuDom.firstChild) {
                operateMenuDom.firstChild.classList.add('li-select');
                this.standardLi = operateMenuDom.firstChild;
                this.lastLi = operateMenuDom.firstChild;
                this.getActionType(operateConfDom, 'STANDARD', 'OPER_ID', 'OPER_NAME', 1);
            }
        };
        //获取动作组数据
        PrivilegePersonal.prototype.getActionType = function (container, type, name, title, operType, user_input) {
            if (user_input === void 0) { user_input = ''; }
            container.innerHTML = '';
            var tempTable = d.create('<table><tbody></tbody></table>'), ajaxData = [{
                    select_type: 'getoperidbyuserinput',
                    input_type: type,
                    user_input: user_input,
                    node_id: this.infoPlatSelected.length === 1 ? this.infoPlatSelected[0] : '',
                    priv_group_id: this.privGroudId
                }], data = [], self = this;
            container.appendChild(tempTable);
            // Rule.ajax(this.url, {
            //     type: 'Post',
            //     data: JSON.stringify(ajaxData),
            //     success(response) {
            //         let bodylist = response && response.body && response.body.bodyList && response.body.bodyList['0'],
            //             checkedArr = [];
            //         if (bodylist && bodylist.meta) {
            //             let index = bodylist.meta.indexOf('IS_CHECKED');
            //             bodylist.dataList[0] && bodylist.dataList.forEach((d, i) => {
            //                 let obj = {};
            //                 bodylist.meta[0] && bodylist.meta.forEach((m, j) => {
            //                     obj[m] = d[j];
            //                 });
            //                 data.push(obj);
            //                 if (index > -1 && d[index]) {
            //                     checkedArr.push(i);
            //                 }
            //             });
            //         }
            //         //如果未勾选信息平台节点时，或未勾选权限组时，表格数据为空。
            //         if (self.infoPlatSelected.length < 1 || !self.privGroupTable || self.privGroupTable.rowSelectDataGet().length < 1) {
            //             data = [];
            //         }
            //         let tableConf: TableModulePara = {
            //             cols: [{
            //                 title: "操作名称",
            //                 name: title
            //             }, {
            //                 title: "操作编号",
            //                 name: name
            //             }],
            //             multPage: 2,//2前台分页
            //             isSub: true,
            //             data: data
            //         };
            //
            //         switch (type) {
            //             case 'STANDARD':
            //                 createTable(self.standardTable);
            //                 break;
            //             case 'ACTION':
            //                 createTable(self.actiondTable);
            //                 break;
            //             case 'HANDLE':
            //                 createTable(self.handleTable);
            //                 break;
            //             case 'ASSOCIATE':
            //                 createTable(self.associateTable);
            //                 break;
            //             case 'OPERGROUP':
            //                 createTable(self.opergroupTable);
            //                 break;
            //         }
            //         function createTable(action) {
            //             action = new TableModulePc({
            //                 tableEl: tempTable,
            //                 scrollEl: container,
            //                 fixTop: 0
            //             }, tableConf).table;
            //             if (self.lastOperTable && self.lastOperTable !== action) {
            //                 self.lastOperTable.wrapperGet().style.display = 'none';
            //             }
            //             self.lastOperTable = action;
            //
            //             //对权限回显出的数据（IS_CHECK为真）做高亮显示
            //             self.privEcho(response, tempTable);
            //             action.on('render', () => {
            //                 self.privEcho(response, tempTable);
            //             });
            //         }
            //
            //         self.operType = operType;
            //     }
            // });
            BwRule_1.BwRule.Ajax.fetch(this.url, {
                type: 'Post',
                data: JSON.stringify(ajaxData),
            }).then(function (_a) {
                var response = _a.response;
                var bodylist = response && response.body && response.body.bodyList && response.body.bodyList['0'], checkedArr = [];
                if (bodylist && bodylist.meta) {
                    var index_1 = bodylist.meta.indexOf('IS_CHECKED');
                    bodylist.dataList[0] && bodylist.dataList.forEach(function (d, i) {
                        var obj = {};
                        bodylist.meta[0] && bodylist.meta.forEach(function (m, j) {
                            obj[m] = d[j];
                        });
                        data.push(obj);
                        if (index_1 > -1 && d[index_1]) {
                            checkedArr.push(i);
                        }
                    });
                }
                //如果未勾选信息平台节点时，或未勾选权限组时，表格数据为空。
                if (self.infoPlatSelected.length < 1 || !self.privGroupTable || self.privGroupTable.rowSelectDataGet().length < 1) {
                    data = [];
                }
                var tableConf = {
                    cols: [{
                            title: "操作名称",
                            name: title
                        }, {
                            title: "操作编号",
                            name: name
                        }],
                    multPage: 2,
                    isSub: true,
                    data: data
                };
                switch (type) {
                    case 'STANDARD':
                        createTable(self.standardTable);
                        break;
                    case 'ACTION':
                        createTable(self.actiondTable);
                        break;
                    case 'HANDLE':
                        createTable(self.handleTable);
                        break;
                    case 'ASSOCIATE':
                        createTable(self.associateTable);
                        break;
                    case 'OPERGROUP':
                        createTable(self.opergroupTable);
                        break;
                }
                function createTable(action) {
                    action = new TableModulePc({
                        tableEl: tempTable,
                        scrollEl: container,
                        fixTop: 0
                    }, tableConf).table;
                    if (self.lastOperTable && self.lastOperTable !== action) {
                        self.lastOperTable.wrapperGet().style.display = 'none';
                    }
                    self.lastOperTable = action;
                    //对权限回显出的数据（IS_CHECK为真）做高亮显示
                    self.privEcho(response, tempTable);
                    action.on('render', function () {
                        self.privEcho(response, tempTable);
                    });
                }
                self.operType = operType;
            });
        };
        //构造功能搜索框控件
        PrivilegePersonal.prototype.generateFunctionSearch = function () {
            var self = this;
            this.functionSearchDom = d.create("<div class=\"function-search\"></div>");
            this.confSearchDom.appendChild(this.functionSearchDom);
            this.functionSearchInput = new searchInput_1.SearchInput({
                container: self.functionSearchDom,
                className: 'w',
                placeholder: '搜索...',
                ajax: {
                    url: self.url,
                    fun: function (url, data, recentValue, cb) {
                        var container = d.query('.operate-conf', self.operateContentDom), index = self.operTypeArr.indexOf(self.operType), operate = self.operateListString[index];
                        if (container) {
                            self.getActionType(container, operate.type, operate.name, operate.title, self.operType, recentValue);
                        }
                    }
                }
            });
        };
        /**
         * 构建信息平台模块
         * */
        PrivilegePersonal.prototype.generateInfoPlatform = function (infoPlatEl) {
            var _this = this;
            if (tools.isEmpty(infoPlatEl)) {
                return;
            }
            this.infoPFSearchDom = d.create("<div class=\"info-platform-search\"></div>");
            var infoPFContent = d.create("<div class=\"info-platform-content\"></div>");
            infoPlatEl.appendChild(this.infoPFSearchDom);
            infoPlatEl.appendChild(infoPFContent);
            //构造信息平台搜索框组件
            var self = this;
            this.infoPFSearchInput = new searchInput_1.SearchInput({
                container: this.infoPFSearchDom,
                className: 'w',
                placeholder: '搜索...',
                ajax: {
                    url: self.url,
                    fun: function (url, data, recentValue, callback) {
                        if (recentValue !== '')
                            _this.infoPlatFormInit(infoPFContent, function (node) {
                                return _this.ajaxLoad(self.url, [{
                                        select_type: 'getnodeinfobyuserinput',
                                        user_input: recentValue
                                    }]).then(function (res) {
                                    return _this.childData(res, true);
                                });
                            });
                        else
                            loadTree(infoPFContent);
                    }
                }
            });
            loadTree(infoPFContent);
            function loadTree(dom) {
                self.infoPlatFormInit(dom, function (node) {
                    return self.ajaxLoad(self.url, [{
                            select_type: 'getnextnodeinfo',
                            current_node_id: node.content && node.content.nodeId
                        }]).then(function (res) {
                        return self.childData(res);
                    });
                });
            }
        };
        /**
         * 树children构造
         * @param response
         * @param isLeaf
         * @returns {Array}
         */
        PrivilegePersonal.prototype.childData = function (response, isLeaf) {
            if (isLeaf === void 0) { isLeaf = false; }
            var data = [];
            response.data.forEach(function (obj) {
                data.push({
                    text: obj.CAPTION_EXPLAIN,
                    icon: obj.ICON_NAME,
                    content: {
                        nodeId: obj.NODE_ID,
                        title: obj.CAPTION_EXPLAIN
                    },
                    isAccordion: true,
                    isLeaf: isLeaf === true ? isLeaf : obj.IS_END === 1,
                });
            });
            return data;
        };
        /**
         * 信息平台
         * @param container
         * @param callback
         */
        PrivilegePersonal.prototype.infoPlatFormInit = function (container, callback) {
            var _this = this;
            if (this.tree) {
                this.tree.destroy();
            }
            this.tree = new Tree_1.Tree({
                container: container,
                isAccordion: true,
                expand: true,
                isLeaf: false,
                multiSelect: true,
                toggleSelect: true,
                ajax: function (node) {
                    return callback(node);
                },
            });
            this.tree.onSelect = function (node) {
                _this.judgeControl();
            };
        };
        /**
         * 是否受控
         */
        PrivilegePersonal.prototype.judgeControl = function (cb) {
            var _this = this;
            var treeSelect = this.tree.getSelectedNodes(), self = this;
            var tipDom = d.query('.priv-tip', this.dom);
            this.infoPlatSelected = treeSelect ? treeSelect.map(function (node) { return node.content.nodeId; }) : [];
            if (treeSelect && treeSelect.length === 1) {
                this.ajaxLoad(this.url, [{
                        select_type: 'getNodeIdIsPrivCtl',
                        node_id: this.infoPlatSelected.join(',')
                    }], false).then(function (r) {
                    if (treeSelect && treeSelect[0]) {
                        if (r.body.bodyList[0]) {
                            control(tipDom);
                        }
                        else {
                            tipDom.classList.remove('hide');
                            tipDom.innerHTML = '该节点不可受控！';
                            new Button_1.Button({
                                content: '添加受控',
                                container: tipDom,
                                type: 'primary',
                                onClick: function (e) {
                                    var url = tools.isNotEmpty(_this.controllUrl) ? _this.controllUrl : _this.url;
                                    _this.ajaxLoad(url, [{
                                            node_id: _this.infoPlatSelected.join(',')
                                        }], false).then(function (res) {
                                        Modal_1.Modal.alert(res.msg);
                                        control(tipDom);
                                    });
                                }
                            });
                        }
                    }
                });
            }
            else {
                control(tipDom);
            }
            if (!treeSelect) {
                tipDom.innerHTML = '请先选中一个节点';
                tipDom.classList.remove('hide');
            }
            function control(tipDom) {
                tipDom.classList.add('hide');
                self.initMultiPage();
                if (self.switchType === 'FIELD') {
                    self.generateFieldContent();
                }
                else if (self.operateContentDom && self.lastOperTable && self.operType && self.switchType === 'FUNCTION') {
                    var container = d.query('.operate-conf', self.operateContentDom), index = self.operTypeArr.indexOf(self.operType), operate = self.operateListString[index];
                    self.getActionType(container, operate.type, operate.name, operate.title, self.operType);
                }
                else if (self.switchType === 'LEVEL' && self.levelContentDom) {
                    self.generateLGContent();
                }
            }
        };
        /**
         * 多选节点时，仅显示功能模块的标准操作
         * */
        PrivilegePersonal.prototype.initMultiPage = function () {
            if (this.infoPlatSelected.length > 1) {
                this.dom.classList.add('hide-field-function');
                this.lastSwitchLi.classList.remove('li-select');
                this.functionLi.classList.add('li-select');
                if (this.levelContentDom) {
                    this.levelContentDom.style.display = 'none';
                }
                if (this.fieldContentDom) {
                    this.fieldSearchDom.style.display = 'none';
                    this.fieldContentDom.style.display = 'none';
                }
                this.operateContentDom.style.display = 'block';
                this.functionSearchDom.style.display = 'block';
                this.switchType = 'FUNCTION';
                if (this.lastOperTable && this.standardTable && this.lastOperTable !== this.standardTable) {
                    this.lastOperTable.wrapperGet().style.display = 'none';
                    this.standardTable.wrapperGet().style.display = 'block';
                    this.lastOperTable = this.standardTable;
                    this.lastLi.classList.remove('li-select');
                    this.standardLi.classList.add('li-select');
                    this.operType = 1;
                }
            }
            else {
                this.dom.classList.remove('hide-field-function');
            }
        };
        PrivilegePersonal.prototype.saveBtnCb = function () {
            var self = this;
            var privGroupData = self.privGroupTable.rowSelectDataGet(), privGroupLen = privGroupData.length, fieldRowData = self.fieldTable && self.fieldTable.rowSelectDataGet();
            //单选节点
            if (this.infoPlatSelected.length === 1) {
                //单选权限组
                if (privGroupLen === 1 && self.privGroudId) {
                    var delData_1 = [], addData_1 = [];
                    //功能模块
                    if (self.switchType === 'FUNCTION') {
                        var resData = self.lastOperTable && self.lastOperTable.rowSelectDataGet();
                        if (!resData || !resData[0]) {
                            Modal_1.Modal.alert('请选择要配置的操作行！');
                            return;
                        }
                        resData.forEach(function (res) {
                            var oper_name = Object.keys(res)[0], operId = res[oper_name];
                            if (oper_name && operId) {
                                var obj = {
                                    privGroupId: self.privGroudId,
                                    nodeId: self.infoPlatSelected[0],
                                    operType: self.operType,
                                    operId: operId,
                                };
                                if (res['IS_CHECKED']) {
                                    delData_1.push(obj);
                                }
                                else {
                                    addData_1.push(obj);
                                }
                            }
                        });
                        if (delData_1[0] && addData_1[0]) {
                        }
                        delData_1[0] && self.saveResponse(self.urls[2], delData_1, !addData_1[0]);
                        addData_1[0] && self.saveResponse(self.urls[1], addData_1);
                    }
                    //属性模块
                    else if (self.switchType === 'FIELD') {
                        if (fieldRowData.length < 1) {
                            Modal_1.Modal.alert('请选择要新增/删除的字段行');
                            return;
                        }
                        else {
                            fieldRowData.forEach(function (d) {
                                if (d['IS_CHECKED'] && d['FIELD_NAME']) {
                                    delData_1.push(d['FIELD_NAME']);
                                }
                                else if (d['FIELD_NAME']) {
                                    addData_1.push(d['FIELD_NAME']);
                                }
                            });
                        }
                        //删除属性行
                        delData_1[0] && addRow(self.urls[5], delData_1, !addData_1[0]);
                        //添加属性行
                        addData_1[0] && addRow(self.urls[4], addData_1);
                    }
                    //层级模块
                    else if (self.switchType === 'LEVEL') {
                        if (!self.delLevelData[0] && !self.resLevelData[0]) {
                            Modal_1.Modal.alert('请对层级权限进行配置！');
                            return;
                        }
                        if (self.delLevelData[0]) {
                            self.saveResponse(self.urls[8], mergeData(self.delLevelData, self.privGroudId), !addData_1[0]);
                        }
                        if (self.resLevelData[0]) {
                            self.saveResponse(self.urls[7], mergeData(self.resLevelData, self.privGroudId));
                        }
                    }
                }
                //多选权限组
                else if (privGroupLen > 1 && self.confSaveSelectBox) {
                    var privIds_1 = [];
                    privGroupData.forEach(function (priv) {
                        privIds_1.push(priv['PRIV_GROUP_ID']);
                    });
                    //功能模块
                    if (self.switchType === 'FUNCTION') {
                        var resData = self.lastOperTable && self.lastOperTable.rowSelectDataGet(), json_1 = [];
                        if (!resData || !resData[0]) {
                            Modal_1.Modal.alert('请选择要配置的操作行！');
                            return;
                        }
                        resData.forEach(function (res) {
                            var oper_name = Object.keys(res)[0], operId = res[oper_name];
                            if (oper_name && operId) {
                                var obj = {
                                    privGroupId: privIds_1.join(','),
                                    nodeId: self.infoPlatSelected[0],
                                    operType: self.operType,
                                    operId: operId,
                                };
                                json_1.push(obj);
                            }
                        });
                        self.saveResponse(self.urls[self.confSaveSelectBox.get()[0]], json_1);
                    }
                    //属性模块
                    else if (self.switchType === 'FIELD') {
                        var json = [], fieldNames_1 = [];
                        if (fieldRowData.length < 1) {
                            Modal_1.Modal.alert('请选择要新增/删除的字段行');
                            return;
                        }
                        fieldRowData.forEach(function (d) {
                            fieldNames_1.push(d['FIELD_NAME']);
                        });
                        json = [{
                                privGroupId: privIds_1.join(','),
                                operType: '1',
                                operId: '1',
                                fieldName: fieldNames_1.join(',')
                            }];
                        self.saveResponse(self.urls[self.confSaveSelectBox.get()[0] + 3], json);
                    }
                    //层级模块
                    else if (self.switchType === 'LEVEL') {
                        if (!self.delLevelData[0] && !self.resLevelData[0]) {
                            Modal_1.Modal.alert('请对层级权限进行配置！');
                            return;
                        }
                        var json = void 0;
                        if (self.delLevelData[0] || self.resLevelData[0]) {
                            json = mergeData(self.delLevelData, privIds_1.join(','));
                        }
                        self.saveResponse(self.urls[self.confSaveSelectBox.get()[0] + 6], json);
                    }
                }
                else {
                    Modal_1.Modal.alert('请选择权限组！');
                }
            }
            //多选节点，仅存在功能模块的操作模块
            else if (this.infoPlatSelected.length > 1) {
                var resData = self.standardTable && self.standardTable.rowSelectDataGet();
                if (!resData || !resData[0]) {
                    Modal_1.Modal.alert('请选择要配置的操作行！');
                    return;
                }
                //单选权限组
                if (privGroupLen === 1 && self.privGroudId) {
                    var delData_2 = [], addData_2 = [];
                    resData.forEach(function (res) {
                        var oper_name = Object.keys(res)[0], operId = res[oper_name];
                        if (oper_name && operId) {
                            var obj = [{
                                    privGroupId: self.privGroudId,
                                    nodeId: self.infoPlatSelected.join(','),
                                    operType: self.operType,
                                    operId: operId,
                                }];
                            if (res['IS_CHECKED']) {
                                delData_2.push(obj);
                            }
                            else {
                                addData_2.push(obj);
                            }
                        }
                    });
                    delData_2[0] && self.saveResponse(self.urls[2], delData_2);
                    addData_2[0] && self.saveResponse(self.urls[1], addData_2);
                }
                //多选权限组
                else if (privGroupLen > 1 && self.confSaveSelectBox) {
                    var privIds_2 = [];
                    privGroupData.forEach(function (priv) {
                        privIds_2.push(priv['PRIV_GROUP_ID']);
                    });
                    // resData.forEach((res) => {
                    //     let oper_name = Object.keys(res)[0],
                    //         operId = res[oper_name];
                    //     if (oper_name && operId) {
                    //         let obj = [{
                    //             privGroupId: privIds.join(','),
                    //             nodeId: self.infoPlatSelected.join(','),
                    //             operType: self.operType,
                    //             operId: operId,
                    //         }];
                    //         json.push(obj);
                    //     }
                    // });
                    self.saveResponse(self.urls[self.confSaveSelectBox.get()[0]], confAjaxData(resData, privIds_2.join(',')));
                }
                else {
                    Modal_1.Modal.alert('请选择权限组！');
                }
            }
            //未选节点
            else {
                Modal_1.Modal.alert('请选择节点！');
            }
            function confAjaxData(resData, privGroupId) {
                var data = [];
                resData.forEach(function (res) {
                    var oper_name = Object.keys(res)[0], operId = res[oper_name];
                    if (oper_name && operId) {
                        var obj = [{
                                privGroupId: privGroupId,
                                nodeId: self.infoPlatSelected.join(','),
                                operType: self.operType,
                                operId: operId,
                            }];
                        data.push(obj);
                    }
                });
                return data;
            }
            function addRow(url, data, isAlert) {
                self.saveResponse(url, [{
                        privGroupId: self.privGroudId,
                        operType: '1',
                        operId: '1',
                        fieldName: data.join(','),
                        nodeId: self.infoPlatSelected[0]
                    }], isAlert);
            }
            function mergeData(data, id) {
                var join = [];
                data.forEach(function (obj) {
                    var d = {
                        privGroupId: id,
                        operType: '1',
                        operId: '1',
                        levelId: obj['LEVEL_ID'],
                        insType: obj['INS_TYPE'],
                        insValue: obj['INS_VALUE'],
                        nodeId: self.infoPlatSelected[0]
                    };
                    join.push(d);
                });
                return join;
            }
        };
        PrivilegePersonal.prototype.ajaxLoad = function (url, data, cache) {
            if (cache === void 0) { cache = true; }
            return BwRule_1.BwRule.Ajax.fetch(url, {
                type: 'Post',
                data: JSON.stringify(data),
                cache: cache
            }).then(function (_a) {
                var response = _a.response;
                return response;
            });
            // Rule.ajax(CONF.siteUrl + url, {
            //     type: 'Post',
            //     data: JSON.stringify(data),
            //     cache: cache,
            //     success: (response) => {
            //
            //     }
            // })
        };
        return PrivilegePersonal;
    }(privilegeDP_1.PrivilegeDP));
    exports.PrivilegePersonal = PrivilegePersonal;
});

define("PrivilegeDP", ["require", "exports", "SearchInput", "TableModulePc", "BwRule", "Button", "SelectBox", "Spinner", "Modal", "Tree"], function (require, exports, searchInput_1, TableModulePc, BwRule_1, Button_1, selectBox_1, spinner_1, Modal_1, Tree_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="PrivilegeDP"/>
    var CONF = BW.CONF;
    var d = G.d;
    var tools = G.tools;
    var PrivilegeDP = /** @class */ (function () {
        function PrivilegeDP(dom, url) {
            this.dom = dom;
            this.operateListString = [{
                    type: 'STANDARD',
                    name: 'OPER_ID',
                    title: 'OPER_NAME',
                    typeName: '标准操作'
                },
                { type: 'ACTION', name: 'ELEMENT_ID', title: 'CAPTION', typeName: '数据操作' },
                { type: 'HANDLE', name: 'ELEMENT_ID', title: 'CAPTION', typeName: '全局操作' },
                { type: 'ASSOCIATE', name: 'ELEMENT_ID', title: 'CAPTION', typeName: '关联操作' },
                { type: 'OPERGROUP', name: 'OPER_GROUP_ID', title: 'OPER_GROUP_NAME', typeName: '操作组' }];
            this.operTypeArr = [1, 2, 3, 4, 0];
            this.privGroudId = ''; //权限组id
            this.infoPlatSelected = []; //信息平台id
            this.localeLevelId = '1'; //存放勾选了地区的哪一层,默认为1(即层级序号)
            this.goodLevelId = '1'; //存放勾选了商品的哪一层,默认为1(即层级序号)
            this.localeCaption = '地区'; //默认为"地区"
            this.goodCaption = '分部'; //默认为"分部"
            /**
             * 获取地区/商品变量
             * */
            this.ajax = new BwRule_1.BwRule.Ajax();
            this.url = tools.isNotEmpty(url) ? url + '?deal_type=select' : CONF.ajaxUrl.rmprivsSelect;
        }
        /**
         * 构造权限组
         * */
        PrivilegeDP.prototype.generatePrivGroup = function (container) {
            if (tools.isEmpty(container)) {
                return;
            }
            this.privGroupSearchDom = d.create("<div class=\"priv-group-search\"></div>");
            var privGroupContent = d.create("<div class=\"priv-group-content\"></div>");
            container.appendChild(this.privGroupSearchDom);
            container.appendChild(privGroupContent);
            var self = this;
            this.privGroupSearchInput = new searchInput_1.SearchInput({
                container: self.privGroupSearchDom,
                className: 'w',
                placeholder: '搜索...',
                ajax: {
                    url: self.url,
                    fun: function (url, data, recentValue, cb) {
                        self.getPrivGroupData(privGroupContent, recentValue);
                    }
                }
            });
            this.getPrivGroupData(privGroupContent, '');
        };
        /**
         * 加载权限组表格数据
         * user_input  ：表示权限组对应搜索框中用户输入的字符串
         * */
        PrivilegeDP.prototype.getPrivGroupData = function (container, user_input) {
            //获取权限组数据,并装载到指定容器中
            var tempTable = d.create('<table><tbody></tbody></table>'), self = this;
            container.innerHTML = '';
            container.appendChild(tempTable);
            var data = [];
            // Rule.ajax(this.url, {
            //     type: 'Post',
            //     defaultCallback: false,
            //     data: `[{ "select_type":"getprivgroupbyuserinput","user_input":"${user_input}"}]`,
            //     cache: true,
            //     success(response) {
            //         let bodylist = response && response.body && response.body.bodyList && response.body.bodyList['0'];
            //         if (bodylist) {
            //             bodylist.forEach((d) => {
            //                 let obj = {
            //                     'PRIV_GROUP_ID': d['privGroupId'],
            //                     'PRIV_GROUP_NAME': d['privGroupName']
            //                 };
            //                 data.push(obj);
            //             });
            //         }
            //         let tableConf: TableModulePara = {
            //             cols: [{
            //                 title: "权限组",
            //                 name: "PRIV_GROUP_NAME"
            //             }, {
            //                 title: "权限编号",
            //                 name: "PRIV_GROUP_ID"
            //             }],
            //             multPage: 2,//2前台分页
            //             isSub: true,
            //             data: data
            //         };
            //         let scrollEl = d.query('.priv-group-content', self.dom);
            //         self.privGroupTable = new TableModulePc({
            //             tableEl: tempTable,
            //             scrollEl: scrollEl,
            //             // fixTop: 160
            //         }, tableConf).table;
            //         self.privGroupTable.on('rowSelect', (e: CustomEvent) => {
            //             let selectData = self.privGroupTable.rowSelectDataGet();
            //             if (selectData.length === 1) {
            //                 self.privGroudId = selectData[0]['PRIV_GROUP_ID'];
            //             } else {
            //                 self.privGroudId = '';
            //             }
            //             if (selectData.length > 1 && self.confSaveSelectBox) {
            //                 self.confSaveSelectBox.show();
            //             } else if (self.confSaveSelectBox) {
            //                 self.confSaveSelectBox.hide();
            //             }
            //             //点击权限组，将更新功能、属性、层级模块的数据
            //             if (self.switchType === 'FIELD') {
            //                 self.generateFieldContent();
            //             }
            //             else if (self.operateContentDom && self.lastOperTable && self.operType && self.switchType === 'FUNCTION') {
            //                 let container = d.query('.operate-conf', self.operateContentDom),
            //                     index = self.operTypeArr.indexOf(self.operType),
            //                     operate = self.operateListString[index];
            //                 self.getActionType(container, operate.type, operate.name, operate.title, self.operType);
            //             }
            //             else if (self.switchType === 'LEVEL' && self.levelContentDom) {
            //                 self.generateLGContent();
            //             }
            //         })
            //     }
            // });
            //
            BwRule_1.BwRule.Ajax.fetch(this.url, {
                type: 'Post',
                defaultCallback: false,
                data: "[{ \"select_type\":\"getprivgroupbyuserinput\",\"user_input\":\"" + user_input + "\"}]",
                cache: true,
            }).then(function (_a) {
                var response = _a.response;
                var bodylist = response && response.body && response.body.bodyList && response.body.bodyList['0'];
                if (bodylist) {
                    bodylist.forEach(function (d) {
                        var obj = {
                            'PRIV_GROUP_ID': d['privGroupId'],
                            'PRIV_GROUP_NAME': d['privGroupName']
                        };
                        data.push(obj);
                    });
                }
                var tableConf = {
                    cols: [{
                            title: "权限组",
                            name: "PRIV_GROUP_NAME"
                        }, {
                            title: "权限编号",
                            name: "PRIV_GROUP_ID"
                        }],
                    multPage: 2,
                    isSub: true,
                    data: data
                };
                var scrollEl = d.query('.priv-group-content', self.dom);
                self.privGroupTable = new TableModulePc({
                    tableEl: tempTable,
                    scrollEl: scrollEl,
                }, tableConf).table;
                self.privGroupTable.on('rowSelect', function (e) {
                    var selectData = self.privGroupTable.rowSelectDataGet();
                    if (selectData.length === 1) {
                        self.privGroudId = selectData[0]['PRIV_GROUP_ID'];
                    }
                    else {
                        self.privGroudId = '';
                    }
                    if (selectData.length > 1 && self.confSaveSelectBox) {
                        self.confSaveSelectBox.show();
                    }
                    else if (self.confSaveSelectBox) {
                        self.confSaveSelectBox.hide();
                    }
                    //点击权限组，将更新功能、属性、层级模块的数据
                    if (self.switchType === 'FIELD') {
                        self.generateFieldContent();
                    }
                    else if (self.operateContentDom && self.lastOperTable && self.operType && self.switchType === 'FUNCTION') {
                        var container_1 = d.query('.operate-conf', self.operateContentDom), index = self.operTypeArr.indexOf(self.operType), operate = self.operateListString[index];
                        self.getActionType(container_1, operate.type, operate.name, operate.title, self.operType);
                    }
                    else if (self.switchType === 'LEVEL' && self.levelContentDom) {
                        self.generateLGContent();
                    }
                });
            });
        };
        /**
         * 获取功能模块对应的操作数据（此处主要是为了点击权限组时调用PrivilegePersonal类中的该方法不报错）
         * */
        PrivilegeDP.prototype.getActionType = function (container, type, name, title, operType) {
        };
        /**
         *  重置授权、增量授权、增量回收功能，即多选权限组时出现的三个按钮
         * */
        PrivilegeDP.prototype.generateConfSavaSelectBox = function (container) {
            var tempDiv = d.create("<div class=\"conf-save-content\"></div>");
            container.appendChild(tempDiv);
            this.confSaveSelectBox = new selectBox_1.SelectBox({
                container: tempDiv,
                select: {
                    multi: false
                },
                data: [{ value: 'reset', text: '重置授权' }, { value: 'grant', text: '增量授权' }, { value: 'back', text: '增量收回' }]
            });
            this.confSaveSelectBox.hide();
        };
        /**
         * 构造属性搜索框
         * */
        PrivilegeDP.prototype.generateFieldSearch = function () {
            var self = this;
            this.fieldSearchDom = d.create("<div class=\"field-search\"></div>");
            this.confSearchDom.appendChild(this.fieldSearchDom);
            this.fieldSearchInput = new searchInput_1.SearchInput({
                container: self.fieldSearchDom,
                className: 'w',
                placeholder: '搜索...',
                ajax: {
                    url: self.url,
                    fun: function (url, data, recentValue, cb) {
                        self.generateFieldContent(recentValue);
                    }
                }
            });
        };
        /**
         * 构造属性内容
         * */
        PrivilegeDP.prototype.generateFieldContent = function (user_input) {
            if (user_input === void 0) { user_input = ''; }
            //获取权限组数据,并装载到指定容器中
            var tempTable = d.create('<table><tbody></tbody></table>'), data = [], self = this;
            if (!this.fieldContentDom) {
                return;
            }
            this.fieldContentDom.innerHTML = '';
            this.fieldContentDom.appendChild(tempTable);
            var ajaxData = [{
                    select_type: 'getpropbyuserinput',
                    user_input: user_input,
                    node_id: self.infoPlatSelected.length === 1 ? self.infoPlatSelected[0] : '',
                    priv_group_id: self.privGroudId
                }];
            // Rule.ajax(this.url, {
            //     type: 'Post',
            //     data: JSON.stringify(ajaxData),
            //     success(response) {
            //         console.log(response);
            //         let bodylist = response && response.body && response.body.bodyList && response.body.bodyList['0'],
            //             checkedArr = [];
            //
            //         if (bodylist && bodylist.meta) {
            //             let index = bodylist.meta.indexOf('IS_CHECKED');
            //             bodylist.dataList[0] && bodylist.dataList.forEach((d, i) => {
            //                 let obj = {};
            //                 bodylist.meta[0] && bodylist.meta.forEach((m, j) => {
            //                     obj[m] = d[j];
            //                 });
            //                 data.push(obj);
            //                 if (index > -1 && d[index]) {
            //                     checkedArr.push(i);
            //                 }
            //             });
            //         }
            //
            //         //当前页面为个性权限配置页面，且未勾选信息平台节点时，或未勾选权限组时，表格数据为空
            //         if ((self.pageType === 'PERSONAL' && self.infoPlatSelected.length < 1) || !self.privGroupTable || self.privGroupTable.rowSelectDataGet().length < 1) {
            //             data = [];
            //         }
            //         let tableConf: TableModulePara = {
            //             cols: [{
            //                 title: "字段名",
            //                 name: "CAPTION"
            //             }, {
            //                 title: "字段编号",
            //                 name: "FIELD_NAME"
            //             }],
            //             multPage: 2,//2前台分页
            //             isSub: true,
            //             data: data
            //         };
            //
            //         self.fieldTable = new TableModulePc({
            //             tableEl: tempTable,
            //             scrollEl: self.fieldContentDom,
            //             fixTop: 190
            //         }, tableConf).table;
            //
            //         self.privEcho(response, tempTable);
            //         self.fieldTable.on('render', () => {
            //             self.privEcho(response, tempTable);
            //         });
            //     }
            // });
            BwRule_1.BwRule.Ajax.fetch(this.url, {
                type: 'Post',
                data: JSON.stringify(ajaxData),
            }).then(function (_a) {
                var response = _a.response;
                console.log(response);
                var bodylist = response && response.body && response.body.bodyList && response.body.bodyList['0'], checkedArr = [];
                if (bodylist && bodylist.meta) {
                    var index_1 = bodylist.meta.indexOf('IS_CHECKED');
                    bodylist.dataList[0] && bodylist.dataList.forEach(function (d, i) {
                        var obj = {};
                        bodylist.meta[0] && bodylist.meta.forEach(function (m, j) {
                            obj[m] = d[j];
                        });
                        data.push(obj);
                        if (index_1 > -1 && d[index_1]) {
                            checkedArr.push(i);
                        }
                    });
                }
                //当前页面为个性权限配置页面，且未勾选信息平台节点时，或未勾选权限组时，表格数据为空
                if ((self.pageType === 'PERSONAL' && self.infoPlatSelected.length < 1) || !self.privGroupTable || self.privGroupTable.rowSelectDataGet().length < 1) {
                    data = [];
                }
                var tableConf = {
                    cols: [{
                            title: "字段名",
                            name: "CAPTION"
                        }, {
                            title: "字段编号",
                            name: "FIELD_NAME"
                        }],
                    multPage: 2,
                    isSub: true,
                    data: data
                };
                self.fieldTable = new TableModulePc({
                    tableEl: tempTable,
                    scrollEl: self.fieldContentDom,
                    fixTop: 190
                }, tableConf).table;
                self.privEcho(response, tempTable);
                self.fieldTable.on('render', function () {
                    self.privEcho(response, tempTable);
                });
            });
        };
        /**
         * 权限回显
         * @param response
         * @param tempTable
         */
        PrivilegeDP.prototype.privEcho = function (response, tempTable) {
            var bodylist = response && response.body && response.body.bodyList && response.body.bodyList['0'];
            if (bodylist.meta && bodylist.meta.indexOf('IS_CHECKED') > -1) {
                //00白，01蓝，11深蓝，10黄色，选择绿色
                response.data.forEach(function (obj, i) {
                    var tr = d.query("[data-index=\"" + i + "\"]", tempTable);
                    if (tr) {
                        tr.dataset.checked = 'true';
                        if (obj.IS_CONTROL === 1) {
                            tr.classList.add('bg-yellow');
                        }
                        //权限回显
                        if (obj.IS_CHECKED === 1) {
                            tr.dataset.checked = 'true';
                            tr.classList.add('bg-blue');
                        }
                    }
                });
            }
        };
        /**
         * 构建层级模块(包括地区/商品部分)
         * */
        PrivilegeDP.prototype.generateLGContent = function () {
            var _this = this;
            var btnWrapper = d.create("<div class=\"conf-btn\"></div>"), tableWrapper = d.create("<div class=\"table-wrapper\"></div>"), childWrapper = d.create("<div class=\"child-table-wrapper\"></div>"), tempTable = d.create('<table><tbody></tbody></table>'), tempBody, self = this, sp = new spinner_1.Spinner({
                el: self.levelContentDom,
                type: spinner_1.Spinner.SHOW_TYPE.cover,
            }), tableModule = null, childModule = null;
            tableWrapper.appendChild(tempTable);
            self.levelContentDom.innerHTML = '';
            self.levelContentDom.appendChild(tableWrapper);
            self.levelContentDom.appendChild(childWrapper);
            self.levelContentDom.appendChild(btnWrapper);
            sp.show();
            self.resLevelData = [];
            self.delLevelData = [];
            var obj = {
                select_type: 'getprivsbyprivgroupid',
                node_id: self.infoPlatSelected.length === 1 ? self.infoPlatSelected[0] : '',
                priv_group_id: self.privGroudId,
                privs_type: 'LEVEL_PRIVS',
            };
            //请求所有数据
            this.dataAjax([obj], function (res) {
                _this.databaseData = res.data;
            });
            var mainAjaxData = obj;
            mainAjaxData['privs_sub_type'] = 2;
            //请求主表数据
            this.dataAjax([mainAjaxData], function (response) {
                console.log(response, '主表数据');
                sp.hide();
                var checkedArr = [];
                // if (data.dataList && data.meta) {
                //     let index = data.meta.indexOf('IS_CHECKED');
                //     data.dataList[0] && data.dataList.forEach((d, i) => {
                //         let obj = {};
                //         response.head.cols.forEach((col) => {
                //             let index = data.meta.indexOf(col.name);
                //             obj[col.name] = d[index] + '';
                //         });
                //         colsData.push(obj);
                //         if (index > -1 && d[index]) {
                //             checkedArr.push(i);
                //         }
                //     });
                // }
                //当前页面为个性权限配置页面，且未勾选信息平台节点时，或未勾选权限组时，表格数据为空
                // if ((self.pageType === 'PERSONAL' && self.infoPlatSelected.length < 1) || !self.privGroupTable || self.privGroupTable.rowSelectDataGet().length < 1) {
                //     data = [];
                // }
                tableModule = new TableModulePc({
                    tableEl: tempTable,
                    scrollEl: tableWrapper,
                    fixTop: 200,
                    tablePara: {
                        rowMenu: [{
                                title: '删除行',
                                callback: function (btn, targets, target) {
                                    var index = d.closest(target, 'tr').dataset.index, delData = tableModule.table.rowSelectDataGet()[0], treeParam = delData['TREE_ID'], nameParam = delData['TREE_NAME'];
                                    tableModule.table.rowHide(index);
                                    //除去数据库中的数据
                                    _this.databaseData.forEach(function (obj) {
                                        if (obj['TREE_ID'] === treeParam && obj['TREE_NAME'] === nameParam) {
                                            if (!(_this.delLevelData.indexOf(obj) > -1)) {
                                                _this.delLevelData.push(obj);
                                            }
                                        }
                                    });
                                    //清空子表
                                    childWrapper.innerHTML = null;
                                }
                            }]
                    },
                }, _this.tableConf(_this.resetCols(response.head.cols), response.data));
                //行点击生成子表
                tableModule.table.clickEvent.add('tbody tr', function (e) {
                    _this.subTable(tableModule.table.rowDataGet(d.closest(e.target, 'tr').dataset.index), childWrapper, childModule);
                });
                !tools.isEmpty(checkedArr[0]) && checkedArr.forEach(function (index) {
                    var tr = d.query("[data-index=\"" + index + "\"]", tempTable);
                    tr.classList.add('selected');
                });
            });
            if (!this.levelModal) {
                tempBody = d.create("<div class=\"privilege-modal\" style=\"height:450px;\"></div>");
                self.levelModal = new Modal_1.Modal({
                    header: '权限定值配置',
                    body: tempBody,
                    isShow: false,
                    width: '800px',
                    className: 'privilege-modal',
                    footer: {}
                });
                this.generateLGModalSwitch(tempBody);
            }
            //层级模块
            this.levelModal.onOk = function () {
                //层级数据添加
                var localeV = _this.localeVariateSelectBox && _this.localeVariateSelectBox.getSelect(), goodV = _this.goodVariateSelectBox && _this.goodVariateSelectBox.getSelect(), resData = [];
                var goodSelect = _this.goodSelectBox && _this.goodSelectBox.getSelect()[0], localSelect = _this.localSelectBox && _this.localSelectBox.getSelect()[0], localNodes = _this.localTree && _this.localTree.getCheckedNodes(), goodNodes = _this.goodTree && _this.goodTree.getCheckedNodes();
                var localeL = nodeData(localNodes, localSelect), goodL = nodeData(goodNodes, goodSelect);
                //地区变量、定值
                var caption = _this.localeCaption, //层级
                type = '1';
                resData = resData.concat(_this.restarData(localeV, localSelect.value, localSelect.levelNo, 'LOCALE', '地点层级', caption, type));
                resData = resData.concat(_this.restarData(localeL, localSelect.value, localSelect.levelNo, 'LOCALE', '地点层级', caption, type));
                if (goodSelect) {
                    //商品变量、定值
                    caption = _this.goodCaption;
                    type = '1';
                    resData = resData.concat(_this.restarData(goodV, goodSelect.value, goodSelect.levelNo, 'GOOD', '商品层级', caption, type));
                    resData = resData.concat(_this.restarData(goodL, goodSelect.value, goodSelect.levelNo, 'GOOD', '商品层级', caption, type));
                    console.log(goodL, '商品定值');
                }
                console.log(resData, '22');
                if (resData[0]) {
                    Modal_1.Modal.confirm({
                        msg: '是否保存',
                        title: '提示',
                        btns: ['取消', '保存'],
                        callback: function (flag) {
                            if (flag) {
                                _this.resLevelData = resData;
                                _this.generateSave();
                                self.levelModal.isShow = false;
                            }
                        }
                    });
                }
                else {
                    Modal_1.Modal.alert('请选择一条数据');
                }
                //获取input参数
                function nodeData(data, select) {
                    var newData = [], flag = false;
                    data && data.forEach(function (tree) {
                        if (tree.deep === 0) {
                            newData = [];
                            tree.content.text = '当前层级所有' + select.text;
                            newData.push(tree.content);
                            flag = true;
                        }
                        if (!flag && tree.deep === select.levelNo) {
                            newData.push(tree.content);
                        }
                    });
                    return newData;
                }
            };
            new Button_1.Button({
                content: '配置',
                container: btnWrapper,
                type: 'primary',
                onClick: function () {
                    if (_this.delLevelData[0]) {
                        Modal_1.Modal.confirm({
                            msg: '已执行删除操作，是否保存？',
                            title: '提示',
                            btns: ['取消', '保存'],
                            callback: function (flag) {
                                if (flag) {
                                    _this.generateSave();
                                    self.levelModal.isShow = true;
                                }
                            }
                        });
                    }
                    else {
                        self.levelModal.isShow = true;
                    }
                }
            });
        };
        PrivilegeDP.prototype.generateSave = function () {
            var _this = this;
            if (!this.saveBtn) {
                this.saveBtn = new Button_1.Button({
                    content: '保存',
                    type: 'primary',
                    container: this.confSaveDom,
                    onClick: function () {
                        _this.saveBtnCb();
                    }
                });
            }
            else {
                this.saveBtnCb();
            }
        };
        PrivilegeDP.prototype.saveBtnCb = function () {
        };
        /**
         * 子表生成
         * @param trData
         * @param childWrapper
         * @param childModule
         */
        PrivilegeDP.prototype.subTable = function (trData, childWrapper, childModule) {
            var _this = this;
            this.delLevelData = [];
            var subAjaxData = {
                select_type: 'getprivsbyprivgroupid',
                node_id: this.infoPlatSelected.length === 1 ? this.infoPlatSelected[0] : '',
                priv_group_id: this.privGroudId,
                privs_type: 'LEVEL_PRIVS',
            };
            subAjaxData['privs_sub_type'] = 3;
            subAjaxData['privs_sub_type_param'] = trData['TREE_ID'];
            var sp = new spinner_1.Spinner({
                el: childWrapper,
                type: spinner_1.Spinner.SHOW_TYPE.cover,
            });
            sp.show();
            this.dataAjax([subAjaxData], function (res) {
                var tableEl = d.create('<table><tbody></tbody></table>');
                childWrapper.innerHTML = null;
                childWrapper.appendChild(tableEl);
                childModule = new TableModulePc({
                    tableEl: tableEl,
                    scrollEl: childWrapper,
                    tablePara: {
                        rowMenu: [{
                                title: '删除选中行',
                                multi: true,
                                callback: function (btn, targets, target) {
                                    // targets.forEach(obj => {
                                    _this.rowDelete(childModule, targets, trData);
                                    // })
                                }
                            }]
                    },
                }, _this.tableConf(_this.resetCols(res.head.cols), res.data, true));
                sp.hide();
            });
        };
        PrivilegeDP.prototype.rowDelete = function (tableModule, targets, trData) {
            var _this = this;
            var arr = [];
            targets.forEach(function (obj) {
                var index = obj.dataset.index, delData = tableModule.table.rowDataGet(index);
                tableModule.table.rowHide(index);
                _this.delLevelData.push(Object.assign(delData, trData));
                arr.push(parseInt(index));
            });
            //重新渲染表格
            var tableData = tableModule.table.data.get(), newData = [];
            tableData.forEach(function (obj, i) {
                if (!(arr.indexOf(i) > -1)) {
                    newData.push(obj);
                }
            });
            tableModule.tableData.setNewData(newData);
            console.log(this.delLevelData, 'deldata');
        };
        /**
         * 表格配置
         * @param cols
         * @param data
         * @param multi
         * @returns {{cols: any, multPage: number, isSub: boolean, data: any, multiSelect: boolean}}
         */
        PrivilegeDP.prototype.tableConf = function (cols, data, multi) {
            if (multi === void 0) { multi = false; }
            return {
                cols: cols,
                multPage: 2,
                isSub: true,
                data: data,
                multiSelect: multi,
            };
        };
        PrivilegeDP.prototype.dataAjax = function (ajaxData, cb) {
            BwRule_1.BwRule.Ajax.fetch(this.url, {
                type: 'post',
                data: JSON.stringify(ajaxData),
            }).then(function (_a) {
                var response = _a.response;
                typeof cb === 'function' && cb(response);
            });
            // Rule.ajax(this.url,{
            //     type : 'post',
            //     data : JSON.stringify(ajaxData),
            //     success : (response) => {
            //         typeof cb === 'function' && cb(response);
            //     }
            // })
        };
        /**
         * 表格数据构造
         * @param data
         * @param levelId
         * @param levelNo
         * @param treeId
         * @param treeName
         * @param caption
         * @param type
         */
        PrivilegeDP.prototype.restarData = function (data, levelId, levelNo, treeId, treeName, caption, type) {
            var _this = this;
            var resData = [];
            data && data.forEach(function (obj) {
                var newObj = {
                    LEVEL_ID: levelId,
                    TREE_ID: treeId,
                    LEVEL_NO: levelNo,
                    TREE_NAME: treeName,
                    CAPTION: caption,
                    INS_TYPE: type,
                    INS_VALUE: obj.value,
                    INS_VALUE_NAME: obj.text
                };
                //不存在数据库中则添加到res
                if (!(_this.databaseData.indexOf(newObj) > -1)) {
                    resData.push(newObj);
                }
            });
            return resData;
        };
        /**
         * 获取地区/商品的模态框切换栏部分
         * */
        PrivilegeDP.prototype.generateLGModalSwitch = function (container) {
            var _this = this;
            var lgSwitchDom = d.create("<ul class=\"nav nav-tabs nav-tabs-line\"></ul>"), lgContent = d.create("<div class=\"lg-content\"></div>"), localeLi = d.create("<li class=\"active\"><a><i class=\"iconfont icon-tongji\"></i>\u5730\u533A</a></li>"), goodLi = d.create("<li><a><i class=\"iconfont icon-function\"></i>\u5546\u54C1</a></li>");
            lgSwitchDom.appendChild(localeLi);
            lgSwitchDom.appendChild(goodLi);
            container.appendChild(lgSwitchDom);
            container.appendChild(lgContent);
            //【地区/商品】切换，默认显示为地区模块
            this.levelTreeType = 'LOCALE';
            if (!this.localeContentDom) {
                this.localeContentDom = d.create("<div class=\"locale-wrapper\"></div>");
                lgContent.appendChild(this.localeContentDom);
                this.generateLGModalContent(this.localeContentDom, 'LOCALE');
            }
            else {
                this.localeContentDom.style.display = 'block';
            }
            d.on(localeLi, 'click', function () {
                goodLi.classList.remove('active');
                localeLi.classList.add('active');
                if (_this.goodContentDom) {
                    _this.goodContentDom.style.display = 'none';
                }
                _this.localeContentDom.style.display = 'block';
                _this.levelTreeType = 'LOCALE';
            });
            d.on(goodLi, 'click', function () {
                localeLi.classList.remove('active');
                goodLi.classList.add('active');
                if (!_this.goodContentDom) {
                    _this.goodContentDom = d.create("<div class=\"good-wrapper\"></div>");
                    lgContent.appendChild(_this.goodContentDom);
                    _this.generateLGModalContent(_this.goodContentDom, 'GOOD');
                }
                else {
                    _this.goodContentDom.style.display = 'block';
                }
                _this.localeContentDom.style.display = 'none';
                _this.goodContentDom.style.display = 'block';
                _this.levelTreeType = 'GOOD';
            });
        };
        /**
         * 获取地区/商品的模态框配置部分
         * */
        PrivilegeDP.prototype.generateLGModalContent = function (container, type) {
            var _this = this;
            var menu = d.create("<ul class=\"vc-menu\"></ul>"), content = d.create("<div class=\"vc-content\"></div>"), variate = d.create("<li class=\"li-select\"><a>\u53D8\u91CF</a></li>"), consValue = d.create("<li><a>\u5B9A\u503C</a></li>");
            menu.appendChild(variate);
            menu.appendChild(consValue);
            container.appendChild(menu);
            container.appendChild(content);
            if (type === 'LOCALE') {
                this.localeVariateDom = d.create("<div class=\"locale-variate\"></div>");
                this.getConsValueData(this.localeVariateDom, type, content, false);
                this.localeInsType = '1';
                d.on(variate, 'click', function () {
                    consValue.classList.remove('li-select');
                    variate.classList.add('li-select');
                    _this.localeVariateDom.style.display = 'inline-block';
                    if (_this.localeConsValueDom) {
                        _this.localeConsValueDom.style.display = 'none';
                    }
                    _this.localeInsType = '1';
                });
                this.localeConsValueDom = d.create("<div class=\"locale-consvalue\"></div>");
                content.appendChild(this.localeConsValueDom);
                this.getConsValueData(this.localeConsValueDom, 'LOCALE');
                d.on(consValue, 'click', function () {
                    variate.classList.remove('li-select');
                    consValue.classList.add('li-select');
                    _this.localeVariateDom.style.display = 'none';
                    _this.localeConsValueDom.style.display = 'block';
                    _this.localeInsType = '0';
                });
            }
            else if (type === 'GOOD') {
                this.goodVariateDom = d.create("<div class=\"good-variate\"></div>");
                this.getConsValueData(this.goodVariateDom, type, content, false);
                this.goodInsType = '1';
                d.on(variate, 'click', function () {
                    consValue.classList.remove('li-select');
                    variate.classList.add('li-select');
                    _this.goodVariateDom.style.display = 'block';
                    if (_this.goodConsValueDom) {
                        _this.goodConsValueDom.style.display = 'none';
                    }
                    _this.goodInsType = '1';
                });
                this.goodConsValueDom = d.create("<div class=\"good-consvalue\"></div>");
                content.appendChild(this.goodConsValueDom);
                this.getConsValueData(this.goodConsValueDom, 'GOOD');
                d.on(consValue, 'click', function () {
                    variate.classList.remove('li-select');
                    consValue.classList.add('li-select');
                    _this.goodVariateDom.style.display = 'none';
                    _this.goodConsValueDom.style.display = 'block';
                    _this.goodInsType = '0';
                });
            }
        };
        PrivilegeDP.prototype.getVariateData = function (container, type) {
            var self = this, sp = new spinner_1.Spinner({
                el: container,
                type: spinner_1.Spinner.SHOW_TYPE.cover,
            });
            sp.show();
            // Rule.ajax(self.url, {
            //     type: 'Post',
            //     defaultCallback: false,
            //     data: ` [{"select_type":"getinsparaminfo"}]`,
            //     cache: true,
            //     success(response) {
            //         let data = response && response.body && response.body.bodyList && response.body.bodyList['0'];
            //         if (data && data.dataList) {
            //             let dataArr = [];
            //             data.dataList[0] && data.dataList.forEach((d) => {
            //                 if (d[0] && d[1]) {
            //                     dataArr.push({
            //                         value: d[0],
            //                         text: d[1]
            //                     });
            //                 }
            //             });
            //             sp.hide();
            //             if (type === 'LOCALE') {
            //                 self.localeVariateSelectBox = createBox(container, dataArr)
            //             } else if (type === 'GOOD') {
            //                 self.goodVariateSelectBox = createBox(container, dataArr)
            //             }
            //         }
            //         function createBox(dom, data){
            //             return new SelectBox({
            //                 container: dom,
            //                 select: {
            //                     multi: true,
            //                     callback: index => {
            //                     }
            //                 },
            //                 data: data
            //             });
            //         }
            //     }
            // });
            BwRule_1.BwRule.Ajax.fetch(self.url, {
                type: 'Post',
                data: " [{\"select_type\":\"getinsparaminfo\"}]",
                cache: true,
            }).then(function (_a) {
                var response = _a.response;
                var data = response && response.body && response.body.bodyList && response.body.bodyList['0'];
                if (data && data.dataList) {
                    var dataArr_1 = [];
                    data.dataList[0] && data.dataList.forEach(function (d) {
                        if (d[0] && d[1]) {
                            dataArr_1.push({
                                value: d[0],
                                text: d[1]
                            });
                        }
                    });
                    sp.hide();
                    if (type === 'LOCALE') {
                        self.localeVariateSelectBox = createBox(container, dataArr_1);
                    }
                    else if (type === 'GOOD') {
                        self.goodVariateSelectBox = createBox(container, dataArr_1);
                    }
                }
                function createBox(dom, data) {
                    return new selectBox_1.SelectBox({
                        container: dom,
                        select: {
                            multi: true,
                            callback: function (index) {
                            }
                        },
                        data: data
                    });
                }
            });
        };
        PrivilegeDP.prototype.getConsValueData = function (container, type, content, defaults) {
            if (defaults === void 0) { defaults = true; }
            var levelSelectEl = d.create("<div class=\"level-select\"></div>"), levelWrapper = d.create("<div><span>\u5C42\u7EA7</span></div>"), consContent = d.create("<div class=\"lg-conf-content\"></div>"), tempDiv = d.create("<div><span class=\"priv-conf\">\u53EF\u914D\u7F6E\u6743\u9650</span></div>"), consWrapper = d.create("<div data-level=\"1\" class=\"level-conf select-box-small menu\"></div>");
            content && content.appendChild(container);
            levelSelectEl.appendChild(levelWrapper);
            consContent.appendChild(tempDiv);
            tempDiv.appendChild(consWrapper);
            container.appendChild(levelSelectEl);
            container.appendChild(consContent);
            if (defaults) {
                // this.createLi('当前层级所有','0', 0,consWrapper, type, 0);
                if (type === 'LOCALE') {
                    this.localTree = this.createTree(consWrapper, type);
                }
                else {
                    this.goodTree = this.createTree(consWrapper, type);
                }
            }
            else {
                this.getVariateData(consWrapper, type);
            }
            this.getLevelData(type, levelWrapper);
        };
        /**
         * 获取地区/商品层级树
         * */
        PrivilegeDP.prototype.getLevelData = function (type, levelSelectEl) {
            var self = this;
            // Rule.ajax(this.url, {
            //     type: 'Post',
            //     data: ` [{"select_type":"getlevelinfo"}]`,
            //     cache: true,
            //     success(response) {
            //         let data = response.data,dataArr = [],index;
            //         let callback = (node) => {
            //             if(node.deep >= index + 1){
            //                 node.expand = false;
            //                 node.isLeaf = true;
            //             }else {
            //                 node.isLeaf = false;
            //             }
            //         };
            //         if (data[0]) {
            //             data.forEach((obj) => {
            //                 if (obj['TREE_ID'] === type) {
            //                     dataArr.push({
            //                         value: obj['LEVEL_ID'],
            //                         text: obj['CAPTION'],
            //                         levelNo : obj['LEVEL_NO']
            //                     });
            //                 }
            //             });
            //             let len = dataArr.length;
            //             if(type === 'GOOD'){
            //                 self.goodSelectBox = createSelectBox((i) => {
            //                     index = i;
            //                     self.goodTree.each(callback);
            //                 });
            //
            //             }else if(type === 'LOCALE'){
            //                 self.localSelectBox = createSelectBox((i) => {
            //                     index = i;
            //                     self.localTree.each(callback);
            //                 });
            //             }
            //
            //             //初始化地区/商品记录数据的二维数组
            //             if (type === 'LOCALE' && !self.localeSelectd) {
            //                 self.localeSelectd = [];
            //                 for (let i = 0; i <= len; i++) {
            //                     self.localeSelectd[i] = [];
            //                 }
            //             } else if (type === 'GOOD' && !self.goodSelectd) {
            //                 self.goodSelectd = [];
            //                 for (let i = 0; i <= len; i++) {
            //                     self.goodSelectd[i] = [];
            //                 }
            //             }
            //         }
            //         function createSelectBox(cb){
            //             return new SelectBox({
            //                 container: levelSelectEl,
            //                 select: {
            //                     multi: false,
            //                     callback: (index,item) => {
            //                         cb(index);
            //                     }
            //                 },
            //                 data: dataArr
            //             });
            //         }
            //     }
            // });
            BwRule_1.BwRule.Ajax.fetch(this.url, {
                type: 'POST',
                data: [{ select_type: "getlevelinfo" }],
                cache: true,
            }).then(function (_a) {
                var response = _a.response;
                var data = response.data, dataArr = [], index;
                var callback = function (node) {
                    if (node.deep >= index + 1) {
                        node.expand = false;
                        node.isLeaf = true;
                    }
                    else {
                        node.isLeaf = false;
                    }
                };
                if (data[0]) {
                    data.forEach(function (obj) {
                        if (obj['TREE_ID'] === type) {
                            dataArr.push({
                                value: obj['LEVEL_ID'],
                                text: obj['CAPTION'],
                                levelNo: obj['LEVEL_NO']
                            });
                        }
                    });
                    var len = dataArr.length;
                    if (type === 'GOOD') {
                        self.goodSelectBox = createSelectBox(function (i) {
                            index = i;
                            self.goodTree.each(callback);
                        });
                    }
                    else if (type === 'LOCALE') {
                        self.localSelectBox = createSelectBox(function (i) {
                            index = i;
                            self.localTree.each(callback);
                        });
                    }
                    //初始化地区/商品记录数据的二维数组
                    if (type === 'LOCALE' && !self.localeSelectd) {
                        self.localeSelectd = [];
                        for (var i = 0; i <= len; i++) {
                            self.localeSelectd[i] = [];
                        }
                    }
                    else if (type === 'GOOD' && !self.goodSelectd) {
                        self.goodSelectd = [];
                        for (var i = 0; i <= len; i++) {
                            self.goodSelectd[i] = [];
                        }
                    }
                }
                function createSelectBox(cb) {
                    return new selectBox_1.SelectBox({
                        container: levelSelectEl,
                        select: {
                            multi: false,
                            callback: function (index, item) {
                                cb(index);
                            }
                        },
                        data: dataArr
                    });
                }
            });
        };
        /**
         * 树children构造
         * @param response
         * @returns {Array}
         */
        PrivilegeDP.prototype.treeChild = function (response) {
            var data = [], meta = response.meta;
            response.data.forEach(function (obj) {
                data.push({
                    text: obj[meta[1]],
                    content: {
                        value: obj[meta[0]],
                        isLeaf: obj.IS_LEAF,
                        text: obj[meta[1]]
                    },
                    isAccordion: true,
                    isLeaf: true,
                });
            });
            return data;
        };
        // name,value,level_no,confEl,type, leaf
        PrivilegeDP.prototype.createTree = function (container, type) {
            var _this = this;
            var tree = new Tree_1.Tree({
                text: '当前层级所有',
                container: container,
                content: {
                    value: '0',
                    isLeaf: 0,
                    text: '当前层级所有'
                },
                isAccordion: false,
                isVirtual: false,
                isLeaf: false,
                isShowCheckBox: true,
                // multiSelect : true,
                ajax: function (node) {
                    return BwRule_1.BwRule.Ajax.fetch(_this.url, {
                        type: 'Post',
                        data: JSON.stringify([{
                                select_type: 'getinsvalueinfo',
                                tree_id: type,
                                level_no: node.deep + 1,
                                current_id: node.content.value
                            }]),
                        cache: true,
                    }).then(function (_a) {
                        var response = _a.response;
                        return _this.treeChild(response);
                    });
                }
            });
            tree.onExpand = function (node, isExpand) {
                if (!isExpand) {
                    return;
                }
                var index = _this.localSelectBox.get()[0] + 1;
                tree.each(function (tnode) {
                    if (tnode.deep >= index || tnode.content.isLeaf === 1) {
                        tnode.isLeaf = true;
                    }
                    else {
                        tnode.isLeaf = false;
                    }
                });
            };
            return tree;
        };
        // /**
        //  * 获取定值部分地区配置内容
        //  * */
        // private getConsValueConfData(confEl: HTMLElement, type: string, level_no = 1, current_id = '') {
        //     let self = this;
        //     debugger;
        //     Rule.ajax(this.url, {
        //         type: 'Post',
        //         data: JSON.stringify([{
        //             select_type : 'getinsvalueinfo',
        //             tree_id : type,
        //             level_no : level_no,
        //             current_id : current_id
        //         }]),
        //         cache: true,
        //         success(response) {
        //             let data = response.data,meta = response.meta;
        //             data.forEach((node) => {
        //                 // self.createLi(node[meta[1]],node[meta[0]],level_no,confEl,type,node['IS_LEAF'])
        //             });
        //         }
        //     });
        // }
        // /**
        //  * 创建checkBox层级树
        //  * @param name
        //  * @param value
        //  * @param level_no
        //  * @param confEl
        //  * @param type
        //  * @param leaf
        //  */
        // private createLi(name,value,level_no,confEl,type, leaf){
        //     let liDom = d.createByHTML(`<li></li>`),
        //         checkArr = [],
        //         toggle = d.createByHTML(`<div class="toggle" title="${name}"></div>`),
        //         menu = d.createByHTML(`<ul class="menu" data-level="${level_no + 1}"></ul>`),
        //         checkbox = CheckBox.initCom(tools.getGuid, ''),
        //         spanbox = d.createByHTML(`<a>${name}</a>`),
        //         input = <HTMLInputElement>d.query('input', checkbox);
        //     toggle.appendChild(checkbox);
        //     toggle.appendChild(spanbox);
        //     liDom.appendChild(toggle);
        //     liDom.appendChild(menu);
        //     confEl.appendChild(liDom);
        //     input.value = value;
        //     checkArr.push(checkbox);
        //     d.on(spanbox, 'click', () => {
        //         if (!menu.hasChildNodes() && leaf !== 1) {
        //             this.getConsValueConfData(menu, type, level_no + 1, value);
        //         }
        //         if (toggle.classList.contains('toggle-select')) {
        //             toggle.classList.remove('toggle-select');
        //             menu.style.display = 'none';
        //         } else {
        //             menu.style.display = 'block';
        //             toggle.classList.add('toggle-select');
        //         }
        //         if (type === 'LOCALE' && parseInt(this.localeLevelId) <= level_no) {
        //             menu.style.display = 'none';
        //         } else if (type === 'GOOD' && parseInt(this.goodLevelId) <= level_no) {
        //             menu.style.display = 'none';
        //         }
        //     });
        //     /**
        //      * 全选反选
        //      * @param childDom
        //      * @param isSelect
        //      */
        //     function allToggleSelect(childDom, isSelect = true){
        //         let children = d.queryAll('input', childDom);
        //         children[0] && children.forEach((obj : HTMLInputElement) => {
        //             obj.checked = isSelect
        //         })
        //     }
        //     //全选功能，主要是分成地区、商品两大块， 往localeSelectd和goodSelectd数组中添加或删除数据(取决于是否选中)，添加和删除都要判断是否存在。
        //     d.on(checkbox, 'click', () => {
        //         if(value !== '0' && level_no !== 0){
        //             checked( menu, input);
        //         }
        //     });
        //
        //     function checked(childDom, inputs){
        //         if (inputs.checked) {
        //             allToggleSelect(childDom);
        //         } else{
        //             allToggleSelect( childDom, false);
        //         }
        //     }
        // }
        /**
         *
         * @param url
         * @param json
         * @param isAlert  是否弹出保存成功（为了解决单选权限组时del和sava两次请求弹出两次保存成功的问题）
         */
        PrivilegeDP.prototype.saveResponse = function (url, json, isAlert) {
            var _this = this;
            if (isAlert === void 0) { isAlert = true; }
            BwRule_1.BwRule.Ajax.fetch(url, {
                type: 'POST',
                data: json,
            }).then(function () {
                if (isAlert) {
                    Modal_1.Modal.alert('保存成功!');
                    _this.judgeControl();
                }
            });
            // Rule.ajax(url, {
            //         type: 'Post',
            //         defaultCallback: false,
            //         data: JSON.stringify(json),
            //         success : (response) => {
            //             if (isAlert) {
            //                 Modal.alert('保存成功!');
            //                 this.judgeControl();
            //             }
            //
            //         }
            //     });
        };
        PrivilegeDP.prototype.judgeControl = function () {
        };
        /**
         * 表格cols构造
         * @param cols
         * @returns {Array}
         */
        PrivilegeDP.prototype.resetCols = function (cols) {
            var data = [];
            cols.forEach(function (col) {
                data.push({
                    name: col.name,
                    title: col.caption
                });
            });
            return data;
        };
        PrivilegeDP.prototype.confUrl = function (action, url) {
            if (tools.isNotEmpty(url)) {
                return url + '/' + action + '?deal_type=select';
            }
            else {
                return CONF.siteAppVerUrl + '/rmprivs/' + action;
            }
        };
        return PrivilegeDP;
    }());
    exports.PrivilegeDP = PrivilegeDP;
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
