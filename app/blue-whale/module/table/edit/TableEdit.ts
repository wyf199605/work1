/// <amd-module name="TableEdit"/>

import {Modal} from "../../../../global/components/feedback/modal/Modal";
import {Tooltip} from "../../../../global/components/ui/tooltip/tooltip";
import {Loading} from "../../../../global/components/ui/loading/loading";
import * as em from "../../edit/editModule";
import {TableModule} from "../tableModule";
import d = G.d;
import tools = G.tools;
import CONF = BW.CONF;
import {BwRule} from "../../../common/rule/BwRule";
import sys = BW.sys;

interface TableEditP{
    tm: TableModule;
    tableAddr: IBW_TableAddr;
    cols: R_Field[];
}

export class TableEdit{
    private isEditing = false;
    private inMain = true;
    private onFocusChangeHandler: (isMain: boolean) => void;
    private tm: TableModule;
    constructor(private p: TableEditP){
        this.tm = p.tm;
    }

    public canRowInit(isMain : boolean,rowData?: obj){
        if(isMain) {
            return !(rowData && (rowData['EDITEXPRESS'] === 0));
        } else {
            let mainRowData = this.tm.table.rowSelectDataGet()[0];
            return this.canRowInit(true, mainRowData)
        }
    }

    private _subTm: TableModule;
    set subTm(subTm: TableModule){
        if(subTm){
            this._subTm = subTm;

            this.mainSub((tm, isMain) => {
                d.on(tm.table.wrapperGet(), 'click', () => {
                    this.inMain = isMain;
                    if(typeof this.onFocusChangeHandler === 'function'){
                        this.onFocusChangeHandler(isMain);
                    }
                });
            });
            
        }
    }
    
    get subTm() {
        return this._subTm;
    }

    public init(callback?:Function) {
        let p = this.p,
            tableAddr = p.tableAddr,
            {mainVarList, subVarList} = getMainSubVarList(tableAddr);

        if (!editVarHas(mainVarList, ['update', 'insert']) && !editVarHas(subVarList, ['update', 'insert'])) {
            typeof callback === 'function' && callback();
            return;
        }

        this.editModuleLoad(callback);
    }

    private editModuleLoad(callback?:Function){
        this.mainSub(tm => {
            tm.table.edit.init();
            tm.table.wrapperGet().classList.add('disabled')
        });

        require(['EditModule'], (edit: typeof em) => {
            // editVarHas()
            let promises = [];
            this.mainSub((tm, isMain, index, len) => {
                promises.push(this.initEditModule(edit.EditModule, tm)
                    .then(() => {
                        tm.table.wrapperGet().classList.remove('disabled')
                    }));
            });

            Promise.all(promises).then(() => {
                typeof callback === 'function' && callback();
            });

            tools.event.fire('editChange', {status: 1}, this.tm.wrapper);
            this.isEditing = true;

        });
    }

