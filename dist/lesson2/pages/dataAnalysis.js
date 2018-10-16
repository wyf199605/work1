define("Calendar", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="Calendar"/>
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    var Calendar = /** @class */ (function (_super) {
        __extends(Calendar, _super);
        function Calendar(para) {
            return _super.call(this, para) || this;
        }
        Calendar.prototype.wrapperInit = function (para) {
            var calendarWrapper = h("div", { className: "left-content" },
                h("div", { className: "statistics" },
                    h("div", { className: "item forenoon" },
                        h("div", { className: "time" }, "\u4E0A\u5348"),
                        h("div", { className: "num" })),
                    h("div", { className: "item afternoon" },
                        h("div", { className: "time" }, "\u4E0B\u5348"),
                        h("div", { className: "num" })),
                    h("div", { className: "item night" },
                        h("div", { className: "time" }, "\u665A\u4E0A"),
                        h("div", { className: "num" }))),
                h("div", { className: "detail" },
                    h("div", { className: "week" },
                        h("div", { className: "week-item" }, "\u5468\u4E00"),
                        h("div", { className: "week-item" }, "\u5468\u4E8C"),
                        h("div", { className: "week-item" }, "\u5468\u4E09"),
                        h("div", { className: "week-item" }, "\u5468\u56DB"),
                        h("div", { className: "week-item" }, "\u5468\u4E94"),
                        h("div", { className: "week-item" }, "\u5468\u516D"),
                        h("div", { className: "week-item" }, "\u5468\u65E5")),
                    h("div", { "c-var": "calendar", className: "calendar" })));
            return calendarWrapper;
        };
        Calendar.prototype.set = function (cdata, year, month) {
            var _this = this;
            var calendarWrapper = this.innerEl.calendar;
            calendarWrapper.innerHTML = '';
            var timeArr = [], canData = cdata.data, forenoonNum = 0, afternoonNum = 0, nightNum = 0;
            // 把时间戳转化为时间字符串
            tools.isNotEmpty(canData) && canData.forEach(function (item) {
                timeArr.push(_this.formatTime(item[0]));
            });
            var compareDate = new Date(year, month - 1, 1), // 对比时间
            date = new Date(year, month - 1, 1), week = date.getDay() === 0 ? 7 : date.getDay(), // 本月1号是周几
            days = this.getDaysNum(year, month), // 当前月份的天数
            startDate = new Date(date.setDate(-week + 2)), //开始月份
            rowsNum = 6;
            if (days <= 29) {
                rowsNum = 5;
                if (days === 28 && startDate.getMonth() === compareDate.getMonth()) {
                    rowsNum = 4;
                }
            }
            else {
                if (startDate.getMonth() === compareDate.getMonth()) {
                    rowsNum = 5;
                }
            }
            for (var i = 0; i < rowsNum; i++) {
                if (startDate.getMonth() === compareDate.getMonth() + 1) {
                    break;
                }
                for (var j = 0; j < 7; j++) {
                    var daysWrapper = null;
                    if (startDate.getMonth() === compareDate.getMonth()) {
                        var content = null, curDate = (startDate.getMonth() + 1) + '-' + startDate.getDate();
                        if (timeArr.length === 0) {
                            content = h("div", { className: "no-record current-month" }, "\u65E0\u8BB0\u5F55");
                        }
                        else {
                            content = h("div", { className: "no-record current-month" }, "\u65E0\u8BB0\u5F55");
                            for (var k = 0; k < timeArr.length; k++) {
                                if (timeArr[k] === curDate) {
                                    content = h("div", { className: "courseContent" },
                                        h("div", null,
                                            "\u4E0A\u5348 : ",
                                            h("span", null, canData[k][1])),
                                        h("div", null,
                                            "\u4E0B\u5348 : ",
                                            h("span", null, canData[k][2])),
                                        h("div", null,
                                            "\u665A\u4E0A : ",
                                            h("span", null, canData[k][3])));
                                    forenoonNum += parseInt(canData[k][1]);
                                    afternoonNum += parseInt(canData[k][2]);
                                    nightNum += parseInt(canData[k][3]);
                                    break;
                                }
                            }
                        }
                        daysWrapper = h("div", { className: 'day' },
                            h("div", { className: "day-num" }, startDate.getDate()),
                            content);
                    }
                    else {
                        daysWrapper = h("div", { className: 'day' },
                            h("div", { className: "no-record" }, "\u65E0\u8BB0\u5F55"));
                    }
                    calendarWrapper.appendChild(daysWrapper);
                    startDate.setDate(startDate.getDate() + 1);
                }
            }
            this.setStatistics([forenoonNum, afternoonNum, nightNum]);
        };
        Calendar.prototype.getDaysNum = function (year, month) {
            var de = new Date(year, month, 0);
            return de.getDate();
        };
        Calendar.prototype.setStatistics = function (arr) {
            var nums = d.queryAll('.num', d.query('.statistics', this.wrapper));
            nums.forEach(function (num, i) {
                num.innerText = arr[i].toString();
            });
        };
        Calendar.prototype.formatTime = function (time) {
            var date = new Date(time * 1000);
            return (date.getMonth() + 1) + '-' + date.getDate();
        };
        Calendar.prototype.getDate = function (index, time) {
            var date = new Date(time + index * 24 * 60 * 60 * 1000), week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            return (date.getMonth() + 1) + '-' + date.getDate() + ' ' + week[date.getDay()];
        };
        return Calendar;
    }(Component));
    exports.Calendar = Calendar;
});

