/// <amd-module name="AccessoryItem"/>
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {IFileInfo, Accessory} from "./accessory";
import tools = G.tools;
import {ListItemDetailCell} from "../listDetail/ListItemDetailCell";

export interface IAccessoryItem extends IComponentPara {
    list?: Accessory;
    file?: IFileInfo;
    index?: number;
}

export class AccessoryItem extends Component {
    protected list: Accessory;

    protected wrapperInit(para: IAccessoryItem): HTMLElement {
        return tools.isMb ? <div className="accessory-item" data-index={para.index}>
            <div className="file-wrapper">
                <div className="file-icon"><i className="appcommon app-wenjian"/></div>
                <div className="file-info">
                    <div c-var="fileName" className="file-name"/>
                    <div c-var="fileSize" className="file-size"/>
                </div>
            </div>
            <div className="deleteBtn">删除</div>
        </div> : <div className="accessory-item" data-index={para.index}>
            <i className="iconfont icon-annex"/>
            <div c-var="fileName" className="file-name"/>
            <div c-var="fileSize" className="file-size"/>
            <div className="deleteBtn">删除</div>
        </div>;
    }

    constructor(private para: IAccessoryItem) {
        super(para);
        this.list = para.list;
        this._index = para.index;
        para.file && this.render(para.file || {});
    }

    render(data: IFileInfo) {
        this.innerEl.fileName.innerText = data.filename || '';
        !tools.isMb && (this.innerEl.fileName.title = data.filename || '');
        if (tools.isMb) {
            this.innerEl.fileSize.innerText = data.filesize ? ListItemDetailCell.calcFileSize(data.filesize) : '0B';
        } else {
            this.innerEl.fileSize.innerText = data.filesize ? `(${ListItemDetailCell.calcFileSize(data.filesize)})` : '(0B)';
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

    destroy() {
        this.list = null;
        super.destroy();
    }
}