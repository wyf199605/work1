define("Mail", ["require", "exports", "InputBox", "Button", "Loading", "UserSelect", "BwRule", "BwInventoryBtnFun", "ButtonAction"], function (require, exports, InputBox_1, Button_1, loading_1, userSelect_1, BwRule_1, InventoryBtn_1, ButtonAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="Mail"/>
    var d = G.d;
    var tools = G.tools;
    var CONF = BW.CONF;
    var Mail = /** @class */ (function () {
        function Mail(para) {
            this.isOne = true;
            this.ajax = new BwRule_1.BwRule.Ajax();
            this.p = para;
            this.len = para.table.ftable.data.length;
            this.ajaxLoad(para.link, para.index);
            new userSelect_1.UserSelect({
                target: para.container,
            });
        }
        Mail.prototype.btnEvent = function (fields) {
            var _this = this;
            this.tpl = this.detailTpl(fields);
            this.p.container.appendChild(this.tpl);
            var down = d.query('.icon-arrow-down', this.tpl), up = d.query('.icon-arrow-up', this.tpl), mailHide = d.query('.mail-hide', this.tpl), avatar = d.query('.mail-avatar', this.tpl), rightBtn = d.query('.btn-group-right', this.tpl), title = d.query('.mail-title', this.tpl);
            //翻页
            var rightBox = new InputBox_1.InputBox({
                container: rightBtn,
                size: 'small',
            });
            this.prePage = new Button_1.Button({
                content: '上一封',
                size: 'small',
                onClick: function () {
                    if (_this.index > 0) {
                        _this.turnPage(_this.index - 1);
                    }
                }
            });
            this.nextPage = new Button_1.Button({
                content: '下一封',
                size: 'small',
                onClick: function () {
                    if (_this.index < _this.len - 1) {
                        _this.turnPage(_this.index + 1);
                    }
                }
            });
            rightBox.addItem(this.prePage);
            rightBox.addItem(this.nextPage);
            //更多
            if (down) {
                d.on(down, 'click', function () {
                    mailHide.classList.remove('mail-hide');
                });
                d.on(up, 'click', function () {
                    mailHide.classList.add('mail-hide');
                });
            }
            var self = this;
            d.on(this.p.container, 'click', '.txt-left [data-href]:not([data-href=""])', function () {
                BwRule_1.BwRule.link({
                    link: this.dataset.href,
                    varList: JSON.parse(this.dataset.varList),
                    data: self.ajaxData,
                    dataType: this.dataset.dataType,
                });
            });
            //头像
            // let avatar5 = new Avatar({
            //     container: avatar,
            //     size:'large',
            //     shape:'square',
            //     type:'text',
            //     content:'陈'
            // });
        };
        /**
         * 设置表格数据量
         * @param data
         * @param length
         */
        // setArr(data,length){
        //     this.p.urlArr = data;
        //     this.len = length;
        // }
        Mail.prototype.turnPage = function (newIndex) {
            typeof this.p.onChange === 'function' && this.p.onChange(newIndex);
            // let trs = d.queryAll('tbody tr[data-index]', this.p.table.wrapper);
            // this.ajaxLoad(this.p.urlArr[newIndex], newIndex);
            // trs[newIndex].classList.remove('tr-read');
            // //选中效果
            // this.p.table.table.rowSelect(trs[newIndex]);
        };
        Mail.prototype.dataAdd = function (data, index) {
            this.index = index;
            if (index === 0) {
                this.prePage.getDom().classList.add('disabled');
            }
            else {
                this.prePage.getDom().classList.remove('disabled');
            }
            if (index === this.len - 1) {
                this.nextPage.getDom().classList.add('disabled');
            }
            else {
                this.nextPage.getDom().classList.remove('disabled');
            }
            for (var item in data) {
                if (item !== 'READSTATE') {
                    var dom = d.query('[data-name="' + item + '"]', this.tpl);
                    if (dom) {
                        dom.innerHTML = data[item];
                        var classList = dom.parentElement.classList;
                        if (item === 'ATTACHNAME') {
                            classList = dom.parentElement.parentElement.classList;
                        }
                        if (!data[item]) {
                            classList.add('hide');
                        }
                        else {
                            classList.remove('hide');
                        }
                    }
                }
            }
        };
        Mail.prototype.initSubBtns = function (btnsUi) {
            var _this = this;
            this.btnWrapper = h("div", { className: "mail-btn-group" });
            var box = new InputBox_1.InputBox({
                container: this.btnWrapper,
                isResponsive: !tools.isMb,
            });
            var ftable = this.p.table.ftable;
            Array.isArray(btnsUi) && btnsUi.forEach(function (btnUi) {
                var btn = new Button_1.Button({
                    icon: btnUi.icon,
                    content: btnUi.title,
                    isDisabled: !(btnUi.multiselect === 0 || btnUi.multiselect === 2 && btnUi.selectionFlag),
                    data: btnUi,
                    onClick: function () {
                        if (btn.data.openType.indexOf('rfid') === -1) {
                            var btnUi_1 = btn.data, multiselect = btnUi_1.multiselect, selectionFlag = btnUi_1.selectionFlag, selectedData = multiselect === 2 && selectionFlag ?
                                ftable.unselectedRowsData : ftable.selectedRowsData;
                            // if (multiselect === 2 && !selectedData[0]) {
                            //     // 验证多选
                            //     Modal.alert('请至少选一条数据');
                            //     return;
                            // } else if (btn.data.multiselect === 1 && (!selectedData[0] || selectedData[1])) {
                            //     // 单选验证
                            //     Modal.alert('请选最多一条数据');
                            //     return;
                            // }
                            console.log(multiselect === 1 ? selectedData[0] : selectedData);
                            ButtonAction_1.ButtonAction.get().clickHandle(btnUi_1, multiselect === 1 ? selectedData[0] : selectedData, function (res) { }, _this.p.table.pageUrl);
                        }
                        else {
                            InventoryBtn_1.InventoryBtn(btn, _this.p.table);
                        }
                    }
                });
                box.addItem(btn);
            });
            // 根据选中行数判断按钮是否可操作
            var selectedLen = ftable.selectedRows.length, allLen = ftable.rows.length;
            box.children.forEach(function (btn) {
                var selectionFlag = btn.data.selectionFlag, len = btn.data.selectionFlag ? allLen - selectedLen : selectedLen;
                if (len === 0) {
                    btn.isDisabled = selectionFlag ? false : btn.data.multiselect > 0;
                }
                else if (selectedLen === 1) {
                    btn.isDisabled = false;
                }
                else {
                    btn.isDisabled = btn.data.multiselect !== 2;
                }
            });
        };
        Mail.prototype.ajaxLoad = function (ajaxUrl, index) {
            var _this = this;
            if (!this.spinner) {
                this.spinner = new loading_1.Loading({});
            }
            else {
                this.spinner.show();
            }
            this.ajax.fetch(CONF.siteUrl + ajaxUrl, {
                cache: true,
                data: { output: 'json' }
            }).then(function (_a) {
                var response = _a.response;
                var elements = response.body.elements[0];
                var btnsUi = elements.subButtons;
                !Array.isArray(btnsUi) && (btnsUi = []);
                if (Array.isArray(response.body.subButtons)) {
                    response.body.subButtons.forEach(function (btn) {
                        btnsUi.push(btn);
                    });
                }
                _this.initSubBtns(btnsUi);
                if (_this.isOne) {
                    _this.btnEvent(elements.fields);
                }
                return _this.ajax.fetch(CONF.siteUrl + elements.dataAddr.dataAddr, {
                    cache: true,
                }).then(function (_a) {
                    var response = _a.response;
                    _this.ajaxData = response.data[0];
                    _this.dataAdd(_this.ajaxData, index);
                    // this.spinner.hide();
                    if (_this.isOne) {
                        _this.p.modal.isShow = true;
                        _this.isOne = false;
                    }
                });
            }).finally(function () {
                _this.spinner.hide();
            });
        };
        Mail.prototype.detailTpl = function (cols) {
            var more = "", three = "", title, attachname, content, n = 0, icon = "";
            cols.forEach(function (c) {
                var link = c.link ? c.link.dataAddr : '';
                var varList = JSON.stringify(c.link ? c.link.varList : '');
                var div = "<div class=\"txt-left\"><span class=\"caption\">" + c.caption + "\uFF1A</span>\n            <span data-name=\"" + c.name + "\" data-href=\"" + link + "\" data-var-list=" + varList + " data-data-type=\"" + c.atrrs.dataType + "\" \n            data-display-format=\"" + !c.atrrs.displayFormat + "\"></span></div>";
                var noTitle = "<div class=\"txt-left\">\n            <span data-name=\"" + c.name + "\" data-href=\"" + link + "\" data-var-list=" + varList + " data-data-type=\"" + c.atrrs.dataType + "\" \n            data-display-format=\"" + !c.atrrs.displayFormat + "\"></span></div>";
                if (c.name !== 'READSTATE') {
                    if (c.name === 'TITLE') {
                        title = noTitle;
                    }
                    else if (c.name === 'ATTACHNAME') {
                        attachname = div;
                    }
                    else if (c.name === 'CONTENT') {
                        content = noTitle;
                    }
                    else {
                        if (n < 3) {
                            n++;
                            three += div;
                        }
                        else {
                            more += div;
                        }
                    }
                }
            });
            if (more !== "") {
                icon = " <div class=\"mail-icon\"><span class=\"iconfont icon-arrow-down\"></span><span\n                            class=\"iconfont icon-arrow-up\"></span>\n                    </div>";
            }
            var contentEl = d.create("<div>\n            <div class=\"mail-head mail-hide\">\n                <div class=\"mail-title\">\n                    " + title + "\n                    <div class=\"btn-group-right\"></div>\n                    <div class=\"avatar-right\">\n                        <div class=\"mail-avatar\"></div>\n                        " + icon + "\n                    </div>\n                </div>\n                <div class=\"mail-three\">\n                    " + three + "\n                </div>\n                <div class=\"mail-more\">\n                    " + more + "\n                </div>\n            </div>\n            <div class=\"mail-body\">" + attachname + "</div>\n            <div class=\"mail-content\">\n                " + content + "\n            </div>\n        </div>");
            return h("div", { className: "mail-detail" },
                this.btnWrapper,
                contentEl);
        };
        return Mail;
    }());
    exports.Mail = Mail;
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
