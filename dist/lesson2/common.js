var LE;
(function (LE) {
    LE.CONF = {
        appid: 'dekt',
        version: 'null',
        siteUrl: 'http://sc.fastlion.cn/dekt',
        siteAppVerUrl: '',
        webscoketUrl: '',
        ajaxUrl: {
            fileUpload: "rest/attachment/upload/file",
            fileDownload: 'rest/attachment/download/file',
            imgDownload: 'rest/attachment/download/picture',
            excelUpload: 'rest/excel/upload',
            logout: "logout/password",
            loginPassword: "login/password",
            loginCode: 'login/message',
            register: "commonsvc/register",
            menu: "ui/menu?output=json",
            activeConfig: 'config/scdata-5',
            integrityNorm: 'config/scdata-6',
            faceRecognition: 'config/scdata-7',
            autoReview: 'config/scdata-8',
            activeConfigSave: 'saveconfig/scdata-5',
            integrityNormSave: 'saveconfig/scdata-6',
            faceRecognitionSave: 'saveconfig/scdata-7',
            autoReviewSave: 'saveconfig/scdata-8',
            feedBack: 'config/scdata-15',
            personCenter: 'config/scdata-9',
            personCenterSave: 'saveconfig/scdata-9',
            jobTitle: 'title/jobtitle',
            home: 'dektpc/homepage',
            activityTime: 'dektpc/delener',
            earlyWarning: 'earlywarning',
            schoolReport: 'dektpc/schoolreport',
            reportModal: 'dektpc/reportmodel',
            smsCode: 'smscode',
            mjregister: 'mjregister',
            binding: 'binding',
            resetpwd: 'resetpwd',
            feedBackSelect: 'lookup/node-scdata-15/look-scdata-15',
            feedBackQuery: 'config/scdata-15',
            delener: 'commonsvc/delener',
            noticeList: 'config/scdata-16',
            noticeDetail: 'config/scdata-17',
            privilege: 'jurisdiction',
            privilegeSave: 'savepermissions',
            mapSave: 'action/node_scdata-1013/action-scdata-1013',
            mapAdd: 'action/node_scdata-1013/action-scdata-1013-1',
            activityLevel: 'lookup/node_scdata-1017/look-scdata-1017',
            getExcelData: 'rest/excel/getData?temp_name=importStu',
            qrCodeTime: 'lookup/node_scdata-1017/look-code-scdata-1017',
            downloadTem: 'rest/excel/downloadExcel?temp_name=importStu',
            colleges: 'qryvalue/node_object/sub_college_id',
            major: 'qryvalue/node_object/major_id',
            clbum: 'qryvalue/node_object/class_id',
            grade: 'lookup/node_scdata-1017/look-grade-scdata-1017',
            activityType: 'pick/node_scdata-1017/pick-scdata-2',
            addStudent: 'ui/select/node_scdata-student-1?output=json',
            addTeacher: 'ui/select/node_scdata-teacher-1?output=json',
            lookIntegral: 'dektpc/activeintegral?item_id=scdata-1017-1',
            selectPosition: 'dektpc/activeintegral?item_id=scdata-1017-2',
            activityAttribution: 'lookup/node_scdata-1017/look-attribution-scdata-1017',
            activityDetail: 'spacialhandle/scdata-1017-apply',
            gradeList: 'dektpc/qryreport',
        },
        init: function () {
            this.siteAppVerUrl = this.siteUrl + "/" + this.appid + "/" + this.version;
            for (var key in this.ajaxUrl) {
                var url = this.ajaxUrl[key], prefix = url.indexOf('rest/') === 0 ? this.siteUrl : this.siteAppVerUrl;
                this.ajaxUrl[key] = prefix + '/' + url;
            }
        }
    };
    LE.CONF.init();
})(LE || (LE = {}));

