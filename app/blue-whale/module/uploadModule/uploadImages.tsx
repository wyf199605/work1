/// <amd-module name="UploadImages"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import d = G.d;
import {FormCom} from "../../../global/components/form/basic";
import {IUploaderPara, Uploader} from "../../../global/components/form/upload/uploader";
import {Loading} from "../../../global/components/ui/loading/loading";
import {IUploadImagesItem, UploadImagesItem} from "./uploadImagesItem";
import UploadModule from "./uploadModule";
import tools = G.tools;

export interface IImage {
    fileId?: string;
    fileName?: string;
    isError?: boolean;
    localUrl?: string;
}

interface IUploadImages extends IUploaderPara {
    caption?: string;
    images?: IImage[];

    onComplete?(this: UploadModule, ...any); // 上传完成回调
    onError?(file: obj); // 上传失败回调
    onChange?: Function; // 上传成功回调
}

export class UploadImages extends FormCom {
    set(val: IImage[]): void {
        this.value = val;
    }

    get value() {
        return this._value;
    };

    set value(val: IImage[]) {
        this._value = val;
        this.render(val);
        this.calcScrollLeft();
    }

    private addImg: HTMLElement;
    private imgWrapper: HTMLElement;

    protected wrapperInit(para: IUploadImages): HTMLElement {
        return <div className="accessory-wrapper">
            <div className="accessory-title">{para.caption || '图片'}</div>
            <div className="images-wrapper">
                {this.imgWrapper = <div className="images-body"/>}
                {this.addImg = <div className="add-wrapper"/>}
            </div>
        </div>;
    }

    public uploader: Uploader = null;
    private loading: Loading = null;

    constructor(private para: IUploadImages) {
        super(para);
        tools.isNotEmpty(para.images) && (this.value = para.images);
        this.createUploader();
        this.initEvent.on();
    }

    private createUploader() {
        let uploader = new Uploader({
            uploadUrl: this.para.uploadUrl || BW.CONF.ajaxUrl.fileUpload,
            accept: this.para.accept || {
                title: 'Images',
                extensions: 'gif,jpg,jpeg,bmp,png',
                mimeTypes: 'image/*'
            },
            nameField: this.para.nameField || 'FILE_ID',
            thumbField: this.para.thumbField,
            // 上传成功
            onComplete: (res, file) => {
                let data = res,
                    isError = false;
                if (tools.isNotEmpty(data.ifExist)){
                    isError = data.ifExist === '1' ? true : false;
                }
                let imageId = res.data.blobField.value,
                    imageObj: IImage = {
                        fileId: imageId,
                        fileName: file.name,
                        isError: isError
                    };
                this.addItem(imageObj);
                this.para.onComplete && this.para.onComplete.call(this, data, file);
            },
            container: this.addImg,
            text: '+'
        });
        this.uploader = uploader;
        // 文件加入上传队列时 检测改图片是否存在
        uploader.on('beforeFileQueued', (file) => {
            if (file.type.split('/')[0] === 'image') {
                let imgsArr = this.value || [],
                    isExist = false;
                for (let i = 0, len = imgsArr.length; i < len; i++) {
                    let pic = imgsArr[i];
                    if (pic.fileName === file.name) {
                        Modal.alert('已经添加过图片' + file.name);
                        isExist = true;
                    }
                }
                if (!isExist) {
                    //开始上传
                    return true;
                } else {
                    return false;
                }
            } else {
                Modal.alert('只支持图片格式!');
                return false;
            }
        });
        // 文件加入到上传队列，开始上传
        this.uploader.on('fileQueued', (file: File) => {
            this.para.onChange && this.para.onChange();
            //开始上传
            if (!this.loading) {
                this.loading = new Loading({
                    msg: '上传中...',
                    container: document.body
                });
                document.body.classList.add('up-disabled');
            }
            this.uploader.upload();
        });
        // 上传错误时调用
        uploader.on("uploadError", (file,res) => {
            if (this.loading) {
                this.loading.hide();
                this.loading.destroy();
                this.loading = null;
                document.body.classList.remove('up-disabled');
            }
            if (res === 'ifExist'){

            }else{
                let imageObj: IImage = {
                    fileId: '',
                    fileName: file.name,
                    isError: true,
                    localUrl:(window.URL) ? window.URL.createObjectURL(file.source.source) : window['webkitURL'].createObjectURL(file.source.source)
                };
                this.addItem(imageObj);
            }
            this.para.onError && this.para.onError.call(this, file);
        });
        // 所有文件上传成功时调用
        uploader.on('uploadFinished', () => {
            if (this.loading) {
                this.loading.hide();
                this.loading.destroy();
                this.loading = null;
                document.body.classList.remove('up-disabled');
            }
        });
        uploader.on("error", function (type) {
            const msg = {
                'Q_TYPE_DENIED': '文件类型有误',
                'F_EXCEED_SIZE': '文件大小不能超过4M',
            };
            if (this.loading){
                this.loading.hide();
                this.loading.destroy();
                this.loading = null;
                document.body.classList.remove('up-disabled');
            }
            Modal.alert(msg[type] ? msg[type] : '文件出错, 类型:' + type)
        });

    }

