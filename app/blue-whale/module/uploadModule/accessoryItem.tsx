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
        this.list = para.list;
        this._index = para.index;
        para.file && this.render(para.file || {});
    }

    render(data:IFileInfo){
        this.innerEl.fileName.innerText = data.fileName || '';
        this.innerEl.fileSize.innerText =data.fileSize ? this.calcFileSize(data.fileSize) : '0B';
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

    private calcFileSize(limit:number){
        let size: string = "";
        if (limit < 0.1 * 1024) { //如果小于0.1KB转化成B
            size = limit.toFixed(2) + "B";
        } else if (limit < 0.1 * 1024 * 1024) {//如果小于0.1MB转化成KB
            size = (limit / 1024).toFixed(2) + "KB";
        } else if (limit < 0.1 * 1024 * 1024 * 1024) { //如果小于0.1GB转化成MB
            size = (limit / (1024 * 1024)).toFixed(2) + "MB";
        } else { //其他转化成GB
            size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
        }

        let len = size.indexOf("\."), dec = size.substr(len + 1, 2);
        if (dec == "00") {//当小数点后为00时 去掉小数部分
            return size.substring(0, len) + size.substr(len + 3, 2);
        }
        return size;
    }

    destroy(){
        this.list = null;
        super.destroy();
    }
}