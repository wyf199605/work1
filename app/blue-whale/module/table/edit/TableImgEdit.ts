/// <amd-module name="TableImgEdit"/>
import d = G.d;
import tools = G.tools;
import CONF = BW.CONF;
import {Modal} from "../../../../global/components/feedback/modal/Modal";
import UploadModule from "../../uploadModule/uploadModule";
import {Button} from "../../../../global/components/general/button/Button";

export interface IEditImgModulePara {
    // index: number;
    fields: R_Field[];
    // pictures: string[];
    // editable: boolean;
    thumbField?: string;
    deletable: boolean;
    updatable: boolean;
    onUploaded?: IEditImgModuleUploadHandler;
    onSave?: Function
}

interface IEditImgModuleUploadHandler{
    (md5s: objOf<string>): void;
}

export class TableImgEdit {

    // private pictures: string[];
    public fields: R_Field[];
    public thumbField: string;
    private readonly deletable: boolean;
    private readonly updatable: boolean;

    constructor(para: IEditImgModulePara) {

        // this.pictures = para.pictures;
        this.fields = para.fields;
        this.thumbField = para.thumbField;
        this.deletable = para.deletable;
        this.updatable = para.updatable;

        this.onUploaded = para.onUploaded;
        this.onSave = para.onSave;

        this.modalInit();
    }

    private onUploaded: IEditImgModuleUploadHandler;
    private onSave: Function;
    // set onUploaded(handler: IEditImgModuleUploadHandler) {
    //     this._onUploaded = handler;
    // }
    // get onUploaded(){
    //     return this._onUploaded;
    // }

    private modal:Modal = null;
    private modalInit() {

        let doc = document.createDocumentFragment();

        this.fields.forEach((field, i) => {
            // let pic = this.pictures[i];
            doc.appendChild(this.imgWrapperGet(field, i));
        });

        this.imgs = <HTMLImageElement[]>d.queryAll('img', doc);

        this.modal = new Modal({
            header: '图片查看',
            width: '700px',
            body: doc
        });
    }

    private imgs: HTMLImageElement[] = [];

    private imgWrapperGet(field: R_Field, imgIndex:number) {
        let nameField = field.name,
            wrapper = d.create(`<div class="table-img-wrapper" data-field="${nameField}">` +
            '<div class="table-img-wrapper-btns"></div>' +
            `<div class="table-img"><img data-index="${imgIndex}" style="max-height:500px;max-width:700px"></div>` +
            '</div>');

        if(!this.updatable && !this.deletable){
            return wrapper;
        }

        let btnWrapper = d.query('.table-img-wrapper-btns', wrapper),
            img = <HTMLImageElement>d.query('img', wrapper);
        if(this.updatable) {

            let imgContainer = d.create('<div class="table-img-uploader"></div>');
            d.append(btnWrapper,imgContainer);
            new UploadModule({
                nameField,
                thumbField: this.thumbField,
                container: imgContainer,
                text: '选择图片',
                accept: {
                    title: '图片'
                    , extensions: 'jpg,png,gif'
                    , mimeTypes: 'image/*'
                },
                uploadUrl: CONF.ajaxUrl.fileUpload,
                showNameOnComplete: false,
                onComplete: (response, file) => {
                    let data = response.data,
                        md5Data = {};
                    for (let fieldKey in data) {
                        md5Data[data[fieldKey].key] = data[fieldKey].value;
                    }

                    // let src = imgUrlCreate(file.name),
                    //     index = this.currentKeyField;
                    //
                    // img.src = src;
                    // this.newKeyFieldImgs[index] = this.newKeyFieldImgs[index] || [];
                    // this.newKeyFieldImgs[index][imgIndex] = src;
                    // let src = ;
                    // debugger;
                    img.src = this.imgUrlCreate(md5Data[nameField]);

                    tools.isFunction(this.onUploaded) && this.onUploaded(md5Data);

                    // saveBtn.isDisabled = false;
                }
            });
        }

        if(this.deletable){
            new Button({
                content: '删除图片',
                container: btnWrapper,
                onClick: () => {
                    // this.md5s[nameField] = '';
                    img.src = '';
                    tools.isFunction(this.onUploaded) && this.onUploaded({[nameField]: ''});

                }
            });
        }

        // let saveBtn = new Button({
        //     content: '保存图片',
        //     container: btnWrapper,
        //     isDisabled: true,
        //     onClick: () => {
        //         // debugger;
        //         tools.isFunction(this.onSave) && this.onSave();
        //         saveBtn.isDisabled = true;
        //     }
        // });

        // let imgUrlCreate = (fileName: string) => {
        //     return tools.url.addObj(CONF.ajaxUrl.fileDownload, {
        //         name_field: nameField,
        //         md5_field: 'FILE_ID',
        //         file_id: this.md5s[nameField],
        //         [nameField]: fileName,
        //         down: 'allow'
        //
        //     });
        // };

        return wrapper;
    }

    imgUrlCreate(md5:string){
        return tools.url.addObj(CONF.ajaxUrl.fileDownload, {
            // name_field: nameField,
            md5_field: 'FILE_ID',
            file_id: md5,
            // [nameField]: fileName,
            down: 'allow'

        });
    }

    private _isShow: boolean;
    set isShow(flag: boolean) {
        this._isShow = !!flag;
        this.modal && (this.modal.isShow = this._isShow);
    }
    get isShow(){
        return this._isShow;
    }

    // private keyFieldImgs:objOf<string[]> = {};
    // private newKeyFieldImgs: objOf<string[]> = {};
    //
    // indexSet(keyField:string, pics:string[]) {
    //     if(!this.keyFieldImgs[keyField]){
    //         this.keyFieldImgs[keyField] = pics;
    //     }
    //
    //     let newImgs = this.newKeyFieldImgs[keyField] || [];
    //     this.imgs.forEach((img, i) => img.src = newImgs[i] || pics[i]);
    //     this.currentKeyField = keyField;
    // }
    //
    // private currentKeyField = '';

    showImg(urls:string[], md5s?:string[]){
        // debugger;
        this.imgs.forEach((img, i) => {
            img.src = md5s[i] ? this.imgUrlCreate(md5s[i]) : urls[i];
            // img.src = md5s[i] ? this.imgUrlCreate(md5s[i]) : tools.url.addObj(urls[i], {'_': Date.now()});
        })
    }
}