/// <amd-module name="UploadImages"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import d = G.d;
import {FormCom} from "../../../global/components/form/basic";
import {IUploadImagesItem, UploadImagesItem} from "./uploadImagesItem";
import tools = G.tools;
import {BwRule} from "../../common/rule/BwRule";
import {BwUploader, IBwUploaderPara} from "./bwUploader";
import {ListItemDetailCell} from "../listDetail/ListItemDetailCell";
import {ImgModal, ImgModalPara} from "../../../global/components/ui/img/img";

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
    autoUpload?: boolean;
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
                    uni = uniArr[0];

                if(tools.isEmpty(uni)){
                    break;
                }
                if(uni.isOnLine){
                    finalVal = uni.unique || '';
                    break;
                }
                if(uni.localUrl){
                    if(~uni.localUrl.indexOf(',')){
                        finalVal = uni.localUrl.split(',')[1];
                    }else{
                        finalVal = uni.localUrl;
                    }
                    break;
                }
            }
                break;
            case '28': {
                let trueVal = [];
                value.forEach(v => {
                    if (!v.isError) {
                        if(v.isOnLine){
                            tools.isNotEmpty(v.unique) && trueVal.push(v.unique)
                        }else if(v.localUrl){
                            if(~v.localUrl.indexOf(',')){
                                trueVal.push(v.localUrl.split(',')[1]);
                            }else{
                                trueVal.push(v.localUrl);
                            }
                        }
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
                        localUrl: BW.CONF.siteUrl + BwRule.reqAddr(this.para.field.link, this.pageData),
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
                    if(this.autoUpload){
                        addrArr.forEach(md5 => {
                            // 根据md5获取文件地址
                            arr.push({
                                unique: md5,
                                isError: false,
                                localUrl: '',
                                isOnLine: true
                            });
                        });
                    }else{
                        addrArr.forEach(url => {
                            // 根据md5获取文件地址
                            arr.push({
                                unique: '',
                                isError: false,
                                localUrl: 'data:image/png;base64,' + url,
                                isOnLine: false
                            });
                        });
                    }
                    this.imgs = arr;
                }
                    break;
            }
        } else {
            this.imgs = [];
        }
    }

    private _pageData: obj;
    set pageData(pageData: obj) {
        this._pageData = pageData;
    }

    get pageData() {
        return this._pageData;
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
    protected autoUpload: boolean;

    constructor(private para: IUploadImages) {
        super(para);
        this.autoUpload = tools.isEmpty(para.autoUpload) ? true : para.autoUpload;
        this.pageData = para.pageData || {};
        this.imgType = para.field.dataType || para.field.atrrs.dataType;
        this.value = para.unique;
        this.createUploader();
        this.uploader.disabled = this.disabled;
        this.initEvent.on();
        this.lookImgEve.on();
    }

    click() {
        this.uploader && this.uploader.click();
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
        this.uploader.on(BwUploader.EVT_FILE_JOIN_QUEUE, (files: CustomFile[]) => {
            if (files.length > 0) {
                if(this.autoUpload){
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
                }else{

                    Promise.all(files.map((file) => {
                        return new Promise((resolve, reject) => {
                            let reader = new FileReader();
                            reader.readAsDataURL(file.blob);
                            reader.onload = function (e) {
                                resolve(reader.result);
                            };
                            reader.onerror = (e) => {
                                reject(e)
                            }
                        });
                    })).then((strs: string[]) => {
                        let isMulti = this.imgType === '28';
                        let imgs: IImage[] = strs.map((str) => ({
                            localUrl: str,
                            isOnLine: false,
                            isError: false,
                            unique: '',
                        }));
                        if(isMulti){
                            imgs = [...this.imgs, ...imgs];
                        }
                        this.imgs = imgs;
                    }).catch((e) => {
                        console.log(e);
                        Modal.alert('图片获取失败');
                    })
                }
            }
        });
        // 上传错误时调用
        uploader.on(BwUploader.EVT_UPLOAD_ERROR, (file: CustomFile) => {
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
        return tools.isNotEmpty(this._listItems) ? this._listItems.slice() : [];
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
        this.listItems.forEach(item => {
            item.disabled = this.disabled;
        });

        this.onSet && this.onSet(this.value);
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
            this.onSet && this.onSet(this.value);
        }
    }

    set disabled(disabled: boolean) {
        disabled = tools.isNotEmpty(disabled) ? disabled : false;
        this._disabled = disabled;
        this.listItems.forEach(item => {
            item.disabled = disabled;
        });
        this.uploader && (this.uploader.disabled = disabled);
    }

    get disabled() {
        return this._disabled;
    }

    private lookImgEve = (() => {
        let look = (e) => {
            let index = parseInt(e.target.parentNode.dataset['index']) || 0;
            let imgs = this.getImgs();
            let imgData: ImgModalPara = {
                img: imgs
            };
            ImgModal.show(imgData, index);
            if (tools.isMb) {
                document.body.style.overflow = 'hidden';
                setTimeout(() => {
                    let el = d.query('.list-item-detail-wrapper');
                    el && (d.query('.pswp', document.body).style.top = tools.getScrollTop(el) + 'px');
                }, 200);
            }

        };
        return {
            on: () => d.on(this.wrapper, 'click', 'img', look),
            off: () => d.off(this.wrapper, 'click', 'img', look)
        }
    })();

    private getImgs(): string[] {
        let imgs = this.imgs || [],
            result: string[] = [];
        imgs.forEach(img => {
            if (img.isOnLine) {
                result.push(BwRule.fileUrlGet(img.unique, this.para.nameField || 'FILE_ID', false));
            } else {
                result.push(img.localUrl);
            }
        });
        return result;
    }


    destroy() {
        this.lookImgEve.off();
        this.initEvent.off();
        this.uploader.destroy();
        this.imgWrapper = null;
        super.destroy();
    }
}