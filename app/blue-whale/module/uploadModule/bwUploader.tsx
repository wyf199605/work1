/// <amd-module name="BwUploader"/>

import d = G.d;
import tools = G.tools;
import Ajax = G.Ajax;
import sys = BW.sys;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {User} from "../../../global/entity/User";
import {FormCom, IFormComPara} from "../../../global/components/form/basic";
import {FileUpload, IFileBlock} from "../../../global/components/form/upload/fileUpload";


export interface IBwUploaderPara extends IFormComPara {
    // uploadUrl?: string;
    isChangeText?: boolean; // 默认false
    text?: string;
    nameField: string;
    thumbField?: string;
    maxSize?: number;
    autoUpload?: boolean; // 自动上传，默认true
    accept?: FileType;
    multi?: boolean;
    onSuccess?: (...any) => void;
    onFailure?: (...any) => void;
    uploadUrl?: string;
}
interface FileType {
    title: string;
    extensions?: string, // 允许的文件后缀，不带点，多个用逗号分割。
    mimeTypes?: string
}

export class BwUploader extends FormCom {
    protected uploadUrl: string = BW.CONF.ajaxUrl.fileUpload; // 上传地址
    protected maxSize: number;  // 上传文件大小，-1为不限制
    protected chunkSize = 5000 * 1024;  // 分块大小 5M
    protected nameField: string;
    protected thumbField: string;
    // protected formData: () => obj;  // 上传附带数据
    protected onSuccess: (...any) => void;
    protected onFailure: (...any) => void;
    protected filename: string; // 当前上传成功文件的名称
    protected files: File[] = [];   // 上传成功文件
    protected temFiles: File[] = []; // 暂存文件，等待上传
    protected fileUpload: FileUpload;
    protected input: HTMLInputElement;
    protected accept: FileType;
    protected multi: boolean;
    protected isChangeText: boolean;
    protected text: string;

    protected wrapperInit(para) {
        this.text = para.text;
        this.input = <input className="file-input" type="text" value={para.text || ''}/>;
        this.input.readOnly = true;
        return <div className="bw-upload-wrapper">
            {this.input}
        </div>;
    }

    constructor(para: IBwUploaderPara) {
        super(para);
        this.uploadUrl = para.uploadUrl;
        this.nameField = para.nameField;
        this.thumbField = para.thumbField;
        this.maxSize = para.maxSize || -1;
        this.onSuccess = para.onSuccess;
        this.onFailure = para.onFailure;
        this.accept = para.accept;
        this.multi = para.multi || false;
        this.isChangeText = para.isChangeText || false;

        let autoUpload = tools.isEmpty(para.autoUpload) ? true : para.autoUpload;
        this.fileUpload = new FileUpload({
            chunk: {
                chunkSize: this.chunkSize,
                beforeSendBlock: this.beforeSend.bind(this),
                afterSendFile: this.afterSendFile.bind(this)
            },
            uploadUrl: this.uploadUrl,
            beforeSendFile: this.beforeSendFile.bind(this)
        });

        d.on(this.wrapper, 'click', () => {
            sys.window.getFile((files: File[]) => {
                if(!this.multi){
                    this.temFiles = [];
                }
                if(tools.isNotEmpty(files)){
                    files.forEach((file) => {
                        if(this.maxSize !== -1 && file.size > this.maxSize){
                            Modal.alert('文件' + file.name + '大小超过限制');
                        }else if(!this.acceptVerify(file)){
                            Modal.alert('文件' + file.name + '类型有误');
                        }else {
                            this.temFiles.push(file);
                        }
                    });
                    autoUpload && this.upload();
                }
            }, this.multi, this.accept && this.accept.mimeTypes, () => {
                Modal.alert('获取图片失败', '温馨提示');
            })
        });
    }

    protected acceptVerify(file: File){
        if(this.accept && this.accept.extensions && file.name){
            let arr = file.name.split('.'),
                ext = arr.reverse()[0],
                exts = this.accept.extensions.split(',');
            return exts.indexOf(ext) > -1;
        }else{
            return true;
        }
    }

    get(){
        return this.value;
    }

    set(value: string){
        this.value = value;
    }

    get value(){
        return this.filename;
    }

    set value(value: string){
        this.filename = value;
        this.setInputValue(value)
    }

