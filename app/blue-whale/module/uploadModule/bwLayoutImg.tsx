/// <amd-module name="BwLayoutImg"/>

import {ImageManager} from "../../../global/components/view/imageManager/imageManager";
import {IModal, Modal} from "../../../global/components/feedback/modal/Modal";
import {BwUploader, IBwUploaderPara} from "./bwUploader";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {Button} from "../../../global/components/general/button/Button";
import tools = G.tools;

export interface IBwLayoutImgPara extends IBwUploaderPara{
    onFinish?: (files: File[]) => Promise<any>;
    isShow?: boolean;  // 是否显示上传控件，默认true
    autoClear?: boolean; // 是否在模态框关闭清除file，默认true
}

export class BwLayoutImg{
    protected imgManager: ImageManager;
    protected modal: Modal;
    protected bwUpload: BwUploader;
    protected files: File[] = [];
    protected onFinish: (files: File[]) => Promise<any>;
    protected autoClear: boolean;

    constructor(para: IBwLayoutImgPara){
        this.onFinish = para.onFinish || function(){
            return Promise.resolve();
        };
        this.autoClear = tools.isEmpty(para.autoClear) ? true : para.autoClear;

        this.initModal();
        this.initImgManager();

        let isShow = tools.isEmpty(para.isShow) ? true : para.isShow;
        para.multi = false;
        para.autoUpload = false;
        para.accept = {
            title: '图片',
            extensions: 'jpg,png,gif,jpeg',
            mimeTypes: 'image/*'
        };
        this.bwUpload = new BwUploader(para);
        this.bwUpload.on(BwUploader.EVT_FILE_JOIN_QUEUE, (files: File[]) => {
            let file = files[0];
            BwLayoutImg.fileToImg(file).then((url) => {
                this.modal.isShow = true;
                this.files.push(files[0]);
                this.imgManager.addImg(url);
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

    getUrls(): string[]{
        return this.imgManager ? this.imgManager.get() : [];
    }

    getFiles(): File[]{
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
            isShow: false,
            closeMsg: '是否放弃选中的图片？',
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
        });
        this.imgManager.on(ImageManager.EVT_ADD_IMG, () => {
            this.bwUpload && this.bwUpload.click();
        });
        this.imgManager.on(ImageManager.EVT_IMG_DELETE, (index) => {
            this.files.splice(index, 1);
        });
    }

    static fileToImg(file: File): Promise<string>{
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = () => {
                reject();
            };
            file ? reader.readAsDataURL(file) : reject();
        })
    }

    upload(){
        this.bwUpload.upload();
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