/// <amd-module name="PlanPage"/>

import BasicPage from "../basicPage";

import {HorizontalQueryModule} from "../../module/query/horizontalFormFactory";
import {DrawPoint} from "../../module/DrawPoint/DrawPoint";
import {BwRule} from "../../common/rule/BwRule";
import d = G.d;
import {PlanModule} from "../../module/plan/planModule";

interface IPlanPagePara extends BasicPagePara {
    ui: IBW_UI<IBW_Table>


}

interface IUiPagePara {
    body: object;
}

export class PlanPage extends BasicPage {
    private wrapper: HTMLElement;
    private draw;
    private imageUrl: string;
    private isDrawLine: boolean = false;

    constructor(para: IPlanPagePara) {
        super(para);
        this.wrapper = para.dom;
        let qData = para.ui.body.elements[0];
        this.InitGetUi(qData['uiPath'].dataAddr).then((res: IUiPagePara) => {
            console.log(res);
            //查询器初始化

            this.imageUrl = BW.CONF.siteUrl + res['backGround']['dataAddr'];
            d.append(this.wrapper, <div class="plan-wrapper">
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
                            let actionAddr = G.tools.url.addObj(qData['uiPath'].dataAddr, data)
                            console.log(actionAddr);
                            resolve(data)
                        })
                    }
                }/>
                <PlanModule/>
                <div class="plan-opera">
                    <div>
                        <i className="iconfont icon-chexiao"></i><span>撤消(Backspace键)</span>
                    </div>
                    <div class="finsh-point" onclick={
                        () => {
                            //完成编辑--------

                            //把point 清楚
                            let paths = G.d.queryAll(".drawPage>svg>g>path");
                            console.log(paths.length);
                            console.log(this.draw.getPoints());
                            this.draw.setIsDrawLine(false);
                            this.draw.fished(paths.length);

                            let btn = d.queryAll('.plan-opera>div');
                            btn.forEach((res) => {
                                d.classRemove(res, 'custom-button');
                            })
                            let currBtn = d.query('.plan-opera>.finsh-point');
                            d.classAdd(currBtn, 'custom-button');

                        }
                    }>
                        <i class="iconfont icon-wanchengbianji"><span>完成编辑</span></i>
                    </div>
                    <div class="miao-dian" onclick={
                        () => {
                            console.log('开始描点')
                            let btn = d.queryAll('.plan-opera>div');
                            btn.forEach((res) => {
                                d.classRemove(res, 'custom-button');
                            })

                            let currBtn = d.query('.plan-opera>.miao-dian');
                            d.classAdd(currBtn, 'custom-button');
                            //------------------开始绘图
                            let paths = G.d.queryAll(".drawPage>svg>g>path");
                            this.draw.setIsDrawLine(true);
                            this.draw.createPath(paths.length);


                        }
                    }>
                        <i class="iconfont icon-maodian"><span>描点</span></i>
                    </div>
                    <div class="edit-dian" onclick={
                        () => {
                            console.log('开始编辑')
                            let btn = d.queryAll('.plan-opera>div');
                            btn.forEach((res) => {
                                d.classRemove(res, 'custom-button');
                            })

                            let currBtn = d.query('.plan-opera>.edit-dian');
                            d.classAdd(currBtn, 'custom-button');
                            //------------------开始绘图

                            this.draw.editPoint();


                        }
                    }>
                        <i className="iconfont icon-bianjimaodian"><span>编辑描点</span></i>
                    </div>
                    <div>
                        <i className="iconfont icon-tuodong"><span>拖动(空格键+左击)</span></i>
                    </div>
                    <div>
                        <i className="iconfont icon-suofang"><span>缩放(滚轮)</span></i>
                    </div>
                </div>
            </div>);

            let drawContent = <div class="drawPage" id="drawPage">

            </div>;

            d.append(this.wrapper, drawContent)
            console.log(this.imageUrl);
            this.draw = new DrawPoint({
                wraperId: '#drawPage',
                height: 400,
                width: 700,
                image: this.imageUrl + "&sho_id=20"

            })
        })

        //下半部

    }

    private InitGetUi(url: string) {
        return new Promise((resolve) => {
            BwRule.Ajax.fetch(BW.CONF.siteUrl + G.tools.url.addObj(url, {output: 'json'}), {}).then(({response}) => {
                let JSON = response.body.elements[0]
                console.log(JSON)
                resolve(JSON)

            })

        })
    }

    private InitDrawPoint() {


    }


}