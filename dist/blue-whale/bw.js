var BW;
(function (BW) {
    BW.CONF = {
        appid: '',
        version: '',
        siteUrl: '',
        siteAppVerUrl: '',
        webscoketUrl: '',
        url: {
            index: "index",
            login: "index?page=login",
            reg: "index?page=reg",
            update: "index?page=update",
            selectServer: "index?page=static%2FserverSelect",
            main: "commonui/pageroute?page=static%2Fmain",
            message: "commonui/pageroute?page=static%2Fmessage",
            msgDetail: "commonui/pageroute?page=static%2Fmessage_detail",
            myselfMenu: "commonui/pageroute?page=static%2FmyselfMenu",
            msgVersion: "commonui/pageroute?page=static%2FmsgVersion",
            imgRotate: "commonui/pageroute?page=static%2FimgRotation",
            changePassword: "commonui/pageroute?page=static%2FchangePassword",
            privilegeConfigure: "commonui/pageroute?page=privilege&uiTypeTest=privilegeConfigure",
            privilegeSearch: 'commonui/pageroute?page=privilege&uiTypeTest=privilegeSearch',
            sqlMonitor: "commonui/pageroute?page=sqlMonitor",
            test: "commonui/pageroute?page=test",
            home: "ui/menu?page=static%2Fhome",
            contact: "ui/pick/system/pick-4?page=static%2Fcontacts",
            myself: "ui/view/n1093_data-30?page=static%2Fmyself",
            bugList: "commonui/pageroute?page=bugList",
            bugDetail: "commonui/pageroute?page=bugDetail",
            notifyCard: "ui/menu?page=static%2FnotifyCard",
            bugReport: "ui/select/n1676_data-95110?page=table",
            mail: 'ui/insert/n1174_data-4',
            processLeave: "flowui/flow/n_flow-1/insert?page=processLeave",
            processAuditList: "flowui/flow/n_flow-1/insert?page=processAuditList",
            processSeekList: "flowui/flow/n_flow-1/insert?page=processSeekList",
            myApplication: "commonui/pageroute?page=myApplication",
            myApplicationPC: "ui/menu/n3008_data-3008?p_n=n3008_data-3008&page=myApplication",
            myApproval: "commonui/pageroute?page=myApproval",
            myApprovalPC: "ui/menu/n3009_data-3009?p_n=n3009_data-3009&page=myApplication",
            flowDetail: "commonui/pageroute?page=flowDetail"
        },
        ajaxUrl: {
            fileUpload: "rest/attachment/upload/file",
            fileDownload: 'rest/attachment/download/file',
            imgDownload: 'rest/attachment/download/picture',
            logout: "logout",
            loginFinger: "login/finger_drom",
            loginTouchID: "login/finger_client",
            loginPassword: "login/password",
            loginWeiXin: "login/wx",
            loginCode: 'login/message',
            unBinding: 'commonsvc/alldevice',
            atdPwdReg: 'attendance/pwdregister/node_attend-3',
            atdFingerReg: 'attendance/fingerregister/node_attend-2',
            atdFingerAtd: 'attendance/fingerattend/node_attend-1',
            passwordEncrypt: "commonsvc/encyption",
            register: "commonsvc/register",
            smsSend: "commonsvc/sms",
            unbound: 'commonsvc/unbound',
            bindWeChat: 'common/wxbound',
            speedTest: 'commonsvc/interaction/KB',
            menu: "ui/menu",
            menuHistory: "common/history",
            menuFavor: "favorites",
            versionInfo: "list/n1679_data-95113",
            pcVersion: "commonsvc/version",
            rmprivsSelect: 'rmprivs/privsget/select',
            rmprivsInsert: 'rmprivs/privsget/insert',
            changePassword: 'common/modify',
            bugReport: 'common/obstacle',
            helpMsg: 'common/help',
            bugList: 'common/obstacles',
            bugDetail: 'common/obdetail',
            bugstatus: 'common/obstate',
            myself: "common/userinfo",
            rfidLoginTime: 'rest/invent/keeponline',
            flowListCheck: 'flow/system/auditlist',
            flowListApply: 'flow/system/list',
        },
        init: function (siteUrl, appid, version, webscoket) {
            this.siteUrl = siteUrl;
            this.appid = appid;
            this.version = version;
            this.webscoketUrl = webscoket;
            this.siteAppVerUrl = siteUrl + "/" + appid + "/" + version;
            for (var key in this.url) {
                var url = this.url[key];
                // prefix = url.indexOf('index?') === 0 ? this.siteUrl : this.siteAppVerUrl;
                this.url[key] = this.siteAppVerUrl + '/' + url;
            }
            for (var key in this.ajaxUrl) {
                var url = this.ajaxUrl[key], prefix = url.indexOf('rest/') === 0 ? this.siteUrl : this.siteAppVerUrl;
                this.ajaxUrl[key] = prefix + '/' + url;
            }
        }
    };
})(BW || (BW = {}));

/// <reference path="Config.ts"/>
/// <reference path="common/sys/sys.ad.ts"/>
/// <reference path="common/sys/sys.h5.ts"/>
/// <reference path="common/sys/sys.ip.ts"/>
/// <reference path="common/sys/sys.pc.ts"/>
/// <reference path="common/sys/sysHistory.pc.ts"/>
/// <reference path="common/sys/sysPage.pc.ts"/>
/// <reference path="common/sys/sysTab.pc.ts"/>
/// <reference path="common/sys/sys.ts"/>

/// <amd-module name="ImgModalMobile"/>
define("ImgModalMobile", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CONF = BW.CONF;
    var ImgModalMobile = /** @class */ (function () {
        function ImgModalMobile() {
        }
        ImgModalMobile.show = function (imgData) {
            BW.sys.window.open({ url: CONF.url.imgRotate });
            window.localStorage.setItem('imgRotateData', JSON.stringify(imgData));
        };
        return ImgModalMobile;
    }());
    exports.ImgModalMobile = ImgModalMobile;
});

