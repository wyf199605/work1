import tools = G.tools;
import d = G.d;
import sys = BW.sys;
import CONF = BW.CONF;
import { BwRule } from "../../common/rule/BwRule";
import { DataManager } from "../../../global/components/DataManager/DataManager";
import { Loading } from "../../../global/components/ui/loading/loading";
/**
 * 树构造数据有三种情况
 * 1.有levelField ，每次点击再加载数据，根据treeField构造,如：收件人
 * 2.levelField为空，recursion = 0 ，后台数据一次性给前端，根据treeField构造
 * 3.levelField为空，recursion = 1，后台数据一次性给前端，此时TreeFields必须正好是三个字段：主键字段，父字段，标题字段。
 */
interface contactsPagePara {
    levelField,
    treeField,
    fromField,
    multValue,
    otherField,
    recursion: number, //0不是，1是TreeFields必须正好是三个字段：主键字段，父字段，标题字段。
    dom,
    dataAddr: R_ReqAddr;
    isDev?: boolean;
}
let clickEvent = tools.isMb ? 'click' : 'click';

export = class contactsPage {
    private response;
    constructor(private para: contactsPagePara) {
        let self = this,
            list = d.query('#list');
        //传给后台参数
        let tmpName = '__HIGHLIGHT_NAME__';
        list.style.height = '100%';
        list.style.overflow = 'auto';
        list.style.position = 'relative';
        let levelField = para.levelField.split(',').map(function (v, i, a) {
            return v.toUpperCase();
        });
        //树等级
        let treeField = para.treeField.split(',').map(function (v, i, a) {
            return v.toUpperCase();
        });
        d.on(d.query('#list .mui-table-view'), clickEvent, '.mui-table-view-cell[data-user-id]', function (event) {
            BW.sys && BW.sys.window.open({
                url: tools.url.addObj(CONF.url.myself, {
                    userid: this.dataset.userId
                })
            });
        });
        //
        let fromField = para.fromField;

        let dataManager: DataManager;

        let picker = (function () {
            let localData = localStorage.getItem('fromPickData'),
                ajaxUrl = CONF.siteUrl + BwRule.reqAddr(para.dataAddr, localData ? JSON.parse(localData) : null),
                page = 0,
                len = 20,
                queryData = { queryparam: '', pageparams: '' };

            //一开始加载
            getList(ajaxUrl, queryData, function (response) {
                showList(list, 0, response.data);
            });

            let hasOpen;
            function hasShow(target: HTMLElement) {
                let tarPar = target;
                if (tarPar.classList.contains('mui-active')) {
                    tarPar.classList.remove('mui-active');
                }
                else {
                    tarPar.classList.add('mui-active');
                }
            }

            d.on(list, clickEvent, '.mui-table-view-cell.mui-collapse a', function () {
                setTimeout(() => {
                    if (typeof hasOpen === 'undefined') {
                        hasOpen = this.parentElement.classList.contains('mui-active');
                    }

                    if (!hasOpen) {
                        hasShow(this.parentElement);
                    }
                }, 0);
            });

            d.on(list, clickEvent, '.mui-table-view-cell a.notLoad[data-query]', function () {
                let tapThis = this;
                function getLevelQuery(dom: HTMLElement, query = '') {
                    let parent = d.closest(dom.parentElement, 'li.mui-table-view-cell', list),
                        queryDom = d.query('[data-query]', dom),
                        queryStr = query ? query + '&' + queryDom.dataset.query : queryDom.dataset.query;

                    if (parent) {
                        return getLevelQuery(parent, queryStr)
                    } else {
                        return queryStr;
                    }
                }
                let url = '';
                let parseQuery = function (query) {
                    let reg = /([^=&\s]+)[=\s]*([^&\s]*)/g;
                    let obj = {};
                    while (reg.exec(query)) {
                        obj[RegExp.$1] = RegExp.$2;
                    }
                    return obj;
                };
                if (self.para.isDev) {
                    let forwardurl = tools.url.getPara('forwardurl', ajaxUrl),
                        addr = ajaxUrl.split('&forwardurl')[0],
                        queryStr = getLevelQuery(tapThis.parentElement),
                        queryObj = parseQuery(queryStr);
                    url = tools.url.addObj(addr, {
                        forwardurl: tools.url.addObj(forwardurl, Object.assign({}, queryObj, {
                            isMb: true,
                            output: "json"
                        }))
                    })
                } else {
                    url = ajaxUrl + (~ajaxUrl.indexOf('?') ? '&' : '?') + getLevelQuery(tapThis.parentElement);
                }

                //数据一次性加载时
                if (self.para.levelField === '') {
                    if (showList(tapThis.parentNode, parseInt(tapThis.dataset.level) + 1, self.response.data, null)) {
                        tapThis.classList.remove('notLoad');
                    }
                } else {
                    getList(url, queryData, function (response) {
                        if (showList(tapThis.parentNode, parseInt(tapThis.dataset.level) + 1, response.data, null)) {
                            tapThis.classList.remove('notLoad');
                        }
                    });
                }
            });

            inputOnChange(function (search) {
                let inputValue: string = search.value, vLen = inputValue.length;
                if (vLen === 0 || (/\S/).test(inputValue[vLen - 1])) {
                    page = 1;
                    list.querySelector('ul.mui-table-view').innerHTML = '<li class="mui-table-view-cell" style="text-align: center"> <span class="mui-spinner" style="vertical-align: bottom;"></span> </li>';
                    dataManager && dataManager.destroy();
                    if (vLen === 0) {
                        // pullScroll.pullRefresh().disablePullupToRefresh();
                        queryData = { queryparam: '', pageparams: '' }
                        dataManager = null;
                        getList(ajaxUrl, queryData, function (response) {
                            let level = treeField.length - 1;
                            if (queryData.queryparam) {
                                level = treeField.length - 1;
                                list.classList.add('search');
                            }
                            else {
                                level = 0;
                                list.classList.remove('search');
                            }

                            let isEnd = response.data.length < page;
                            // pullScroll.pullRefresh().endPullupToRefresh(isEnd);
                            showList(list, level, response.data);
                        });
                    } else {
                        queryData.queryparam = inputValue.toUpperCase().replace(/'/g, '');
                        dataManager = new DataManager({
                            isMb: true,
                            render: (e) => {
                            },
                            page: {
                                size: len,
                                container: list
                            },
                            ajax: {
                                auto: true,
                                fun: (obj) => {
                                    queryData.pageparams = '{"index"=' + (obj.current + 1) + ', "size"=' + obj.pageSize + '}';

                                    return new Promise<{ data: obj[]; total: number; }>((resolve, reject) => {
                                        getList(ajaxUrl, queryData, function (response) {
                                            let level = treeField.length - 1;
                                            if (queryData.queryparam) {
                                                level = treeField.length - 1;
                                                list.classList.add('search');
                                            }
                                            else {
                                                level = 0;
                                                list.classList.remove('search');
                                            }

                                            showList(list, level, response.data, obj.current !== 0);
                                            resolve({
                                                data: response.data,
                                                total: 1000,
                                            })
                                        });
                                    })
                                }
                            }
                        });
                    }
                }
            });


            function getList(url, ajaxData, callback) {
                let queryparam = ajaxData.queryparam;
                BwRule.Ajax.fetch(url, {
                    cache: true,
                    data: ajaxData,
                }).then(({ response }) => {
                    /**
                     * 如果是搜索，则直接显示叶子，并且显示数据的前6项
                     */
                    let searchInput = document.getElementById('searchInput') as HTMLInputElement,
                        value = searchInput.value;
                    // if (typeof queryparam !== 'undefined' && value.toLowerCase() !== queryparam.toLowerCase()) {
                    //     return;
                    // }
                    self.response = response;
                    let res = G.tools.obj.merge(true, response);
                    if (ajaxData.queryparam) {
                        let level = treeField.length - 1,
                            tmpData = []; //

                        res.data.forEach(function (d) {
                            let str = '',
                                data = G.tools.obj.merge(true, d),
                                tmpArr = Object.keys(data).map(function (key) {
                                    return G.tools.str.toEmpty(data[key]);
                                }),
                                arrLen = tmpArr.length;

                            tmpArr.forEach(function (t, i) {
                                //设置高亮
                                //                                if(i <= 2){
                                t = tools.highlight(t, ajaxData.queryparam, 'red');
                                //                                }
                                str += t;
                                //换行
                                if (i === 2) {
                                    str += '<br>';
                                } else if (i < arrLen - 1) {
                                    str += ', ';
                                }
                            });
                            data[tmpName] = str;
                            tmpData.push(data);
                        });
                        res.data = tmpData;
                    }
                    callback(res);
                }).finally(() => {
                    // loading.hide();
                });
            }

            function loadSearch(callback) {
                if (queryData.queryparam) {
                    page++;
                    queryData.pageparams = '{"index"=' + page + ', "size"=' + len + '}';
                } else {
                    // pullScroll.pullRefresh().disablePullupToRefresh();
                }

                getList(ajaxUrl, queryData, function (response) {
                    let isEnd,
                        level = treeField.length - 1;
                    if (queryData.queryparam) {
                        level = treeField.length - 1;
                        list.classList.add('search');
                    } else {
                        level = 0;
                        list.classList.remove('search');
                    }

                    isEnd = response.data.length < page;
                    console.time('arr');
                    debugger;
                    showList(list, level, response.data, true);
                    callback(isEnd, response.data);
                    console.timeEnd('arr');

                });


            }

            function showList(dom, level, data, append?) {
                // debugger;
                let ul = dom.querySelector('ul.mui-table-view'),
                    idField = levelField[level],
                    nameField = treeField[level],
                    highlightName = (data[0] && tmpName in data[0]) ? tmpName : nameField,
                    isLeaf = nameField === treeField[treeField.length - 1],
                    createHTML = (<HTMLScriptElement>d.query(isLeaf ? '#leaf' : '#notLeaf')).text,
                    subId, subName, parentId;

                append = typeof append === 'undefined' ? false : append;

                if (level === 0) {
                    ul.innerHTML = '';
                }

                if (!append) {
                    if (data.length === 0) {
                        ul.innerHTML = '<li style="text-align: center;font-size: 12px;padding: 5px;">暂无数据</li>';
                        return false;
                    } else {
                        ul.innerHTML = ''
                    }
                }

                let simData = [];
                if (para.levelField === '') {
                    let parent = d.query('a[data-id]', dom),
                        id = parent && parent.dataset.id;
                    if (para.recursion === 1) {
                        subId = treeField[0];
                        // subName = treeField[2];
                        parentId = treeField[1];
                        data.forEach(obj => {
                            if (level === 0) {
                                if (!obj[parentId]) {
                                    simData.push(obj);
                                }
                            } else {
                                if (obj[parentId] === parent.dataset.id) {
                                    simData.push(obj);
                                }
                            }
                        });
                        console.timeEnd('data')
                    } else if (para.recursion === 0) {
                        //去重
                        let filterData = [], arr = {},
                            parentValue = parent && parent.dataset.id;
                        let parentIndexes = Array.from({ length: Math.max(level, 0) }, (v, i) => i);

                        for (let d of data) {
                            //未知问题，先注释:1299bug
                            //queryData.queryparam有搜索值不进入
                            if (!queryData.queryparam&&tools.isNotEmpty(parentIndexes)) {
                                const fName = parentIndexes.map(name => {
                                    let filedName = treeField[name];
                                    return filedName ? d[filedName] : '';
                                })
                                if (fName.join('') !== parentValue) continue;
                            }
                            let name = d[nameField];
                            if (!arr[name]) {
                                arr[name] = true;
                                filterData.push(d);
                            }
                        }
                        filterData.forEach((obj) => {
                            for (let key in obj) {
                                if (level === 0) {
                                    if (key === treeField[level]) {
                                        simData.push(obj);
                                    }
                                } else {
                                    let name = '';
                                    if (key === treeField[level]) {
                                        for (let m = 0; m < level; m++) {
                                            name += obj[treeField[m]];
                                        }
                                        //未知问题，先注释1299bug
                                        // if (name === id) {
                                        simData.push(obj);
                                        // }
                                    }
                                }
                            }
                        });
                    }
                } else {
                    simData = data;
                }

                simData.forEach(function (m) {
                    let parseData: obj;

                    //数据一次性加载
                    if (para.levelField === '') {
                        if (para.recursion === 1) {
                            parseData = {
                                name: m[fromField],
                                level: level,
                                id: m[subId],
                                from: m[fromField],
                                valueJson: JSON.stringify(m)
                            };
                        } else if (para.recursion === 0) {
                            let /*field = treeField[level],
                                parentField = treeField[level - 1],*/
                                id = '';
                            for (let i = 0; i < level + 1; i++) {
                                id += m[treeField[i]];
                            }
                            // if(parentField){
                            //     id = m[parentField] + m[field];
                            // }
                            parseData = {
                                name: m[highlightName],
                                level: level,
                                from: m[fromField],
                                id: id,
                                valueJson: JSON.stringify(m)
                            };
                        }

                    } else {
                        //数据每次点击后加载
                        parseData = {
                            name: m[highlightName],
                            from: m[fromField],
                            level: level,
                            valueJson: JSON.stringify(m)
                        };
                    }

                    if (para.recursion === 1) {
                        let hasSub = false;
                        data.forEach(obj => {
                            if (m[subId] === obj[parentId]) {
                                hasSub = true;
                            }
                        });
                        createHTML = (<HTMLScriptElement>G.d.query(hasSub ? '#notLeaf' : '#leaf')).text;
                    }
                    if (!isLeaf) {
                        parseData.query = idField && idField.toLowerCase() + '=' + m[idField];
                    }

                    //颜色处理
                    if (~Object.keys(m).indexOf(BwRule.ColorField)) {
                        let { r, g, b } = tools.val2RGB(m[BwRule.ColorField]);
                        parseData.name = m[highlightName]
                            + `<span style="height: 14px;display: inline-block;margin-left: 10px; width:50px; background: rgb(${r},${g},${b})"></span>`;
                    }
                    // parseData.valueJson && (parseData.valueJson = tools.str.htmlEncode(parseData.valueJson));
                    ul.appendChild(G.d.create(
                        G.tools.str.parseTpl(createHTML, parseData, false)));
                });
                return true;
            }

            function inputOnChange(callback) {
                let timer = null, nowTime = 0, lastTime = 0,
                    searchInput = document.getElementById('searchInput'),

                    timeInterval = 600;//节流，300毫秒触发一次

                searchInput && searchInput.addEventListener('input', function () {
                    let self = this;
                    nowTime = new Date().getTime();
                    if (lastTime === 0) {
                        lastTime = nowTime;
                    }
                    if (nowTime - lastTime < 300) {
                        if (timer) {
                            clearTimeout(timer);
                        }

                        timer = setTimeout(function () {
                            callback(self);
                            lastTime = 0;
                            timer = null;
                        }, timeInterval);
                    }
                    lastTime = nowTime;
                });

                searchInput && setTimeout(function () {
                    searchInput.nextElementSibling && searchInput.nextElementSibling.addEventListener('click', function (e: Event) {
                        if ((<HTMLElement>e.target).classList.contains('mui-icon-clear')) {
                            callback(searchInput);
                            searchInput.blur();
                            searchInput.focus();
                        }
                    });
                }, 1000);
            }

            return {
                up: function (callback) {
                    loadSearch(callback);
                }
            }
        }());

        //

        let multValue = para.multValue;//单选 or 多选
        let done = document.getElementById('done');
        (function () {
            let lastCheckbox = null;
            d.on(list, 'change', 'input[type=checkbox]', function () {
                //控制单选多选
                if (!multValue && lastCheckbox !== null && !lastCheckbox.isSameNode(this)) {
                    lastCheckbox.checked = false;
                }
                let count = list.querySelectorAll('input[type="checkbox"]:checked').length;
                done.innerHTML = count ? "完成(" + count + ")" : "完成";
                if (count) {
                    if (done.classList.contains("mui-disabled")) {
                        done.classList.remove("mui-disabled");
                    }
                } else {
                    if (!done.classList.contains("mui-disabled")) {
                        done.classList.add("mui-disabled");
                    }
                }

                lastCheckbox = this;
            });
        }());
        BW.sys && (BW.sys.window.close = function () {
            console.log(window["iframeId"]);
            window.parent.document.getElementById(window["iframeId"]).classList.remove('active');
        });
        done && d.on(done, clickEvent, function () {
            let checkboxArray = <HTMLInputElement[]>d.queryAll('input[type="checkbox"]:checked', list),
                checkedValues = [];

            checkboxArray.forEach(function (box) {
                checkedValues.push(JSON.parse(box.dataset.value));
            });
            //console.log(checkboxArray);
            let caption = localStorage.getItem('fromPickCaption'),
                passData = {
                    caption: caption,
                    data: checkedValues,
                    otherField: para.otherField,
                    fromField: para.fromField
                };

            if (checkedValues.length > 0) {
                setTimeout(function () {
                    checkboxArray.forEach(function (box) {
                        box.checked = false;
                    });
                    done.innerHTML = "完成";
                    done.classList.add("mui-disabled");
                }, 400);

                G.tools.event.fire('selectContact', passData, window.parent);

                if (BW.sys.os !== 'pc') {
                    window.parent.document.getElementById(window["iframeId"]).classList.remove('active');
                }
            }
        });
    }
}
