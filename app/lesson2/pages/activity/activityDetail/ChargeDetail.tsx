/// <amd-module name="ChargeDetail"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import tools = G.tools;
import d = G.d;
import {ChargePara} from "../reportActivity/ReportActivityData";
import {Modal} from "../../../../global/components/feedback/modal/Modal";
import {FastTable} from "../../../../global/components/newTable/FastTable";

interface IChargeDetailPara extends IComponentPara {
    title?: string;
}

export class ChargeDetail extends Component {
    protected wrapperInit(para: IChargeDetailPara): HTMLElement {
        let detailWrapper = <div className="detail-item">
            <div className="detail-item-wrapper">
                <div className="detail-label">{para.title}&nbsp;:</div>
                <div className="detail-content" c-var="content" title="">无</div>
            </div>
        </div>;
        return detailWrapper;
    }

    constructor(para: IChargeDetailPara) {
        super(para);
        this.initEvents.on();
    }

    private initEvents = (() => {
        let moreHandler = () => {
            let body = <div/>;
            new Modal({
                header:{
                    title:"查看联系人"
                },
                body:body,
                width:'500px',
                height:'400px'
            });
            new FastTable({
                cols:[[{
                    name:'name',
                    title:'姓名'
                },{name:'phone',title:'电话'}]],
                data:this.chargeData,
                pseudo:{
                    type:'number'
                },
                container:body
            })
        };
        return {
            on: () => d.on(this.wrapper, 'click', 'span.more', moreHandler),
            off: () => d.off(this.wrapper, 'click', 'span.more', moreHandler)
        }
    })();
    private _chargeData: ChargePara[];
    set chargeData(cd: ChargePara[]) {
        this._chargeData = cd;
    }

    get chargeData() {
        return this._chargeData;
    }

    set(content) {
        let contentWrapper = this.innerEl.content;
        contentWrapper.innerHTML = '';
        if (tools.isNotEmptyArray(content)) {
            let contentHtml = '';
            this.chargeData = content;
            for (let i = 0; i < content.length; i++) {
                if (i >= 2) {
                    contentHtml += `<span class="charge more">更多</span>`;
                    break;
                }
                let charge = content[i];
                contentHtml += `<span class="charge">${charge.name}&nbsp;&nbsp${charge.phone}</span>`;
            }
            contentWrapper.innerHTML = contentHtml;
        } else {
            contentWrapper.innerHTML = '无';
            this.chargeData = [];
        }
    }

    destroy(){
        super.destroy();
        this.initEvents.off();
    }
}