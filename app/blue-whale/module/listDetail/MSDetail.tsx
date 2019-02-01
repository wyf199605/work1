/// <amd-module name="MSDetail"/>
import {DetailFormModule} from "./DetailFormModule";
import {IDetailBasePara} from "./DetailBase";
import d = G.d;
import Component = G.Component;

interface IMSDetail {

}

/**
 * Master-slave，一主一从
 */
export class MSDetail extends Component{
    protected para: IDetailBasePara;
    protected detailForm: DetailFormModule;
    constructor(para : IMSDetail){
        super(para);
    }
    protected initDetailFormModule() {
        let fm = this.para.fm;
        this.detailForm = new DetailFormModule({
            uiType: this.para.uiType,
            fields: fm.fields,
            defDataAddrList: fm.defDataAddrList,
            groupInfo: fm.groupInfo,
            container: d.query('.edit-detail-content', this.wrapper)
        })
    }

    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return <div className="edit-detail-module">
            <div className="edit-detail-content"/>
        </div>;
    }
}