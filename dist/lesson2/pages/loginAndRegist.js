define("ForgetPwdPage", ["require", "exports", "RegistModule1", "RegistModule3"], function (require, exports, RegistModule1_1, RegistModule3_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="ForgetPwdPage"/>
    var SPAPage = G.SPAPage;
    var d = G.d;
    var ForgetPwdPage = /** @class */ (function (_super) {
        __extends(ForgetPwdPage, _super);
        function ForgetPwdPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(ForgetPwdPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (t) {
                this._title = t;
            },
            enumerable: true,
            configurable: true
        });
        ForgetPwdPage.prototype.wrapperInit = function () {
            var forgetHTML = h("div", { className: "login-page-common forget-page" },
                h("div", { className: "college-name" }, "\u95FD\u6C5F\u5B66\u9662"),
                h("div", { className: "lesson2-title" },
                    h("p", { className: "lang-ch" }, "\u7B2C\u4E8C\u8BFE\u5802\u540E\u53F0\u7BA1\u7406\u7CFB\u7EDF"),
                    h("p", { className: "lang-en" }, "Background management system")),
                h("div", { className: "login-form-common forget-wrapper" }));
            var registWrapper = d.query('.forget-wrapper', forgetHTML);
            new RegistModule1_1.RegistModule1({
                container: registWrapper,
                loginTitle: '请重置您的登录密码',
                submitHandler: function (objData) {
                    registWrapper.innerHTML = '';
                    new RegistModule3_1.RegistModule3({
                        container: registWrapper,
                        title: '您的密码已重置成功，您的身份信息如下:',
                        explain: '您可以使用账号、手机号、身份证号加密码的方式登录系统。',
                        userInfo: objData
                    });
                }
            });
            return forgetHTML;
        };
        ForgetPwdPage.prototype.init = function (para, data) {
        };
        return ForgetPwdPage;
    }(SPAPage));
    exports.ForgetPwdPage = ForgetPwdPage;
});

