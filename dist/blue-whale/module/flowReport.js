define("FlowBase", ["require", "exports", "FlowReport"], function (require, exports, FlowReport_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="FlowBase"/>
    var d = G.d;
    var FlowBase = /** @class */ (function () {
        function FlowBase(para) {
            var muiContent = d.query('.mui-content');
            switch (para.uiType) {
                case 'flow': {
                    new FlowReport_1.FlowReport(para);
                }
            }
        }
        return FlowBase;
    }());
    exports.FlowBase = FlowBase;
});

define("FlowReport", ["require", "exports", "BasicPage", "EditModule", "Modal", "BwRule", "ButtonAction", "TextInput"], function (require, exports, basicPage_1, editModule_1, Modal_1, BwRule_1, ButtonAction_1, text_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var sys = BW.sys;
    var FlowReport = /** @class */ (function (_super) {
        __extends(FlowReport, _super);
        function FlowReport(para) {
            var _this = _super.call(this, para) || this;
            _this.instance = Number(tools.url.getPara('instance'));
            _this.para = para;
            var emPara = { fields: [] };
            var nameFields = {};
            var form = _this.createFormWrapper(para.fm.fields);
            para.fm.fields.forEach(function (f) {
                nameFields[f.name] = f;
                var field = {
                    dom: d.query("[data-name=\"" + f.name + "\"] [data-input-type]", form),
                    field: nameFields[f.name]
                };
                emPara.fields.push(field);
                if (['insert', 'associate'].indexOf(para.uiType) > -1 ? field.field.noModify : field.field.noEdit) {
                    field.dom && field.dom.classList.add('disabled');
                }
            });
            _this.editModule = new editModule_1.EditModule(emPara);
            // 编辑标识
            _this.initData();
            _this.initEvent();
            return _this;
        }
        FlowReport.prototype.createFormWrapper = function (fields) {
            if (tools.isMb) {
                var muiContent = d.query('.mui-content'), formWrapper = h("div", { className: "form-wrapper" });
                muiContent.appendChild(formWrapper);
                for (var i = 0; i < fields.length; i++) {
                    var field = fields[i];
                    if (((this.para.uiType == 'insert' || this.para.uiType == 'associate') && field.noAdd) || (this.para.uiType == 'update' && field.noShow) || (this.para.uiType == 'flow' && field.noShow)) {
                        continue;
                    }
                    var span = null;
                    if (field.comType == 'tagsInput') {
                        span = h("span", { class: "mui-icon mui-icon-plus", "data-action": "picker" });
                    }
                    else if (field.comType == 'file') {
                        span = h("span", { class: "mui-icon mui-icon-paperclip" });
                    }
                    var elementType = tools.isNotEmpty(field.elementType) ? field.elementType : '';
                    var formGroupWrapper = h("div", { class: "mui-input-row label-input", "data-name": field.name, "data-type": field.comType, "data-element-type": elementType },
                        h("label", null, field.caption),
                        h("div", { "data-input-type": field.comType }, span));
                    formWrapper.appendChild(formGroupWrapper);
                }
                return muiContent;
            }
            else {
                var formWrapper = d.query('#flowForm', this.para.dom);
                for (var i = 0; i < fields.length; i++) {
                    var field = fields[i];
                    if (((this.para.uiType == 'insert' || this.para.uiType == 'associate') && field.noAdd) || (this.para.uiType == 'update' && field.noShow) || (this.para.uiType == 'flow' && field.noShow)) {
                        continue;
                    }
                    var formGroupWrapper = null;
                    var isHide = ((this.para.uiType == 'insert' || this.para.uiType == 'associate') && field.noAdd) || (this.para.uiType == 'update' && field.noShow);
                    switch (field.comType) {
                        case 'input':
                            {
                                formGroupWrapper =
                                    h("div", { className: 'list-group-item col-xs-12 col-md-4 col-sm-6 ' + (isHide ? 'hide' : ''), "data-name": field.name },
                                        h("div", { className: "list-left", title: field.caption },
                                            h("label", null, field.caption)),
                                        h("div", { className: "list-right", "data-input-type": field.comType }));
                            }
                            break;
                        case 'tagsInput':
                            {
                                formGroupWrapper = h("div", { className: "list-group-item col-md-12", "data-name": field.name },
                                    h("div", { className: "list-left width-8", title: field.caption },
                                        h("label", null, field.caption)),
                                    h("div", { className: "list-right width-125", "data-input-type": field.comType, title: field.caption }),
                                    h("span", { className: "fa fa-plus-square", "data-action": "picker", "data-href": BW.CONF.siteUrl + field.dataAddr.dataAddr }));
                            }
                            break;
                        case 'file':
                            {
                                formGroupWrapper =
                                    h("div", { className: 'list-group-item col-xs-12 col-md-4 col-sm-6', "data-name": field.name },
                                        h("div", { className: "list-left", title: field.caption },
                                            h("label", null, field.caption)),
                                        h("div", { className: "list-right", "data-input-type": field.comType }));
                            }
                            break;
                        case 'richText':
                            {
                                formGroupWrapper = h("div", { className: "list-group-item col-xs-12", "data-name": field.name },
                                    h("div", { className: "list-left", title: field.caption },
                                        h("label", null, field.caption)),
                                    h("div", { className: "list-right", "data-input-type": field.comType, style: "left: 9.5%" }));
                            }
                            break;
                        case 'datetime':
                            {
                                formGroupWrapper = h("div", { className: "list-group-item col-xs-12 col-md-4 col-sm-6 label-input", "data-name": field.name },
                                    h("div", { className: "list-left", title: field.caption },
                                        h("label", null, field.caption)),
                                    h("div", { className: "list-right", "data-input-type": field.comType }));
                            }
                            break;
                        case 'toggle':
                            {
                                formGroupWrapper =
                                    h("div", { className: "list-group-item col-xs-12 col-md-4 col-sm-6", "data-name": field.name },
                                        h("div", { className: "list-left", title: field.caption },
                                            h("label", null, field.caption)),
                                        h("div", { className: "list-right", "data-input-type": field.comType }));
                            }
                            break;
                    }
                    formWrapper.appendChild(formGroupWrapper);
                }
                return formWrapper;
            }
        };
        FlowReport.prototype.initEvent = function () {
            var self = this, para = this.para, saveBtn = (function () {
                for (var _i = 0, _a = para.fm.subButtons; _i < _a.length; _i++) {
                    var btn = _a[_i];
                    if (btn.subType === 'save') {
                        return btn;
                    }
                }
                return null;
            }());
            // 事件绑定
            if (tools.isMb) {
                var muiContent = d.query('.mui-content'), target_1 = null;
                if (tools.isNotEmptyArray(para.fm.subButtons)) {
                    muiContent.style.paddingBottom = '70px';
                    target_1 = h("div", { className: "sub-btns" });
                    muiContent.appendChild(target_1);
                    para.fm.subButtons.map(function (item, index) {
                        var btnWrapper = h("div", { className: "sub-btn-item", "data-index": index }, item.caption);
                        target_1.appendChild(btnWrapper);
                    });
                }
                d.on(target_1, 'click', '.sub-btn-item', function (e) {
                    e.stopPropagation();
                    subBtnEvent(this.dataset.index);
                });
            }
            else {
                var target = this.para.dom.querySelector('.btn-group.sub-btn');
                d.on(target, 'click', 'button', function (e) {
                    e.stopPropagation();
                    subBtnEvent(this.dataset.index);
                });
            }
            function subBtnEvent(index) {
                var btn = para.fm.subButtons[index], pageData = self.dataGet();
                switch (btn.subType) {
                    case 'save':
                        if (!self.validate(pageData)) {
                            return false;
                        }
                        btn.hintAfterAction = true;
                        self.save(btn, pageData);
                        break;
                    case 'submit':
                        if (!self.validate(pageData)) {
                            return false;
                        }
                        saveBtn.hintAfterAction = false;
                        // 先保存再发送
                        self.save(saveBtn, pageData, function () {
                            saveBtn.hintAfterAction = true;
                            ButtonAction_1.ButtonAction.get().clickHandle(btn, self.dataGet(), function () {
                                // 提交成功回退到上一页
                                if (tools.isMb) {
                                    sys.window.open({
                                        url: BW.CONF.url.myApplication
                                    });
                                }
                                else {
                                    sys.window.open({
                                        url: BW.CONF.url.myApplicationPC
                                    });
                                }
                            }, self.url);
                        });
                        break;
                    case 'with_draw':
                        btn.hintBeforeAction = true;
                        ButtonAction_1.ButtonAction.get().clickHandle(btn, self.dataGet(), function (response) {
                            sys.window.open({
                                url: BW.CONF.siteUrl + '/' + response.body.bodyList[0].dataList[0] + '?page=flowReport'
                            });
                        }, self.url);
                        break;
                    case 'agree':
                        {
                            btn.hintAfterAction = true;
                            var text_2 = null, body = h("div", null,
                                h("div", { className: "title" }, "\u64CD\u4F5C\u5907\u6CE8:"),
                                text_2 = h(text_1.TextInput, null));
                            var modal_1 = new Modal_1.Modal({
                                body: body,
                                className: 'flow-remark-modal',
                                footer: {},
                                width: '310px',
                                isMb: false,
                                top: 120,
                                onOk: function () {
                                    var audit_memo = text_2.get();
                                    if (tools.isNotEmpty(audit_memo)) {
                                        btn.actionAddr.dataAddr = tools.url.addObj(btn.actionAddr.dataAddr, {
                                            audit_memo: audit_memo
                                        });
                                        ButtonAction_1.ButtonAction.get().clickHandle(btn, self.dataGet(), function (response) {
                                            modal_1.destroy();
                                            sys.window.close();
                                        }, self.url);
                                    }
                                    else {
                                        Modal_1.Modal.alert('备注不能为空!');
                                    }
                                }
                            });
                        }
                        break;
                    case 'reject':
                        {
                            btn.hintAfterAction = true;
                            var text_3 = null, body = h("div", null,
                                h("div", { className: "title" }, "\u64CD\u4F5C\u5907\u6CE8:"),
                                text_3 = h(text_1.TextInput, null));
                            var modal_2 = new Modal_1.Modal({
                                body: body,
                                className: 'flow-remark-modal',
                                footer: {},
                                width: '310px',
                                isMb: false,
                                top: 120,
                                onOk: function () {
                                    var audit_memo = text_3.get();
                                    if (tools.isNotEmpty(audit_memo)) {
                                        btn.actionAddr.dataAddr = tools.url.addObj(btn.actionAddr.dataAddr, {
                                            audit_memo: audit_memo
                                        });
                                        ButtonAction_1.ButtonAction.get().clickHandle(btn, self.dataGet(), function (response) {
                                            modal_2.destroy();
                                            sys.window.close();
                                        }, self.url);
                                    }
                                    else {
                                        Modal_1.Modal.alert('备注不能为空!');
                                    }
                                }
                            });
                        }
                        break;
                }
            }
        };
        ;
        FlowReport.prototype.dataGet = function () {
            var data = this.editModule.get();
            this.para.fm.fields.forEach(function (field) {
                var name = field.name, val = field.atrrs.defaultValue;
                if (field.noEdit && !tools.isEmpty(val)) {
                    data[name.toLowerCase()] = val;
                }
            });
            return data;
        };
        FlowReport.prototype.validate = function (pageData) {
            var result = this.editModule.validate.start();
            if (tools.isNotEmpty(result)) {
                for (var key in result) {
                    Modal_1.Modal.alert(result[key].errMsg);
                    return false;
                }
            }
            else {
                return true;
            }
        };
        /**
         * 新增/修改
         * @param btn
         * @param pageData
         * @param callback
         */
        FlowReport.prototype.save = function (btn, pageData, callback) {
            var _this = this;
            ButtonAction_1.ButtonAction.get().clickHandle(btn, pageData, function (response) {
                btn.buttonType = 2;
                var data = response.data && response.data[0] ? response.data[0] : null;
                if (data) {
                    _this.editModule.set(data);
                }
                typeof callback === 'function' && callback(response);
            }, this.url);
        };
        /**
         * 初始化数据
         */
        FlowReport.prototype.initData = function () {
            var _this = this;
            var form = this.para.fm;
            var addOldField = function (data) {
                // 获取有OLD_开头的字段
                var btns = form.subButtons, varList = [];
                Array.isArray(btns) && btns.forEach(function (btn) {
                    var addr = btn.actionAddr;
                    if (addr && Array.isArray(addr.varList)) {
                        varList = varList.concat(addr.varList);
                    }
                });
                BwRule_1.BwRule.addOldField(BwRule_1.BwRule.getOldField(varList), data);
                return data;
            };
            // 字段默认值
            var defaultVal = BwRule_1.BwRule.getDefaultByFields(form.fields);
            this.editModule.set(defaultVal);
            // url请求默认值
            if (form.dataAddr) {
                BwRule_1.BwRule.Ajax.fetch(BW.CONF.siteUrl + BwRule_1.BwRule.reqAddr(form.dataAddr))
                    .then(function (_a) {
                    var response = _a.response;
                    //	    alert(JSON.stringify(response));
                    var data = response.data[0];
                    if (!data) {
                        Modal_1.Modal.alert('数据为空');
                        return;
                    }
                    data = addOldField(data);
                    _this.editModule.set(data);
                    //    初始数据获取，不包含收件人id
                    if (form.updatefileData) {
                        BwRule_1.BwRule.Ajax.fetch(BwRule_1.BwRule.reqAddr(form.updatefileData, data), {
                            silent: true
                        });
                    }
                });
            }
        };
        return FlowReport;
    }(basicPage_1.default));
    exports.FlowReport = FlowReport;
});

