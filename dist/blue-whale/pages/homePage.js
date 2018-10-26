define(["require", "exports", "menuMrg", "BwRule", "Search", "SlideTab"], function (require, exports, menuMrg_1, BwRule_1, search_1, slideTab_1) {
    "use strict";
    var sys = BW.sys;
    var CONF = BW.CONF;
    var tools = G.tools;
    var d = G.d;
    function menuElGet(menu) {
        return h("li", { style: "border-style: none", "data-favid": menu.favid, "data-href": menu.url, "data-gps": menu.gps, className: "mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-3" },
            h("a", null,
                h("span", { className: "mui-icon" + menu.icon }),
                h("div", { className: "mui-media-body" }, menu.caption)));
    }
    return /** @class */ (function () {
        function homePage(para) {
            var _this = this;
            this.para = para;
            console.log(para);
            var content = h("div", { class: "slide-panel-wrapper" });
            d.append(para.container, content);
            // 实例化Tab控件
            this.slideTab = new slideTab_1.SlideTab({
                tabParent: content,
                panelParent: content,
                onChange: function (index) {
                    console.log(index);
                    // if(index != 0 && this.slideTab.dataManagers){
                    //     let dataManager = this.slideTab.dataManagers[index];
                    //     if(dataManager){
                    //         dataManager.refresh();
                    //     }
                    // }
                },
                tabs: [
                    {
                        title: '首页',
                        dom: this.homeList = h("ul", { class: "mui-table-view mui-grid-view mui-grid-9 full-height has-header has-search" }),
                    },
                    {
                        title: '收藏',
                        dom: this.favoritesList = h("ul", { class: "mui-table-view mui-grid-view mui-grid-9 full-height has-header has-search" }),
                        dataManager: {
                            render: function (start, length, data, isRefresh) {
                                _this.initFavorList(data.slice(start, start + length), isRefresh);
                            },
                            isPulldownRefresh: true,
                            ajaxFun: function (obj) {
                                return new Promise(function (resolve, reject) {
                                    var ajaxData = {
                                        pageparams: '{"index"=' + obj.current + ', "size"=' + obj.pageSize + '}',
                                        action: 'query'
                                    };
                                    BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.menuFavor, {
                                        data: ajaxData
                                    }).then(function (_a) {
                                        var response = _a.response;
                                        console.log(response);
                                        resolve({
                                            data: response.data || [],
                                            total: response.head ? (response.head.totalNum || 0) : 0,
                                        });
                                        // fav.appendChild(fragment);
                                    });
                                });
                            }
                        }
                    },
                    {
                        title: '最近',
                        dom: this.recentList = h("ul", { class: "mui-table-view mui-grid-view mui-grid-9 full-height has-header has-search" }),
                        dataManager: {
                            render: function (start, length, data, isRefresh) {
                                _this.initRecentList(data.slice(start, start + length), isRefresh);
                            },
                            isPulldownRefresh: true,
                            ajaxFun: function (obj) {
                                return new Promise(function (resolve, reject) {
                                    var ajaxData = {
                                        pageparams: '{"index"=' + obj.current + ', "size"=' + obj.pageSize + '}',
                                        action: 'query'
                                    };
                                    BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.menuHistory, {
                                        data: ajaxData
                                    }).then(function (_a) {
                                        var response = _a.response;
                                        console.log(response);
                                        resolve({
                                            data: response.data || [],
                                            total: response.head ? (response.head.totalNum || 0) : 0
                                        });
                                        // fav.appendChild(fragment);
                                    });
                                });
                            }
                        }
                    }
                ],
            });
            // 添加样式
            var tabWrapper = this.slideTab.tabContainer, panelWrapper = this.slideTab.panelContainer;
            tabWrapper.className = tabWrapper.className +
                ' mui-slider-indicator mui-segmented-control mui-segmented-control-inverted';
            d.queryAll('li', tabWrapper).forEach(function (li) {
                li.classList.add('mui-control-item');
            });
            panelWrapper.classList.add('mui-slider-group');
            d.queryAll('.tab-pane', panelWrapper).forEach(function (el) {
                el.className = el.className + ' mui-slider-item mui-control-content mui-active';
            });
            // d.on(this.slideTab.panelContainer, 'touchmove', (e) => e.preventDefault());
            // 初始化首页数据
            this.initHomeList(para.homeData);
            d.on(panelWrapper, 'click', 'li[data-href]', function () {
                sys.window.open({ url: this.dataset.href, gps: !!parseInt(this.dataset.gps) });
                // if (this.querySelector('.badge-red')) {
                //     localStorage.oldVersion = localStorage.updateVersion;
                //     // badgeDot.classList.add("badge-none");
                // }
            });
            // let pull1 = false, pull2 = false;
            // document.getElementById('slider').addEventListener('slide', function (e: CustomEvent) {
            //     let num = e.detail.slideNumber;
            //     if (num === 1) {
            //         pull(pull1, num, mui('#favorites .mui-scroll-wrapper .mui-scroll'),
            //             document.querySelector('#favorites ul.mui-table-view'), CONF.ajaxUrl.menuFavor);
            //     } else if (num === 2) {
            //         pull(pull2, num, mui('#recent .mui-scroll-wrapper .mui-scroll'),
            //             document.querySelector('#recent ul.mui-table-view'), CONF.ajaxUrl.menuHistory);
            //     }
            // });
            //
            // function pull(pullNum, num, initDom, ulDom, ajaxUrl) {
            //     if (!pullNum) {
            //         if (num === 1) {
            //             pull1 = true;
            //         } else {
            //             pull2 = true;
            //         }
            //         pullNum = initPullScroll(initDom, ulDom, ajaxUrl);
            //         window.parent.addEventListener('refreshHomeData', function () {
            //             if (pullNum) {
            //                 pullNum.pullUpRefresh();
            //             }
            //         });
            //     }
            // }
            d.on(d.query('.tab-pane[data-index="1"]', panelWrapper), 'press', 'li.mui-table-view-cell', function () {
                var type = 'cancel';
                menuMrg_1.MENU_FAVORITE.toggleFavSheet(this, type, {
                    favid: this.dataset.favid,
                    link: this.dataset.href
                });
            });
            /* //升级通告角标提示
             let badgeDot = document.querySelector('.badge-red');
             localStorage.updateVersion = "${appVersion.version_no}";
     //    localStorage.oldVersion = "1";
             if (localStorage.oldVersion !== localStorage.updateVersion && badgeDot) {
                 badgeDot.classList.remove("badge-none");
             }
             else if (badgeDot) {
                 badgeDot.classList.add("badge-none");
             }*/
            /**
             *
             * @param muiScollDom
             * @param {Element} ulDom
             * @param {string} ajaxUrl
             */
            // function initPullScroll(muiScollDom, ulDom, ajaxUrl) {
            //     let currentListPage = 0;
            //     let pageLen = 24;
            //
            //     let pullConf = {
            //         down: {
            //             callback: function () {
            //                 down(this);
            //             }
            //         },
            //         up: {
            //             contentnomore: '',
            //             callback: function () {
            //                 up(this);
            //             }
            //         }
            //     };
            //     muiScollDom.pullToRefresh(pullConf);
            //     muiScollDom.pullToRefresh().pullUpLoading();
            //
            //     function up(pull) {
            //         let isListEnd;
            //         currentListPage++;
            //         getMenuList(ajaxUrl, currentListPage, pageLen, ulDom, function (data) {
            //             if (data.length < pageLen) {
            //                 isListEnd = true;
            //                 if (data.length == 0) {
            //                     currentListPage--;
            //                 }
            //             } else {
            //                 isListEnd = false;
            //             }
            //             pull.endPullUpToRefresh(isListEnd);
            //         }, function () {
            //             currentListPage--;
            //             pull.endPullUpToRefresh(true);
            //         });
            //     }
            //
            //     function down(pull) {
            //         let isListEnd;
            //         currentListPage = 1;
            //         getMenuList(ajaxUrl, currentListPage, pageLen, ulDom, function (data) {
            //             if (data.length < pageLen) {
            //                 isListEnd = true;
            //                 if (data.length == 0) {
            //                     currentListPage--;
            //                 }
            //             } else {
            //                 isListEnd = false;
            //             }
            //             pull.endPullDownToRefresh();
            //             pull.endPullUpToRefresh(isListEnd);
            //             if (!isListEnd) {
            //                 pull.refresh(true);
            //             }
            //
            //         }, function () {
            //             currentListPage--;
            //             pull.endPullDownToRefresh(true);
            //             pull.endPullUpToRefresh(true);
            //         });
            //     }
            //
            //     return {
            //         pullUpRefresh: function () {
            //             currentListPage = 0;
            //             ulDom.innerHTML = '';
            //             muiScollDom.pullToRefresh().refresh(true);
            //             muiScollDom.pullToRefresh().pullUpLoading();
            //
            //         }
            //     }
            // }
            //         function getMenuList(url, page, len, ulDom, success, error) {
            //             let ajaxData = {
            //                 pageparams: '{"index"=' + page + ', "size"=' + len + '}',
            //                 action: 'query'
            //             };
            //
            //             BwRule.Ajax.fetch(url, {
            //                 data: ajaxData
            //             }).then(({response}) => {
            //                 if (page === 1) {
            //                     ulDom.innerHTML = '';
            //                     if (response.data.length === 0) {
            //                         ulDom.nextElementSibling.classList.remove('hide');
            //                     }
            //                     else {
            //                         ulDom.nextElementSibling.classList.add('hide');
            //                     }
            //                 }
            //                 let tmpDocument = document.createDocumentFragment();
            //                 //最近
            //                 if (url === CONF.ajaxUrl.menuHistory) {
            //                     response.data.forEach(function (d) {
            //                         if (d.url) {
            //                             d.url = CONF.siteUrl + d.url;
            //                         }
            //                         // tmpDocument.appendChild(G.d.create(tools.str.parseTpl(menuTplStr, d), 'ul'));
            //                         tmpDocument.appendChild(menuElGet(d));
            //                     });
            //                     ulDom.appendChild(tmpDocument);
            //                 }
            //                 else {
            //                     //空收藏显示暂无数据
            //                     if (response.data.length === 1) {
            //                         if (response.data[0].favs.length === 0) {
            //                             ulDom.nextElementSibling.classList.remove('hide');
            //                         }
            //                     }
            //                     let fav = document.querySelector('#favorites ul.mui-table-view'),
            //                         fragment = document.createDocumentFragment();
            //
            //                     response.data.forEach(function (d) {
            //                         d.favs.forEach(function (d) {
            //                             if (d.url) {
            //                                 d.url = CONF.siteUrl + d.url;
            //                             }
            //                             tmpDocument.appendChild(menuElGet(d));
            //                         });
            //                         let p = document.createElement("span"),
            //                             div = document.createElement("div"),
            //                             title = document.createElement("div"),
            //                             span = document.createElement("span");
            //                         if (d.tag === "") {
            //                             if (d.favs.length != 0) {
            //                                 p.innerText = "默认分组";
            //                             }
            //                         }
            //                         else {
            //                             p.innerText = d.tag;
            //                         }
            //                         p.setAttribute("class", "conFavGroup");
            //                         span.setAttribute("class", "editBook mui-icon mui-icon-compose");
            //                         span.setAttribute("data-edit", d.tag);
            //                         title.appendChild(p);
            //                         title.appendChild(span);
            //                         div.appendChild(title);
            //                         div.appendChild(tmpDocument);
            //                         fragment.appendChild(div);
            //                         let editBook = div.querySelector('.editBook');
            //                         editBook.addEventListener('tap', function () {
            //                             let txt_edit = document.querySelector('.txt_edit') as HTMLInputElement,
            //                                 pValue = p.innerHTML;
            //                             mui(MENU_FAVORITE.favEditDom).popover('toggle');
            //                             // G.d.query('.favEdit', document.body).classList.add('mui-active');
            // //                               txt_edit.focus();
            //                             if (this.dataset.edit === "") {
            //                                 txt_edit.value = "默认分组";
            //                             }
            //                             else {
            //                                 txt_edit.value = pValue;
            //                             }
            //                             MENU_FAVORITE.valueObtain = pValue;
            //                             MENU_FAVORITE.parentNode = this;
            //                             if (MENU_FAVORITE.funcNumber) {
            //                                 MENU_FAVORITE.toggleConGroup();
            //                                 MENU_FAVORITE.toggleEditGroup();
            //                                 MENU_FAVORITE.funcNumber = false;
            //                             }
            //
            //                         });
            //                     });
            //                     fav.appendChild(fragment);
            //                 }
            //                 success(response.data);
            //             }).catch(() => {
            //                 error();
            //             });
            //         }
            sys.window.close = double_back;
            sys.window.wake("refreshHomeData", null);
            new search_1.Search({
                nodeId: para.nodeId,
                baseUrl: para.baseUrl,
                searchBtn: para.searchBtn
            });
        }
        homePage.prototype.initHomeList = function (data) {
            var _this = this;
            data && tools.toArray(data).forEach(function (item) {
                d.append(_this.homeList, homePage.createHomeList(item));
            });
            this.homeList.classList.toggle('no-data', this.homeList.innerHTML === '');
        };
        homePage.prototype.initRecentList = function (data, isRefresh) {
            var _this = this;
            if (isRefresh === void 0) { isRefresh = false; }
            if (isRefresh) {
                this.recentList.innerHTML = '';
            }
            data.forEach(function (item) {
                if (item.url) {
                    item.url = CONF.siteUrl + item.url;
                }
                // tmpDocument.appendChild(G.d.create(tools.str.parseTpl(menuTplStr, d), 'ul'));
                d.append(_this.recentList, menuElGet(item));
            });
            this.recentList.classList.toggle('no-data', this.recentList.innerHTML === '');
        };
        homePage.prototype.initFavorList = function (data, isRefresh) {
            var _this = this;
            if (isRefresh === void 0) { isRefresh = false; }
            if (isRefresh) {
                this.favoritesList.innerHTML = '';
            }
            data.forEach(function (d) {
                var p = document.createElement("span"), div = document.createElement("div"), title = document.createElement("div"), span = document.createElement("span");
                if (d.tag === "") {
                    if (d.favs.length != 0) {
                        p.innerText = "默认分组";
                    }
                }
                else {
                    p.innerText = d.tag;
                }
                p.setAttribute("class", "conFavGroup");
                span.setAttribute("class", "editBook mui-icon mui-icon-compose");
                span.setAttribute("data-edit", d.tag);
                title.appendChild(p);
                title.appendChild(span);
                div.appendChild(title);
                d.favs.forEach(function (d) {
                    if (d.url) {
                        d.url = CONF.siteUrl + d.url;
                    }
                    div.appendChild(menuElGet(d));
                });
                _this.favoritesList.appendChild(div);
                var editBook = div.querySelector('.editBook');
                editBook.addEventListener('click', function () {
                    var txt_edit = document.querySelector('.txt_edit'), pValue = p.innerHTML;
                    menuMrg_1.popoverToggle(menuMrg_1.MENU_FAVORITE.favEditDom);
                    // mui().popover('toggle');
                    //                               txt_edit.focus();
                    if (this.dataset.edit === "") {
                        txt_edit.value = "默认分组";
                    }
                    else {
                        txt_edit.value = pValue;
                    }
                    menuMrg_1.MENU_FAVORITE.valueObtain = pValue;
                    menuMrg_1.MENU_FAVORITE.parentNode = this;
                    if (menuMrg_1.MENU_FAVORITE.funcNumber) {
                        menuMrg_1.MENU_FAVORITE.toggleConGroup();
                        menuMrg_1.MENU_FAVORITE.toggleEditGroup();
                        menuMrg_1.MENU_FAVORITE.funcNumber = false;
                    }
                });
            });
            console.log(this.favoritesList.innerHTML === '');
            this.favoritesList.classList.toggle('no-data', this.favoritesList.innerHTML === '');
        };
        homePage.createHomeList = function (menu) {
            return h("li", { "data-href": BW.CONF.siteUrl + menu.menuPath.dataAddr, "data-gps": menu.menuPath.needGps, class: "mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-3" },
                h("a", null,
                    h("span", { className: 'mui-icon' + ' ' + menu.menuIcon }),
                    h("div", { class: "mui-media-body" }, menu.menuName)));
        };
        return homePage;
    }());
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