define("RegistModule1", ["require", "exports", "Modal", "Button", "TextInput", "LeRule"], function (require, exports, Modal_1, Button_1, text_1, LeRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var Component = G.Component;
    var RegistModule1 = /** @class */ (function (_super) {
        __extends(RegistModule1, _super);
        function RegistModule1(para) {
            var _this = _super.call(this, para) || this;
            _this.isGetMsgCode = false;
            _this.initEvents = (function () {
                var canvasClickEvent = function (e) {
                    _this.graphCode = _this.renderCheckCode(e.target);
                };
                return {
                    on: function () {
                        d.on(_this.wrapper, 'click', 'canvas', canvasClickEvent);
                    },
                    off: function () {
                        d.off(_this.wrapper, 'click', 'canvas', canvasClickEvent);
                    }
                };
            })();
            _this.submitHandler = para.submitHandler;
            _this.initEvents.on();
            return _this;
        }
        RegistModule1.prototype.wrapperInit = function (para) {
            var _this = this;
            var registModule1HTML = h("div", { className: "regist-module regist-module1" },
                h("div", { className: "input-wrapper group" },
                    h(text_1.TextInput, { "c-var": "phone", placeholder: "\u8BF7\u8F93\u5165\u624B\u673A\u53F7" })),
                h("div", { className: "confirm-code group" },
                    h("div", { className: "input-wrapper" },
                        h(text_1.TextInput, { "c-var": "graphCode", placeholder: "\u8BF7\u8F93\u5165\u56FE\u5F62\u9A8C\u8BC1\u7801" })),
                    this.canvas = h("canvas", { width: 90, height: 40, className: "graphValidateCode" }),
                    h(Button_1.Button, { "c-var": "msgBtn", content: "\u83B7\u53D6\u77ED\u4FE1\u9A8C\u8BC1\u7801", onClick: function () {
                            var graphCodeValue = _this.innerCom.graphCode.get(), phone = _this.innerCom.phone.get();
                            if (tools.isEmpty(phone)) {
                                Modal_1.Modal.alert('请输入手机号');
                            }
                            else {
                                if (tools.valid.isTel(phone)) {
                                    if (tools.isEmpty(graphCodeValue)) {
                                        Modal_1.Modal.alert("请输入图形验证码");
                                    }
                                    else if (graphCodeValue.toUpperCase() !== _this.graphCode) {
                                        Modal_1.Modal.alert("请输入正确的图形验证码");
                                    }
                                    else {
                                        LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.smsCode, {
                                            type: 'POST',
                                            data: {
                                                mobile_id: phone
                                            }
                                        }).then(function (_a) {
                                            var response = _a.response;
                                            Modal_1.Modal.toast('验证码发送成功!');
                                            _this.innerCom.msgBtn.disabled = true;
                                            _this.setMsgBtnTtile(60);
                                            // 点击获取短信验证码，获取成功设置isGetMsgCode
                                            _this.isGetMsgCode = true;
                                        });
                                    }
                                }
                                else {
                                    Modal_1.Modal.alert('请输入合法的手机号');
                                }
                            }
                        } })),
                h("div", { className: "input-wrapper group" },
                    h(text_1.TextInput, { "c-var": "msgCode", placeholder: "\u8BF7\u8F93\u5165\u77ED\u4FE1\u9A8C\u8BC1\u7801" })),
                h("div", { className: "input-wrapper group" },
                    h(text_1.TextInput, { "c-var": "password", type: "password", placeholder: para.loginTitle })),
                h(Button_1.Button, { className: "log-btn submit sys-btn", content: "\u63D0\u4EA4", onClick: function () {
                        var phoneNumber = _this.innerCom.phone.get().replace(/\s/g, ''), msgCode = _this.innerCom.msgCode.get().replace(/\s/g, ''), loginPsw = _this.innerCom.password.get().replace(/\s/g, '');
                        if (!_this.isGetMsgCode) {
                            Modal_1.Modal.alert('请先获取短信验证码!');
                            return;
                        }
                        if (tools.isEmpty(phoneNumber)) {
                            Modal_1.Modal.alert('手机号不能为空!');
                            return;
                        }
                        if (!tools.valid.isTel(phoneNumber)) {
                            Modal_1.Modal.alert('请输入合法的手机号');
                            return;
                        }
                        if (tools.isEmpty(msgCode)) {
                            Modal_1.Modal.alert('短信验证码不能为空!');
                            return;
                        }
                        if (tools.isEmpty(loginPsw)) {
                            Modal_1.Modal.alert('登录密码不能为空!');
                            return;
                        }
                        var url = para.isRegist === true ? LE.CONF.ajaxUrl.mjregister : LE.CONF.ajaxUrl.resetpwd;
                        var postPara = {};
                        if (para.isRegist) {
                            postPara = {
                                mobile_id: phoneNumber,
                                check_mode: msgCode
                            };
                        }
                        else {
                            postPara = {
                                mobile_id: phoneNumber,
                                check_mode: msgCode,
                                password: loginPsw
                            };
                        }
                        LeRule_1.LeRule.Ajax.fetch(url, {
                            type: 'POST',
                            data: [postPara]
                        }).then(function (_a) {
                            var response = _a.response;
                            if (para.isRegist) {
                                _this.submitHandler({ password: loginPsw });
                            }
                            else {
                                _this.submitHandler({
                                    userid: response.data.userid,
                                    password: loginPsw,
                                    mobile_id: response.data.mobile_id,
                                    identity_id: tools.isEmpty(response.data.identity_id) ? '' : response.data.identity_id
                                });
                            }
                        });
                    } }),
                h("div", { className: "back-login" },
                    h("a", { href: "#/loginReg/login" }, "\u8FD4\u56DE\u767B\u5F55")));
            this.graphCode = this.renderCheckCode(this.canvas);
            return registModule1HTML;
        };
        RegistModule1.prototype.setMsgBtnTtile = function (count) {
            var _this = this;
            count--;
            if (count > 0) {
                this.innerCom.msgBtn.content = count + 's';
                this.timer = setTimeout(function () {
                    _this.setMsgBtnTtile(count);
                }, 1000);
            }
            else {
                this.innerCom.msgBtn.disabled = false;
                this.innerCom.msgBtn.content = '获取短信验证码';
                clearTimeout(this.timer);
            }
        };
        // 生成图形验证码
        RegistModule1.prototype.renderCheckCode = function (c1) {
            function rn(min, max) {
                return parseInt(Math.random() * (max - min) + min);
            }
            //2.新建一个函数产生随机颜色
            function rc(min, max) {
                var r = rn(min, max);
                var g = rn(min, max);
                var b = rn(min, max);
                return "rgb(" + r + "," + g + "," + b + ")";
            }
            var ctx = c1.getContext("2d"), result = '';
            //3.填充背景颜色,颜色要浅一点
            var w = c1.width;
            var h = c1.height;
            ctx.clearRect(0, 0, w, h);
            // ctx.fillStyle = rc(180, 230);
            // ctx.fillRect(0, 0, w, h);
            //4.随机产生字符串
            var pool = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            for (var i = 0; i < 4; i++) {
                var c = pool[rn(0, pool.length)]; //随机的字
                result += c;
                var fs = rn(h / 3 * 2, h); //字体的大小
                var deg = rn(-30, 30); //字体的旋转角度
                ctx.font = fs + 'px Simhei';
                ctx.textBaseline = "top";
                ctx.fillStyle = rc(80, 150);
                ctx.save();
                ctx.translate(20 * i + 15, 15);
                ctx.rotate(deg * Math.PI / 180);
                ctx.fillText(c, -15 + 5, -10);
                ctx.restore();
            }
            //5.随机产生5条干扰线,干扰线的颜色要浅一点
            for (var i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.moveTo(rn(0, w), rn(0, h));
                ctx.lineTo(rn(0, w), rn(0, h));
                ctx.strokeStyle = rc(180, 230);
                ctx.closePath();
                ctx.stroke();
            }
            //6.随机产生40个干扰的小点
            for (var i = 0; i < 40; i++) {
                ctx.beginPath();
                ctx.arc(rn(0, w), rn(0, h), 1, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.fillStyle = rc(150, 200);
                ctx.fill();
            }
            return result;
        };
        RegistModule1.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            clearTimeout(this.timer);
            this.canvas = null;
            this.graphCode = null;
            this.submitHandler = null;
        };
        return RegistModule1;
    }(Component));
    exports.RegistModule1 = RegistModule1;
});

