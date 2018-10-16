define("CurrentTasks", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="CurrentTasks"/>
    var d = G.d;
    var tools = G.tools;
    var Component = G.Component;
    var CurrentTasks = /** @class */ (function (_super) {
        __extends(CurrentTasks, _super);
        function CurrentTasks(para) {
            var _this = _super.call(this, para) || this;
            _this.toggleTaskEvent = (function () {
                var index = 0; // 当前页数
                var translateTasks = function (isNext) {
                    var tasksWrapper = d.query('.tasks-items', _this.wrapper);
                    if (isNext) {
                        var lastNumber = Number(_this.tasksNum) - 5 * index; // 剩余项目的个数
                        tasksWrapper.style.transform = "translateX(" + -((index - 1) * 5 + lastNumber) * 20 + "%) translateZ(0)";
                    }
                    else {
                        tasksWrapper.style.transform = "translateX(" + -(index * 5) * 20 + "%) translateZ(0)";
                    }
                };
                var checkDisabled = function () {
                    if (index === 0) {
                        d.query('span.prev', _this.wrapper).classList.add('disabled');
                        d.query('span.next', _this.wrapper).classList.remove('disabled');
                    }
                    else if (index === Math.ceil(_this.tasksNum / 5) - 1) {
                        d.query('span.next', _this.wrapper).classList.add('disabled');
                        d.query('span.prev', _this.wrapper).classList.remove('disabled');
                    }
                    else {
                        d.query('span.prev', _this.wrapper).classList.remove('disabled');
                        d.query('span.next', _this.wrapper).classList.remove('disabled');
                    }
                };
                var toggleTask = function (e) {
                    var target = d.closest(e.target, '.toggle-btn'), isNext = true;
                    if (target.classList.contains('next')) {
                        index += 1;
                    }
                    else {
                        isNext = false;
                        index -= 1;
                    }
                    checkDisabled();
                    translateTasks(isNext);
                };
                return {
                    on: function () { return d.on(_this.wrapper, 'click', '.slider-btn span', toggleTask); },
                    off: function () { return d.off(_this.wrapper, 'click', '.slider-btn span', toggleTask); },
                };
            })();
            _this.toggleTaskEvent.on();
            return _this;
        }
        CurrentTasks.prototype.wrapperInit = function (para) {
            var currentTasksWrapper = h("div", { className: "current-tasks" },
                h("div", { className: "title" },
                    h("span", { className: "caption" }),
                    h("div", { className: "slider-btn" },
                        h("span", { className: "toggle-btn disabled prev sec seclesson-zuojiantou hide" }),
                        h("span", { className: "toggle-btn next sec seclesson-youjiantou hide" }))),
                h("div", { className: "tasks-items" }));
            return currentTasksWrapper;
        };
        CurrentTasks.prototype.set = function (tdata) {
            var tasks = tdata.data.filter(function (task) {
                return task.COUNT > 0;
            });
            if (tasks.length > 5) {
                d.queryAll('.slider-btn span').forEach(function (span) {
                    span.classList.remove('hide');
                });
            }
            this.tasksNum = tasks.length;
            var tasksWrapper = d.query('.tasks-items', this.wrapper), caption = d.query('.title .caption', this.wrapper);
            caption.innerText = tdata.caption;
            var colorArr = ['check', 'auth', 'doing'];
            tools.isNotEmpty(tasks) && tasks.forEach(function (task) {
                var random = Math.floor(Math.random() * 3);
                var url = '#/lesson2/home';
                if (tools.isNotEmpty(task.LINK)) {
                    url = '#/lesson2/common?url=' + task.LINK;
                }
                var taskHTML = h("div", { className: "task-item-out-wrapper" },
                    h("div", { className: "task-item", "date-item": task.ITEMID },
                        h("a", { href: url },
                            h("span", { className: 'bold-text ' + colorArr[random] }, task.COUNT),
                            h("span", { className: "task-gray-text" }, task.CAPTION))));
                tasksWrapper.appendChild(taskHTML);
            });
        };
        CurrentTasks.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.tasksNum = 0;
            this.toggleTaskEvent.off();
        };
        return CurrentTasks;
    }(Component));
    exports.CurrentTasks = CurrentTasks;
});

