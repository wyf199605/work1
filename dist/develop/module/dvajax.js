define("DVAjax", ["require", "exports", "Modal"], function (require, exports, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="DVAjax" />
    var Ajax = G.Ajax;
    var config = DV.CONF;
    var tools = G.tools;
    var SPA = G.SPA;
    var DVAjax = /** @class */ (function () {
        function DVAjax() {
        }
        // treeList管理
        DVAjax.menuQueryAjax = function (nodeId, cb, setting, treeIdUrl) {
            var url = config.ajaxUrl.menuQuery;
            url = tools.isNotEmpty(nodeId) ? url + '/' + nodeId : url;
            url = tools.isNotEmpty(treeIdUrl) ? url + treeIdUrl : url;
            setting = setting || { type: 'GET', data: [] };
            DVAjax.Ajax.fetch(url, setting).then(function (_a) {
                var response = _a.response;
                cb(response);
            }).catch(function (error) {
                console.log(error);
            });
        };
        // 查询数据库资源
        DVAjax.dataSourceQueryAjax = function (cb) {
            var url = config.ajaxUrl.datasourceQuery;
            DVAjax.Ajax.fetch(url).then(function (_a) {
                var response = _a.response;
                var arr = [];
                response.dataArr.forEach(function (item) {
                    arr.push(item['DATA_SOURCE']);
                });
                cb(arr);
            });
        };
        // 查询基表字段
        DVAjax.baseTableQueryAjax = function (baseTable, cb) {
            var url = config.ajaxUrl.baseTableQuery + '/' + baseTable;
            DVAjax.Ajax.fetch(url).then(function (_a) {
                var response = _a.response;
                cb(response);
            });
        };
        // 主功能
        DVAjax.primaryFunctionAjax = function (itemId, cb) {
            var url = config.ajaxUrl.primaryFunction + '/' + itemId;
            DVAjax.Ajax.fetch(url).then(function (_a) {
                var response = _a.response;
                cb(response);
            });
        };
        // item查询
        DVAjax.itemQueryAjax = function (cb, itemId, settings) {
            var url = config.ajaxUrl.itemQuery;
            if (itemId) {
                url = config.ajaxUrl.itemQuery + '/' + itemId;
            }
            DVAjax.Ajax.fetch(url, settings).then(function (_a) {
                var response = _a.response;
                cb(response);
            });
        };
        // item新增
        DVAjax.itemAddAndUpdateAjax = function (cb, setting) {
            DVAjax.Ajax.fetch(config.ajaxUrl.primaryFunction, setting).then(function (_a) {
                var response = _a.response;
                cb(response);
            });
        };
        // item删除list类型
        DVAjax.itemDelete = function (cb, setting, type) {
            var url = type === 'list' ? config.ajaxUrl.primaryFunction : config.ajaxUrl.itemMenuDelete;
            DVAjax.Ajax.fetch(url, setting).then(function (_a) {
                var response = _a.response;
                cb(response);
            });
        };
        // 变量管理
        DVAjax.varDesignAjax = function (cb, settings) {
            var url = config.ajaxUrl.varDesign;
            settings = settings || { type: 'GET', data: [] };
            DVAjax.Ajax.fetch(url, settings).then(function (_a) {
                var response = _a.response;
                cb(response);
            });
        };
        // 元素管理
        DVAjax.elementDesignAjax = function (elementType, cb, settings) {
            var url = config.ajaxUrl.elementDesign;
            if (elementType !== '') {
                url = config.ajaxUrl.elementDesign + '/' + elementType;
            }
            settings = settings || { type: 'GET', data: [] };
            DVAjax.Ajax.fetch(url, settings).then(function (_a) {
                var response = _a.response;
                cb(response);
            }).catch(function (error) {
                console.log(error);
            });
        };
        // 字段编辑器
        DVAjax.fieldManagerAjax = function (setting, cb) {
            DVAjax.Ajax.fetch(config.ajaxUrl.fieldEditor, setting).then(function (_a) {
                var response = _a.response;
                cb(response);
            }).catch(function (error) {
                console.log(error);
            });
        };
        // 加密密码
        DVAjax.encyptionPassword = function (pwd, cb) {
            DVAjax.Ajax.fetch(config.ajaxUrl.encyption + pwd).then(function (_a) {
                var response = _a.response;
                cb(response);
            });
        };
        // 登录
        DVAjax.login = function (setting, cb) {
            DVAjax.Ajax.fetch(config.ajaxUrl.login, setting).then(function (_a) {
                var response = _a.response;
                cb(response);
            });
        };
        //  登出
        DVAjax.logout = function (cb) {
            DVAjax.Ajax.fetch(config.ajaxUrl.logout).then(function (_a) {
                var response = _a.response;
                cb(response);
            });
        };
        // 查询item关联的element元素
        DVAjax.queryItemRelatedElements = function (itemId, elementType, cb) {
            DVAjax.Ajax.fetch(config.ajaxUrl.queryItemRelatedElements + '/' + itemId + '?elementtype=' + elementType)
                .then(function (_a) {
                var response = _a.response;
                cb(response);
            });
        };
        // 查询item关联的条件
        DVAjax.queryItemRelatedConds = function (itemId, cb) {
            DVAjax.Ajax.fetch(config.ajaxUrl.queryItemRelatedCond + '/' + itemId)
                .then(function (_a) {
                var response = _a.response;
                cb(response);
            });
        };
        // 新增/修改/删除Cond
        DVAjax.handlerConditons = function (settings, cb) {
            DVAjax.Ajax.fetch(config.ajaxUrl.queryCondition, settings).then(function (_a) {
                var response = _a.response;
                cb(response);
            });
        };
        // 获取APPID
        DVAjax.getAppId = function (cb) {
            DVAjax.Ajax.fetch(config.ajaxUrl.getAppId).then(function (_a) {
                var response = _a.response;
                cb(response.dataArr);
            });
        };
        // 菜单预览
        DVAjax.interface = function (cb) {
            DVAjax.Ajax.fetch(config.ajaxUrl.interface).then(function (_a) {
                var response = _a.response;
                cb(response);
            });
        };
        // item预览
        DVAjax.itemInterface = function (itemId, cb, errorcb) {
            DVAjax.Ajax.fetch(tools.url.addObj(config.ajaxUrl.itemInterface, { item_id: itemId })).then(function (_a) {
                var response = _a.response;
                cb(response);
            }).catch(function (error) {
                errorcb(error);
            });
        };
        // 生成脚本并打包
        DVAjax.packaing = function (id) {
            var str = '?id=', len = id.length;
            if (tools.isNotEmpty(id)) {
                id.forEach(function (idStr, index) {
                    if (index !== len - 1) {
                        str = str + idStr + ',';
                    }
                    else {
                        str = str + idStr;
                    }
                });
            }
            // 打开新页面进行下载
            window.open(config.ajaxUrl.downloadScript + str);
        };
        // 统一错误处理
        DVAjax.Ajax = /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_1.prototype.fetch = function (url, setting) {
                var _this = this;
                if (setting === void 0) { setting = {}; }
                function alert(msg) {
                    !setting.silent && Modal_1.Modal.alert(msg);
                }
                setting.dataType = setting.dataType || 'json';
                // setting.xhrFields = {
                //     withCredentials: true
                // };
                return new Promise(function (resolve, reject) {
                    _super.prototype.fetch.call(_this, url, setting).then(function (result) {
                        var response = result.response, xhr = result.xhr;
                        if (tools.isEmpty(response)) {
                            alert('后台数据为空');
                            reject(Ajax.errRes(xhr, 'emptyData', ''));
                            return;
                        }
                        if (typeof response === 'object') {
                            var isLogout = response.errorCode === 50001;
                            if (isLogout) {
                                SPA.open(SPA.hashCreate('loginReg', 'login'));
                                reject(Ajax.errRes(xhr, 'logout', ''));
                                return;
                            }
                            if (response.errorCode && response.errorCode !== 0 && !isLogout) {
                                response.errorCode !== 30007 && alert(response.msg || response.errorMsg || '后台错误');
                                reject(Ajax.errRes(xhr, 'errorCode', ''));
                                return;
                            }
                            if (!response.errorCode) {
                                resolve(result);
                            }
                        }
                        else {
                            resolve(result);
                        }
                    }).catch(function (reason) {
                        var xhr = reason.xhr;
                        if (xhr.status == 0) {
                            alert('系统正忙,可稍后再试哦~');
                        }
                        else {
                            alert('请求错误,code:' + xhr.status + ',' + xhr.statusText);
                        }
                        reject(reason);
                    });
                });
            };
            class_1.fetch = function (url, setting) {
                if (setting === void 0) { setting = {}; }
                return new DVAjax.Ajax().fetch(url, setting);
            };
            return class_1;
        }(Ajax));
        return DVAjax;
    }());
    exports.DVAjax = DVAjax;
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
