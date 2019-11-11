/// <amd-module name="BwUploader"/>

import d = G.d;
import tools = G.tools;
import Ajax = G.Ajax;
import sys = BW.sys;
import { Modal } from "../../../global/components/feedback/modal/Modal";
import { User } from "../../../global/entity/User";
import { FormCom, IFormComPara } from "../../../global/components/form/basic";
import { FileUpload, IFileBlock } from "../../../global/components/form/upload/fileUpload";
import { ILoadingPara, Loading } from "../../../global/components/ui/loading/loading";
import { G_FILE_MD5, G_MD5 } from "../../../global/utils/md5";
import { ActionSheet, IActionSheetButton } from "../../../global/components/ui/actionSheet/actionSheet";
import Shell = G.Shell;
import { BwRule } from "../../common/rule/BwRule";

type uploadType = 'file' | 'sign';
export interface IBwUploaderPara extends IFormComPara {
    // uploadUrl?: string;
    uploadType?: uploadType; // 默认file，file普通上传，sign获取签名图片上传，edit编辑完图片上传
    isChangeText?: boolean; // 默认false
    text?: string;
    nameField?: string;
    thumbField?: string;
    maxSize?: number;
    autoUpload?: boolean; // 自动上传，默认true
    accept?: FileType;
    multi?: boolean;
    onSuccess?: (...any) => void;
    uploadUrl?: string;
    loading?: ILoadingPara;
    buttons?: IActionSheetButton[];
    picMeta?: R_PicMete;
}
interface FileType {
    title: string;
    extensions?: string, // 允许的文件后缀，不带点，多个用逗号分割。
    mimeTypes?: string
}

export class BwUploader extends FormCom {
    get isValue(){
        return false;
    }

    static EVT_FILE_JOIN_QUEUE = '__event_file_join_the_queue__'; // 文件加入上传队列是调用
    static EVT_UPLOAD_ERROR = '__event_file_upload_error__';    // 文件上传失败时调用
    static EVT_UPLOAD_SUCCESS = '__event_file_upload_success__';    // 文件上传成功时调用

    protected uploadUrl: string = BW.CONF.ajaxUrl.fileUpload; // 上传地址
    protected maxSize: number;  // 上传文件大小，-1为不限制
    protected chunkSize = 2 * 1024 * 1024;  // 分块大小 5M
    protected nameField: string;
    protected thumbField: string;
    // protected formData: () => obj;  // 上传附带数据
    protected onSuccess: (...any) => void;
    protected filename: string; // 当前上传成功文件的名称
    protected files: CustomFile[] = [];   // 上传成功文件
    protected temFiles: CustomFile[] = []; // 暂存文件，等待上传
    protected fileUpload: FileUpload;
    protected input: HTMLInputElement;
    protected accept: FileType;
    protected multi: boolean;
    protected isChangeText: boolean;
    protected text: string;
    protected loading: Loading;
    protected uploadType: uploadType;
    protected actionSheet: ActionSheet;
    protected autoUpload: boolean;
    protected picMeta: R_PicMete;

    protected wrapperInit(para) {
        this.text = typeof para.text === 'string' ? para.text : '点击上传';
        this.input = <input className="file-input" type="text" value={this.text} />;
        this.input.readOnly = true;
        return <div className="bw-upload-wrapper">
            {this.input}
        </div>;
    }

    constructor(para: IBwUploaderPara) {
        super(para);
        if (tools.isNotEmpty(para.loading)) {
            this.loading = new Loading(para.loading);
            this.loading.hide();
        }
        this.uploadType = para.uploadType || 'file';
        this.uploadUrl = para.uploadUrl || BW.CONF.ajaxUrl.fileUpload;
        this.nameField = para.nameField || 'FILE_ID';
        this.thumbField = para.thumbField;
        this.maxSize = para.maxSize || -1;
        this.onSuccess = para.onSuccess;
        this.accept = para.accept;
        this.multi = para.multi || false;
        this.isChangeText = para.isChangeText || false;
        this.autoUpload = tools.isEmpty(para.autoUpload) ? true : para.autoUpload;
        this.picMeta = para.picMeta || {};

        // ios暂未支持新接口
        if (/*sys.os === 'ip' || */sys.os === 'ad') {
            this.initActionSheet(para.buttons || []);
        }

        this.fileUpload = new FileUpload({
            chunk: {
                chunkSize: this.chunkSize,
                beforeSendBlock: this.beforeSend.bind(this),
                afterSendFile: this.afterSendFile.bind(this)
            },
            uploadUrl: this.uploadUrl,
            beforeSendFile: this.beforeSendFile.bind(this)
        });

        d.on(this.wrapper, 'click', tools.pattern.throttling(() => {
            this.getFile((files: CustomFile[]) => {
                this.addFile(files);
            }, BwUploader.hintMsg);
        }, 1000));
    }