/// <amd-module name="HomeNotice"/>
define("HomeNotice", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var d = G.d;
    var Component = G.Component;
    var SPA = G.SPA;
    var HomeNotice = /** @class */ (function (_super) {
        __extends(HomeNotice, _super);
        function HomeNotice(para) {
            return _super.call(this, para) || this;
        }
        HomeNotice.prototype.wrapperInit = function (para) {
            return h("div", { className: "home-notice" },
                h("div", { className: "title" }),
                h("ul", null));
        };
        HomeNotice.prototype.set = function (notices) {
            d.query('.title', this.wrapper).innerText = notices.caption;
            var ns = notices.data, notWrapper = d.query('ul', this.wrapper);
            notWrapper.innerHTML = '';
            tools.isNotEmpty(ns) && ns.forEach(function (not) {
                var notHTML = h("li", { title: not.CAPTION },
                    h("a", { href: '#' + SPA.hashCreate('lesson2', 'NoticePage', { id: not.ITEMID }) },
                        h("span", { className: "notice-content" }, not.CAPTION),
                        h("span", { className: "notice-time" }, not.TIMES)));
                notWrapper.appendChild(notHTML);
            });
        };
        return HomeNotice;
    }(Component));
    exports.HomeNotice = HomeNotice;
});

/// <amd-module name="HomePage"/>
define("HomePage", ["require", "exports", "SchoolYearSelect", "CurrentTasks", "HomeNotice", "WeekCourse", "LeRule"], function (require, exports, SchoolYearSelect_1, CurrentTasks_1, HomeNotice_1, WeekCourse_1, LeRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SPAPage = G.SPAPage;
    var d = G.d;
    var tools = G.tools;
    var HomePage = /** @class */ (function (_super) {
        __extends(HomePage, _super);
        function HomePage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(HomePage.prototype, "title", {
            set: function (t) {
                this._title = t;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HomePage.prototype, "titlt", {
            get: function () {
                return this._title;
            },
            enumerable: true,
            configurable: true
        });
        HomePage.prototype.wrapperInit = function () {
            return h("div", { className: "homePage" },
                h("div", { className: "module1" },
                    h("div", { className: "m1-left" }),
                    h("div", { className: "m1-right" })),
                h("div", { className: "module2" }));
        };
        HomePage.prototype.init = function (para, data) {
            // 学年选择
            var statics = new SchoolYearSelect_1.SchoolYearSelect({
                container: d.query('.m1-left', this.wrapper)
            });
            this.staticsSchool = statics;
            // 当前任务
            var task = new CurrentTasks_1.CurrentTasks({
                container: d.query('.m1-left', this.wrapper)
            });
            // 公告
            var notice = new HomeNotice_1.HomeNotice({
                container: d.query('.m1-right', this.wrapper)
            });
            // 课程
            var weekCourse = new WeekCourse_1.WeekCourse({
                container: d.query('.module2', this.wrapper)
            });
            // 首页数据
            LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.home).then(function (_a) {
                var response = _a.response;
                tools.isNotEmpty(response.data) && statics.set(response.data.statics);
                tools.isNotEmpty(response.data) && task.set(response.data.task);
                tools.isNotEmpty(response.data) && notice.set(response.data.inform);
                tools.isNotEmpty(response.data) && weekCourse.set(response.data.calendar);
            });
        };
        HomePage.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.staticsSchool.destroy();
        };
        return HomePage;
    }(SPAPage));
    exports.HomePage = HomePage;
});

