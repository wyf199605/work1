/// <amd-module name="ListDetailPage"/>

import BasicPage from "../basicPage";
import {ListItemDetail} from "../../module/listDetail/ListItemDetail";
import {Button} from "../../../global/components/general/button/Button";
import {NewQueryModal} from "../../module/newQuery/NewQueryModal";

export class ListDetailPage extends BasicPage {
    constructor(private para: EditPagePara) {
        super(para);
        // new ListItemDetail(para);
        new Button({
            content: '点我',
            container:para.dom,
            onClick: () => {
                new NewQueryModal({
                    queryItems: [{
                        filedName: "NOBUGS_LEVEL",
                        caption: "优先级",
                        interval: 4,
                        optionValue: [
                            ["低"],
                            ["中"],
                            ["高"],
                            ["非常高"],
                            ["紧急"]
                        ]
                    }]
                })
            }
        })
    }
}