/// <amd-module name="DetailItem"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import tools = G.tools;
import {Utils} from "../../../common/utils";
interface IDetailItemPara extends IComponentPara {
    title?: string;
    isTime?: boolean;
}

export class DetailItem extends Component {
    private isTime: boolean;

    protected wrapperInit(para: IDetailItemPara): HTMLElement {
        let detailWrapper = <div className="detail-item">
            <div className="detail-item-wrapper">
                <div className="detail-label">{para.title}&nbsp;:</div>
                <div className="detail-content" c-var="content" title="">无</div>
            </div>
        </div>;
        this.isTime = para.isTime;
        return detailWrapper;
    }

    constructor(para: IDetailItemPara) {
        super(para);
    }

    set(content) {
        let contentWrapper = this.innerEl.content;
        contentWrapper.innerHTML = '';
        if (typeof content === 'string') {
            let str = content;
            if (tools.isEmpty(content)){
                str = '无';
            }
            contentWrapper.innerHTML = str;
            contentWrapper.title = str;
        } else if(typeof content === 'object' && content.cancel === true){
            if(content.title === '是'){
                contentWrapper.innerHTML = `${content.title}<span class="title-time"> 时间:</span> ${Utils.formatTime(content.startTime)} 至 ${Utils.formatTime(content.endTime)}`;
            }else{
                contentWrapper.innerHTML = `${content.title}`;
            }
        }else {
            if (this.isTime === true) {
                if(tools.isNotEmpty(content)){
                    contentWrapper.innerText = Utils.formatTime(parseInt(content[0] as string)) + ' 至 ' + Utils.formatTime(parseInt(content[1] as string));
                    contentWrapper.title = Utils.formatTime(parseInt(content[0] as string)) + ' 至 ' + Utils.formatTime(parseInt(content[1] as string));
                }
            } else {
                let contentHtml = '';
                if(tools.isNotEmptyArray(content)) {
                    content.forEach(str => {
                        contentHtml += `<span class="small-item">${str}</span>`;
                    });
                }else{
                    contentHtml = '无';
                }
                contentWrapper.innerHTML = contentHtml;
            }
        }
    }
}