    private initEditModule(EditModule: typeof em.EditModule, tm: TableModule) {
        let table = tm.table,
            defData = tm.defaultData,
            pasteExceptCols = [tm.getKeyField()],
            defUrl = tm.getDefAddr();

        let init = (defData) => {
            let editModule = new EditModule({
                auto: false,
                type: 'table',
                fields: this.p.cols.map(f => {
                    return {
                        dom: null,
                        field: f
                    }
                })
            });

            let comInit = (td: HTMLTableCellElement, trData: obj, col: R_Field) => {
                td.innerHTML = '';

                // debugger;
                editModule.init(col.name, {
                    dom: td,
                    data: trData,
                    field: <R_Field>col,
                    onExtra: (data, relateCols, isEmptyClear = false) => {
                        // console.log(data);

                        // debugger;
                        // 如果找不到assign， 则删除本身
                        if(tools.isEmpty(data) && isEmptyClear) {
                            table.edit.modifyTd(td, '');
                            return;
                        }

                        relateCols.forEach(key => {

                            if(key === col.name) { //|| (!tools.isEmpty(trData[key]) && tools.isEmpty(data[key]))
                                return;
                            }

                            let assignTd = getSiblingTd(td, key),
                                dataStr = tools.str.toEmpty(data[key]);

                            if(assignTd) {
                                table.edit.modifyTd(assignTd, dataStr);
                            } else {
                                table.edit.rowData(parseInt(td.parentElement.dataset.index), {[key] : dataStr});
                            }
                        });
                    }
                });

                editModule.set({
                    [col.name]: trData[col.name]
                });

                let input = td.querySelector('input');
                if (input) {
                    input.select();
                }
            };

            let validate = (td, col: R_Field, rowData, callback) => {

                // debugger;
                let name = col.name,
                    result = editModule.validate.start(name);

                let errorStyle = (colName: string, el: HTMLElement, msg: string) => {
                    let visibleCols = table.getVisibleCol(),
                        isLastCol = visibleCols.indexOf(colName) > visibleCols.length / 2;

                    new Tooltip({
                        visible: false,
                        errorMsg: msg,
                        el: el,
                        length: 'medium',
                        pos: isLastCol ? 'left' : 'right'
                    });
                };

                if (result && result[name]) {
                    errorStyle(name, getSiblingTd(td, name), result[name].errMsg);
                    callback(td, false);
                } else if (col.chkAddr && !tools.isEmpty(rowData[col.name])) {

                    EditModule.checkValue(col, rowData, () => table.edit.modifyTd(td, ''))
                        .then((res) => {
                            // debugger;
                            if (res.errors) {

                                res.errors.forEach(err => {
                                    let el = getSiblingTd(td, err.name);
                                    if (el) {
                                        errorStyle(err.name, el, err.msg);
                                        callback(el, false);
                                    }

                                })
                            }

                            if (res.okNames) {
                                res.okNames.forEach(name => {
                                    let el = getSiblingTd(td, name);
                                    if (el) {
                                        Tooltip.clear(el);
                                        callback(el, true);
                                    }
                                })
                            }
                        });
                } else {
                    callback(td, true);
                }
            };

            table.edit.initModify({
                defData,
                pasteExceptCols,
                comInit,
                validate,
                comDestroy: (col) => {
                    let name = col.name;
                    editModule.set({[name]: editModule.get(name)[name]});
                    editModule.destroy(name);
                },
                valGet: (c: R_Field) => editModule.get(c.name),
                canInit: (c: R_Field, type) => {
                    return  type === 1 ? !c.noModify : !c.noEdit;
                },
                canRowInit: (data:obj) => {
                    return this.canRowInit(!tm.isSub,tm.isSub ? null : data);
                    //当为0时不可编辑
                }
            });
        };

        function getSiblingTd(td:HTMLTableCellElement, colName: string){
            return <HTMLTableCellElement>d.query(`td[data-col="${colName}"]`, td.parentElement)
        }

        return new Promise(((resolve, reject) => {
            if (tools.isNotEmpty(defUrl)) {
                let data = {};
                Promise.all(defUrl.map(url => {
                    return BwRule.Ajax.fetch(CONF.siteUrl + BwRule.reqAddr(url))
                        .then(({response}) => {
                            data = Object.assign(data, defData, response.data[0] || {})
                            // cb();
                        });
                })).then(() => {
                    init(data);
                    resolve();
                })

            } else {
                init(defData);
                // cb();
                resolve();
            }
        }));
    }

    /**
     * 主表从表执行相同动作
     * @param {(tm: TableModule, isMain: boolean) => void} fun
     * @param {boolean} inEditing - 判断是否能够进入编辑模式
     */
    private mainSub(fun: (tm: TableModule, isMain: boolean, index:number, len:number) => void, inEditing = true) {
        let len = 0,
            hasMain = false,
            hasSub = false,
            {mainVarList, subVarList} =
            inEditing ? getMainSubVarList(this.p.tableAddr) : {mainVarList: null, subVarList: null};


        if(this.tm && (inEditing ? editVarHas(mainVarList, ['insert', 'update']) : true)) {
            hasMain = true;
            len ++;
        }
        if(this.subTm && (inEditing ? editVarHas(subVarList, ['insert', 'update']) : true)){
            len ++;
            hasSub = true;
        }

        if(hasMain){
            fun(this.tm, true, 0, len);
        }
        if(hasSub){
            fun(this.subTm, false, hasMain ? 1 : 0, len);
        }
    }

    private checkError() {

        let table = this.tm.table,
            subTable = this.subTm ? this.subTm.table : null;

        let errorLen = table.edit.errorLen();
        if(errorLen > 0){
            Modal.alert(`${subTable ? '主表' : ''}有${errorLen}个错误需要修改`);
            return false;
        }
        if(subTable){
            errorLen = subTable.edit.errorLen();
            if(errorLen > 0){
                Modal.alert(`从表有${errorLen}个错误需要修改`);
                return false;
            }
        }

        return true;
    }

    public getData(tableData, varList:IBW_TableAddrParam) {
        let postData: obj = {};
        varList && ['update', 'delete', 'insert'].forEach(key => {
            let dataKey = varList[`${key}Type`];
            if(varList[key] && tableData[dataKey][0]) {

                // 数字类型空转0
                // this.p.cols.forEach(col => {
                //     if(BwRule.isNumber(col.atrrs.dataType)){
                //         tableData[dataKey].forEach(data => {
                //             if(tools.isEmpty(data[col.name])) {
                //                 data[col.name] = 0;
                //             }
                //         });
                //     }
                // });

                let data = BwRule.varList(varList[key], tableData[dataKey], true);
                if(data){
                    postData[key] = data;

                }
            }
        });

        if(!tools.isEmpty(postData)){
            postData.itemId = varList.itemId;
        }

        return postData;
    };