define("LessonApp", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="LessonApp"/>
    var SPA = G.SPA;
    function pageLoad(moduleName, constructorName) {
        if (constructorName === void 0) { constructorName = moduleName; }
        return new Promise(function (resolve, reject) {
            var timer = setTimeout(function () {
                reject('页面加载超时, 请重试');
            }, 7000);
            require([moduleName], function (m) {
                clearTimeout(timer);
                resolve(m[constructorName]);
            });
        });
    }
    var lessonRouter = {
        main: function () { return pageLoad('MainPage'); },
        common: function () { return pageLoad('LeCommonPage'); },
        home: function () { return pageLoad('HomePage'); },
        distributionOfTime: function () { return pageLoad('DestributionOfTimePage'); },
        reportActivity: function () { return pageLoad('ReportActivityPage'); },
        configParam: function () { return pageLoad('ConfigParamPage'); },
        personCenter: function () { return pageLoad('PersonCenter'); },
        feedBack: function () { return pageLoad('FeedBack'); },
        ActivityDetailModule: function () { return pageLoad('ActivityDetailModule', 'ActivityDetailPage'); },
        NoticePage: function () { return pageLoad('NoticePage'); },
        privilege: function () { return pageLoad('Privilege', 'PrivilegeModal'); },
        reportCard: function () { return pageLoad('ReportCardModal', 'StuReport'); },
        modalCard: function () { return pageLoad('ReportCardModal', 'StuModal'); },
        warningCard: function () { return pageLoad('ReportCardModal', 'SutWarning'); },
        mapModalAdd: function () { return pageLoad('MapDimension', 'MapModalAdd'); },
        mapModalModify: function () { return pageLoad('MapDimension', 'MapModalModify'); },
        activeConfig: function () { return pageLoad('ActiveConfig'); },
        integrityNorm: function () { return pageLoad('IntegrityNorm'); },
        faceRecognition: function () { return pageLoad('FaceRecognition'); },
        autoReview: function () { return pageLoad('AutoReview'); },
    };
    function init() {
        SPA.init([
            {
                name: 'loginReg',
                container: 'body',
                max: 1,
                router: {
                    login: function () { return pageLoad('LoginPage'); },
                    regist: function () { return pageLoad('RegistPage'); },
                    forget: function () { return pageLoad('ForgetPwdPage'); } // 忘记密码
                },
                defaultRouter: {
                    login: null,
                }
            },
            {
                name: 'lesson2',
                container: '#lesson-body',
                router: lessonRouter,
                main: {
                    router: ['main', {}],
                    container: document.body,
                },
                defaultRouter: {
                    home: null
                }
                // index0: routerName, index1: router's para
            }
        ]);
    }
    exports.init = init;
});

