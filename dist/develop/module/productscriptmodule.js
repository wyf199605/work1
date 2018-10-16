/// <amd-module name="ProductScriptModule"/>
define("ProductScriptModule", ["require", "exports", "Button", "QueryDevicePage", "DVAjax", "Modal", "TextInput", "MountMenuModal"], function (require, exports, Button_1, QueryDevicePage_1, DVAjax_1, Modal_1, text_1, MountMenu_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    var ProductScriptModule = /** @class */ (function (_super) {
        __extends(ProductScriptModule, _super);
        function ProductScriptModule(para) {
            var _this = _super.call(this, para) || this;
            if (tools.isEmpty(para)) {
                para = {};
            }
            _this.init(para);
            return _this;
        }
        ProductScriptModule.prototype.wrapperInit = function () {
            return d.create("\n        <div class=\"productScript hide\">\n              <div class=\"buttons\"></div>\n        </div>\n        ");
        };
        ProductScriptModule.prototype.init = function (para) {
            this.initButtons();
            this.isSave = false;
        };
        Object.defineProperty(ProductScriptModule.prototype, "isSave", {
            get: function () {
                return this._isSave;
            },
            set: function (save) {
                this._isSave = save;
            },
            enumerable: true,
            configurable: true
        });
        ProductScriptModule.prototype.initButtons = function () {
            var _this = this;
            var saveBtn = new Button_1.Button({
                content: '保存',
                icon: 'de-baocunchenggong',
                iconPre: 'dev',
                container: d.query('.buttons', this.wrapper),
                className: 'save',
                onClick: function (e) {
                    var newItem = _this.handlerDataToItem();
                    var para = { type: 'list' };
                    if (tools.isNotEmpty(QueryDevicePage_1.QueryDevicePage.itemId)) {
                        para['update'] = [newItem];
                    }
                    else {
                        para['insert'] = [newItem];
                    }
                    // 新增/修改item
                    DVAjax_1.DVAjax.itemAddAndUpdateAjax(function (res) {
                        Modal_1.Modal.toast(res.msg);
                        _this.isSave = true;
                        if (QueryDevicePage_1.QueryDevicePage._allQDData[0]['itemId'] === '') {
                            QueryDevicePage_1.QueryDevicePage.itemId = res.data.itemId;
                        }
                    }, { type: 'POST', data: para });
                }
            });
            var previewBtn = new Button_1.Button({
                content: '预览',
                icon: 'de-yulan',
                iconPre: 'dev',
                container: d.query('.buttons', this.wrapper),
                className: 'preview',
                onClick: function (e) {
                    var itemId = QueryDevicePage_1.QueryDevicePage.itemId;
                    if (_this.isSave || itemId) {
                        DVAjax_1.DVAjax.itemInterface(itemId, function (res) {
                            if (res.errorCode === 0) {
                                var body = d.create('<div class="inputModal"></div>'), loginUrl_1 = res.data.sso.loginUrl, nodeId_1 = res.data.nodeId, userInput_1 = new text_1.TextInput({
                                    container: body,
                                    className: 'userInput'
                                });
                                var m_1 = new Modal_1.Modal({
                                    header: '请输入预览登录用户名',
                                    body: body,
                                    footer: {},
                                    isOnceDestroy: true,
                                    onOk: function () {
                                        var userId = userInput_1.get().replace(/\s+/g, '');
                                        if (tools.isEmpty(userId)) {
                                            Modal_1.Modal.alert('登录用户名不能为空!');
                                        }
                                        else {
                                            var url = tools.url.addObj(loginUrl_1, {
                                                userid: userId.toUpperCase(),
                                                forwardurl: 'commonui/pageroute?page=static%2Fmain'
                                            });
                                            url = url + ("#page=/ui/select/" + nodeId_1);
                                            window.open(url);
                                            m_1.destroy();
                                        }
                                    },
                                    onCancel: function () {
                                        m_1.destroy();
                                    }
                                });
                            }
                        }, function (error) {
                            var errorRes = JSON.parse(error.xhr.responseText);
                            var itemObj = _this.handlerDataToItem(), itemCaption = itemObj.sysItemList.captionSql;
                            Modal_1.Modal.confirm({
                                msg: errorRes.msg,
                                title: '预览提示',
                                btns: ['取消预览', '挂载菜单'],
                                callback: function (flag) {
                                    if (flag) {
                                        new MountMenu_1.MountMenuModal(itemId, itemCaption);
                                    }
                                }
                            });
                        });
                    }
                    else {
                        Modal_1.Modal.alert('请先保存当前数据！');
                    }
                }
            });
        };
        ProductScriptModule.prototype.handlerDataToItem = function () {
            var item = {
                sysItemList: {
                    queryType: 0,
                    queryCount: 0,
                    editExpress: '',
                    selectSql: '',
                    updateSql: '',
                    insertSql: '',
                    deleteSql: '',
                    noshowFields: '',
                    multiPageFlag: 1,
                    subselectSql: '',
                    showCheckbox: 0,
                    itemId: '',
                    itemType: 'list',
                    captionSql: '',
                    dataSource: '',
                    baseTable: '',
                    keyField: '',
                    nameField: '',
                    settingId: 7502,
                    pause: 0
                },
                sysItemElementRela: [],
                sysCondRela: []
            };
            var itemId = tools.isNotEmpty(QueryDevicePage_1.QueryDevicePage.itemId) ? QueryDevicePage_1.QueryDevicePage.itemId : '';
            for (var key in QueryDevicePage_1.QueryDevicePage._allQDData[0]) {
                if (item.sysItemList.hasOwnProperty(key)) {
                    item.sysItemList[key] = QueryDevicePage_1.QueryDevicePage._allQDData[0][key];
                }
            }
            for (var key in QueryDevicePage_1.QueryDevicePage._allQDData[1]) {
                if (item.sysItemList.hasOwnProperty(key)) {
                    item.sysItemList[key] = QueryDevicePage_1.QueryDevicePage._allQDData[1][key];
                }
            }
            var obj = QueryDevicePage_1.QueryDevicePage._allQDData[1]['cond'], condIndex = 1;
            var _loop_1 = function (key) {
                var arr = obj[key];
                var ctlType = 0;
                if (key === 'back') {
                    ctlType = 1;
                }
                if (tools.isNotEmpty(arr)) {
                    arr.forEach(function (cond) {
                        var obj = {
                            condId: cond.condId,
                            objType: 14,
                            ctlId: itemId,
                            ctlType: ctlType,
                            seqNo: condIndex,
                            pause: 0
                        };
                        item.sysCondRela.push(obj);
                        condIndex += 1;
                    });
                }
            };
            for (var key in obj) {
                _loop_1(key);
            }
            var elementIndex = 1;
            for (var key in QueryDevicePage_1.QueryDevicePage._allQDData[2]) {
                var arr = QueryDevicePage_1.QueryDevicePage._allQDData[2][key];
                if (tools.isNotEmpty(arr)) {
                    arr.forEach(function (element) {
                        var obj = {
                            itemId: itemId,
                            seqNo: elementIndex,
                            elementId: element.elementId,
                            pause: 0
                        };
                        item.sysItemElementRela.push(obj);
                        elementIndex += 1;
                    });
                }
            }
            return item;
        };
        Object.defineProperty(ProductScriptModule.prototype, "isShow", {
            set: function (isShow) {
                this._isShow = isShow;
                if (this._isShow) {
                    this.wrapper.classList.add('show');
                    this.wrapper.classList.remove('hide');
                }
                else {
                    this.wrapper.classList.remove('show');
                    this.wrapper.classList.add('hide');
                }
            },
            enumerable: true,
            configurable: true
        });
        return ProductScriptModule;
    }(Component));
    exports.ProductScriptModule = ProductScriptModule;
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
