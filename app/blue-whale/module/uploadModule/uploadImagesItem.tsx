/// <amd-module name="UploadImagesItem"/>
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {BwRule} from "../../common/rule/BwRule";
import {IImage} from "./uploadImages";

export interface IUploadImagesItem extends IComponentPara {
    image?: IImage;
    index?: number;
    nameField?: string;
    type?:string;
}

export class UploadImagesItem extends Component {
    protected wrapperInit(para: IUploadImagesItem): HTMLElement {
        let wrapper:HTMLElement;
        if (para.image.isError){
            wrapper = <div className="upload-img" data-index={para.index}>
                <img c-var="img" src='' alt="附件图片"/>
                <div className="img-error">
                   <div className="error-text">
                       <i className="appcommon app-shibai"></i>
                       传输失败
                   </div>
                </div>
                <div className="close-ball"><i className="appcommon app-guanbi2"/></div>
            </div>;
        }else{
            wrapper = <div className="upload-img" data-index={para.index}>
                <img c-var="img" src='' alt="附件图片"/>
                <div className="close-ball"><i className="appcommon app-guanbi2"/></div>
            </div>;
        }
        return wrapper;
    }

    constructor(private para: IUploadImagesItem) {
        super(para);
        this._index = para.index;
        para.image && this.render(para.image);
    }

    render(data: IImage) {
        if (this.para.type === '20'){
            (this.innerEl.img as HTMLImageElement).setAttribute('src',data.extraUrl);
        }else{
            (this.innerEl.img as HTMLImageElement).setAttribute('src',data.unique ? BwRule.fileUrlGet(data.unique, this.para.nameField || 'FILE_ID', true) : data.localUrl);
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
        super.destroy();
    }
}