define("Utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="Utils"/>
    var tools = G.tools;
    var Utils = /** @class */ (function () {
        function Utils() {
        }
        Utils.getDropDownList = function (data, index) {
            if (index === void 0) { index = 0; }
            var list = [];
            tools.isNotEmptyArray(data) && data.forEach(function (arr) {
                list.push(arr[index].toString());
            });
            return list;
        };
        Utils.getDropDownList_Obj = function (data) {
            var list = [];
            tools.isNotEmptyArray(data) && data.forEach(function (arr) {
                list.push({
                    text: arr[1],
                    value: arr[0]
                });
            });
            return list;
        };
        Utils.formatTime = function (time) {
            var date = new Date(time * 1000), year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate(), hour = date.getHours(), minute = date.getMinutes();
            var monthStr = month < 10 ? '0' + month : month, daytStr = day < 10 ? '0' + day : day, hourStr = hour < 10 ? '0' + hour : hour, minuteStr = minute < 10 ? '0' + minute : minute;
            return year + "-" + monthStr + "-" + daytStr + " " + hourStr + ":" + minuteStr;
        };
        // md5
        Utils.md5 = function (str) {
            var hexcase = 0, b64pad = "", chrsz = 8;
            function hex_md5(s) {
                return binl2hex(core_md5(str2binl(s), s.length * chrsz));
            }
            function b64_md5(s) {
                return binl2b64(core_md5(str2binl(s), s.length * chrsz));
            }
            function str_md5(s) {
                return binl2str(core_md5(str2binl(s), s.length * chrsz));
            }
            function hex_hmac_md5(key, data) {
                return binl2hex(core_hmac_md5(key, data));
            }
            function b64_hmac_md5(key, data) {
                return binl2b64(core_hmac_md5(key, data));
            }
            function str_hmac_md5(key, data) {
                return binl2str(core_hmac_md5(key, data));
            }
            /*
             * Perform a simple self-test to see if the VM is working
             */
            function md5_vm_test() {
                return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
            }
            /*
             * Calculate the MD5 of an array of little-endian words, and a bit length
             */
            function core_md5(x, len) {
                /* append padding */
                x[len >> 5] |= 0x80 << ((len) % 32);
                x[(((len + 64) >>> 9) << 4) + 14] = len;
                var a = 1732584193;
                var b = -271733879;
                var c = -1732584194;
                var d = 271733878;
                for (var i = 0; i < x.length; i += 16) {
                    var olda = a;
                    var oldb = b;
                    var oldc = c;
                    var oldd = d;
                    a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
                    d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
                    c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
                    b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
                    a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
                    d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
                    c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
                    b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
                    a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
                    d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
                    c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
                    b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
                    a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
                    d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
                    c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
                    b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
                    a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
                    d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
                    c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
                    b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
                    a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
                    d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
                    c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
                    b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
                    a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
                    d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
                    c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
                    b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
                    a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
                    d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
                    c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
                    b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
                    a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
                    d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
                    c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
                    b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
                    a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
                    d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
                    c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
                    b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
                    a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
                    d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
                    c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
                    b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
                    a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
                    d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
                    c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
                    b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
                    a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
                    d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
                    c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
                    b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
                    a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
                    d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
                    c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
                    b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
                    a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
                    d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
                    c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
                    b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
                    a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
                    d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
                    c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
                    b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
                    a = safe_add(a, olda);
                    b = safe_add(b, oldb);
                    c = safe_add(c, oldc);
                    d = safe_add(d, oldd);
                }
                return Array(a, b, c, d);
            }
            /*
             * These functions implement the four basic operations the algorithm uses.
             */
            function md5_cmn(q, a, b, x, s, t) {
                return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
            }
            function md5_ff(a, b, c, d, x, s, t) {
                return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
            }
            function md5_gg(a, b, c, d, x, s, t) {
                return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
            }
            function md5_hh(a, b, c, d, x, s, t) {
                return md5_cmn(b ^ c ^ d, a, b, x, s, t);
            }
            function md5_ii(a, b, c, d, x, s, t) {
                return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
            }
            /*
             * Calculate the HMAC-MD5, of a key and some data
             */
            function core_hmac_md5(key, data) {
                var bkey = str2binl(key);
                if (bkey.length > 16)
                    bkey = core_md5(bkey, key.length * chrsz);
                var ipad = Array(16), opad = Array(16);
                for (var i = 0; i < 16; i++) {
                    ipad[i] = bkey[i] ^ 0x36363636;
                    opad[i] = bkey[i] ^ 0x5C5C5C5C;
                }
                var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
                return core_md5(opad.concat(hash), 512 + 128);
            }
            /*
             * Add integers, wrapping at 2^32. This uses 16-bit operations internally
             * to work around bugs in some JS interpreters.
             */
            function safe_add(x, y) {
                var lsw = (x & 0xFFFF) + (y & 0xFFFF);
                var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                return (msw << 16) | (lsw & 0xFFFF);
            }
            /*
             * Bitwise rotate a 32-bit number to the left.
             */
            function bit_rol(num, cnt) {
                return (num << cnt) | (num >>> (32 - cnt));
            }
            /*
             * Convert a string to an array of little-endian words
             * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
             */
            function str2binl(str) {
                var bin = Array();
                var mask = (1 << chrsz) - 1;
                for (var i = 0; i < str.length * chrsz; i += chrsz)
                    bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
                return bin;
            }
            /*
             * Convert an array of little-endian words to a string
             */
            function binl2str(bin) {
                var str = "";
                var mask = (1 << chrsz) - 1;
                for (var i = 0; i < bin.length * 32; i += chrsz)
                    str += String.fromCharCode((bin[i >> 5] >>> (i % 32)) & mask);
                return str;
            }
            /*
             * Convert an array of little-endian words to a hex string.
             */
            function binl2hex(binarray) {
                var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
                var str = "";
                for (var i = 0; i < binarray.length * 4; i++) {
                    str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
                        hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
                }
                return str;
            }
            /*
             * Convert an array of little-endian words to a base-64 string
             */
            function binl2b64(binarray) {
                var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                var str = "";
                for (var i = 0; i < binarray.length * 4; i += 3) {
                    var triplet = (((binarray[i >> 2] >> 8 * (i % 4)) & 0xFF) << 16)
                        | (((binarray[i + 1 >> 2] >> 8 * ((i + 1) % 4)) & 0xFF) << 8)
                        | ((binarray[i + 2 >> 2] >> 8 * ((i + 2) % 4)) & 0xFF);
                    for (var j = 0; j < 4; j++) {
                        if (i * 8 + j * 6 > binarray.length * 32)
                            str += b64pad;
                        else
                            str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
                    }
                }
                return str;
            }
            return hex_md5(str);
        };
        return Utils;
    }());
    exports.Utils = Utils;
});

