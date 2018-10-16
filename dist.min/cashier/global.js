/**
 * js各种公用且与业务无关的工具类方法
 */
var C;
(function (C) {
    var isMb = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    C.tools = {
        toArray: function (any) {
            if (!Array.isArray(any)) {
                return [any];
            }
            else {
                return any;
            }
        },
        /**
         * undefined null '' [] {} 为空
         * @param {*} obj
         * @return {boolean} is_empty
         */
        isEmpty: function (obj) {
            var is_empty = false;
            if (obj === undefined || obj === null || obj === '') {
                is_empty = true;
            }
            else if (Array.isArray(obj) && obj.length === 0) {
                is_empty = true;
            }
            else if (obj.constructor === Object && Object.keys(obj).length === 0) {
                is_empty = true;
            }
            return is_empty;
        },
        isNotEmpty: function (obj) {
            return !C.tools.isEmpty(obj);
        },
        isNotEmptyArray: function (arr) {
            return Array.isArray(arr) && !C.tools.isEmpty(arr);
        },
        isFunction: function (fun) {
            return typeof fun === 'function';
        },
        isUndefined: function (any) {
            return typeof any === 'undefined';
        },
        isPrimitive: function (any) {
            return ['string', 'number', 'boolean'].includes(typeof any);
        },
        // randomColor() {
        //     let colorClass = ['blue', 'green', 'yellow', 'red', 'purple', 'black', 'grey'];
        //     return colorClass[(Math.random() * (colorClass.length - 1)).toFixed(0)];
        // },
        escapeRegExp: function (str) {
            return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        },
        /**
         * 为特定字符串设置为高亮
         * @param {string} str - 整个字符串
         * @param {string} hlstr - 需要设置为高亮的字符串
         * @param {string} color - 高亮颜色
         * @param {boolean} ignoreCase
         * @returns {string}
         */
        highlight: function (str, hlstr, color, ignoreCase) {
            if (ignoreCase === void 0) { ignoreCase = true; }
            if (typeof str === 'string' && hlstr.trim()) {
                var searchPara = new RegExp("(" + C.tools.escapeRegExp(hlstr) + ")", ignoreCase ? 'ig' : 'g');
                return str.replace(searchPara, "<span class=\"" + color + "\">$1</span>");
            }
            else {
                return str;
            }
        },
        /**
         * 直接通过键值组获取数据，没有则返回undefined
         * @param obj
         * @param {(number | string)[]} keys - 键值数组
         * @return {boolean}
         */
        keysVal: function (obj) {
            var keys = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                keys[_i - 1] = arguments[_i];
            }
            var last = obj, keyLen = keys.length;
            for (var i = 0; i < keyLen; i++) {
                var key = keys[i];
                if (typeof last === 'object' && last !== null) {
                    if (key in last) {
                        last = last[key];
                    }
                    else {
                        return undefined;
                    }
                    // 最后
                }
                else {
                    return i === keyLen - 2 ? last : undefined;
                }
            }
            return last;
        },
        copy: function (text) {
            var input = C.d.create('<textarea style="position: absolute;top: -1px;height: 1px;width: 1px;"></textarea>');
            input.value = text;
            C.d.append(document.body, input);
            input.select();
            document.execCommand("Copy");
            // C.Modal.toast('复制成功');
            C.d.remove(input);
        },
        getGuid: (function () {
            var guid = 999;
            return function (prefix) {
                if (prefix === void 0) { prefix = 'guid-'; }
                return "" + prefix + guid++;
            };
        }()),
        isMb: isMb,
        isPc: !isMb,
        val2RGB: function (colorVal) {
            var r = 0, g = 0, b = 0;
            // 显示颜色
            if (typeof colorVal === 'number') {
                r = colorVal % 256;
                g = Math.floor(colorVal / 256) % 256;
                b = Math.floor(colorVal / 256 / 256) % 256;
            }
            return { r: r, g: g, b: b };
        },
        url: {
            /**
             * 获取url中请求参数的值
             * @param {string} name - 参数名
             * @param {string} [url]
             * @returns {*}
             */
            getPara: function (name, url) {
                if (url === void 0) { url = window.location.href; }
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                var r = url.split('?')[1] ? url.split('?')[1].match(reg) : null;
                return r !== null ? decodeURIComponent(r[2]) : null;
            },
            /**
             * url连接object为后面的参数
             * @param {string} url
             * @param {object} obj
             * @param {boolean} [isLowCase=true]
             * @return {string}
             */
            addObj: function (url, obj, isLowCase) {
                if (isLowCase === void 0) { isLowCase = true; }
                for (var key in obj) {
                    if (C.tools.url.getPara(key, url)) {
                        delete obj[key];
                    }
                }
                if (!C.tools.isEmpty(obj)) {
                    return url + (url.indexOf('?') === -1 ? '?' : '&') + C.tools.obj.toUri(obj, isLowCase);
                }
                else {
                    return url;
                }
            }
        },
        str: {
            /**
             * null,undefined,false 转为 ''
             * @param value
             * @param str
             * @return {*|string}
             */
            toEmpty: function (value, str) {
                if (str === void 0) { str = ''; }
                return value || value === 0 ? value : str;
            },
            /**
             * 移除html标签
             * @param s
             * @return {string}
             */
            _htmlTagReg: /(&nbsp;|<([^>]+)>)/ig,
            removeHtmlTags: function (s) {
                if (typeof s === 'string') {
                    return s.replace(C.tools.str._htmlTagReg, '').replace(/\s+/g, ' ');
                }
                else {
                    return s;
                }
                // let div = document.createElement('div');
                // div.innerHTML = s;
                // return div.innerText;
            },
            /**
             * html encode
             * @param html
             * @return {string}
             */
            htmlEncode: function (html) {
                if (html === null || typeof html === 'undefined') {
                    html = '';
                }
                return html.toString().replace(/&/g, '&amp;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\//g, '&#x2F;');
            },
            /**
             * 解析模版 模板中的{{xxx}} 对应 data中的属性名xxx
             * @param tpl
             * @param data
             * @param isEncode
             * @return {string}
             */
            parseTpl: function (tpl, data, isEncode) {
                if (isEncode === void 0) { isEncode = true; }
                var parseReg = /\{\{\S+?}}/g, self = this;
                return tpl.replace(parseReg, function (param) {
                    param = param.slice(2, -2);
                    var _a = param.split(','), key = _a[0], param1 = _a[1], isEn = param1 ? param1 === '1' : isEncode;
                    return C.tools.isEmpty(data[key]) ? '' : (isEn ? self.htmlEncode(data[key]) : data[key]);
                });
            },
            removeEmpty: function (str) {
                var parseReg = /\s{2,}/g;
                if (typeof str === 'string') {
                    return str.replace(parseReg, ' ');
                }
                return str;
            },
            /**
             * 按utf-8编码 截取字符串
             * @param {string} str 字符串
             * @param {int} len 长度
             * @return {string}
             */
            cut: function (str, len) {
                var cutStr = '';
                var realLength = 0;
                if (!C.tools.isEmpty(len)) {
                    var sLen = str.length;
                    for (var i = 0; i < sLen; i++) {
                        if (str.charCodeAt(i) >= 0 && str.charCodeAt(i) <= 128) {
                            realLength += 1;
                        }
                        else {
                            realLength += 2;
                        }
                        if (realLength > len) {
                            continue;
                        }
                        cutStr += str[i];
                    }
                    if (cutStr.length > 0 && realLength > len) {
                        cutStr += '...';
                    }
                }
                else {
                    cutStr = str;
                }
                return cutStr;
            },
            utf8Len: function (str) {
                var sLen = str.length, utf8len = 0;
                for (var i = 0; i < sLen; i++) {
                    if (str.charCodeAt(i) >= 0 && str.charCodeAt(i) <= 128) {
                        utf8len += 1;
                    }
                    else {
                        utf8len += 2;
                    }
                }
                return utf8len;
            },
            toBytes: function (str) {
                var pos = 0;
                var len = str.length;
                if (len % 2 != 0) {
                    return null;
                }
                len /= 2;
                var hexA = [];
                for (var i = 0; i < len; i++) {
                    var s = str.substr(pos, 2);
                    var v = parseInt(s, 16);
                    hexA.push(v);
                    pos += 2;
                }
                return hexA;
            },
            /**
             * 为特定字符串设置为高亮
             * @param {string} str - 整个字符串
             * @param {string} hlstr - 需要设置为高亮的字符串
             * @param {string} hue - 高亮颜色
             * @returns {string}
             */
            setHeightLight: function (str, hlstr, hue) {
                var color = {
                    red: '#dd524d',
                };
                if (Object.prototype.toString.call(str).slice(8, -1) === 'String') {
                    return str.replace(hlstr, "<span style=\"color:" + hue + "\" >" + hlstr + "</span>");
                }
                else {
                    return str;
                }
            }
        },
        obj: {
            /**
             * 原型继承
             * @param Child 子类
             * @param Parent 父类
             * @param {Object} [newProto] 需要重写的prototype
             */
            protoExtend: function (Child, Parent, newProto) {
                newProto = newProto || {};
                var F = function () {
                };
                F.prototype = Parent.prototype;
                Child.prototype = new F();
                //新的proto
                for (var attr in newProto) {
                    if (!newProto.hasOwnProperty(attr)) {
                        continue;
                    }
                    Child.prototype[attr] = newProto[attr];
                }
                Child.prototype.constructor = Child;
            },
            /**
             * 对象转成url参数
             * @param {Object} object
             * @param {boolean} isLowCase
             * @returns {string} urlDataStr
             */
            toUri: function (object, isLowCase) {
                if (isLowCase === void 0) { isLowCase = true; }
                var urlDataStr = '';
                for (var key in object) {
                    if (object.hasOwnProperty(key)) {
                        urlDataStr += "&" + (isLowCase ? key.toLowerCase() : key) + "=" + encodeURIComponent(object[key]);
                    }
                }
                return urlDataStr.slice(1);
            },
            /**
             * object转dom属性
             * @param {Object} object
             * @return {string}
             */
            toAttr: function (object) {
                var attrStr = '';
                for (var key in object) {
                    if (object.hasOwnProperty(key)) {
                        attrStr += (' ' + key + '="' + C.tools.str.htmlEncode(object[key]) + '"');
                    }
                }
                return attrStr;
            },
            /**
             * 浅复制Object
             * @param {object} object
             * @return {object}
             */
            copy: function (object) {
                var key, cp = {};
                for (key in object) {
                    if (object.hasOwnProperty(key)) {
                        cp[key] = object[key];
                    }
                }
                return cp;
            },
            /**
             * 对象合并，第一个参数为true时，则为深度合并
             * @param args
             * @return {{}}
             */
            merge: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                // Variables
                var extended = {};
                var deep = false;
                var i = 0;
                var length = args.length;
                // Check if a deep merge
                if (Object.prototype.toString.call(args[0]) === '[object Boolean]') {
                    deep = args[0];
                    i++;
                }
                // Merge the object into the extended object
                var merge = function (obj) {
                    for (var prop in obj) {
                        if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
                            continue;
                        }
                        // If deep merge and property is an object, merge properties
                        var objStr = Object.prototype.toString.call(obj[prop]);
                        if (deep && (objStr === '[object Object]' || objStr === '[object Array]')) {
                            if (objStr === '[object Object]') {
                                extended[prop] = C.tools.obj.merge(true, extended[prop], obj[prop]);
                            }
                            else {
                                extended[prop] = obj[prop].slice(0);
                            }
                        }
                        else {
                            extended[prop] = obj[prop];
                        }
                    }
                };
                // Loop through each object and conduct a merge
                for (; i < length; i++) {
                    var obj = args[i];
                    merge(obj);
                }
                return extended;
            },
            /**
             * 对象转数组
             * @param {obj} o
             * @return {Array}
             */
            toArr: function (o) {
                var arr = [];
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        arr.push(o[key]);
                    }
                }
                return arr;
            }
        },
        cookie: {
            set: function (name, value, days) {
                var expires = "";
                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                    expires = "; expires=" + date.toUTCString();
                }
                document.cookie = name + "=" + value + expires + "; path=/sf";
            },
            get: function (name) {
                var nameEQ = name + "=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ')
                        c = c.substring(1, c.length);
                    if (c.indexOf(nameEQ) == 0)
                        return c.substring(nameEQ.length, c.length);
                }
                return null;
            },
            clear: function eraseCookie(name) {
                this.set(name, "", 0);
            }
        },
        valid: {
            isTel: function (tel) {
                return /^1\d{10}$/.test(tel);
            },
        },
        event: {
            /**
             * 触发自定义事件
             * @param eventName
             * @param detail
             * @param [win]
             */
            fire: function (eventName, detail, win) {
                if (detail === void 0) { detail = null; }
                if (win === void 0) { win = window; }
                var e = null;
                if (typeof eventName !== 'string' || !eventName) {
                    return;
                }
                if ('CustomEvent' in window) {
                    e = new CustomEvent(eventName, { detail: detail, bubbles: true });
                }
                else {
                    e = document.createEvent('CustomEvent');
                    e.initCustomEvent(eventName, true, false, { detail: detail });
                }
                win.dispatchEvent(e);
            }
        },
        date: {
            oneDay: 86400000,
            today: function () { return new Date(); },
            add: function (date, day) {
                date.setTime(date.getTime() + day * C.tools.date.oneDay);
                return date;
            },
            tomorrow: function () { return C.tools.date.add(new Date(), 1); },
            yesterday: function () { return C.tools.date.add(new Date(), -1); },
            range: {
                today: function () {
                    return C.tools.date._getRange(new Date(), new Date());
                },
                yesterday: function () {
                    return C.tools.date._getRange(C.tools.date.yesterday(), C.tools.date.yesterday());
                },
                tomorrow: function () {
                    return C.tools.date._getRange(C.tools.date.tomorrow(), C.tools.date.tomorrow());
                },
                thisWeek: function () {
                    var date1 = new Date(), date2 = C.tools.date.yesterday(), day = date1.getDay();
                    return C.tools.date._getRange(C.tools.date.add(date1, -7), date2);
                },
                lastWeek: function () {
                    var date1 = new Date(), date2 = new Date();
                    // lastWeekDay = date1.getDay();
                    // lastWeekDay = lastWeekDay === 0 ? 7 : lastWeekDay;
                    return C.tools.date._getRange(C.tools.date.add(date1, -14), C.tools.date.add(date2, -8));
                },
                thisMonth: function () {
                    var date = new Date(), year = date.getFullYear(), month = date.getMonth();
                    return C.tools.date._getRange(new Date(year, month, 1), new Date(year, month + 1, 0));
                },
                lastMonth: function () {
                    var date = new Date();
                    date.setMonth(date.getMonth() - 1);
                    var year = date.getFullYear(), month = date.getMonth();
                    return C.tools.date._getRange(new Date(year, month, 1), new Date(year, month + 1, 0));
                },
                _getSeasonIndex: function (date) { return Math.floor(date.getMonth() / 3); },
                _getSeason: function (year, season) {
                    var firstMonth = season * 3, monthLen = ((firstMonth / 9 % 1 === 0) ? 31 : 30);
                    return C.tools.date._getRange(new Date(year, firstMonth, 1), new Date(year, firstMonth + 2, monthLen));
                },
                // (year) => [new Date(year, 3, 1), new Date(year, 5, 30)],
                // (year) => [new Date(year, 6, 1), new Date(year, 8, 30)],
                // (year) => [new Date(year, 9, 1), new Date(year, 11, 31)]
                thisSeason: function () {
                    var date = new Date(), dateRange = C.tools.date.range;
                    return dateRange._getSeason(date.getFullYear(), dateRange._getSeasonIndex(date));
                },
                lastSeason: function () {
                    var date = new Date(), dateRange = C.tools.date.range, lastSeasonIndex = (dateRange._getSeasonIndex(date) - 1 + 4) % 4, year = date.getFullYear() - (lastSeasonIndex === 3 ? 1 : 0);
                    return dateRange._getSeason(year, lastSeasonIndex);
                },
                thisYear: function () {
                    var year = new Date().getFullYear();
                    return C.tools.date._getRange(new Date(year, 0, 1), new Date(year, 11, 31));
                },
                lastYear: function () {
                    var year = new Date().getFullYear() - 1;
                    return C.tools.date._getRange(new Date(year, 0, 1), new Date(year, 11, 31));
                }
            },
            _getRange: function (date1, date2) {
                date1.setHours(0, 0, 0, 0);
                date2.setHours(23, 59, 59, 999);
                return [date1, date2];
            },
            format: function (date, fmt) {
                if (!fmt) {
                    return date.toString();
                }
                var o = {
                    "M+": date.getMonth() + 1,
                    "d+": date.getDate(),
                    "H+": date.getHours(),
                    "m+": date.getMinutes(),
                    "s+": date.getSeconds() //秒
                    // "S": date.getMilliseconds()             //毫秒
                };
                if (/(y+)/.test(fmt))
                    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
                for (var k in o)
                    if (new RegExp("(" + k + ")").test(fmt))
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                return fmt;
            }
        },
        pattern: {
            singleton: function (fn) {
                var single = null;
                return function () {
                    return single || (single = fn.apply(this, arguments));
                };
            },
            throttling: function (action, delay) {
                var last = 0;
                return function () {
                    var curr = +new Date();
                    if (curr - last > delay) {
                        action.apply(this, arguments);
                        last = curr;
                    }
                };
            },
            debounce: function (method, delay) {
                var timer = null;
                return function () {
                    var context = this, args = arguments;
                    clearTimeout(timer);
                    timer = setTimeout(function () {
                        method.apply(context, args);
                    }, delay);
                };
            }
        },
        /**
         * 获取offset参数
         * @author yrh
         */
        offset: {
            left: function (obj) {
                if (obj === window) {
                    return 0;
                }
                return obj.offsetLeft + (obj.offsetParent ? this.left(obj.offsetParent) : 0);
            },
            top: function (obj) {
                if (obj === window) {
                    return 0;
                }
                return obj.offsetTop + (obj.offsetParent ? this.top(obj.offsetParent) : 0);
            }
        },
        /**
         * 获取滚动条scrollTop
         * @author yrh
         */
        scrollTop: function () {
            return document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
        },
        calc: function (express) {
            var operator = '', num1, num2;
            if (typeof express !== 'string') {
                return;
            }
            express = express.replace(/\s+/g, '');
            for (var i = 0, len = express.length; i < len; i++) {
                var char = express[i];
                if (~'+-*/'.indexOf(char)) {
                    if (i === 0 && ~'+-'.indexOf(char)) {
                        continue;
                    }
                    operator = char;
                    num1 = Number(express.substr(0, i));
                    num2 = Number(express.substr(i + 1));
                    break;
                }
            }
            // for(let op of ['+','-','*','/']){
            //     if(~express.indexOf(op)) {
            //         operator = op;
            //         [num1, num2] = express.split(op);
            //
            //         num1 = Number(num1);
            //         num2 = Number(num2);
            //
            //         break;
            //     }
            // }
            if (!operator) {
                return Number(express);
            }
            var is1Num = !isNaN(num1);
            var is2Num = !isNaN(num2);
            if (!is1Num && ['+', '-'].includes(operator)) {
                return Number(operator + num2);
            }
            if (is1Num && !operator && !is2Num) {
                return num1;
            }
            if (operator && is1Num && is2Num) {
                switch (operator) {
                    case '+':
                        return num1 + num2;
                    case '-':
                        return num1 - num2;
                    case '*':
                        return num1 * num2;
                    case '/':
                        return num1 / num2;
                }
            }
            return NaN;
        },
        // select多选下拉框，选中项移动
        // selectMove: function (oldSel, newSel) {
        //     let opts = oldSel.options;
        //     for (let i = 0, l = opts.length; i < l; i++) {
        //         if (opts[i].selected) {
        //             newSel.appendChild(opts[i]);
        //             i--;
        //             l--;
        //         }
        //     }
        // },
        iPage: function (src, attrs) {
            var iframe = C.d.create("<iframe class=\"pageIframe\" src=\"" + src + "\" " + C.tools.obj.toAttr(attrs) + "></iframe>");
            document.body.appendChild(iframe);
            return {
                show: function () {
                    // console.log(1);
                    iframe.classList.add('active');
                },
                close: function () {
                    iframe.classList.remove('active');
                },
                get: function () { return iframe; }
            };
        },
        // 设置select表单选中
        selVal: function (select, val) {
            for (var i = 0; i < select.options.length; i++) {
                if (select.options[i].value == val) {
                    select.options[i].selected = true;
                    break;
                }
            }
        },
        os: (function () {
            var ua = navigator.userAgent, os = {
                wechat: {
                    version: ''
                },
                ios: false,
                iphone: false,
                ipad: false,
                android: false,
                version: ''
            };
            var funcs = [
                function () {
                    var wechat = ua.match(/(MicroMessenger)\/([\d\.]+)/i);
                    if (wechat) { //wechat
                        os.wechat = {
                            version: wechat[2].replace(/_/g, '.')
                        };
                    }
                    return false;
                },
                function () {
                    var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
                    if (android) {
                        os.android = true;
                        os.version = android[2];
                        // os.isBadAndroid = !(/Chrome\/\d/.test(window.navigator.appVersion));
                    }
                    return os.android;
                },
                function () {
                    var iphone = ua.match(/(iPhone\sOS)\s([\d_]+)/);
                    if (iphone) { //iphone
                        os.ios = os.iphone = true;
                        os.version = iphone[2].replace(/_/g, '.');
                    }
                    else {
                        var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
                        if (ipad) { //ipad
                            os.ios = os.ipad = true;
                            os.version = ipad[2].replace(/_/g, '.');
                        }
                    }
                    return os.ios;
                }
            ];
            funcs.every(function (func) {
                return !func();
            });
            return os;
        })()
    };
    // tools.iPage.prototype.getActives = function () {
    //     return document.querySelectorAll('iframe.pageIframe.active');
    // };
    document.body.classList.add(C.tools.isMb ? 'fl-mobile' : 'fl-pc'); // 全局类
})(C || (C = {}));
// function applyMixins(derivedCtor: any, baseCtors: any[]) {
//     baseCtors.forEach(baseCtor => {
//         Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
//             derivedCtor.prototype[name] = baseCtor.prototype[name];
//         });
//     });
// }

