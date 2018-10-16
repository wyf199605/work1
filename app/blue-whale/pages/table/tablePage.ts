///<amd-module name="TablePage"/>
import {BwRule} from "../../common/rule/BwRule";
import {TableModule} from "../../module/table/tableModule";
import TableModulePc = require('../../module/table/tableModulePc');
import d = G.d;
import CONF = BW.CONF;
import sys = BW.sys;
import {Button} from "../../../global/components/general/button/Button";
import BasicPage from "../basicPage";
import {BugReportModal} from "../../module/BugReport/BugReport";

export abstract class TablePage extends BasicPage{
    protected tableModule : TableModule;
    // protected queryModule : QueryModuleData;
    protected abstract initTable(tableModule:typeof TableModule,newMtPara : TableModulePara,queryData : obj);
    // protected abstract initQuery(queryModule:typeof QueryModuleData, para : QueryModulePara);

    constructor(protected para : TablePagePara, callback?: Function){
        super(<TablePagePara>para);
        let mtPara = this.para.mtPara;
        if(G.tools.isEmpty(mtPara.cols)){
            // 有查询器
            let queryModuleName = BW.sys.isMb ? 'QueryModuleMb' : 'QueryModulePc';
            // 动态加载查询模块
            require([queryModuleName], Query => {
                // console.log(this.para)
                let isFirst = true,
                    container = d.closest(sys.isMb ? this.para.tableDom : this.para.dom, '.page-container');
                let query = new Query({
                    qm: mtPara,
                    refresher: (ajaxData, after, before) => {
                        let url = CONF.siteUrl + BwRule.reqAddr(mtPara.uiPath);
                        ajaxData['output'] = 'json';

                        BwRule.Ajax.fetch(G.tools.url.addObj(url, ajaxData), {
                            timeout: 30000,
                            defaultCallback: false,
                            needGps: mtPara && mtPara.uiPath && !!mtPara.uiPath.needGps
                        }).then(({response}) => {
                            delete ajaxData['output'];
                            this.tableModule && this.tableModule.destroy();
                            this.tableModule = null;
                            this.para.tableDom = null;
                            let cb = () => {
                                if (!sys.isMb) {
                                    isFirst && query.toggleCancle();
                                    this.tableModule.rightBtns.add(new Button({
                                        content: '查询器',
                                        type: 'default',
                                        icon: 'shaixuan',
                                        onClick: () => {
                                            query.show();
                                        }
                                    }))
                                }
                                isFirst = false;
                                typeof callback === 'function' && callback();
                                this.tableModule.tableData.cbFun.setOuterAfter(after);
                                this.tableModule.tableData.cbFun.setOuterBefore(before);
                            };
                            this.requireTable(response.body.elements[0], ajaxData, cb);
                        }).catch(() => {

                        });

                    },
                    cols: [],
                    url: null,
                    container: container,
                    tableGet: () => null
                });
                !sys.isMb && query.toggleCancle();
                if(sys.isMb) {
                    //打开查询面板
                    d.on(d.query('body > header [data-action="showQuery"]'), 'click',  () => {
                        query.show();
                    });
                }
                if(mtPara.asynData){
                    let asynData = {
                        query : query,
                        qm : mtPara,
                        container : container,
                    };
                    this.asynQuery(asynData);
                }
            });
            // tools.obj.merge(true, )
        }
        else{
            this.requireTable(mtPara,null,callback);
        }
    }

    // private initTableCommon(tableModule : typeof TableModule){}


    private requireTable(newMtPara: TableModulePara, queryData: obj, callback?: Function) {
        BwRule.beforeHandle.table(newMtPara);
        let tableModuleName = this.isMb ? 'TableModuleMb' : 'TableModulePc';
        require([tableModuleName], (tableModule: typeof TableModule) => {
            this.initTable(tableModule, newMtPara, queryData);
            let tm = this.tableModule;
            this.on(BwRule.EVT_REFRESH, () => {
                tm && tm.refresher(null, () => {
                    tm.aggregate.get();
                });
            });
            //excel表格数据添加
            this.on('table-data-add', (e: CustomEvent) => {
                //进入编辑模式
                this.tableModule.editBtns.edit();
                setTimeout( () => {
                    // console.log(e.detail,this.tableModule.table.copy.match(e.detail));
                    this.tableModule.table.copy.match(e.detail).forEach(obj => {
                        this.tableModule.tableEdit.add(obj);
                    });
                }, 800);
            });

            typeof callback === 'function' && callback();
        })
    }

    private asynQuery(data){
        require(['AsynQuery'], asyn => {
            new asyn.AsynQuery(G.tools.obj.merge(this.para,{
                asynData : data
            }));
        })
    }
}