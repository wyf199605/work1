/// <amd-module name="TableDataModule"/>

import {TableModule} from "./tableModule";
import CONF = BW.CONF;
import {Loading} from "../../../global/components/ui/loading/loading";
import sys = BW.sys;
import tools = G.tools;
import {Spinner} from "../../../global/components/ui/spinner/spinner";
import {BwRule} from "../../common/rule/BwRule";
import {Modal} from "../../../global/components/feedback/modal/Modal";

interface tableDataModulePara{
    tableModule : TableModule;
    tableConf: TableModuleConf;
    para: TableModulePara;
    pageUrl : string
}

export class TableDataModule{
    private ajaxUrl : string;//ajax请求地址
    private queryPara : obj;//请求参数缓存信息
    private isQuery : boolean;//判断当前处理的数据是否为查询器
    constructor(private modulePara : tableDataModulePara){
        this.ajaxUrl = this.modulePara.para.dataAddr ? CONF.siteUrl + BwRule.reqAddr(this.modulePara.para.dataAddr) : null;
        this.queryPara = {};
        this.isQuery = this.modulePara.para.querier && (this.modulePara.para.querier.queryType === 3);
    }
   
    private ajaxAfterHandlers:Function[] = [];
    public ajaxAfterAdd(handler:Function) {
        this.ajaxAfterHandlers.push(handler);
    }
    public ajaxAfterRemove(handler:Function) {
        this.ajaxAfterHandlers.indexOf(handler);
        // splice
    }
    
    private ajaxBeforeHandlers:Function[] = [];
    public ajaxBeforeAdd(handler:Function) {
        this.ajaxBeforeHandlers.push(handler);
    }
    public ajaxBeforeRemove(handler:Function) {
        this.ajaxBeforeHandlers.indexOf(handler);
        // splice
    }
    
    
    /**
     * ajax请求
     * @param {obj} reqPara
     * @param callback
     */
    private _lookUpData: objOf<ListItem[]> = {};
    get lookUpData() {
        return this._lookUpData || {};
    }

    private get lookup() {
        // let allPromise = this.modulePara.para.cols
        //     .filter(col => col.elementType === 'lookup')
        //     .map(col => new Promise(((resolve, reject) =>{
        //         Rule.getLookUpOpts(col)
        //             .then((itemList) => {
        //                 resolve(itemList);
        //             }).catch(() => {
        //                 reject();
        //         })
        //     })));
        // debugger;
        if(tools.isEmpty(this._lookUpData)) {
            let allPromise = this.modulePara.para.cols
                .filter(col => col.elementType === 'lookup')
                .map(col => BwRule.getLookUpOpts(col).then((items) => {
                    // debugger;
                    this._lookUpData = this._lookUpData || {};
                    this._lookUpData[col.name] = items;
                }));

            return Promise.all(allPromise).then(() => {
                return;
            })
        }else {
            return Promise.resolve();
        }
    }

