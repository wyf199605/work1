/// <amd-module name="AccessoryItem"/>
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {IFileInfo,Accessory} from "./accessory";

export interface IAccessoryItem extends IComponentPara{
    list?:Accessory;
    file?:IFileInfo;
    index?:number;
}

export class AccessoryItem extends Component{
    protected list: Accessory;
    protected details: objOf<HTMLElement>;
    protected wrapperInit(para: IAccessoryItem): HTMLElement {
        this.details = {};
        return <div className="accessory-item" data-index={para.index}>
            <div className="file-wrapper">
                <i className="appcommon app-wenjian"/>
                <div className="file-info">
                    {this.details['fileName'] = <div c-var="fileName" className="file-name"/>}
                    {this.details['fileSize'] = <div c-var="fileSize" className="file-size"/>}
                </div>
            </div>
            <div className="deleteBtn">删除</div>
        </div>;
    }

    constructor(private para:IAccessoryItem){
        super(para);
        this.list = para.list;
        this._index = para.index;
        // para.file && this.render(para.file);
        this.render(para.data || {});
    }

    render(data:IFileInfo){
        for(let name in this.details){
            let el = this.details[name],
                content = data[name];
            el.innerHTML = content;
        }
    }

    // 获取当前索引
    protected _index: number;
    get index() {
        return this._index;
    }

    set index(index: number) {
        this._index = index;
        this.wrapper && (this.wrapper.dataset['index'] = index + '');
    }

    destroy(){
        this.list = null;
        this.details = null;
        super.destroy();
    }
}