define("BwRule", ["require", "exports", "Modal", "ImgModal", "ImgModalMobile"], function (require, exports, Modal_1, img_1, ImgModalMobile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CONF = BW.CONF;
    var sys = BW.sys;
    var Rule = G.Rule;
    var tools = G.tools;
    var Ajax = G.Ajax;
    var BwRule = /** @class */ (function (_super) {
        __extends(BwRule, _super);
        function BwRule() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BwRule.isTime = function (dataType) {
            return dataType === BwRule.DT_DATETIME || dataType === BwRule.DT_TIME;
        };
        BwRule.isImage = function (dataType) {
            return dataType === BwRule.DT_MUL_IMAGE || dataType === BwRule.DT_IMAGE;
        };
        /**
         * 重新生成交叉制表的cols数据
         * @param {Array} metaData 数据数组
         * @param {Array} colData 原始cols数据
         * @return {{cols , lockNum}} 返回新的cols与需要的锁列数
         */
        BwRule.getCrossTableCols = function (metaData, colData) {
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
                    tmpCol = tools.obj.copy(name2Col[lastName]);
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
                    tmpCol = tools.obj.copy(name2Col[key]);
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
        BwRule.getCrossTableData = function (meta, data) {
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
         * fieldList 中link属性会触发的动作，link方法的回调函数中最后一个参数，需要对每一个动作编写对应的执行代码
         */
        /**
         * fieldList中 link属性的处理规则
         * @param {object} para
         * @param {string} para.link - link
         * @param {Array} para.varList - linkVarList
         * @param {string} para.dataType - fieldList.dataType
         * @param {object} para.data - 页面的数据
         * @param {function} para.callback - 点击link执行的回调函数, 参数为 (需要执行的动作，动作需要的数据，所有的动作)
         */
        BwRule.link = function (para) {
            var _linkAct = {
                OPEN_WIN: 1,
                DOWNLOAD: 2,
                SHOW_IMG: 3,
                SHOW_IMGS: 4
            };
            var url, rData, action;
            para = Object.assign({
                dataType: '',
                varList: [],
                data: {}
            }, para);
            url = tools.url.addObj(CONF.siteUrl + para.link, BwRule.varList(para.varList, para.data));
            if (para.dataType === BwRule.DT_FILE) {
                BwRule.Ajax.fetch(url)
                    .then(function (_a) {
                    var response = _a.response;
                    rData = response.data[0];
                    //地址加上域名
                    if (rData.IMGADDR) {
                        rData.IMGADDR = CONF.siteUrl + rData.IMGADDR;
                    }
                    if (rData.DOWNADDR) {
                        rData.DOWNADDR = CONF.siteUrl + rData.DOWNADDR;
                    }
                    //执行动作判断
                    if (rData.IMGADDR) {
                        action = _linkAct.SHOW_IMGS;
                    }
                    else {
                        var fileExt = '';
                        if (rData.FILENAME) {
                            fileExt = rData.FILENAME.split('.').pop().toLowerCase();
                        }
                        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'ttif'].indexOf(fileExt) !== -1) {
                            action = _linkAct.SHOW_IMG;
                        }
                        else {
                            action = _linkAct.DOWNLOAD;
                        }
                    }
                    // para.callback(action, rData, _linkAct);
                    switch (action) {
                        case _linkAct.OPEN_WIN:
                            sys.window.open({ url: rData.url }, para.openUrl);
                            break;
                        case _linkAct.SHOW_IMGS:
                            var img = [], len = rData.PAGENUM, imgAddr = rData.IMGADDR;
                            for (var i = 1, d = void 0, item = void 0; i <= len; i++) {
                                d = { page: i };
                                item = BwRule.parseURL(imgAddr, d);
                                img.push(item);
                            }
                            var imgData = {
                                downAddr: rData.DOWNADDR,
                                title: rData.FILENAME,
                                img: img,
                                onDownload: function (url) {
                                    sys.window.download(url);
                                }
                            };
                            // ImgModalMb.show(imgData);
                            if (tools.isMb) {
                                ImgModalMobile_1.ImgModalMobile.show(imgData);
                            }
                            else {
                                img_1.ImgModal.show(imgData);
                            }
                            break;
                        case _linkAct.SHOW_IMG:
                            if (sys.os === 'ad' || sys.os === 'ip') {
                                sys.window.openImg(rData.DOWNADDR);
                            }
                            else if (tools.isMb) {
                                sys.window.download(rData.DOWNADDR);
                            }
                            else {
                                window.location.href = rData.DOWNADDR;
                            }
                            break;
                        case _linkAct.DOWNLOAD:
                            sys.window.download(rData.DOWNADDR);
                            break;
                        default:
                    }
                });
            }
            else {
                // action = _linkAct.OPEN_WIN;
                sys.window.open({ url: url, gps: para.needGps }, para.openUrl);
                // para.callback(action, rData, _linkAct);
            }
        };
        ;
        /**
         * 解析url中{}包起来的参数
         */
        BwRule.parseURL = function (url, data) {
            return url.replace(BwRule.parseURLReg, function (w) {
                return encodeURIComponent(tools.str.toEmpty(data[w.slice(1, -1)]));
            });
        };
        ;
        BwRule.drillAddr = function (drillAddr, trData, keyField) {
            if (drillAddr && !tools.isEmpty(trData[keyField])) {
                return BwRule.parseURL(drillAddr.dataAddr, trData) + '&page=drill';
            }
            else {
                return '';
            }
        };
        ;
        BwRule.webDrillAddr = function (webDrillAddr, trData, keyField) {
            if (webDrillAddr && !tools.isEmpty(trData[keyField])) {
                return BwRule.reqAddr(webDrillAddr, trData);
            }
            else {
                return '';
            }
        };
        ;
        BwRule.webDrillAddrWithNull = function (webDrillAddrWithNull, trData, keyField) {
            if (webDrillAddrWithNull && tools.isEmpty(trData[keyField])) {
                return BwRule.reqAddr(webDrillAddrWithNull, trData);
            }
            else {
                return '';
            }
        };
        ;
        BwRule.checkValue = function (rs, postData, confirm) {
            var data = tools.keysVal(rs, 'body', 'bodyList', 0), sure = function () {
                BwRule.Ajax.fetch(BW.CONF.siteUrl + data.url, {
                    type: 'POST',
                    data: JSON.stringify(postData),
                }).then(function () {
                    typeof confirm === 'function' && confirm();
                });
                // BwRule.ajax(BW.CONF.siteUrl + data.url, {
                //     type: 'POST',
                //     data: JSON.stringify(postData),
                //     success: function (r) {
                //         confirm();
                //     }
                // });
            };
            if (!tools.isEmpty(data) && !tools.isEmpty(data.type)) {
                if (data.type === 0) {
                    Modal_1.Modal.alert(data.showText);
                }
                else {
                    Modal_1.Modal.confirm({
                        msg: data.showText,
                        callback: function (index) {
                            // debugger;
                            if (index == true) {
                                sure();
                            }
                        }
                    });
                }
                //  typeof callback === 'function' && callback();
            }
            else {
                typeof confirm === 'function' && confirm();
                // typeof callback === 'function' && callback();
            }
        };
        BwRule.getLookUpOpts = function (field, data) {
            return BwRule.Ajax.fetch(CONF.siteUrl + BwRule.reqAddr(field.dataAddr, data), {
                needGps: field.dataAddr.needGps
            }).then(function (_a) {
                var response = _a.response;
                return response.data.map(function (data) {
                    return {
                        text: data[field.name],
                        value: data[field.lookUpKeyField]
                    };
                });
            });
        };
        BwRule.getDefaultByFields = function (cols) {
            var defaultData = {};
            cols.forEach(function (col) {
                var attrs = col.atrrs;
                var defVal = attrs && attrs.defaultValue;
                if (!tools.isEmpty(defVal)) {
                    defaultData[col.name] = defVal.toString().toLowerCase() === '%date%' ?
                        tools.date.format(new Date(), attrs.displayFormat) : defVal;
                }
            });
            return defaultData;
        };
        /**
         * 通过varlist获取old变量数组, 返回的字段名
         * @param {R_VarList[]} varList
         * @return {string[]}
         */
        BwRule.getOldField = function (varList) {
            // 获取有OLD_开头的字段
            var olds = [];
            Array.isArray(varList) && varList.forEach(function (v) {
                if (v.varName.match(/^OLD_/)) {
                    olds.push(v.varName.slice(4));
                }
            });
            return olds;
        };
        BwRule.addOldField = function (olds, data) {
            var multi = Array.isArray(data);
            if (!multi) {
                data = [data];
            }
            // 给old字段赋值
            olds.forEach(function (name) {
                data.forEach(function (o) {
                    if (name in o) {
                        o["OLD_" + name] = o[name];
                    }
                });
            });
            return multi ? data : data[0];
        };
        BwRule.maxValue = function (val, dataType, maxValue) {
            if (typeof maxValue !== 'number' || (typeof val !== 'string' || dataType)) {
                return val;
            }
            var maxStr = maxValue.toString(2), len = maxStr.length;
            if (maxStr[len - 1] === '1') {
                val = val.toUpperCase();
            }
            else if (maxStr[len - 2] === '1') {
                val = val.toLowerCase();
            }
            return val;
        };
        BwRule.fileUrlGet = function (md5, fieldName, isThumb) {
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
        /**
         *
         * fieldList 中 dataType 数值
         */
        BwRule.EVT_REFRESH = 'refreshData';
        BwRule.EVT_ASYN_QUERY = '__TABLE_ASYN_QUERY__';
        BwRule.NoShowFields = ['GRIDBACKCOLOR', 'GRIDFORECOLOR'];
        BwRule.ColorField = 'STDCOLORVALUE';
        BwRule.QUERY_OP = [
            // {}, // {value: 0,text: 'and'}
            // {}, //{value: 1,text: 'or' }
            { value: 2, text: '等于' },
            { value: 3, text: '大于' },
            { value: 4, text: '大于等于' },
            { value: 5, text: '小于' },
            { value: 6, text: '小于等于' },
            { value: 7, text: '介于' },
            { value: 8, text: '包含于' },
            { value: 9, text: '包含' },
            { value: 10, text: '为空' } // isnull
        ];
        BwRule.Ajax = /** @class */ (function (_super) {
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
                    // debugger;
                    if (setting.needGps) {
                        // 超时报错
                        sys.window.getGps(function (gps) {
                            var gpsData = gps.success && gps.gps;
                            if (gpsData) {
                                resolve(gpsData);
                            }
                            else {
                                reject('获取gps失败, 请重试');
                            }
                        });
                    }
                    else {
                        resolve({});
                    }
                }).then(function (gps) {
                    return new Promise(function (resolve, reject) {
                        setting.headers = Object.assign(setting.headers || {}, { position: JSON.stringify(gps) });
                        _super.prototype.fetch.call(_this, url, setting).then(function (result) {
                            // debugger;
                            var response = result.response, xhr = result.xhr;
                            if (tools.isEmpty(response)) {
                                alert('后台数据为空');
                                reject(Ajax.errRes(xhr, 'emptyData', ''));
                                return;
                            }
                            if (typeof response === 'object') {
                                var isLogout = response.errorCode === 50001;
                                if (isLogout) {
                                    Modal_1.Modal.confirm({
                                        msg: '登录已超时,是否跳转到登录页',
                                        callback: function (index) {
                                            if (index) {
                                                BW.sys.window.logout();
                                            }
                                        }
                                    });
                                    reject(Ajax.errRes(xhr, 'logout', ''));
                                    return;
                                }
                                if (response.errorCode && response.errorCode !== 0 && !isLogout) {
                                    if (tools.isPc || (response.errorCode >= 10000 && response.errorCode <= 100001)) {
                                        alert(response.msg || response.errorMsg || '后台错误');
                                    }
                                    else {
                                        Modal_1.Modal.confirm({
                                            msg: response.msg || response.errorMsg || '后台错误',
                                            title: '错误提示',
                                            btns: ['取消', '申报故障'],
                                            callback: function (flag) {
                                                if (flag) {
                                                    require(['BugReport'], function (bugReport) {
                                                        var pageInfo = {
                                                            param: '',
                                                            url: '',
                                                            reqType: '',
                                                            errMsg: ''
                                                        };
                                                        pageInfo.url = url;
                                                        pageInfo.param = tools.isNotEmpty(setting.data) ? JSON.stringify(setting.data) : '';
                                                        var methods = ['GET', 'POST', 'PUT', 'DELETE'];
                                                        pageInfo.reqType = methods.indexOf(setting.type).toString();
                                                        pageInfo.errMsg = response.msg || response.errorMsg || '后台错误';
                                                        new bugReport.BugReportModal(-1, false, pageInfo);
                                                    });
                                                }
                                            }
                                        });
                                    }
                                    reject(Ajax.errRes(xhr, 'errorCode', ''));
                                    return;
                                }
                                if (!response.errorCode) {
                                    var dataList = [];
                                    var meta = [];
                                    if (response.body && response.body.bodyList && response.body.bodyList[0]) {
                                        var data = response.body.bodyList[0];
                                        dataList = data.dataList;
                                        meta = Array.isArray(data.meta) ? data.meta : [];
                                        response.data = BwRule.getCrossTableData(meta, dataList);
                                        response.meta = meta;
                                    }
                                    resolve(result);
                                }
                            }
                            else {
                                resolve(result);
                            }
                        }).catch(function (reason) {
                            var xhr = reason.xhr;
                            if (reason.statusText === 'timeout') {
                                alert('请求超时, 可稍后再试哦~');
                            }
                            else if (xhr.status == 0) {
                                alert('系统正忙, 可稍后再试哦~');
                            }
                            else {
                                alert('请求错误,code:' + xhr.status + ',' + xhr.statusText);
                            }
                            reject(reason);
                        });
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
                return new BwRule.Ajax().fetch(url, setting);
            };
            return class_1;
        }(Ajax));
        /**
         * 解析url的正则 （缓存作用，避免重复解析正则）
         */
        BwRule.parseURLReg = /\{\S+?}/g;
        BwRule.beforeHandle = {
            table: function (tableData) {
                !tools.isEmpty(tableData.cols) && BwRule.beforeHandle.fields(tableData.cols, tableData.uiType); //列数据
                tableData.fixedNum = 1; //锁列数
                tableData.uiType = tools.isEmpty(tableData.uiType) ? null : tableData.uiType;
                return null;
            },
            fields: function (cols, uiType) {
                for (var _i = 0, cols_1 = cols; _i < cols_1.length; _i++) {
                    var col = cols_1[_i];
                    col.title = col.caption;
                    col.valueLists = tools.isEmpty(col.atrrs) ? "" : col.atrrs.valueLists;
                    col.noSum = tools.isEmpty(col.atrrs) ? "" : col.atrrs.noSum;
                    // col.multiPick = tools.isEmpty(col.multiPick) ? null : col.multiPick;
                    col.dataType = tools.isEmpty(col.atrrs) ? "" : col.atrrs.dataType;
                    col.displayFormat = tools.isEmpty(col.atrrs) ? "" : col.atrrs.displayFormat;
                    col.trueExpr = tools.isEmpty(col.atrrs) ? "" : col.atrrs.trueExpr;
                    col.displayWidth = tools.isEmpty(col.atrrs) ? "" : col.atrrs.displayWidth;
                    if (col.elementType == 'lookup') {
                        //look up
                        col.comType = 'selectInput'; // --------------
                    }
                    else if ((col.elementType == 'treepick' || col.elementType == 'pick')) {
                        //PICK UP
                        col.comType = 'tagsInput'; // --------------
                        col.multiValue = col.atrrs.multValue; //单选或多选
                        col.relateFields = col.assignSelectFields;
                    }
                    else if (col.atrrs && col.atrrs.dataType == '43') {
                        //文件上传
                        col.comType = 'file'; // --------------
                        col.relateFields = ['FILE_ID']; // --------------
                    }
                    else if (col.atrrs && col.atrrs.dataType == '30') {
                        //富文本
                        col.comType = 'richText'; // --------------
                    }
                    else if (col.atrrs && col.atrrs.dataType == '17') {
                        //toggle
                        col.comType = 'toggle'; // --------------
                    }
                    else if (col.atrrs && col.atrrs.dataType == '12') {
                        //日期时间控件
                        col.comType = 'datetime'; // --------------
                    }
                    else {
                        col.comType = 'input'; // --------------
                    }
                    if (tools.isNotEmpty(col.subcols)) {
                        BwRule.beforeHandle.fields(col.subcols, uiType);
                    }
                }
            },
        };
        // static field2inputType(field: R_Field) {
        //
        //     let attrs = field.atrrs,
        //         dataType = attrs && attrs.dataType,
        //         elementType = field.elementType,
        //         inputType = '';
        //
        //     if(elementType === 'value' || elementType === 'lookup' || attrs.valueLists){
        //         //look up
        //         inputType = 'selectInput';
        //
        //     } else if((elementType == 'treepick' || elementType == 'pick')){
        //         //PICK UP
        //         if(field.multiPick && field.name === 'ELEMENTNAMELIST' || elementType === 'pick'){
        //             inputType = 'pickInput';
        //         }else{
        //             inputType = 'tagsInput';//
        //         }
        //
        //     } else if(dataType == '43'){
        //         //文件上传
        //         inputType = 'file';
        //
        //     } else if(dataType == '30'){
        //
        //         //富文本
        //         inputType = 'richText';// --------------
        //
        //     } else if(dataType == '17'){
        //         //toggle
        //         inputType = 'toggle';// --------------
        //     } else if(dataType == '12'){
        //         //日期时间控件
        //         inputType = 'datetime';// --------------
        //
        //     }else{
        //         inputType = 'text';// --------------
        //     }
        //
        //     return inputType;
        // }
        BwRule.reqAddrCommit = {
            1: Rule.reqAddrCommit[1],
            2: function (reqAddr, data) {
                //参数构造
                var newData = [], params;
                if (data) {
                    data[0].forEach(function (s, i) {
                        newData.push({});
                        var _loop_1 = function (item) {
                            reqAddr.varList.forEach(function (v) {
                                if (v.varName === item) {
                                    newData[i][item.toLowerCase()] = s[item];
                                }
                            });
                        };
                        for (var item in s) {
                            _loop_1(item);
                        }
                    });
                    params = JSON.stringify({
                        param: [{
                                insert: newData,
                                itemId: data[1].itemId
                            }]
                    });
                }
                return {
                    addr: reqAddr.dataAddr,
                    data: params
                };
            },
            3: function (reqAddr, data) {
                return {
                    addr: tools.url.addObj(reqAddr.dataAddr, { 'atvarparams': JSON.stringify(BwRule.atvar.dataGet()) }),
                    data: {}
                };
            }
        };
        return BwRule;
    }(Rule));
    exports.BwRule = BwRule;
});

var BW;
(function (BW) {
    var d = G.d;
    var tools = G.tools;
    var SYSAD = /** @class */ (function () {
        function SYSAD() {
            this.window = (function (self) {
                var closeConfirmConfig = null;
                return {
                    backHome: function () { },
                    open: function (o) {
                        if (typeof o.data === "string") {
                            o.data = JSON.parse(o.data);
                        }
                        o.extras = { viewData: JSON.stringify(o.extras) };
                        new Promise((function (resolve, reject) {
                            if (o.gps) {
                                self.window.getGps(function (gps) {
                                    if (gps.success) {
                                        resolve(gps.gps);
                                    }
                                    else {
                                        reject(gps);
                                    }
                                });
                            }
                            else {
                                resolve({});
                            }
                        })).then(function (gps) {
                            o.header = gps ? Object.assign(o.header || {}, { position: gps }) : o.header;
                            self.handle('open', JSON.stringify(o));
                        }).catch(function (reason) {
                            if (!reason.flag) {
                                alert('gps未打开, 点击确定去开启.');
                                self.window.openGps();
                            }
                            else {
                                alert(reason.msg);
                            }
                        });
                    },
                    set closeConfirm(obj) {
                        if (obj) {
                            closeConfirmConfig = Object.assign({ msg: '是否关闭页面？' }, obj);
                        }
                        else {
                            closeConfirmConfig = null;
                        }
                    },
                    close: function (event, data) {
                        closeConfirmConfig = closeConfirmConfig || {};
                        var msg = closeConfirmConfig.msg, noHandler = closeConfirmConfig.noHandler, btn = closeConfirmConfig.btn, condition = closeConfirmConfig.condition;
                        if (msg && typeof condition !== 'function') {
                            condition = function () { return true; };
                        }
                        if (msg) {
                            var flagPromise = condition();
                            if (!(flagPromise instanceof Promise)) {
                                flagPromise = Promise.resolve(!!flagPromise);
                            }
                            flagPromise.then(function (flag) {
                                if (!flag) {
                                    close();
                                    return;
                                }
                                require(['Modal'], function (m) {
                                    m.Modal.confirm({
                                        msg: msg,
                                        btns: btn ? btn : ['不关闭', '关闭'],
                                        callback: function (flag) {
                                            if (flag) {
                                                tools.isFunction(noHandler) && noHandler();
                                            }
                                            else {
                                                close();
                                            }
                                        }
                                    });
                                });
                            });
                            return;
                        }
                        close();
                        function close() {
                            self.handle('close', '{event:"' + event + '",data:"' + data + '"}');
                        }
                    },
                    load: function (url, data) {
                        self.handle('load', '{url:"' + url + '",event:"windowData",data:"' + data + '"}');
                    },
                    back: function (event, data) {
                        self.handle('back', '{event:"' + event + '",data:"' + data + '"}');
                    },
                    wake: function (event, data) {
                        self.handle('wake', '{event:"' + event + '",data:"' + data + '"}');
                    },
                    opentab: function (userid, accessToken) {
                        if (userid === void 0) { userid = ''; }
                        if (accessToken === void 0) { accessToken = ''; }
                        var ja = [
                            { icon: "home", name: "首页", url: BW.CONF.url.home },
                            { icon: "contacts", name: "通讯", url: BW.CONF.url.contact },
                            { icon: "message", name: "消息", url: BW.CONF.url.message },
                            { icon: "myselfMenu", name: "我的", url: BW.CONF.url.myselfMenu }
                        ];
                        var dict = {
                            data: JSON.stringify(ja),
                            userid: userid,
                            accessToken: accessToken
                        };
                        self.handle('opentab', JSON.stringify(dict));
                    },
                    logout: function (url) {
                        if (url === void 0) { url = BW.CONF.url.index; }
                        var uuid = this.getDevice("uuid").msg;
                        url = tools.url.addObj(url, { uuid: uuid });
                        self.handle('logout', '{url:"' + url + '"}');
                    },
                    quit: function () {
                        self.handle('quit');
                    },
                    copy: function (text) {
                        text = tools.str.toEmpty(text).trim();
                        self.handle('copy', '{data:"' + text + '"}');
                        BW.toast('复制成功');
                    },
                    getGps: function (callback) {
                        self.handle('getGps', '{type:1,event:"putGps"}');
                        BW.toast('gps获取中, 请稍等');
                        var timer = setTimeout(function () {
                            d.off(window, 'putGps', handler);
                            callback({ success: false, msg: '获取gps超时, 请重试...' });
                        }, 5000);
                        var handler = function (e) {
                            d.off(window, 'putGps', handler);
                            clearInterval(timer);
                            // alert(e.detail);
                            var json = JSON.parse(e.detail);
                            // json.success = !!json.gps;
                            callback(json);
                        };
                        d.on(window, 'putGps', handler);
                    },
                    openGps: function () {
                        self.handle('openGps');
                    },
                    update: function () {
                        self.handle('checkUpdate');
                        BW.toast('已经是最新版本');
                    },
                    clear: function () {
                        self.handle('clear');
                    },
                    getDevice: function (key) {
                        if (tools.isEmpty(key)) {
                            return self.handle('getDevice');
                        }
                        else {
                            return self.handle('getDevice', '{key:' + key + '}');
                        }
                    },
                    openImg: function (url) {
                        self.handle('openImg', '{url:"' + url + '"}');
                    },
                    download: function (url) {
                        self.handle('download', '{url:"' + url + '"}');
                    },
                    touchid: function (callback) {
                        var event = "touchidCallback";
                        self.handle('touchid', '{event:"' + event + '"}');
                        d.once(window, event, function (e) {
                            callback(e);
                        });
                    },
                    wechatin: function (callback) {
                        var event = "wechatCallback";
                        self.handle('wechatin', '{event:"' + event + '"}');
                        d.once(window, event, function (e) {
                            callback(e);
                        });
                    },
                    firePreviousPage: function () {
                    },
                    fire: function (type, data) {
                        tools.event.fire(type, data, window);
                    },
                    scan: function (event) {
                        self.handle('scan', '{event:"' + event + '"}');
                    },
                    shake: function (event) {
                        self.handle('shake', '{event:"' + event + '"}');
                    },
                    powerManager: function () {
                        this.adHandle('powerManager', '');
                    },
                    whiteBat: function () {
                        this.adHandle('whiteBat', '');
                    }
                };
            })(this);
            this.ui = (function (self) {
                return {
                    notice: function (obj) {
                        self.handle('callMsg', obj.msg);
                    }
                };
            })(this);
        }
        SYSAD.prototype.handle = function (action, dict) {
            if (tools.isEmpty(dict)) {
                return JSON.parse(AppShell.postMessage(action));
            }
            else {
                return JSON.parse(AppShell.postMessage(action, dict));
            }
        };
        return SYSAD;
    }());
    BW.SYSAD = SYSAD;
})(BW || (BW = {}));

// import GLOBAL_CONF = require('conf.ts');
var BW;
(function (BW) {
    var tools = G.tools;
    var SYSH5 = /** @class */ (function () {
        function SYSH5() {
            this.window = (function (self) {
                var closeConfirmConfig = null;
                return {
                    backHome: function () {
                        BW.sys.window.open({
                            url: BW.CONF.url.main
                        });
                    },
                    open: function (o) {
                        localStorage.setItem('viewData', JSON.stringify(o.extras));
                        var win = window.parent ? window.parent : window;
                        win.location.href = o.url;
                    },
                    close: function (event, data) {
                        closeConfirmConfig = closeConfirmConfig || {};
                        var msg = closeConfirmConfig.msg, noHandler = closeConfirmConfig.noHandler, btn = closeConfirmConfig.btn, condition = closeConfirmConfig.condition;
                        if (msg && typeof condition !== 'function') {
                            condition = function () { return true; };
                        }
                        if (msg) {
                            var flagPromise = condition();
                            if (!(flagPromise instanceof Promise)) {
                                flagPromise = Promise.resolve(!!flagPromise);
                            }
                            flagPromise.then(function (flag) {
                                if (!flag) {
                                    close();
                                    return;
                                }
                                require(['Modal'], function (m) {
                                    m.Modal.confirm({
                                        msg: msg,
                                        btns: btn ? btn : ['不关闭', '关闭'],
                                        callback: function (flag) {
                                            if (flag) {
                                                tools.isFunction(noHandler) && noHandler();
                                            }
                                            else {
                                                close();
                                            }
                                        }
                                    });
                                });
                            });
                            return;
                        }
                        history.back();
                    },
                    set closeConfirm(obj) {
                        if (obj) {
                            closeConfirmConfig = Object.assign({ msg: '是否关闭页面？' }, obj);
                        }
                        else {
                            closeConfirmConfig = null;
                        }
                    },
                    load: function (url) {
                        var win = window.parent ? window.parent : window;
                        win.location.href = url;
                    },
                    back: function (event, data) {
                        history.back();
                    },
                    wake: function (event, data) {
                    },
                    clear: function () {
                        // self.ui.toast('清除成功');
                    },
                    opentab: function () {
                        var win = window.parent ? window.parent : window;
                        win.location.href = BW.CONF.url.main;
                    },
                    logout: function () {
                        var win = window.parent ? window.parent : window;
                        win.location.href = BW.CONF.url.login;
                    },
                    copy: function (text) {
                        BW.toast('您的设备暂不支持复制');
                    },
                    getGps: function (callback) {
                        callback({ gps: {}, success: true });
                    },
                    openGps: function () {
                    },
                    update: function () {
                        BW.toast('已经是最新版本');
                    },
                    getDevice: function (key) {
                    },
                    openImg: function (url) {
                    },
                    download: function (url) {
                        window.location.href = url;
                    },
                    firePreviousPage: function () {
                    },
                    fire: function (type, data) {
                        tools.event.fire(type, data, window);
                    }
                };
            })(this);
            this.ui = {
                notice: function (obj) {
                    BW.toast(obj.msg);
                },
            };
        }
        return SYSH5;
    }());
    BW.SYSH5 = SYSH5;
})(BW || (BW = {}));

var BW;
(function (BW) {
    var d = G.d;
    var tools = G.tools;
    var SYSIP = /** @class */ (function () {
        function SYSIP() {
            this.window = (function (self) {
                return {
                    backHome: function () {
                    },
                    open: function (o) {
                        if (typeof o.data === "object") {
                            o.data = JSON.stringify(o.data);
                        }
                        window.localStorage.setItem('viewData', JSON.stringify(o.extras));
                        var dict = {
                            url: o.url,
                            // header: o.header || {},
                            header: o.header,
                            event: "windowData",
                            extras: { viewData: JSON.stringify(o.extras) },
                            data: o.data
                        };
                        // self.handle('open', dict);
                        // self.window.getGps((gps) => {
                        //
                        //     if(gps.success) {
                        //         dict.header = Object.assign({position: JSON.stringify(gps.msg)}, dict.header || {});
                        //         self.handle('open', dict);
                        //     }else{
                        //         alert('gps获取失败, 请重试');
                        //     }
                        // })
                        new Promise((function (resolve, reject) {
                            if (o.gps) {
                                self.window.getGps(function (gps) {
                                    if (gps.success) {
                                        resolve(gps.gps);
                                    }
                                    else {
                                        reject(gps.msg);
                                    }
                                });
                            }
                            else {
                                resolve({});
                            }
                        })).then(function (gps) {
                            o.header = gps ? Object.assign(o.header || {}, { position: JSON.stringify(gps) }) : o.header;
                            self.handle('open', o);
                        }).catch(function (reason) {
                            alert(reason);
                        });
                    },
                    close: function (event, data) {
                        var dict = {};
                        dict.data = data;
                        dict.event = event;
                        self.handle('close', dict);
                    },
                    load: function (url, data) {
                        var dict = {};
                        dict.url = url;
                        dict.data = data;
                        dict.event = "windowData";
                        self.handle('load', dict);
                    },
                    back: function (event, data) {
                        var dict = {};
                        dict.event = event;
                        dict.data = data;
                        self.handle('back', dict);
                    },
                    wake: function (event, data) {
                        var dict = {};
                        dict.data = data;
                        dict.event = event;
                        self.handle('wake', dict);
                    },
                    opentab: function (userid, accessToken) {
                        if (userid === void 0) { userid = ''; }
                        if (accessToken === void 0) { accessToken = ''; }
                        var ja = [
                            { icon: "home", name: "首页", url: BW.CONF.url.home },
                            { icon: "contacts", name: "通讯", url: BW.CONF.url.contact },
                            { icon: "message", name: "消息", url: BW.CONF.url.message },
                            { icon: "myselfMenu", name: "我的", url: BW.CONF.url.myselfMenu }
                        ];
                        var dict = {
                            data: JSON.stringify(ja),
                            userid: userid,
                            accessToken: accessToken
                        };
                        self.handle('opentab', dict);
                    },
                    logout: function (url) {
                        if (url === void 0) { url = BW.CONF.url.login; }
                        this.getDevice("uuid");
                        d.once(window, 'getDevice', function (e) {
                            var json = JSON.parse(e.detail);
                            if (json.success) {
                                var uuid = json.msg.uuid;
                                url = tools.url.addObj(url, { uuid: uuid });
                                self.handle('logout', { url: url });
                            }
                        });
                    },
                    quit: function () {
                        self.handle('quit');
                    },
                    copy: function (text) {
                        text = G.tools.str.toEmpty(text).trim();
                        self.handle('copy', { data: text });
                        BW.toast('复制成功');
                    },
                    getGps: function (callback) {
                        // self.handle('getGps',dict);
                        // d.once(window, 'putGps', function (e: CustomEvent) {
                        //     let json = JSON.parse(e.detail);
                        //     callback(json);
                        // });
                        self.handle('getGps', { type: 1, event: "putGps" });
                        var timer = setTimeout(function () {
                            d.off(window, 'putGps', handler);
                            callback({ success: false, msg: '定位服务未开启,请进入系统设置>隐私>定位服务中打开开关,并允许App使用定位服务' });
                        }, 1000);
                        var handler = function (e) {
                            d.off(window, 'putGps', handler);
                            clearTimeout(timer);
                            try {
                                var data = JSON.parse(e.detail);
                                // alert(e.detail);
                                if (data.success) {
                                    data.gps = data.msg;
                                }
                                else {
                                    data.msg = '定位服务未开启,请进入系统设置>隐私>定位服务中打开开关,并允许App使用定位服务';
                                }
                                callback(data);
                            }
                            catch (e) {
                                callback({ success: false, msg: '定位服务未开启,请进入系统设置>隐私>定位服务中打开开关,并允许App使用定位服务' });
                            }
                        };
                        d.on(window, 'putGps', handler);
                    },
                    openGps: function () {
                        self.handle('openGps');
                    },
                    update: function () {
                        self.handle('checkUpdate');
                    },
                    clear: function () {
                        self.handle('clear');
                    },
                    getDevice: function (key) {
                        var dict = {};
                        if (!G.tools.isEmpty(key)) {
                            dict.key = key;
                        }
                        dict.event = "getDevice";
                        self.handle('getDevice', dict);
                    },
                    openImg: function (url) {
                        var dict = {};
                        dict.url = url;
                        self.handle('openImg', dict);
                    },
                    download: function (url) {
                        var dict = {};
                        dict.url = url;
                        self.handle('download', dict);
                    },
                    touchid: function (callback) {
                        var event = "touchidCallback";
                        self.handle('touchid', { event: event });
                        d.once(window, event, function (e) {
                            callback(e);
                        });
                    },
                    wechatin: function (callback) {
                        var event = "wechatCallback";
                        self.handle('wechatin', { event: event });
                        d.once(window, event, function (e) {
                            callback(e);
                        });
                    },
                    firePreviousPage: function () {
                    },
                    fire: function (type, data) {
                        tools.event.fire(type, data, window);
                    }
                };
            })(this);
            this.ui = (function (self) {
                return {
                    notice: function (obj) {
                        var dict = {};
                        dict.data = obj.msg;
                        self.handle('callMsg', dict);
                    },
                };
            })(this);
        }
        SYSIP.prototype.handle = function (action, dict) {
            if (tools.isEmpty(dict)) {
                dict = {};
            }
            dict.action = action;
            webkit.messageHandlers.AppShell.postMessage(dict);
        };
        return SYSIP;
    }());
    BW.SYSIP = SYSIP;
})(BW || (BW = {}));

var BW;
(function (BW) {
    var d = G.d;
    var tools = G.tools;
    var Shell = G.Shell;
    var SYSPC = /** @class */ (function () {
        function SYSPC(para) {
            var _this = this;
            this.pages = null;
            this.tabs = null;
            this.tabContainer = null;
            this.tabMenu = [{
                    title: '刷新',
                    callback: function (url) {
                        _this.window.refresh(url);
                    }
                }, {
                    title: '锁定/解锁',
                    callback: function (url) {
                        var tab = _this.tabs.getTab(url);
                        if (tab) {
                            _this.window.lockToggle(url, !tab.classList.contains('locked'));
                        }
                    }
                }];
            this.window = (function (self) {
                return {
                    open: function (o, refer) {
                        if (self.inMain) {
                            var isNew = self.pages.open(o);
                            self.tabs.open(o.url);
                            BW.sysPcHistory.add({ url: o.url, refer: refer, title: '' });
                            if (!isNew) {
                                self.window.fire('wake', self.pages.get(o.url).dom, o.url);
                            }
                        }
                        else {
                            location.assign(o.url);
                        }
                        localStorage.setItem('viewData', JSON.stringify(o.extras));
                    },
                    close: function (event, data, url) {
                        if (event === void 0) { event = ''; }
                        if (data === void 0) { data = null; }
                        var lastUrl = BW.sysPcHistory.last();
                        typeof url === 'undefined' && (url = lastUrl);
                        if (BW.sysPcHistory.indexOf(url) > -1) {
                            var isLast = lastUrl === url;
                            //事件发送
                            self.window.fire(event, data, BW.sysPcHistory.getRefer(url)[0]);
                            // 历史清除
                            BW.sysPcHistory.remove(url);
                            self.pages.close(url);
                            self.tabs.close(url);
                            // 如果关闭当前打开的页面，则关闭后打开历史倒数第二位置的页面
                            if (BW.sysPcHistory.len() > 0 && isLast) {
                                self.window.open({ url: BW.sysPcHistory.last() });
                            }
                        }
                    },
                    closeAll: function () {
                        BW.sysPcHistory.get().forEach(function (url) {
                            self.pages.close(url);
                            self.tabs.close(url);
                        });
                        BW.sysPcHistory.removeAll();
                    },
                    closeOther: function () {
                        var lastUrl = BW.sysPcHistory.last();
                        BW.sysPcHistory.get().slice(0).forEach(function (url) {
                            if (url !== lastUrl) {
                                self.pages.close(url);
                                self.tabs.close(url);
                                BW.sysPcHistory.remove(url);
                            }
                        });
                    },
                    refresh: function (url, callback) {
                        self.pages.refresh(url, function () {
                            // self.window.setBreadcrumb(url);
                            typeof callback === 'function' && callback();
                        });
                    },
                    lockToggle: function (url, isLock) {
                        BW.sysPcHistory.lockToggle(url, isLock);
                        self.tabs.lockToggle(url, isLock);
                    },
                    load: function (url) {
                        location.assign(url);
                    },
                    back: function (event, data) {
                        window.history.back();
                    },
                    setTitle: function (url, title) {
                        self.tabs.setTabTitle(url, title);
                        BW.sysPcHistory.setMenuName(url, title);
                        // 打开后设置面包屑
                        self.window.setBreadcrumb(url);
                    },
                    opentab: function () {
                        location.assign(BW.CONF.url.main);
                    },
                    logout: function () {
                        var uuid = '', json = this.getDevice();
                        if (json) {
                            uuid = json.uuid;
                        }
                        window.location.assign(tools.url.addObj(BW.CONF.url.index, { uuid: uuid }));
                    },
                    firePreviousPage: function () {
                        var any = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            any[_i] = arguments[_i];
                        }
                    },
                    getDevice: function (key) {
                        var data = SYSPC.handle('getDevice');
                        return data && data.msg;
                        // let json = this.pcHandle('getDevice','');
                        // if(!tools.isEmpty(json)){
                        //     result.data = JSON.parse(json).msg;
                        // return result;
                    },
                    quit: function () {
                    },
                    copy: function (text) {
                        tools.copy(text);
                    },
                    getGps: function (callback) {
                        callback({ gps: {}, success: true });
                    },
                    openGps: function () {
                    },
                    update: function () {
                        // G.Modal.toast('已经是最新版本');
                        if ('AppShell' in window) {
                            Shell.base.versionUpdate(BW.CONF.ajaxUrl.pcVersion, function (e) {
                                if (!e.success) {
                                    require(['Modal'], function (m) {
                                        m.Modal.toast('已经是最新版本');
                                    });
                                }
                            }, function (e) {
                                console.log(e);
                            });
                        }
                        else {
                            require(['Modal'], function (m) {
                                m.Modal.toast('已经是最新版本');
                            });
                        }
                    },
                    clear: function () {
                        // G.Modal.toast('清除成功');
                        require(['Modal'], function (m) {
                            m.Modal.toast('清除成功');
                        });
                    },
                    openImg: function (url) {
                    },
                    download: function (url) {
                        window.location.href = url;
                    },
                    wake: function (event, data) {
                    },
                    fire: function (type, data, url) {
                        var page = self.pages.get(url);
                        if (page) {
                            tools.event.fire(type, data, page.dom);
                        }
                    },
                    setBreadcrumb: function (url) {
                        var page = self.pages.get(url);
                        if (page && page.dom) {
                            var refers = BW.sysPcHistory.getRefer(url, -1), liHtml = '<li><span class="iconfont icon-house"></span></li>', menu = BW.sysPcHistory.getMenuOrder();
                            refers.unshift(url);
                            for (var len = refers.length - 1; len >= 0; len--) {
                                var m = menu[refers[len]];
                                if (m && m.title) {
                                    if (len > 0) {
                                        liHtml += '<li><a data-href="' + refers[len] + '">' + m.title + '</a></li>';
                                    }
                                    else {
                                        liHtml += '<li class="active">' + m.title + '</li>';
                                    }
                                }
                            }
                            var liHtmlDom = d.create('<ol class="breadcrumb">' + liHtml + '</ol>');
                            d.on(liHtmlDom, 'click', 'a[data-href]', function () {
                                self.window.open({ url: this.dataset.href });
                            });
                            page.dom.insertBefore(liHtmlDom, page.dom.firstElementChild);
                        }
                    }
                };
            }(this));
            this.ui = (function (self) {
                return {
                    /**
                     * 浮出提示框
                     * @param {string} title - 标题
                     * @param {string} msg - 内容
                     * @param {int} type - 1.success,默认2.info,3.warning,4.error
                     * @param {object} url 1.property:url 有url则可以打开新页面 2.property:notifyId 判断是否打开过的notifyId
                     * @param {int} position - 默认1.toast-top-right,2.toast-bottom-right,3.toast-bottom-left,4.toast-top-left,5.toast-top-full-width,6.toast-bottom-full-width,7.toast-myToast(自定义样式、在中间显示)
                     * @param {int} time - 默认5000毫秒
                     */
                    notice: function (obj) {
                        console.log(obj);
                        var title = obj.title, msg = obj.msg, type = obj.type, url = obj.url, position = obj.position, time = obj.time, callback = obj.callback;
                        toastr.options = {
                            positionId: position,
                            positionClass: position || "toast-bottom-right",
                            onclick: null,
                            closeButton: false,
                            showDuration: 1000,
                            hideDuration: 1000,
                            timeOut: time || 5000,
                            extendedTimeOut: 1000,
                            showEasing: "swing",
                            hideEasing: "linear",
                            showMethod: "fadeIn",
                            hideMethod: "fadeOut"
                        };
                        if (url != null) {
                            toastr.options.closeButton = true;
                            toastr.options.onclick = function () {
                                self.window.open({ url: BW.CONF.siteUrl + url });
                                $('.messageList').find('li').each(function () {
                                    if (this.dataset.url == url) {
                                        $(this).remove();
                                    }
                                });
                            };
                            setTimeout(callback, 1500);
                        }
                        else {
                            toastr[type || 'info'](msg, title);
                            setTimeout(callback, 1500);
                        }
                    },
                    indexed: function (ajaxUrl, title) {
                        // if ($('ul.ps-container>li.loading').length > 0) {
                        //     picker(ajaxUrl, function () {
                        //         $('#indexedDom  .modal-title').html(title);
                        //         $('#indexedDom').modal()
                        //     })
                        // } else {
                        //     $('#indexedDom').modal()
                        // }
                    }
                };
            }(this));
            if (para && para.pageContainer && para.navBar) {
                this.inMain = true;
                this.pageContainer = para.pageContainer;
                this.navBar = para.navBar;
                this.tabContainer = para.navBar.querySelector('ul.page-tabs-content');
                this.pages = new BW.sysPcPage(para.pageContainer);
                this.tabs = new BW.sysPcTab(this.tabContainer, this.tabMenu);
                setTimeout(function () {
                    var hash = location.hash, autoUrl = '';
                    if (hash) {
                        hash = hash.substring(1);
                        var _a = hash.split('='), page = _a[0], url = _a[1];
                        if (page === 'page' && url) {
                            autoUrl = BW.CONF.siteAppVerUrl + url;
                        }
                    }
                    location.hash = '';
                    if (BW.sysPcHistory.isUseLockInit()) {
                        BW.sysPcHistory.setInitType('0');
                        setTimeout(function () {
                            BW.sysPcHistory.lockGet(function (tabArr) {
                                // debugger;
                                BW.sysPcHistory.removeAll();
                                tabArr = tabArr.map(function (tab) {
                                    tab.isLock = true;
                                    BW.sysPcHistory.add(tab);
                                    return tab;
                                });
                                if (autoUrl) {
                                    var autoTab = {
                                        isLock: false,
                                        title: '',
                                        url: autoUrl
                                    };
                                    tabArr.push(autoTab);
                                    BW.sysPcHistory.add(autoTab);
                                }
                                // debugger;
                                _this.tabs.initHistory(tabArr);
                                if (tools.isNotEmpty(tabArr)) {
                                    _this.window.open({ url: tabArr.pop().url });
                                }
                            });
                        }, 200);
                    }
                    else {
                        if (autoUrl) {
                            var autoTab = {
                                isLock: false,
                                title: '',
                                url: autoUrl
                            };
                            BW.sysPcHistory.add(autoTab);
                        }
                        var lastUrl = BW.sysPcHistory.last();
                        if (lastUrl) {
                            _this.tabs.initHistory((function () {
                                var tabs = [], menus = BW.sysPcHistory.getMenuOrder();
                                for (var url in menus) {
                                    var menu = menus[url];
                                    tabs.push({
                                        url: url,
                                        title: menu.title,
                                        isLock: menu.isLock,
                                        refer: menu.refer
                                    });
                                }
                                return tabs;
                            })());
                            _this.window.open({ url: lastUrl });
                        }
                    }
                }, 100);
            }
            else {
                this.inMain = false;
            }
        }
        SYSPC.handle = function (action, dict) {
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
        return SYSPC;
    }());
    BW.SYSPC = SYSPC;
})(BW || (BW = {}));

var BW;
(function (BW) {
    BW.sys = null;
    function __initSys(type, extra) {
        switch (type) {
            case 'pc':
                BW.sys = new BW.SYSPC(extra);
                break;
            case 'ad':
                BW.sys = new BW.SYSAD();
                break;
            case 'ip':
                BW.sys = new BW.SYSIP();
                break;
            case 'h5':
                BW.sys = new BW.SYSH5();
        }
        BW.sys.os = type;
        BW.sys.isMb = type !== 'pc';
    }
    BW.__initSys = __initSys;
    function toast(msg) {
        require(['Modal'], function (m) {
            m.Modal.toast(msg);
        });
    }
    BW.toast = toast;
})(BW || (BW = {}));

var BW;
(function (BW) {
    var tools = G.tools;
    BW.sysPcHistory = (function () {
        var lsHashField = 'openedIframeHash', lsMenuOrder = 'openedMenuOrder', 
        // lsLockMenuOrder = 'lockedMenuOrder',
        lsLockKey = 'lockedMenuKey', lsInitType = 'menuInitType', storage = window.localStorage, history = storage.getItem(lsHashField), order = storage.getItem(lsMenuOrder), 
        // lock = storage.getItem(lsLockMenuOrder),
        lockKey = storage.getItem(lsLockKey), historyArr = history ? history.split(',') : [], menuOrder = order ? JSON.parse(order) : {}, 
        // lockMenu: objOf<UrlData> = lock ? JSON.parse(lock) : {},
        historyLen = historyArr.length;
        /**
         * 删除一条历史，返回被删除的index，如果url不在历史中，则返回-1
         * @param url
         * @returns {number}
         */
        var historyRemove = function (url) {
            var removed = historyArr.indexOf(url);
            if (removed >= 0) {
                historyArr.splice(removed, 1);
            }
            return removed;
        };
        var saveLocal = function () {
            storage.setItem(lsHashField, historyArr.join(','));
        };
        var saveOrder = function () {
            storage.setItem(lsMenuOrder, JSON.stringify(menuOrder));
        };
        var lockFun = (function () {
            // 使用indexDB储存
            var storeName = 'lockTab', db = null;
            if (lockKey && window.indexedDB) {
                var req_1 = indexedDB.open('BW', 1);
                req_1.onsuccess = function (e) {
                    db = (req_1.result);
                };
                // 创建数据库以及结构
                req_1.onupgradeneeded = function (event) {
                    if (!lockKey) {
                        return;
                    }
                    var db = event.target.result, objectStore = db.createObjectStore(storeName, { keyPath: 'lockKey' });
                    // console.log(db.objectStoreNames);
                    objectStore.createIndex('tabArr', 'tabArr', { unique: false });
                    // objectStore.createIndex('refer', 'refer', {unique: false});
                    // objectStore.createIndex('createTime', 'createTime', {unique: false});
                    // let tabArr: UrlData[] = [];
                    // for(let url in lockMenu){
                    //     let menu = lockMenu[url];
                    //     tabArr.push({
                    //         url,
                    //         title: menu.title,
                    //         refer: menu.refer
                    //     });
                    // }
                    // objectStore.add({lockKey, tabArr});
                };
            }
            var getStore = function (writable) {
                if (writable === void 0) { writable = false; }
                if (db) {
                    return db.transaction([storeName], writable ? 'readwrite' : 'readonly').objectStore(storeName);
                }
                else {
                    return null;
                }
            };
            var get = function (callback) {
                if (db) {
                    // debugger;
                    getStore().get(lockKey).onsuccess = function () {
                        // debugger;
                        callback(this.result ? this.result.tabArr : []);
                    };
                }
                else {
                    callback([]);
                }
            };
            var add = function (url) {
                if (!lockKey || !db) {
                    return;
                }
                get(function (tabArr) {
                    var menu = menuOrder[url];
                    tabArr = tabArr || [];
                    tabArr.push({
                        url: url,
                        title: menu.title,
                        refer: menu.refer
                    });
                    getStore(true).put({ lockKey: lockKey, tabArr: tabArr });
                });
            };
            var del = function (url) {
                if (!lockKey || !db) {
                    return;
                }
                get(function (tabArr) {
                    if (Array.isArray(tabArr)) {
                        tabArr = tabArr.filter(function (tab) { return tab.url !== url; });
                        getStore(true).put({ lockKey: lockKey, tabArr: tabArr });
                    }
                });
            };
            return { get: get, add: add, del: del };
        })();
        var isUseLockInit = function () { return storage.getItem(lsInitType) === '1'; };
        return {
            len: function () { return historyLen; },
            last: function () { return historyArr[historyLen - 1]; },
            getMenuOrder: function () { return menuOrder; },
            indexOf: function (url) { return historyArr.indexOf(url); },
            isUseLockInit: isUseLockInit,
            setInitType: function (type) { storage.setItem(lsInitType, type); },
            lockGet: lockFun.get,
            lockToggle: function (url, isLock) {
                var menu = menuOrder[url];
                if (menu) {
                    menu.isLock = isLock;
                    if (isLock) {
                        lockFun.add(url);
                        // lockMenu[url] = menu;
                    }
                    else {
                        lockFun.del(url);
                        // delete lockMenu[url];
                    }
                    saveOrder();
                    // saveLock();
                }
            },
            add: function (urlData) {
                //非重复添加时
                var url = urlData.url;
                if (historyRemove(url) === -1) {
                    historyLen++;
                    menuOrder[url] = {
                        title: tools.str.toEmpty(urlData.title)
                    };
                    urlData.refer && (menuOrder[url].refer = urlData.refer);
                    urlData.isLock && (menuOrder[url].isLock = urlData.isLock);
                    saveOrder();
                }
                historyArr.push(url);
                saveLocal();
            },
            remove: function (url) {
                historyRemove(url);
                delete menuOrder[url];
                // delete lockMenu[url];
                historyLen--;
                saveLocal();
                saveOrder();
                // saveLock();
            },
            removeAll: function () {
                storage.removeItem(lsHashField);
                storage.removeItem(lsMenuOrder);
                menuOrder = {};
                historyArr = [];
                saveLocal();
                saveOrder();
                historyLen = 0;
            },
            setMenuName: function (url, name) {
                // console.log(menuOrder, url, name);
                if (menuOrder[url]) {
                    menuOrder[url].title = name;
                    saveOrder();
                }
            },
            get: function () { return historyArr; },
            /**
             * 获取引用链
             * @param url
             * @param deep - 引用链的最大长度 ， -1表示没有限制
             */
            getRefer: function (url, deep) {
                if (deep === void 0) { deep = 1; }
                var refers = [];
                for (var i = 0, currUrl = url; deep === -1 || i < deep; i++) {
                    var refer = void 0, urlData = menuOrder[currUrl];
                    if (!urlData) {
                        break;
                    }
                    refer = urlData.refer;
                    // 第二个条件判断是否形成循环
                    if (!refer || refers.indexOf(refer) >= 0) {
                        break;
                    }
                    refers.push(refer);
                    currUrl = refer;
                }
                return refers;
            },
            setLockKey: function (key) {
                storage.setItem(lsLockKey, key);
                // if(isNewLockKey()){
                // sysPcHistory.removeAll();
                // }else{
                //
                // }
            },
            remainLockOnly: function (callback) {
                // let lockOrder = sysPcHistory.getMenuOrder(true),
                //     delHistories = sysPcHistory.get().filter(url => !(url in lockOrder));
                //
                //
                // delHistories.forEach(url => sysPcHistory.remove(url));
                lockFun.get(function (tabArr) {
                    historyArr
                        .filter(function (url) { return !tabArr.some(function (tab) { return tab.url === url; }); })
                        .forEach(function (url) { return BW.sysPcHistory.remove(url); });
                    callback();
                    // saveOrder();
                    // saveLocal();
                });
            }
        };
    }());
})(BW || (BW = {}));

var BW;
(function (BW) {
    var d = G.d;
    var Ajax = G.Ajax;
    var tools = G.tools;
    var sysPcPage = /** @class */ (function () {
        function sysPcPage(container) {
            this.container = container;
            this.pages = (function (self) {
                var allPage = {};
                function add(p) {
                    allPage[p.url] = p;
                }
                return {
                    add: function (p) { add(p); },
                    remove: function (url) {
                        var page = allPage[url];
                        delete allPage[url];
                    },
                    contains: function (url) { return url in allPage; },
                    last: function () {
                        var lastUrl = BW.sysPcHistory.last();
                        if (lastUrl) {
                            return allPage[lastUrl] || null;
                        }
                        else {
                            return null;
                        }
                    },
                    get: function (url) { return allPage[url] || null; }
                };
            }(this));
        }
        // private static pageHtmlSet(dom:HTMLElement, html:string){
        //     dom.innerHTML = html;
        //
        //     let scripts:NodeListOf<HTMLScriptElement> = dom.querySelectorAll('script');
        //     for(let i = 0, s:HTMLScriptElement = null; s = scripts.item(i); i++){
        //         let newSc:HTMLScriptElement = document.createElement('script');
        //         newSc.text = s.text;
        //         s.parentNode.replaceChild(newSc, s);
        //     }
        // }
        sysPcPage.prototype.pageCreate = function (o, callback) {
            var page = pageDivCreate(o.url);
            // 打开内网
            if (o.url.indexOf(location.hostname) > -1) {
                Ajax.fetch(o.url).then(function (_a) {
                    var response = _a.response;
                    d.setHTML(page, response);
                    callback(page);
                    typeof o.callback === 'function' && o.callback();
                });
            }
            else {
                // 外网url, 创建iframe
                var iframe = d.create("<iframe width=\"100%\" src=\"" + o.url + "\"></iframe>");
                d.append(page, iframe);
                page.classList.add('iframe');
                callback(page);
                typeof o.callback === 'function' && o.callback();
            }
            return page;
        };
        sysPcPage.prototype.pageDestroy = function (url) {
            var page = this.pages.get(url);
            if (page) {
                tools.event.fire('page.destroy', null, page.dom);
                page.dom.style.display = 'none';
                setTimeout((function (dom) {
                    d.remove(dom);
                })(page.dom), 30);
            }
        };
        sysPcPage.prototype.pageOpen = function (o) {
            var _this = this;
            var page = this.pageCreate(o, function (p) {
                d.append(_this.container, p);
            });
            // 添加记录
            this.pages.add({
                url: o.url,
                dom: page,
                data: o.data,
            });
        };
        sysPcPage.prototype.pageShow = function (url) {
            var page = this.pages.get(url);
            if (page) {
                page.dom.style.display = 'block';
            }
        };
        /**
         * 关闭窗口方法 窗口必须为导航存在的窗口
         * @param {string} url - 关闭窗口的唯一id
         */
        sysPcPage.prototype.close = function (url) {
            // dom清除
            this.pageDestroy(url);
            this.pages.remove(url);
        };
        /**
         *
         * @param o
         * @returns {boolean} - 返回true代表是新窗口，false则是旧窗口
         */
        sysPcPage.prototype.open = function (o) {
            // 隐藏上次打开的page
            var lastPage = this.pages.last();
            if (lastPage !== null) {
                lastPage.dom.style.display = 'none';
            }
            //是否打开过
            if (this.pages.contains(o.url)) {
                //显示已经打开的的页面
                this.pageShow(o.url);
                return false;
            }
            else {
                //打开新的页面
                this.pageOpen(o);
                return true;
            }
        };
        sysPcPage.prototype.refresh = function (url, callback) {
            var _this = this;
            var page = this.pages.get(url);
            if (page) {
                // let nextPageDom = this.
                this.pageDestroy(url);
                // debugger
                page.dom = this.pageCreate({ url: url }, function (pageDom) {
                    if (url !== _this.pages.last().url) {
                        pageDom.style.display = 'none';
                    }
                    d.append(_this.container, pageDom);
                    typeof callback === 'function' && callback();
                });
            }
        };
        sysPcPage.prototype.get = function (url) {
            return this.pages.get(url);
        };
        return sysPcPage;
    }());
    BW.sysPcPage = sysPcPage;
    function pageDivCreate(url) {
        var dom = document.createElement('div');
        dom.classList.add('page-container');
        dom.dataset['src'] = url; // tools.str.htmlEncode(url);
        return dom;
    }
})(BW || (BW = {}));

var BW;
(function (BW) {
    var d = G.d;
    var sysPcTab = /** @class */ (function () {
        function sysPcTab(headerNavBar, menu) {
            if (headerNavBar === void 0) { headerNavBar = null; }
            this.headerNavBar = headerNavBar;
            this.menu = menu;
            this.tabs = {};
            this.menuEl = null;
            this.menuCreate(menu);
            this.menuEventInit();
        }
        sysPcTab.prototype.open = function (url) {
            if (!this.tabs[url]) {
                this.createNewTab(url, undefined);
            }
            this.activeTab(url);
        };
        sysPcTab.prototype.close = function (url) {
            var tab = this.tabs[url];
            if (tab) {
                // debugger;
                // this.lockToggle(url, false);
                d.remove(tab);
                delete this.tabs[url];
            }
        };
        sysPcTab.prototype.getTab = function (url) {
            return this.tabs[url] || null;
        };
        // 激活已经打开的tab
        sysPcTab.prototype.activeTab = function (url) {
            var active = this.tabs[url], lastUrl = BW.sysPcHistory.last();
            if (lastUrl) {
                this.tabs[lastUrl].classList.remove('open');
            }
            if (active) {
                active.classList.add('open');
            }
        };
        sysPcTab.prototype.createNewTab = function (url, title, isLock) {
            if (title === void 0) { title = '<div class="spinner"></div>'; }
            if (isLock === void 0) { isLock = false; }
            var navTab = d.create("<li class=\"dropdown\" data-href=\"" + url + "\"><a>" +
                ("<span class=\"title\">" + (title ? title : '空') + "</span>") +
                ("<span class=\"close ti-plus\" data-href=\"" + url + "\"></span>") +
                "<span class=\"lock-icon iconfont icon-pin4\"></span>" +
                "</a></li>");
            this.tabs[url] = navTab;
            d.append(this.headerNavBar, navTab);
            if (isLock) {
                this.lockToggle(url, true);
            }
        };
        sysPcTab.prototype.lockToggle = function (url, isLock) {
            var tab = this.tabs[url], bar = this.headerNavBar;
            if (!tab) {
                return;
            }
            var edge = d.query('li:not(.locked)', bar);
            if (edge === null) {
                d.append(bar, tab);
            }
            else {
                d.before(edge, tab);
            }
            tab.classList.toggle('locked', isLock);
        };
        sysPcTab.prototype.menuCreate = function (menus) {
            var menuHtml = '', menuEl = d.create('<ul class="tab-menu"></ul>');
            menus.forEach(function (menu, i) {
                var content = menu.icon ? "<span class=\"iconfont " + menu.icon + "\"></span>" : menu.title;
                menuHtml += "<li data-index=\"" + i + "\" title=\"" + menu.title + "\">" + content + "</li>";
            });
            menuEl.innerHTML = menuHtml;
            d.on(menuEl, 'click', 'li[data-index]', function (e) {
                var index = parseInt(this.dataset.index);
                if (menus[index]) {
                    menus[index].callback(menuEl.dataset.href);
                }
                e.stopPropagation();
            });
            d.append(document.body, menuEl);
            this.menuEl = menuEl;
        };
        sysPcTab.prototype.menuEventInit = function () {
            var self = this;
            d.on(this.headerNavBar, 'contextmenu', 'li[data-href]', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (self.menuEl) {
                    self.menuEl.style.top = e.clientY + "px";
                    self.menuEl.style.left = e.clientX + "px";
                    self.menuEl.classList.remove('hide');
                    self.menuEl.dataset.href = this.dataset.href;
                }
            });
            window.addEventListener('click', function () {
                self.menuEl.classList.add('hide');
            }, true);
        };
        sysPcTab.prototype.setTabTitle = function (url, title, callback) {
            if (url === void 0) { url = BW.sysPcHistory.last(); }
            if (this.tabs[url]) {
                this.tabs[url].querySelector('span.title').innerHTML = title;
                if (typeof callback === 'function') {
                    callback();
                }
            }
        };
        sysPcTab.prototype.initHistory = function (tabArr) {
            // initHistory() {
            var _this = this;
            // let order = sysPcHistory.getMenuOrder();
            // for(let url in order){
            //     if(order.hasOwnProperty(url)) {
            //         this.createNewTab(url, order[url].title, order[url].isLock);
            //     }
            // }
            tabArr.forEach(function (tab) {
                _this.createNewTab(tab.url, tab.title, tab.isLock);
            });
        };
        return sysPcTab;
    }());
    BW.sysPcTab = sysPcTab;
})(BW || (BW = {}));

define("ButtonAction", ["require", "exports", "InputBox", "Button", "Modal", "SelectBox", "ShellErpManagePc", "SelectInput", "Loading", "BwRule", "SelectInputMb", "RfidBarCode"], function (require, exports, InputBox_1, Button_1, Modal_1, selectBox_1, ShellErpManage_1, selectInput_1, loading_1, BwRule_1, selectInput_mb_1, RfidBarCode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="ButtonAction"/>
    var tools = G.tools;
    var CONF = BW.CONF;
    var d = G.d;
    // import {NewTablePage} from "../../../pages/table/newTablePage";
    /**
     * Created by zhengchao on 2017/12/21.
     * 业务按钮统一控制器
     */
    var ButtonAction = /** @class */ (function () {
        function ButtonAction() {
        }
        /**
         * button点击后业务操作规则
         */
        ButtonAction.prototype.clickHandle = function (btn, data, callback, url, itemId) {
            if (callback === void 0) { callback = function (r) {
            }; }
            var self = this;
            if (btn.subType === 'excel') {
                var tableData = void 0;
                var uploderModal_1 = new Modal_1.Modal({
                    header: '选择导入的文件',
                    body: d.create("<div></div>"),
                    className: 'upload-modal',
                    isOnceDestroy: true,
                    footer: {
                        rightPanel: [
                            {
                                content: '取消',
                                onClick: function () {
                                    uploderModal_1.destroy();
                                }
                            }
                        ]
                    },
                });
                //TODO 将UploadModule过程效果整合到upload组件
                require(['UploadModule'], function (upload) {
                    var loadUrl = CONF.siteUrl + btn.actionAddr.dataAddr;
                    new upload.default({
                        container: uploderModal_1.body,
                        uploadUrl: loadUrl + (loadUrl.indexOf('?') > -1 ? '&' : '?') + "item_id=" + itemId,
                        onChange: function () {
                        },
                        onComplete: function (resuult) {
                            // console.log(data);
                            //后台表格数据返回
                            // tableData = resuult.data;
                            // let meta = tableData.meta;
                            // let data = tableData.dataList.map(data => {
                            //     let obj = {};
                            //     data.forEach((d, index) => {
                            //         obj[meta[index]] = d;
                            //     });
                            //     return obj;
                            // });
                            uploderModal_1.destroy();
                            setTimeout(function () {
                                self.btnRefresh(btn.refresh, url);
                            }, 100);
                            // G.tools.event.fire(NewTableModule.EVT_EXPORT_DATA, data);
                        }
                    });
                });
            }
            else {
                if (btn.hintBeforeAction || btn.buttonType === 3) {
                    var hintWords = ['查询', '新增', '修改', '删除'], word = hintWords[btn.buttonType];
                    if (btn.subType === 'with_draw') {
                        word = '撤销';
                    }
                    else if (btn.subType === 'reject') {
                        word = '退回';
                    }
                    Modal_1.Modal.confirm({
                        msg: "\u786E\u5B9A\u8981" + word + "\u5417?",
                        callback: function (index) {
                            if (index === true) {
                                self.btnAction(btn, data, callback, url);
                            }
                        }
                    });
                }
                else {
                    self.btnAction(btn, data, callback, url);
                }
            }
        };
        /**
         * 根据button的refresh属性
         * @param {int} refresh
         * @param url - pc端本页url
         * 0 - 本页面不刷新
         * 1 - 本页面刷新
         * 2 - 关闭本页面 页面并不刷新
         * 3 - 关闭本页面 页面并刷新
         * 4 - 本页不刷新 手动返回上级时刷新上级
         */
        ButtonAction.prototype.btnRefresh = function (refresh, url) {
            switch (refresh) {
                case 1:
                    BW.sys.window.fire(BwRule_1.BwRule.EVT_REFRESH, null, url);
                    break;
                case 2:
                    setTimeout(function () {
                        BW.sys.window.close('', null, url);
                    }, 1000);
                    break;
                case 3:
                    setTimeout(function () {
                        BW.sys.window.close(BwRule_1.BwRule.EVT_REFRESH, null, url);
                    }, 1000);
                    break;
                case 4:
                    BW.sys.window.firePreviousPage(BwRule_1.BwRule.EVT_REFRESH, null, url);
                    break;
                default:
            }
        };
        /**
         * 将页面dom转换为button业务对象
         */
        ButtonAction.prototype.dom2Obj = function (btn) {
            var obj = {
                subType: btn.dataset.subType,
                openType: btn.dataset.openType,
                buttonType: parseInt(btn.dataset.buttonType, 10),
                actionAddr: {
                    varList: JSON.parse(btn.dataset.varList),
                    dataAddr: btn.dataset.actionAddr
                },
                refresh: parseInt(btn.dataset.refresh, 10)
            };
            return obj;
        };
        /**
         * openTyp="popup";//弹出新窗口,"newwin";//打开新窗口,"none";//保持在原界面
         * 处理按钮规则buttonType=0:get,1:post,2put,3delete
         */
        ButtonAction.prototype.btnAction = function (btn, dataObj, callback, url) {
            var _this = this;
            if (callback === void 0) { callback = function (r) {
            }; }
            var _a = BwRule_1.BwRule.reqAddrFull(btn.actionAddr, dataObj), addr = _a.addr, data = _a.data, self = this, ajaxType = ['GET', 'POST', 'PUT', 'DELETE'][btn.buttonType];
            switch (btn.openType) {
                case 'none':
                    if (!ajaxType) {
                        Modal_1.Modal.alert('buttonType不在0-3之间, 找不到请求类型!');
                        return;
                    }
                    self.checkAction(btn, dataObj, addr, ajaxType, data, url).then(function (response) {
                        callback(response);
                    }).catch(function () {
                    });
                    break;
                case 'popup':
                    if (!ajaxType) {
                        Modal_1.Modal.alert('buttonType不在0-3之间, 找不到请求类型!');
                        return;
                    }
                    addr = tools.url.addObj(addr, { output: 'json' });
                    self.checkAction(btn, dataObj, addr, ajaxType, data, url).then(function (response) {
                        console.log(response);
                        //创建条码扫码页面
                        if (response.uiType === 'inventory' && tools.isMb) {
                            _this.initBarCode(response, data, dataObj);
                        }
                        else {
                            self.btnPopup(response, function () {
                                self.btnRefresh(btn.refresh, url);
                            }, url);
                        }
                    }).catch(function () {
                    });
                    break;
                case 'newwin':
                default:
                    BW.sys.window.open({
                        url: tools.url.addObj(BW.CONF.siteUrl + addr, data),
                        gps: !!btn.actionAddr.needGps
                    }, url);
                    self.btnRefresh(btn.refresh, url);
            }
        };
        ButtonAction.prototype.initBarCode = function (res, data, dataObj) {
            // console.log(res.body.elements)
            var dataAddr = res.body.elements, codeStype, url, uniqueFlag, ajaxUrl;
            for (var i = 0; i < dataAddr.length; i++) {
                url = dataAddr[i].downloadAddr.dataAddr;
                codeStype = dataAddr[i].atvarparams[0].data; //可能需要做判断
                uniqueFlag = dataAddr[i].uniqueFlag;
            }
            console.log(codeStype[0]["IMPORTDATAMODE"]);
            BwRule_1.BwRule.Ajax.fetch(BW.CONF.siteUrl + url, {
                data: data
            }).then(function (_a) {
                var response = _a.response;
                console.log(response);
                response.body && (ajaxUrl = response.body.bodyList[0].inventData);
            });
            new RfidBarCode_1.RfidBarCode({
                codeStype: codeStype,
                SHO_ID: dataObj['SHO_ID'],
                USERID: dataObj['USERID'],
                url: ajaxUrl,
                uniqueFlag: uniqueFlag
            });
        };
        /**
         * 后台有配置actionHandle情况下的处理
         */
        // private checkAction(btn: R_Button, dataObj: obj|obj[], callback = (r) => {}, url?:string, addr?:string, ajaxType?:string, ajaxData?:any) {
        //     let varType = btn.actionAddr.varType, self = this;
        //     if (varType === 3 && typeof ajaxData !== 'string') {
        //         // 如果varType === 3 则都转为数组传到后台
        //         if (!Array.isArray(ajaxData)) {
        //             ajaxData = [ajaxData];
        //         }
        //         ajaxData = JSON.stringify(ajaxData);
        //     }
        //     BwRule.ajax(BW.CONF.siteUrl + addr, {
        //         urlData: varType !== 3,
        //         type: ajaxType,
        //         defaultCallback : btn.openType !== 'popup',
        //         data: ajaxData,
        //         success: function (r) {
        //             let data = tools.keysVal(r, ['body', 'bodyList', 0]);
        //             if (data && (data.type || data.type === 0)) {
        //                 if (data.type === 0) {
        //                     Modal.alert(data.showText);
        //                 } else {
        //                     Modal.confirm({
        //                         msg: data.showText,
        //                         callback: (index) => {
        //                             if (index == true) {
        //                                 self.checkAction(btn, dataObj, callback, url, data.url, ajaxType, ajaxData);
        //                             }
        //                         }
        //                     });
        //                 }
        //             }else{
        //                 // 默认提示
        //                 if (!('hintAfterAction' in btn) || btn.hintAfterAction) {
        //                     if (data && data.showText) {
        //                         Modal.alert(data.showText);
        //                     } else if(btn.openType !== 'popup'){
        //                         Modal.toast(`${btn.title}成功`);
        //                         self.btnRefresh(btn.refresh, url);
        //                     }
        //                 }
        //                 callback(r);
        //             }
        //         }
        //     });
        // }
        ButtonAction.prototype.checkAction = function (btn, dataObj, addr, ajaxType, ajaxData, url) {
            var varType = btn.actionAddr.varType, self = this;
            if (varType === 3 && typeof ajaxData !== 'string') {
                // 如果varType === 3 则都转为数组传到后台
                if (!Array.isArray(ajaxData)) {
                    ajaxData = [ajaxData];
                }
                ajaxData = JSON.stringify(ajaxData);
            }
            return BwRule_1.BwRule.Ajax.fetch(BW.CONF.siteUrl + addr, {
                data2url: varType !== 3,
                type: ajaxType,
                // defaultCallback : btn.openType !== 'popup',
                data: ajaxData,
                needGps: btn.actionAddr.needGps
            }).then(function (_a) {
                var response = _a.response;
                var data = tools.keysVal(response, 'body', 'bodyList', 0);
                if (data && (data.type || data.type === 0)) {
                    if (data.type === 0) {
                        Modal_1.Modal.alert(data.showText);
                    }
                    else {
                        return new Promise(function (resolve) {
                            Modal_1.Modal.confirm({
                                msg: data.showText,
                                callback: function (confirmed) {
                                    if (confirmed) {
                                        self.checkAction(btn, dataObj, data.url, ajaxType, ajaxData, url).then(function () {
                                            resolve();
                                        });
                                    }
                                }
                            });
                        });
                    }
                }
                else {
                    // 默认提示
                    if (!('hintAfterAction' in btn) || btn.hintAfterAction) {
                        if (data && data.showText) {
                            Modal_1.Modal.alert(data.showText);
                        }
                        else if (btn.openType !== 'popup') {
                            Modal_1.Modal.toast(response.msg || btn.title + "\u6210\u529F");
                            self.btnRefresh(btn.refresh, url);
                        }
                    }
                    return response;
                    // callback(response);
                }
            });
        };
        /**
         * 下拉和列表弹出框
         * @param response
         * @param onOk 回调
         * @param url
         */
        ButtonAction.prototype.btnPopup = function (response, onOk, url) {
            var _this = this;
            var res = response.body.elements[0], len = res.cols && res.cols.length, selectInput = [], type = res.actionType, modal, selectBox, comSelectInput, speedInput, loading, sendMsg, sendFinish, width, //模态框宽度
            progress, //进度条
            tipDom, //盘点机信息提示
            table; //表格模块
            if (type === 3 || type === 5) {
                if (len > 6) {
                    width = 100 * 10;
                }
                else {
                    width = 180 * len;
                }
            }
            else if (res.downloadAddr) {
                width = 260;
            }
            //模态框参数
            var body = d.create("<div></div>");
            if (res.downloadAddr) {
                body = d.create("<div><div class=\"avatar-load\"><div class=\"conf-left\"></div><div class=\"conf-right\">\n                </div></div><div class=\"avatar-progress\"><div class=\"progress-title\">\u4F20\u8F93\u5C1A\u672A\u5F00\u59CB</div></div></div>");
            }
            var caption = response.caption;
            var para = {
                body: body,
                header: caption,
                isOnceDestroy: true,
                width: width,
                isAdaptiveCenter: true,
                isMb: false
            };
            if (type === 3 || type === 5) {
                para['className'] = tools.isMb ? 'mb-action-type-5' : 'action-type-5';
            }
            if (type === 4) {
                para['className'] = 'action-type-4';
            }
            //type3模态框无footer
            if (type !== 3) {
                var inputBox_1 = new InputBox_1.InputBox(), subButtons = res.subButtons;
                subButtons && subButtons.forEach(function (obj) {
                    inputBox_1.addItem(new Button_1.Button({
                        content: obj.caption,
                        type: 'primary',
                        onClick: function () {
                            var data = [];
                            if (!res.downloadAddr) {
                                modal.destroy();
                                if (res.atvarparams) {
                                    data[0] = selectInput;
                                }
                                else if (type === 5) {
                                    data[0] = table.main.ftable.selectedRowsData;
                                }
                                data[1] = res;
                            }
                            _this.clickHandle(obj, data, function (r) {
                            }, url);
                        }
                    }));
                });
                //盘点机操作
                if (res.downloadAddr) {
                    var action_1, btn_1, msg_1, pos_1, shellData_1;
                    sendMsg = function (event) {
                        console.log(event);
                        if ('AppShell' in window) {
                            if (event.success) {
                                var data = event.data;
                                tipDom.innerHTML = event.msg;
                                progress.format(data ? data.progress : 0);
                                if (data && data.state === 2) {
                                    if (action_1 === 'upload') {
                                        inventoryAjax(JSON.stringify([{
                                                inventdata: data.data,
                                            }]), btn_1);
                                    }
                                    else {
                                        Modal_1.Modal.alert('下载数据完成');
                                        modal.destroy(function () {
                                            offShellMonitor();
                                        });
                                    }
                                }
                            }
                            else {
                                Modal_1.Modal.alert('调用接口失败，请重试！');
                            }
                        }
                        else {
                            var data = JSON.parse(event.detail), tip = data.msg, percent = tip.substring(tip.indexOf('(') + 1, tip.indexOf('%'));
                            tipDom.innerHTML = tip.substr(0, tip.indexOf('('));
                            progress.format(percent);
                            if (percent === '100') {
                                if (action_1 === 'upload') {
                                    var upLoadData = pos_1.inventory({
                                        msg: 'getUploadData',
                                    })._data;
                                    inventoryAjax(JSON.stringify([{
                                            inventdata: JSON.parse(upLoadData).msg.data,
                                        }]), btn_1);
                                    // tipDom.innerHTML = upLoadData.msg;
                                }
                                else if (action_1 === 'download') {
                                    Modal_1.Modal.alert('下载数据完成');
                                    modal.destroy(function () {
                                        offShellMonitor();
                                    });
                                }
                            }
                        }
                    };
                    sendFinish = function (event) {
                        console.log(event);
                        var detail = JSON.parse(event.detail);
                        // Modal.alert(detail.msg);
                        tipDom && (tipDom.innerHTML = detail.msg);
                        btn_1 && btn_1.classList.remove('disabled');
                    };
                    inputBox_1.addItem(new Button_1.Button({
                        content: '确定',
                        type: 'primary',
                        onClick: function (e) {
                            if (!('BlueWhaleShell' in window || 'AppShell' in window)) {
                                Modal_1.Modal.alert('当前操作仅支持在蓝鲸PC客户端使用');
                                return null;
                            }
                            action_1 = selectBox.getSelect()[0].value;
                            btn_1 = e.currentTarget;
                            btn_1.classList.add('disabled');
                            pos_1 = 'AppShell' in window ? G.Shell : new ShellErpManage_1.ShellErpManagePc();
                            shellData_1 = {
                                port: comSelectInput.get(),
                                speed: speedInput.get(),
                            };
                            //上传操作
                            if (action_1 === 'upload') {
                                url = tools.url.addObj(res.uploadAddr.dataAddr, { 'atvarparams': JSON.stringify(BwRule_1.BwRule.atvar.dataGet()) });
                                msg_1 = 'callUpload';
                                if ("AppShell" in window) {
                                    pos_1.casio.upload(shellData_1.port, shellData_1.speed, function (e) {
                                        sendFinish(e);
                                    }, function (e) {
                                        sendMsg(e);
                                    });
                                }
                                else {
                                    pos_1.inventory({
                                        msg: msg_1,
                                        data: shellData_1,
                                    });
                                }
                            }
                            else if (action_1 === 'download') {
                                //下载操作
                                msg_1 = 'callDownload';
                                url = res.downloadAddr.dataAddr;
                                inventoryAjax(null, btn_1, shellData_1, pos_1, msg_1);
                            }
                        }
                    }));
                    if ('BlueWhaleShell' in window) {
                        //上传下载过程中，shell返回给前端信息
                        d.on(window, 'sendMessage', function (event) {
                            sendMsg(event);
                        });
                        //结束时，shell返回信息
                        d.on(window, 'sendFinish', function (event) {
                            sendFinish(event);
                        });
                    }
                }
                if (tools.isMb && type === 5) {
                    para['header'] = {
                        rightPanel: inputBox_1,
                        title: caption
                    };
                }
                para['footer'] = {
                    rightPanel: inputBox_1
                };
            }
            modal = new Modal_1.Modal(para);
            tipDom = d.query('.progress-title', modal.bodyWrapper); //盘点机提示
            /**
             * 盘点机上传下载
             * @param ajaxData
             * @param shellData  传递给shell的数据
             * @param pos
             * @param msg
             * @param btn  确定按钮
             */
            function inventoryAjax(ajaxData, btn, shellData, pos, msg) {
                if (!loading) {
                    // TODO
                    loading = new loading_1.Loading({
                        msg: '正在获取数据...'
                    });
                }
                else {
                    loading && loading.show();
                }
                BwRule_1.BwRule.Ajax.fetch(CONF.siteUrl + url, {
                    type: 'POST',
                    data: ajaxData
                }).then(function (_a) {
                    var response = _a.response;
                    if (msg === 'callDownload') {
                        shellData['data'] = response.body.bodyList[0].inventData;
                        if ("AppShell" in window) {
                            pos.casio.download(shellData.port, shellData.speed, shellData.data, function (e) {
                                sendFinish && sendFinish(e);
                            }, function (e) {
                                sendMsg && sendMsg(e);
                            });
                        }
                        else {
                            pos.inventory({
                                msg: msg,
                                data: shellData,
                            });
                        }
                    }
                    else {
                        var resData_1 = response.body && response.body.bodyList && response.body.bodyList[0];
                        if (resData_1 && resData_1.showText) {
                            Modal_1.Modal.confirm({
                                msg: resData_1.showText,
                                callback: function (index) {
                                    if (index == true) {
                                        loading && loading.show();
                                        // BwRule.ajax(CONF.siteUrl + resData.url,{
                                        //     type : 'post',
                                        //     data : ajaxData,
                                        //     success : (res) => {
                                        //         successCb(res)
                                        //     }
                                        // })
                                        BwRule_1.BwRule.Ajax.fetch(CONF.siteUrl + resData_1.url, {
                                            type: 'post',
                                            data: ajaxData,
                                        }).then(function (_a) {
                                            var response = _a.response;
                                            successCb(response);
                                        });
                                    }
                                    else {
                                        btn.classList.remove('disabled');
                                    }
                                }
                            });
                        }
                        else {
                            successCb(response);
                        }
                    }
                }).finally(function () {
                    loading && loading.hide();
                });
                function successCb(datas) {
                    loading && loading.hide();
                    Modal_1.Modal.alert(datas.msg);
                    onOk();
                    modal.destroy(function () {
                        offShellMonitor();
                    });
                }
            }
            modal.onClose = function () {
                modal.destroy(function () {
                    if (res.downloadAddr) {
                        offShellMonitor();
                    }
                });
                return;
            };
            if (type === 3) {
                list();
            }
            else if (res.atvarparams) {
                //type4 or handle or
                var avatarLoad_1 = modal.body, avatarProgress_1, confLeft = void 0, confRight = void 0, disabled_1 = '';
                if (res.downloadAddr) {
                    var body_1 = modal.bodyWrapper;
                    avatarLoad_1 = d.query('.avatar-load', body_1);
                    confRight = d.query(".conf-right", body_1);
                    confLeft = d.query('.conf-left', body_1);
                    avatarProgress_1 = d.query('.avatar-progress', body_1);
                    //下载上传
                    selectBox = new selectBox_1.SelectBox({
                        select: {
                            multi: false,
                            callback: function (index) {
                                var atvar = d.query('.atvarDom', body_1);
                                if (index === 0) {
                                    atvar.classList.add('disabled');
                                }
                                else {
                                    atvar.classList.remove('disabled');
                                }
                            }
                        },
                        container: confLeft,
                        data: [{
                                value: 'download',
                                text: '下载数据'
                            }, {
                                value: 'upload',
                                text: '上传数据'
                            }]
                    });
                    //前台写死默认端口、速度
                    speedInput = new selectInput_1.SelectInput({
                        container: confRight,
                        className: 'speed-select',
                        data: [{
                                text: '1200bps',
                                value: '1200',
                            }, {
                                text: '2400bps',
                                value: '2400',
                            }, {
                                text: '4800bps',
                                value: '4800',
                            }, {
                                text: '9600bps',
                                value: '9600',
                            }, {
                                text: '19200bps',
                                value: '19200',
                            }, {
                                text: '1280000bps',
                                value: '1280000',
                            },]
                    });
                    comSelectInput = new selectInput_1.SelectInput({
                        container: confRight,
                        className: 'com-select',
                        data: [{
                                text: 'COM1',
                                value: 'COM1'
                            }, {
                                text: 'COM2',
                                value: 'COM2'
                            }]
                    });
                    comSelectInput.set('COM1');
                    speedInput.set('19200');
                    disabled_1 = 'disabled';
                    require(['Progress'], function (p) {
                        progress = new p.Progress({
                            container: avatarProgress_1
                        });
                    });
                }
                //TODO BwRule.atvar需改良成非静态
                require(['QueryBuilder'], function (q) {
                    BwRule_1.BwRule.atvar = new q.AtVarBuilder({
                        queryConfigs: res.atvarparams,
                        resultDom: avatarLoad_1,
                        tpl: "<div class=\"atvarDom " + disabled_1 + "\"><div style=\"display: inline-block;\" data-type=\"title\"></div>\n                    <span>\uFF1A</span><div data-type=\"input\"></div></div>",
                        setting: res.setting
                    });
                    var coms = BwRule_1.BwRule.atvar.coms, keys = Object.keys(coms);
                    if (keys && keys.length === 1 && coms[keys[0]] instanceof selectInput_mb_1.SelectInputMb) {
                        coms[keys[0]].showList();
                    }
                });
            }
            else if (type === 5) {
                list();
            }
            function list() {
                modal.body = d.create("<div style=\"height: 70vh;\"></div>");
                res.cols.forEach(function (c) {
                    c['title'] = c.caption;
                });
                var tableData = tools.obj.merge(res, {
                    multiSelect: res.multiValue ? res.multiValue : true,
                    // isSub : type !== 3,
                    isInModal: true,
                });
                require(['newTableModule'], function (e) {
                    // debugger;
                    table = new e.NewTableModule({
                        bwEl: Object.assign(tableData, { subButtons: [] }),
                        container: modal.body,
                    });
                    table.refresh();
                    //编辑并保存之后调用回调
                    if (type === 3) {
                        d.on(window, e.NewTableModule.EVT_EDIT_SAVE, function () {
                            onOk();
                        });
                    }
                });
            }
            function offShellMonitor() {
                d.off(window, 'sendMessage');
                d.off(window, 'sendFinish');
            }
        };
        ButtonAction.prototype.test = function (i) {
            console.log("test.buttonAction." + i);
        };
        ButtonAction.get = function () {
            if (!ButtonAction.buttonAction)
                ButtonAction.buttonAction = new ButtonAction();
            return ButtonAction.buttonAction;
        };
        ButtonAction.buttonAction = null;
        return ButtonAction;
    }());
    exports.ButtonAction = ButtonAction;
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