/// <amd-module name="RegistModule2"/>
define("RegistModule2", ["require", "exports", "StudentBind", "TeacherBind", "LeRule", "Button"], function (require, exports, StudentBind_1, TeacherBind_1, LeRule_1, Button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var Component = G.Component;
    var RegistModule2 = /** @class */ (function (_super) {
        __extends(RegistModule2, _super);
        function RegistModule2(para) {
            var _this = _super.call(this, para) || this;
            _this.initEvents = (function () {
                var radioEvent = function (e) {
                    var input = e.target, student = _this.roles.student, teacher = _this.roles.teacher;
                    if (input.value === '教师') {
                        teacher.isShow = true;
                        student.isShow = false;
                        _this.isStudent = false;
                    }
                    else {
                        teacher.isShow = false;
                        student.isShow = true;
                        _this.isStudent = true;
                    }
                };
                return {
                    on: function () {
                        d.on(_this.wrapper, 'change', 'input[type=radio]', radioEvent);
                    },
                    off: function () {
                        d.off(_this.wrapper, 'change', 'input[type=radio]', radioEvent);
                    }
                };
            })();
            _this.loginPwd = para.loginPwd;
            _this.submitHandler = para.submitHandler;
            _this.initEvents.on();
            _this.isStudent = true;
            return _this;
        }
        RegistModule2.prototype.wrapperInit = function (para) {
            var _this = this;
            var registModule2HTML = h("div", { className: "regist-module regist-module2" },
                h("div", { className: "binding" },
                    h("div", { className: "explain" }, "\u8BF7\u7ED1\u5B9A\u60A8\u7684\u8EAB\u4EFD"),
                    h("div", { className: "radio-group" },
                        h("div", { className: "radio-wrapper" },
                            h("input", { type: "radio", className: "radio-normal", value: "\u5B66\u751F", checked: true, name: "identity", id: "student" }),
                            h("label", { htmlFor: "student" }, "\u5B66\u751F")),
                        h("div", { className: "radio-wrapper" },
                            h("input", { type: "radio", className: "radio-normal", value: "\u6559\u5E08", name: "identity", id: "teacher" }),
                            h("label", { htmlFor: "teacher" }, "\u6559\u5E08")))),
                h("div", { className: "role-wrapper" }),
                h(Button_1.Button, { className: "log-btn submit sys-btn", content: "\u63D0\u4EA4", onClick: function () {
                        var radioInputchecked = d.query('input[type=radio]:checked', _this.wrapper), formValue = {}, roles = _this.roles;
                        if (radioInputchecked.value === '教师') {
                            formValue = roles.teacher.get();
                        }
                        else {
                            formValue = roles.student.get();
                        }
                        if (tools.isNotEmpty(formValue)) {
                            // 提交
                            var para_1 = Object.assign({ password: _this.loginPwd }, formValue), url = LE.CONF.ajaxUrl.binding + '?' + (_this.isStudent ? 'type=student' : 'type=teacher');
                            LeRule_1.LeRule.Ajax.fetch(url, {
                                type: 'POST',
                                data: [para_1]
                            }).then(function (_a) {
                                var response = _a.response;
                                var obj = {};
                                if (_this.isStudent) {
                                    obj = {
                                        userid: response.data.userid,
                                        password: response.data.password,
                                        mobile_id: response.data.mobile_id,
                                        identity_id: response.data.identity_id
                                    };
                                }
                                else {
                                    obj = {
                                        userid: response.data.userid,
                                        password: response.data.password,
                                        mobile_id: response.data.mobile_id
                                    };
                                }
                                _this.submitHandler(obj);
                            });
                        }
                    } }));
            var roleWrapper = d.query('.role-wrapper', registModule2HTML), student = new StudentBind_1.StudentBind({
                container: roleWrapper
            }), teacher = new TeacherBind_1.TeacherBind({
                container: roleWrapper
            });
            this.roles = {
                student: student, teacher: teacher
            };
            return registModule2HTML;
        };
        RegistModule2.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.initEvents.off();
        };
        return RegistModule2;
    }(Component));
    exports.RegistModule2 = RegistModule2;
});

