/// <amd-module name="BwMbList"/>
import IComponentPara = G.IComponentPara;
import BasicPage from "../basicPage";
import {MbListModule} from "../../module/mbListModule/mbListModule";
import tools = G.tools;
import {MbListView} from "../../module/mbListModule/mbListView";
import {BwRule} from "../../common/rule/BwRule";
import {QueryModule} from "../../module/query/queryModule";
import d = G.d;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Loading} from "../../../global/components/ui/loading/loading";
import CONF = BW.CONF;
import sys = BW.sys;
import {NewQueryModalMb} from "../../module/newQuery/NewQueryModalMb";

export interface IBwMbList extends IComponentPara {
    ui: IBW_UI<IBW_Table> | IBW_UI<R_SubTable_Field>;
    dom: HTMLElement;
    title?: string;
}

export class BwMbList extends BasicPage {
    private bwMbList: BwMbListElement;

    constructor(private para: IBwMbList) {
        super(para);
        switch (para.ui.uiType) {
            case 'layout': {
                let ui = para.ui as IBW_UI<IBW_Table>;
                if (tools.isNotEmpty(ui) && tools.isNotEmpty(ui.body.elements[0].layout)) {
                    this.bwMbList = new BwMbListElement({
                        ui: ui,
                        container: para.dom,
                        url: this.url
                    });
                }
                this.on(BwRule.EVT_REFRESH, () => {
                    this.bwMbList.mbListModule.refresh();
                })
            }
                break;
            case 'view': {
                let ui = para.ui as IBW_UI<R_SubTable_Field>;
                let mbList = new MbListView({
                    ui: ui,
                    container: para.dom,
                    url: this.url
                });
                this.on(BwRule.EVT_REFRESH, () => {
                    mbList.refresh();
                })
            }
                break;
        }
    }

}

interface IBwMbListElementPara {
    ui: IBW_UI<IBW_Table>
    asynData?: obj[];
    container?: HTMLElement;
    url: string;
}

let queryModuleName = 'QueryModulePc';

class BwMbListElement {

    mbListModule: MbListModule;
    queryModule: QueryModule | NewQueryModalMb;