/// <amd-module name="SchoolYearItem"/>
define("SchoolYearItem", ["require", "exports", "SchoolYearSelect"], function (require, exports, SchoolYearSelect_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    var SPA = G.SPA;
    var SchoolYearItem = /** @class */ (function (_super) {
        __extends(SchoolYearItem, _super);
        function SchoolYearItem(para) {
            return _super.call(this, para) || this;
        }
        SchoolYearItem.prototype.wrapperInit = function (para) {
            var wrapper = h("div", { className: 'school-year-item' },
                h("a", { "c-var": "link", href: "#" },
                    h("div", { className: "number" },
                        h("span", { className: "caption" }),
                        h("span", { className: "count num-bold" })),
                    h("div", { className: "right-icon" },
                        h("i", { className: 'sec ' + para.icon }))));
            return wrapper;
        };
        SchoolYearItem.prototype.set = function (data) {
            if (tools.isNotEmpty(data)) {
                d.query('.number span.caption', this.wrapper).innerText = data.CAPTION;
                if (tools.isNotEmpty(data.LINK)) {
                    var route = SPA.hashCreate('lesson2', 'common', {
                        url: data.LINK,
                        query: JSON.stringify({
                            GRADE_ID: SchoolYearSelect_1.SchoolYearSelect.select_item
                        })
                    });
                    // this.innerEl.link.setAttribute('href', '#/lesson2/common?url=' + encodeURIComponent(data.LINK)+'&school_year=' + SchoolYearSelect.select_year);
                    this.innerEl.link.setAttribute('href', '#' + route);
                }
                else {
                    this.innerEl.link.setAttribute('href', '#/lesson2/home');
                }
                d.query('.number span.count', this.wrapper).innerText = data.COUNT;
            }
            else {
                this.innerEl.link.setAttribute('href', '#/lesson2/home');
                d.query('.number span.count', this.wrapper).innerText = '0';
            }
        };
        return SchoolYearItem;
    }(Component));
    exports.SchoolYearItem = SchoolYearItem;
});

/// <amd-module name="SchoolYearSelect"/>
define("SchoolYearSelect", ["require", "exports", "SelectInput", "SchoolYearItem", "Utils", "LeRule"], function (require, exports, selectInput_1, SchoolYearItem_1, utils_1, LeRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    var SchoolYearSelect = /** @class */ (function (_super) {
        __extends(SchoolYearSelect, _super);
        function SchoolYearSelect(para) {
            var _this = _super.call(this, para) || this;
            _this.first = true;
            return _this;
        }
        SchoolYearSelect.prototype.wrapperInit = function (para) {
            var _this = this;
            var loginData = JSON.parse(localStorage.getItem('loginData')), student_flag = loginData.filter(function (user) {
                return user.NAME === 'student_flag';
            })[0];
            var items = null;
            if (parseInt(student_flag.VALUE) === 0) {
                // 教师
                items = h("div", { className: "school-year-items" },
                    h(SchoolYearItem_1.SchoolYearItem, { "c-var": "student", className: "student", icon: "seclesson-xuesheng" }),
                    h(SchoolYearItem_1.SchoolYearItem, { "c-var": "course", className: "lesson", icon: "seclesson-kecheng" }),
                    h(SchoolYearItem_1.SchoolYearItem, { "c-var": "ctr", className: "ctr", icon: "seclesson-zhengshu" }));
            }
            else {
                // 学生
                items = h("div", { className: "school-year-items" },
                    h(SchoolYearItem_1.SchoolYearItem, { "c-var": "student", className: "student", icon: "seclesson-xuesheng" }),
                    h(SchoolYearItem_1.SchoolYearItem, { "c-var": "course", className: "lesson", icon: "seclesson-huodongguanli-mianxing1" }),
                    h(SchoolYearItem_1.SchoolYearItem, { "c-var": "ctr", className: "ctr", icon: "seclesson-zhengshu" }));
            }
            var schoolYearWrapper = h("div", { className: "school-year-module" },
                h("div", { className: "title school-year-title" },
                    h("span", { className: "caption" }),
                    h(selectInput_1.SelectInput, { dropClassName: "selectYear", onSet: function (listItem) {
                            !!!_this.first && LeRule_1.LeRule.Ajax.fetch(_this.dropUrl + '&school_year=' + listItem.text).then(function (_a) {
                                var response = _a.response;
                                if (tools.isNotEmpty(response.data)) {
                                    if (tools.isNotEmpty(response.data.dataList)) {
                                        _this.innerCom.student.set(response.data.dataList[0]);
                                        _this.innerCom.course.set(response.data.dataList[1]);
                                        _this.innerCom.ctr.set(response.data.dataList[2]);
                                    }
                                    else {
                                        _this.innerCom.student.set({});
                                        _this.innerCom.course.set({});
                                        _this.innerCom.ctr.set({});
                                    }
                                    d.query('.title .caption', _this.wrapper).innerText = response.data.caption;
                                }
                                else {
                                    _this.innerCom.student.set({});
                                    _this.innerCom.course.set({});
                                    _this.innerCom.ctr.set({});
                                    d.query('.title .caption', _this.wrapper).innerText = '';
                                }
                            });
                            SchoolYearSelect.select_item = listItem;
                        }, arrowIcon: "seclesson-xiala", arrowIconPre: "sec", "c-var": "drop" })),
                items);
            return schoolYearWrapper;
        };
        SchoolYearSelect.prototype.set = function (sdata) {
            this.first = true;
            d.query('.title .caption', this.wrapper).innerText = sdata.caption;
            var drop = this.innerCom.drop, dropData = utils_1.Utils.getDropDownList_Obj(sdata.querier.list.dataList);
            drop.setPara({
                data: dropData
            });
            this.dropUrl = LE.CONF.siteUrl + sdata.querier.link;
            var value = dropData.filter(function (dr) {
                return dr.text === sdata.querier.defaultStr;
            })[0].value;
            SchoolYearSelect.select_item = {
                value: value,
                text: sdata.querier.defaultStr
            };
            drop.set(SchoolYearSelect.select_item);
            this.first = false;
            this.innerCom.student.set(sdata.data[0]);
            this.innerCom.course.set(sdata.data[1]);
            this.innerCom.ctr.set(sdata.data[2]);
        };
        SchoolYearSelect.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.innerCom.drop.destroy();
        };
        return SchoolYearSelect;
    }(Component));
    exports.SchoolYearSelect = SchoolYearSelect;
});

