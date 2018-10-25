/// <amd-module name="PlanPage"/>

import BasicPage from "../basicPage";
import d = G.d;
import {HorizontalQueryModule} from "../../module/query/horizontalFormFactory";
import {DrawPoint} from "../../module/DrawPoint/DrawPoint";

interface IPlanPagePara extends BasicPagePara{
    ui: IBW_UI<IBW_Table>
}

export class PlanPage extends BasicPage{
    private wrapper:HTMLElement;
    private draw;
    constructor(para: IPlanPagePara) {
        super(para);
        this.wrapper = para.dom;
        let qData = para.ui.body.elements[0];
        console.log(qData);

        let content = <div class="plan-Head"><HorizontalQueryModule qm={{
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
                    console.log(data.params);

                    resolve(data)
                })
            }
        }
        />
            <div class="plan-opera">
                <div>
                    <i className="iconfont icon-chexiao"></i><span>撤消(Backspace键)</span>
                </div>
                <div>
                    <i class="iconfont icon-wanchengbianji"><span>完成编辑</span></i>
                </div>
                <div>
                    <i class="iconfont icon-maodian"><span>描点</span></i>
                </div>
                <div>
                    <i className="iconfont icon-bianjimaodian"><span>编辑描点</span></i>
                </div>
                <div>
                    <i className="iconfont icon-tuodong"><span>拖动(空格键+左击)</span></i>
                </div>
                <div>
                    <i className="iconfont icon-suofang"><span>缩放(滚轮)</span></i>
                </div>
            </div>
        </div>
        d.append(this.wrapper, content)
        //下半部
        let drawContent = <div class="drawPage" id="drawPage">

            }
        </div>
        d.append(this.wrapper, drawContent)

        this.draw = new DrawPoint({
            wraperId: '#drawPage',
            height: 400,
            width: 700
        })

    }
    private InitDrawPoint(){



    }




}