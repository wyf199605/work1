/// <amd-module name="ProcessSeekList"/>
define("ProcessSeekList", ["require", "exports", "BasicPage", "TableModulePc", "Button", "Modal"], function (require, exports, basicPage_1, TableModulePc, Button_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var sys = BW.sys;
    var CONF = BW.CONF;
    var ProcessSeekList = /** @class */ (function (_super) {
        __extends(ProcessSeekList, _super);
        function ProcessSeekList(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            _this.container = para.dom;
            _this.initPage();
            return _this;
        }
        ProcessSeekList.prototype.initPage = function () {
            var butHtml;
            butHtml = "<div data-name = \"check\" class=\"check\"></div>";
            this.container.innerHTML = butHtml;
            this.initTable();
            this.replaceType();
        };
        ProcessSeekList.prototype.initTable = function () {
            var tempTable = d.create('<table><tbody></tbody></table>');
            this.container.appendChild(tempTable);
            var tableConf = {
                cols: [{
                        title: "表单名称",
                        name: "caption"
                    }, {
                        title: "申请者",
                        name: "createUserName"
                    }, {
                        title: "申请日期",
                        name: "taskCreateTime"
                    }, {
                        title: "上个签核者",
                        name: "lastUpdateUserName"
                    }, {
                        title: "表单号",
                        name: "formNo"
                    }],
                dataAddr: {
                    dataAddr: "/" + CONF.appid + "/" + CONF.version + "/flow/system/list/?output=json"
                },
                fixedNum: 1,
                multPage: 2,
                isSub: true,
                multiSelect: false
            };
            this.table = new TableModulePc({
                tableEl: tempTable,
                scrollEl: this.container
            }, tableConf).table;
        };
        ProcessSeekList.prototype.replaceType = function () {
            var _this = this;
            var self = this;
            d.queryAll('[data-name]', this.container).forEach(function (el) {
                switch (el.dataset.name) {
                    case 'check':
                        _this.checkBut = new Button_1.Button({
                            container: el,
                            content: '审阅',
                            type: 'primary',
                            onClick: function (e) {
                                if (_this.table.rowSelectDataGet().length === 0) {
                                    Modal_1.Modal.alert('请选择一条数据');
                                    return false;
                                }
                                var url = '/sf' + self.table.rowSelectDataGet()[0].auditUrl + '?page=processLeave';
                                sys.window.open({ url: url });
                            }
                        });
                        break;
                }
            });
        };
        return ProcessSeekList;
    }(basicPage_1.default));
    exports.ProcessSeekList = ProcessSeekList;
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
