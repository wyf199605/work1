/// <amd-module name="ListDetailPage"/>

import BasicPage from "../basicPage";
import {ListItemDetail} from "../../module/listDetail/ListItemDetail";
import {Button} from "../../../global/components/general/button/Button";
import {BwRule} from "../../common/rule/BwRule";
import {NewQueryModalMb} from "../../module/newQuery/NewQueryModalMb";
import tools = G.tools;

export class ListDetailPage extends BasicPage {
    constructor(private para: EditPagePara) {
        super(para);
        new ListItemDetail(para);
        // new Button({
        //     content: '点我',
        //     container: para.dom,
        //     onClick: () => {
        //         BwRule.Ajax.fetch(BW.CONF.ajaxUrl.queryTest).then(({response}) => {
        //             let dataStr: string = response.body.elements[0].querier.mobileSetting.settingValue;
        //             dataStr = dataStr.replace(/\s*/g, '').replace(/\\*/g, '');
        //             new NewQueryModalMb({
        //                 queryItems: JSON.parse(dataStr),
        //                 search: (data) => {
        //                     let url = BW.CONF.siteUrl + '/app_sanfu_retail/null/list/node_nobugs?pageparams=%7B%22index%22%3D1%2C%22size%22%3D50%2C%22total%22%3D1%7D';
        //                     url = tools.url.addObj(url,{
        //                         mqueryparams:JSON.stringify(data)
        //                     });
        //                     BwRule.Ajax.fetch(url).then(({response})=>{
        //                         console.log(response)
        //                     })
        //                 }
        //             })
        //         });
        //     }
        // })
    }
}