define("FlowList", ["require", "exports", "SlideTab", "BwRule"], function (require, exports, slideTab_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="FlowList"/>
    var d = G.d;
    var sys = BW.sys;
    var tools = G.tools;
    var FlowList = /** @class */ (function () {
        function FlowList(para) {
            var _this = this;
            this.initEvents = (function () {
                var clickHandler = function (e) {
                    var url = d.closest(e.target, '.item-wrapper').dataset.url, instance = d.closest(e.target, '.item-wrapper').dataset.instance;
                    sys.window.open({
                        url: tools.url.addObj(url, {
                            instance: instance
                        })
                    });
                };
                return {
                    on: function () {
                        d.on(d.query('.mui-content.flowList'), 'click', '.item-wrapper', clickHandler);
                    },
                    off: function () {
                        d.off(d.query('.mui-content.flowList'), 'click', '.item-wrapper', clickHandler);
                    }
                };
            })();
            var flow = para.flow, titles = [], url = '';
            this.flowType = para.flow;
            switch (flow) {
                case 'application':
                    {
                        titles = ['全部', '进行中', '已完成'];
                        url = BW.CONF.ajaxUrl.flowListApply;
                    }
                    break;
                case 'approval':
                    {
                        titles = ['全部', '待审批', '已审批'];
                        url = BW.CONF.ajaxUrl.flowListCheck;
                    }
                    break;
            }
            var muiContent = d.query('.mui-content.flowList'), tabParent = h("div", { className: "tabParent" }), panelParent = h("div", { className: "panelParent" });
            muiContent.appendChild(tabParent);
            muiContent.appendChild(panelParent);
            this.initEvents.on();
            var dom1 = h("div", null), dom2 = h("div", null), dom3 = h("div", null);
            var tab = new slideTab_1.SlideTab({
                tabParent: tabParent,
                panelParent: panelParent,
                tabs: [
                    {
                        title: titles[0],
                        dom: dom1,
                        dataManager: {
                            render: function (start, length, data, isRefresh) {
                                var result = [];
                                if (isRefresh) {
                                    dom1.innerHTML = '';
                                    result = data;
                                }
                                else {
                                    result = data.slice(length - 10);
                                }
                                result.forEach(function (item) {
                                    dom1.appendChild(_this.createItem(item));
                                });
                            },
                            ajaxFun: function (_a) {
                                var current = _a.current, pageSize = _a.pageSize, isRefresh = _a.isRefresh;
                                var ajaxPara = "{\"index\"=" + (current + 1) + ",\"size\"=" + pageSize + ",\"total\"=1}";
                                return BwRule_1.BwRule.Ajax.fetch(url + '?state=all', {
                                    data: {
                                        pageparams: ajaxPara
                                    }
                                }).then(function (_a) {
                                    var response = _a.response;
                                    if (current === 0) {
                                        d.query('a', d.queryAll('li', tab.getTab())[0]).innerText = titles[0] + "(" + response.head.totalNum + "\u6761)";
                                    }
                                    return { data: response.data, total: response.head.totalNum };
                                });
                            },
                            pageSize: 10,
                            isPulldownRefresh: true
                        }
                    },
                    {
                        title: titles[1],
                        dom: dom2,
                        dataManager: {
                            render: function (start, length, data, isRefresh) {
                                var result = [];
                                if (isRefresh) {
                                    dom2.innerHTML = '';
                                    result = data;
                                }
                                else {
                                    result = data.slice(length - 10);
                                }
                                result.forEach(function (item) {
                                    dom2.appendChild(_this.createItem(item));
                                });
                            },
                            ajaxFun: function (_a) {
                                var current = _a.current, pageSize = _a.pageSize, isRefresh = _a.isRefresh;
                                var ajaxPara = "{\"index\"=" + (current + 1) + ",\"size\"=" + pageSize + ",\"total\"=1}";
                                return BwRule_1.BwRule.Ajax.fetch(url, {
                                    data: {
                                        pageparams: ajaxPara
                                    }
                                }).then(function (_a) {
                                    var response = _a.response;
                                    if (current === 0) {
                                        d.query('a', d.queryAll('li', tab.getTab())[1]).innerText = titles[1] + "(" + response.head.totalNum + "\u6761)";
                                    }
                                    return { data: response.data, total: response.head.totalNum };
                                });
                            },
                            pageSize: 10,
                            isPulldownRefresh: true
                        }
                    },
                    {
                        title: titles[2],
                        dom: dom3,
                        dataManager: {
                            render: function (start, length, data, isRefresh) {
                                var result = [];
                                if (isRefresh) {
                                    dom3.innerHTML = '';
                                    result = data;
                                }
                                else {
                                    result = data.slice(length - 10);
                                }
                                result.forEach(function (item) {
                                    dom3.appendChild(_this.createItem(item));
                                });
                            },
                            ajaxFun: function (_a) {
                                var current = _a.current, pageSize = _a.pageSize, isRefresh = _a.isRefresh;
                                var ajaxPara = "{\"index\"=" + (current + 1) + ",\"size\"=" + pageSize + ",\"total\"=1}";
                                return BwRule_1.BwRule.Ajax.fetch(url + '?state=already', {
                                    data: {
                                        pageparams: ajaxPara
                                    }
                                }).then(function (_a) {
                                    var response = _a.response;
                                    if (current === 0) {
                                        d.query('a', d.queryAll('li', tab.getTab())[2]).innerText = titles[2] + "(" + response.head.totalNum + "\u6761)";
                                    }
                                    return { data: response.data, total: response.head.totalNum };
                                });
                            },
                            pageSize: 10,
                            isPulldownRefresh: true
                        }
                    }
                ]
            });
        }
        FlowList.prototype.createItem = function (data) {
            var state = '', stateClass = '';
            if (this.flowType === 'application') {
                switch (Number(data.instanceState)) {
                    case 0:
                        {
                            state = '草稿';
                            stateClass = 'draft';
                        }
                        break;
                    case 1:
                        {
                            state = '待审核';
                            stateClass = 'check';
                        }
                        break;
                    case 2:
                        {
                            state = '已撤回';
                            stateClass = 'withdraw';
                        }
                        break;
                    case 3:
                        {
                            state = '已退回';
                            stateClass = 'sendBack';
                        }
                        break;
                    case 4:
                        {
                            state = '已同意';
                            stateClass = 'agree';
                        }
                        break;
                    case 90:
                        {
                            state = '已结案';
                            stateClass = 'close';
                        }
                        break;
                }
            }
            else {
                var taskName = data.taskName;
                switch (Number(data.taskState)) {
                    case 0:
                        {
                            state = taskName + '-' + '待审批';
                            stateClass = 'check';
                        }
                        break;
                    case 1:
                        {
                            state = taskName + '-' + '已审批';
                            stateClass = 'agree';
                        }
                        break;
                }
            }
            return h("div", { className: "item-wrapper", "data-url": tools.url.addObj(BW.CONF.siteUrl + data.auditUrl, { page: 'flowReport' }), "data-instance": data.instanceState },
                h("div", { className: "item-title" },
                    h("span", null,
                        data.processName,
                        "-",
                        data.createUserName),
                    h("i", { className: "iconfont icon-arrow-right" })),
                h("div", { className: "item-content" },
                    h("div", { class: "item-info" },
                        h("div", { className: "item-time" }, this.handlerTime(data.lastUpdateTime)),
                        h("div", { className: "item-state " + stateClass }, state))));
        };
        FlowList.prototype.handlerTime = function (dateStr) {
            var date = new Date(dateStr), year = date.getFullYear(), yearStr = year.toString().slice(2), month = date.getMonth() + 1, monthStr = month >= 10 ? month : '0' + month, day = date.getDate(), dayStr = day >= 10 ? day : '0' + day;
            return yearStr + "/" + monthStr + "/" + dayStr;
        };
        FlowList.prototype.destroy = function () {
            this.initEvents.off();
        };
        return FlowList;
    }());
    exports.FlowList = FlowList;
});

