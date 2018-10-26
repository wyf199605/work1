/// <amd-module name="ProcessLeave"/>
define("ProcessLeave", ["require", "exports", "BasicPage", "Button", "Modal", "TextInput", "EditModule", "BwRule"], function (require, exports, basicPage_1, Button_1, Modal_1, text_1, editModule_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CONF = BW.CONF;
    var d = G.d;
    var ProcessLeave = /** @class */ (function (_super) {
        __extends(ProcessLeave, _super);
        function ProcessLeave(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            _this.but = {}; //存放button节点
            _this.container = para.dom;
            _this.getLeaveData();
            return _this;
        }
        ProcessLeave.prototype.initPage = function () {
            var eleData = this.resultData.body.elements[0], i, footerBody = '', buttonHtml = '', butName = '', headerHtml, footerHtml, html;
            for (i = 0; i < eleData.fields.length; i++) {
                footerBody += "<li class=\"list-group-item col-xs-12 col-md-3 col-sm-4 col-lg-4\" data-href=\"\" data-var-list=\"\">\n                            <div class=\"list-left\">\n                                <div>" + eleData.fields[i].caption + "<span class=\"colon\">\uFF1A</span></div>\n                            </div>\n                            <div data-col=" + eleData.fields[i].name + " class=\"list-right ellipsis-row3 fold\">                  \n                            </div>\n                            </li>";
            }
            footerHtml = "<div class=\"expense-footer\" style=\"border: 1px solid #ddd;\">\n                                     <ul class=\"list-group full-height has-footer row\" style=\"border: 1px solid #ddd;\">\n                                        " + footerBody + "\n                                     </ul>\n                           </div>";
            for (i = 0; i < eleData.subButtons.length; i++) {
                butName = ProcessLeave.butName[eleData.subButtons[i].title];
                buttonHtml += "<div data-name = \"" + butName + "\" data-caption=\"" + eleData.subButtons[i].caption + "\" class=\"but" + i + "\"></div>";
            }
            headerHtml = "<div class=\"expense-header\">\n                                   " + buttonHtml + "\n                                    <h1>" + this.resultData.caption + "</h1>\n                                    <p>\n                                        <span style=\"margin-left: 15px;\">\u7533\u8BF7\u4EBA:<a>" + eleData.createUserName + "(" + eleData.createUser + ")/" + eleData.createUserPhone + "</a></span>\n                                        <span style=\"float: right; margin-right: 15px;\">\u8868\u5355\u53F7: " + eleData.formNo + " &nbsp;&nbsp;\u7533\u8BF7\u65E5\u671F:" + eleData.createTime + " </span>\n                                    </p>\n                             </div>";
            html = "<div class=\"detailPage\">\n                    " + headerHtml + " \n                    <div class=\"auditMemo\" data-name = 'auditMemo'></div>\n                    " + footerHtml + "           \n                </div>";
            this.container.innerHTML = html;
            this.replaceType();
        };
        ProcessLeave.prototype.replaceType = function () {
            var _this = this;
            var self = this, fields = [], i = 0;
            d.queryAll('[data-name]', this.container).forEach(function (el) {
                switch (el.dataset.name) {
                    case 'saveButton':
                        _this.but['saveButton'] = new Button_1.Button({
                            container: el,
                            content: '保存',
                            type: 'primary',
                            onClick: function (e) {
                                self.butAction(this.parentElement.dataset.caption);
                            }
                        });
                        break;
                    case 'subButton':
                        _this.but['subButton'] = new Button_1.Button({
                            container: el,
                            content: '提交',
                            type: 'primary',
                            onClick: function (e) {
                                self.butAction(this.parentElement.dataset.caption);
                            }
                        });
                        break;
                    case 'backButton':
                        _this.but['backButton'] = new Button_1.Button({
                            container: el,
                            content: '退回',
                            type: 'primary',
                            onClick: function (e) {
                                self.butAction(this.parentElement.dataset.caption);
                            }
                        });
                        break;
                    case 'passButton':
                        _this.but['passButton'] = new Button_1.Button({
                            container: el,
                            content: '通过',
                            type: 'primary',
                            onClick: function (e) {
                                self.butAction(this.parentElement.dataset.caption);
                            }
                        });
                        break;
                    case 'auditMemo':
                        self.auditMemo = new text_1.TextInput({
                            container: el,
                            placeholder: '请输入操作备注'
                        });
                        break;
                }
            });
            d.queryAll('[data-col]', d.query('.expense-footer', this.container)).forEach(function (el) {
                fields.push({
                    dom: el,
                    field: _this.resultData.body.elements[0].fields[i]
                });
                i++;
            });
            var editModule = new editModule_1.EditModule({
                fields: fields
            });
            editModule.set(this.detailData.data[0]);
        };
        ProcessLeave.prototype.dealResData = function (res) {
            //参数
            var table = res.body.elements[0], //sfTable
            uiType = res.uiType; //sfHtml.uiType
            var cols = table.fields, fixedNum = 0;
            for (var i = 0, col = void 0; i < cols.length; i++) {
                col = cols[i];
                if (col.noShow && col.noShow) {
                    continue;
                }
                col.valueLists = col.atrrs.valueLists;
                col.noSum = col.atrrs.noSum; //是否记录总数
                col.dataType = col.atrrs.dataType; //展示格式
                col.displayFormat = col.atrrs.displayFormat; //数据类型
                col.trueExpr = col.atrrs.trueExpr; //数据为真的值
                col.displayWidth = col.atrrs.displayWidth; //显示长度
                // 下钻地址
                if (uiType == 'drill') {
                    fixedNum = 1; // 下钻时锁列数固定为1
                }
                // 自定义钻取地址
                else if (uiType == 'web' || uiType == 'webdrill') {
                    fixedNum = 1; //下钻时锁列数固定为1
                }
                // 锁列数
                else if (i < 2 && (col.name == table.nameField)) {
                    fixedNum = fixedNum + 1;
                }
                if (col.elementType == 'lookup') {
                    //look up
                    col['comType'] = 'selectInput';
                }
                else if ((col.elementType == 'treepick' || col.elementType == 'pick')) {
                    //PICK UP
                    col['comType'] = 'tagsInput';
                    col['multiValue'] = col.atrrs.multValue; //单选或多选
                }
                else if (col.assignAddr) {
                    col['comType'] = 'assignText';
                }
                else if (col.atrrs.dataType == '43') {
                    //文件上传
                    col['comType'] = 'file';
                }
                else if (col.atrrs.dataType == '30') {
                    //富文本
                    col['comType'] = 'richText';
                }
                else if (col.atrrs.dataType == '17') {
                    //toggle
                    col['comType'] = 'toggle';
                }
                else if (col.atrrs.dataType == '12') {
                    //日期时间控件
                    col['comType'] = 'datetime';
                }
                else {
                    col['comType'] = 'input';
                }
            }
            table['fixedNum'] = fixedNum > 0 ? fixedNum : 1; //锁列数;;;;;;;;;;;;;;
            table['pageLen'] = table.multPage == 0 ? 0 : 20;
        };
        ProcessLeave.prototype.butAction = function (butName) {
            var butData = this.resultData.body.elements[0].subButtons, dealBut, tableData = {};
            for (var i = 0; i < butData.length; i++) {
                if (butData[i].caption === butName) {
                    dealBut = butData[i];
                    break;
                }
            }
            d.queryAll('[data-col]', d.query('.expense-footer', this.container)).forEach(function (el) {
                var key = el.dataset.col, inputEle = d.query('input', el), val = inputEle.value;
                tableData[key] = val;
            });
            var result = BwRule_1.BwRule.reqAddr(dealBut.actionAddr, tableData);
            BwRule_1.BwRule.Ajax.fetch(CONF.siteUrl + result, {
                data: (dealBut.caption === '提交' || dealBut.caption === '保存') ? null : { audit_memo: this.auditMemo.get() }
            }).then(function (_a) {
                var response = _a.response;
                Modal_1.Modal.alert(response.msg);
            });
            // Rule.ajax(CONF.siteUrl + result,{
            //     data : (dealBut.caption === '提交' || dealBut.caption ==='保存') ? null :{audit_memo : this.auditMemo.get()},
            //     success: (response) =>{
            //         Modal.alert(response.msg);
            //     }
            // });
            /* let url = d.closest(this.container, '.page-container[data-src]').dataset.src;
            sys.window.close('', null, url);
            sys.window.open({url});*/
        };
        ProcessLeave.prototype.getLeaveData = function () {
            var _this = this;
            this.dealResData(this.para.ui);
            this.resultData = this.para.ui;
            var getDetail = function () {
                // Rule.ajax(CONF.siteUrl + this.resultData.body.elements[0].dataAddr.dataAddr,{
                //     success: (response) => {
                //         this.detailData = response;
                //         this.initPage();
                //     },
                //     error(){
                //         console.log('error');
                //     },
                //     netError(){
                //         console.log('netError');
                //     }
                // });
                BwRule_1.BwRule.Ajax.fetch(CONF.siteUrl + _this.resultData.body.elements[0].dataAddr.dataAddr)
                    .then(function (_a) {
                    var response = _a.response;
                    _this.detailData = response;
                    _this.initPage();
                });
            };
            getDetail();
        };
        ProcessLeave.butName = {
            '提交': 'subButton',
            '保存': 'saveButton',
            '退回': 'backButton',
            '通过': 'passButton'
        };
        return ProcessLeave;
    }(basicPage_1.default));
    exports.ProcessLeave = ProcessLeave;
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
