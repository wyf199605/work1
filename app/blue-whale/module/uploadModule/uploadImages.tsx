/// <amd-module name="UploadImages"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import d = G.d;
import {FormCom} from "../../../global/components/form/basic";
import {IUploadImagesItem, UploadImagesItem} from "./uploadImagesItem";
import tools = G.tools;
import {BwRule} from "../../common/rule/BwRule";
import {BwUploader, IBwUploaderPara} from "./bwUploader";

export interface IImage {
    unique?: string;
    isError?: boolean;
    localUrl?: string;
    isOnLine?: boolean;
}

interface IUploadImages extends IBwUploaderPara {
    unique?: string;
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
            case '26':
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
            switch (this.imgType) {
                case '20': {
                    this.imgs = [{
                        localUrl: BW.CONF.siteUrl + BwRule.reqAddr(this.para.field.link, this.para.pageData),
                        isError: false,
                        unique: val || '',
                    }];
                }
                    break;
                case  '26':
                case  '27':
                case  '28': {
                    // 第一次设置值
                    let addrArr = val.split(','),
                        arr = [];
                    addrArr.forEach(md5 => {
                        // 根据md5获取文件地址
                        arr.push({
                            unique: md5,
                            isError: false,
                            localUrl: '',
                            isOnLine: true
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

    protected wrapperInit(para: IUploadImages): HTMLElement {
        return <div className="accessory-wrapper">
            <div className="accessory-title">{para.field.caption || '图片'}</div>
            <div className="images-wrapper">
                {this.imgWrapper = <div className="images-body"/>}
                {this.addImg = <div className="add-wrapper"/>}
            </div>
        </div>;
    }

    public uploader: BwUploader = null;

    constructor(private para: IUploadImages) {
        super(para);
        this.imgType = para.field.dataType || para.field.atrrs.dataType;
        this.value = para.unique;
        this.createUploader();
        this.initEvent.on();
    }

    private createUploader() {
        let uploader: BwUploader = new BwUploader({
            loading: {
                msg: '上传中...',
                container: document.body,
                disableEl: document.body
            },
            uploadType: this.imgType === '26' ? 'sign' : 'file',
            uploadUrl: this.para.uploadUrl || BW.CONF.ajaxUrl.fileUpload,
            accept: this.para.accept || {
                title: 'Images',
                extensions: 'gif,jpg,jpeg,bmp,png',
                mimeTypes: 'image/*'
            },
            autoUpload: false,
            nameField: this.para.nameField || 'FILE_ID',
            thumbField: this.para.thumbField,
            // 上传成功
            onSuccess: (res, file) => {
                let data = res;
                let imageObj: IImage = {
                    unique: '',
                    isError: false,
                    isOnLine: false,
                    localUrl: (window.URL) ? window.URL.createObjectURL(file.blob) : window['webkitURL'].createObjectURL(file.blob)
                };
                Modal.toast('上传成功!');
                switch (this.imgType) {
                    case '20': {
                        imageObj.unique = res.data.blobField.value;
                        this.imgs = [imageObj];
                    }
                        break;
                    case '27':
                    case '26': {
                        imageObj.unique = res.data.unique;
                        this.imgs = [imageObj];
                    }
                        break;
                    case '28': {
                        let imageId = res.data.unique;
                        imageObj.unique = imageId;
                        if (tools.isNotEmpty(data.ifExist)) {
                            let imgs = this._imgs.filter(img => img.unique === imageId);
                            if (tools.isEmpty(imgs)) {
                                this.addItem(imageObj);
                            }
                        } else {
                            this.addItem(imageObj);
                        }

                    }
                        break;
                }

            },
            container: this.addImg,
            text: ''
        });
        this.uploader = uploader;
        // 文件加入到上传队列，开始上传
        this.uploader.on(BwUploader.EVT_FILE_JOIN_QUEUE, (files: File[]) => {
            if (files.length > 0) {

                //开始上传
                switch (this.imgType) {
                    case '20':
                    case '26':
                    case '27': {
                        if (files.length = 1) {
                            this.uploader.upload();
                        } else {
                            Modal.alert('请只上传一张图片!');
                        }
                    }
                        break;
                    case '28': {
                        this.uploader.upload();
                    }
                        break;
                }
            }
        });
        // 上传错误时调用
        uploader.on(BwUploader.EVT_UPLOAD_ERROR, (file) => {
            let imageObj: IImage = {
                unique: '',
                isError: true,
                localUrl: (window.URL) ? window.URL.createObjectURL(file.blob) : window['webkitURL'].createObjectURL(file.blob)
            };
            switch (this.imgType) {
                case '20':
                case '26':
                case '27': {
                    this.imgs = [imageObj];
                }
                    break;
                case '28': {
                    this.addItem(imageObj);
                }
                    break;
            }

        });
        // uploader.on("error", (type) => {
        //     const msg = {
        //         'Q_TYPE_DENIED': '文件类型有误',
        //         'F_EXCEED_SIZE': '文件大小不能超过4M',
        //     };
        //     Modal.alert(msg[type] ? msg[type] : '文件出错, 类型:' + type)
        // });
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
            this.listItems.forEach(item => {
                item.destroy();
            });
            this._imgs = [];
            this._listItems = [];
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