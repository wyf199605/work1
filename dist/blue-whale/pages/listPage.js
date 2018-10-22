define(["require", "exports", "BwRule", "BasicPage", "ButtonAction", "SwipeOut", "DataManager"], function (require, exports, BwRule_1, basicPage_1, ButtonAction_1, SwipeOut_1, DataManager_1) {
    "use strict";
    var sys = BW.sys;
    var tools = G.tools;
    var d = G.d;
    return /** @class */ (function (_super) {
        __extends(listPage, _super);
        function listPage(para) {
            var _this = _super.call(this, { 'subButtons': para.subButtons }) || this;
            _this.para = para;
            // mui.init();
            var pullScroll = d.query('.mui-scroll-wrapper .mui-scroll');
            var isListEnd;
            var searchInput = document.getElementById('searchInput');
            var currentSearchStr = '';
            var listDOM = document.querySelector('#content ul.mui-table-view');
            var listData = [];
            var currentListPage = 0;
            var pageLen = 10;
            // let slideButtons = document.getElementById('slideButtons');
            d.queryAll('#slideButtons [data-button-type]').forEach(function (button) {
                if (button.dataset.subType === 'delete') {
                    button.classList.add('mui-btn-red');
                }
                else {
                    button.classList.add('mui-btn-yellow');
                }
            });
            new DataManager_1.DataManager({
                render: function () {
                },
                page: {
                    size: 10,
                    container: d.query('#content'),
                    isPulldownRefresh: true,
                },
                ajax: {
                    fun: function (obj) {
                        return new Promise(function (resolve, reject) {
                            getList(obj.current + 1, obj.pageSize, currentSearchStr, function (response) {
                                console.log(response);
                                showList(response.data, currentSearchStr, !obj.isRefresh);
                                resolve({
                                    data: response.data,
                                    total: response.head.totalNum,
                                });
                            });
                        });
                    },
                    auto: true,
                }
            });
            // pullScroll.pullToRefresh({
            //     down: {
            //         callback: function () {
            //             pulldownRefresh(this);
            //         }
            //     },
            //     up: {
            //         callback: function () {
            //             pullupRrfresh(this);
            //         }
            //     }
            // });
            // if (mui.os.plus) {
            //     mui.plusReady(function () {
            //         setTimeout(function () {
            //             pullScroll.pullToRefresh().pullDownLoading();
            //         }, 100);
            //     });
            // } else {
            //     mui.ready(function () {
            //         pullScroll.pullToRefresh().pullDownLoading();
            //     });
            // }
            // window.addEventListener('refreshData', function () {
            //     pullScroll.pullToRefresh().pullDownLoading();
            // });
            function pulldownRefresh(pull) {
                currentListPage = 1;
                getList(currentListPage, pageLen, currentSearchStr, function (data) {
                    showList(data, currentSearchStr, false);
                    if (data.length < pageLen) {
                        isListEnd = true;
                        if (data.length === 0) {
                            currentListPage--;
                        }
                    }
                    else {
                        isListEnd = false;
                    }
                    pull.endPullDownToRefresh(isListEnd);
                    pull.endPullUpToRefresh(isListEnd);
                    //            if(isListEnd){
                    //                pull.refresh(true);
                    //            }
                });
            }
            function pullupRrfresh(pull) {
                currentListPage++;
                getList(currentListPage, pageLen, currentSearchStr, function (data) {
                    if (data.length < pageLen) {
                        isListEnd = true;
                        if (data.length === 0) {
                            currentListPage--;
                        }
                    }
                    else {
                        isListEnd = false;
                    }
                    showList(data, currentSearchStr, true);
                    pull.endPullUpToRefresh(isListEnd);
                });
            }
            searchInput.addEventListener('keypress', function (e) {
                if (e.charCode === 13) {
                    currentSearchStr = searchInput.value;
                    // pullScroll.pullToRefresh().pullDownLoading();
                }
            });
            //列表左滑动
            (function () {
                var disableListClick = false;
                var currentOpenedRightSlider;
                // 第二个demo，向左拖拽后显示操作图标，释放后自动触发的业务逻辑
                d.on(d.query('.mui-table-view'), 'click', '.mui-table-view-cell .mui-btn', function (event) {
                    var index = parseInt(this.parentNode.parentNode
                        .querySelector('[data-index]').dataset.index);
                    var selectedData = listData[index];
                    var button = this;
                    ButtonAction_1.ButtonAction.get().clickHandle(ButtonAction_1.ButtonAction.get().dom2Obj(button), selectedData, function () {
                        var li = button.parentNode.parentNode;
                        li.parentNode.removeChild(li);
                    });
                    event.stopPropagation();
                });
                // d.on(d.query('.mui-table-view'), 'slideleft', '.mui-table-view-cell', function () {
                //     disableListClick = true;
                //     currentOpenedRightSlider = this;
                // });
                d.on(d.query('#content .mui-table-view'), 'click', '.mui-slider-handle .mui-table-cell.mui-col-xs-11', function (e) {
                    if (!disableListClick) {
                        var self_1 = this;
                        sys.window.open({ url: this.dataset.href });
                        var dot = self_1.querySelector('.mui-badge.badge-dot.unread');
                        if (dot) {
                            dot.classList.add('hide');
                        }
                    }
                });
                document.addEventListener('click', function () {
                    if (disableListClick) {
                        disableListClick = false;
                        // mui.swipeoutClose(currentOpenedRightSlider);
                    }
                });
            })();
            (function () {
                var checkedNum = 0;
                var lastCheckbox = null;
                d.on(d.query('#content .mui-table-view'), 'click', '.mui-checkbox', function (e) {
                    var checkbox = this.querySelector('input[type=checkbox]');
                    if (lastCheckbox !== null
                        && lastCheckbox.parentNode.parentNode.dataset.index !==
                            checkbox.parentNode.parentNode.dataset.index) {
                        lastCheckbox.checked = false;
                    }
                    if (lastCheckbox === null || !checkbox.checked) {
                        checkedNum = 1;
                    }
                    else {
                        checkedNum = 0;
                    }
                    var opBtns = document.querySelector('footer.mui-bar-footer');
                    if (checkedNum === 0) {
                        opBtns.classList.add('vanish');
                    }
                    else if (checkedNum > 0 && opBtns.classList.contains('vanish')) {
                        opBtns.classList.remove('vanish');
                    }
                    lastCheckbox = checkbox;
                });
            })();
            d.on(d.query('body'), 'click', '[data-button-type]', function (e) {
                var selectedData = [];
                var button = this;
                if (button.dataset.subType === 'delete' || button.dataset.subType === 'update') {
                    var index = parseInt(button.parentNode.parentNode
                        .querySelector('[data-index]').dataset.index);
                    selectedData.push(listData[index]);
                }
                d.queryAll('.mui-table-view-cell .mui-checkbox input[type=checkbox]:checked').forEach(function (c) {
                    var index = parseInt(d.closest(c, '[data-index]').dataset.index);
                    selectedData.push(listData[index]);
                });
                ButtonAction_1.ButtonAction.get().clickHandle(ButtonAction_1.ButtonAction.get().dom2Obj(button), selectedData[0]);
            });
            function showList(list, searchStr, isAppend) {
                var len = list.length;
                var listDataLen;
                if (len === 0 && !isAppend) {
                    listDOM.innerHTML = document.getElementById("empty_div").innerHTML;
                    return;
                }
                if (!isAppend) {
                    listDataLen = 0;
                    listDOM.innerHTML = '';
                    listData = list;
                }
                else {
                    listDataLen = listData.length;
                    listData = listData.concat(list);
                }
                var _loop_1 = function (i, d_1) {
                    var buttons = G.d.queryAll('a.mui-btn', G.d.query('#slideButtons')).map(function (btn) { return btn.cloneNode(true); });
                    d_1 = Object.keys(list[i]).map(function (key) {
                        return tools.str.toEmpty(list[i][key]);
                    });
                    var mailTitle = void 0, p1 = void 0, p2 = void 0, url = tools.url.addObj(BwRule_1.BwRule.parseURL(para.linkDataAddr, list[i]), BwRule_1.BwRule.varList(para.linkVarList, list[i]));
                    var li = h("li", { className: "mui-table-view-cell", "data-mail-id": d_1[0] },
                        h("div", { className: "mui-slider-handle", style: "position: relative;" },
                            h("div", { "data-index": (listDataLen + i), className: "mui-table" },
                                h("label", { className: "mui-table-cell mui-col-xs-1 mui-checkbox" },
                                    h("input", { name: "checkbox1", value: "Item 1", type: "checkbox" })),
                                h("a", { "data-href": para.mgrPath + url, className: "mui-table-cell mui-col-xs-11" },
                                    h("h5", null,
                                        d_1[1] == 0 ?
                                            h("span", { class: "mui-badge badge-dot mui-badge-primary unread" }) : null,
                                        mailTitle = h("span", { class: "mail-title" }),
                                        h("span", { class: "mui-h5 pull-right" },
                                            d_1[3] != '' ? h("span", { class: "mui-icon mui-icon-paperclip" }) : null,
                                            h("span", { class: "mui-icon mui-icon-arrowright" }))),
                                    p1 = h("p", { class: "mui-h6 mui-ellipsis title" }),
                                    p2 = h("p", { class: "mui-h6 ellipsis-row2" })))));
                    mailTitle.innerHTML = tools.str.setHeightLight(d_1[2], searchStr, 'red');
                    p1.innerHTML = tools.str.setHeightLight(d_1[5], searchStr, 'red');
                    p2.innerHTML = tools.str.removeHtmlTags(d_1[6]);
                    listDOM.appendChild(li);
                    new SwipeOut_1.SwipeOut({
                        target: li,
                        right: buttons,
                    });
                    out_d_1 = d_1;
                };
                var out_d_1;
                for (var i = 0, d_1; i < len; i++) {
                    _loop_1(i, d_1);
                    d_1 = out_d_1;
                }
            }
            function getList(page, len, query, success) {
                var ajaxData = BwRule_1.BwRule.varList(para.tableVarList, {});
                ajaxData.pageparams = '{"index"=' + page + ', "size"=' + len + '}';
                if (!tools.isEmpty(query)) {
                    ajaxData.queryparam = query;
                }
                BwRule_1.BwRule.Ajax.fetch(para.tabledataAddr, {
                    data: ajaxData,
                }).then(function (_a) {
                    var response = _a.response;
                    success(response);
                });
                // Rule.ajax(para.tabledataAddr, {
                //     data: ajaxData,
                //     dataType: 'json',
                //     success: function (response) {
                //         success(response.data);
                //     }
                // });
            }
            return _this;
        }
        return listPage;
    }(basicPage_1.default));
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
