/// <amd-module name="MailPage"/>
define("MailPage", ["require", "exports", "Mail", "Modal", "BwRule", "FastTable", "newTableModule", "BasicPage"], function (require, exports, mail_1, Modal_1, BwRule_1, FastTable_1, newTableModule_1, basicPage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var d = G.d;
    var MailPage = /** @class */ (function (_super) {
        __extends(MailPage, _super);
        function MailPage(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            _this.wrapper = h("div", { className: "mail-wrapper" });
            para.dom.classList.add('mail-container');
            d.append(para.dom, _this.wrapper);
            var uiBody = para.ui.body;
            // 去除编辑功能配置
            uiBody.elements[0] && delete uiBody.elements[0].tableAddr;
            // 获取subButton配置
            if (Array.isArray(uiBody.subButtons) && uiBody.elements[0]) {
                var subBtn = uiBody.elements[0].subButtons;
                uiBody.elements[0].subButtons = Array.isArray(subBtn) ? subBtn : [];
                uiBody.subButtons.forEach(function (btn) {
                    uiBody.elements[0].subButtons.push(btn);
                });
            }
            // 去除链接
            for (var _i = 0, _a = uiBody.elements[0].cols; _i < _a.length; _i++) {
                var col = _a[_i];
                if (col.name === 'READSTATE') {
                    col.noShow = true;
                }
                else if (tools.isNotEmpty(col.link)) {
                    delete col.link;
                }
            }
            _this.tableModule = new newTableModule_1.NewTableModule({
                bwEl: uiBody.elements[0],
                container: _this.wrapper
            });
            var ftable = _this.tableModule.main.ftable, pseudoTable = ftable.pseudoTable, self = _this;
            // 点击表格出现邮件详情页
            ftable.click.add('.section-inner-wrapper tbody tr[data-index]', function () {
                var rowIndex = parseInt(this.dataset.index), row = ftable.rowGet(rowIndex);
                if (row) {
                    pseudoTable && pseudoTable.setPresentSelected(rowIndex);
                    self.initMail(rowIndex, ftable.data);
                }
            });
            // 初始化第一行的邮件详情页
            ftable.on(FastTable_1.FastTable.EVT_RENDERED, function () {
                try {
                    if (ftable.data.length > 0) {
                        pseudoTable && pseudoTable.setPresentSelected(0);
                        ftable.rows[0] && (ftable.rows[0].selected = true);
                        ftable._drawSelectedCells();
                        self.initMail(0, ftable.data);
                    }
                }
                catch (e) {
                }
            });
            return _this;
            // setTimeout(() => {
            //     this.initMail(0);
            //
            // }, 1000);
        }
        // 初始化邮件详情的模态框
        MailPage.prototype.initModal = function (body) {
            // d.append(this.para.dom, mailWrapper);
            return new Modal_1.Modal({
                body: body,
                position: 'right',
                fullPosition: 'fixed',
                container: this.para.dom,
                isBackground: false,
                className: 'modal-mail',
                isAnimate: true,
                isShow: true,
                width: '400px',
                top: 50,
                header: {
                    title: '详情',
                    isFullScreen: true,
                },
                isDrag: true,
                isOnceDestroy: true
            });
        };
        MailPage.prototype.initMail = function (index, data) {
            var _this = this;
            var body = h("div", { className: "mail-body" }), ftable = this.tableModule.main.ftable, pseudoTable = ftable.pseudoTable, link = ftable.columnGet('READSTATE').content.link;
            // 判断Modal是否存在，不存在重新初始化一个
            if (this.modal && this.modal.isShow) {
                this.modal.body = body;
            }
            else {
                this.modal = this.initModal(body);
            }
            // 初始化邮件详情页内容
            this.mail = new mail_1.Mail({
                link: BwRule_1.BwRule.reqAddr(link, data[index]),
                index: index,
                container: body,
                modal: this.modal,
                table: this.tableModule.main,
                onChange: function (index) {
                    // 点击邮件详情页上一封、下一封，触发的事件
                    ftable._clearAllSelectedCells();
                    pseudoTable && pseudoTable.setPresentSelected(index);
                    ftable.rows[index] && (ftable.rows[index].selected = true);
                    ftable._drawSelectedCells();
                    _this.initMail(index, data);
                }
            });
            // !this.modal.isShow && (this.modal.isShow = true);
        };
        return MailPage;
    }(basicPage_1.default));
    exports.MailPage = MailPage;
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