var C;
(function (C) {
    /**
     * 操作element自定义数据
     * @type {{get: ((elem: Node) => obj); remove: ((elem: Node) => any)}}
     */
    var elemDataInnerKey = {
        event: '__event',
        data: '__customData'
    };
    var elemData = (function () {
        var cache = {}, guidCounter = 1, expando = "_D_A_T_A_" + (new Date).getTime();
        /**
         * 获取数据
         * @param {Node} elem
         * @returns {obj}
         */
        function get(elem) {
            if (typeof elem === 'object' && elem) {
                var guid = elem[expando];
                if (!guid) {
                    guid = elem[expando] = guidCounter++;
                    cache[guid] = {};
                }
                return cache[guid];
            }
            return null;
        }
        /**
         * 删除
         * @param {Node} elem
         */
        function remove(elem) {
            if (typeof elem === 'object' && elem) {
                var guid = elem[expando];
                if (guid) {
                    delete cache[guid];
                    delete elem[expando];
                }
            }
        }
        return { get: get, remove: remove };
    }());
    /**
     * 事件管理
     */
    var event = (function () {
        // 委托元素对应的回调
        var eventHash = elemDataInnerKey.event, noDelegateSelector = '';
        var customEvent = (function () {
            var SUPPORT_TOUCH = C.tools.isMb, EVENT_START = SUPPORT_TOUCH ? 'touchstart' : 'mousedown', EVENT_MOVE = SUPPORT_TOUCH ? 'touchmove' : 'mousemove', EVENT_END = SUPPORT_TOUCH ? 'touchend' : 'mouseup';
            function dispatcherGet(el) {
                return elemData.get(el)[eventHash] && elemData.get(el)[eventHash].dispatcher;
            }
            function typesGet(el) {
                var eventData = elemData.get(el)[eventHash];
                return eventData && eventData.handlers ? Object.keys(eventData.handlers) : null;
            }
            var panHandlers = {
                start: null,
                end: null,
                move: null,
            };
            var events = {
                press: {
                    type: 'press',
                    time: 500,
                    timer: null,
                    startTime: null,
                    handler: null,
                    on: function (el, selector) {
                        var press = this, moveHandler, endHandler;
                        press.startTime = new Date().getTime();
                        eventOn(el, EVENT_START, selector, press.handler = function (ev) {
                            clearTimeout(press.timer);
                            press.timer = setTimeout(function () {
                                var dispatcher = dispatcherGet(el);
                                dispatcher && dispatcher.call(el, getCustomEvent(ev, 'press'));
                                eventOff(el, EVENT_MOVE, moveHandler);
                                eventOff(el, EVENT_END, endHandler);
                            }, press.time);
                            eventOn(el, EVENT_MOVE, moveHandler = function () {
                                clearTimeout(press.timer);
                                eventOff(el, EVENT_MOVE, moveHandler);
                                eventOff(el, EVENT_END, endHandler);
                            });
                            eventOn(el, EVENT_END, endHandler = function () {
                                if (press.startTime !== null && new Date().getTime() - press.startTime >= press.time + 10) {
                                    clearTimeout(press.timer);
                                    eventOff(el, EVENT_MOVE, moveHandler);
                                    eventOff(el, EVENT_END, endHandler);
                                }
                            });
                        });
                    },
                    off: function (el, selector) {
                        eventOff(el, EVENT_START, selector, this.handler);
                    }
                },
                pan: {
                    default: 'pan panstart panmove panend pancancel panleft panright',
                    all: 'panstart panmove panend pancancel panleft panright panup pandown',
                    prev: null,
                    first: null,
                    firstTime: 0,
                    once: true,
                    isTriggerMove: true,
                    direction: null,
                    handlers: {
                        start: function (event) {
                            lockEvent(this, event, 'start');
                        },
                        move: function (event) {
                            lockEvent(this, event, 'move');
                        },
                        end: function (event) {
                            lockEvent(this, event, 'end');
                        }
                    },
                    on: function (el, selector) {
                        // start
                        var _this = this;
                        // end
                        // move
                        eventOn(el, EVENT_START, selector, panHandlers.start = function (ev) {
                            _this.handlers.start.call(el, ev);
                            // eventOn(el, EVENT_MOVE, selector, this.handlers.move);
                            eventOn(document, EVENT_MOVE, panHandlers.move = function (ev) {
                                _this.handlers.move.call(el, ev);
                            });
                            // eventOn(el, EVENT_END, this.handlers.end);
                            eventOn(document, EVENT_END, panHandlers.end = function (ev) {
                                _this.handlers.end.call(el, ev);
                                eventOff(document, EVENT_MOVE, panHandlers.move);
                                eventOff(document, EVENT_END, panHandlers.end);
                            });
                        });
                    },
                    off: function (el, selector) {
                        eventOff(el, EVENT_START, selector, panHandlers.start);
                    }
                }
            };
            function getCustomEvent(ev, type) {
                return {
                    type: type,
                    target: ev.target,
                    preventDefault: function () { ev.preventDefault(); },
                    deltaX: ev.touches[0].clientX,
                    deltaY: ev.touches[0].clientY,
                };
            }
            var lockEvent = (function () {
                var move_lock = false, start_lock = false, end_lock = false, move_id = null, start_id = null, end_id = null;
                return function (el, ev, type) {
                    if (type === 'move') {
                        if (!move_lock) {
                            move_lock = true;
                            clearTimeout(move_id);
                            move_id = setTimeout(function () {
                                triggerEvent(el, ev, type);
                                move_lock = false;
                            }, 1);
                        }
                    }
                    else if (type === 'start') {
                        if (!start_lock) {
                            start_lock = true;
                            clearTimeout(start_id);
                            start_id = setTimeout(function () {
                                triggerEvent(el, ev, type);
                                start_lock = false;
                            }, 1);
                        }
                    }
                    else if (type === 'end') {
                        if (!end_lock) {
                            end_lock = true;
                            clearTimeout(end_id);
                            end_id = setTimeout(function () {
                                triggerEvent(el, ev, type);
                                end_lock = false;
                            }, 1);
                        }
                    }
                };
            })();
            function triggerEvent(el, ev, type) {
                // console.log(type)
                var eventList = recognizer(typesGet(el));
                var event = eventObjGet(ev, eventList.indexOf('pan') !== -1 ? '' : type, (function () {
                    if (type === 'start') {
                        return 0;
                    }
                    else if (type === 'move') {
                        return 1;
                    }
                    else if (type === 'end') {
                        return 2;
                    }
                    return null;
                })());
                if (type === 'start') {
                    events.pan.once = true;
                    events.pan.direction = '';
                }
                if (type === 'move' && events.pan.once) {
                    events.pan.once = false;
                    events.pan.isTriggerMove = events.pan.all.indexOf(event.direction) !== -1;
                    events.pan.direction = event.direction;
                }
                if (type === 'move' && !events.pan.isTriggerMove) {
                    return;
                }
                if (eventList.indexOf('pan') !== -1) {
                    var dispatcher = dispatcherGet(el);
                    dispatcher && dispatcher.call(el, event);
                }
                else if (eventList.indexOf('pan' + type) !== -1) {
                    var dispatcher = dispatcherGet(el);
                    dispatcher && dispatcher.call(el, event);
                }
                else if (eventList.indexOf('pan' + events.pan.direction) !== -1 && type === 'move') {
                    var dispatcher = dispatcherGet(el);
                    event.type = 'pan' + events.pan.direction;
                    dispatcher && dispatcher.call(el, event);
                }
            }
            function eventObjGet(event, eventType, staus) {
                var customEvent = {
                    type: 'pan' + eventType,
                    deltaX: 0,
                    deltaY: 0,
                    deltaTime: 0,
                    distance: 0,
                    angle: 0,
                    velocityX: 0,
                    velocityY: 0,
                    velocity: 0,
                    direction: null,
                    offsetDirection: null,
                    srcEvent: event,
                    target: (function () {
                        if (staus === 2) {
                            return event.target;
                        }
                        else {
                            return SUPPORT_TOUCH ? event.changedTouches[0].target : event.target;
                        }
                    })(),
                    // eventType:0
                    isFirst: false,
                    isFinal: false,
                    preventDefault: function () { event.preventDefault(); }
                };
                switch (staus) {
                    case 0:
                        events.pan.prev = {};
                        for (var attr in customEvent) {
                            events.pan.prev[attr] = customEvent[attr];
                        }
                        customEvent.isFirst = true;
                        events.pan.first = customEvent;
                        events.pan.firstTime = new Date().getTime();
                        break;
                    case 1:
                        customEvent = getMoveEvent(customEvent);
                        break;
                    case 2:
                        customEvent = getMoveEvent(customEvent);
                        customEvent.isFirst = false;
                        customEvent.isFinal = true;
                        break;
                }
                return customEvent;
            }
            function getMoveEvent(ev) {
                var event = getEvent(ev.srcEvent), prevEv = getEvent(events.pan.prev.srcEvent), firstEv = getEvent(events.pan.first.srcEvent);
                function getEvent(ev) {
                    return SUPPORT_TOUCH ? ev.changedTouches[0] : ev;
                }
                ev.deltaX = event.clientX - prevEv.clientX; //	x轴偏移量
                ev.deltaY = event.clientY - prevEv.clientY; //	y轴偏移量
                ev.angle = Math.atan2(ev.deltaY, ev.deltaX) / Math.PI * 180; //	偏移角度.
                ev.distance = Math.sqrt(Math.pow(ev.deltaY, 2) + Math.pow(ev.deltaX, 2)); //	偏移距离
                ev.direction = getDirection(ev.angle); //	偏移方向 up down left right.
                ev.offsetDirection = //	从起点的偏移方向.
                    getDirection(Math.atan2(event.clientY - firstEv.clientY, event.clientX - firstEv.clientX) / Math.PI * 180);
                ev.deltaTime = new Date().getTime() - events.pan.firstTime;
                ev.velocityX = ev.deltaX / (ev.deltaTime - events.pan.prev.deltaTime);
                ev.velocityY = ev.deltaY / (ev.deltaTime - events.pan.prev.deltaTime);
                events.pan.prev = ev;
                return ev;
            }
            function getDirection(angle) {
                if (angle <= 45 && angle > -45) {
                    return 'right';
                }
                else if (angle <= 135 && angle > 45) {
                    return 'down';
                }
                else if (angle <= -45 && angle > -135) {
                    return 'up';
                }
                else if (angle > 135 || angle <= -135) {
                    return 'left';
                }
                else {
                    return null;
                }
            }
            /**
             * 判断是否时自定义事件，并返回自定义事件对象
             */
            var recognizer = function (eventTypes) {
                var eventList = [];
                if (C.tools.isNotEmpty(eventTypes)) {
                    for (var i = 0; i < eventTypes.length; i++) {
                        var position = events.pan.all.indexOf(eventTypes[i]);
                        if (position !== -1) {
                            eventList.push(events.pan.all.substr(position, eventTypes[i].length));
                        }
                    }
                }
                return eventList;
            };
            var on = function (el, type, selector) {
                if (events.pan.all.indexOf(type) !== -1) {
                    events.pan.on(el, selector);
                }
                else if (events.press.type === type) {
                    events.press.on(el, selector);
                }
            };
            var off = function (el, type, selector) {
                if (events.pan.all.indexOf(type) !== -1) {
                    events.pan.off(el, selector);
                }
                else if (events.press.type === type) {
                    events.press.off(el, selector);
                }
            };
            return { on: on, off: off };
        })();
        function fixEvent(event) {
            var stopPropagation = event.stopPropagation;
            event['isPropagationStopped'] = false;
            event.stopPropagation = function () {
                stopPropagation.call(event);
                event['isPropagationStopped'] = true;
            };
            var stopImmediatePropagation = event.stopImmediatePropagation;
            event['isImmediatePropagationStopped'] = false;
            event.stopImmediatePropagation = function () {
                stopImmediatePropagation.call(event);
                event['isImmediatePropagationStopped'] = true;
            };
        }
        var eventDispatcherGet = function (eventCache) {
            return function (evt) {
                var eventType = evt.type, typeHandlers = eventCache.handlers && eventCache.handlers[eventType];
                if (eventCache.disabled || C.tools.isEmpty(typeHandlers) || C.d.closest(this, '.disabled')) { // this has disabled
                    return;
                }
                fixEvent(evt);
                var isBubbleEnd = false, bubbleEl = evt.target;
                // 开始委托、冒泡
                do {
                    if (bubbleEl !== this) {
                        if (bubbleEl instanceof Element) {
                            for (var selector in typeHandlers) {
                                var selectorHandlers = typeHandlers[selector], target = null;
                                // debugger;
                                // 匹配委托元素
                                if (selector != noDelegateSelector) {
                                    target = C.d.matches(bubbleEl, selector) ? bubbleEl : null;
                                }
                                var isImmediateStop = runHandler(target, selectorHandlers);
                                if (isImmediateStop) {
                                    isBubbleEnd = true;
                                    break;
                                }
                            }
                            isBubbleEnd = evt['isPropagationStopped'];
                        }
                    }
                    else {
                        // 到达绑定元素，事件冒泡结束
                        runHandler(this, typeHandlers[noDelegateSelector]);
                        isBubbleEnd = true;
                    }
                    if (!isBubbleEnd) {
                        // 冒泡
                        if (bubbleEl instanceof Element) {
                            bubbleEl = bubbleEl.parentElement;
                        }
                        // 冒泡到了html节点,继续冒泡
                        if (!bubbleEl) {
                            bubbleEl = document;
                        }
                        else if (bubbleEl === document) {
                            bubbleEl = window;
                        }
                    }
                } while (!isBubbleEnd && bubbleEl !== window);
                function runHandler(target, handlers) {
                    if (target) {
                        var isImmediateStop = false, isDocWin = target === window || target === document, el = target;
                        if (isDocWin || (!el.classList.contains('disabled') && handlers && handlers[0])) {
                            for (var _i = 0, handlers_1 = handlers; _i < handlers_1.length; _i++) {
                                var handler = handlers_1[_i];
                                handler.call(target, evt);
                                if (evt['isImmediatePropagationStopped']) {
                                    isImmediateStop = true;
                                    break;
                                }
                            }
                        }
                        return isImmediateStop;
                    }
                    return false;
                }
            };
        };
        function eventArrayGet(type) {
            return type.split(' ').filter(function (str) { return str; });
        }
        /**
         * 开启事件
         * @param {EventTarget | Node} el
         * @param {string} types
         * @param {EventListener | string} selector
         * @param {EventListener} cb
         */
        var eventOn = function (el, types, selector, cb) {
            if (!el || !(!window['EventTarget'] || el instanceof EventTarget) || !(typeof types === 'string')) {
                return;
            }
            eventArrayGet(types).forEach(function (type) {
                // 兼容mui
                if ('mui' in window && C.tools.isMb && type === 'click') {
                    type = 'tap';
                }
                // 是否第一次绑定此元素的此事件类型
                var first = false;
                // 委托选择器是函数的时候，则选择器为空
                if (typeof selector === 'function') {
                    cb = selector;
                    selector = noDelegateSelector;
                }
                customEvent.on(el, type, selector);
                // 获取当前是否已经绑定事件
                !elemData.get(el)[eventHash] && (elemData.get(el)[eventHash] = {});
                var eventCache = elemData.get(el)[eventHash];
                // 初始化数据结
                !eventCache.handlers && (eventCache.handlers = {});
                var handlers = eventCache.handlers;
                if (!handlers[type]) {
                    first = true;
                    handlers[type] = {};
                }
                !handlers[type][selector] && (handlers[type][selector] = []);
                // 回调函数入栈
                handlers[type][selector].push(cb);
                //
                if (!eventCache.dispatcher) {
                    eventCache.disabled = false;
                    eventCache.dispatcher = eventDispatcherGet(eventCache);
                }
                if (first) {
                    var passiveTypes = ['mousewheel', 'touchmove', 'touchstart', 'touchend'];
                    try {
                        el.addEventListener(type, eventCache.dispatcher, passiveTypes.indexOf(type) > -1 ? { passive: true } : false);
                    }
                    catch (e) {
                        el.addEventListener(type, eventCache.dispatcher, false);
                    }
                }
            });
        };
        /**
         *
         * 关闭事件
         * @param {EventTarget | Node} el
         * @param {string} types
         * @param {EventListener | string} selector
         * @param {EventListener} cb
         */
        var eventOff = function (el, types, selector, cb) {
            if (!el || !(!window['EventTarget'] || el instanceof EventTarget)) {
                return;
            }
            var elData = elemData.get(el)[eventHash];
            if (!elData || !elData.dispatcher) {
                return;
            }
            if (typeof types === "undefined") {
                for (var type in elData.handlers) {
                    removeHandler(type);
                }
                return;
            }
            customEvent.off(el, types, selector);
            eventArrayGet(types).forEach(function (type) {
                // 兼容mui
                if ('mui' in window && C.tools.isMb && type === 'click') {
                    type = 'tap';
                }
                if (typeof selector === 'undefined') {
                    removeHandler(type);
                    return;
                }
                // 委托选择器是函数的时候，则选择器为空
                if (typeof selector !== 'string') {
                    cb = selector;
                    selector = noDelegateSelector;
                }
                if (typeof cb === 'undefined') {
                    removeHandler(type, selector);
                    return;
                }
                // 删除一个回调函数
                var selectorHandlers = C.tools.keysVal(elData.handlers, type, selector), cbIndex = Array.isArray(selectorHandlers) ? selectorHandlers.indexOf(cb) : -1;
                if (cbIndex >= 0) {
                    selectorHandlers.splice(cbIndex, 1);
                }
                tidyUp(el, type, selector);
            });
            function removeHandler(t, s) {
                var selectorHandlers = elData.handlers[t];
                if (typeof s === 'undefined') {
                    for (var selector_1 in selectorHandlers) {
                        selectorHandlers[selector_1] = [];
                        tidyUp(el, t, selector_1);
                    }
                }
                else {
                    selectorHandlers[s] = [];
                    tidyUp(el, t, s);
                }
            }
            function tidyUp(el, type, seletor) {
                var elData = elemData.get(el)[eventHash], isEmpty = C.tools.isEmpty;
                // 选择器函数数组为空
                if (elData.handlers[type] && isEmpty(elData.handlers[type][seletor])) {
                    delete elData.handlers[type][seletor];
                }
                // 一个事件下没有委托的选择器
                if (isEmpty(elData.handlers[type])) {
                    delete elData.handlers[type];
                    el.removeEventListener(type, elData.dispatcher);
                }
                if (isEmpty(elData.handlers)) {
                    delete elData.handlers;
                    delete elData.dispatcher;
                }
                if (isEmpty(elData)) {
                    delete elemData.get(el)[eventHash];
                    // elemData.remove(el);
                }
            }
        };
        /**
         * 只执行一次事件
         * @param {EventTarget | Node} el
         * @param {string} types
         * @param {EventListener | string} selector
         * @param {EventListener} cb
         */
        var eventOnce = function (el, types, selector, cb) {
            eventArrayGet(types).forEach(function (type) {
                if (typeof selector === 'function') {
                    var func_1 = selector;
                    selector = function (e) {
                        eventOff(el, type, selector, cb);
                        func_1(e);
                    };
                }
                else {
                    var func_2 = cb;
                    cb = function (e) {
                        // debugger;
                        eventOff(el, type, selector, cb);
                        func_2(e);
                    };
                }
                eventOn(el, type, selector, cb);
            });
        };
        /**
         * 触发一次事件
         * @param {EventTarget} elem
         * @param {string} type
         * @param {string} selector
         */
        var trigger = function (elem, type, selector) {
            // if(el !== window){
            // for (let el of <Element[]>_getElPath(<Node>elem)) {
            //     let eventData = elemData.get(el)[eventHash];
            //     if (eventData) {
            //
            //     }
            // }
            // }
            if (selector) {
            }
        };
        // let elSelectorEventOn:EventSelectorFunPara = function(a, b, c, d?, e?){
        //     if(typeof a !== 'string'){
        //         on(a, b, c, d);
        //     }else{
        //         if(typeof b === 'string'){
        //             C.d.queryAll(document, b).forEach(el => on(el, b, c, d))
        //         }else{
        //             C.d.queryAll(b, a).forEach(el => on(el, c, d, e))
        //         }
        //     }
        // };
        //
        // let elSelectorEventOff:EventSelectorFunPara = function(a, b, c, d?, e?){
        //     if(typeof a !== 'string'){
        //         off(a, b, c, d);
        //     }else{
        //         if(typeof b === 'string'){
        //             C.d.queryAll(document, b).forEach(el => off(el, b, c, d))
        //         }else{
        //             C.d.queryAll(b, a).forEach(el => off(el, c, d, e))
        //         }
        //     }
        // };
        // let elSelectorEventOnce:EventSelectorFunPara = function(a, b, c, d?, e?){
        //     if(typeof a !== 'string'){
        //         off(a, b, c, d);
        //     }else{
        //         if(typeof b === 'string'){
        //             C.d.queryAll(document, b).forEach(el => off(el, b, c, d))
        //         }else{
        //             C.d.queryAll(b, a).forEach(el => off(el, c, d, e))
        //         }
        //     }
        // };
        return { eventOn: eventOn, eventOff: eventOff, eventOnce: eventOnce };
    }());
    function createElement(html, parent) {
        if (parent === void 0) { parent = 'div'; }
        //常用不闭合标签
        var notCloseEle = ['br', 'input', 'hr', 'img', 'meta'];
        if (typeof html === 'string') {
            var div = document.createElement(parent);
            div.innerHTML = html;
            return div.firstElementChild;
        }
        else if (typeof html === 'object') {
            if (Array.isArray(html)) {
                var f_1 = document.createDocumentFragment();
                html.forEach(function (child, index) {
                    C.d.append(f_1, createEle(child));
                });
                return f_1;
            }
            else {
                return createEle(html);
            }
        }
        else {
            return null;
        }
        function createEle(_a, parent) {
            var tag = _a.tag, children = _a.children, props = _a.props;
            // 创建标签
            var container = document.createElement(tag);
            if (parent) {
                parent.appendChild(container);
            }
            // 添加属性
            if (props) {
                for (var prop in props) {
                    if (prop === 'dataset') {
                        var datasetObj = props.dataset;
                        for (var datasetName in datasetObj) {
                            container.dataset[datasetName] = datasetObj[datasetName];
                        }
                    }
                    else if (prop === "className") {
                        container.setAttribute('class', props[prop]);
                    }
                    else {
                        // if (prop in container){
                        container.setAttribute(prop, props[prop]);
                        // }
                    }
                }
            }
            if (notCloseEle.indexOf(tag) === -1 && Array.isArray(children)) {
                // 添加子标签
                children.forEach(function (child, index) {
                    if (typeof child === 'string') {
                        container.appendChild(document.createTextNode(child));
                    }
                    else {
                        createEle(child, container);
                    }
                });
            }
            return container;
        }
    }
    // function diff(newSet: T[], oldSet: K[], operate: { create?(now: T): void, replace?(now: T, old: K): void, destroy?(old: K): void }) => {
    //        let i = 0,
    //            {create, replace, destroy} = operate;
    //
    //        newSet = [...(newSet || [])];
    //        oldSet = [...(oldSet || [])];
    //
    //        while (newSet[i] || oldSet[i]) {
    //            let n = newSet[i],
    //                o = oldSet[i];
    //
    //            if(n && o) {
    //                replace && replace(n, o);
    //
    //            }else if(n && !o) {
    //                create && create(n);
    //            }else if(!n && o) {
    //                destroy && destroy(o);
    //            }
    //            i++;
    //        }
    //    })
    C.d = {
        /**
         * 一个元素是否匹配一个css选择器
         * @param {Element} dom
         * @param {string} selector
         * @return {boolean}
         */
        matches: function (dom, selector) {
            if (dom instanceof Element && typeof selector === 'string' && selector) {
                if (dom.webkitMatchesSelector) {
                    // 兼容android 4.4
                    return dom.webkitMatchesSelector(selector);
                    // }else if('matchesSelector' in dom){
                    // 兼容老版本浏览器
                    // return dom.matches(selector);
                }
                else if (dom.matches) {
                    return dom.matches(selector);
                }
            }
            return false;
        },
        /**
         * 设置innerHTML 可执行html中的script里面脚本
         * @param {HTMLElement} dom
         * @param {string} html
         */
        setHTML: function (dom, html) {
            if (dom instanceof Element && typeof html === 'string') {
                dom.innerHTML = C.tools.str.toEmpty(html);
                var scripts = dom.querySelectorAll('script');
                for (var i = 0, s = null; s = scripts.item(i); i++) {
                    var newSc = document.createElement('script');
                    newSc.text = s.text;
                    s.parentNode && s.parentNode.replaceChild(newSc, s);
                }
            }
        },
        /**
         * 通过html字符串创建元素
         * @param {string} html
         * @param {string} parent
         * @return {HTMLElement}
         */
        create: createElement,
        /**
         * 移除一个元素
         * @param {Element} node
         * @param {boolean} [clearEvent=true] - 是否移除此元素以及所有子元素的事件, 默认true
         */
        remove: function (node, clearEvent) {
            if (clearEvent === void 0) { clearEvent = true; }
            if (node instanceof Element) {
                if (clearEvent) {
                    C.d.off(node);
                    C.d.queryAll('*', node).forEach(function (nd) {
                        C.d.off(nd);
                        elemData.remove(node);
                    });
                }
                node.parentNode && node.parentNode.removeChild(node);
            }
        },
        /**
         * 向上冒泡遍历查找与能与css选择器匹配的元素(包含自身),
         */
        closest: function (target, selector, stopNode) {
            if (target instanceof HTMLElement && typeof selector === 'string' && (C.tools.isUndefined(stopNode) || stopNode instanceof HTMLElement)) {
                var tar = target;
                while (tar) {
                    if (C.d.matches(tar, selector)) {
                        return tar;
                    }
                    tar = tar.parentElement;
                    if (stopNode && stopNode.isSameNode(tar)) {
                        return null;
                    }
                }
            }
            return null;
        },
        /**
         * 查询匹配的集合
         * @param {string} selector
         * @param {NodeSelector} dom
         * @return {HTMLElement[]}
         */
        queryAll: function (selector, dom) {
            if (dom === void 0) { dom = document; }
            if (typeof selector === 'string' && dom && C.tools.isFunction(dom.querySelectorAll)) {
                return Array.prototype.slice.call(dom.querySelectorAll(selector), 0);
            }
            return [];
        },
        /**
         * 查询一个
         * @param {string} selector
         * @param {NodeSelector} dom
         * @return {HTMLElement}
         */
        query: function (selector, dom) {
            if (dom === void 0) { dom = document; }
            // if(dom === window){
            //     dom = document;
            // }
            if (typeof selector === 'string' && dom && C.tools.isFunction(dom.querySelector)) {
                return dom.querySelector(selector);
            }
            else {
                return null;
            }
        },
        /**
         * 往父元素最后附加一个元素
         */
        append: function (parent, child) {
            if (parent instanceof Node) {
                if (C.tools.isPrimitive(child)) {
                    child = document.createTextNode(child + '');
                }
                if (child instanceof Node) {
                    parent.appendChild(child);
                }
            }
        },
        /**
         * 往父元素第一个位置插入一个元素
         */
        prepend: function (parent, child) {
            if (parent instanceof Node) {
                if (C.tools.isPrimitive(child)) {
                    child = document.createTextNode(child + '');
                }
                if (child instanceof Node) {
                    parent.insertBefore(child, parent.firstChild);
                }
            }
        },
        /**
         * 在某个元素之前插入一个元素
         */
        before: function (ref, el) {
            if (ref instanceof Node) {
                if (C.tools.isPrimitive(el)) {
                    el = document.createTextNode(el + '');
                }
                if (el instanceof Node) {
                    ref.parentNode && ref.parentNode.insertBefore(el, ref);
                }
            }
        },
        /**
         * 在某个元素之后插入一个元素
         * @param {Element} ref
         * @param {Node | string} el
         */
        after: function (ref, el) {
            if (ref instanceof Node) {
                if (C.tools.isPrimitive(el)) {
                    el = document.createTextNode(el + '');
                }
                if (el instanceof Node) {
                    ref.parentNode && ref.parentNode.insertBefore(el, ref.nextSibling);
                }
            }
        },
        /**
         * 将oldEl替换为newEl
         */
        replace: function (newEl, oldEl) {
            if (oldEl instanceof Node) {
                if (C.tools.isPrimitive(newEl)) {
                    newEl = document.createTextNode(newEl + '');
                }
                if (newEl instanceof Node) {
                    oldEl.parentNode && oldEl.parentNode.replaceChild(newEl, oldEl);
                }
            }
        },
        /**
         * 设置el相对relEl的绝对定位位置, 使得el出现在relEl的下方
         * 调用该函数后，el会被放到body下
         * @param {HTMLElement} el
         * @param {HTMLElement} relEl
         * @param {boolean} [useRelWidth]
         */
        setPosition: function (el, relEl, useRelWidth) {
            if (useRelWidth === void 0) { useRelWidth = true; }
            if (el instanceof HTMLElement && relEl instanceof HTMLElement) {
                if (el.parentNode !== document.body) {
                    C.d.append(document.body, el);
                }
                var relRect = relEl.getBoundingClientRect(), elHeight = el.offsetHeight, elWidth = el.offsetWidth, bodyWidth = document.body.offsetWidth, bodyHeight = document.body.offsetHeight, top_1 = relRect.bottom + 3, left = relRect.left - 3;
                top_1 = top_1 + elHeight < bodyHeight ? top_1 : relRect.top - elHeight - 3;
                left = left + elWidth > bodyWidth ? left - (left + elWidth - bodyWidth) : left;
                el.style.position = 'absolute';
                el.style.left = left + "px";
                el.style.top = top_1 + "px";
                el.style.zIndex = '1002';
                //是否将el的宽度设置为relEl的宽度
                if (useRelWidth) {
                    el.style.width = relRect.width + "px";
                }
            }
        },
        off: event.eventOff,
        on: event.eventOn,
        once: event.eventOnce,
        /**
         * 添加/获取 数据
         * @param {Node} node
         * @param data
         * @return {any}
         */
        data: function (node, data) {
            if (node instanceof Node) {
                var eleData = elemData.get(node);
                if (data) {
                    eleData[elemDataInnerKey.data] = data;
                }
                else {
                    return eleData[elemDataInnerKey.data];
                }
            }
        },
        // <>(nowArr: T[], oldArr: K[], operate: {
        //     create?(now: T): void,
        //     replace?(now: T, old: K): void,
        //     destroy?(old: K): void
        // });
        diff: function (newSet, oldSet, operate) {
            var i = 0, create = operate.create, replace = operate.replace, destroy = operate.destroy;
            newSet = (newSet || []).slice();
            oldSet = (oldSet || []).slice();
            var hasNew = i in newSet, hasOld = i in oldSet;
            while (hasNew || hasOld) {
                var n = newSet[i], o = oldSet[i];
                if (hasNew && hasOld) {
                    replace && replace(n, o);
                }
                else if (hasNew && !hasOld) {
                    create && create(n);
                }
                else if (!hasNew && hasOld) {
                    destroy && destroy(o);
                }
                i++;
                hasNew = i in newSet;
                hasOld = i in oldSet;
            }
        },
        classAdd: function (el, tokens) {
            if (el instanceof Element) {
                var classArr = C.tools.toArray(tokens)
                    .reduce(function (per, cur) { return per.concat(cur.split(' ')); }, []);
                (_a = el.classList).add.apply(_a, classArr);
            }
            var _a;
        },
        classRemove: function (el, tokens) {
            if (el instanceof Element) {
                var classArr = C.tools.toArray(tokens)
                    .reduce(function (per, cur) { return per.concat(cur.split(' ')); }, []);
                (_a = el.classList).remove.apply(_a, classArr);
            }
            var _a;
        },
        classToggle: function (el, token, force) {
            if (el instanceof Element) {
                el.classList.toggle(token, force);
            }
        },
        hide: function (el, force) {
            if (force === void 0) { force = true; }
            C.d.classToggle(el, 'hide', force);
        },
        disable: function (el, force) {
            if (force === void 0) { force = true; }
            C.d.classToggle(el, 'disable', force);
        }
    };
})(C || (C = {}));
function h(tag, props) {
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    var element = document.createElement(tag);
    if (props && typeof props === 'object') {
        for (var prop in props) {
            var val = props[prop];
            if (prop === 'style' && typeof val === 'object') {
                if (val) {
                    for (var _a = 0, val_1 = val; _a < val_1.length; _a++) {
                        var name_1 = val_1[_a];
                        element.style[name_1] = val[name_1];
                    }
                }
            }
            else {
                if (prop === 'className') {
                    prop = 'class';
                }
                element.setAttribute(prop, val);
            }
        }
    }
    if (Array.isArray(children)) {
        if (Array.isArray(children[0])) {
            children = children[0];
        }
        children.forEach(function (child) {
            var node = child instanceof Node ? child : document.createTextNode(child);
            C.d.append(element, node);
        });
    }
    return element;
}
var Tools = {
    event: {
        fire: function () {
            C.tools.event.fire.apply(null, arguments);
        }
    }
};

var C;
(function (C) {
    var Ajax = /** @class */ (function () {
        function Ajax() {
            this._xhr = null;
            this.cache = new AjaxCache();
            this._promise = null;
            this._xhr = new XMLHttpRequest();
        }
        Object.defineProperty(Ajax.prototype, "promise", {
            get: function () {
                return this._promise || Promise.resolve();
            },
            enumerable: true,
            configurable: true
        });
        Ajax.prototype.fetch = function (url, setting) {
            var _this = this;
            this._promise = new Promise(function (resolve, reject) {
                _this.request(url, setting, function (result) {
                    resolve(result);
                }, function (result) {
                    reject(result);
                });
            });
            return this._promise;
        };
        Ajax.prototype.request = function (url, setting, success, error) {
            var _this = this;
            var accepts = {
                text: 'text/plain',
                html: 'text/html',
                xml: 'application/xml, text/xml',
                json: 'application/json, text/javascript',
                script: 'text/javascript, application/javascript, application/x-javascript'
            }, xhr = this._xhr, 
            // 处理ajax参数
            s = getSetting(url, setting), 
            // 判断是否开启本地缓存
            isLocalCache = s.cache && s.type === 'GET' && ~['text', 'json'].indexOf(s.dataType), abortTimeoutId = null;
            // isLocalCache = s.cache && s.localCache && s.type === 'GET' && ~['text', 'json'].indexOf(s.dataType);
            // 直接调用本地缓存
            if (isLocalCache && this.cache.has(s)) {
                done(null, this.cache.get(s));
                return;
            }
            // url是否加入禁用缓存参数
            var uncacheUrl = s.cache === false ? { '_': new Date().getTime() } : null;
            // 打开xhr
            xhr.open(s.type, C.tools.url.addObj(s.url, uncacheUrl));
            // 返回类型设置
            var mine = accepts[s.dataType];
            if (mine) {
                xhr.overrideMimeType(mine.split(',')[0]);
            }
            // Apply custom fields if provided
            if (setting && setting.xhrFields) {
                for (var i in setting.xhrFields) {
                    xhr[i] = setting.xhrFields[i];
                }
            }
            // headers 设置
            for (var name_1 in s.headers) {
                xhr.setRequestHeader(name_1, s.headers[name_1]);
            }
            //超时设置
            if (s.timeout > 0) {
                abortTimeoutId = setTimeout(function () {
                    xhr.onreadystatechange = function () {
                    };
                    xhr.abort();
                    failure('timeout');
                }, s.timeout);
            }
            // 文件类型
            if (s.dataType === 'file') {
                xhr.responseType = 'blob';
            }
            // 返回状态处理
            xhr.onreadystatechange = function (e) {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                    return;
                }
                // 成功
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    var type2response = {
                        xml: 'responseXML',
                        file: 'response'
                    };
                    done(xhr, xhr[type2response[s.dataType] || 'responseText']);
                    // 加入缓存
                    if (isLocalCache) {
                        _this.cache.push(s, xhr.responseText);
                    }
                }
                else {
                    // 失败
                    failure(xhr.status ? 'error' : 'abort', xhr.statusText);
                    // error(Ajax.errRes(xhr, 'error', xhr.statusText));
                }
            };
            // xhr.onabort = function() {
            //     error(Ajax.errRes(xhr, 'abort', ''));
            // };
            // xhr.onerror = function() {
            //     error(Ajax.errRes(xhr, 'error', ''));
            // };
            // 发送
            xhr.send(s.data);
            function done(xhr, response) {
                var result = null;
                if (s.dataType === 'json') {
                    try {
                        result = JSON.parse(response);
                    }
                    catch (e) {
                        failure('parsererror', e);
                        return;
                    }
                }
                else {
                    result = response;
                }
                // success({response: result, statusText: 'success', xhr});
                clearTimeout(abortTimeoutId);
                success(Ajax.sucRes(result, 'success', xhr));
            }
            function failure(statusType, errorThrown) {
                if (errorThrown === void 0) { errorThrown = ''; }
                clearTimeout(abortTimeoutId);
                error(Ajax.errRes(xhr, statusType, errorThrown));
            }
            function getSetting(url, setting) {
                // 默认值
                setting = C.tools.obj.merge({
                    type: 'GET',
                    dataType: 'text',
                    timeout: 0,
                    processData: true,
                    traditional: false
                }, setting);
                var s = {
                    url: url,
                    timeout: setting.timeout,
                    processData: setting.processData,
                    cache: setting.cache
                    // , localCache: setting.localCache
                    ,
                    type: setting.type.toUpperCase(),
                    dataType: setting.dataType.toLowerCase(),
                    traditional: setting.traditional,
                    xhrFields: setting.xhrFields
                };
                // 确定content type
                if (typeof setting.contentType === 'string' && setting.contentType) {
                    // 如果有传入content type, 则直接赋值
                    s.contentType = setting.contentType;
                }
                else if (setting.contentType !== false && s.type !== 'GET' && setting.data) {
                    // 如果传入的contentType不为false，type为GET时不需要发送数据，所以不为GET时才设置ContentType, 然后data不为空
                    s.contentType = s.traditional ? 'application/x-www-form-urlencoded' : accepts.json;
                }
                //设置headers
                s.headers = {
                    Accept: accepts[setting.dataType] || '*/*',
                    'X-Requested-With': 'XMLHttpRequest'
                };
                if (s.contentType) {
                    // 设置contentType
                    s.headers['Content-Type'] = s.contentType;
                }
                if (setting.headers) {
                    // 设置用户自定义的header
                    for (var name_2 in setting.headers) {
                        s.headers[name_2] = setting.headers[name_2];
                    }
                }
                // 处理数据
                if (setting.data) {
                    var sData = setting.data;
                    if (setting.processData && typeof sData === 'object') {
                        if (s.type === 'GET') {
                            s.url = C.tools.url.addObj(url, sData);
                            s.data = '';
                        }
                        else if (s.contentType) {
                            // 发送数据为json时将json转为字符串
                            s.data = s.traditional ? C.tools.obj.toUri(sData) : JSON.stringify(sData);
                        }
                    }
                    else if (typeof sData === 'string') {
                        s.data = sData;
                    }
                    else if (typeof sData.toString === 'function') {
                        s.data = sData.toString();
                    }
                }
                return s;
            }
        };
        Ajax.errRes = function (xhr, statusText, errorThrown) {
            return { xhr: xhr, statusText: statusText, errorThrown: errorThrown };
        };
        Ajax.sucRes = function (response, statusText, xhr) {
            return { response: response, statusText: statusText, xhr: xhr };
        };
        Ajax.fetch = function (url, setting) {
            return new Ajax().fetch(url, setting);
        };
        return Ajax;
    }());
    C.Ajax = Ajax;
    var AjaxCache = /** @class */ (function () {
        function AjaxCache() {
            this.hashArr = [];
            this.dataArr = [];
        }
        AjaxCache.prototype.hashGet = function (s) {
            return s.url + s.data;
        };
        AjaxCache.prototype.push = function (s, data) {
            var hash = this.hashGet(s), index = this.hashArr.indexOf(hash);
            // 如果已经存在此hash 则替换上面的数据
            if (index >= 0) {
                this.dataArr[index] = data;
                return;
            }
            // 如果已经是最大长度，则先做出栈
            if (this.hashArr.length === this.max) {
                this.hashArr.shift();
                this.dataArr.shift();
            }
            this.hashArr.push(hash);
            this.dataArr.push(data);
        };
        AjaxCache.prototype.get = function (s) {
            var hash = this.hashGet(s), index = this.hashArr.indexOf(hash);
            return index >= 0 ? this.dataArr[index] : null;
        };
        AjaxCache.prototype.has = function (s) {
            return this.hashArr.indexOf(this.hashGet(s)) >= 0;
        };
        AjaxCache.prototype.clear = function () {
            this.hashArr = [];
            this.dataArr = [];
        };
        return AjaxCache;
    }());
})(C || (C = {}));