/// <amd-module name="RegistModule3"/>
define("RegistModule3", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var tools = G.tools;
    var RegistModule3 = /** @class */ (function (_super) {
        __extends(RegistModule3, _super);
        function RegistModule3(para) {
            return _super.call(this, para) || this;
        }
        RegistModule3.prototype.wrapperInit = function (para) {
            return h("div", { className: "regist-module regist-module3" },
                h("p", null,
                    para.title,
                    ":"),
                h("p", { className: "login-info" },
                    " ",
                    h("span", { className: "key" }, "\u60A8\u7684\u767B\u5F55\u8D26\u53F7\u00A0:\u00A0"),
                    h("span", null, para.userInfo.userid)),
                h("p", { className: "login-info" },
                    " ",
                    h("span", { className: "key" }, "\u60A8\u7684\u767B\u5F55\u5BC6\u7801\u00A0:\u00A0"),
                    h("span", null, para.userInfo.password)),
                h("p", { className: "login-info" },
                    " ",
                    h("span", { className: "key" }, "\u60A8\u7684\u624B\u673A\u53F7\u7801\u00A0:\u00A0"),
                    h("span", null, para.userInfo.mobile_id)),
                tools.isNotEmpty(para.userInfo.identity_id) ? h("p", { className: "login-info" },
                    " ",
                    h("span", { className: "key" }, "\u60A8\u7684\u8EAB\u4EFD\u8BC1\u53F7\u00A0:\u00A0"),
                    h("span", null, para.userInfo.identity_id)) : '',
                h("p", { className: "explain" }, para.explain),
                h("a", { href: "#/loginReg/login", className: "back-login" }, "\u8FD4\u56DE\u767B\u5F55"));
        };
        return RegistModule3;
    }(Component));
    exports.RegistModule3 = RegistModule3;
});

