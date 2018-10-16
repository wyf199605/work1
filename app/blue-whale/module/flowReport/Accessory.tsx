/// <amd-module name="Accessory"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import UploadModule from "../uploadModule/uploadModule";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import d = G.d;
import tools = G.tools;
import {FormCom} from "../../../global/components/form/basic";
interface FilePara {
    fileId: string;
    fileName: string;
}

export class Accessory extends FormCom {
    set(val:FilePara[]): void {
        let values = val || [];
        this.fileArr = values;
        values.forEach((file)=>{
            d.before(this.addImg, this.createImg(this.getFileUrl(file.fileId)));
        });
        this.wrapper.scrollLeft = this.wrapper.scrollLeft + (100 * values.length);
    }

    get value(){
        return this.get();
    };
    set value(val:FilePara[]) {
        this.set(val);
    }
    private innerWrapper: HTMLElement;
    private addImg: HTMLElement;

    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return <div className="accessory-outer-wrapper">{this.innerWrapper =
            <div className="accessory-inner-wrapper">{this.addImg = <div className="add-wrapper">
                <div className="add-wrapper-inner">
                    <div className="add-icon">+</div>
                    <div className="add-text">添加附件</div>
                </div>
            </div>}</div>}</div>;
    }

    private _fileIdArr: FilePara[];

    set fileArr(fileIdArr: FilePara[]) {
        this._fileIdArr = fileIdArr;
    }

    get fileArr() {
        return this._fileIdArr;
    }

    constructor(para: IComponentPara) {
        super(para);

        let uploader = new UploadModule({
            uploadUrl: BW.CONF.ajaxUrl.fileUpload,
            nameField: 'FILE_ID',
            // 上传成功
            onComplete: (res, file) => {
                let fileId = res.data.blobField.value,
                    fileObj:FilePara = {
                        fileId: fileId,
                        fileName: file.name
                    },
                    arr = this.fileArr || [];
                this.fileArr = arr.concat(fileObj);
                d.before(this.addImg, this.createImg(this.getFileUrl(fileId)));
                this.wrapper.scrollLeft = this.wrapper.scrollLeft + 100;
            },
            container: this.addImg,
            text: '',
            onError:()=>{
                Modal.alert('上传图片失败');
            }
        });
        // 文件加入上传队列
        uploader.com.on('beforeFileQueued', (file) => {
            if (file.type.split('/')[0] === 'image') {
                let imgsArr = this.fileArr || [],
                    isExist = false;
                for (let i = 0, len = imgsArr.length; i < len; i++) {
                    let pic = imgsArr[i];
                    if (pic.fileName === file.name) {
                        Modal.alert('已经添加过该图片');
                        isExist = true;
                    }
                }
                if (!!!isExist){
                    uploader.com.upload();
                }else{
                    return false;
                }
            } else {
                Modal.alert('只支持图片格式!');
                return false;
            }
        });
    }

    private createImg(url: string) {
        let imgWrapper = <div className="upload-img">
            <img src={url} alt="附件图片"/>
        </div>;
        return imgWrapper;
    }

    private getFileUrl(fileId) {
        return tools.url.addObj(BW.CONF.ajaxUrl.fileDownload, {
            md5_field: 'FILE_ID',
            file_id: fileId,
            down: 'allow'
        })
    }

    get(){
        return this.fileArr || [];
    }
}