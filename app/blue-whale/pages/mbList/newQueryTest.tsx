/// <amd-module name="NewQueryTest"/>

import BasicPage from "../basicPage";
import {ITablePagePara} from "../table/newTablePage";
import {NewQueryModalMb} from "../../module/newQuery/NewQueryModalMb";
import {BwRule} from "../../common/rule/BwRule";
import tools = G.tools;
import d = G.d;
import {NewTableModule} from "../../module/table/newTableModule";

export class NewQueryTest extends BasicPage {
    private query: NewQueryModalMb;
    private tableModule : NewTableModule;
    constructor(para: ITablePagePara) {
        super(para);
        let bwTableEl = para.ui.body.elements[0];
        this.tableModule = new NewTableModule({
            container: tools.isPc ? this.dom : d.query('body > .mui-content'),
            bwEl: bwTableEl
        });
        let dataStr = bwTableEl.querier.mobileSetting.settingValue.replace(/\s*/g, '').replace(/\\*/g, '');
        d.on(d.query('body > header [data-action="new-query"]'), 'click', () => {
            if (this.query){
                this.query.isShow = true;
            }else{
                this.query = new NewQueryModalMb({
                    queryItems: JSON.parse(dataStr),
                    search: (data) => {
                        let url = BW.CONF.siteUrl + '/app_sanfu_retail/null/list/node_nobugs?pageparams=%7B%22index%22%3D1%2C%22size%22%3D50%2C%22total%22%3D1%7D';
                        url = tools.url.addObj(url, {
                            mqueryparams: JSON.stringify(data)
                        });
                        BwRule.Ajax.fetch(url).then(({response}) => {
                            // this.tableModule
                        })
                    }
                });
            }
        });
    }
}