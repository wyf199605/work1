/// <amd-module name="ReportActivityPage"/>

import SPAPage = G.SPAPage;
import d = G.d;
import {BasicInfo} from "./BasicInfo";
import {RuleSetting} from "./RuleSetting";
import {GroupOriented} from "./GroupOriented";
import {ReportActivityData} from "./ReportActivityData";
import {LeRule} from "../../../common/rule/LeRule";
import tools = G.tools;
import CONF = LE.CONF;
import SPA = G.SPA;


export class ReportActivityPage extends SPAPage {
    constructor(para){
        super(para);
        this.isOnceClose = true;
    }
    set title(t: string) {
        this._title = t;
    }

    get titlt() {
        return this._title;
    }

    // 申报活动数据
    static reportData: ReportActivityData;
    static activityId: string;
    static state:string;

    private allStep: obj[];

    protected wrapperInit(): Node {
        let basicInfo: BasicInfo = null,
            ruleSetting: RuleSetting = null,
            groupOriented: GroupOriented = null;
        let activityPageHTML = <div className="activity-page">
            <div className="top">
                <div className="title">申报活动</div>
                <div className="back"><i className="sec seclesson-fanhui"></i>返回</div>
            </div>
            <div className="reportWrapper">
                <div className="contentWrapper">
                    <div className="stepBar">
                        <div className="stepWrapper">
                            <div className="line"></div>
                            <div className="step-item active" data-index="0">
                                <div className="ball"></div>
                                <div className="text">基础信息</div>
                            </div>
                            <div className="step-item" data-index="1">
                                <div className="ball"></div>
                                <div className="text">规则设置</div>
                            </div>
                            <div className="step-item" data-index="2">
                                <div className="ball"></div>
                                <div className="text">面向对象</div>
                            </div>
                        </div>
                    </div>
                    <div className="stepContent">
                        {basicInfo = <BasicInfo isNotShow={false} clickHandler={() => {
                            this.nextStep(1);
                        }}/>}
                        {ruleSetting = <RuleSetting isNotShow={true} preStepHandler={() => {
                            this.nextStep(0);
                        }} nextStepHandler={() => {
                            this.nextStep(2);
                        }}/>}
                        {groupOriented = <GroupOriented isNotShow={true} preStepHandler={() => {
                            this.nextStep(1);
                        }}/>}
                    </div>
                </div>
            </div>
        </div>;
        this.allStep = [basicInfo, ruleSetting, groupOriented];
        return activityPageHTML;
    }

    protected init(para: Primitive[], data?) {
        // 申报活动数据
        ReportActivityPage.reportData = new ReportActivityData({});
        ReportActivityPage.state = '新增';
        let ajaxData = JSON.parse(tools.url.getPara('ajaxData')),
            activityid = '';
        if (tools.isNotEmpty(ajaxData)){
            activityid = ajaxData.activity_id;
        }
        if (tools.isNotEmpty(activityid)) {
            LeRule.Ajax.fetch(tools.url.addObj(CONF.ajaxUrl.activityDetail, {
                activityid: activityid
            }))
                .then(({response}) => {
                    ReportActivityPage.activityId = response.data.baseInfo.activity.activityId;
                    ReportActivityPage.state = response.data.baseInfo.activity.state;
                    this.allStep[0].set(response.data.baseInfo);
                    this.allStep[1].set(response.data.ruleSetting);
                    this.allStep[2].set(response.data.objectSetting);
                });
        } else {
            this.allStep[0].set({});
            this.allStep[1].set({});
            this.allStep[2].set({});
        }
        setTimeout(()=>{
            this.backEvent.on();
        },200)
    }

    private nextStep(index) {
        this.allStep.forEach((step, i) => {
            index === i ? (step.isShow = false) : (step.isShow = true);
        });
        let stepItem = d.queryAll('.step-item', this.wrapper);
        stepItem.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
        d.query('.lesson-content', document.body).scrollTo(0, 0);
    }

    private backEvent = (() => {
        let backEve = () => {
            SPA.close();
        };
        return {
            on: () => d.on(this.wrapper, 'click', '.back', backEve),
            off: () => d.off(this.wrapper, 'click', '.back', backEve)
        }
    })();

    destroy(){
        super.destroy();
        this.backEvent.off();
    }
}