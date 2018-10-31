/// <amd-module name="PlanPage"/>

import BasicPage from "../basicPage";

import {HorizontalQueryModule} from "../../module/query/horizontalFormFactory";
import {DrawPoint} from "../../module/DrawPoint/DrawPoint";
import {BwRule} from "../../common/rule/BwRule";
import d = G.d;
import tools = G.tools;
import {PlanModule} from "../../module/plan/planModule";

interface IPlanPagePara extends BasicPagePara {
    ui: IBW_UI<IBW_Table>
}

interface IUiPagePara {
    body: object;
}

export class PlanPage extends BasicPage {
    private wrapper: HTMLElement;

    constructor(para: IPlanPagePara) {
        super(para);
        console.log(para);
        let qData = para.ui.body.elements[0];
        d.append(para.dom, this.wrapper = <div class="plan-wrapper">
            <HorizontalQueryModule qm={{
                autTag: qData['autTag'],
                hasOption: qData['hasOption'],
                queryType: qData['queryType'],
                queryparams1: qData['queryparams1'],
                scannableTime: 0,
                uiPath: qData['uiPath'],
                setting: null
            }} search={
                (data) => {
                    return new Promise((resolve) => {
                        //
                        console.log(data);
                        let actionAddr = G.tools.url.addObj(qData['uiPath'].dataAddr, data);
                        console.log(actionAddr);
                        resolve(data)
                    })
                }
            }/>
        </div>);

        //下半部
        BwRule.Ajax.fetch(BW.CONF.siteUrl + tools.url.addObj(qData['uiPath'].dataAddr, {output: 'json'}), {}).then(({response}) => {
            let ui = response.body.elements[0];
            console.log(ui);
            let planModule = new PlanModule({
                ui: ui,
                container: this.wrapper
            });
        })
    }

}