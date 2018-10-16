define("ReportCardModal", ["require", "exports", "echarts", "Button", "SelectInput", "LeRule", "Utils", "QrCode", "LeBasicPage"], function (require, exports, echarts, Button_1, selectInput_1, LeRule_1, utils_1, QRCode_1, LeBasicPage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="ReportCardModal"/>
    /// <amd-dependency path="echarts" name="echarts"/>
    var Component = G.Component;
    var tools = G.tools;
    var d = G.d;
    var ReportCardModal = /** @class */ (function (_super) {
        __extends(ReportCardModal, _super);
        function ReportCardModal() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.domReady = function () {
                if (this.para.name === 'warning') {
                    return;
                }
                var width = window.getComputedStyle(d.query('.report-imgs', this.body)).width, widthNum = parseInt(width.substr(0, width.length - 2));
                d.query('.report-imgs', this.body).style.height = (widthNum * 0.25) + 'px';
            };
            return _this;
        }
        ReportCardModal.prototype.init = function () {
        };
        ReportCardModal.prototype.modalParaGet = function () {
            var _this = this;
            this.para.name = this.cardType();
            this.para.title = this.cardTitle();
            var reportCard = new ReportCard(this.para);
            var btn = new Button_1.Button({
                className: 'print',
                content: '打印',
                onClick: function () {
                    var image = new Image(), canvas = d.query('.canvasInner canvas', _this.modal.bodyWrapper), win = window.open('', '打印');
                    image.src = canvas.toDataURL("image/png"); // canvas转img
                    image.onload = function () {
                        var img = h("img", { width: "306", height: "200", src: image.src, alt: "" });
                        d.append(canvas.parentElement, img);
                        canvas.classList.add('hide');
                        var printHtml = document.head.innerHTML + '<div class="report-card print-card">' +
                            _this.modal.bodyWrapper.innerHTML + '</div>';
                        win.document.write(printHtml);
                        img.remove();
                        canvas.classList.remove('hide');
                        setTimeout(function () {
                            win.print();
                            win.close();
                        });
                    };
                }
            });
            return {
                header: {
                    title: this.para.title,
                    rightPanel: btn.wrapper,
                    isDrag: false
                },
                body: reportCard.wrapper,
                isShow: true,
                width: '71%',
                className: 'report-card',
                position: 'full',
                isDrag: false
            };
        };
        ReportCardModal.prototype.cardType = function () {
            return '';
        };
        ReportCardModal.prototype.cardTitle = function () {
            return '';
        };
        return ReportCardModal;
    }(LeBasicPage_1.LeBasicPage));
    exports.ReportCardModal = ReportCardModal;
    var StuReport = /** @class */ (function (_super) {
        __extends(StuReport, _super);
        function StuReport() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        StuReport.prototype.cardType = function () {
            return 'report';
        };
        StuReport.prototype.cardTitle = function () {
            return '成绩单';
        };
        return StuReport;
    }(ReportCardModal));
    exports.StuReport = StuReport;
    var StuModal = /** @class */ (function (_super) {
        __extends(StuModal, _super);
        function StuModal() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        StuModal.prototype.cardType = function () {
            return 'modal';
        };
        StuModal.prototype.cardTitle = function () {
            return '学生成绩模型';
        };
        return StuModal;
    }(ReportCardModal));
    exports.StuModal = StuModal;
    var SutWarning = /** @class */ (function (_super) {
        __extends(SutWarning, _super);
        function SutWarning() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SutWarning.prototype.cardType = function () {
            return 'warning';
        };
        SutWarning.prototype.cardTitle = function () {
            return '预警单';
        };
        return SutWarning;
    }(ReportCardModal));
    exports.SutWarning = SutWarning;
    var ReportCard = /** @class */ (function (_super) {
        __extends(ReportCard, _super);
        function ReportCard(para) {
            var _this = _super.call(this, para) || this;
            LeRule_1.LeRule.Ajax.fetch(_this.ajaxUrl, {
                data: JSON.parse(para.ajaxData)
            }).then(function (_a) {
                var response = _a.response;
                var base = response.data.base;
                response.data.tables.forEach(function (tableData) {
                    _this.reportTable = new ReportTable({
                        container: d.query('.tables', _this.wrapper)
                    });
                    _this.reportTable.set(tableData);
                });
                switch (para.name) {
                    case 'report': // 成绩单
                        _this.innerCom.userinfo.set(_this.getUserInfoData(base));
                        break;
                    case 'modal': // 模型
                        _this.stuUserInfo(base.data);
                        break;
                    case 'warning': // 预警单
                        _this.innerCom.userinfo.set(_this.getUserInfoData(base));
                        return;
                }
                _this.innerEl.reportNumber.innerText = response.data.base.caption;
                _this.innerEl.totalCredit.innerText = tools.isNotEmpty(response.data.aggreate.ABSBUDGETMONEY) ? response.data.aggreate.ABSBUDGETMONEY : 0;
                _this.innerEl.ranking.innerText = tools.isNotEmpty(response.data.aggreate.RANKING) ? response.data.aggreate.RANKING : 0;
                _this.setQRCode(response.data.shareLink);
                _this.setCharts(response.data.diagram);
            });
            return _this;
        }
        ReportCard.prototype.wrapperInit = function (para) {
            var wrapper;
            switch (para.name) {
                case 'report':
                    wrapper = this.reportWrapper(para);
                    this.ajaxUrl = LE.CONF.ajaxUrl.schoolReport;
                    break;
                case 'modal':
                    wrapper = this.modalWrapper();
                    this.ajaxUrl = LE.CONF.ajaxUrl.reportModal;
                    break;
                case 'warning':
                    wrapper = this.warningWrapper(para);
                    this.ajaxUrl = LE.CONF.ajaxUrl.earlyWarning;
                    break;
            }
            return wrapper;
        };
        ReportCard.prototype.reportWrapper = function (para) {
            var _this = this;
            return h("div", { className: "reportCardBody" },
                h("div", { className: "report-header" },
                    h("img", { src: "../../img/lesson2/logo.png", alt: "" }),
                    h("div", { className: "report-title" },
                        h("div", { className: "lang-ch" }, "\u7B2C\u4E8C\u8BFE\u5802\u6210\u7EE9\u5355"),
                        h("div", { className: "lang-en" }, "Extracurricular Activities Record")),
                    h("div", { className: "report-card-num", "c-var": "reportNumber" })),
                h("div", { className: "report-body" },
                    h(UserInfo, { name: para.name, ajaxData: para.ajaxData, "c-var": "userinfo", onChange: function (data) {
                            // 表格数据
                            var tables = d.query('.tables', _this.wrapper);
                            tables.innerHTML = '';
                            data.tables.forEach(function (tableData) {
                                var table = new ReportTable({
                                    container: d.query('.tables', _this.wrapper)
                                });
                                table.set(tableData);
                            });
                            _this.setCharts(data.diagram);
                            _this.innerEl.totalCredit.innerText = tools.isNotEmpty(data.aggreate.ABSBUDGETMONEY) ? data.aggreate.ABSBUDGETMONEY : 0;
                            _this.innerEl.ranking.innerText = tools.isNotEmpty(data.aggreate.RANKING) ? data.aggreate.RANKING : 0;
                            _this.setQRCode(data.shareLink);
                        } }),
                    h("div", { className: "tables" }),
                    h("div", { className: "total" },
                        h("div", null,
                            "\u603B\u5B66\u5206\u00A0:\u00A0",
                            h("span", { "c-var": "totalCredit" })),
                        h("div", null,
                            "\u5728\u672C\u5C4A\u5B66\u751F\u4E2D\u6392\u540D\u524D\u00A0:\u00A0",
                            h("span", { "c-var": "ranking" }))),
                    h("div", { className: "report-imgs", style: { width: '100%' } },
                        h("div", { className: "img-item qrcode", "c-var": "qrcode" }),
                        h("div", { className: "img-item charts", "c-var": "charts" }),
                        h("div", { className: "img-item signature" },
                            h("span", { className: "stamp" }, "\uFF08\u7B7E\u7AE0\uFF09"),
                            h("span", { className: "signature-name" }, "\u95FD\u6C5F\u5B66\u9662\u6559\u52A1\u5904")),
                        h("div", { className: "img-item signature" },
                            h("span", { className: "stamp" }, "\uFF08\u7B7E\u7AE0\uFF09"),
                            h("span", { className: "signature-name" }, "\u5171\u9752\u56E2\u95FD\u6C5F\u5B66\u9662\u59D4\u5458\u4F1A")))));
        };
        ReportCard.prototype.modalWrapper = function () {
            return h("div", { className: "reportCardBody" },
                h("div", { className: "student-header" },
                    h("div", null,
                        h("img", { width: "180", src: "../../img/lesson2/logo.png", alt: "" }),
                        h("div", { className: "student-title" },
                            h("div", { className: "lang-ch" }, "\u7B2C\u4E8C\u8BFE\u5802\u6210\u7EE9\u5355"),
                            h("div", { className: "lang-en" }, "Extracurricular Activities Record"))),
                    h("div", { className: "flex-layout" },
                        h("div", { className: "student-modal-left" },
                            h("div", { "c-var": "userInfo" }),
                            h("div", { className: "stu-total" },
                                h("img", { width: "114", height: "114", src: "../../img/lesson2/rank.png", alt: "" }),
                                h("p", { "c-var": "ranking", class: "rank" }),
                                h("div", { className: "total-score" },
                                    "\u603B\u5B66\u5206\uFF1A",
                                    h("span", { "c-var": "totalCredit" })))),
                        h("div", { className: "student-modal-right" },
                            h("img", { height: "140", width: "120", "c-var": "stuImg", src: "", alt: "" })))),
                h("div", { className: "report-body" },
                    h("div", { className: "tables" }),
                    h("div", { className: "report-imgs", style: { width: '100%' } },
                        h("div", { className: "img-item qrcode", "c-var": "qrcode" }),
                        h("div", { className: "img-item charts", "c-var": "charts" }),
                        h("div", { className: "img-item signature stu" },
                            h("span", { className: "stamp" }, "\uFF08\u7B7E\u7AE0\uFF09"),
                            h("span", { className: "signature-name" }, "\u5171\u9752\u56E2\u95FD\u6C5F\u5B66\u9662\u59D4\u5458\u4F1A"))),
                    h("div", { className: "report-card-num", "c-var": "reportNumber" })));
        };
        ReportCard.prototype.warningWrapper = function (para) {
            var _this = this;
            return h("div", { className: "reportCardBody" },
                h("div", { className: "report-header" }),
                h("div", { className: "report-body" },
                    h(UserInfo, { name: para.name, ajaxData: para.ajaxData, "c-var": "userinfo", onChange: function (data) {
                            _this.reportTable.reset(data);
                        } }),
                    h("div", { className: "tables" })));
        };
        ReportCard.prototype.setQRCode = function (shareLink) {
            this.innerEl.qrcode.innerHTML = '';
            var qrCodeEl = h("div", { class: "qrCodeEl" });
            this.innerEl.qrcode.appendChild(qrCodeEl);
            QRCode_1.QrCode.toCanvas(shareLink, 180, 180, qrCodeEl);
        };
        ReportCard.prototype.setCharts = function (data) {
            this.innerEl.charts.innerHTML = '';
            var divEl = h("div", { className: "canvasInner" });
            this.innerEl.charts.appendChild(divEl);
            var myChart = echarts.init(divEl);
            // 指定图表的配置项和数据
            var option = {
                title: { text: '' },
                tooltip: {},
                radar: {
                    top: 'middle',
                    name: {
                        show: true,
                        textStyle: { fontSize: 12, color: "#33484f" }
                    },
                    indicator: [
                        { text: '学习能力', max: 1 },
                        { text: '心理素质', max: 1 },
                        { text: '创新能力', max: 1 },
                        { text: '实践能力', max: 1 },
                        { text: '组织能力', max: 1 }
                    ],
                },
                series: [
                    {
                        type: 'radar',
                        data: [
                            {
                                value: tools.isEmpty(data) ? [0, 0, 0, 0, 0] : data,
                                name: '学生能力分析'
                            }
                        ]
                    }
                ]
            };
            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
        };
        ReportCard.prototype.stuUserInfo = function (data) {
            this.innerEl.stuImg.setAttribute('src', LeRule_1.LeRule.fileUrlGet(data.PICTURE));
            d.append(this.innerEl.userInfo, h("div", null,
                h("p", null,
                    h("img", { src: "../../img/lesson2/name.png", alt: "" }),
                    h("span", null,
                        "\u59D3\u540D\uFF1A",
                        data.NAME)),
                h("p", null,
                    h("img", { src: "../../img/lesson2/college.png", alt: "" }),
                    h("span", null,
                        "\u9662\u7CFB\uFF1A",
                        data.COLLEGE)),
                h("p", null,
                    h("img", { src: "../../img/lesson2/student_id.png", alt: "" }),
                    h("span", null,
                        "\u5B66\u53F7\uFF1A",
                        data.STUDENTID)),
                h("p", null,
                    h("img", { src: "../../img/lesson2/profession.png", alt: "" }),
                    h("span", null,
                        "\u4E13\u4E1A\uFF1A",
                        data.MAJOR))));
        };
        ReportCard.prototype.getUserInfoData = function (res) {
            var fields = res.sysFieldsList, data = res.data, userInfo = [];
            fields.forEach(function (field) {
                var userItem = {};
                if (field.hasOwnProperty('list')) {
                    var dropData = utils_1.Utils.getDropDownList_Obj(field.list.dataList);
                    userItem = Object.assign(field, { list: dropData });
                }
                else {
                    for (var key in data) {
                        if (field.field === key) {
                            userItem = Object.assign(field, { value: data[key] });
                            break;
                        }
                    }
                }
                userInfo.push(userItem);
            });
            return userInfo;
        };
        return ReportCard;
    }(Component));
    var UserInfo = /** @class */ (function (_super) {
        __extends(UserInfo, _super);
        function UserInfo(para) {
            var _this = _super.call(this, para) || this;
            _this.p = para;
            return _this;
        }
        UserInfo.prototype.wrapperInit = function (para) {
            var userInfoWrapper = h("div", { className: "userInfo" });
            return userInfoWrapper;
        };
        UserInfo.prototype.set = function (userInfo) {
            var _this = this;
            userInfo.forEach(function (userItem) {
                if (userItem.hasOwnProperty('list')) {
                    var list_1 = null;
                    _this.wrapper.appendChild(h("div", { className: "item" },
                        h("div", { className: "caption" }, userItem.caption + ' : '),
                        list_1 = h(selectInput_1.SelectInput, { className: "grade-input", dropClassName: "report-list", data: userItem.list, arrowIconPre: "sec", arrowIcon: "seclesson-xiala", onSet: function (item, index) {
                                d.query('input', list_1.wrapper).setAttribute('value', item.text);
                                if (_this.p.name === 'warning') {
                                    var dropData = list_1.getData();
                                    if (dropData.indexOf(item.value) === dropData.length - 1) {
                                        index = 0;
                                    }
                                    else {
                                        index = index + 1;
                                    }
                                    if (_this.p.onChange) {
                                        LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.earlyWarning, {
                                            data: {
                                                student_id: JSON.parse(_this.p.ajaxData).student_id,
                                                schoolyear: index
                                            },
                                            dataType: 'json'
                                        }).then(function (_a) {
                                            var response = _a.response;
                                            _this.p.onChange(response.data);
                                        });
                                    }
                                }
                                else if (_this.p.name === 'report') {
                                    var query_value = item.value;
                                    if (_this.p.onChange) {
                                        LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.gradeList, {
                                            data: {
                                                user_id: JSON.parse(_this.p.ajaxData).user_id,
                                                major: query_value
                                            },
                                            dataType: 'json'
                                        }).then(function (_a) {
                                            var response = _a.response;
                                            _this.p.onChange(response.data);
                                        });
                                    }
                                }
                            } })));
                    if (_this.p.name === 'warning') {
                        var index = parseInt(userItem.value);
                        if (index === 0) {
                            list_1.set(userItem.list[userItem.list.length - 1]);
                        }
                        else {
                            list_1.set(userItem.list[index - 1]);
                        }
                    }
                    else if (_this.p.name === 'report') {
                        var item = userItem.list.filter(function (i) { return i.value === userItem.value; })[0];
                        list_1.set(item);
                    }
                }
                else {
                    _this.wrapper.appendChild(h("div", { className: "item" },
                        h("div", { className: "caption" }, userItem.caption + ' :'),
                        h("div", { className: "value" },
                            "\u00A0",
                            userItem.value)));
                }
            });
        };
        return UserInfo;
    }(Component));
    var ReportTable = /** @class */ (function (_super) {
        __extends(ReportTable, _super);
        function ReportTable(para) {
            return _super.call(this, para) || this;
        }
        ReportTable.prototype.wrapperInit = function (para) {
            var reportTableWrapper = h("div", { className: "report-table" },
                h("div", { className: "table-title" },
                    h("div", { "c-var": "caption", className: "caption" }),
                    h("div", { "c-var": "credit", className: "credit" })));
            return reportTableWrapper;
        };
        ReportTable.prototype.set = function (tdata) {
            // 标题
            tdata.caption && (this.innerEl.caption.innerText = tdata.caption);
            // 学分
            tdata.countCredit && (this.innerEl.credit.innerText = tdata.countCredit + '学分');
            var tableWrapper = null, data = tdata.data, fields = tdata.sysFieldsList, tHead = null, tBody = null;
            if (tools.isNotEmptyArray(data)) {
                tableWrapper = h("table", null,
                    tHead = h("thead", null),
                    tBody = h("tbody", null));
                this.wrapper.appendChild(tableWrapper);
                var trTh_1 = h("tr", { className: "table-head" });
                fields.forEach(function (th) {
                    trTh_1.appendChild(h("th", { "data-name": th.field }, th.caption));
                });
                tHead.appendChild(trTh_1);
                data.forEach(function (trData) {
                    var tr = h("tr", null);
                    for (var key in trData) {
                        tr.appendChild(h("td", null, trData[key]));
                    }
                    tBody.appendChild(tr);
                });
            }
        };
        ReportTable.prototype.reset = function (data) {
            var tBody = d.query('tbody', this.wrapper);
            tBody.innerHTML = null;
            data.forEach(function (trData) {
                var tr = h("tr", null);
                for (var key in trData) {
                    tr.appendChild(h("td", null, trData[key]));
                }
                tBody.appendChild(tr);
            });
        };
        ReportTable.prototype.formatTime = function (time) {
            var date = new Date(time), year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate(), hour = date.getHours(), minute = date.getMinutes(), seconds = date.getSeconds();
            return year + "-" + month + "-" + day + " " + this.handlerTime(hour) + ":" + this.handlerTime(minute) + ":" + this.handlerTime(seconds);
        };
        ReportTable.prototype.handlerTime = function (num) {
            return num < 10 ? '0' + num : num;
        };
        return ReportTable;
    }(Component));
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
