/// <amd-module name="ListDetailPage"/>

import BasicPage from "../basicPage";
import {ListItemDetail} from "../../module/listDetail/ListItemDetail";
import {Button} from "../../../global/components/general/button/Button";
import {NewQueryModal} from "../../module/newQuery/NewQueryModal";
import {BwRule} from "../../common/rule/BwRule";
import {RangeInput} from "../../module/newQuery/RangeInput";
import {dateType} from "../../../global/components/form/datetime/datetime";

export class ListDetailPage extends BasicPage {
    constructor(private para: EditPagePara) {
        super(para);
        // new ListItemDetail(para);

        new Button({
            content: '点我',
            container: para.dom,
            onClick: () => {
                BwRule.Ajax.fetch(BW.CONF.ajaxUrl.queryTest).then(({response}) => {
                    let dataStr: string = response.body.elements[0].querier.mobileSetting.settingValue;
                    dataStr = dataStr.replace(/\s*/g, '').replace(/\\*/g, '');
                    new NewQueryModal({
                        queryItems: JSON.parse(dataStr)
                    })

                });
                // let data = JSON.parse("[{\"filedName\":\"NOBUGS_BD\",\"caption\":\"后端责任人\",\"interval\":3,\"optionValue\":[[\"黄金财\",\"HJC\"],[\"李志峰\",\"LZF\"],[\"王明权\",\"WMQ\"]]},{\"filedName\":\"CREATETIME\",\"caption\":\"创建时间\",\"interval\":2,\"optionValue\":[[\"2018-11-01\",\"2018-11-3023:59:59\"]]},{\"filedName\":\"NOBUGS_SORTED\",\"caption\":\"分类\",\"interval\":3,\"optionValue\":[[\"前端问题\"],[\"配置问题\"],[\"后台问题\"]]},{\"filedName\":\"NOBUGS_STATUS\",\"caption\":\"状态\",\"interval\":4,\"optionValue\":[[\"open\"],[\"confirm\"],[\"fixed\"],[\"reopen\"],[\"close\"],[\"pending\"],[\"和熊猫一样错误\"]]},{\"filedName\":\"NOBUGS_ID\",\"caption\":\"问题序号\",\"interval\":0,\"optionValue\":[[\"10100\",\"10110\"],[\"10100\",\"10110\"],[\"10100\",\"10110\"]]}]");
                // new NewQueryModal({
                //     queryItems: data
                // })
            }
        })
    }
}