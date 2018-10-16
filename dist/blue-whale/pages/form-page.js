define(["require", "exports", "BasicPage", "EditModule", "Validate", "Modal", "BwRule", "ButtonAction", "Popover"], function (require, exports, basicPage_1, editModule_1, validate_1, Modal_1, BwRule_1, ButtonAction_1, popover_1) {
    "use strict";
    var d = G.d;
    var tools = G.tools;
    return /** @class */ (function (_super) {
        __extends(FormPage, _super);
        // private loading =  document.querySelector('.loading');
        function FormPage(form, para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            var emPara = { fields: [] };
            var nameFields = {};
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
            // for (let i = 0,dom; dom = domList.item(i); i ++){
            //
            //     let field = {
            //         dom : <HTMLElement>dom.querySelector('[data-input-type]'),
            //         field : nameFields[dom.dataset.name]
            //     };
            //
            //     emPara.fields.push(field);
            //
            //     if(['insert', 'associate'].indexOf(para.uiType) > -1 ? field.field.noModify : field.field.noEdit){
            //         field.dom.classList.add('disabled');
            //     }
            // }
            _this.editModule = new editModule_1.EditModule(emPara);
            // 编辑标识
            _this.initData();
            _this.initEvent();
            return _this;
            // this.initValidate();
        }
        FormPage.prototype.initEvent = function () {
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
            // 1. subButtons > 1 or == 1
            // > 1 => new Popover()
            // == 1
            var target = this.para.dom.querySelector('.btn-group.sub-btn');
            if (tools.isMb) {
                if (para.fm.subButtons.length > 1) {
                    var items = para.fm.subButtons.map(function (item) {
                        return {
                            title: item.title,
                            icon: item.icon
                        };
                    });
                    var popover_2 = new popover_1.Popover({
                        items: items,
                        target: target,
                        isBackground: false,
                        onClick: function (index) {
                            popover_2.show = false;
                            subBtnEvent(index);
                        }
                    });
                }
                else {
                    d.on(target, 'click', function (e) {
                        e.stopPropagation();
                        subBtnEvent(0);
                    });
                }
            }
            else {
                d.on(target, 'click', 'button', function (e) {
                    e.stopPropagation();
                    subBtnEvent(this.dataset.index);
                });
            }
            function subBtnEvent(index) {
                var btn = para.fm.subButtons[index], pageData = self.dataGet();
                switch (btn.subType) {
                    case 'save':
                        // if(!self.validateFormData(pageData)){
                        //     return false;
                        // }
                        btn.hintAfterAction = true;
                        self.save(btn, pageData);
                        break;
                    case 'action':
                        // if(!self.validateFormData(pageData)){
                        //     return false;
                        // }
                        saveBtn.hintAfterAction = false;
                        // 先保存再发送
                        self.save(saveBtn, pageData, function () {
                            ButtonAction_1.ButtonAction.get().clickHandle(btn, self.dataGet(), function () { }, self.url);
                        });
                        break;
                }
            }
        };
        ;
        FormPage.prototype.dataGet = function () {
            var data = this.editModule.get();
            this.para.fm.fields.forEach(function (field) {
                var name = field.name, val = field.atrrs.defaultValue;
                if (field.noEdit && !tools.isEmpty(val)) {
                    data[name] = val;
                }
            });
            return data;
        };
        FormPage.prototype.initValidate = function () {
            var _this = this;
            var fields = this.para.fm.fields;
            this.validate = new validate_1.Validate();
            fields.forEach(function (field) {
                var attrArr = [];
                for (var key in field.atrrs) {
                    attrArr.push({
                        title: field.caption,
                        name: key,
                        value: field.atrrs[key]
                    });
                }
                _this.validate.add(field.name, attrArr);
            });
        };
        FormPage.prototype.validateFormData = function (pageData) {
            // let errorResult = this.validate.start(pageData);
            //
            // if(sys.isMb){
            //     // let res = errorResult[0];
            //     // if(res){
            //     //     Modal.alert(res.errMsg);
            //     // }
            //
            //     return true;
            // }else{
            //     this.para.fm.fields.forEach(field => {
            //         this.editModule.getDom(field.name).error(false);
            //     });
            //
            //     errorResult.forEach(res => {
            //         this.editModule.getDom(res.dataName).error(true,res.errMsg);
            //     });
            //
            //     return !errorResult[0];
            // }
        };
        /**
         * 新增/修改
         * @param btn
         * @param pageData
         * @param callback
         */
        FormPage.prototype.save = function (btn, pageData, callback) {
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
        FormPage.prototype.initData = function () {
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
                    // debugger;
                    data = addOldField(data);
                    //    ajaxLoadedData = response.data[0];
                    _this.editModule.set(data);
                    //    初始数据获取，不包含收件人id
                    // startData = getPageData();
                    if (form.updatefileData) {
                        BwRule_1.BwRule.Ajax.fetch(BwRule_1.BwRule.reqAddr(form.updatefileData, data), {
                            silent: true
                        });
                    }
                });
                // Rule.ajax(BW.CONF.siteUrl + Rule.reqAddr(form.dataAddr), {
                //     success: (response) => {
                //         //	    alert(JSON.stringify(response));
                //         let data = response.data[0];
                //         if (!data) {
                //             Modal.alert('数据为空');
                //             return;
                //         }
                //
                //         // debugger;
                //         data = addOldField(data);
                //
                //         //    ajaxLoadedData = response.data[0];
                //         this.editModule.set(data);
                //         //    初始数据获取，不包含收件人id
                //         // startData = getPageData();
                //         if (form.updatefileData) {
                //             Rule.ajax(Rule.reqAddr(form.updatefileData,  data), {
                //                 silent: true
                //             });
                //         }
                //     }
                // });
            }
        };
        return FormPage;
    }(basicPage_1.default));
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
