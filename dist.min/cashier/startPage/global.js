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