    protected setInputValue(value: string){
        this.isChangeText && (this.input.value = value || this.text);
    }

    destroy(){
        this.fileUpload &&this.fileUpload.abort();
        this.temFiles = null;
        this.files = null;
        this.fileUpload = null;
        this.input = null;
        super.destroy();
    }

    // 调用方法上传暂存文件
    upload(){
        this.wrapper.classList.remove('error');
        this.setInputValue('上传中...');
        if(!this.multi){
            this.files = [];
        }
        let files = this.multi ? this.temFiles : this.temFiles[0];
        files && tools.toArray(files).forEach((file) => {
            this.fileUpload.upload(file).then((data) => {
                console.log(data);
                this.files.push(file);
                this.temFiles = [];
                this.onSuccess && this.onSuccess(data, file);
                this.value = file.name;
            }).catch(() => {
                this.wrapper.classList.add('error');
                this.setInputValue('上传失败');
                this.onFailure && this.onFailure(file);
            })
        })
    }


    // 获取文件md5值
    getFileMd5(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = (event) => {
                let binary = (event.target as any).result;
                resolve(tools.md5(binary).toString());
            };
            reader.onerror = (e) => {
                reject(e);
            };
            reader.readAsBinaryString(file);
        });
    }

    // 秒传验证
    protected beforeSendFile(file: File): Promise<obj> {
        return new Promise((resolve, reject) => {
            this.getFileMd5(file).then(md5 => {
                let userid = User.get().userid,
                    md5Code = md5,
                    uniqueFileName = tools.md5('' + file.name + file.type + file.lastModifiedDate + file.size);
                this.fileUpload.formData = () => {
                    return {
                        userId: userid,
                        md5: md5Code,
                    }
                };
                let ajaxData: obj = {
                    status: "md5Check"
                    , md5: md5Code.toUpperCase()
                    , nameField: this.nameField
                    , file_name: file.name
                    , name: uniqueFileName
                };

                if (this.thumbField) {
                    ajaxData.smallField = this.thumbField;
                }

                Ajax.fetch(this.uploadUrl, {
                    type: "POST"
                    , traditional: true
                    , data: ajaxData
                    // , cache: false
                    , timeout: 1000 //todo 超时的话，只能认为该文件不曾上传过
                    , dataType: "json"

                }).then(function ({response}) {
                    if(response.ifExist){
                        reject(response);
                    }else{
                        resolve({
                            md5: md5Code,
                            uniqueFileName,
                        });
                    }
                }).catch(() => {
                    resolve({
                        md5: md5Code,
                        uniqueFileName
                    });
                })
            }).catch(() => reject());
        })
    }

    // 分片验证
    protected beforeSend(block: IFileBlock, data): Promise<boolean> {
        return new Promise((resolve, reject) => {
            Ajax.fetch(this.uploadUrl, {
                type: "POST"
                , traditional: true
                , data: {
                    status: "chunkCheck"
                    , name: data.uniqueFileName
                    , chunkIndex: block.index
                    , size: block.end - block.start
                }
                // , cache: false
                , timeout: 1000 //todo 超时的话，只能认为该分片未上传过
                , dataType: "json"
            }).then(({response}) => {
                resolve(response);
            }).catch(() => {
                reject(false);
            })
        })
    }

    // 合并请求
    protected afterSendFile(file: File, data): Promise<any>{
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let chunksTotal = Math.ceil(file.size / this.chunkSize);
                if(chunksTotal >= 1){
                    let userInfo = User.get().userid,
                        ajaxData: obj = {
                            status: "chunksMerge"
                            , name: data.uniqueFileName
                            , chunks: chunksTotal
                            , md5: data.md5.toUpperCase()
                            , file_name: file.name
                            , userid: userInfo
                            , nameField: this.nameField
                        };
                    if (this.thumbField) {
                        ajaxData.smallField = this.thumbField
                    }
                    Ajax.fetch(this.uploadUrl, {
                        type: "POST"
                        , traditional: true
                        , data: ajaxData
                        // , cache: false
                        , dataType: "json"
                    }).then(({response}) => {
                        if(response.code === '200'){
                            resolve(response);
                        }else{
                            reject();
                        }
                    }).catch(() => {
                        reject();
                    })
                }else{
                    reject();
                }
            }, 100);
        })
    }

}