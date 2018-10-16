/// <amd-module name="BasicInfo"/>
define("BasicInfo", ["require", "exports", "ActivityRadioModule", "ActivityClass", "CourseClass", "ReportActivityPage"], function (require, exports, ActivityRadioModule_1, ActivityClass_1, CourseClass_1, ReportActivityPage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var Component = G.Component;
    var BasicInfo = /** @class */ (function (_super) {
        __extends(BasicInfo, _super);
        function BasicInfo(para) {
            var _this = _super.call(this, para) || this;
            _this.isShow = tools.isNotEmpty(para.isNotShow) ? para.isNotShow : false;
            _this.innerCom.activityCategory.onChange(function (e) {
                var input = e.target, value = input.value;
                if (value === '活动类') {
                    _this.innerCom.activityClass.isNotShow = false;
                    _this.innerCom.courseClass.isNotShow = true;
                }
                else {
                    _this.innerCom.activityClass.isNotShow = true;
                    _this.innerCom.courseClass.isNotShow = false;
                }
            });
            return _this;
        }
        BasicInfo.prototype.wrapperInit = function (para) {
            var _this = this;
            var basicInfoWrapper = h("div", { className: "basicInfo step-content-item" },
                h("div", { className: "row" },
                    h(ActivityRadioModule_1.ActivityRadioModule, { "c-var": "activityCategory", title: "\u6D3B\u52A8\u7C7B\u522B", isRequired: true, value: ['活动类', '课程类'], field: "activityCatorygory" })),
                h(ActivityClass_1.ActivityClass, { isNotShow: false, "c-var": "activityClass", nextHandler: function () {
                        var isValidate = _this.get();
                        if (isValidate) {
                            para.clickHandler();
                        }
                        // para.clickHandler();
                    } }),
                h(CourseClass_1.CourseClass, { isNotShow: true, "c-var": "courseClass", nextHandler: function () {
                        var isValidate = _this.get();
                        if (isValidate) {
                            para.clickHandler();
                        }
                    } }));
            return basicInfoWrapper;
        };
        Object.defineProperty(BasicInfo.prototype, "isShow", {
            get: function () {
                return this._isShow;
            },
            set: function (show) {
                this._isShow = show;
                this.wrapper.classList.toggle('hide', show);
            },
            enumerable: true,
            configurable: true
        });
        BasicInfo.prototype.get = function () {
            // 活动类别
            var activityCategory = this.innerCom.activityCategory.get();
            ReportActivityPage_1.ReportActivityPage.reportData.activityCategory = activityCategory;
            if (activityCategory === 0) {
                return this.innerCom.activityClass.get();
            }
            else {
                return this.innerCom.courseClass.get();
            }
        };
        BasicInfo.prototype.set = function (basicInfo) {
            if (tools.isNotEmpty(basicInfo)) {
                this.innerCom.activityCategory.set(Number(basicInfo.activity.activityCategory));
                if (Number(basicInfo.activity.activityCategory) === 0) {
                    this.innerCom.activityClass.set(basicInfo);
                    this.innerCom.courseClass.set({});
                    this.innerCom.courseClass.isNotShow = true;
                    this.innerCom.activityClass.isNotShow = false;
                }
                else {
                    this.innerCom.activityClass.set({});
                    this.innerCom.courseClass.set(basicInfo);
                    this.innerCom.courseClass.isNotShow = false;
                    this.innerCom.activityClass.isNotShow = true;
                }
            }
            else {
                this.innerCom.courseClass.set({});
                this.innerCom.activityClass.set({});
            }
            var states = ['草稿', '新增', '不通过'];
            if (states.indexOf(ReportActivityPage_1.ReportActivityPage.state) >= 0) {
                this.disabled = false;
            }
            else {
                this.disabled = true;
            }
        };
        Object.defineProperty(BasicInfo.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (dis) {
                if (tools.isNotEmpty(dis)) {
                    this._disabled = dis;
                    this.innerCom.activityCategory.disabled = dis;
                    this.innerCom.activityClass.disabled = dis;
                    this.innerCom.courseClass.disabled = dis;
                }
            },
            enumerable: true,
            configurable: true
        });
        BasicInfo.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
        };
        return BasicInfo;
    }(Component));
    exports.BasicInfo = BasicInfo;
});

/// <amd-module name="GroupOriented"/>
define("GroupOriented", ["require", "exports", "GroupCheckModule", "GroupRadioModule", "Button", "ReportActivityPage", "LeRule", "Modal", "LeButtonGroup"], function (require, exports, GroupCheckModule_1, GroupRadioModule_1, Button_1, ReportActivityPage_1, LeRule_1, Modal_1, LeButtonGroup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var Component = G.Component;
    var GroupOriented = /** @class */ (function (_super) {
        __extends(GroupOriented, _super);
        function GroupOriented(para) {
            var _this = _super.call(this, para) || this;
            _this.isShow = tools.isNotEmpty(para.isNotShow) ? para.isNotShow : false;
            return _this;
        }
        GroupOriented.prototype.wrapperInit = function (para) {
            var _this = this;
            var groupOrientedWrapper = h("div", { className: "groupOriented" },
                h(GroupCheckModule_1.GroupCheckModule, { "c-var": "college", title: "\u9762\u5411\u5B66\u9662", clickHandle: function (id, isCheck) {
                        var getData = function () {
                            var college = _this.innerCom.college, major = _this.innerCom.major, clbum = _this.innerCom.clbum, grade = _this.innerCom.grade;
                            if (id === '0') {
                                if (isCheck === true) {
                                    major.set([]);
                                    major.setCheckedValue(['0']);
                                    // clbum.setCheckedValue(['0']);
                                    // clbum.disabled = true;
                                }
                                else {
                                    major.setCheckedValue([]);
                                    // clbum.setCheckedValue([]);
                                    // clbum.disabled = false;
                                }
                            }
                            else {
                                var collegeValues = college.getCheckedValue(), majorValues_1 = major.getCheckedValue();
                                // gradeValues = grade.getCheckedValue(),
                                // clbumValues = clbum.getCheckedValue();
                                _this.getMajor(collegeValues).then(function (res) {
                                    if (tools.isEmpty(res)) {
                                        major.set([]);
                                        major.setSelectAll();
                                    }
                                    else {
                                        major.set(res);
                                        major.setCheckedValue(majorValues_1);
                                    }
                                });
                                // this.getClbum(majorValues, gradeValues).then((res) => {
                                //     if (tools.isEmpty(res)) {
                                //         clbum.set([]);
                                //         clbum.setSelectAll();
                                //     } else {
                                //         clbum.set(res);
                                //         clbum.setCheckedValue(clbumValues);
                                //     }
                                // })
                            }
                        };
                        var func = tools.pattern.debounce(getData, 30);
                        func();
                    } }),
                h(GroupCheckModule_1.GroupCheckModule, { "c-var": "major", title: "\u9762\u5411\u4E13\u4E1A", clickHandle: function (id, ischeck) {
                        var getData = function () {
                            var major = _this.innerCom.major, clbum = _this.innerCom.clbum, grade = _this.innerCom.grade;
                            var majorValues = major.getCheckedValue(), gradeValues = grade.getCheckedValue(), clbumValues = clbum.classGetCheckedValue();
                            _this.getClbum(majorValues, gradeValues).then(function (res) {
                                if (tools.isEmpty(res)) {
                                    clbum.set([]);
                                }
                                else {
                                    clbum.set(res);
                                    clbum.setCheckedValue(clbumValues);
                                }
                                if (id === '0') {
                                    if (ischeck === true && grade.getIsSelectFirst()) {
                                        clbum.setSelectAll();
                                    }
                                }
                            });
                        };
                        var func = tools.pattern.debounce(getData, 30);
                        func();
                    } }),
                h(GroupCheckModule_1.GroupCheckModule, { "c-var": "clbum", title: "\u9762\u5411\u73ED\u7EA7" }),
                h(GroupCheckModule_1.GroupCheckModule, { "c-var": "grade", title: "\u9762\u5411\u5E74\u7EA7", clickHandle: function (id, ischeck) {
                        var getData = function () {
                            var major = _this.innerCom.major, clbum = _this.innerCom.clbum, grade = _this.innerCom.grade, majorValues = major.getCheckedValue(), gradeValues = grade.getCheckedValue(), clbumValues = clbum.classGetCheckedValue();
                            _this.getClbum(majorValues, gradeValues).then(function (res) {
                                if (tools.isEmpty(res)) {
                                    clbum.set([]);
                                }
                                else {
                                    clbum.set(res);
                                    clbum.setCheckedValue(clbumValues);
                                }
                                if (id === '0') {
                                    if (ischeck === true && major.getIsSelectFirst()) {
                                        clbum.setSelectAll();
                                    }
                                }
                            });
                        };
                        var func = tools.pattern.debounce(getData, 30);
                        func();
                    } }),
                h(GroupRadioModule_1.GroupRadioModule, { "c-var": "otherCollege", title: "\u5176\u4ED6\u5B66\u9662", value: ['不限制', '允许报名但不给成绩', '不允许报名'], field: "otherCollege" }),
                h(GroupRadioModule_1.GroupRadioModule, { "c-var": "otherMajor", title: "\u5176\u4ED6\u4E13\u4E1A", value: ['不限制', '允许报名但不给成绩', '不允许报名'], field: "otherMajor" }),
                h(GroupRadioModule_1.GroupRadioModule, { "c-var": "otherClass", title: "\u5176\u4ED6\u73ED\u7EA7", value: ['不限制', '允许报名但不给成绩', '不允许报名'], field: "otherClass" }),
                h(GroupRadioModule_1.GroupRadioModule, { "c-var": "otherGrade", title: "\u5176\u4ED6\u5E74\u7EA7", value: ['不限制', '允许报名但不给成绩', '不允许报名'], field: "otherGrade" }),
                h("div", { className: "row btns" },
                    h("div", { className: "lesson-form-group" },
                        h(Button_1.Button, { content: "\u4E0A\u4E00\u6B65", onClick: function () {
                                para.preStepHandler();
                            }, className: "preBtn nextBtn" }),
                        h(Button_1.Button, { "c-var": "publish", content: "\u53D1\u5E03", className: "publish addBtn", onClick: function () {
                                var isValidate = _this.get();
                                if (!!isValidate) {
                                    var para_1 = ReportActivityPage_1.ReportActivityPage.reportData.get(), type = 'PUT';
                                    if (ReportActivityPage_1.ReportActivityPage.state === '不通过' || ReportActivityPage_1.ReportActivityPage.state === '草稿') {
                                        para_1.baseInfo.activity['activityId'] = ReportActivityPage_1.ReportActivityPage.activityId;
                                        type = 'POST';
                                    }
                                    LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.activityDetail + '?activity_status_id=1', {
                                        type: type,
                                        data: para_1
                                    }).then(function (_a) {
                                        var response = _a.response;
                                        Modal_1.Modal.toast(response.msg);
                                        LeButtonGroup_1.buttonAction.btnRefresh(3);
                                    });
                                }
                            } }),
                        h(Button_1.Button, { content: "\u4FDD\u5B58\u4E3A\u8349\u7A3F", onClick: function () {
                                var isValidate = _this.get();
                                if (!!isValidate) {
                                    var para_2 = ReportActivityPage_1.ReportActivityPage.reportData.get(), type = 'POST', url = LE.CONF.ajaxUrl.activityDetail;
                                    if (ReportActivityPage_1.ReportActivityPage.state === '新增') {
                                        type = 'PUT';
                                        url = url + '?activity_status_id=7';
                                    }
                                    else {
                                        para_2.baseInfo.activity['activityId'] = ReportActivityPage_1.ReportActivityPage.activityId;
                                    }
                                    LeRule_1.LeRule.Ajax.fetch(url, {
                                        type: type,
                                        data: para_2
                                    }).then(function (_a) {
                                        var response = _a.response;
                                        Modal_1.Modal.toast(response.msg);
                                        LeButtonGroup_1.buttonAction.btnRefresh(3);
                                    });
                                }
                            }, className: "publish addBtn", "c-var": "save" }))));
            return groupOrientedWrapper;
        };
        GroupOriented.prototype.isShowPublishButton = function () {
            var states = ['不通过', '草稿', '新增'];
            if (states.indexOf(ReportActivityPage_1.ReportActivityPage.state) >= 0) {
                this.innerCom.publish.isShow = true;
            }
            else {
                this.innerCom.publish.isShow = false;
            }
            var statesTitle = ['报名中', '进行中', '待开展', '已结束', '不通过'];
            if (statesTitle.indexOf(ReportActivityPage_1.ReportActivityPage.state) >= 0) {
                this.innerCom.save.content = '提交';
            }
            else {
                if (ReportActivityPage_1.ReportActivityPage.state === '草稿') {
                    this.innerCom.save.content = '保存';
                }
            }
        };
        Object.defineProperty(GroupOriented.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (dis) {
                if (tools.isEmpty(dis)) {
                    return;
                }
                this._disabled = dis;
                this.innerCom.otherCollege.disabled = dis;
                this.innerCom.otherMajor.disabled = dis;
                this.innerCom.otherGrade.disabled = dis;
                this.innerCom.otherClass.disabled = dis;
                this.innerCom.major.disabled = dis;
                this.innerCom.clbum.disabled = dis;
                this.innerCom.grade.disabled = dis;
                this.innerCom.college.disabled = dis;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GroupOriented.prototype, "isShow", {
            get: function () {
                return this._isShow;
            },
            set: function (show) {
                this._isShow = show;
                this.wrapper.classList.toggle('hide', show);
            },
            enumerable: true,
            configurable: true
        });
        GroupOriented.prototype.handlerData = function (cd) {
            var resultArr = [];
            cd.forEach(function (arr) {
                var obj = {
                    ID: '',
                    NAME: ''
                };
                arr.forEach(function (str, index) {
                    if (index === 0) {
                        obj.ID = str;
                    }
                    else {
                        obj.NAME = str;
                    }
                });
                resultArr.push(obj);
            });
            return resultArr;
        };
        GroupOriented.prototype.getMajor = function (values) {
            var _this = this;
            var val = [];
            if (tools.isEmpty(values)) {
                val.push('');
            }
            else {
                var allStr_1 = '';
                values.forEach(function (str, index) {
                    if (index === 0) {
                        allStr_1 += str;
                    }
                    else {
                        allStr_1 += "," + str;
                    }
                });
                val.push(allStr_1);
            }
            var url = tools.url.addObj(LE.CONF.ajaxUrl.major, {
                queryparams0: JSON.stringify({
                    not: false,
                    op: 0,
                    params: [{
                            not: false,
                            op: 2,
                            field: "sub_college_id",
                            values: val
                        }]
                })
            });
            return new Promise(function (resolve, reject) {
                LeRule_1.LeRule.Ajax.fetch(url).then(function (_a) {
                    var response = _a.response;
                    resolve(_this.handlerData(response.data.body.dataList));
                }).catch(function () {
                    reject();
                });
            });
        };
        GroupOriented.prototype.getClbum = function (majorValues, gradeValues) {
            var _this = this;
            var valMajor = [];
            if (tools.isEmpty(majorValues)) {
                valMajor.push('');
            }
            else {
                var allStr_2 = '';
                majorValues.forEach(function (str, index) {
                    if (index === 0) {
                        allStr_2 += str;
                    }
                    else {
                        allStr_2 += "," + str;
                    }
                });
                valMajor.push(allStr_2);
            }
            var valGrade = [];
            if (tools.isEmpty(majorValues)) {
                valGrade.push('');
            }
            else {
                var allStr_3 = '';
                gradeValues.forEach(function (str, index) {
                    if (index === 0) {
                        allStr_3 += str;
                    }
                    else {
                        allStr_3 += "," + str;
                    }
                });
                valGrade.push(allStr_3);
            }
            var url = tools.url.addObj(LE.CONF.ajaxUrl.clbum, {
                queryparams0: JSON.stringify({
                    not: false,
                    op: 0,
                    params: [{
                            not: false,
                            op: 2,
                            field: "major_id",
                            values: valMajor
                        }, {
                            not: false,
                            op: 2,
                            field: "grade_name",
                            values: valGrade
                        }]
                })
            });
            return new Promise(function (resolve, reject) {
                LeRule_1.LeRule.Ajax.fetch(url).then(function (_a) {
                    var response = _a.response;
                    resolve(_this.handlerData(response.data.body.dataList));
                }).catch(function () {
                    reject();
                });
            });
        };
        GroupOriented.prototype.set = function (data) {
            var _this = this;
            this.isShowPublishButton();
            if (tools.isNotEmpty(data) && tools.isNotEmpty(data.object)) {
                this.innerCom.otherCollege.set(data.object.otherCollege);
                this.innerCom.otherMajor.set(data.object.otherMajor);
                this.innerCom.otherGrade.set(data.object.otherGrade);
                this.innerCom.otherClass.set(data.object.otherClass);
                var p1 = new Promise(function (resolve, reject) {
                    LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.colleges).then(function (_a) {
                        var response = _a.response;
                        _this.innerCom.college.set(_this.handlerData(response.data.body.dataList));
                        resolve();
                    }).catch(function () {
                        reject();
                    });
                });
                var p2 = new Promise(function (resolve, reject) {
                    LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.grade).then(function (_a) {
                        var response = _a.response;
                        _this.innerCom.grade.set(_this.handlerData(response.data.body.dataList));
                        resolve();
                    }).catch(function () {
                        reject();
                    });
                });
                Promise.all([p1, p2]).then(function () {
                    var collegeData = _this.getResultData(data.college), majorData = _this.getResultData(data.major), clbumData = _this.getResultData(data.clbum), gradeData = _this.getResultData(data.grade);
                    _this.getClbum(majorData, gradeData).then(function (res) {
                        _this.innerCom.clbum.set(res);
                        var states = ['草稿', '新增', '不通过'];
                        if (states.indexOf(ReportActivityPage_1.ReportActivityPage.state) >= 0) {
                            _this.disabled = false;
                        }
                        else {
                            _this.disabled = true;
                        }
                        if (data.object.limitMajor === 0 && data.object.limitGrade === 0) {
                            _this.innerCom.clbum.setSelectAll();
                        }
                        else {
                            _this.innerCom.clbum.setCheckedValue(clbumData);
                        }
                        if (data.object.limitCollege === 0) {
                            _this.innerCom.college.setSelectAll();
                            _this.innerCom.major.setSelectAll();
                            if (data.object.limitGrade === 0) {
                                _this.innerCom.grade.setSelectAll();
                            }
                            else {
                                _this.innerCom.grade.setCheckedValue(gradeData);
                            }
                        }
                        else {
                            _this.innerCom.college.setCheckedValue(collegeData);
                            _this.getMajor(collegeData).then(function (res) {
                                _this.innerCom.major.set(res);
                                var states = ['草稿', '新增', '不通过'];
                                if (states.indexOf(ReportActivityPage_1.ReportActivityPage.state) >= 0) {
                                    _this.disabled = false;
                                }
                                else {
                                    _this.disabled = true;
                                }
                                if (data.object.limitMajor === 0) {
                                    _this.innerCom.major.setSelectAll();
                                }
                                else {
                                    _this.innerCom.major.setCheckedValue(majorData);
                                }
                                if (data.object.limitGrade === 0) {
                                    _this.innerCom.grade.setSelectAll();
                                }
                                else {
                                    _this.innerCom.grade.setCheckedValue(gradeData);
                                }
                            });
                        }
                    });
                });
            }
            else {
                LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.colleges).then(function (_a) {
                    var response = _a.response;
                    _this.innerCom.college.set(_this.handlerData(response.data.body.dataList));
                }).catch(function () {
                });
                LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.grade).then(function (_a) {
                    var response = _a.response;
                    _this.innerCom.grade.set(_this.handlerData(response.data.body.dataList));
                }).catch(function () {
                });
                var states = ['草稿', '新增', '不通过'];
                if (states.indexOf(ReportActivityPage_1.ReportActivityPage.state) >= 0) {
                    this.disabled = false;
                }
                else {
                    this.disabled = true;
                }
            }
        };
        GroupOriented.prototype.getResultData = function (data) {
            var result = [];
            if (tools.isNotEmpty(data)) {
                data.forEach(function (d) {
                    result.push(d.id);
                });
            }
            return result;
        };
        GroupOriented.prototype.get = function () {
            var college = this.innerCom.college.get();
            if (college === false) {
                return false;
            }
            var major = this.innerCom.major.get();
            if (major === false) {
                return false;
            }
            var clbum = this.innerCom.clbum.get();
            if (clbum === false) {
                return false;
            }
            var grade = this.innerCom.grade.get();
            if (grade === false) {
                return false;
            }
            var otherCollege = this.innerCom.otherCollege.get();
            var otherMajor = this.innerCom.otherMajor.get();
            var otherClass = this.innerCom.otherClass.get();
            var otherGrade = this.innerCom.otherGrade.get();
            var limitCollege = college.limit, collegeData = college.array;
            ReportActivityPage_1.ReportActivityPage.reportData.limitCollege = limitCollege;
            ReportActivityPage_1.ReportActivityPage.reportData.college = collegeData;
            var limitMajor = major.limit, majorData = major.array;
            ReportActivityPage_1.ReportActivityPage.reportData.limitMajor = limitMajor;
            ReportActivityPage_1.ReportActivityPage.reportData.major = majorData;
            var limitGrade = grade.limit, gradeData = grade.array;
            ReportActivityPage_1.ReportActivityPage.reportData.limitGrade = limitGrade;
            ReportActivityPage_1.ReportActivityPage.reportData.grade = gradeData;
            var limitClass = clbum.limit, clbumData = clbum.array;
            ReportActivityPage_1.ReportActivityPage.reportData.limitClass = limitClass;
            ReportActivityPage_1.ReportActivityPage.reportData.clbum = clbumData;
            ReportActivityPage_1.ReportActivityPage.reportData.otherClass = otherClass;
            ReportActivityPage_1.ReportActivityPage.reportData.otherGrade = otherGrade;
            ReportActivityPage_1.ReportActivityPage.reportData.otherMajor = otherMajor;
            ReportActivityPage_1.ReportActivityPage.reportData.otherCollege = otherCollege;
            return true;
        };
        return GroupOriented;
    }(Component));
    exports.GroupOriented = GroupOriented;
});

