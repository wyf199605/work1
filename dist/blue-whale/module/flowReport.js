define("FlowBase", ["require", "exports", "ListItemDetail"], function (require, exports, ListItemDetail_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FlowBase = /** @class */ (function () {
        function FlowBase(para) {
            switch (para.uiType) {
                case 'flow':
                    {
                        // new FlowReport(para);
                        var json = "{\"uiType\":\"view\",\"caption\":\"收件箱详情\",\"body\":{\"subButtons\":[{\"signId\":\"cycle\",\"signName\":\"圆圈\",\"signType\":\"0\",\"caption\":\"新增\",\"title\":\"新增\",\"icon\":\"mui-icon mui-icon-compose\",\"actionAddr\":{\"type\":\"none\",\"needGps\":0,\"dataAddr\":\"/app_sanfu_retail/null/ui/insert/n1174_data-4\",\"varType\":0,\"addrType\":false,\"commitType\":1},\"buttonType\":0,\"subType\":\"\",\"openType\":\"newwin\",\"hintBeforeAction\":false,\"refresh\":0,\"multiselect\":0,\"haveRoll\":false}],\"elements\":[{\"caption\":\"收件箱详情\",\"fields\":[{\"name\":\"MAILID\",\"caption\":\"邮件编号\",\"noModify\":true,\"noEdit\":true,\"noShow\":true,\"noAdd\":true,\"atrrs\":{\"fieldName\":\"MAILID\",\"trueExpr\":\"\",\"defaultValue\":\"\",\"minLength\":0,\"noSort\":0,\"imeOpen\":0,\"caption\":\"邮件编号\",\"inputHint\":\"\",\"allowScan\":0,\"noSum\":0,\"readOnlyFlag\":0,\"multiValueFlag\":0,\"checkMessage\":\"\",\"minValue\":\"\",\"checkExpress\":\"\",\"dataTypeFlag\":0,\"requieredFlag\":0,\"noEdit\":1,\"valueListType\":0,\"falseExpr\":\"\",\"valueLists\":\"\",\"editFormt\":\"\",\"maxValue\":1,\"dataType\":\"\",\"noCopy\":0,\"displayFormat\":\"\",\"imeCare\":0,\"displayWidth\":0,\"invalidChars\":\"\",\"hyperRes\":\"\",\"validChars\":\"\",\"alignment\":0,\"maxLength\":0},\"supportLink\":false},{\"name\":\"SHO_ID\",\"caption\":\"店号\",\"noModify\":true,\"noEdit\":true,\"noShow\":false,\"noAdd\":false,\"atrrs\":{\"fieldName\":\"SHO_ID\",\"trueExpr\":\"\",\"defaultValue\":\"\",\"minLength\":0,\"noSort\":0,\"imeOpen\":0,\"caption\":\"店号\",\"inputHint\":\"\",\"allowScan\":0,\"noSum\":0,\"readOnlyFlag\":0,\"multiValueFlag\":0,\"checkMessage\":\"\",\"minValue\":\"\",\"checkExpress\":\"\",\"dataTypeFlag\":0,\"requieredFlag\":0,\"noEdit\":0,\"valueListType\":7,\"falseExpr\":\"\",\"valueLists\":\"\",\"editFormt\":\"\",\"maxValue\":1,\"dataType\":\"\",\"noCopy\":0,\"displayFormat\":\"\",\"imeCare\":0,\"displayWidth\":10,\"invalidChars\":\"\",\"hyperRes\":\"\",\"validChars\":\"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ;\",\"alignment\":0,\"maxLength\":0},\"supportLink\":false},{\"name\":\"DEPART\",\"caption\":\"所在部门\",\"noModify\":true,\"noEdit\":true,\"noShow\":false,\"noAdd\":false,\"atrrs\":{\"fieldName\":\"DEPART\",\"trueExpr\":\"\",\"defaultValue\":\"\",\"minLength\":0,\"noSort\":0,\"imeOpen\":0,\"caption\":\"所在部门\",\"inputHint\":\"\",\"allowScan\":0,\"noSum\":0,\"readOnlyFlag\":0,\"multiValueFlag\":0,\"checkMessage\":\"\",\"minValue\":\"\",\"checkExpress\":\"\",\"dataTypeFlag\":0,\"requieredFlag\":0,\"noEdit\":0,\"valueListType\":3,\"falseExpr\":\"\",\"valueLists\":\"\",\"editFormt\":\"\",\"maxValue\":1,\"dataType\":\"\",\"noCopy\":0,\"displayFormat\":\"\",\"imeCare\":0,\"displayWidth\":12,\"invalidChars\":\"\",\"hyperRes\":\"\",\"validChars\":\"\",\"alignment\":0,\"maxLength\":0},\"elementType\":\"value\",\"dataAddr\":{\"type\":\"none\",\"needGps\":0,\"dataAddr\":\"/app_sanfu_retail/null/value/n1092_data-3/o-value-60100\",\"varType\":0,\"addrType\":false,\"commitType\":1},\"supportLink\":false},{\"name\":\"AUTHORID\",\"caption\":\"作者编号\",\"noModify\":true,\"noEdit\":true,\"noShow\":false,\"noAdd\":false,\"atrrs\":{\"fieldName\":\"AUTHORID\",\"trueExpr\":\"\",\"defaultValue\":\"CMS3\",\"minLength\":0,\"noSort\":0,\"imeOpen\":0,\"caption\":\"作者编号\",\"inputHint\":\"\",\"allowScan\":0,\"noSum\":0,\"readOnlyFlag\":0,\"multiValueFlag\":0,\"checkMessage\":\"\",\"minValue\":\"\",\"checkExpress\":\"\",\"dataTypeFlag\":0,\"requieredFlag\":0,\"noEdit\":1,\"valueListType\":0,\"falseExpr\":\"\",\"valueLists\":\"\",\"editFormt\":\"\",\"maxValue\":1,\"dataType\":\"\",\"noCopy\":0,\"displayFormat\":\"\",\"imeCare\":0,\"displayWidth\":0,\"invalidChars\":\"\",\"hyperRes\":\"\",\"validChars\":\"\",\"alignment\":0,\"maxLength\":0},\"supportLink\":false},{\"name\":\"SENDER\",\"caption\":\"发件人\",\"noModify\":true,\"noEdit\":true,\"noShow\":false,\"noAdd\":false,\"atrrs\":{\"fieldName\":\"SENDER\",\"trueExpr\":\"\",\"defaultValue\":\"\",\"minLength\":0,\"noSort\":0,\"imeOpen\":0,\"caption\":\"发件人\",\"inputHint\":\"\",\"allowScan\":0,\"noSum\":0,\"readOnlyFlag\":0,\"multiValueFlag\":0,\"checkMessage\":\"\",\"minValue\":\"\",\"checkExpress\":\"\",\"dataTypeFlag\":0,\"requieredFlag\":0,\"noEdit\":1,\"valueListType\":0,\"falseExpr\":\"\",\"valueLists\":\"\",\"editFormt\":\"\",\"maxValue\":\"\",\"dataType\":\"\",\"noCopy\":0,\"displayFormat\":\"\",\"imeCare\":0,\"displayWidth\":0,\"invalidChars\":\"\",\"hyperRes\":\"action-hyper-1\",\"validChars\":\"\",\"alignment\":0,\"maxLength\":0},\"supportLink\":true,\"link\":{\"type\":\"table\",\"needGps\":0,\"dataAddr\":\"/app_sanfu_retail/null/ui/action/n1092_data-3/action-hyper-1\",\"varList\":[{\"varName\":\"AUTHORID\"}],\"varType\":0,\"addrType\":false,\"commitType\":1}},{\"name\":\"RECEIVERID\",\"caption\":\"收件人编号\",\"noModify\":true,\"noEdit\":true,\"noShow\":false,\"noAdd\":false,\"atrrs\":{\"fieldName\":\"RECEIVERID\",\"trueExpr\":\"\",\"defaultValue\":\"\",\"minLength\":0,\"noSort\":0,\"imeOpen\":0,\"caption\":\"收件人编号\",\"inputHint\":\"\",\"allowScan\":0,\"noSum\":0,\"readOnlyFlag\":0,\"multiValueFlag\":1,\"checkMessage\":\"\",\"minValue\":\"\",\"checkExpress\":\"\",\"dataTypeFlag\":0,\"requieredFlag\":1,\"noEdit\":0,\"valueListType\":0,\"falseExpr\":\"\",\"valueLists\":\"\",\"editFormt\":\"\",\"maxValue\":1,\"dataType\":\"\",\"noCopy\":0,\"displayFormat\":\"\",\"imeCare\":0,\"displayWidth\":20,\"invalidChars\":\"\",\"hyperRes\":\"\",\"validChars\":\"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ;\",\"alignment\":0,\"maxLength\":0},\"supportLink\":false},{\"name\":\"RECEIVER\",\"caption\":\"收件人\",\"noModify\":true,\"noEdit\":true,\"noShow\":false,\"noAdd\":false,\"atrrs\":{\"fieldName\":\"RECEIVER\",\"trueExpr\":\"\",\"defaultValue\":\"\",\"minLength\":0,\"noSort\":0,\"imeOpen\":0,\"caption\":\"收件人\",\"inputHint\":\"\",\"allowScan\":0,\"noSum\":0,\"readOnlyFlag\":0,\"multiValueFlag\":0,\"checkMessage\":\"\",\"minValue\":\"\",\"checkExpress\":\"\",\"dataTypeFlag\":0,\"requieredFlag\":0,\"noEdit\":0,\"valueListType\":0,\"falseExpr\":\"\",\"valueLists\":\"\",\"editFormt\":\"\",\"maxValue\":\"\",\"dataType\":\"\",\"noCopy\":0,\"displayFormat\":\"\",\"imeCare\":0,\"displayWidth\":30,\"invalidChars\":\"\",\"hyperRes\":\"\",\"validChars\":\"\",\"alignment\":0,\"maxLength\":0},\"supportLink\":false},{\"name\":\"JOBNAME\",\"caption\":\"岗位\",\"noModify\":true,\"noEdit\":true,\"noShow\":false,\"noAdd\":false,\"atrrs\":{\"fieldName\":\"JOBNAME\",\"trueExpr\":\"\",\"defaultValue\":\"\",\"minLength\":0,\"noSort\":0,\"imeOpen\":0,\"caption\":\"岗位\",\"inputHint\":\"\",\"allowScan\":0,\"noSum\":0,\"readOnlyFlag\":0,\"multiValueFlag\":0,\"checkMessage\":\"\",\"minValue\":\"\",\"checkExpress\":\"\",\"dataTypeFlag\":0,\"requieredFlag\":0,\"noEdit\":0,\"valueListType\":7,\"falseExpr\":\"\",\"valueLists\":\"\",\"editFormt\":\"\",\"maxValue\":1,\"dataType\":\"\",\"noCopy\":0,\"displayFormat\":\"\",\"imeCare\":0,\"displayWidth\":30,\"invalidChars\":\"\",\"hyperRes\":\"\",\"validChars\":\"\",\"alignment\":0,\"maxLength\":0},\"supportLink\":false},{\"name\":\"TITLE\",\"caption\":\"标题\",\"noModify\":true,\"noEdit\":true,\"noShow\":false,\"noAdd\":false,\"atrrs\":{\"fieldName\":\"TITLE\",\"trueExpr\":\"\",\"defaultValue\":\"\",\"minLength\":0,\"noSort\":0,\"imeOpen\":0,\"caption\":\"标题\",\"inputHint\":\"\",\"allowScan\":0,\"noSum\":0,\"readOnlyFlag\":0,\"multiValueFlag\":0,\"checkMessage\":\"\",\"minValue\":\"\",\"checkExpress\":\"\",\"dataTypeFlag\":0,\"requieredFlag\":1,\"noEdit\":0,\"valueListType\":0,\"falseExpr\":\"\",\"valueLists\":\"\",\"editFormt\":\"\",\"maxValue\":0,\"dataType\":\"\",\"noCopy\":0,\"displayFormat\":\"\",\"imeCare\":0,\"displayWidth\":0,\"invalidChars\":\"\",\"hyperRes\":\"\",\"validChars\":\"\",\"alignment\":0,\"maxLength\":20},\"supportLink\":false},{\"name\":\"ATTACHNAME\",\"caption\":\"附件\",\"noModify\":true,\"noEdit\":true,\"noShow\":false,\"noAdd\":false,\"atrrs\":{\"fieldName\":\"ATTACHNAME\",\"trueExpr\":\"\",\"defaultValue\":\"\",\"minLength\":0,\"noSort\":0,\"imeOpen\":0,\"caption\":\"附件\",\"inputHint\":\"\",\"allowScan\":0,\"noSum\":0,\"readOnlyFlag\":0,\"multiValueFlag\":0,\"checkMessage\":\"\",\"minValue\":\"\",\"checkExpress\":\"\",\"dataTypeFlag\":0,\"requieredFlag\":0,\"noEdit\":0,\"valueListType\":0,\"falseExpr\":\"\",\"valueLists\":\"\",\"editFormt\":\"\",\"maxValue\":1,\"dataType\":\"43\",\"noCopy\":0,\"displayFormat\":\"\",\"imeCare\":0,\"displayWidth\":30,\"invalidChars\":\"\",\"hyperRes\":\"\",\"validChars\":\"\",\"alignment\":0,\"maxLength\":0},\"supportLink\":true,\"link\":{\"type\":\"file\",\"needGps\":0,\"dataAddr\":\"/rest/attachment/download/file?name_field=ATTACHNAME&md5_field=FILE_ID&app_id=app_sanfu_retail&sys_version_id=null\",\"varList\":[{\"varName\":\"FILE_ID\"},{\"varName\":\"ATTACHNAME\"}],\"varType\":0,\"addrType\":false,\"commitType\":1}},{\"name\":\"URGENT\",\"caption\":\"加急\",\"noModify\":true,\"noEdit\":true,\"noShow\":false,\"noAdd\":false,\"atrrs\":{\"fieldName\":\"URGENT\",\"trueExpr\":\"\",\"defaultValue\":\"0\",\"minLength\":0,\"noSort\":0,\"imeOpen\":0,\"caption\":\"加急\",\"inputHint\":\"\",\"allowScan\":0,\"noSum\":0,\"readOnlyFlag\":0,\"multiValueFlag\":0,\"checkMessage\":\"\",\"minValue\":\"\",\"checkExpress\":\"\",\"dataTypeFlag\":0,\"requieredFlag\":0,\"noEdit\":0,\"valueListType\":0,\"falseExpr\":\"\",\"valueLists\":\"\",\"editFormt\":\"\",\"maxValue\":\"\",\"dataType\":\"17\",\"noCopy\":0,\"displayFormat\":\"\",\"imeCare\":0,\"displayWidth\":0,\"invalidChars\":\"\",\"hyperRes\":\"\",\"validChars\":\"\",\"alignment\":0,\"maxLength\":0},\"supportLink\":false},{\"name\":\"CREATETIME\",\"caption\":\"创建时间\",\"noModify\":true,\"noEdit\":true,\"noShow\":false,\"noAdd\":false,\"atrrs\":{\"fieldName\":\"CREATETIME\",\"trueExpr\":\"\",\"defaultValue\":\"%date%\",\"minLength\":0,\"noSort\":0,\"imeOpen\":0,\"caption\":\"创建时间\",\"inputHint\":\"\",\"allowScan\":0,\"noSum\":0,\"readOnlyFlag\":0,\"multiValueFlag\":0,\"checkMessage\":\"\",\"minValue\":\"\",\"checkExpress\":\"\",\"dataTypeFlag\":4,\"requieredFlag\":0,\"noEdit\":1,\"valueListType\":0,\"falseExpr\":\"\",\"valueLists\":\"\",\"editFormt\":\"\",\"maxValue\":\"\",\"dataType\":\"12\",\"noCopy\":0,\"displayFormat\":\"yyyy-MM-dd HH:mm:ss\",\"imeCare\":0,\"displayWidth\":0,\"invalidChars\":\"\",\"hyperRes\":\"\",\"validChars\":\"\",\"alignment\":0,\"maxLength\":0},\"supportLink\":false},{\"name\":\"FETCHTIME\",\"caption\":\"接收时间\",\"noModify\":true,\"noEdit\":true,\"noShow\":false,\"noAdd\":false,\"atrrs\":{\"fieldName\":\"FETCHTIME\",\"trueExpr\":\"\",\"defaultValue\":\"\",\"minLength\":0,\"noSort\":0,\"imeOpen\":0,\"caption\":\"接收时间\",\"inputHint\":\"\",\"allowScan\":0,\"noSum\":0,\"readOnlyFlag\":0,\"multiValueFlag\":0,\"checkMessage\":\"\",\"minValue\":\"\",\"checkExpress\":\"\",\"dataTypeFlag\":8,\"requieredFlag\":0,\"noEdit\":1,\"valueListType\":0,\"falseExpr\":\"\",\"valueLists\":\"\",\"editFormt\":\"\",\"maxValue\":\"\",\"dataType\":\"12\",\"noCopy\":0,\"displayFormat\":\"yyyy-MM-dd HH:mm:ss\",\"imeCare\":0,\"displayWidth\":0,\"invalidChars\":\"\",\"hyperRes\":\"\",\"validChars\":\"\",\"alignment\":0,\"maxLength\":0},\"supportLink\":false},{\"name\":\"CONTENT\",\"caption\":\"内容\",\"noModify\":true,\"noEdit\":true,\"noShow\":false,\"noAdd\":false,\"atrrs\":{\"fieldName\":\"CONTENT\",\"trueExpr\":\"\",\"defaultValue\":\"\",\"minLength\":0,\"noSort\":0,\"imeOpen\":0,\"caption\":\"内容\",\"inputHint\":\"\",\"allowScan\":0,\"noSum\":0,\"readOnlyFlag\":0,\"multiValueFlag\":0,\"checkMessage\":\"\",\"minValue\":\"\",\"checkExpress\":\"\",\"dataTypeFlag\":3,\"requieredFlag\":1,\"noEdit\":0,\"valueListType\":0,\"falseExpr\":\"\",\"valueLists\":\"\",\"editFormt\":\"\",\"maxValue\":\"\",\"dataType\":\"30\",\"noCopy\":0,\"displayFormat\":\"\",\"imeCare\":0,\"displayWidth\":0,\"invalidChars\":\"\",\"hyperRes\":\"\",\"validChars\":\"\",\"alignment\":0,\"maxLength\":100},\"supportLink\":false},{\"name\":\"FILE_ID\",\"caption\":\"MD5\",\"noModify\":true,\"noEdit\":true,\"noShow\":true,\"noAdd\":true,\"atrrs\":{\"fieldName\":\"FILE_ID\",\"trueExpr\":\"\",\"defaultValue\":\"\",\"minLength\":0,\"noSort\":0,\"imeOpen\":0,\"caption\":\"MD5\",\"inputHint\":\"\",\"allowScan\":0,\"noSum\":0,\"readOnlyFlag\":0,\"multiValueFlag\":0,\"checkMessage\":\"\",\"minValue\":\"\",\"checkExpress\":\"\",\"dataTypeFlag\":0,\"requieredFlag\":0,\"noEdit\":0,\"valueListType\":0,\"falseExpr\":\"\",\"valueLists\":\"\",\"editFormt\":\"\",\"maxValue\":\"\",\"dataType\":\"\",\"noCopy\":0,\"displayFormat\":\"\",\"imeCare\":0,\"displayWidth\":32,\"invalidChars\":\"\",\"hyperRes\":\"\",\"validChars\":\"\",\"alignment\":0,\"maxLength\":0},\"supportLink\":false}],\"subButtons\":[{\"caption\":\"删除\",\"title\":\"删除\",\"icon\":\"icon_delete\",\"actionAddr\":{\"type\":\"none\",\"needGps\":0,\"dataAddr\":\"/app_sanfu_retail/null/list/n1092_data-3?nopage=true&mailid=ZBZX0000487\",\"varList\":[{\"varName\":\"CURRENTUSERID\"}],\"varType\":3,\"addrType\":false,\"commitType\":1},\"buttonType\":3,\"subType\":\"delete\",\"openType\":\"none\",\"hintBeforeAction\":true,\"refresh\":3,\"multiselect\":2,\"haveRoll\":false},{\"selectionFlag\":0,\"caption\":\"查看收件人\",\"title\":\"查看收件人\",\"icon\":\"EXPRDATA\",\"actionAddr\":{\"type\":\"table\",\"needGps\":0,\"dataAddr\":\"/app_sanfu_retail/null/ui/action/n1092_data-3/action-374\",\"varList\":[{\"varName\":\"MAILID\"}],\"varType\":0,\"addrType\":false,\"commitType\":1},\"buttonType\":0,\"subType\":\"action\",\"openType\":\"newwin\",\"hintBeforeAction\":false,\"refresh\":1,\"multiselect\":1,\"haveRoll\":false},{\"caption\":\"转发\",\"title\":\"转发\",\"icon\":\"TRANSMIT\",\"actionAddr\":{\"type\":\"panel\",\"needGps\":0,\"dataAddr\":\"/app_sanfu_retail/null/ui/associate/n1092_data-3/associate-3\",\"varList\":[{\"varName\":\"MAILID\"}],\"varType\":0,\"addrType\":false,\"commitType\":1},\"buttonType\":0,\"subType\":\"associate\",\"openType\":\"newwin\",\"hintBeforeAction\":false,\"refresh\":0,\"multiselect\":1,\"haveRoll\":false},{\"caption\":\"回复所有\",\"title\":\"回复所有\",\"icon\":\"REPLYMAIL\",\"actionAddr\":{\"type\":\"panel\",\"needGps\":0,\"dataAddr\":\"/app_sanfu_retail/null/ui/associate/n1092_data-3/associate-90000\",\"varList\":[{\"varName\":\"MAILID\"}],\"varType\":0,\"addrType\":false,\"commitType\":1},\"buttonType\":0,\"subType\":\"associate\",\"openType\":\"newwin\",\"hintBeforeAction\":false,\"refresh\":0,\"multiselect\":1,\"haveRoll\":false},{\"caption\":\"回复\",\"title\":\"回复\",\"icon\":\"REPLYMAIL\",\"actionAddr\":{\"type\":\"panel\",\"needGps\":0,\"dataAddr\":\"/app_sanfu_retail/null/ui/associate/n1092_data-3/associate-1\",\"varList\":[{\"varName\":\"MAILID\"}],\"varType\":0,\"addrType\":false,\"commitType\":1},\"buttonType\":0,\"subType\":\"associate\",\"openType\":\"newwin\",\"hintBeforeAction\":false,\"refresh\":0,\"multiselect\":1,\"haveRoll\":false}],\"scannableTime\":0,\"dataAddr\":{\"type\":\"none\",\"needGps\":0,\"dataAddr\":\"/app_sanfu_retail/null/list/n1092_data-3?nopage=true&mailid=ZBZX0000487\",\"varType\":0,\"addrType\":false,\"commitType\":1},\"updatefileData\":{\"type\":\"none\",\"needGps\":0,\"dataAddr\":\"/rest/attachment/update/filedata?\",\"varList\":[{\"varName\":\"FILE_ID\"}],\"varType\":0,\"addrType\":false,\"commitType\":1}}]}}";
                        var jsonObj = JSON.parse(json);
                        new ListItemDetail_1.ListItemDetail({
                            uiType: jsonObj.uiType,
                            fm: {
                                caption: jsonObj.body.elements[0].caption,
                                fields: jsonObj.body.elements[0].fields,
                                subButtons: jsonObj.body.elements[0].subButtons,
                                defDataAddrList: jsonObj.body.elements[0].defDataAddrList || [],
                                dataAddr: jsonObj.body.elements[0].dataAddr,
                                updatefileData: jsonObj.body.elements[0].updatefileData
                            },
                            dom: para.dom
                        });
                    }
                    break;
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
