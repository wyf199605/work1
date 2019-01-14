/// <amd-module name="BwLayoutImg"/>

import {ImageManager} from "../../../global/components/view/imageManager/imageManager";
import {IModal, Modal} from "../../../global/components/feedback/modal/Modal";
import {BwUploader, IBwUploaderPara} from "./bwUploader";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {Button} from "../../../global/components/general/button/Button";
import tools = G.tools;

export interface IBwLayoutImgPara extends IBwUploaderPara{
    onFinish?: (files: CustomFile[]) => Promise<any>;
    isShow?: boolean;  // 是否显示上传控件，默认true
    autoClear?: boolean; // 是否在模态框关闭清除file，默认true
    isCloseMsg?: boolean;
    onDelete?: (index: number) => void;
    isDelete?: boolean;
}
export class BwLayoutImg{
    protected imgManager: ImageManager;
    protected modal: Modal;
    protected bwUpload: BwUploader;
    protected onDelete?: (index: number) => void;
    protected files: CustomFile[] = [];
    protected onFinish: (files: CustomFile[]) => Promise<any>;
    protected autoClear: boolean;
    protected isCloseMsg: boolean;
    protected multi: boolean;
    protected isDel: boolean;

    constructor(para: IBwLayoutImgPara){
        this.onFinish = para.onFinish || function(){
            return Promise.resolve();
        };
        this.isDel = tools.isEmpty(para.isDelete) ? true : para.isDelete;
        this.onDelete = para.onDelete;
        this.autoClear = tools.isEmpty(para.autoClear) ? true : para.autoClear;
        this.multi = tools.isEmpty(para.multi) ? true : para.multi;
        this.isCloseMsg = para.isCloseMsg || false;

        this.initModal();
        this.initImgManager();

        let isShow = tools.isEmpty(para.isShow) ? true : para.isShow;
        para.accept = {
            title: '图片',
            extensions: 'jpg,png,gif,jpeg',
            mimeTypes: 'image/*'
        };
        this.bwUpload = new BwUploader(para);
        this.bwUpload.on(BwUploader.EVT_FILE_JOIN_QUEUE, (files: CustomFile[]) => {
            let file = files[0];
            BwLayoutImg.fileToImg(file).then((url) => {
                this.modal.isShow = true;
                if(!this.multi){
                    this.files = [];
                    this.imgManager.delImg();
                }
                this.files.push(files[0]);
                this.imgManager.addImg(url);
                this.isCloseMsg && this.modal && (this.modal.closeMsg = '是否放弃选中的图片？');
            }).catch((e) => {
                console.log(e);
                Modal.alert('获取图片失败');
            })
        });
        !isShow && this.bwUpload.wrapper.classList.add('hide');
    }

    click(){
        this.bwUpload && this.bwUpload.click();
    }

    set(urls: string[]){
        urls.forEach((url) => {
            this.files.push({
                blob: null
            });
            this.imgManager.addImg(url);
        })

    }

    getUrls(): string[]{
        return this.imgManager ? this.imgManager.get() : [];
    }

    getFiles(): CustomFile[]{
        return this.files;
    }

    getBase64(): Promise<string[]>{
        return this.imgManager ? this.imgManager.getBase64() : Promise.resolve([]);
    }

    set modalShow(flag: boolean){
        this.modal && (this.modal.isShow = flag);
    }

    clear(){
        this.files = [];
        this.imgManager.set([]);
    }

    protected initModal(){
        let inputBox = new InputBox({});
        inputBox.addItem(<Button content="完成" onClick={() => {
            this.onFinish(this.files).then(() => {
                this.modalShow = false;
            });
        }}/>);
        let para: IModal = {
            body: <div className="bw-image-layout-wrapper"/>,
            header: {
                title: '图片管理',
                rightPanel: tools.isPc ? null : inputBox,
                isFullScreen: tools.isPc
            },
            zIndex:2000,
            isShow: false,
            onClose: () => {
                this.autoClear && this.clear();
            },
            footer: tools.isPc ? {
                rightPanel: inputBox
            } : void 0
        };
        if(tools.isPc){
            para.width = '700px';
            para.height = '550px';
        }
        this.modal = new Modal(para);
    }


    protected initImgManager(){
        this.imgManager = new ImageManager({
            container: this.modal.bodyWrapper,
            isAdd: true,
            isDelete: this.isDel
        });
        this.imgManager.on(ImageManager.EVT_ADD_IMG, () => {
            this.bwUpload && this.bwUpload.click();
        });
        this.imgManager.on(ImageManager.EVT_IMG_DELETE, (index) => {
            this.files.splice(index, 1);
            this.onDelete && this.onDelete(index);
            if(this.files.length === 0){
                this.modal && (this.modal.closeMsg = '');
            }
        });
    }

    static fileToImg(file: CustomFile): Promise<string>{
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = () => {
                reject();
            };
            file ? reader.readAsDataURL(file.blob) : reject();
        })
    }

    upload(){
        this.bwUpload.upload(this.files);
    }

    destroy(){
        this.bwUpload && this.bwUpload.destroy();
        this.modal && this.modal.destroy();
        this.imgManager && this.imgManager.destroy();
        this.bwUpload = null;
        this.modal = null;
        this.imgManager = null;
        this.files = null;
    }
}