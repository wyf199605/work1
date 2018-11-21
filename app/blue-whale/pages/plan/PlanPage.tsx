/// <amd-module name="PlanPage"/>

import BasicPage from "../basicPage";

import {HorizontalQueryModule} from "../../module/query/horizontalFormFactory";
import {DrawPoint} from "../../module/DrawPoint/DrawPoint";
import {BwRule} from "../../common/rule/BwRule";
import d = G.d;
import tools = G.tools;
import {PlanModule} from "../../module/plan/planModule";
import {Loading} from "../../../global/components/ui/loading/loading";
import {Modal} from "../../../global/components/feedback/modal/Modal";


interface IPlanPagePara extends BasicPagePara {
    ui: IBW_UI<IBW_Plan_Table>
}

export class PlanPage extends BasicPage {
    private wrapper: HTMLElement;

    constructor(para: IPlanPagePara) {
        super(para);
        let planModule: PlanModule;

        console.log(para);
        //下半部
        this.getUi(para.ui).then(res => {
            let qData = res.query;
            d.append(para.dom, this.wrapper = <div class="plan-wrapper">
                <HorizontalQueryModule qm={{
                    autTag: qData['autTag'],
                    hasOption: qData['hasOption'],
                    queryType: qData['queryType'],
                    queryparams1: qData['queryparams0'] || qData['queryparams1'] || qData['atvarparams'],
                    scannableTime: 0,
                    uiPath: qData['uiPath'],
                    setting: null
                }} search={(data) => {
                    console.log(data)
                    let f = 0 ,F = 0;
                    for( let re in data){
                           if(tools.isEmpty(data[re])){
                               F++
                           }
                           f++
                    }
                    if(f !== F){
                        planModule && planModule.refresh(data);
                    }else {
                        Modal.alert('没有图层');
                    }
                }}/>
            </div>);

            planModule = new PlanModule({
                ui: res.ui,
                container: this.wrapper
            });
        });
        // BwRule.Ajax.fetch(BW.CONF.siteUrl + tools.url.addObj(qData['uiPath'].dataAddr, {output: 'json'}), {}).then(({response}) => {
        //     let ui = response.body.elements[0];
        //     console.log(ui);
        //     planModule = new PlanModule({
        //         ui: ui,
        //         container: this.wrapper
        //     });
        // })

        this.on(BwRule.EVT_REFRESH, () => {
            planModule && planModule.refresh(planModule.ajaxData);
        });
    }

    getUi(ui: IBW_UI<IBW_Plan_Table>): Promise<obj>{
        return new Promise((resolve, reject) => {
            let qData = ui.body.elements[0];
            if(ui.uiType === 'query'){
                let loading = new Loading({});
                loading.show();
                BwRule.Ajax.fetch(BW.CONF.siteUrl + tools.url.addObj(qData['uiPath'].dataAddr, {output: 'json'}), {}).then(({response}) => {
                    let ui = response.body.elements[0];
                    ui.subButtons = (ui.subButtons || []).concat(response.body.subButtons || []);
                    resolve({
                        ui,
                        query: qData
                    });
                }).catch((e) => {
                    reject(e);
                }).finally(() => {
                    loading.hide();
                    loading = null;
                });
            }else{
                qData.subButtons = (qData.subButtons || []).concat(ui.body.subButtons || []);
                resolve({
                    ui: qData,
                    query: qData.querier
                });
            }
        })
    }

}