    protected addFile(files: CustomFile[]) {
        this.temFiles = [];
        if (tools.isNotEmpty(files)) {
            files.forEach((file) => {
                if (this.maxSize !== -1 && file.size > this.maxSize) {
                    Modal.alert('文件' + file.name + '大小超过限制');
                } else if (!this.acceptVerify(file)) {
                    Modal.alert('文件' + file.name + '类型有误');
                } else {
                    this.temFiles.push(file);
                }
            });
            this.trigger(BwUploader.EVT_FILE_JOIN_QUEUE, this.temFiles);
            this.autoUpload && this.upload();
        }
    }

    static hintMsg(msg: string) {
        tools.isNotEmpty(msg) && Modal.alert(msg, '温馨提示');
    }

    protected initActionSheet(buttons: IActionSheetButton[] = []) {
        let picMeta = this.picMeta,
            compressScale = picMeta.compressScale || '1,1,1',
            maxSize = picMeta.maxSize || "512,512,512",
            osType = picMeta.osType || "111",
            index = tools.os.android ? 0 : tools.os.ios ? 1 : 2;

        let compress = {
            compress: Number(compressScale.split(',')[index]),
            max_size: Number(maxSize.split(',')[index]),
            os_type: osType,
        };
        this.actionSheet = new ActionSheet({
            buttons: [
                {
                    content: '拍照',
                    onClick: () => {
                        Shell.image.photograph(((files) => {
                            this.addFile(files);
                        }), BwUploader.hintMsg, compress);
                    }
                },

                {
                    content: '相册',
                    onClick: () => {
                        Shell.image.photoAlbum(((files) => {
                            this.addFile(files);
                        }), BwUploader.hintMsg, compress);
                    }
                },

                {
                    content: '文件',
                    onClick: () => {
                        Shell.image.upLoadFile((e: any) => {
                            if (e) {
                                Shell.image.fileGet(((files) => {
                                    this.addFile(files);
                                }));
                            }
                        })

                    }
                }
            ].concat(buttons),
            zIndex: 1002,
        })
    }

    click() {
        this.wrapper && this.wrapper.click();
    }

    protected getFile(callback: (file: CustomFile[]) => void, error?: Function) {
        switch (this.uploadType) {
            case "file":
                if (this.actionSheet) {
                    this.actionSheet.isShow = true;
                } else {
                    sys.window.getFile(callback, this.multi, this.accept && this.accept.mimeTypes, error);
                }
                break;
            case 'sign':
                if (sys.window.getSign) {
                    sys.window.getSign(callback, error);
                } else {
                    sys.window.getFile(callback, this.multi, this.accept && this.accept.mimeTypes, error);
                }
                break;
        }
    }

    protected acceptVerify(file: CustomFile) {
        if (this.accept && this.accept.extensions && file.name) {
            let arr = file.name.split('.'),
                ext = arr.reverse()[0].toLocaleLowerCase(),
                exts = this.accept.extensions.split(',');
            return exts.indexOf(ext) > -1;
        } else {
            return true;
        }
    }

    get() {
        return this.value;
    }

    set(value: string) {
        this.value = value;
    }

    set disabled(e: boolean) {
        if (this._disabled !== e) {
            if (tools.isNotEmpty(e)) {
                this._disabled = e;
                if (this._disabled) {
                    this.wrapper && this.wrapper.classList.add('disabled');
                } else {
                    this.wrapper && this.wrapper.classList.remove('disabled');
                }
            }
        }
        this.input && (this.input.disabled = e);
    }

