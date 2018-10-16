/// <amd-module name="SignModule"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import tools = G.tools;
import {Utils} from "../../../common/utils";

interface ISignModulePara extends IComponentPara {
    isSignIn?: boolean;
    content?: {
        indexTitle?: string;
        time?: number[];
        type?: string;
        position?: string;
        duration?: number;
    }
}

export class SignModule extends Component {
    protected wrapperInit(para: ISignModulePara): HTMLElement {
        let titlePre = para.isSignIn === true ? '签到' : '签退';
        let signModuleWrapper = null;
        let typeTitle = '',typeContent = '';
        if (tools.isNotEmpty(para.content.type)) {
            if (para.content.type === '人脸识别') {
                typeTitle = titlePre + '位置';
                typeContent = para.content.position || '未知';
            } else {
                typeTitle = '二维码有效时间';
                typeContent = Number(para.content.duration) === 0 ?  '不限' : para.content.duration + 's';
            }
        } else {
            typeTitle = titlePre + '位置';
            typeContent = '未知';
        }
        if (para.isSignIn !== true && tools.isEmpty(para.content)) {
            signModuleWrapper =
                <div className="detailSignModule detail-item" style={{fontWeight: 'bold', fontSize: '20px'}}>不签退</div>
        } else if (para.isSignIn === true && tools.isEmpty(para.content)) {
            signModuleWrapper =
                <div className="detailSignModule detail-item" style={{fontWeight: 'bold', fontSize: '20px'}}>不签到</div>
        } else {
            let title = para.isSignIn === true ?
                <div c-var="title" className="detail-sign-title">{para.content.indexTitle}</div> : '';
            signModuleWrapper = <div className="detailSignModule detail-item">
                <div className="detail-sign-wrapper">
                    {title}
                    <div className="detail-sign-content">
                        <div className="detail-label">{titlePre + '时间'}&nbsp;:</div>
                        <div c-var="signTime">
                            {(tools.isNotEmpty(para.content.time[0]) ? Utils.formatTime(para.content.time[0]) : '未知') + ' 至 ' + (tools.isNotEmpty(para.content.time[1]) ? Utils.formatTime(para.content.time[1]) : '未知')}
                        </div>
                    </div>
                    <div className="detail-sign-content typeAndPos">
                        <div className="detail-sign-type">
                            <div className="detail-label">{titlePre + '方式'}&nbsp;:</div>
                            <div c-var="signType">
                                {tools.isNotEmpty(para.content.type) ? para.content.type : '未知'}
                            </div>
                        </div>
                        <div className="detail-sign-position">
                            <div className="detail-label">{typeTitle}&nbsp;:</div>
                            <div c-var="signPosition">
                                {typeContent}
                            </div>
                        </div>
                    </div>
                </div>
            </div>;
        }

        return signModuleWrapper;
    }

    constructor(para: ISignModulePara) {
        super(para);
    }

}