/// <amd-module name="ReportActivityData"/>
define("ReportActivityData", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var ReportActivityData = /** @class */ (function () {
        function ReportActivityData(para) {
            // BaseInfo
            this.activityCategory = tools.isEmpty(para) ? 0 : para.baseInfo.activity.activityCategory;
            this.activityLevel = tools.isEmpty(para) ? '' : para.baseInfo.activity.activityLevel;
            this.activityAttribution = tools.isEmpty(para) ? '' : para.baseInfo.activity.activityAttribution;
            this.activityPlatform = tools.isEmpty(para) ? '' : para.baseInfo.activity.activityPlatform;
            this.platformCategory = tools.isEmpty(para) ? '' : para.baseInfo.activity.platformCategory;
            this.activityName = tools.isEmpty(para) ? '' : para.baseInfo.activity.activityName;
            this.slogan = tools.isEmpty(para) ? '' : para.baseInfo.activity.slogan;
            this.address = tools.isEmpty(para) ? '' : para.baseInfo.activity.address;
            this.teacherInfo = {
                teacherName: tools.isEmpty(para) ? '' : para.baseInfo.activity.teacherName,
                teacherPosition: tools.isEmpty(para) ? '' : para.baseInfo.activity.teacherPosition,
                teacherId: tools.isEmpty(para) ? '' : para.baseInfo.activity.teacherId
            };
            this.courseDescription = tools.isEmpty(para) ? '' : para.baseInfo.activity.courseDescription;
            this.coverPicture = tools.isEmpty(para) ? '' : para.baseInfo.activity.coverPicture;
            this.remind = tools.isEmpty(para) ? '' : para.baseInfo.activity.remind;
            this.accessory = tools.isEmpty(para) ? '' : para.baseInfo.activity.accessory;
            // this.consult = tools.isEmpty(para) ? 0 : para.baseInfo.activity.consult;
            this.sponsor = tools.isEmpty(para) ? [] : para.baseInfo.sponsor;
            this.contractor = tools.isEmpty(para) ? [] : para.baseInfo.contractor;
            this.assist = tools.isEmpty(para) ? [] : para.baseInfo.assist;
            this.charge = tools.isEmpty(para) ? [] : para.baseInfo.charge;
            // RuleSetting
            this.activityBeginTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activityBeginTime;
            this.activityEndTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activityEndTime;
            this.applicationBeginTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.applicationBeginTime;
            this.applicationEndTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.applicationEndTime;
            this.activityRetroactive = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activityRetroactive;
            this.activityRetroBeginTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activityRetroBeginTime;
            this.activityRetroEndTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activityRetroEndTime;
            this.activityCancel = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activityCancel;
            this.activityCancelBeginTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activityCancelBeginTime;
            this.activityCancelEndTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activityCancelEndTime;
            this.signBack = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.signBack;
            this.signBackStartTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.signBackStartTime;
            this.signBackEndTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.signBackEndTime;
            this.longitude = tools.isEmpty(para) ? '' : para.ruleSetting.rule.longitude;
            this.latitude = tools.isEmpty(para) ? '' : para.ruleSetting.rule.latitude;
            this.signType = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.signType;
            this.distance = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.distance;
            this.signPosition = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.signPosition;
            this.duration = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.duration;
            this.signCaption = tools.isEmpty(para) ? '' : para.ruleSetting.rule.signCaption;
            this.activitiesList = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activitiesList;
            this.activityComment = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activityComment;
            this.commentEndTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.commentEndTime;
            this.roleCancel = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.roleCancel;
            this.roleCancelBeginTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.roleCancelBeginTime;
            this.roleCancelEndTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.roleCancelEndTime;
            this.signContent = tools.isEmpty(para) ? [] : para.ruleSetting.signContent;
            this.controller = tools.isEmpty(para) ? [] : para.ruleSetting.controller;
            this.controllerType = tools.isEmpty(para) ? {} : para.ruleSetting.controllerType;
            this.organizer = tools.isEmpty(para) ? [] : para.ruleSetting.organizer;
            this.organizerType = tools.isEmpty(para) ? {} : para.ruleSetting.organizerType;
            this.participant = tools.isEmpty(para) ? [] : para.ruleSetting.participant;
            this.participantType = tools.isEmpty(para) ? {} : para.ruleSetting.participantType;
            this.activitieList = tools.isEmpty(para) ? [] : para.ruleSetting.activitieList;
            //objectSetting
            this.limitCollege = tools.isEmpty(para) ? 0 : para.objectSetting.object.limitCollege;
            this.limitMajor = tools.isEmpty(para) ? 0 : para.objectSetting.object.limitMajor;
            this.limitGrade = tools.isEmpty(para) ? 0 : para.objectSetting.object.limitGrade;
            this.limitClass = tools.isEmpty(para) ? 0 : para.objectSetting.object.limitClass;
            this.otherCollege = tools.isEmpty(para) ? 0 : para.objectSetting.object.otherCollege;
            this.otherMajor = tools.isEmpty(para) ? 0 : para.objectSetting.object.otherMajor;
            this.otherGrade = tools.isEmpty(para) ? 0 : para.objectSetting.object.otherGrade;
            this.otherClass = tools.isEmpty(para) ? 0 : para.objectSetting.object.otherClass;
            this.clbum = tools.isEmpty(para) ? [] : para.objectSetting.clbum;
            this.major = tools.isEmpty(para) ? [] : para.objectSetting.major;
            this.college = tools.isEmpty(para) ? [] : para.objectSetting.college;
            this.grade = tools.isEmpty(para) ? [] : para.objectSetting.grade;
        }
        Object.defineProperty(ReportActivityData.prototype, "activityCategory", {
            get: function () {
                return this._activityCategory;
            },
            set: function (ac) {
                this._activityCategory = ac;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "activityLevel", {
            get: function () {
                return this._activityLevel;
            },
            set: function (al) {
                this._activityLevel = al;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "activityAttribution", {
            get: function () {
                return this._activityAttribution;
            },
            set: function (a) {
                this._activityAttribution = a;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "activityPlatform", {
            get: function () {
                return this._activityPlatform;
            },
            set: function (ap) {
                this._activityPlatform = ap;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "platformCategory", {
            get: function () {
                return this._platformCategory;
            },
            set: function (pc) {
                this._platformCategory = pc;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "activityName", {
            get: function () {
                return this._activityName;
            },
            set: function (an) {
                this._activityName = an;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "slogan", {
            get: function () {
                return this._slogan;
            },
            set: function (s) {
                this._slogan = s;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "address", {
            get: function () {
                return this._address;
            },
            set: function (a) {
                this._address = a;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "teacherInfo", {
            get: function () {
                return this._teacherInfo;
            },
            set: function (tn) {
                this._teacherInfo = tn;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "courseDescription", {
            get: function () {
                return this._courseDescription;
            },
            set: function (cd) {
                this._courseDescription = cd;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "coverPicture", {
            get: function () {
                return this._coverPicture;
            },
            set: function (cp) {
                this._coverPicture = cp;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "remind", {
            get: function () {
                return this._remind;
            },
            set: function (re) {
                this._remind = re;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "accessory", {
            get: function () {
                return this._accessory;
            },
            set: function (ac) {
                this._accessory = ac;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "remark", {
            get: function () {
                return this._remark;
            },
            set: function (rema) {
                this._remark = rema;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "sponsor", {
            get: function () {
                return this._sponsor;
            },
            set: function (s) {
                this._sponsor = s;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "contractor", {
            get: function () {
                return this._contractor;
            },
            set: function (c) {
                this._contractor = c;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "assist", {
            get: function () {
                return this._assist;
            },
            set: function (a) {
                this._assist = a;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "charge", {
            get: function () {
                return this._charge;
            },
            set: function (c) {
                this._charge = c;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "activityBeginTime", {
            get: function () {
                return this._activityBeginTime;
            },
            set: function (ab) {
                this._activityBeginTime = ab;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "activityEndTime", {
            get: function () {
                return this._activityEndTime;
            },
            set: function (ae) {
                this._activityEndTime = ae;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "applicationBeginTime", {
            get: function () {
                return this._applicationBeginTime;
            },
            set: function (ab) {
                this._applicationBeginTime = ab;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "applicationEndTime", {
            get: function () {
                return this._applicationEndTime;
            },
            set: function (ae) {
                this._applicationEndTime = ae;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "activityRetroactive", {
            get: function () {
                return this._activityRetroactive;
            },
            set: function (ar) {
                this._activityRetroactive = ar;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "activityRetroBeginTime", {
            get: function () {
                return this._activityRetroBeginTime;
            },
            set: function (ar) {
                this._activityRetroBeginTime = ar;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "activityRetroEndTime", {
            get: function () {
                return this._activityRetroEndTime;
            },
            set: function (ar) {
                this._activityRetroEndTime = ar;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "activityCancel", {
            get: function () {
                return this._activityCancel;
            },
            set: function (ac) {
                this._activityCancel = ac;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "activityCancelBeginTime", {
            get: function () {
                return this._activityCancelBeginTime;
            },
            set: function (ac) {
                this._activityCancelBeginTime = ac;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "activityCancelEndTime", {
            get: function () {
                return this._activityCancelEndTime;
            },
            set: function (ac) {
                this._activityCancelEndTime = ac;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "signBack", {
            get: function () {
                return this._signBack;
            },
            set: function (sb) {
                this._signBack = sb;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "signBackStartTime", {
            get: function () {
                return this._signBackStartTime;
            },
            set: function (sb) {
                this._signBackStartTime = sb;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "signBackEndTime", {
            get: function () {
                return this._signBackEndTime;
            },
            set: function (se) {
                this._signBackEndTime = se;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "longitude", {
            get: function () {
                return this._longitude;
            },
            set: function (lon) {
                this._longitude = lon;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "latitude", {
            get: function () {
                return this._latitude;
            },
            set: function (lat) {
                this._latitude = lat;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "signType", {
            get: function () {
                return this._signType;
            },
            set: function (st) {
                this._signType = st;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "distance", {
            get: function () {
                return this._distance;
            },
            set: function (dis) {
                this._distance = dis;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "signCaption", {
            get: function () {
                return this._signCaption;
            },
            set: function (s) {
                this._signCaption = s;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "signPosition", {
            get: function () {
                return this._signPosition;
            },
            set: function (sp) {
                this._signPosition = sp;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "duration", {
            get: function () {
                return this._duration;
            },
            set: function (du) {
                this._duration = du;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "activitiesList", {
            get: function () {
                return this._activitiesList;
            },
            set: function (al) {
                this._activitiesList = al;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "activitieList", {
            get: function () {
                return this._activitieList;
            },
            set: function (al) {
                this._activitieList = al;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "roleCancel", {
            get: function () {
                return this._roleCancel;
            },
            set: function (rc) {
                this._roleCancel = rc;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "roleCancelBeginTime", {
            get: function () {
                return this._roleCancelBeginTime;
            },
            set: function (rc) {
                this._roleCancelBeginTime = rc;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "roleCancelEndTime", {
            get: function () {
                return this._roleCancelEndTime;
            },
            set: function (rc) {
                this._roleCancelEndTime = rc;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "activityComment", {
            get: function () {
                return this._activityComment;
            },
            set: function (ac) {
                this._activityComment = ac;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "commentEndTime", {
            get: function () {
                return this._commentEndTime;
            },
            set: function (ce) {
                this._commentEndTime = ce;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "signContent", {
            get: function () {
                return this._signContent;
            },
            set: function (sc) {
                this._signContent = sc;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "controller", {
            get: function () {
                return this._controller;
            },
            set: function (c) {
                this._controller = c;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "controllerType", {
            get: function () {
                return this._controllerType;
            },
            set: function (c) {
                this._controllerType = c;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "organizer", {
            get: function () {
                return this._organizer;
            },
            set: function (o) {
                this._organizer = o;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "organizerType", {
            get: function () {
                return this._organizerType;
            },
            set: function (ot) {
                this._organizerType = ot;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "participant", {
            get: function () {
                return this._participant;
            },
            set: function (p) {
                this._participant = p;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "participantType", {
            get: function () {
                return this._participantType;
            },
            set: function (pt) {
                this._participantType = pt;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "limitCollege", {
            get: function () {
                return this._limitCollege;
            },
            set: function (limit) {
                this._limitCollege = limit;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "limitMajor", {
            get: function () {
                return this._limitMajor;
            },
            set: function (lm) {
                this._limitMajor = lm;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "limitGrade", {
            get: function () {
                return this._limitGrade;
            },
            set: function (lg) {
                this._limitGrade = lg;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "limitClass", {
            get: function () {
                return this._limitClass;
            },
            set: function (lc) {
                this._limitClass = lc;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "otherCollege", {
            get: function () {
                return this._otherCollege;
            },
            set: function (oc) {
                this._otherCollege = oc;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "otherMajor", {
            get: function () {
                return this._otherMajor;
            },
            set: function (om) {
                this._otherMajor = om;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "otherGrade", {
            get: function () {
                return this._otherGrade;
            },
            set: function (og) {
                this._otherGrade = og;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "otherClass", {
            get: function () {
                return this._otherClass;
            },
            set: function (oc) {
                this._otherClass = oc;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "college", {
            get: function () {
                return this._college;
            },
            set: function (c) {
                this._college = c;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "major", {
            get: function () {
                return this._major;
            },
            set: function (m) {
                this._major = m;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "grade", {
            get: function () {
                return this._grade;
            },
            set: function (g) {
                this._grade = g;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityData.prototype, "clbum", {
            get: function () {
                return this._clbum;
            },
            set: function (c) {
                this._clbum = c;
            },
            enumerable: true,
            configurable: true
        });
        ReportActivityData.prototype.get = function () {
            var activityData = {
                baseInfo: {
                    activity: {
                        activityCategory: this.activityCategory,
                        activityLevel: this.activityLevel,
                        activityAttribution: this.activityAttribution,
                        activityPlatform: this.activityPlatform,
                        platformCategory: this.platformCategory,
                        activityName: this.activityName,
                        slogan: this.slogan,
                        address: this.address,
                        teacherId: this.teacherInfo.teacherId,
                        teacherName: this.teacherInfo.teacherName,
                        teacherPosition: this.teacherInfo.teacherPosition,
                        courseDescription: this.courseDescription,
                        coverPicture: this.coverPicture,
                        remind: this.remind,
                        accessory: this.accessory,
                        // consult: this.consult,
                        remark: this.remark
                    },
                    sponsor: this.sponsor,
                    contractor: this.contractor,
                    assist: this.assist,
                    charge: this.charge
                },
                ruleSetting: {
                    rule: {
                        activityBeginTime: this.activityBeginTime,
                        activityEndTime: this.activityEndTime,
                        applicationBeginTime: this.applicationBeginTime,
                        applicationEndTime: this.applicationEndTime,
                        activityRetroactive: this.activityRetroactive,
                        activityRetroBeginTime: this.activityRetroBeginTime,
                        activityRetroEndTime: this.activityRetroEndTime,
                        activityCancel: this.activityCancel,
                        activityCancelBeginTime: this.activityCancelBeginTime,
                        activityCancelEndTime: this.activityCancelEndTime,
                        activitiesList: this.activitiesList,
                        roleCancel: this.roleCancel,
                        roleCancelBeginTime: this.roleCancelBeginTime,
                        roleCancelEndTime: this.roleCancelEndTime,
                        activityComment: this.activityComment,
                        commentEndTime: this.commentEndTime,
                        signBack: this.signBack,
                        signBackStartTime: this.signBackStartTime,
                        signBackEndTime: this.signBackEndTime,
                        longitude: this.longitude,
                        latitude: this.latitude,
                        signType: this.signType,
                        distance: this.distance,
                        signPosition: this.signPosition,
                        duration: this.duration,
                        signCaption: this.signCaption
                    },
                    signContent: this.signContent,
                    controllerType: this.controllerType,
                    controller: this.controller,
                    organizerType: this.organizerType,
                    organizer: this.organizer,
                    participantType: this.participantType,
                    participant: this.participant,
                    activitieList: this.activitieList
                },
                objectSetting: {
                    object: {
                        limitCollege: this.limitCollege,
                        limitMajor: this.limitMajor,
                        limitGrade: this.limitGrade,
                        limitClass: this.limitClass,
                        otherCollege: this.otherCollege,
                        otherMajor: this.otherMajor,
                        otherGrade: this.otherGrade,
                        otherClass: this.otherClass
                    },
                    college: this.college,
                    major: this.major,
                    grade: this.grade,
                    clbum: this.clbum
                }
            };
            return activityData;
        };
        return ReportActivityData;
    }());
    exports.ReportActivityData = ReportActivityData;
});

/// <amd-module name="ReportActivityPage"/>
define("ReportActivityPage", ["require", "exports", "BasicInfo", "RuleSetting", "GroupOriented", "ReportActivityData", "LeRule"], function (require, exports, BasicInfo_1, RuleSetting_1, GroupOriented_1, ReportActivityData_1, LeRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SPAPage = G.SPAPage;
    var d = G.d;
    var tools = G.tools;
    var CONF = LE.CONF;
    var SPA = G.SPA;
    var ReportActivityPage = /** @class */ (function (_super) {
        __extends(ReportActivityPage, _super);
        function ReportActivityPage(para) {
            var _this = _super.call(this, para) || this;
            _this.backEvent = (function () {
                var backEve = function () {
                    SPA.close();
                };
                return {
                    on: function () { return d.on(_this.wrapper, 'click', '.back', backEve); },
                    off: function () { return d.off(_this.wrapper, 'click', '.back', backEve); }
                };
            })();
            _this.isOnceClose = true;
            return _this;
        }
        Object.defineProperty(ReportActivityPage.prototype, "title", {
            set: function (t) {
                this._title = t;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReportActivityPage.prototype, "titlt", {
            get: function () {
                return this._title;
            },
            enumerable: true,
            configurable: true
        });
        ReportActivityPage.prototype.wrapperInit = function () {
            var _this = this;
            var basicInfo = null, ruleSetting = null, groupOriented = null;
            var activityPageHTML = h("div", { className: "activity-page" },
                h("div", { className: "top" },
                    h("div", { className: "title" }, "\u7533\u62A5\u6D3B\u52A8"),
                    h("div", { className: "back" },
                        h("i", { className: "sec seclesson-fanhui" }),
                        "\u8FD4\u56DE")),
                h("div", { className: "reportWrapper" },
                    h("div", { className: "contentWrapper" },
                        h("div", { className: "stepBar" },
                            h("div", { className: "stepWrapper" },
                                h("div", { className: "line" }),
                                h("div", { className: "step-item active", "data-index": "0" },
                                    h("div", { className: "ball" }),
                                    h("div", { className: "text" }, "\u57FA\u7840\u4FE1\u606F")),
                                h("div", { className: "step-item", "data-index": "1" },
                                    h("div", { className: "ball" }),
                                    h("div", { className: "text" }, "\u89C4\u5219\u8BBE\u7F6E")),
                                h("div", { className: "step-item", "data-index": "2" },
                                    h("div", { className: "ball" }),
                                    h("div", { className: "text" }, "\u9762\u5411\u5BF9\u8C61")))),
                        h("div", { className: "stepContent" },
                            basicInfo = h(BasicInfo_1.BasicInfo, { isNotShow: false, clickHandler: function () {
                                    _this.nextStep(1);
                                } }),
                            ruleSetting = h(RuleSetting_1.RuleSetting, { isNotShow: true, preStepHandler: function () {
                                    _this.nextStep(0);
                                }, nextStepHandler: function () {
                                    _this.nextStep(2);
                                } }),
                            groupOriented = h(GroupOriented_1.GroupOriented, { isNotShow: true, preStepHandler: function () {
                                    _this.nextStep(1);
                                } })))));
            this.allStep = [basicInfo, ruleSetting, groupOriented];
            return activityPageHTML;
        };
        ReportActivityPage.prototype.init = function (para, data) {
            var _this = this;
            // 申报活动数据
            ReportActivityPage.reportData = new ReportActivityData_1.ReportActivityData({});
            ReportActivityPage.state = '新增';
            var ajaxData = JSON.parse(tools.url.getPara('ajaxData')), activityid = '';
            if (tools.isNotEmpty(ajaxData)) {
                activityid = ajaxData.activity_id;
            }
            if (tools.isNotEmpty(activityid)) {
                LeRule_1.LeRule.Ajax.fetch(tools.url.addObj(CONF.ajaxUrl.activityDetail, {
                    activityid: activityid
                }))
                    .then(function (_a) {
                    var response = _a.response;
                    ReportActivityPage.activityId = response.data.baseInfo.activity.activityId;
                    ReportActivityPage.state = response.data.baseInfo.activity.state;
                    _this.allStep[0].set(response.data.baseInfo);
                    _this.allStep[1].set(response.data.ruleSetting);
                    _this.allStep[2].set(response.data.objectSetting);
                });
            }
            else {
                this.allStep[0].set({});
                this.allStep[1].set({});
                this.allStep[2].set({});
            }
            setTimeout(function () {
                _this.backEvent.on();
            }, 200);
        };
        ReportActivityPage.prototype.nextStep = function (index) {
            this.allStep.forEach(function (step, i) {
                index === i ? (step.isShow = false) : (step.isShow = true);
            });
            var stepItem = d.queryAll('.step-item', this.wrapper);
            stepItem.forEach(function (item, i) {
                item.classList.toggle('active', i === index);
            });
            d.query('.lesson-content', document.body).scrollTo(0, 0);
        };
        ReportActivityPage.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.backEvent.off();
        };
        return ReportActivityPage;
    }(SPAPage));
    exports.ReportActivityPage = ReportActivityPage;
});

/// <amd-module name="RuleSetting"/>
define("RuleSetting", ["require", "exports", "TimeModule", "ActivityRadioModule", "ImportNameList", "DeadlineModule", "Button", "SignInModule", "SignBackModule", "IsSignBack", "ReportActivityPage", "Roles", "Modal", "CancelTimeModule", "LeRule", "LeButtonGroup"], function (require, exports, TimeModule_1, ActivityRadioModule_1, ImportNameList_1, DeadlineModule_1, Button_1, SignInModule_1, SignBackModule_1, IsSignBack_1, ReportActivityPage_1, Roles_1, Modal_1, CancelTimeModule_1, LeRule_1, LeButtonGroup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var tools = G.tools;
    var RuleSetting = /** @class */ (function (_super) {
        __extends(RuleSetting, _super);
        function RuleSetting(para) {
            var _this = _super.call(this, para) || this;
            _this.isShow = tools.isNotEmpty(para.isNotShow) ? para.isNotShow : false;
            return _this;
        }
        RuleSetting.prototype.wrapperInit = function (para) {
            var _this = this;
            var ruleSettingWrapper = h("div", { className: "rule-setting step-content-item" },
                h(TimeModule_1.TimeModule, { "c-var": "activityTime", isRequired: true, preAlert: "\u6D3B\u52A8", title: "\u6D3B\u52A8\u65F6\u95F4" }),
                h(TimeModule_1.TimeModule, { "c-var": "applicationTime", isRequired: true, preAlert: "\u62A5\u540D", title: "\u62A5\u540D\u65F6\u95F4" }),
                h(IsSignBack_1.IsSignBack, { "c-var": "signBack", isRequired: true, title: "\u7B7E\u5230\u7C7B\u578B", itemArr: ['签到', '签退'], changeItems: function (index) {
                        _this.innerCom.signIn.wrapper.classList.toggle('hide', index !== 0);
                        _this.innerCom.signBack.wrapper.classList.toggle('hide', index === 0);
                    } }),
                h("div", { className: "sign-content" },
                    h(SignInModule_1.SignInModule, { "c-var": "signIn" }),
                    h(SignBackModule_1.SignBackModule, { "c-var": "signBack" })),
                h(CancelTimeModule_1.CancelTimeModule, { title: "\u6D3B\u52A8\u8865\u7B7E", "c-var": "activityRetroactive", field: "ActivityRetroactive", value: ['否', '是'], timeTile: "\u6D3B\u52A8\u8865\u7B7E\u65F6\u95F4" }),
                h(CancelTimeModule_1.CancelTimeModule, { title: "\u6D3B\u52A8\u53D6\u6D88", "c-var": "activityCancel", field: "ActivityCancel", value: ['否', '是'], timeTile: "\u6D3B\u52A8\u53D6\u6D88\u65F6\u95F4" }),
                h(Roles_1.Roles, { "c-var": "roles" }),
                h(ImportNameList_1.ImportNameList, { title: "\u5BFC\u5165\u6D3B\u52A8\u540D\u5355", "c-var": "activitiesList", field: "activityList", value: ['否', '是'] }),
                h(CancelTimeModule_1.CancelTimeModule, { title: "\u89D2\u8272\u53D6\u6D88", "c-var": "roleCancel", field: "roleCancel", value: ['否', '是'], timeTile: "\u89D2\u8272\u53D6\u6D88\u65F6\u95F4" }),
                h("div", { className: "row" },
                    h(ActivityRadioModule_1.ActivityRadioModule, { "c-var": "activityComment", isRequired: true, title: "\u6D3B\u52A8\u8BC4\u4EF7", field: "activityComment", value: ['强制评价', '开放评价'] })),
                h(DeadlineModule_1.DeadlineModule, { "c-var": "commentEndTime" }),
                h("div", { className: "row btns" },
                    h("div", { className: "lesson-form-group" },
                        h(Button_1.Button, { content: "\u4E0A\u4E00\u6B65", onClick: function () {
                                para.preStepHandler();
                            }, className: "preBtn nextBtn" }),
                        h(Button_1.Button, { content: "\u4FDD\u5B58\u5E76\u4E0B\u4E00\u6B65", className: "nextBtn", onClick: function () {
                                var isValidate = _this.get();
                                if (isValidate) {
                                    if (ReportActivityPage_1.ReportActivityPage.reportData.activitiesList === 1) {
                                        var activityList = ReportActivityPage_1.ReportActivityPage.reportData.activitieList;
                                        if (tools.isEmpty(activityList)) {
                                            Modal_1.Modal.alert('请导入活动名单');
                                            return;
                                        }
                                        Modal_1.Modal.confirm({
                                            msg: '确认跳过第三步？',
                                            title: '提示',
                                            btns: ['取消', '发布'],
                                            callback: (function (flag) {
                                                if (flag === true) {
                                                    // 直接提交，不需要进行第三步
                                                    var para_1 = ReportActivityPage_1.ReportActivityPage.reportData.get(), type = 'PUT';
                                                    delete para_1.objectSetting;
                                                    if (ReportActivityPage_1.ReportActivityPage.state === '不通过' || ReportActivityPage_1.ReportActivityPage.state === '草稿') {
                                                        para_1.baseInfo.activity['activityId'] = ReportActivityPage_1.ReportActivityPage.activityId;
                                                        type = 'POST';
                                                    }
                                                    LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.activityDetail + '?activity_status_id=1', {
                                                        type: type,
                                                        data: para_1
                                                    }).then(function (_a) {
                                                        var response = _a.response;
                                                        Modal_1.Modal.toast(response.msg);
                                                        LeButtonGroup_1.buttonAction.btnRefresh(3);
                                                    });
                                                }
                                            })
                                        });
                                    }
                                    else {
                                        ReportActivityPage_1.ReportActivityPage.reportData.activitiesList = 0;
                                        ReportActivityPage_1.ReportActivityPage.reportData.activitieList = [];
                                        para.nextStepHandler();
                                    }
                                }
                                // para.nextStepHandler();
                            } }))));
            return ruleSettingWrapper;
        };
        Object.defineProperty(RuleSetting.prototype, "isShow", {
            get: function () {
                return this._isShow;
            },
            set: function (show) {
                this._isShow = show;
                this.wrapper.classList.toggle('hide', show);
            },
            enumerable: true,
            configurable: true
        });
        RuleSetting.prototype.set = function (data) {
            if (tools.isNotEmpty(data)) {
                this.innerCom.activityTime.set([data.rule.activityBeginTime, data.rule.activityEndTime]);
                this.innerCom.applicationTime.set([data.rule.applicationBeginTime, data.rule.applicationEndTime]);
                this.innerCom.signIn.set(data.signContent);
                this.innerCom.signBack.set({
                    signBack: data.rule.signBack,
                    signStartTime: data.rule.signBackStartTime,
                    signEndTime: data.rule.signBackEndTime,
                    latitude: data.rule.latitude,
                    longitude: data.rule.longitude,
                    signPosition: data.rule.signPosition,
                    signType: data.rule.signType,
                    distance: data.rule.distance,
                    duration: data.rule.duration
                });
                this.innerCom.activityRetroactive.set({
                    index: Number(data.rule.activityRetroactive),
                    startTime: data.rule.activityRetroBeginTime,
                    endTime: data.rule.activityRetroEndTime
                });
                this.innerCom.activityCancel.set({
                    index: Number(data.rule.activityCancel),
                    startTime: data.rule.activityCancelBeginTime,
                    endTime: data.rule.activityCancelEndTime
                });
                this.innerCom.roles.set({
                    controllerType: data.controllerType,
                    controller: data.controller,
                    organizerType: data.organizerType,
                    organizer: data.organizer,
                    participant: data.participant,
                    participantType: data.participantType
                });
                this.innerCom.activitiesList.set(data.rule.activitiesList, data.activitieList);
                this.innerCom.roleCancel.set({
                    index: Number(data.rule.roleCancel),
                    startTime: data.rule.roleCancelBeginTime,
                    endTime: data.rule.roleCancelEndTime
                });
                this.innerCom.activityComment.set(data.rule.activityComment);
                this.innerCom.commentEndTime.set(data.rule.commentEndTime);
            }
            else {
                this.innerCom.signIn.set([]);
                this.innerCom.signBack.set({});
            }
            var states = ['草稿', '新增', '不通过'];
            if (states.indexOf(ReportActivityPage_1.ReportActivityPage.state) >= 0) {
                this.disabled = false;
            }
            else {
                this.disabled = true;
            }
        };
        RuleSetting.prototype.get = function () {
            // 活动时间
            var activityTime = this.innerCom.activityTime.get();
            if (!!!activityTime) {
                return false;
            }
            // 报名时间
            var applicationTime = this.innerCom.applicationTime.get();
            if (!!!applicationTime) {
                return false;
            }
            // 签退
            var signBack = this.innerCom.signBack.get();
            if (!!!signBack) {
                return false;
            }
            // 签到
            var signIn = this.innerCom.signIn.get();
            if (!!!signIn) {
                return false;
            }
            // 角色
            var roles = this.innerCom.roles.get();
            if (!!!roles) {
                return false;
            }
            // 活动补签
            var activityRetroactive = this.innerCom.activityRetroactive.get();
            if (!!!activityRetroactive) {
                return false;
            }
            if (activityRetroactive.radio === 1) {
                if (activityRetroactive.startTime < activityTime[1]) {
                    Modal_1.Modal.alert('活动补签时间应在活动结束后！');
                    return false;
                }
            }
            // 活动取消
            var activityCancel = this.innerCom.activityCancel.get();
            if (!!!activityCancel) {
                return false;
            }
            if (activityCancel.radio === 1) {
                if (activityCancel.endTime > activityTime[0]) {
                    Modal_1.Modal.alert('活动取消时间应在活动开始前！');
                    return false;
                }
            }
            // 活动名单
            var nameList = this.innerCom.activitiesList.get();
            // 角色取消
            var roleCancel = this.innerCom.roleCancel.get();
            if (!!!roleCancel) {
                return false;
            }
            if (roleCancel.radio === 1) {
                if (roleCancel.endTime > activityTime[0]) {
                    Modal_1.Modal.alert('角色取消时间应在活动开始前！');
                    return false;
                }
            }
            var len = signIn.length - 1;
            for (var i = len; i >= 0; i--) {
                var signItem = signIn[i];
                for (var j = i - 1; j >= 0; j--) {
                    var compareItem = signIn[j];
                    if (signItem.signStartTime < compareItem.signStartTime && signItem.signEndTime > compareItem.signStartTime) {
                        Modal_1.Modal.alert('签到时间不能重叠!');
                        return false;
                    }
                    if (signItem.signStartTime < compareItem.signEndTime && signItem.signEndTime > compareItem.signEndTime) {
                        Modal_1.Modal.alert('签到时间不能重叠!');
                        return false;
                    }
                }
            }
            // 活动评论
            var activityComment = this.innerCom.activityComment.get();
            // 活动评论截止时间
            var commentEndTime = this.innerCom.commentEndTime.get();
            if (commentEndTime === false) {
                return false;
            }
            // 报名时间应该在开课时间之前
            if (applicationTime[1] > activityTime[0]) {
                Modal_1.Modal.alert('报名时间应在开课时间前!');
                return false;
            }
            // 签到时间应在报名时间之后
            for (var i = 0; i < signIn.length; i++) {
                var sign = signIn[i];
                if (sign.signStartTime < applicationTime[1]) {
                    Modal_1.Modal.alert('签到时间应在报名时间后!');
                    return false;
                }
            }
            if (commentEndTime < activityTime[1]) {
                Modal_1.Modal.alert('评论截止时间应在活动结束时间后!');
                return false;
            }
            ReportActivityPage_1.ReportActivityPage.reportData.activityBeginTime = activityTime[0];
            ReportActivityPage_1.ReportActivityPage.reportData.activityEndTime = activityTime[1];
            ReportActivityPage_1.ReportActivityPage.reportData.applicationBeginTime = applicationTime[0];
            ReportActivityPage_1.ReportActivityPage.reportData.applicationEndTime = applicationTime[1];
            ReportActivityPage_1.ReportActivityPage.reportData.activityRetroactive = activityRetroactive.radio;
            ReportActivityPage_1.ReportActivityPage.reportData.activityRetroBeginTime = activityRetroactive.startTime;
            ReportActivityPage_1.ReportActivityPage.reportData.activityRetroEndTime = activityRetroactive.endTime;
            ReportActivityPage_1.ReportActivityPage.reportData.activityCancel = activityCancel.radio;
            ReportActivityPage_1.ReportActivityPage.reportData.activityCancelBeginTime = activityCancel.startTime;
            ReportActivityPage_1.ReportActivityPage.reportData.activityCancelEndTime = activityCancel.endTime;
            ReportActivityPage_1.ReportActivityPage.reportData.activitiesList = nameList.activitiesList;
            ReportActivityPage_1.ReportActivityPage.reportData.activitieList = nameList.activitieList;
            ReportActivityPage_1.ReportActivityPage.reportData.roleCancel = roleCancel.radio;
            ReportActivityPage_1.ReportActivityPage.reportData.roleCancelBeginTime = roleCancel.startTime;
            ReportActivityPage_1.ReportActivityPage.reportData.roleCancelEndTime = roleCancel.endTime;
            ReportActivityPage_1.ReportActivityPage.reportData.activityComment = activityComment;
            ReportActivityPage_1.ReportActivityPage.reportData.commentEndTime = commentEndTime;
            ReportActivityPage_1.ReportActivityPage.reportData.signContent = signIn;
            ReportActivityPage_1.ReportActivityPage.reportData.controller = roles.contorller.students;
            ReportActivityPage_1.ReportActivityPage.reportData.controllerType = roles.contorller.type;
            ReportActivityPage_1.ReportActivityPage.reportData.organizer = roles.organizer.students;
            ReportActivityPage_1.ReportActivityPage.reportData.organizerType = roles.organizer.type;
            ReportActivityPage_1.ReportActivityPage.reportData.participant = roles.participant.students;
            ReportActivityPage_1.ReportActivityPage.reportData.participantType = roles.participant.type;
            return true;
        };
        Object.defineProperty(RuleSetting.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (disabled) {
                if (tools.isEmpty(disabled)) {
                    return;
                }
                this._disabled = disabled;
                this.innerCom.activitiesList.disabled = disabled;
                this.innerCom.roles.disabled = disabled;
                switch (ReportActivityPage_1.ReportActivityPage.state) {
                    case '已结束':
                        {
                            // 可编辑
                            this.innerCom.activityRetroactive.disabled = false;
                            this.innerCom.signBack.disabled = false;
                            this.innerCom.activityComment.disabled = false;
                            this.innerCom.commentEndTime.disabled = false;
                            // 不可编辑
                            this.innerCom.activityTime.disabled = true;
                            this.innerCom.applicationTime.disabled = true;
                            this.innerCom.signIn.disabled = true;
                            this.innerCom.activityCancel.disabled = true;
                            this.innerCom.roleCancel.disabled = true;
                        }
                        break;
                    case '待开展':
                        {
                            this.innerCom.applicationTime.disabled = true;
                            this.innerCom.activityTime.disabled = false;
                            this.innerCom.activityRetroactive.disabled = false;
                            this.innerCom.signBack.disabled = false;
                            this.innerCom.activityCancel.disabled = false;
                            this.innerCom.roleCancel.disabled = false;
                            this.innerCom.activityComment.disabled = false;
                            this.innerCom.commentEndTime.disabled = false;
                            // 需内部判断
                            this.innerCom.signIn.disabled = true;
                        }
                        break;
                    case '进行中':
                        {
                            this.innerCom.applicationTime.disabled = true;
                            this.innerCom.activityTime.disabled = false;
                            this.innerCom.activityRetroactive.disabled = false;
                            this.innerCom.signBack.disabled = false;
                            this.innerCom.activityCancel.disabled = true;
                            this.innerCom.roleCancel.disabled = true;
                            this.innerCom.activityComment.disabled = false;
                            this.innerCom.commentEndTime.disabled = false;
                            // 需内部判断
                            this.innerCom.signIn.disabled = true;
                        }
                        break;
                    case '报名中':
                        {
                            this.innerCom.applicationTime.disabled = false;
                            this.innerCom.activityTime.disabled = false;
                            this.innerCom.activityRetroactive.disabled = false;
                            this.innerCom.signBack.disabled = false;
                            this.innerCom.activityCancel.disabled = false;
                            this.innerCom.roleCancel.disabled = false;
                            this.innerCom.activityComment.disabled = false;
                            this.innerCom.commentEndTime.disabled = false;
                            // 需内部判断
                            this.innerCom.signIn.disabled = true;
                        }
                        break;
                    default:
                        {
                            this.innerCom.activityTime.disabled = disabled;
                            this.innerCom.applicationTime.disabled = disabled;
                            this.innerCom.signIn.disabled = disabled;
                            this.innerCom.signBack.disabled = disabled;
                            this.innerCom.activityRetroactive.disabled = disabled;
                            this.innerCom.activityCancel.disabled = disabled;
                            this.innerCom.roleCancel.disabled = disabled;
                            this.innerCom.activityComment.disabled = disabled;
                            this.innerCom.commentEndTime.disabled = disabled;
                        }
                        break;
                }
            },
            enumerable: true,
            configurable: true
        });
        return RuleSetting;
    }(Component));
    exports.RuleSetting = RuleSetting;
});

/// <amd-module name="ActivityDetailModule"/>
define("ActivityDetailModule", ["require", "exports", "DetailItem", "IsSignBack", "SignInDetail", "Button", "LeRule", "ChargeDetail", "Modal", "Utils", "LeBasicPage"], function (require, exports, DetailItem_1, IsSignBack_1, SignInDetail_1, Button_1, LeRule_1, ChargeDetail_1, Modal_1, utils_1, LeBasicPage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var tools = G.tools;
    var ActivityDetailModule = /** @class */ (function (_super) {
        __extends(ActivityDetailModule, _super);
        function ActivityDetailModule(para) {
            return _super.call(this, para) || this;
        }
        ActivityDetailModule.prototype.wrapperInit = function (para) {
            var signIn = null, signBack = null;
            return h("div", { className: "activity-detail-page" },
                h("div", { className: "detail-row" },
                    h("div", { className: "cover-img" },
                        h("img", { "c-var": "cover", src: "" }),
                        h("div", { className: "status", "c-var": 'state' }))),
                h("div", { className: "detail-row" },
                    h(DetailItem_1.DetailItem, { title: "\u6D3B\u52A8\u540D\u79F0", "c-var": "activityName" }),
                    h(DetailItem_1.DetailItem, { title: "\u6D3B\u52A8\u53E3\u53F7", "c-var": "slogan" })),
                h("div", { className: "detail-row" },
                    h(DetailItem_1.DetailItem, { title: "\u4E3B\u529E\u65B9", "c-var": "sponsor" }),
                    h(DetailItem_1.DetailItem, { title: "\u627F\u529E\u65B9", "c-var": "contractor" })),
                h("div", { className: "detail-row" },
                    h(DetailItem_1.DetailItem, { title: "\u534F\u529E\u65B9", "c-var": "assist" }),
                    h(DetailItem_1.DetailItem, { title: "\u6D3B\u52A8\u7C7B\u522B", "c-var": "activityCategory" })),
                h("div", { className: "detail-row" },
                    h(DetailItem_1.DetailItem, { title: "\u6D3B\u52A8\u7EA7\u522B", "c-var": "activityLevel" }),
                    h(DetailItem_1.DetailItem, { title: "\u6D3B\u52A8\u5F52\u5C5E", "c-var": "activityAttribution" })),
                h("div", { className: "detail-row" },
                    h(DetailItem_1.DetailItem, { title: "\u6D3B\u52A8\u5E73\u53F0", "c-var": "activityPlatform" }),
                    h(DetailItem_1.DetailItem, { title: "\u5E73\u53F0\u7C7B\u522B", "c-var": "platformCategory" })),
                h("div", { className: "detail-row" },
                    h(DetailItem_1.DetailItem, { title: "\u5730\u5740", "c-var": "address" }),
                    h(ChargeDetail_1.ChargeDetail, { title: "\u54A8\u8BE2\u4EBA", "c-var": "charge" })),
                h("div", { className: "detail-row" },
                    h(DetailItem_1.DetailItem, { title: "\u6D3B\u52A8\u65F6\u95F4", isTime: true, "c-var": "activityTime" }),
                    h(DetailItem_1.DetailItem, { title: "\u62A5\u540D\u65F6\u95F4", isTime: true, "c-var": "applicationTime" })),
                h("div", { className: "detail-row isBack" },
                    h(IsSignBack_1.IsSignBack, { title: "\u7B7E\u5230\u7C7B\u578B", itemArr: ['签到', '签退'], changeItems: function (index) {
                            if (index === 0) {
                                signIn.isShow = true;
                                signBack.isShow = false;
                            }
                            else {
                                signIn.isShow = false;
                                signBack.isShow = true;
                            }
                        } })),
                signIn = h(SignInDetail_1.SignInDetail, { "c-var": "signContent", isSignIn: true }),
                signBack = h(SignInDetail_1.SignInDetail, { "c-var": "signBack", className: "hide", isSignIn: false }),
                h("div", { className: "detail-row" },
                    h(DetailItem_1.DetailItem, { title: "\u6D3B\u52A8\u8865\u7B7E", "c-var": "activityRetroactive" }),
                    h(DetailItem_1.DetailItem, { title: "\u6D3B\u52A8\u53D6\u6D88", "c-var": "activityCancel" })),
                h("div", { className: "detail-row" },
                    h(DetailItem_1.DetailItem, { title: "\u4EBA\u5458\u4E0A\u9650", "c-var": "role" }),
                    h(DetailItem_1.DetailItem, { title: "\u89D2\u8272\u53D6\u6D88", "c-var": "roleCancel" })),
                h("div", { className: "detail-row isBack" },
                    h("div", { className: "detail-item", "c-var": "table" })),
                h("div", { className: "detail-row" },
                    h(DetailItem_1.DetailItem, { title: "\u6D3B\u52A8\u8BC4\u4EF7", "c-var": "activityComment" }),
                    h(DetailItem_1.DetailItem, { title: "\u622A\u6B62\u65F6\u95F4", "c-var": "commentEndTime" })),
                h("div", { className: "detail-row" },
                    h(DetailItem_1.DetailItem, { title: "\u9762\u5411\u9662\u7CFB", "c-var": "college" }),
                    h(DetailItem_1.DetailItem, { title: "\u9762\u5411\u4E13\u4E1A", "c-var": "major" })),
                h("div", { className: "detail-row" },
                    h(DetailItem_1.DetailItem, { title: "\u9762\u5411\u73ED\u7EA7", "c-var": "clbum" }),
                    h(DetailItem_1.DetailItem, { title: "\u9762\u5411\u5E74\u7EA7", "c-var": "grade" })),
                h("div", { className: "detail-row" },
                    h(DetailItem_1.DetailItem, { title: "\u5176\u4ED6\u5B66\u9662", "c-var": "otherCollege" }),
                    h(DetailItem_1.DetailItem, { title: "\u5176\u4ED6\u4E13\u4E1A", "c-var": "otherMajor" })),
                h("div", { className: "detail-row" },
                    h(DetailItem_1.DetailItem, { title: "\u5176\u4ED6\u73ED\u7EA7", "c-var": "otherClass" }),
                    h(DetailItem_1.DetailItem, { title: "\u5176\u4ED6\u5E74\u7EA7", "c-var": "otherGrade" })),
                h("div", { className: "detail-row" },
                    h(DetailItem_1.DetailItem, { title: "\u8BFE\u7A0B\u4ECB\u7ECD", "c-var": "courseDescription" }),
                    h(DetailItem_1.DetailItem, { title: "\u63D0\u9192\u5185\u5BB9", "c-var": "remind" })),
                h("div", { className: "detail-row" },
                    h("div", { className: "detail-item" },
                        h("div", { className: "detail-item-wrapper", style: {
                                alignItems: 'center'
                            } },
                            h("div", { className: "detail-label" }, "\u9644\u4EF6\u00A0:"),
                            h(Button_1.Button, { content: "\u70B9\u51FB\u4E0B\u8F7D\u9644\u4EF6", className: "addBtn", "c-var": "btn" }))),
                    h(DetailItem_1.DetailItem, { title: "\u5907\u6CE8", "c-var": "remark" })));
        };
        ActivityDetailModule.prototype.set = function (activityid) {
            var _this = this;
            LeRule_1.LeRule.Ajax.fetch(tools.url.addObj(LE.CONF.ajaxUrl.activityDetail, {
                activityid: activityid
            })).then(function (_a) {
                var response = _a.response;
                var baseInfo = response.data.baseInfo, activity = response.data.baseInfo.activity;
                if (tools.isNotEmpty(activity)) {
                    _this.innerEl.state.innerText = activity.state;
                    _this.innerEl.cover.src = LeRule_1.LeRule.fileUrlGet(activity.coverPicture, 'COVERPICTURE');
                    _this.innerCom.activityName.set(activity.activityName);
                    _this.innerCom.slogan.set(activity.slogan);
                    _this.innerCom.activityCategory.set(activity.activityCategoryName);
                    _this.innerCom.activityLevel.set(activity.activityLevelName);
                    _this.innerCom.activityAttribution.set(activity.activityAttributionName);
                    _this.innerCom.activityPlatform.set(activity.activityPlatformName);
                    _this.innerCom.platformCategory.set(activity.platformCategoryName);
                    _this.innerCom.address.set(activity.address);
                    _this.innerCom.courseDescription.set(activity.courseDescription);
                    _this.innerCom.remind.set(activity.remind);
                    _this.innerCom.remark.set(activity.remark);
                }
                else {
                    _this.innerEl.state.innerText = '无';
                }
                _this.innerCom.sponsor.set(_this.getSponsor(baseInfo.sponsor));
                _this.innerCom.contractor.set(_this.getSponsor(baseInfo.contractor));
                _this.innerCom.assist.set(_this.getSponsor(baseInfo.assist));
                _this.innerCom.charge.set(baseInfo.charge);
                var rule = response.data.ruleSetting.rule, ruleSetting = response.data.ruleSetting;
                _this.innerCom.activityRetroactive.set(_this.getCancelData(rule.activityRetroactive, rule.activityRetroBeginTime, rule.activityRetroEndTime));
                _this.innerCom.activityCancel.set(_this.getCancelData(rule.activityCancel, rule.activityCancelBeginTime, rule.activityCancelEndTime));
                _this.innerCom.roleCancel.set(_this.getCancelData(rule.roleCancel, rule.roleCancelBeginTime, rule.roleCancelEndTime));
                _this.innerCom.activityComment.set(_this.getCommontData(rule.activityComment));
                _this.innerCom.commentEndTime.set(utils_1.Utils.formatTime(rule.commentEndTime));
                _this.innerCom.activityTime.set([rule.activityBeginTime, rule.activityEndTime]);
                _this.innerCom.applicationTime.set([rule.applicationBeginTime, rule.applicationEndTime]);
                _this.innerCom.role.set(_this.getControllerData(ruleSetting.controllerType, ruleSetting.organizerType, ruleSetting.participantType));
                if (tools.isEmpty(ruleSetting.signContent)) {
                    _this.innerCom.signContent.set([]);
                }
                else {
                    _this.innerCom.signContent.set(_this.getSignInContent(ruleSetting.signContent));
                }
                _this.createTable(ruleSetting.tables);
                _this.innerCom.signBack.set(_this.getSignBackContent(rule.signBack, rule.signBackStartTime, rule.signBackEndTime, rule.signType, rule.signCaption, rule.duration));
                // this.getSignBackContent(rule.signBack, rule.signBackStartTime, rule.signBackEndTime, rule.signType, rule.latitude, rule.longitude).then((result) => {
                //     (this.innerCom.signBack as SignInDetail).set(result);
                // });
                var objectSetting = response.data.objectSetting, object = response.data.objectSetting.object;
                _this.innerCom.college.set(_this.getCollegeData(objectSetting.college));
                _this.innerCom.major.set(_this.getCollegeData(objectSetting.major));
                _this.innerCom.clbum.set(_this.getCollegeData(objectSetting.clbum));
                _this.innerCom.grade.set(_this.getCollegeData(objectSetting.grade));
                _this.innerCom.otherCollege.set(_this.getOtherCollegeData(object.otherCollege));
                _this.innerCom.otherMajor.set(_this.getOtherCollegeData(object.otherMajor));
                _this.innerCom.otherClass.set(_this.getOtherCollegeData(object.otherClass));
                _this.innerCom.otherGrade.set(_this.getOtherCollegeData(object.otherGrade));
                _this.innerCom.btn.onClick = function () {
                    if (tools.isEmpty(activity.accessory)) {
                        Modal_1.Modal.alert('无可下载附件!');
                    }
                    else {
                        window.open(LeRule_1.LeRule.fileUrlGet(activity.accessory));
                    }
                };
            });
        };
        ActivityDetailModule.prototype.createTable = function (data) {
            var tableWrapper = this.innerEl.table, tbody = null, table = h("table", null,
                h("thead", null,
                    h("tr", null,
                        h("th", null, "\u5E74\u4EFD"),
                        h("th", null, "\u89D2\u8272"),
                        h("th", null, "\u83B7\u5F97\u79EF\u5206"),
                        h("th", null, "\u672A\u7B7E\u5230\u6263\u5206"))),
                tbody = h("tbody", null));
            data.forEach(function (ye) {
                var tr = h("tr", null);
                ye.forEach(function (con) {
                    tr.appendChild(h("td", null, con));
                });
                tbody.appendChild(tr);
            });
            tableWrapper.appendChild(table);
        };
        ActivityDetailModule.prototype.getControllerData = function (controllerType, organizerType, participantType) {
            var result = '';
            if (tools.isNotEmpty(controllerType)) {
                if (Number(controllerType.maxPlayers) === 0) {
                    result += "<span>\u7BA1\u7406\u8005:\u4E0D\u9650&nbsp;&nbsp;&nbsp;&nbsp;</span>";
                }
                else {
                    result += "<span>\u7BA1\u7406\u8005:" + controllerType.maxPlayers + "\u4EBA&nbsp;&nbsp;&nbsp;&nbsp;</span>";
                }
            }
            if (tools.isNotEmpty(organizerType)) {
                if (Number(organizerType.maxPlayers) === 0) {
                    result += "<span>\u7EC4\u7EC7\u8005:\u4E0D\u9650&nbsp;&nbsp;&nbsp;&nbsp;</span>";
                }
                else {
                    result += "<span>\u7EC4\u7EC7\u8005:" + organizerType.maxPlayers + "\u4EBA&nbsp;&nbsp;&nbsp;&nbsp;</span>";
                }
            }
            if (tools.isNotEmpty(participantType)) {
                if (Number(participantType.maxPlayers) === 0) {
                    result += "<span>\u53C2\u4E0E\u8005:\u4E0D\u9650&nbsp;&nbsp;&nbsp;&nbsp;</span>";
                }
                else {
                    result += "<span>\u53C2\u4E0E\u8005:" + participantType.maxPlayers + "\u4EBA&nbsp;&nbsp;&nbsp;&nbsp;</span>";
                }
            }
            return result;
        };
        ActivityDetailModule.prototype.getSignBackContent = function (signBack, startTime, endTime, type, signCaption, duration) {
            var results = [], types = ['人脸识别', '动态二维码'];
            if (signBack === 1) {
                results.push({
                    time: [startTime, endTime],
                    type: types[type],
                    position: signCaption || '未知',
                    duration: duration
                });
            }
            return results;
        };
        // private getSignBackContent(signBack: number, startTime: number, endTime: number, type: number, lat: string, lng: string): Promise<obj[]> {
        //     return new Promise((resolve, reject) => {
        //         if (signBack === 1) {
        //             let result = [],
        //                 types = ['人脸识别', '动态二维码'];
        //             if(tools.isNotEmpty(lat) && tools.isNotEmpty(lng)){
        //                 BDMap.getSurroundingPois({
        //                     lat: Number(lat),
        //                     lng: Number(lng)
        //                 }).then((res) => {
        //                     let position = '';
        //                     if (tools.isNotEmptyArray(res.surroundingPois)) {
        //                         position = res.surroundingPois[0].title
        //                     } else {
        //                         if (tools.isNotEmpty(res.business)) {
        //                             position = res.business;
        //                         } else {
        //                             position = res.address + res.addressComponents.street + res.addressComponents.streetNumber
        //                         }
        //                     }
        //                     result.push({
        //                         time: [startTime, endTime],
        //                         type: types[type],
        //                         position: position
        //                     });
        //                     resolve(result);
        //                 });
        //             }else{
        //                 result.push({
        //                     time: [startTime, endTime],
        //                     type: types[type],
        //                     position: '未知'
        //                 });
        //                 resolve(result);
        //             }
        //         } else {
        //             resolve([]);
        //         }
        //     })
        // }
        ActivityDetailModule.prototype.getOtherCollegeData = function (c) {
            var arr = ['不限制', '允许报名但不给成绩', '不允许报名'];
            return arr[c];
        };
        ActivityDetailModule.prototype.getCollegeData = function (data) {
            var result = [];
            if (tools.isNotEmptyArray(data)) {
                data.forEach(function (col) {
                    result.push(col.name);
                });
            }
            else {
                result.push('不限');
            }
            return result;
        };
        ActivityDetailModule.prototype.getBooleanData = function (t) {
            return t === 1 ? '是' : '否';
        };
        ActivityDetailModule.prototype.getCommontData = function (t) {
            return t === 1 ? '开放评价' : '强制评价';
        };
        ActivityDetailModule.prototype.getCancelData = function (cancel, startTime, endTime) {
            if (cancel === 0) {
                return {
                    cancel: true,
                    title: '否',
                    startTime: 0,
                    endTime: 0
                };
            }
            else {
                return {
                    cancel: true,
                    title: '是',
                    startTime: startTime,
                    endTime: endTime
                };
            }
        };
        ActivityDetailModule.prototype.getSponsor = function (sponsor) {
            var result = [];
            tools.isNotEmptyArray(sponsor) && sponsor.forEach(function (s) {
                result.push(s.name);
            });
            return result;
        };
        // private getSignInContent(content: SignContentPara[]): Promise<obj[]>
        ActivityDetailModule.prototype.getSignInContent = function (content) {
            var _this = this;
            // let permiseArr = [];
            var resultArr = [];
            var types = ['人脸识别', '动态二维码'];
            content.forEach(function (c, index) {
                var obj = {
                    indexTitle: _this.getChineseNum(index + 1) + '次签到',
                    time: [c.signStartTime, c.signEndTime],
                    type: types[c.signType],
                    position: c.signCaption || '未知',
                    duration: c.duration
                };
                resultArr.push(obj);
                // permiseArr.push(new Promise((resolve, reject) => {
                //     if (tools.isNotEmpty(c.latitude) && tools.isNotEmpty(c.longitude)){
                //         BDMap.getSurroundingPois({
                //             lat: Number(c.latitude),
                //             lng: Number(c.longitude)
                //         }).then((res) => {
                //             let position = '';
                //             if (tools.isNotEmptyArray(res.surroundingPois)) {
                //                 position = res.surroundingPois[0].title
                //             } else {
                //                 if (tools.isNotEmpty(res.business)) {
                //                     position = res.business;
                //                 } else {
                //                     position = res.address + res.addressComponents.street + res.addressComponents.streetNumber
                //                 }
                //             }
                //             let obj = {
                //                 indexTitle: this.getChineseNum(index + 1) + '次签到',
                //                 time: [c.signStartTime, c.signEndTime],
                //                 type: types[c.signType],
                //                 position: position
                //             };
                //             resolve(obj);
                //         });
                //     }else{
                //         let obj = {
                //             indexTitle: this.getChineseNum(index + 1) + '次签到',
                //             time: [c.signStartTime, c.signEndTime],
                //             type: types[c.signType],
                //             position: '不限'
                //         };
                //         resolve(obj);
                //     }
                // }));
            });
            // return Promise.all(permiseArr);
            return resultArr;
        };
        ActivityDetailModule.prototype.getChineseNum = function (num) {
            // 默认是最大是两位数
            var numberArr = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
            if (num.toString().length > 1) {
                var n = parseInt(num.toString().substr(1, 1));
                if (n === 0) {
                    return '十';
                }
                else {
                    return '十' + numberArr[n - 1];
                }
            }
            else {
                return numberArr[num - 1];
            }
        };
        return ActivityDetailModule;
    }(Component));
    exports.ActivityDetailModule = ActivityDetailModule;
    var ActivityDetailPage = /** @class */ (function (_super) {
        __extends(ActivityDetailPage, _super);
        function ActivityDetailPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ActivityDetailPage.prototype.init = function (para, data) {
            if (para && para.ajaxData) {
                var ajaxData = {};
                try {
                    ajaxData = JSON.parse(para.ajaxData);
                }
                catch (e) {
                }
                if (ajaxData.activity_id) {
                    this.activeModule.set(ajaxData.activity_id);
                }
            }
        };
        ActivityDetailPage.prototype.bodyInit = function () {
            return this.activeModule = h(ActivityDetailModule, null);
        };
        return ActivityDetailPage;
    }(LeBasicPage_1.LeBasicPage));
    exports.ActivityDetailPage = ActivityDetailPage;
});

/// <amd-module name="ChargeDetail"/>
define("ChargeDetail", ["require", "exports", "Modal", "FastTable"], function (require, exports, Modal_1, FastTable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var tools = G.tools;
    var d = G.d;
    var ChargeDetail = /** @class */ (function (_super) {
        __extends(ChargeDetail, _super);
        function ChargeDetail(para) {
            var _this = _super.call(this, para) || this;
            _this.initEvents = (function () {
                var moreHandler = function () {
                    var body = h("div", null);
                    new Modal_1.Modal({
                        header: {
                            title: "查看联系人"
                        },
                        body: body,
                        width: '500px',
                        height: '400px'
                    });
                    new FastTable_1.FastTable({
                        cols: [[{
                                    name: 'name',
                                    title: '姓名'
                                }, { name: 'phone', title: '电话' }]],
                        data: _this.chargeData,
                        pseudo: {
                            type: 'number'
                        },
                        container: body
                    });
                };
                return {
                    on: function () { return d.on(_this.wrapper, 'click', 'span.more', moreHandler); },
                    off: function () { return d.off(_this.wrapper, 'click', 'span.more', moreHandler); }
                };
            })();
            _this.initEvents.on();
            return _this;
        }
        ChargeDetail.prototype.wrapperInit = function (para) {
            var detailWrapper = h("div", { className: "detail-item" },
                h("div", { className: "detail-item-wrapper" },
                    h("div", { className: "detail-label" },
                        para.title,
                        "\u00A0:"),
                    h("div", { className: "detail-content", "c-var": "content", title: "" }, "\u65E0")));
            return detailWrapper;
        };
        Object.defineProperty(ChargeDetail.prototype, "chargeData", {
            get: function () {
                return this._chargeData;
            },
            set: function (cd) {
                this._chargeData = cd;
            },
            enumerable: true,
            configurable: true
        });
        ChargeDetail.prototype.set = function (content) {
            var contentWrapper = this.innerEl.content;
            contentWrapper.innerHTML = '';
            if (tools.isNotEmptyArray(content)) {
                var contentHtml = '';
                this.chargeData = content;
                for (var i = 0; i < content.length; i++) {
                    if (i >= 2) {
                        contentHtml += "<span class=\"charge more\">\u66F4\u591A</span>";
                        break;
                    }
                    var charge = content[i];
                    contentHtml += "<span class=\"charge\">" + charge.name + "&nbsp;&nbsp" + charge.phone + "</span>";
                }
                contentWrapper.innerHTML = contentHtml;
            }
            else {
                contentWrapper.innerHTML = '无';
                this.chargeData = [];
            }
        };
        ChargeDetail.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.initEvents.off();
        };
        return ChargeDetail;
    }(Component));
    exports.ChargeDetail = ChargeDetail;
});

/// <amd-module name="DetailItem"/>
define("DetailItem", ["require", "exports", "Utils"], function (require, exports, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var tools = G.tools;
    var DetailItem = /** @class */ (function (_super) {
        __extends(DetailItem, _super);
        function DetailItem(para) {
            return _super.call(this, para) || this;
        }
        DetailItem.prototype.wrapperInit = function (para) {
            var detailWrapper = h("div", { className: "detail-item" },
                h("div", { className: "detail-item-wrapper" },
                    h("div", { className: "detail-label" },
                        para.title,
                        "\u00A0:"),
                    h("div", { className: "detail-content", "c-var": "content", title: "" }, "\u65E0")));
            this.isTime = para.isTime;
            return detailWrapper;
        };
        DetailItem.prototype.set = function (content) {
            var contentWrapper = this.innerEl.content;
            contentWrapper.innerHTML = '';
            if (typeof content === 'string') {
                var str = content;
                if (tools.isEmpty(content)) {
                    str = '无';
                }
                contentWrapper.innerHTML = str;
                contentWrapper.title = str;
            }
            else if (typeof content === 'object' && content.cancel === true) {
                if (content.title === '是') {
                    contentWrapper.innerHTML = content.title + "<span class=\"title-time\"> \u65F6\u95F4:</span> " + utils_1.Utils.formatTime(content.startTime) + " \u81F3 " + utils_1.Utils.formatTime(content.endTime);
                }
                else {
                    contentWrapper.innerHTML = "" + content.title;
                }
            }
            else {
                if (this.isTime === true) {
                    if (tools.isNotEmpty(content)) {
                        contentWrapper.innerText = utils_1.Utils.formatTime(parseInt(content[0])) + ' 至 ' + utils_1.Utils.formatTime(parseInt(content[1]));
                        contentWrapper.title = utils_1.Utils.formatTime(parseInt(content[0])) + ' 至 ' + utils_1.Utils.formatTime(parseInt(content[1]));
                    }
                }
                else {
                    var contentHtml_1 = '';
                    if (tools.isNotEmptyArray(content)) {
                        content.forEach(function (str) {
                            contentHtml_1 += "<span class=\"small-item\">" + str + "</span>";
                        });
                    }
                    else {
                        contentHtml_1 = '无';
                    }
                    contentWrapper.innerHTML = contentHtml_1;
                }
            }
        };
        return DetailItem;
    }(Component));
    exports.DetailItem = DetailItem;
});

/// <amd-module name="SignInDetail"/>
define("SignInDetail", ["require", "exports", "SignModule"], function (require, exports, SignModule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var tools = G.tools;
    var SignInDetail = /** @class */ (function (_super) {
        __extends(SignInDetail, _super);
        function SignInDetail(para) {
            var _this = _super.call(this, para) || this;
            _this.isSignIn = para.isSignIn;
            return _this;
        }
        SignInDetail.prototype.wrapperInit = function (para) {
            var signInDetailWrapper = h("div", { className: "detail-row sign" });
            return signInDetailWrapper;
        };
        SignInDetail.prototype.set = function (content) {
            var _this = this;
            if (tools.isNotEmptyArray(content)) {
                content.forEach(function (c) {
                    new SignModule_1.SignModule({
                        isSignIn: _this.isSignIn,
                        content: c,
                        container: _this.wrapper
                    });
                });
            }
            else {
                new SignModule_1.SignModule({
                    isSignIn: this.isSignIn,
                    content: {},
                    container: this.wrapper
                });
            }
        };
        Object.defineProperty(SignInDetail.prototype, "isShow", {
            get: function () {
                return this._isShow;
            },
            set: function (s) {
                this._isShow = s;
                this.wrapper.classList.toggle('hide', s === false);
            },
            enumerable: true,
            configurable: true
        });
        return SignInDetail;
    }(Component));
    exports.SignInDetail = SignInDetail;
});

/// <amd-module name="SignModule"/>
define("SignModule", ["require", "exports", "Utils"], function (require, exports, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var tools = G.tools;
    var SignModule = /** @class */ (function (_super) {
        __extends(SignModule, _super);
        function SignModule(para) {
            return _super.call(this, para) || this;
        }
        SignModule.prototype.wrapperInit = function (para) {
            var titlePre = para.isSignIn === true ? '签到' : '签退';
            var signModuleWrapper = null;
            var typeTitle = '', typeContent = '';
            if (tools.isNotEmpty(para.content.type)) {
                if (para.content.type === '人脸识别') {
                    typeTitle = titlePre + '位置';
                    typeContent = para.content.position || '未知';
                }
                else {
                    typeTitle = '二维码有效时间';
                    typeContent = Number(para.content.duration) === 0 ? '不限' : para.content.duration + 's';
                }
            }
            else {
                typeTitle = titlePre + '位置';
                typeContent = '未知';
            }
            if (para.isSignIn !== true && tools.isEmpty(para.content)) {
                signModuleWrapper =
                    h("div", { className: "detailSignModule detail-item", style: { fontWeight: 'bold', fontSize: '20px' } }, "\u4E0D\u7B7E\u9000");
            }
            else if (para.isSignIn === true && tools.isEmpty(para.content)) {
                signModuleWrapper =
                    h("div", { className: "detailSignModule detail-item", style: { fontWeight: 'bold', fontSize: '20px' } }, "\u4E0D\u7B7E\u5230");
            }
            else {
                var title = para.isSignIn === true ?
                    h("div", { "c-var": "title", className: "detail-sign-title" }, para.content.indexTitle) : '';
                signModuleWrapper = h("div", { className: "detailSignModule detail-item" },
                    h("div", { className: "detail-sign-wrapper" },
                        title,
                        h("div", { className: "detail-sign-content" },
                            h("div", { className: "detail-label" },
                                titlePre + '时间',
                                "\u00A0:"),
                            h("div", { "c-var": "signTime" }, (tools.isNotEmpty(para.content.time[0]) ? utils_1.Utils.formatTime(para.content.time[0]) : '未知') + ' 至 ' + (tools.isNotEmpty(para.content.time[1]) ? utils_1.Utils.formatTime(para.content.time[1]) : '未知'))),
                        h("div", { className: "detail-sign-content typeAndPos" },
                            h("div", { className: "detail-sign-type" },
                                h("div", { className: "detail-label" },
                                    titlePre + '方式',
                                    "\u00A0:"),
                                h("div", { "c-var": "signType" }, tools.isNotEmpty(para.content.type) ? para.content.type : '未知')),
                            h("div", { className: "detail-sign-position" },
                                h("div", { className: "detail-label" },
                                    typeTitle,
                                    "\u00A0:"),
                                h("div", { "c-var": "signPosition" }, typeContent)))));
            }
            return signModuleWrapper;
        };
        return SignModule;
    }(Component));
    exports.SignModule = SignModule;
});

define("ActivityClass", ["require", "exports", "BasicInfoDropDown", "BasicInfoInput", "Sponsor", "BasicInfoTextarea", "Button", "ReportUploadModule", "Charge", "ReportActivityPage", "ActivityType", "Modal"], function (require, exports, BasicInfoDropDown_1, BasicInfoInput_1, Sponsor_1, BasicInfoTextarea_1, Button_1, ReportUploadModule_1, Charge_1, ReportActivityPage_1, ActivityType_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="ActivityClass"/>
    var Component = G.Component;
    var tools = G.tools;
    var ActivityClass = /** @class */ (function (_super) {
        __extends(ActivityClass, _super);
        function ActivityClass(para) {
            var _this = _super.call(this, para) || this;
            _this.isNotShow = tools.isNotEmpty(para.isNotShow) ? para.isNotShow : false;
            return _this;
        }
        ActivityClass.prototype.wrapperInit = function (para) {
            var activityClassWrapper = h("div", { className: "activity-type" },
                h("div", { className: "row many-sub not-focus" },
                    h(BasicInfoDropDown_1.BasicInfoDropDown, { field: "activityLevel", linkUrl: LE.CONF.ajaxUrl.activityLevel, "c-var": "activityLevel", defaultValue: "\u8BF7\u9009\u62E9\u6D3B\u52A8\u7EA7\u522B", dropData: ["请选择活动级别"], title: "\u6D3B\u52A8\u7EA7\u522B", isRequired: true, dropClassName: "many-sub-dropdown" })),
                h("div", { className: "row many-sub not-focus" },
                    h(BasicInfoDropDown_1.BasicInfoDropDown, { field: "activityAttribution", linkUrl: LE.CONF.ajaxUrl.activityAttribution, "c-var": "activityAttribution", defaultValue: "\u8BF7\u9009\u62E9\u6D3B\u52A8\u5F52\u5C5E", dropData: ["请选择活动归属"], title: "\u6D3B\u52A8\u5F52\u5C5E", isRequired: true, dropClassName: "many-sub-dropdown" })),
                h("div", { className: "row many-sub not-focus" },
                    h(ActivityType_1.ActivityType, { "c-var": "activityType" })),
                h("div", { className: "row" },
                    h(BasicInfoInput_1.BasicInfoInput, { "c-var": "activityName", title: "\u6D3B\u52A8\u540D\u79F0", isRequired: true })),
                h(Sponsor_1.Sponsor, { "c-var": "sponsor", isRequired: true, title: "\u4E3B\u529E\u65B9" }),
                h(Sponsor_1.Sponsor, { "c-var": "contractor", isRequired: false, title: "\u627F\u529E\u65B9" }),
                h(Sponsor_1.Sponsor, { "c-var": "assist", isRequired: false, title: "\u534F\u529E\u65B9" }),
                h("div", { className: "row" },
                    h(BasicInfoInput_1.BasicInfoInput, { "c-var": "slogan", title: "\u6D3B\u52A8\u53E3\u53F7", isRequired: false })),
                h("div", { className: "row" },
                    h(BasicInfoInput_1.BasicInfoInput, { "c-var": "address", title: "\u5730\u5740", isRequired: true })),
                h(Charge_1.Charge, { "c-var": "charge" }),
                h("div", { className: "row" },
                    h(BasicInfoTextarea_1.BasicInfoTextarea, { "c-var": "courseDescription", title: "\u8BFE\u7A0B\u4ECB\u7ECD", isRequired: true })),
                h(ReportUploadModule_1.ReportUploadModule, { field: "COVERPICTURE", nameField: "coverPicture", isExcel: false, preTitle: "\u5C01\u9762\u56FE", isShowImg: true, "c-var": "coverPicture", title: "\u5C01\u9762\u56FE\u7247", isRequired: true, content: "\u9009\u62E9\u6587\u4EF6", remark: "\u5907\u6CE8\uFF1A\u8BF7\u914D\u4E00\u5F20\u56FE\u7247\u4F5C\u4E3A\u8BFE\u7A0B\u5C01\u9762\uFF0C\u957F\u5BBD\u6700\u4F73\u6BD4\u4F8B\u4E3A2\uFF1A1", remarkClassName: "remark" }),
                h("div", { className: "row" },
                    h(BasicInfoInput_1.BasicInfoInput, { "c-var": "remind", title: "\u63D0\u9192\u5185\u5BB9", isRequired: false })),
                h(ReportUploadModule_1.ReportUploadModule, { field: "ACCESSORY", nameField: "accessory", isExcel: true, preTitle: "\u9644\u4EF6", isShowImg: false, "c-var": "accessory", title: "\u9644\u4EF6\u4E0A\u4F20", isRequired: false, content: "\u9009\u62E9\u6587\u4EF6", remark: "\u652F\u6301\u683C\u5F0F\u4E3A\uFF1ADOC\u3001PPT\u3001PDF\u3001JPG\u3001PNG\u3001ZIP\u3001RAR" }),
                h("div", { className: "row" },
                    h(BasicInfoInput_1.BasicInfoInput, { "c-var": "remark", title: "\u5907\u6CE8", isRequired: false })),
                h("div", { className: "row btns" },
                    h("div", { className: "lesson-form-group", "data-name": "nextBtn" },
                        h(Button_1.Button, { className: "nextBtn", content: "\u4FDD\u5B58\u5E76\u4E0B\u4E00\u6B65", onClick: function () {
                                para.nextHandler();
                            } }))));
            return activityClassWrapper;
        };
        Object.defineProperty(ActivityClass.prototype, "isNotShow", {
            get: function () {
                return this._isNotShow;
            },
            set: function (show) {
                this._isNotShow = show;
                this.wrapper.classList.toggle('hide', show);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivityClass.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (dis) {
                if (tools.isNotEmpty(dis)) {
                    this._disabled = dis;
                    this.innerCom.activityLevel.disabled = dis;
                    this.innerCom.activityAttribution.disabled = dis;
                    this.innerCom.activityType.disabled = dis;
                    this.innerCom.activityName.disabled = dis;
                    this.innerCom.sponsor.disabled = dis;
                    this.innerCom.contractor.disabled = dis;
                    this.innerCom.assist.disabled = dis;
                    this.innerCom.slogan.disabled = dis;
                    this.innerCom.address.disabled = dis;
                    this.innerCom.charge.disabled = dis;
                    this.innerCom.courseDescription.disabled = dis;
                    this.innerCom.coverPicture.disabled = dis;
                    this.innerCom.remind.disabled = dis;
                    this.innerCom.accessory.disabled = dis;
                    this.innerCom.remark.disabled = dis;
                }
            },
            enumerable: true,
            configurable: true
        });
        ActivityClass.prototype.set = function (data) {
            if (tools.isNotEmpty(data)) {
                this.innerCom.activityLevel.set(data.activity.activityLevel);
                this.innerCom.activityAttribution.set(data.activity.activityAttribution);
                this.innerCom.activityType.set([data.activity.activityPlatform, data.activity.platformCategory, data.activity.activityPlatformName, data.activity.platformCategoryName]);
                this.innerCom.activityName.set(data.activity.activityName);
                this.innerCom.sponsor.set(data.sponsor);
                this.innerCom.contractor.set(data.contractor);
                this.innerCom.assist.set(data.assist);
                this.innerCom.slogan.set(data.activity.slogan);
                this.innerCom.address.set(data.activity.address);
                this.innerCom.charge.set(data.charge);
                this.innerCom.courseDescription.set(data.activity.courseDescription);
                this.innerCom.coverPicture.set(data.activity.coverPicture);
                this.innerCom.remind.set(data.activity.remind);
                this.innerCom.accessory.set(data.activity.accessory);
                this.innerCom.remark.set(data.activity.remark);
            }
            else {
                this.innerCom.activityLevel.set('');
                this.innerCom.activityAttribution.set('');
            }
        };
        ActivityClass.prototype.get = function () {
            // 活动级别
            var activityLevel = this.innerCom.activityLevel.get();
            if (activityLevel === false) {
                return false;
            }
            // 活动归属
            var activityAttribution = this.innerCom.activityAttribution.get();
            if (activityAttribution === false) {
                return false;
            }
            // 活动分类
            var activityType = this.innerCom.activityType.get();
            if (activityType === false) {
                return;
            }
            //活动名称
            var activityName = this.innerCom.activityName.get();
            if (activityName === false) {
                return false;
            }
            //主办方
            var sponsor = this.innerCom.sponsor.get();
            if (sponsor === false) {
                return false;
            }
            //承办方
            var contractor = this.innerCom.contractor.get();
            var assist = this.innerCom.assist.get();
            //活动口号
            var slogan = this.innerCom.slogan.get();
            // 联系人
            var charge = this.innerCom.charge.get();
            // 地址
            var address = this.innerCom.address.get();
            if (address === false) {
                return false;
            }
            // 课程介绍
            var courseDescription = this.innerCom.courseDescription.get();
            if (courseDescription === false) {
                return false;
            }
            // 封面图片
            var coverPicture = this.innerCom.coverPicture.get();
            if (coverPicture === false) {
                Modal_1.Modal.alert('封面图片不能为空!');
                return false;
            }
            // 提醒内容
            var remind = this.innerCom.remind.get();
            // 附件
            var accessory = this.innerCom.accessory.get();
            //备注
            var remark = this.innerCom.remark.get();
            ReportActivityPage_1.ReportActivityPage.reportData.activityLevel = activityLevel;
            ReportActivityPage_1.ReportActivityPage.reportData.activityAttribution = activityAttribution;
            ReportActivityPage_1.ReportActivityPage.reportData.activityPlatform = activityType.activityPlatform;
            ReportActivityPage_1.ReportActivityPage.reportData.platformCategory = activityType.platformCategory;
            ReportActivityPage_1.ReportActivityPage.reportData.activityName = activityName;
            ReportActivityPage_1.ReportActivityPage.reportData.address = address;
            ReportActivityPage_1.ReportActivityPage.reportData.courseDescription = courseDescription;
            ReportActivityPage_1.ReportActivityPage.reportData.remark = remark;
            ReportActivityPage_1.ReportActivityPage.reportData.slogan = slogan;
            ReportActivityPage_1.ReportActivityPage.reportData.remind = remind;
            ReportActivityPage_1.ReportActivityPage.reportData.coverPicture = coverPicture;
            ReportActivityPage_1.ReportActivityPage.reportData.accessory = accessory;
            ReportActivityPage_1.ReportActivityPage.reportData.sponsor = sponsor;
            ReportActivityPage_1.ReportActivityPage.reportData.assist = assist;
            ReportActivityPage_1.ReportActivityPage.reportData.contractor = contractor;
            ReportActivityPage_1.ReportActivityPage.reportData.charge = charge;
            // 课程类独有字段设置为空值
            ReportActivityPage_1.ReportActivityPage.reportData.teacherInfo = {
                teacherPosition: '',
                teacherName: '',
                teacherId: ''
            };
            return true;
        };
        return ActivityClass;
    }(Component));
    exports.ActivityClass = ActivityClass;
});

define("ActivityType", ["require", "exports", "Modal", "LeRule", "Menu"], function (require, exports, Modal_1, LeRule_1, Menu_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="ActivityType"/>
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    var ActivityType = /** @class */ (function (_super) {
        __extends(ActivityType, _super);
        function ActivityType(para) {
            var _this = _super.call(this, para) || this;
            _this.initEvents = (function () {
                var dropHandler = function () {
                    var tree = new Menu_1.Menu({
                        isVirtual: true,
                        isLeaf: false,
                        expand: true,
                        expandIconArr: ['seclesson-youjiantou', 'seclesson-xiala'],
                        expandIconPre: 'sec',
                        ajax: function () {
                            return LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.activityType).then(function (_a) {
                                var response = _a.response;
                                var arr = [];
                                response.data.forEach(function (node) {
                                    arr.push(handlerNode(node));
                                });
                                return arr;
                            });
                        }
                    });
                    function handlerNode(obj) {
                        var nodeObj = {
                            text: '',
                            content: obj,
                            children: []
                        }, content = {}, children = [];
                        nodeObj['text'] = obj['TITLE'];
                        content['ID'] = obj['ID'];
                        if (tools.isNotEmptyArray(obj.CHILDREN)) {
                            obj.CHILDREN.forEach(function (nc) {
                                children.push(handlerNode(nc));
                            });
                        }
                        nodeObj['children'] = children;
                        return nodeObj;
                    }
                    // 弹出模态框
                    var modal = new Modal_1.Modal({
                        header: {
                            title: '请选择活动平台',
                        },
                        width: '500px',
                        height: '600px',
                        body: tree.wrapper,
                        className: 'tree-modal',
                        footer: {},
                        onOk: function () {
                            var selectNodes = tree.getSelectedNodes();
                            if (tools.isNotEmptyArray(selectNodes)) {
                                var node = selectNodes[0];
                                if (node.isLeaf === true) {
                                    _this.platformCategory = node.content.ID;
                                    var parentNode = node.backFind(function (node) { return node.deep == 1; });
                                    _this.activityPlatform = parentNode.content.ID;
                                    var input = _this.innerEl.input, textTitle = _this.innerEl.textTitle;
                                    input.value = node.text;
                                    textTitle.title = parentNode.text + '-' + node.text;
                                    modal.destroy();
                                }
                                else {
                                    Modal_1.Modal.alert('请选择平台类别');
                                }
                            }
                            else {
                                Modal_1.Modal.alert('请选择活动分类');
                            }
                        }
                    });
                };
                return {
                    on: function () { return d.on(_this.wrapper, 'click', '.seclesson-xiala', dropHandler); },
                    off: function () { return d.off(_this.wrapper, 'click', '.seclesson-xiala', dropHandler); }
                };
            })();
            _this.initEvents.on();
            return _this;
        }
        ActivityType.prototype.wrapperInit = function (para) {
            var typeWrapper = h("div", { className: "lesson-form-group" },
                h("div", { className: "lesson-label" },
                    h("span", null, "*"),
                    "\u00A0\u6D3B\u52A8\u5206\u7C7B\u00A0:"),
                h("div", { class: "text-input", "c-var": "textTitle" },
                    h("input", { type: "text", "c-var": "input", disabled: "disabled", value: "\u8BF7\u9009\u62E9\u6D3B\u52A8\u5206\u7C7B", style: {
                            color: '#91a8b0',
                            opacity: 1,
                            width: ' calc(100% - 20px)'
                        } }),
                    h("div", { class: "btn-group" },
                        h("a", { class: "btn btn-sm icon sec seclesson-xiala", "data-index": "0" }))));
            return typeWrapper;
        };
        Object.defineProperty(ActivityType.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (d) {
                if (tools.isEmpty(d)) {
                    return;
                }
                this._disabled = d;
                this.innerEl.textTitle.classList.toggle('disabled', d);
            },
            enumerable: true,
            configurable: true
        });
        ActivityType.prototype.set = function (values) {
            if (tools.isNotEmpty(values)) {
                tools.isNotEmpty(values[3]) && (this.innerEl.input.value = values[3]);
                tools.isNotEmpty(values[2]) && tools.isNotEmpty(values[3]) && (this.innerEl.textTitle.title = values[2] + values[3]);
                this.activityPlatform = values[0];
                this.platformCategory = values[1];
            }
        };
        ActivityType.prototype.get = function () {
            if (tools.isEmpty(this.activityPlatform)) {
                Modal_1.Modal.alert('请选择活动平台!');
                return false;
            }
            if (tools.isEmpty(this.platformCategory)) {
                Modal_1.Modal.alert('请选择平台类别!');
                return false;
            }
            return {
                activityPlatform: this.activityPlatform,
                platformCategory: this.platformCategory
            };
        };
        ActivityType.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.initEvents.off();
        };
        return ActivityType;
    }(Component));
    exports.ActivityType = ActivityType;
});

/// <amd-module name="BasicInfoDropDown"/>
define("BasicInfoDropDown", ["require", "exports", "SelectInput", "Modal", "LeRule", "Utils"], function (require, exports, selectInput_1, Modal_1, LeRule_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var Component = G.Component;
    var BasicInfoDropDown = /** @class */ (function (_super) {
        __extends(BasicInfoDropDown, _super);
        function BasicInfoDropDown(para) {
            var _this = _super.call(this, para) || this;
            _this.isRequired = para.isRequired;
            _this.title = para.title;
            _this.linkUrl = para.linkUrl;
            _this.field = para.field;
            return _this;
        }
        BasicInfoDropDown.prototype.wrapperInit = function (para) {
            var drop = null;
            var basicInfoInputWrapper = h("div", { className: "lesson-form-group" },
                h("div", { className: "lesson-label" },
                    h("span", null, para.isRequired === true ? '*' : ''),
                    "\u00A0",
                    para.title,
                    "\u00A0:"),
                drop = h(selectInput_1.SelectInput, { readonly: true, "c-var": "drop", dropClassName: para.dropClassName, arrowIcon: "seclesson-xiala", arrowIconPre: "sec", data: para.dropData }));
            tools.isNotEmpty(para.defaultValue) && drop.set(para.defaultValue);
            return basicInfoInputWrapper;
        };
        Object.defineProperty(BasicInfoDropDown.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            // 设置是否可以编辑
            set: function (disabled) {
                if (tools.isEmpty(disabled)) {
                    return;
                }
                this._disabled = disabled;
                this.innerCom.drop.disabled = disabled;
            },
            enumerable: true,
            configurable: true
        });
        BasicInfoDropDown.prototype.get = function () {
            var value = this.innerCom.drop.get();
            if ((tools.isEmpty(value) || value.indexOf('请选择') >= 0) && this.isRequired === true) {
                Modal_1.Modal.alert('请选择' + this.title + '!');
                return false;
            }
            return this.dropMetaData[this.dropData.indexOf(value)].toString();
        };
        BasicInfoDropDown.prototype.set = function (value) {
            var _this = this;
            // let sessionDropData = JSON.parse(sessionStorage.getItem(this.field)),
            //     sessionDropMetaData = JSON.parse(sessionStorage.getItem(this.field + 'meta'));
            // if (tools.isNotEmpty(sessionDropData)) {
            //     this.dropData = sessionDropData;
            //     this.dropMetaData = sessionDropMetaData;
            //     (this.innerCom.drop as SelectInput).setPara({data: ['请选择' + this.title].concat(sessionDropData)});
            //     if (tools.isNotEmpty(value)){
            //         (this.innerCom.drop as SelectInput).set(this.dropData[this.dropMetaData.indexOf(value)]);
            //     }
            // } else {
            tools.isNotEmpty(this.linkUrl) && LeRule_1.LeRule.Ajax.fetch(this.linkUrl).then(function (_a) {
                var response = _a.response;
                _this.dropData = utils_1.Utils.getDropDownList(response.data.body.dataList, 1);
                _this.innerCom.drop.setPara({ data: ['请选择' + _this.title].concat(_this.dropData) });
                _this.dropMetaData = utils_1.Utils.getDropDownList(response.data.body.dataList, 0);
                sessionStorage.setItem(_this.field, JSON.stringify(_this.dropData));
                sessionStorage.setItem(_this.field + 'meta', JSON.stringify(_this.dropMetaData));
                if (tools.isNotEmpty(value)) {
                    _this.innerCom.drop.set(_this.dropData[_this.dropMetaData.indexOf(value)]);
                }
            });
            // }
        };
        return BasicInfoDropDown;
    }(Component));
    exports.BasicInfoDropDown = BasicInfoDropDown;
});

/// <amd-module name="BasicInfoInput"/>
define("BasicInfoInput", ["require", "exports", "TextInput", "Modal"], function (require, exports, text_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var Component = G.Component;
    var BasicInfoInput = /** @class */ (function (_super) {
        __extends(BasicInfoInput, _super);
        function BasicInfoInput(para) {
            var _this = _super.call(this, para) || this;
            _this.isRequire = para.isRequired;
            _this.title = para.title;
            return _this;
        }
        BasicInfoInput.prototype.wrapperInit = function (para) {
            var input = null;
            var basicInfoInputWrapper = h("div", { className: "lesson-form-group" },
                h("div", { className: "lesson-label" },
                    h("span", null, para.isRequired === true ? '*' : ''),
                    "\u00A0",
                    (tools.isEmpty(para.title) ? '' : para.title + ' :')),
                input = h(text_1.TextInput, { "c-var": "input" }));
            tools.isNotEmpty(para.defaultValue) && input.set(para.defaultValue);
            if (para.isShowAdd === true) {
                var addIcon = para.isAdd === true ? h("i", { className: "sec seclesson-jiayihang" }) : h("i", { className: "sec seclesson-jianyihang" });
                basicInfoInputWrapper.appendChild(addIcon);
            }
            return basicInfoInputWrapper;
        };
        Object.defineProperty(BasicInfoInput.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (dis) {
                if (tools.isEmpty(dis)) {
                    return;
                }
                this._disabled = dis;
                this.innerCom.input.disabled = dis;
            },
            enumerable: true,
            configurable: true
        });
        BasicInfoInput.prototype.get = function () {
            var value = this.innerCom.input.get();
            if (tools.isEmpty(value) && this.isRequire === true) {
                Modal_1.Modal.alert(this.title + '不能为空!');
                return false;
            }
            return value;
        };
        BasicInfoInput.prototype.set = function (value) {
            this.innerCom.input.set(value);
        };
        return BasicInfoInput;
    }(Component));
    exports.BasicInfoInput = BasicInfoInput;
});

/// <amd-module name="BasicInfoTextarea"/>
define("BasicInfoTextarea", ["require", "exports", "TextInput1", "Modal"], function (require, exports, TextInput_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var Component = G.Component;
    var BasicInfoTextarea = /** @class */ (function (_super) {
        __extends(BasicInfoTextarea, _super);
        function BasicInfoTextarea(para) {
            var _this = _super.call(this, para) || this;
            _this.isRequired = para.isRequired;
            _this.title = para.title;
            return _this;
        }
        BasicInfoTextarea.prototype.wrapperInit = function (para) {
            var basicInfoInputWrapper = h("div", { className: "lesson-form-group textarea-group" },
                h("div", { className: "lesson-label" },
                    h("span", null, para.isRequired === true ? '*' : ''),
                    "\u00A0",
                    (tools.isEmpty(para.title) ? '' : para.title + ' :')),
                h(TextInput_1.TextAreaInput, { "c-var": "textarea" }));
            return basicInfoInputWrapper;
        };
        Object.defineProperty(BasicInfoTextarea.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (disabled) {
                if (tools.isEmpty(disabled)) {
                    return;
                }
                this._disabled = disabled;
                this.innerCom.textarea.disabled = disabled;
            },
            enumerable: true,
            configurable: true
        });
        BasicInfoTextarea.prototype.set = function (value) {
            this.innerCom.textarea.value = value;
        };
        BasicInfoTextarea.prototype.get = function () {
            var value = this.innerCom.textarea.value;
            if (tools.isEmpty(value) && this.isRequired === true) {
                Modal_1.Modal.alert(this.title + '不能为空!');
                return false;
            }
            return value;
        };
        return BasicInfoTextarea;
    }(Component));
    exports.BasicInfoTextarea = BasicInfoTextarea;
});

/// <amd-module name="Charge"/>
define("Charge", ["require", "exports", "ChargeItem"], function (require, exports, ChargeItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var tools = G.tools;
    var d = G.d;
    var Charge = /** @class */ (function (_super) {
        __extends(Charge, _super);
        function Charge(para) {
            var _this = _super.call(this, para) || this;
            _this.initEvents = (function () {
                var addSponsorEvent = function () {
                    _this.newChargeItem();
                };
                var removeSponsorOrOrganizer = function (e) {
                    var lessonFormGroup = d.closest(e.target, '.lesson-form-group'), groups = d.queryAll('.lesson-form-group', _this.wrapper), index = groups.indexOf(lessonFormGroup);
                    d.remove(lessonFormGroup);
                    var inputs = _this.chargeItemArr;
                    inputs.splice(index, 1);
                    _this.chargeItemArr = inputs;
                };
                return {
                    on: function () {
                        d.on(_this.wrapper, 'click', 'i.sec.seclesson-jiayihang', addSponsorEvent);
                        d.on(_this.wrapper, 'click', 'i.sec.seclesson-jianyihang', removeSponsorOrOrganizer);
                    },
                    off: function () {
                        d.off(_this.wrapper, 'click', 'i.sec.seclesson-jiayihang', addSponsorEvent);
                        d.off(_this.wrapper, 'click', 'i.sec.seclesson-jianyihang', removeSponsorOrOrganizer);
                    }
                };
            })();
            _this.chargeItemArr = [_this.innerCom.add];
            _this.initEvents.on();
            return _this;
        }
        Object.defineProperty(Charge.prototype, "chargeItemArr", {
            get: function () {
                return this._chargeItemArr;
            },
            set: function (arr) {
                this._chargeItemArr = arr;
            },
            enumerable: true,
            configurable: true
        });
        Charge.prototype.wrapperInit = function (para) {
            var chargeWrapper = h("div", { className: "row addRow charge" },
                h(ChargeItem_1.ChargeItem, { "c-var": "add", isShowAdd: true, title: "\u54A8\u8BE2\u4EBA", isAdd: true }));
            return chargeWrapper;
        };
        Object.defineProperty(Charge.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            // 设置是否可以编辑
            set: function (disabled) {
                if (tools.isEmpty(disabled)) {
                    return;
                }
                this._disabled = disabled;
                tools.isNotEmptyArray(this.chargeItemArr) && this.chargeItemArr.forEach(function (chargeItem) {
                    chargeItem.disabled = disabled;
                });
            },
            enumerable: true,
            configurable: true
        });
        Charge.prototype.newChargeItem = function (chargeObj) {
            var chargeItem = new ChargeItem_1.ChargeItem({
                container: this.wrapper,
                isShowAdd: true,
                className: 'add-group',
                defaultValue: chargeObj
            }), items = this.chargeItemArr;
            this.chargeItemArr = items.concat(chargeItem);
        };
        Charge.prototype.set = function (data) {
            var _this = this;
            if (tools.isNotEmpty(data)) {
                var firstValue = void 0, otherValue = [];
                if (tools.isNotEmptyArray(data)) {
                    firstValue = data[0];
                    otherValue = data.slice(1);
                }
                this.innerCom.add.set(firstValue);
                otherValue.forEach(function (val) {
                    _this.newChargeItem(val);
                });
            }
        };
        Charge.prototype.get = function () {
            var chargeArr = [];
            this.chargeItemArr.forEach(function (item) {
                if (tools.isNotEmpty(item.get().name) && tools.isNotEmpty(item.get().phone)) {
                    chargeArr.push(item.get());
                }
                else {
                    item.destroy();
                }
            });
            return chargeArr;
        };
        Charge.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.initEvents.off();
        };
        return Charge;
    }(Component));
    exports.Charge = Charge;
});

/// <amd-module name="ChargeItem"/>
define("ChargeItem", ["require", "exports", "BasicInfoInput"], function (require, exports, BasicInfoInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var tools = G.tools;
    var d = G.d;
    var ChargeItem = /** @class */ (function (_super) {
        __extends(ChargeItem, _super);
        function ChargeItem(para) {
            return _super.call(this, para) || this;
        }
        ChargeItem.prototype.wrapperInit = function (para) {
            var name = '', phone = '';
            if (tools.isNotEmpty(para.defaultValue)) {
                name = para.defaultValue.name;
                phone = para.defaultValue.phone;
            }
            var chargeItemWrapper = h("div", { className: "lesson-form-group charge-item" },
                h("div", { className: "lesson-label" }, (tools.isEmpty(para.title) ? '' : para.title + ' :')),
                h("div", { className: "phoneAndName" },
                    h(BasicInfoInput_1.BasicInfoInput, { "c-var": "name", defaultValue: name, title: "\u59D3\u540D" }),
                    h(BasicInfoInput_1.BasicInfoInput, { className: "flex-right", defaultValue: phone, "c-var": "phone", title: "\u8054\u7CFB\u65B9\u5F0F" })));
            if (para.isShowAdd === true) {
                var addIcon = para.isAdd === true ? h("i", { className: "sec seclesson-jiayihang" }) : h("i", { className: "sec seclesson-jianyihang" });
                chargeItemWrapper.appendChild(addIcon);
            }
            return chargeItemWrapper;
        };
        ChargeItem.prototype.get = function () {
            return {
                name: this.innerCom.name.get(),
                phone: this.innerCom.phone.get()
            };
        };
        ChargeItem.prototype.set = function (data) {
            this.innerCom.name.set(data.name);
            this.innerCom.phone.set(data.phone);
        };
        Object.defineProperty(ChargeItem.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (dis) {
                if (tools.isEmpty(dis)) {
                    return;
                }
                this._disabled = dis;
                this.innerCom.name.disabled = dis;
                this.innerCom.phone.disabled = dis;
                d.query('i.sec', this.wrapper).classList.toggle('disabled', dis);
            },
            enumerable: true,
            configurable: true
        });
        return ChargeItem;
    }(Component));
    exports.ChargeItem = ChargeItem;
});

define("CourseClass", ["require", "exports", "BasicInfoDropDown", "BasicInfoInput", "BasicInfoTextarea", "Button", "ReportUploadModule", "ReportActivityPage", "SelectTeacher", "ActivityType", "Charge", "Modal"], function (require, exports, BasicInfoDropDown_1, BasicInfoInput_1, BasicInfoTextarea_1, Button_1, ReportUploadModule_1, ReportActivityPage_1, SelectTeacher_1, ActivityType_1, Charge_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="CourseClass"/>
    var Component = G.Component;
    var tools = G.tools;
    var CourseClass = /** @class */ (function (_super) {
        __extends(CourseClass, _super);
        function CourseClass(para) {
            var _this = _super.call(this, para) || this;
            _this.isNotShow = tools.isNotEmpty(para.isNotShow) ? para.isNotShow : false;
            return _this;
        }
        CourseClass.prototype.wrapperInit = function (para) {
            var activityClassWrapper = h("div", { className: "course-type" },
                h("div", { className: "row many-sub not-focus" },
                    h(BasicInfoDropDown_1.BasicInfoDropDown, { field: "activityLevel", linkUrl: LE.CONF.ajaxUrl.activityLevel, "c-var": "activityLevel", defaultValue: "\u8BF7\u9009\u62E9\u6D3B\u52A8\u7EA7\u522B", dropData: ["请选择活动级别", '1', '2'], title: "\u6D3B\u52A8\u7EA7\u522B", isRequired: true, dropClassName: "many-sub-dropdown" })),
                h("div", { className: "row many-sub not-focus" },
                    h(BasicInfoDropDown_1.BasicInfoDropDown, { field: "activityAttribution", linkUrl: LE.CONF.ajaxUrl.activityAttribution, "c-var": "activityAttribution", defaultValue: "\u8BF7\u9009\u62E9\u6D3B\u52A8\u5F52\u5C5E", dropData: ["请选择活动归属"], title: "\u6D3B\u52A8\u5F52\u5C5E", isRequired: true, dropClassName: "many-sub-dropdown" })),
                h("div", { className: "row many-sub not-focus" },
                    h(ActivityType_1.ActivityType, { "c-var": "activityType" })),
                h("div", { className: "row" },
                    h(BasicInfoInput_1.BasicInfoInput, { "c-var": "activityName", title: "\u8BFE\u7A0B\u540D\u79F0", isRequired: true })),
                h("div", { className: "row" },
                    h(BasicInfoInput_1.BasicInfoInput, { "c-var": "address", title: "\u5730\u5740", isRequired: true })),
                h(Charge_1.Charge, { "c-var": "charge" }),
                h("div", { className: "row" },
                    h(SelectTeacher_1.SelectTeacher, { "c-var": "teacherInfo" })),
                h("div", { className: "row" },
                    h(BasicInfoTextarea_1.BasicInfoTextarea, { "c-var": "courseDescription", title: "\u8BFE\u7A0B\u4ECB\u7ECD", isRequired: true })),
                h(ReportUploadModule_1.ReportUploadModule, { field: "COVERPICTURE", nameField: "coverPicture", isExcel: false, preTitle: "\u5C01\u9762\u56FE\u7247", isShowImg: true, "c-var": "coverPicture", title: "\u5C01\u9762\u56FE\u7247", isRequired: true, content: "\u9009\u62E9\u6587\u4EF6", remark: "\u5907\u6CE8\uFF1A\u8BF7\u914D\u4E00\u5F20\u56FE\u7247\u4F5C\u4E3A\u8BFE\u7A0B\u5C01\u9762\uFF0C\u957F\u5BBD\u6700\u4F73\u6BD4\u4F8B\u4E3A2\uFF1A1", remarkClassName: "remark" }),
                h("div", { className: "row" },
                    h(BasicInfoInput_1.BasicInfoInput, { "c-var": "remind", title: "\u63D0\u9192\u5185\u5BB9", isRequired: false })),
                h(ReportUploadModule_1.ReportUploadModule, { field: "ACCESSORY", nameField: "accessory", isExcel: true, preTitle: "\u9644\u4EF6", "c-var": "accessory", title: "\u9644\u4EF6\u4E0A\u4F20", isRequired: false, content: "\u9009\u62E9\u6587\u4EF6", remark: "\u652F\u6301\u683C\u5F0F\u4E3A\uFF1ADOC\u3001PPT\u3001PDF\u3001JPG\u3001PNG\u3001ZIP\u3001RAR" }),
                h("div", { className: "row" },
                    h(BasicInfoInput_1.BasicInfoInput, { "c-var": "remark", title: "\u5907\u6CE8", isRequired: false })),
                h("div", { className: "row btns" },
                    h("div", { className: "lesson-form-group", "data-name": "nextBtn" },
                        h(Button_1.Button, { className: "nextBtn", content: "\u4FDD\u5B58\u5E76\u4E0B\u4E00\u6B65", onClick: function () {
                                para.nextHandler();
                            } }))));
            return activityClassWrapper;
        };
        Object.defineProperty(CourseClass.prototype, "isNotShow", {
            get: function () {
                return this._isNotShow;
            },
            set: function (show) {
                this._isNotShow = show;
                this.wrapper.classList.toggle('hide', show);
            },
            enumerable: true,
            configurable: true
        });
        CourseClass.prototype.set = function (data) {
            if (tools.isNotEmpty(data)) {
                this.innerCom.activityLevel.set(data.activity.activityLevel);
                this.innerCom.activityAttribution.set(data.activity.activityAttribution);
                this.innerCom.activityType.set([data.activity.activityPlatform, data.activity.platformCategory, data.activity.activityPlatformName, data.activity.platformCategoryName]);
                this.innerCom.activityName.set(data.activity.activityName);
                this.innerCom.address.set(data.activity.address);
                this.innerCom.teacherInfo.set({
                    teacherId: data.activity.teacherId,
                    teacherName: data.activity.teacherName,
                    teacherPosition: data.activity.teacherPosition
                });
                this.innerCom.charge.set(data.charge);
                this.innerCom.courseDescription.set(data.activity.courseDescription);
                this.innerCom.coverPicture.set(data.activity.coverPicture);
                this.innerCom.remind.set(data.activity.remind);
                this.innerCom.accessory.set(data.activity.accessory);
                this.innerCom.remark.set(data.activity.remark);
            }
            else {
                this.innerCom.activityLevel.set('');
                this.innerCom.activityAttribution.set('');
            }
        };
        CourseClass.prototype.get = function () {
            // 活动级别
            var activityLevel = this.innerCom.activityLevel.get();
            if (activityLevel === false) {
                return false;
            }
            // 活动归属
            var activityAttribution = this.innerCom.activityAttribution.get();
            if (activityAttribution === false) {
                return false;
            }
            // 活动分类
            var activityType = this.innerCom.activityType.get();
            if (activityType === false) {
                return false;
            }
            //课程名称
            var activityName = this.innerCom.activityName.get();
            if (activityName === false) {
                return false;
            }
            // 教师
            var teacherInfo = this.innerCom.teacherInfo.get();
            if (teacherInfo === false) {
                return false;
            }
            // 地址
            var address = this.innerCom.address.get();
            if (address === false) {
                return false;
            }
            // 联系人
            var charge = this.innerCom.charge.get();
            // 课程介绍
            var courseDescription = this.innerCom.courseDescription.get();
            if (courseDescription === false) {
                return false;
            }
            // 封面图片
            var coverPicture = this.innerCom.coverPicture.get();
            if (coverPicture === false) {
                Modal_1.Modal.alert('封面图片不能为空!');
                return false;
            }
            // 提醒内容
            var remind = this.innerCom.remind.get();
            // 附件
            var accessory = this.innerCom.accessory.get();
            //备注
            var remark = this.innerCom.remark.get();
            ReportActivityPage_1.ReportActivityPage.reportData.activityLevel = activityLevel;
            ReportActivityPage_1.ReportActivityPage.reportData.activityAttribution = activityAttribution;
            ReportActivityPage_1.ReportActivityPage.reportData.activityPlatform = activityType.activityPlatform;
            ReportActivityPage_1.ReportActivityPage.reportData.platformCategory = activityType.platformCategory;
            ReportActivityPage_1.ReportActivityPage.reportData.teacherInfo = teacherInfo;
            ReportActivityPage_1.ReportActivityPage.reportData.activityName = activityName;
            ReportActivityPage_1.ReportActivityPage.reportData.address = address;
            ReportActivityPage_1.ReportActivityPage.reportData.charge = charge;
            ReportActivityPage_1.ReportActivityPage.reportData.coverPicture = coverPicture;
            ReportActivityPage_1.ReportActivityPage.reportData.accessory = accessory;
            ReportActivityPage_1.ReportActivityPage.reportData.courseDescription = courseDescription;
            ReportActivityPage_1.ReportActivityPage.reportData.remark = remark;
            ReportActivityPage_1.ReportActivityPage.reportData.remind = remind;
            // 活动类独有属性设置为空值
            ReportActivityPage_1.ReportActivityPage.reportData.sponsor = [];
            ReportActivityPage_1.ReportActivityPage.reportData.contractor = [];
            ReportActivityPage_1.ReportActivityPage.reportData.assist = [];
            return true;
        };
        Object.defineProperty(CourseClass.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (dis) {
                if (tools.isEmpty(dis)) {
                    return;
                }
                this._disabled = dis;
                this.innerCom.activityLevel.disabled = dis;
                this.innerCom.activityAttribution.disabled = dis;
                this.innerCom.activityType.disabled = dis;
                this.innerCom.activityName.disabled = dis;
                this.innerCom.address.disabled = dis;
                this.innerCom.teacherInfo.disabled = dis;
                this.innerCom.charge.disabled = dis;
                this.innerCom.courseDescription.disabled = dis;
                this.innerCom.coverPicture.disabled = dis;
                this.innerCom.remind.disabled = dis;
                this.innerCom.accessory.disabled = dis;
                this.innerCom.remark.disabled = dis;
            },
            enumerable: true,
            configurable: true
        });
        return CourseClass;
    }(Component));
    exports.CourseClass = CourseClass;
});

/// <amd-module name="ReportUploadModule"/>
define("ReportUploadModule", ["require", "exports", "Modal", "LeUploadModule", "LeRule"], function (require, exports, Modal_1, UploadModule_1, LeRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var tools = G.tools;
    var d = G.d;
    var ReportUploadModule = /** @class */ (function (_super) {
        __extends(ReportUploadModule, _super);
        function ReportUploadModule(para) {
            var _this = _super.call(this, para) || this;
            _this.initEvents = (function () {
                var clickImgHandler = function (e) {
                    var img = e.target, src = img.src;
                    if (tools.isNotEmpty(src)) {
                        var body = h("div", { style: "height: 100%; width: 100%; text-align: center;" });
                        new Modal_1.Modal({
                            header: {
                                title: '查看大图'
                            },
                            width: '800px',
                            height: '600px',
                            body: body,
                            isOnceDestroy: true
                        });
                        d.append(body, h("img", { style: "max-height: 100%; width: auto;", src: src, alt: "" }));
                    }
                };
                return {
                    on: function () {
                        d.on(_this.wrapper, 'click', '.upload img.coverImg', clickImgHandler);
                    },
                    off: function () {
                        d.off(_this.wrapper, 'click', '.upload img.coverImg', clickImgHandler);
                    }
                };
            })();
            _this.isRequired = para.isRequired;
            _this.initEvents.on();
            return _this;
        }
        ReportUploadModule.prototype.wrapperInit = function (para) {
            var _this = this;
            var img = null, placehold = null;
            this.isShowImg = para.isShowImg;
            this.field = para.field;
            var accept = para.isExcel === true ? { extensions: 'ppt,jpg,doc,docx,png,zip,rar,pdf' } : { extensions: 'jpg,png' };
            var uploadWrapper = h("div", { className: "row addRow upload" },
                h("div", { className: "lesson-form-group" },
                    tools.isEmpty(para.title) ? null : h("div", { className: "lesson-label" },
                        h("span", null, para.isRequired === true ? '*' : ''),
                        "\u00A0",
                        para.title + ' :'),
                    h(UploadModule_1.LeUploadModule, { nameField: para.nameField, isAutoUpload: true, isExcel: para.isExcel, accept: accept, isChangeText: false, "c-var": "uploader", successHandler: function (data) {
                            var res = data[0].data, file = data[0].file;
                            if (para.isShowImg === true) {
                                img.classList.remove('hide');
                                placehold.classList.add('hide');
                                img.setAttribute('src', LeRule_1.LeRule.fileUrlGet(res.data[para.field], para.field));
                            }
                            else {
                                _this.innerEl.fileName.classList.remove('hide');
                                _this.innerEl.fileName.innerText = file.name;
                            }
                            _this.fileNameMd5 = res.data[para.field];
                        }, url: LE.CONF.ajaxUrl.fileUpload, text: para.content, className: tools.isNotEmpty(para.buttonClassName) ? para.buttonClassName : "select-file-btn" }),
                    h("div", { "c-var": "fileName", className: "hide", style: {
                            color: '#0099ff',
                            marginRight: '12px'
                        } }),
                    h("div", { className: para.remarkClassName }, para.remark)),
                h("div", { className: 'lesson-form-group ' + (para.isShowImg ? '' : 'hide'), "c-var": "showImg" },
                    h("div", { className: "lesson-label" }),
                    placehold = h("div", { "c-var": "placehold", className: "placeholder-img" }, "\u7B2C\u4E8C\u8BFE\u5802"),
                    img = h("img", { "c-var": "img", className: "coverImg hide", alt: "\u5C01\u9762\u56FE" })));
            return uploadWrapper;
        };
        ReportUploadModule.prototype.set = function (md5Str) {
            if (this.isShowImg === true) {
                var img = this.innerEl.img, placehold = this.innerEl.placehold;
                img.classList.remove('hide');
                placehold.classList.add('hide');
                img.setAttribute('src', LeRule_1.LeRule.fileUrlGet(md5Str, this.field));
            }
            else {
                this.innerEl.fileName.classList.remove('hide');
                this.innerEl.fileName.innerText = tools.isNotEmpty(md5Str) ? '已上传' : '';
            }
            this.fileNameMd5 = tools.isNotEmpty(md5Str) ? md5Str : '';
        };
        ReportUploadModule.prototype.get = function () {
            var md5 = tools.isNotEmpty(this.fileNameMd5) ? this.fileNameMd5 : '';
            if (this.isRequired === true) {
                if (tools.isEmpty(md5)) {
                    return false;
                }
            }
            return md5;
        };
        Object.defineProperty(ReportUploadModule.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (dis) {
                if (tools.isEmpty(dis)) {
                    return;
                }
                this._disabled = dis;
                this.innerCom.uploader.disabled = dis;
                this.innerEl.showImg.classList.toggle('disabled', dis);
            },
            enumerable: true,
            configurable: true
        });
        ReportUploadModule.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.initEvents.off();
        };
        return ReportUploadModule;
    }(Component));
    exports.ReportUploadModule = ReportUploadModule;
});

/// <amd-module name="SelectTeacher"/>
define("SelectTeacher", ["require", "exports", "Button", "Modal", "LeTablePage", "LeRule"], function (require, exports, Button_1, Modal_1, LeTablePage_1, LeRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var tools = G.tools;
    var SelectTeacher = /** @class */ (function (_super) {
        __extends(SelectTeacher, _super);
        function SelectTeacher(para) {
            return _super.call(this, para) || this;
        }
        SelectTeacher.prototype.wrapperInit = function (para) {
            var _this = this;
            var selectWrapper = h("div", { className: "lesson-form-group" },
                h("div", { className: "lesson-label" },
                    h("span", null, "*"),
                    "\u00A0\u5F00\u8BFE\u8001\u5E08\u00A0:"),
                h(Button_1.Button, { content: "\u9009\u62E9\u6559\u5E08", "c-var": "selectTeacher", className: "addBtn", onClick: function () {
                        LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.addTeacher).then(function (_a) {
                            var response = _a.response;
                            var body = h("div", null);
                            var modal = new Modal_1.Modal({
                                header: {
                                    title: "选择教师"
                                },
                                footer: {},
                                isAdaptiveCenter: true,
                                width: '60%',
                                height: '600px',
                                body: body,
                                onOk: function () {
                                    var tableSelects = table.tableModule.main.ftable.selectedRowsData;
                                    if (tools.isNotEmptyArray(tableSelects)) {
                                        if (tableSelects.length >= 2) {
                                            Modal_1.Modal.alert('请最多选择一个教师!');
                                        }
                                        else {
                                            var row = tableSelects[0];
                                            _this.teacherInfo = {
                                                teacherId: row.JOB_NO,
                                                teacherName: row.TEA_NAME,
                                                teacherPosition: row.JOB_TITLE
                                            };
                                            _this.innerEl.teacher.innerText = row.TEA_NAME + " (" + row.JOB_TITLE + ")";
                                            modal.destroy();
                                        }
                                    }
                                    else {
                                        Modal_1.Modal.alert('请选择一个教师!');
                                    }
                                }
                            });
                            var table = new LeTablePage_1.LeTablePage({
                                table: response.data.body.table[0],
                                querier: response.data.body.querier[0],
                                common: response.data.common,
                                basePage: null,
                                container: body,
                                inTab: false
                            });
                        });
                    } }),
                h("div", { "c-var": "teacher", style: {
                        marginLeft: '20px'
                    } }));
            return selectWrapper;
        };
        SelectTeacher.prototype.set = function (info) {
            this.teacherInfo = info;
            if (tools.isNotEmpty(info)) {
                this.innerEl.teacher.innerText = info.teacherName + " (" + info.teacherPosition + ")";
            }
        };
        SelectTeacher.prototype.get = function () {
            if (tools.isEmpty(this.teacherInfo)) {
                Modal_1.Modal.alert('请选择教师!');
                return false;
            }
            return this.teacherInfo;
        };
        Object.defineProperty(SelectTeacher.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (dis) {
                if (tools.isEmpty(dis)) {
                    return;
                }
                this._disabled = dis;
                this.innerCom.selectTeacher.disabled = dis;
            },
            enumerable: true,
            configurable: true
        });
        return SelectTeacher;
    }(Component));
    exports.SelectTeacher = SelectTeacher;
});

define("Sponsor", ["require", "exports", "BasicInfoInput"], function (require, exports, BasicInfoInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="Sponsor"/>
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    var Sponsor = /** @class */ (function (_super) {
        __extends(Sponsor, _super);
        function Sponsor(para) {
            var _this = _super.call(this, para) || this;
            _this.initEvents = (function () {
                var addSponsorEvent = function () {
                    _this.newSponsor();
                };
                var removeSponsorOrOrganizer = function (e) {
                    var lessonFormGroup = d.closest(e.target, '.lesson-form-group'), groups = d.queryAll('.lesson-form-group', _this.wrapper), index = groups.indexOf(lessonFormGroup);
                    d.remove(lessonFormGroup);
                    var inputs = _this.inputArr;
                    inputs.splice(index, 1);
                    _this.inputArr = inputs;
                };
                return {
                    on: function () {
                        d.on(_this.wrapper, 'click', 'i.sec.seclesson-jiayihang', addSponsorEvent);
                        d.on(_this.wrapper, 'click', 'i.sec.seclesson-jianyihang', removeSponsorOrOrganizer);
                    },
                    off: function () {
                        d.off(_this.wrapper, 'click', 'i.sec.seclesson-jiayihang', addSponsorEvent);
                        d.off(_this.wrapper, 'click', 'i.sec.seclesson-jianyihang', removeSponsorOrOrganizer);
                    }
                };
            })();
            _this.initEvents.on();
            _this.inputArr = [_this.innerCom.add];
            _this.isRequired = para.isRequired;
            return _this;
        }
        Object.defineProperty(Sponsor.prototype, "inputArr", {
            get: function () {
                return this._inputArr;
            },
            set: function (arr) {
                this._inputArr = arr;
            },
            enumerable: true,
            configurable: true
        });
        Sponsor.prototype.wrapperInit = function (para) {
            var sponsorWrapper = h("div", { className: "row addRow" },
                h(BasicInfoInput_1.BasicInfoInput, { "c-var": "add", title: para.title, isRequired: para.isRequired, isShowAdd: true, isAdd: true }));
            return sponsorWrapper;
        };
        Object.defineProperty(Sponsor.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            // 设置是否可以编辑
            set: function (disabled) {
                if (tools.isEmpty(disabled)) {
                    return;
                }
                this._disabled = disabled;
                tools.isNotEmptyArray(this.inputArr) && this.inputArr.forEach(function (input) {
                    input.disabled = disabled;
                });
                d.queryAll('i.sec', this.wrapper).forEach(function (i) {
                    i.classList.toggle('disabled', disabled);
                });
            },
            enumerable: true,
            configurable: true
        });
        Sponsor.prototype.set = function (data) {
            var _this = this;
            if (tools.isNotEmpty(data)) {
                var dataArr = data.map(function (sp) {
                    return sp.name;
                });
                var firstValue = '', otherValue = [];
                if (tools.isNotEmptyArray(dataArr)) {
                    firstValue = dataArr[0];
                    otherValue = dataArr.slice(1);
                }
                this.innerCom.add.set(firstValue);
                otherValue.forEach(function (val) {
                    _this.newSponsor(val);
                });
            }
        };
        Sponsor.prototype.get = function () {
            if (this.isRequired === true) {
                var value = this.inputArr[0].get();
                if (value === false) {
                    return false;
                }
            }
            var values = [];
            this.inputArr.forEach(function (input) {
                if (tools.isNotEmpty(input.get())) {
                    values.push({ name: input.get() });
                }
                else {
                    input.destroy();
                }
            });
            return values;
        };
        Sponsor.prototype.newSponsor = function (str) {
            if (str === void 0) { str = ''; }
            var input = new BasicInfoInput_1.BasicInfoInput({
                container: this.wrapper,
                isShowAdd: true,
                className: 'add-group',
                defaultValue: str
            }), inputs = this.inputArr;
            this.inputArr = inputs.concat(input);
        };
        Sponsor.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.initEvents.off();
        };
        return Sponsor;
    }(Component));
    exports.Sponsor = Sponsor;
});

/// <amd-module name="GroupCheckModule"/>
define("GroupCheckModule", ["require", "exports", "CheckBox", "Modal"], function (require, exports, checkBox_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var Component = G.Component;
    var GroupCheckModule = /** @class */ (function (_super) {
        __extends(GroupCheckModule, _super);
        function GroupCheckModule(para) {
            var _this = _super.call(this, para) || this;
            _this.checkArr = [_this.innerCom.first];
            _this.clickHandle = para.clickHandle;
            return _this;
        }
        GroupCheckModule.prototype.wrapperInit = function (para) {
            this.title = para.title.substr(2, 2);
            var groupCheckWrapper = h("div", { className: "checkWrapper" },
                h("div", { className: "check-title" }, para.title),
                h("div", { className: "all-checkbox" },
                    h(checkBox_1.CheckBox, { "c-var": "first", text: "\u4E0D\u9650", value: "0" })));
            return groupCheckWrapper;
        };
        Object.defineProperty(GroupCheckModule.prototype, "checkArr", {
            get: function () {
                return this._checkArr;
            },
            set: function (c) {
                this._checkArr = c;
            },
            enumerable: true,
            configurable: true
        });
        GroupCheckModule.prototype.classGetCheckedValue = function () {
            var checkedArr = [], cArr = this.checkArr.slice(1);
            tools.isNotEmptyArray(cArr) && cArr.forEach(function (check) {
                check.checked && checkedArr.push(check.value);
            });
            return checkedArr;
        };
        // 获取当前选中的check
        GroupCheckModule.prototype.getCheckedValue = function () {
            var checkedArr = [], cArr = this.checkArr.slice(1), firstCheck = this.checkArr[0];
            if (firstCheck.checked === true) {
                tools.isNotEmptyArray(cArr) && cArr.forEach(function (check) {
                    checkedArr.push(check.value);
                });
            }
            else {
                tools.isNotEmptyArray(cArr) && cArr.forEach(function (check) {
                    check.checked && checkedArr.push(check.value);
                });
            }
            return checkedArr;
        };
        GroupCheckModule.prototype.checkedAll = function () {
            var checkArr = this.checkArr.slice(1);
            var a = 0;
            checkArr.forEach(function (check) {
                if (check.checked === false) {
                    a += 1;
                }
            });
            return a === 0 ? true : false;
        };
        // 设置选中的check
        GroupCheckModule.prototype.setCheckedValue = function (values) {
            tools.isNotEmptyArray(this.checkArr) && this.checkArr.forEach(function (check) {
                check.checked = false;
            });
            if (tools.isNotEmptyArray(values)) {
                tools.isNotEmptyArray(this.checkArr) && this.checkArr.forEach(function (check) {
                    for (var i = 0; i < values.length; i++) {
                        var value = values[i];
                        if (check.value === value) {
                            check.checked = true;
                            break;
                        }
                    }
                });
            }
        };
        // 设置选中不限
        GroupCheckModule.prototype.setSelectAll = function () {
            this.checkArr[0].checked = true;
            var checkArr = this.checkArr.slice(1);
            tools.isNotEmptyArray(checkArr) && checkArr.forEach(function (check) {
                check.checked = false;
                check.disabled = true;
            });
        };
        GroupCheckModule.prototype.getIsSelectFirst = function () {
            var firstCheck = this.checkArr[0];
            return firstCheck.checked;
        };
        // 设置所有的checkbox
        GroupCheckModule.prototype.set = function (hdata) {
            var _this = this;
            var wrapper = d.query('.all-checkbox', this.wrapper);
            wrapper.innerHTML = '';
            var arr = [], firstObj = {
                ID: '0',
                NAME: '不限'
            };
            hdata.unshift(firstObj);
            hdata.forEach(function (checkValue, index) {
                var checkbox = new checkBox_1.CheckBox({
                    container: wrapper,
                    text: checkValue.NAME,
                    value: checkValue.ID,
                    onClick: function (isChecked) {
                        if (index === 0) {
                            if (isChecked) {
                                if (checkbox.value === '0') {
                                    _this.checkArr.slice(1).forEach(function (cb) {
                                        cb.checked = false;
                                        cb.disabled = true;
                                    });
                                }
                            }
                            else {
                                if (checkbox.value === '0') {
                                    _this.checkArr.slice(1).forEach(function (cb) {
                                        cb.disabled = false;
                                    });
                                }
                            }
                        }
                        else {
                            if (isChecked) {
                                _this.checkedAll() && _this.setSelectAll();
                            }
                        }
                        tools.isNotEmpty(_this.clickHandle) && _this.clickHandle(checkValue.ID, isChecked);
                    }
                });
                arr.push(checkbox);
            });
            this.checkArr = arr;
        };
        Object.defineProperty(GroupCheckModule.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (disabled) {
                if (tools.isEmpty(disabled)) {
                    return;
                }
                this._disabled = disabled;
                tools.isNotEmptyArray(this.checkArr) && this.checkArr.forEach(function (check) {
                    check.disabled = disabled;
                });
            },
            enumerable: true,
            configurable: true
        });
        GroupCheckModule.prototype.get = function () {
            var checkedArr = [], cArr = this.checkArr.slice(1), firstCheck = this.checkArr[0], isLimit = 0;
            if (firstCheck.checked === true) {
                tools.isNotEmptyArray(cArr) && cArr.forEach(function (check) {
                    checkedArr.push({ name: check.text, id: check.value });
                });
            }
            else {
                isLimit = 1;
                tools.isNotEmptyArray(cArr) && cArr.forEach(function (check) {
                    check.checked && checkedArr.push({ name: check.text, id: check.value });
                });
            }
            if (tools.isEmpty(checkedArr) && this.title === '班级') {
                Modal_1.Modal.alert('无法确定活动对象，请重新选择班级!');
                return false;
            }
            if (isLimit === 1 && this.title !== '班级' && tools.isEmpty(checkedArr)) {
                Modal_1.Modal.alert('请选择' + this.title + '!');
                return false;
            }
            return {
                array: checkedArr,
                limit: isLimit
            };
        };
        return GroupCheckModule;
    }(Component));
    exports.GroupCheckModule = GroupCheckModule;
});

/// <amd-module name="GroupRadioModule"/>
define("GroupRadioModule", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var Component = G.Component;
    var tools = G.tools;
    var GroupRadioModule = /** @class */ (function (_super) {
        __extends(GroupRadioModule, _super);
        function GroupRadioModule(para) {
            return _super.call(this, para) || this;
        }
        GroupRadioModule.prototype.wrapperInit = function (para) {
            this.values = para.value;
            var date = new Date().getTime(), randomStr = this.getRandomStr(), r1 = date + randomStr + 'a' + para.field, r2 = date + randomStr + 'b' + para.field, r3 = date + randomStr + 'c' + para.field, groupRadioModule = h("div", { className: "group-oriented-radio" },
                h("div", { className: "check-title" }, para.title),
                h("div", { className: "radio-group", "c-var": "group" },
                    h("div", { className: "radio-wrapper" },
                        h("input", { type: "radio", className: "radio-normal other-radio", value: para.value[0], checked: true, name: para.field, id: r1 }),
                        h("label", { htmlFor: r1 }, para.value[0])),
                    h("div", { className: "radio-wrapper" },
                        h("input", { type: "radio", className: "radio-normal other-radio", value: para.value[1], name: para.field, id: r2 }),
                        h("label", { htmlFor: r2 }, para.value[1])),
                    h("div", { className: "radio-wrapper" },
                        h("input", { type: "radio", className: "radio-normal other-radio", value: para.value[2], name: para.field, id: r3 }),
                        h("label", { htmlFor: r3 }, para.value[2]))));
            return groupRadioModule;
        };
        GroupRadioModule.prototype.getRandomStr = function () {
            var str = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
            var pwd = '';
            for (var i = 0; i < 5; i++) {
                pwd += str.charAt(Math.floor(Math.random() * str.length));
            }
            return pwd;
        };
        GroupRadioModule.prototype.set = function (num) {
            if (tools.isNotEmpty(num) && Number(num) < 3) {
                d.queryAll('.other-radio', this.wrapper)[Number(num)].checked = true;
            }
            else {
                d.queryAll('.other-radio', this.wrapper)[0].checked = true;
            }
        };
        GroupRadioModule.prototype.get = function () {
            return this.values.indexOf(d.query('input.other-radio:checked', this.wrapper).value);
        };
        Object.defineProperty(GroupRadioModule.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (dis) {
                this._disabled = dis;
                this.innerEl.group.classList.toggle('disabled', dis);
            },
            enumerable: true,
            configurable: true
        });
        return GroupRadioModule;
    }(Component));
    exports.GroupRadioModule = GroupRadioModule;
});

/// <amd-module name="ActivityRadioModule"/>
define("ActivityRadioModule", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    var ActivityRadioModule = /** @class */ (function (_super) {
        __extends(ActivityRadioModule, _super);
        function ActivityRadioModule(para) {
            return _super.call(this, para) || this;
        }
        ActivityRadioModule.prototype.wrapperInit = function (para) {
            this.values = para.value;
            var date = new Date().getTime(), randomStr = this.getRandomStr(), r1 = date + randomStr + 'no', r2 = date + randomStr + 'yes', name = para.field + randomStr, activityRadioWrapper = h("div", { className: "lesson-form-group" },
                h("div", { className: "lesson-label" },
                    h("span", null, para.isRequired === true ? '*' : ''),
                    "\u00A0",
                    para.title,
                    "\u00A0:"),
                h("div", { className: "radio-group", "c-var": 'radioGroup' },
                    h("div", { className: "radio-wrapper" },
                        h("input", { type: "radio", className: "radio-normal", value: para.value[0], checked: true, name: name, id: r1 }),
                        h("label", { htmlFor: r1 }, para.value[0])),
                    h("div", { className: "radio-wrapper" },
                        h("input", { type: "radio", className: "radio-normal", value: para.value[1], name: name, id: r2 }),
                        h("label", { htmlFor: r2 }, para.value[1]))));
            return activityRadioWrapper;
        };
        ActivityRadioModule.prototype.onChange = function (handle) {
            d.on(this.wrapper, 'change', 'input[type=radio]', handle);
        };
        ActivityRadioModule.prototype.getRandomStr = function () {
            var str = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
            var pwd = '';
            for (var i = 0; i < 5; i++) {
                pwd += str.charAt(Math.floor(Math.random() * str.length));
            }
            return pwd;
        };
        ActivityRadioModule.prototype.get = function () {
            var index = this.values.indexOf(d.query('input:checked', this.wrapper).value);
            ;
            return index;
        };
        ActivityRadioModule.prototype.set = function (num) {
            if (tools.isNotEmpty(num) && Number(num) < 2) {
                d.queryAll('input.radio-normal', this.wrapper)[Number(num)].checked = true;
            }
            else {
                d.queryAll('input.radio-normal', this.wrapper)[0].checked = true;
            }
        };
        Object.defineProperty(ActivityRadioModule.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (dis) {
                if (tools.isEmpty(dis)) {
                    return;
                }
                this._disabled = dis;
                this.innerEl.radioGroup.classList.toggle('disabled', dis);
            },
            enumerable: true,
            configurable: true
        });
        return ActivityRadioModule;
    }(Component));
    exports.ActivityRadioModule = ActivityRadioModule;
});

/// <amd-module name="CancelTimeModule"/>
define("CancelTimeModule", ["require", "exports", "TimeModule"], function (require, exports, TimeModule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var Component = G.Component;
    var tools = G.tools;
    var CancelTimeModule = /** @class */ (function (_super) {
        __extends(CancelTimeModule, _super);
        function CancelTimeModule(para) {
            var _this = _super.call(this, para) || this;
            _this.initEvents = (function () {
                var checkedEvent = function (e) {
                    var target = e.target, showOrHide = d.query('.showOrHide', _this.wrapper);
                    if (target.value === '是') {
                        showOrHide.classList.remove('hide');
                    }
                    else {
                        showOrHide.classList.add('hide');
                    }
                };
                var downloadHandler = function () {
                    // 下载名单模板
                    window.open(LE.CONF.ajaxUrl.downloadTem);
                };
                return {
                    on: function () {
                        d.on(_this.wrapper, 'change', 'input[type="radio"]', checkedEvent);
                        d.on(_this.wrapper, 'click', '.download', downloadHandler);
                    },
                    off: function () {
                        d.off(_this.wrapper, 'change', 'input[type="radio"]', checkedEvent);
                        d.off(_this.wrapper, 'click', '.download', downloadHandler);
                    }
                };
            })();
            _this.initEvents.on();
            return _this;
        }
        CancelTimeModule.prototype.wrapperInit = function (para) {
            this.values = para.value;
            var date = new Date().getTime(), randomStr = this.getRandomStr(), field = tools.isNotEmpty(para.field) ? para.field : '', r1 = date + randomStr + field + 'no', r2 = date + randomStr + field + 'yes', activityRadioWrapper = h("div", { className: "row" },
                h("div", { className: "lesson-form-group", style: "height:46px" },
                    h("div", { className: "lesson-label" },
                        para.title,
                        "\u00A0:"),
                    h("div", { className: "radio-group", "c-var": "group" },
                        h("div", { className: "radio-wrapper" },
                            h("input", { type: "radio", className: "import-list radio-normal", value: para.value[0], checked: true, name: para.field, id: r1 }),
                            h("label", { htmlFor: r1 }, para.value[0])),
                        h("div", { className: "radio-wrapper" },
                            h("input", { type: "radio", className: "import-list radio-normal", value: para.value[1], name: para.field, id: r2 }),
                            h("label", { htmlFor: r2 }, para.value[1]))),
                    h("div", { className: "showOrHide hide", "c-var": "showTime", style: { paddingLeft: "12px" } },
                        h(TimeModule_1.TimeModule, { "c-var": "time", title: para.timeTile, preAlert: para.timeTile }))));
            return activityRadioWrapper;
        };
        CancelTimeModule.prototype.getRandomStr = function () {
            var str = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
            var pwd = '';
            for (var i = 0; i < 5; i++) {
                pwd += str.charAt(Math.floor(Math.random() * str.length));
            }
            return pwd;
        };
        CancelTimeModule.prototype.set = function (data) {
            if (tools.isNotEmpty(data)) {
                var radiosArr = d.queryAll('input.import-list', this.wrapper).map(function (input) {
                    return input;
                });
                radiosArr[data.index].checked = true;
                if (data.index === 1) {
                    this.innerEl.showTime.classList.remove('hide');
                    this.innerCom.time.set([data.startTime, data.endTime]);
                }
            }
        };
        CancelTimeModule.prototype.get = function () {
            var index = this.values.indexOf(d.query('input.import-list:checked', this.wrapper).value);
            var obj = {
                radio: index,
                startTime: 0,
                endTime: 0
            };
            if (index === 1) {
                var timeValue = this.innerCom.time.get();
                if (timeValue === false) {
                    return false;
                }
                obj.startTime = timeValue[0];
                obj.endTime = timeValue[1];
            }
            return obj;
        };
        Object.defineProperty(CancelTimeModule.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (disabled) {
                if (tools.isEmpty(disabled)) {
                    return;
                }
                this._disabled = disabled;
                this.innerEl.group.classList.toggle('disabled', disabled);
                this.innerCom.time.disabled = disabled;
            },
            enumerable: true,
            configurable: true
        });
        CancelTimeModule.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.initEvents.off();
        };
        return CancelTimeModule;
    }(Component));
    exports.CancelTimeModule = CancelTimeModule;
});

/// <amd-module name="DeadlineModule"/>
define("DeadlineModule", ["require", "exports", "Datetime", "Modal", "Utils"], function (require, exports, datetime_1, Modal_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var tools = G.tools;
    var DeadlineModule = /** @class */ (function (_super) {
        __extends(DeadlineModule, _super);
        function DeadlineModule(para) {
            return _super.call(this, para) || this;
        }
        DeadlineModule.prototype.wrapperInit = function (para) {
            var deadlineWrapper = h("div", { className: "row time" },
                h("div", { className: "lesson-form-group" },
                    h("div", { className: "lesson-label" }),
                    h("div", { style: "margin-right:25px;" }, "\u8BC4\u4EF7\u622A\u6B62\u65F6\u95F4"),
                    h(datetime_1.Datetime, { format: "Y-M-d H:m", "c-var": "time", isClean: true, cleanIcon: "sec seclesson-guanbi" })));
            return deadlineWrapper;
        };
        Object.defineProperty(DeadlineModule.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (d) {
                this._disabled = d;
                this.innerCom.time.disabled = d;
            },
            enumerable: true,
            configurable: true
        });
        DeadlineModule.prototype.set = function (time) {
            this.innerCom.time.set(utils_1.Utils.formatTime(time));
        };
        DeadlineModule.prototype.get = function () {
            var st = this.innerCom.time.get(), stTime = 0;
            if (tools.isNotEmpty(st)) {
                stTime = new Date(st).getTime();
            }
            else {
                Modal_1.Modal.alert('评论截止时间不能为空!');
                return false;
            }
            return stTime / 1000;
        };
        return DeadlineModule;
    }(Component));
    exports.DeadlineModule = DeadlineModule;
});

/// <amd-module name="ImportNameList"/>
define("ImportNameList", ["require", "exports", "LeUploadModule", "FastTable", "Modal", "Button"], function (require, exports, UploadModule_1, FastTable_1, Modal_1, Button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var Component = G.Component;
    var tools = G.tools;
    var ImportNameList = /** @class */ (function (_super) {
        __extends(ImportNameList, _super);
        function ImportNameList(para) {
            var _this = _super.call(this, para) || this;
            _this.initEvents = (function () {
                var checkedEvent = function (e) {
                    var target = e.target, showOrHide = d.query('.showOrHide', _this.wrapper);
                    if (target.value === '是') {
                        showOrHide.classList.remove('hide');
                    }
                    else {
                        showOrHide.classList.add('hide');
                    }
                };
                var downloadHandler = function () {
                    var body = h("div", null,
                        h("div", { className: "modal-row-btn", style: {
                                display: "flex",
                                marginBottom: '20px'
                            } },
                            h(Button_1.Button, { content: "\u5220\u9664\u5B66\u751F", className: "addBtn", onClick: function () {
                                    var selectRows = table.selectedRows;
                                    if (tools.isNotEmptyArray(selectRows)) {
                                        var indexes_1 = [];
                                        selectRows.forEach(function (row) {
                                            _this.deleteStudent(row.data);
                                            indexes_1.push(row.index);
                                        });
                                        table.rowDel(indexes_1);
                                        table.pseudoTable._clearCellSelected();
                                        _this.setStudentNum();
                                    }
                                    else {
                                        Modal_1.Modal.alert('请先选择需要删除的学生！');
                                    }
                                } })));
                    new Modal_1.Modal({
                        header: {
                            title: "查看学生"
                        },
                        isAdaptiveCenter: true,
                        width: '60%',
                        height: '500px',
                        body: body,
                        className: 'table-modal'
                    });
                    var data = [];
                    tools.isNotEmptyArray(_this.students) && _this.students.forEach(function (stu) {
                        var obj = {
                            SCHOOL_NAME: stu.userschool,
                            STU_NO: stu.userid,
                            STU_NAME: stu.username
                        };
                        data.push(obj);
                    });
                    var table = new FastTable_1.FastTable({
                        container: body,
                        cols: [[
                                {
                                    name: 'STU_NO',
                                    title: '学号'
                                },
                                {
                                    name: 'STU_NAME',
                                    title: '学生姓名'
                                },
                                {
                                    name: 'SCHOOL_NAME',
                                    title: '所在学校'
                                }
                            ]],
                        pseudo: {
                            type: 'checkbox'
                        },
                        data: data
                    });
                };
                return {
                    on: function () {
                        d.on(_this.wrapper, 'change', 'input[type="radio"]', checkedEvent);
                        d.on(_this.wrapper, 'click', '.download', downloadHandler);
                    },
                    off: function () {
                        d.off(_this.wrapper, 'change', 'input[type="radio"]', checkedEvent);
                        d.off(_this.wrapper, 'click', '.download', downloadHandler);
                    }
                };
            })();
            _this.initEvents.on();
            return _this;
        }
        Object.defineProperty(ImportNameList.prototype, "students", {
            get: function () {
                return this._students;
            },
            set: function (s) {
                this._students = s;
            },
            enumerable: true,
            configurable: true
        });
        ImportNameList.prototype.wrapperInit = function (para) {
            var _this = this;
            this.field = para.field;
            this.values = para.value;
            var date = new Date().getTime(), randomStr = this.getRandomStr(), r1 = date + randomStr + 'no', r2 = date + randomStr + 'yes', activityRadioWrapper = h("div", { className: "row" },
                h("div", { className: "lesson-form-group", style: "height:46px" },
                    h("div", { className: "lesson-label" },
                        para.title,
                        "\u00A0:"),
                    h("div", { className: "radio-group", "c-var": "group" },
                        h("div", { className: "radio-wrapper" },
                            h("input", { type: "radio", className: "import-list radio-normal", value: para.value[0], checked: true, name: para.field, id: r1 }),
                            h("label", { htmlFor: r1 }, para.value[0])),
                        h("div", { className: "radio-wrapper" },
                            h("input", { type: "radio", className: "import-list radio-normal", value: para.value[1], name: para.field, id: r2 }),
                            h("label", { htmlFor: r2 }, para.value[1]))),
                    h("div", { className: "showOrHide hide", style: { paddingLeft: "12px" }, "c-var": "hide" },
                        h(UploadModule_1.LeUploadModule, { nameField: "activitiesList", isAutoUpload: true, accept: { extensions: 'xlsx' }, isChangeText: false, successHandler: function (data) {
                                data.forEach(function (item) {
                                    // 上传成功
                                    var arr = [], res = item.data;
                                    res.data.forEach(function (stu) {
                                        var student = {
                                            userid: stu.STU_NO,
                                            username: stu.STU_NAME,
                                            userschool: stu.SCHOOL_NAME
                                        };
                                        arr.push(student);
                                    });
                                    _this.students = arr;
                                });
                                _this.setStudentNum();
                            }, "c-var": "uploader", url: LE.CONF.ajaxUrl.getExcelData, text: "\u9009\u62E9\u6587\u4EF6", className: 'select-file-btn' }),
                        h("span", null, "(\u6CE8:\u683C\u5F0F\u4E3Axls)"),
                        h("span", { className: "download" },
                            "\u5DF2\u4E0A\u4F20",
                            h("span", { "c-var": 'number' }, "0\u540D"),
                            "\u5B66\u751F"))));
            return activityRadioWrapper;
        };
        ImportNameList.prototype.deleteStudent = function (row) {
            var students = this.students;
            for (var i = 0; i < students.length; i++) {
                var stu = students[i];
                if (stu.userid === row.STU_NO) {
                    students.splice(i, 1);
                    this.students = students;
                    return;
                }
            }
        };
        ImportNameList.prototype.setStudentNum = function () {
            var index = tools.isNotEmptyArray(this.students) ? this.students.length : 0;
            this.innerEl.number.innerText = index + '名';
        };
        ImportNameList.prototype.getRandomStr = function () {
            var str = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
            var pwd = '';
            for (var i = 0; i < 5; i++) {
                pwd += str.charAt(Math.floor(Math.random() * str.length));
            }
            return pwd;
        };
        ImportNameList.prototype.set = function (num, students) {
            d.query('input', d.queryAll('.radio-wrapper', this.wrapper)[num]).checked = true;
            if (num === 1) {
                d.query('.showOrHide', this.wrapper).classList.remove('hide');
                this.students = students;
            }
            this.setStudentNum();
        };
        ImportNameList.prototype.get = function () {
            var index = this.values.indexOf(d.query('input.import-list:checked', this.wrapper).value);
            var students = tools.isNotEmptyArray(this.students) ? this.students : [];
            return {
                activitiesList: index,
                activitieList: students
            };
        };
        Object.defineProperty(ImportNameList.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (disabled) {
                if (tools.isEmpty(disabled)) {
                    return;
                }
                this._disabled = disabled;
                this.innerCom.uploader.disabled = disabled;
                this.innerEl.group.classList.toggle('disabled', disabled);
                this.innerEl.hide.classList.toggle('disabled', disabled);
            },
            enumerable: true,
            configurable: true
        });
        ImportNameList.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.initEvents.off();
        };
        return ImportNameList;
    }(Component));
    exports.ImportNameList = ImportNameList;
});

/// <amd-module name="IsSignBack"/>
define("IsSignBack", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var Component = G.Component;
    var IsSignBack = /** @class */ (function (_super) {
        __extends(IsSignBack, _super);
        function IsSignBack(para) {
            var _this = _super.call(this, para) || this;
            _this.initEvent = (function () {
                var signInTypeEvent = function (e) {
                    var signItem = d.closest(e.target, '.sign-item'), allSignItem = d.queryAll('.sign-item', _this.wrapper);
                    allSignItem.forEach(function (item) {
                        item.classList.toggle('active', item === signItem);
                    });
                    _this.changeHandle(allSignItem.indexOf(signItem));
                };
                return {
                    on: function () {
                        d.on(_this.wrapper, 'click', '.sign-item', signInTypeEvent);
                    },
                    off: function () {
                        d.off(_this.wrapper, 'click', '.sign-item', signInTypeEvent);
                    }
                };
            })();
            _this.changeHandle = para.changeItems;
            _this.initEvent.on();
            return _this;
        }
        IsSignBack.prototype.wrapperInit = function (para) {
            var title = para.isRequired === true ? h("div", { className: "lesson-label" },
                h("span", null, para.isRequired === true ? '*' : ''),
                "\u00A0",
                para.title,
                "\u00A0:") : h("div", { className: "lesson-label" },
                para.title,
                "\u00A0:");
            var signTypeWrapper = h("div", { className: "row isSignBack" },
                h("div", { className: "lesson-form-group" },
                    title,
                    h("div", { className: "type" },
                        h("div", { className: "sign-item active", "data-name": "sign-in" }, para.itemArr[0]),
                        h("div", { className: "sign-item", "data-name": "sign-out" }, para.itemArr[1]))));
            return signTypeWrapper;
        };
        IsSignBack.prototype.set = function (num) {
            var allSignItem = d.queryAll('.sign-item', this.wrapper);
            allSignItem.forEach(function (item, i) {
                item.classList.toggle('active', i === num);
            });
        };
        IsSignBack.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.initEvent.off();
        };
        return IsSignBack;
    }(Component));
    exports.IsSignBack = IsSignBack;
});

define("RoleModule", ["require", "exports", "CheckBox", "TextInput", "Button", "Modal", "LeUploadModule", "FastTable", "LeRule", "LeTablePage"], function (require, exports, checkBox_1, text_1, Button_1, Modal_1, UploadModule_1, FastTable_1, LeRule_1, LeTablePage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var d = G.d;
    var Component = G.Component;
    var RoleModule = /** @class */ (function (_super) {
        __extends(RoleModule, _super);
        function RoleModule(para) {
            var _this = _super.call(this, para) || this;
            _this.initEvents = (function () {
                var lookUploadStuHandler = function () {
                    var body = h("div", null,
                        h("div", { className: "modal-row-btn", style: {
                                display: "flex",
                                marginBottom: '20px'
                            } },
                            h(Button_1.Button, { content: "\u5220\u9664\u5B66\u751F", className: "addBtn", onClick: function () {
                                    var selectRows = table.selectedRows;
                                    if (tools.isNotEmptyArray(selectRows)) {
                                        var indexes_1 = [];
                                        selectRows.forEach(function (row) {
                                            _this.deleteStudent(row.data);
                                            indexes_1.push(row.index);
                                        });
                                        table.rowDel(indexes_1);
                                        table.pseudoTable._clearCellSelected();
                                        _this.setStudentNum();
                                    }
                                    else {
                                        Modal_1.Modal.alert('请先选择需要删除的学生！');
                                    }
                                } })));
                    var modal = new Modal_1.Modal({
                        header: {
                            title: "查看学生"
                        },
                        isAdaptiveCenter: true,
                        width: '60%',
                        height: '500px',
                        body: body,
                        className: 'table-modal'
                    });
                    var data = [];
                    tools.isNotEmptyArray(_this.students) && _this.students.forEach(function (stu) {
                        var obj = {
                            SCHOOL_NAME: stu.userschool,
                            STU_NO: stu.userid,
                            STU_NAME: stu.username
                        };
                        data.push(obj);
                    });
                    var table = new FastTable_1.FastTable({
                        container: body,
                        cols: [[
                                {
                                    name: 'STU_NO',
                                    title: '学号'
                                },
                                {
                                    name: 'STU_NAME',
                                    title: '学生姓名'
                                },
                                {
                                    name: 'SCHOOL_NAME',
                                    title: '所在学校'
                                }
                            ]],
                        pseudo: {
                            type: 'checkbox'
                        },
                        data: data
                    });
                };
                return {
                    on: function () { return d.on(_this.wrapper, 'click', '.upload-student-number span', lookUploadStuHandler); },
                    off: function () { return d.off(_this.wrapper, 'click', '.upload-student-number span', lookUploadStuHandler); }
                };
            })();
            _this.innerCom.integralMultiple.set('1');
            _this.initEvents.on();
            return _this;
        }
        Object.defineProperty(RoleModule.prototype, "students", {
            get: function () {
                return this._students;
            },
            set: function (s) {
                this._students = s;
            },
            enumerable: true,
            configurable: true
        });
        RoleModule.prototype.wrapperInit = function (para) {
            var _this = this;
            this.title = para.roleName;
            var uploader = null;
            var titleHtml = tools.isNotEmpty(para.title) ?
                h("div", { className: "lesson-label" },
                    h("span", null, "*\u00A0"),
                    para.title,
                    "\u00A0:") :
                h("div", { className: "lesson-label" });
            var roleModuleWrapper = h("div", { className: "role-item" },
                h("div", { className: "role-item-row" },
                    titleHtml,
                    h("div", { className: "mutil-select" }, para.isMutil ? '(多选)' : ''),
                    h("div", { className: "role-row-right" },
                        h("div", { className: "check-wrapper" },
                            h(checkBox_1.CheckBox, { "c-var": "check", text: para.roleName })),
                        h(text_1.TextInput, { "c-var": "maxPlayers", type: "number", placeholder: "\u4E0D\u8F93\u5165\u4EBA\u6570\u5C06\u4E0D\u9650\u5236\u4EBA\u6570", className: "count" }),
                        h(UploadModule_1.LeUploadModule, { isExcel: true, isAutoUpload: true, accept: { extensions: 'xlsx' }, isChangeText: false, successHandler: function (data) {
                                // 上传成功
                                data.forEach(function (item) {
                                    var res = item.data;
                                    if (tools.isNotEmptyArray(res.data)) {
                                        var resData = res.data;
                                        resData.forEach(function (stu) {
                                            _this.addStudent(stu);
                                        });
                                        _this.setStudentNum();
                                    }
                                });
                            }, "c-var": "uploader", url: LE.CONF.ajaxUrl.getExcelData, text: "\u4E0A\u4F20\u5B66\u751F", className: 'addBtn' }))),
                h("div", { className: "role-item-row" },
                    h("div", { className: "lesson-label" }),
                    h("div", { className: "mutil-select" }),
                    h("div", { className: "role-row-right" },
                        h("div", { className: "check-wrapper" }),
                        h("div", { className: "role-label" }, "\u6307\u5B9A\u7528\u6237"),
                        h(Button_1.Button, { content: "\u6DFB\u52A0\u5B66\u751F", "c-var": "addStudent", className: "addBtn", onClick: function () {
                                LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.addStudent).then(function (_a) {
                                    var response = _a.response;
                                    var body = h("div", null);
                                    var modal = new Modal_1.Modal({
                                        header: {
                                            title: "选择学生"
                                        },
                                        footer: {},
                                        isAdaptiveCenter: true,
                                        width: '60%',
                                        height: '600px',
                                        body: body,
                                        onOk: function () {
                                            var tableSelects = table.tableModule.main.ftable.selectedRowsData;
                                            if (tools.isNotEmptyArray(tableSelects)) {
                                                tableSelects.forEach(function (row) {
                                                    _this.addStudent(row);
                                                });
                                                _this.setStudentNum();
                                                modal.destroy();
                                            }
                                            else {
                                                Modal_1.Modal.alert('请选择学生');
                                            }
                                        }
                                    });
                                    var table = new LeTablePage_1.LeTablePage({
                                        table: response.data.body.table[0],
                                        querier: response.data.body.querier[0],
                                        common: response.data.common,
                                        basePage: null,
                                        container: body,
                                        inTab: false,
                                        onReady: function () {
                                            table.tableModule.main.ftable.on(FastTable_1.FastTable.EVT_RENDERED, function () {
                                                var tableData = table.tableModule.main.ftable.data;
                                                if (tools.isNotEmpty(_this.students)) {
                                                    tableData.forEach(function (tableRowData, index) {
                                                        for (var i = 0; i < _this.students.length; i++) {
                                                            if (tableRowData.STU_NO === _this.students[i].userid) {
                                                                table.tableModule.main.ftable.pseudoTable._setCellsSelected(index, 1);
                                                                table.tableModule.main.ftable.rows[index].selected = true;
                                                                break;
                                                            }
                                                        }
                                                    });
                                                    table.tableModule.main.ftable._drawSelectedCells();
                                                    table.tableModule.main.ftable.pseudoTable.setCheckBoxStatus();
                                                }
                                            });
                                        }
                                    });
                                });
                            } }),
                        h("div", { className: "upload-student-number" },
                            "\u5DF2\u4E0A\u4F20",
                            h("span", { "c-var": "stuNum" }, "0\u540D"),
                            "\u5B66\u751F"))),
                h("div", { className: "role-item-row" },
                    h("div", { className: "lesson-label" }),
                    h("div", { className: "mutil-select" }),
                    h("div", { className: "role-row-right" },
                        h("div", { className: "check-wrapper" }),
                        h("div", { className: "role-label" }, "\u79EF\u5206\u500D\u6570"),
                        h(text_1.TextInput, { "c-var": "integralMultiple", type: "number" }),
                        "\u500D")));
            return roleModuleWrapper;
        };
        RoleModule.prototype.deleteStudent = function (row) {
            var students = this.students;
            for (var i = 0; i < students.length; i++) {
                var stu = students[i];
                if (stu.userid === row.STU_NO) {
                    students.splice(i, 1);
                    this.students = students;
                    return;
                }
            }
        };
        RoleModule.prototype.addStudent = function (row) {
            var students = tools.isNotEmptyArray(this.students) ? this.students : [];
            for (var i = 0; i < students.length; i++) {
                var stu = students[i];
                if (stu.userid === row.STU_NO.toString()) {
                    return;
                }
            }
            students.push({
                userid: row.STU_NO,
                username: row.STU_NAME,
                userschool: row.SCHOOL_NAME
            });
            this.students = students;
        };
        RoleModule.prototype.setStudentNum = function () {
            var index = tools.isNotEmptyArray(this.students) ? this.students.length : 0;
            this.innerEl.stuNum.innerText = index + '名';
        };
        Object.defineProperty(RoleModule.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (dis) {
                if (tools.isEmpty(dis)) {
                    return;
                }
                this._disabled = dis;
                this.innerCom.check.disabled = dis;
                this.innerCom.maxPlayers.disabled = dis;
                this.innerCom.addStudent.disabled = dis;
                this.innerCom.uploader.disabled = dis;
                this.innerCom.integralMultiple.disabled = dis;
                this.innerEl.stuNum.classList.toggle('disabled', dis);
            },
            enumerable: true,
            configurable: true
        });
        RoleModule.prototype.set = function (data) {
            if (tools.isNotEmpty(data)) {
                this.innerCom.check.checked = true;
                if (tools.isNotEmpty(data.students)) {
                    this.students = data.students;
                    this.setStudentNum();
                }
                else {
                    this.students = [];
                }
                var maxPlayers = tools.isNotEmpty(data.type) ? data.type.maxPlayers : '';
                var integralMultiple = tools.isNotEmpty(data.type) ? data.type.integralMultiple : 1;
                this.innerCom.maxPlayers.set(maxPlayers);
                this.innerCom.integralMultiple.set(integralMultiple);
            }
        };
        RoleModule.prototype.get = function () {
            var maxPlayers = this.innerCom.maxPlayers.get(), integralMultiple = this.innerCom.integralMultiple.get(), check = this.innerCom.check.get(), students = tools.isNotEmptyArray(this.students) ? this.students : [];
            if (!!check) {
                if (tools.isNotEmpty(students)) {
                    if (tools.isNotEmpty(maxPlayers) && parseInt(maxPlayers) !== 0) {
                        if (parseInt(maxPlayers) < students.length) {
                            Modal_1.Modal.alert('上传学生人数不能大于限制人数！');
                            return false;
                        }
                    }
                }
                return {
                    type: {
                        maxPlayers: tools.isNotEmpty(maxPlayers) ? parseInt(maxPlayers) : 0,
                        integralMultiple: parseFloat(integralMultiple)
                    },
                    students: students
                };
            }
            return {};
        };
        RoleModule.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.initEvents.off();
        };
        return RoleModule;
    }(Component));
    exports.RoleModule = RoleModule;
});

/// <amd-module name="Roles"/>
define("Roles", ["require", "exports", "RoleModule", "Modal", "Button", "FastTable", "LeRule", "ReportActivityPage"], function (require, exports, RoleModule_1, Modal_1, Button_1, FastTable_1, LeRule_1, ReportActivityPage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var tools = G.tools;
    var Roles = /** @class */ (function (_super) {
        __extends(Roles, _super);
        function Roles(para) {
            return _super.call(this, para) || this;
        }
        Roles.prototype.wrapperInit = function (para) {
            var _this = this;
            var roleWrapper = h("div", { className: "row select-role" },
                h(RoleModule_1.RoleModule, { "c-var": "controller", isMutil: true, title: "\u9009\u62E9\u89D2\u8272", roleName: "\u7BA1\u7406\u8005" }),
                h(RoleModule_1.RoleModule, { "c-var": "organizer", isMutil: false, title: "", roleName: "\u7EC4\u7EC7\u8005" }),
                h(RoleModule_1.RoleModule, { "c-var": "participant", className: "participant", isMutil: false, title: "", roleName: "\u53C2\u4E0E\u8005" }),
                h("div", { className: "role-item viewCredit", "c-var": 'look' },
                    h("div", { className: "lesson-label" }),
                    h("div", { className: "mutil-select" }),
                    h(Button_1.Button, { content: "\u67E5\u770B\u79EF\u5206", className: "addBtn look", onClick: function () {
                            var activityLevel = ReportActivityPage_1.ReportActivityPage.reportData.activityLevel, platformCategory = ReportActivityPage_1.ReportActivityPage.reportData.platformCategory, activitycategory = ReportActivityPage_1.ReportActivityPage.reportData.activityCategory;
                            var paramsData = {}, contorller = _this.innerCom.controller.get(), organizer = _this.innerCom.organizer.get(), participant = _this.innerCom.participant.get();
                            if (tools.isNotEmpty(contorller)) {
                                paramsData['controllerType'] = contorller.type;
                            }
                            if (tools.isNotEmpty(organizer)) {
                                paramsData['organizerType'] = organizer.type;
                            }
                            if (tools.isNotEmpty(participant)) {
                                paramsData['participantType'] = participant.type;
                            }
                            LeRule_1.LeRule.Ajax.fetch(tools.url.addObj(LE.CONF.ajaxUrl.lookIntegral, {
                                activitycategory: activitycategory,
                                activitylevel: activityLevel,
                                platformcategory: platformCategory
                            }), {
                                type: 'POST',
                                data: JSON.stringify(paramsData)
                            }).then(function (_a) {
                                var response = _a.response;
                                var body = h("div", null);
                                var modal = new Modal_1.Modal({
                                    header: {
                                        title: response.data.caption
                                    },
                                    isAdaptiveCenter: true,
                                    width: '60%',
                                    height: '500px',
                                    body: body,
                                    className: 'table-modal'
                                });
                                var cols = [];
                                response.data.sysFieldsList.forEach(function (colObj) {
                                    var col = {
                                        name: colObj.field,
                                        title: colObj.caption
                                    };
                                    cols.push(col);
                                });
                                var table = new FastTable_1.FastTable({
                                    container: body,
                                    cols: [cols],
                                    data: response.data.data
                                });
                            });
                        } }),
                    h(Button_1.Button, { className: "nextBtn downloadTemplate", onClick: function () {
                            window.open(LE.CONF.ajaxUrl.downloadTem);
                        }, content: "\u540D\u5355\u6A21\u677F\u4E0B\u8F7D" })));
            return roleWrapper;
        };
        Object.defineProperty(Roles.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (disabled) {
                if (tools.isEmpty(disabled)) {
                    return;
                }
                this._disabled = disabled;
                this.innerCom.controller.disabled = disabled;
                this.innerCom.organizer.disabled = disabled;
                this.innerCom.participant.disabled = disabled;
                this.innerEl.look.classList.toggle('disabled', disabled);
            },
            enumerable: true,
            configurable: true
        });
        Roles.prototype.set = function (data) {
            if (!tools.isEmpty(data.controller) || !tools.isEmpty(data.controllerType)) {
                this.innerCom.controller.set({
                    students: data.controller,
                    type: data.controllerType
                });
            }
            if (!tools.isEmpty(data.organizer) || !tools.isEmpty(data.organizerType)) {
                this.innerCom.organizer.set({
                    students: data.organizer,
                    type: data.organizerType
                });
            }
            if (!tools.isEmpty(data.participant) || !tools.isEmpty(data.participantType)) {
                this.innerCom.participant.set({
                    students: data.participant,
                    type: data.participantType
                });
            }
        };
        Roles.prototype.get = function () {
            var contorller = this.innerCom.controller.get();
            if (contorller === false) {
                return false;
            }
            var organizer = this.innerCom.organizer.get();
            if (organizer === false) {
                return false;
            }
            var participant = this.innerCom.participant.get();
            if (participant === false) {
                return false;
            }
            if (G.tools.isEmpty(contorller) && G.tools.isEmpty(organizer) && G.tools.isEmpty(participant)) {
                Modal_1.Modal.alert('请至少选择一个角色!');
                return false;
            }
            return {
                organizer: organizer,
                contorller: contorller,
                participant: participant
            };
        };
        Roles.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
        };
        return Roles;
    }(Component));
    exports.Roles = Roles;
});

/// <amd-module name="SignBackItem"/>
define("SignBackItem", ["require", "exports", "TimeModule", "SignType", "ActivityRadioModule", "ReportActivityPage"], function (require, exports, TimeModule_1, SignType_1, ActivityRadioModule_1, ReportActivityPage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var tools = G.tools;
    var SignBackItem = /** @class */ (function (_super) {
        __extends(SignBackItem, _super);
        function SignBackItem(para) {
            var _this = _super.call(this, para) || this;
            _this.innerCom.signBack.onChange(function (e) {
                var value = e.target.value;
                _this.innerEl.showContent.classList.toggle('hide', value === '否');
            });
            return _this;
        }
        SignBackItem.prototype.wrapperInit = function (para) {
            var signContentWrapper = h("div", { className: "sign-back-item" },
                h(ActivityRadioModule_1.ActivityRadioModule, { "c-var": "signBack", title: "\u9009\u62E9\u7B7E\u9000", value: ["否", "是"] }),
                h("div", { "c-var": "showContent", className: "hide" },
                    h(TimeModule_1.TimeModule, { "c-var": "signBackTime", preAlert: "\u7B7E\u9000", title: "\u7B7E\u9000\u65F6\u95F4" }),
                    h("div", { className: "sign-type" },
                        h(SignType_1.SignType, { "c-var": "signType", isSignIn: false }))));
            return signContentWrapper;
        };
        Object.defineProperty(SignBackItem.prototype, "disabled", {
            set: function (disabled) {
                if (tools.isEmpty(disabled)) {
                    return;
                }
                this._disabled = disabled;
                this.innerCom.signBack.disabled = disabled;
                this.innerCom.signBackTime.disabled = disabled;
                this.innerCom.signType.disabled = disabled;
            },
            enumerable: true,
            configurable: true
        });
        SignBackItem.prototype.set = function (data) {
            if (tools.isNotEmpty(data)) {
                var signBack = Number(data.signBack);
                this.innerCom.signBack.set(signBack);
                if (signBack === 1) {
                    this.innerEl.showContent.classList.remove('hide');
                    this.innerCom.signBackTime.set([data.signStartTime, data.signEndTime]);
                    this.innerCom.signType.set({
                        signType: data.signType,
                        signPosition: data.signPosition,
                        longitude: data.longitude,
                        latitude: data.latitude,
                        distance: data.distance,
                        duration: data.duration,
                        signCaption: data.signCaption
                    });
                }
            }
            else {
                this.innerCom.signType.set({});
            }
        };
        SignBackItem.prototype.get = function () {
            var signBack = this.innerCom.signBack.get();
            if (signBack === 0) {
                // 不签退
                ReportActivityPage_1.ReportActivityPage.reportData.signBack = 0;
                ReportActivityPage_1.ReportActivityPage.reportData.signBackStartTime = 0;
                ReportActivityPage_1.ReportActivityPage.reportData.signBackEndTime = 0;
                ReportActivityPage_1.ReportActivityPage.reportData.longitude = '';
                ReportActivityPage_1.ReportActivityPage.reportData.latitude = '';
                ReportActivityPage_1.ReportActivityPage.reportData.signType = 0;
                ReportActivityPage_1.ReportActivityPage.reportData.distance = 0;
                ReportActivityPage_1.ReportActivityPage.reportData.signPosition = 0;
                ReportActivityPage_1.ReportActivityPage.reportData.signCaption = '';
            }
            else {
                //签退
                ReportActivityPage_1.ReportActivityPage.reportData.signBack = 1;
                var signBackTime = this.innerCom.signBackTime.get();
                if (!!!signBackTime) {
                    return false;
                }
                var signType = this.innerCom.signType.get();
                if (!!!signType) {
                    return false;
                }
                ReportActivityPage_1.ReportActivityPage.reportData.signBackStartTime = signBackTime[0];
                ReportActivityPage_1.ReportActivityPage.reportData.signBackEndTime = signBackTime[1];
            }
            return true;
        };
        return SignBackItem;
    }(Component));
    exports.SignBackItem = SignBackItem;
});

/// <amd-module name="SignBackModule"/>
define("SignBackModule", ["require", "exports", "SignBackItem"], function (require, exports, SignBackItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var tools = G.tools;
    var SignBackModule = /** @class */ (function (_super) {
        __extends(SignBackModule, _super);
        function SignBackModule(para) {
            return _super.call(this, para) || this;
        }
        SignBackModule.prototype.wrapperInit = function (para) {
            var signBackModuleWrapper = h("div", { className: "row hide" },
                h(SignBackItem_1.SignBackItem, { "c-var": "signBackItem" }));
            return signBackModuleWrapper;
        };
        Object.defineProperty(SignBackModule.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (disabled) {
                if (tools.isEmpty(disabled)) {
                    return;
                }
                this._disabled = disabled;
                this.innerCom.signBackItem.disabled = disabled;
            },
            enumerable: true,
            configurable: true
        });
        SignBackModule.prototype.set = function (data) {
            if (tools.isNotEmpty(data)) {
                this.innerCom.signBackItem.set(data);
            }
            else {
                this.innerCom.signBackItem.set({});
            }
        };
        SignBackModule.prototype.get = function () {
            var signBack = this.innerCom.signBackItem.get();
            if (!!!signBack) {
                return false;
            }
            return true;
        };
        return SignBackModule;
    }(Component));
    exports.SignBackModule = SignBackModule;
});

/// <amd-module name="SignInItem"/>
define("SignInItem", ["require", "exports", "TimeModule", "Button", "SignType", "ReportActivityPage"], function (require, exports, TimeModule_1, Button_1, SignType_1, ReportActivityPage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var tools = G.tools;
    var SignInItem = /** @class */ (function (_super) {
        __extends(SignInItem, _super);
        function SignInItem(para) {
            var _this = _super.call(this, para) || this;
            var defaultValue = para.defaultValue;
            _this.isFirst = para.isAdd;
            if (tools.isNotEmpty(defaultValue)) {
                _this.innerCom.time.set([defaultValue.signStartTime, defaultValue.signEndTime]);
                _this.innerCom.signType.set({
                    signType: defaultValue.signType,
                    signPosition: defaultValue.signPosition,
                    longitude: defaultValue.longitude,
                    latitude: defaultValue.latitude,
                    distance: defaultValue.distance,
                    duration: defaultValue.duration,
                    signCaption: defaultValue.signCaption
                });
            }
            return _this;
        }
        SignInItem.prototype.wrapperInit = function (para) {
            var signContentWrapper = h("div", { className: "sign-in-item" },
                h(TimeModule_1.TimeModule, { "c-var": "time", title: "\u7B7E\u5230\u65F6\u95F4", preAlert: "\u7B7E\u5230" }),
                h("div", { className: "sign-type" },
                    h(SignType_1.SignType, { "c-var": "signType", isSignIn: true })),
                h("div", { className: "btns" },
                    h(Button_1.Button, { "c-var": "add", content: para.isAdd === true ? '新增' : '删除', onClick: function () {
                            para.isAdd === true ? para.addBtnHandler() : para.removeBtnHandler();
                        }, className: "addBtn" })));
            return signContentWrapper;
        };
        Object.defineProperty(SignInItem.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (disabled) {
                if (tools.isEmpty(disabled)) {
                    return;
                }
                this._disabled = disabled;
                switch (ReportActivityPage_1.ReportActivityPage.state) {
                    case '待开展':
                        {
                            this.innerCom.time.disabled = false;
                            if (this.isFirst) {
                                this.innerCom.signType.disabled = true;
                                this.innerCom.add.disabled = true;
                            }
                            else {
                                this.innerCom.signType.disabled = false;
                                this.innerCom.add.disabled = false;
                            }
                        }
                        break;
                    case '进行中':
                        {
                            var currentDisabled = true;
                            if (this.isFirst) {
                                currentDisabled = false;
                            }
                            this.innerCom.time.disabled = currentDisabled;
                            this.innerCom.signType.disabled = currentDisabled;
                            this.innerCom.add.disabled = currentDisabled;
                        }
                        break;
                    case '报名中':
                        {
                            this.innerCom.time.disabled = false;
                            if (this.isFirst) {
                                this.innerCom.signType.disabled = true;
                                this.innerCom.add.disabled = true;
                            }
                            else {
                                this.innerCom.signType.disabled = false;
                                this.innerCom.add.disabled = false;
                            }
                        }
                        break;
                    default:
                        {
                            this.innerCom.time.disabled = disabled;
                            this.innerCom.signType.disabled = disabled;
                            this.innerCom.add.disabled = disabled;
                        }
                        break;
                }
            },
            enumerable: true,
            configurable: true
        });
        SignInItem.prototype.set = function (data) {
            if (tools.isNotEmpty(data)) {
                this.innerCom.time.set([data.signStartTime, data.signEndTime]);
                this.innerCom.signType.set({
                    signType: data.signType,
                    signPosition: data.signPosition,
                    longitude: data.longitude,
                    latitude: data.latitude,
                    distance: data.distance,
                    duration: data.duration,
                    signCaption: data.signCaption
                });
            }
            else {
                this.innerCom.signType.set({});
            }
        };
        SignInItem.prototype.get = function () {
            var signType = this.innerCom.signType.get();
            if (!!!signType) {
                return false;
            }
            var time = this.innerCom.time.get();
            if (!!!time) {
                return false;
            }
            var signInItemObj = Object.assign({
                signStartTime: time[0],
                signEndTime: time[1],
            }, signType);
            return signInItemObj;
        };
        return SignInItem;
    }(Component));
    exports.SignInItem = SignInItem;
});

define("SignInModule", ["require", "exports", "SignInItem", "Modal"], function (require, exports, SignInItem_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="SignInModule"/>
    var Component = G.Component;
    var tools = G.tools;
    var SignInModule = /** @class */ (function (_super) {
        __extends(SignInModule, _super);
        function SignInModule(para) {
            var _this = _super.call(this, para) || this;
            _this.signInItemArr = [_this.innerCom.add];
            return _this;
        }
        Object.defineProperty(SignInModule.prototype, "signInItemArr", {
            get: function () {
                return this._signInItemArr;
            },
            set: function (s) {
                this._signInItemArr = s;
            },
            enumerable: true,
            configurable: true
        });
        SignInModule.prototype.wrapperInit = function (para) {
            var _this = this;
            var signInWrapper = h("div", { className: "row addRow" },
                h(SignInItem_1.SignInItem, { "c-var": "add", isAdd: true, addBtnHandler: function () {
                        _this.createNewSignInItem();
                    } }));
            return signInWrapper;
        };
        SignInModule.prototype.createNewSignInItem = function (signContent) {
            var _this = this;
            var item = new SignInItem_1.SignInItem({
                container: this.wrapper,
                isAdd: false,
                removeBtnHandler: function () {
                    item.destroy();
                    var a = _this.signInItemArr, index = a.indexOf(item);
                    a.splice(index, 1);
                    _this.signInItemArr = a;
                },
                defaultValue: signContent
            });
            if (tools.isEmpty(signContent)) {
                item.set({});
            }
            var arr = this.signInItemArr;
            this.signInItemArr = arr.concat(item);
        };
        Object.defineProperty(SignInModule.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (disabled) {
                if (tools.isEmpty(disabled)) {
                    return;
                }
                this._disabled = disabled;
                tools.isNotEmpty(this.signInItemArr) && this.signInItemArr.forEach(function (signItem) {
                    signItem.disabled = disabled;
                });
            },
            enumerable: true,
            configurable: true
        });
        SignInModule.prototype.set = function (data) {
            var _this = this;
            if (tools.isNotEmpty(data)) {
                var firstValue = void 0, otherValue = [];
                if (tools.isNotEmptyArray(data)) {
                    firstValue = data[0];
                    otherValue = data.slice(1);
                }
                this.innerCom.add.set(firstValue);
                otherValue.forEach(function (val) {
                    _this.createNewSignInItem(val);
                });
            }
            else {
                this.innerCom.add.set({});
            }
        };
        SignInModule.prototype.get = function () {
            var signContent = [];
            for (var i = 0; i < this.signInItemArr.length; i++) {
                var item = this.signInItemArr[i], value = item.get();
                if (!!!value) {
                    return false;
                }
                signContent.push(value);
            }
            if (signContent.length === 0) {
                Modal_1.Modal.alert('签到内容不能为空!');
                return false;
            }
            return signContent;
        };
        return SignInModule;
    }(Component));
    exports.SignInModule = SignInModule;
});

/// <amd-module name="SignPosition"/>
define("SignPosition", ["require", "exports", "Button", "TextInput", "ReportActivityPage", "Modal", "FastTable", "LeRule"], function (require, exports, Button_1, text_1, ReportActivityPage_1, Modal_1, FastTable_1, LeRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    var SPA = G.SPA;
    var SignPosition = /** @class */ (function (_super) {
        __extends(SignPosition, _super);
        function SignPosition(para) {
            var _this = _super.call(this, para) || this;
            _this.initEvents = (function () {
                var inputChangeEvent = function (e) {
                    _this.setCheckedInput(e.target);
                };
                return {
                    on: function () {
                        d.on(_this.wrapper, 'change', 'input[type=radio]', inputChangeEvent);
                    },
                    off: function () {
                        d.off(_this.wrapper, 'change', 'input[type=radio]', inputChangeEvent);
                    }
                };
            })();
            _this.initEvents.on();
            _this.innerCom.map.set('150');
            _this.innerCom.now.set('150');
            return _this;
        }
        SignPosition.prototype.wrapperInit = function (para) {
            var _this = this;
            this.values = ['不限', '活动地图库选择', '现在选择'];
            this.isSignIn = para.isSignIn;
            var date = new Date().getTime(), randomStr = this.getRandomStr(), r1 = date + randomStr + 'a', r2 = date + randomStr + 'b', r3 = date + randomStr + 'c';
            var spanTitle = para.isSignIn ? '签到限制距离' : '签退限制距离', name = 'signPosition' + randomStr;
            var signPositionWrapper = h("div", { className: "group-oriented-radio" },
                h("div", { className: "check-title" }, para.isSignIn === true ? '签到位置' : '签退位置'),
                h("div", { className: "radio-group" },
                    h("div", { className: "radio-wrapper" },
                        h("input", { type: "radio", className: "radio-normal position-radio", value: "\u4E0D\u9650", checked: true, name: name, id: r1 }),
                        h("label", { htmlFor: r1 }, "\u4E0D\u9650")),
                    h("div", { className: "selectMap" },
                        h("div", { className: "radio-wrapper" },
                            h("input", { type: "radio", className: "radio-normal position-radio", value: "\u6D3B\u52A8\u5730\u56FE\u5E93\u9009\u62E9", name: name, id: r2 }),
                            h("label", { htmlFor: r2 }, "\u6D3B\u52A8\u5730\u56FE\u5E93\u9009\u62E9")),
                        h("div", { className: "position-setting hide" },
                            h("div", { className: "select-pos" },
                                h(Button_1.Button, { content: "\u9009\u62E9", className: "addBtn", onClick: function () {
                                        LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.selectPosition).then(function (_a) {
                                            var response = _a.response;
                                            var body = h("div", null);
                                            var modal = new Modal_1.Modal({
                                                header: {
                                                    title: response.data.caption
                                                },
                                                isAdaptiveCenter: true,
                                                width: '60%',
                                                height: '500px',
                                                body: body,
                                                className: 'table-modal',
                                                footer: {},
                                                onOk: function () {
                                                    var tableSelects = table.selectedRowsData;
                                                    if (tools.isNotEmptyArray(tableSelects)) {
                                                        if (tableSelects.length >= 2) {
                                                            Modal_1.Modal.alert('请最多选择一个位置!');
                                                        }
                                                        else {
                                                            var row = tableSelects[0], position = row.LOCATION;
                                                            _this.longitude = position.split(',')[0];
                                                            _this.latitude = position.split(',')[1];
                                                            _this.innerEl.showPos.innerText = row.FOCUSNAME;
                                                            _this.signCaption = row.FOCUSNAME;
                                                            _this.innerCom.map.set(row.ACTIVITY_LOCATION_RADIUS);
                                                            modal.destroy();
                                                        }
                                                    }
                                                    else {
                                                        Modal_1.Modal.alert('请选择一个位置!');
                                                    }
                                                }
                                            });
                                            var cols = [];
                                            response.data.sysFieldsList.forEach(function (colObj) {
                                                var col = {
                                                    name: colObj.field,
                                                    title: colObj.caption
                                                };
                                                cols.push(col);
                                            });
                                            var table = new FastTable_1.FastTable({
                                                container: body,
                                                cols: [cols],
                                                data: response.data.data,
                                                pseudo: {
                                                    type: 'checkbox'
                                                }
                                            });
                                        });
                                    } }),
                                h("span", null, spanTitle),
                                h(text_1.TextInput, { "c-var": "map", type: "number" })),
                            h("div", { className: "showLocation" },
                                h("span", null, "\u4F4D\u7F6E\u00A0:"),
                                "\u00A0\u00A0",
                                h("span", { "c-var": "showPos" })))),
                    h("div", { className: "selectMap" },
                        h("div", { className: "radio-wrapper" },
                            h("input", { type: "radio", className: "radio-normal position-radio", value: '\u73B0\u5728\u9009\u62E9', name: name, id: r3 }),
                            h("label", { htmlFor: r3 }, "\u73B0\u5728\u9009\u62E9")),
                        h("div", { className: "position-setting hide" },
                            h("div", { className: "select-pos" },
                                h(Button_1.Button, { content: "\u9009\u62E9", className: "addBtn", onClick: function () {
                                        SPA.open(['lesson2', 'mapModalModify', {
                                                inModal: true,
                                                _noHide: true,
                                                title: para.isSignIn ? '选择签到位置' : '选择签退位置',
                                                address: '',
                                                notRequest: true,
                                                radius: parseInt(_this.innerCom.now.get()),
                                            }], {
                                            onClose: function (lng, lat, radius, caption) {
                                                _this.longitude = tools.isNotEmpty(lng) ? lng.toString() : '';
                                                _this.latitude = tools.isNotEmpty(lat) ? lat.toString() : '';
                                                _this.signCaption = tools.isNotEmpty(caption) ? caption : '';
                                                _this.innerEl.showNowPos.innerText = caption || '未知';
                                                _this.innerCom.now.set(radius);
                                            }
                                        }, true);
                                    } }),
                                h("span", null, spanTitle),
                                h(text_1.TextInput, { "c-var": "now", type: "number" })),
                            h("div", { className: "showLocation" },
                                h("span", null, "\u4F4D\u7F6E\u00A0:"),
                                "\u00A0\u00A0",
                                h("span", { "c-var": "showNowPos" }))))));
            return signPositionWrapper;
        };
        SignPosition.prototype.getRandomStr = function () {
            var str = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
            var pwd = '';
            for (var i = 0; i < 5; i++) {
                pwd += str.charAt(Math.floor(Math.random() * str.length));
            }
            return pwd;
        };
        SignPosition.prototype.setCheckedInput = function (target) {
            var selectMap = d.closest(target, '.selectMap'), setPositions = d.queryAll('.position-setting', this.wrapper);
            setPositions.forEach(function (pos) {
                pos.classList.add('hide');
            });
            if (tools.isNotEmpty(selectMap)) {
                d.query('.position-setting', selectMap).classList.remove('hide');
            }
        };
        SignPosition.prototype.set = function (data) {
            if (tools.isNotEmpty(data)) {
                var signPositionRadios = d.queryAll('input.position-radio', this.wrapper).map(function (input) {
                    return input;
                });
                var position = 0;
                if (tools.isNotEmpty(data.signPosition)) {
                    position = Number(data.signPosition);
                }
                signPositionRadios[position].checked = true;
                this.setCheckedInput(signPositionRadios[data.signPosition]);
                if (position !== 0) {
                    if (position === 1) {
                        this.innerCom.map.set(data.distance);
                        this.innerEl.showPos.innerText = tools.isNotEmpty(data.signCaption) ? data.signCaption : '未知';
                    }
                    else {
                        this.innerCom.now.set(data.distance);
                        this.innerEl.showNowPos.innerText = tools.isNotEmpty(data.signCaption) ? data.signCaption : '未知';
                    }
                    this.signCaption = tools.isNotEmpty(data.signCaption) ? data.signCaption : '';
                    this.latitude = data.latitude;
                    this.longitude = data.longitude;
                }
            }
        };
        SignPosition.prototype.get = function () {
            var signName = this.isSignIn === true ? '签到' : '签退';
            if (this.isSignIn === true) {
                var signPosition = this.values.indexOf(d.query('input.position-radio:checked', this.wrapper).value);
                if (signPosition !== 0) {
                    if (tools.isEmpty(this.longitude) || tools.isEmpty(this.latitude)) {
                        Modal_1.Modal.alert('请选择' + signName + '位置');
                        return false;
                    }
                }
                var distance = 0, signCaption = '', latitude = '', longitude = '';
                if (signPosition !== 0) {
                    signCaption = tools.isNotEmpty(this.signCaption) ? this.signCaption : '';
                    latitude = tools.isEmpty(this.latitude) ? '' : this.latitude;
                    longitude = tools.isEmpty(this.longitude) ? '' : this.longitude;
                    if (signPosition === 1) {
                        distance = parseInt(this.innerCom.map.get());
                    }
                    else {
                        distance = parseInt(this.innerCom.now.get());
                    }
                }
                return {
                    latitude: latitude,
                    longitude: longitude,
                    distance: distance,
                    signPosition: signPosition,
                    signCaption: signCaption
                };
            }
            else {
                var signPosition = this.values.indexOf(d.query('input.position-radio:checked', this.wrapper).value);
                if (signPosition !== 0) {
                    if (tools.isEmpty(this.longitude) || tools.isEmpty(this.latitude)) {
                        Modal_1.Modal.alert('请选择位置');
                        return false;
                    }
                }
                ReportActivityPage_1.ReportActivityPage.reportData.signPosition = signPosition;
                ReportActivityPage_1.ReportActivityPage.reportData.longitude = this.longitude;
                ReportActivityPage_1.ReportActivityPage.reportData.latitude = this.latitude;
                var distance = 0, signCaption = '';
                if (signPosition === 1) {
                    distance = parseInt(this.innerCom.map.get());
                    signCaption = tools.isNotEmpty(this.signCaption) ? this.signCaption : '';
                }
                else {
                    distance = parseInt(this.innerCom.now.get());
                }
                ReportActivityPage_1.ReportActivityPage.reportData.distance = distance;
                ReportActivityPage_1.ReportActivityPage.reportData.signCaption = signCaption;
                return true;
            }
        };
        SignPosition.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.initEvents.off();
        };
        return SignPosition;
    }(Component));
    exports.SignPosition = SignPosition;
});

/// <amd-module name="SignType"/>
define("SignType", ["require", "exports", "SelectInput", "SignPosition", "ReportActivityPage", "LeRule", "Modal", "Utils"], function (require, exports, selectInput_1, SignPosition_1, ReportActivityPage_1, LeRule_1, Modal_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    var SignType = /** @class */ (function (_super) {
        __extends(SignType, _super);
        function SignType(para) {
            var _this = _super.call(this, para) || this;
            _this.initEvents = (function () {
                var inputChangeEvent = function (e) {
                    var value = e.target.value;
                    _this.innerCom.position.wrapper.classList.toggle('hide', value !== '人脸识别');
                    _this.innerCom.qrCodeTime.wrapper.classList.toggle('hide', value !== '动态二维码');
                };
                return {
                    on: function () {
                        d.on(_this.wrapper, 'change', 'input.sign-type-radio-input', inputChangeEvent);
                    },
                    off: function () {
                        d.off(_this.wrapper, 'change', 'input.sign-type-radio-input', inputChangeEvent);
                    }
                };
            })();
            _this.initEvents.on();
            return _this;
        }
        SignType.prototype.wrapperInit = function (para) {
            this.values = ["人脸识别", "动态二维码"];
            this.isSignIn = para.isSignIn;
            var date = new Date().getTime(), randomStr = this.getRandomStr(), r1 = date + randomStr + 'no', r2 = date + randomStr + 'yes', name = 'signtype' + randomStr;
            var signTypeWrapper = h("div", { className: "sign-type-wrapper lesson-form-group" },
                h("div", { className: "lesson-label" },
                    para.isSignIn === true ? "签到方式" : "签退方式",
                    "\u00A0:"),
                h("div", { className: "radio-group sign-type-radio", "c-var": "group" },
                    h("div", { className: "face" },
                        h("div", { className: "radio-wrapper" },
                            h("input", { type: "radio", className: "sign-type-radio radio-normal sign-type-radio-input", value: "\u4EBA\u8138\u8BC6\u522B", checked: true, name: name, id: r1 }),
                            h("label", { htmlFor: r1 }, "\u4EBA\u8138\u8BC6\u522B")),
                        h(SignPosition_1.SignPosition, { "c-var": "position", isSignIn: para.isSignIn })),
                    h("div", { className: "qrcode" },
                        h("div", { className: "radio-wrapper" },
                            h("input", { type: "radio", className: "sign-type-radio radio-normal sign-type-radio-input", value: "\u52A8\u6001\u4E8C\u7EF4\u7801", name: name, id: r2 }),
                            h("label", { htmlFor: r2 }, "\u52A8\u6001\u4E8C\u7EF4\u7801")),
                        h(selectInput_1.SelectInput, { className: "hide", "c-var": 'qrCodeTime', dropClassName: "sign-type-drop", placeholder: "\u8BF7\u9009\u62E9\u6709\u6548\u65F6\u95F4" }))));
            return signTypeWrapper;
        };
        SignType.prototype.set = function (data) {
            if (tools.isNotEmpty(data)) {
                // signType
                var signTypeRadios = d.queryAll('input.sign-type-radio', this.wrapper).map(function (input) {
                    return input;
                });
                this.innerCom.position.wrapper.classList.toggle('hide', data.signType !== 0);
                this.innerCom.qrCodeTime.wrapper.classList.toggle('hide', data.signType !== 1);
                var signType = tools.isNotEmpty(data.signType) ? Number(data.signType) : 0;
                signTypeRadios[signType].checked = true;
                if (signType === 0) {
                    this.innerCom.position.set({
                        signPosition: data.signPosition,
                        latitude: data.latitude,
                        longitude: data.longitude,
                        distance: data.distance,
                        signCaption: data.signCaption
                    });
                }
            }
            var dropInput = this.innerCom.qrCodeTime;
            LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.qrCodeTime).then(function (_a) {
                var response = _a.response;
                var dropData = utils_1.Utils.getDropDownList(response.data.body.dataList, 0);
                if (tools.isNotEmptyArray(dropData)) {
                    var da = dropData.map(function (dropd) {
                        return dropd + 's';
                    });
                    dropInput.setPara({ data: da });
                    dropInput.set(da[0]);
                }
                if (tools.isNotEmpty(data) && data.signType === 1) {
                    dropInput.set(data.duration + 's');
                }
            }).catch(function () {
                Modal_1.Modal.alert('获取二维码有效时间失败!');
            });
        };
        SignType.prototype.get = function () {
            if (this.isSignIn === true) {
                var signType = this.values.indexOf(d.query('input.sign-type-radio:checked', this.wrapper).value), duration = '', latitude = '', longitude = '', distance = 0, signPosition = 0, signCaption = '';
                if (signType === 0) {
                    // 人脸识别
                    var position = this.innerCom.position.get();
                    if (!!!position) {
                        return false;
                    }
                    position = position;
                    latitude = position.latitude;
                    longitude = position.longitude;
                    distance = position.distance;
                    signPosition = position.signPosition;
                    signCaption = position.signCaption;
                }
                else {
                    // 动态二维码
                    var du = this.innerCom.qrCodeTime.get();
                    duration = du.slice(0, du.length - 1);
                }
                return {
                    signType: signType,
                    signPosition: signPosition,
                    distance: distance,
                    latitude: latitude,
                    longitude: longitude,
                    duration: duration,
                    signCaption: signCaption
                };
            }
            else {
                var signType = this.values.indexOf(d.query('input.sign-type-radio:checked', this.wrapper).value);
                if (signType === 0) {
                    // 人脸识别
                    ReportActivityPage_1.ReportActivityPage.reportData.duration = 0; // 二维码有效时间设置空值
                    var position = this.innerCom.position.get();
                    if (!!!position) {
                        return false;
                    }
                    ReportActivityPage_1.ReportActivityPage.reportData.duration = 0;
                }
                else {
                    // 动态二维码
                    ReportActivityPage_1.ReportActivityPage.reportData.latitude = '';
                    ReportActivityPage_1.ReportActivityPage.reportData.longitude = '';
                    ReportActivityPage_1.ReportActivityPage.reportData.distance = 0;
                    ReportActivityPage_1.ReportActivityPage.reportData.signPosition = 0;
                    ReportActivityPage_1.ReportActivityPage.reportData.signCaption = '';
                    var durationStr = this.innerCom.qrCodeTime.get(), duration = parseInt(durationStr.substr(0, durationStr.length - 1));
                    ReportActivityPage_1.ReportActivityPage.reportData.duration = duration;
                }
                ReportActivityPage_1.ReportActivityPage.reportData.signType = signType;
                return true;
            }
        };
        SignType.prototype.getRandomStr = function () {
            var str = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
            var pwd = '';
            for (var i = 0; i < 5; i++) {
                pwd += str.charAt(Math.floor(Math.random() * str.length));
            }
            return pwd;
        };
        Object.defineProperty(SignType.prototype, "disabled", {
            set: function (disabled) {
                if (tools.isEmpty(disabled)) {
                    return;
                }
                this._disabled = disabled;
                this.innerEl.group.classList.toggle('disabled', disabled);
            },
            enumerable: true,
            configurable: true
        });
        SignType.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.initEvents.off();
        };
        return SignType;
    }(Component));
    exports.SignType = SignType;
});

define("TimeModule", ["require", "exports", "Datetime", "Modal", "Utils"], function (require, exports, datetime_1, Modal_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var tools = G.tools;
    var TimeModule = /** @class */ (function (_super) {
        __extends(TimeModule, _super);
        function TimeModule(para) {
            var _this = _super.call(this, para) || this;
            _this.preAlert = para.preAlert;
            return _this;
        }
        TimeModule.prototype.wrapperInit = function (para) {
            return h("div", { className: "row time" },
                h("div", { className: "lesson-form-group" },
                    h("div", { className: "lesson-label" },
                        h("span", null, para.isRequired === true ? '*' : ''),
                        "\u00A0",
                        para.title,
                        "\u00A0:"),
                    h(datetime_1.Datetime, { "c-var": "startTime", isClean: true, cleanIcon: "sec seclesson-guanbi", format: "Y-M-d H:m" }),
                    h("span", { className: "zhi" }, "\u81F3"),
                    h(datetime_1.Datetime, { "c-var": "endTime", isClean: true, cleanIcon: "sec seclesson-guanbi", format: "Y-M-d H:m" })));
        };
        Object.defineProperty(TimeModule.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (d) {
                this._disabled = d;
                this.innerCom.startTime.disabled = d;
                this.innerCom.endTime.disabled = d;
            },
            enumerable: true,
            configurable: true
        });
        TimeModule.prototype.get = function () {
            var st = this.innerCom.startTime.get(), et = this.innerCom.endTime.get();
            if (tools.isEmpty(st)) {
                Modal_1.Modal.alert(this.preAlert + '开始时间不能为空!');
                return false;
            }
            if (tools.isEmpty(et)) {
                Modal_1.Modal.alert(this.preAlert + '结束时间不能为空!');
                return false;
            }
            var stTime = new Date(st).getTime(), etTime = new Date(et).getTime();
            if (stTime > etTime) {
                Modal_1.Modal.alert(this.preAlert + '开始时间不能大于' + this.preAlert + '结束时间!');
                return false;
            }
            return [stTime / 1000, etTime / 1000];
        };
        TimeModule.prototype.set = function (time) {
            this.innerCom.startTime.set(utils_1.Utils.formatTime(time[0]));
            this.innerCom.endTime.set(utils_1.Utils.formatTime(time[1]));
        };
        return TimeModule;
    }(Component));
    exports.TimeModule = TimeModule;
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