    public ajax(reqPara: obj, callback, isRefresh:boolean = false) {
        // debugger;
        let ajaxIsOk: boolean = false,
            spinner: Loading = null,

            doAfter = () => { // 当ajax请求完成之后处理函数
                // debugger;
                ajaxIsOk = true;
                spinner && spinner.destroy();
                this.modulePara.tableModule.wrapper.classList.remove('disabled');
            };
        setTimeout(() => {
            if (!ajaxIsOk) {
                this.modulePara.tableModule.wrapper.classList.add('disabled');
            }
        }, 0);

        //若有传入新的查询条件则将新的查询条件缓存到queryPara 并且重新获取当前分页条件
        if (reqPara) {
            let cacheReq;
            this.queryPara = reqPara;
            cacheReq = tools.obj.merge(this.queryPara, this.modulePara.tableModule.pagination.getParam());
            reqPara = tools.obj.merge(reqPara, cacheReq);
        }
        //若没有新的查询条件则直接重新获取当前分页条件
        else {
            reqPara = tools.obj.merge(this.queryPara, this.modulePara.tableModule.pagination.getParam());
        }
        //后台排序的时候添加当前的排序信息
        if (this.modulePara.para.multPage === 1) {
            reqPara = tools.obj.merge(reqPara, this.modulePara.tableModule.initTableEvent.getPageSortParams());
        }
        //若异步查询，传递uiurl
        if (this.modulePara.para.isAsyn === true) {
            let url = this.modulePara.pageUrl;
            reqPara['uiurl'] = url.substring(find(url, '/', 5), url.length);
        }
        //如果是电脑端且有查询器则初始化加载效果
        if (this.isQuery || !reqPara || reqPara.pagesortparams) {
            if (!tools.isMb || isRefresh) {
                spinner = new Loading({
                    msg: '加载中...'
                });
            }
        }

        function find(str, cha, num) {
            let x = str.indexOf(cha);
            for (let i = 0; i < num; i++) {
                x = str.indexOf(cha, x + 1);
            }
            return x;
        }

        this.lookup
            .then(() => {
                BwRule.Ajax.fetch(this.ajaxUrl, {
                    timeout: 30000,
                    data: reqPara,
                    // headers: {position: JSON.stringify(gpsData)},
                    needGps: this.modulePara.para.dataAddr.needGps
                }).then(({response}) => {
                    doAfter();
                    if (response.data) {
                        // 加上OLD变量
                        let tableAddr = this.modulePara.para.tableAddr,
                            editAddrParam: IBW_TableAddrParam;

                        tableAddr && Array.isArray(tableAddr.param) && tableAddr.param.forEach(p => {
                            if (p && p.itemId === this.modulePara.para.itemId) {
                                editAddrParam = p;
                            }
                        });
                        if (editAddrParam) {
                            let varList = [];
                            ['insert', 'update', 'delete'].forEach(type => {
                                let canOld = ['update', 'delete'].indexOf(editAddrParam[`${type}Type`]) > -1,
                                    typeVarList = editAddrParam[type];

                                if (canOld && Array.isArray(typeVarList)) {
                                    varList = varList.concat(typeVarList)
                                }
                            });

                            BwRule.addOldField(BwRule.getOldField(varList), response.data);
                        }
                    }
                    callback(response);

                }).catch((e) => {
                    // Modal.alert(e);
                }).finally(() => {
                    doAfter();
                    callback();
                });
            }).catch((e) => {
            // Modal.alert(e);
        })
    };
    /**
     * 表格刷新
     * @param {obj} newAjaxData
     * @param after
     * @param before
     */
    public refresh(newAjaxData?: obj, after?:Function, before?:Function){
        let tableModule = this.modulePara.tableModule;
        newAjaxData && (this.queryPara = newAjaxData);//如果有新的查询条件怎缓存新的查询条件
        this.ajax(newAjaxData, (res) => {
            if(res) {
                typeof before === 'function' && before(res);
                this.dealTable(res.data, true);
                tableModule.pagination.isShow(res);
                tableModule.autoSubTable();
                //设置前台分页本地缓存数据
                tableModule.localSearch.setOriginData(tableModule.table.data.get());
                //判断如果存在本地查询条件则自动进行本地查询
                if(tableModule.localSearch.queryDataGet()){
                    tableModule.localSearch.search();
                }
                typeof  after === 'function' && after(res);
            }
        }, true);
    };
    /**
     * 渲染表格方法
     * @param {obj[]} data
     * @param {boolean} isSet
     */
    public dealTable(data : obj[],isSet : boolean){
        let tableModule = this.modulePara.tableModule;
        let cache = tableModule.pagination.getCurrentState();
        isSet ? tableModule.table.data.set(data) : tableModule.table.data.add(data);
        //0 不分页
        if(this.modulePara.para.multPage === 0){
            tableModule.table.render(0,data.length);
        }
        //1 后台分页
        if(this.modulePara.para.multPage === 1){
            tableModule.table.render(isSet ? 0 : cache.offset, isSet ? cache.size : cache.offset + cache.size,isSet);
        }
        //2 前台分页
        if(this.modulePara.para.multPage === 2){
            tableModule.table.render(0,50);
        }

        tools.event.fire('table-module-render', null, tableModule.wrapper);
    };
    /**
     * 获取当前请求体信息
     * @returns {{}}
     */
    public getQueryPara(){
        return this.queryPara;
    };
    /**
     * 重新设置表格数据，进行重新渲染
     * @param {obj[]} newData
     * @param {boolean} isSet
     */
    public setNewData(newData : obj[], isSet = true){
        let tableModule = this.modulePara.tableModule;
        this.modulePara.para.multPage = 2;
        this.dealTable(newData, isSet);
        let oriDataLen = tableModule.table.data.get().length,
            len = oriDataLen ? oriDataLen:  newData.length;
        if(this.modulePara.para.multPage !==0 && len > tableModule.pagination.pageLen) {
            tableModule.pagination.reset({
                offset: 0,
                recordTotal: len
            });
        }
        tableModule.pagination.isShow(newData);
        tableModule.lockBottom();
    };
    /**
     * 查询器调用函数
     */
    public innerRefresher(reqPara: obj, after:Function, before?:Function){
        let tableModule = this.modulePara.tableModule;
        let notQueSpi = new Spinner({
            el: this.modulePara.tableConf.tableEl,
            type: Spinner.SHOW_TYPE.append,
            className: 'text-center padding-30'
        });
        let afterCb = response => {
            let totalNum = response.head.totalNum ? response.head.totalNum : response.data.length;
            if(this.modulePara.para.multPage !==0 && totalNum > tableModule.pagination.pageLen) {
                tableModule.pagination.reset({
                    offset: 0,
                    recordTotal: totalNum
                });
            }

            // 隐藏在表格列当中找不到varlist Name 的按钮
            let meta = response.meta;
            if(Array.isArray(meta) && meta[0] && tableModule.subBtn && tableModule.subBtn.children){
                // let visibleCols =  tableModule.table.getVisibleCol();
                tableModule.subBtn.children.forEach((btn) => {
                    if(Array.isArray(btn.data.actionAddr && btn.data.actionAddr.varList)){
                        for(let v of btn.data.actionAddr.varList){

                            // 处理OLD字段
                            let varName = v.varName.replace(/^OLD_/, '');

                            // btn.multiSelect === 0 || Tools.v.varValue
                            if(btn.data.multiselect !== 0 && tools.isEmpty(v.varValue)){
                                // 有一个参数找不到则隐藏此按钮
                                btn.isShow = meta.indexOf(varName) !== -1;
                            }
                        }
                    }
                })
            }
            typeof after === 'function' && after(response);
            setTimeout(()=> {
                tableModule.lockBottom();
                //设置前台分页本地缓存数据
                tableModule.localSearch.setOriginData(tableModule.table.data.get());
                //设置当前表格的分页类型缓存
                tableModule.localSearch.setOriginMultPage(this.modulePara.para.multPage);
                !this.isQuery && notQueSpi.hide();
            },0);
        };
        tableModule.localSearch.getOriginMultPage() !== null &&
        (this.modulePara.para.multPage = tableModule.localSearch.getOriginMultPage());
        tableModule.pagination.setParam(1);
        !this.isQuery && notQueSpi.show();
        this.refresh(reqPara, afterCb, before);
    };
    /**
     * 重新渲染表格之后的逻辑处理
     * @param {obj[]} data
     * @param {number} dataLen
     */
    public dealData(data : obj[],dataLen : number){
        let tableModule = this.modulePara.tableModule;
        // 1.不分页 2.返回的总数目小于当前每页大小时候  不初始化分页条
        if (this.modulePara.para.multPage !== 0 && dataLen > tableModule.pagination.pageLen) {
            tableModule.pagination.reset({
                offset: 0,
                recordTotal: dataLen
            });
        }
        // 渲染表格
        this.dealTable(data, !tools.isMb);
        tableModule.autoSubTable();
        setTimeout(()=>{
            tableModule.lockBottom();
            // 设置前台分页本地缓存数据
            tableModule.localSearch.setOriginData(tableModule.table.data.get());
            // 设置当前表格的分页类型缓存
            tableModule.localSearch.setOriginMultPage(this.modulePara.para.multPage);
        },0);
    };

    public cbFun = (()=>{
        let outerAfter : Function = null,outerBefore : Function = null;

        let setOuterAfter = (fun : Function)=>{
            outerAfter = fun;
        };
        let getOuterAfter = ()=>{
            return outerAfter;
        };
        let setOuterBefore = (fun : Function)=>{
            outerBefore = fun;
        };
        let getOuterBefore = ()=>{
            return outerBefore;
        };

        return {setOuterAfter,getOuterAfter,setOuterBefore,getOuterBefore}
    })()
}