define("RegistPage", ["require", "exports", "RegistModule1", "RegistModule2", "RegistModule3"], function (require, exports, RegistModule1_1, RegistModule2_1, RegistModule3_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="RegistPage"/>
    var SPAPage = G.SPAPage;
    var d = G.d;
    var RegistPage = /** @class */ (function (_super) {
        __extends(RegistPage, _super);
        function RegistPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(RegistPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (t) {
                this._title = t;
            },
            enumerable: true,
            configurable: true
        });
        RegistPage.prototype.wrapperInit = function () {
            var registHTML = h("div", { className: "login-page-common regist-page" },
                h("div", { className: "college-name" }, "\u95FD\u6C5F\u5B66\u9662"),
                h("div", { className: "lesson2-title" },
                    h("p", { className: "lang-ch" }, "\u7B2C\u4E8C\u8BFE\u5802\u540E\u53F0\u7BA1\u7406\u7CFB\u7EDF"),
                    h("p", { className: "lang-en" }, "Background management system")),
                h("div", { className: "login-form-common regist-wrapper" }));
            var registWrapper = d.query('.regist-wrapper', registHTML);
            new RegistModule1_1.RegistModule1({
                container: registWrapper,
                loginTitle: '请输入登录密码',
                isRegist: true,
                submitHandler: function (loginPwd) {
                    registWrapper.innerHTML = '';
                    new RegistModule2_1.RegistModule2({
                        container: registWrapper,
                        loginPwd: loginPwd.password,
                        submitHandler: function (data) {
                            registWrapper.innerHTML = '';
                            new RegistModule3_1.RegistModule3({
                                container: registWrapper,
                                title: '恭喜您完成注册及身份验证',
                                explain: '您可以使用账号、手机号、身份证号加密码的方式登录系统。\n' +
                                    '请登录系统于个人中心模块核对或补充您的个人资料。\n' +
                                    '若您是学生，请及时完成微信端的绑定及人像采集。',
                                userInfo: data
                            });
                        }
                    });
                }
            });
            return registHTML;
        };
        RegistPage.prototype.init = function (para, data) {
        };
        return RegistPage;
    }(SPAPage));
    exports.RegistPage = RegistPage;
});

/// <amd-module name="StudentBind"/>
define("StudentBind", ["require", "exports", "Modal", "TextInput"], function (require, exports, Modal_1, text_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var Component = G.Component;
    var StudentBind = /** @class */ (function (_super) {
        __extends(StudentBind, _super);
        function StudentBind(para) {
            return _super.call(this, para) || this;
        }
        StudentBind.prototype.wrapperInit = function (para) {
            return h("div", { className: "student-bind" },
                h("div", { className: "input-wrapper group" },
                    h(text_1.TextInput, { "c-var": "studentNumber", placeholder: "\u8BF7\u8F93\u5165\u60A8\u7684\u5B66\u53F7" })),
                h("div", { className: "input-wrapper group" },
                    h(text_1.TextInput, { "c-var": "yourName", placeholder: "\u8BF7\u8F93\u5165\u60A8\u7684\u59D3\u540D" })),
                h("div", { className: "input-wrapper group" },
                    h(text_1.TextInput, { "c-var": "idCardNum", placeholder: "\u8BF7\u8F93\u5165\u60A8\u7684\u8EAB\u4EFD\u8BC1\u53F7" })));
        };
        Object.defineProperty(StudentBind.prototype, "isShow", {
            get: function () {
                return this._isShow;
            },
            set: function (show) {
                this._isShow = show;
                show ? this.wrapper.classList.remove('hide') : this.wrapper.classList.add('hide');
            },
            enumerable: true,
            configurable: true
        });
        StudentBind.prototype.get = function () {
            var jobNumberValue = this.innerCom.studentNumber.get().replace(/\s/g, ''), nameValue = this.innerCom.yourName.get().replace(/\s/g, ''), idCardNum = this.innerCom.idCardNum.get().replace(/\s/g, '');
            if (tools.isEmpty(jobNumberValue)) {
                Modal_1.Modal.alert('学号不能为空!');
                return null;
            }
            if (tools.isEmpty(nameValue)) {
                Modal_1.Modal.alert('姓名不能为空!');
                return null;
            }
            if (tools.isEmpty(idCardNum)) {
                Modal_1.Modal.alert('身份证号不能为空!');
                return null;
            }
            var obj = {
                user_name: nameValue,
                student_id: jobNumberValue,
                identity_id: idCardNum
            };
            return obj;
        };
        return StudentBind;
    }(Component));
    exports.StudentBind = StudentBind;
});

