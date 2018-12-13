/// <amd-module name="BwMbList"/>
import IComponentPara = G.IComponentPara;
import BasicPage from "../basicPage";
import {MbListModule} from "../../module/mbListModule/mbListModule";
import tools = G.tools;
import {MbListView} from "../../module/mbListModule/mbListView";
import {NewQueryModalMb} from "../../module/newQuery/NewQueryModalMb";
import {BwRule} from "../../common/rule/BwRule";
import {QueryModule} from "../../module/query/queryModule";
import d = G.d;

export interface IBwMbList extends IComponentPara {
    ui: IBW_UI<IBW_Table> | IBW_UI<R_SubTable_Field>;
    dom: HTMLElement;
    title?: string;
}

export class BwMbList extends BasicPage {

    private mbListModule: MbListModule;

    constructor(private para: IBwMbList) {
        super(para);
        switch (para.ui.uiType) {
            case 'layout': {
                let ui = para.ui as IBW_UI<IBW_Table>;
                if (tools.isNotEmpty(ui) && tools.isNotEmpty(ui.body.elements[0].layout)) {
                    this.mbListModule = new MbListModule({
                        ui: ui,
                        container: para.dom,
                        url: this.url
                    });
                    this.queryEvent(ui);
                }
                this.on(BwRule.EVT_REFRESH, () => {
                    this.mbListModule.refresh();
                })
            }
                break;
            case 'view': {
                let ui = para.ui as IBW_UI<R_SubTable_Field>;
                new MbListView({
                    ui: ui,
                    container: para.dom
                })
            }
                break;
        }

    }

    private newQuery: NewQueryModalMb;
    private oldQuery: QueryModule;

    private queryEvent(ui: IBW_UI<IBW_Table>) {
        d.on(d.query('body > header [data-action="layout-query"]'), 'click', () => {
            let bwTableEl = ui.body.elements[0], mobileSetting = bwTableEl.querier.mobileSetting;
            if (tools.isEmpty(mobileSetting) || tools.isEmpty(mobileSetting.settingValue)) {
                if (this.oldQuery) {
                    this.oldQuery.show();
                } else {
                    require([NewQueryModalMb.QUERY_MODULE_NAME], (Query) => {
                        let query: QueryModule = new Query({
                            qm: bwTableEl.querier,
                            container: document.body,
                            refresher: (data: obj) => {
                                return this.mbListModule.refresh(data);
                            },
                            cols: bwTableEl.cols,
                            url: BW.CONF.siteUrl + BwRule.reqAddr(bwTableEl.dataAddr)
                        });
                        query.show();
                    })
                }
            } else {
                let dataStr = mobileSetting.settingValue.replace(/\s*/g, '').replace(/\\*/g, '');
                if (this.newQuery) {
                    this.newQuery.isShow = true;
                } else {
                    this.newQuery = new NewQueryModalMb({
                        queryItems: JSON.parse(dataStr),
                        advanceSearch: bwTableEl.querier,
                        search: (data) => {
                            let url = BW.CONF.siteUrl + '/app_sanfu_retail/null/list/node_nobugs?pageparams=%7B%22index%22%3D1%2C%22size%22%3D50%2C%22total%22%3D1%7D';
                            url = tools.url.addObj(url, {
                                mqueryparams: JSON.stringify(data)
                            });
                        },
                        cols: bwTableEl.cols,
                        refresher: (data: obj) => {
                            return this.mbListModule.refresh(data);
                        }
                    });
                }
            }
        });

    }
}