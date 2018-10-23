define("Search", ["require", "exports", "Modal", "Spinner", "BwRule"], function (require, exports, Modal_1, spinner_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="Search"/>
    var d = G.d;
    var CONF = BW.CONF;
    var sys = BW.sys;
    var Search = /** @class */ (function () {
        function Search(para) {
            this.para = para;
            /**
             * 查询
             * @param value
             */
            this.ajax = new BwRule_1.BwRule.Ajax();
            this.searchInit(para);
        }
        Search.prototype.searchInit = function (para) {
            var _this = this;
            //查询按钮
            d.on(para.searchBtn, 'click', function () {
                if (!_this.modal) {
                    _this.modal = new Modal_1.Modal({
                        header: '查询',
                        footer: {},
                        body: _this.searchTpl(),
                    });
                    _this.modal.bodyWrapper.classList.add('modal-search');
                    var searchInput_1 = d.query('.searchInput', _this.modal.bodyWrapper), closeBtn_1 = searchInput_1.nextElementSibling;
                    //搜索
                    _this.input(searchInput_1, closeBtn_1);
                    searchInput_1 && setTimeout(function () {
                        d.on(closeBtn_1, 'click', function (e) {
                            searchInput_1.value = '';
                            closeBtn_1.classList.add('mui-hidden');
                        });
                    }, 1000);
                    //content页面生成
                    _this.modal.bodyWrapper.appendChild(_this.contentTpl());
                    // mui('.mui-scroll').scroll();
                    (function () {
                        d.on(d.query('#menuSearch'), 'click', 'li.mui-table-view-cell[data-href]', function () {
                            sys.window.open({ url: CONF.siteUrl + this.dataset.href });
                        });
                        // mui('#menuSearch').on('longtap', 'li.mui-table-view-cell', function () {
                        //     let type = tools.isEmpty(this.dataset.favid) ? 'add' : 'cancel';
                        //     MENU_FAVORITE.toggleFavSheet(this, type, {
                        //         favid : this.dataset.favid,
                        //         link : this.dataset.href
                        //     });
                        // });
                    }());
                }
                else {
                    _this.modal.isShow = true;
                }
            });
        };
        /**
         * 键入搜索
         * @param searchInput 搜索输入框dom
         * @param closeBtn 清空图标dom
         */
        Search.prototype.input = function (searchInput, closeBtn) {
            var _this = this;
            var timer = null;
            d.on(searchInput, 'input', function () {
                var value = searchInput.value;
                if (value !== '') {
                    closeBtn.classList.remove('mui-hidden');
                }
                else {
                    closeBtn.classList.add('mui-hidden');
                }
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function () {
                    _this.search(value);
                    timer = null;
                }, 300);
            });
        };
        /**
         * ui构造
         * @param para
         * @param msg   错误信息
         */
        Search.prototype.uiMake = function (para, msg) {
            var _this = this;
            var ul = d.query('#menuSearch', this.modal.bodyWrapper), fragment = document.createDocumentFragment();
            if (para && para[0]) {
                para.forEach(function (obj) {
                    fragment.appendChild(_this.liTpl(obj));
                });
            }
            else {
                fragment.appendChild(d.create("<li class=\"no-data\">\u6682\u65E0\u6570\u636E</li>"));
            }
            ul.appendChild(fragment);
        };
        Search.prototype.search = function (value) {
            var _this = this;
            console.log('sear');
            if (value === '') {
            }
            else {
                var ul = d.query('#menuSearch', this.modal.bodyWrapper);
                ul.innerHTML = null;
                if (!this.spinner) {
                    this.spinner = new spinner_1.Spinner({
                        el: ul,
                        type: spinner_1.Spinner.SHOW_TYPE.append
                    });
                }
                this.spinner.show();
                var url = CONF.siteUrl + this.para.baseUrl + 'currentNode=' + this.para.nodeId + '&keywords=' + value;
                this.ajax.fetch(url, {
                    type: 'POST',
                    cache: true
                }).then(function (_a) {
                    var response = _a.response;
                    _this.uiMake(response.body.bodyList, response.msg);
                }).finally(function () {
                    _this.spinner.hide();
                });
            }
        };
        /**
         * 初始化搜索框
         * @returns {HTMLElement}
         */
        Search.prototype.searchTpl = function () {
            return d.create("<div class=\"search-input mui-input-row\">\n        <label><span class=\"mui-icon mui-icon-search grey\"></span></label>\n        <input type=\"text\" placeholder=\"\u641C\u7D22\u529F\u80FD\u540D\u79F0\" class=\"searchInput mui-input-clear mui-input\" autocapitalize=\"off\" autocorrect=\"off\">\n        <span class=\"mui-icon mui-icon-clear mui-hidden\"></span>\n        </div>");
        };
        /**
         * 容器
         * @returns {HTMLElement}
         */
        Search.prototype.contentTpl = function () {
            return d.create("<div class=\"mui-content  mui-scroll-wrapper search-content\">\n             <div class=\"mui-scroll search-scroll\">\n               <ul id=\"menuSearch\" class=\"mui-table-view mui-grid-view mui-grid-9\">\n              \n               </ul>\n           </div>\n    </div>");
        };
        Search.prototype.liTpl = function (obj) {
            var menuPath = obj.menuItem.menuPath;
            return d.create(" <li class=\"mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-3\" data-href=\"" + menuPath.dataAddr + "\" data-gps=\"" + menuPath.needGps + "\" data-favid=\"" + obj.menuItem.favid + "\">\n                    <a href=\"javascript:void(0)\">\n                        <span class=\"mui-icon " + obj.menuItem.menuIcon + "\">\n                        </span>\n                        <div class=\"mui-media-body\">" + obj.menuItem.menuName + "</div>\n                    </a>\n                </li>");
        };
        return Search;
    }());
    exports.Search = Search;
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

/// <reference path="Config.ts"/>
/// <reference path="common/sys/sys.ad.ts"/>
/// <reference path="common/sys/sys.h5.ts"/>
/// <reference path="common/sys/sys.ip.ts"/>
/// <reference path="common/sys/sys.pc.ts"/>
/// <reference path="common/sys/sysHistory.pc.ts"/>
/// <reference path="common/sys/sysPage.pc.ts"/>
/// <reference path="common/sys/sysTab.pc.ts"/>
/// <reference path="common/sys/sys.ts"/>