/// <amd-module name="FormFactory"/>
define("FormFactory", ["require", "exports", "SelectInput", "Datetime", "NumInput", "TextInput", "BasicBoxGroup", "CheckBox", "RadioBox", "LeRule", "ReportUploadModule", "LeUploadModule", "LePickModule", "TextInput1", "LeEditQrCode"], function (require, exports, selectInput_1, datetime_1, numInput_1, text_1, selectBoxGroup_1, checkBox_1, radioBox_1, LeRule_1, ReportUploadModule_1, UploadModule_1, LePickModule_1, TextInput_1, LeEditQrCode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    var FormFactory = /** @class */ (function (_super) {
        __extends(FormFactory, _super);
        function FormFactory(para) {
            var _this = 
            // console.log(para);
            _super.call(this, para) || this;
            _this.isWrapLine = tools.isEmpty(para.isWrapLine) ? true : para.isWrapLine;
            _this.fields = para.fields;
            // console.log(para.fields);
            _this.defaultData = para.defaultData || {};
            _this.isTitle = para.isTitle || false;
            _this.__initForms(para);
            return _this;
        }
        // 初始化FormCom控件
        FormFactory.prototype.__initForms = function (para) {
            var _this = this;
            var cond = para.cond || [];
            this.forms = [];
            tools.isNotEmpty(this.wrapper) && d.append(this.wrapper, h("div", { className: "form-com-wrapper" }, cond.map(function (c) {
                var com, isMulti = c.multi || false, props = Object.assign({
                    custom: c,
                    showFlag: true,
                    placeholder: _this.isTitle ? '' : c.caption,
                }, _this.selectParaInit(c, para) || {}), isBlock = false, fieldName = c.fieldName, titleField = c.titleField || fieldName;
                switch (c.type) {
                    case 'img':
                        com = h(UploadModule_1.ImgUploader, __assign({ remark: "\u652F\u6301\u56FE\u7247\u5C0F\u4E8E1M", isMulti: isMulti, field: fieldName, nameField: fieldName, size: 4 * 1024 * 1024 }, props));
                        break;
                    case 'file':
                        com = h(ReportUploadModule_1.ReportUploadModule, __assign({ isShowImg: false, content: "\u9009\u62E9\u6587\u4EF6", title: "\u56FE\u7247", field: fieldName, nameField: fieldName, remarkClassName: "" }, props));
                        break;
                    case 'richText':
                        break;
                    case 'selectText':
                        com = h(selectInput_1.SelectInput, __assign({ multi: isMulti, clickType: 0, readonly: true, data: tools.isEmpty(c.data) ? [] : c.data.map(function (res) {
                                var data = FormFactory.formatData(res);
                                return { text: data.title, value: data.value };
                            }), ajax: tools.isEmpty(c.link) ? void 0 : {
                                fun: function (url, val, callback) {
                                    _this.ajaxData(c.link, titleField, c.relateFields).then(function (data) {
                                        typeof callback === 'function' && callback(data.sort());
                                    });
                                }
                            } }, props));
                        break;
                    case 'date':
                        com = h(datetime_1.Datetime, __assign({ format: "yyyy-MM-dd" }, props));
                        break;
                    case 'datetime':
                        com = h(datetime_1.Datetime, __assign({ format: "yyyy-MM-dd HH:mm:ss" }, props));
                        break;
                    case 'tag':
                        var BoxGroup = isMulti ? selectBoxGroup_1.CheckBoxGroup : selectBoxGroup_1.RadioBoxGroup, Box_1 = isMulti ? checkBox_1.CheckBox : radioBox_1.RadioBox;
                        com = h(BoxGroup, __assign({ size: "middle", type: "button" }, props), tools.isEmpty(c.data) ? [] : tools.toArray(c.data).map(function (res) {
                            var data = FormFactory.formatData(res);
                            return h(Box_1, { value: data.value, text: data.title });
                        }));
                        _this.ajaxData(c.link, titleField, c.relateFields).then(function (response) {
                        });
                        isBlock = true;
                        break;
                    case 'selectBox':
                        {
                            var BoxGroup_1 = isMulti ? selectBoxGroup_1.CheckBoxGroup : selectBoxGroup_1.RadioBoxGroup, Box_2 = isMulti ? checkBox_1.CheckBox : radioBox_1.RadioBox;
                            com = h(BoxGroup_1, __assign({ size: "middle" }, props), tools.isEmpty(c.data) ? [] : tools.toArray(c.data).map(function (res) {
                                var data = FormFactory.formatData(res);
                                return h(Box_2, { name: data.value, text: data.title });
                            }));
                            _this.ajaxData(c.link, titleField, c.relateFields).then(function (response) {
                            });
                        }
                        break;
                    case 'textarea':
                        com = h(TextInput_1.TextAreaInput, __assign({}, props));
                        break;
                    case 'pick':
                        com = h(LePickModule_1.LePickModule, __assign({ ui: props.ui, fields: para.fields }, props));
                        break;
                    case 'number':
                        com = h(numInput_1.NumInput, __assign({ defaultNum: 0 }, props));
                        break;
                    case 'qrcode':
                        com = h(LeEditQrCode_1.LeEditQrCode, __assign({}, props));
                        break;
                    case 'text':
                    default:
                        com = h(text_1.TextInput, __assign({}, props));
                }
                if (fieldName in _this.defaultData) {
                    tools.isNotEmpty(_this.defaultData[fieldName])
                        && com.set(_this.defaultData[fieldName]);
                }
                _this.forms.push(com);
                return props.showFlag ? h("div", { style: ((isBlock || _this.isWrapLine) ? '' : 'display: inline-block'), className: "form-com-item " },
                    _this.isTitle ? h("div", { className: "form-com-title" }, c.caption + '：') : null,
                    com,
                    tools.isNotEmpty(c.tip) ? h("div", { className: "form-com-tip" }, c.tip) : null) : com.wrapper && d.remove(com.wrapper);
            })));
        };
        FormFactory.prototype.ajaxData = function (link, fieldName, relateName) {
            var _this = this;
            if (relateName === void 0) { relateName = fieldName; }
            return new Promise(function (resolve, reject) {
                if (tools.isEmpty(link)) {
                    reject();
                }
                else {
                    var request = {};
                    for (var _i = 0, _a = _this.forms; _i < _a.length; _i++) {
                        var com = _a[_i];
                        var fieldName_1 = com.custom.fieldName;
                        request[fieldName_1] = com.get();
                    }
                    LeRule_1.LeRule.linkReq(link, request).then(function (_a) {
                        var response = _a.response;
                        console.log(response);
                        var body = response.data, dataList = body ? body.data : [], result = [];
                        dataList.forEach(function (item) {
                            var json = {};
                            for (var key in item) {
                                json[key] = item[key];
                                if (key === fieldName) {
                                    json.text = item[key];
                                }
                                if (key === relateName) {
                                    json.value = item[key];
                                }
                            }
                            result.push(json);
                        });
                        resolve(result);
                    });
                }
            });
        };
        FormFactory.formatData = function (data) {
            if (data === void 0) {
                return undefined;
            }
            return {
                title: typeof data === 'string' ? data : data.title,
                value: typeof data === 'string' ? data : data.value,
            };
        };
        FormFactory.prototype.destroy = function () {
            this.forms && this.forms.forEach(function (form) {
                form.destroy();
            });
            this.forms = null;
            _super.prototype.destroy.call(this);
        };
        return FormFactory;
    }(Component));
    exports.FormFactory = FormFactory;
});