    protected _listItems: UploadImagesItem[] = [];
    get listItems() {
        return this._listItems.slice();
    }

    private calcScrollLeft() {
        let scrollWrapper = d.query('.images-wrapper', this.wrapper),
            scrollLeft = this._value.length * 96 + 80 - scrollWrapper.offsetWidth;
        scrollWrapper.scrollLeft = scrollLeft > 0 ? scrollLeft : 0;
    }

    // 渲染附件列表
    render(data: IImage[]) {
        d.diff(data, this.listItems, {
            create: (n: IImage) => {
                this._listItems.push(this.createListItem({image: n}));
            },
            replace: (n: IImage, o: UploadImagesItem) => {
                o.render(n || {});
            },
            destroy: (o: UploadImagesItem) => {
                o.destroy();
                let index = this._listItems.indexOf(o);
                if (index > -1)
                    delete this._listItems[index]
            }
        });
        this._listItems = this._listItems.filter((item) => item);
        this.refreshIndex();
    }

    refreshIndex() {
        this._listItems.forEach((item, index) => {
            item.index = index + 1;
        });
    }

    private addItem(imageObj: IImage) {
        let arr = this._value || [];
        this._value = arr.concat(imageObj);
        this._listItems.push(this.createListItem({image: imageObj}));
        this.calcScrollLeft();
    }

    protected createListItem(para: IUploadImagesItem) {
        para = Object.assign({}, para, {
            container: this.imgWrapper,
            index: this._value.length,
            nameField:this.para.nameField
        });
        return new UploadImagesItem(para);
    }

    get() {
        let value = this.value,
            trueVal = [];
        value.forEach(v => {
            !v.isError && trueVal.push(v.fileId);
        });
        return trueVal;
    }

    private initEvent = (() => {
        let deleteEt = (e) => {
            let indexEl = d.closest(e.target, '.upload-img'),
                index = parseInt(indexEl.dataset.index);
            // 删除
            this.deleteImageItem(index);
        };

        return {
            on: () => {
                d.on(this.wrapper, 'click', '.close-ball', deleteEt);
            },
            off: () => {
                d.off(this.wrapper, 'click', '.close-ball', deleteEt);
            }
        }
    })();

    private deleteImageItem(index:number){
        let i = index - 1;
        let item = this._listItems[i];
        if (item) {
            item.destroy();
            this._listItems.splice(i, 1);
            this._value.splice(i, 1);
            this.refreshIndex();
        }
    }

    destroy() {
        this.initEvent.off();
        this.uploader.destroy();
        this.imgWrapper = null;
        super.destroy();
    }
}