define("DestributionOfTimePage", ["require", "exports", "SelectInput", "Calendar", "LeRule"], function (require, exports, selectInput_1, Calendar_1, LeRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="DestributionOfTimePage"/>
    var SPAPage = G.SPAPage;
    var tools = G.tools;
    var DestributionOfTimePage = /** @class */ (function (_super) {
        __extends(DestributionOfTimePage, _super);
        function DestributionOfTimePage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(DestributionOfTimePage.prototype, "title", {
            set: function (t) {
                this._title = t;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DestributionOfTimePage.prototype, "titlt", {
            get: function () {
                return this._title;
            },
            enumerable: true,
            configurable: true
        });
        DestributionOfTimePage.prototype.wrapperInit = function () {
            var _this = this;
            var destributionOfTimeHTML = h("div", { className: "destribution-of-time" },
                h("div", { className: "title" }, "\u5E73\u53F0\u8BFE\u7A0B\u5206\u6790"),
                h("div", { className: "content" },
                    this.calendar = h(Calendar_1.Calendar, null),
                    h("div", { className: "right-content" },
                        h("div", { className: "select-date" },
                            h("span", { className: "text" }, "\u8BF7\u9009\u62E9\u67E5\u8BE2\u65E5\u671F"),
                            this.year = h(selectInput_1.SelectInput, { onSet: function (value) {
                                    var y = new Date().getFullYear(), monthArr = [];
                                    if (value.text.indexOf(y.toString()) >= 0) {
                                        monthArr = _this.getMonth(true);
                                    }
                                    else {
                                        monthArr = _this.getMonth(false);
                                    }
                                    _this.month.setPara({ data: monthArr });
                                    var lastMonth = monthArr[monthArr.length - 1], lastMonthNum = parseInt(lastMonth.substr(0, lastMonth.length - 1));
                                    if (tools.isEmpty(_this.month.get())) {
                                        _this.month.set(lastMonth);
                                    }
                                    else {
                                        var selectMonth = _this.month.get(), selectMonthNum = parseInt(selectMonth.substr(0, selectMonth.length - 1));
                                        if (lastMonthNum < selectMonthNum) {
                                            _this.month.set(lastMonth);
                                        }
                                        else {
                                            // 选项改变，数据改变
                                            !_this.isFirst && _this.getCalendarData();
                                        }
                                    }
                                }, dropClassName: "select-date", arrowIcon: "seclesson-xiala", arrowIconPre: "sec" }),
                            this.month =
                                h(selectInput_1.SelectInput, { useInputVal: true, dropClassName: "select-date", arrowIcon: "seclesson-xiala", arrowIconPre: "sec", onSet: function () {
                                        !_this.isFirst && _this.getCalendarData();
                                    } })),
                        h("div", { className: "introduce" },
                            h("span", { className: "text" }, "\u6708\u4EFD\u8BFE\u7A0B\u5206\u5E03\u6570\u636E"),
                            h("div", null,
                                h("span", null, "\u7EDF\u8BA1\u4ECB\u7ECD"),
                                h("div", null, "\u8FD9\u662F\u5E73\u53F0\u4E0A\uFF0C\u6BCF\u4E2A\u6708\u4EFD\u7684\u6240\u6709\u5F00\u8BFE\u6570\u636E\u7EDF\u8BA1\u8BE6\u60C5\uFF0C\u4EE5\u65F6\u95F4\u9636\u6BB5\uFF1A\u6D3B\u52A8\u65F6\u95F407:00-12:00\u4E3A\u4E0A\u5348\uFF1B12:00-18:00\u4E3A\u4E0B\u5348\uFF1B18:00-07:00\u4E3A\u665A\u4E0A\uFF0C\u9996\u9875\u53EF\u4EE5\u5FEB\u901F\u67E5\u770B\u5F53\u524D\u661F\u671F\u7684\u8BFE\u7A0B\u5206\u5E03\u3002"))))));
            this.isFirst = true;
            var years = this.getYears();
            this.year.setPara({ data: years });
            this.year.set(years[years.length - 1]);
            return destributionOfTimeHTML;
        };
        DestributionOfTimePage.prototype.init = function (para, data) {
            var _this = this;
            var yearStr = this.year.get(), year = yearStr.substr(0, yearStr.length - 1), monthStr = this.month.get(), month = monthStr.substr(0, monthStr.length - 1);
            LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.activityTime).then(function (_a) {
                var response = _a.response;
                _this.calendar.set(response.data, year, month);
                _this.isFirst = false;
            });
        };
        DestributionOfTimePage.prototype.getCalendarData = function () {
            var _this = this;
            var yearStr = this.year.get(), year = yearStr.substr(0, yearStr.length - 1), monthStr = this.month.get(), month = monthStr.substr(0, monthStr.length - 1);
            LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.delener + ("?home_year=" + year + "&home_month=" + month)).then(function (_a) {
                var response = _a.response;
                _this.calendar.set(response.data, year, month);
            });
        };
        DestributionOfTimePage.prototype.getYears = function () {
            var yearArr = [], startDate = new Date(2013, 1, 1), year = 2013;
            while (year <= new Date().getFullYear()) {
                yearArr.push(startDate.getFullYear() + '年');
                startDate = new Date(startDate.setFullYear(year += 1));
            }
            return yearArr;
        };
        DestributionOfTimePage.prototype.getMonth = function (isCurrentYear) {
            if (isCurrentYear) {
                var month = new Date().getMonth() + 1, monthArr = [];
                for (var i = 0; i < month; i++) {
                    monthArr.push((i + 1) + '月');
                }
                return monthArr;
            }
            else {
                return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
            }
        };
        return DestributionOfTimePage;
    }(SPAPage));
    exports.DestributionOfTimePage = DestributionOfTimePage;
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
