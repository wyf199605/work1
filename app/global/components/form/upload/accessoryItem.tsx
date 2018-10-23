/// <amd-module name="AccessoryItem"/>
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {IFileInfo} from "./accessory";

interface IAccessoryItem extends IComponentPara{
    file?:IFileInfo;
    index:number;
}

export class AccessoryItem extends Component{
    protected wrapperInit(para: IAccessoryItem): HTMLElement {
        return <div className="accessory-item" data-index={para.index}>
            <div className="file-wrapper">
                <i className="appcommon app-wenjian"/>
                <div className="file-info">
                    <div c-var="fileName" className="file-name"/>
                    <div c-var="fileSize" className="file-size"/>
                </div>
            </div>
            <div className="deleteBtn">删除</div>
        </div>;
    }

    constructor(private para:IAccessoryItem){
        super(para);
        para.file && this.render(para.file);
    }

    render(data:IFileInfo){

    }

    destroy(){
        super.destroy();
    }
}