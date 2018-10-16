/// <amd-module name="FlowEngine"/>

import d = G.d;
import BasicPage from "../../pages/basicPage";
import {FlowDesigner} from "./FlowDesigner";
import {Button} from "../../../global/components/general/button/Button";

export class FlowEngine extends BasicPage {
    constructor(para) {
        super(para);
        new Button({
            content: '流程设计',
            container: para.dom,
            onClick: () => {
                new FlowDesigner()
            }
        })
    }
}