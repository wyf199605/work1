/// <amd-module name="UploadImages"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import d = G.d;
import {FormCom} from "../../../global/components/form/basic";
import {IUploaderPara, Uploader} from "../../../global/components/form/upload/uploader";
import {Loading} from "../../../global/components/ui/loading/loading";
import {IUploadImagesItem, UploadImagesItem} from "./uploadImagesItem";
import UploadModule from "./uploadModule";
import tools = G.tools;
import {BwRule} from "../../common/rule/BwRule";

export interface IImage {
    unique?: string;
    isError?: boolean;
    localUrl?: string;
    isOnLine?:boolean;
}

interface IUploadImages extends IUploaderPara {
    unique?: string;

    onComplete?(this: UploadModule, ...any); // 上传完成回调
    onError?(file: obj); // 上传失败回调
    onChange?: Function; // 上传成功回调
    field?: R_Field; //字段
    pageData?: obj;//页面数据
}

export class UploadImages extends FormCom {
    set(val: string): void {
        this.value = val;
    }

    get() {
        let value = this.imgs || [],
            finalVal = '';
        switch (this.imgType) {
            case '20':
            case '27': {
                let uniArr = value.reverse().filter(v => v.isError === false),
                    uni = uniArr.filter(u => tools.isNotEmpty(u.unique))[0];
                finalVal = tools.isNotEmpty(uni) ? uni.unique : '';
            }
                break;
            case '28': {
                let trueVal = [];
                value.forEach(v => {
                    if (!v.isError && tools.isNotEmpty(v.unique)) {
                        trueVal.push(v.unique)
                    }
                });
                finalVal = trueVal.join(',')
            }
                break;
        }
        return finalVal;
    }

    get value() {
        return this.get();
    };

    set value(val: string) {
        this._value = val || '';
        if (tools.isNotEmpty(val)) {
            switch (this.imgType){
                case '20':{
                    this.imgs = [{
                        localUrl: BW.CONF.siteUrl + BwRule.reqAddr(this.para.field.link, this.para.pageData),
                        isError: false,
                        unique: val || '',
                    }];
                }
                break;
                case  '27':
                case  '28':{
                    // 第一次设置值
                    let addrArr = val.split(','),
                        arr = [];
                    addrArr.forEach(md5 => {
                        // 根据md5获取文件地址
                        arr.push({
                            unique: md5,
                            isError: false,
                            localUrl: '',
                            isOnLine:true
                        });
                    });
                    this.imgs = arr;
                }
                break;
            }
        } else {
            this.imgs = [];
        }
    }

    private _imgs: IImage[];
    set imgs(imgs: IImage[]) {
        this._imgs = imgs || [];
        this.render(this._imgs);
        this.calcScrollLeft();
    }

    get imgs() {
        return this._imgs;
    }

    private addImg: HTMLElement;
    private imgWrapper: HTMLElement;
    private imgType: string = '';
    private typeUnique: string = '';

    protected wrapperInit(para: IUploadImages): HTMLElement {
        let type = para.field.dataType || para.field.atrrs.dataType;
        return <div className="accessory-wrapper">
            <div className="accessory-title">{para.field.caption || '图片'}</div>
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
        this.typeUnique = new Date().getTime() + para.field.name;
        this.imgType = para.field.dataType || para.field.atrrs.dataType;
        this.value = para.unique;
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
            typeUnique: this.typeUnique,
            // 上传成功
            onComplete: (res, file, type) => {
                if (type === this.typeUnique) {
                    let data = res;
                    let imageObj: IImage = {
                        unique: '',
                        isError: false,
                        isOnLine:false,
                        localUrl:(window.URL) ? window.URL.createObjectURL(file.source.source) : window['webkitURL'].createObjectURL(file.source.source)
                    };
                    if (tools.isNotEmpty(res.ifExist)){
                        Modal.toast('图片已存在!');
                    }else{
                        Modal.toast('上传成功!');
                    }
                    switch (this.imgType) {
                        case '20': {
                            imageObj.unique = res.data.blobField.value;
                            this.imgs = [imageObj];
                        }
                            break;
                        case '27': {
                            imageObj.unique = res.data.unique;
                            this.imgs = [imageObj];
                        }
                            break;
                        case '28': {
                            let imageId = res.data.unique;
                            imageObj.unique = imageId;
                            if (tools.isNotEmpty(data.ifExist)) {
                                let imgs = this._imgs.filter(img => img.unique === imageId);
                                if (tools.isEmpty(imgs)){
                                    this.addItem(imageObj);
                                }
                            } else {
                                this.addItem(imageObj);
                            }

                        }
                            break;
                    }
                }
            },
            container: this.addImg,
            text: ''
        });
        this.uploader = uploader;
        // 文件加入到上传队列，开始上传
        this.uploader.on('filesQueued', (files: File[]) => {
            if (files.length > 0) {
                this.para.onChange && this.para.onChange();
                //开始上传
                if (!this.loading) {
                    this.loading = new Loading({
                        msg: '上传中...',
                        container: document.body
                    });
                    document.body.classList.add('up-disabled');
                }
                switch (this.imgType) {
                    case '20':
                    case '27': {
                        if (files.length = 1) {
                            this.uploader.upload(this.typeUnique);
                        } else {
                            Modal.alert('请只上传一张图片!');
                        }
                    }
                        break;
                    case '28': {
                        this.uploader.upload(this.typeUnique);
                    }
                        break;
                }
            }
        });
        // 上传错误时调用
        uploader.on("uploadError", (file, res) => {
            if (this.loading) {
                this.loading.hide();
                this.loading.destroy();
                this.loading = null;
                document.body.classList.remove('up-disabled');
            }
            if (res === 'ifExist') {

            } else {
                let imageObj: IImage = {
                    unique: '',
                    isError: true,
                    localUrl: (window.URL) ? window.URL.createObjectURL(file.source.source) : window['webkitURL'].createObjectURL(file.source.source)
                };
                switch (this.imgType) {
                    case '20':
                    case '27': {
                        this.imgs = [imageObj];
                    }
                        break;
                    case '28': {
                        this.addItem(imageObj);
                    }
                        break;
                }
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
        uploader.on("error", (type) => {
            const msg = {
                'Q_TYPE_DENIED': '文件类型有误',
                'F_EXCEED_SIZE': '文件大小不能超过4M',
            };
            if (this.loading) {
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
            scrollLeft = this._imgs.length * 96 + 80 - scrollWrapper.offsetWidth;
        scrollWrapper.scrollLeft = scrollLeft > 0 ? scrollLeft : 0;
    }

    // 渲染附件列表
    render(data: IImage[]) {
        if (tools.isEmpty(data)) {
            return;
        }
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
            item.index = index;
        });
    }

    private addItem(imageObj: IImage) {
        let arr = this._imgs || [];
        this._listItems.push(this.createListItem({image: imageObj}));
        this._imgs = arr.concat(imageObj);
        this.calcScrollLeft();
    }

    protected createListItem(para: IUploadImagesItem) {
        para = Object.assign({}, para, {
            container: this.imgWrapper,
            index: this._imgs.length,
            nameField: this.para.nameField,
            type: this.imgType
        });
        return new UploadImagesItem(para);
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

    private deleteImageItem(index: number) {
        let i = index;
        let item = this._listItems[i];
        if (item) {
            item.destroy();
            this._listItems.splice(i, 1);
            this._imgs.splice(i, 1);
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