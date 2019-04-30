/// <amd-module name="NewTablePage"/>
import BasicPage from "../basicPage";
import {BwRule} from "../../common/rule/BwRule";
import tools = G.tools;
import sys = BW.sys;
import CONF = BW.CONF;
import {NewTableModule} from "../../module/table/newTableModule";
import d = G.d;
import {QueryModule} from "../../module/query/queryModule";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Loading} from "../../../global/components/ui/loading/loading";
import IComponentPara = G.IComponentPara; import Component = G.Component;
import {BwTableModule} from "../../module/table/BwTableModule";
import {FastTable} from "global/components/newTable/FastTable";
import {Inputs} from "../../module/inputs/inputs";

export interface ITablePagePara extends BasicPagePara{
    ui: IBW_UI<IBW_Table>
}

let queryModuleName = sys.isMb ? 'QueryModuleMb' : 'QueryModulePc';

export class NewTablePage extends BasicPage{

    constructor(para: ITablePagePara) {
        super(para);
        d.classAdd(this.dom.parentElement, 'table-page');
        
        let bwTableEl = para.ui.body.elements[0];
        bwTableEl.subButtons = (bwTableEl.subButtons || []).concat(para.ui.body.subButtons || []);
        console.log('new table page', para, bwTableEl);
        let bwTable = new BwTableElement({
            container: tools.isPc ? this.dom : d.query('body > .mui-content'),
            tableEl: bwTableEl,
            asynData : para.ui.body.elements[1] // 异步查询
        });

        // Shell触发的刷新事件
        this.on(BwRule.EVT_REFRESH, () => {
            bwTable.tableModule && bwTable.tableModule.refresh();
        });
        // 显示当前页时触发的事件
        // d.on(this.dom,BW.EVT_SHOW_PAGE,'',()=>{
        //     bwTable.tableModule.responsive();
        // });
        this.on(BW.EVT_SHOW_PAGE, () => {
            bwTable.tableModule.responsive();
        })
    }
}

interface IBwTableElementPara extends IComponentPara{
    tableEl: IBW_Table 
    asynData? : obj[]
}
export class BwTableElement extends Component{

    tableModule : NewTableModule;
    queryModule: QueryModule;

    protected wrapperInit(para: IBwTableElementPara): HTMLElement {
        return undefined;
    }

    constructor(para: IBwTableElementPara) {
        super(para);
        // d.classAdd(this.dom.parentElement, 'table-page');
        console.log('bw table ele', para);
        let bwTableEl = para.tableEl,
            isDynamic = tools.isEmpty(bwTableEl.cols),
            hasQuery = bwTableEl.querier && ([3, 13].includes(bwTableEl.querier.queryType));

        if(isDynamic) {
            // 动态加载查询模块
            let bwQueryEl:IBw_Query = bwTableEl as any;
            require([queryModuleName], Query => {
                // console.log(this.para)
                let isFirst = true;

                let query = new Query({
                    qm: bwTableEl,
                    refresher: (ajaxData, noQuery, after, before) => {
                        let uiPath = bwQueryEl.uiPath,
                            url = CONF.siteUrl + BwRule.reqAddr(uiPath);

                        ajaxData['output'] = 'json';

                        if(tools.isEmpty(uiPath)) {
                            Modal.alert('查询地址为空');
                            return ;
                        }

                        let loading = new Loading({
                            msg: ' 查询中..'
                        });

                        return BwRule.Ajax.fetch(G.tools.url.addObj(url, ajaxData), {
                            timeout: 30000,
                            needGps: !!uiPath.needGps
                        }).then(({response}) => {
                            delete ajaxData['output'];
                            d.off(window, 'wake');
                            this.tableModule && this.tableModule.destroy();

                            let tableEl =  response.body.elements[0];
                            if(noQuery){
                                tableEl.noQuery = noQuery;
                            }
                            // this.para.tableDom = null;
                            this.tableModule = new NewTableModule({
                                bwEl: tableEl,
                                container: this.container,
                                ajaxData: ajaxData,
                            });
                            this.tableModule.main.ftable.on(FastTable.EVT_RENDERED, () => {
                                let locationLine = tableEl.scannableLocationLine;
                                if(locationLine && ajaxData.mobilescan){
                                    this.tableModule.main.ftable.locateToRow(locationLine,ajaxData.mobilescan);
                                }
                            });

                            if (!sys.isMb) {
                                isFirst && query.toggleCancle();
                                this.tableModule.main.ftable.btnAdd('query', {
                                    content: '查询器',
                                    type: 'default',
                                    icon: 'shaixuan',
                                    onClick: () => {
                                        query.show()
                                    }
                                }, 0);
                            }
                            isFirst = false;

                            if(tableEl.autoRefresh) {
                                sys.window.wake("wake", null);
                                d.on(window, 'wake', () => {
                                    this.tableModule && this.tableModule.refresh();
                                });
                            }

                        }).catch(() => {

                        }).finally(() => {
                            loading.destroy();
                            loading = null;
                        });
                    },
                    cols: [],
                    url: null,
                    container: this.container,
                    tableGet: () => this.tableModule && this.tableModule.main
                });
                !sys.isMb && query.toggleCancle();
                if(sys.isMb) {
                    //打开查询面板
                    d.on(d.query('body > header [data-action="showQuery"]'), 'click',  () => {
                        query.show();
                    });
                }
                if(para.asynData){
                    let asynData = {
                        query : query,
                        qm : bwTableEl,
                        container : this.container,
                        asynData : para.asynData
                    };
                    this.asynQuery(asynData);
                }
            });
        } else {

            this.tableModule = new NewTableModule({
                bwEl: bwTableEl,
                container: this.container
            });

            if(hasQuery) {
                require([queryModuleName], (Query) => {
                    this.queryModule = new Query({
                        qm: bwTableEl.querier,
                        refresher: (ajaxData) => {
                            return this.tableModule.refresh(ajaxData).then(() => {
                                let locationLine = bwTableEl.scannableLocationLine;
                                if(locationLine && ajaxData.mobilescan){
                                    this.tableModule.main.ftable.locateToRow(locationLine,ajaxData.mobilescan);
                                }
                            })
                        },
                        cols: bwTableEl.cols,
                        url: CONF.siteUrl + BwRule.reqAddr(bwTableEl.dataAddr),
                        container: this.container,
                        tableGet: () => this.tableModule.main
                    });
                    if(tools.isMb) {
                        //打开查询面板
                        d.on(d.query('body > header [data-action="showQuery"]'), 'click', () => {
                            this.queryModule.show();
                        });
                    } else {
                        let main = this.tableModule.main;
                        let addBtn = () => {
                            main.ftable.btnAdd('query', {
                                content: '查询器',
                                type: 'default',
                                icon: 'shaixuan',
                                onClick: () => {this.queryModule.show()}
                            }, 0);
                        };
                        if(main.ftable){
                            addBtn()
                        }else{
                            main.on(BwTableModule.EVT_READY, () => {
                                addBtn()
                            });
                        }
                    }
                })
            }
            if(bwTableEl.autoRefresh) {
                sys.window.wake("wake", null);
                d.on(window, 'wake', () => {
                    this.tableModule && this.tableModule.refresh();
                });
            }

        }

        let inputs = para.tableEl.inputs,
            line = para.tableEl.scannableLocationLine,
            querier = para.tableEl.querier;
        if(!isDynamic && bwTableEl.scannableField){
            this.mobileScanInit(bwTableEl);
        }else if(!isDynamic && inputs && !bwTableEl.scannableField){
            this.inputs(inputs, line)
        }else if(line && (!querier || (!querier.inputs && !querier.scannableField))){
            this.locationLine(line, para);
        }
    }