    get ctm(){
        return this.inMain ? this.tm : this.subTm;
    }

    public cancel() {
        if(this.isEditing){
            this.mainSub(tm => tm.table.edit.cancel());
            this.isEditing = false;
            // setTimeout(() => {
            //     debugger;
            this.tm.wrapper.classList.remove('disabled');
            tools.event.fire('editChange', {status: 0}, this.tm.wrapper);
            // this.tm.wrapper.classList.add('disabled');
            // }, 500);
        }

    };

    public save (callback?:Function) {
        let postData = {
                param: <obj[]>[]
            },
            {mainVarList, subVarList} = getMainSubVarList(this.p.tableAddr);

        this.mainSub(tm => tm.table.edit.reshowEditing());

        // 错误提示
        if(!this.checkError()){
            return;
        }

        let loading = new Loading({
            msg: '保存中',
            disableEl: this.tm.wrapper
        });
        // 等待assign, 临时做法
        setTimeout(() => {

            this.mainSub((tm, isMain) => {
                let mainData = this.tm.table.rowSelectDataGet()[0];
                let editData = tm.table.edit.getData();
                if(!isMain){
                    for(let key in editData) {
                        let subData = editData[key][0];
                        if(subData){
                            editData[key].forEach((obj,i) => {
                                editData[key][i] = tools.obj.merge(mainData, obj)
                            });
                        }
                    }
                }

                let data = this.getData(editData, isMain ? mainVarList : subVarList);
                tm.table.edit.reshowEditing();

                if(!tools.isEmpty(data)){
                    postData.param.push(data);
                }
            }, false);

            if(!tools.isEmpty(postData.param)){
                BwRule.Ajax.fetch(CONF.siteUrl + this.p.tableAddr.dataAddr, {
                    type: 'POST',
                    data: postData,
                }).then(({response}) => {
                    // debugger;

                    BwRule.checkValue(response, postData, () => {
                        // debugger;
                        this.mainSub(tm => {
                            // tm.table.edit.cancel();
                            if(document.body.classList.contains('mui-android-4')){
                                sys.window.load(location.href);
                            }else{
                                tm.tableData.refresh(null, () => {
                                    tm.aggregate.get();
                                    tools.event.fire('table-edit-saved', null, this.tm.wrapper);
                                });
                            }
                        });

                        Modal.toast(response.msg);
                        callback && callback();
                        this.cancel();
                    });
                }).finally(() => {
                    loading.destroy();
                });

            }else{
                // table.edit.save();
                loading.destroy();
                this.cancel();
                Modal.toast('没有数据改变');
                callback && callback();
            }
        }, 1800);

    };

    public add(obj?:obj) {
        if(this.inMain){
            this.tm.table.edit.addRow(obj);
        }else{
            this.subTm.table.edit.addRow(obj);
        }
    }

    public del() {
        let subTable = this.subTm ? this.subTm.table : null;
        if(!subTable || tools.isEmpty(subTable.data.get())) {
            this.tm.table.edit.deleteRow((data) => this.canRowInit(this.tm.isSub, this.tm.isSub ? null : data));
        }else if(subTable && !tools.isEmpty(subTable.rowSelectDataGet())) {
            subTable.edit.deleteRow((data) => this.canRowInit(this.tm.isSub, this.tm.isSub ? null : data));
        } else {
            Modal.alert('不能删除有明细的主表数据');
        }
    };

    public getStatus() {
        return this.isEditing;
    }

    public onFocusChange(cb: (isMain: boolean)=> void){
        this.onFocusChangeHandler = cb;
    }
    public reshowEditing(){
        this.ctm && this.ctm.table.edit.reshowEditing()

    }

    public rowData(index: number, data?: obj) {
        return this.ctm && this.ctm.table.edit.rowData(index, data);
    }

}

function editVarHas(varList:IBW_TableAddrParam, hasTypes:string[]) {
    let types = ['update', 'insert', 'delete'];
    if(varList){
        for(let t of types){
            if(hasTypes.indexOf(varList[`${t}Type`]) > -1){
                return true
            }
        }
    }

    return false;
}

function getMainSubVarList(addr: IBW_TableAddr){
    let varlist = {
        mainVarList : <IBW_TableAddrParam>null,
        subVarList : <IBW_TableAddrParam>null,
    };

    addr && Array.isArray(addr.param) && addr.param.forEach(p => {
        if(p.type === 'sub'){
            varlist.subVarList = p;
        }else if(p.type === 'main'){
            varlist.mainVarList = p;
        }
    });

    return varlist;
}