define("LeRule", ["require", "exports", "Modal", "Loading"], function (require, exports, Modal_1, loading_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var Ajax = G.Ajax;
    var Rule = G.Rule;
    var CONF = LE.CONF;
    var SPA = G.SPA;
    var LeRule = /** @class */ (function (_super) {
        __extends(LeRule, _super);
        function LeRule() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        LeRule.isTime = function (dataType) {
            return dataType === LeRule.DT_DATETIME || dataType === LeRule.DT_TIME;
        };
        LeRule.isImage = function (dataType) {
            return dataType === LeRule.DT_MUL_IMAGE || dataType === LeRule.DT_IMAGE;
        };
        LeRule.linkParse2Url = function (link, dataObj) {
            var _a = LeRule.linkParse(link, dataObj), addr = _a.addr, data = _a.data;
            return CONF.siteUrl + tools.url.addObj(addr, data);
        };
        LeRule.linkParse = function (link, dataObj) {
            var varData = Rule.varList(link.varList, dataObj, true), urlPara = {};
            if (link.varType === 2) {
                if (!Array.isArray(varData)) {
                    varData = [varData];
                }
                varData.forEach(function (d) {
                    for (var key in d) {
                        if (!urlPara[key]) {
                            urlPara[key] = [];
                        }
                        urlPara[key].push(d[key]);
                    }
                });
                if (!tools.isEmpty(link.varList) && !link.varList[1]) {
                    // 长度等于1
                    var varName = link.varList[0].varName.toLowerCase();
                    urlPara['selection'] = tools.str.toEmpty(urlPara[varName]);
                    delete urlPara[varName];
                }
                for (var key in urlPara) {
                    var para = urlPara[key];
                    if (Array.isArray(para)) {
                        urlPara[key.toLocaleLowerCase()] = para.join(',');
                    }
                }
            }
            var returnData = {
                addr: link.dataAddr,
                data: link.varType === 2 ? urlPara : varData
            };
            if (link.varType === 3 && returnData.data && !Array.isArray(returnData.data)) {
                returnData.data = [returnData.data];
            }
            return returnData;
        };
        LeRule.linkOpen = function (link, dataObj) {
            if (['popup', 'newwin'].includes(link.openType)) {
                var _a = LeRule.linkParse(link, dataObj), addr = _a.addr, data = _a.data, isCustom = link.dataAddr.indexOf('/') === -1, inModal = link.openType === 'popup', para = {
                    inModal: inModal,
                    _noHide: inModal,
                    url: !isCustom ? tools.url.addObj(addr, data) : null,
                    ajaxData: JSON.stringify(isCustom ? data : null)
                };
                if (isCustom) { // 通用界面
                    SPA.open(['lesson2', addr, para], null, inModal);
                }
                else { // 自定义
                    SPA.open(['lesson2', 'common', para], null, inModal);
                }
            }
        };
        LeRule.linkReq = function (link, dataObj) {
            if (link.openType === 'data' || link.openType === 'none') {
                var _a = LeRule.linkParse(link, dataObj), addr = _a.addr, data = _a.data;
                return LeRule.Ajax.fetch(CONF.siteUrl + addr, {
                    data: data,
                    data2url: link.varType !== 3,
                    type: link.requestType
                });
            }
            return Promise.reject('');
        };
        LeRule.getCrossTableData = function (meta, data) {
            if (data === void 0) { data = []; }
            var newData = [];
            data.forEach(function (datas, keyIndex) {
                newData.push({});
                meta.forEach(function (key, dataIndex) {
                    newData[keyIndex][key] = datas[dataIndex];
                });
            });
            return newData;
        };
        ;
        /**
         * 重新生成交叉制表的cols数据
         * @param {Array} metaData 数据数组
         * @param {Array} colData 原始cols数据
         * @return {{cols , lockNum}} 返回新的cols与需要的锁列数
         */
        LeRule.getCrossTableCols = function (metaData, colData) {
            var fields, tmpCol, keys, name2Col = {}, newColData = [], noDotData = [];
            var isSameBol = true;
            isSame(metaData);
            function isSame(meta) {
                var lastName = '';
                function dealMeta(fn) {
                    for (var _i = 0, meta_1 = meta; _i < meta_1.length; _i++) {
                        var name_1 = meta_1[_i];
                        if (name_1.indexOf('.') > -1) {
                            if (fn(name_1)) {
                                break;
                            }
                        }
                    }
                }
                dealMeta(function (name) {
                    var tempNameArr = name.split('.');
                    lastName = tempNameArr[tempNameArr.length - 1];
                    return true;
                });
                dealMeta(function (name) {
                    var tmpName = name.split('.').pop();
                    isSameBol = (tmpName === lastName);
                    lastName = tmpName;
                    if (!isSameBol) {
                        return true;
                    }
                });
            }
            function getColsByName(name) {
                for (var i = 0, l = colData.length; i < l; i++) {
                    if (colData[i].name === name) {
                        return colData[i];
                    }
                }
            }
            keys = metaData.slice(0);
            // console.log(keys);
            colData.forEach(function (col) {
                name2Col[col.name] = col;
            });
            keys.forEach(function (key) {
                fields = key.split('.');
                var fieldLen = fields.length;
                //如果字段中有"."字符，则代表交叉制表，需要替换表格的cols参数
                if (fieldLen > 1) {
                    var lastName = fields.pop();
                    tmpCol = Object.assign({}, name2Col[lastName]);
                    tmpCol.name = key;
                    tmpCol.data = key;
                    if (isSameBol) {
                        tmpCol.title = fields.join('.');
                    }
                    else {
                        tmpCol.title = fields.join('.') + ("." + getColsByName(lastName).title);
                    }
                    newColData.push(tmpCol);
                }
                else {
                    tmpCol = Object.assign({}, name2Col[key]);
                    tmpCol.title = tmpCol.caption;
                    (tmpCol.title) && noDotData.push(tmpCol);
                }
            });
            newColData = noDotData.concat(newColData);
            return {
                cols: newColData,
                lockNum: noDotData.length
            };
        };
        ;
        LeRule.getDefaultByFields = function (cols) {
            var defaultData = {};
            cols.forEach(function (col) {
                var defVal = col.defaultValue;
                if (!tools.isEmpty(defVal)) {
                    defaultData[col.name] = defVal.toString().toLowerCase() === '%date%' ?
                        tools.date.format(new Date(), col.displayFormat) : defVal;
                }
            });
            return defaultData;
        };
        LeRule.getLookUpOpts = function (field) {
            var titleFiled = field.titleField || field.fieldname;
            return LeRule.Ajax.fetch(CONF.siteUrl + LeRule.reqAddr(field.link))
                .then(function (_a) {
                var response = _a.response;
                var data = tools.keysVal(response, 'data', 'data') || [];
                return data.map(function (data) {
                    return {
                        text: data[titleFiled],
                        value: data[field.relateFields]
                    };
                });
            });
        };
        LeRule.fileUrlGet = function (md5, fieldName) {
            if (fieldName === void 0) { fieldName = 'FILE_ID'; }
            var _a;
            return tools.url.addObj(CONF.ajaxUrl.fileDownload, (_a = {
                    md5_field: fieldName
                },
                _a[fieldName] = md5,
                _a.down = 'allow',
                _a));
        };
        LeRule.imgUrlGet = function (md5, fieldName, isThumb) {
            if (fieldName === void 0) { fieldName = 'FILE_ID'; }
            if (isThumb === void 0) { isThumb = false; }
            var _a;
            return tools.url.addObj(CONF.ajaxUrl.imgDownload, (_a = {
                    md5_field: fieldName
                },
                _a[fieldName] = md5,
                _a.down = 'allow',
                _a.imagetype = isThumb ? 'thumbnail' : 'picture',
                _a));
        };
        LeRule.NoShowFields = ['GRIDBACKCOLOR', 'GRIDFORECOLOR'];
        LeRule.EVT_REFRESH = 'refreshData';
        LeRule.Ajax = /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_1.prototype.fetch = function (url, setting) {
                var _this = this;
                if (setting === void 0) { setting = {}; }
                // setting.silent = setting.silent === void 0 ? false
                function alert(msg) {
                    !setting.silent && Modal_1.Modal.alert(msg);
                }
                setting.dataType = setting.dataType || 'json';
                return new Promise(function (resolve, reject) {
                    setting.headers = setting.headers || {};
                    var loading = null;
                    if (setting.loading && setting.loading.msg) {
                        loading = new loading_1.Loading(setting.loading);
                    }
                    _super.prototype.fetch.call(_this, url, setting).then(function (result) {
                        var response = result.response, xhr = result.xhr;
                        if (G.tools.isEmpty(response)) {
                            loading && loading.destroy();
                            loading = null;
                            Modal_1.Modal.alert('后台数据为空');
                            reject(Ajax.errRes(xhr, 'emptyData', ''));
                            return;
                        }
                        if (typeof response === 'object') {
                            var code = response.code, msg = response.msg, data = response.data;
                            var isLogout = code === 50001;
                            if (isLogout) {
                                loading && loading.destroy();
                                loading = null;
                                Modal_1.Modal.confirm({
                                    msg: '登录已超时,是否跳转到登录页',
                                    callback: function (index) {
                                        if (index) {
                                            SPA.open(['loginReg', 'login']);
                                            // BW.sys.window.logout();
                                        }
                                    }
                                });
                                reject(Ajax.errRes(xhr, 'logout', ''));
                                return;
                            }
                            if (code && code !== 0 && !isLogout) {
                                loading && loading.destroy();
                                loading = null;
                                Modal_1.Modal.alert(msg || '后台错误');
                                reject(Ajax.errRes(xhr, 'code', ''));
                                return;
                            }
                            if (!code) {
                                var dataList = [];
                                var meta = [];
                                if (data && data.body && data.body.dataList && data.body.dataList) {
                                    var body = data.body;
                                    dataList = body.dataList;
                                    meta = Array.isArray(body.meta) ? body.meta : [];
                                    data.data = LeRule.getCrossTableData(meta, dataList);
                                }
                                loading && loading.destroy();
                                loading = null;
                                resolve(result);
                            }
                        }
                        else {
                            loading && loading.destroy();
                            loading = null;
                            resolve(result);
                        }
                    }).catch(function (reason) {
                        loading && loading.destroy();
                        loading = null;
                        var xhr = reason.xhr;
                        if (reason.statusText === 'timeout') {
                            Modal_1.Modal.alert('请求超时, 可稍后再试哦~');
                        }
                        else if (xhr.status == 0) {
                            Modal_1.Modal.alert('系统正忙, 可稍后再试哦~');
                        }
                        else {
                            Modal_1.Modal.alert('请求错误,code:' + xhr.status + ',' + xhr.statusText);
                        }
                        reject(reason);
                    });
                });
            };
            class_1.prototype.request = function (url, setting, success, error) {
                var data = setting.data;
                if (tools.isNotEmpty(data) && typeof data === 'object') {
                    // 清理空的数据
                    for (var key in data) {
                        if (tools.isEmpty(data[key])) {
                            delete data[key];
                        }
                    }
                    // 数据添加到url后面
                    if (setting.data2url) {
                        url = tools.url.addObj(url, data);
                        delete setting.data;
                    }
                }
                _super.prototype.request.call(this, url, setting, success, error);
            };
            class_1.fetch = function (url, setting) {
                if (setting === void 0) { setting = {}; }
                return new LeRule.Ajax().fetch(url, setting);
            };
            return class_1;
        }(Ajax));
        return LeRule;
    }(Rule));
    exports.LeRule = LeRule;
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
