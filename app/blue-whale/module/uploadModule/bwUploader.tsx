/// <amd-module name="BwUploader"/>

import d = G.d;
import tools = G.tools;
import Ajax = G.Ajax;
import sys = BW.sys;
import {FileType} from "../../../global/components/form/newUploader/newUploader"
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {User} from "../../../global/entity/User";
import {FormCom, IFormComPara} from "../../../global/components/form/basic";


export interface IBwUploaderPara extends IFormComPara {
    // uploadUrl?: string;
    text?: string;
    nameField: string;
    thumbField?: string;
    maxSize?: number;
    formData?: () => obj;
    // accept?: FileType;
    onSuccess?: (response: Array<{ data: any, file: File }>) => void;
    onFailure?: () => void;
}

interface IFileBlock {
    end: number;
    start: number;
    index: number;
    uniqueFileName: string;
}

interface IFileData{
    isExist: boolean;
    md5: string;
    uniqueFileName: string;
    data?: any;
}

export class BwUploader extends FormCom {
    protected uploadUrl: string = BW.CONF.ajaxUrl.fileUpload; // 上传地址
    protected maxSize: number;  // 上传文件大小，-1为不限制
    protected chunkSize = 5000 * 1024;  // 分块大小 5M
    protected nameField: string;
    protected thumbField: string;
    protected formData: () => obj;  // 上传附带数据
    protected onSuccess: (response: Array<{data: any, file: File}>) => void;
    protected onFailure: () => void;
    protected fileName: string; // 当前上传成功文件的名称

    protected wrapperInit() {
        return <div className="bw-upload-wrapper"/>;
    }

    constructor(para: IBwUploaderPara) {
        super(para);
        // this.uploadUrl = para.uploadUrl;
        this.nameField = para.nameField;
        this.thumbField = para.thumbField;
        this.maxSize = para.maxSize || -1;
        this.formData = para.formData;
        this.onSuccess = para.onSuccess;
        this.onFailure = para.onFailure;

        d.on(this.wrapper, 'click', () => {
            sys.window.getFile((file: File) => {
                if(this.maxSize !== -1 && file.size > this.maxSize){
                    Modal.alert('文件大小超过限制');
                }else{
                    this.uploadFile(file).then(({data, file}) => {
                        this.fileName = file.name;
                        this.onSuccess && this.onSuccess([{data, file}]);
                    }).catch(() => {
                        this.onFailure && this.onFailure();
                        this.fileName = '';
                    })
                }
            })
        });
    }

    get(){

    }

    set(){

    }

    get value(){
        return this.fileName;
    }

    set value(value){
        this.fileName = value;
    }

    // 上传文件
    uploadFile(file: File): Promise<{data: any, file: File}>{
        return new Promise((resolve, reject) => {
            // 秒传验证
            this.beforeSendFile(file).then(({md5, isExist, uniqueFileName, data}) => {
                if(isExist){
                    // 若已存在后台，则直接返回
                    resolve({data: data, file});
                }else{
                    // 分片验证
                    this.chunkUpload(file, uniqueFileName).then(() => {
                        // 合并请求
                        this.afterSendFile(file, uniqueFileName, md5).then((response) => {
                            resolve({data: response, file});
                        }).catch(() => {
                            reject();
                        });
                    }).catch(() => {
                        reject();
                    })
                }
            }).catch(() => {
                reject();
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

    // 分片验证逻辑
    protected chunkUpload(file: File, uniqueFileName: string) {
        let totalSize = file.size,
            totalPieces = Math.ceil(totalSize / this.chunkSize),
            list: Promise<any>[],
            startSize = 0,
            endSize = 0,
            chunkIndex = 0,
            blob: Blob;

        while (totalPieces --) {
            endSize = startSize + this.chunkSize;
            blob = file.slice(startSize, endSize); // 切片

            list.push(new Promise((resolve, reject) => {
                this.beforeSend({
                    end: endSize,
                    start: startSize,
                    index: chunkIndex,
                    uniqueFileName: uniqueFileName,
                }).then((isExist) => {
                    if(isExist){
                        this.upload(blob, file.name).then(() => {
                            resolve();
                        }).catch(() => {
                            reject();
                        });
                    }else{
                        resolve()
                    }
                });
            }));
            startSize = endSize;
        }
        return Promise.all(list);
    }

    // 秒传验证
    protected beforeSendFile(file: File): Promise<IFileData> {
        return new Promise((resolve, reject) => {
            this.getFileMd5(file).then(md5 => {
                let md5Code = md5,
                    uniqueFileName = tools.md5('' + file.name + file.type + file.lastModifiedDate + file.size);
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
                    resolve({
                        isExist: response.ifExist,
                        md5: md5Code,
                        uniqueFileName,
                        data: response
                    });
                }).catch(() => {
                    resolve({
                        isExist: false,
                        md5: md5Code,
                        uniqueFileName
                    });
                })
            }).catch(() => reject());
        })
    }

    // 分片验证
    protected beforeSend(block: IFileBlock): Promise<boolean> {
        return new Promise((resolve, reject) => {
            Ajax.fetch(this.uploadUrl, {
                type: "POST"
                , traditional: true
                , data: {
                    status: "chunkCheck"
                    , name: block.uniqueFileName
                    , chunkIndex: block.index
                    , size: block.end - block.start
                }
                // , cache: false
                , timeout: 1000 //todo 超时的话，只能认为该分片未上传过
                , dataType: "json"
            }).then(({response}) => {
                resolve(response.ifExist);
            }).catch(() => {
                reject(false);
            })
        })
    }

    protected afterSendFile(file: File, uniqueFileName, md5Code): Promise<any>{
        return new Promise((resolve, reject) => {
            let chunksTotal = Math.ceil(file.size / this.chunkSize);
            if(chunksTotal >= 1){
                let userInfo = User.get().userid,
                    ajaxData: obj = {
                        status: "chunksMerge"
                        , name: uniqueFileName
                        , chunks: chunksTotal
                        , md5: md5Code.toUpperCase()
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
                    resolve(response);
                }).catch(() => {
                    reject();
                })
            }else{
                reject();
            }
        })
    }

    protected upload(file: Blob, filename: string): Promise<any> {
        let url = this.uploadUrl;
        return new Promise<any>((resolve, reject) => {
            if (tools.isNotEmpty(file) && tools.isNotEmpty(url)) {
                let formData = new FormData();
                let data = this.formData ? this.formData() : null;
                if (data) {
                    for (let key in data) {
                        formData.append(key, data[key]);
                    }
                }
                formData.append('file', file, filename);
                let result = {success: false, uploading: false, progress: 0};
                let xhr = new XMLHttpRequest();
                xhr.open("post", url, true);
                xhr.addEventListener('error', () => {
                    reject();
                });
                xhr.addEventListener('progress', (evt) => {
                    if (evt.lengthComputable) {
                        let percentComplete = Math.round(evt.loaded * 100 / evt.total);
                        result.uploading = true;
                        result.progress = percentComplete;
                    }
                    else {
                        result.uploading = false;
                        result.progress = 0;
                    }
                });
                // xhr.addEventListener("abort", () => reject());
                xhr.addEventListener("load", (ev) => {
                    result.uploading = false;
                    result.success = true;
                    result.progress = 100;
                });
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        resolve(xhr.responseText);
                    }
                };
                xhr.send(formData);
            } else {
                reject()
            }
        })
    }
}