var C;
(function (C) {
    var SPA_PAGE_FLAG = '__IS_SPA_PAGE__'; // SPAPage类的标识, 用于判断路由是普通函数还是SPAPage构造函数
    C.SPA = (function (document, window) {
        var PARA_NAME = encodeURIComponent('para');
        var currentHash = '', spaItems = null, hash2data = {};
        var SPAItem = /** @class */ (function () {
            function SPAItem(_a) {
                var name = _a.name, max = _a.max, router = _a.router, container = _a.container, main = _a.main, defaultRouter = _a.defaultRouter, tab = _a.tab;
                this.name = '';
                this.pages = null;
                this.max = 10;
                this.router = null;
                this.history = null;
                this.container = null;
                this.name = name;
                this.max = max || 10;
                this.router = router;
                this.container = typeof container === 'string' ? C.d.query(container) : container;
                this.main = main;
                this.defaultRouter = defaultRouter;
                this.history = new SPAHistory(name);
                this.tabPara = tab;
            }
            // 初始化main 和 default
            SPAItem.prototype.init = function () {
                // init main
                var main = this.main;
                if (main) {
                    var _a = main.router, mainName = _a[0], mainPara = _a[1];
                    this.mainPage = this.pageCreate(mainName, mainPara, this.main.container);
                }
                var tabPara = this.tabPara;
                if (C.tools.isNotEmpty(tabPara)) {
                    this.tab = new tabPara.TabClass({ container: tabPara.container });
                }
                // init default
                if (this.defaultRouter) {
                    for (var routeName in this.defaultRouter) {
                        open(hashCreate(this.name, routeName, this.defaultRouter[routeName]));
                    }
                }
            };
            /**
             * 打开页面，内部调用
             * @param {string} hash
             */
            SPAItem.prototype.open = function (hash) {
                var _a = hashAnalyze(hash), routeName = _a.routeName, para = _a.para;
                // 防止打开main页面
                var mainName = this.main && this.main.router && this.main.router[0];
                if (!routeName || mainName === routeName) {
                    return;
                }
                var page = this.pageGet(hash), tab = this.tab;
                // debugger;
                this.clearMax();
                // 隐藏当前页面
                var currentPage = this.pageGet(currentHash);
                if (currentPage) {
                    currentPage.isShow = false;
                }
                if (page) {
                    page.isShow = true;
                }
                else {
                    page = this.pageCreate(routeName, para);
                    if (page) {
                        page['_hash'] = hash;
                        this.pages || (this.pages = []);
                        this.pages.push(page);
                        tab && tab.add(hash, page.title);
                    }
                }
                // debugger;
                this.history.add({ hash: hash });
                tab && tab.active(hash);
                return page;
            };
            SPAItem.prototype.pageCreate = function (routeName, para, container) {
                if (!this.router[routeName]) {
                    return null;
                }
                var page = null, PageConstructor = null, routerFun = this.router[routeName], mainName = this.main && this.main.router && this.main.router[0], hash = hashCreate(this.name, routeName === mainName ? '' : routeName, para), data = hash2data[hash];
                if (routerFun[SPA_PAGE_FLAG]) {
                    // 是构造函数
                    PageConstructor = routerFun;
                }
                else if (typeof routerFun === 'function') {
                    //是返回构造函数的函数
                    PageConstructor = routerFun(para ? para.slice() : null);
                }
                if (PageConstructor) {
                    page = new PageConstructor(para, data);
                    if (!page.container) {
                        page.container = container || this.container;
                        C.tools.isFunction(page.domReady) && page.domReady();
                    }
                }
                delete hash2data[hash];
                return page;
            };
            SPAItem.prototype.pageGet = function (hash) {
                if (this.pages) {
                    for (var _i = 0, _a = this.pages; _i < _a.length; _i++) {
                        var page = _a[_i];
                        if (page.hash === hash) {
                            return page;
                        }
                    }
                }
                return null;
            };
            SPAItem.prototype.clearMax = function () {
                while (this.history.length >= this.max && this.max > 0) {
                    var first = this.history.all[0];
                    this.close(first.hash);
                }
            };
            SPAItem.prototype.close = function (hash) {
                var currentPage = this.pageGet(hash);
                if (!currentPage) {
                    return;
                }
                var isCurrent = currentPage === this.pageGet(currentHash);
                currentPage.close();
                this.history.remove(hash);
                this.pages = this.pages.filter(function (page) { return page !== currentPage; });
                this.tab && this.tab.remove(hash);
                // 显示上一个页面
                if (this.history.length > 0 && isCurrent) {
                    open(this.history.last.hash);
                }
            };
            SPAItem.prototype.closeAll = function () {
                this.pages && this.pages.forEach(function (page) { return page.close(); });
                this.pages = null;
            };
            SPAItem.prototype.disappear = function () {
                Array.isArray(this.pages) && this.pages.forEach(function (page) { return page.close(); });
                this.mainPage && this.mainPage.close();
                this.tab && this.tab.destroy();
                this.tab = null;
                this.mainPage = null;
                this.pages = null;
                this.history.removeAll();
            };
            SPAItem.prototype.destroy = function () {
                this.name = '';
                this.container = null;
                this.router = null;
                this.disappear();
                this.history = null;
            };
            return SPAItem;
        }());
        /**
         * 事件初始化, 整个页面通过hashChange来
         */
        var hashChangeEvent = (function () {
            var customOnChange = null;
            var handler = function (ev) {
                // openInner(ev.newURL.split('#')[1], unusedPageData);
                hashChange(ev.newURL);
                if (C.tools.isFunction(customOnChange)) {
                    customOnChange(url2hash(ev.newURL, 1), url2hash(ev.oldURL, 1));
                }
            };
            return {
                on: function () {
                    C.d.on(window, 'hashchange', handler);
                },
                off: function () {
                    C.d.on(window, 'hashchange', handler);
                },
                onChange: function (handler) {
                    customOnChange = handler;
                }
            };
        })();
        function url2hash(url, type) {
            if (type === void 0) { type = 1; }
            var hash = url.split('#')[1];
            return type === 0 ? hash : hashAnalyze(hash);
        }
        function hashChange(url) {
            // debugger;
            var hash = url2hash(url, 0), spaName = hashAnalyze(hash).spaName;
            var spaItem = spaItems[spaName];
            if (spaItem) {
                var oldSpaName = hashAnalyze(currentHash).spaName;
                if (oldSpaName !== spaName && spaItems[oldSpaName]) {
                    // 如果换了一个单页应用, 则清理到之前的所有页面
                    spaItems[oldSpaName].disappear();
                    // 初始化新的应用
                    spaItem.init();
                }
                spaItem.open(hash);
                currentHash = hash;
            }
            // debugger;
        }
        /**
         * 初始化
         */
        function init(paras) {
            // destroy();
            if (C.tools.isEmpty(paras)) {
                return false;
            }
            spaItems = {};
            paras.forEach(function (para) {
                spaItems[para.name] = new SPAItem(para);
            });
            var hash = location.hash;
            location.hash = '';
            hashChangeEvent.on();
            //
            // // 数组第一个作为默认打开单页应用
            spaItems[paras[0].name].init();
            if (hash) {
                open(hash);
            }
        }
        /**
         * 打开页面，外部调用，其实只是修改url的hash
         */
        function open(hash, data) {
            location.hash = hash;
            hash2data[hash] = data;
        }
        /**
         * 返回
         */
        function back() {
            history.back();
        }
        /**
         * 分解url的hash值, 返回hash, routeName, para
         * @param {string} hash
         * @return
         */
        function hashAnalyze(hash) {
            if (hash) {
                var hashArr = hash.split('?'), _a = hashArr[0].split('/'), spaName = _a[1], routeName = _a[2], para = null;
                if (hashArr[1]) {
                    var search_1 = {};
                    hashArr[1].split('&').forEach(function (keyVal) {
                        var arr = keyVal.split('=');
                        search_1[arr[0]] = arr[1] || '';
                    });
                    para = typeof search_1[PARA_NAME] === 'string' ? search_1[PARA_NAME].split(',') : null;
                }
                return { spaName: spaName, routeName: routeName, para: para };
            }
            return { spaName: '', routeName: '', para: null };
        }
        function hashCreate(spaName, routeName, para) {
            spaName = encodeURIComponent(spaName);
            routeName = encodeURIComponent(routeName);
            var paraStr = Array.isArray(para) ? encodeURIComponent(para.join(',')) : '';
            return "/" + spaName + "/" + routeName + (paraStr ? "?" + PARA_NAME + "=" + paraStr : '');
        }
        function hashCompare(hash1, hash2) {
            var _a = hashAnalyze(hash1), spaName1 = _a.spaName, routeName1 = _a.routeName, para1 = _a.para, _b = hashAnalyze(hash1), spaName2 = _b.spaName, routeName2 = _b.routeName, para2 = _b.para;
            if (spaName1 === spaName2 && routeName1 === routeName2) {
                if (Array.isArray(para1) && Array.isArray(para2)) {
                }
                else {
                    return;
                }
            }
        }
        function close(hash) {
            var route = spaItems[hashAnalyze(hash).spaName];
            route.close(hash);
        }
        function destroy() {
            hashChangeEvent.off();
            hash2data = null;
            currentHash = null;
            spaItems && Object.values(spaItems).forEach(function (item) { return item.destroy(); });
            spaItems = null;
        }
        /**
         * 对外提供公共属性与方法
         */
        function pageGet(_a) {
            var routeName = _a.routeName, spaName = _a.spaName, para = _a.para;
            var route = spaItems[routeName];
            return route ? route.pageGet(hashCreate(routeName, spaName, para)) : null;
        }
        return {
            init: init, open: open, close: close, pageGet: pageGet, hashAnalyze: hashAnalyze, hashCreate: hashCreate, onChange: hashChangeEvent.onChange
        };
    })(document, window);
    var SPAPage = /** @class */ (function () {
        function SPAPage(para, data) {
            this.para = para;
            this.data = data;
            this._container = null;
            this._isShow = false;
            this.beforeClose = function (page) {
            };
            this.afterClose = function (hash) {
            };
            this.domReady = function () { };
            this.initInner();
        }
        // 初始化, 刷新
        SPAPage.prototype.initInner = function () {
            if (this.wrapper) {
                C.d.append(this.wrapper, this.wrapperInit());
            }
            this.init(this.para, this.data);
        };
        Object.defineProperty(SPAPage.prototype, "hash", {
            get: function () {
                return this._hash;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SPAPage.prototype, "wrapper", {
            get: function () {
                if (!this._wrapper) {
                    this._wrapper = this.wrapperCreate();
                }
                return this._wrapper;
            },
            enumerable: true,
            configurable: true
        });
        SPAPage.prototype.wrapperCreate = function () {
            var dom = document.createElement('div');
            dom.classList.add('page-container');
            C.d.data(dom, { hash: this.hash });
            return dom;
        };
        Object.defineProperty(SPAPage.prototype, "container", {
            get: function () {
                return this._container;
            },
            set: function (el) {
                if (el) {
                    this._container = typeof el === 'string' ? document.querySelector(el) : el;
                    C.d.append(this._container, this.wrapper);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SPAPage.prototype, "isShow", {
            get: function () {
                return this._isShow;
            },
            set: function (isShow) {
                this.wrapper && this.wrapper.classList.toggle('hide', !isShow);
                this._isShow = !!isShow;
            },
            enumerable: true,
            configurable: true
        });
        SPAPage.prototype.refresh = function () {
            this.destroy();
            this.initInner();
        };
        SPAPage.prototype.close = function () {
            this.beforeClose(this);
            this.destroy();
            this.afterClose(this._hash);
            this._hash = null;
            this.beforeClose = null;
            this.afterClose = null;
            this._container = null;
            this.para = null;
            this.data = null;
        };
        SPAPage.prototype.destroy = function () {
            C.d.remove(this._wrapper);
            this._wrapper = null;
        };
        return SPAPage;
    }());
    C.SPAPage = SPAPage;
    SPAPage[SPA_PAGE_FLAG] = true;
    var ITEM_SELECTOR = '[data-role="item"]', CLOSE_SELECTOR = '[data-role="close"]', TITLE_SELECTOR = '[data-role="title"]';
    var SPATab = /** @class */ (function () {
        function SPATab(para) {
            var _this = this;
            this.clickEvent = (function () {
                var selector = ITEM_SELECTOR + ", " + CLOSE_SELECTOR, itemHandler = function (e) {
                    var role = this.dataset.role, isClose = role === 'close', item = isClose ? C.d.closest(this, ITEM_SELECTOR) : this, hash = C.d.data(item);
                    if (isClose) {
                        C.SPA.close(hash);
                    }
                    else {
                        C.SPA.open(hash);
                    }
                    e.stopPropagation();
                };
                return {
                    on: function () {
                        C.d.on(_this.wrapper, 'click', selector, itemHandler);
                    },
                    off: function () {
                        C.d.off(_this.wrapper, 'click', selector, itemHandler);
                    }
                };
            })();
            this.items = {};
            this.wrapper = this.wrapperInit();
            this.container = para.container;
            C.d.append(this.container, this.wrapper);
            this.initInner();
            this.init();
        }
        SPATab.prototype.initInner = function () {
            this.clickEvent.on();
        };
        SPATab.prototype.init = function () { };
        ;
        SPATab.prototype.add = function (hash, title) {
            var wrapper = this.itemCreate();
            C.d.data(wrapper, hash);
            C.d.append(this.wrapper, wrapper);
            this.items[hash] = new SPATabItem({ wrapper: wrapper, hash: hash, title: title });
        };
        SPATab.prototype.remove = function (hash) {
            var items = this.items;
            items[hash].destroy();
            delete items[hash];
        };
        SPATab.prototype.get = function (hash) {
            return this.items[hash] || null;
        };
        SPATab.prototype.active = function (hash) {
            if (this._active) {
                var prev = this.get(this._active);
                prev && (prev.active = false);
            }
            var current = this.get(hash);
            if (current) {
                current.active = true;
                this._active = hash;
            }
        };
        SPATab.prototype.destroy = function () {
            Object.values(this.items).forEach(function (item) {
                item.active;
            });
            this.items = {};
            C.d.remove(this.wrapper);
            this.container = null;
            this.wrapper = null;
        };
        return SPATab;
    }());
    C.SPATab = SPATab;
    var SPATabItem = /** @class */ (function () {
        function SPATabItem(para) {
            this.wrapper = para.wrapper;
            this.hash = para.hash;
            this.title = para.title;
        }
        Object.defineProperty(SPATabItem.prototype, "titleEl", {
            get: function () {
                if (!this._titleEl) {
                    this._titleEl = C.d.query(TITLE_SELECTOR, this.wrapper);
                }
                return this._titleEl;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SPATabItem.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (str) {
                this.titleEl.innerHTML = C.tools.str.toEmpty(str);
                this._title = str;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SPATabItem.prototype, "active", {
            get: function () {
                return this.wrapper.classList.contains('active');
            },
            set: function (flag) {
                this.wrapper.classList.toggle('active', flag);
            },
            enumerable: true,
            configurable: true
        });
        SPATabItem.prototype.destroy = function () {
            C.d.remove(this.wrapper);
            this.wrapper = null;
            this._titleEl = null;
            this._title = null;
            this.hash = null;
        };
        return SPATabItem;
    }());
    var SPAHistory = /** @class */ (function () {
        function SPAHistory(spaName) {
            this._localKey = '__SAP_LOCAL_HISTORY__';
            this.isLocal = false;
            this.items = null;
            this.spaName = spaName;
        }
        Object.defineProperty(SPAHistory.prototype, "localKey", {
            get: function () {
                this.spaName = this.spaName || '';
                return this._localKey + this.spaName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SPAHistory.prototype, "all", {
            get: function () {
                return this.items ? this.items.slice() : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SPAHistory.prototype, "last", {
            get: function () {
                return this.all ? this.all.pop() : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SPAHistory.prototype, "length", {
            get: function () {
                return this.items ? this.items.length : 0;
            },
            enumerable: true,
            configurable: true
        });
        SPAHistory.prototype.add = function (newItem) {
            if (!newItem || !newItem.hash) {
                return;
            }
            var oldItemIndex = this.indexOf(newItem.hash);
            if (~oldItemIndex) {
                var oldItem = this.items.splice(oldItemIndex, 1)[0];
                newItem.data = newItem.data === void 0 ? oldItem.data : newItem.data;
            }
            this.items = this.items || [];
            this.items.push(newItem);
        };
        SPAHistory.prototype.remove = function (hash) {
            var index = this.indexOf(hash);
            if (~index) {
                this.items.splice(index, 1);
            }
        };
        SPAHistory.prototype.removeAll = function () {
            this.items = [];
        };
        SPAHistory.prototype.has = function (hash) {
            return ~this.indexOf(hash);
        };
        SPAHistory.prototype.get = function (hash) {
            var index = this.indexOf(hash);
            return index >= 0 ? this.items[index] : null;
        };
        SPAHistory.prototype.indexOf = function (hash) {
            if (!this.items) {
                return -1;
            }
            for (var i = 0, item = void 0; item = this.items[i]; i++) {
                if (item.hash === hash) {
                    return i;
                }
            }
            return -1;
        };
        return SPAHistory;
    }());
})(C || (C = {}));

var C;
(function (C) {
    C.Shell = (function (window, document) {
        var _device;
        var base = {
            get device() {
                if (!_device) {
                    _device = ShellBase.handler('deviceGet', {});
                }
                return _device;
            },
            fullScreenSet: function (fullScreen, back) {
                return ShellBase.handler('setFullScreen', { fullScreen: fullScreen }, back);
            },
            versionGet: function () {
                return ShellBase.handler('versionGet', {});
            },
            versionUpdate: function (url, back, info) {
                var versionGet = C.Shell.base.versionGet();
                return C.Ajax.fetch(url, {
                    type: 'POST',
                    data: { msg: versionGet && versionGet.data },
                    dataType: 'json'
                }).then(function (_a) {
                    var response = _a.response;
                    if (response && response.data && response.data.byteLength > 0) {
                        ShellBase.handler('versionUpdate', {
                            byteLength: response.data.byteLength,
                            file: response.data.file
                        }, back, info);
                    }
                    return response;
                });
            }
        };
        var finger = {
            get: function (para, back, info, isKeepOn) {
                if (isKeepOn === void 0) { isKeepOn = false; }
                return ShellBase.handler('fingerGet', para, back, info, isKeepOn);
            },
            cancel: function (back) {
                ShellBase.eventOff('fingerGet');
                return ShellBase.handler('fingerCancel', {}, back);
            },
            verify: function (enterFinger, matchFinger, fingerType) {
                return ShellBase.handler('fingerVerify', {
                    enterFinger: enterFinger,
                    matchFinger: matchFinger,
                    fingerType: fingerType // 是那一种指纹器，值为0或1或2
                });
            }
        };
        var file = {
            save: function (path, file, isAppend, back, info) {
                if (isAppend === void 0) { isAppend = false; }
                return ShellBase.handler('fileSave', {
                    path: path,
                    file: file,
                    isAppend: isAppend // false覆盖，true添加
                }, back, info);
            },
            syncSave: function (path, file, isAppend) {
                if (isAppend === void 0) { isAppend = false; }
                return ShellBase.handler('fileSave', {
                    path: path,
                    file: file,
                    isAppend: isAppend // false覆盖，true添加
                });
            },
            remove: function (path, back, info) {
                return ShellBase.handler('fileDelete', {
                    path: path
                }, back, info);
            },
            syncRemove: function (path) {
                return ShellBase.handler('fileDelete', {
                    path: path
                });
            },
            directoryDelete: function (path) {
                return ShellBase.handler('directoryDelete', {
                    path: path
                });
            },
            unZip: function (path, outdir, back, info) {
                return ShellBase.handler('fileUnzip', {
                    path: path,
                    outdir: outdir
                }, back, info);
            },
            syncUnZip: function (path, outdir) {
                return ShellBase.handler('fileUnzip', {
                    path: path,
                    outdir: outdir
                });
            },
            read: function (path, back, info) {
                return ShellBase.handler('fileRead', {
                    path: path
                }, back, info);
            },
            syncRead: function (path) {
                return ShellBase.handler('fileRead', {
                    path: path
                });
            },
        };
        var casio = {
            upload: function (port, speed, back, infor) {
                var innerBack = function () {
                    back(ShellBase.handler('casioDataGet', {}));
                };
                return ShellBase.handler('casioUpload', { port: port, speed: speed }, innerBack, infor);
            },
            download: function (port, speed, data, back, infor) {
                return ShellBase.handler('casioDownload', { port: port, speed: speed }, back, infor);
            }
        };
        var sqlite = (function () {
            function query(str, back) {
                return back ? ShellBase.handler('sqliteQuery', { query: str }, back) :
                    ShellBase.handler('sqliteQuery', { query: str });
            }
            return { query: query };
        })();
        var rfid = (function () {
            // comPort:"COM1",comBaud:115200
            // ipAddress:"192.168.1.234",ipPort:100
            // config :{led:true;buzzer:false;power:5}
            function start(str, num, back) {
                // 判断是否是ip
                var data = str.split('.').length === 4 ? { ipAddress: str, ipPort: num } : { comPort: str, comBaud: num };
                return ShellBase.handler('rfidStart', data, back, null, false);
            }
            function reset(str, num, back) {
                var data = str.split('.').length === 4 ? { ipAddress: str, ipPort: num } : { comPort: str, comBaud: num };
                return ShellBase.handler('rfidReset', data, back, null, false);
            }
            function config(str, num, config, back) {
                // 判断是否是ip
                var data = str.split('.').length === 4 ? { ipAddress: str, ipPort: num } : { comPort: str, comBaud: num };
                // document.body.innerHTML = JSON.stringify( Object.assign(data, {config}));
                return ShellBase.handler('rfidConfig', Object.assign(data, { config: config }), back, null, false);
            }
            function stop(back) {
                // ShellBase.eventOff('rfidStart');
                return ShellBase.handler('rfidStop', null, back);
            }
            return { start: start, stop: stop, config: config, reset: reset };
        })();
        var startUp = {
            start: function (autoStart) {
                return ShellBase.handler('setAutoStart', { autoStart: autoStart });
            },
            query: function () {
                return ShellBase.handler('queryAutoStart', {});
            },
            shutDown: function (back) {
                return ShellBase.handler('powerOff', {}, back);
            }
        };
        var printer = {
            get: function () {
                return ShellBase.handler('printersGet', {});
            },
            labelPrint: function (quantity, driveCode, image, back) {
                return ShellBase.handler('labelPrint', { quantity: quantity, driveCode: driveCode, image: image }, back);
            }
        };
        var inventory = {
            getDeviceAddress: function () {
                return ShellBase.handler('getDeviceAddress', function (res) {
                    alert(res);
                });
            },
            loadData: function (url, uploadUrl, inventoryKey, back) {
                return ShellBase.handler('loadData', { url: url, uploadUrl: uploadUrl, inventoryKey: inventoryKey }, back);
            },
            uploadData: function (url, inventoryKey, back) {
                return ShellBase.handler('uploadData', { url: url, inventoryKey: inventoryKey }, back);
            },
            insertData: function (data, inventoryKey, back) {
                return ShellBase.handler('insertData', { data: data, inventoryKey: inventoryKey }, back);
            },
            delData: function (data, inventoryKey, back) {
                return ShellBase.handler('delData', { data: data, inventoryKey: inventoryKey }, back);
            },
            clearData: function (dbName, back) {
                return ShellBase.handler('clearData', { dbName: dbName }, back);
            },
            rfidOpen: function (back) {
                return ShellBase.handler('rfid', { type: 'open' }, back, null, false);
            },
            rfidClose: function (back) {
                ShellBase.eventOff('rfid');
                return ShellBase.handler('rfid', { type: 'close' }, back);
            },
            /**
             *
             * @param {obj} value - 获取频段
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            getBand: function (value, back) {
                return ShellBase.handler('rfid', { type: 'getBand', value: value }, back);
            },
            /**
             *
             * @param {obj} value - 获取功率
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            getMinMaxBand: function (value, back) {
                return ShellBase.handler('rfid', { type: 'getMinMaxBand', value: value }, back);
            },
            /**
             *
             * @param {obj} value - 开始盘点
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            startCheck: function (value, back) {
                return ShellBase.handler('rfid', { type: 'startCheck', value: value }, back, null, false);
            },
            stopCheck: function (value, back) {
                ShellBase.eventOff('rfid');
                return ShellBase.handler('rfid', { type: 'endCheck', value: value }, back);
            },
            /**
             *
             * @param {obj} value - 设置参数
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            rfidSetParam: function (value, back) {
                return ShellBase.handler('rfid', { type: 'setParam', value: value }, back);
            },
            /**
             *
             * @param {obj} value - 获取设置参数
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            rfidGetParam: function (value, back) {
                return ShellBase.handler('rfid', { type: 'getParam', value: value }, back);
            },
            /**
             *
             * @param {obj} value - 开始找货
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            findGoods: function (value, back) {
                return ShellBase.handler('rfid', { type: 'findGoods', value: value }, back, null, false);
            },
            /**
             *
             * @param {obj} value - 停止找货
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            stopFind: function (value, back) {
                ShellBase.eventOff('rfid');
                return ShellBase.handler('rfid', { type: 'stopFind', value: value }, back);
            },
            /**
             *
             * @param {obj} value - 开始扫描epc
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            startEpc: function (value, back) {
                return ShellBase.handler('rfid', { type: 'startEpc', value: value }, back, null, false);
            },
            stopEpc: function (value, back) {
                ShellBase.eventOff('rfid');
                return ShellBase.handler('rfid', { type: 'stopEpc', value: value }, back);
            },
            /**
             *
             * @param {obj} value - clearEpc 清除epc
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            clearEpc: function (value, back) {
                return ShellBase.handler('rfid', { type: 'clearEpc', value: value }, back);
            },
            setPwm: function (value, back) {
                return ShellBase.handler('rfid', { type: 'setPwm', value: value }, back);
            },
            getPwn: function (back) {
                return ShellBase.handler('rfid', { type: 'getPwm' }, back);
            },
            /**
             *
             * @param {obj} value - 打开扫码功能
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            openScan: function (back) {
                return ShellBase.handler('supon', { type: 'openScanFunction' }, back, null, false);
            },
            /**
             *
             * @param {obj} value - 关闭扫码功能
             * * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            closeScan: function (back) {
                ShellBase.eventOff('supon');
                return ShellBase.handler('supon', { type: 'closeScanFunction' }, back, null, false);
            },
            /**
             *
             * @param {obj} value -加载盘点数据（已下载的本地的盘点数据，包括已盘点与未盘点）
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            getData: function (inventoryKey, field, back) {
                return ShellBase.handler('getData', { inventoryKey: inventoryKey, field: field }, back, null, false);
            },
            getScanCount: function (summary, back) {
                return ShellBase.handler('getScanCount', { summary: summary }, back, null, false);
            },
            // scan2dOn(back: IShellEventHandler) {
            //     return ShellBase.handler('startScan2DResult', '', back, null, false);
            // },
            // scan2dOff() {
            //     ShellBase.eventOff('startScan2DResult');
            //     return ShellBase.handler('closeScan2D', '')
            // },
            get canRfid() {
                if (!C.tools.os.android) {
                    return false;
                }
                var isSupport = ShellBase.handler('isSupport', 'rfid');
                if (typeof isSupport === 'object') {
                    return isSupport.data;
                }
                else {
                    return isSupport;
                }
            },
            get can2dScan() {
                if (!C.tools.os.android) {
                    return false;
                }
                var isSupport = ShellBase.handler('isSupport', '2dScan');
                if (typeof isSupport === 'object') {
                    return isSupport.data;
                }
                else {
                    return isSupport;
                }
            }
        };
        return {
            base: base, finger: finger, file: file, casio: casio, sqlite: sqlite, printer: printer, rfid: rfid, inventory: inventory, startUp: startUp
        };
    })(window, document);
    var ShellTypes;
    (function (ShellTypes) {
        ShellTypes[ShellTypes["IOS"] = 0] = "IOS";
        ShellTypes[ShellTypes["ANDROID"] = 1] = "ANDROID";
        ShellTypes[ShellTypes["WINDOWS"] = 2] = "WINDOWS";
    })(ShellTypes || (ShellTypes = {}));
    var ShellBase = (function () {
        var userAgent = navigator.userAgent || navigator.vendor, shellType = typeDetect(), shellHandler = windowsHandler, action2eventName = {};
        function eventNameGet() {
            return '__SHELL_EVENT__' + C.tools.getGuid();
        }
        function eventOff(action) {
            var events = action2eventName[action] || [];
            events.forEach(function (event) { return C.d.off(window, event); });
            delete events[action];
        }
        function windowsHandler(action, data, back, infor, isAutoOff) {
            if (isAutoOff === void 0) { isAutoOff = true; }
            if (typeof AppShell === 'object' && C.tools.isFunction(AppShell.asyncFunction) && C.tools.isFunction(AppShell.syncFunction)) {
                var dataStr = typeof data === 'string' ? data : JSON.stringify(data);
                if (C.tools.isEmpty(back) && C.tools.isEmpty(infor)) {
                    return JSON.parse(AppShell.syncFunction(action, dataStr));
                }
                else {
                    // 生成唯一事件名称
                    var eventBack_1 = back ? eventNameGet() : '', eventInfor_1 = infor ? eventNameGet() : '';
                    // 异步调用
                    var flag = AppShell.asyncFunction(action, dataStr, eventBack_1, eventInfor_1);
                    // 过程通知
                    if (flag) {
                        if (!isAutoOff) {
                            action2eventName[action] = action2eventName[action] || [];
                            var events = action2eventName[action];
                            events.push(eventBack_1, eventInfor_1);
                        }
                        if (eventInfor_1) {
                            C.d.on(window, eventInfor_1, function (e) {
                                // alert(typeof e.detail === 'string' ? e.detail : e);
                                var detail = e.detail;
                                infor(typeof detail === 'string' ? JSON.parse(detail) : detail);
                            });
                        }
                        // 异步完成通知
                        if (eventBack_1) {
                            C.d.on(window, eventBack_1, function (e) {
                                var detail = e.detail;
                                if (isAutoOff) {
                                    C.d.off(window, eventInfor_1);
                                    C.d.off(window, eventBack_1);
                                }
                                try {
                                    detail = typeof detail === 'string' ? JSON.parse(detail) : detail;
                                }
                                catch (e) {
                                    alert('JSON解析错误');
                                    return;
                                }
                                // alert(JSON.stringify(e.detail));
                                back(detail);
                            });
                        }
                    }
                    return flag;
                }
            }
            else {
                return false;
            }
        }
        // function androidHandler() {
        //
        // }
        // function iosHandler() {
        //
        // }
        function typeDetect() {
            if (/OursAndroid/i.test(userAgent)) {
                return ShellTypes.ANDROID;
            }
            if (/OursIos/i.test(userAgent)) {
                return ShellTypes.IOS;
            }
            if (/OursWindows/.test(userAgent)) {
                return ShellTypes.WINDOWS;
            }
            return -1;
        }
        return {
            eventOff: eventOff,
            get handler() {
                return shellHandler;
            }
        };
    })();
})(C || (C = {}));

/**
 * 规则
 */
var C;
(function (C) {
    var Rule = /** @class */ (function () {
        function Rule() {
        }
        Rule.isNumber = function (dataType) {
            return [Rule.DT_NUMBER, Rule.DT_MONEY, Rule.DT_PERCENT].indexOf(dataType) >= 0;
        };
        Rule.easyLocalString = function (num, minFraction) {
            if (minFraction === void 0) { minFraction = 0; }
            num = num.toString();
            var dotNum = num.split('.'), intNumArr = dotNum[0].split(''), fraction = dotNum[1] === void 0 ? '' : dotNum[1], // 小数部分
            minus = intNumArr[0] === '-';
            // 整数补充逗号
            for (var pos = intNumArr.length - 3; intNumArr[pos]; pos -= 3) {
                // console.log(123);
                if ((minus && pos === 1) || pos === 0) {
                    break;
                }
                intNumArr.splice(pos, 0, ',');
            }
            dotNum[0] = intNumArr.join('');
            // 小数点补全位数
            for (var fraLen = fraction.length; fraLen < minFraction; fraLen++) {
                fraction += '0';
            }
            if (fraction.length) {
                dotNum[1] = fraction;
            }
            return dotNum.join('.');
        };
        Rule.parseNumber = function (number, displayFormat) {
            var formatArr, hasDot;
            if (!C.tools.isEmpty(displayFormat) && typeof number === 'number') {
                formatArr = displayFormat.split('.');
                hasDot = formatArr[1] !== undefined;
            }
            else {
                return number;
            }
            if (hasDot) {
                var afterDot = formatArr[1];
                var beforeDot = formatArr[0];
                //0.00 ...
                number = number.toFixed(afterDot.length);
                //0.## ...
                if (afterDot[0] === '#') {
                    number = number.replace(Rule.parseNumberReg, function (match, p1, p2, p3) {
                        if (p1 === '.' && C.tools.isEmpty(p2)) {
                            //去.
                            return '';
                        }
                        else {
                            //去0
                            return p1 + p2;
                        }
                    });
                }
                if (beforeDot[0] === '#') {
                    var dotNum = number.split('.');
                    var len = !C.tools.isEmpty(dotNum[1]) ? dotNum[1].length : 0;
                    number = Rule.easyLocalString(number, len);
                }
            }
            else {
                // 格式为 "###,###", 因为displayFormat不包含"."符号
                number = Math.round(number);
                if (number >= 1000) {
                    number = Rule.easyLocalString(number);
                }
            }
            return number;
        };
        /**
         *
         * @param {string | number} text
         * @param {object} formats
         * @param {string} formats.dataType
         * @param {string} [formats.displayFormat]
         * @param {string} [formats.trueExpr = 1]
         * @param {int} [formats.displayWidth = 0]
         * @param {boolean} [isWidth = true] - displayWidth参数是否有效
         * @param {boolean} [isNum = false] - 是否传参为字符串型数字
         * @return {string}
         */
        Rule.formatText = function (text, formats, isWidth, isNum) {
            if (isWidth === void 0) { isWidth = true; }
            if (isNum === void 0) { isNum = false; }
            if (formats.atrrs) {
                formats.dataType = formats.dataType || formats.atrrs.dataType;
                formats.displayFormat = formats.displayFormat || formats.atrrs.displayFormat;
                formats.trueExpr = formats.trueExpr || formats.atrrs.trueExpr;
                formats.displayWidth = formats.displayWidth || formats.atrrs.displayWidth;
            }
            var formatStr = '', formatsSetting = {
                trueExpr: '1',
                displayWidth: 0
            }, f = C.tools.obj.merge(formatsSetting, formats), dataType = f.dataType, displayFormat = f.displayFormat, trueExpr = f.trueExpr ? f.trueExpr : 1;
            if (C.tools.isEmpty(text)) {
                return formatStr;
            }
            // 如果是数字类型，但值却不是数字，则不处理直接显示
            if (Rule.isNumber(dataType) && typeof text !== 'number' && !isNum) {
                formatStr = text;
            }
            else {
                switch (dataType) {
                    case Rule.DT_NUMBER:
                        // 数值
                        formatStr = Rule.parseNumber(text, displayFormat);
                        break;
                    case Rule.DT_MONEY:
                        //￥#,### 货币代码 + 数值格式
                        formatStr = '¥' + Rule.parseNumber(text, displayFormat.slice(1));
                        break;
                    case Rule.DT_DATETIME:
                    case Rule.DT_TIME:
                        //YYYY-MM-DD HH24:MI:SS 日期
                        //HH24:MI:SS 时间
                        formatStr = Rule.strDateFormat(text, displayFormat);
                        break;
                    case Rule.DT_PERCENT:
                        //百分比
                        formatStr = Rule.parseNumber(text * 100, displayFormat.slice(0, -1)) + '%';
                        break;
                    case Rule.DT_BOOL:
                        //布尔
                        // 临时 双等号, 目前不清楚是否可以确定类型
                        formatStr = (text == trueExpr) ? '是' : '否';
                        break;
                    case Rule.DT_MULTI_TEXT:
                        formatStr = "<pre>" + text + "</pre>";
                        break;
                    case Rule.DT_HTML:
                    default:
                        formatStr = text.toString();
                }
            }
            if (isWidth && f.displayWidth > 0) {
                formatStr = C.tools.str.cut(formatStr, f.displayWidth);
            }
            return formatStr;
        };
        ;
        /**
         * 表格数据展示
         * @param {string | number} text
         * @param {object} formats
         * @param {string} formats.dataType
         * @param {string} [formats.displayFormat]
         * @param {string} [formats.trueExpr = 1]
         * @param {int} [formats.displayWidth = 0]
         * @return {string} - 返回处理后的文字，与文字的位置(左右对齐)
         */
        Rule.formatTableText = function (text, formats) {
            var t = Rule.formatText(text, formats, false);
            if (formats.atrrs) {
                formats.dataType = formats.dataType || formats.atrrs.dataType;
            }
            switch (formats.dataType) {
                case Rule.DT_HTML:
                case Rule.DT_MULTI_TEXT:
                    t = C.tools.str.removeEmpty(C.tools.str.removeHtmlTags(text));
                    break;
                case Rule.DT_FILE:
                    if (!C.tools.isEmpty(t)) {
                        t = '<span title="' + t + '" class="ti-clip"></span> ' + t;
                    }
                    break;
            }
            return t;
        };
        ;
        Rule.dateFormat = function (date, fmt) {
            var o = {
                "M+": date.getMonth() + 1,
                "d+": date.getDate(),
                "H+": date.getHours(),
                "m+": date.getMinutes(),
                "s+": date.getSeconds(),
                "S": date.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        };
        Rule.strDateFormat = function (dateStr, fmt) {
            var date = new Date(dateStr);
            if (!isNaN(date.getTime()) && fmt) {
                return Rule.dateFormat(date, fmt);
            }
            return dateStr;
        };
        Rule.reqAddr = function (reqAddr, dataObj) {
            // console.log(reqAddr, dataObj);
            var _a = this.reqAddrFull(reqAddr, dataObj), addr = _a.addr, data = _a.data;
            // console.log(addr,111111111 ,data);
            return C.tools.url.addObj(addr, data);
        };
        Rule.reqAddrFull = function (reqAddr, data) {
            if (!this.reqAddrCommit[reqAddr.commitType]) {
                reqAddr.commitType = 1;
            }
            return this.reqAddrCommit[reqAddr.commitType](reqAddr, data);
        };
        /**
         * 解析varList数据
         * @param {Array} varList - 服务端的varList
         * @param {String} varList.varName
         * @param {String} varList.varValue
         * @param {Object} data - 需要填充varList的数据, 一般是数据查询的数据
         * @param {boolean} [isLowerKey] 键值是否转为小写
         * @returns {object}
         */
        Rule.varList = function (varList, data, isLowerKey) {
            if (varList === void 0) { varList = []; }
            if (isLowerKey === void 0) { isLowerKey = false; }
            if (typeof data === 'undefined') {
                return {};
            }
            var isMulti = Array.isArray(data);
            isMulti || (data = [data]);
            varList = Array.isArray(varList) ? varList : [];
            var varData = data.map(function (d) {
                var tmpData = {};
                varList.forEach(function (v) {
                    var value = null, varName = v.varName;
                    if (d[varName] !== null && d[varName] !== undefined) {
                        //优先从用户给的data取值
                        value = d[varName];
                    }
                    else if (!C.tools.isEmpty(v.varValue)) {
                        //再从服务器给的value
                        value = v.varValue;
                    }
                    // if (value !== null) {
                    var key = isLowerKey ? varName.toLowerCase() : varName;
                    tmpData[key] = value;
                    // }
                });
                return tmpData;
            });
            if (isMulti) {
                varData = varData.filter(function (data) { return !C.tools.isEmpty(data); });
                if (C.tools.isEmpty(varData)) {
                    varData = null;
                }
            }
            return isMulti ? varData : varData[0];
        };
        Rule.DT_NUMBER = '10'; //数值
        Rule.DT_MONEY = '11'; // ￥#,### 货币代码 + 数值格式
        Rule.DT_DATETIME = '12'; // YYYY-MM-DD HH24:MI:SS 日期
        Rule.DT_TIME = '13'; // HH24:MI:SS 时间
        Rule.DT_PERCENT = '14'; // 百分比
        Rule.DT_BOOL = '17'; // 布尔
        Rule.DT_IMAGE = '20'; // 图片
        Rule.DT_MUL_IMAGE = '22'; // 多图
        Rule.DT_HTML = '30'; // 超文本
        Rule.DT_MULTI_TEXT = '31'; // 显示时保留空格与换行的文本
        Rule.DT_FILE = '43'; // 文件
        /**
         * 生成fieldList中的数据显示的格式
         */
        Rule.parseNumberReg = /(\.)(\d*[1-9]+)?(0+)$/;
        Rule.reqAddrCommit = {
            1: function (reqAddr, data) {
                var varData = Rule.varList(reqAddr.varList, data, true), urlPara = {};
                if (reqAddr.varType === 2) {
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
                    if (!C.tools.isEmpty(reqAddr.varList) && !reqAddr.varList[1]) {
                        //长度等于1
                        var varName = reqAddr.varList[0].varName.toLowerCase();
                        urlPara['selection'] = urlPara[varName];
                        delete urlPara[varName];
                    }
                    for (var key in urlPara) {
                        var para = urlPara[key];
                        if (Array.isArray(para)) {
                            urlPara[key.toLocaleLowerCase()] = para.join(',');
                        }
                    }
                }
                return {
                    addr: reqAddr.dataAddr,
                    data: reqAddr.varType === 2 ? urlPara : varData
                };
            },
        };
        return Rule;
    }());
    C.Rule = Rule;
})(C || (C = {}));

var C;
(function (C) {
    // export let localUser = (function () {
    //     let u = window.localStorage.getItem('local_uuid_info');
    //     let uu = window.localStorage.getItem('local_user_info');
    //     let autoFillInput = window.localStorage.getItem('local_autoFillInput');
    //     try{
    //         u = u ? JSON.parse(u) : {};
    //         uu = uu ? JSON.parse(uu) : {};
    //     }catch(e){
    //     }
    //     return {
    //         /**
    //          * 获取用户资料
    //          * @param {string }[field]
    //          * @return {*}
    //          */
    //         getUser: function (field) {
    //             return typeof field === 'undefined' ? u : u[field.toUpperCase()];
    //         },
    //         setUser: function (user) {
    //             u = user;
    //             window.localStorage.setItem('local_uuid_info', JSON.stringify(user));
    //         },
    //         getUUser: function (field?) {
    //             return typeof field === 'undefined' ? uu : uu[field.toUpperCase()];
    //         },
    //         setUUser: function (user) {
    //             uu = user;
    //             window.localStorage.setItem('local_user_info', JSON.stringify(user));
    //         },
    //         isSavePassword: autoFillInput,
    //         setSavePassword: function (state) {
    //             if (state) {
    //                 window.localStorage.setItem('local_autoFillInput', '1');
    //             } else {
    //                 window.localStorage.removeItem('local_autoFillInput');
    //             }
    //         },
    //
    //         /**
    //          *
    //          * @param type 1指纹登录 0 密码登录
    //          */
    //         setLoginMethod: function (type) {
    //             window.localStorage.setItem('TouchIdLogin', type);
    //         },
    //         getCurrentUserId: function () {
    //             return this.getUser('userid');
    //         }
    //     }
    // })();
    C.localMsg = (function () {
        var _storage = window.localStorage;
        var _get = function () {
            var s = _storage.getItem('local_msg');
            return s ? JSON.parse(s) : [];
        };
        var _save = function (array) {
            if (!Array.isArray(array)) {
                array = [];
            }
            _storage.setItem('local_msg', JSON.stringify(array));
        };
        var _add = function (arr) {
            //     console.log(_get(), arr);
            //  alert(JSON.stringify(arr) + '11');
            _save(arr.concat(_get()));
        };
        var _read = function (notifyId) {
            var t = _get();
            var l = t.length;
            for (var i = 0; i < l; i++) {
                if (t[i].notifyId === notifyId) {
                    //    console.log(t[i]);
                    t[i].isread = 1;
                    break;
                }
            }
            _save(t);
        };
        var _remove = function (notifyId) {
            var t = _get();
            var l = t.length;
            for (var i = 0; i < l; i++) {
                if (t[i].notifyId === notifyId) {
                    t.splice(i, 1);
                    break;
                }
            }
            _save(t);
        };
        var _getUnreadCount = function () {
            var count = 0;
            _get().forEach(function (m) {
                if (m.isread === 0) {
                    count++;
                }
            });
            return count;
        };
        return {
            remove: _remove,
            get: _get,
            add: _add,
            read: _read,
            getUnreadCount: _getUnreadCount
        };
    }());
    // export class IDB{
    //
    //     private dbName = 'BW';
    //     private request: IDBOpenDBRequest = null;
    //
    //     private static open() {
    //
    //     }
    //
    //
    // }
})(C || (C = {}));

var C;
(function (C) {
    C.requireBaseUrl = '';
    function setRequire(config, urlArg) {
        if (typeof config.bundles === 'object') {
            for (var key in config.bundles) {
                config.bundles[config.baseUrl + key] = config.bundles[key];
                delete config.bundles[key];
            }
        }
        C.requireBaseUrl = config.baseUrl;
        require.config({
            baseUrl: config.baseUrl,
            paths: C.tools.obj.merge({
                tableExport: ['../plugin/tableExport.min'],
                JsBarcode: ['../plugin/qrcode/JsBarcode.all.min'],
                QRCode: ['../plugin/qrcode/qrcode.min'],
                echarts: ['../plugin/echarts/echarts.min'],
                photoSwipe: ['../plugin/photoswipe/photoswipe.min'],
                photoSwipeUi: ['../plugin/photoswipe/photoswipe-ui-default.min'],
                webUpLoader: ['../plugin/webupload/webuploader'],
                md5: ['../plugin/webupload/md5'],
                tagsInput: ['../plugin/bootstrap/bootstrap-tagsinput/bootstrap-tagsinput'],
                froalaEditor: ['../plugin/js/froala_editor.min'],
                summernote: ['../plugin/bootstrap/summernote/summernote'],
                reconnectingWebscoket: ['../plugin/reconnecting-websocket-1.0.1'],
                flatpickr: ['../plugin/flatpickr/flatpickr.min.1'],
                AceEditor: ['../plugin/aceEditor/ace'],
            }, config.paths),
            bundles: C.tools.obj.merge({
            // 'utils' : ['Validate','Draw','BarCode','QrCode','Statistic','Echart','DrawSvg']
            }, config.bundles),
            shim: {
                AceEditor: {
                    exports: 'AceEditor'
                },
                JsBarcode: {
                    exports: 'JsBarcode'
                },
                QRCode: {
                    exports: 'QRCode'
                },
                echarts: {
                    exports: 'echarts'
                },
                webUpLoader: {
                    exports: 'webUpLoader'
                },
                tagsInput: {
                    exports: 'tagsInput'
                },
                md5: {
                    exports: 'md5'
                },
            },
            map: {
                '*': {
                    'css': 'require.css'
                }
            }
        });
    }
    C.setRequire = setRequire;
})(C || (C = {}));

/**
 * 本文件用于gulp打包时引用，防止找不到变量G
 */
/// <reference path="pollfily.ts"/>
/// <reference path="rule.ts"/>
/// <reference path="storage.ts"/>
/// <reference path="tools.ts"/>
/// <reference path="dom.ts"/>
/// <reference path="requireConfig.ts"/>
/// <reference path="ajax.ts"/>
/// <reference path="spa.ts"/>
/// <reference path="shell.ts"/>

!Object.values && (Object.values = function (obj) {
    if (obj !== Object(obj))
        throw new TypeError('Object.values called on a non-object');
    var val = [], key;
    for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            val.push(obj[key]);
        }
    }
    return val;
});
if (typeof Object.assign != 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
        value: function assign(target, varArgs) {
            'use strict';
            if (target == null) { // TypeError if undefined or null
                throw new TypeError('Cannot convert undefined or null to object');
            }
            var to = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];
                if (nextSource != null) { // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
        writable: true,
        configurable: true
    });
}
Promise && (Promise.prototype.finally = function (callback) {
    var P = this.constructor;
    return this.then(function (value) { return P.resolve(callback()).then(function () { return value; }); }, function (reason) { return P.resolve(callback()).then(function () { throw reason; }); });
});
!Array.from && (Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
        return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
        var number = Number(value);
        if (isNaN(number)) {
            return 0;
        }
        if (number === 0 || !isFinite(number)) {
            return number;
        }
        return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
        var len = toInteger(value);
        return Math.min(Math.max(len, 0), maxSafeInteger);
    };
    // The length property of the from method is 1.
    return function from(arrayLike /*, mapFn, thisArg */) {
        // 1. Let C be the this value.
        var C = this;
        // 2. Let items be ToObject(arrayLike).
        var items = Object(arrayLike);
        // 3. ReturnIfAbrupt(items).
        if (arrayLike == null) {
            throw new TypeError('Array.from requires an array-like object - not null or undefined');
        }
        // 4. If mapfn is undefined, then let mapping be false.
        var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
        var T;
        if (typeof mapFn !== 'undefined') {
            // 5. else
            // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
            if (!isCallable(mapFn)) {
                throw new TypeError('Array.from: when provided, the second argument must be a function');
            }
            // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
            if (arguments.length > 2) {
                T = arguments[2];
            }
        }
        // 10. Let lenValue be Get(items, "length").
        // 11. Let len be ToLength(lenValue).
        var len = toLength(items.length);
        // 13. If IsConstructor(C) is true, then
        // 13. a. Let A be the result of calling the [[Construct]] internal method 
        // of C with an argument list containing the single item len.
        // 14. a. Else, Let A be ArrayCreate(len).
        var A = isCallable(C) ? Object(new C(len)) : new Array(len);
        // 16. Let k be 0.
        var k = 0;
        // 17. Repeat, while k < len… (also steps a - h)
        var kValue;
        while (k < len) {
            kValue = items[k];
            if (mapFn) {
                A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
            }
            else {
                A[k] = kValue;
            }
            k += 1;
        }
        // 18. Let putStatus be Put(A, "length", len, true).
        A.length = len;
        // 20. Return A.
        return A;
    };
}()));
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function (searchElement, fromIndex) {
            if (fromIndex === void 0) { fromIndex = 0; }
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var o = Object(this);
            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;
            // 3. If len is 0, return false.
            if (len === 0) {
                return false;
            }
            // 5. If n ≥ 0, then
            //  a. Let k be n.
            // 6. Else n < 0,
            //  a. Let k be len + n.
            //  b. If k < 0, let k be 0.
            var k = Math.max(fromIndex >= 0 ? fromIndex : len - Math.abs(fromIndex), 0);
            // 7. Repeat, while k < len
            while (k < len) {
                // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                // b. If SameValueZero(searchElement, elementK) is true, return true.
                // c. Increase k by 1.
                // NOTE: === provides the correct "SameValueZero" comparison needed here.
                if (o[k] === searchElement) {
                    return true;
                }
                k++;
            }
            // 8. Return false
            return false;
        }
    });
}
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object['setPrototypeOf'] ||
        ({ __proto__: [] } instanceof Array && function (d, b) {
            d.__proto__ = b;
        }) ||
        function (d, b) {
            for (var p in b)
                if (b.hasOwnProperty(p))
                    d[p] = b[p];
        };
    return function (d, b) {
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

///<amd-module name="IDB"/>
define("IDB", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = C.tools;
    var IDB = /** @class */ (function () {
        function IDB(name, version, tableConf) {
            var _this = this;
            this.tableConf = tableConf;
            this.db = null;
            this.collectors = {};
            /**
             *
             * @param {string} eventName
             * @param {Function} callback
             */
            // on(eventName: string, callback:Function){
            //
            // }
            /*
            * 定义打开indexedDB 成功后的事件
            * */
            this._success = function () {
            };
            /*
            * 打开数据库
            * */
            this.dbName = name;
            var request = indexedDB.open(name, version);
            /*
            * 打开成功调用onupgradeneeded
            * */
            this.promise = new Promise(function (resolve, reject) {
                request.onsuccess = function (e) {
                    _this.db = e.target.result;
                    _this._success(e);
                    resolve(e);
                };
                request.onerror = function (e) {
                    reject(e);
                    return null; //('打开indexDB失败');
                };
            });
            /*
            * 版本升级调用onupgradeneeded
            */
            request.onupgradeneeded = function (e) {
                _this.db = e.target.result;
                _this.constructChange(tableConf);
            };
            /*
            * 上一个数据库未关闭，重新打开新版本数据库
            * */
            request.onblocked = function () {
                return null;
            };
        }
        IDB.prototype.then = function (success) {
            var _this = this;
            this.promise.then(function (e) {
                for (var name_1 in _this.tableConf) {
                    var store = _this.collection(name_1);
                    typeof success === 'function' && success(store);
                }
            });
        };
        IDB.prototype.catch = function (error) {
            this.promise.catch(error);
        };
        /*
         * 数据库结构定义
         *
         * 根据construct配置创建数据仓库ObjectStore
         * construct => {[ 'keyPath', 'index', 'index'...]}
         * */
        IDB.prototype.constructChange = function (tableConf) {
            for (var attr in tableConf) {
                if (!this.db.objectStoreNames.contains(attr)) {
                    var store = this.db.createObjectStore(attr, {
                        keyPath: tableConf[attr][0]
                    });
                    for (var i = 1, len = tableConf[attr].length; i < len; i++) {
                        store.createIndex(tableConf[attr][i], tableConf[attr][i], { unique: false });
                    }
                }
            }
        };
        /*
        * 获取操作objectStore的对象
        * */
        IDB.prototype.collection = function (storeName) {
            if (tools.isEmpty(this.collectors[storeName])) {
                if (this.db.objectStoreNames.contains(storeName)) {
                    this.collectors[storeName] = new IDBCollection(this.db, storeName);
                }
            }
            if (!tools.isEmpty(this.collectors[storeName])) {
                return this.collectors[storeName];
            }
            else {
                return null;
            }
            // if(this.db.objectStoreNames.contains(storeName)) {
            //     this.collectors[storeName] = new IDBCollection(this.db, storeName);
            //     return this.collectors[storeName];
            // }else{
            //    return null;//('没有创建'+ storeName + '数据仓库');
            // }
        };
        Object.defineProperty(IDB.prototype, "success", {
            set: function (cb) {
                this._success = cb;
            },
            enumerable: true,
            configurable: true
        });
        IDB.prototype.deleteDatabase = function () {
            this.db.close();
            window.indexedDB.deleteDatabase(this.dbName);
        };
        /*
        * 关闭数据库
        * */
        IDB.prototype.destroy = function () {
            this.db.close();
        };
        return IDB;
    }());
    exports.IDB = IDB;
    var IDBCollection = /** @class */ (function () {
        function IDBCollection(db, storeName) {
            this.db = db;
            this.storeName = storeName;
            this.store = db.transaction(storeName, 'readwrite').objectStore(storeName);
        }
        /*
        * 添加数据，主键相同不覆盖
        * data => 插入的数据
        * callback => 回调函数
        * */
        IDBCollection.prototype.insert = function (data, callback) {
            var request = this.store.add(data);
            request.onsuccess = function (e) {
                typeof callback === 'function' && callback(e);
            };
            request.onerror = function (ev) {
                console.log(ev);
            };
        };
        /*
        * 删除数据(删除一个)
        * filter => 根据filter规则删除指定数据，filter接收一个参数，即遍历的数据
        * callback => 回调函数
        * */
        IDBCollection.prototype.delete = function (filter, callback) {
            // this.direction = this.toggleDirection();
            // let request: IDBRequest = this.store.openCursor(null, this.direction), self = this;
            // request.onsuccess = (e:Event) => {
            //     let cursor: IDBCursorWithValue = (<IDBRequest>e.target).result;
            //     if( !tools.isEmpty(cursor) ){
            //         let value = cursor.value;
            //         if( filter(value) ){
            //             let updateRequest: IDBRequest = cursor.delete();
            //             updateRequest.onsuccess = () => {
            //                 typeof callback === 'function' && callback();
            //             }
            //         }else{
            //             cursor.continue();
            //         }
            //     }
            // }
            var request = this.store.getAll(), self = this;
            request.onsuccess = function (e) {
                var data = request.result;
                var result;
                for (var i = 0, len = data.length; i < len; i++) {
                    if (filter(data[i])) {
                        result = data[i];
                        break;
                    }
                }
                var update = self.store.delete(result);
                update.onsuccess = function () {
                    typeof callback === 'function' && callback();
                };
            };
        };
        /*
        * 更新数据(更新一个)
        * filter => 根据filter规则更新指定数据，filter接收一个参数，即遍历的数据
        * newDataGet => 指定要更新的数据，newDataGet接收一个参数，即遍历的数据
        * callback => 回调函数
        * */
        IDBCollection.prototype.update = function (filter, newDataGet, success, error) {
            // this.direction = this.toggleDirection();
            // let request: IDBRequest = this.store.openCursor(null, this.direction), self = this;
            // request.onsuccess = (e:Event) => {
            //     let cursor: IDBCursorWithValue = (<IDBRequest>e.target).result;
            //     if( cursor ){
            //         let value = cursor.value;
            //         if( filter(value) ){
            //             let updateRequest: IDBRequest = cursor.update( newDataGet(value) );
            //             updateRequest.onsuccess = (e) => {
            //                 typeof callback === 'function' && callback( newDataGet(value) );
            //             };
            //             updateRequest.onerror = (e) => {
            //                 alert('error')
            //             };
            //             return null;
            //         }else{
            //             cursor.continue();
            //         }
            //     }
            // }
            var request = this.store.getAll(), self = this;
            request.onsuccess = function (e) {
                var data = e.target.result;
                var result;
                for (var i = 0, len = data.length; i < len; i++) {
                    if (filter(data[i])) {
                        result = newDataGet(data[i]);
                        break;
                    }
                }
                if (typeof result !== 'undefined') {
                    // let update = request.transaction(self.storeName, 'readwrite').objectStore(self.storeName).put(result);
                    var update = self.store.put(result);
                    update.onsuccess = function (e) {
                        typeof success === 'function' && success(result);
                    };
                }
                else {
                    typeof error === 'function' && error(result);
                }
            };
            request.onerror = function () {
            };
        };
        /*
        * 查询数据
        * filter => 根据filter规则查询指定数据，filter接收一个参数，即遍历的数据
        * callback => 回调函数，callback接收一个参数data，即获取到的数据，没有为 []
        * */
        IDBCollection.prototype.find = function (filter, callback) {
            var request = this.store.getAll(), self = this;
            request.onsuccess = function (e) {
                var data = request.result;
                var result = [];
                for (var i = 0, len = data.length; i < len; i++) {
                    if (filter(data[i])) {
                        result.push(data[i]);
                    }
                }
                typeof callback === 'function' && callback(result);
            };
        };
        /*
        * 获取所有数据
        * callback => 回调函数，callback接收一个参数data，即获取到的数据，没有为 []
        * */
        IDBCollection.prototype.findAll = function (callback) {
            this.find(function () { return true; }, callback);
        };
        IDBCollection.prototype.on = function (eventName, callback) {
        };
        return IDBCollection;
    }());
});

///<amd-module name="FingerPrint"/>
define("FingerPrint", ["require", "exports", "IDB", "Modal", "InputBox", "Button"], function (require, exports, IDB_1, Modal_1, InputBox_1, Button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Shell = C.Shell;
    var d = C.d;
    var tools = C.tools;
    var FingerPrint = /** @class */ (function () {
        function FingerPrint(para) {
            this.db = null;
            this.promise = null;
            if ('AppShell' in window) {
                this.init(para);
            }
        }
        FingerPrint.prototype.init = function (para) {
            var _this = this;
            var IDBName = 'fingerDB', IDBVersion = tools.isEmpty(para.DBConf.version) ? 1 : para.DBConf.version, IDBConstruct = (_a = {}, _a[para.DBConf.storeName] = ['userid', 'prints'], _a);
            this.db = new IDB_1.IDB(IDBName, IDBVersion, IDBConstruct);
            Shell.finger.get({
                type: 0,
                option: 1
            }, function (ev) {
                var data = ev.data;
                _this.matchedFinger(data);
            }, function (ev) {
                typeof para.callFingerMsg === 'function' && para.callFingerMsg(ev.data.text);
            });
            var _a;
        };
        FingerPrint.prototype.matchedFinger = function (data) {
            var _this = this;
            var type = data.fingerType, print = data.finger;
            this.db && this.db.then(function (store) {
                store.find(function (val) {
                    // Modal.alert(val.prints['type' + type])
                    if (typeof val.prints['type' + type] === "undefined") {
                        return false;
                    }
                    var data = Shell.finger.verify(print, val.prints['type' + type][0], type);
                    return data.data.matched;
                }, function (response) {
                    Modal_1.Modal.alert(response);
                    _this.promise = new Promise(function (resolve, reject) {
                        if (tools.isEmpty(response)) {
                            _this.getUserid(tools.obj.merge(data, { verify: '1' }), resolve, reject);
                        }
                        else {
                            var fingers = {
                                userid: response[0].userid,
                                type: type,
                                print: print,
                                verify: '0',
                            };
                            resolve(fingers);
                        }
                    });
                });
            });
        };
        FingerPrint.prototype.then = function (callback) {
            var _this = this;
            this.promise && this.promise.then(function (e) {
                return new Promise(function (resolve, reject) {
                    typeof callback === 'function' && callback(e).then(function (data) {
                        _this.setFinger(data, resolve);
                    });
                });
            }, function () {
            });
        };
        FingerPrint.prototype.setFinger = function (data, callback) {
            if (data.verify === '1') {
                var type_1 = data.type, userid_1 = data.userid, print_1 = data.print;
                this.db.then(function (store) {
                    /*
                    * 查询数据仓库是否有存在userid,
                    * 有就更新，没有就添加
                    * */
                    store.update(function (result) {
                        return (result.userid === userid_1);
                    }, function (result) {
                        result.userid = userid_1;
                        if (typeof result.prints['type' + type_1] === 'undefined') {
                            result.prints['type' + type_1] = [];
                        }
                        result.prints['type' + type_1].unshift(print_1);
                        if (result.prints['type' + type_1].length > 1) {
                            result.prints['type' + type_1].pop();
                        }
                        return result;
                    }, function () {
                        typeof callback === 'function' && callback();
                    }, function () {
                        var data = {
                            userid: userid_1,
                            prints: {
                                "type0": [],
                                "type1": [],
                                "type2": [],
                            },
                        };
                        data.prints['type' + type_1].push(print_1);
                        store.insert(data, function () {
                            typeof callback === 'function' && callback();
                        });
                    });
                });
            }
        };
        FingerPrint.prototype.getUserid = function (data, callback, error) {
            var type = data.fingerType, print = data.finger, verify = data.verify, inputBox = new InputBox_1.InputBox({}), okBtn = new Button_1.Button({ content: '确定', type: 'primary', key: 'okBtn' });
            inputBox.addItem(okBtn);
            var submitUserId = function (fingerModal) {
                var userid = fingerModal.body.querySelector('input').value.toUpperCase();
                if (!tools.str.toEmpty(userid)) {
                    fingerModal.destroy();
                    Modal_1.Modal.toast('请重新录入指纹');
                    typeof error === 'function' && error();
                }
                else {
                    fingerModal.destroy();
                    var fingers = {
                        userid: userid,
                        type: type,
                        print: print,
                        verify: verify,
                    };
                    typeof callback === 'function' && callback(fingers);
                }
            };
            //创建模态框手动输入userID
            var fingerModal = new Modal_1.Modal({
                header: '登记本地指纹ID',
                isOnceDestroy: true,
                body: d.create("<div data-action=\"fingerModal\">\n                                        <form>\n                                            <label>\u8BF7\u8F93\u5165\u60A8\u7684\u5458\u5DE5\u53F7</label>\n                                            <input type=\"text\" >\n                                        </form>\n                                    </div>"),
                footer: {
                    rightPanel: inputBox
                },
                isBackground: false,
                onOk: function () {
                    submitUserId(fingerModal);
                },
                onClose: function () {
                    Modal_1.Modal.toast('请重新录入指纹');
                }
            });
            //自动获取焦点
            fingerModal.bodyWrapper.querySelector('input').focus();
            //表单提交触发onOK事件
            d.on(fingerModal.bodyWrapper.querySelector('form'), 'submit', function (ev) {
                ev.preventDefault();
                submitUserId(fingerModal);
            });
        };
        return FingerPrint;
    }());
    exports.FingerPrint = FingerPrint;
});

// /// <amd-module name="MessageAction"/>
// import tools = C.tools;
// import sys = C.sys;
// import {Message} from "../entity/Message";
// import {StorageManager} from "../core/StorageManager";
// /**
//  * 接收消息控制器
//  */
// export class MessageAction{
//
//     /**
//      * 保存消息
//      */
//     saveMessage(message:Message):number{
//         return this.storageManager.save(message.toString());
//     }
//
//     /**
//      * 删除消息
//      */
//     deleteMessage(id:string):number{
//         return this.storageManager.del(id);
//     }
//
//     /**
//      * 获取单条消息
//      */
//     getMessageInfo(id:string):Message{
//         let obj = this.storageManager.get(id);
//         let message = new Message(obj);
//         return message;
//     }
//
//     /**
//      * 获取消息列表
//      */
//     messagelist():Array<Message>{
//         return this.storageManager.list();
//     }
//
//     /**
//      * 获取未读消息数
//      */
//     getListNum():number{
//         return this.storageManager.num();
//     }
//
//     private storageManager;
//
//     constructor() {
//         this.storageManager = new StorageManager("messageList")
//     }
// }

define("Component", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="Component"/>
    var tools = C.tools;
    var d = C.d;
    var Component = /** @class */ (function () {
        function Component(para) {
            if (para === void 0) { para = {}; }
            this._tabIndex = false;
            this.keyHandle = function (e) { };
            this.eventHandlers = {};
            // this._guid = tools.getGuid();
            this.data = para.data;
            this._wrapper = this.wrapperInit(para);
            this.container = para.container || document.body;
            this.className = para.className;
            this._tabIndexKey = para.tabIndexKey;
            this.tabIndex = para.tabIndex;
            // this.key = component.key;
        }
        Object.defineProperty(Component.prototype, "tabIndex", {
            get: function () {
                return this._tabIndex;
            },
            set: function (tabIndex) {
                tabIndex = !!tabIndex;
                if (this._tabIndex === tabIndex) {
                    return;
                }
                this._tabIndex = tabIndex;
                if (tabIndex) {
                    this.wrapper.tabIndex = parseInt(tools.getGuid(''));
                    d.on(this.wrapper, 'keydown', this.keyHandle);
                }
                else {
                    d.off(this.wrapper, 'keydown', this.keyHandle);
                    this.wrapper.removeAttribute('tabIndex');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "isFocused", {
            get: function () {
                return this.wrapper === document.activeElement;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "wrapper", {
            get: function () {
                // if(!this._wrapper){
                //     this._wrapper = this.wrapperInit();
                // }
                return this._wrapper;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "className", {
            get: function () {
                return this._className;
            },
            set: function (str) {
                var old = this._className;
                if (str && this.wrapper && typeof str === 'string' && str !== old) {
                    if (typeof old === 'string') {
                        (_a = this.wrapper.classList).remove.apply(_a, old.split(' '));
                    }
                    this.wrapper.classList.add(str);
                    this._className = str;
                }
                var _a;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "container", {
            get: function () {
                return this._container;
            },
            set: function (container) {
                // 容器发生改变，组件的dom元素也转移到相应容器中
                var wrapper = this.wrapper;
                if (container && this._container !== container) {
                    if (wrapper && container !== wrapper) { // 特殊情况下, wrapper 和 container可以是同一个元素
                        d.append(container, wrapper);
                    }
                    this._container = container;
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 移除组件
         */
        Component.prototype.remove = function () {
            d.remove(this._wrapper, false);
            this._container = null;
        };
        Component.prototype.destroy = function () {
            d.remove(this._wrapper);
            this._wrapper = null;
            this.data = null;
            this._container = null;
            this._className = null;
        };
        Component.prototype.on = function (name, handler) {
            if (!this.eventHandlers[name]) {
                this.eventHandlers[name] = [];
            }
            this.eventHandlers[name].push(handler);
        };
        Component.prototype.off = function (name, handler) {
            var _this = this;
            if (this.eventHandlers[name]) {
                if (typeof handler === 'function') {
                    this.eventHandlers[name].forEach(function (item, index) {
                        if (item === handler) {
                            _this.eventHandlers[name].splice(index, 1);
                        }
                    });
                }
                else {
                    delete this.eventHandlers[name];
                }
            }
        };
        Component.prototype.trigger = function (type) {
            var para = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                para[_i - 1] = arguments[_i];
            }
            var handlers = this.eventHandlers[type];
            handlers && handlers.forEach(function (item) {
                typeof item === 'function' && item(para);
            });
        };
        return Component;
    }());
    exports.Component = Component;
});


define("BaseShellImpl", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="BaseShellImpl"/>
    var tools = C.tools;
    var BaseShellImpl = /** @class */ (function () {
        function BaseShellImpl() {
        }
        BaseShellImpl.prototype.adHandle = function (action, dict) {
            if (typeof window['AppShell'] === 'undefined') {
                return;
            }
            if (tools.isEmpty(dict)) {
                return JSON.parse(AppShell.postMessage(action));
            }
            else {
                return JSON.parse(AppShell.postMessage(action, dict));
            }
        };
        BaseShellImpl.prototype.ipHandle = function (action, dict) {
            if (tools.isEmpty(dict))
                dict = {};
            dict.action = action;
            webkit.messageHandlers.AppShell.postMessage(dict);
        };
        BaseShellImpl.prototype.pcHandle = function (action, dict) {
            if (!('BlueWhaleShell' in window)) {
                return null;
            }
            if (typeof dict === 'undefined') {
                return BlueWhaleShell.postMessage(action);
            }
            else {
                if (typeof dict !== 'string') {
                    dict = JSON.stringify(dict);
                }
                return BlueWhaleShell.postMessage(action, dict);
            }
        };
        return BaseShellImpl;
    }());
    exports.BaseShellImpl = BaseShellImpl;
});

define("TableLite", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="TableLite"/>
    var d = C.d;
    var tools = C.tools;
    /**
     * 表格生成
     */
    var TableLite = /** @class */ (function () {
        function TableLite(para) {
            this.para = para;
            this.row = (function (self) {
                var addByData = function (data, i, isInit, isChange) {
                    if (isInit === void 0) { isInit = false; }
                    if (isChange === void 0) { isChange = true; }
                    var plus = 0, sum = null, cols = self.para.cols, tableData = self.para.data;
                    if (tools.isEmpty(i)) {
                        plus = tableData ? tableData.length : 0;
                        sum = plus;
                    }
                    else {
                        sum = i + plus;
                    }
                    var tr = document.createElement('tr');
                    tr.setAttribute('data-index', sum);
                    // 序号
                    if (self.para.hasNumber) {
                        var td = document.createElement('td');
                        td.innerHTML = sum + 1;
                        tr.appendChild(td);
                    }
                    Array.isArray(cols) && cols.forEach(function (col) {
                        // debugger;
                        var td = document.createElement('td'), name = col.fieldName, field = data[name];
                        // 四舍五入
                        field = self.para.toFixed(field, col);
                        td.innerHTML = self.getShowFiled(field, col);
                        td.setAttribute('data-name', name);
                        col.noShow && td.classList.add('hide'); // 列隐藏
                        tr.appendChild(td);
                    });
                    self.tbody.appendChild(tr);
                    if (isChange) {
                        cols.forEach(function (col) {
                            self.para.onChange && self.para.onChange(data[col.fieldName], col, data, tr);
                        });
                    }
                    !tableData && (tableData = []);
                    !isInit && tableData.push(data);
                };
                var addByTr = function (tr) {
                    // console.log(tr);
                    self.tbody.appendChild(tr);
                };
                return {
                    addByData: addByData,
                    addByTr: addByTr
                };
            }(this));
            this.thead = document.createElement('thead');
            this.tbody = document.createElement('tbody');
            this.initThead();
            this.initTbody();
            this.wrapper = this.para.table;
            this.wrapper.tabIndex = parseInt(tools.getGuid(''));
        }
        TableLite.prototype.initThead = function () {
            var _this = this;
            if (this.para.hasNumber) {
                var th = document.createElement('th');
                th.innerHTML = '序号';
                this.thead.appendChild(th);
            }
            Array.isArray(this.para.cols) && this.para.cols.forEach(function (col) {
                var th = document.createElement('th');
                th.innerHTML = col.caption ? col.caption : '';
                th.dataset.col = col.fieldName ? col.fieldName : '';
                col.noShow && th.classList.add('hide'); // 列隐藏
                _this.thead.appendChild(th);
            });
            this.para.table.appendChild(this.thead);
        };
        TableLite.prototype.initTbody = function () {
            var _this = this;
            var data = this.para.data;
            Array.isArray(data) && data.forEach(function (o, i) {
                _this.row.addByData(o, i, true);
            });
            this.para.table.appendChild(this.tbody);
        };
        /**
         * 显示在表格上的值，不保存该值，仅显示作用。
         * @param showField
         * @param col
         * @returns {string}
         */
        TableLite.prototype.getShowFiled = function (showField, col) {
            if (this.para.showField) {
                showField = this.para.showField(showField, col);
            }
            return tools.isNotEmpty(showField) ? showField : '';
        };
        TableLite.prototype.get = function () {
            return this.para;
        };
        TableLite.prototype.getSelect = function () {
            var trSelect = d.query('.tr-select', this.tbody), index = trSelect && trSelect.dataset.index;
            return this.para.data[index];
        };
        TableLite.prototype.select = function (index) {
            var select = d.query('.tr-select', this.tbody), tr = d.query('[data-index="' + index + '"]', this.tbody);
            if (tr) {
                if (select) {
                    select.classList.remove('tr-select');
                }
                tr.classList.add('tr-select');
            }
        };
        /**
         * 修改数据
         * @param name
         * @param newField
         * @param index
         */
        TableLite.prototype.resetData = function (name, newField, index) {
            var _this = this;
            var col = null;
            this.para.cols.forEach(function (obj) {
                if (obj.fieldName === name) {
                    col = obj;
                }
            });
            if (!col) {
                return;
            }
            // 四舍五入
            newField = this.para.toFixed(newField, col);
            var trSelect = tools.isNotEmpty(index) && d.query('tr[data-index="' + index + '"]', this.tbody), dataCol = d.queryAll('[data-name=' + name + ']', trSelect ? trSelect : this.tbody);
            if (!trSelect) {
                //表格无选中时，更改所有数据
                this.para.data.forEach(function (d) {
                    d[name] = newField;
                });
            }
            else {
                this.para.data[index][name] = newField;
            }
            dataCol.forEach(function (td) {
                var index = td.parentElement.dataset.index;
                td.innerHTML = _this.getShowFiled(newField, col);
                _this.para.onChange && _this.para.onChange(newField, col, _this.para.data[index], td.parentElement);
            });
            // console.log(this.para,'table')
        };
        /**
         * 刷新表格
         * @param data
         * @param isChange 是否触发change
         */
        TableLite.prototype.refresh = function (data, isChange) {
            var _this = this;
            if (isChange === void 0) { isChange = true; }
            // let table = d.query('tbody', this.para.table);
            this.para.data = [];
            this.tbody.innerHTML = null;
            data.forEach(function (d) {
                _this.row.addByData(d, null, false, isChange);
            });
        };
        TableLite.prototype.addByData = function (data) {
            var _this = this;
            if (Array.isArray(data)) {
                data.forEach(function (d) {
                    _this.row.addByData(d);
                });
            }
            else {
                this.row.addByData(data);
            }
        };
        /**
         * 清空数据
         */
        TableLite.prototype.emptied = function () {
            this.para.data = [];
            this.tbody.innerHTML = null;
        };
        /**
         * 计算总数量,总金额
         * @returns {Array}
         */
        TableLite.prototype.getCount = function () {
            var data = this.para.data, sum = 0, n = 0, count = [];
            data && data.forEach(function (d) {
                sum += d.AMOUNT * d.COUNT; //总金额 = 数量乘以单价
                n += parseInt(d.AMOUNT); //总件数 = 所有件数相加
            });
            count.push(sum);
            count.push(n);
            return count;
        };
        return TableLite;
    }());
    exports.TableLite = TableLite;
});

define("BarCode", ["require", "exports", "JsBarcode"], function (require, exports, JsBarcode) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-dependency path="JsBarcode" name="JsBarcode"/>
    var BarCode = /** @class */ (function () {
        function BarCode(svgDom, loc, sty) {
            this.init();
            this.draw(svgDom, loc, sty);
        }
        BarCode.prototype.init = function () {
            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svg.id = 'tempSvg';
            document.body.appendChild(this.svg);
        };
        BarCode.prototype.draw = function (svgDom, loc, sty) {
            JsBarcode("#tempSvg", sty.codeData, {
                lineColor: "#000000",
                //width: (loc.w-88)/68+1,
                width: sty.codeType === 3 ? 2 : 1,
                height: loc.h,
                margin: 0,
                displayValue: false,
                format: BarCode.CodeType[sty.codeType]
            });
            this.svg.setAttribute('x', "" + loc.x);
            this.svg.setAttribute('y', "" + loc.y);
            document.body.removeChild(this.svg);
            svgDom.appendChild(this.svg);
        };
        BarCode.CodeType = {
            0: 'ITF',
            3: 'CODE39',
            4: 'CODE39',
            5: 'CODE128A',
            6: 'CODE128B',
            7: 'CODE128C',
        };
        return BarCode;
    }());
    exports.BarCode = BarCode;
});

/// <amd-module name="Draw"/>
define("Draw", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Draw = /** @class */ (function () {
        function Draw(can) {
            this.shapeKindFun = (function (self) {
                var arr = [];
                arr[Draw.graphKind.rectangle] = function (ctx, loc, sty) {
                    ctx.save();
                    if (sty.angle) {
                        var rectCenterPoint = void 0;
                        loc.h ? rectCenterPoint = { x: loc.x + loc.w / 2, y: loc.y + loc.h / 2 } : rectCenterPoint = { x: loc.x + loc.w / 2, y: loc.y + loc.w / 2 };
                        ctx.translate(rectCenterPoint.x, rectCenterPoint.y);
                        ctx.rotate(sty.angle);
                        ctx.translate(-rectCenterPoint.x, -rectCenterPoint.y);
                    }
                    if (sty.penStyle == 6) {
                        ctx.beginPath();
                        ctx.moveTo(loc.x + sty.penWidth, loc.y + sty.penWidth);
                        ctx.lineTo(loc.x + loc.w - sty.penWidth, loc.y + sty.penWidth);
                        loc.h ? ctx.lineTo(loc.x + loc.w - sty.penWidth, loc.y + loc.h - sty.penWidth) : ctx.lineTo(loc.x + loc.w - sty.penWidth, loc.y + loc.w - sty.penWidth);
                        loc.h ? ctx.lineTo(loc.x + sty.penWidth, loc.y + loc.h - sty.penWidth) : ctx.lineTo(loc.x + sty.penWidth, loc.y + loc.w - sty.penWidth);
                        ctx.lineTo(loc.x + sty.penWidth, loc.y + sty.penWidth);
                        Draw.brushStyleFun.brush(ctx, sty);
                        ctx.lineWidth = 1;
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(loc.x, loc.y);
                        ctx.lineTo(loc.x + loc.w, loc.y);
                        ctx.lineTo(loc.x + loc.w, loc.y + loc.h);
                        ctx.lineTo(loc.x, loc.y + loc.h);
                        ctx.lineTo(loc.x, loc.y);
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                    else {
                        ctx.beginPath();
                        ctx.moveTo(loc.x + sty.penWidth / 2, loc.y + sty.penWidth / 2);
                        ctx.lineTo(loc.x + loc.w - sty.penWidth / 2, loc.y + sty.penWidth / 2);
                        loc.h ? ctx.lineTo(loc.x + loc.w - sty.penWidth / 2, loc.y + loc.h - sty.penWidth / 2) : ctx.lineTo(loc.x + loc.w - sty.penWidth / 2, loc.y + loc.w - sty.penWidth / 2);
                        loc.h ? ctx.lineTo(loc.x + sty.penWidth / 2, loc.y + loc.h - sty.penWidth / 2) : ctx.lineTo(loc.x + sty.penWidth / 2, loc.y + loc.w - sty.penWidth / 2);
                        ctx.lineTo(loc.x + sty.penWidth / 2, loc.y + sty.penWidth / 2);
                        Draw.brushStyleFun.brush(ctx, sty);
                        ctx.fill();
                        ctx.stroke();
                    }
                    ctx.restore();
                };
                arr[Draw.graphKind.circle] = function (ctx, loc, sty) {
                    ctx.save();
                    if (sty.angle) {
                        var rectCenterPoint = void 0;
                        rectCenterPoint = { x: loc.x, y: loc.y };
                        ctx.translate(rectCenterPoint.x, rectCenterPoint.y);
                        ctx.rotate(sty.angle);
                        ctx.translate(-rectCenterPoint.x, -rectCenterPoint.y);
                    }
                    if (loc.h) { //如果有传高度则为椭圆
                        if (sty.penStyle == 6) { //画笔类型为透视效果
                            ctx.save();
                            var r = (loc.w > loc.h) ? loc.w : loc.h;
                            var ratioX = loc.w / r;
                            var ratioY = loc.h / r;
                            ctx.scale(ratioX, ratioY);
                            ctx.beginPath();
                            ctx.arc(loc.x / ratioX, loc.y / ratioY, r - sty.penWidth, 0, 2 * Math.PI, false);
                            Draw.brushStyleFun.brush(ctx, sty);
                            ctx.lineWidth = 1;
                            ctx.fill();
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.arc(loc.x / ratioX, loc.y / ratioY, r, 0, 2 * Math.PI, false);
                            ctx.stroke();
                            ctx.restore();
                        }
                        else { //画笔类型不为透视效果
                            ctx.save();
                            var r = (loc.w > loc.h) ? loc.w : loc.h;
                            var ratioX = loc.w / r;
                            var ratioY = loc.h / r;
                            ctx.scale(ratioX, ratioY);
                            ctx.beginPath();
                            ctx.arc(loc.x / ratioX, loc.y / ratioY, r - sty.penWidth / 2, 0, 2 * Math.PI, false);
                            Draw.brushStyleFun.brush(ctx, sty);
                            ctx.fill();
                            ctx.stroke();
                            ctx.restore();
                        }
                    }
                    else {
                        if (sty.penStyle == 6) { //画笔类型为透视效果
                            ctx.beginPath();
                            ctx.arc(loc.x, loc.y, loc.w - sty.penWidth, 0, 2 * Math.PI);
                            Draw.brushStyleFun.brush(ctx, sty);
                            ctx.lineWidth = 1;
                            ctx.fill();
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.arc(loc.x, loc.y, loc.w, 0, 2 * Math.PI);
                            Draw.brushStyleFun.brush(ctx, sty);
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                        else {
                            ctx.beginPath();
                            ctx.arc(loc.x, loc.y, loc.w - sty.penWidth / 2, 0, 2 * Math.PI);
                            Draw.brushStyleFun.brush(ctx, sty);
                            ctx.fill();
                            ctx.stroke();
                        }
                    }
                    ctx.restore();
                };
                arr[Draw.graphKind.verticalLine] = function (ctx, loc, sty) {
                    ctx.save();
                    if (sty.penStyle == 6) {
                        ctx.beginPath();
                        ctx.moveTo(loc.x + 0.5, loc.y + 0.5);
                        ctx.lineTo(loc.x + sty.penWidth - 0.5, loc.y + 0.5);
                        ctx.lineTo(loc.x + sty.penWidth - 0.5, loc.y + loc.h - 0.5);
                        ctx.lineTo(loc.x + 0.5, loc.y + loc.h - 0.5);
                        ctx.lineTo(loc.x + 0.5, loc.y + 0.5);
                        Draw.brushStyleFun.brushLine(ctx, sty);
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                    else {
                        ctx.beginPath();
                        ctx.moveTo(loc.x + sty.penWidth / 2, loc.y);
                        ctx.lineTo(loc.x + sty.penWidth / 2, loc.y + loc.h);
                        Draw.brushStyleFun.brushLine(ctx, sty);
                        ctx.stroke();
                    }
                    ctx.restore();
                };
                arr[Draw.graphKind.line] = function (ctx, loc, sty) {
                    ctx.save();
                    if (sty.penStyle == 6) {
                        ctx.beginPath();
                        ctx.moveTo(loc.x + 0.5, loc.y + 0.5);
                        ctx.lineTo(loc.x + loc.w - 0.5, loc.y + 0.5);
                        ctx.lineTo(loc.x + loc.w - 0.5, loc.y + sty.penWidth - 0.5);
                        ctx.lineTo(loc.x + 0.5, loc.y + sty.penWidth - 0.5);
                        ctx.lineTo(loc.x + 0.5, loc.y + 0.5);
                        Draw.brushStyleFun.brushLine(ctx, sty);
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                    else {
                        ctx.beginPath();
                        ctx.moveTo(loc.x, loc.y + sty.penWidth / 2);
                        ctx.lineTo(loc.x + loc.w, loc.y + sty.penWidth / 2);
                        Draw.brushStyleFun.brushLine(ctx, sty);
                        ctx.stroke();
                    }
                    ctx.restore();
                };
                arr[Draw.graphKind.upAndDownParallelLine] = function (ctx, loc, sty) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(loc.x, loc.y + sty.penWidth / 2);
                    ctx.lineTo(loc.x + loc.w, loc.y + sty.penWidth / 2);
                    ctx.moveTo(loc.x, loc.y + sty.penWidth / 2 + loc.h);
                    ctx.lineTo(loc.x + loc.w, loc.y + sty.penWidth / 2 + loc.h);
                    Draw.brushStyleFun.brushLine(ctx, sty);
                    ctx.stroke();
                    ctx.restore();
                };
                arr[Draw.graphKind.leftAndRightParallelLine] = function (ctx, loc, sty) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(loc.x + sty.penWidth / 2, loc.y);
                    ctx.lineTo(loc.x + sty.penWidth / 2, loc.y + loc.h);
                    ctx.moveTo(loc.x + sty.penWidth / 2 + loc.w, loc.y);
                    ctx.lineTo(loc.x + sty.penWidth / 2 + loc.w, loc.y + loc.h);
                    Draw.brushStyleFun.brushLine(ctx, sty);
                    ctx.stroke();
                    ctx.restore();
                };
                return arr;
            }(this));
            this.textStyleFun = (function (self) {
                var arr = [];
                arr['backColor'] = function (tempCtx, loc, sty) {
                    // debugger;
                    tempCtx.save();
                    // sty.transparent === true ? tempCtx.globalAlpha = 0 : '';
                    // sty.transparent === false ? tempCtx.globalAlpha = 1 : '';
                    // typeof sty.transparent == 'number' ? tempCtx.globalAlpha = Number(sty.transparent) : '';
                    // tempCtx.fillStyle = '#' + sty['backColor'].toString(16);
                    // let {r, g, b} = C.tools.val2RGB(sty['backColor']);
                    // tempCtx.fillStyle = `rgb(${r},${g},${b})`;
                    tempCtx.fillStyle = sty.backColor;
                    tempCtx.fillRect(0, 0, loc.w, loc.h);
                    // tempCtx.restore();
                };
                arr['font'] = function (tempCtx, loc, sty) {
                    tempCtx.fillStyle = sty.font.fontColor;
                    if (sty['font']['IFontStyle'] === 1) {
                        tempCtx.font = "bolder " + sty['font']['fontSize'] + "px" + " " + 'Source Han Sans CN';
                    }
                    else {
                        tempCtx.font = sty['font']['fontSize'] + "px" + " " + 'Source Han Sans CN';
                    }
                };
                arr['forFill'] = function () {
                };
                arr['stretch'] = function (tempCtx, loc, sty) {
                    if (!sty['autoSize'] && sty['stretch']) {
                        tempCtx.font = loc.h + "px" + " " + sty['font']['fontName'];
                    }
                };
                return arr;
            }(this));
            this.contains = function (key) {
                var tempArr = ['dataName', 'alignment', 'autoSize', 'transparent', 'wrapping'];
                var index = tempArr.length;
                while (index--) {
                    if (tempArr[index] === key) {
                        return true;
                    }
                }
                return false;
            };
            this.init(can);
        }
        Draw.prototype.init = function (can) {
            this.canvas = document.createElement('canvas');
            this.canvas.width = can.width * window.devicePixelRatio;
            this.canvas.height = can.height * window.devicePixelRatio;
            this.canvas.style.width = can.width + "px";
            this.canvas.style.height = can.height + "px";
            this.ctx = this.canvas.getContext('2d');
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        };
        Draw.prototype.graph = function (shapeKind, loc, sty) {
            sty = C.tools.obj.merge(Draw.defaultPara.shapeDefaultPara, sty);
            this.shapeKindFun[shapeKind].call(this, this.ctx, loc, sty); //根据图形字段调用相应图形函数
        };
        Draw.prototype.text = function (data, loc, sty) {
            if (data) { //当文字内容为null时候不绘制该文字
                data = data.replace(/null/g, "");
                sty = C.tools.obj.merge(true, Draw.defaultPara.textDefaultPara, sty);
                if (loc.w && loc.h) {
                    var tempCanvas = document.createElement("canvas"); //创建一个临时canvas保存字体的背景以及字体的内容
                    var tempCtx = tempCanvas.getContext('2d');
                    tempCanvas.width = loc.w;
                    tempCanvas.height = loc.h;
                    for (var key in sty) { //循环设置字体的所有样式
                        if (!this.contains(key)) //过滤掉某些不需要执行的样式
                            this.textStyleFun[key].call(this, tempCtx, loc, sty);
                    }
                    // debugger;
                    tempCtx.textBaseline = "top"; //设置文字的基线为top
                    this.drawText(data, tempCtx, loc, sty); //绘制文字
                    var imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                    this.ctx.putImageData(imgData, loc.x, loc.y);
                }
                else {
                    this.ctx.save();
                    for (var key in sty) { //循环设置字体的所有样式
                        if (!this.contains(key)) //过滤掉某些不需要执行的样式
                            this.textStyleFun[key].call(this, this.ctx, loc, sty);
                    }
                    this.ctx.textBaseline = "top"; //设置文字的基线为top
                    this.ctx.fillText(data, loc.x, loc.y);
                    this.ctx.restore();
                }
            }
        };
        Draw.prototype.insertImg = function (loc, url, callback) {
            var _this = this;
            var _ctx = this.ctx, imgObj = new Image();
            if (typeof url === 'string') {
                imgObj.src = url;
                imgObj.onload = function () {
                    _ctx.drawImage(imgObj, loc.x, loc.y, loc.w, loc.h);
                    var base = _this.canvas.toDataURL("image/png", 1.0);
                    typeof callback === 'function' && callback(base);
                };
            }
            else {
                _ctx.drawImage(url, loc.x, loc.y, loc.w, loc.h);
                var base = this.canvas.toDataURL("image/jpeg", 1.0);
                typeof callback === 'function' && callback(base);
            }
        };
        //插入 二维码canvas
        /*
        * ewmW:二维码生成的宽
        * ewmH:二维码生成的高
        * ewmContent:二维码内容
        * 显示部分
        * posionX:显示在canvas的X位置坐标
        * posionY:显示在canvas的Y位置坐标
        *
        * */
        Draw.prototype.insertCanvas = function (canvas, posionX, posionY) {
            var ewmPen = canvas.getContext('2d');
            //获取到二维码的像素点
            var imgDataA = ewmPen.getImageData(0, 0, canvas.width, canvas.height);
            this.ctx.putImageData(imgDataA, posionX, posionY);
        };
        Draw.prototype.getPng = function () {
            return this.canvas.toDataURL("image/png");
        };
        Draw.prototype.getCanvasCt = function () {
            return this.ctx;
        };
        Draw.prototype.getCanvas = function () {
            return this.canvas;
        };
        Draw.prototype.drawText = function (data, tempCtx, loc, sty) {
            /*传进alignment需要根据居中，左对齐，右对齐来相应的调整文字显示的位置
             *如果autoSize为false 且 stretch为true则自动将文字填充为width和height的大小，
             *此时需要调整文字显示位置不为居中而是从0,0开始显示
            * */
            //debugger
            if (sty['wrapping'] && (tempCtx.measureText(data).width) > loc.w) {
                var tempTextArr = data.split("\r\n");
                if (tempTextArr.length > 1) {
                    for (var j = 0; j < tempTextArr.length; j++) {
                        tempCtx.fillText(tempTextArr[j], 0, (j * sty.font.fontSize) + 5 * j);
                    }
                }
                else {
                    var wrapText = tempCtx.measureText(data).width, tempText = [], len = Math.floor((loc.w / wrapText) * data.length) - 1, // 换行时有时最后一个字体会被遮挡故减1
                    tempLen = len, i = 0;
                    while (tempLen == len) {
                        var tempWrapText = data.substring(i * len, (i + 1) * len);
                        tempText.push(tempWrapText);
                        i++;
                        tempLen = tempWrapText.length;
                    }
                    tempCtx.textAlign = Draw.alignMent[0];
                    for (var j = 0; j < tempText.length; j++) {
                        tempCtx.fillText(tempText[j], 0, (j * sty.font.fontSize) + 3 * j);
                    }
                }
            }
            else {
                var tempTextArr = data.split("\r\n");
                if (tempTextArr.length >= 1) {
                    for (var j = 0; j < tempTextArr.length; j++) {
                        tempCtx.fillText(tempTextArr[j], 0, (j * sty.font.fontSize) + 5 * j);
                    }
                }
                else {
                    tempCtx.textAlign = Draw.alignMent[sty["alignment"]];
                    sty['alignment'] == 0 ?
                        loc.w && loc.h ? tempCtx.fillText(data, 0, (!sty['autoSize'] && sty['stretch']) ? 0 : (loc.h - sty.font.fontSize) / 2) : tempCtx.fillText(data, 0, 0) : "";
                    sty['alignment'] == 1 ?
                        loc.w && loc.h ? tempCtx.fillText(data, 0 + loc.w, (!sty['autoSize'] && sty['stretch']) ? 0 : (loc.h - sty.font.fontSize) / 2) : tempCtx.fillText(data, 0, 0) : "";
                    sty['alignment'] == 2 ?
                        loc.w && loc.h ? tempCtx.fillText(data, 0 + loc.w / 2, (!sty['autoSize'] && sty['stretch']) ? 0 : (loc.h - sty.font.fontSize) / 2) : tempCtx.fillText(data, 0, 0) : "";
                }
            }
        };
        Draw.defaultPara = {
            textDefaultPara: {
                alignment: 0,
                backColor: '#fff',
                font: { fontName: '黑体', fontSize: 7, fontColor: '#000', fontStyle: 0 },
                forFill: false,
                autoSize: true,
                stretch: true,
                transparent: false,
                wrapping: false
            },
            shapeDefaultPara: {
                brushColor: '#000',
                brushStyle: 0,
                penColor: '#000',
                penStyle: 0,
                penWidth: 1 //默认画笔宽度 1
            }
        };
        Draw.brushStyleFun = {
            brush: function (ctx, sty) {
                var p = document.createElement("canvas");
                p.width = 16;
                p.height = 8;
                var pctx = p.getContext('2d');
                sty.penStyle == 6 ? '' : ctx.setLineDash(Draw.lineStyle[sty.penStyle]);
                pctx.strokeStyle = sty.brushColor;
                ctx.strokeStyle = sty.penColor;
                pctx.lineWidth = sty['fillPenWidth'] ? sty['fillPenWidth'] : 1;
                ctx.lineWidth = sty['borderPenWidth'] ? sty['borderPenWidth'] : sty['penWidth'];
                var offset = 16;
                var x0 = 0, y0 = 0, x1 = 0, y1 = 0;
                if (sty.brushStyle == 1) {
                    ctx.fillStyle = "white";
                }
                else if (sty.brushStyle == 2) {
                    p.width = 16;
                    p.height = 6;
                    pctx.strokeStyle = sty.brushColor;
                    pctx.beginPath();
                    pctx.moveTo(0, 3);
                    pctx.lineTo(16, 3);
                    pctx.stroke();
                    ctx.fillStyle = ctx.createPattern(p, 'repeat');
                }
                else if (sty.brushStyle == 3) {
                    p.width = 6;
                    p.height = 16;
                    pctx.strokeStyle = sty.brushColor;
                    pctx.beginPath();
                    pctx.moveTo(3, 0);
                    pctx.lineTo(3, 16);
                    pctx.closePath();
                    pctx.stroke();
                    ctx.fillStyle = ctx.createPattern(p, 'repeat');
                }
                else if (sty.brushStyle == 4) {
                    x0 = -2;
                    x1 = 18;
                    y0 = -1;
                    y1 = 9;
                    pctx.beginPath();
                    pctx.moveTo(x0, y0);
                    pctx.lineTo(x1, y1);
                    pctx.moveTo(x0 - offset, y0);
                    pctx.lineTo(x1 - offset, y1);
                    pctx.moveTo(x0 + offset, y0);
                    pctx.lineTo(x1 + offset, y1);
                    pctx.stroke();
                    ctx.fillStyle = ctx.createPattern(p, 'repeat');
                }
                else if (sty.brushStyle == 5) {
                    x0 = 18;
                    x1 = -2;
                    y0 = -1;
                    y1 = 9;
                    pctx.beginPath();
                    pctx.moveTo(x0, y0);
                    pctx.lineTo(x1, y1);
                    pctx.moveTo(x0 - offset, y0);
                    pctx.lineTo(x1 - offset, y1);
                    pctx.moveTo(x0 + offset, y0);
                    pctx.lineTo(x1 + offset, y1);
                    pctx.stroke();
                    ctx.fillStyle = ctx.createPattern(p, 'repeat');
                }
                else if (sty.brushStyle == 6) {
                    p.width = 10;
                    p.height = 10;
                    pctx.strokeStyle = sty.brushColor;
                    pctx.beginPath();
                    pctx.moveTo(0, 5);
                    pctx.lineTo(10, 5);
                    pctx.moveTo(5, 0);
                    pctx.lineTo(5, 10);
                    pctx.stroke();
                    ctx.fillStyle = ctx.createPattern(p, 'repeat');
                }
                else if (sty.brushStyle == 7) {
                    x0 = -2;
                    x1 = 18;
                    y0 = -1;
                    y1 = 9;
                    pctx.strokeStyle = sty.brushColor;
                    pctx.lineWidth = sty.penWidth;
                    pctx.beginPath();
                    pctx.moveTo(x0, y0);
                    pctx.lineTo(x1, y1);
                    pctx.moveTo(x0 - offset, y0);
                    pctx.lineTo(x1 - offset, y1);
                    pctx.moveTo(x0 + offset, y0);
                    pctx.lineTo(x1 + offset, y1);
                    pctx.stroke();
                    x0 = 18;
                    x1 = -2;
                    y0 = -1;
                    y1 = 9;
                    pctx.beginPath();
                    pctx.moveTo(x0, y0);
                    pctx.lineTo(x1, y1);
                    pctx.moveTo(x0 - offset, y0);
                    pctx.lineTo(x1 - offset, y1);
                    pctx.moveTo(x0 + offset, y0);
                    pctx.lineTo(x1 + offset, y1);
                    pctx.stroke();
                    ctx.fillStyle = ctx.createPattern(p, 'repeat');
                }
                else {
                    ctx.fillStyle = sty.penColor;
                }
            },
            brushLine: function (ctx, sty) {
                sty.penStyle == 6 ? '' : ctx.setLineDash(Draw.lineStyle[sty.penStyle]);
                ctx.lineWidth = sty.penWidth;
                ctx.strokeStyle = sty.penColor;
            }
        };
        Draw.lineStyle = {
            0: [],
            1: [5, 5],
            2: [2, 2],
            3: [10, 10, 4, 10],
            4: [30, 10, 4, 10, 4, 10],
            5: [0, 1000] //无
            // 6:透视效果在程序中判断
        };
        Draw.graphKind = {
            rectangle: 0,
            circle: 1,
            verticalLine: 2,
            line: 3,
            upAndDownParallelLine: 4,
            leftAndRightParallelLine: 5 //左右平行线
        };
        Draw.alignMent = {
            0: 'left',
            1: 'right',
            2: 'center' //居中
        };
        return Draw;
    }());
    exports.Draw = Draw;
});

define("QrCode", ["require", "exports", "QRCode"], function (require, exports, QRCode) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-dependency path="QRCode" name="QRCode"/>
    var QrCode = /** @class */ (function () {
        function QrCode(svgDom, loc, sty) {
            this.init(svgDom, loc, sty);
        }
        QrCode.prototype.init = function (svgDom, loc, sty) {
            this.g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            var qrcode = new QRCode(this.g, {
                width: loc.w,
                height: loc.h,
                useSVG: true
            });
            qrcode.makeCode(sty.codeData);
            var gSvg = this.g.firstChild;
            gSvg.setAttribute('width', "" + loc.w);
            gSvg.setAttribute('height', "" + loc.h);
            gSvg.setAttribute('x', "" + loc.x);
            gSvg.setAttribute('y', "" + loc.y);
            svgDom.appendChild(this.g);
        };
        QrCode.toCanvas = function (text, x, y) {
            var div = document.createElement('div');
            new QRCode(div, {
                text: text,
                width: x,
                height: y,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            var canvas = div.getElementsByTagName("canvas")[0];
            return canvas;
        };
        return QrCode;
    }());
    exports.QrCode = QrCode;
});

define("BwWebsocket", ["require", "exports", "Modal"], function (require, exports, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BwWebsocket = /** @class */ (function () {
        function BwWebsocket(para) {
            var _this = this;
            console.log(para);
            if ('WebSocket' in window) {
                this.ws = new WebSocket(para.url);
            }
            else {
                Modal_1.Modal.toast('您的浏览器不支持websocket.');
                return;
            }
            this.ws.onopen = function () {
                para.onOpen;
                _this.ws.send(para.sendData);
            };
            this.ws.onmessage = para.onMessage;
            this.ws.onclose = para.onClose;
            this.ws.onerror = para.onError;
        }
        return BwWebsocket;
    }());
    exports.BwWebsocket = BwWebsocket;
});

define("BasicCom", ["require", "exports", "Tooltip", "Component"], function (require, exports, tooltip_1, Component_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="BasicCom"/>
    var tools = C.tools;
    var d = C.d;
    var FormCom = /** @class */ (function (_super) {
        __extends(FormCom, _super);
        function FormCom() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FormCom.prototype.error = function (isError, errorMsg, parentEle) {
            if (errorMsg === void 0) { errorMsg = ""; }
            if (parentEle === void 0) { parentEle = this.wrapper; }
            if (!parentEle) {
                return;
            }
            if (isError) {
                parentEle.classList.add("error");
                this.toolTips = new tooltip_1.Tooltip({
                    pos: "up",
                    length: "medium",
                    visible: true,
                    errorMsg: "\ue633 " + errorMsg,
                    el: parentEle
                });
            }
            else {
                parentEle.classList.remove("error");
                this.toolTips ? this.toolTips.hide() : '';
            }
        };
        return FormCom;
    }(Component_1.Component));
    exports.FormCom = FormCom;
    var BasicCom = /** @class */ (function () {
        function BasicCom() {
            this._tabIndex = false;
            this.keyHandle = function (e) { };
        }
        Object.defineProperty(BasicCom.prototype, "wrapper", {
            get: function () {
                return this._wrapper;
            },
            enumerable: true,
            configurable: true
        });
        BasicCom.prototype.error = function (isError, errorMsg, parentEle) {
            if (errorMsg === void 0) { errorMsg = ""; }
            if (parentEle === void 0) { parentEle = this._wrapper; }
            if (!parentEle) {
                return;
            }
            if (isError) {
                parentEle.classList.add("error");
                this.toolTips = new tooltip_1.Tooltip({
                    pos: "up",
                    length: "medium",
                    visible: true,
                    errorMsg: "\ue633 " + errorMsg,
                    el: parentEle
                });
            }
            else {
                parentEle.classList.remove("error");
                this.toolTips ? this.toolTips.hide() : '';
            }
        };
        BasicCom.prototype.destroy = function () {
            if (this._wrapper) {
                d.remove(this._wrapper);
            }
        };
        BasicCom.prototype.tabIndexElGet = function () {
            return this.wrapper;
        };
        Object.defineProperty(BasicCom.prototype, "tabIndex", {
            get: function () {
                return this._tabIndex;
            },
            set: function (tabIndex) {
                tabIndex = !!tabIndex;
                if (this._tabIndex === tabIndex) {
                    return;
                }
                this._tabIndex = tabIndex;
                var wrapper = this.tabIndexElGet();
                if (tabIndex) {
                    wrapper.tabIndex = parseInt(tools.getGuid(''));
                    d.on(wrapper, 'keydown', this.keyHandle);
                }
                else {
                    d.off(wrapper, 'keydown', this.keyHandle);
                    wrapper.removeAttribute('tabIndex');
                }
            },
            enumerable: true,
            configurable: true
        });
        return BasicCom;
    }());
    exports.BasicCom = BasicCom;
});

/// <amd-module name="SelectBox"/>
define("SelectBox", ["require", "exports", "CheckBox", "BasicCom"], function (require, exports, checkBox_1, basic_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = C.tools;
    var d = C.d;
    var SelectBox = /** @class */ (function (_super) {
        __extends(SelectBox, _super);
        function SelectBox(para) {
            var _this = _super.call(this) || this;
            _this.para = para;
            _this.keyHandle = function (e) {
                var index = _this.getChecked()[0], keyCode = e.keyCode || e.which || e.charCode, num = index === 0 ? 1 : 0, key = _this.para.tabIndexKey || 13;
                if (keyCode === key) {
                    _this.set([num]);
                    _this.para.select.callback && _this.para.select.callback(num);
                }
            };
            _this._wrapper = para.container;
            _this.selectArr = [];
            _this.guidName = tools.getGuid();
            _this.type = _this.para.select && _this.para.select.multi ? 'checkbox' : 'radio';
            if (Array.isArray(para.data)) {
                _this.addByList();
            }
            _this.tabIndex = para.tabIndex;
            _this.initEvent();
            return _this;
        }
        SelectBox.prototype.getChecked = function () {
            var inputs = d.queryAll('input', this.wrapper), arr = [];
            Array.isArray(inputs) && inputs.forEach(function (input) {
                console.log(input, input.checked);
                if (input.checked) {
                    arr.push(parseInt(input.parentElement.dataset.index));
                }
            });
            return arr;
        };
        //显示选项框
        SelectBox.prototype.show = function () {
            this.para.container.style.display = 'inline-block';
        };
        //隐藏选项框
        SelectBox.prototype.hide = function () {
            this.para.container.style.display = 'none';
        };
        SelectBox.prototype.initEvent = function () {
            //添加事件
            var self = this;
            self.lastRadioBox = null;
            //如果单选框不允许多次选中，默认第一个单选框为选中状态，则lastRadioBox为第一个单选框
            if (!self.para.select.isRadioNotchecked && self.type === 'radio') {
                var radioInput = self.para.container.querySelector('input');
                if (radioInput) {
                    self.lastRadioBox = radioInput;
                }
            }
            d.on(this.para.container, 'click', '.check-span', function (e) {
                if (self.para.select && self.para.select.isStopPropatation) {
                    e.stopPropagation();
                }
                self.checked(this.parentElement.querySelector('input'));
                if (self.para.select && self.para.select.callback) {
                    ////临时用于权限模块，通过选项框的title值来记录数据
                    if (self.para.noteDataByTitle) {
                        if (self.para.data[this.parentElement.dataset.index]) {
                            this.parentElement.title = self.para.data[this.parentElement.dataset.index].value;
                        }
                    }
                    self.para.select.callback(parseInt(this.parentElement.dataset.index), this.parentElement);
                }
            });
        };
        SelectBox.prototype.checked = function (input) {
            var self = this;
            var index = parseInt(input.parentElement.dataset.index);
            //多选框两种情况
            if (input.type === 'checkbox') {
                if (input.value === 'true') {
                    input.checked = false;
                    input.value = 'false';
                    var i = self.selectArr.indexOf(index);
                    if (i > -1) {
                        self.selectArr.splice(i, 1);
                    }
                }
                else {
                    self.selectArr.push(index);
                    input.checked = true;
                    input.value = 'true';
                }
            }
            //单选框的两种情况,this.value记录每次是否点击,value === false 这次没有点击
            else {
                if (self.lastRadioBox !== input) {
                    self.selectArr[0] = index;
                    // if (self.para.select.isRadioNotchecked) {
                    input.value = 'true';
                    input.checked = true;
                    // }
                }
                else {
                    if (self.para.select.isRadioNotchecked) {
                        if (!(input.value === 'true')) {
                            self.selectArr[0] = index;
                            input.value = 'true';
                            input.checked = true;
                        }
                        else {
                            self.selectArr = [];
                            input.value = 'false';
                            input.checked = false;
                        }
                    }
                    else {
                        input.checked = true;
                        self.selectArr = [];
                        return;
                    }
                }
                self.lastRadioBox = input;
            }
            //
            // if (self.para.select && self.para.select.callback) {
            //     self.para.select.callback(index);
            // }
        };
        /*
         * 为data[](ListItem)中的每个元素创建对应的selectBox.
         * */
        SelectBox.prototype.addByList = function () {
            var _this = this;
            Array.isArray(this.para.data) && this.para.data.forEach(function (obj, i) {
                var selectBox = checkBox_1.CheckBox.initCom(_this.guidName, obj.text ? obj.text : '', _this.type), input = selectBox.querySelector('input'), span = selectBox.querySelector('span');
                //如果单选框不允许多次选中，则默认第一个单选框为选中状态
                if (!_this.para.select.isRadioNotchecked && i === 0 && _this.type === 'radio') {
                    _this.selectArr[0] = i;
                    input.checked = true;
                }
                selectBox.dataset.index = i.toString();
                input.value = obj.value ? obj.value.toString() : '';
                _this.para.container.appendChild(selectBox);
            });
        };
        /*
         * 为单个dom对象添加selectBox
         * */
        SelectBox.prototype.addByItem = function (el) {
            var selectBox = checkBox_1.CheckBox.initCom(this.guidName);
            selectBox.dataset.index = el.dataset.index;
            el.appendChild(selectBox);
        };
        /*
         * 设置selectBox为禁用状态
         * 传入参数:要被禁用的selectbox的下标数组
         * */
        SelectBox.prototype.setDisabled = function (indexs) {
            var _this = this;
            Array.isArray(indexs) && indexs.forEach(function (i) {
                var selectBox = _this.para.container.childNodes[i];
                selectBox.classList.add('disabled');
            });
        };
        /*
         * 取消selectBox为禁用状态
         * */
        SelectBox.prototype.unsetDisabled = function (indexs) {
            var _this = this;
            Array.isArray(indexs) && indexs.forEach(function (i) {
                var selectBox = _this.para.container.childNodes[i];
                selectBox.classList.remove('disabled');
            });
        };
        /*
         * 获取当前选中的selectBox
         * */
        SelectBox.prototype.get = function () {
            return this.selectArr;
        };
        SelectBox.prototype.getSelect = function () {
            var _this = this;
            var selected = [];
            this.get().forEach(function (n) {
                _this.para.data.forEach(function (d, i) {
                    if (i === n) {
                        selected.push(d);
                    }
                });
            });
            return selected;
        };
        //不保留状态，空数组默认全清
        SelectBox.prototype.set = function (index) {
            this.unsetSelectedAll();
            this.selected(index, true);
        };
        //全选
        SelectBox.prototype.setAll = function () {
            this.selectAll(true);
        };
        //添加选中状态
        SelectBox.prototype.addSelected = function (index) {
            this.selected(index, true);
        };
        // 取消选中
        SelectBox.prototype.unSet = function (index) {
            this.selected(index);
        };
        /**
         * 勾选
         * @param index 只能传下标
         * @param set true为set，false为unset
         */
        SelectBox.prototype.selected = function (index, set) {
            var self = this, spans = d.queryAll('span.check-span', self.para.container), isSelected = false, selectNum = self.get();
            index.forEach(function (i) {
                selectNum.forEach(function (n) {
                    if (i === n) {
                        isSelected = true;
                    }
                });
                if (set) {
                    if (!isSelected) {
                        self.checked(d.query('input', spans[i].parentElement));
                    }
                }
                else {
                    if (isSelected) {
                        self.checked(d.query('input', spans[i].parentElement));
                    }
                }
                isSelected = false;
            });
        };
        //全清
        SelectBox.prototype.unsetSelectedAll = function () {
            this.selectAll();
        };
        SelectBox.prototype.selectAll = function (set) {
            var data = d.queryAll('span.check-span', this.para.container), nums = [];
            data && data.forEach(function (n, i) {
                nums.push(i);
            });
            this.selected(nums, set);
        };
        return SelectBox;
    }(basic_1.BasicCom));
    exports.SelectBox = SelectBox;
});

define("CheckBox", ["require", "exports", "BasicCom"], function (require, exports, basic_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="CheckBox"/>
    var tools = C.tools;
    var d = C.d;
    var CheckBox = /** @class */ (function (_super) {
        __extends(CheckBox, _super);
        function CheckBox(para) {
            var _this = _super.call(this) || this;
            _this.para = para;
            _this.keyHandle = function (e) {
                var keyCode = e.keyCode || e.which || e.charCode;
                if (tools.isNotEmpty(_this._tabIndexKey)) {
                    if (keyCode === _this._tabIndexKey) {
                        _this.set(!_this.get());
                    }
                }
                else if (keyCode === 13) {
                    _this.set(!_this.get());
                }
            };
            _this._wrapper = CheckBox.initCom(tools.getGuid(), para.text);
            _this._tabIndexKey = para.tabIndexKey;
            _this.tabIndex = para.tabIndex;
            if (para.className) {
                _this._wrapper.classList.add(para.className);
            }
            _this.com = _this._wrapper.querySelector('input');
            para.container.appendChild(_this._wrapper);
            if (_this.para.onSet) {
                _this.onSet = _this.para.onSet;
            }
            d.on(_this._wrapper, 'click', '.check-span', function (e) {
                if (typeof para.onSelect === 'function') {
                    _this.para.onSelect(!!_this.get());
                }
                if (typeof _this.onSet === 'function') {
                    _this.onSet(!!_this.get());
                }
            });
            return _this;
        }
        CheckBox.initCom = function (guidName, text, type) {
            if (type === void 0) { type = 'checkbox'; }
            text = tools.str.toEmpty(text);
            var checkBox = d.create("<div title=\"" + text + "\" class =\"select-box\"></div>"), input = d.create("<input name=\"" + guidName + "\" type=\"" + type + "\">"), span = d.create("<span class=\"check-span label-" + type + "\">" + text + "</span>");
            //手动绑定label点击后input的选中状态
            d.on(span, 'click', function (e) {
                input.checked = !input.checked;
            });
            checkBox.appendChild(input);
            checkBox.appendChild(span);
            return checkBox;
        };
        CheckBox.prototype.get = function () {
            return this.com.checked ? 1 : 0;
        };
        CheckBox.prototype.set = function (flag) {
            if (flag === void 0) { flag = 0; }
            this.com.checked = !!flag;
            if (typeof this.onSet === 'function') {
                this.onSet(!!flag);
            }
        };
        CheckBox.prototype.destroy = function () {
            d.remove(this.wrapper);
        };
        CheckBox.prototype.setSelected = function () {
            d.query('.check-span', this.wrapper).click();
        };
        return CheckBox;
    }(basic_1.BasicCom));
    exports.CheckBox = CheckBox;
    var checkBoxEvent = (function () {
        var count = 0;
        function checkEvent(ev) {
            var el = d.closest(ev.target, '.new-select-box');
            if (el !== null && !el.classList.contains('disabled')) {
                var checkBox = d.data(el);
                if (checkBox.clickArea === 'all') {
                    ev.stopPropagation();
                    checkBox.checked = !checkBox.checked;
                    tools.isFunction(checkBox.onClick) && checkBox.onClick(checkBox.checked);
                }
                else if (checkBox.clickArea === 'box') {
                    var box = el.querySelector('.check-span');
                    if (d.closest(ev.target, '.check-span') === box) {
                        ev.stopPropagation();
                        checkBox.checked = !checkBox.checked;
                        tools.isFunction(checkBox.onClick) && checkBox.onClick(checkBox.checked);
                    }
                }
            }
        }
        return {
            plus: function () {
                count++;
                if (count === 1) {
                    document.body.addEventListener('click', checkEvent, true);
                    // d.on(document.body, 'click', '.new-select-box',checkEvent);
                }
            },
            minus: function () {
                count--;
                if (count === 0) {
                    document.body.removeEventListener('click', checkEvent, true);
                    // d.off(document.body, 'click', '.new-select-box',checkEvent);
                }
            },
        };
    })();
    var NewCheckBox = /** @class */ (function (_super) {
        __extends(NewCheckBox, _super);
        function NewCheckBox(para) {
            var _this = _super.call(this) || this;
            _this._checked = false;
            _this._status = 0;
            _this._size = 20;
            _this._disabled = false;
            _this.guid = tools.getGuid();
            _this.container = para.container;
            _this._wrapper = NewCheckBox.initCom(_this.guid, tools.str.toEmpty(para.text));
            _this.custom = para.custom;
            _this.input = _this._wrapper.querySelector('input');
            _this.checkSpan = _this._wrapper.querySelector('.check-span');
            _this.size = para.size;
            _this.status = para.status;
            _this.onSet = para.onSet;
            _this.onClick = para.onClick;
            if (para.className) {
                _this._wrapper.classList.add(para.className);
            }
            _this.clickArea = tools.isEmpty(para.clickArea) ? 'all' : para.clickArea;
            _this.container.appendChild(_this._wrapper);
            _this.disabled = para.disabled;
            d.data(_this.wrapper, _this);
            checkBoxEvent.plus();
            return _this;
        }
        NewCheckBox.initCom = function (guidName, text, type) {
            if (type === void 0) { type = 'checkbox'; }
            var box = d.create("<div id=\"" + guidName + "\" title=\"" + text + "\" class =\"new-select-box\"></div>"), input = d.create("<input type=\"" + type + "\" name=\"" + guidName + "\"/>"), checkSpan = d.create("<span class=\"check-span label-" + type + "\"></span>");
            box.appendChild(input);
            box.appendChild(checkSpan);
            if (text !== '') {
                var textSpan = d.create("<span class=\"check-text\">" + text + "</span>");
                box.appendChild(textSpan);
            }
            return box;
        };
        NewCheckBox.prototype.change = function (status) {
            this._checked = status === 1;
            this._status = tools.isEmpty(status) ? 0 : status;
            if (status === 2) {
                this.input.checked = false;
                this.checkSpan.classList.add('indeterminate');
            }
            else {
                this.input.checked = !!status;
                this.checkSpan.classList.remove('indeterminate');
            }
        };
        NewCheckBox.prototype.get = function () {
            return this.checked;
        };
        NewCheckBox.prototype.set = function (flag) {
            if (flag === void 0) { flag = 0; }
            this.checked = !!flag;
            // if (typeof this.onSet === 'function') {
            //     this.onSet(!!flag);
            // }
        };
        Object.defineProperty(NewCheckBox.prototype, "checked", {
            get: function () {
                return this._checked;
            },
            set: function (checked) {
                if (this._checked !== checked) {
                    this.change(checked ? 1 : 0);
                }
                if (typeof this.onSet === 'function') {
                    this.onSet(checked);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NewCheckBox.prototype, "status", {
            get: function () {
                return this._status;
            },
            set: function (status) {
                if (this._status !== status) {
                    this.change(status);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NewCheckBox.prototype, "size", {
            get: function () {
                return this._size;
            },
            set: function (size) {
                if (this._size !== size) {
                    if (!tools.isEmpty(size) && typeof size === 'number') {
                        this._size = size;
                        this.checkSpan.style.height = size + 'px';
                        this.checkSpan.style.width = size + 'px';
                        this.checkSpan.style.lineHeight = size + 'px';
                        this.wrapper.style.fontSize = size / 10 * 6 + 'px';
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NewCheckBox.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (e) {
                if (this._disabled !== e) {
                    if (tools.isNotEmpty(e)) {
                        this._disabled = e;
                        if (this._disabled) {
                            this.wrapper.classList.add('disabled');
                        }
                        else {
                            this.wrapper.classList.remove('disabled');
                        }
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NewCheckBox.prototype, "custom", {
            get: function () {
                return this._custom;
            },
            set: function (obj) {
                this._custom = obj;
                if (tools.isNotEmpty(obj)) {
                    var el = d.create('<style></style>');
                    var style = '';
                    if (tools.isNotEmpty(obj.noCheck)) {
                        style += "\n                 #" + this.guid + " input[type=checkbox]:not(:checked)+.check-span:not(.indeterminate):after{\n                      display: inline-block;\n                      position: absolute;\n                      top: 0;\n                      left: 0;\n                      width: 100%;\n                      height: 100%;\n                      content:\"" + obj.noCheck + "\";\n                      color: #007AFF;\n                      text-align: center;\n                      font-weight: lighter;\n                 }\n                ";
                    }
                    if (tools.isNotEmpty(obj.indeterminate)) {
                        style += "\n                #" + this.guid + " input[type=checkbox]+.check-span.indeterminate:after {\n                      position: absolute;\n                      top: 0;\n                      left: 0;\n                      background: transparent;\n                      content:\"" + obj.indeterminate + "\";\n                      width: 100%;\n                      height: 100%;\n                      text-align: center;\n                      font-weight: lighter;\n                      color: #007AFF;\n                }\n                ";
                    }
                    if (tools.isNotEmpty(obj.check)) {
                        style += "\n                 #" + this.guid + " input[type=checkbox]:checked+.check-span:after{\n                      content:\"" + obj.check + "\";\n                      text-align: center;\n                      font-weight: lighter;\n                 }\n                ";
                    }
                    el.innerHTML = style;
                    this.wrapper.insertBefore(el, this.wrapper.firstChild);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NewCheckBox.prototype, "onClick", {
            get: function () {
                return this._onClick;
            },
            set: function (e) {
                this._onClick = e;
            },
            enumerable: true,
            configurable: true
        });
        NewCheckBox.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            checkBoxEvent.minus();
        };
        return NewCheckBox;
    }(basic_1.BasicCom));
    exports.NewCheckBox = NewCheckBox;
});

define("NumInput", ["require", "exports", "TextInput"], function (require, exports, text_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = C.tools;
    var NumInput = /** @class */ (function (_super) {
        __extends(NumInput, _super);
        function NumInput(p) {
            var _this = _super.call(this, tools.obj.merge({
                step: 1,
                max: null,
                min: null
            }, p, {
                icons: ['iconfont icon-jiahao', 'iconfont icon-jianhao'],
                iconHandle: function (index) {
                    _this.iconHandle(index);
                }
            })) || this;
            _this.iconHandle = function (index) {
                var p = _this.para;
                if (index === 0) {
                    _this.num = p.step || 1;
                }
                else if (index === 1) {
                    _this.num = -p.step || -1;
                }
                _this.set(_this.get() + _this.num);
                /*溢出判断*/
                _this.isOverflow(p.max, p.min, _this);
                if (_this.para.callback && typeof _this.para.callback() === 'function') {
                    _this.para.callback();
                }
            };
            _this.keyHandle = function (e) {
                var keyCode = e.keyCode || e.which || e.charCode;
                switch (keyCode) {
                    case 38: // Up
                        _this.iconHandle(0);
                        break;
                    case 40: // Down
                        _this.iconHandle(1);
                        break;
                }
            };
            var self = _this;
            // 设置默认值
            self.set(p.defaultNum);
            self.tabIndex = p.tabIndex;
            // self.on('input',function(e:KeyboardEvent) {
            //     let k = e.which || e.keyCode ;
            //
            //
            //
            //     let str = '';
            //     for(let key in e){
            //         str += (key + ':' + e[key]+';  ');
            //     }
            //
            //     if ((k <= 57 && k >= 48) || (k <= 105 && k >= 96) || (k === 8)){
            //         self.isOverflow(max, min, self);
            //     } else {
            //         //禁止键盘输入非数字
            //         e.returnValue = false;
            //     }
            // });
            // 监听按键输入
            self.on('keyup', function (e) {
                this.value = this.value.replace(/\D+/, '');
                self.isOverflow(p.max, p.min, self);
                if (self.para.callback && typeof self.para.callback() === 'function') {
                    self.para.callback();
                }
            });
            return _this;
        }
        NumInput.prototype.get = function () {
            return parseInt(this.input.value);
        };
        NumInput.prototype.set = function (str) {
            this.input.value = tools.str.toEmpty(str);
            if (this.para.callback && typeof this.para.callback() === 'function') {
                this.para.callback();
            }
        };
        /**
         *
         * @param max
         * @param min
         * @param self
         */
        NumInput.prototype.isOverflow = function (max, min, self) {
            if (typeof max === 'number' && self.get() > max) {
                self.set(max);
            }
            if (typeof min === 'number' && self.get() < min) {
                self.set(min);
            }
        };
        return NumInput;
    }(text_1.TextInput));
    exports.NumInput = NumInput;
});

define("TextInput", ["require", "exports", "BasicCom"], function (require, exports, basic_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="TextInput"/>
    var tools = C.tools;
    var d = C.d;
    var Shell = C.Shell;
    var TextInput = /** @class */ (function (_super) {
        __extends(TextInput, _super);
        function TextInput(para) {
            var _this = _super.call(this) || this;
            _this.para = para;
            _this.keyHandle = function (e) { };
            _this.props = para;
            var defaultPara = {
                className: '',
                placeholder: '',
                readonly: false,
                disabled: false
            };
            _this.para = tools.obj.merge(defaultPara, para);
            _this.isReadonly = !!_this.para.readonly;
            _this.initInput();
            _this.initIcons();
            para.container.appendChild(_this._wrapper);
            d.on(_this.input, 'change', function () {
                // debugger;
                _this.set(_this.get());
            });
            return _this;
        }
        TextInput.prototype.tabIndexElGet = function () {
            return this.input;
        };
        /**
         * 初始化输入框
         * @return {HTMLInputElement}
         */
        TextInput.prototype.initInput = function () {
            var div = document.createElement('div');
            div.classList.add('text-input');
            this._wrapper = div;
            var input = document.createElement('input');
            input.type = (typeof this.para.type === 'undefined') ? 'text' : this.para.type;
            input.className = this.para.className;
            input.placeholder = this.para.placeholder;
            input.readOnly = this.para.readonly;
            input.disabled = this.para.disabled;
            this.input = input;
            div.appendChild(input);
        };
        /**
         * 初始化输入框按钮图标
         */
        TextInput.prototype.initIcons = function () {
            var icons = this.para.icons;
            if (icons && icons[0]) {
                var iconGroup_1 = d.create("<div class=\"btn-group\"></div>");
                icons.forEach(function (icon, i) {
                    iconGroup_1.appendChild(d.create("<a class=\"btn btn-sm icon " + icon + "\" data-index=\"" + i + "\"></a>"));
                });
                this.input.style.width = "calc(100% - " + icons.length * 20 + "px)";
                this._wrapper.appendChild(iconGroup_1);
                // 事件绑定
                if (typeof this.para.iconHandle === 'function') {
                    this.initIconEven(iconGroup_1);
                }
                // console.log(iconGroup)
                this.iconGroup = iconGroup_1;
            }
        };
        TextInput.prototype.initIconEven = function (iconGroup) {
            var _this = this;
            var self = this, can2dScan = Shell.inventory.can2dScan;
            if (can2dScan) {
                Shell.inventory.openScan(function (res) {
                    if (res.success && res.data !== 'openSuponScan') {
                        self.set(res.data);
                        if (tools.isFunction(_this.para.on2dScan)) {
                            _this.para.on2dScan(res.data);
                        }
                    }
                });
            }
            else {
                d.on(iconGroup, 'click', 'a[data-index]', function (e) {
                    var index = parseInt(this.dataset.index);
                    if (this.dataset.type === 'scan') {
                        //扫码
                        // (<any>ShellAction.get()).device().scan({
                        //     callback: (even) => {
                        //         self.set(JSON.parse(even.detail).data)
                        //     }
                        // });
                    }
                    else {
                        self.props.iconHandle(index, this);
                    }
                    e.stopPropagation();
                });
            }
        };
        Object.defineProperty(TextInput.prototype, "isScan", {
            get: function () {
                return this._isScan;
            },
            set: function (flag) {
                if (!flag && this._scanEl) {
                    this._scanEl.remove();
                    this._scanEl = null;
                }
                if (!this._scanEl && flag) {
                    if (!this.iconGroup) {
                        this.iconGroup = d.create("<div class=\"btn-group\"></div>");
                        this._wrapper.appendChild(this.iconGroup);
                        this.initIconEven(this.iconGroup);
                    }
                    this._scanEl = d.create("<a data-index=\"-1\" class=\"btn btn-sm icon iconfont icon-richscan_icon\" data-type=\"scan\"></a>");
                    d.append(this.iconGroup, this._scanEl);
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 事件绑定
         * @param type - HTMLInputElement 原生事件
         * @param handle - 事件处理
         */
        TextInput.prototype.on = function (type, handle) {
            d.on(this.input, type, handle);
        };
        TextInput.prototype.get = function () {
            return this.input.value;
        };
        TextInput.prototype.set = function (str) {
            this.input.value = tools.str.toEmpty(str);
            typeof this.onSet === 'function' && this.onSet(str);
        };
        TextInput.prototype.readonly = function (is) {
            if (typeof is === 'undefined') {
                return this.isReadonly;
            }
            else {
                this.input.readOnly = is;
                return is;
            }
        };
        TextInput.prototype.placeholder = function (str) {
            this.input.placeholder = str;
        };
        TextInput.prototype.destroy = function () {
            d.remove(this._wrapper);
            this._wrapper = null;
            this.input = null;
            this.para = null;
        };
        TextInput.prototype.wrapperGet = function () {
            return this._wrapper;
        };
        TextInput.prototype.disable = function (flag) {
            this.input.disabled = flag;
            this._wrapper.classList.toggle('disabled', flag);
        };
        TextInput.prototype.focus = function () {
            this.input.focus();
        };
        return TextInput;
    }(basic_1.BasicCom));
    exports.TextInput = TextInput;
});

define("TextInput1", ["require", "exports", "BasicCom"], function (require, exports, basic_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = C.d;
    var tools = C.tools;
    var TextInput1 = /** @class */ (function (_super) {
        __extends(TextInput1, _super);
        function TextInput1(para) {
            var _this = _super.call(this, para) || this;
            _this.placeholder = para.placeholder;
            _this.type = para.type || 'text';
            _this.readonly = para.readonly;
            _this.label = para.label;
            _this.value = para.value;
            _this.labelWidth = para.labelWidth;
            _this.inputIcon = para.inputIcon;
            return _this;
            // this.wrapper = this.wrapperInit(this._wrapper);
        }
        TextInput1.prototype.wrapperInit = function (para) {
            var text = d.create({ tag: 'div', props: { className: 'text-input1' } });
            // d.append(text, this.labelEl);
            if (this.labelWidth) {
                text.appendChild(this.labelEl);
            }
            this.inputWrapper.appendChild(this.inputEl);
            text.appendChild(this.inputWrapper);
            return text;
        };
        Object.defineProperty(TextInput1.prototype, "inputIcon", {
            get: function () {
                return this._inputIcon;
            },
            set: function (str) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextInput1.prototype, "inputWrapper", {
            get: function () {
                if (!this._inputWrapper) {
                    this._inputWrapper = d.create({ tag: 'div', props: { className: 'input-wrapper' } });
                }
                return this._inputWrapper;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextInput1.prototype, "labelEl", {
            get: function () {
                if (!this._labelEl && this.labelWidth !== 0) {
                    // debugger;
                    this._labelEl = d.create("<label></label>");
                }
                return this._labelEl;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextInput1.prototype, "label", {
            get: function () {
                return this._label;
            },
            set: function (str) {
                this._label = str;
                this.labelEl.innerHTML = str;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextInput1.prototype, "labelWidth", {
            get: function () {
                return this._labelWidth;
            },
            set: function (value) {
                var parentWidth = this.wrapper.offsetWidth;
                var percent = 5 / parentWidth + 1.8 + '%';
                // let rightValue = parseInt(this.labelEl.style.width = 'calc()');
                if (typeof value === 'string') {
                    this._labelWidth = value;
                    this.labelEl.style.width = value;
                    this.inputWrapper.style.width = "calc(100% - " + value + ")";
                }
                else if (typeof value === 'number' && value >= 0) {
                    this._labelWidth = value + 'px';
                    this.labelEl.style.width = value + 'px';
                    this.inputWrapper.style.width = "calc(100% - " + value + "px)";
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextInput1.prototype, "inputEl", {
            get: function () {
                if (!this._inputEL) {
                    this._inputEL = d.create({ tag: 'input' });
                }
                return this._inputEL;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextInput1.prototype, "type", {
            get: function () {
                return this._type;
            },
            set: function (str) {
                var types = ['text', 'button', 'checkbox', 'password', 'radio', 'image', 'reset', 'file', 'submit', 'textarea'], type = types.indexOf(str) > -1 ? str : types[0];
                this.inputEl.type = this._type = type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextInput1.prototype, "placeholder", {
            get: function () {
                return this._placeholder;
            },
            set: function (str) {
                if (str && typeof str === 'string') {
                    this._placeholder = str;
                    this.inputEl.placeholder = str;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextInput1.prototype, "readonly", {
            get: function () {
                return this._readonly;
            },
            set: function (readValue) {
                this.inputEl.readOnly = readValue;
                this._readonly = readValue;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextInput1.prototype, "value", {
            get: function () {
                // return this.value;
                return this.inputEl.value;
            },
            set: function (val) {
                // this.value = val;
                // this.inputEl.innerHTML = val;\
                if (tools.isNotEmpty(val)) {
                    this.inputEl.value = val;
                }
            },
            enumerable: true,
            configurable: true
        });
        TextInput1.prototype.rightIconAdd = function (icon) {
        };
        TextInput1.prototype.rightIconDel = function (index) {
        };
        return TextInput1;
    }(basic_1.FormCom));
    exports.TextInput1 = TextInput1;
    var TextAreaInput = /** @class */ (function (_super) {
        __extends(TextAreaInput, _super);
        function TextAreaInput(para) {
            var _this = _super.call(this, para) || this;
            _this.value = para.value;
            return _this;
        }
        TextAreaInput.prototype.wrapperInit = function (para) {
            this.textarea = d.create({ tag: 'textarea', props: { className: 'report-textarea' } });
            if (para.placeholder) {
                this.textarea.setAttribute('placeholder', para.placeholder);
            }
            return this.textarea;
        };
        Object.defineProperty(TextAreaInput.prototype, "value", {
            get: function () {
                // return this.value;
                return this.textarea.value;
            },
            set: function (val) {
                // this.value = val;
                // this.inputEl.innerHTML = val;\
                if (tools.isNotEmpty(val)) {
                    this.textarea.value = val;
                }
            },
            enumerable: true,
            configurable: true
        });
        return TextAreaInput;
    }(basic_1.FormCom));
    exports.TextAreaInput = TextAreaInput;
});

define("SelectInput", ["require", "exports", "TextInput", "DropDown"], function (require, exports, text_1, dropdown_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="SelectInput"/>
    var tools = C.tools;
    var d = C.d;
    var SelectInput = /** @class */ (function (_super) {
        __extends(SelectInput, _super);
        function SelectInput(para) {
            var _this = _super.call(this, tools.obj.merge(para, {
                icons: ['iconfont icon-arrow-down'],
                iconHandle: para.clickType !== 0 ? function () {
                    _this.toggle();
                } : null
            })) || this;
            _this.keyHandle = function (e) {
                var data = _this.getData();
                if (Array.isArray(data)) {
                    var index = _this.dropdown.selectedIndex, length_1 = _this.getData().length;
                    if (e.keyCode === 38) {
                        index--;
                    }
                    else if (e.keyCode === 40) {
                        index++;
                    }
                    if (index < 0) {
                        index = 0;
                    }
                    if (index >= length_1 - 1) {
                        index = length_1 - 1;
                    }
                    _this.set(data[index].value);
                }
            };
            _this.tabIndex = para.tabIndex;
            _this.ajaxFun(para);
            _this.para = para;
            // clickType为0时
            if (para.clickType === 0) {
                _this.input.style.cursor = 'pointer';
                d.on(_this._wrapper, 'click', function (e) {
                    e.stopPropagation();
                    _this.toggle();
                });
            }
            var dropPara = {
                el: document.body,
                data: para.data,
                ajax: para.ajax,
                multi: para.multi,
                className: para.dropClassName
            };
            _this.para.multi ? (dropPara['onMultiSelect'] = function (selected, index) {
                var splitCode = _this.para.multiSplit ? _this.para.multiSplit : ',';
                var innerVal = '';
                if (Array.isArray(selected) && selected[0]) {
                    innerVal += selected[0].value;
                    for (var i = 1; i < selected.length; i++) {
                        innerVal += "" + splitCode + selected[i].value;
                    }
                    _this.input.value = innerVal;
                }
                _this.para.onSet && _this.para.onSet(selected, index);
            }) : (dropPara['onSelect'] = function (item, index) {
                _this.input.value = _this.para.useInputVal ? item.value.toString() : item.text;
                _this.para.onSet && _this.para.onSet(item, index);
            });
            _this.dropdown = new dropdown_1.DropDown(dropPara);
            return _this;
        }
        SelectInput.prototype.toggle = function () {
            this.dropdown.toggle(this._wrapper);
        };
        SelectInput.prototype.ajaxFun = function (para) {
            var _this = this;
            if (para.ajax) {
                var fun_1 = para.ajax.fun;
                para.ajax.fun = function (url, value, callback) {
                    fun_1(url, value === '' ? _super.prototype.get.call(_this) : value, callback);
                };
            }
        };
        SelectInput.prototype.getData = function () {
            return this.para.data;
        };
        SelectInput.prototype.set = function (value) {
            if (!this.dropdown.select(value)) {
                this.defaultVal = value;
                _super.prototype.set.call(this, value);
                typeof this.onSet === 'function' && this.onSet(value);
            }
            // super.set(value);
        };
        SelectInput.prototype.get = function () {
            if (this.para.multi) {
                var seleArr = this.dropdown.get();
                var cacheData = this.para.data;
                var result = cacheData[seleArr[0]]['value'];
                if (seleArr.length > 1) {
                    for (var j = 1, len = seleArr.length; j < len; j++) {
                        result += ',' + cacheData[seleArr[j]]['value'];
                    }
                }
                return result;
            }
            else {
                var selected = this.dropdown.get();
                if (this.para.useInputVal) {
                    return _super.prototype.get.call(this);
                }
                else {
                    return selected === null ? this.defaultVal : selected.value;
                }
            }
        };
        SelectInput.prototype.getText = function () {
            return this.input.value;
        };
        SelectInput.prototype.showItems = function (indexes) {
            this.dropdown.showItems(indexes);
        };
        SelectInput.prototype.setPara = function (para) {
            this.ajaxFun(para);
            this.dropdown.setPara(para);
        };
        SelectInput.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.dropdown.destroy();
        };
        return SelectInput;
    }(text_1.TextInput));
    exports.SelectInput = SelectInput;
});

define("ModalFooter", ["require", "exports", "Component", "InputBox", "Button"], function (require, exports, Component_1, InputBox_1, Button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="ModalFooter"/>
    var d = C.d;
    var tools = C.tools;
    /**
     * 模态框尾部
     */
    var ModalFooter = /** @class */ (function (_super) {
        __extends(ModalFooter, _super);
        function ModalFooter(modalFooter) {
            var _this = _super.call(this, modalFooter) || this;
            _this.modalFooter = modalFooter;
            if (tools.isEmpty(modalFooter))
                modalFooter = {};
            _this.init(modalFooter);
            return _this;
        }
        ModalFooter.prototype.wrapperInit = function () {
            return d.create("<div class=\"modal-footer\"></div>");
        };
        ModalFooter.prototype.init = function (modalFooter) {
            this.leftPanel = (modalFooter && modalFooter.leftPanel) ? modalFooter.leftPanel : void 0;
            this.rightPanel = (modalFooter && modalFooter.rightPanel) ? modalFooter.rightPanel : void 0;
        };
        Object.defineProperty(ModalFooter.prototype, "leftPanel", {
            get: function () {
                return this._leftPanel;
            },
            set: function (leftPanel) {
                if (tools.isEmpty(leftPanel)) {
                    return;
                }
                var leftComsWrapper = d.query('.left-plane', this.wrapper);
                if (!leftComsWrapper) {
                    leftComsWrapper = d.create("<div class=\"left-plane\" style=\"display: inline-block;\"></div>");
                    this.wrapper.appendChild(leftComsWrapper);
                    console.log(this.wrapper);
                }
                else {
                    d.remove(leftComsWrapper);
                    leftComsWrapper = d.create("<div class=\"left-plane\" style=\"display: inline-block;\"></div>");
                    this.wrapper.appendChild(leftComsWrapper);
                }
                if (leftPanel instanceof InputBox_1.InputBox) {
                    leftPanel.container = leftComsWrapper;
                    leftPanel.compactWidth = 8;
                }
                else {
                    leftComsWrapper.appendChild(leftPanel);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ModalFooter.prototype, "rightPanel", {
            get: function () {
                return this._rightPanel;
            },
            set: function (rightPanel) {
                var rightPanelWrapper = d.query('.right-plane', this.wrapper);
                if (!rightPanelWrapper) {
                    rightPanelWrapper = d.create("<div class=\"right-plane\" style=\"display: inline-block;float: right;\"></div>");
                    this.wrapper.appendChild(rightPanelWrapper);
                }
                else {
                    d.remove(rightPanelWrapper);
                    rightPanelWrapper = d.create("<div class=\"right-plane\" style=\"display: inline-block;float: right;\"></div>");
                    this.wrapper.appendChild(rightPanelWrapper);
                }
                if (tools.isEmpty(rightPanel)) {
                    rightPanel = new InputBox_1.InputBox({
                        compactWidth: 8
                    });
                    var cancelBtn = new Button_1.Button({ content: '取消', type: 'default', key: 'cancelBtn' }), okBtn = new Button_1.Button({ content: '确认', type: 'primary', key: 'okBtn' });
                    rightPanel.addItem(cancelBtn);
                    rightPanel.addItem(okBtn);
                    rightPanel.container = rightPanelWrapper;
                }
                else if (rightPanel instanceof InputBox_1.InputBox) {
                    rightPanel.container = rightPanelWrapper;
                    rightPanel.compactWidth = 8;
                }
                else {
                    rightPanelWrapper.appendChild(rightPanel);
                }
                this._rightPanel = rightPanel;
            },
            enumerable: true,
            configurable: true
        });
        return ModalFooter;
    }(Component_1.Component));
    exports.ModalFooter = ModalFooter;
});

define("ModalHeader", ["require", "exports", "Component", "Drag", "InputBox"], function (require, exports, Component_1, drag_1, InputBox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="ModalHeader"/>
    var d = C.d;
    var tools = C.tools;
    /**
     * 模态框头部
     */
    var ModalHeader = /** @class */ (function (_super) {
        __extends(ModalHeader, _super);
        /**
         * 头部颜色 ----
         * 类型：string
         * 默认值：蓝色背景 + 白色字体
         * 除指定白色时字体显示为黑色外，指定其他颜色字体都为白色
         */
        // private _color?: string;
        // set color(color: string) {
        //     let modalTitle = d.query('.modal-title', this.wrapper),
        //         modalClose = (<HTMLElement> this.wrapper.querySelector('.close')),
        //         modalEnlarge = (<HTMLElement> this.wrapper.querySelector('.modal-enlarge'));
        //
        //     color = tools.isEmpty(color) ? 'white' : color;
        //
        //     if (color === 'white' || color === '#fff' || color === '#ffffff' || color === 'rgb(255, 255, 255)') {
        //         this.wrapper.style.backgroundColor = '#fff';
        //         if (modalClose) {
        //             modalClose.style.color = '#000';
        //         }
        //         if (modalTitle) {
        //             modalTitle.style.color = '#000';
        //         }
        //         if (modalEnlarge) {
        //             modalEnlarge.style.color = '#000';
        //         }
        //     } else {
        //         this.wrapper.style.backgroundColor = color;
        //         modalTitle.style.color = '#fff';
        //         if (modalClose) {
        //             modalClose.style.color = '#fff';
        //             modalClose.style.opacity = '1';
        //         }
        //         if (modalEnlarge) {
        //             modalEnlarge.style.color = '#fff';
        //             modalEnlarge.style.opacity = '1';
        //         }
        //     }
        //     this._color = color;
        // }
        //
        // get color() {
        //     return this._color;
        // }
        /**
         * 标题图标
         * 类型：string
         * 默认值：空
        //  */
        // private _icon?: string;
        // set icon(icon: string) {
        //     this._icon = tools.isEmpty(icon) ? '' : icon;
        // }
        //
        // get icon() {
        //     return this._icon;
        // }
        function ModalHeader(modalHeader) {
            var _this = _super.call(this, modalHeader) || this;
            _this.modalHeader = modalHeader;
            if (tools.isEmpty(modalHeader)) {
                modalHeader = {};
            }
            var defaultPara = {
                title: '',
                color: '',
                isClose: true,
                isDrag: true,
                isFullScreen: false,
            };
            _this.init(tools.obj.merge(defaultPara, modalHeader));
            return _this;
        }
        ModalHeader.prototype.wrapperInit = function () {
            return d.create("<div class=\"modal-header\"></div>");
        };
        ModalHeader.prototype.init = function (modalHeader) {
            // if(this.wrapper){
            //     d.remove(this.wrapper);
            // }
            // this.wrapper = d.create(`<div class="modal-header"></div>`);
            // d.append(modalHeader.container, this.wrapper);
            this.drag = null;
            this._dragEl = modalHeader.dragEl;
            // this.container = modalHeader.container;
            this.title = modalHeader.title;
            this.isDrag = modalHeader.isDrag;
            this.isClose = modalHeader.isClose; //增加...
            this.isFullScreen = modalHeader.isFullScreen; //增加
            this.rightPanel = modalHeader.rightPanel;
            // this.color = modalHeader.color;
            // this.icon = modalHeader.icon;
        };
        Object.defineProperty(ModalHeader.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (title) {
                this._title = tools.isEmpty(title) ? '提示' : tools.str.toEmpty(title);
                var modalTitle = d.query('.modal-title', this.wrapper);
                if (!modalTitle) {
                    modalTitle = d.create("<h1 class=\"modal-title\"></h1>");
                    this.wrapper.appendChild(modalTitle);
                }
                modalTitle.innerHTML = this._title;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ModalHeader.prototype, "isDrag", {
            get: function () {
                return this._isDrag;
            },
            set: function (isDrag) {
                //移动端不支持拖拽和拖拉
                if (tools.isMb) {
                    return;
                }
                this._isDrag = tools.isEmpty(isDrag) ? true : isDrag;
                if (this._isDrag) {
                    this.drag = new drag_1.Drag({ dom: this._dragEl, container: this._dragEl.parentElement, head: this.wrapper });
                }
                if (this.drag && !this._isDrag) {
                    this.drag.pullEventOff();
                    this.drag = null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ModalHeader.prototype, "modalCloseEl", {
            get: function () {
                return this._modalCloseEl;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ModalHeader.prototype, "isClose", {
            get: function () {
                return this._isClose;
            },
            set: function (isClose) {
                this._isClose = isClose;
                this._modalCloseEl = d.query('.close', this.wrapper);
                if (!this._modalCloseEl && this._isClose) {
                    this._modalCloseEl = d.create("<span class=\"close\">&times;</span>");
                    this.wrapper.appendChild(this._modalCloseEl);
                }
                else {
                    d.remove(this._modalCloseEl);
                    this._modalCloseEl = null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ModalHeader.prototype, "rightPanel", {
            get: function () {
                return this._rightPanel;
            },
            set: function (rightPanel) {
                if (tools.isEmpty(rightPanel)) {
                    return;
                }
                var rightPanelWrapper = d.query('.header-btn-right', this.wrapper);
                if (!rightPanelWrapper) {
                    rightPanelWrapper = d.create("<div class=\"header-btn-right\" style=\"display: inline-block;float: right;\"></div>");
                    this.wrapper.appendChild(rightPanelWrapper);
                }
                else {
                    d.remove(rightPanelWrapper);
                    rightPanelWrapper = d.create("<div class=\"header-btn-right\" style=\"display: inline-block;float: right;\"></div>");
                    this.wrapper.appendChild(rightPanelWrapper);
                }
                if (rightPanel instanceof InputBox_1.InputBox) {
                    rightPanel.container = rightPanelWrapper;
                    rightPanel.compactWidth = 8;
                }
                else {
                    rightPanelWrapper.appendChild(rightPanel);
                }
                this._rightPanel = rightPanel;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ModalHeader.prototype, "isFullScreen", {
            get: function () {
                return this._isFullScreen;
            },
            set: function (isFullScreen) {
                // 全屏时关闭拖拽
                if (this.drag && isFullScreen) {
                    this.drag.pullEventOff();
                    this.drag = null;
                }
                this._isFullScreen = tools.isEmpty(isFullScreen) ? false : isFullScreen;
                var modalEnlarge = d.query('.modal-enlarge', this.wrapper);
                if (!modalEnlarge && this._isFullScreen) {
                    var modalEnlarge_1 = d.create("<span data-fullscreen=\"enlarge\" class=\"iconfont icon-maximize modal-enlarge\"></span>");
                    this.wrapper.appendChild(modalEnlarge_1);
                }
                else {
                    d.remove(modalEnlarge);
                    modalEnlarge = null;
                }
            },
            enumerable: true,
            configurable: true
        });
        return ModalHeader;
    }(Component_1.Component));
    exports.ModalHeader = ModalHeader;
});

define("Modal", ["require", "exports", "Component", "ModalHeader", "ModalFooter", "Button", "Drag", "InputBox"], function (require, exports, Component_1, ModalHeader_1, ModalFooter_1, Button_1, drag_1, InputBox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="Modal"/>
    var d = C.d;
    var tools = C.tools;
    var allModalArr = [];
    /**
     * 模态框
     */
    var Modal = /** @class */ (function (_super) {
        __extends(Modal, _super);
        function Modal(para) {
            if (para === void 0) { para = {}; }
            var _this = _super.call(this, para) || this;
            _this.escKeyDown = function (e) {
                e.stopPropagation();
                var keyCode = e.keyCode || e.which || e.charCode;
                if (keyCode === 27) {
                    _this.isShow = false;
                }
            };
            _this._headWrapper = null;
            // private get header() {
            //     return this._header;
            // }
            _this._bodyWrapper = null;
            _this.init(para);
            return _this;
        }
        Object.defineProperty(Modal.prototype, "modalHeader", {
            get: function () {
                return this._modalHeader;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "modalFooter", {
            get: function () {
                return this._modalFooter;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal, "count", {
            get: function () {
                return allModalArr.length;
            },
            enumerable: true,
            configurable: true
        });
        ;
        Modal.prototype.wrapperInit = function (para) {
            var wrapper = h("div", { tabindex: parseInt(tools.getGuid('')), className: "modal-wrapper" });
            return wrapper;
        };
        Object.defineProperty(Modal.prototype, "escKey", {
            get: function () {
                return this._isEsc;
            },
            set: function (isEsc) {
                if (tools.isMb) {
                    return;
                }
                if (isEsc && !this._isEsc) {
                    d.on(this.wrapper, 'keydown', this.escKeyDown);
                }
                else if (!isEsc && this._isEsc) {
                    d.off(this.wrapper, 'keydown', this.escKeyDown);
                }
                this._isEsc = isEsc;
            },
            enumerable: true,
            configurable: true
        });
        Modal.prototype.init = function (modal) {
            // this.container = modal.container;
            this.container.classList.add('modal-box');
            // this._wrapper = d.create(`<div class="modal-wrapper"></div>`);
            this._isAdaptiveCenter = tools.isEmpty(modal.isAdaptiveCenter) ? false : modal.isAdaptiveCenter;
            this._isAnimate = this.isAdaptiveCenter ? false : (tools.isEmpty(modal.isAnimate) ? true : modal.isAnimate);
            // this.className = modal.className;
            // this.container.appendChild(this._wrapper);
            this.header = modal.header;
            this.body = modal.body;
            this.footer = modal.footer;
            this.width = modal.width;
            this._isOnceDestroy = modal.isOnceDestroy;
            this.isBackground = modal.isBackground;
            this.position = modal.position;
            this.fullPosition = modal.fullPosition;
            this.isShow = modal.isShow;
            this.height = modal.height;
            this.isDrag = modal.isDrag;
            this.size = modal.size;
            this.opacity = modal.opacity;
            this.onOk = modal.onOk;
            this.onCancel = modal.onCancel;
            this.onClose = modal.onClose;
            this.onLarge = modal.onLarge;
            this.top = modal.top;
            if (modal.keyDownHandle) {
                d.on(this.wrapper, 'keydown', modal.keyDownHandle);
            }
            this.escKey = tools.isEmpty(modal.escKey) ? true : modal.escKey;
            allModalArr.push(this);
        };
        Object.defineProperty(Modal.prototype, "headWrapper", {
            get: function () {
                if (this._headWrapper === null) {
                    this._headWrapper = this._headWrapper ? this._headWrapper : h("div", { className: 'head-wrapper' });
                    this.wrapper.appendChild(this._headWrapper);
                }
                return this._headWrapper;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "header", {
            set: function (header) {
                var _this = this;
                // 头部容器
                // if(this._headWrapper){
                //     this._headWrapper.remove();
                //     this._headWrapper = null;
                // }
                if (!header) {
                    return;
                }
                this._modalHeader = new ModalHeader_1.ModalHeader(tools.obj.merge({
                    container: this.headWrapper,
                    dragEl: this.wrapper,
                    isClose: true,
                }, typeof header === 'string' ? { title: header } : header));
                // 为头部关闭按钮绑定事件
                var close = this._modalHeader.modalCloseEl;
                close && d.on(close, 'click', function () {
                    _this.isShow = false;
                });
                this._header = header;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "bodyWrapper", {
            get: function () {
                if (!this._bodyWrapper) {
                    this._bodyWrapper = h("div", { className: "modal-body" + (tools.isMb ? ' modal-body-mobile' : '') });
                    tools.isNotEmpty(this.headWrapper) ? d.after(this.headWrapper, this._bodyWrapper) : d.prepend(this.wrapper, this._bodyWrapper);
                }
                return this._bodyWrapper;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "body", {
            get: function () {
                return this._body;
            },
            set: function (body) {
                if (!body) {
                    return;
                }
                //生成身体元素，仅一次
                var bodyWrapper = this.bodyWrapper;
                //删除掉原来挂载的身体
                if (this._body) {
                    bodyWrapper.removeChild(this._body);
                    this._body = null;
                }
                d.append(bodyWrapper, body);
                this._body = body;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "footer", {
            get: function () {
                return this._footer;
            },
            set: function (footer) {
                if (footer === undefined) {
                    return;
                }
                //生成尾部元素，仅一次
                if (!this._footWrapper) {
                    this._footWrapper = h("div", { className: "foot-wrapper" });
                    this.wrapper.appendChild(this._footWrapper);
                }
                //删除掉原来挂载的尾部
                if (this._footer) {
                    d.remove(this._footer.wrapper);
                }
                // if (footer === undefined) {
                this._modalFooter = new ModalFooter_1.ModalFooter(footer);
                // }
                this._footer = footer;
                //挂载新的尾部
                this._footWrapper.appendChild(this._modalFooter.wrapper);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "height", {
            get: function () {
                return this.wrapper.style.height;
            },
            /**
             * 模态框高度
             * 类型：string
             * 默认值：auto
             */
            // private _height?: string;
            set: function (height) {
                // this._height = tools.isEmpty(height) ? '' : height;
                this.wrapper.style.height = height;
                var otherHeight = this.headWrapper ? this.headWrapper.offsetHeight : 0;
                otherHeight = otherHeight + (this._footWrapper ? this._footWrapper.offsetHeight : 0);
                this.bodyWrapper.style.height = "calc(100% - " + otherHeight + "px)";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "width", {
            get: function () {
                return this.wrapper.style.width;
            },
            /**
             * 模态框宽度
             * 类型：string
             * 默认值：auto
             */
            // private _width?: string;
            set: function (width) {
                // this._width = tools.isEmpty(width) ? '' : width;
                this.wrapper.style.width = width;
                //设置模态框最大高度，超出部分滚动条...
                // this.wrapper.classList.add('width-out-scroll');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "position", {
            get: function () {
                return this._position;
            },
            set: function (position) {
                //移动端默认为center,PC端默认为default
                this._position = tools.isEmpty(position) ? 'default' : position;
                var elWidth, elHeight, paWidth = parseInt(getComputedStyle(document.body)['width']), paHeight = parseInt(getComputedStyle(document.body)['height']), wrapper = this.wrapper, computedStyle = getComputedStyle(wrapper);
                //避免模态框显示为display:none时无法获取元素宽高
                if (computedStyle.display === 'none' && (this._position === 'center' || this._position === 'default')) {
                    wrapper.style.display = 'block';
                    elWidth = parseInt(computedStyle.width);
                    elHeight = parseInt(computedStyle.height);
                    wrapper.style.display = 'none';
                }
                else {
                    elWidth = parseInt(computedStyle.width);
                    elHeight = parseInt(computedStyle.height);
                }
                //让移动端父元素高度为当前移动端屏幕高度（居中时）
                if (tools.isMb && this._position === 'center') {
                    paWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || screen.height;
                    paHeight = window.innerHeight | document.documentElement.clientHeight || document.body.clientHeight || screen.height;
                }
                // debugger;
                var isAdaptiveCenter = this.isAdaptiveCenter;
                switch (this._position) {
                    //左右居中，距离顶部40px;
                    case 'default':
                        if (isAdaptiveCenter) {
                            wrapper.style.left = '50%';
                            wrapper.style.transform = 'translateX(-50%)';
                        }
                        else {
                            wrapper.style.left = (paWidth - elWidth) / 2 + 'px';
                        }
                        // wrapper.style.marginLeft = '-' + (elWidth / 2) + 'px';
                        wrapper.style.top = (tools.isMb ? 0 : 40) + "px";
                        // wrapper.style.minWidth = elWidth + 'px';
                        break;
                    //左右上下居中
                    case 'center':
                        if (isAdaptiveCenter) {
                            wrapper.style.left = '50%';
                            wrapper.style.top = '50%';
                            wrapper.style.transform = 'translateX(-50%) translateY(-50%)';
                        }
                        else {
                            wrapper.style.left = (paWidth - elWidth) / 2 + 'px';
                            wrapper.style.top = (paHeight - elHeight) / 2 + 'px';
                        }
                        // wrapper.style.marginLeft = '-' + (elWidth / 2) + 'px';
                        // wrapper.style.minWidth = elWidth + 'px';
                        break;
                    //上下铺满,左边占最多160px
                    case 'left':
                        wrapper.style.left = '0';
                        wrapper.style.top = '0';
                        wrapper.style.bottom = '0';
                        wrapper.style.right = 'auto';
                        wrapper.style.borderRadius = '0';
                        wrapper.style.minWidth = 160 + 'px';
                        if (!this.isDrag && !tools.isMb) {
                            this.isDrag = true;
                        }
                        break;
                    //上下铺满,右边占最多160px
                    case 'right':
                        wrapper.style.right = '0';
                        wrapper.style.top = '0';
                        wrapper.style.bottom = '0';
                        wrapper.style.left = 'auto';
                        wrapper.style.borderRadius = '0';
                        wrapper.style.minWidth = 160 + 'px';
                        if (!this.isDrag && !tools.isMb) {
                            this.isDrag = true;
                        }
                        break;
                    //左右铺满，置顶占最大140px
                    case 'up':
                        wrapper.style.right = '0';
                        wrapper.style.left = '0';
                        wrapper.style.top = '0';
                        wrapper.style.bottom = 'auto';
                        wrapper.style.borderRadius = '0';
                        if (!this.isDrag && !tools.isMb) {
                            this.isDrag = true;
                        }
                        break;
                    //左右铺满，底部占最大140px
                    case 'down':
                        wrapper.style.right = '0';
                        wrapper.style.left = '0';
                        wrapper.style.bottom = '0';
                        wrapper.style.top = 'auto';
                        wrapper.style.borderRadius = '0';
                        if (!this.isDrag && !tools.isMb) {
                            this.isDrag = true;
                        }
                        break;
                    //上下左右铺满
                    case 'full':
                        wrapper.style.right = '0';
                        wrapper.style.left = '0';
                        wrapper.style.bottom = '0';
                        wrapper.style.top = '0';
                        wrapper.style.borderRadius = '0';
                        break;
                }
                //模态框的出现方式依赖于position，因而position改变必须置于isShow之前\
                if (!this.isShow) {
                    this.isShow = true;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "isAdaptiveCenter", {
            get: function () {
                return this._isAdaptiveCenter;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "isShow", {
            get: function () {
                return this._isShow;
            },
            set: function (isShow) {
                var _this = this;
                this._isShow = tools.isEmpty(isShow) ? true : isShow;
                if (this._isShow) {
                    this.wrapper.focus();
                    this.wrapper.style.display = 'block';
                    //在模态框动画加载出来前，禁用模态框的鼠标事件
                    this.wrapper.style.pointerEvents = 'none';
                    if (this.modalScreen) {
                        this.modalScreen.style.pointerEvents = 'none';
                    }
                    setTimeout(function () {
                        if (_this.wrapper) {
                            _this.wrapper.style.pointerEvents = 'auto';
                        }
                        if (_this.modalScreen) {
                            _this.modalScreen.style.pointerEvents = 'auto';
                        }
                    }, 300);
                    if (this._isAnimate) {
                        d.classAdd(this.wrapper, "modal-animate-" + (this._position || 'default') + " animate-in");
                        // this.wrapper.classList.add('modal-animate-full');
                        // switch (this._position) {
                        //     //设置浮动框出现动画
                        //     case 'full' :
                        //         this.wrapper.classList.add('modal-animate-full');
                        //         break;
                        //     case 'up':
                        //         this.wrapper.classList.add('modal-animate-up');
                        //         break;
                        //     case 'right':
                        //         this.wrapper.classList.add('modal-animate-right');
                        //         break;
                        //     case 'down':
                        //         this.wrapper.classList.add('modal-animate-down');
                        //         break;
                        //     case 'left':
                        //         this.wrapper.classList.add('modal-animate-left');
                        //         break;
                        //     case 'center':
                        //         this.wrapper.classList.add('modal-animate-center');
                        //         break;
                        //     default:
                        //         this.wrapper.classList.add('modal-animate-default');
                        //         break;
                        // }
                        // this.wrapper.classList.add('animate-in');
                    }
                    //设置遮罩层出现动画
                    if (this._isBackground) {
                        this.modalScreen.style.display = 'block';
                        this._container.classList.add('overflow-hidden');
                        this.modalScreen.classList.add('lock-screen');
                        this.modalScreen.classList.remove('lock-active-out');
                        this.modalScreen.classList.add('lock-active-in');
                    }
                }
                else {
                    this.wrapper.blur();
                    if (this._onClose) {
                        this._onClose();
                    }
                    //若_isOnceDestroy为真，即创建后立即销毁，则直接调用destroy()后返回；
                    if (this._isOnceDestroy) {
                        this.destroy();
                        return;
                    }
                    if (this.wrapper) {
                        this.wrapper.style.display = 'none';
                        if (this._isAnimate) {
                            this.wrapper.classList.remove('animate-in');
                        }
                        this.wrapper.style['display'] = 'none';
                    }
                    if (this._isBackground) {
                        this.modalScreen.classList.remove('lock-active-in');
                        this.modalScreen.classList.add('lock-active-out');
                        //     d.once(this.modalScreen, 'animationend', () => {
                        //         this.modalScreen.style.display = 'none';
                        //         this.modalScreen.classList.remove('lock-screen');
                        this.modalScreen.style.display = 'none';
                        this.modalScreen.classList.remove('lock-screen');
                        this._container.classList.remove('overflow-hidden');
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "isDrag", {
            get: function () {
                return this._isDrag;
            },
            set: function (isDrag) {
                var elWidth = parseInt(getComputedStyle(this.wrapper)['width']), elHeight = parseInt(getComputedStyle(this.wrapper)['height']), minWidth = isNaN(elWidth) || elWidth > 160 ? 160 : elWidth, minHeight = isNaN(elHeight) || elHeight > 140 ? 140 : elHeight;
                //默认false
                this._isDrag = tools.isEmpty(isDrag) ? false : isDrag;
                if (this._isDrag) {
                    //关闭头部拖拽
                    this._modalHeader && (this._modalHeader.isDrag = false);
                    var pos = '';
                    switch (this._position) {
                        case 'left':
                            pos = 'right';
                            // this.wrapper.style.position = 'absolute';
                            // this.container.style.position = 'relative';
                            break;
                        case 'right':
                            pos = 'left';
                            // this.wrapper.style.position = 'absolute';
                            // this.container.style.position = 'relative';
                            break;
                        case 'up':
                            pos = 'bottom';
                            // this.wrapper.style.position = 'absolute';
                            // this.container.style.position = 'relative';
                            break;
                        case 'down':
                            pos = 'top';
                    }
                    this.wrapper.style.position = 'absolute';
                    this.container.style.position = 'relative';
                    this.drag = new drag_1.Drag({
                        dom: this.wrapper,
                        head: this.wrapper,
                        scale: {
                            position: pos,
                            minWidth: minWidth,
                            minHeight: minHeight
                        },
                        container: this.container
                    });
                }
                else if (this.drag) {
                    this.drag.scaleEventOff();
                    this.drag = null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "isBackground", {
            get: function () {
                return this._isBackground;
            },
            set: function (isBackground) {
                var _this = this;
                this._isBackground = tools.isEmpty(isBackground) ? true : isBackground;
                //初始化遮罩层
                if (!this.modalScreen && this._isBackground) {
                    this.modalScreen = h("div", { className: "modal-screen lock-screen" });
                    this._container.appendChild(this.modalScreen);
                }
                else {
                    d.remove(this.modalScreen);
                    this.modalScreen = null;
                }
                //为遮罩层设置点击后的关闭事件，如果没有遮罩层，则不关闭
                if (this._isBackground) {
                    d.on(this.modalScreen, 'click', function () {
                        _this.isShow = false;
                    });
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "top", {
            get: function () {
                return this._top;
            },
            set: function (top) {
                if (tools.isEmpty(top)) {
                    return;
                }
                this.wrapper.style.top = top + 'px';
                this._top = top;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "size", {
            get: function () {
                return this._size;
            },
            set: function (size) {
                this._size = tools.isEmpty(size) ? '' : size;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "opacity", {
            get: function () {
                return this._opacity;
            },
            set: function (opacity) {
                this._opacity = tools.isEmpty(opacity) ? 100 : opacity;
                this.wrapper.style.opacity = this._opacity / 100 + '';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "onOk", {
            get: function () {
                return this._onOk;
            },
            set: function (callback) {
                if (!this._modalFooter || !this._modalFooter.rightPanel || !(this._modalFooter.rightPanel instanceof InputBox_1.InputBox) || !this._modalFooter.rightPanel.getItem('okBtn')) {
                    return;
                }
                if (callback) {
                    var okBtn = this._modalFooter.rightPanel.getItem('okBtn');
                    okBtn.onClick = callback;
                }
                // else if (this._modalFooter.rightBtns.okBtn.onClick) {
                //     return;
                // } else {
                //     this._modalFooter.rightBtns.okBtn.onClick = () => {
                //         this.isShow = false;
                //     };
                // }
                this._onOk = callback;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "onCancel", {
            get: function () {
                return this._onCancel;
            },
            set: function (callback) {
                var _this = this;
                if (!this._modalFooter || !this._modalFooter.rightPanel || !(this._modalFooter.rightPanel instanceof InputBox_1.InputBox) || !this._modalFooter.rightPanel.getItem('cancelBtn')) {
                    return;
                }
                var cancelBtn = this._modalFooter.rightPanel.getItem('cancelBtn');
                if (callback) {
                    cancelBtn.onClick = callback;
                }
                else {
                    cancelBtn.onClick = function () {
                        _this.isShow = false;
                    };
                }
                this._onCancel = callback;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "onClose", {
            get: function () {
                return this._onClose;
            },
            set: function (callback) {
                this._onClose = callback;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Modal.prototype, "onLarge", {
            get: function () {
                return this._onLarge;
            },
            set: function (callback) {
                var _this = this;
                var modalEnlarge = d.query(".modal-enlarge", this.wrapper);
                if (modalEnlarge) {
                    d.on(modalEnlarge, 'click', function () {
                        var className = 'full-screen';
                        if (_this.fullPosition) {
                            className = 'full-screen-fixed';
                        }
                        d.classToggle(_this.wrapper, className);
                        if (callback) {
                            callback();
                        }
                    });
                }
                this._onLarge = callback;
            },
            enumerable: true,
            configurable: true
        });
        /**
         *静态方式创建alert框，使用后立即销毁
         */
        Modal.alert = function (msg, title, onClick) {
            if (msg === void 0) { msg = ''; }
            //将msg转为json字符串
            if (msg instanceof Object || Array.isArray(msg)) {
                msg = JSON.stringify(msg);
                //去掉json字符串头尾的引号
                if (msg[0] && msg[0] === '"' && msg[msg.length - 1] && msg[msg.length - 1] === '"') {
                    msg = msg.slice(1, msg.length - 1);
                }
            }
            // msg = tools.isEmpty(msg) ? '空' : msg;
            var inputBox = new InputBox_1.InputBox({}), okBtn = new Button_1.Button({ content: '确定', type: 'default', key: 'okBtn' });
            if (onClick) {
                okBtn.onClick = function () { return onClick(); };
            }
            inputBox.addItem(okBtn);
            var m = new Modal({
                isOnceDestroy: true,
                header: !title ? '提示' : tools.str.htmlEncode(title),
                width: '270px',
                position: 'center',
                className: 'modal-prompt',
                body: document.createTextNode(msg),
                footer: {
                    rightPanel: inputBox
                }
            });
            m.modalScreen.style.zIndex = '1001';
            m.onOk = function () {
                m.isShow = false;
                onClick && onClick();
            };
            return m;
        };
        /**
         *静态方式创建confirm框，使用后立即销毁
         */
        Modal.confirm = function (confirm) {
            var leftContent, rightContent, msg;
            if (!confirm || !confirm.msg || tools.isEmpty(confirm.msg)) {
                msg = '成功';
            }
            else {
                //将msg转为json字符串
                if (confirm.msg instanceof Object || Array.isArray(confirm.msg)) {
                    msg = JSON.stringify(confirm.msg);
                    //去掉json字符串头尾的引号
                    if (msg[0] && msg[0] === '"' && msg[msg.length - 1] && msg[msg.length - 1] === '"') {
                        msg = msg.slice(1, msg.length - 1);
                    }
                }
                else {
                    msg = confirm.msg;
                }
            }
            if (!confirm || !confirm.btns) {
                leftContent = '取消';
                rightContent = '确定';
            }
            else {
                leftContent = tools.isEmpty(confirm.btns[0]) ? '取消' : confirm.btns[0];
                rightContent = tools.isEmpty(confirm.btns[1]) ? '确定' : confirm.btns[1];
            }
            var inputBox = new InputBox_1.InputBox();
            inputBox.addItem(new Button_1.Button({
                content: leftContent,
                onClick: function (index) {
                    if (confirm && confirm.callback && typeof confirm.callback === 'function') {
                        confirm.callback(false);
                    }
                    m.isShow = false;
                }
            }));
            inputBox.addItem(new Button_1.Button({
                content: rightContent,
                onClick: function (index) {
                    if (confirm && confirm.callback && typeof confirm.callback === 'function') {
                        confirm.callback(true);
                    }
                    m.isShow = false;
                }
            }));
            var m = new Modal({
                isOnceDestroy: true,
                width: '270px',
                position: 'center',
                header: (!confirm || !confirm.title) ? '提示' : tools.str.htmlEncode(confirm.title),
                className: 'modal-prompt',
                body: document.createTextNode(msg),
                footer: {
                    rightPanel: inputBox
                }
            });
            m.modalScreen.style.zIndex = '1001';
        };
        //记录上次创建的toast，在下一次构造新toast销毁之...(解决toast延迟销毁3s，下一次构造时未能及时销毁的问题)
        // private static toastModal :Modal;
        /*
         *静态方式创建toast框，使用后立即销毁
         * */
        Modal.toast = function (msg) {
            //将msg转为json字符串
            if (msg instanceof Object || Array.isArray(msg)) {
                msg = JSON.stringify(msg);
                //去掉json字符串头尾的引号
                if (msg[0] && msg[0] === '"' && msg[msg.length - 1] && msg[msg.length - 1] === '"') {
                    msg = msg.slice(1, msg.length - 1);
                }
            }
            msg = tools.isEmpty(msg) ? '成功' : msg;
            // if(Modal.toastModal) {
            //     Modal.toastModal.destroy();
            // }
            var m = new Modal({
                isBackground: false,
                body: h("div", { style: "padding: 4px 15px;" }, tools.str.htmlEncode(msg)),
                className: 'modal-toast'
            });
            // Modal.toastModal = m;
            //非移动端的toast从顶部往下掉落，移动端的toast出现于底部且有最大高度
            if (tools.isMb) {
                m.wrapper.classList.add('toast-mobile');
            }
            else {
                m.wrapper.classList.remove('modal-animate-default');
                m.wrapper.classList.add('from-top');
            }
            // 3秒后销毁
            setTimeout(function () {
                m.destroy();
            }, 3000);
        };
        /**
         * 销毁组件
         */
        Modal.prototype.destroy = function (cb) {
            var _this = this;
            // if (this._isAnimate) {
            //     this.wrapper.classList.remove('animate-in');
            // }
            this._container && this._container.classList.remove('overflow-hidden');
            if (this._isBackground && this.modalScreen) {
                this.modalScreen.classList.remove('lock-active-in');
                this.modalScreen.classList.add('lock-active-out');
                d.once(this.modalScreen, 'animationend', function () {
                    _this.modalScreen.classList.remove('lock-screen');
                });
                d.remove(this.modalScreen);
                this.modalScreen = null;
            }
            // this.remove();
            if (typeof cb === 'function') {
                cb();
            }
            _super.prototype.destroy.call(this);
            allModalArr = allModalArr.filter(function (km) { return km !== _this; });
            var last = allModalArr[allModalArr.length - 1];
            last && last.wrapper.focus();
        };
        Object.defineProperty(Modal.prototype, "className", {
            get: function () {
                return this._className;
            },
            set: function (className) {
                this._className = tools.isEmpty(className) ? 'modal-default' : className;
                this.wrapper.classList.add(this._className);
                //如果为移动端模态框（即包含类modal-mobile，在body包含ios-top的情况下添加样式ios-top-header）
                if (this.wrapper.classList.contains('modal-mobile') && document.body.classList.contains('ios-top')) {
                    this.wrapper.classList.add('ios-top-header');
                }
            },
            enumerable: true,
            configurable: true
        });
        return Modal;
    }(Component_1.Component));
    exports.Modal = Modal;
});

define("Button", ["require", "exports", "Component"], function (require, exports, Component_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="Button"/>
    var d = C.d;
    var tools = C.tools;
    /**
     * 按钮组件对象
     */
    var Button = /** @class */ (function (_super) {
        __extends(Button, _super);
        function Button(button) {
            var _this = _super.call(this, button) || this;
            _this.button = button;
            if (tools.isEmpty(button)) {
                button = {};
            }
            _this.init(button);
            return _this;
        }
        Button.prototype.init = function (button) {
            // if(button.className){
            //     this.wrapper.classList.add(button.className);
            // }
            this.iconPre = button.iconPre || 'iconfont';
            this.isLoading = button.isLoading;
            this.key = button.key;
            this.icon = button.icon;
            this.content = button.content;
            this.isShow = button.isShow;
            this.onClick = button.onClick;
            this.isDisabled = button.isDisabled;
            this.type = button.type;
            this.color = button.color;
            this.size = button.size;
            this.dropDown = button.dropDown;
        };
        Button.prototype.wrapperInit = function () {
            return d.create("<button type=\"button\" class=\"btn\"></button>");
        };
        Object.defineProperty(Button.prototype, "icon", {
            get: function () {
                return this._icon;
            },
            set: function (icon) {
                if (tools.isEmpty(icon) || (tools.isNotEmpty(icon) && this._icon === icon)) {
                    return;
                }
                //移除原有icon
                this.iconEl && this._iconEl.parentElement.removeChild(this._iconEl);
                var iconStr = this.iconPre === 'iconfont' ? "icon-" + icon : icon, className = this.iconPre + " button-icon " + iconStr;
                if (icon === 'spinner' && this._isLoading) {
                    className = 'spinner';
                }
                this._iconEl = d.create("<i class=\"" + className + "\"></i>");
                d.prepend(this.wrapper, this._iconEl);
                this._icon = icon;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "iconEl", {
            get: function () {
                if (!this._iconEl) {
                    this._iconEl = d.query('i', this.wrapper);
                }
                return this._iconEl;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "color", {
            get: function () {
                return this._color;
            },
            set: function (color) {
                if (tools.isEmpty(color)) {
                    return;
                }
                this.wrapper.classList.remove("button-" + this._color);
                this.wrapper.classList.add("button-" + color);
                this._color = color;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "type", {
            get: function () {
                return this._type;
            },
            set: function (type) {
                //若已经初始化过按钮类型，则删除之前添加的样式
                if (this._type) {
                    this.wrapper.classList.remove("button-type-" + this._type);
                }
                this._type = tools.isEmpty(type) ? 'default' : type;
                this.wrapper.classList.add("button-type-" + this._type);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "content", {
            get: function () {
                return this._content;
            },
            set: function (content) {
                content = tools.isEmpty(content) ? (tools.isEmpty(this._icon) ? '操作' : '') : content;
                if (!tools.isEmpty(content)) {
                    var contentWrapper = d.query('span', this.wrapper);
                    //不存在则创建容器存放之(放在容器的第一个节点处)
                    if (!contentWrapper) {
                        contentWrapper = d.create("<span>" + content + "</span>");
                        this.wrapper.appendChild(contentWrapper);
                    }
                    //存在则替换原来的content
                    else {
                        contentWrapper.innerHTML = content;
                    }
                    this._content = content;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "dropDown", {
            get: function () {
                return this._dropDown;
            },
            set: function (dropDown) {
                if (!tools.isEmpty(dropDown)) {
                    var pos = d.create("<span class=\"iconfont icon-expanse iconPos\"></span>");
                    this.wrapper.classList.add('dropdown-toggle');
                    this.wrapper.appendChild(pos);
                    this.onClick = function () {
                        dropDown.toggle();
                    };
                }
                // else {
                //     let pos = d.query(`<span class="iconPos"></span>`,this.wrapper);
                //     if(pos) {
                //         d.remove(pos);
                //     }
                //     if(this._dropDown) {
                //         this.onClick = ()=>{};
                //     }
                // }
                this._dropDown = dropDown;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "size", {
            get: function () {
                return this._size;
            },
            set: function (size) {
                size = tools.isEmpty(size) ? 'middle' : size;
                //若已经初始化过按钮尺寸，则删除之前添加的样式
                if (this._size) {
                    this.wrapper.classList.remove("button-" + this._size);
                }
                if (size) {
                    this.wrapper.classList.add("button-" + size);
                    this._size = size;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "isDisabled", {
            get: function () {
                return this._isDisabled;
            },
            set: function (isDisabled) {
                if (isDisabled)
                    this.wrapper.classList.add('disabled');
                else
                    this.wrapper.classList.remove('disabled');
                this._isDisabled = tools.isEmpty(isDisabled) ? false : isDisabled;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "isLoading", {
            get: function () {
                return this._isLoading;
            },
            set: function (isLoading) {
                this._isLoading = tools.isEmpty(isLoading) ? false : isLoading;
                if (this._isLoading) {
                    this.icon = 'spinner';
                }
                else {
                    //移除原有icon
                    this.iconEl && d.remove(this._iconEl);
                    this._icon = null;
                    this._iconEl = null;
                }
                this._isLoading = isLoading;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "isShow", {
            get: function () {
                return this._isShow;
            },
            set: function (isShow) {
                this._isShow = tools.isEmpty(isShow) ? true : isShow;
                d.classToggle(this.wrapper, 'hide', !this._isShow);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "onClick", {
            get: function () {
                return this._onClick;
            },
            set: function (callback) {
                if (!tools.isEmpty(callback)) {
                    d.off(this.wrapper, 'click', this._onClick);
                    this._onClick = function (e) {
                        e && e.stopPropagation();
                        callback.call(this, e);
                    };
                    d.on(this.wrapper, 'click', this._onClick);
                }
            },
            enumerable: true,
            configurable: true
        });
        Button.prototype.getDom = function () {
            return this.wrapper;
        };
        return Button;
    }(Component_1.Component));
    exports.Button = Button;
});

define("Drag", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="Drag"/>
    var d = C.d;
    var tools = C.tools;
    var Drag = /** @class */ (function () {
        function Drag(para) {
            this.para = para;
            this.moveing = false; // 是否处于移动状态
            this.init();
            this.dragEvent();
            this._container = (tools.isEmpty(para.container) || !para.scale) ? document.body : para.container;
        }
        Drag.prototype.init = function () {
            //初始化拖拽框允许被拖拽的部分
            this.para.head = this.para.head ? this.para.head : document.querySelector('body');
            var self = this;
            //初始化模态框拖拽时鼠标按下事件
            this.mouseDownPullHandle = function (e) {
                self.mousedownHandle(e);
            };
            this.mouseDownScaleHandle = function (e) {
                self.mousedownHandle(e);
            };
            //初始化拖拉缩放框（以拖拽框为父容器，在拖拽框拖拉缩放的方向创建对应的div）
            if (this.para.scale) {
                //设置拖拉缩放的元素，不需要拖拉效果时为空，需要时为对应位置的容器
                this.para.dom.classList.add('drag-container');
                switch (this.para.scale.position) {
                    case 'top':
                        var topDragWrapper = d.create("<div class=\"top-drag-wrapper\"></div>");
                        this.dragWrapper = topDragWrapper;
                        break;
                    case 'right':
                        var rightDragWrapper = d.create("<div class=\"right-drag-wrapper\"></div>");
                        this.dragWrapper = rightDragWrapper;
                        break;
                    case 'bottom':
                        var bottomDragWrapper = d.create("<div class=\"bottom-drag-wrapper\"></div>");
                        this.dragWrapper = bottomDragWrapper;
                        break;
                    case 'left':
                        var leftDragWrapper = d.create("<div class=\"left-drag-wrapper\"></div>");
                        this.dragWrapper = leftDragWrapper;
                        break;
                }
                if (this.dragWrapper) {
                    this.para.dom.appendChild(this.dragWrapper);
                }
            }
        };
        /*
         * 关闭模态框拖拽事件
         * */
        Drag.prototype.pullEventOff = function () {
            this.para.head.style.cursor = 'default';
            d.off(this.para.head, 'mousedown', this.mouseDownPullHandle);
        };
        /*
         * 关闭模态框拖拉事件
         * */
        Drag.prototype.scaleEventOff = function () {
            this.dragWrapper.style.cursor = 'default';
            d.off(this.dragWrapper, 'mousedown', this.mouseDownScaleHandle);
        };
        /*
         * 模态框拖拽、拖拉事件
         * */
        Drag.prototype.dragEvent = function () {
            //模态框拖拉时鼠标按下事件
            if (this.para.scale) {
                d.on(this.dragWrapper, 'mousedown', this.mouseDownScaleHandle);
            }
            else {
                this.para.head.style.cursor = 'move';
                d.on(this.para.head, 'mousedown', this.mouseDownPullHandle);
            }
        };
        /*
         * 获取拖拽边界
         * */
        Drag.prototype.getPanelInfo = function () {
            var elRect = this.para.dom.getBoundingClientRect();
            return {
                top: -10,
                left: -elRect.width + 50,
                right: this._container.scrollWidth + elRect.width - 50,
                bottom: this._container.scrollHeight + elRect.height - 50,
            };
        };
        /*
         * 获取模态框坐标信息界
         * */
        Drag.prototype.getDragState = function (event, elInfo, paInfo, type) {
            if (!this.dragState || type) {
                return {
                    startMouseTop: event.clientY,
                    startMouseLeft: event.clientX,
                    startTop: elInfo.top - paInfo.top,
                    startRight: elInfo.left - paInfo.left + elInfo.width,
                    startLeft: elInfo.left - paInfo.left,
                    startBottom: elInfo.top - paInfo.top + elInfo.height,
                    width: elInfo.width,
                    height: elInfo.height
                };
            }
            else {
                return this.dragState;
            }
        };
        /*
         * 鼠标按下事件
         * */
        Drag.prototype.mousedownHandle = function (event) {
            var _this = this;
            document.querySelector('body').style.userSelect = 'none';
            var self = this, _elInfo = this.para.dom.getBoundingClientRect(), _paInfo = this._container.getBoundingClientRect(), _event = event, _minTop = 0, _minLeft = 0, _maxTop = 0, _maxLeft = 0;
            this.moveing = true;
            this.panelInfo = this.getPanelInfo();
            this.dragState = this.getDragState(_event, _elInfo, _paInfo, true);
            _minTop = this.panelInfo.top;
            _maxTop = this.panelInfo.bottom - this.dragState.height;
            _minLeft = this.panelInfo.left;
            _maxLeft = this.panelInfo.right - this.dragState.width;
            if (this.para.scale) {
                this.para.dom.style.width = 'auto';
            }
            var isFirst = true;
            // 对话框移动主事件
            var mousemoveHandle = function (_event) {
                var event = _event, top, right, bottom, left;
                if (_this.moveing) {
                    //拖拉事件
                    if (_this.para.scale) {
                        switch (_this.para.scale.position) {
                            case 'top':
                                top = _this.dragState.startTop + (event.pageY - _this.dragState.startMouseTop);
                                if (top <= 0 || (_this._container.clientHeight - top < _this.para.scale.minHeight)) {
                                    top = (top <= 0) ? 0 : _this._container.clientHeight - _this.para.scale.minHeight;
                                }
                                _this.para.dom.style.top = top + 'px';
                                break;
                            case 'right':
                                right = (_this._container.clientWidth - event.pageX);
                                if (right > _this._container.clientWidth - _this.para.scale.minWidth) {
                                    right = _this._container.clientWidth - _this.para.minWidth;
                                }
                                _this.para.dom.style.right = right + 'px';
                                _this.para.dom.style.left = 0 + '';
                                break;
                            case 'bottom':
                                bottom = _this._container.clientHeight - event.pageY;
                                if (bottom > _this._container.clientHeight - _this.para.scale.minHeight) {
                                    bottom = _this._container.clientHeight - _this.para.scale.minHeight;
                                }
                                _this.para.dom.style.bottom = bottom + 'px';
                                break;
                            case 'left':
                                left = _this.dragState.startLeft + (event.pageX - _this.dragState.startMouseLeft);
                                if (left > _this._container.clientWidth - _this.para.scale.minWidth) {
                                    left = _this._container.clientWidth - _this.para.scale.minWidth;
                                }
                                _this.para.dom.style.left = left + 'px';
                                break;
                        }
                    }
                    //拖拽事件
                    else {
                        // 控制边界
                        var top_1 = _this.dragState.startTop + (event.pageY - _this.dragState.startMouseTop), left_1 = _this.dragState.startLeft + (event.pageX - _this.dragState.startMouseLeft);
                        if (!self.para.isDragOverBound) {
                            // 上边界
                            top_1 = top_1 < _minTop ? _minTop : top_1;
                            // 下边界
                            top_1 = top_1 > _maxTop ? _maxTop : top_1;
                            // 左边界
                            left_1 = left_1 < _minLeft ? _minLeft : left_1;
                            // 右边界
                            left_1 = left_1 > _maxLeft ? _maxLeft : left_1;
                        }
                        if (isFirst) {
                            isFirst = false;
                            _this.para.dom.style.removeProperty('transform');
                        }
                        _this.para.dom.style.top = top_1 + 'px';
                        _this.para.dom.style.left = left_1 + 'px';
                    }
                }
            };
            // 鼠标释放
            var mouseupHandle = function (event) {
                document.querySelector('body').style.userSelect = 'text';
                _this.moveing = false;
                _this.panelInfo = null;
                _this.dragState = null;
                d.off(document, 'mousemove', mousemoveHandle);
                d.off(document, 'mouseup', mouseupHandle);
            };
            d.on(document, 'mousemove', mousemoveHandle);
            d.on(document, 'mouseup', mouseupHandle);
        };
        return Drag;
    }());
    exports.Drag = Drag;
});

define("InputBox", ["require", "exports", "Component", "Button", "DropDown"], function (require, exports, Component_1, Button_1, dropdown_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="InputBox"/>
    var d = C.d;
    var tools = C.tools;
    /**
     * 组件集合对象
     */
    var InputBox = /** @class */ (function (_super) {
        __extends(InputBox, _super);
        function InputBox(inputBox) {
            if (inputBox === void 0) { inputBox = {}; }
            var _this = _super.call(this, inputBox) || this;
            _this.init(inputBox);
            return _this;
        }
        InputBox.prototype.wrapperInit = function () {
            return d.create("<div class=\"input-box\"></div>");
        };
        InputBox.prototype.init = function (inputBox) {
            // debugger;
            this.isVertical = !!inputBox.isVertical;
            this.wrapper.classList.add(this.isVertical ? 'input-box-vertical' : 'input-box-horizontal');
            this.children = inputBox.children;
            this._lastNotMoreIndex = -1;
            this.size = inputBox.size;
            this.compactWidth = inputBox.compactWidth;
            this.isResponsive = inputBox.isResponsive;
            this.moreBtn = inputBox.moreBtn;
            this.shape = inputBox.shape;
            // this.container = inputBox.container;
            // this.container.appendChild(this.wrapper);
            this.responsive();
        };
        Object.defineProperty(InputBox.prototype, "children", {
            get: function () {
                return this._children;
            },
            set: function (children) {
                this._children = tools.isEmpty(children) ? [] : children;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputBox.prototype, "shape", {
            get: function () {
                return this._shape;
            },
            set: function (shape) {
                if (tools.isEmpty(shape)) {
                    return;
                }
                if (shape === 'circle') {
                    this.wrapper.classList.add('input-box-circle');
                }
                else {
                    this.wrapper.classList.remove('input-box-circle');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputBox.prototype, "size", {
            get: function () {
                return this._size;
            },
            set: function (size) {
                if (this._size) {
                    this.wrapper.classList.remove("input-box-" + this._size);
                }
                size = tools.isEmpty(size) ? 'small' : size;
                switch (size) {
                    case 'small':
                        this.wrapper.classList.add('input-box-small');
                        break;
                    case 'middle':
                        this.wrapper.classList.add('input-box-middle');
                        break;
                    case 'large':
                        this.wrapper.classList.add('input-box-large');
                        break;
                }
                this._size = size;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputBox.prototype, "compactWidth", {
            get: function () {
                return this._compactWidth;
            },
            set: function (compactWidth) {
                if (compactWidth > 0) {
                    this.wrapper.classList.remove('compact');
                }
                else {
                    this.wrapper.classList.add('compact');
                }
                this.responsive();
                // compactWidth = tools.isEmpty(compactWidth) ? 0 : compactWidth;
                //
                // if (compactWidth > 0) {
                //     this.wrapper.classList.remove('not-compact');
                //     let count = 0;
                //     for (let d of this.children) {
                //         if (count === 0) {
                //             count++;
                //             continue;
                //         }
                //         if (count > this._lastNotMoreIndex && this._lastNotMoreIndex > 0) {
                //             break;
                //         }
                //         let comKey = Object.keys(d)[0],
                //             com = d[comKey],
                //             marginWidth = 0;
                //         if (com) {
                //             marginWidth = parseInt(getComputedStyle(com._wrapper)['margin-left']) > 0 ? parseInt(getComputedStyle(com._wrapper)['margin-left']) : 0;
                //             com._wrapper.style.marginLeft = compactWidth + 'px';
                //         }
                //         this.wrapper.style.width = parseInt(this.wrapper.style.width) + compactWidth - marginWidth + 'px';
                //         if (parseInt(this.wrapper.style.width) > this._maxWidth) {
                //             let guid = Object.keys(this.children[this._lastNotMoreIndex])[0],
                //                 lastCom = this.children[this._lastNotMoreIndex][guid],
                //                 lastMargin = 0;
                //             if (lastCom) {
                //                 lastMargin = parseInt(getComputedStyle(lastCom._wrapper)['margin-left']) > 0 ? parseInt(getComputedStyle(lastCom._wrapper)['margin-left']) : 0;
                //                 if (this._compactWidth && this._lastNotMoreIndex > -1) {
                //                     lastCom._wrapper.style.marginLeft = 0 + 'px';
                //                 }
                //                 //仅从dom结构上改变了组件，并未改变组件的container属性
                //                 if (this._dropDown) {
                //                     this._dropDown.getUlDom().insertBefore(lastCom._wrapper, this._dropDown.getUlDom().firstChild);
                //                 }
                //                 this.wrapper.style.width = parseInt(this.wrapper.style.width) - parseInt(getComputedStyle(lastCom._wrapper)['width']) + 5 + 'px';
                //                 this._lastNotMoreIndex -= 1;
                //             }
                //         }
                //         count++;
                //     }
                // }
                // else {
                //     this.wrapper.classList.add('not-compact');
                //     // if(this._compactWidth > 0) { }
                // }
                this._compactWidth = compactWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputBox.prototype, "moreBtn", {
            get: function () {
                return this._moreBtn;
            },
            set: function (moreBtn) {
                if (this._isResponsive) {
                    this._moreBtn = moreBtn;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputBox.prototype, "isResponsive", {
            get: function () {
                return this._isResponsive;
            },
            set: function (isResponsive) {
                this._isResponsive = tools.isEmpty(isResponsive) ? false : isResponsive;
            },
            enumerable: true,
            configurable: true
        });
        // 【待改...】
        InputBox.prototype.responsive = function () {
            if (!this.isResponsive) {
                return;
            }
            //如果获取不到父容器宽度，则无响应式
            // let paWidth = parseInt(getComputedStyle(<HTMLElement>this._container)['width']);
            // console.log('paWidth:',paWidth);
            // if (paWidth < 1) {
            //     return;
            // }
            //如果当前组件集合宽度 > 父容器宽度
            // if (parseInt(this.wrapper.style.width) > paWidth && this.children.length > 0) {
            if (this.children.length > 4) {
                //判断是否有更多下拉列表
                tools.isEmpty(this._moreBtn) && (this._moreBtn = new Button_1.Button({
                    content: '更多',
                    size: this._size,
                }));
                //不存在更多下拉列表，则生成更多下拉列表
                if (!this._moreBtn || !this._moreBtn.dropDown) {
                    this.wrapper.appendChild(this.moreBtn.wrapper);
                    this.wrapper.style.width = parseInt(this.wrapper.style.width) + parseInt(getComputedStyle(this._moreBtn.wrapper)['width']) + 'px';
                    // console.log('更多：',parseInt(getComputedStyle(this._moreBtn.wrapper)['width']));
                    var self_1 = this;
                    this.moreBtn.dropDown = new dropdown_1.DropDown({
                        el: self_1.moreBtn.wrapper,
                        inline: false,
                        data: [],
                        multi: null,
                        className: "input-box-morebtn"
                    });
                }
                //从组件集合末尾倒序调整
                var len = this.children.length;
                for (var i = len - 1; i >= 0; i--) {
                    //当组件集合宽度超过限制的最大宽度时，将最后一个非更多下拉列表内的组件放置于更多下拉列表容器内（插入到其第一个子元素之前）
                    // if (parseInt(this.wrapper.style.width) > paWidth) {
                    var com = this.children[i];
                    if (com) {
                        if (this._compactWidth && i > -1) {
                            com.wrapper.style.marginLeft = 0 + 'px';
                        }
                        this.wrapper.style.width = parseInt(this.wrapper.style.width) - parseInt(getComputedStyle(com.wrapper)['width']) + 5 + 'px';
                        //仅从dom结构上改变了组件，并未改变组件的container属性
                        if (this.moreBtn.dropDown) {
                            this.moreBtn.dropDown.getUlDom().appendChild(com.wrapper);
                        }
                        this._lastNotMoreIndex = i;
                    }
                    // }
                }
            }
        };
        /*
        *  将组件添加到组件集合
        *  参数：com:组件
        * */
        InputBox.prototype.addItem = function (com, position) {
            if (!com) {
                return;
            }
            if (typeof position === 'number') {
                position = Math.max(0, position);
                position = position >= this.children.length ? void 0 : position;
            }
            com.size = this._size;
            //将组件元素添加进组件集合容器（仅改变dom）,如果存在更多按钮下拉列表，则将组件插入到更多按钮之前。
            if (this._moreBtn && this._moreBtn.dropDown) {
                this.wrapper.insertBefore(com.wrapper, this.wrapper.lastChild);
            }
            else {
                if (typeof position === 'number') {
                    d.before(this.wrapper.children[position], com.wrapper);
                }
                else {
                    this.wrapper.appendChild(com.wrapper);
                }
            }
            //添加至组件集合children
            if (typeof position === 'number') {
                this.children.splice(position, 0, com);
            }
            else {
                this.children.push(com);
            }
            //水平
            // if (this.inputBox && !this.inputBox.isVertical && this.isResponsive) {
            if (!this.isVertical && this.isResponsive) {
                //第一个组件元素
                if (this.wrapper.children.length < 2) {
                    this.wrapper.style.width = com.wrapper.clientWidth + 2 + 'px';
                }
                else {
                    this.wrapper.style.width = parseInt(this.wrapper.style.width) + com.wrapper.clientWidth + 2 + 'px';
                }
                this.responsive();
            }
        };
        /*
        * 获取组件集合
        * 参数：number | string | void
        * number：按照组件集合的下标获取组件（下标由添加时决定,从0起）  |  string： 根据组件集合的键获取组件
        * */
        InputBox.prototype.getItem = function (item) {
            if (!this.children || !this.children[0]) {
                return null;
            }
            if (typeof item === 'number') {
                return this.children[item];
            }
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var d_1 = _a[_i];
                if (d_1.key === item) {
                    return d_1;
                }
            }
            return null;
        };
        /*
        * 删除组件集合
        * 参数：number | string
        * number：按照组件集合的下标删除组件（下标由添加时决定,从0起）  |  string： 根据组件集合的键删除组件
        * 返回值：返回被删除的组件，若未找到要删除的组件则返回null
        * */
        InputBox.prototype.delItem = function (item) {
            if (!this.children || !this.children[0]) {
                return null;
            }
            if (typeof item === 'number') {
                var curCom = this.children[item];
                if (curCom) {
                    this.children[item].remove();
                    this.children.splice(item, 1);
                }
                return curCom;
            }
            var index = 0;
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var d_2 = _a[_i];
                if (d_2.key === item) {
                    var curCom = d_2;
                    if (d_2) {
                        this.children.splice(index, 1);
                        d_2.remove();
                    }
                    return curCom;
                }
                index++;
            }
            return null;
        };
        Object.defineProperty(InputBox.prototype, "isShow", {
            /*
            * 根据窗口变化改变限制的最大宽度
            * */
            // private resizeHandler() {
            //     /**/let timer = null;
            /*d.on(window, 'resize', () => {
                if (timer === null) {
                    timer = setTimeout(() => {
                        this.responsive();
                        timer = null;
                    }, 1000);
                }
            });*/
            // }
            set: function (flag) {
                d.hide(this.wrapper, !flag);
            },
            enumerable: true,
            configurable: true
        });
        return InputBox;
    }(Component_1.Component));
    exports.InputBox = InputBox;
});

/// <amd-module name="DropDown"/>
define("DropDown", ["require", "exports", "List", "Spinner"], function (require, exports, list_1, spinner_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = C.tools;
    var d = C.d;
    var DropDown = /** @class */ (function () {
        function DropDown(para) {
            var _this = this;
            this.para = para;
            // private values : any[] = null;
            // private texts : string[] = null;
            this.selectIndex = -1;
            this.isVisible = false;
            this.clickHideHandler = function (e) {
                if (_this.para.multi) {
                    var target = e.target;
                    if (d.closest(target, '.dropdown-menu')) {
                        return;
                    }
                }
                _this.hideList();
            };
            this.ulDom = d.create('<ul class="dropdown-menu"></ul>');
            if (para.className) {
                this.ulDom.classList.add(para.className);
            }
            if (!para.el) {
                para.el = document.body;
            }
            if (para.multi !== null && !para.multi) {
                para.multi = false;
            }
            //当inline不为真时，所有的下拉列表都放在body下,以el为相对此位置显示下拉框
            if (para.inline) {
                para.el.appendChild(this.ulDom);
            }
            else {
                d.query('body').appendChild(this.ulDom);
            }
            //   if(para.multi === true){
            var listPara = {
                container: this.ulDom,
                select: null,
                data: this.data
                // callback : (index ) => {
                //     if(!this.para.inline){
                //         this.hideList();
                //     }else if(this.selectIndex !== -1){
                //         this.selectIndex = index;
                //         this.onSelect();
                //     }
                //     if(this.selectIndex !== index){
                //         this.selectIndex = index;
                //         this.onSelect();
                //     }
                // }
            };
            if (para.multi === true) {
                listPara.select = {
                    multi: true,
                    show: true,
                    callback: function (selected, index) {
                        var items = [];
                        selected.forEach(function (i) {
                            items.push(_this.data[i]);
                        });
                        selected = items;
                        var onMultiSelect = _this.para.onMultiSelect;
                        if (onMultiSelect && typeof onMultiSelect === 'function') {
                            onMultiSelect(selected, index);
                        }
                    }
                };
            }
            else {
                this.initSingleEvent();
            }
            this.list = new list_1.List(listPara);
            this.list.removeAllDom();
            this.initListData(this.para.data);
            if (para.inline) {
                this.ulDom.classList.add('inline');
                this.showList();
            }
            else {
                window.addEventListener(tools.isMb ? 'tap' : 'click', this.clickHideHandler, true);
            }
        }
        Object.defineProperty(DropDown.prototype, "selectedIndex", {
            get: function () {
                return this.selectIndex;
            },
            enumerable: true,
            configurable: true
        });
        DropDown.prototype.getUlDom = function () {
            return this.ulDom;
        };
        DropDown.prototype.removeItem = function (index) {
            this.list.removeDom(index);
        };
        DropDown.prototype.removeAllItem = function () {
            this.list.removeAllDom();
        };
        // callback
        DropDown.prototype.initSingleEvent = function () {
            var self = this;
            d.on(this.ulDom, 'click', 'li[data-index]', function (e) {
                var index = parseInt(this.dataset.index);
                if (typeof self.para.multi !== 'boolean') {
                    self.selectIndex = index;
                    self.onSelect();
                }
                else {
                    //   console.log(self.data[index])
                    if (!self.para.inline) {
                        self.hideList();
                    }
                    self.selectIndex = index;
                    self.onSelect();
                    /* else if (self.selectIndex !== -1) {
                        self.selectIndex = index;
                        self.onSelect();
                    }
                    if (self.selectIndex !== index) {
                        self.selectIndex = index;
                        self.onSelect();
                    }*/
                }
                e.stopPropagation();
            });
        };
        DropDown.prototype.setPara = function (para) {
            var data = para.data, ajax = para.ajax;
            if (data && data[0]) {
                this.para.data = data;
                //用data参数获取数据
                this.initListData(data);
                this.para.ajax = null;
                // this.addShowClass();
            }
            else if (ajax) {
                this.para.ajax = tools.obj.merge(this.para.ajax, ajax);
                this.para.data = null;
                this.data = null;
                this.ulDom.innerHTML = '';
            }
        };
        DropDown.prototype.onSelect = function () {
            var index = this.selectIndex;
            this.para.onSelect && this.para.onSelect(this.data[index], index);
        };
        /**
         * 将传入的参数转为title 与 value
         */
        DropDown.prototype.initListData = function (data) {
            this.data = this.data2listItem(data);
            this.render(this.data);
        };
        DropDown.prototype.data2listItem = function (data) {
            var newData = [];
            if (Array.isArray(data)) {
                var hasTitle_1 = typeof data[0] !== 'string';
                data.forEach(function (d) {
                    if (hasTitle_1) {
                        newData.push(d);
                    }
                    else {
                        newData.push({
                            text: d + '',
                            value: d
                        });
                    }
                });
            }
            return newData;
        };
        DropDown.prototype.setData = function (data) {
            if (Array.isArray(data)) {
                // this.para.data = data;
                //用data参数获取数据
                this.initListData(data);
            }
        };
        DropDown.prototype.addShowClass = function (relEl) {
            //如果没有指定的相对位置，就以el为相对此位置显示下拉框
            this.ulDom.classList.add('show');
            if (!this.para.inline) {
                if (relEl) {
                    d.setPosition(this.ulDom, relEl, false);
                }
                else {
                    d.setPosition(this.ulDom, this.para.el, false);
                }
            }
        };
        DropDown.prototype.showList = function (relEl) {
            var _this = this;
            var data = this.para.data, ajax = this.para.ajax;
            this.addShowClass(relEl);
            this.isVisible = true;
            if (ajax && ajax.fun) {
                var spinner_2 = new spinner_1.Spinner({
                    el: this.ulDom,
                    type: spinner_1.Spinner.SHOW_TYPE.cover
                });
                spinner_2.show();
                // 用ajax获取数据
                var selectedData = this.get();
                ajax.fun(ajax.url, selectedData ? selectedData.value.toString() : '', function (d) {
                    if (Array.isArray(d)) {
                        _this.initListData(d);
                    }
                    spinner_2.hide();
                });
            }
            else {
                // 数据为空时，先解析为列表的数据
                if (this.data === null && Array.isArray(data)) {
                    //用data参数获取数据
                    this.initListData(data);
                }
            }
        };
        DropDown.prototype.hideList = function () {
            this.ulDom.classList.remove('show');
            this.isVisible = false;
        };
        /**
         * 隐藏指定下标的item，每次重新隐藏，不与上次操作重叠，传入 空数组，或者null则显示全部
         * @param {number[]} indexes
         */
        DropDown.prototype.showItems = function (indexes) {
            d.queryAll('li[data-index]', this.ulDom)
                .forEach(function (li) {
                var index = parseInt(li.dataset.index);
                if (Array.isArray(indexes)) {
                    if (indexes.indexOf(index) > -1) {
                        li.classList.remove('hide');
                    }
                    else {
                        li.classList.add('hide');
                    }
                }
                else {
                    li.classList.remove('hide');
                }
                // if (Array.isArray(indexes) && indexes.indexOf(index) > -1) {
                //     li.classList.remove('hide');
                // } else {
                //     li.classList.add('hide');
                // }
            });
        };
        DropDown.prototype.toggle = function (relEl) {
            this.isVisible ? this.hideList() : this.showList(relEl);
        };
        DropDown.prototype.select = function (value) {
            if (Array.isArray(this.data)) {
                for (var i = 0, d_1 = null; d_1 = this.data[i]; i++) {
                    if (d_1.value === value) {
                        if (this.selectIndex !== i) {
                            this.selectIndex = i;
                            this.onSelect();
                        }
                        return true;
                    }
                }
                return false;
            }
            else {
                return false;
            }
        };
        /**
         * 获取选中index
         * @returns {any}
         */
        DropDown.prototype.get = function () {
            var index = this.selectIndex;
            //多选
            if (this.list.get()) {
                return this.list.get();
                //单选
            }
            else if (tools.isEmpty(this.data) || index === -1) {
                return null;
            }
            else {
                return this.data[index];
            }
        };
        /**
         * 获取选中的数据
         * @returns {ListItem[]}
         */
        DropDown.prototype.getSelect = function () {
            var _this = this;
            var select = this.get(), data = [];
            select.forEach(function (s) {
                _this.data.forEach(function (d, i) {
                    if (s === i) {
                        data.push(d);
                    }
                });
            });
            return data;
        };
        DropDown.prototype.addSelected = function (index) {
            this.list.addSelected(index);
        };
        DropDown.prototype.set = function (index) {
            this.list.set(index);
        };
        DropDown.prototype.setAll = function () {
            this.list.setAll();
        };
        DropDown.prototype.unSet = function (index) {
            this.list.unSet(index);
        };
        DropDown.prototype.render = function (data, isRefresh) {
            if (isRefresh === void 0) { isRefresh = true; }
            var plus = 0;
            if (isRefresh) {
                this.ulDom.innerHTML = '';
            }
            else {
                plus = this.data ? this.data.length : 0;
            }
            var items = [];
            data.forEach(function (da, i) {
                if (!tools.isEmpty(da)) {
                    items.push(d.create("<li class=\"drop-item\" title=\"" + tools.str.removeHtmlTags(da.text) + "\" data-index=\"" + (plus + i) + "\"><span class=\"drop-span\">" + da.text + "</span></li>"));
                }
            });
            this.list.addByDom(items);
        };
        DropDown.prototype.destroy = function () {
            this.data = null;
            // this.ulDom.remove();
            d.remove(this.ulDom);
            this.ulDom = null;
            // this.texts = null;
            window.removeEventListener(tools.isMb ? 'tap' : 'click', this.clickHideHandler, true);
        };
        DropDown.prototype.dataAdd = function (data) {
            var newData = this.data2listItem(data);
            this.render(newData, false);
            this.data = Array.isArray(newData) && Array.isArray(this.data) ? this.data.concat(newData) : newData;
        };
        DropDown.prototype.dataDel = function (index) {
            this.ulDom.removeChild(this.ulDom.querySelector("[data-index=\"" + index + "\"]"));
            delete this.data[index];
            if (index === this.selectIndex) {
                this.selectIndex = -1;
            }
        };
        DropDown.prototype.dataDelAll = function () {
            this.data = null;
            // this.values = null;
            this.render([]);
        };
        DropDown.prototype.getData = function () {
            return this.data;
        };
        /**
         * 返回value对应的index
         * @param str
         * @returns {Array}
         */
        DropDown.prototype.transIndex = function (str) {
            var data = this.getData(), num = [];
            data && str.forEach(function (s) {
                data.forEach(function (d, i) {
                    if (s === d.value) {
                        num.push(i);
                    }
                });
            });
            return num;
        };
        return DropDown;
    }());
    exports.DropDown = DropDown;
});

define("List", ["require", "exports", "SelectBox"], function (require, exports, selectBox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="List"/>
    var tools = C.tools;
    var d = C.d;
    var List = /** @class */ (function () {
        function List(para) {
            var _this = this;
            this.para = para;
            this.listDom = [];
            para.container.classList.add('list');
            if (this.para.select) {
                this.selectBox = new selectBox_1.SelectBox({
                    select: {
                        multi: this.para.select.multi,
                        callback: function (index) {
                            _this.para.select.callback(_this.selectBox.get(), index);
                        }
                    },
                    container: this.para.container,
                });
            }
            if (this.para.select && this.para.select.show) {
                this.showSelect();
            }
        }
        List.prototype.setTpl = function (tpl) {
            this.tpl = tpl;
        };
        List.prototype.showSelect = function () {
            this.para.container.classList.add('has-select');
        };
        List.prototype.hideSelect = function () {
            this.para.container.classList.remove('has-select');
        };
        // removeAll
        List.prototype.removeAllDom = function () {
            this.listDom.forEach(function (dom) {
                d.remove(dom);
            });
            this.listDom = [];
        };
        List.prototype.removeDom = function (index) {
            d.remove(this.listDom[index]);
            var select = this.selectBox.get();
            if (select.indexOf(parseInt(index)) > -1) {
                select.splice(index, 1);
            }
            delete this.listDom[index];
        };
        List.prototype.addByTpl = function (data) {
            var _this = this;
            if (!this.tpl) {
                return;
            }
            var arr = [];
            data && data[0] && data.forEach(function (d, i) {
                var html = tools.str.parseTpl(_this.tpl, d, false);
                var el = C.d.create(html);
                arr.push(el);
            });
            this.addByDom(arr);
            return arr;
        };
        List.prototype.addByDom = function (el) {
            var _this = this;
            el.forEach(function (d, i) {
                d.classList.add('list-item');
                //若有index, 不另外添加index
                d.dataset.index = d.dataset.index ? d.dataset.index : i.toString();
                if (_this.para.select && _this.para.select.multi !== undefined) {
                    _this.selectBox.addByItem(d);
                }
                _this.listDom.push(d);
                _this.para.container.appendChild(d);
            });
        };
        List.prototype.get = function () {
            if (this.selectBox) {
                return this.selectBox.get();
            }
        };
        List.prototype.addSelected = function (index) {
            if (this.selectBox) {
                this.selectBox.addSelected(index);
            }
        };
        List.prototype.setAll = function () {
            if (this.selectBox) {
                this.selectBox.setAll();
            }
        };
        List.prototype.set = function (index) {
            if (this.selectBox) {
                this.selectBox.set(index);
            }
        };
        List.prototype.unSet = function (index) {
            if (this.selectBox) {
                this.selectBox.unSet(index);
            }
        };
        return List;
    }());
    exports.List = List;
});

define("Loading", ["require", "exports", "Modal"], function (require, exports, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = C.tools;
    var Loading = /** @class */ (function () {
        function Loading(para) {
            this.para = para;
            this.modal = null;
            para.msg = para.msg ? para.msg : '加载中...';
            var body = document.body;
            var container = tools.isEmpty(para.container) ? body : para.container;
            this.modal = new Modal_1.Modal({
                container: container,
                width: '158px',
                height: '120px',
                body: h("div", null,
                    h("div", { className: "spinner" }),
                    h("div", null, para.msg)),
                className: 'modal-loading',
                isBackground: false
            });
            this.delayHied();
            if (container !== body) {
                this.modal.className = 'container-loading';
                var offset = para.container.getBoundingClientRect();
                var wrapper = this.modal.wrapper;
                wrapper.style.position = 'absolute';
                wrapper.style.left = (offset.width - 158) / 2 + 'px';
                wrapper.style.top = Math.max(0, (offset.height - 120) / 2) + 'px';
            }
            //禁用元素
            if (this.para.disableEl) {
                this.para.disableEl.classList.add('disabled');
            }
        }
        /**
         * 显示加载框
         * */
        Loading.prototype.show = function () {
            this.modal.isShow = true;
            this.delayHied();
        };
        /**
         * 销毁加载框
         * */
        Loading.prototype.destroy = function () {
            if (this.para && this.para.disableEl) {
                this.para.disableEl.classList.remove('disabled');
            }
            this.modal && this.modal.destroy();
            this.para = null;
            this.modal = null;
        };
        /**
         * 延迟隐藏，默认3秒后销毁
         * */
        Loading.prototype.delayHied = function () {
            var _this = this;
            var duration = tools.isEmpty(this.para.duration) ? 30 : this.para.duration;
            setTimeout(function () {
                if (_this.modal && _this.modal.wrapper) {
                    _this.hide();
                }
            }, duration * 1000);
        };
        /*
         * 隐藏加载框
         * */
        Loading.prototype.hide = function () {
            if (this.modal.wrapper) {
                this.modal.isShow = false;
            }
        };
        return Loading;
    }());
    exports.Loading = Loading;
});

define("Spinner", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="Spinner"/>
    var d = C.d;
    var Spinner = /** @class */ (function () {
        function Spinner(para) {
            this.para = para;
            this.spinnerDom = null;
            this.visible = false;
            this.methods = (function (self) {
                var arr = [], showType = Spinner.SHOW_TYPE;
                /**
                 * 附加方法
                 */
                arr[showType.append] = (function () {
                    return {
                        show: function () {
                            d.after(self.para.el, self.spinnerDom);
                            // self.para.el.parentNode.insertBefore(self.spinnerDom, self.para.el.nextSibling)
                        },
                        hide: function () {
                            d.remove(self.spinnerDom);
                        }
                    };
                }());
                /**
                 * 替换方法
                 */
                arr[showType.replace] = (function () {
                    var tmpDom = null;
                    return {
                        show: function () {
                            tmpDom = self.para.el.cloneNode();
                            tmpDom.innerHTML = '';
                            tmpDom.appendChild(self.spinnerDom);
                            d.replace(tmpDom, self.para.el);
                        },
                        hide: function () {
                            if (tmpDom) {
                                d.replace(self.para.el, tmpDom);
                                tmpDom = null;
                            }
                        }
                    };
                }());
                /**
                 * 覆盖方法
                 */
                arr[showType.cover] = (function () {
                    return {
                        show: function () {
                            var parent = self.para.el.parentNode, position = parent.style.position;
                            if (position !== 'relative | absolute | fixed') {
                                position = 'relative';
                            }
                            var spinnerDomStyle = self.spinnerDom.style, elDom = self.para.el;
                            self.spinnerDom.classList.add('spinner-cover');
                            spinnerDomStyle.width = elDom.offsetWidth + 'px';
                            spinnerDomStyle.height = elDom.offsetHeight + 'px';
                            spinnerDomStyle.left = elDom.offsetLeft + 'px';
                            spinnerDomStyle.top = elDom.offsetTop + 'px';
                            parent.insertBefore(self.spinnerDom, self.para.el.nextSibling);
                        },
                        hide: function () {
                            if (self.spinnerDom.parentNode) {
                                d.remove(self.spinnerDom);
                            }
                        }
                    };
                }());
                return arr;
            }(this));
            this.initSpinner();
        }
        Spinner.prototype.initSpinner = function () {
            var para = this.para;
            if (this.spinnerDom) {
                d.remove(this.spinnerDom);
            }
            this.spinnerDom = createSpinner(para.className);
            function createSpinner(className) {
                var style = para.size ? " style=\"width: " + para.size + "px;height: " + para.size + "px\"" : '';
                className = className ? " class=\"" + className + "\"" : '';
                return d.create("<div" + className + " style=\"text-align: center\"><span class=\"spinner\"" + style + "></span></div>");
            }
        };
        // public setPara(){
        //
        // }
        Spinner.prototype.show = function () {
            var method = this.methods[this.para.type];
            if (method) {
                method.show();
                this.visible = true;
            }
        };
        Spinner.prototype.hide = function () {
            var method = this.methods[this.para.type];
            if (method) {
                method.hide();
                this.visible = false;
            }
        };
        Spinner.prototype.isVisible = function () {
            return this.visible;
        };
        /**
         * 0 : 附加
         * 1 : 替换
         * 2 : 覆盖
         */
        Spinner.SHOW_TYPE = {
            append: 0,
            replace: 1,
            cover: 2
        };
        return Spinner;
    }());
    exports.Spinner = Spinner;
});

define("Tooltip", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="Tooltip"/>
    var tools = C.tools;
    var Tooltip = /** @class */ (function () {
        function Tooltip(para) {
            this.userPara = null;
            this.userPara = tools.obj.merge(Tooltip.defaultPara, para);
            this.userPara.el.classList.add('tooltipiconfont');
            for (var key in this.userPara) {
                if (this.userPara.hasOwnProperty(key)) {
                    if (key != 'el' && key != 'offset') {
                        this.userPara.el.setAttribute(key != 'errorMsg' ? 'data-balloon-' + key : 'data-balloon', key != 'visible' ? this.userPara[key] : "");
                    }
                }
            }
            !this.userPara.visible && this.userPara.el.removeAttribute("data-balloon-visible");
        }
        Tooltip.prototype.show = function () {
        };
        ;
        Tooltip.prototype.hide = function () {
            for (var key in this.userPara) {
                if (this.userPara.hasOwnProperty(key)) {
                    if (key != 'el' && key != 'offset') {
                        this.userPara.el.removeAttribute(key != 'errorMsg' ? 'data-balloon-' + key : 'data-balloon');
                    }
                }
            }
            this.userPara.visible && this.userPara.el.removeAttribute("data-balloon-visible");
        };
        ;
        Tooltip.clear = function (el) {
            for (var key in el.dataset) {
                if (key.indexOf('balloon') === 0) {
                    delete el.dataset[key];
                }
            }
        };
        Tooltip.defaultPara = {
            pos: "up",
            length: "fit",
            visible: false,
            errorMsg: "",
            el: null
        };
        return Tooltip;
    }());
    exports.Tooltip = Tooltip;
});

define("Tab", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="Tab"/>
    var tools = C.tools;
    var d = C.d;
    var Tab = /** @class */ (function () {
        function Tab(para) {
            var _this = this;
            this.activeList = [null, null];
            this._tabIndex = false;
            this.panelContainer = Tab.createPanelContainer();
            this.tabContainer = Tab.createTabContainer();
            // 构造tab 界面
            this.len = para.tabs.length;
            this.addTab(para.tabs, true);
            // 载入到界面
            para.tabParent && para.tabParent.appendChild(this.tabContainer);
            para.panelParent && para.panelParent.appendChild(this.panelContainer);
            // 点击事件绑定
            this.clickEvent = function (el) {
                var index = parseInt(el.dataset.index);
                _this.active(index);
                if (typeof para.onClick === 'function') {
                    para.onClick.call(_this, index);
                }
            };
            var self = this;
            d.on(this.tabContainer, 'click', 'li[data-index]', function () {
                self.clickEvent(this);
            });
            //默认激活第一个
            if (this.len > 0) {
                this.active(0);
            }
            this.tabIndexKey = para.tabIndexKey;
            this.tabIndex = para.tabIndex;
        }
        Object.defineProperty(Tab.prototype, "tabIndex", {
            get: function () {
                return this._tabIndex;
            },
            set: function (tabIndex) {
                var _this = this;
                tabIndex = !!tabIndex;
                if (this._tabIndex === tabIndex) {
                    return;
                }
                this._tabIndex = tabIndex;
                var lis = d.queryAll('li[data-index]', this.tabContainer);
                lis.forEach(function (li) {
                    var keyHandle = function (e) {
                        var keyCode = e.keyCode || e.which || e.charCode;
                        if (tools.isNotEmpty(_this.tabIndexKey)) {
                            if (keyCode === _this.tabIndexKey) {
                                _this.clickEvent(li);
                            }
                        }
                        else if (keyCode === 13) {
                            _this.clickEvent(li);
                        }
                    };
                    if (tabIndex) {
                        li.tabIndex = parseInt(tools.getGuid(''));
                        d.on(li, 'keydown', keyHandle);
                    }
                    else {
                        li.removeAttribute('tabIndex');
                        d.off(li, 'keydown', keyHandle);
                    }
                });
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 添加tab
         * @param tabs
         * @param isInit
         */
        Tab.prototype.addTab = function (tabs, isInit) {
            var _this = this;
            if (isInit === void 0) { isInit = false; }
            tabs.forEach(function (p, i) {
                var index = isInit === true ? i : i + _this.len;
                _this.panelContainer.appendChild(Tab.createPanel(p.dom, index));
                _this.tabContainer.appendChild(Tab.createTab({
                    index: index,
                    title: p.titleDom ? p.titleDom : p.title
                }));
            });
            if (isInit === false) {
                this.len += tabs.length;
            }
        };
        Tab.prototype.deleteTab = function (tab) {
            d.remove(tab.dom.parentElement);
            d.remove(tab.titleDom.parentElement);
            this.len--;
            var curPanelChilds = this.panelContainer.children, curTabChilds = this.tabContainer.children;
            curPanelChilds && resetIndex(curPanelChilds);
            curTabChilds && resetIndex(curTabChilds);
            function resetIndex(parEl) {
                for (var i = 0, l = parEl.length; i < l; i++) {
                    var tempDom = parEl[i];
                    tempDom.dataset.index = i.toString();
                }
            }
        };
        /**
         * 激活某个tab
         * @param index
         */
        Tab.prototype.active = function (index) {
            var tab = d.query("li[data-index=\"" + index + "\"]", this.tabContainer), panel = d.query("div.tab-pane[data-index=\"" + index + "\"]", this.panelContainer);
            var activeClass = 'active';
            this.activeList.forEach(function (a) { return d.classRemove(a, activeClass); });
            if (tab && panel) {
                d.classAdd(tab, activeClass);
                d.classAdd(panel, activeClass);
                this.activeList = [tab, panel];
            }
        };
        Tab.prototype.getTab = function () {
            return this.tabContainer;
        };
        Tab.prototype.getPanel = function () {
            return this.panelContainer;
        };
        /**
         * 创建一个panel
         * @param dom
         * @param index
         * @return {HTMLElement}
         */
        Tab.createPanel = function (dom, index) {
            var panel = document.createElement('div');
            panel.classList.add('tab-pane');
            panel.dataset.index = index.toString();
            panel.appendChild(dom);
            return panel;
        };
        Tab.createPanelContainer = function () {
            return d.create('<div class="tab-content"></div>');
        };
        Tab.createTabContainer = function () {
            return d.create("<ul class=\"nav nav-tabs nav-tabs-line\"></ul>");
        };
        Tab.createTab = function (obj) {
            if (typeof obj.title === 'string') {
                return d.create("<li data-index=\"" + obj.index + "\" tabindex=\"" + tools.getGuid('') + "\"><a>" + obj.title + "</a></li>", 'ul');
            }
            else {
                var tempLi = d.create("<li data-index=\"" + obj.index + "\" tabindex=\"" + tools.getGuid('') + "\"></li>", 'ul');
                d.append(tempLi, obj.title);
                return tempLi;
            }
        };
        return Tab;
    }());
    exports.Tab = Tab;
});
