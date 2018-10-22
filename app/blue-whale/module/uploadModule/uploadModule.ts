/// <amd-module name="UploadModule"/>
import {Uploader, IUploaderPara} from "../../../global/components/form/upload/uploader";
import {FormCom, IFormComPara} from "../../../global/components/form/basic";
import {Modal} from "global/components/feedback/modal/Modal";
interface IUploadModulePara extends IUploaderPara{
    onComplete?(this:UploadModule, ...any);
    onError?(file:obj);
    onChange?: Function;
    showNameOnComplete?:boolean;// 默认true
}

// TODO 使用完该控件需销毁，否则后续上传会多次
export default class UploadModule extends FormCom{
    onSet: (val) => void;

    private uploadState: number = 0;
    public com:Uploader;

    constructor(private para: IUploadModulePara) {
        super(para);

        let fileName = '',
            self = this;

        this.com = new Uploader({
            container: para.container,
            uploadUrl: para.uploadUrl,
            accept: para.accept,
            nameField: para.nameField,
            thumbField: para.thumbField,
            onComplete: (data, file) => {
                if(data.code == 200 || data.errorCode === 0) {
                    this.com.text = this.para.showNameOnComplete !== false ? fileName : '点击上传';
                    self.uploadState = 10; // 上传完成
                    this.para.onComplete && this.para.onComplete.call(this, data, file);
                } else {
                    this.para.onError && this.para.onError.call(this,file);
                    Modal.alert(data.msg || data.errorMsg);
                }
            }
        });

        // 有文件被选中时
        this.com.on('fileQueued', (file: File) => {
            this.para.onChange && this.para.onChange();
            //有文件在上传
            // if (self.uploadState === 1) {
            //     return;
            // }
            //开始上传
            this.com.text = '上传中...';
            fileName = file.name;
            // bodyMui.progressbar({progress: 0}).show();
            self.uploadState = 1; //上传中
            this.com.upload();
        });

        this.com.on("error", function (type){
            const msg = {
                'Q_TYPE_DENIED': '文件类型有误',
                'F_EXCEED_SIZE': '文件大小不能超过4M',
            };
            Modal.alert(msg[type] ? msg[type] : '文件出错, 类型:' + type)
        });

        // let bodyProgressBar = bodyMui.progressbar();
        this.com.on('uploadProgress', function (file, percentage) {
            // bodyProgressBar.setProgress(percentage * 100);
        });
    }

    get(): any {
        return this.value
    }
    set(filename:string): void {
        this.com.text = filename;
        this.com.set(filename);
    }

    destroy(){
        this.com && this.com.destroy();
        super.destroy();
    }

    get value() {
        return this.com.get();
    }
    set value(filename:string){
        this.com.text = filename;
        this.com.set(filename);
    }

    protected wrapperInit(para: IFormComPara): HTMLElement {
        return undefined;
    }

}