    get value() {
        return this.filename;
    }

    set value(value: string) {
        this.filename = value;
        this.setInputValue(value)
    }

    protected setInputValue(value: string) {
        this.isChangeText && this.input && (this.input.value = value || this.text);
    }

    destroy() {
        this.fileUpload && this.fileUpload.abort();
        this.temFiles = null;
        this.files = null;
        this.fileUpload = null;
        this.input = null;
        super.destroy();
    }

    // 调用方法上传暂存文件
    upload(files: CustomFile[] = this.temFiles) {
        this.loading && this.loading.show();
        this._isFinish = false;
        this.wrapper.classList.remove('error');
        this.setInputValue('上传中...');

        this.files = [];

        let promises: Promise<any>[] = [];
        files = this.multi ? files : tools.toArray(files[0]);
        files && files.forEach((file) => {
            promises.push(this.fileUpload.upload(file).catch((msg) => {
                msg = msg && typeof msg === 'string' ? msg : '上传失败';
                Modal.alert(`<div>${msg}</div>`);
                this.wrapper && this.wrapper.classList.add('error');
                this.setInputValue('上传失败');
                this.trigger(BwUploader.EVT_UPLOAD_ERROR, file);
            }))
        });
        Promise.all(promises).then((dataArr) => {
            dataArr.forEach((data, index) => {
                let file = files[index];
                this.files.push(file);
                this.temFiles = [];
                this.onSuccess && this.onSuccess(data, file);
                this.trigger(BwUploader.EVT_UPLOAD_SUCCESS, {
                    data,
                    file
                });
                this.value = file.name;
            })
        }).finally(() => {
            this.loading && this.loading.hide();
            this._isFinish = true;
        })
    }


    // 获取文件md5值
    getFileMd5(file: CustomFile): Promise<string> {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = (event) => {
                let binary = (event.target as any).result;
                resolve(G_FILE_MD5(binary));
            };
            reader.onerror = (e) => {
                reject(e);
            };
            reader.readAsBinaryString(file.blob);
        });
    }

    // 秒传验证
    protected beforeSendFile(file: CustomFile): Promise<obj> {
        return new Promise((resolve, reject) => {
            this.getFileMd5(file).then(md5 => {
                let userid = User.get().userid,
                    md5Code = md5.toUpperCase(),
                    uniqueFileName = G_MD5('' + file.name + (file.type || '') + file.lastModifiedDate + file.size);
                this.fileUpload.formData = () => {
                    return {
                        userId: userid,
                        md5: md5Code,
                    }
                };
                let ajaxData: obj = {
                    status: "md5Check"
                    , md5: md5Code
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

                }).then(function ({ response }) {
                    if (response.code == 200) {
                        if (response.ifExist) {
                            reject(response);
                        } else {
                            resolve({
                                md5: md5Code,
                                uniqueFileName,
                            });
                        }
                    } else {
                        reject();
                        response.message && Modal.alert(response.message);
                    }
                }).catch((err: IAjaxError) => {
                    if (err.statusText === 'error') {
                        reject();
                        err.errorThrown && Modal.alert(err.errorThrown);
                    } else {
                        resolve({
                            md5: md5Code,
                            uniqueFileName
                        });
                    }
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
                , isLowCase: false
            }).then(({ response }) => {
                resolve(response);
            }).catch(() => {
                reject(false);
            })
        })
    }

    // 合并请求
    protected afterSendFile(file: CustomFile, data): Promise<any> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let chunksTotal = Math.ceil(file.size / this.chunkSize);
                if (chunksTotal >= 1) {
                    let userInfo = User.get().userid,
                        ajaxData: obj = {
                            status: "chunksMerge"
                            , name: data.uniqueFileName
                            , chunks: chunksTotal
                            , md5: data.md5
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
                    }).then(({ response }) => {
                        if (response.code == '200') {
                            resolve(response);
                        } else {
                            reject(response.msg || response.errorMsg);
                        }
                    }).catch(() => {
                        reject();
                    })
                } else {
                    reject();
                }
            }, 100);
        })
    }

}