    constructor(para: IBwMbListElementPara) {
        let bwTableEl = para.ui.body.elements[0],
            isDynamic = tools.isEmpty(bwTableEl.cols),
            hasQuery = bwTableEl.querier && ([3, 13].includes(bwTableEl.querier.queryType));
        if (isDynamic) {
            // 动态加载查询模块
            let bwQueryEl: IBw_Query = bwTableEl as any;
            if (tools.isMb) {
                let dataStr = '';
                if (tools.isNotEmpty(bwTableEl.querier.mobileSetting)) {
                    dataStr = bwTableEl.querier.mobileSetting.settingValue.replace(/\s*/g, '').replace(/\\*/g, '');
                }
                let isFirst = true;
                let query = new NewQueryModalMb({
                    queryItems: tools.isNotEmpty(dataStr) ? JSON.parse(dataStr) : [],
                    advanceSearch: bwTableEl.querier,
                    cols: bwTableEl.cols,
                    refresher: (ajaxData, noQuery) => {
                        let uiPath = bwQueryEl.uiPath,
                            url = CONF.siteUrl + BwRule.reqAddr(uiPath);
                        ajaxData['output'] = 'json';
                        if (tools.isEmpty(uiPath)) {
                            Modal.alert('查询地址为空');
                            return;
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
                            this.mbListModule && this.mbListModule.destroy();
                            let tableEl = response.body.elements[0];
                            if (noQuery) {
                                tableEl.noQuery = noQuery;
                            }
                            this.mbListModule = new MbListModule({
                                ui: response,
                                container: para.container,
                                ajaxData: ajaxData,
                                url: para.url
                            });
                            isFirst = false;
                            if (tableEl.autoRefresh) {
                                sys.window.wake("wake", null);
                                d.on(window, 'wake', () => {
                                    this.mbListModule && this.mbListModule.refresh();
                                });
                            }

                        }).catch(() => {

                        }).finally(() => {
                            loading.destroy();
                            loading = null;
                        });
                    },
                    search: (data: obj) => {
                        return this.mbListModule.refresh(data);
                    }
                });
                d.on(d.query('body > header [data-action="layout-query"]'), 'click', () => {
                    query.isShow = true;
                });
                if (para.asynData && tools.isNotEmpty(bwTableEl.querier.mobileSetting)) {
                    let asynData = {
                        query: query.query,
                        qm: bwTableEl,
                        container: para.container,
                        asynData: para.asynData
                    };
                    this.asynQuery(asynData);
                }
            } else {
                require([queryModuleName], Query => {
                    let isFirst = true;
                    let query = new Query({
                        qm: bwTableEl,
                        refresher: (ajaxData, noQuery) => {
                            let uiPath = bwQueryEl.uiPath,
                                url = CONF.siteUrl + BwRule.reqAddr(uiPath);

                            ajaxData['output'] = 'json';
                            if (tools.isEmpty(uiPath)) {
                                Modal.alert('查询地址为空');
                                return;
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
                                this.mbListModule && this.mbListModule.destroy();
                                let tableEl = response.body.elements[0];
                                if (noQuery) {
                                    tableEl.noQuery = noQuery;
                                }
                                this.mbListModule = new MbListModule({
                                    ui: response,
                                    container: para.container,
                                    ajaxData: ajaxData,
                                    url: para.url
                                });
                                isFirst && query.toggleCancle();
                                this.mbListModule.queryBtnAdd({
                                    content: '查询',
                                    className: 'list-query',
                                    onClick: () => {
                                        query.show();
                                    }
                                });
                                isFirst = false;
                                if (tableEl.autoRefresh) {
                                    sys.window.wake("wake", null);
                                    d.on(window, 'wake', () => {
                                        this.mbListModule && this.mbListModule.refresh();
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
                        container: para.container
                    });
                    query.toggleCancle();
                    if (para.asynData) {
                        let asynData = {
                            query: query,
                            qm: bwTableEl,
                            container: para.container,
                            asynData: para.asynData
                        };
                        this.asynQuery(asynData);
                    }
                });
            }
        } else {
            this.mbListModule = new MbListModule({
                ui: para.ui,
                container: para.container,
                url: para.url
            });
            if (hasQuery) {
                if (tools.isMb) {
                    let dataStr = '';
                    if (tools.isNotEmpty(bwTableEl.querier.mobileSetting)) {
                        dataStr = bwTableEl.querier.mobileSetting.settingValue.replace(/\s*/g, '').replace(/\\*/g, '');
                    }
                    if (tools.os.ios) {
                        setTimeout(() => {
                            this.queryModule = new NewQueryModalMb({
                                queryItems: tools.isNotEmpty(dataStr) ? JSON.parse(dataStr) : [],
                                advanceSearch: bwTableEl.querier,
                                cols: bwTableEl.cols,
                                refresher: (data: obj) => {
                                    return this.mbListModule.refresh(data);
                                },
                                search: (data: obj) => {
                                    return this.mbListModule.refresh(data);
                                }
                            });
                        }, 200);
                    } else {
                        this.queryModule = new NewQueryModalMb({
                            queryItems: tools.isNotEmpty(dataStr) ? JSON.parse(dataStr) : [],
                            advanceSearch: bwTableEl.querier,
                            cols: bwTableEl.cols,
                            refresher: (data: obj) => {
                                return this.mbListModule.refresh(data);
                            },
                            search: (data: obj) => {
                                return this.mbListModule.refresh(data);
                            }
                        });
                    }
                    d.on(d.query('body > header [data-action="layout-query"]'), 'click', () => {
                        (this.queryModule as NewQueryModalMb).isShow = true;
                    });
                } else {
                    require([queryModuleName], (Query) => {
                        this.queryModule = new Query({
                            qm: bwTableEl.querier,
                            refresher: (ajaxData) => {
                                return this.mbListModule.refresh(ajaxData);
                            },
                            cols: bwTableEl.cols,
                            url: CONF.siteUrl + BwRule.reqAddr(bwTableEl.dataAddr),
                            container: para.container
                        });
                        this.mbListModule.queryBtnAdd({
                            content: '查询',
                            className: 'list-query',
                            onClick: () => {
                                (this.queryModule as QueryModule).show()
                            }
                        });
                    });
                }
            }
            if (bwTableEl.autoRefresh) {
                sys.window.wake("wake", null);
                d.on(window, 'wake', () => {
                    this.mbListModule && this.mbListModule.refresh();
                });
            }
        }
    }

    private asynQuery(asynData) {
        require(['AsynQuery'], asyn => {
            new asyn.AsynQuery(asynData);
        })
    }
}