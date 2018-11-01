import tools = G.tools;
import d = G.d;
import sys = BW.sys;
import CONF = BW.CONF;
import {BwRule} from "../../common/rule/BwRule";
import {DataManager} from "../../../global/components/DataManager/DataManager";
import {Loading} from "../../../global/components/ui/loading/loading";
/**
 * 树构造数据有三种情况
 * 1.有levelField ，每次点击再加载数据，根据treeField构造,如：收件人
 * 2.levelField为空，recursion = 0 ，后台数据一次性给前端，根据treeField构造
 * 3.levelField为空，recursion = 1，后台数据一次性给前端，此时TreeFields必须正好是三个字段：主键字段，父字段，标题字段。
 */
interface contactsPagePara {
    levelField ,
    treeField ,
    fromField ,
    multValue ,
    otherField,
    recursion : number, //0不是，1是TreeFields必须正好是三个字段：主键字段，父字段，标题字段。
    dom,
    dataAddr:R_ReqAddr;
    isDev?:boolean;
}
let clickEvent = tools.isMb ? 'click' : 'click';

export = class contactsPage {
    private response;
    constructor(private para: contactsPagePara) {
        let self = this,
            list = d.query('#list');
            //传给后台参数
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
                ajaxUrl = CONF.siteUrl + BwRule.reqAddr(para.dataAddr,  localData ? JSON.parse(localData) : null),
                page = 0,
                len = 20,
                queryData = {queryparam: '', pageparams: ''};

            //一开始加载
            getList(ajaxUrl, queryData, function (response) {
                showList(list, 0, response.data);
            });
            // pullScroll.pullRefresh({
            //     auto: true,
            //     height: 50,//可选.默认50.触发上拉加载拖动距离
            //     contentrefresh: "正在加载...",//可选，正在加载状态时，上拉加载控件上显示的标题内容
            //     contentnomore: '',//可选，请求完毕若没有更多数据时显示的提醒内容；
            //     up: {
            //         callback: function () {
            //             let self = this;
            //             picker.up(function (isEnd) {
            //                 self.endPullupToRefresh(isEnd);
            //             });
            //         }
            //     }
            // });

            // console.log(sys.isMb, tools.isMb);
            // debugger;
            let hasOpen;
            function hasShow(target : HTMLElement){
                // debugger;
                let tarPar = target;
                if(tarPar.classList.contains('mui-active')){
                    tarPar.classList.remove('mui-active');
                }
                else{
                    tarPar.classList.add('mui-active');
                }
            }

            d.on(list, clickEvent, '.mui-table-view-cell.mui-collapse a', function (e) {
                // !hasOpen && hasShow(<HTMLElement>e.target);
                //  debugger;
                setTimeout(() => {
                    if(typeof hasOpen === 'undefined') {
                        hasOpen = this.parentElement.classList.contains('mui-active');
                    }

                    if(!hasOpen){
                        hasShow(this.parentElement);
                    }
                }, 0);
            });

            d.on(list, clickEvent, '.mui-table-view-cell a.notLoad[data-query]', function (e) {
                let tapThis = this;
                // console.log(tapThis.text)
                function getLevelQuery(dom: HTMLElement, query = '') {

                     let parent = d.closest(dom.parentElement, 'li.mui-table-view-cell', list),
                         queryDom = d.query('[data-query]', dom),
                         queryStr = query ? query + '&' + queryDom.dataset.query : queryDom.dataset.query;

                     if(parent) {
                         return getLevelQuery(parent, queryStr)
                     }else{
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
                if(self.para.isDev){
                    let forwardurl = tools.url.getPara('forwardurl',ajaxUrl),
                        addr = ajaxUrl.split('&forwardurl')[0],
                        queryStr = getLevelQuery(tapThis.parentElement),
                        queryObj = parseQuery(queryStr);
                    url = tools.url.addObj(addr,{
                        forwardurl:tools.url.addObj(forwardurl,Object.assign({},queryObj,{
                            isMb:true,
                            output:"json"
                        }))
                    })
                }else{
                    url = ajaxUrl + (~ajaxUrl.indexOf('?') ? '&' : '?') + getLevelQuery(tapThis.parentElement);
                }
                console.log(getLevelQuery(tapThis.parentElement));

                //数据一次性加载时
                if(self.para.levelField === ''){
                    if (showList(tapThis.parentNode, parseInt(tapThis.dataset.level) + 1, self.response.data, null)) {
                        tapThis.classList.remove('notLoad');
                    }
                }else{
                    getList(url, queryData, function (response) {
                        if (showList(tapThis.parentNode, parseInt(tapThis.dataset.level) + 1, response.data, null)) {
                            tapThis.classList.remove('notLoad');
                        }
                    });
                }
            });

            inputOnChange(function (search) {
                let inputValue:string = search.value, vLen = inputValue.length;
                if (vLen === 0 || (/\S/).test(inputValue[vLen - 1])) {
                    page = 1;

                    list.querySelector('ul.mui-table-view').innerHTML = '<li class="mui-table-view-cell" style="text-align: center"> <span class="mui-spinner" style="vertical-align: bottom;"></span> </li>';
                    if (vLen === 0) {
                        // pullScroll.pullRefresh().disablePullupToRefresh();
                        queryData = {queryparam: '', pageparams: ''}
                        dataManager && dataManager.destroy();
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
                            // console.log(110)
                            showList(list, level, response.data);
                        });
                    } else {
                        // pullScroll.pullRefresh().enablePullupToRefresh();
                        queryData.queryparam = inputValue.toUpperCase().replace(/'/g, '');
                        dataManager = new DataManager({
                            render: (e) => {
                                console.log(e);
                            },
                            page: {
                                size: len,
                                container: list
                            },
                            ajax: {
                                auto: true,
                                fun: (obj) => {
                                    console.log(obj);
                                    queryData.pageparams = '{"index"=' + (obj.current + 1) + ', "size"=' + obj.pageSize + '}';
                                    console.log(queryData.pageparams);
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

                                            let isEnd = response.data.length < page;
                                            // pullScroll.pullRefresh().endPullupToRefresh(isEnd);
                                            // console.log(110)
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


//             console.log(queryData);

                }
            });


            function getList(url, ajaxData, callback) {
                // let loading = new Loading({
                //     msg: '加载中...',
                //     container: document.body,
                // });
                // loading.show();
                BwRule.Ajax.fetch(url, {
                    cache: true,
                    data: ajaxData,
                }).then(({response}) => {
                    console.log(response);
                    self.response = response;
                    /**
                     * 如果是搜索，则直接显示叶子，并且显示数据的前6项
                     */
                        // debugger;
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
                            data[treeField[level]] = str;
                            tmpData.push(data);
                        });
                        res.data = tmpData;
                    }
//                    console.log(res);
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

                    // console.log(response, 678)
                    showList(list, level, response.data, true);
                    callback(isEnd, response.data);
                });


            }

            function showList(dom, level, data, append?) {
                let ul = dom.querySelector('ul.mui-table-view'),
                    idField = levelField[level],
                    nameField = treeField[level],
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

                let simData = [],
                    parentField = treeField[level - 1],
                    isExist;

                if(para.levelField === ''){
                    let parent = d.query('a[data-id]', dom);
                    if(para.recursion === 1){
                        subId = treeField[0];
                        subName = treeField[2];
                        parentId = treeField[1];
                        // console.log(subId,subName,parentId);
                        data.forEach(obj => {
                            if(level === 0){
                                if(!obj[parentId]){
                                    simData.push(obj);
                                }
                            }else {
                                if(obj[parentId] === parent.dataset.id){
                                    simData.push(obj);
                                }
                            }
                        })
                    }else if(para.recursion === 0){
                        //去重
                        let filterData = [];
                        data.forEach(d => {
                            isExist = false;
                            filterData.forEach(s => {
                                if (d[nameField] === s[nameField]) {
                                    isExist = true;
                                }
                            });
                            if (!isExist) {
                                filterData.push(d);
                                isExist = false;
                            }
                        });
                        filterData.forEach((obj, i) => {
                            for(let key in obj){
                                if(level === 0){
                                    if(key === treeField[level]){
                                        simData.push(obj);
                                    }
                                }else {
                                    let name = '';
                                    if(key === treeField[level]){
                                        for(let m = 0; m < level; m++ ){
                                            name += obj[treeField[m]];
                                        }
                                        if(name === parent.dataset.id){
                                            simData.push(obj);
                                        }
                                    }
                                }
                            }
                        });

                    }
                }else {
                    simData = data;
                }


                // console.log(para);
                simData.forEach(function (data) {
                    let parseData: obj;

                    //数据一次性加载
                    if(para.levelField === ''){
                        if(para.recursion === 1){
                            parseData = {
                                name: data[subName],
                                level: level,
                                id : data[subId],
                                valueJson: JSON.stringify(data)
                            };
                        }else if(para.recursion === 0){
                            let field = treeField[level],
                                parentField = treeField[level - 1],
                                id = data[field];
                            if(parentField){
                                id = data[parentField] + data[field];
                            }
                            parseData = {
                                name: data[treeField[level]],
                                level: level,
                                id : id,
                                valueJson: JSON.stringify(data)
                            };
                        }

                    }else {
                        //数据每次点击后加载
                        parseData = {
                            name: data[nameField],
                            from: data[fromField],
                            level: level,
                            valueJson: JSON.stringify(data)
                        };
                    }

                    if(para.recursion === 1){
                        let hasSub = false;
                        data.forEach(obj => {
                            if(data[subId] === obj[parentId]){
                                hasSub = true;
                            }
                        });
                        createHTML = (<HTMLScriptElement>G.d.query(hasSub ? '#notLeaf': '#leaf' )).text;
                    }
                    if (!isLeaf) {
                        parseData.query = idField && idField.toLowerCase() + '=' + data[idField];
                    }

                    //颜色处理
                    if(~Object.keys(data).indexOf(BwRule.ColorField)){
                        let {r, g, b} = tools.val2RGB(data[BwRule.ColorField]);
                        parseData.name = data[nameField]
                            + `<span style="height: 14px;display: inline-block;margin-left: 10px;height: 14px; width:50px; background: rgb(${r},${g},${b})"></span>`;
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
                    searchInput.nextElementSibling && searchInput.nextElementSibling.addEventListener('click', function (e:Event) {
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
            window.parent.document.getElementById('iframe_' + localStorage.getItem('fromPickCaption')).classList.remove('active');
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
                    window.parent.document.getElementById('iframe_' + caption).classList.remove('active');
                }
            }
        });
    }
}