/// <amd-module name="TeacherBind"/>
define("TeacherBind", ["require", "exports", "Modal", "TextInput"], function (require, exports, Modal_1, text_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var Component = G.Component;
    var TeacherBind = /** @class */ (function (_super) {
        __extends(TeacherBind, _super);
        function TeacherBind(para) {
            var _this = _super.call(this, para) || this;
            _this.isShow = false;
            return _this;
        }
        TeacherBind.prototype.wrapperInit = function (para) {
            return h("div", { className: "teacher-bind" },
                h("div", { className: "input-wrapper group" },
                    h(text_1.TextInput, { "c-var": "jobNumber", placeholder: "\u8BF7\u8F93\u5165\u60A8\u7684\u5DE5\u53F7" })),
                h("div", { className: "input-wrapper group" },
                    h(text_1.TextInput, { "c-var": "yourName", placeholder: "\u8BF7\u8F93\u5165\u60A8\u7684\u59D3\u540D" })));
        };
        Object.defineProperty(TeacherBind.prototype, "isShow", {
            get: function () {
                return this._isShow;
            },
            set: function (show) {
                this._isShow = show;
                show ? this.wrapper.classList.remove('hide') : this.wrapper.classList.add('hide');
            },
            enumerable: true,
            configurable: true
        });
        TeacherBind.prototype.get = function () {
            var jobNumberValue = this.innerCom.jobNumber.get().replace(/\s/g, ''), nameValue = this.innerCom.yourName.get().replace(/\s/g, '');
            if (tools.isEmpty(jobNumberValue)) {
                Modal_1.Modal.alert('工号不能为空!');
                return null;
            }
            if (tools.isEmpty(nameValue)) {
                Modal_1.Modal.alert('姓名不能为空!');
                return null;
            }
            var obj = {
                user_name: nameValue,
                job_id: jobNumberValue
            };
            return obj;
        };
        return TeacherBind;
    }(Component));
    exports.TeacherBind = TeacherBind;
});