/// <amd-module name="Accessory"/>
define("Accessory", ["require", "exports", "UploadModule", "Modal", "FormCom"], function (require, exports, uploadModule_1, Modal_1, basic_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var Accessory = /** @class */ (function (_super) {
        __extends(Accessory, _super);
        function Accessory(para) {
            var _this = _super.call(this, para) || this;
            var uploader = new uploadModule_1.default({
                uploadUrl: BW.CONF.ajaxUrl.fileUpload,
                nameField: 'FILE_ID',
                // 上传成功
                onComplete: function (res, file) {
                    var fileId = res.data.blobField.value, fileObj = {
                        fileId: fileId,
                        fileName: file.name
                    }, arr = _this.fileArr || [];
                    _this.fileArr = arr.concat(fileObj);
                    d.before(_this.addImg, _this.createImg(_this.getFileUrl(fileId)));
                    _this.wrapper.scrollLeft = _this.wrapper.scrollLeft + 100;
                },
                container: _this.addImg,
                text: '',
                onError: function () {
                    Modal_1.Modal.alert('上传图片失败');
                }
            });
            // 文件加入上传队列
            uploader.com.on('beforeFileQueued', function (file) {
                if (file.type.split('/')[0] === 'image') {
                    var imgsArr = _this.fileArr || [], isExist = false;
                    for (var i = 0, len = imgsArr.length; i < len; i++) {
                        var pic = imgsArr[i];
                        if (pic.fileName === file.name) {
                            Modal_1.Modal.alert('已经添加过该图片');
                            isExist = true;
                        }
                    }
                    if (!!!isExist) {
                        uploader.com.upload();
                    }
                    else {
                        return false;
                    }
                }
                else {
                    Modal_1.Modal.alert('只支持图片格式!');
                    return false;
                }
            });
            return _this;
        }
        Accessory.prototype.set = function (val) {
            var _this = this;
            var values = val || [];
            this.fileArr = values;
            values.forEach(function (file) {
                d.before(_this.addImg, _this.createImg(_this.getFileUrl(file.fileId)));
            });
            this.wrapper.scrollLeft = this.wrapper.scrollLeft + (100 * values.length);
        };
        Object.defineProperty(Accessory.prototype, "value", {
            get: function () {
                return this.get();
            },
            set: function (val) {
                this.set(val);
            },
            enumerable: true,
            configurable: true
        });
        ;
        Accessory.prototype.wrapperInit = function (para) {
            return h("div", { className: "accessory-outer-wrapper" }, this.innerWrapper =
                h("div", { className: "accessory-inner-wrapper" }, this.addImg = h("div", { className: "add-wrapper" },
                    h("div", { className: "add-wrapper-inner" },
                        h("div", { className: "add-icon" }, "+"),
                        h("div", { className: "add-text" }, "\u6DFB\u52A0\u9644\u4EF6")))));
        };
        Object.defineProperty(Accessory.prototype, "fileArr", {
            get: function () {
                return this._fileIdArr;
            },
            set: function (fileIdArr) {
                this._fileIdArr = fileIdArr;
            },
            enumerable: true,
            configurable: true
        });
        Accessory.prototype.createImg = function (url) {
            var imgWrapper = h("div", { className: "upload-img" },
                h("img", { src: url, alt: "\u9644\u4EF6\u56FE\u7247" }));
            return imgWrapper;
        };
        Accessory.prototype.getFileUrl = function (fileId) {
            return tools.url.addObj(BW.CONF.ajaxUrl.fileDownload, {
                md5_field: 'FILE_ID',
                file_id: fileId,
                down: 'allow'
            });
        };
        Accessory.prototype.get = function () {
            return this.fileArr || [];
        };
        return Accessory;
    }(basic_1.FormCom));
    exports.Accessory = Accessory;
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