define("WeekCourse", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="WeekCourse"/>
    var d = G.d;
    var tools = G.tools;
    var Component = G.Component;
    var SPA = G.SPA;
    var WeekCourse = /** @class */ (function (_super) {
        __extends(WeekCourse, _super);
        function WeekCourse(para) {
            var _this = _super.call(this, para) || this;
            _this.initEvents = (function () {
                var queryDetail = function (e) {
                    var target = d.closest(e.target, '.queryDetail');
                    var startTime = target.dataset.start, endTime = target.dataset.end;
                    var time = JSON.stringify({
                        START_TIME: startTime,
                        END_TIME: endTime
                    });
                    SPA.open(SPA.hashCreate('lesson2', 'common', {
                        url: _this.url,
                        query: time
                    }));
                };
                return {
                    on: function () { return d.on(_this.wrapper, 'click', '.queryDetail', queryDetail); },
                    off: function () { return d.off(_this.wrapper, 'click', '.queryDetail', queryDetail); }
                };
            })();
            _this.initEvents.on();
            return _this;
        }
        WeekCourse.prototype.wrapperInit = function (para) {
            var weekCourseWrapper = h("div", { className: "week-course" },
                h("div", { className: "title" }),
                h("div", { className: "course-table" },
                    h("div", { className: "table-col first-col" },
                        h("div", { className: "table-title table-th" }, "\u65E5\u671F"),
                        h("div", { className: "table-title table-cell" }, "\u4E0A\u5348"),
                        h("div", { className: "table-title table-cell" }, "\u4E0B\u5348"),
                        h("div", { className: "table-title table-cell" }, "\u665A\u4E0A"))));
            return weekCourseWrapper;
        };
        WeekCourse.prototype.addClass = function (courNum) {
            if (courNum > 0) {
                return 'has-course';
            }
            else {
                return '';
            }
        };
        WeekCourse.prototype.set = function (courses) {
            var _this = this;
            this.url = courses.link; // url地址
            var caption = courses.caption;
            d.query('.title', this.wrapper).innerText = caption.split('（')[0];
            d.query('.title', this.wrapper).appendChild(h("span", null, caption.split('（')[1].split('）')[0]));
            var cs = courses.data, coursesWrapper = d.query('.course-table', this.wrapper);
            var timeArr = [];
            // 把时间戳转化为时间字符串
            tools.isNotEmpty(cs) && cs.forEach(function (course) {
                timeArr.push(_this.formatTime(course[0]));
            });
            var curDate = new Date(), day = curDate.getDay(), date = curDate.getDate();
            day = day === 0 ? 7 : day;
            var firstDate = new Date(curDate.setDate(date - day + 1)).getTime();
            if (timeArr.length === 0) {
                for (var i = 0; i < 7; i++) {
                    var date_1 = this.getDate(i, firstDate);
                    var courWrapper = h("div", { className: "table-col" },
                        h("div", { className: "table-th" }, date_1),
                        h("div", { className: 'table-cell' }, 0),
                        h("div", { className: 'table-cell' }, 0),
                        h("div", { className: 'table-cell' }, 0));
                    coursesWrapper.appendChild(courWrapper);
                }
            }
            else {
                for (var i = 0; i < 7; i++) {
                    var date_2 = this.getDate(i, firstDate);
                    var currentCS = [];
                    for (var i_1 = 0; i_1 < timeArr.length; i_1++) {
                        if (timeArr[i_1] === date_2) {
                            currentCS = cs[i_1];
                            break;
                        }
                    }
                    var courWrapper = null;
                    if (tools.isNotEmpty(currentCS)) {
                        courWrapper = this.getTableCell(currentCS, date_2);
                    }
                    else {
                        courWrapper = h("div", { className: "table-col" },
                            h("div", { className: "table-th" }, date_2),
                            h("div", { className: 'table-cell' }, "0"),
                            h("div", { className: 'table-cell' }, "0"),
                            h("div", { className: 'table-cell' }, "0"));
                    }
                    coursesWrapper.appendChild(courWrapper);
                }
            }
        };
        WeekCourse.prototype.getTableCell = function (currentCS, date) {
            var a = Number(currentCS[1]), b = Number(currentCS[2]), c = Number(currentCS[3]);
            var dateStr = this.formatTime(Number(currentCS[0]), false);
            var currentWrapper = h("div", { className: "table-col" },
                h("div", { className: "table-th" }, date),
                a === 0 ? h("div", { className: 'table-cell' }, "0") :
                    h("div", { className: 'table-cell has-course queryDetail', "data-start": dateStr + '  07:00', "data-end": dateStr + '  12:00' }, a),
                b === 0 ? h("div", { className: 'table-cell' }, "0") :
                    h("div", { className: 'table-cell has-course queryDetail', "data-start": dateStr + '  12:00', "data-end": dateStr + '  18:00' }, b),
                c === 0 ? h("div", { className: 'table-cell' }, "0") :
                    h("div", { className: 'table-cell has-course queryDetail', "data-start": dateStr + '  18:00', "data-end": dateStr + '  23:59' }, c));
            return currentWrapper;
        };
        WeekCourse.prototype.formatTime = function (time, hasWeek) {
            if (hasWeek === void 0) { hasWeek = true; }
            var date = new Date(time * 1000), week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            return hasWeek === true ? (date.getMonth() + 1) + '-' + date.getDate() + ' ' + week[date.getDay()] : date.getFullYear() + '-' + this.handleNum(date.getMonth() + 1) + '-' + this.handleNum(date.getDate());
        };
        WeekCourse.prototype.handleNum = function (num) {
            return num < 10 ? '0' + num : num.toString();
        };
        WeekCourse.prototype.getDate = function (index, time) {
            var date = new Date(time + index * 24 * 60 * 60 * 1000), week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            return (date.getMonth() + 1) + '-' + date.getDate() + ' ' + week[date.getDay()];
        };
        WeekCourse.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.initEvents.off();
        };
        return WeekCourse;
    }(Component));
    exports.WeekCourse = WeekCourse;
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
