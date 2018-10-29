import {BwRule} from "../../common/rule/BwRule";
import sys = BW.sys;
import tools = G.tools;
import d = G.d;
import BasicPage from "../basicPage";
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
import {SwipeOut} from "../../../global/components/other/SwipeOut/SwipeOut";
import {DataManager} from "../../../global/components/DataManager/DataManager";

export = class listPage extends BasicPage {
    constructor(private para) {
        super({'subButtons': para.subButtons});
        // mui.init();
        let pullScroll = d.query('.mui-scroll-wrapper .mui-scroll');
        let isListEnd;
        let searchInput = document.getElementById('searchInput') as HTMLInputElement;
        let currentSearchStr = '';
        let listDOM = document.querySelector('#content ul.mui-table-view');
        let listData = [];
        let currentListPage = 0;
        let pageLen = 10;
        // let slideButtons = document.getElementById('slideButtons');
        d.queryAll('#slideButtons [data-button-type]').forEach(button => {
            if (button.dataset.subType === 'delete') {
                button.classList.add('mui-btn-red');
            } else {
                button.classList.add('mui-btn-yellow');
            }
        });

        new DataManager({
            render: () => {

            },
            page: {
                size: 10,
                container: d.query('#content'),
                isPulldownRefresh: true,
            },
            ajax: {
                fun: (obj) => {
                    return new Promise<{data: obj[], total: number}>((resolve, reject) => {
                        getList(obj.current + 1, obj.pageSize, currentSearchStr, function (response) {
                            console.log(response);
                            showList(response.data, currentSearchStr, !obj.isRefresh);
                            resolve({
                                data: response.data,
                                total: response.head.totalNum,
                            })
                        });
                    })
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
                } else {
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
                } else {
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
            let disableListClick = false;
            let currentOpenedRightSlider;
            // 第二个demo，向左拖拽后显示操作图标，释放后自动触发的业务逻辑
            d.on(d.query('.mui-table-view'), 'click', '.mui-table-view-cell .mui-btn', function (event) {
                let index = parseInt(((this.parentNode.parentNode as HTMLElement)
                    .querySelector('[data-index]') as HTMLElement).dataset.index);
                let selectedData = listData[index];
                let button = this;
                ButtonAction.get().clickHandle(ButtonAction.get().dom2Obj(button), selectedData, function () {
                    let li = button.parentNode.parentNode;
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
                    let self = this;
                    sys.window.open({url: this.dataset.href});
                    let dot = self.querySelector('.mui-badge.badge-dot.unread');
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
            let checkedNum = 0;
            let lastCheckbox = null;
            d.on(d.query('#content .mui-table-view'), 'click', '.mui-checkbox', function (e) {
                let checkbox = this.querySelector('input[type=checkbox]') as HTMLInputElement;
                if (lastCheckbox !== null
                    && lastCheckbox.parentNode.parentNode.dataset.index !==
                    (checkbox.parentNode.parentNode as HTMLElement).dataset.index) {
                    lastCheckbox.checked = false;
                }
                if (lastCheckbox === null || checkbox.checked) {
                    checkedNum = 1;
                } else {
                    checkedNum = 0;
                }
                let opBtns = document.querySelector('footer.mui-bar-footer');
                if (checkedNum === 0) {
                    opBtns.classList.add('vanish');
                } else if (checkedNum > 0 && opBtns.classList.contains('vanish')) {
                    opBtns.classList.remove('vanish');
                }
                lastCheckbox = checkbox;
            });
        })();
        d.on(d.query('body'), 'click', '[data-button-type]', function (e) {
            let selectedData = [];
            let button = this;
            if (button.dataset.subType === 'delete' || button.dataset.subType === 'update') {
                let index = parseInt(((button.parentNode.parentNode as HTMLElement)
                    .querySelector('[data-index]') as HTMLElement).dataset.index);
                selectedData.push(listData[index]);
            }
            d.queryAll('.mui-table-view-cell .mui-checkbox input[type=checkbox]:checked').forEach(c => {
                let index = parseInt(d.closest(c, '[data-index]').dataset.index);
                selectedData.push(listData[index]);
            });
            ButtonAction.get().clickHandle(ButtonAction.get().dom2Obj(button), selectedData[0]);
        });

        function showList(list, searchStr, isAppend) {
            let len = list.length;
            let listDataLen;
            if (len === 0 && !isAppend) {
                listDOM.innerHTML = document.getElementById("empty_div").innerHTML;
                return;
            }
            if (!isAppend) {
                listDataLen = 0;
                listDOM.innerHTML = '';
                listData = list;
            } else {
                listDataLen = listData.length;
                listData = listData.concat(list);
            }

            for (let i = 0, d; i < len; i++) {
                let buttons = G.d.queryAll('a.mui-btn', G.d.query('#slideButtons')).map(btn => btn.cloneNode(true));
                d = Object.keys(list[i]).map(function (key) {
                    return tools.str.toEmpty(list[i][key]);
                });
                let mailTitle, p1, p2,
                    url = tools.url.addObj(BwRule.parseURL(para.linkDataAddr, list[i]), BwRule.varList(para.linkVarList, list[i]));

                let li = <li className="mui-table-view-cell" data-mail-id={d[0]}>
                        <div className="mui-slider-handle" style="position: relative;">
                            <div data-index={(listDataLen + i)} className="mui-table">
                                <label className="mui-table-cell mui-col-xs-1 mui-checkbox">
                                    <input name="checkbox1" value="Item 1" type="checkbox"/>
                                </label>
                                <a data-href={para.mgrPath + url} className="mui-table-cell mui-col-xs-11">
                                    <h5>
                                        {d[1] == 0 ?
                                            <span class="mui-badge badge-dot mui-badge-primary unread"/> : null}
                                        {mailTitle = <span class="mail-title"/>}
                                        <span class="mui-h5 pull-right">
                                        {d[3] != '' ? <span class="mui-icon mui-icon-paperclip"/> : null}
                                            <span class="mui-icon mui-icon-arrowright"/>
                                    </span>
                                    </h5>
                                    {p1 = <p class="mui-h6 mui-ellipsis title"/>}
                                    {p2 = <p class="mui-h6 ellipsis-row2"/>}
                                </a>
                            </div>
                        </div>
                    </li>;

                mailTitle.innerHTML = tools.str.setHeightLight(d[2], searchStr, 'red');
                p1.innerHTML = tools.str.setHeightLight(d[5], searchStr, 'red');
                p2.innerHTML = tools.str.removeHtmlTags(d[6]);
                listDOM.appendChild(li);
                new SwipeOut({
                    target: li,
                    right: buttons as HTMLElement[],
                });
            }
        }

        function getList(page, len, query, success) {
            let ajaxData: obj = BwRule.varList(para.tableVarList, {});
            ajaxData.pageparams = '{"index"=' + page + ', "size"=' + len + ', "total"=1}';
            if (!tools.isEmpty(query)) {
                ajaxData.queryparam = query;
            }
            BwRule.Ajax.fetch(para.tabledataAddr, {
                data: ajaxData,
            }).then(({response}) => {
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
    }
}