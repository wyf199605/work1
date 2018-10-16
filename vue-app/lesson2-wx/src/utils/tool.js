import {md5} from './md5'
import {CONF} from "./URLConfig";

const tools = {
    isEmpty: (obj) => {
        let isEmpty = false
        if (obj === undefined || obj === null || obj === '') {
            isEmpty = true
        } else if (Array.isArray(obj) && obj.length === 0) {
            isEmpty = true
        } else if (obj.constructor === Object && Object.keys(obj).length === 0) {
            isEmpty = true
        }
        return isEmpty
    },
    isNotEmpty: (obj) => {
        return !tools.isEmpty(obj)
    },
    strToMD5: (str) => {
        return md5(str)
    },
    fileUrlGet: (md5, fieldName = 'FILE_ID', isThumb = false) => {
        return tools.url.addObj(CONF.ajaxUrl.imgDownload, {
            md5_field: fieldName,
            [fieldName]: md5,
            down: 'allow',
            imagetype: isThumb ? 'thumbnail' : 'picture'
        });
    },
    deleteEmptyProperty(object){
        for (let i in object) {
            let value = object[i];
            if (typeof value === 'object') {
                if (Array.isArray(value)) {
                    if (value.length === 0) {
                        delete object[i];
                        continue;
                    }
                }
                tools.deleteEmptyProperty(value);
                if (tools.isEmpty(value)) {
                    delete object[i];
                }
            } else {
                if (value === '' || value === null || value === undefined) {
                    delete object[i];
                }
            }
        }
    },
    getChineseNum(num) {
        // 默认是最大是两位数
        let numberArr = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
        if (num.toString().length > 1) {
            let n = parseInt(num.toString().substr(1, 1));
            if (n === 0) {
                return '十';
            } else {
                return '十' + numberArr[n - 1];
            }
        } else {
            return numberArr[num - 1];
        }
    },
    formatTime: (time) => {
        let date = new Date(time * 1000),
            year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate(),
            hour = date.getHours(),
            minute = date.getMinutes();
        let monthStr = month < 10 ? '0' + month : month,
            daytStr = day < 10 ? '0' + day : day,
            hourStr = hour < 10 ? '0' + hour : hour,
            minuteStr = minute < 10 ? '0' + minute : minute;
        return `${year}-${monthStr}-${daytStr}  ${hourStr}:${minuteStr}`
    },
    pattern: {
        singleton: function (fn) {
            let single = null;
            return function () {
                return single || (single = fn.apply(this, arguments));
            }
        },
        throttling: function (action, delay) { // 函数节流
            let last = 0;
            return function () {
                let curr = +new Date();
                if (curr - last > delay) {
                    action.apply(this, arguments);
                    last = curr
                }
            }
        },
        debounce: function (method, delay) { // 函数防抖
            let timer = null;
            return function () {
                let context = this, args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    method.apply(context, args);

                }, delay);
            }
        }

    },
    getGuid: (function () {
        let guid = 999;
        return function (prefix) {
            if (prefix === void 0) {
                prefix = 'guid-';
            }
            return "" + prefix + guid++;
        };
    }()),
    url: {
        addObj: function (url, obj, isLowCase) {
            if (isLowCase === void 0) {
                isLowCase = true;
            }
            for (let key in obj) {
                if (this.getPara(key, url)) {
                    delete obj[key];
                }
            }
            if (!tools.isEmpty(obj)) {
                return url + (url.indexOf('?') === -1 ? '?' : '&') + tools.obj.toUri(obj, isLowCase);
            }
            else {
                return url;
            }
        },
        getPara: function (name, url) {
            if (url === void 0) {
                url = window.location.href;
            }
            let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            let r = url.split('?')[1] ? url.split('?')[1].match(reg) : null;
            return r !== null ? decodeURIComponent(r[2]) : null;
        },
        getImgUrl: function (fileId) {
            return tools.url.addObj(CONF.ajaxUrl.fileDownload, {
                md5_field: 'FILE_ID',
                file_id: fileId,
                down: 'allow'
            })
        }
    },
    obj: {
        toUri: function (object, isLowCase) {
            if (isLowCase === void 0) {
                isLowCase = true;
            }
            let urlDataStr = '';
            if (object) {
                for (let key in object) {
                    if (object.hasOwnProperty(key)) {
                        urlDataStr += "&" + (isLowCase ? key.toLowerCase() : key) + "=" + encodeURIComponent(object[key]);
                    }
                }
            }
            return urlDataStr.slice(1);
        },
    },
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
    highlight(str, hlstr, color, ignoreCase = true) {
        if (typeof str === 'string' && hlstr.trim()) {
            let searchPara = new RegExp(`(${tools.escapeRegExp(hlstr)})`, ignoreCase ? 'ig' : 'g');
            return str.replace(searchPara, `<span class="${color}">$1</span>`);

        } else {
            return str;
        }
    },
    escapeRegExp(str) {
        return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    },
    removeHtmlTags: function (s) {
        if (typeof s === 'string') {
            return s.replace(/(&nbsp;|<([^>]+)>)/ig, '').replace(/\s+/g, ' ');
        } else {
            return s;
        }

    },
    getCrossTableData: function (meta, data) {
        let newData = [];
        if (Array.isArray(meta) && Array.isArray(data)) {
            data.forEach(function (datas, keyIndex) {
                newData.push({});
                meta.forEach(function (key, dataIndex) {
                    newData[keyIndex][key] = datas[dataIndex];
                });
            });
        }
        return newData;
    },
    isIosDevice: function () {
        let platform = navigator.platform.toLowerCase();
        let userAgent = navigator.userAgent.toLowerCase();
        let isIos = (userAgent.indexOf('iphone') > -1 ||
            userAgent.indexOf('ipad') > -1 ||
            userAgent.indexOf('ipod') > -1) &&
            (platform.indexOf('iphone') > -1 ||
                platform.indexOf('ipad') > -1 ||
                platform.indexOf('ipod') > -1);
        return isIos;
    }
};

export default tools
