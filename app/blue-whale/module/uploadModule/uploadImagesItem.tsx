/// <amd-module name="UploadImagesItem"/>
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {BwRule} from "../../common/rule/BwRule";
import {IImage} from "./uploadImages";
import d = G.d;

export interface IUploadImagesItem extends IComponentPara {
    image?: IImage;
    index?: number;
    nameField?: string;
    type?: string;
}

export class UploadImagesItem extends Component {
    protected wrapperInit(para: IUploadImagesItem): HTMLElement {
        let wrapper: HTMLElement;
        if (para.image.isError) {
            wrapper = <div className="upload-img" data-index={para.index}>
                <img c-var="img" src='' alt="附件图片"/>
                <div className="close-ball"><i className="appcommon app-guanbi2"/></div>
            </div>;
        } else {
            wrapper = <div className="upload-img" data-index={para.index}>
                <img c-var="img" src='' alt="附件图片"/>
                <div className="close-ball"><i className="appcommon app-guanbi2"/></div>
            </div>;
        }
        return wrapper;
    }

    private _errorWrapper: HTMLElement;
    get errorWrapper() {
        if (!this._errorWrapper) {
            this._errorWrapper = <div className="img-error">
                <div className="error-text">
                    <i className="appcommon app-shibai"/>
                    传输失败
                </div>
            </div>;
        }
        return this._errorWrapper;
    }

    private toggleErrorWrapper(isError: boolean) {
        if (isError) {
            !this._errorWrapper && d.append(this.wrapper, this.errorWrapper);
        } else {
            this._errorWrapper && d.remove(this.errorWrapper);
            this._errorWrapper = null;
        }
    }

    constructor(private para: IUploadImagesItem) {
        super(para);
        this._index = para.index;
        para.image && this.render(para.image);
    }

    render(data: IImage) {
        if (data.isOnLine) {
            (this.innerEl.img as HTMLImageElement).setAttribute('src', BwRule.fileUrlGet(data.unique, this.para.nameField || 'FILE_ID', true));
        } else {
            (this.innerEl.img as HTMLImageElement).setAttribute('src', data.localUrl);
        }
        this.toggleErrorWrapper(data.isError);
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

    set disabled(disabled: boolean) {
        this._disabled = disabled;
        d.query('.close-ball', this.wrapper).classList.toggle('hide', disabled === true);
    }

    destroy() {
        super.destroy();
    }
}