    private asynQuery(asynData){
        require(['AsynQuery'], asyn => {
            new asyn.AsynQuery(asynData);
        })
    }

    private inputs(inputs,line){
        require(['Inputs'], (i) => {
            new i.Inputs({
                inputs: inputs,
                container: this.container,
                locationLine : line,
                table : () => {
                    return this.tableModule && this.tableModule.main.ftable
                },
                tableModule : () => {
                    return this.tableModule
                },
                queryModule : () => {
                    return this.queryModule;
                }
            })
        });
    }

    /**
     * 扫码定位
     * @param line
     * @param para
     */
    private locationLine(line : string, para){
        if(tools.isMb){
            require(['Inputs'], (e) => {
                new e.KeyStep({
                    locationLine : line,
                    callback : (ajaxData) => {
                        this.rowSelect(line, ajaxData);
                    }
                })
            });
        }else {
            let text = '', timer = null;
            d.on(para.container, 'keydown', (e: KeyboardEvent) => {
                let handle = () => {
                    this.rowSelect(line, text);
                    timer = null;
                    text = '';
                },
                    code = e.keyCode || e.which || e.charCode;
                if(code === 13){
                    handle();
                }else {
                    text += e.key;
                    if (timer) {
                        clearTimeout(timer);
                    }
                }

                timer = setTimeout(handle, 1000);
            });
        }

    }

    private rowSelect(line, text){
        let index = this.tableModule.main.ftable.locateToRow(line, text, true);
        if(tools.isNotEmpty(index) && this.tableModule.bwEl.subTableList){
            this.tableModule.subRefreshByIndex(index);
        }
    }

    private mobileScanInit(ui: IBW_Table) {
        let field = ui.scannableField;
        if (tools.isPc) {
            return;
        }
        require(['MobileScan'],  (M) => {
            new M.MobileScan({
                container: this.container,
                cols: ui.cols,
                scannableField : field.toUpperCase(),
                scannableType : ui.scannableType,
                scannableTime : ui.scannableTime,
                callback: (ajaxData) => {
                    let query = this.queryModule,
                        table = this.tableModule;
                    if(query){
                        query.hide();
                        return query.search(ajaxData, true)
                    }else {
                        return table.refresh(Object.assign(table.main.ajaxData, ajaxData)).then(() => {
                            let locationLine = ui.scannableLocationLine;
                            if(locationLine){
                                table.main.ftable.locateToRow(locationLine, ajaxData.mobilescan)
                            }
                        })
                    }
                }
            });
        });
    }
}