define("LoginPage", ["require", "exports", "Modal", "CheckBox", "LeRule", "Loading", "Button"], function (require, exports, Modal_1, checkBox_1, LeRule_1, loading_1, Button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="LoginPage"/>
    var SPAPage = G.SPAPage;
    var d = G.d;
    var tools = G.tools;
    var SPA = G.SPA;
    var LoginPage = /** @class */ (function (_super) {
        __extends(LoginPage, _super);
        function LoginPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(LoginPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (t) {
                this._title = t;
            },
            enumerable: true,
            configurable: true
        });
        LoginPage.prototype.wrapperInit = function () {
            var _this = this;
            var loginBtn;
            var userid = localStorage.getItem('userid'), password = localStorage.getItem('password');
            var loginHTML = h("div", { className: "login-page-common login-page" },
                h("div", { className: "college-name" }, "\u95FD\u6C5F\u5B66\u9662"),
                h("div", { className: "lesson2-title" },
                    h("p", { className: "lang-ch" }, "\u7B2C\u4E8C\u8BFE\u5802\u540E\u53F0\u7BA1\u7406\u7CFB\u7EDF"),
                    h("p", { className: "lang-en" }, "Background management system")),
                h("div", { className: "login-form-common login-form" },
                    h("div", { className: "input-wrapper group" },
                        h("input", { type: "text", name: "account", id: "account", value: userid, placeholder: "\u8D26\u53F7/\u624B\u673A\u53F7/\u8EAB\u4EFD\u8BC1\u53F7" })),
                    h("div", { className: "input-wrapper group" },
                        h("input", { type: "password", name: "password", id: "password", value: password, placeholder: "\u8BF7\u8F93\u5165\u767B\u5F55\u5BC6\u7801" })),
                    h("div", { className: "forget-and-regist" },
                        h("div", { className: "remember-pwd" }),
                        h("div", null,
                            h("a", { href: "#/loginReg/regist", className: "regist" }, "\u6CE8\u518C"),
                            " | ",
                            h("a", { href: "#/loginReg/forget", className: "forget-pwd" }, "\u5FD8\u8BB0\u5BC6\u7801"))),
                    loginBtn = h(Button_1.Button, { "c-var": "login", className: "log-btn submit sys-btn", content: "\u767B\u5F55", onClick: function () {
                            var account = d.query('#account', _this.wrapper).value.replace(/\s/g, ''), password = d.query('#password', _this.wrapper).value.replace(/\s/g, '');
                            if (tools.isEmpty(account)) {
                                Modal_1.Modal.alert('登录账号不能为空!');
                                return;
                            }
                            if (tools.isEmpty(password)) {
                                Modal_1.Modal.alert('登录密码不能为空!');
                                return;
                            }
                            loginBtn.disabled = true;
                            var loading = new loading_1.Loading({
                                msg: "登录中..."
                            });
                            // 登录
                            LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.loginPassword, {
                                type: 'post',
                                data: [{
                                        userid: account,
                                        password: password
                                    }]
                            }).then(function (_a) {
                                var response = _a.response;
                                loading.destroy();
                                loginBtn.disabled = false;
                                if (_this.rememberPwd.get() === true) {
                                    localStorage.setItem('userid', account);
                                    localStorage.setItem('password', password);
                                }
                                localStorage.setItem('loginData', JSON.stringify(response.data));
                                SPA.open(SPA.hashCreate('lesson2', 'home'));
                            }).catch(function () {
                                loading.destroy();
                                loginBtn.disabled = false;
                            });
                        } }),
                    h(Button_1.Button, { className: "log-btn reset", content: "\u91CD\u7F6E", onClick: function () {
                            var accountInput = d.query('#account', _this.wrapper), pwdInput = d.query('#password', _this.wrapper);
                            accountInput.value = '';
                            pwdInput.value = '';
                        } })));
            this.rememberPwd = new checkBox_1.CheckBox({
                container: d.query('.remember-pwd', loginHTML),
                text: '记住密码'
            });
            tools.isNotEmpty(password) && (this.rememberPwd.checked = true);
            return loginHTML;
        };
        LoginPage.prototype.init = function (para, data) {
            // setTimeout(() => {
            //     this.loginEvents.on();
            // }, 50);
        };
        // private loginEvents = (() => {
        //
        //     // 忘记密码
        //     let forgetPwdHandler = () => {
        //
        //     };
        //     let inputFocusHandler = (e) => {
        //         let inputWrapper = d.closest(e.target, '.input-wrapper');
        //         inputWrapper.classList.add('active');
        //     };
        //     let inputBlurHandler = (e) => {
        //         let inputWrapper = d.closest(e.target, '.input-wrapper');
        //         inputWrapper.classList.remove('active');
        //     };
        //     return {
        //         on: () => {
        //             d.on(this.wrapper, 'click', '.orget-pwd', forgetPwdHandler);
        //             d.on(this.wrapper, 'focus', '.input-wrapper>input', inputFocusHandler);
        //             d.on(this.wrapper, 'blur', '.input-wrapper>input', inputBlurHandler);
        //         },
        //         off: () => {
        //             d.off(this.wrapper, 'click', '.orget-pwd', forgetPwdHandler);
        //             d.off(this.wrapper, 'focus', '.input-wrapper>input', inputFocusHandler);
        //             d.off(this.wrapper, 'blur', '.input-wrapper>input', inputBlurHandler);
        //         }
        //     }
        // })();
        LoginPage.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            // this.loginEvents.off();
        };
        return LoginPage;
    }(SPAPage));
    exports.LoginPage = LoginPage;
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
